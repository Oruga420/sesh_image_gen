'use client';

import { useSessionStore } from "@/store/useSessionStore";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export default function PromptBox() {
  const { 
    currentPrompt, 
    setCurrentPrompt,
    setIsUpgradeOpen,
    setUpgradePrompt 
  } = useSessionStore();

  const handleUpgradePrompt = () => {
    setUpgradePrompt(currentPrompt);
    setIsUpgradeOpen(true);
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2 text-gray-900 dark:text-white">
        Image Prompt
      </label>
      <div className="relative">
        <Textarea 
          value={currentPrompt}
          onChange={(e) => setCurrentPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="min-h-[120px] resize-none bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400"
        />
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {currentPrompt.length} characters
          </span>
          <Button 
            variant="seshOutline" 
            size="sm"
            onClick={handleUpgradePrompt}
            disabled={!currentPrompt.trim()}
          >
            ✨ Upgrade Prompt
          </Button>
        </div>
      </div>
    </div>
  );
}