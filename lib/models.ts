export type ModelKey =
  | "imagen4_fast"
  | "nano_banana"
  | "gpt_image_1"
  // Add more models as needed

export type ModelProvider = "replicate" | "openai";

export const MODELS: Record<ModelKey, {
  provider: ModelProvider;
  replicateModelPath?: string;  // Only for Replicate models
  versionEnv?: string;          // Only for Replicate models
  openaiModel?: string;         // Only for OpenAI models
  supportsImageRef: boolean;    // enable/disable uploader
  supportsEdit: boolean;        // show Edit tab affordances
  defaultSize: string;          // UI preset
  name: string;                 // Display name
  description: string;          // Model description
  costPerImage: number;         // Cost in cents (approximate)
}> = {
  imagen4_fast: {
    provider: "replicate",
    replicateModelPath: "google/imagen-4-fast",
    versionEnv: "REPLICATE_MODEL_IMAGEN4_FAST_VERSION",
    supportsImageRef: false,
    supportsEdit: false,
    defaultSize: "1024x1024",
    name: "Imagen 4 Fast",
    description: "Google's fast image generation model - speed over quality",
    costPerImage: 2, // $0.02
  },
  nano_banana: {
    provider: "replicate",
    replicateModelPath: "google/nano-banana",
    versionEnv: "REPLICATE_MODEL_NANO_BANANA_VERSION",
    supportsImageRef: true,
    supportsEdit: true,
    defaultSize: "1024x1024",
    name: "Nano Banana",
    description: "Google's image editing model in Gemini 2.5",
    costPerImage: 3.9, // $0.039
  },
  gpt_image_1: {
    provider: "openai",
    openaiModel: "gpt-image-1",
    supportsImageRef: true,
    supportsEdit: true,
    defaultSize: "1024x1024",
    name: "GPT Image 1",
    description: "OpenAI's GPT Image - Superior instruction following, text rendering, detailed editing, real-world knowledge",
    costPerImage: 5, // Approximate, token-based pricing
  },
};

export const getModelVersion = (modelKey: ModelKey): string => {
  const model = MODELS[modelKey];

  // OpenAI models don't use version env vars
  if (model.provider === "openai" || !model.versionEnv) {
    throw new Error(`Model ${modelKey} does not use version environment variables`);
  }

  const version = process.env[model.versionEnv];
  if (!version) {
    throw new Error(`Missing environment variable: ${model.versionEnv}`);
  }
  return version;
};

export const getModelsList = () => {
  return Object.entries(MODELS).map(([key, model]) => ({
    key: key as ModelKey,
    ...model,
  }));
};

export const getModelByKey = (key: ModelKey) => {
  return MODELS[key];
};