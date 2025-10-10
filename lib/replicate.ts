export const REPLICATE_API = "https://api.replicate.com/v1";

export async function createPrediction(
  version: string,
  input: Record<string, any>,
  stream = true
) {
  const r = await fetch(`${REPLICATE_API}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN!}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ version, input, stream }),
  });
  
  if (!r.ok) {
    const error = await r.text();
    throw new Error(`Replicate error ${r.status}: ${error}`);
  }
  
  return r.json(); // contains prediction + urls.stream if supported
}