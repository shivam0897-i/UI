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

// ─── Two-tier cache: in-memory blob URLs + persistent Cache API ─────

const CACHE_NAME = 'askframe-images-v1';
const blobUrlCache = new Map<string, string>();
// Track in-flight fetches to deduplicate concurrent requests
const pendingFetches = new Map<string, Promise<string>>();

function cacheKey(imageId: string, size?: ImageSize): string {
  return size ? `${imageId}:${size}` : imageId;
}

/**
 * Try to restore an image from the persistent Cache API.
 * Returns a blob object URL if found, otherwise null.
 */
async function readFromPersistentCache(url: string): Promise<Blob | null> {
  try {
    const cache = await caches.open(CACHE_NAME);
    const match = await cache.match(url);
    if (match) return match.blob();
  } catch {
    // Cache API unavailable (e.g. opaque origin) — fall through
  }
  return null;
}

/**
 * Store a network response in the persistent Cache API.
 */
async function writeToPersistentCache(url: string, response: Response): Promise<void> {
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(url, response);
  } catch {
    // Silently fail — persistent cache is a nice-to-have
  }
}

/**
 * Fetch an image using JWT auth headers and return an object URL.
 * Two-tier cache:
 *   1. In-memory Map (instant, current session)
 *   2. Persistent Cache API (survives page refreshes, 24h)
 * Deduplicates concurrent requests for the same image.
 */
export async function fetchAuthImageUrl(
  imageId: string,
  size?: ImageSize,
): Promise<string> {
  const key = cacheKey(imageId, size);

  // Tier 1: in-memory
  const memCached = blobUrlCache.get(key);
  if (memCached) return memCached;

  // Deduplicate: if this exact image is already being fetched, wait for it
  const pending = pendingFetches.get(key);
  if (pending) return pending;

  const fetchPromise = (async () => {
    const fileUrl = getImageUrl(imageId, size);

    // Tier 2: persistent Cache API
    const persistedBlob = await readFromPersistentCache(fileUrl);
    if (persistedBlob) {
      const url = URL.createObjectURL(persistedBlob);
      blobUrlCache.set(key, url);
      return url;
    }

    // Tier 3: network fetch
    const headers: Record<string, string> = {};
    const token = getStoredAccessToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(fileUrl, { headers });
    if (!res.ok) {
      console.warn(`Image ${imageId} returned ${res.status}`);
      return '';
    }

    // Clone before consuming — one for cache, one for blob URL
    const cloned = res.clone();
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    blobUrlCache.set(key, url);

    // Persist in background (non-blocking)
    writeToPersistentCache(fileUrl, cloned);

    return url;
  })();

  pendingFetches.set(key, fetchPromise);
  try {
    return await fetchPromise;
  } finally {
    pendingFetches.delete(key);
  }
}

/**
 * Preload a batch of thumbnails in the background.
 * Useful for grid views to start fetching before components mount.
 */
export function preloadThumbnails(imageIds: string[]): void {
  for (const id of imageIds) {
    const key = cacheKey(id, 'thumbnail');
    if (!blobUrlCache.has(key) && !pendingFetches.has(key)) {
      // Fire-and-forget — errors are swallowed
      fetchAuthImageUrl(id, 'thumbnail').catch(() => {});
    }
  }
}

/**
 * Revoke a cached blob URL to free memory.
 */
export function revokeImageUrl(imageId: string, size?: ImageSize): void {
  const key = cacheKey(imageId, size);
  const url = blobUrlCache.get(key);
  if (url) {
    URL.revokeObjectURL(url);
    blobUrlCache.delete(key);
  }
}

/**
 * Revoke all cached blob URLs. Call on logout.
 * Also clears the persistent cache.
 */
export function revokeAllImageUrls(): void {
  for (const url of blobUrlCache.values()) {
    URL.revokeObjectURL(url);
  }
  blobUrlCache.clear();
  // Clear persistent cache too
  caches.delete(CACHE_NAME).catch(() => {});
}

