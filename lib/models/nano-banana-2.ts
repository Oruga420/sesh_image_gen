import { BaseModel, ModelCapabilities, ModelMetadata, ModelInput } from './base';

type ResolutionOption = '512' | '1K' | '2K' | '4K';
type OutputFormatOption = 'jpg' | 'png';
type AspectRatioOption =
    | 'match_input_image'
    | '1:1'
    | '1:4'
    | '1:8'
    | '2:3'
    | '3:2'
    | '3:4'
    | '4:1'
    | '4:3'
    | '4:5'
    | '5:4'
    | '8:1'
    | '9:16'
    | '16:9'
    | '21:9';
type SafetyFilterOption =
    | 'block_low_and_above'
    | 'block_medium_and_above'
    | 'block_only_high';

interface NanoBanana2Input extends ModelInput {
    prompt: string;
    image_input?: string[];
    resolution?: ResolutionOption;
    aspect_ratio?: AspectRatioOption;
    output_format?: OutputFormatOption;
    safety_filter_level?: SafetyFilterOption;
}

export class NanoBanana2Model extends BaseModel {
    readonly key = 'nano_banana_2';
    readonly replicateModelPath = 'google/nano-banana-2';

    readonly capabilities: ModelCapabilities = {
        supportsImageRef: true,
        supportsEdit: true,
    };

    readonly metadata: ModelMetadata = {
        name: 'Nano Banana 2',
        description:
            "Google's Gemini 3.1 Flash Image — fast, high-fidelity generation with accurate text rendering and up to 4K output",
        costPerImage: 4, // $0.04
        defaultSize: '1K',
    };

    validateInput(input: any): NanoBanana2Input {
        if (!input?.prompt || typeof input.prompt !== 'string') {
            throw new Error('prompt is required and must be a string');
        }

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

        const validResolutions: ResolutionOption[] = ['512', '1K', '2K', '4K'];
        const resolution: ResolutionOption =
            validResolutions.includes(input.resolution) ? input.resolution : '1K';

        const validAspectRatios: AspectRatioOption[] = [
            'match_input_image',
            '1:1',
            '1:4',
            '1:8',
            '2:3',
            '3:2',
            '3:4',
            '4:1',
            '4:3',
            '4:5',
            '5:4',
            '8:1',
            '9:16',
            '16:9',
            '21:9',
        ];
        const aspectRatio: AspectRatioOption | undefined =
            typeof input.aspect_ratio === 'string' &&
                validAspectRatios.includes(input.aspect_ratio)
                ? input.aspect_ratio
                : undefined;

        const validFormats: OutputFormatOption[] = ['jpg', 'png'];
        const outputFormat: OutputFormatOption =
            typeof input.output_format === 'string' &&
                validFormats.includes(input.output_format)
                ? input.output_format
                : 'jpg';

        // Only set safety filter if explicitly provided — omitting it lets the
        // model use its own default, which is less aggressive for normal content
        // like swimwear / fashion photography.
        const validSafetyFilters: SafetyFilterOption[] = [
            'block_low_and_above',
            'block_medium_and_above',
            'block_only_high',
        ];
        const safetyFilter: SafetyFilterOption | undefined =
            typeof input.safety_filter_level === 'string' &&
                validSafetyFilters.includes(input.safety_filter_level)
                ? input.safety_filter_level
                : undefined;

        const validated: NanoBanana2Input = {
            prompt: input.prompt,
            resolution,
            output_format: outputFormat,
        };

        if (safetyFilter) {
            validated.safety_filter_level = safetyFilter;
        }

        if (imageInput.length > 0) {
            validated.image_input = imageInput;
        }

        if (aspectRatio) {
            validated.aspect_ratio = aspectRatio;
        }

        return validated;
    }

    transformInput(input: NanoBanana2Input): Record<string, any> {
        const transformed: Record<string, any> = {
            prompt: input.prompt,
            resolution: input.resolution ?? '1K',
            output_format: input.output_format ?? 'jpg',
        };

        // Only include safety_filter_level if explicitly set
        if (input.safety_filter_level) {
            transformed.safety_filter_level = input.safety_filter_level;
        }

        if (input.image_input && input.image_input.length > 0) {
            transformed.image_input = input.image_input;
        }

        if (input.aspect_ratio) {
            transformed.aspect_ratio = input.aspect_ratio;
        }

        return transformed;
    }
}
