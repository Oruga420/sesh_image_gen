import { BaseModel } from './base';
import { Imagen4Model } from './imagen4';
import { Imagen4UltraModel } from './imagen4-ultra';
import { Imagen4FastModel } from './imagen4-fast';
import { NanoBananaModel } from './nano-banana';
import { SeeDream4Model } from './seedream4';
import { Flux11ProModel } from './flux-1-1-pro';
import { Flux11ProUltraModel } from './flux-1-1-pro-ultra';
import { ProteusV03Model } from './proteus-v0-3';
import { IdeogramV3TurboModel } from './ideogram-v3-turbo';

export type ModelKey = 'imagen4' | 'imagen4_ultra' | 'imagen4_fast' | 'nano_banana' | 'seedream4' | 'flux_1_1_pro' | 'flux_1_1_pro_ultra' | 'proteus_v0_3' | 'ideogram_v3_turbo';

class ModelRegistry {
  private models: Map<ModelKey, BaseModel> = new Map();

  constructor() {
    // Register all available models
    this.register(new Imagen4Model());
    this.register(new Imagen4UltraModel());
    this.register(new Imagen4FastModel());
    this.register(new NanoBananaModel());
    this.register(new SeeDream4Model());
    this.register(new Flux11ProModel());
    this.register(new Flux11ProUltraModel());
    this.register(new ProteusV03Model());
    this.register(new IdeogramV3TurboModel());
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

  getModelsList() {
    return this.getAllModels().map(model => ({
      key: model.key as ModelKey,
      replicateModelPath: model.replicateModelPath,
      ...model.capabilities,
      ...model.metadata,
    }));
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
      replicateModelPath: model.replicateModelPath,
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