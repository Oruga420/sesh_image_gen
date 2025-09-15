import { NextRequest, NextResponse } from "next/server";
import { modelRegistry, ModelKey } from "@/lib/models/registry";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  console.log("\n======================================");
  console.log("🚀 NEW IMAGE GENERATION REQUEST");
  console.log("Timestamp:", new Date().toISOString());
  console.log("======================================");
  
  try {
    const { modelKey, input } = await req.json();
    
    console.log("\n📨 REQUEST DETAILS:");
    console.log("Model key:", modelKey);
    console.log("Raw input:", JSON.stringify(input, null, 2));
    
    if (!modelKey) {
      console.error("❌ Missing modelKey in request!");
      return NextResponse.json({ error: "Missing modelKey" }, { status: 400 });
    }

    // Get the model implementation
    console.log("\n🎯 LOADING MODEL:");
    const model = modelRegistry.getModel(modelKey as ModelKey);
    console.log("Model class:", model.constructor.name);
    console.log("Model key:", model.key);
    console.log("Replicate path:", model.replicateModelPath);
    console.log("Capabilities:", JSON.stringify(model.capabilities, null, 2));
    
    // Validate and transform input using model-specific logic
    console.log("\n🔍 STARTING INPUT VALIDATION...");
    const validatedInput = model.validateInput(input);
    console.log("✅ Validation completed successfully");
    
    // Create prediction using the model's implementation
    console.log("\n🛠️ STARTING PREDICTION CREATION...");
    const prediction = await model.createPrediction(validatedInput);
    console.log("✅ Prediction creation completed");
    
    console.log("\n🎆 REQUEST COMPLETED SUCCESSFULLY");
    console.log("Returning prediction ID:", prediction.id);
    console.log("======================================\n");
    
    return NextResponse.json(prediction);
  } catch (error) {
    console.error("\n❌ PREDICTION REQUEST FAILED");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Full error object:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack");
    console.error("======================================\n");
    
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}