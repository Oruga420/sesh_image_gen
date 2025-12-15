import OpenAI from "openai";

let cachedGroqClient: OpenAI | null = null;

export function getGroqClient() {
  if (cachedGroqClient) return cachedGroqClient;

  const apiKey = process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Missing GROQ_API_KEY (or OPENAI_API_KEY). Add it to your environment variables.",
    );
  }

  cachedGroqClient = new OpenAI({
    apiKey,
    baseURL: "https://api.groq.com/openai/v1",
  });

  return cachedGroqClient;
}
