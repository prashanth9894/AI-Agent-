import { GoogleGenerativeAI } from "@google/generative-ai";

type Message = { role: "user" | "assistant"; content: string };

export class ConversationService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async handleConversation(messages: Message[]): Promise<Message> {
    const model = this.genAI.getGenerativeModel({ model: "gemini-pro" });

    const chat = model.startChat({
      history: messages.map(msg => ({
        role: msg.role,
        parts: msg.content,
      })),
    });

    const result = await chat.sendMessage(messages[messages.length - 1].content);
    const response = await result.response;
    const text = response.text();

    return { role: "assistant", content: text };
  }
}

