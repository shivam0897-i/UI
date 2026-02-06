import { useState, useEffect } from 'react';
import { getImageUrl, fetchAuthImageUrl, needsAuthFetch } from '@/utils/imageUrl';

/**
 * Returns an image src for the given imageId.
 * For private HF Spaces, fetches the image with auth headers
 * and returns a blob object URL. For public spaces, returns
 * the direct URL immediately.
 */
export function useAuthImage(imageId: string): string | undefined {
  const [src, setSrc] = useState<string | undefined>(
    !imageId ? undefined : needsAuthFetch ? undefined : getImageUrl(imageId),
  );

  useEffect(() => {
    if (!imageId || !needsAuthFetch) return;

    let cancelled = false;
    fetchAuthImageUrl(imageId)
      .then((url) => {
        if (!cancelled && url) setSrc(url);
      })
      .catch((err) => {
        console.warn('Image load failed:', imageId, err);
      });

    return () => {
      cancelled = true;
    };
  }, [imageId]);

  return src;
}
