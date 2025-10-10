'use client';

import { useState, useEffect } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function PromptRewritePopup() {
  const {
    isUpgradeOpen,
    upgradePrompt,
    upgradedPrompt,
    isUpgrading,
    setIsUpgradeOpen,
    setUpgradePrompt,
    setUpgradedPrompt,
    setIsUpgrading,
    setCurrentPrompt
  } = useSessionStore();
  
  const [mode, setMode] = useState<'enhance' | 'creative' | 'detailed'>('enhance');
  const [streamingText, setStreamingText] = useState('');

  useEffect(() => {
    if (isUpgradeOpen) {
      setStreamingText('');
      setUpgradedPrompt('');
    }
  }, [isUpgradeOpen, setUpgradedPrompt]);

  const handleUpgrade = async () => {
    if (!upgradePrompt.trim()) return;
    
    setIsUpgrading(true);
    setStreamingText('');
    
    try {
      const response = await fetch('/api/groq/rewrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawPrompt: upgradePrompt,
          mode
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const reader = response.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const token = line.slice(6);
            buffer += token;
            setStreamingText(buffer);
          }
        }
      }
      
      // Try to parse final JSON
      try {
        const parsed = JSON.parse(buffer);
        if (parsed.prompt) {
          setUpgradedPrompt(parsed.prompt);
        } else {
          setUpgradedPrompt(buffer);
        }
      } catch {
        setUpgradedPrompt(buffer);
      }
      
    } catch (error) {
      console.error('Upgrade error:', error);
      setUpgradedPrompt('Error upgrading prompt. Please try again.');
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleAccept = () => {
    if (upgradedPrompt) {
      setCurrentPrompt(upgradedPrompt);
    }
    setIsUpgradeOpen(false);
  };

  const handleClose = () => {
    setIsUpgradeOpen(false);
    setStreamingText('');
  };

  return (
    <Dialog 
      open={isUpgradeOpen} 
      onOpenChange={setIsUpgradeOpen}
      className="max-w-2xl"
    >
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Upgrade Your Prompt</h2>
          <Button variant="ghost" size="sm" onClick={handleClose}>
            ✕
          </Button>
        </div>
        
        {/* Mode Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Enhancement Mode:</label>
          <div className="flex gap-2">
            {(['enhance', 'creative', 'detailed'] as const).map((m) => (
              <Button
                key={m}
                variant={mode === m ? "default" : "outline"}
                size="sm"
                onClick={() => setMode(m)}
              >
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </Button>
            ))}
          </div>
        </div>
        
        {/* Original Prompt */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Original Prompt:</label>
          <Textarea
            value={upgradePrompt}
            onChange={(e) => setUpgradePrompt(e.target.value)}
            placeholder="Enter your prompt to enhance..."
            rows={3}
          />
        </div>
        
        {/* Upgrade Button */}
        <Button 
          onClick={handleUpgrade}
          disabled={isUpgrading || !upgradePrompt.trim()}
          className="w-full"
        >
          {isUpgrading ? "✨ Enhancing..." : "✨ Enhance Prompt"}
        </Button>
        
        {/* Streaming/Result Display */}
        {(streamingText || upgradedPrompt) && (
          <div className="space-y-2">
            <label className="text-sm font-medium">
              {isUpgrading ? "Enhanced Prompt (Streaming):" : "Enhanced Prompt:"}
            </label>
            <div className="p-4 bg-gray-50 rounded-lg min-h-[120px] relative">
              {isUpgrading && (
                <div className="absolute top-2 right-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
                </div>
              )}
              <div className="text-sm whitespace-pre-wrap">
                {streamingText || upgradedPrompt}
              </div>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        {upgradedPrompt && !isUpgrading && (
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAccept} className="flex-1">
              Use Enhanced Prompt
            </Button>
          </div>
        )}
      </div>
    </Dialog>
  );
}