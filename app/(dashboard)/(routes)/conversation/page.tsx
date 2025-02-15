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
import * as z from "zod";
import axios from "axios";
import { MessageSquare } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Heading } from "@/components/heading";
import { cn } from "@/lib/utils";
import { Loader } from "@/components/loader";
import { UserAvatar } from "@/components/user-avatar";
import { Empty } from "@/components/empty";
import { useProModal } from "@/hooks/use-pro-modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { BotAvatar } from "@/components/bot-avatar";

// Define the form schema
const formSchema = z.object({
  prompt: z.string().min(1, { message: "Prompt is required" }),
});

type FormValues = z.infer<typeof formSchema>;
type Message = { role: "user" | "assistant"; content: string };

const ConversationPage = () => {
  const router = useRouter();
  const proModal = useProModal();
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting, errors }
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: ""
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setError(null);
      
      const userMessage: Message = { 
        role: "user", 
        content: data.prompt 
      };
      
      const newMessages = [...messages, userMessage];

      // Make the API call
      const response = await axios.post("/api/conversation", {
        messages: newMessages,
      });

      if (!response.data) {
        throw new Error("No response data received");
      }

      // Update messages state
      setMessages(current => [...current, userMessage, response.data]);
      
      // Reset form
      reset();

    } catch (err) {
      console.error("Conversation error:", err);
      
      // Type guard for axios errors
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 403) {
          proModal.onOpen();
          setError("Free limit exceeded. Please upgrade to continue.");
        } else if (err.response?.status === 401) {
          setError("You must be logged in to use this feature.");
          toast.error("You must be logged in to use this feature.");
        } else {
          setError("An error occurred while processing your request.");
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        setError("An unexpected error occurred.");
        toast.error("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div>
      <Heading
        title="Conversation"
        description="Our most advanced conversation model."
        icon={MessageSquare}
        iconColor="text-violet-500"
        bgColor="bg-violet-500/10"
      />
      <div className="px-4 lg:px-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
        >
          <div className="col-span-12 lg:col-span-10">
            <input
              {...register("prompt")}
              className="w-full focus:outline-none bg-transparent border rounded-md p-2"
              disabled={isSubmitting}
              placeholder="How do I calculate the radius of a circle?"
            />
            {errors.prompt && (
              <p className="text-red-500 text-sm mt-1">{errors.prompt.message}</p>
            )}
          </div>
          <div className="col-span-12 lg:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-violet-500 text-white rounded-md hover:bg-violet-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Generating..." : "Generate"}
            </button>
          </div>
        </form>

        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        <div className="space-y-4 mt-4">
          {isSubmitting && (
            <div className="p-8 rounded-lg w-full flex items-center justify-center bg-muted">
              <Loader />
            </div>
          )}
          {messages.length === 0 && !isSubmitting && (
            <Empty label="No conversation started." />
          )}
          <div className="flex flex-col-reverse gap-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  "p-8 w-full flex items-start gap-x-8 rounded-lg",
                  message.role === "user"
                    ? "bg-white border border-black/10"
                    : "bg-muted"
                )}
              >
                {message.role === "user" ? <UserAvatar /> : <BotAvatar />}
                <p className="text-sm">{message.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationPage;