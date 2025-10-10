import { NextRequest } from "next/server";
import { groq } from "@/lib/groq";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { rawPrompt, mode = "enhance" } = await req.json();

    if (!rawPrompt) {
      return new Response("Missing rawPrompt", { status: 400 });
    }

    const stream = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      stream: true,
      response_format: { type: "json_object" },
      temperature: 0.3,
      max_completion_tokens: 2048,
      messages: [
        { 
          role: "system", 
          content: `You are an expert image generation prompt writer. Return ONLY a single JSON object with a "prompt" field containing the enhanced prompt. Mode: ${mode}` 
        },
        { 
          role: "user", 
          content: `Please ${mode} this image generation prompt to be more detailed and creative while maintaining the core concept:\n\n${rawPrompt}` 
        },
      ],
    });

    const encoder = new TextEncoder();
    const rs = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const token = chunk.choices?.[0]?.delta?.content || "";
            controller.enqueue(encoder.encode(`data: ${token}\n\n`));
          }
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(rs, {
      headers: { 
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive" 
      },
    });
  } catch (error) {
    console.error("Rewrite error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}