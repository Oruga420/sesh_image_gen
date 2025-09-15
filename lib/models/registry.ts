import { BaseModel } from './base';
import { Imagen4FastModel } from './imagen4-fast';
import { NanoBananaModel } from './nano-banana';
import { SeeDream4Model } from './seedream4';
import { Flux11ProModel } from './flux-1-1-pro';

export type ModelKey = 'imagen4_fast' | 'nano_banana' | 'seedream4' | 'flux_1_1_pro';

class ModelRegistry {
  private models: Map<ModelKey, BaseModel> = new Map();

  constructor() {
    // Register all available models
    this.register(new Imagen4FastModel());
    this.register(new NanoBananaModel());
    this.register(new SeeDream4Model());
    this.register(new Flux11ProModel());
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