import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface Flux11ProUltraInput extends ModelInput {
  prompt: string;
  image_prompt?: string;
  image_prompt_strength?: number;
  aspect_ratio?: string;
  safety_tolerance?: number;
  seed?: number;
  raw?: boolean;
  output_format?: string;
}

export class Flux11ProUltraModel extends BaseModel {
  readonly key = 'flux_1_1_pro_ultra';
  readonly replicateModelPath = 'black-forest-labs/flux-1.1-pro-ultra';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // Supports image_prompt with Flux Redux
    supportsEdit: true, // Can use reference images for composition guidance
  };
  
  readonly metadata: ModelMetadata = {
    name: 'FLUX 1.1 Pro Ultra',
    description: 'Ultra high-resolution FLUX model (up to 4MP) with raw mode for authentic photography. 2.5x faster than comparable high-res models.',
    costPerImage: 6, // $0.06
    defaultSize: '1:1',
  };

  validateInput(input: any): Flux11ProUltraInput {
    console.log("\n⚡ FLUX-1.1-PRO-ULTRA INPUT VALIDATION:");
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

    // Validate image_prompt_strength
    let imagePromptStrength = input.image_prompt_strength;
    if (imagePromptStrength !== undefined) {
      if (typeof imagePromptStrength === 'number') {
        if (imagePromptStrength < 0 || imagePromptStrength > 1.0) {
          console.warn(`⚠️ Invalid image_prompt_strength "${imagePromptStrength}", must be 0-1.0, defaulting to 0.1`);
          imagePromptStrength = 0.1;
        }
      } else {
        console.warn("⚠️ image_prompt_strength must be a number, using default value 0.1");
        imagePromptStrength = 0.1;
      }
    }

    // Validate aspect_ratio
    let aspectRatio = input.aspect_ratio || '1:1';
    const validAspectRatios = [
      '1:1', '16:9', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21'
    ];
    if (!validAspectRatios.includes(aspectRatio)) {
      console.warn(`⚠️ Invalid aspect_ratio "${aspectRatio}", defaulting to "1:1"`);
      aspectRatio = '1:1';
    }

    // Validate safety_tolerance
    let safetyTolerance = input.safety_tolerance;
    if (safetyTolerance !== undefined) {
      if (typeof safetyTolerance === 'number') {
        if (safetyTolerance < 1 || safetyTolerance > 6) {
          console.warn(`⚠️ Invalid safety_tolerance "${safetyTolerance}", must be 1-6, defaulting to 2`);
          safetyTolerance = 2;
        }
      } else {
        console.warn("⚠️ safety_tolerance must be a number, using default value 2");
        safetyTolerance = 2;
      }
    }

    // Validate seed
    let seed = input.seed;
    if (seed !== undefined && (typeof seed !== 'number' || seed < 0)) {
      console.warn(`⚠️ Invalid seed "${seed}", must be a non-negative number, ignoring`);
      seed = undefined;
    }

    // Validate raw mode
    let raw = input.raw;
    if (raw !== undefined && typeof raw !== 'boolean') {
      console.warn("⚠️ raw must be a boolean, ignoring invalid value");
      raw = undefined;
    }

    // Validate output_format
    let outputFormat = input.output_format || 'jpg';
    const validFormats = ['jpg', 'png', 'webp'];
    if (!validFormats.includes(outputFormat)) {
      console.warn(`⚠️ Invalid output_format "${outputFormat}", defaulting to "jpg"`);
      outputFormat = 'jpg';
    }

    const validated: Flux11ProUltraInput = {
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
    };

    // Only add optional parameters if they have valid values
    if (imagePrompt) {
      validated.image_prompt = imagePrompt;
    }
    
    if (imagePromptStrength !== undefined) {
      validated.image_prompt_strength = imagePromptStrength;
    }
    
    if (safetyTolerance !== undefined) {
      validated.safety_tolerance = safetyTolerance;
    }
    
    if (seed !== undefined) {
      validated.seed = seed;
    }
    
    if (raw !== undefined) {
      validated.raw = raw;
      console.log("📸 Raw mode enabled for natural photography aesthetic");
    }
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    return validated;
  }

  transformInput(input: Flux11ProUltraInput): Record<string, any> {
    console.log("\n🔄 FLUX-1.1-PRO-ULTRA INPUT TRANSFORMATION:");
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

    if (input.image_prompt_strength !== undefined) {
      transformed.image_prompt_strength = input.image_prompt_strength;
      console.log("💪 Image prompt strength:", input.image_prompt_strength);
    }

    if (input.safety_tolerance !== undefined) {
      transformed.safety_tolerance = input.safety_tolerance;
      console.log("🛡️ Safety tolerance:", input.safety_tolerance);
    }

    if (input.seed !== undefined) {
      transformed.seed = input.seed;
      console.log("🌱 Seed:", input.seed);
    }

    if (input.raw !== undefined) {
      transformed.raw = input.raw;
      console.log("📸 Raw mode:", input.raw ? "enabled (natural photography)" : "disabled (processed)");
    }

    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    return transformed;
  }
}