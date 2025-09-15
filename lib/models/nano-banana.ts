import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface NanoBananaInput extends ModelInput {
  prompt: string;
  image_input?: string[];
  output_format?: string;
}

export class NanoBananaModel extends BaseModel {
  readonly key = 'nano_banana';
  readonly replicateModelPath = 'google/nano-banana';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true,
    supportsEdit: true,
  };
  
  readonly metadata: ModelMetadata = {
    name: 'Nano Banana',
    description: "Google's image editing model in Gemini 2.5",
    costPerImage: 3.9, // $0.039
    defaultSize: '1024x1024',
  };

  validateInput(input: any): NanoBananaInput {
    if (!input.prompt || typeof input.prompt !== 'string') {
      throw new Error('prompt is required and must be a string');
    }

    let imageInput: string[] = [];
    if (input.image_input) {
      if (Array.isArray(input.image_input)) {
        imageInput = input.image_input.filter((url: any) => typeof url === 'string');
      } else if (typeof input.image_input === 'string') {
        imageInput = [input.image_input];
      }
    }

    return {
      prompt: input.prompt,
      image_input: imageInput,
      output_format: input.output_format || 'jpg',
    };
  }

  transformInput(input: NanoBananaInput): Record<string, any> {
    const transformed: Record<string, any> = {
      prompt: input.prompt,
      output_format: input.output_format,
    };

    // Only include image_input if it has valid URLs
    if (input.image_input && input.image_input.length > 0) {
      transformed.image_input = input.image_input;
    }

    return transformed;
  }
}