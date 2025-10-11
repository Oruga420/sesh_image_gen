'use client';

import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function OutputGrid() {
  const { generatedImages } = useSessionStore();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  if (generatedImages.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <div className="text-6xl mb-4">🎨</div>
        <p>Generated images will appear here</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <h3 className="text-lg font-semibold">Generated Images</h3>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {generatedImages.map((image) => (
            <div key={image.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div
                className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => setSelectedImage(image.url)}
              >
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

      {/* Image Preview Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white text-4xl hover:text-gray-300"
            >
              ×
            </button>
            <img
              src={selectedImage}
              alt="Full size preview"
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>
        </div>
      )}
    </>
  );
}
