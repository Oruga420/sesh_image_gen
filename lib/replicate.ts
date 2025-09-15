export const REPLICATE_API = "https://api.replicate.com/v1";

export async function createPrediction(
  modelPath: string,
  input: Record<string, any>,
  stream = true
) {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN environment variable is not set");
  }

  const body = {
    model: modelPath,
    input,
    stream,
  };

  const r = await fetch(`${REPLICATE_API}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${apiToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  
  if (!r.ok) {
    const error = await r.text();
    throw new Error(`Replicate error ${r.status}: ${error}`);
  }
  
  return r.json(); // contains prediction + urls.stream if supported
}