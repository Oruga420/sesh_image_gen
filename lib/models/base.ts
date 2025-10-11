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
    console.log("\n=== REPLICATE API PREDICTION CREATION ===");
    console.log("Model key:", this.key);
    console.log("Model path:", this.replicateModelPath);
    console.log("Raw input received:", JSON.stringify(input, null, 2));
    
    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      console.error("❌ REPLICATE_API_TOKEN missing!");
      throw new Error("REPLICATE_API_TOKEN environment variable is not set");
    }
    
    console.log("✅ API Token present:", apiToken.substring(0, 10) + "...");

    const transformedInput = this.transformInput(input);
    
    console.log("Transformed input for Replicate:", JSON.stringify(transformedInput, null, 2));
    console.log("Model path being used:", this.replicateModelPath);
    
    // Use the official Replicate client for proper API format
    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({
      auth: apiToken,
    });
    
    const requestBody = {
      model: this.replicateModelPath,
      input: transformedInput,
      stream: true,
    };
    
    console.log("\n📤 SENDING TO REPLICATE:");
    console.log("Full request body:", JSON.stringify(requestBody, null, 2));
    
    console.log("\n⏳ Calling replicate.predictions.create...");
    
    // Use predictions.create for more control over the prediction object
    const prediction = await replicate.predictions.create(requestBody);
    
    console.log("\n📥 REPLICATE RESPONSE:");
    console.log("Full prediction object:", JSON.stringify(prediction, null, 2));
    console.log("Prediction ID:", prediction.id);
    console.log("Initial status:", prediction.status);
    console.log("Stream URL:", prediction.urls?.stream);
    console.log("Web URL:", prediction.urls?.get);
    
    if (prediction.error) {
      console.error("❌ Prediction created with error:", prediction.error);
    }
    
    const result = {
      id: prediction.id,
      status: prediction.status,
      streamUrl: prediction.urls?.stream ?? undefined,
      webUrl: prediction.urls?.get ?? undefined,
    };
    
    console.log("\n✅ Returning to client:", JSON.stringify(result, null, 2));
    console.log("=== END PREDICTION CREATION ===\n");
    
    return result;
  }
}