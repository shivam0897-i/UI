// ─── API Client ─────────────────────────────────────────────────────
// Centralized fetch wrapper with error handling and 503 cold-start detection.

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://shivam-2211-vqa.hf.space';

const HF_TOKEN = import.meta.env.VITE_HF_TOKEN as string | undefined;

export const API_BASE = BASE_URL;
export const API_PREFIX = `${BASE_URL}/api/v1`;

// ─── Auth Headers ───────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  if (HF_TOKEN) {
    return { Authorization: `Bearer ${HF_TOKEN}` };
  }
  return {};
}

// ─── Custom Error Classes ───────────────────────────────────────────

export class ApiError extends Error {
  status: number;
  detail: string;

  constructor(status: number, detail: string) {
    super(detail);
    this.name = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

export class BackendSleepingError extends ApiError {
  constructor() {
    super(503, 'Backend is starting up. Please wait...');
    this.name = 'BackendSleepingError';
  }
}

// ─── Response Parser ────────────────────────────────────────────────

async function parseErrorResponse(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as { detail?: string };
    return body.detail ?? `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}: ${response.statusText}`;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return response.json() as Promise<T>;
  }

  if (response.status === 503) {
    throw new BackendSleepingError();
  }

  const detail = await parseErrorResponse(response);
  throw new ApiError(response.status, detail);
}

// ─── HTTP Methods ───────────────────────────────────────────────────

export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${path}`, {
    headers: { ...authHeaders() },
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify(body),
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiPostForm<T>(
  path: string,
  formData: FormData,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${path}`, {
    method: 'POST',
    headers: { ...authHeaders() },
    body: formData,
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetch(`${path}`, {
    method: 'DELETE',
    headers: { ...authHeaders() },
    signal,
  });
  return handleResponse<T>(response);
}
