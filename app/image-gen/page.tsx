'use client';

import { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { MODELS, ModelKey } from "@/lib/models";
import { Button } from "@/components/ui/button";
import ModelSelect from "@/components/ImageGen/ModelSelect";
import PromptBox from "@/components/ImageGen/PromptBox";
import ImageRefUploader from "@/components/ImageGen/ImageRefUploader";
import OutputGrid from "@/components/ImageGen/OutputGrid";
import PromptRewritePopup from "@/components/PromptUpgrade/PromptRewritePopup";
import Link from "next/link";

export default function ImageGenPage() {
  const { 
    selectedModel,
    currentPrompt, 
    referenceImages,
    isGenerating,
    setIsGenerating,
    addGeneratedImage
  } = useSessionStore();
  
  const [error, setError] = useState<string>("");

  const handleGenerate = async () => {
    if (!currentPrompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setError("");
    setIsGenerating(true);

    try {
      const model = MODELS[selectedModel];

      // Route to different API based on provider
      if (model.provider === 'openai') {
        await handleOpenAIGenerate(model);
      } else if (model.provider === 'replicate') {
        await handleReplicateGenerate(model);
      } else {
        throw new Error('Unsupported model provider');
      }

    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };

  const handleOpenAIGenerate = async (model: typeof MODELS[ModelKey]) => {
    const input: Record<string, any> = {
      prompt: currentPrompt,
    };

    // Add image references if supported (DALL-E 2 only)
    if (model.supportsImageRef && referenceImages.length > 0) {
      input.image_input = referenceImages;
    }

    const response = await fetch('/api/openai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelKey: selectedModel,
        input
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    // Add generated images to store
    const baseTimestamp = Date.now();
    result.images.forEach((img: any, index: number) => {
      addGeneratedImage({
        id: `${baseTimestamp}-${index}`,
        url: `data:image/png;base64,${img.b64_json}`,
        prompt: currentPrompt,
        modelKey: selectedModel,
        timestamp: baseTimestamp + index, // Slightly different timestamps
        revisedPrompt: img.revised_prompt,
      });
    });

    setIsGenerating(false);
  };

  const handleReplicateGenerate = async (model: typeof MODELS[ModelKey]) => {
    const input: Record<string, any> = {
      prompt: currentPrompt,
    };

    // Add image references if supported
    if (model.supportsImageRef && referenceImages.length > 0) {
      if (selectedModel === 'nano_banana') {
        input.image_input = referenceImages;
      }
    }

    // Start prediction
    const response = await fetch('/api/replicate/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelKey: selectedModel,
        input
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const prediction = await response.json();

    if (prediction.error) {
      throw new Error(prediction.error);
    }

    // Watch stream if available
    if (prediction.streamUrl) {
      watchReplicateStream(
        prediction.streamUrl,
        (data) => {
          console.log('Stream data:', data);
        },
        () => {
          // When completed, poll for final result
          pollPrediction(prediction.id);
        }
      );
    } else {
      // Fallback to polling
      pollPrediction(prediction.id);
    }
  };
  
  const pollPrediction = async (predictionId: string) => {
    // Simple polling implementation
    const poll = async () => {
      try {
        const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
          headers: {
            'Authorization': `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`
          }
        });
        
        // Note: This won't work in production due to CORS and exposed token
        // In real implementation, create a server route for polling
        console.log('Would poll prediction:', predictionId);
        
        // Mock completion for demo
        setTimeout(() => {
          addGeneratedImage({
            id: Date.now().toString(),
            url: 'https://via.placeholder.com/512x512?text=Generated+Image',
            prompt: currentPrompt,
            modelKey: selectedModel,
            timestamp: Date.now(),
            predictionId
          });
          setIsGenerating(false);
        }, 3000);
        
      } catch (error) {
        console.error('Polling error:', error);
        setIsGenerating(false);
      }
    };
    
    poll();
  };
  
  const watchReplicateStream = (url: string, onData: (data: any) => void, onDone: () => void) => {
    const es = new EventSource(url);
    es.onmessage = (ev) => {
      const msg = JSON.parse(ev.data);
      onData(msg);
      if (msg.event === "completed" || msg.event === "failed") {
        es.close();
        onDone();
      }
    };
    es.onerror = () => {
      es.close();
      onDone();
    };
    return () => es.close();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Image Generation</h1>
            <p className="text-gray-600">Create stunning images with AI</p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/">← Home</Link>
          </Button>
        </div>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Controls Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-6">Generation Settings</h2>
            
            <ModelSelect />
            <PromptBox />
            <ImageRefUploader />
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700">
                {error}
              </div>
            )}
            
            <Button 
              onClick={handleGenerate}
              disabled={isGenerating || !currentPrompt.trim()}
              className="w-full"
              size="lg"
            >
              {isGenerating ? "Generating..." : "Generate Image"}
            </Button>
          </div>
          
          {/* Output Panel */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <OutputGrid />
          </div>
        </div>
      </div>
      
      <PromptRewritePopup />
    </div>
  );
}