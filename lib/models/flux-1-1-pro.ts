import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface Flux11ProInput extends ModelInput {
  prompt: string;
  image_prompt?: string;
  aspect_ratio?: string;
  width?: number;
  height?: number;
  safety_tolerance?: number;
  seed?: number;
  prompt_upsampling?: boolean;
  output_format?: string;
  output_quality?: number;
}

export class Flux11ProModel extends BaseModel {
  readonly key = 'flux_1_1_pro';
  readonly replicateModelPath = 'black-forest-labs/flux-1.1-pro';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // Supports image_prompt for Flux Redux
    supportsEdit: true, // Can use reference images for composition guidance
  };
  
  readonly metadata: ModelMetadata = {
    name: 'FLUX 1.1 Pro',
    description: 'Faster, better FLUX Pro. Text-to-image model with excellent image quality, prompt adherence, and output diversity.',
    costPerImage: 4, // $0.04
    defaultSize: '1:1',
  };

  validateInput(input: any): Flux11ProInput {
    console.log("\n⚡ FLUX-1.1-PRO INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
    }

    // Validate image_prompt if provided (for Flux Redux)
    let imagePrompt: string | undefined;
    if (input.image_prompt) {
      if (typeof input.image_prompt === 'string') {
        imagePrompt = input.image_prompt;
        console.log("🖼️ Image prompt provided for Flux Redux composition guidance");
      } else {
        console.warn("⚠️ image_prompt must be a string, ignoring invalid value");
      }
    }

    // Validate aspect_ratio
    let aspectRatio = input.aspect_ratio || '1:1';
    const validAspectRatios = [
      '1:1', '16:9', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21', 'custom'
    ];
    if (!validAspectRatios.includes(aspectRatio)) {
      console.warn(`⚠️ Invalid aspect_ratio "${aspectRatio}", defaulting to "1:1"`);
      aspectRatio = '1:1';
    }

    // Validate custom dimensions if aspect_ratio is 'custom'
    let width = input.width;
    let height = input.height;
    if (aspectRatio === 'custom') {
      if (typeof width !== 'number' || width < 256 || width > 1440 || width % 32 !== 0) {
        console.warn(`⚠️ Invalid width "${width}", must be 256-1440px and multiple of 32, defaulting to 1024`);
        width = 1024;
      }
      if (typeof height !== 'number' || height < 256 || height > 1440 || height % 32 !== 0) {
        console.warn(`⚠️ Invalid height "${height}", must be 256-1440px and multiple of 32, defaulting to 1024`);
        height = 1024;
      }
    }

    // Validate safety_tolerance
    let safetyTolerance = input.safety_tolerance;
    if (typeof safetyTolerance === 'number') {
      if (safetyTolerance < 1 || safetyTolerance > 6) {
        console.warn(`⚠️ Invalid safety_tolerance "${safetyTolerance}", must be 1-6, defaulting to 2`);
        safetyTolerance = 2;
      }
    } else if (safetyTolerance !== undefined) {
      console.warn("⚠️ safety_tolerance must be a number, using default value 2");
      safetyTolerance = 2;
    }

    // Validate seed
    let seed = input.seed;
    if (seed !== undefined && (typeof seed !== 'number' || seed < 0)) {
      console.warn(`⚠️ Invalid seed "${seed}", must be a non-negative number, ignoring`);
      seed = undefined;
    }

    // Validate prompt_upsampling
    let promptUpsampling = input.prompt_upsampling;
    if (promptUpsampling !== undefined && typeof promptUpsampling !== 'boolean') {
      console.warn("⚠️ prompt_upsampling must be a boolean, ignoring invalid value");
      promptUpsampling = undefined;
    }

    // Validate output_format
    let outputFormat = input.output_format || 'webp';
    const validFormats = ['webp', 'jpg', 'png'];
    if (!validFormats.includes(outputFormat)) {
      console.warn(`⚠️ Invalid output_format "${outputFormat}", defaulting to "webp"`);
      outputFormat = 'webp';
    }

    // Validate output_quality
    let outputQuality = input.output_quality;
    if (typeof outputQuality === 'number') {
      if (outputQuality < 0 || outputQuality > 100) {
        console.warn(`⚠️ Invalid output_quality "${outputQuality}", must be 0-100, defaulting to 80`);
        outputQuality = 80;
      }
    } else if (outputQuality !== undefined) {
      console.warn("⚠️ output_quality must be a number, using default value 80");
      outputQuality = 80;
    }

    const validated: Flux11ProInput = {
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
    };

    // Only add optional parameters if they have valid values
    if (imagePrompt) {
      validated.image_prompt = imagePrompt;
    }
    
    if (aspectRatio === 'custom') {
      validated.width = width;
      validated.height = height;
    }
    
    if (safetyTolerance !== undefined) {
      validated.safety_tolerance = safetyTolerance;
    }
    
    if (seed !== undefined) {
      validated.seed = seed;
    }
    
    if (promptUpsampling !== undefined) {
      validated.prompt_upsampling = promptUpsampling;
    }
    
    if (outputQuality !== undefined) {
      validated.output_quality = outputQuality;
    }
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    return validated;
  }

  transformInput(input: Flux11ProInput): Record<string, any> {
    console.log("\n🔄 FLUX-1.1-PRO INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio,
      output_format: input.output_format,
    };

    // Only include parameters that have values
    if (input.image_prompt) {
      transformed.image_prompt = input.image_prompt;
      console.log("🖼️ Including image prompt for Flux Redux");
    }

    if (input.width !== undefined) {
      transformed.width = input.width;
      console.log("↔️ Custom width:", input.width);
    }

    if (input.height !== undefined) {
      transformed.height = input.height;
      console.log("↕️ Custom height:", input.height);
    }

    if (input.safety_tolerance !== undefined) {
      transformed.safety_tolerance = input.safety_tolerance;
      console.log("🛡️ Safety tolerance:", input.safety_tolerance);
    }

    if (input.seed !== undefined) {
      transformed.seed = input.seed;
      console.log("🌱 Seed:", input.seed);
    }

    if (input.prompt_upsampling !== undefined) {
      transformed.prompt_upsampling = input.prompt_upsampling;
      console.log("✨ Prompt upsampling:", input.prompt_upsampling);
    }

    if (input.output_quality !== undefined) {
      transformed.output_quality = input.output_quality;
      console.log("🎨 Output quality:", input.output_quality);
    }

    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    return transformed;
  }
}