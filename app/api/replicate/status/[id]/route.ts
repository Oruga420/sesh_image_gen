import { NextRequest, NextResponse } from "next/server";
import { REPLICATE_API } from "@/lib/replicate";
import {
  extractAllImageUrlsFromReplicateOutput,
  extractImageUrlFromReplicateOutput,
} from "@/lib/utils/replicateOutput";

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
      console.error("?? Missing prediction ID in request");
      return NextResponse.json({ error: "Missing prediction ID" }, { status: 400 });
    }

    const apiToken = process.env.REPLICATE_API_TOKEN;

    if (!apiToken) {
      console.error("?? REPLICATE_API_TOKEN missing in status check!");
      return NextResponse.json({
        error: "REPLICATE_API_TOKEN environment variable is not set"
      }, { status: 500 });
    }

    const searchParams = req.nextUrl.searchParams;
    const waitParam = searchParams.get("wait");
    const waitSecondsRaw = waitParam ? Number(waitParam) : undefined;
    const waitSeconds = Number.isFinite(waitSecondsRaw) ? waitSecondsRaw! : 2;
    const clampedWait = Math.max(1, Math.min(waitSeconds, 60));

    console.log(
      "? API Token present for status check:",
      apiToken.substring(0, 10) + "...",
      "| wait=",
      clampedWait
    );

    const response = await fetch(`${REPLICATE_API}/predictions/${predictionId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        Prefer: `wait=${clampedWait}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("?? Replicate status fetch failed:", response.status, errorText);
      return NextResponse.json(
        { error: `Replicate status error ${response.status}` },
        { status: response.status }
      );
    }

    const prediction = await response.json();

    console.log("\n??? RAW REPLICATE STATUS RESPONSE:");
    console.log(JSON.stringify(prediction, null, 2));

    const primaryImageUrl = extractImageUrlFromReplicateOutput(
      prediction.output
    );
    const imageUrls = extractAllImageUrlsFromReplicateOutput(
      prediction.output
    );

    const responsePayload = {
      id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      imageUrl: primaryImageUrl,
      imageUrls,
      error: prediction.error,
      logs: prediction.logs,
    };

    console.log("\n?? RETURNING TO CLIENT:");
    console.log(JSON.stringify(responsePayload, null, 2));
    console.log("=== END STATUS CHECK ===\n");

    return NextResponse.json(responsePayload);
  } catch (error) {
    console.error("\n?? STATUS CHECK FAILED:");
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
