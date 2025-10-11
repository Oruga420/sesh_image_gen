import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface Imagen4Input extends ModelInput {
  prompt: string;
  aspect_ratio?: string;
  safety_filter_level?: string;
  output_format?: string;
}

export class Imagen4Model extends BaseModel {
  readonly key = 'imagen4';
  readonly replicateModelPath = 'google/imagen-4';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: false, // Does not support image_prompt parameter
    supportsEdit: false,
  };
  
  readonly metadata: ModelMetadata = {
    name: 'Imagen 4',
    description: "Google's flagship Imagen 4 model with superior detail rendering, style versatility, and enhanced typography capabilities",
    costPerImage: 4, // $0.04
    defaultSize: '1:1',
  };

  validateInput(input: any): Imagen4Input {
    console.log("\n🎨 IMAGEN-4 INPUT VALIDATION:");
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
    console.log("🖼️ Note: Imagen 4 does not support reference images (no image_prompt parameter)");
    return validated;
  }

  transformInput(input: Imagen4Input): Record<string, any> {
    console.log("\n🔄 IMAGEN-4 INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed = {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio,
      safety_filter_level: input.safety_filter_level,
      output_format: input.output_format,
    };
    
    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    console.log("🎨 Using Google's flagship Imagen 4 model with enhanced typography and detail rendering");
    return transformed;
  }
}