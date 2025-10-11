import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const predictionId = params.id;
  console.log("\n=== REPLICATE STATUS CHECK ===");
  console.log("Checking status for prediction:", predictionId);
  console.log("Timestamp:", new Date().toISOString());

  try {
    if (!predictionId) {
      console.error("❌ Missing prediction ID in request");
      return NextResponse.json({ error: "Missing prediction ID" }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      console.error("❌ REPLICATE_API_TOKEN missing in status check!");
      return NextResponse.json({
        error: "REPLICATE_API_TOKEN environment variable is not set"
      }, { status: 500 });
    }

    console.log("✅ API Token present for status check:", apiToken.substring(0, 10) + "...");

    // Use the official Replicate client to get prediction status
    console.log("🔄 Initializing Replicate client for status check...");
    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({
      auth: apiToken,
    });

    console.log("📡 Calling replicate.predictions.get for:", predictionId);
    const prediction = await replicate.predictions.get(predictionId);

    console.log("\n📥 RAW REPLICATE STATUS RESPONSE:");
    console.log("Full prediction object:", JSON.stringify(prediction, null, 2));

    // Detailed status analysis
    console.log("\n📊 STATUS ANALYSIS:");
    console.log(`Status: ${prediction.status}`);
    console.log(`Has output: ${prediction.output ? 'YES' : 'NO'}`);
    console.log(`Has error: ${prediction.error ? 'YES' : 'NO'}`);
    console.log(`Created at: ${prediction.created_at}`);
    console.log(`Started at: ${prediction.started_at}`);
    console.log(`Completed at: ${prediction.completed_at}`);

    if (prediction.output) {
      console.log("🖼️ OUTPUT DETAILS:");
      console.log("Output type:", typeof prediction.output);
      console.log("Is array:", Array.isArray(prediction.output));
      console.log("Output content:", prediction.output);
      if (Array.isArray(prediction.output)) {
        console.log("Array length:", prediction.output.length);
        prediction.output.forEach((item, idx) => {
          console.log(`Item ${idx}:`, item);
        });
      }
    }

    if (prediction.error) {
      console.error("❌ PREDICTION ERROR:", prediction.error);
    }

    if (prediction.logs) {
      console.log("📝 PREDICTION LOGS:", prediction.logs);
    }

    const response = {
      id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      error: prediction.error,
      logs: prediction.logs,
    };

    console.log("\n📤 RETURNING TO CLIENT:");
    console.log(JSON.stringify(response, null, 2));
    console.log("=== END STATUS CHECK ===\n");

    return NextResponse.json(response);
  } catch (error) {
    console.error("\n❌ STATUS CHECK FAILED:");
    console.error("Error type:", error?.constructor?.name);
    console.error("Error message:", error instanceof Error ? error.message : "Unknown error");
    console.error("Full error:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : "No stack");
    console.error("=== END STATUS CHECK (ERROR) ===\n");

    return NextResponse.json({
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
