// app/api/music/route.ts
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt } = body;

    if (!prompt) {
      return new NextResponse("Prompt is required", { status: 400 });
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/musicgen-small",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

    // Handle model loading state
    if (response.status === 503) {
      return new NextResponse("Model is loading, please try again in a moment", { status: 503 });
    }

    // Handle other errors
    if (!response.ok) {
      console.log('[API_ERROR]', {
        status: response.status,
        statusText: response.statusText
      });
      return new NextResponse("Music generation failed", { status: 500 });
    }

    const audioBuffer = await response.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioUrl = `data:audio/wav;base64,${base64Audio}`;

    return NextResponse.json({ audio: audioUrl });

  } catch (error) {
    console.log('[MUSIC_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}