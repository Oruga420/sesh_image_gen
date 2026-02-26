'use client';

import { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { Button } from "@/components/ui/button";
import ImagePreviewModal from "@/components/ui/image-preview-modal";
import { MODELS } from "@/lib/models/registry";
import Image from "next/image";

export default function OutputGrid() {
  const { generatedImages } = useSessionStore();
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  // Newest first — same order as rendered
  const sortedImages = [...generatedImages].reverse();

  // Build a model name lookup map
  const modelNames: Record<string, string | undefined> = {};
  for (const key in MODELS) {
    modelNames[key] = MODELS[key]?.name;
  }

  const handleImageClick = (displayIndex: number) => {
    setPreviewIndex(displayIndex);
  };

  const closePreview = () => {
    setPreviewIndex(null);
  };

  const handleNavigate = (newIndex: number) => {
    setPreviewIndex(newIndex);
  };

  if (generatedImages.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 dark:text-gray-400">
        <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">🎨</div>
        <p className="text-sm sm:text-base">Generated images will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Generated Images</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {sortedImages.map((image, displayIndex) => (
          <div key={image.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
            <div
              className="aspect-square relative cursor-pointer hover:opacity-90 transition-opacity group"
              onClick={() => handleImageClick(displayIndex)}
            >
              <Image
                src={image.url}
                alt="Generated image"
                fill
                className="object-cover"
                unoptimized
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white bg-opacity-90 px-3 py-1 rounded text-sm font-medium">
                  Click to preview
                </div>
              </div>
            </div>

            <div className="p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mb-2 sm:mb-3 line-clamp-2">
                {image.prompt}
              </p>

              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center text-xs text-gray-500 dark:text-gray-400 mb-3 gap-1 sm:gap-0">
                <span className="truncate">{MODELS[image.modelKey]?.name || image.modelKey}</span>
                <span className="text-xs">
                  {new Date(image.timestamp).toLocaleDateString()}
                </span>
              </div>

              <Button variant="outline" size="sm" asChild className="w-full">
                <a href={image.url} download target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={previewIndex !== null}
        onClose={closePreview}
        images={sortedImages.map(img => ({
          url: img.url,
          prompt: img.prompt,
          modelKey: img.modelKey,
          timestamp: img.timestamp,
        }))}
        currentIndex={previewIndex ?? 0}
        onNavigate={handleNavigate}
        modelNames={modelNames}
      />
    </div>
  );
}
