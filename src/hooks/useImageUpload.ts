import { useState, useCallback } from 'react';
import { ingestImage, ingestImageByUrl, getImageMetadata } from '@/api/endpoints';
import type { IngestResponse, ImageDocument } from '@/api/types';

export type UploadStatus = 'idle' | 'uploading' | 'polling' | 'done' | 'error';

interface UploadState {
  status: UploadStatus;
  progress: number; // 0-100 estimate
  result: IngestResponse | null;
  metadata: ImageDocument | null;
  error: string | null;
}

interface UseImageUploadReturn extends UploadState {
  uploadFile: (file: File) => Promise<void>;
  uploadUrl: (url: string) => Promise<void>;
  reset: () => void;
}

const INITIAL_STATE: UploadState = {
  status: 'idle',
  progress: 0,
  result: null,
  metadata: null,
  error: null,
};

/**
 * Handles single image upload (file or URL) + polls for processing completion.
 * Progress is simulated since fetch doesn't support upload progress natively.
 */
export function useImageUpload(): UseImageUploadReturn {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);

  const pollForCompletion = useCallback(async (imageId: string): Promise<ImageDocument | null> => {
    const maxAttempts = 40; // 40 × 1.5s = 60 seconds
    for (let i = 0; i < maxAttempts; i++) {
      try {
        const doc = await getImageMetadata(imageId);
        if (doc.status === 'completed' || doc.status === 'failed') {
          return doc;
        }
      } catch {
        // Metadata not ready yet
      }
      await new Promise((r) => setTimeout(r, 1500));
      // Increment progress during polling
      setState((prev) => ({
        ...prev,
        progress: Math.min(95, 50 + (i / maxAttempts) * 45),
      }));
    }
    return null;
  }, []);

  const handleIngest = useCallback(
    async (ingestFn: () => Promise<IngestResponse>) => {
      setState({ status: 'uploading', progress: 10, result: null, metadata: null, error: null });

      try {
        setState((prev) => ({ ...prev, progress: 30 }));
        const result = await ingestFn();
        setState((prev) => ({ ...prev, status: 'polling', progress: 50, result }));

        const metadata = await pollForCompletion(result.image_id);

        if (metadata?.status === 'failed') {
          setState((prev) => ({
            ...prev,
            status: 'error',
            progress: 0,
            metadata,
            error: 'Image processing failed on the backend.',
          }));
        } else if (metadata) {
          setState((prev) => ({ ...prev, status: 'done', progress: 100, metadata }));
        } else {
          // Polling timed out — still set as done (processing may finish later)
          setState((prev) => ({
            ...prev,
            status: 'done',
            progress: 100,
            error: 'Processing is taking longer than expected. Check back later.',
          }));
        }
      } catch (err) {
        setState((prev) => ({
          ...prev,
          status: 'error',
          progress: 0,
          error: err instanceof Error ? err.message : 'Upload failed',
        }));
      }
    },
    [pollForCompletion],
  );

  const uploadFile = useCallback(
    (file: File) => handleIngest(() => ingestImage(file)),
    [handleIngest],
  );

  const uploadUrl = useCallback(
    (url: string) => handleIngest(() => ingestImageByUrl(url)),
    [handleIngest],
  );

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, uploadFile, uploadUrl, reset };
}
