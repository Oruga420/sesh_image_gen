import { NextRequest, NextResponse } from "next/server";
import { modelRegistry, ModelKey } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { modelKey, input } = await req.json();

    if (!modelKey) {
      return NextResponse.json({ error: "Invalid model key" }, { status: 400 });
    }

    // Get the model from registry
    const model = modelRegistry.getModel(modelKey as ModelKey);

    // Ensure this is a Replicate model (not OpenAI)
    if ((model as any).provider === "openai") {
      return NextResponse.json(
        { error: "This endpoint only supports Replicate models" },
        { status: 400 }
      );
    }

    // Validate input
    const validatedInput = model.validateInput(input);

    // Create prediction using the model's method
    const prediction = await model.createPrediction(validatedInput);

    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      streamUrl: prediction.streamUrl ?? null,
      webUrl: prediction.webUrl ?? null,
    });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
