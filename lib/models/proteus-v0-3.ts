import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface ProteusV03Input extends ModelInput {
  prompt: string;
  negative_prompt?: string;
  image?: string;
  mask?: string;
  width?: number;
  height?: number;
  num_outputs?: number;
  scheduler?: string;
  num_inference_steps?: number;
  guidance_scale?: number;
  prompt_strength?: number;
  seed?: number;
  apply_watermark?: boolean;
  disable_safety_checker?: boolean;
}

export class ProteusV03Model extends BaseModel {
  readonly key = 'proteus_v0_3';
  readonly replicateModelPath = 'datacte/proteus-v0.3';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // Supports image parameter for img2img
    supportsEdit: true, // Supports mask parameter for inpainting
  };
  
  readonly metadata: ModelMetadata = {
    name: 'Proteus v0.3',
    description: 'ProteusV0.3: The Anime Update - Specialized anime and artistic image generation model with enhanced anime capabilities',
    costPerImage: 0, // Community/free model
    defaultSize: '1024x1024',
  };

  validateInput(input: any): ProteusV03Input {
    console.log("\n🎌 PROTEUS-V0.3 INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
    }

    // Validate negative_prompt
    let negativePrompt = input.negative_prompt;
    if (negativePrompt !== undefined && typeof negativePrompt !== 'string') {
      console.warn("⚠️ negative_prompt must be a string, ignoring invalid value");
      negativePrompt = undefined;
    }
    if (!negativePrompt) {
      negativePrompt = 'worst quality, low quality'; // Default from documentation
      console.log("📝 Using default negative prompt");
    }

    // Validate image parameter for img2img
    let image = input.image;
    if (image !== undefined && typeof image !== 'string') {
      console.warn("⚠️ image must be a string URL, ignoring invalid value");
      image = undefined;
    }
    if (image) {
      console.log("🖼️ Image provided for img2img generation");
    }

    // Validate mask parameter for inpainting
    let mask = input.mask;
    if (mask !== undefined && typeof mask !== 'string') {
      console.warn("⚠️ mask must be a string URL, ignoring invalid value");
      mask = undefined;
    }
    if (mask) {
      console.log("🎭 Mask provided for inpainting (black areas preserved, white areas inpainted)");
    }

    // Validate width (recommended 1024 or 1280)
    let width = input.width || 1024;
    if (typeof width !== 'number' || width <= 0) {
      console.warn(`⚠️ Invalid width "${width}", defaulting to 1024`);
      width = 1024;
    }
    if (width !== 1024 && width !== 1280) {
      console.log(`📏 Width ${width} - recommended values are 1024 or 1280`);
    }

    // Validate height (recommended 1024 or 1280)
    let height = input.height || 1024;
    if (typeof height !== 'number' || height <= 0) {
      console.warn(`⚠️ Invalid height "${height}", defaulting to 1024`);
      height = 1024;
    }
    if (height !== 1024 && height !== 1280) {
      console.log(`📏 Height ${height} - recommended values are 1024 or 1280`);
    }

    // Validate num_outputs (1-4)
    let numOutputs = input.num_outputs || 1;
    if (typeof numOutputs !== 'number' || numOutputs < 1 || numOutputs > 4) {
      console.warn(`⚠️ Invalid num_outputs "${numOutputs}", must be 1-4, defaulting to 1`);
      numOutputs = 1;
    }

    // Validate scheduler
    let scheduler = input.scheduler || 'DPM++2MSDE';
    if (typeof scheduler !== 'string') {
      console.warn("⚠️ scheduler must be a string, defaulting to 'DPM++2MSDE'");
      scheduler = 'DPM++2MSDE';
    }

    // Validate num_inference_steps (1-100, recommended 20-60)
    let numInferenceSteps = input.num_inference_steps || 20;
    if (typeof numInferenceSteps !== 'number' || numInferenceSteps < 1 || numInferenceSteps > 100) {
      console.warn(`⚠️ Invalid num_inference_steps "${numInferenceSteps}", must be 1-100, defaulting to 20`);
      numInferenceSteps = 20;
    }
    if (numInferenceSteps < 20 || numInferenceSteps > 60) {
      console.log(`⚡ Steps ${numInferenceSteps} - recommended range is 20-60 for best detail`);
    }

    // Validate guidance_scale (1-50, recommended 7-8)
    let guidanceScale = input.guidance_scale || 7.5;
    if (typeof guidanceScale !== 'number' || guidanceScale < 1 || guidanceScale > 50) {
      console.warn(`⚠️ Invalid guidance_scale "${guidanceScale}", must be 1-50, defaulting to 7.5`);
      guidanceScale = 7.5;
    }
    if (guidanceScale < 7 || guidanceScale > 8) {
      console.log(`🎯 CFG Scale ${guidanceScale} - recommended range is 7-8`);
    }

    // Validate prompt_strength (0-1.0, for img2img/inpaint)
    let promptStrength = input.prompt_strength;
    if (promptStrength !== undefined) {
      if (typeof promptStrength !== 'number' || promptStrength < 0 || promptStrength > 1.0) {
        console.warn(`⚠️ Invalid prompt_strength "${promptStrength}", must be 0-1.0, defaulting to 0.8`);
        promptStrength = 0.8;
      }
    } else if (image || mask) {
      promptStrength = 0.8; // Default for img2img/inpaint
      console.log("🔧 Using default prompt_strength 0.8 for img2img/inpaint");
    }

    // Validate seed
    let seed = input.seed;
    if (seed !== undefined && (typeof seed !== 'number' || seed < 0)) {
      console.warn(`⚠️ Invalid seed "${seed}", must be a non-negative number, ignoring`);
      seed = undefined;
    }

    // Validate apply_watermark
    let applyWatermark = input.apply_watermark;
    if (applyWatermark !== undefined && typeof applyWatermark !== 'boolean') {
      console.warn("⚠️ apply_watermark must be a boolean, defaulting to true");
      applyWatermark = true;
    }
    if (applyWatermark === undefined) {
      applyWatermark = true; // Default from documentation
    }

    // Validate disable_safety_checker
    let disableSafetyChecker = input.disable_safety_checker;
    if (disableSafetyChecker !== undefined && typeof disableSafetyChecker !== 'boolean') {
      console.warn("⚠️ disable_safety_checker must be a boolean, ignoring invalid value");
      disableSafetyChecker = undefined;
    }

    const validated: ProteusV03Input = {
      prompt: input.prompt,
      negative_prompt: negativePrompt,
      width,
      height,
      num_outputs: numOutputs,
      scheduler,
      num_inference_steps: numInferenceSteps,
      guidance_scale: guidanceScale,
      apply_watermark: applyWatermark,
    };

    // Only add optional parameters if they have valid values
    if (image) {
      validated.image = image;
    }
    
    if (mask) {
      validated.mask = mask;
    }
    
    if (promptStrength !== undefined) {
      validated.prompt_strength = promptStrength;
    }
    
    if (seed !== undefined) {
      validated.seed = seed;
    }
    
    if (disableSafetyChecker !== undefined) {
      validated.disable_safety_checker = disableSafetyChecker;
    }
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    console.log("🎌 Using Proteus v0.3 - Enhanced anime generation with superior lighting effects");
    return validated;
  }

  transformInput(input: ProteusV03Input): Record<string, any> {
    console.log("\n🔄 PROTEUS-V0.3 INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      negative_prompt: input.negative_prompt,
      width: input.width,
      height: input.height,
      num_outputs: input.num_outputs,
      scheduler: input.scheduler,
      num_inference_steps: input.num_inference_steps,
      guidance_scale: input.guidance_scale,
      apply_watermark: input.apply_watermark,
    };

    // Only include parameters that have values
    if (input.image) {
      transformed.image = input.image;
      console.log("🖼️ Including image for img2img generation");
    }

    if (input.mask) {
      transformed.mask = input.mask;
      console.log("🎭 Including mask for inpainting");
    }

    if (input.prompt_strength !== undefined) {
      transformed.prompt_strength = input.prompt_strength;
      console.log("💪 Prompt strength:", input.prompt_strength);
    }

    if (input.seed !== undefined) {
      transformed.seed = input.seed;
      console.log("🌱 Seed:", input.seed);
    }

    if (input.disable_safety_checker !== undefined) {
      transformed.disable_safety_checker = input.disable_safety_checker;
      console.log("🛡️ Safety checker disabled:", input.disable_safety_checker);
    }

    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    console.log("🎨 Proteus v0.3 specializes in anime and artistic visualizations with enhanced facial features");
    return transformed;
  }
}