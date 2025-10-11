import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

export class GPTImage1Model extends BaseModel {
  readonly key = 'gpt_image_1';
  readonly replicateModelPath = ''; // OpenAI models don't use Replicate
  readonly provider = 'openai' as const;
  readonly openaiModel = 'gpt-image-1';

  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true,
    supportsEdit: true,
  };

  readonly metadata: ModelMetadata = {
    name: 'GPT Image 1',
    description: "OpenAI's GPT Image - Superior instruction following, text rendering, detailed editing, real-world knowledge",
    costPerImage: 5, // Approximate, token-based pricing
    defaultSize: '1024x1024',
  };

  validateInput(input: any): ModelInput {
    if (!input.prompt || typeof input.prompt !== 'string') {
      throw new Error('prompt is required and must be a string');
    }

    return {
      prompt: input.prompt,
      image_input: input.image_input,
      mask: input.mask,
      size: input.size || '1024x1024',
      quality: input.quality || 'auto',
      output_format: input.output_format || 'png',
      output_compression: input.output_compression,
      background: input.background || 'auto',
      input_fidelity: input.input_fidelity || 'low',
    };
  }

  transformInput(input: ModelInput): Record<string, any> {
    // OpenAI-specific transformation handled in the API route
    return input as Record<string, any>;
  }

  async createPrediction(input: ModelInput): Promise<any> {
    // OpenAI models use a different API, so this is handled separately
    throw new Error('GPT Image models should use the /api/openai/generate endpoint');
  }
}
