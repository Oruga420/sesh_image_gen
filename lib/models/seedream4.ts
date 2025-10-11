import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface SeeDream4Input extends ModelInput {
  prompt: string;
  image_input?: string[];
  size?: string;
  aspect_ratio?: string;
  width?: number;
  height?: number;
  sequential_image_generation?: string;
  max_images?: number;
}

export class SeeDream4Model extends BaseModel {
  readonly key = 'seedream4';
  readonly replicateModelPath = 'bytedance/seedream-4';
  
  readonly capabilities: ModelCapabilities = {
    supportsImageRef: true,
    supportsEdit: true,
  };
  
  readonly metadata: ModelMetadata = {
    name: 'SeeDream-4',
    description: 'Unified text-to-image generation and precise single-sentence editing at up to 4K resolution',
    costPerImage: 3, // $0.03
    defaultSize: '2K',
  };

  validateInput(input: any): SeeDream4Input {
    console.log("\n🌟 SEEDREAM-4 INPUT VALIDATION:");
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!input.prompt || typeof input.prompt !== 'string') {
      console.error("❌ Invalid prompt:", input.prompt);
      throw new Error('prompt is required and must be a string');
    }

    // Validate image_input if provided
    let imageInput: string[] = [];
    if (input.image_input) {
      console.log("🖼️ Processing image_input:", input.image_input);
      if (Array.isArray(input.image_input)) {
        imageInput = input.image_input.filter((url: any) => typeof url === 'string');
        if (imageInput.length > 10) {
          console.warn("⚠️ Too many images, limiting to 10");
          imageInput = imageInput.slice(0, 10);
        }
        console.log("✅ Filtered image URLs:", imageInput.length, "valid URLs");
      } else if (typeof input.image_input === 'string') {
        imageInput = [input.image_input];
        console.log("✅ Single image URL converted to array");
      }
    } else {
      console.log("📝 No image_input provided");
    }

    // Validate size parameter
    let size = input.size || '2K';
    const validSizes = ['1K', '2K', '4K', 'custom'];
    if (!validSizes.includes(size)) {
      console.warn(`⚠️ Invalid size "${size}", defaulting to "2K"`);
      size = '2K';
    }

    // Validate custom dimensions if size is 'custom'
    let width = input.width;
    let height = input.height;
    if (size === 'custom') {
      if (typeof width !== 'number' || width < 1024 || width > 4096) {
        console.warn(`⚠️ Invalid width "${width}", defaulting to 2048`);
        width = 2048;
      }
      if (typeof height !== 'number' || height < 1024 || height > 4096) {
        console.warn(`⚠️ Invalid height "${height}", defaulting to 2048`);
        height = 2048;
      }
    }

    // Validate sequential_image_generation
    let sequentialGeneration = input.sequential_image_generation;
    if (sequentialGeneration && !['disabled', 'auto'].includes(sequentialGeneration)) {
      console.warn(`⚠️ Invalid sequential_image_generation "${sequentialGeneration}", defaulting to "disabled"`);
      sequentialGeneration = 'disabled';
    }

    // Validate max_images
    let maxImages = input.max_images;
    if (typeof maxImages === 'number' && (maxImages < 1 || maxImages > 15)) {
      console.warn(`⚠️ Invalid max_images "${maxImages}", clamping to range 1-15`);
      maxImages = Math.max(1, Math.min(15, maxImages));
    }

    const validated: SeeDream4Input = {
      prompt: input.prompt,
    };

    // Only add optional parameters if they have valid values
    if (imageInput.length > 0) {
      validated.image_input = imageInput;
    }
    
    if (size !== '2K') { // Only include if not default
      validated.size = size;
    }
    
    if (input.aspect_ratio && typeof input.aspect_ratio === 'string') {
      validated.aspect_ratio = input.aspect_ratio;
    }
    
    if (size === 'custom') {
      validated.width = width;
      validated.height = height;
    }
    
    if (sequentialGeneration && sequentialGeneration !== 'disabled') {
      validated.sequential_image_generation = sequentialGeneration;
    }
    
    if (typeof maxImages === 'number' && maxImages > 1) {
      validated.max_images = maxImages;
    }
    
    console.log("✅ Validated input:", JSON.stringify(validated, null, 2));
    return validated;
  }

  transformInput(input: SeeDream4Input): Record<string, any> {
    console.log("\n🔄 SEEDREAM-4 INPUT TRANSFORMATION:");
    console.log("Input to transform:", JSON.stringify(input, null, 2));
    
    const transformed: Record<string, any> = {
      prompt: input.prompt,
    };

    // Only include parameters that have values
    if (input.image_input && input.image_input.length > 0) {
      transformed.image_input = input.image_input;
      console.log("🖼️ Including", input.image_input.length, "reference images");
    } else {
      console.log("📝 No reference images to include");
    }

    if (input.size) {
      transformed.size = input.size;
      console.log("📏 Size:", input.size);
    }

    if (input.aspect_ratio) {
      transformed.aspect_ratio = input.aspect_ratio;
      console.log("📐 Aspect ratio:", input.aspect_ratio);
    }

    if (input.width) {
      transformed.width = input.width;
      console.log("↔️ Custom width:", input.width);
    }

    if (input.height) {
      transformed.height = input.height;
      console.log("↕️ Custom height:", input.height);
    }

    if (input.sequential_image_generation) {
      transformed.sequential_image_generation = input.sequential_image_generation;
      console.log("🔄 Sequential generation:", input.sequential_image_generation);
    }

    if (input.max_images) {
      transformed.max_images = input.max_images;
      console.log("🔢 Max images:", input.max_images);
    }

    console.log("✅ Transformed for Replicate:", JSON.stringify(transformed, null, 2));
    return transformed;
  }
}