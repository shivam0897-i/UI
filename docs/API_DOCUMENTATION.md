# VQA + Image Search Pipeline — Frontend API Documentation

> **Base URL:** `https://shivam-2211-vqa.hf.space`
>
> **API Prefix:** `/api/v1`
>
> **Interactive Docs:** `https://shivam-2211-vqa.hf.space/docs` (Swagger UI) | `https://shivam-2211-vqa.hf.space/redoc` (ReDoc)

---

## Table of Contents

1. [Overview & Architecture](#1-overview--architecture)
2. [Health & Status Endpoints](#2-health--status-endpoints)
3. [Image Ingestion](#3-image-ingestion)
4. [Image Listing](#4-image-listing)
5. [Image File Serving](#5-image-file-serving)
6. [Image Metadata](#6-image-metadata)
7. [Text Search](#7-text-search)
8. [Image Similarity Search](#8-image-similarity-search)
9. [Visual Question Answering (VQA)](#9-visual-question-answering-vqa)
10. [Unified Query (Smart Router)](#10-unified-query-smart-router)
11. [Image Deletion](#11-image-deletion)
12. [Batch Operations](#12-batch-operations)
13. [Reprocessing](#13-reprocessing)
14. [Data Models Reference](#14-data-models-reference)
15. [Error Handling](#15-error-handling)
16. [Frontend Integration Guide](#16-frontend-integration-guide)

---

## 1. Overview & Architecture

This API provides a complete visual understanding pipeline:

```
┌──────────────┐     ┌─────────────────────────────────────────────────────────┐
│   Frontend   │────▶│  FastAPI Backend                                        │
│   (UI/App)   │◀────│                                                         │
└──────────────┘     │  ┌───────────┐  ┌────────────┐  ┌───────────────────┐  │
                     │  │  Ingest   │  │   Search   │  │       VQA         │  │
                     │  │  Pipeline │  │  (Text +   │  │  (Ask questions   │  │
                     │  │           │  │   Image)   │  │   about images)   │  │
                     │  └─────┬─────┘  └─────┬──────┘  └────────┬──────────┘  │
                     │        │              │                   │             │
                     │  ┌─────▼──────────────▼───────────────────▼──────────┐  │
                     │  │  Perception Engine (YOLOv8 + CLIP + Gemini)      │  │
                     │  └─────┬──────────────┬─────────────────────────────┘  │
                     │        │              │                                │
                     │  ┌─────▼──────┐ ┌─────▼──────┐                        │
                     │  │  MongoDB   │ │  Qdrant    │                        │
                     │  │ (metadata) │ │ (vectors)  │                        │
                     │  └────────────┘ └────────────┘                        │
                     └─────────────────────────────────────────────────────────┘
```

**Key Concepts:**
- **image_id** — UUID string, the primary identifier for every image in the system
- **Perception** — When an image is ingested, AI extracts: objects, scene tags, caption, OCR text, and a semantic embedding vector
- **Embedding** — A 512-dimensional vector representing the image's visual content, used for similarity search

---

## 2. Health & Status Endpoints

### `GET /`

Root endpoint — application info.

**Response:**
```json
{
  "name": "VQA + Image Search Pipeline",
  "version": "1.0.0",
  "status": "running",
  "docs": "/docs",
  "health": "/health"
}
```

---

### `GET /health`

Full health check with dependency status.

**Response:**
```json
{
  "status": "healthy",
  "components": {
    "mongodb": {
      "status": "healthy",
      "images_count": 42
    },
    "qdrant": {
      "status": "healthy",
      "vectors_count": 42,
      "collection": "vqa_image_embeddings"
    }
  }
}
```

| `status` value | Meaning |
|---|---|
| `"healthy"` | All systems operational |
| `"degraded"` | One or more components unhealthy — API may still partially work |

---

### `GET /health/ready`

Readiness probe (all dependencies connected).

**Response:** `200 OK` → `{"status": "ready"}`
**Response:** `503` → Service not ready

---

### `GET /health/live`

Liveness probe (process alive).

**Response:** `200 OK` → `{"status": "alive"}`

---

## 3. Image Ingestion

### `POST /api/v1/images/ingest`

Upload and process a new image through the full perception pipeline.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `file` | File | Either `file` or `source_uri` | Image file (JPEG, PNG, GIF, WebP, BMP, TIFF) |
| `source_uri` | string | Either `file` or `source_uri` | URL to fetch image from |

**Constraints:**
- Max file size: **20 MB**
- Allowed MIME types: `image/jpeg`, `image/png`, `image/gif`, `image/webp`, `image/bmp`, `image/tiff`
- Max batch: 50 files (for batch endpoint)

**Example — File Upload (JavaScript `fetch`):**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(`${BASE_URL}/api/v1/images/ingest`, {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// data.image_id → store this for future operations
```

**Example — URL Source:**
```javascript
const formData = new FormData();
formData.append('source_uri', 'https://example.com/photo.jpg');

const response = await fetch(`${BASE_URL}/api/v1/images/ingest`, {
  method: 'POST',
  body: formData,
});
```

**Success Response (200):**
```json
{
  "image_id": "f1b51023-e493-4f22-a1a7-2a3d01899da5",
  "status": "completed",
  "message": "Image processed successfully. 5 objects detected."
}
```

**Processing time:** Typically 3–10 seconds depending on image complexity.

**What happens during ingestion:**
1. Image is validated (type, size)
2. YOLOv8 detects objects with bounding boxes
3. Gemini generates caption, scene tags, OCR text
4. CLIP generates 512-dim embedding vector
5. Metadata stored in MongoDB, embedding in Qdrant
6. Response returned with `image_id`

---

## 4. Image Listing

### `GET /api/v1/images`

Retrieve a paginated list of all ingested images. Returns metadata (without image binary data) sorted by creation date (newest first).

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number (minimum 1) |
| `limit` | integer | `20` | Items per page (1–100) |
| `status` | string | — | Filter by processing status: `completed`, `failed`, `processing` |

**Example — Basic Listing (JavaScript `fetch`):**
```javascript
const response = await fetch(`${BASE_URL}/api/v1/images?page=1&limit=10`);
const data = await response.json();
// data.images → array of image metadata
// data.pagination → pagination info
```

**Example — Filter by Status:**
```javascript
const response = await fetch(`${BASE_URL}/api/v1/images?status=completed&page=1&limit=20`);
const data = await response.json();
```

**Success Response (200):**
```json
{
  "images": [
    {
      "image_id": "f1b51023-e493-4f22-a1a7-2a3d01899da5",
      "filename": "tiger.jpg",
      "mime_type": "image/jpeg",
      "file_size_bytes": 245760,
      "source_uri": null,
      "status": "completed",
      "caption": "A tiger resting on a grassy field in a zoo enclosure.",
      "labels": ["tiger", "animal", "wildlife", "zoo"],
      "ocr_text": null,
      "detected_objects": [
        {
          "label": "tiger",
          "confidence": 0.95,
          "bbox": { "x_min": 0.1, "y_min": 0.2, "x_max": 0.9, "y_max": 0.85 }
        }
      ],
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-01-15T10:30:05Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "total_pages": 5,
    "has_next": true,
    "has_prev": false
  }
}
```

**Pagination Notes:**
- Results are sorted by `created_at` descending (newest first)
- The `image_data` (binary) field is **never** included in listing responses
- Use `total_pages` and `has_next`/`has_prev` to build pagination UI controls

---

## 5. Image File Serving

### `GET /api/v1/images/{image_id}/file`

Serve the original image file as binary data. Use this to display images in the frontend without needing external storage URLs.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `image_id` | string (UUID) | The image identifier returned during ingestion |

**Example — Display in `<img>` Tag:**
```html
<img src="https://shivam-2211-vqa.hf.space/api/v1/images/f1b51023-e493-4f22-a1a7-2a3d01899da5/file" alt="Uploaded image" />
```

**Example — Fetch as Blob (JavaScript):**
```javascript
const response = await fetch(
  `${BASE_URL}/api/v1/images/${imageId}/file`
);
const blob = await response.blob();
const objectUrl = URL.createObjectURL(blob);
// Use objectUrl as img.src
```

**Success Response (200):**
- **Content-Type:** The original MIME type of the image (e.g., `image/jpeg`, `image/png`)
- **Body:** Raw image binary data
- **Cache-Control:** `public, max-age=86400` (cached for 24 hours)

**Error Responses:**

| Status | Reason |
|---|---|
| `404` | Image not found or image data not available |

> **Tip:** You can use the URL directly as an `<img src="...">` — no JavaScript needed. The correct MIME type is set automatically.

---

## 6. Image Metadata

### `GET /api/v1/images/{image_id}`

Retrieve the full perception data for a processed image.

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `image_id` | string (UUID) | The image identifier returned from ingestion |

**Example:**
```javascript
const response = await fetch(`${BASE_URL}/api/v1/images/${imageId}`);
const metadata = await response.json();
```

**Success Response (200):**
```json
{
  "image_id": "f1b51023-e493-4f22-a1a7-2a3d01899da5",
  "source_uri": "upload://tiger.jpg",
  "objects": [
    {
      "label": "tiger",
      "confidence": 0.92,
      "bounding_box": {
        "x_min": 0.12,
        "y_min": 0.08,
        "x_max": 0.89,
        "y_max": 0.95
      }
    },
    {
      "label": "grass",
      "confidence": 0.78,
      "bounding_box": null
    }
  ],
  "scene_tags": [
    { "label": "wildlife", "confidence": 0.95 },
    { "label": "outdoor", "confidence": 0.90 },
    { "label": "nature", "confidence": 0.88 }
  ],
  "caption": "A tiger walking through tall grass in a natural habitat",
  "ocr_text": null,
  "model_version": "v1.0.0",
  "confidence_scores": {
    "objects": 0.85,
    "scene_tags": 0.91,
    "caption": 0.88,
    "ocr_text": null,
    "embedding": 0.95
  },
  "status": "completed",
  "error_message": null,
  "created_at": "2026-02-06T13:15:30.123456+00:00",
  "updated_at": "2026-02-06T13:15:35.654321+00:00",
  "file_size_bytes": 245678,
  "image_width": 1920,
  "image_height": 1080,
  "mime_type": "image/jpeg"
}
```

**Error Response (404):**
```json
{
  "detail": "Image not found: invalid-id-here"
}
```

> **Frontend Note:** Use `bounding_box` coordinates to draw rectangles on the image. Values are **normalized (0–1)** — multiply by image display width/height to get pixel positions.
>
> ```javascript
> // Drawing bounding box on a canvas
> const rect = {
>   x: bbox.x_min * canvasWidth,
>   y: bbox.y_min * canvasHeight,
>   width: (bbox.x_max - bbox.x_min) * canvasWidth,
>   height: (bbox.y_max - bbox.y_min) * canvasHeight,
> };
> ```

---

## 7. Text Search

### `POST /api/v1/images/search/text`

Find images matching a natural language text query. Uses semantic vector search + metadata matching.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "query": "red sports car on a road",
  "limit": 10,
  "min_confidence": 0.5,
  "filters": {
    "scene_tags": ["outdoor", "daylight"],
    "objects": ["car"]
  }
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | **Yes** | — | Natural language search query (min 1 char) |
| `limit` | integer | No | `10` | Max results to return (1–100) |
| `min_confidence` | float | No | `null` | Minimum confidence threshold (0–1) |
| `filters` | object | No | `null` | Filter by `scene_tags` and/or `objects` arrays |

**Example:**
```javascript
const response = await fetch(`${BASE_URL}/api/v1/images/search/text`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'cat sitting on a couch',
    limit: 10,
  }),
});

const data = await response.json();
// data.results → array of matching images
```

**Success Response (200):**
```json
{
  "query": "red sports car on a road",
  "results": [
    {
      "image_id": "abc123-...",
      "source_uri": "upload://car.jpg",
      "score": 0.87,
      "caption": "A red Ferrari driving on a mountain road",
      "objects": ["car", "road", "mountain"],
      "scene_tags": ["outdoor", "daylight", "road"]
    },
    {
      "image_id": "def456-...",
      "source_uri": "upload://racing.jpg",
      "score": 0.72,
      "caption": "Sports cars lined up at a racing event",
      "objects": ["car", "person", "building"],
      "scene_tags": ["outdoor", "event"]
    }
  ],
  "total_count": 2,
  "search_time_ms": 145.3
}
```

> **Frontend Note:** `score` is a relevance score from 0.0 to 1.0. Higher = more relevant. Scores below 0.20 are generally not useful matches.

---

## 8. Image Similarity Search

### `POST /api/v1/images/search/similar`

Find images visually similar to an **uploaded** query image.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `file` | File | **Yes** | — | Query image to find matches for |
| `limit` | integer | No | `10` | Max results (query param) |
| `min_similarity` | float | No | `null` | Minimum similarity threshold (query param) |

**Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(
  `${BASE_URL}/api/v1/images/search/similar?limit=5`,
  { method: 'POST', body: formData }
);

const data = await response.json();
```

**Success Response (200):** Same format as [Text Search response](#5-text-search).

---

### `GET /api/v1/images/search/similar/{image_id}`

Find images similar to an **already-ingested** image (by ID). Faster than uploading since the embedding already exists.

| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `image_id` | string (path) | **Yes** | — | Image ID to find similar images for |
| `limit` | integer (query) | No | `10` | Max results |
| `exclude_self` | boolean (query) | No | `true` | Exclude the query image from results |

**Example:**
```javascript
const response = await fetch(
  `${BASE_URL}/api/v1/images/search/similar/${imageId}?limit=5&exclude_self=true`
);

const data = await response.json();
```

**Success Response (200):** Same format as [Text Search response](#5-text-search).

---

## 9. Visual Question Answering (VQA)

### `POST /api/v1/images/{image_id}/ask`

Ask a question about a **previously ingested** image.

**Content-Type:** `application/json`

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `image_id` | string (UUID) | The ingested image to ask about |

**Request Body:**
```json
{
  "question": "What animal is in this image and what is it doing?",
  "use_stored_context": true
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `question` | string | **Yes** | — | Question about the image (min 1 char) |
| `use_stored_context` | boolean | No | `true` | Include stored perception data (objects, caption, etc.) as context for better answers |

**Example:**
```javascript
const response = await fetch(`${BASE_URL}/api/v1/images/${imageId}/ask`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    question: 'How many people are in this image?',
  }),
});

const data = await response.json();
// data.answer → "There are 3 people visible in the image..."
```

**Success Response (200):**
```json
{
  "image_id": "f1b51023-e493-4f22-a1a7-2a3d01899da5",
  "question": "What animal is in this image and what is it doing?",
  "answer": "A tiger is confidently walking directly towards the viewer from a head-on perspective, while staring intently forward.",
  "confidence": 0.6,
  "processing_time_ms": 2243.83
}
```

**Typical response time:** 1–4 seconds (depends on question complexity).

---

### `POST /api/v1/images/ask`

Ask a question about an **uploaded image** without storing it. Good for one-off questions.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `question` | string (form field) | **Yes** | Question about the image |
| `file` | File | **Yes** | Image file to ask about |

**Example:**
```javascript
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('question', 'What text is visible in this image?');

const response = await fetch(`${BASE_URL}/api/v1/images/ask`, {
  method: 'POST',
  body: formData,
});

const data = await response.json();
```

**Success Response (200):** Same schema as the VQA response above (but `image_id` will be a temporary ID).

---

## 10. Unified Query (Smart Router)

### `POST /api/v1/query`

A single "smart" endpoint that automatically routes your query to the right action — search, VQA, or both.

**Content-Type:** `application/json`

**Request Body:**
```json
{
  "query": "Find images of cats",
  "image_id": null
}
```

| Field | Type | Required | Default | Description |
|---|---|---|---|---|
| `query` | string | **Yes** | — | Natural language query |
| `image_id` | string | No | `null` | If provided, routes to VQA for that specific image |

**Routing Logic:**

| Query Type | Example | What Happens |
|---|---|---|
| **search** | `"Find images of cats"` | Text search → returns matching images |
| **vqa** | `"What color is the car?"` + `image_id` | Direct VQA on the specified image |
| **hybrid** | `"Are there people in outdoor photos?"` | Search first → VQA on top result |
| **clarification** | Ambiguous query needing image_id | Returns a clarification message |

**Example:**
```javascript
const response = await fetch(`${BASE_URL}/api/v1/query`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'What animals are in outdoor photos?',
  }),
});

const data = await response.json();

switch (data.query_type) {
  case 'search':
    renderSearchResults(data.search_results);
    break;
  case 'vqa':
    renderAnswer(data.vqa_answer);
    break;
  case 'hybrid':
    renderSearchResults(data.search_results);
    renderAnswer(data.vqa_answer);
    break;
  case 'clarification':
    showMessage(data.vqa_answer);
    break;
}
```

**Success Response (200):**
```json
{
  "query_type": "hybrid",
  "search_results": [
    {
      "image_id": "abc123-...",
      "source_uri": "upload://zoo.jpg",
      "score": 0.82,
      "caption": "Animals in a wildlife park",
      "objects": ["elephant", "giraffe", "tree"],
      "scene_tags": ["outdoor", "wildlife", "nature"]
    }
  ],
  "vqa_answer": "The image shows elephants and giraffes in an outdoor wildlife park setting.",
  "processing_time_ms": 3200.5
}
```

---

## 11. Image Deletion

### `DELETE /api/v1/images/{image_id}`

Delete an image and all its associated data (metadata + embedding).

**Example:**
```javascript
const response = await fetch(`${BASE_URL}/api/v1/images/${imageId}`, {
  method: 'DELETE',
});

const data = await response.json();
```

**Success Response (200):**
```json
{
  "message": "Image deleted: f1b51023-...",
  "mongodb_deleted": true,
  "qdrant_deleted": true
}
```

**Error Response (404):**
```json
{
  "detail": "Image not found: invalid-id"
}
```

---

## 12. Batch Operations

### `POST /api/v1/images/batch-ingest`

Upload and process multiple images at once. Images are queued for background processing.

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `files` | File[] | **Yes** | Multiple image files (max 50) |

**Example:**
```javascript
const formData = new FormData();
for (const file of selectedFiles) {
  formData.append('files', file);
}

const response = await fetch(`${BASE_URL}/api/v1/images/batch-ingest`, {
  method: 'POST',
  body: formData,
});

const data = await response.json();
// data.results → array with image_id and status for each file
```

**Success Response (200):**
```json
{
  "total": 5,
  "queued": 5,
  "results": [
    { "image_id": "abc-123", "filename": "photo1.jpg", "status": "pending" },
    { "image_id": "def-456", "filename": "photo2.jpg", "status": "pending" },
    { "image_id": "ghi-789", "filename": "photo3.png", "status": "pending" }
  ]
}
```

> **Frontend Note:** Batch ingestion returns immediately with `"pending"` status. Poll `GET /api/v1/images/{image_id}` to check when each image's `status` changes from `"pending"` → `"completed"`.
>
> **Suggested polling strategy:**
> ```javascript
> async function waitForProcessing(imageId, maxWaitMs = 30000) {
>   const start = Date.now();
>   while (Date.now() - start < maxWaitMs) {
>     const res = await fetch(`${BASE_URL}/api/v1/images/${imageId}`);
>     const data = await res.json();
>     if (data.status === 'completed' || data.status === 'failed') return data;
>     await new Promise(r => setTimeout(r, 2000)); // poll every 2s
>   }
>   throw new Error('Timeout waiting for image processing');
> }
> ```

---

## 13. Reprocessing

### `POST /api/v1/images/reprocess`

Re-run the perception pipeline on existing images (useful after model updates).

**Content-Type:** `multipart/form-data`

| Field | Type | Required | Description |
|---|---|---|---|
| `old_version` | string | Either this or `image_ids` | Reprocess all images from this model version |
| `image_ids` | string[] | Either this or `old_version` | Specific image IDs to reprocess |

**Success Response (200):**
```json
{
  "message": "Queued 12 images for reprocessing",
  "count": 12,
  "new_version": "v1.0.0"
}
```

> **Note:** Only works for images ingested via URL (`source_uri`). Images uploaded as files cannot be reprocessed since the original bytes are not stored.

---

## 14. Data Models Reference

### ImageDocument (full image metadata)

| Field | Type | Nullable | Description |
|---|---|---|---|
| `image_id` | string (UUID) | No | Unique identifier |
| `source_uri` | string | No | Original image source (`upload://filename` or URL) |
| `objects` | DetectedObject[] | No | Detected objects (can be empty array) |
| `scene_tags` | SceneTag[] | No | Scene classification tags |
| `caption` | string | Yes | AI-generated description |
| `ocr_text` | string | Yes | Extracted text (null if no text found) |
| `model_version` | string | No | Pipeline version (e.g., `"v1.0.0"`) |
| `confidence_scores` | ConfidenceScores | No | Per-field confidence metrics |
| `status` | enum | No | `"pending"` / `"processing"` / `"completed"` / `"failed"` |
| `error_message` | string | Yes | Error details if `status` is `"failed"` |
| `created_at` | ISO 8601 datetime | No | When the image was ingested |
| `updated_at` | ISO 8601 datetime | No | Last modification time |
| `file_size_bytes` | integer | Yes | Original file size |
| `image_width` | integer | Yes | Width in pixels |
| `image_height` | integer | Yes | Height in pixels |
| `mime_type` | string | Yes | e.g., `"image/jpeg"` |

### DetectedObject

| Field | Type | Description |
|---|---|---|
| `label` | string | Object class name (e.g., `"car"`, `"person"`) |
| `confidence` | float (0–1) | Detection confidence |
| `bounding_box` | BoundingBox \| null | Location in image (null for some detections) |

### BoundingBox

All values are **normalized 0–1** (percentage of image dimensions).

| Field | Type | Description |
|---|---|---|
| `x_min` | float (0–1) | Left edge |
| `y_min` | float (0–1) | Top edge |
| `x_max` | float (0–1) | Right edge |
| `y_max` | float (0–1) | Bottom edge |

### SceneTag

| Field | Type | Description |
|---|---|---|
| `label` | string | Scene label (e.g., `"outdoor"`, `"night"`) |
| `confidence` | float (0–1) | Classification confidence |

### SearchResult

| Field | Type | Description |
|---|---|---|
| `image_id` | string | Image UUID |
| `source_uri` | string | Image source |
| `score` | float (0–1) | Relevance/similarity score |
| `caption` | string \| null | Image caption |
| `objects` | string[] | Object label names |
| `scene_tags` | string[] | Scene label names |

### ImageStatus (enum)

| Value | Meaning |
|---|---|
| `"pending"` | Queued, not yet processed |
| `"processing"` | Currently being processed |
| `"completed"` | Successfully processed |
| `"failed"` | Processing failed (check `error_message`) |

---

## 15. Error Handling

All errors follow a consistent format:

```json
{
  "detail": "Human-readable error message"
}
```

### HTTP Status Codes

| Code | Meaning | When |
|---|---|---|
| `200` | Success | Request completed successfully |
| `400` | Bad Request | Invalid input (missing file, wrong format, too large) |
| `404` | Not Found | Image ID doesn't exist |
| `500` | Server Error | Backend failure (DB down, model error) |
| `503` | Unavailable | Service not ready (during startup) |

### Common Error Scenarios

**No file or URL provided:**
```json
// 400
{ "detail": "Either file or source_uri must be provided" }
```

**Unsupported file type:**
```json
// 400
{ "detail": "Unsupported file type: application/pdf. Allowed: image/jpeg, image/png, image/gif, image/webp, image/bmp, image/tiff" }
```

**File too large:**
```json
// 400
{ "detail": "File too large. Maximum size is 20MB, got 25.3MB" }
```

**Image not found:**
```json
// 404
{ "detail": "Image not found: non-existent-id" }
```

### Frontend Error Handling Pattern

```javascript
async function apiCall(url, options) {
  const response = await fetch(url, options);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}
```

---

## 16. Frontend Integration Guide

### Recommended UI Pages/Views

| Page | Primary Endpoints | Description |
|---|---|---|
| **Upload** | `POST /ingest`, `POST /batch-ingest` | Drag & drop or file picker for image upload |
| **Gallery** | `GET /images/{id}` | Grid view of all ingested images with metadata |
| **Search** | `POST /search/text` | Search bar with results grid |
| **Similar** | `GET /search/similar/{id}`, `POST /search/similar` | "Find similar" button on each image |
| **VQA Chat** | `POST /images/{id}/ask` | Chat-like interface to ask questions about an image |
| **Smart Query** | `POST /query` | Single search bar that handles everything |
| **Image Detail** | `GET /images/{id}` | Full metadata view with bounding box overlay |

### CORS

CORS is fully open (`*`). No special headers needed from the frontend.

### Content Types Summary

| Endpoint | Request Content-Type |
|---|---|
| `/images/ingest` | `multipart/form-data` |
| `/images/batch-ingest` | `multipart/form-data` |
| `/images/search/text` | `application/json` |
| `/images/search/similar` (POST) | `multipart/form-data` |
| `/images/search/similar/{id}` (GET) | — (no body) |
| `/images/{id}/ask` | `application/json` |
| `/images/ask` | `multipart/form-data` |
| `/query` | `application/json` |
| `/images/{id}` (GET) | — (no body) |
| `/images/{id}` (DELETE) | — (no body) |

### TypeScript Interfaces

```typescript
// ── Enums ──
type ImageStatus = 'pending' | 'processing' | 'completed' | 'failed';
type QueryType = 'search' | 'vqa' | 'hybrid' | 'clarification';

// ── Core Models ──
interface BoundingBox {
  x_min: number; // 0-1
  y_min: number; // 0-1
  x_max: number; // 0-1
  y_max: number; // 0-1
}

interface DetectedObject {
  label: string;
  confidence: number; // 0-1
  bounding_box: BoundingBox | null;
}

interface SceneTag {
  label: string;
  confidence: number; // 0-1
}

interface ConfidenceScores {
  objects: number | null;
  scene_tags: number | null;
  caption: number | null;
  ocr_text: number | null;
  embedding: number | null;
}

// ── Image Document (GET /images/{id}) ──
interface ImageDocument {
  image_id: string;
  source_uri: string;
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

// ── Responses ──
interface IngestResponse {
  image_id: string;
  status: ImageStatus;
  message: string;
}

interface BatchIngestResponse {
  total: number;
  queued: number;
  results: Array<{
    image_id?: string;
    filename: string;
    status: 'pending' | 'error';
    error?: string;
  }>;
}

interface SearchResult {
  image_id: string;
  source_uri: string;
  score: number; // 0-1
  caption: string | null;
  objects: string[];
  scene_tags: string[];
}

interface SearchResponse {
  query: string;
  results: SearchResult[];
  total_count: number;
  search_time_ms: number;
}

interface VQAResponse {
  image_id: string;
  question: string;
  answer: string;
  confidence: number | null;
  processing_time_ms: number;
}

interface QueryResponse {
  query_type: QueryType;
  search_results: SearchResult[] | null;
  vqa_answer: string | null;
  processing_time_ms: number;
}

// ── Requests ──
interface TextSearchRequest {
  query: string;
  limit?: number;        // 1-100, default 10
  min_confidence?: number; // 0-1
  filters?: {
    scene_tags?: string[];
    objects?: string[];
  };
}

interface VQARequest {
  question: string;
  use_stored_context?: boolean; // default true
}

interface QueryRequest {
  query: string;
  image_id?: string;
}
```

### API Client Example (JavaScript/TypeScript)

```typescript
const BASE_URL = 'https://shivam-2211-vqa.hf.space';
const API = `${BASE_URL}/api/v1`;

const vqaApi = {
  // Ingest
  async ingestImage(file: File): Promise<IngestResponse> {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API}/images/ingest`, { method: 'POST', body: form });
    if (!res.ok) throw new Error((await res.json()).detail);
    return res.json();
  },

  // Get metadata
  async getImage(imageId: string): Promise<ImageDocument> {
    const res = await fetch(`${API}/images/${imageId}`);
    if (!res.ok) throw new Error((await res.json()).detail);
    return res.json();
  },

  // Text search
  async searchText(query: string, limit = 10): Promise<SearchResponse> {
    const res = await fetch(`${API}/images/search/text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, limit }),
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    return res.json();
  },

  // Similar by ID
  async findSimilar(imageId: string, limit = 10): Promise<SearchResponse> {
    const res = await fetch(`${API}/images/search/similar/${imageId}?limit=${limit}`);
    if (!res.ok) throw new Error((await res.json()).detail);
    return res.json();
  },

  // VQA
  async askQuestion(imageId: string, question: string): Promise<VQAResponse> {
    const res = await fetch(`${API}/images/${imageId}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    return res.json();
  },

  // Smart query
  async query(query: string, imageId?: string): Promise<QueryResponse> {
    const res = await fetch(`${API}/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, image_id: imageId }),
    });
    if (!res.ok) throw new Error((await res.json()).detail);
    return res.json();
  },

  // Delete
  async deleteImage(imageId: string): Promise<void> {
    const res = await fetch(`${API}/images/${imageId}`, { method: 'DELETE' });
    if (!res.ok) throw new Error((await res.json()).detail);
  },
};
```

---

## Quick Reference — All Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | App info |
| `GET` | `/health` | Health check (detailed) |
| `GET` | `/health/ready` | Readiness probe |
| `GET` | `/health/live` | Liveness probe |
| `POST` | `/api/v1/images/ingest` | Upload & process single image |
| `POST` | `/api/v1/images/batch-ingest` | Upload & process multiple images |
| `GET` | `/api/v1/images` | List all images (paginated) |
| `GET` | `/api/v1/images/{image_id}` | Get image metadata |
| `GET` | `/api/v1/images/{image_id}/file` | Serve original image file |
| `DELETE` | `/api/v1/images/{image_id}` | Delete image |
| `POST` | `/api/v1/images/search/text` | Search by text query |
| `POST` | `/api/v1/images/search/similar` | Search by uploaded image |
| `GET` | `/api/v1/images/search/similar/{image_id}` | Find similar to existing image |
| `POST` | `/api/v1/images/{image_id}/ask` | Ask question about ingested image |
| `POST` | `/api/v1/images/ask` | Ask question about uploaded image |
| `POST` | `/api/v1/query` | Smart unified query |
| `POST` | `/api/v1/images/reprocess` | Re-run perception pipeline |
