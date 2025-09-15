import { BaseModel } from './base';

// FLUX Models (Black Forest Labs)
import { Flux11ProModel } from './flux-1-1-pro';
import { Flux11ProUltraModel } from './flux-1-1-pro-ultra';
import { FluxKontextMaxModel } from './flux-kontext-max';

// Google Models (Imagen)
import { Imagen4FastModel } from './imagen4-fast';
import { Imagen4Model } from './imagen4';
import { Imagen4UltraModel } from './imagen4-ultra';

// Ideogram Models
import { IdeogramV3QualityModel } from './ideogram-v3-quality';
import { IdeogramV3TurboModel } from './ideogram-v3-turbo';

// Other Models (Alphabetical)
import { NanoBananaModel } from './nano-banana';
import { ProteusV03Model } from './proteus-v0-3';
import { QwenImageModel } from './qwen-image';
import { SeeDream4Model } from './seedream4';

export type ModelKey = 
  // FLUX Models
  | 'flux_1_1_pro' 
  | 'flux_1_1_pro_ultra' 
  | 'flux_kontext_max'
  // Google Models  
  | 'imagen4_fast'
  | 'imagen4' 
  | 'imagen4_ultra'
  // Ideogram Models
  | 'ideogram_v3_quality'
  | 'ideogram_v3_turbo' 
  // Other Models
  | 'nano_banana'
  | 'proteus_v0_3'
  | 'qwen_image'
  | 'seedream4';

class ModelRegistry {
  private models: Map<ModelKey, BaseModel> = new Map();

  constructor() {
    // FLUX Models (Black Forest Labs) - Alphabetical
    this.register(new Flux11ProModel());
    this.register(new Flux11ProUltraModel());
    this.register(new FluxKontextMaxModel());
    
    // Google Models (Imagen) - Alphabetical
    this.register(new Imagen4FastModel());
    this.register(new Imagen4Model());
    this.register(new Imagen4UltraModel());
    
    // Ideogram Models - Alphabetical
    this.register(new IdeogramV3QualityModel());
    this.register(new IdeogramV3TurboModel());
    
    // Other Models - Alphabetical
    this.register(new NanoBananaModel());
    this.register(new ProteusV03Model());
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
      'flux_1_1_pro',
      'flux_1_1_pro_ultra', 
      'flux_kontext_max',
      // Google Models
      'imagen4_fast',
      'imagen4',
      'imagen4_ultra',
      // Ideogram Models
      'ideogram_v3_quality',
      'ideogram_v3_turbo',
      // Other Models
      'nano_banana',
      'proteus_v0_3',
      'qwen_image',
      'seedream4'
    ];
    
    return orderedKeys.map(key => this.getModel(key));
  }

  getModelsList() {
    return this.getAllModelsOrganized().map(model => ({
      key: model.key as ModelKey,
      replicateModelPath: model.replicateModelPath,
      ...model.capabilities,
      ...model.metadata,
    }));
  }

  getModelsByCategory() {
    return {
      'FLUX Models (Black Forest Labs)': [
        this.getModel('flux_1_1_pro'),
        this.getModel('flux_1_1_pro_ultra'),
        this.getModel('flux_kontext_max')
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
        this.getModel('proteus_v0_3'),
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