export interface ModelCapabilities {
  supportsImageRef: boolean;
  supportsEdit: boolean;
}

export interface ModelMetadata {
  name: string;
  description: string;
  costPerImage: number; // in cents
  defaultSize: string;
}

export interface ModelInput {
  prompt: string;
  [key: string]: any;
}

export interface ModelOutput {
  id: string;
  status: string;
  streamUrl?: string;
  webUrl?: string;
}

export abstract class BaseModel {
  abstract readonly key: string;
  abstract readonly replicateModelPath: string;
  abstract readonly capabilities: ModelCapabilities;
  abstract readonly metadata: ModelMetadata;

  abstract validateInput(input: any): ModelInput;
  abstract transformInput(input: ModelInput): Record<string, any>;
  
  async createPrediction(input: ModelInput): Promise<ModelOutput> {
    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      throw new Error("REPLICATE_API_TOKEN environment variable is not set");
    }

    const transformedInput = this.transformInput(input);
    
    // Use the official Replicate client for proper API format
    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({
      auth: apiToken,
    });
    
    // Use predictions.create for more control over the prediction object
    const prediction = await replicate.predictions.create({
      model: this.replicateModelPath,
      input: transformedInput,
      stream: true,
    });
    
    return {
      id: prediction.id,
      status: prediction.status,
      streamUrl: prediction.urls?.stream ?? undefined,
      webUrl: prediction.urls?.get ?? undefined,
    };
  }
}