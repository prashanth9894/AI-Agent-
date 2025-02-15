// // app/api/image/route.ts
// import { NextResponse } from "next/server";
// import { HfInference } from '@huggingface/inference';

// const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

// export async function POST(req: Request) {
//   try {
//     const body = await req.json();
//     const { prompt, amount = 1, resolution = "512x512" } = body;

//     if (!prompt) {
//       return new NextResponse(JSON.stringify({ error: "Prompt is required" }), { 
//         status: 400,
//         headers: { 'Content-Type': 'application/json' }
//       });
//     }

//     const [width, height] = resolution.split('x').map(Number);

//     const generateImage = async () => {
//       try {
//         const response = await hf.textToImage({
//           model: 'stabilityai/stable-diffusion-xl-base-1.0',
//           inputs: prompt,
//           parameters: {
//             negative_prompt: "blurry, bad quality, worst quality, text, watermark",
//             num_inference_steps: 30,
//             guidance_scale: 7.5,
//             width,
//             height,
//           }
//         });

//         const arrayBuffer = await response.arrayBuffer();
//         const base64 = Buffer.from(arrayBuffer).toString('base64');
//         const url = `data:image/jpeg;base64,${base64}`;

//         return { url };
//       } catch (error: any) {
//         console.error('Individual image generation error:', error);
//         throw new Error(error.message || 'Failed to generate image');
//       }
//     };

//     const images = [];
//     const numImages = parseInt(amount, 10);

//     // Generate images sequentially to prevent overloading
//     for (let i = 0; i < numImages; i++) {
//       try {
//         const image = await generateImage();
//         images.push(image);
//       } catch (error) {
//         console.error(`Failed to generate image ${i + 1}:`, error);
//       }
//     }

//     if (images.length === 0) {
//       return new NextResponse(JSON.stringify({ error: "Failed to generate any images" }), { 
//         status: 500,
//         headers: { 'Content-Type': 'application/json' }
//       });
//     }

//     return new NextResponse(JSON.stringify(images), {
//       status: 200,
//       headers: { 'Content-Type': 'application/json' }
//     });

//   } catch (error: any) {
//     console.error('[IMAGE_ERROR]', error);
//     return new NextResponse(JSON.stringify({ error: error.message || "Internal Server Error" }), { 
//       status: 500,
//       headers: { 'Content-Type': 'application/json' }
//     });
//   }
// }

import { NextResponse } from "next/server";
import { HfInference } from '@huggingface/inference';

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY);

interface ImageRequest {
  prompt: string;
  amount?: number;
  resolution?: string;
  download?: boolean;
}

interface GeneratedImage {
  url: string;
  downloadableBuffer?: Buffer;
  filename?: string;
}

export async function POST(req: Request) {
  try {
    const { prompt, amount = 1, resolution = "512x512", download = false }: ImageRequest = await req.json();

    if (!prompt) {
      return new NextResponse(JSON.stringify({ error: "Prompt is required" }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const [width, height] = resolution.split('x').map(Number);

    const generateImage = async (): Promise<GeneratedImage> => {
      const response = await hf.textToImage({
        model: 'stabilityai/stable-diffusion-xl-base-1.0',
        inputs: prompt,
        parameters: {
          negative_prompt: "blurry, bad quality, worst quality, text, watermark",
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width,
          height,
        }
      });

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const url = `data:image/jpeg;base64,${base64}`;
      
      return {
        url,
        downloadableBuffer: buffer,
        filename: `generated-image-${Date.now()}.jpg`
      };
    };

    const images: GeneratedImage[] = [];
    const numImages = parseInt(String(amount), 10);

    // Generate images sequentially to prevent overloading
    for (let i = 0; i < numImages; i++) {
      try {
        const image = await generateImage();
        images.push(image);
      } catch (error) {
        console.error(`Failed to generate image ${i + 1}:`, error);
        // Continue with the loop to try generating remaining images
      }
    }

    if (images.length === 0) {
      return new NextResponse(JSON.stringify({ error: "Failed to generate any images" }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Handle single image download
    if (download) {
      if (images.length === 1) {
        // For single image, return as downloadable file
        return new NextResponse(images[0].downloadableBuffer, {
          status: 200,
          headers: {
            'Content-Type': 'image/jpeg',
            'Content-Disposition': `attachment; filename="${images[0].filename}"`,
            'Access-Control-Expose-Headers': 'Content-Disposition'
          }
        });
      } else {
        // For multiple images, still include downloadable data
        return new NextResponse(JSON.stringify(images), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // For non-download requests, clean the response
    const cleanedImages = images.map(({ downloadableBuffer, ...rest }) => rest);

    return new NextResponse(JSON.stringify(cleanedImages), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('[IMAGE_ERROR]', error);
    return new NextResponse(JSON.stringify({ 
      error: error.message || "Internal Server Error"
    }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}