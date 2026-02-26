import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

type ResolutionOption = '1K' | '2K' | '4K';
type OutputFormatOption = 'jpg' | 'png';
type AspectRatioOption =
  | 'match_input_image'
  | '1:1'
  | '2:3'
  | '3:2'
  | '3:4'
  | '4:3'
  | '4:5'
  | '5:4'
  | '9:16'
  | '16:9'
  | '21:9';
type SafetyFilterOption =
  | 'block_low_and_above'
  | 'block_medium_and_above'
  | 'block_only_high';

interface NanoBananaProInput extends ModelInput {
  prompt: string;
  image_input?: string[];
  resolution?: ResolutionOption;
  aspect_ratio?: AspectRatioOption;
  output_format?: OutputFormatOption;
  safety_filter_level?: SafetyFilterOption;
}

export class NanoBananaProModel extends BaseModel {
  readonly key = 'nano_banana_pro';
  readonly replicateModelPath = 'google/nano-banana-pro';

  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true,
    supportsEdit: true,
  };

  readonly metadata: ModelMetadata = {
    name: 'Nano Banana Pro',
    description:
      "Google's Gemini 3 Pro-powered text-to-image and editing model with high fidelity text rendering",
    costPerImage: 14, // $0.14 for default 2K generations
    defaultSize: '1K',
  };

  validateInput(input: any): NanoBananaProInput {
    if (!input?.prompt || typeof input.prompt !== 'string') {
      throw new Error('prompt is required and must be a string');
    }

    let imageInput: string[] = [];
    if (Array.isArray(input.image_input)) {
      imageInput = input.image_input.filter(
        (url: unknown) => typeof url === 'string' && url.trim().length > 0
      );
      if (imageInput.length > 14) {
        imageInput = imageInput.slice(0, 14);
      }
    } else if (typeof input.image_input === 'string') {
      imageInput = [input.image_input];
    }

    const validResolutions: ResolutionOption[] = ['1K', '2K', '4K'];
    const resolution: ResolutionOption =
      validResolutions.includes(input.resolution) ? input.resolution : '1K';

    const validAspectRatios: AspectRatioOption[] = [
      'match_input_image',
      '1:1',
      '2:3',
      '3:2',
      '3:4',
      '4:3',
      '4:5',
      '5:4',
      '9:16',
      '16:9',
      '21:9',
    ];
    const aspectRatio: AspectRatioOption | undefined =
      typeof input.aspect_ratio === 'string' &&
        validAspectRatios.includes(input.aspect_ratio)
        ? input.aspect_ratio
        : undefined;

    const validFormats: OutputFormatOption[] = ['jpg', 'png'];
    const outputFormat: OutputFormatOption =
      typeof input.output_format === 'string' &&
        validFormats.includes(input.output_format)
        ? input.output_format
        : 'jpg';

    const validSafetyFilters: SafetyFilterOption[] = [
      'block_low_and_above',
      'block_medium_and_above',
      'block_only_high',
    ];
    const safetyFilter: SafetyFilterOption | undefined =
      typeof input.safety_filter_level === 'string' &&
        validSafetyFilters.includes(input.safety_filter_level)
        ? input.safety_filter_level
        : undefined;

    const validated: NanoBananaProInput = {
      prompt: input.prompt,
      resolution,
      output_format: outputFormat,
    };

    if (safetyFilter) {
      validated.safety_filter_level = safetyFilter;
    }

    if (imageInput.length > 0) {
      validated.image_input = imageInput;
    }

    if (aspectRatio) {
      validated.aspect_ratio = aspectRatio;
    }

    return validated;
  }

  transformInput(input: NanoBananaProInput): Record<string, any> {
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      resolution: input.resolution ?? '1K',
      output_format: input.output_format ?? 'jpg',
    };

    if (input.safety_filter_level) {
      transformed.safety_filter_level = input.safety_filter_level;
    }

    if (input.image_input && input.image_input.length > 0) {
      transformed.image_input = input.image_input;
    }

    if (input.aspect_ratio) {
      transformed.aspect_ratio = input.aspect_ratio;
    }

    return transformed;
  }
}
