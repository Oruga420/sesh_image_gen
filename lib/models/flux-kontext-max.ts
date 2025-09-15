import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface FluxKontextMaxInput extends ModelInput {
  prompt: string;
  input_image?: string;
  image_prompt?: string; // For compatibility with frontend FLUX pattern
  aspect_ratio?: string;
  prompt_upsampling?: boolean;
  seed?: number;
  output_format?: string;
  safety_tolerance?: number;
}

export class FluxKontextMaxModel extends BaseModel {
  readonly key = 'flux_kontext_max';
  readonly replicateModelPath = 'black-forest-labs/flux-kontext-max';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // Supports input_image for image editing
    supportsEdit: true, // Premium text-based image editing model
  };
  
  readonly metadata: ModelMetadata = {
    name: 'FLUX Kontext Max',
    description: 'A premium text-based image editing model that delivers maximum performance and improved typography generation for transforming images through natural language prompts',
    costPerImage: 8, // $0.08
    defaultSize: 'match_input_image',
  };

  validateInput(input: any): FluxKontextMaxInput {
    console.log("\n⚡ FLUX-KONTEXT-MAX INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
    }

    // Validate input_image or image_prompt if provided (for image editing)
    // Both are supported for compatibility - input_image is the official parameter, 
    // image_prompt is used by the frontend for consistency with other FLUX models
    let inputImage: string | undefined;
    if (input.input_image) {
      if (typeof input.input_image === 'string') {
        inputImage = input.input_image;
        console.log("🖼️ Input image provided for text-guided editing");
      } else {
        console.warn("⚠️ input_image must be a string (URL or base64), ignoring invalid value");
      }
    } else if (input.image_prompt) {
      if (typeof input.image_prompt === 'string') {
        inputImage = input.image_prompt;
        console.log("🖼️ Image prompt provided for text-guided editing (frontend compatibility)");
      } else {
        console.warn("⚠️ image_prompt must be a string (URL or base64), ignoring invalid value");
      }
    }

    // Validate aspect_ratio
    let aspectRatio = input.aspect_ratio || 'match_input_image';
    const validAspectRatios = [
      '1:1', '16:9', '21:9', '2:3', '3:2', '4:5', '5:4', '9:16', '9:21', 'match_input_image'
    ];
    if (!validAspectRatios.includes(aspectRatio)) {
      console.warn(`⚠️ Invalid aspect_ratio "${aspectRatio}", defaulting to "match_input_image"`);
      aspectRatio = 'match_input_image';
    }

    // For text-to-image generation (no input image), default to 1:1 instead of match_input_image
    if (!inputImage && aspectRatio === 'match_input_image') {
      console.log("📐 No input image provided, setting aspect_ratio to 1:1 for text-to-image generation");
      aspectRatio = '1:1';
    }

    // Validate prompt_upsampling
    let promptUpsampling = input.prompt_upsampling;
    if (promptUpsampling !== undefined && typeof promptUpsampling !== 'boolean') {
      console.warn("⚠️ prompt_upsampling must be a boolean, ignoring invalid value");
      promptUpsampling = undefined;
    }

    // Validate seed
    let seed = input.seed;
    if (seed !== undefined && (typeof seed !== 'number' || seed < 0)) {
      console.warn(`⚠️ Invalid seed "${seed}", must be a non-negative number, ignoring`);
      seed = undefined;
    }

    // Validate output_format
    let outputFormat = input.output_format || 'png';
    const validFormats = ['png', 'jpg', 'jpeg', 'webp'];
    if (!validFormats.includes(outputFormat.toLowerCase())) {
      console.warn(`⚠️ Invalid output_format "${outputFormat}", defaulting to "png"`);
      outputFormat = 'png';
    } else {
      outputFormat = outputFormat.toLowerCase();
    }

    // Validate safety_tolerance
    let safetyTolerance = input.safety_tolerance;
    if (safetyTolerance !== undefined) {
      if (typeof safetyTolerance === 'number') {
        if (safetyTolerance < 0 || safetyTolerance > 6) {
          console.warn(`⚠️ Invalid safety_tolerance "${safetyTolerance}", must be 0-6, defaulting to 2`);
          safetyTolerance = 2;
        }
        // Special restriction for input images
        if (inputImage && safetyTolerance > 2) {
          console.warn(`⚠️ safety_tolerance limited to 2 when input_image is provided, adjusting from ${safetyTolerance} to 2`);
          safetyTolerance = 2;
        }
      } else {
        console.warn("⚠️ safety_tolerance must be a number, using default value 2");
        safetyTolerance = 2;
      }
    } else {
      safetyTolerance = 2; // Default value
    }

    const validated: FluxKontextMaxInput = {
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
      output_format: outputFormat,
      safety_tolerance: safetyTolerance,
    };

    // Only add optional parameters if they have valid values
    if (inputImage) {
      validated.input_image = inputImage;
      console.log("✨ Premium text-based image editing mode enabled");
    } else {
      console.log("🎨 Text-to-image generation mode with premium typography capabilities");
    }
    
    if (promptUpsampling !== undefined) {
      validated.prompt_upsampling = promptUpsampling;
      console.log("🔧 Prompt upsampling:", promptUpsampling ? "enabled" : "disabled");
    }
    
    if (seed !== undefined) {
      validated.seed = seed;
    }
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    console.log("💎 Using FLUX Kontext Max - Premium text-based editing with maximum performance");
    return validated;
  }

  transformInput(input: FluxKontextMaxInput): Record<string, any> {
    console.log("\n🔄 FLUX-KONTEXT-MAX INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio,
      output_format: input.output_format,
      safety_tolerance: input.safety_tolerance,
    };

    // Only include parameters that have values
    if (input.input_image) {
      transformed.input_image = input.input_image;
      console.log("🖼️ Including input image for premium text-guided editing");
      console.log("🎯 Model excels at: style transfer, object changes, text editing, background swapping");
    }

    if (input.prompt_upsampling !== undefined) {
      transformed.prompt_upsampling = input.prompt_upsampling;
      console.log("✨ Automatic prompt improvement:", input.prompt_upsampling ? "enabled" : "disabled");
    }

    if (input.seed !== undefined) {
      transformed.seed = input.seed;
      console.log("🌱 Seed:", input.seed);
    }

    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    console.log("📝 FLUX Kontext Max: Superior typography generation and character consistency");
    console.log("🏆 Best in class for text-guided image editing and premium performance");
    return transformed;
  }
}