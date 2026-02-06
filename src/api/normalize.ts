// ─── Normalize Adapter ──────────────────────────────────────────────
// Converts 3 incompatible API response shapes into a unified NormalizedImage
// so shared components (ImageCard, ImageGrid) have ONE consistent interface.

import { getImageFileUrl } from './endpoints';
import type {
  ImageDocument,
  ImageListItem,
  SearchResult,
  NormalizedImage,
  DetectedObject,
  SceneTag,
} from './types';

/**
 * Normalize a full ImageDocument (from GET /images/{id})
 */
export function normalizeFromDocument(doc: ImageDocument): NormalizedImage {
  return {
    id: doc.image_id,
    imageUrl: getImageFileUrl(doc.image_id),
    caption: doc.caption,
    status: doc.status,
    objectLabels: (doc.objects ?? []).map((o) => o.label),
    objectDetails: doc.objects ?? [],
    sceneLabels: (doc.scene_tags ?? []).map((t) => t.label),
    sceneDetails: doc.scene_tags ?? [],
    score: null,
    ocrText: doc.ocr_text,
    createdAt: doc.created_at,
    filename: null, // not available in detail endpoint
    fileSizeBytes: doc.file_size_bytes,
    mimeType: doc.mime_type,
  };
}

/**
 * Normalize an ImageListItem (from GET /images).
 * Real API returns same shape as ImageDocument (objects, scene_tags).
 * Falls back to doc-documented fields (detected_objects, labels) if present.
 */
export function normalizeFromListItem(item: ImageListItem): NormalizedImage {
  // Prefer real API field `objects`, fall back to doc-documented `detected_objects`
  const objects: DetectedObject[] = item.objects
    ? item.objects
    : (item.detected_objects ?? []).map((obj) => ({
        label: obj.label,
        confidence: obj.confidence,
        bounding_box: obj.bbox,
      }));

  // Prefer real API field `scene_tags`, fall back to `labels`
  const sceneLabels: string[] = item.scene_tags
    ? item.scene_tags.map((t) => t.label)
    : item.labels ?? [];

  const sceneDetails: SceneTag[] | null = item.scene_tags ?? null;

  return {
    id: item.image_id,
    imageUrl: getImageFileUrl(item.image_id),
    caption: item.caption ?? null,
    status: item.status,
    objectLabels: objects.map((o) => o.label),
    objectDetails: objects,
    sceneLabels,
    sceneDetails,
    score: null,
    ocrText: item.ocr_text,
    createdAt: item.created_at,
    filename: item.filename ?? null,
    fileSizeBytes: item.file_size_bytes,
    mimeType: item.mime_type,
  };
}

/**
 * Normalize a SearchResult (from POST /search/text, etc.)
 * - `objects` is string[] (no confidence/bbox)
 * - `scene_tags` is string[] (no confidence)
 * - Has `score` (relevance)
 */
export function normalizeFromSearchResult(result: SearchResult): NormalizedImage {
  return {
    id: result.image_id,
    imageUrl: getImageFileUrl(result.image_id),
    caption: result.caption,
    status: 'completed', // search only returns completed images
    objectLabels: result.objects ?? [],
    objectDetails: null, // search results have no detailed objects
    sceneLabels: result.scene_tags ?? [],
    sceneDetails: null,
    score: result.score,
    ocrText: null, // not in search results
    createdAt: '',
    filename: null,
    fileSizeBytes: null,
    mimeType: null,
  };
}
