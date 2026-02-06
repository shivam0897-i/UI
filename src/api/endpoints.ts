// ─── API Endpoints ──────────────────────────────────────────────────
// Typed functions for all 17 backend endpoints.

import { API_BASE, API_PREFIX, apiGet, apiPost, apiPostForm, apiDelete } from './client';
import type {
  AppInfoResponse,
  HealthResponse,
  IngestResponse,
  BatchIngestResponse,
  ImageListResponse,
  ImageListParams,
  ImageDocument,
  DeleteResponse,
  SearchResponse,
  TextSearchRequest,
  VQAResponse,
  QueryResponse,
  ReprocessResponse,
} from './types';

// ─── Health & Info ──────────────────────────────────────────────────

export function getAppInfo(signal?: AbortSignal) {
  return apiGet<AppInfoResponse>(`${API_BASE}/`, signal);
}

export function getHealth(signal?: AbortSignal) {
  return apiGet<HealthResponse>(`${API_BASE}/health`, signal);
}

export async function getHealthReady(signal?: AbortSignal) {
  return apiGet<{ status: string }>(`${API_BASE}/health/ready`, signal);
}

export async function getHealthLive(signal?: AbortSignal) {
  return apiGet<{ status: string }>(`${API_BASE}/health/live`, signal);
}

// ─── Ingestion ──────────────────────────────────────────────────────

export function ingestImage(file: File, signal?: AbortSignal) {
  const form = new FormData();
  form.append('file', file);
  return apiPostForm<IngestResponse>(`${API_PREFIX}/images/ingest`, form, signal);
}

export function ingestImageByUrl(sourceUri: string, signal?: AbortSignal) {
  const form = new FormData();
  form.append('source_uri', sourceUri);
  return apiPostForm<IngestResponse>(`${API_PREFIX}/images/ingest`, form, signal);
}

export function batchIngest(files: File[], signal?: AbortSignal) {
  const form = new FormData();
  for (const file of files) {
    form.append('files', file);
  }
  return apiPostForm<BatchIngestResponse>(
    `${API_PREFIX}/images/batch-ingest`,
    form,
    signal,
  );
}

// ─── Listing & Metadata ────────────────────────────────────────────

export function listImages(params?: ImageListParams, signal?: AbortSignal) {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set('page', String(params.page));
  if (params?.limit) searchParams.set('limit', String(params.limit));
  if (params?.status) searchParams.set('status', params.status);
  const qs = searchParams.toString();
  return apiGet<ImageListResponse>(
    `${API_PREFIX}/images${qs ? `?${qs}` : ''}`,
    signal,
  );
}

export function getImageMetadata(imageId: string, signal?: AbortSignal) {
  return apiGet<ImageDocument>(`${API_PREFIX}/images/${imageId}`, signal);
}

/**
 * Returns the direct URL for an image file.
 * Use this as the `src` attribute of `<img>` tags.
 * The endpoint returns binary image data with correct MIME type and 24h cache.
 */
export function getImageFileUrl(imageId: string): string {
  return `${API_PREFIX}/images/${imageId}/file`;
}

// ─── Deletion ───────────────────────────────────────────────────────

export function deleteImage(imageId: string, signal?: AbortSignal) {
  return apiDelete<DeleteResponse>(`${API_PREFIX}/images/${imageId}`, signal);
}

// ─── Text Search ────────────────────────────────────────────────────

export function searchText(request: TextSearchRequest, signal?: AbortSignal) {
  return apiPost<SearchResponse>(
    `${API_PREFIX}/images/search/text`,
    request,
    signal,
  );
}

// ─── Similar Search ─────────────────────────────────────────────────

export function searchSimilarByFile(
  file: File,
  limit = 10,
  minSimilarity?: number,
  signal?: AbortSignal,
) {
  const form = new FormData();
  form.append('file', file);
  const params = new URLSearchParams({ limit: String(limit) });
  if (minSimilarity !== undefined) {
    params.set('min_similarity', String(minSimilarity));
  }
  return apiPostForm<SearchResponse>(
    `${API_PREFIX}/images/search/similar?${params}`,
    form,
    signal,
  );
}

export function searchSimilarById(
  imageId: string,
  limit = 10,
  excludeSelf = true,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    limit: String(limit),
    exclude_self: String(excludeSelf),
  });
  return apiGet<SearchResponse>(
    `${API_PREFIX}/images/search/similar/${imageId}?${params}`,
    signal,
  );
}

// ─── Visual Question Answering ──────────────────────────────────────

export function askQuestion(
  imageId: string,
  question: string,
  useStoredContext = true,
  signal?: AbortSignal,
) {
  return apiPost<VQAResponse>(`${API_PREFIX}/images/${imageId}/ask`, {
    question,
    use_stored_context: useStoredContext,
  }, signal);
}

export function askAboutUpload(
  file: File,
  question: string,
  signal?: AbortSignal,
) {
  const form = new FormData();
  form.append('file', file);
  form.append('question', question);
  return apiPostForm<VQAResponse>(`${API_PREFIX}/images/ask`, form, signal);
}

// ─── Unified Query ──────────────────────────────────────────────────

export function unifiedQuery(
  query: string,
  imageId?: string,
  signal?: AbortSignal,
) {
  return apiPost<QueryResponse>(`${API_PREFIX}/query`, {
    query,
    image_id: imageId ?? null,
  }, signal);
}

// ─── Reprocessing ───────────────────────────────────────────────────

export function reprocess(
  oldVersion?: string,
  imageIds?: string[],
  signal?: AbortSignal,
) {
  const form = new FormData();
  if (oldVersion) form.append('old_version', oldVersion);
  if (imageIds) {
    for (const id of imageIds) {
      form.append('image_ids', id);
    }
  }
  return apiPostForm<ReprocessResponse>(
    `${API_PREFIX}/images/reprocess`,
    form,
    signal,
  );
}
