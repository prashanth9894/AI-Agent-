// app/video/page.tsx
"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { FileVideo } from "lucide-react";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";

const formSchema = z.object({
  prompt: z.string().min(1, {
    message: "Video prompt is required"
  }),
});

type FormValues = z.infer<typeof formSchema>;

const VideoPage = () => {
  const [video, setVideo] = useState<string>();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    }
  });

  const isLoading = form.formState.isSubmitting;

  const onSubmit = async (values: FormValues) => {
    try {
      setVideo(undefined);

      const response = await axios.post('/api/video', values);
      
      if (response.data && response.data.length > 0) {
        setVideo(response.data[0]);
        form.reset();
      } else {
        toast.error("No video was generated.");
      }
    } catch (error: any) {
      toast.error(error.response?.data || "Failed to generate video.");
      console.log(error);
    }
  }

  return ( 
    <div>
      <Heading
        title="Video Generation"
        description="Turn your prompt into video."
        icon={FileVideo}
        iconColor="text-orange-700"
        bgColor="bg-orange-700/10"
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
                      placeholder="Clown fish swimming in a coral reef" 
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <Button 
              className="col-span-12 lg:col-span-2 w-full" 
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
        {!video && !isLoading && (
          <Empty label="No video generated." />
        )}
        {video && (
          <video 
            controls 
            className="w-full aspect-video mt-8 rounded-lg border bg-black"
          >
            <source src={video} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        )}
      </div>
    </div>
   );
}
 
export default VideoPage;