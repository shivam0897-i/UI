import { useState, useCallback, useRef } from 'react';
import { batchIngest, getImageMetadata } from '@/api/endpoints';
import type { BatchIngestResult, ImageDocument } from '@/api/types';

export type BatchItemStatus = 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';

export interface BatchItem {
  file: File;
  previewUrl: string;
  status: BatchItemStatus;
  imageId: string | null;
  metadata: ImageDocument | null;
  error: string | null;
}

interface UseBatchUploadReturn {
  items: BatchItem[];
  isUploading: boolean;
  completedCount: number;
  failedCount: number;
  addFiles: (files: File[]) => void;
  removeFile: (index: number) => void;
  startUpload: () => Promise<void>;
  reset: () => void;
}

const MAX_BATCH_SIZE = 10;

/**
 * Manages batch image upload with per-item status tracking.
 * Sends files as a single multipart request, then polls each
 * image individually for processing completion.
 */
export function useBatchUpload(): UseBatchUploadReturn {
  const [items, setItems] = useState<BatchItem[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const abortRef = useRef(false);

  const addFiles = useCallback((files: File[]) => {
    const newItems: BatchItem[] = files.slice(0, MAX_BATCH_SIZE).map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
      status: 'pending' as const,
      imageId: null,
      metadata: null,
      error: null,
    }));
    setItems((prev) => [...prev, ...newItems].slice(0, MAX_BATCH_SIZE));
  }, []);

  const removeFile = useCallback((index: number) => {
    setItems((prev) => {
      const removed = prev[index];
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  }, []);

  const pollSingle = useCallback(async (imageId: string): Promise<ImageDocument | null> => {
    const maxAttempts = 40;
    for (let i = 0; i < maxAttempts; i++) {
      if (abortRef.current) return null;
      try {
        const doc = await getImageMetadata(imageId);
        if (doc.status === 'completed' || doc.status === 'failed') return doc;
      } catch {
        // not ready yet
      }
      await new Promise((r) => setTimeout(r, 1500));
    }
    return null;
  }, []);

  const startUpload = useCallback(async () => {
    if (items.length === 0) return;
    abortRef.current = false;
    setIsUploading(true);

    // Mark all as uploading
    setItems((prev) => prev.map((it) => ({ ...it, status: 'uploading' as const })));

    try {
      const files = items.map((it) => it.file);
      const response = await batchIngest(files);

      // Map results back to items
      const resultMap = new Map<string, BatchIngestResult>();
      response.results.forEach((r) => resultMap.set(r.filename, r));

      setItems((prev) =>
        prev.map((it) => {
          const result = resultMap.get(it.file.name);
          if (!result) {
            return { ...it, status: 'failed' as const, error: 'No result from server' };
          }
          if (result.status === 'error') {
            return { ...it, status: 'failed' as const, error: result.error || 'Upload failed' };
          }
          return {
            ...it,
            status: 'processing' as const,
            imageId: result.image_id || null,
          };
        }),
      );

      // Poll each processing image
      const currentItems = items.map((it) => {
        const result = resultMap.get(it.file.name);
        return { ...it, imageId: result?.image_id || null };
      });

      const pollPromises = currentItems.map(async (it, index) => {
        if (!it.imageId) return;
        const metadata = await pollSingle(it.imageId);
        setItems((prev) => {
          const updated = [...prev];
          if (updated[index]) {
            if (metadata?.status === 'completed') {
              updated[index] = { ...updated[index], status: 'completed', metadata };
            } else if (metadata?.status === 'failed') {
              updated[index] = { ...updated[index], status: 'failed', metadata, error: 'Processing failed' };
            } else {
              // Timeout — mark as completed (may finish later)
              updated[index] = { ...updated[index], status: 'completed' };
            }
          }
          return updated;
        });
      });

      await Promise.allSettled(pollPromises);
    } catch (err) {
      setItems((prev) =>
        prev.map((it) =>
          it.status === 'uploading'
            ? { ...it, status: 'failed' as const, error: err instanceof Error ? err.message : 'Batch upload failed' }
            : it,
        ),
      );
    } finally {
      setIsUploading(false);
    }
  }, [items, pollSingle]);

  const reset = useCallback(() => {
    abortRef.current = true;
    items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
    setItems([]);
    setIsUploading(false);
  }, [items]);

  const completedCount = items.filter((it) => it.status === 'completed').length;
  const failedCount = items.filter((it) => it.status === 'failed').length;

  return { items, isUploading, completedCount, failedCount, addFiles, removeFile, startUpload, reset };
}
