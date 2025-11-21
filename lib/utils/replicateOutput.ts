const REPLICATE_HOST = "https://replicate.delivery";

const VIDEO_PATTERNS = [
  /\/api\/videos\//i,
  /\.mp4(\?|$)/i,
  /\.mov(\?|$)/i,
  /\.webm(\?|$)/i,
];

const IMAGE_EXTENSION_REGEX = /\.(png|jpe?g|webp|gif|bmp|avif|heic|heif)(\?|$)/i;
const BASE64_KEYS = ["b64_json", "base64", "image_base64"];

const POSSIBLE_URL_KEYS = [
  "image",
  "image_url",
  "asset_url",
  "url",
  "path",
  "output",
  "outputs",
  "result",
  "results",
  "download_url",
  "thumbnail",
  "cover",
  "content",
  "data",
  "asset",
  "assets",
  "signed_url",
];

const ensureAbsoluteUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("data:image/")) return trimmed;
  if (trimmed.startsWith("//")) return `https:${trimmed}`;
  if (trimmed.startsWith("/api/")) {
    // Replicate returns relative asset paths sometimes (e.g. /api/images/...)
    return `${REPLICATE_HOST}${trimmed}`;
  }
  return trimmed;
};

const isVideoLike = (value: string) => {
  const lower = value.toLowerCase();
  return VIDEO_PATTERNS.some((pattern) => pattern.test(lower));
};

const isLikelyImageUrl = (value: string) => {
  const url = ensureAbsoluteUrl(value);
  if (!url || isVideoLike(url)) {
    return false;
  }

  const lower = url.toLowerCase();

  if (lower.startsWith("data:image/")) {
    return true;
  }

  if (lower.startsWith("http://") || lower.startsWith("https://")) {
    if (lower.includes("replicate.delivery")) {
      return true;
    }

    return IMAGE_EXTENSION_REGEX.test(lower);
  }

  return IMAGE_EXTENSION_REGEX.test(lower);
};

const toDataUrl = (base64: string, format?: unknown) => {
  const safeFormat =
    typeof format === "string" && format.trim()
      ? format.trim().toLowerCase()
      : "png";
  return `data:image/${safeFormat};base64,${base64}`;
};

const collectImageCandidates = (
  value: unknown,
  results: string[],
  visited: Set<unknown>
) => {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value === "string") {
    if (isLikelyImageUrl(value)) {
      results.push(ensureAbsoluteUrl(value));
    }
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectImageCandidates(item, results, visited);
    }
    return;
  }

  if (typeof value === "object") {
    if (visited.has(value)) {
      return;
    }
    visited.add(value);

    const record = value as Record<string, unknown>;

    for (const key of BASE64_KEYS) {
      if (typeof record[key] === "string" && record[key]) {
        results.push(toDataUrl(record[key] as string, record.format));
        return;
      }
    }

    for (const key of Object.keys(record)) {
      const current = record[key];
      if (current === undefined || current === null) continue;

      // If the key is known to potentially contain URLs, check it first
      if (POSSIBLE_URL_KEYS.includes(key) || typeof current === "string") {
        collectImageCandidates(current, results, visited);
      } else if (typeof current === "object") {
        collectImageCandidates(current, results, visited);
      }

      if (results.length > 0) {
        return;
      }
    }
  }
};

export const extractImageUrlFromReplicateOutput = (
  output: unknown
): string | null => {
  const results: string[] = [];
  collectImageCandidates(output, results, new Set());
  return results.length > 0 ? results[0] : null;
};

export const extractAllImageUrlsFromReplicateOutput = (
  output: unknown
): string[] => {
  const results: string[] = [];
  collectImageCandidates(output, results, new Set());
  return Array.from(new Set(results));
};
