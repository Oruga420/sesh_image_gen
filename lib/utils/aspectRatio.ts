import { AspectRatio } from "@/store/useSessionStore";
import { ModelKey } from "@/lib/models";

export function getAspectRatioForModel(ratio: AspectRatio, modelKey: ModelKey): string {
  // Map our simple aspect ratio types to model-specific formats
  const ratioMap: Record<AspectRatio, string> = {
    square: '1:1',
    landscape: '16:9',
    portrait: '9:16'
  };

  return ratioMap[ratio];
}

export function getCustomDimensionsForModel(ratio: AspectRatio, modelKey: ModelKey): { width?: number; height?: number } {
  // Return custom dimensions if the model supports it
  // Most models use aspect_ratio, but some might need width/height

  if (modelKey === 'flux_1_1_pro') {
    // FLUX 1.1 Pro can use custom dimensions, let's provide optimized ones
    const dimensionsMap: Record<AspectRatio, { width: number; height: number }> = {
      square: { width: 1024, height: 1024 },
      landscape: { width: 1344, height: 768 },
      portrait: { width: 768, height: 1344 }
    };

    return dimensionsMap[ratio];
  }

  if (modelKey === 'proteus_v0_3') {
    // Proteus v0.3 uses width/height parameters (recommended 1024 or 1280)
    const dimensionsMap: Record<AspectRatio, { width: number; height: number }> = {
      square: { width: 1024, height: 1024 },
      landscape: { width: 1280, height: 1024 },
      portrait: { width: 1024, height: 1280 }
    };

    return dimensionsMap[ratio];
  }

  // Other models typically use aspect_ratio parameter
  return {};
}
