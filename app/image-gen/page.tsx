'use client';

import { useEffect, useState } from "react";
import { useSessionStore } from "@/store/useSessionStore";
import { MODELS, ModelKey } from "@/lib/models";
import { getAspectRatioForModel, getCustomDimensionsForModel } from "@/lib/utils/aspectRatio";
import { extractImageUrlFromReplicateOutput } from "@/lib/utils/replicateOutput";
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
  const [nanoBananaResolution, setNanoBananaResolution] = useState<'1K' | '2K' | '4K'>('1K');

  useEffect(() => {
    if (selectedModel !== 'nano_banana_pro') {
      setNanoBananaResolution('1K');
    }
  }, [selectedModel]);

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
    console.log('🚀 Starting Replicate generation for model:', selectedModel);
    const input: Record<string, any> = {
      prompt: currentPrompt,
    };

    // Add aspect ratio support
    const aspectRatioValue = getAspectRatioForModel(aspectRatio, selectedModel);
    const customDimensions = getCustomDimensionsForModel(aspectRatio, selectedModel);
    console.log('📐 Aspect ratio:', aspectRatio, 'Value:', aspectRatioValue, 'Dimensions:', customDimensions);

    // Add custom dimensions if the model supports it
    if (customDimensions.width && customDimensions.height) {
      input.width = customDimensions.width;
      input.height = customDimensions.height;
    } else {
      // For models that use aspect_ratio parameter (not width/height)
      // Always send a value so models don't default to match_input_image
      input.aspect_ratio = aspectRatioValue;
    }

    if (selectedModel === 'nano_banana_pro') {
      input.resolution = nanoBananaResolution;
    }

    // Add image references if supported
    if (model.supportsImageRef && referenceImages.length > 0) {
      if (
        selectedModel === 'nano_banana' ||
        selectedModel === 'nano_banana_pro' ||
        selectedModel === 'seedream4'
      ) {
        input.image_input = referenceImages;
      } else if (selectedModel === 'flux_2_pro') {
        input.input_images = referenceImages.slice(0, 8);
      } else if (selectedModel === 'flux_1_1_pro_ultra') {
        input.image_prompt = referenceImages[0]; // FLUX uses single image_prompt
      }
    }

    console.log('📤 Sending request to /api/replicate/predict with input:', input);

    // Start prediction
    const response = await fetch('/api/replicate/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelKey: selectedModel,
        input
      })
    });

    console.log('📥 Prediction response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Prediction request failed:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const prediction = await response.json();
    console.log('✅ Prediction created:', prediction);

    if (prediction.error) {
      throw new Error(prediction.error);
    }

    // Always use polling (streamUrl causes CORS issues)
    console.log('⏳ Starting polling for prediction ID:', prediction.id);
    pollPrediction(prediction.id);
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

        if (prediction.status === 'succeeded') {
          // Handle successful completion
          const imageUrl =
            (typeof prediction.imageUrl === "string" &&
              prediction.imageUrl.trim()) ||
            (Array.isArray(prediction.imageUrls) &&
              prediction.imageUrls.length > 0 &&
              prediction.imageUrls[0]) ||
            extractImageUrlFromReplicateOutput(prediction.output);

          if (!imageUrl) {
            console.warn(
              "Replicate prediction completed without an identifiable image URL.",
              prediction.output
            );
            throw new Error(
              "Generation succeeded but did not return an image URL. Please try again."
            );
          }

          console.log("Replicate generation succeeded. Image URL:", imageUrl);

          const imageData = {
            id: Date.now().toString(),
            url: imageUrl,
            prompt: currentPrompt,
            modelKey: selectedModel,
            timestamp: Date.now(),
            predictionId,
          };
          console.log("Adding image to store:", imageData);
          addGeneratedImage(imageData);
          setIsGenerating(false);
          return;
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
            {selectedModel === 'nano_banana_pro' && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Resolution
                </label>
                <div className="flex gap-2">
                  {(['1K', '2K', '4K'] as const).map((resolution) => (
                    <Button
                      key={resolution}
                      type="button"
                      variant={nanoBananaResolution === resolution ? 'default' : 'outline'}
                      onClick={() => setNanoBananaResolution(resolution)}
                    >
                      {resolution}
                    </Button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Higher resolutions increase cost and generation time.
                </p>
              </div>
            )}
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
