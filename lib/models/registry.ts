import { BaseModel } from './base';

// FLUX Models (Black Forest Labs)
import { Flux11ProUltraModel } from './flux-1-1-pro-ultra';
import { Flux2ProModel } from './flux-2-pro';

// Google Models (Imagen)
import { Imagen4FastModel } from './imagen4-fast';
import { Imagen4Model } from './imagen4';
import { Imagen4UltraModel } from './imagen4-ultra';

// Ideogram Models
import { IdeogramV3QualityModel } from './ideogram-v3-quality';
import { IdeogramV3TurboModel } from './ideogram-v3-turbo';

// Other Models (Alphabetical)
import { NanoBananaModel } from './nano-banana';
import { NanoBananaProModel } from './nano-banana-pro';
import { QwenImageModel } from './qwen-image';
import { SeeDream4Model } from './seedream4';

export type ModelKey =
  // FLUX Models
  | 'flux_1_1_pro_ultra'
  | 'flux_2_pro'
  // Google Models
  | 'imagen4_fast'
  | 'imagen4'
  | 'imagen4_ultra'
  // Ideogram Models
  | 'ideogram_v3_quality'
  | 'ideogram_v3_turbo'
  // Other Models
  | 'nano_banana'
  | 'nano_banana_pro'
  | 'qwen_image'
  | 'seedream4';

class ModelRegistry {
  private models: Map<ModelKey, BaseModel> = new Map();

  constructor() {
    // FLUX Models (Black Forest Labs) - Alphabetical
    this.register(new Flux11ProUltraModel());
    this.register(new Flux2ProModel());

    // Google Models (Imagen) - Alphabetical
    this.register(new Imagen4FastModel());
    this.register(new Imagen4Model());
    this.register(new Imagen4UltraModel());

    // Ideogram Models - Alphabetical
    this.register(new IdeogramV3QualityModel());
    this.register(new IdeogramV3TurboModel());

    // Other Models - Alphabetical
    this.register(new NanoBananaModel());
    this.register(new NanoBananaProModel());
    this.register(new QwenImageModel());
    this.register(new SeeDream4Model());
  }

  private register(model: BaseModel) {
    this.models.set(model.key as ModelKey, model);
  }

  getModel(key: ModelKey): BaseModel {
    const model = this.models.get(key);
    if (!model) {
      throw new Error(`Model "${key}" not found`);
    }
    return model;
  }

  getAllModels(): BaseModel[] {
    return Array.from(this.models.values());
  }

  getAllModelsOrganized(): BaseModel[] {
    // Return models in organized category order
    const orderedKeys: ModelKey[] = [
      // FLUX Models
      'flux_1_1_pro_ultra',
      'flux_2_pro',
      // Google Models
      'imagen4_fast',
      'imagen4',
      'imagen4_ultra',
      // Ideogram Models
      'ideogram_v3_quality',
      'ideogram_v3_turbo',
      // Other Models
      'nano_banana',
      'nano_banana_pro',
      'qwen_image',
      'seedream4',
    ];

    return orderedKeys.map(key => this.getModel(key));
  }

  getModelsList() {
    return this.getAllModelsOrganized().map(model => ({
      key: model.key as ModelKey,
      replicateModelPath: model.replicateModelPath,
      provider: (model as any).provider || 'replicate',
      openaiModel: (model as any).openaiModel,
      ...model.capabilities,
      ...model.metadata,
    }));
  }

  getModelsByCategory() {
    return {
      'FLUX Models (Black Forest Labs)': [
        this.getModel('flux_1_1_pro_ultra'),
        this.getModel('flux_2_pro'),
      ],
      'Google Models (Imagen)': [
        this.getModel('imagen4_fast'),
        this.getModel('imagen4'),
        this.getModel('imagen4_ultra')
      ],
      'Ideogram Models': [
        this.getModel('ideogram_v3_quality'),
        this.getModel('ideogram_v3_turbo')
      ],
      'Other Models': [
        this.getModel('nano_banana'),
        this.getModel('nano_banana_pro'),
        this.getModel('qwen_image'),
        this.getModel('seedream4')
      ]
    };
  }

  getAvailableKeys(): ModelKey[] {
    return Array.from(this.models.keys());
  }
}

// Export singleton instance
export const modelRegistry = new ModelRegistry();

// Legacy compatibility functions
export const MODELS = Object.fromEntries(
  modelRegistry.getModelsList().map(model => [
    model.key,
    {
      provider: model.provider || 'replicate',
      replicateModelPath: model.replicateModelPath,
      openaiModel: model.openaiModel,
      supportsImageRef: model.supportsImageRef,
      supportsEdit: model.supportsEdit,
      defaultSize: model.defaultSize,
      name: model.name,
      description: model.description,
      costPerImage: model.costPerImage,
    }
  ])
);

export const getModelsList = () => modelRegistry.getModelsList();
export const getModelByKey = (key: ModelKey) => modelRegistry.getModel(key);
export const getModelVersion = (modelKey: ModelKey): string => {
  const model = modelRegistry.getModel(modelKey);

  // OpenAI models don't use version env vars
  if ((model as any).provider === 'openai') {
    throw new Error(`Model ${modelKey} does not use version environment variables`);
  }

  // For Replicate models, the version is in the model path
  // This is a legacy function, versions are now managed by Replicate directly
  return model.replicateModelPath;
};
