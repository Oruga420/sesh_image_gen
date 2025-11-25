import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

const VALID_ASPECT_RATIOS = [
  '1:1',
  '16:9',
  '9:16',
  '2:3',
  '3:2',
  '3:4',
  '4:3',
  '4:5',
  '5:4',
  '21:9',
  'match_input_image',
  'custom',
];

const VALID_RESOLUTIONS = ['0.5 MP', '1 MP', '2 MP', '4 MP'];
const VALID_OUTPUT_FORMATS = ['jpg', 'png', 'webp'];

interface Flux2ProInput extends ModelInput {
  prompt: string;
  aspect_ratio?: string;
  resolution?: string;
  input_images?: string[];
  seed?: number;
  width?: number;
  height?: number;
  output_format?: string;
  output_quality?: number;
  safety_tolerance?: number;
  prompt_upsampling?: boolean;
}

export class Flux2ProModel extends BaseModel {
  readonly key = 'flux_2_pro';
  readonly replicateModelPath = 'black-forest-labs/flux-2-pro';

  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // up to eight reference images
    supportsEdit: true,
  };

  readonly metadata: ModelMetadata = {
    name: 'FLUX 2 Pro',
    description: 'High quality text-to-image & image-editing model from Black Forest Labs with support for eight reference images.',
    costPerImage: 12, // $0.12 (approx, adjust if official pricing differs)
    defaultSize: '1 MP',
  };

  validateInput(input: any): Flux2ProInput {
    console.log('\n🧪 FLUX-2-PRO INPUT VALIDATION:');
    console.log('Raw input:', JSON.stringify(input, null, 2));

    if (!input?.prompt || typeof input.prompt !== 'string') {
      throw new Error('prompt is required and must be a string');
    }

    let aspectRatio: string | undefined = input.aspect_ratio;
    if (aspectRatio && !VALID_ASPECT_RATIOS.includes(aspectRatio)) {
      console.warn(`⚠️ Invalid aspect_ratio "${aspectRatio}", defaulting to 1:1`);
      aspectRatio = '1:1';
    }

    let resolution: string | undefined = input.resolution;
    if (resolution && !VALID_RESOLUTIONS.includes(resolution)) {
      console.warn(`⚠️ Invalid resolution "${resolution}", defaulting to 1 MP`);
      resolution = '1 MP';
    }

    let seed: number | undefined = input.seed;
    if (seed !== undefined) {
      if (typeof seed !== 'number' || !Number.isFinite(seed)) {
        console.warn('⚠️ seed must be a finite number, ignoring value');
        seed = undefined;
      }
    }

    let width: number | undefined = input.width;
    let height: number | undefined = input.height;
    if (width !== undefined) {
      if (typeof width !== 'number' || width < 256 || width > 2048) {
        console.warn('⚠️ width must be between 256 and 2048, ignoring value');
        width = undefined;
      } else {
        width = Math.round(width / 32) * 32;
      }
    }
    if (height !== undefined) {
      if (typeof height !== 'number' || height < 256 || height > 2048) {
        console.warn('⚠️ height must be between 256 and 2048, ignoring value');
        height = undefined;
      } else {
        height = Math.round(height / 32) * 32;
      }
    }

    let outputFormat: string | undefined = input.output_format;
    if (outputFormat && !VALID_OUTPUT_FORMATS.includes(outputFormat)) {
      console.warn(`⚠️ Invalid output_format "${outputFormat}", defaulting to webp`);
      outputFormat = 'webp';
    }

    let outputQuality: number | undefined = input.output_quality;
    if (outputQuality !== undefined) {
      if (typeof outputQuality !== 'number' || outputQuality < 0 || outputQuality > 100) {
        console.warn('⚠️ output_quality must be between 0 and 100, defaulting to 80');
        outputQuality = 80;
      }
    }

    let safetyTolerance: number | undefined = input.safety_tolerance;
    if (safetyTolerance !== undefined) {
      if (typeof safetyTolerance !== 'number' || safetyTolerance < 1 || safetyTolerance > 6) {
        console.warn('⚠️ safety_tolerance must be between 1 and 6, defaulting to 2');
        safetyTolerance = 2;
      }
    }

    let promptUpsampling: boolean | undefined = input.prompt_upsampling;
    if (promptUpsampling !== undefined && typeof promptUpsampling !== 'boolean') {
      console.warn('⚠️ prompt_upsampling must be boolean, ignoring value');
      promptUpsampling = undefined;
    }

    let inputImages: string[] | undefined;
    if (Array.isArray(input.input_images)) {
      const filtered = input.input_images
        .filter((img: unknown) => typeof img === 'string' && img.trim().length > 0)
        .slice(0, 8);
      if (filtered.length > 0) {
        inputImages = filtered;
      }
    }

    const validated: Flux2ProInput = {
      prompt: input.prompt,
    };

    if (aspectRatio) validated.aspect_ratio = aspectRatio;
    if (resolution) validated.resolution = resolution;
    if (seed !== undefined) validated.seed = seed;
    if (width !== undefined) validated.width = width;
    if (height !== undefined) validated.height = height;
    if (outputFormat) validated.output_format = outputFormat;
    if (outputQuality !== undefined) validated.output_quality = outputQuality;
    if (safetyTolerance !== undefined) validated.safety_tolerance = safetyTolerance;
    if (promptUpsampling !== undefined) validated.prompt_upsampling = promptUpsampling;
    if (inputImages) validated.input_images = inputImages;

    console.log('✅ Validated input:', JSON.stringify(validated, null, 2));
    return validated;
  }

  transformInput(input: Flux2ProInput): Record<string, any> {
    const transformed: Record<string, any> = {
      prompt: input.prompt,
    };

    if (input.aspect_ratio) transformed.aspect_ratio = input.aspect_ratio;
    if (input.resolution) transformed.resolution = input.resolution;
    if (input.seed !== undefined) transformed.seed = input.seed;
    if (input.width !== undefined) transformed.width = input.width;
    if (input.height !== undefined) transformed.height = input.height;
    if (input.output_format) transformed.output_format = input.output_format;
    if (input.output_quality !== undefined) transformed.output_quality = input.output_quality;
    if (input.safety_tolerance !== undefined) transformed.safety_tolerance = input.safety_tolerance;
    if (input.prompt_upsampling !== undefined) transformed.prompt_upsampling = input.prompt_upsampling;
    if (input.input_images) transformed.input_images = input.input_images;

    console.log('🚀 Transformed FLUX-2-PRO input:', JSON.stringify(transformed, null, 2));
    return transformed;
  }
}
