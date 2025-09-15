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
    const body = {
      model: this.replicateModelPath,
      input: transformedInput,
      stream: true,
    };

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${apiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Replicate error ${response.status}: ${error}`);
    }
    
    const prediction = await response.json();
    
    return {
      id: prediction.id,
      status: prediction.status,
      streamUrl: prediction?.urls?.stream ?? null,
      webUrl: prediction?.urls?.get ?? null,
    };
  }
}