'use client';

import { useEffect, useState } from "react";
import { useSessionStore, type AspectRatio } from "@/store/useSessionStore";
import { MODELS, ModelKey } from "@/lib/models";
import { getAspectRatioForModel, getCustomDimensionsForModel } from "@/lib/utils/aspectRatio";
import { extractImageUrlFromReplicateOutput } from "@/lib/utils/replicateOutput";
import { Button } from "@/components/ui/button";
import ModelSelect from "@/components/ImageGen/ModelSelect";
import PromptBox from "@/components/ImageGen/PromptBox";
import AspectRatioSelector from "@/components/ImageGen/AspectRatioSelector";
import ImageCountSelector from "@/components/ImageGen/ImageCountSelector";
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
    addGeneratedImage,
    imagesToGenerate,
  } = useSessionStore();
  
  const [error, setError] = useState<string>("");
  const [nanoBananaResolution, setNanoBananaResolution] = useState<'1K' | '2K' | '4K'>('1K');

  useEffect(() => {
    if (selectedModel !== 'nano_banana_pro') {
      setNanoBananaResolution('1K');
    }
  }, [selectedModel]);

  const generationLabel = imagesToGenerate > 1 ? `${imagesToGenerate} Images` : "Image";
  const generationLabelLower = imagesToGenerate > 1 ? `${imagesToGenerate} images` : "image";

  const handleGenerate = async () => {
    const promptSnapshot = currentPrompt.trim();

    if (!promptSnapshot) {
      setError("Please enter a prompt");
      return;
    }

    const modelKeySnapshot = selectedModel;
    const imagesRequested = Math.max(1, Math.min(5, imagesToGenerate));
    const referenceImagesSnapshot = [...referenceImages];
    const aspectRatioSnapshot = aspectRatio;
    const nanoBananaResolutionSnapshot = nanoBananaResolution;

    setError("");
    setIsGenerating(true);

    try {
      const model = MODELS[modelKeySnapshot];

      if (model.provider === 'openai') {
        await handleOpenAIGenerate(model, {
          prompt: promptSnapshot,
          modelKey: modelKeySnapshot,
          imagesRequested,
          referenceImages: referenceImagesSnapshot,
        });
      } else if (model.provider === 'replicate') {
        await handleReplicateGenerate(model, {
          prompt: promptSnapshot,
          modelKey: modelKeySnapshot,
          imagesRequested,
          aspectRatio: aspectRatioSnapshot,
          referenceImages: referenceImagesSnapshot,
          nanoBananaResolution: nanoBananaResolutionSnapshot,
        });
      } else {
        throw new Error('Unsupported model provider');
      }
    } catch (error) {
      console.error('Generation error:', error);
      setError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleOpenAIGenerate = async (
    model: typeof MODELS[ModelKey],
    {
      prompt,
      modelKey,
      imagesRequested,
      referenceImages,
    }: {
      prompt: string;
      modelKey: ModelKey;
      imagesRequested: number;
      referenceImages: string[];
    }
  ) => {
    const input: Record<string, any> = {
      prompt,
      imageCount: imagesRequested,
    };

    if (model.supportsImageRef && referenceImages.length > 0) {
      input.image_input = referenceImages;
    }

    const response = await fetch('/api/openai/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        modelKey,
        input,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result = await response.json();

    if (result.error) {
      throw new Error(result.error);
    }

    const baseTimestamp = Date.now();
    (result.images || []).forEach((img: any, index: number) => {
      if (!img?.b64_json) {
        return;
      }

      addGeneratedImage({
        id: `${baseTimestamp}-${modelKey}-${index}`,
        url: `data:image/png;base64,${img.b64_json}`,
        prompt,
        modelKey,
        timestamp: baseTimestamp + index,
        revisedPrompt: img.revised_prompt,
      });
    });
  };

    const handleReplicateGenerate = async (
    model: typeof MODELS[ModelKey],
    {
      prompt,
      modelKey,
      imagesRequested,
      aspectRatio,
      referenceImages,
      nanoBananaResolution,
    }: {
      prompt: string;
      modelKey: ModelKey;
      imagesRequested: number;
      aspectRatio: AspectRatio;
      referenceImages: string[];
      nanoBananaResolution: '1K' | '2K' | '4K';
    }
  ) => {
    console.log('dYs? Starting Replicate generation for model:', modelKey, 'count:', imagesRequested);

    const input: Record<string, any> = { prompt };

    const aspectRatioValue = getAspectRatioForModel(aspectRatio, modelKey);
    const customDimensions = getCustomDimensionsForModel(aspectRatio, modelKey);
    console.log('dY"? Aspect ratio:', aspectRatio, 'Value:', aspectRatioValue, 'Dimensions:', customDimensions);

    if (customDimensions.width && customDimensions.height) {
      input.width = customDimensions.width;
      input.height = customDimensions.height;
    } else {
      input.aspect_ratio = aspectRatioValue;
    }

    if (modelKey === 'nano_banana_pro') {
      input.resolution = nanoBananaResolution;
    }

    if (model.supportsImageRef && referenceImages.length > 0) {
      if (
        modelKey === 'nano_banana' ||
        modelKey === 'nano_banana_pro' ||
        modelKey === 'seedream4'
      ) {
        input.image_input = referenceImages;
      } else if (modelKey === 'flux_2_pro') {
        input.input_images = referenceImages.slice(0, 8);
      } else if (modelKey === 'flux_1_1_pro_ultra') {
        input.image_prompt = referenceImages[0];
      }
    }

    const launchPrediction = async (requestIndex: number) => {
      console.log(`dY"? Creating prediction ${requestIndex + 1}/${imagesRequested} for`, modelKey);
      const response = await fetch('/api/replicate/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelKey,
          input: { ...input },
        }),
      });

      console.log('dY"? Prediction response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('??O Prediction request failed:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const prediction = await response.json();
      console.log('?o. Prediction created:', prediction);

      if (prediction.error) {
        throw new Error(prediction.error);
      }

      await pollPrediction(prediction.id, { prompt, modelKey });
    };

    const predictionPromises = Array.from({ length: imagesRequested }, (_, index) =>
      launchPrediction(index)
    );

    const results = await Promise.allSettled(predictionPromises);
    const failures = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );

    if (failures.length === predictionPromises.length) {
      throw failures[0]?.reason || new Error('All Replicate generations failed.');
    }

    if (failures.length > 0) {
      const failureMessage = `${failures.length} of ${imagesRequested} image${
        imagesRequested === 1 ? '' : 's'
      } failed. Please try again if you need more.`;
      setError(failureMessage);
    }
  };
  
  const pollPrediction = (
    predictionId: string,
    {
      prompt,
      modelKey,
    }: {
      prompt: string;
      modelKey: ModelKey;
    }
  ): Promise<void> => {
    const startTime = Date.now();
    const maxWaitTime = 10 * 60 * 1000;
    let pollCount = 0;

    return new Promise((resolve, reject) => {
      const poll = async () => {
        try {
          pollCount++;
          const elapsed = Date.now() - startTime;

          if (elapsed > maxWaitTime) {
            throw new Error(
              'Generation timed out after 10 minutes. The model may be overloaded or the request may be too complex.'
            );
          }

          const response = await fetch(`/api/replicate/status/${predictionId}`);

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const prediction = await response.json();
          console.log(`Poll ${pollCount} for ${predictionId}: ${prediction.status}`, prediction);

          if (prediction.error) {
            throw new Error(prediction.error);
          }

          if (prediction.status === 'succeeded') {
            const responseUrls: string[] = Array.isArray(prediction.imageUrls)
              ? prediction.imageUrls.filter((url: unknown): url is string => typeof url === 'string')
              : [];
            const fallbackUrl =
              (typeof prediction.imageUrl === 'string' && prediction.imageUrl.trim()) ||
              extractImageUrlFromReplicateOutput(prediction.output);

            if (fallbackUrl) {
              responseUrls.unshift(fallbackUrl);
            }

            const uniqueUrls = Array.from(
              new Set(
                responseUrls
                  .map((url) => url?.trim())
                  .filter((url): url is string => Boolean(url && url.length))
              )
            );

            if (uniqueUrls.length === 0) {
              throw new Error(
                'Generation succeeded but did not return an image URL. Please try again.'
              );
            }

            console.log('Replicate generation succeeded. Image URLs:', uniqueUrls);

            const timestampBase = Date.now();
            uniqueUrls.forEach((url, index) => {
              addGeneratedImage({
                id: `${predictionId}-${timestampBase}-${index}`,
                url,
                prompt,
                modelKey,
                timestamp: timestampBase + index,
                predictionId,
              });
            });

            resolve();
            return;
          } else if (prediction.status === 'failed') {
            throw new Error(`Generation failed: ${prediction.error || 'Unknown error'}`);
          } else if (prediction.status === 'canceled') {
            throw new Error('Generation was canceled');
          } else {
            const delay = pollCount > 30 ? 5000 : 2000;
            setTimeout(poll, delay);
          }
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Unknown error occurred'));
        }
      };

      setTimeout(poll, 1000);
    });
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
            <ImageCountSelector />
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
              {isGenerating
                ? `Generating ${generationLabelLower}...`
                : `Generate ${generationLabel}`}
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
