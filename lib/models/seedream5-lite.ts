import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

interface SeeDream5LiteInput extends ModelInput {
    prompt: string;
    image_input?: string[];
    size?: string;
    aspect_ratio?: string;
    output_format?: string;
    sequential_image_generation?: string;
    max_images?: number;
}

export class SeeDream5LiteModel extends BaseModel {
    readonly key = 'seedream5_lite';
    readonly replicateModelPath = 'bytedance/seedream-5-lite';

    readonly capabilities: ModelCapabilities = {
        supportsImageRef: true,
        supportsEdit: true,
    };

    readonly metadata: ModelMetadata = {
        name: 'SeeDream 5.0 Lite',
        description:
            'ByteDance lightweight text-to-image & editing model with text rendering, multi-image blending, and batch generation at up to 3K',
        costPerImage: 2.5, // $0.025
        defaultSize: '2K',
    };

    validateInput(input: any): SeeDream5LiteInput {
        if (!input?.prompt || typeof input.prompt !== 'string') {
            throw new Error('prompt is required and must be a string');
        }

        // Validate image_input (up to 14 reference images)
        let imageInput: string[] = [];
        if (Array.isArray(input.image_input)) {
            imageInput = input.image_input.filter(
                (url: unknown) => typeof url === 'string' && url.trim().length > 0
            );
            if (imageInput.length > 14) {
                imageInput = imageInput.slice(0, 14);
            }
        } else if (typeof input.image_input === 'string') {
            imageInput = [input.image_input];
        }

        // Validate size: 2K or 3K
        let size = input.size || '2K';
        const validSizes = ['2K', '3K'];
        if (!validSizes.includes(size)) {
            size = '2K';
        }

        // Validate aspect ratio
        const validAspectRatios = [
            '1:1', '4:3', '3:4', '16:9', '9:16', '3:2', '2:3', '21:9',
        ];
        let aspectRatio: string | undefined;
        if (
            typeof input.aspect_ratio === 'string' &&
            validAspectRatios.includes(input.aspect_ratio)
        ) {
            aspectRatio = input.aspect_ratio;
        }

        // Validate output format
        const validFormats = ['png', 'jpg'];
        let outputFormat = 'png';
        if (
            typeof input.output_format === 'string' &&
            validFormats.includes(input.output_format)
        ) {
            outputFormat = input.output_format;
        }

        // Validate sequential_image_generation
        let sequentialGeneration = input.sequential_image_generation;
        if (
            sequentialGeneration &&
            !['disabled', 'auto'].includes(sequentialGeneration)
        ) {
            sequentialGeneration = undefined;
        }

        // Validate max_images (1–15)
        let maxImages = input.max_images;
        if (typeof maxImages === 'number' && (maxImages < 1 || maxImages > 15)) {
            maxImages = Math.max(1, Math.min(15, maxImages));
        }

        const validated: SeeDream5LiteInput = {
            prompt: input.prompt,
            output_format: outputFormat,
        };

        if (imageInput.length > 0) validated.image_input = imageInput;
        if (size !== '2K') validated.size = size;
        if (aspectRatio) validated.aspect_ratio = aspectRatio;
        if (sequentialGeneration && sequentialGeneration !== 'disabled') {
            validated.sequential_image_generation = sequentialGeneration;
        }
        if (typeof maxImages === 'number' && maxImages > 1) {
            validated.max_images = maxImages;
        }

        return validated;
    }

    transformInput(input: SeeDream5LiteInput): Record<string, any> {
        const transformed: Record<string, any> = {
            prompt: input.prompt,
            output_format: input.output_format ?? 'png',
        };

        if (input.image_input && input.image_input.length > 0) {
            transformed.image_input = input.image_input;
        }

        if (input.size) {
            transformed.size = input.size;
        }

        if (input.aspect_ratio) {
            transformed.aspect_ratio = input.aspect_ratio;
        }

        if (input.sequential_image_generation) {
            transformed.sequential_image_generation = input.sequential_image_generation;
        }

        if (input.max_images) {
            transformed.max_images = input.max_images;
        }

        return transformed;
    }
}
