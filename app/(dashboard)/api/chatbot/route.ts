// import { auth } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";
// import  OpenAI from "openai";
// import { checkSubscription } from "@/lib/subscription";
// import { incrementApiLimit, checkApiLimit } from "@/lib/api-limit";



// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
//  maxRetries:10
// });

// export async function POST(
//   req: Request
// ) {
//   try {
//     const { userId } = auth();
//     const body = await req.json();
//     const { messages  } = body;

//     if (!userId) {
//       return new NextResponse("Unauthorized", { status: 401 });
//     }

//     if (!messages) {
//       return new NextResponse("Messages are required", { status: 400 });
//     }

//     const freeTrial = await checkApiLimit();
//     const isPro = await checkSubscription();

//     if (!freeTrial && !isPro) {
//       return new NextResponse("Free trial has expired. Please upgrade to pro.", { status: 403 });
//     }


//     const response = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages,
//     },
//     {
//       maxRetries:5
//     }
//     );
     
//     if (!isPro) {
//       await incrementApiLimit();
//     }

//     return NextResponse.json(response.choices[0].message);
   

// } catch (error) {
//     console.log('[CONVERSATION_ERROR]', error);
//     return new NextResponse("Internal Error", { status: 500 });
//   }
// };


// import { NextResponse } from "next/server";
// import { GoogleGenerativeAI } from "@google/generative-ai";

// // Ensure you have set your Gemini API key in environment variables
// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { messages } = body;

//     if (!messages || !Array.isArray(messages)) {
//       return NextResponse.json(
//         { error: "Invalid request format. 'messages' must be an array." },
//         { status: 400 }
//       );
//     }

//     // Prepare the conversation history for Gemini
//     const chatHistory = messages.map(msg => ({
//       role: msg.role === 'user' ? 'user' : 'model',
//       parts: [{ text: msg.content }]
//     }));

//     // Initialize the model
//     const model = genAI.getGenerativeModel({ model: "gemini-pro" });

//     // Start a chat session
//     const chat = model.startChat({
//       history: chatHistory.slice(0, -1), // All messages except the last one
//       generationConfig: {
//         maxOutputTokens: 1000,
//       }
//     });

//     // Send the last message
//     const lastMessage = messages[messages.length - 1].content;
//     const result = await chat.sendMessage(lastMessage);
//     const response = await result.response;
//     const text = response.text();

//     return NextResponse.json({ content: text });
//   } catch (error) {
//     console.error("Error in Gemini AI conversation route:", error);
//     return NextResponse.json(
//       { error: "Internal Server Error. Please try again later." },
//       { status: 500 }
//     );
//   }
// }

import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { messages } = body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid request. 'messages' must be a non-empty array." },
        { status: 400 }
      );
    }

    const chatHistory = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const chat = model.startChat({
      history: chatHistory.slice(0, -1),
      generationConfig: { maxOutputTokens: 1000 },
    });

    const lastMessage = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMessage);
    const responseText = await result.response.text();

    return NextResponse.json({
      role: "assistant",
      content: responseText,
    });
  } catch (error) {
    console.error("Error in /api/chatbot:", error);
    return NextResponse.json(
      { error: "Internal Server Error. Please try again later." },
      { status: 500 }
    );
  }
}


// import { NextResponse } from "next/server";
// import OpenAI from "openai";

// // Check for API key at startup
// if (!process.env.OPENAI_API_KEY) {
//   throw new Error("Missing OPENAI_API_KEY environment variable");
// }

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// export async function POST(request: Request) {
//   try {
//     const body = await request.json();
//     const { messages } = body;

//     if (!Array.isArray(messages) || messages.length === 0) {
//       return NextResponse.json(
//         { error: "Invalid request. 'messages' must be a non-empty array." },
//         { status: 400 }
//       );
//     }

//     const completion = await openai.chat.completions.create({
//       model: "gpt-3.5-turbo",
//       messages: messages.map((msg) => ({
//         role: msg.role,
//         content: msg.content,
//       })),
//       max_tokens: 1000,
//     });

//     if (!completion.choices[0].message.content) {
//       throw new Error("No response from OpenAI");
//     }

//     return NextResponse.json({
//       role: "assistant",
//       content: completion.choices[0].message.content,
//     });
//   } catch (error: any) {
//     console.error("Error in /api/conversation:", error);
    
//     // Handle specific OpenAI errors
//     if (error?.response?.status === 401) {
//       return NextResponse.json(
//         { error: "Invalid API key. Please check your OpenAI API key configuration." },
//         { status: 401 }
//       );
//     }

//     return NextResponse.json(
//       { error: "Internal Server Error. Please try again later." },
//       { status: 500 }
//     );
//   }
// }