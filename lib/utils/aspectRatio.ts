import { AspectRatio } from "@/store/useSessionStore";
import { ModelKey } from "@/lib/models";

export function getAspectRatioForModel(ratio: AspectRatio, _modelKey: ModelKey): string {
  // Map our simple aspect ratio types to model-specific formats
  const ratioMap: Record<AspectRatio, string> = {
    square: '1:1',
    landscape: '16:9',
    portrait: '9:16'
  };

  return ratioMap[ratio];
}

export function getCustomDimensionsForModel(
  _ratio: AspectRatio,
  _modelKey: ModelKey
): { width?: number; height?: number } {
  // Remaining models rely on aspect_ratio parameter only.
  return {};
}
