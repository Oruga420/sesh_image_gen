import { NextRequest, NextResponse } from "next/server";
import { modelRegistry, ModelKey } from "@/lib/models/registry";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { modelKey, input } = await req.json();
    
    if (!modelKey) {
      return NextResponse.json({ error: "Missing modelKey" }, { status: 400 });
    }

    // Get the model implementation
    const model = modelRegistry.getModel(modelKey as ModelKey);
    
    // Validate and transform input using model-specific logic
    const validatedInput = model.validateInput(input);
    
    // Create prediction using the model's implementation
    const prediction = await model.createPrediction(validatedInput);
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}