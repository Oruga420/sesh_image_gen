export type ModelKey =
  | "imagen4_fast"
  | "nano_banana"
  // Add more models as needed

export const MODELS: Record<ModelKey, {
  replicateModelPath: string;   // e.g. "google/imagen-4-fast"
  supportsImageRef: boolean;    // enable/disable uploader
  supportsEdit: boolean;        // show Edit tab affordances
  defaultSize: string;          // UI preset
  name: string;                 // Display name
  description: string;          // Model description
  costPerImage: number;         // Cost in cents
}> = {
  imagen4_fast: {
    replicateModelPath: "google/imagen-4-fast",
    supportsImageRef: false,    
    supportsEdit: false,
    defaultSize: "1024x1024",
    name: "Imagen 4 Fast",
    description: "Google's fast image generation model - speed over quality",
    costPerImage: 2, // $0.02
  },
  nano_banana: {
    replicateModelPath: "google/nano-banana", 
    supportsImageRef: true,     // edit image input
    supportsEdit: true,
    defaultSize: "1024x1024",
    name: "Nano Banana",
    description: "Google's image editing model in Gemini 2.5",
    costPerImage: 3.9, // $0.039
  },
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