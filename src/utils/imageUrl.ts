import { API_PREFIX } from '@/api/client';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;

/**
 * Construct the URL to serve an image file by its ID.
 * For public spaces, returns a direct URL.
 * For private spaces (when HF_TOKEN is set), images must be fetched
 * with auth headers — use `fetchImageBlob` instead.
 */
export function getImageUrl(imageId: string): string {
  return `${API_PREFIX}/images/${imageId}/file`;
}

/** Whether authenticated image fetching is needed (private HF Space). */
export const needsAuthFetch = Boolean(HF_TOKEN);

// In-memory cache to avoid re-fetching the same image
const blobUrlCache = new Map<string, string>();

/**
 * Fetch an image using auth headers and return an object URL.
 * Caches results so each image is only fetched once.
 */
export async function fetchAuthImageUrl(imageId: string): Promise<string> {
  const cached = blobUrlCache.get(imageId);
  if (cached) return cached;

  const headers: Record<string, string> = {};
  if (HF_TOKEN) {
    headers.Authorization = `Bearer ${HF_TOKEN}`;
  }

  const res = await fetch(getImageUrl(imageId), { headers });
  if (!res.ok) {
    console.warn(`Image ${imageId} returned ${res.status}`);
    return '';
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  blobUrlCache.set(imageId, url);
  return url;
}
