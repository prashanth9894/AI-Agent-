// app/(dashboard)/(routes)/image/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { Download, ImageIcon } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

import { Heading } from "@/components/heading";
import { Button } from "@/components/ui/button";
import { Card, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/loader";
import { Empty } from "@/components/empty";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useProModal } from "@/hooks/use-pro-modal";

const amountOptions = [
  { value: "1", label: "1 Photo" },
  { value: "2", label: "2 Photos" },
  { value: "3", label: "3 Photos" },
  { value: "4", label: "4 Photos" },
  { value: "5", label: "5 Photos" }
];

const resolutionOptions = [
  { value: "256x256", label: "256x256" },
  { value: "512x512", label: "512x512" },
  { value: "1024x1024", label: "1024x1024" }
];

interface Photo {
  url: string;
}

const PhotoPage = () => {
  const proModal = useProModal();
  const router = useRouter();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [prompt, setPrompt] = useState("");
  const [amount, setAmount] = useState("1");
  const [resolution, setResolution] = useState("512x512");
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setPhotos([]);

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          amount,
          resolution
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Image generation failed');
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }

      setPhotos(data);
    } catch (error) {
      console.error('[IMAGE_GENERATION_ERROR]', error);
      toast.error(error instanceof Error ? error.message : "Something went wrong with image generation.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Heading
        title="Image Generation"
        description="Turn your prompt into an image."
        icon={ImageIcon}
        iconColor="text-pink-700"
        bgColor="bg-pink-700/10"
      />
      <div className="px-4 lg:px-8">
        <form 
          onSubmit={onSubmit}
          className="rounded-lg border w-full p-4 px-3 md:px-6 focus-within:shadow-sm grid grid-cols-12 gap-2"
        >
          <div className="col-span-12 lg:col-span-6">
            <Input
              className="border-0 outline-none focus-visible:ring-0 focus-visible:ring-transparent"
              disabled={isLoading}
              placeholder="A picture of a horse in Swiss alps"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </div>
          <div className="col-span-12 lg:col-span-2">
            <Select
              disabled={isLoading}
              onValueChange={setAmount}
              value={amount}
              defaultValue="1"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {amountOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-12 lg:col-span-2">
            <Select
              disabled={isLoading}
              onValueChange={setResolution}
              value={resolution}
              defaultValue="512x512"
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {resolutionOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            className="col-span-12 lg:col-span-2 w-full"
            type="submit"
            disabled={isLoading}
          >
            Generate
          </Button>
        </form>
        
        {isLoading && (
          <div className="p-20">
            <Loader />
          </div>
        )}
        
        {photos.length === 0 && !isLoading && (
          <Empty label="No images generated." />
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mt-8">
          {photos.map((photo, index) => (
            <Card key={index} className="rounded-lg overflow-hidden">
              <div className="relative aspect-square">
                <Image
                  fill
                  alt="Generated"
                  src={photo.url}
                  className="object-cover"
                />
              </div>
              <CardFooter className="p-2">
                <Button
                  onClick={() => window.open(photo.url)}
                  variant="secondary"
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PhotoPage;