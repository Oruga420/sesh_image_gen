import { NextRequest, NextResponse } from "next/server";
import { createPrediction } from "@/lib/replicate";
import { MODELS, ModelKey } from "@/lib/models";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { modelKey, input } = await req.json();
    
    if (!modelKey || !MODELS[modelKey as ModelKey]) {
      return NextResponse.json({ error: "Invalid model key" }, { status: 400 });
    }

    const model = MODELS[modelKey as ModelKey];
    const version = process.env[model.versionEnv];
    
    if (!version) {
      return NextResponse.json({ 
        error: `Missing environment variable: ${model.versionEnv}` 
      }, { status: 500 });
    }
    
    const prediction = await createPrediction(version, input, true);
    
    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      streamUrl: prediction?.urls?.stream ?? null,
      webUrl: prediction?.urls?.get ?? null,
    });
  } catch (error) {
    console.error("Prediction error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}