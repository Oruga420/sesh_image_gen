import { NextRequest } from "next/server";
import { getGroqClient } from "@/lib/groq";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("audio") as File;
    
    if (!file) {
      return new Response("No file provided", { status: 400 });
    }

    const groq = getGroqClient();
    const transcription = await groq.audio.transcriptions.create({
      file,
      model: "whisper-large-v3-turbo",
      response_format: "verbose_json",
      temperature: 0.0,
    });

    return Response.json({ 
      text: transcription.text, 
      raw: transcription 
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
