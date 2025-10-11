import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface IdeogramV3QualityInput extends ModelInput {
  prompt: string;
  aspect_ratio?: string;
  resolution?: string;
  magic_prompt_option?: string;
  image?: string;
  mask?: string;
  style_type?: string;
  style_reference_images?: string[];
  seed?: number;
  style_preset?: string;
}

export class IdeogramV3QualityModel extends BaseModel {
  readonly key = 'ideogram_v3_quality';
  readonly replicateModelPath = 'ideogram-ai/ideogram-v3-quality';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // Supports style_reference_images and image/mask for inpainting
    supportsEdit: true, // Supports inpainting with image and mask parameters
  };
  
  readonly metadata: ModelMetadata = {
    name: 'Ideogram v3 Quality',
    description: 'The highest quality Ideogram v3 model. v3 creates images with stunning realism, creative designs, and consistent styles. Premium quality for professional applications.',
    costPerImage: 9, // $0.09 - premium pricing for maximum quality
    defaultSize: '1:1',
  };

  validateInput(input: any): IdeogramV3QualityInput {
    console.log("\n🚀 IDEOGRAM-V3-QUALITY INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
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

    // Validate resolution (overrides aspect_ratio if provided)
    let resolution = input.resolution;
    if (resolution !== undefined) {
      if (typeof resolution !== 'string') {
        console.warn("⚠️ resolution must be a string, ignoring invalid value");
        resolution = undefined;
      } else if (resolution !== 'None') {
        console.log("📐 Resolution provided, will override aspect_ratio");
      }
    }

    // Validate magic_prompt_option
    let magicPromptOption = input.magic_prompt_option || 'Auto';
    const validMagicPromptOptions = ['Auto', 'On', 'Off'];
    if (!validMagicPromptOptions.includes(magicPromptOption)) {
      console.warn(`⚠️ Invalid magic_prompt_option "${magicPromptOption}", defaulting to "Auto"`);
      magicPromptOption = 'Auto';
    }
    if (magicPromptOption === 'On' || magicPromptOption === 'Auto') {
      console.log("✨ Magic Prompt enabled - will optimize prompt for variety and quality");
    }

    // Validate image parameter for inpainting
    let image = input.image;
    if (image !== undefined && typeof image !== 'string') {
      console.warn("⚠️ image must be a string URL, ignoring invalid value");
      image = undefined;
    }
    if (image) {
      console.log("🖼️ Image provided for inpainting");
    }

    // Validate mask parameter for inpainting
    let mask = input.mask;
    if (mask !== undefined && typeof mask !== 'string') {
      console.warn("⚠️ mask must be a string URL, ignoring invalid value");
      mask = undefined;
    }
    if (mask) {
      console.log("🎭 Mask provided for inpainting (black pixels inpainted, white pixels preserved)");
    }

    // Validate both image and mask for inpainting
    if ((image && !mask) || (!image && mask)) {
      console.warn("⚠️ For inpainting, both image and mask are required. Ignoring both parameters.");
      image = undefined;
      mask = undefined;
    }

    // Validate style_type
    let styleType = input.style_type;
    if (styleType !== undefined) {
      if (typeof styleType !== 'string') {
        console.warn("⚠️ style_type must be a string, ignoring invalid value");
        styleType = undefined;
      } else if (styleType !== 'None') {
        console.log("🎨 Style type specified:", styleType);
      }
    }

    // Validate style_reference_images
    let styleReferenceImages = input.style_reference_images;
    if (styleReferenceImages !== undefined) {
      if (!Array.isArray(styleReferenceImages)) {
        console.warn("⚠️ style_reference_images must be an array, ignoring invalid value");
        styleReferenceImages = undefined;
      } else if (styleReferenceImages.length > 3) {
        console.warn("⚠️ Maximum 3 style reference images allowed, truncating array");
        styleReferenceImages = styleReferenceImages.slice(0, 3);
      } else if (styleReferenceImages.length > 0) {
        // Validate each URL in the array
        const validUrls = styleReferenceImages.filter(url => typeof url === 'string');
        if (validUrls.length !== styleReferenceImages.length) {
          console.warn("⚠️ Some style reference images were invalid URLs and were removed");
        }
        styleReferenceImages = validUrls.length > 0 ? validUrls : undefined;
      }
      
      if (styleReferenceImages && styleReferenceImages.length > 0) {
        console.log(`🖌️ ${styleReferenceImages.length} style reference image(s) provided for aesthetic control`);
      }
    }

    // Validate seed
    let seed = input.seed;
    if (seed !== undefined) {
      if (typeof seed !== 'number' || seed < 0 || seed > 2147483647) {
        console.warn(`⚠️ Invalid seed "${seed}", must be a number between 0 and 2147483647, ignoring`);
        seed = undefined;
      } else {
        console.log("🌱 Seed provided for reproducible generation:", seed);
      }
    }

    // Validate style_preset
    let stylePreset = input.style_preset;
    if (stylePreset !== undefined) {
      if (typeof stylePreset !== 'string') {
        console.warn("⚠️ style_preset must be a string, ignoring invalid value");
        stylePreset = undefined;
      } else if (stylePreset !== 'None') {
        console.log("🎭 Style preset specified:", stylePreset);
      }
    }

    const validated: IdeogramV3QualityInput = {
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
      magic_prompt_option: magicPromptOption,
    };

    // Only add optional parameters if they have valid values
    if (resolution && resolution !== 'None') {
      validated.resolution = resolution;
    }
    
    if (image && mask) {
      validated.image = image;
      validated.mask = mask;
    }
    
    if (styleType && styleType !== 'None') {
      validated.style_type = styleType;
    }
    
    if (styleReferenceImages && styleReferenceImages.length > 0) {
      validated.style_reference_images = styleReferenceImages;
    }
    
    if (seed !== undefined) {
      validated.seed = seed;
    }
    
    if (stylePreset && stylePreset !== 'None') {
      validated.style_preset = stylePreset;
    }
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    console.log("🚀 Using Ideogram v3 Quality - Premium model for highest quality, stunning realism");
    return validated;
  }

  transformInput(input: IdeogramV3QualityInput): Record<string, any> {
    console.log("\n🔄 IDEOGRAM-V3-QUALITY INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio,
      magic_prompt_option: input.magic_prompt_option,
    };

    // Only include parameters that have values
    if (input.resolution) {
      transformed.resolution = input.resolution;
      console.log("📐 Including resolution:", input.resolution);
    }

    if (input.image) {
      transformed.image = input.image;
      console.log("🖼️ Including image for inpainting");
    }

    if (input.mask) {
      transformed.mask = input.mask;
      console.log("🎭 Including mask for inpainting");
    }

    if (input.style_type) {
      transformed.style_type = input.style_type;
      console.log("🎨 Including style type:", input.style_type);
    }

    if (input.style_reference_images && input.style_reference_images.length > 0) {
      transformed.style_reference_images = input.style_reference_images;
      console.log(`🖌️ Including ${input.style_reference_images.length} style reference images`);
    }

    if (input.seed !== undefined) {
      transformed.seed = input.seed;
      console.log("🌱 Seed:", input.seed);
    }

    if (input.style_preset) {
      transformed.style_preset = input.style_preset;
      console.log("🎭 Style preset:", input.style_preset);
    }

    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    console.log("📝 Ideogram v3 Quality - Maximum quality output for professional applications");
    return transformed;
  }
}