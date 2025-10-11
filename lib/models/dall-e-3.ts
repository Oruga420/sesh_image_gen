import { BaseModel, ModelInput, ModelCapabilities, ModelMetadata } from './base';

export class DallE3Model extends BaseModel {
  readonly key = 'dall_e_3';
  readonly replicateModelPath = ''; // OpenAI models don't use Replicate
  readonly provider = 'openai' as const;
  readonly openaiModel = 'dall-e-3';

  readonly capabilities: ModelCapabilities = {
    supportsImageRef: false, // DALL-E 3 doesn't support image input
    supportsEdit: false,
  };

  readonly metadata: ModelMetadata = {
    name: 'DALL-E 3',
    description: 'Higher image quality than DALL-E 2, support for larger resolutions',
    costPerImage: 2,
    defaultSize: '1024x1024',
  };

  async createPrediction(input: ModelInput): Promise<any> {
    // Returns error object instead of throwing (to allow model registration)
    return {
      id: 'openai-not-supported',
      status: 'error',
      error: 'DALL-E models should use the /api/openai/generate endpoint'
    };
  }
}
