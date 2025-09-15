'use client';

import { useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { MODELS } from "@/lib/models/registry";
import { getAspectRatioForModel, getCustomDimensionsForModel } from "@/lib/utils/aspectRatio";
import { Button } from "@/components/ui/button";
import ModelSelect from "@/components/ImageGen/ModelSelect";
import PromptBox from "@/components/ImageGen/PromptBox";
import AspectRatioSelector from "@/components/ImageGen/AspectRatioSelector";
import ImageRefUploader from "@/components/ImageGen/ImageRefUploader";
import OutputGrid from "@/components/ImageGen/OutputGrid";
import PromptRewritePopup from "@/components/PromptUpgrade/PromptRewritePopup";
import Link from "next/link";

export default function ImageGenPage() {
  const { 
    selectedModel,
    currentPrompt, 
    aspectRatio,
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
      // Prepare input based on model
      const model = MODELS[selectedModel];
      const input: Record<string, any> = {
        prompt: currentPrompt,
      };
      
      // Add aspect ratio support
      const aspectRatioValue = getAspectRatioForModel(aspectRatio, selectedModel);
      const customDimensions = getCustomDimensionsForModel(aspectRatio, selectedModel);
      
      // Add custom dimensions if the model supports it
      if (customDimensions.width && customDimensions.height) {
        input.width = customDimensions.width;
        input.height = customDimensions.height;
        if (selectedModel === 'flux_1_1_pro') {
          input.aspect_ratio = 'custom'; // FLUX needs this for custom dimensions
        }
        // For models like proteus_v0_3, don't add aspect_ratio since they only use width/height
      } else {
        // For models that use aspect_ratio parameter (not width/height)
        if (aspectRatioValue !== '1:1') { // Only add if not default square
          input.aspect_ratio = aspectRatioValue;
        }
      }
      
      // Add image references if supported
      if (model.supportsImageRef && referenceImages.length > 0) {
        if (selectedModel === 'nano_banana' || selectedModel === 'seedream4') {
          input.image_input = referenceImages;
        } else if (selectedModel === 'flux_1_1_pro') {
          input.image_prompt = referenceImages[0]; // FLUX uses single image_prompt
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
      
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsGenerating(false);
    }
  };
  
  const pollPrediction = async (predictionId: string) => {
    const startTime = Date.now();
    const maxWaitTime = 10 * 60 * 1000; // 10 minutes max
    let pollCount = 0;
    
    // Poll our backend endpoint instead of Replicate directly
    const poll = async () => {
      try {
        pollCount++;
        const elapsed = Date.now() - startTime;
        
        // Check for timeout
        if (elapsed > maxWaitTime) {
          throw new Error('Generation timed out after 10 minutes. The model may be overloaded or the request may be too complex.');
        }
        
        const response = await fetch(`/api/replicate/status/${predictionId}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const prediction = await response.json();
        
        // Debug logging
        console.log(`Poll ${pollCount} for ${predictionId}: ${prediction.status}`, prediction);
        
        if (prediction.error) {
          throw new Error(prediction.error);
        }
        
        if (prediction.status === 'succeeded' && prediction.output) {
          // Handle successful completion
          const imageUrl = Array.isArray(prediction.output) ? prediction.output[0] : prediction.output;
          
          addGeneratedImage({
            id: Date.now().toString(),
            url: imageUrl,
            prompt: currentPrompt,
            modelKey: selectedModel,
            timestamp: Date.now(),
            predictionId
          });
          setIsGenerating(false);
        } else if (prediction.status === 'failed') {
          throw new Error(`Generation failed: ${prediction.error || 'Unknown error'}`);
        } else if (prediction.status === 'canceled') {
          throw new Error('Generation was canceled');
        } else {
          // Still in progress, poll again after delay
          // Increase polling interval for long-running predictions
          const delay = pollCount > 30 ? 5000 : 2000; // 5s after 1 minute, 2s before
          setTimeout(() => poll(), delay);
        }
        
      } catch (error) {
        console.error('Polling error:', error);
        setError(error instanceof Error ? error.message : 'Unknown error occurred');
        setIsGenerating(false);
      }
    };
    
    // Start polling with initial delay
    setTimeout(() => poll(), 1000);
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
            <AspectRatioSelector />
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