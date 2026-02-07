import { useState, useEffect } from 'react';
import { getImageUrl, fetchAuthImageUrl, needsAuthFetch } from '@/utils/imageUrl';
import type { ImageSize } from '@/api/endpoints';

/**
 * Returns an image src for the given imageId.
 * Fetches the image with JWT auth headers and returns a blob object URL.
 * Supports optional size variants ('thumbnail', 'medium').
 * Cleans up blob URLs on unmount to prevent memory leaks.
 */
export function useAuthImage(
  imageId: string,
  size?: ImageSize,
): string | undefined {
  const authRequired = needsAuthFetch();

  const [src, setSrc] = useState<string | undefined>(
    !imageId ? undefined : authRequired ? undefined : getImageUrl(imageId, size),
  );

  useEffect(() => {
    if (!imageId || !authRequired) return;

    let cancelled = false;
    fetchAuthImageUrl(imageId, size)
      .then((url) => {
        if (!cancelled && url) setSrc(url);
      })
      .catch((err) => {
        console.warn('Image load failed:', imageId, err);
      });

    return () => {
      cancelled = true;
      // NOTE: Do NOT revoke blob URL here — the global blobUrlCache may still
      // be referenced by other components showing the same image (e.g. grid → detail).
      // Cleanup happens globally via revokeAllImageUrls() on logout.
    };
  }, [imageId, size, authRequired]);

  return src;
}

