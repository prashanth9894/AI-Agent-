// "use client";

// import * as z from "zod";
// import axios from "axios";
// import { useState } from "react";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useForm } from "react-hook-form";
// import { toast } from "react-hot-toast";
// import { useRouter } from "next/navigation";
// import { Music, Send } from "lucide-react";

// import { Heading } from "@/components/heading";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
// import { Loader } from "@/components/loader";
// import { Empty } from "@/components/empty";
// import { useProModal } from "@/hooks/use-pro-modal";

// import { formSchema } from "./constants";

// const MusicPage = () => {
//   const proModal = useProModal();
//   const router = useRouter();
//   const [music, setMusic] = useState<string>();

//   const form = useForm<z.infer<typeof formSchema>>({
//     resolver: zodResolver(formSchema),
//     defaultValues: {
//       prompt: "",
//     }
//   });

//   const isLoading = form.formState.isSubmitting;

//   const onSubmit = async (values: z.infer<typeof formSchema>) => {
//     try {
//       setMusic(undefined);

//       const response = await axios.post('/api/music', values);
//       console.log(response)

//       setMusic(response.data.audio);
//       form.reset();
//     } catch (error: any) {
//       if (error?.response?.status === 403) {
//         proModal.onOpen();
//       } else {
//         toast.error("Something went wrong.");
//       }
//     console.log(error);
//     } finally {
//       router.refresh();
//     }
//   }

//   return ( 
//     <div>
//       <Heading
//         title="Music Generation"
//         description="Turn your prompt into music."
//         icon={Music}
//         iconColor="text-emerald-500"
//         bgColor="bg-emerald-500/10"
//       />
//       <div className="px-4 lg:px-8">
//         <Form {...form}>
//           <form 
//             onSubmit={form.handleSubmit(onSubmit)} 
//             className="
//               rounded-lg 
//               border 
//               w-full 
//               p-4 
//               px-3 
//               md:px-6 
//               focus-within:shadow-sm
//               grid
//               grid-cols-12
//               gap-2
//             "
//           >
//             <FormField
//               name="prompt"
//               render={({ field }) => (
//                 <FormItem className="col-span-12 lg:col-span-10">
//                   <FormControl className="m-0 p-0">
//                     <Input
//                       className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
//                       disabled={isLoading} 
//                       placeholder="Piano solo" 
//                       {...field}
//                     />
//                   </FormControl>
//                 </FormItem>
//               )}
//             />
//             <Button className="col-span-12 lg:col-span-2 w-full" type="submit" disabled={isLoading} size="icon">
//               Generate
//             </Button>
//           </form>
//         </Form>
//         {isLoading && (
//           <div className="p-20">
//             <Loader />
//           </div>
//         )}
//         {!music && !isLoading && (
//           <Empty label="No music generated." />
//         )}
//         {music && (
//           <audio controls className="w-full mt-8">
//             <source src={music} />
//           </audio>
//         )}
//       </div>
//     </div>
//    );
// }
 
// export default MusicPage;

// app/music/page.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { Music } from "lucide-react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Music prompt is required"
  }),
});

type FormValues = z.infer<typeof formSchema>;

const MusicPage = () => {
  const router = useRouter();
  const [music, setMusic] = useState<string>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: FormValues) => {
    try {
      setMusic(undefined);

      const response = await axios.post('/api/music', values);
      setMusic(response.data.audio);
      form.reset();
    } catch (error: any) {
      if (error.response?.status === 503) {
        toast.error("Model is loading, please try again in a moment");
      } else {
        toast.error(error.response?.data || "Something went wrong.");
      }
      console.log(error);
    }
  }

  return ( 
    <div>
      <Heading
        title="Music Generation"
        description="Turn your prompt into music."
        icon={Music}
        iconColor="text-emerald-500"
        bgColor="bg-emerald-500/10"
      />
      <div className="px-4 lg:px-8">
        <Form {...form}>
          <form 
            onSubmit={form.handleSubmit(onSubmit)} 
            className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
          >
            <FormField
              name="prompt"
              render={({ field }) => (
                <FormItem className="col-span-12 lg:col-span-10">
                  <FormControl className="m-0 p-0">
                    <Input
                      className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
                      disabled={isLoading} 
                      placeholder="Piano solo" 
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              className="col-span-12 lg:col-span-2 w-full" 
              type="submit" 
              disabled={isLoading}
            >
              Generate
            </Button>
          </form>
        </Form>
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        {!music && !isLoading && (
          <Empty label="No music generated." />
        )}
        {music && (
          <audio controls className="w-full mt-8">
            <source src={music} />
          </audio>
        )}
      </div>
    </div>
   );
}
 
export default MusicPage;