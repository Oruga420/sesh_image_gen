import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const predictionId = params.id;
    
    if (!predictionId) {
      return NextResponse.json({ error: "Missing prediction ID" }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;
    
    if (!apiToken) {
      return NextResponse.json({ 
        error: "REPLICATE_API_TOKEN environment variable is not set" 
      }, { status: 500 });
    }

    // Use the official Replicate client to get prediction status
    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({
      auth: apiToken,
    });
    
    const prediction = await replicate.predictions.get(predictionId);
    
    // Debug logging to see what we're getting
    console.log(`Status check for ${predictionId}: ${prediction.status}`);
    if (prediction.output) {
      console.log(`Output available:`, prediction.output);
    }
    if (prediction.error) {
      console.log(`Error in prediction:`, prediction.error);
    }
    
    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
      logs: prediction.logs,
    });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}