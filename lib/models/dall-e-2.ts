import { BaseModel, ModelInput, ModelCapabilities, ModelMetadata } from './base';

export class DallE2Model extends BaseModel {
  readonly key = 'dall_e_2';
  readonly replicateModelPath = ''; // OpenAI models don't use Replicate
  readonly provider = 'openai' as const;
  readonly openaiModel = 'dall-e-2';

  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true, // DALL-E 2 supports variations and edits
    supportsEdit: true,
  };

  readonly metadata: ModelMetadata = {
    name: 'DALL-E 2',
    description: 'Lower cost, concurrent requests, inpainting (image editing with a mask)',
    costPerImage: 1,
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
