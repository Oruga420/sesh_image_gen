'use client';

import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function OutputGrid() {
  const { generatedImages } = useSessionStore();

  if (generatedImages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🎨</div>
        <p>Generated images will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Generated Images</h3>
      
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedImages.map((image) => (
          <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="aspect-square relative">
              <Image 
                src={image.url}
                alt="Generated image"
                fill
                className="object-cover"
              />
            </div>
            
            <div className="p-4">
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {image.prompt}
              </p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>{image.modelKey}</span>
                <span>
                  {new Date(image.timestamp).toLocaleDateString()}
                </span>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={image.url} download target="_blank">
                    Download
                  </a>
                </Button>
                
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/edit?ref=${encodeURIComponent(image.url)}`}>
                    Edit
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}