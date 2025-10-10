import OpenAI from 'openai';

// Initialize OpenAI client
export const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  return new OpenAI({
    apiKey,
  });
};

// Generate image with GPT Image 1
export async function generateImage(
  prompt: string,
  options?: {
    size?: '1024x1024' | '1024x1536' | '1536x1024';
    quality?: 'low' | 'medium' | 'high' | 'auto';
    output_format?: 'png' | 'jpeg' | 'webp';
    output_compression?: number; // 0-100
    background?: 'transparent' | 'opaque' | 'auto';
  }
) {
  const client = getOpenAIClient();

  // Default options
  const defaultOptions = {
    size: '1024x1024' as const,
    quality: 'auto' as const,
    output_format: 'png' as const,
  };

  // Merge options
  const finalOptions: any = { ...defaultOptions, ...options };

  const requestBody: any = {
    model: 'gpt-image-1',
    prompt,
    size: finalOptions.size,
    quality: finalOptions.quality,
    response_format: 'b64_json',
  };

  // Add optional parameters
  if (finalOptions.output_format && finalOptions.output_format !== 'png') {
    requestBody.output_format = finalOptions.output_format;
  }
  if (finalOptions.output_compression) {
    requestBody.output_compression = finalOptions.output_compression;
  }
  if (finalOptions.background && finalOptions.background !== 'auto') {
    requestBody.background = finalOptions.background;
  }

  const response = await client.images.generate(requestBody);

  return response;
}

// Edit image with GPT Image 1
export async function editImage(
  imageUrl: string,
  prompt: string,
  options?: {
    size?: '1024x1024' | '1024x1536' | '1536x1024';
    quality?: 'low' | 'medium' | 'high' | 'auto';
    output_format?: 'png' | 'jpeg' | 'webp';
    output_compression?: number;
    background?: 'transparent' | 'opaque' | 'auto';
    mask?: string; // base64 or URL
    input_fidelity?: 'low' | 'high';
  }
) {
  const client = getOpenAIClient();

  const defaultOptions = {
    size: '1024x1024' as const,
    quality: 'auto' as const,
    output_format: 'png' as const,
  };

  const finalOptions: any = { ...defaultOptions, ...options };

  const requestBody: any = {
    model: 'gpt-image-1',
    prompt,
    image: imageUrl,
    size: finalOptions.size,
    quality: finalOptions.quality,
    response_format: 'b64_json',
  };

  // Add optional parameters
  if (finalOptions.output_format && finalOptions.output_format !== 'png') {
    requestBody.output_format = finalOptions.output_format;
  }
  if (finalOptions.output_compression) {
    requestBody.output_compression = finalOptions.output_compression;
  }
  if (finalOptions.background && finalOptions.background !== 'auto') {
    requestBody.background = finalOptions.background;
  }
  if (finalOptions.input_fidelity) {
    requestBody.input_fidelity = finalOptions.input_fidelity;
  }
  if (finalOptions.mask) {
    requestBody.mask = finalOptions.mask;
  }

  const response = await client.images.edit(requestBody);

  return response;
}
