// "use client";

// import * as z from "zod";
// import axios from "axios";
// import { MessageSquare } from "lucide-react";
// import { useForm } from "react-hook-form";
// import { useState } from "react";
// import { toast } from "react-hot-toast";
// import { useRouter } from "next/navigation";
// // import { ChatCompletionRequestMessage } from "openai";
// import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// // import { BotAvatar } from "@/components/bot-avatar";
// import { Heading } from "@/components/heading";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import { cn } from "@/lib/utils";
// import { Loader } from "@/components/loader";
// import { UserAvatar } from "@/components/user-avatar";
// import { Empty } from "@/components/empty";
// import { useProModal } from "@/hooks/use-pro-modal";

// import { formSchema } from "./constants";
// import { BotAvatar } from "@/components/bot-avatar";

// const ConversationPage = () => {
//   const router = useRouter();
//   const proModal = useProModal();
//   const [messages, setMessages] = useState<ChatCompletionMessageParam[]>([]);

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       prompt: ""
//     }
//   });

//   const isLoading = form.formState.isSubmitting;
  
//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       const userMessage: ChatCompletionMessageParam = { role: "user", content: values.prompt };
//       const newMessages = [...messages, userMessage];
      
//       const response = await axios.post('/api/conversation', { messages: newMessages });
//       setMessages((current) => [...current, userMessage, response.data]);
      
//       form.reset();
//     } catch (error: any) {
//       if (error?.response?.status === 403) {
//         proModal.onOpen();
//       } else {
//         toast.error("Something went wrong.");
//       }
//       console.log(error);
//     } finally {
//       router.refresh();
//     }
//   }

//   return ( 
//     <div>
//       <Heading
//         title="Conversation"
//         description="Our most advanced conversation model."
//         icon={MessageSquare}
//         iconColor="text-violet-500"
//         bgColor="bg-violet-500/10"
//       />
//       <div className="px-4 lg:px-8">
//         <div>
//           <Form {...form}>
//             <form 
//               onSubmit={form.handleSubmit(onSubmit)} 
//               className="
//                 rounded-lg 
//                 border 
//                 w-full 
//                 p-4 
//                 px-3 
//                 md:px-6 
//                 focus-within:shadow-sm
//                 grid
//                 grid-cols-12
//                 gap-2
//               "
//             >
//               <FormField
//                 name="prompt"
//                 render={({ field }) => (
//                   <FormItem className="col-span-12 lg:col-span-10">
//                     <FormControl className="m-0 p-0">
//                       <Input
//                         className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
//                         disabled={isLoading} 
//                         placeholder="How do I calculate the radius of a circle?" 
//                         {...field}
//                       />
//                     </FormControl>
//                   </FormItem>
//                 )}
//               />
//               <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
//                 Generate
//               </Button>
//             </form>
//           </Form>
//         </div>
//         <div className="space-y-4 mt-4">
//           {isLoading && (
//             <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
//               <Loader />
//             </div>
//           )}
//           {messages.length === 0 && !isLoading && (
//             <Empty label="No conversation started." />
//           )} 
//           <div className="flex flex-col-reverse gap-y-4">
//             {messages.map((message) => (
//               <div 
//                 key={message.content?.toString()} 
//                 className={cn(
//                   "p-8 w-full flex items-start gap-x-8 rounded-lg",
//                   message.role === "user" ? "bg-white border border-black/10" : "bg-muted",
//                 )}
//               >
//                 {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
//                 <p className="text-sm">
//                   {message.content?.toString()}
//                 </p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//    );
// }
 
// export default ConversationPage;


"use client";

