import { NextRequest, NextResponse } from "next/server";
import { generateImage, editImage } from "@/lib/openai";
import { MODELS, ModelKey } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { modelKey, input } = await req.json();

    // Validate model key
    if (!modelKey || !MODELS[modelKey as ModelKey]) {
      return NextResponse.json({ error: "Invalid model key" }, { status: 400 });
    }

    const model = MODELS[modelKey as ModelKey];

    // Ensure it's an OpenAI model
    if (model.provider !== "openai" || !model.openaiModel) {
      return NextResponse.json(
        { error: "This endpoint only supports OpenAI models" },
        { status: 400 }
      );
    }

    const {
      prompt,
      image_input,
      mask,
      size,
      quality,
      output_format,
      output_compression,
      background,
      input_fidelity
    } = input;

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid or missing prompt" },
        { status: 400 }
      );
    }

    let response;

    // Check if this is an edit request (image_input provided)
    if (image_input && image_input.length > 0) {
      // Use edit endpoint
      response = await editImage(
        image_input[0], // First image as base64 or URL
        prompt,
        {
          size: size || "1024x1024",
          quality: quality || "auto",
          output_format: output_format || "png",
          output_compression,
          background: background || "auto",
          mask,
          input_fidelity: input_fidelity || "low",
        }
      );
    } else {
      // Use generation endpoint
      response = await generateImage(prompt, {
        size: size || "1024x1024",
        quality: quality || "auto",
        output_format: output_format || "png",
        output_compression,
        background: background || "auto",
      });
    }

    // Extract image data
    const images = response.data.map((item) => ({
      b64_json: item.b64_json,
      revised_prompt: item.revised_prompt,
    }));

    return NextResponse.json({
      success: true,
      images,
      created: response.created,
    });
  } catch (error) {
    console.error("OpenAI generation error:", error);

    // Handle OpenAI specific errors
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: error.message,
          details: error.stack,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Unknown error occurred" },
      { status: 500 }
    );
  }
}
