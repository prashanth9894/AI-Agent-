"use client";

import { Code } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import { useRouter } from "next/navigation";

import { BotAvatar } from "@/components/bot-avatar";
import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Empty } from "@/components/empty";
import { useProModal } from "@/hooks/use-pro-modal";

interface Message {
  role: 'user' | 'model';
  content: string;
}

const CodePage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [messages, setMessages] = useState<Message[]>([]);
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!prompt.trim()) return;
    
    try {
      setIsLoading(true);
      const userMessage: Message = { role: "user", content: prompt };
      const newMessages = [...messages, userMessage];
      
      const response = await axios.post('/api/code', { messages: newMessages });
      setMessages((current) => [...current, userMessage, response.data]);
      
      setPrompt("");
    } catch (error: any) {
      if (error?.response?.status === 403) {
        proModal.onOpen();
      } else {
        toast.error("Something went wrong.");
      }
      console.log(error);
    } finally {
      setIsLoading(false);
      router.refresh();
    }
  }

  return ( 
    <div>
      <Heading
        title="Code Generation"
        description="Generate code using descriptive text."
        icon={Code}
        iconColor="text-green-700"
        bgColor="bg-green-700/10"
      />
      <div className="px-4 lg:px-8">
        <div>
          <form 
            onSubmit={onSubmit} 
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <div className="col-span-12 lg:col-span-10">
              <Input
                className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                disabled={isLoading} 
                placeholder="Simple toggle button using react hooks." 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
              />
            </div>
            <Button 
              className="col-span-12 lg:col-span-2 w-full" 
              type="submit" 
              disabled={isLoading} 
              size="icon"
            >
              Generate
            </Button>
          </form>
        </div>
        <div className="space-y-4 mt-4">
          {isLoading && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isLoading && (
            <Empty label="No conversation started." />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div 
                key={index} 
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user" ? "bg-white border border-black/10" : "bg-muted",
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <ReactMarkdown components={{
                  pre: ({ node, ...props }) => (
                    <div className="overflow-auto w-full my-2 bg-black/10 p-2 rounded-lg">
                      <pre {...props} />
                    </div>
                  ),
                  code: ({ node, ...props }) => (
                    <code className="bg-black/10 rounded-lg p-1" {...props} />
                  )
                }} className="text-sm overflow-hidden leading-7">
                  {message.content}
                </ReactMarkdown>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
   );
}
 
export default CodePage;