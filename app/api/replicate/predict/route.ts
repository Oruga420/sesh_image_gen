import { NextRequest, NextResponse } from "next/server";
import { modelRegistry, ModelKey } from "@/lib/models/registry";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { modelKey, input } = await req.json();
    
    console.log("Received request:", { modelKey, input });
    
    if (!modelKey) {
      return NextResponse.json({ error: "Missing modelKey" }, { status: 400 });
    }

    // Get the model implementation
    const model = modelRegistry.getModel(modelKey as ModelKey);
    
    console.log("Using model:", model.replicateModelPath);
    
    // Validate and transform input using model-specific logic
    const validatedInput = model.validateInput(input);
    
    console.log("Validated input:", validatedInput);
    
    // Create prediction using the model's implementation
    const prediction = await model.createPrediction(validatedInput);
    
    console.log("Created prediction:", prediction);
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("Prediction error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "No stack");
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}