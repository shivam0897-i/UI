// ─── Enums / Literals ───────────────────────────────────────────────
export type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type QueryType = 'search' | 'vqa' | 'hybrid' | 'clarification';

// ─── Core Models ────────────────────────────────────────────────────

export interface BoundingBox {
  x_min: number; // 0-1
  y_min: number; // 0-1
  x_max: number; // 0-1
  y_max: number; // 0-1
}

export interface DetectedObject {
  label: string;
  confidence: number; // 0-1
  bounding_box: BoundingBox | null;
}

/** List endpoint uses `bbox` instead of `bounding_box` */
export interface ListDetectedObject {
  label: string;
  confidence: number;
  bbox: BoundingBox | null;
}

export interface SceneTag {
  label: string;
  confidence: number; // 0-1
}

export interface ConfidenceScores {
  objects: number | null;
  scene_tags: number | null;
  caption: number | null;
  ocr_text: number | null;
  embedding: number | null;
}

// ─── Image Document (GET /images/{id}) ──────────────────────────────

export interface ImageDocument {
  image_id: string;
  source_uri: string;
  user_id: string | null;
  objects: DetectedObject[];
  scene_tags: SceneTag[];
  caption: string | null;
  ocr_text: string | null;
  model_version: string;
  confidence_scores: ConfidenceScores;
  status: ImageStatus;
  error_message: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
  file_size_bytes: number | null;
  image_width: number | null;
  image_height: number | null;
  mime_type: string | null;
}

// ─── Image List Item (GET /images) ──────────────────────────────────
// Real API returns same shape as ImageDocument (not the docs-documented shape).
// We keep both field-name variants for forward-compat.

export interface ImageListItem {
  image_id: string;
  // Real API fields (same as ImageDocument)
  objects?: DetectedObject[];
  scene_tags?: SceneTag[];
  // Doc-documented fields (may not exist in real API)
  detected_objects?: ListDetectedObject[];
  labels?: string[];
  filename?: string;
  mime_type: string;
  file_size_bytes: number;
  source_uri: string | null;
  status: ImageStatus;
  caption: string | null;
  ocr_text: string | null;
  model_version?: string;
  confidence_scores?: ConfidenceScores;
  error_message?: string | null;
  image_width?: number | null;
  image_height?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface ImageListResponse {
  images: ImageListItem[];
  pagination: PaginationInfo;
}

// ─── Search Result (POST /search/text, etc.) ────────────────────────

export interface SearchResult {
  image_id: string;
  source_uri: string;
  score: number; // 0-1
  caption: string | null;
  objects: string[]; // just label strings
  scene_tags: string[]; // just label strings
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_count: number;
  search_time_ms: number;
  pagination: PaginationInfo | null;
}

// ─── VQA ────────────────────────────────────────────────────────────

export interface VQAResponse {
  image_id: string;
  question: string;
  answer: string;
  confidence: number | null;
  processing_time_ms: number;
}

// ─── Unified Query ──────────────────────────────────────────────────

export interface QueryResponse {
  query_type: QueryType;
  search_results: SearchResult[] | null;
  vqa_answer: string | null;
  processing_time_ms: number;
}

// ─── Ingest Responses ───────────────────────────────────────────────

export interface IngestResponse {
  image_id: string;
  status: ImageStatus;
  message: string;
}

export interface BatchIngestResult {
  image_id?: string;
  filename: string;
  status: 'pending' | 'error';
  error?: string;
}

export interface BatchIngestResponse {
  total: number;
  queued: number;
  results: BatchIngestResult[];
}

// ─── Delete ─────────────────────────────────────────────────────────

export interface DeleteResponse {
  message: string;
}

export interface BatchDeleteRequest {
  image_ids: string[];
}

export interface BatchDeleteResponse {
  deleted_count: number;
  deleted_ids: string[];
  not_found_ids: string[];
  forbidden_ids: string[];
}

// ─── Image Status (lightweight polling) ─────────────────────────────

export interface ImageStatusResponse {
  image_id: string;
  status: ImageStatus;
}

// ─── Health ─────────────────────────────────────────────────────────

export interface HealthResponse {
  status: 'healthy' | 'degraded';
  components: {
    mongodb: {
      status: string;
      images_count: number;
    };
    qdrant: {
      status: string;
      vectors_count: number;
      collection: string;
    };
  };
}

export interface AppInfoResponse {
  name: string;
  version: string;
  status: string;
  docs: string;
  health: string;
}

// ─── Auth Types ─────────────────────────────────────────────────────

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number; // seconds (900 = 15 min)
}

export interface UserResponse {
  user_id: string;
  email: string;
  is_admin: boolean;
  created_at: string; // ISO 8601
}

// ─── Request Types ──────────────────────────────────────────────────

export interface TextSearchRequest {
  query: string;
  limit?: number; // 1-100, default 10
  page?: number;
  min_confidence?: number; // 0-1
  filters?: {
    scene_tags?: string[];
    objects?: string[];
  };
}

export interface VQARequest {
  question: string;
  use_stored_context?: boolean; // default true
}

export interface QueryRequest {
  query: string;
  image_id?: string;
}

export interface ImageListParams {
  page?: number;
  limit?: number;
  status?: ImageStatus;
}

// ─── Normalized Image (adapter output for shared components) ────────

export interface NormalizedImage {
  id: string;
  imageUrl: string;
  caption: string | null;
  status: ImageStatus;
  objectLabels: string[];
  objectDetails: DetectedObject[] | null;
  sceneLabels: string[];
  sceneDetails: SceneTag[] | null;
  score: number | null;
  ocrText: string | null;
  createdAt: string;
  filename: string | null;
  fileSizeBytes: number | null;
  mimeType: string | null;
}

// ─── Chat Message (local state) ─────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  confidence?: number | null;
}
