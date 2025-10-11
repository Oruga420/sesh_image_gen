import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface QwenImageInput extends ModelInput {
  prompt: string;
  image?: string;
  strength?: number;
  enhance_prompt?: boolean;
  negative_prompt?: string;
  aspect_ratio?: string;
  image_size?: string;
  num_inference_steps?: number;
  guidance?: number;
  seed?: number;
  go_fast?: boolean;
  lora_weights?: string;
  lora_scale?: number;
  output_format?: string;
  output_quality?: number;
  disable_safety_checker?: boolean;
}

export class QwenImageModel extends BaseModel {
  readonly key = 'qwen_image';
  readonly replicateModelPath = 'qwen/qwen-image';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // Supports image parameter for img2img
    supportsEdit: true, // Supports image editing with strength parameter
  };
  
  readonly metadata: ModelMetadata = {
    name: 'Qwen Image',
    description: 'An image generation foundation model in the Qwen series that achieves significant advances in complex text rendering, especially Chinese text.',
    costPerImage: 2.5, // $0.025
    defaultSize: '16:9',
  };

  validateInput(input: any): QwenImageInput {
    console.log("\n🎨 QWEN-IMAGE INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
    }

    // Validate image parameter for img2img pipeline
    let image = input.image;
    if (image !== undefined && typeof image !== 'string') {
      console.warn("⚠️ image must be a string URL, ignoring invalid value");
      image = undefined;
    }
    if (image) {
      console.log("🖼️ Image provided for img2img pipeline");
    }

    // Validate strength for img2img pipeline (0-1, default 0.9)
    let strength = input.strength;
    if (strength !== undefined) {
      if (typeof strength !== 'number' || strength < 0 || strength > 1) {
        console.warn(`⚠️ Invalid strength "${strength}", must be 0-1, defaulting to 0.9`);
        strength = 0.9;
      }
    } else if (image) {
      strength = 0.9; // Default for img2img
      console.log("💪 Using default strength 0.9 for img2img");
    }

    // Validate enhance_prompt
    let enhancePrompt = input.enhance_prompt;
    if (enhancePrompt !== undefined && typeof enhancePrompt !== 'boolean') {
      console.warn("⚠️ enhance_prompt must be a boolean, ignoring invalid value");
      enhancePrompt = undefined;
    }

    // Validate negative_prompt
    let negativePrompt = input.negative_prompt;
    if (negativePrompt !== undefined && typeof negativePrompt !== 'string') {
      console.warn("⚠️ negative_prompt must be a string, ignoring invalid value");
      negativePrompt = undefined;
    }
    if (!negativePrompt) {
      negativePrompt = " "; // Default from documentation
    }

    // Validate aspect_ratio
    let aspectRatio = input.aspect_ratio || '16:9';
    const validAspectRatios = [
      '1:1', '16:9', '9:16', '21:9', '9:21', '2:3', '3:2', '4:5', '5:4'
    ];
    if (!validAspectRatios.includes(aspectRatio)) {
      console.warn(`⚠️ Invalid aspect_ratio "${aspectRatio}", defaulting to "16:9"`);
      aspectRatio = '16:9';
    }

    // Validate image_size
    let imageSize = input.image_size || 'optimize_for_quality';
    if (typeof imageSize !== 'string') {
      console.warn("⚠️ image_size must be a string, defaulting to 'optimize_for_quality'");
      imageSize = 'optimize_for_quality';
    }

    // Validate num_inference_steps (1-50, default 30)
    let numInferenceSteps = input.num_inference_steps || 30;
    if (typeof numInferenceSteps !== 'number' || numInferenceSteps < 1 || numInferenceSteps > 50) {
      console.warn(`⚠️ Invalid num_inference_steps "${numInferenceSteps}", must be 1-50, defaulting to 30`);
      numInferenceSteps = 30;
    }

    // Validate guidance (max 10, default 3)
    let guidance = input.guidance || 3;
    if (typeof guidance !== 'number' || guidance < 0 || guidance > 10) {
      console.warn(`⚠️ Invalid guidance "${guidance}", must be 0-10, defaulting to 3`);
      guidance = 3;
    }

    // Validate seed
    let seed = input.seed;
    if (seed !== undefined && (typeof seed !== 'number' || seed < 0 || !Number.isInteger(seed))) {
      console.warn(`⚠️ Invalid seed "${seed}", must be a non-negative integer, ignoring`);
      seed = undefined;
    }

    // Validate go_fast
    let goFast = input.go_fast;
    if (goFast !== undefined && typeof goFast !== 'boolean') {
      console.warn("⚠️ go_fast must be a boolean, defaulting to true");
      goFast = true;
    }
    if (goFast === undefined) {
      goFast = true; // Default from documentation
    }

    // Validate lora_weights
    let loraWeights = input.lora_weights;
    if (loraWeights !== undefined && typeof loraWeights !== 'string') {
      console.warn("⚠️ lora_weights must be a string, ignoring invalid value");
      loraWeights = undefined;
    }

    // Validate lora_scale (default 1)
    let loraScale = input.lora_scale;
    if (loraScale !== undefined) {
      if (typeof loraScale !== 'number') {
        console.warn(`⚠️ Invalid lora_scale "${loraScale}", must be a number, defaulting to 1`);
        loraScale = 1;
      }
    } else if (loraWeights) {
      loraScale = 1; // Default when lora_weights is provided
    }

    // Validate output_format
    let outputFormat = input.output_format || 'webp';
    const validFormats = ['webp', 'jpg', 'png'];
    if (!validFormats.includes(outputFormat)) {
      console.warn(`⚠️ Invalid output_format "${outputFormat}", defaulting to "webp"`);
      outputFormat = 'webp';
    }

    // Validate output_quality (0-100, default 80)
    let outputQuality = input.output_quality || 80;
    if (typeof outputQuality !== 'number' || outputQuality < 0 || outputQuality > 100 || !Number.isInteger(outputQuality)) {
      console.warn(`⚠️ Invalid output_quality "${outputQuality}", must be an integer 0-100, defaulting to 80`);
      outputQuality = 80;
    }

    // Validate disable_safety_checker
    let disableSafetyChecker = input.disable_safety_checker;
    if (disableSafetyChecker !== undefined && typeof disableSafetyChecker !== 'boolean') {
      console.warn("⚠️ disable_safety_checker must be a boolean, ignoring invalid value");
      disableSafetyChecker = undefined;
    }

    const validated: QwenImageInput = {
      prompt: input.prompt,
      negative_prompt: negativePrompt,
      aspect_ratio: aspectRatio,
      image_size: imageSize,
      num_inference_steps: numInferenceSteps,
      guidance,
      go_fast: goFast,
      output_format: outputFormat,
      output_quality: outputQuality,
    };

    // Only add optional parameters if they have valid values
    if (image) {
      validated.image = image;
    }
    
    if (strength !== undefined) {
      validated.strength = strength;
    }
    
    if (enhancePrompt !== undefined) {
      validated.enhance_prompt = enhancePrompt;
    }
    
    if (seed !== undefined) {
      validated.seed = seed;
    }
    
    if (loraWeights) {
      validated.lora_weights = loraWeights;
    }
    
    if (loraScale !== undefined) {
      validated.lora_scale = loraScale;
    }
    
    if (disableSafetyChecker !== undefined) {
      validated.disable_safety_checker = disableSafetyChecker;
    }
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    console.log("🈺 Qwen Image excels at complex text rendering, especially Chinese text");
    return validated;
  }

  transformInput(input: QwenImageInput): Record<string, any> {
    console.log("\n🔄 QWEN-IMAGE INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      negative_prompt: input.negative_prompt,
      aspect_ratio: input.aspect_ratio,
      image_size: input.image_size,
      num_inference_steps: input.num_inference_steps,
      guidance: input.guidance,
      go_fast: input.go_fast,
      output_format: input.output_format,
      output_quality: input.output_quality,
    };

    // Only include parameters that have values
    if (input.image) {
      transformed.image = input.image;
      console.log("🖼️ Including image for img2img pipeline");
    }

    if (input.strength !== undefined) {
      transformed.strength = input.strength;
      console.log("💪 Strength for img2img:", input.strength);
    }

    if (input.enhance_prompt !== undefined) {
      transformed.enhance_prompt = input.enhance_prompt;
      console.log("✨ Enhance prompt:", input.enhance_prompt);
    }

    if (input.seed !== undefined) {
      transformed.seed = input.seed;
      console.log("🌱 Seed:", input.seed);
    }

    if (input.lora_weights) {
      transformed.lora_weights = input.lora_weights;
      console.log("🎭 LoRA weights:", input.lora_weights);
    }

    if (input.lora_scale !== undefined) {
      transformed.lora_scale = input.lora_scale;
      console.log("⚖️ LoRA scale:", input.lora_scale);
    }

    if (input.disable_safety_checker !== undefined) {
      transformed.disable_safety_checker = input.disable_safety_checker;
      console.log("🛡️ Safety checker disabled:", input.disable_safety_checker);
    }

    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    console.log("🈺 Qwen Image foundation model specializes in advanced text rendering capabilities");
    return transformed;
  }
}