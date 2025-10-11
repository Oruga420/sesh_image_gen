import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface Imagen4UltraInput extends ModelInput {
  prompt: string;
  aspect_ratio?: string;
  safety_filter_level?: string;
  output_format?: string;
}

export class Imagen4UltraModel extends BaseModel {
  readonly key = 'imagen4_ultra';
  readonly replicateModelPath = 'google/imagen-4-ultra';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: false, // Does not support image_prompt parameter
    supportsEdit: false,
  };
  
  readonly metadata: ModelMetadata = {
    name: 'Imagen 4 Ultra',
    description: 'Use this ultra version of Imagen 4 when quality matters more than speed and cost',
    costPerImage: 6, // $0.06 per output image
    defaultSize: '1:1',
  };

  validateInput(input: any): Imagen4UltraInput {
    console.log("\n🌟 IMAGEN-4-ULTRA INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
    }

    // Validate aspect_ratio
    let aspectRatio = input.aspect_ratio || '1:1';
    const validAspectRatios = [
      '1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '5:4', '4:5'
    ];
    if (!validAspectRatios.includes(aspectRatio)) {
      console.warn(`⚠️ Invalid aspect_ratio "${aspectRatio}", defaulting to "1:1"`);
      aspectRatio = '1:1';
    }

    // Validate safety_filter_level
    let safetyFilterLevel = input.safety_filter_level || 'block_only_high';
    const validSafetyLevels = [
      'block_low_and_above', 
      'block_medium_and_above', 
      'block_only_high'
    ];
    if (!validSafetyLevels.includes(safetyFilterLevel)) {
      console.warn(`⚠️ Invalid safety_filter_level "${safetyFilterLevel}", defaulting to "block_only_high"`);
      safetyFilterLevel = 'block_only_high';
    }

    // Validate output_format
    let outputFormat = input.output_format || 'jpg';
    const validFormats = ['jpg', 'png', 'webp'];
    if (!validFormats.includes(outputFormat)) {
      console.warn(`⚠️ Invalid output_format "${outputFormat}", defaulting to "jpg"`);
      outputFormat = 'jpg';
    }

    const validated = {
      prompt: input.prompt,
      aspect_ratio: aspectRatio,
      safety_filter_level: safetyFilterLevel,
      output_format: outputFormat,
    };
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    console.log("🌟 Note: Imagen 4 Ultra does not support reference images (no image_prompt parameter)");
    return validated;
  }

  transformInput(input: Imagen4UltraInput): Record<string, any> {
    console.log("\n🔄 IMAGEN-4-ULTRA INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed = {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio,
      safety_filter_level: input.safety_filter_level,
      output_format: input.output_format,
    };
    
    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    console.log("🌟 Using Google's ultra-premium Imagen 4 Ultra - superior quality for when cost is not a concern");
    console.log("💎 Enhanced typography, fine detail rendering, and style versatility");
    return transformed;
  }
}