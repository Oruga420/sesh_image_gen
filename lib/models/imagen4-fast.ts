import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface Imagen4FastInput extends ModelInput {
  prompt: string;
  aspect_ratio?: string;
  output_format?: string;
  safety_filter_level?: string;
}

export class Imagen4FastModel extends BaseModel {
  readonly key = 'imagen4_fast';
  readonly replicateModelPath = 'google/imagen-4-fast';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: false,
    supportsEdit: false,
  };
  
  readonly metadata: ModelMetadata = {
    name: 'Imagen 4 Fast',
    description: "Google's fast image generation model - speed over quality",
    costPerImage: 2, // $0.02
    defaultSize: '1024x1024',
  };

  validateInput(input: any): Imagen4FastInput {
    console.log("\n🔍 IMAGEN4-FAST INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
    }

    const validated = {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio || '1:1',
      output_format: input.output_format || 'jpg',
      safety_filter_level: input.safety_filter_level || 'block_only_high',
    };
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    return validated;
  }

  transformInput(input: Imagen4FastInput): Record<string, any> {
    console.log("\n🔄 IMAGEN4-FAST INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed = {
      prompt: input.prompt,
      aspect_ratio: input.aspect_ratio,
      output_format: input.output_format,
      safety_filter_level: input.safety_filter_level,
    };
    
    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    return transformed;
  }
}