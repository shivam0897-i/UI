import { API_PREFIX } from '@/api/client';
import { getStoredAccessToken } from '@/contexts/AuthContext';
import type { ImageSize } from '@/api/endpoints';

/**
 * Construct the URL to serve an image file by its ID.
 * Supports optional size variants: 'thumbnail' (200px), 'medium' (800px).
 */
export function getImageUrl(imageId: string, size?: ImageSize): string {
  const base = `${API_PREFIX}/images/${imageId}/file`;
  return size ? `${base}?size=${size}` : base;
}

/** Whether authenticated image fetching is needed (JWT token present). */
export function needsAuthFetch(): boolean {
  return Boolean(getStoredAccessToken());
}

// In-memory cache to avoid re-fetching the same image
const blobUrlCache = new Map<string, string>();

/**
 * Fetch an image using JWT auth headers and return an object URL.
 * Caches results so each image is only fetched once per session.
 */
export async function fetchAuthImageUrl(
  imageId: string,
  size?: ImageSize,
): Promise<string> {
  const cacheKey = size ? `${imageId}:${size}` : imageId;
  const cached = blobUrlCache.get(cacheKey);
  if (cached) return cached;

  const headers: Record<string, string> = {};
  const token = getStoredAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(getImageUrl(imageId, size), { headers });
  if (!res.ok) {
    console.warn(`Image ${imageId} returned ${res.status}`);
    return '';
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  blobUrlCache.set(cacheKey, url);
  return url;
}

/**
 * Revoke a cached blob URL to free memory.
 * Call when an image component unmounts.
 */
export function revokeImageUrl(imageId: string, size?: ImageSize): void {
  const cacheKey = size ? `${imageId}:${size}` : imageId;
  const url = blobUrlCache.get(cacheKey);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(cacheKey);
  }
}

/**
 * Revoke all cached blob URLs. Call on logout.
 */
export function revokeAllImageUrls(): void {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache.clear();
}

