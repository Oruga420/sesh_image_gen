'use client';

import { Button } from "@/components/ui/button";
import { useSessionStore } from "@/store/useSessionStore";

const IMAGE_OPTIONS = [1, 2, 3, 4, 5];

export default function ImageCountSelector() {
  const { imagesToGenerate, setImagesToGenerate } = useSessionStore();

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        Images per request
      </label>
      <div className="flex flex-wrap gap-2">
        {IMAGE_OPTIONS.map((count) => (
          <Button
            key={count}
            type="button"
            variant={imagesToGenerate === count ? 'default' : 'outline'}
            onClick={() => setImagesToGenerate(count)}
          >
            {count}
          </Button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Generate up to 5 images simultaneously. Each image uses the selected model once.
      </p>
    </div>
  );
}
