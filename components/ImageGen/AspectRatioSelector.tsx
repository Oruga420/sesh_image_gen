'use client';

import { useSessionStore, AspectRatio } from "@/store/useSessionStore";
import { Button } from "@/components/ui/button";

const aspectRatioOptions = [
  {
    value: 'square' as AspectRatio,
    label: 'Square',
    ratio: '1:1',
    description: 'Perfect for social media posts',
    icon: '⬜'
  },
  {
    value: 'landscape' as AspectRatio,
    label: 'Landscape',
    ratio: '16:9',
    description: 'Great for wallpapers and headers',
    icon: '🖼️'
  },
  {
    value: 'portrait' as AspectRatio,
    label: 'Portrait',
    ratio: '9:16',
    description: 'Ideal for Instagram Stories',
    icon: '📱'
  }
];

export default function AspectRatioSelector() {
  const { aspectRatio, setAspectRatio } = useSessionStore();

  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Aspect Ratio</h3>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {aspectRatioOptions.map((option) => (
          <Button
            key={option.value}
            variant={aspectRatio === option.value ? "default" : "outline"}
            onClick={() => setAspectRatio(option.value)}
            className="h-auto p-3 sm:p-4 flex flex-col items-center gap-2 text-center min-h-[100px] justify-center"
          >
            <div className="text-xl sm:text-2xl">{option.icon}</div>
            <div className="flex flex-col items-center w-full">
              <span className="font-medium text-sm sm:text-base">{option.label}</span>
              <span className="text-xs opacity-75">{option.ratio}</span>
              <span className="text-xs opacity-60 mt-1 leading-tight break-words max-w-full text-center hyphens-auto" style={{wordWrap: 'break-word'}}>
                {option.description}
              </span>
            </div>
          </Button>
        ))}
      </div>
    </div>
  );
}