import { MessageSquare, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Loading animation component remains the same
const G3shaLoadingAnimation = () => (
  <div className="flex items-center justify-center p-4 w-full">
    <div className="relative w-12 h-12">
      <div className="absolute inset-0 border-2 border-violet-500 rounded-full animate-ping opacity-75"></div>
      <div className="absolute inset-1 border-2 border-violet-400 rounded-full animate-ping opacity-50" style={{ animationDelay: "0.2s" }}></div>
      <div className="absolute inset-2 border-2 border-violet-300 rounded-full animate-ping opacity-25" style={{ animationDelay: "0.4s" }}></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-violet-600 text-xs font-bold">G3SHA</span>
      </div>
    </div>
  </div>
);

type Message = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type ChatSession = {
  id: string;
  messages: Message[];
  lastUpdated: number;
};

// New component for formatted message content
const FormattedMessage = ({ content }: { content: string }) => {
  // Split content into paragraphs
  const paragraphs = content.split('\n').filter(p => p.trim());
  
  return (
    <div className="space-y-4 leading-relaxed">
      {paragraphs.map((paragraph, idx) => {
        // Check if the paragraph is code
        if (paragraph.startsWith('```')) {
          const code = paragraph.replace(/```/g, '').trim();
          return (
            <pre key={idx} className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code className="text-sm font-mono text-gray-800">{code}</code>
            </pre>
          );
        }
        
        // Regular paragraph
        return (
          <p key={idx} className="text-gray-700">
            {paragraph}
          </p>
        );
      })}
    </div>
  );
};

const SidebarChat = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      if (parsedSessions.length > 0) {
        setCurrentSessionId(parsedSessions[0].id);
      }
    }
  }, []);

  // Save sessions to localStorage
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
    }
  }, [sessions]);

  const getCurrentSession = () => {
    return sessions.find(session => session.id === currentSessionId);
  };

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      messages: [],
      lastUpdated: Date.now()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSessionId(newSession.id);
  };

  const updateSession = (sessionId: string, newMessages: Message[]) => {
    setSessions(prev => prev.map(session => 
      session.id === sessionId 
        ? { ...session, messages: newMessages, lastUpdated: Date.now() }
        : session
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSubmitting) return;

    if (!currentSessionId) {
      createNewSession();
    }

    setIsSubmitting(true);
    setError(null);

    const currentSession = getCurrentSession();
    const userMessage: Message = {
      role: "user",
      content: input.trim(),
      timestamp: Date.now()
    };

    const newMessages = [...(currentSession?.messages || []), userMessage];

    try {
      updateSession(currentSessionId, newMessages);
      setInput("");

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const assistantMessage: Message = {
        ...data,
        timestamp: Date.now()
      };

      updateSession(currentSessionId, [...newMessages, assistantMessage]);
    } catch (err) {
      console.error("Conversation error:", err);
      setError("An error occurred while processing your request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l">
      {/* Header */}
      <div className="p-2 border-b bg-white">
        <button
          onClick={createNewSession}
          className="w-full px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center gap-2 transition-colors text-sm"
        >
          <MessageSquare className="w-4 h-4" />
          <span>New Chat</span>
        </button>
      </div>

      {/* Enhanced Messages Section */}
      <div className="flex-1 overflow-y-auto bg-white">
        {getCurrentSession()?.messages.length === 0 ? (
          <div className="h-full flex items-center justify-center p-4">
            <div className="text-center space-y-1">
              <h2 className="text-lg font-bold text-gray-900">G3SHA AI</h2>
              <p className="text-sm text-gray-500">Start a conversation</p>
            </div>
          </div>
        ) : (
          <div className="py-4">
            {getCurrentSession()?.messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "px-4 py-6",
                  message.role === "assistant" ? "bg-gray-50 border-y border-gray-100" : ""
                )}
              >
                <div className="max-w-3xl mx-auto flex gap-4">
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm",
                    message.role === "assistant" ? "bg-violet-600 text-white" : "bg-gray-900 text-white"
                  )}>
                    {message.role === "assistant" ? "AI" : "Y"}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">
                        {message.role === "assistant" ? "G3SHA AI" : "You"}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <FormattedMessage content={message.content} />
                  </div>
                </div>
              </div>
            ))}
            {isSubmitting && <G3shaLoadingAnimation />}
          </div>
        )}
      </div>

      {/* Enhanced Input Form */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="relative max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Send a message..."
            className="w-full p-3 pr-24 text-base rounded-lg border border-gray-300 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            disabled={isSubmitting || !input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
        {error && (
          <div className="mt-2 text-red-500 text-sm max-w-3xl mx-auto">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default SidebarChat;