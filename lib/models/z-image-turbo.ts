import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

const VALID_OUTPUT_FORMATS = ['jpg', 'png'] as const;

type OutputFormat = (typeof VALID_OUTPUT_FORMATS)[number];

interface ZImageTurboInput extends ModelInput {
  prompt: string;
  width: number;
  height: number;
  seed?: number;
  output_format?: OutputFormat;
  output_quality?: number;
  num_inference_steps?: number;
}

function clampInt(value: unknown, min: number, max: number): number | undefined {
  if (typeof value !== 'number' || !Number.isFinite(value)) return undefined;
  const int = Math.floor(value);
  return Math.max(min, Math.min(max, int));
}

function resolveDimensions(input: any): { width: number; height: number } {
  const width = clampInt(input.width, 64, 1440);
  const height = clampInt(input.height, 64, 1440);

  if (width && height) {
    return { width, height };
  }

  const aspectRatio = typeof input.aspect_ratio === 'string' ? input.aspect_ratio : '1:1';

  const baseWidth = 1024;
  const ratioMap: Record<string, number> = {
    '1:1': 1,
    '16:9': 16 / 9,
    '9:16': 9 / 16,
    '21:9': 21 / 9,
    '9:21': 9 / 21,
    '2:3': 2 / 3,
    '3:2': 3 / 2,
    '3:4': 3 / 4,
    '4:3': 4 / 3,
    '4:5': 4 / 5,
    '5:4': 5 / 4,
  };

  const ratio = ratioMap[aspectRatio] ?? 1;
  const computedHeight = Math.round(baseWidth / ratio);

  return {
    width: clampInt(baseWidth, 64, 1440) ?? 1024,
    height: clampInt(computedHeight, 64, 1440) ?? 1024,
  };
}

export class ZImageTurboModel extends BaseModel {
  readonly key = 'z_image_turbo';
  readonly replicateModelPath = 'prunaai/z-image-turbo';

  readonly capabilities: ModelCapabilities = {
    supportsImageRef: false,
    supportsEdit: false,
  };

  readonly metadata: ModelMetadata = {
    name: 'Z-Image Turbo',
    description: 'A fast 6B-parameter text-to-image model developed by Tongyi-MAI.',
    costPerImage: 2, // $0.02 (adjust if pricing differs)
    defaultSize: '1024x1024',
  };

  validateInput(input: any): ZImageTurboInput {
    if (!input?.prompt || typeof input.prompt !== 'string') {
      throw new Error('prompt is required and must be a string');
    }

    const { width, height } = resolveDimensions(input);

    let seed = clampInt(input.seed, 0, Number.MAX_SAFE_INTEGER);
    if (seed !== undefined && !Number.isSafeInteger(seed)) {
      seed = undefined;
    }

    let outputFormat: OutputFormat = 'jpg';
    if (typeof input.output_format === 'string') {
      const normalized = input.output_format.toLowerCase();
      if ((VALID_OUTPUT_FORMATS as readonly string[]).includes(normalized)) {
        outputFormat = normalized as OutputFormat;
      }
    }

    const outputQuality = clampInt(input.output_quality, 0, 100) ?? 80;
    const numInferenceSteps = clampInt(input.num_inference_steps, 1, 50) ?? 8;

    const validated: ZImageTurboInput = {
      prompt: input.prompt,
      width,
      height,
      output_format: outputFormat,
      output_quality: outputQuality,
      num_inference_steps: numInferenceSteps,
    };

    if (seed !== undefined) validated.seed = seed;

    return validated;
  }

  transformInput(input: ZImageTurboInput): Record<string, any> {
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      width: input.width,
      height: input.height,
      output_format: input.output_format ?? 'jpg',
      output_quality: input.output_quality ?? 80,
      num_inference_steps: input.num_inference_steps ?? 8,
      guidance_scale: 0,
    };

    if (input.seed !== undefined) transformed.seed = input.seed;

    return transformed;
  }
}

