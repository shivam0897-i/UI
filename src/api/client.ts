// ─── API Client ─────────────────────────────────────────────────────
// Centralized fetch wrapper with JWT auth, 401 auto-refresh, and error handling.

import { getStoredAccessToken, refreshAccessToken } from '@/contexts/AuthContext';

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? 'https://shivam-2211-vqa.hf.space';

export const API_BASE = BASE_URL;
export const API_PREFIX = `${BASE_URL}/api/v1`;

// ─── Auth Headers ───────────────────────────────────────────────────

function authHeaders(): Record<string, string> {
  const token = getStoredAccessToken();
  if (token) {
    return { Authorization: `Bearer ${token}` };
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

export class UnauthorizedError extends ApiError {
  constructor(detail = 'Session expired. Please log in again.') {
    super(401, detail);
    this.name = 'UnauthorizedError';
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

  if (response.status === 401) {
    throw new UnauthorizedError(await parseErrorResponse(response));
  }

  const detail = await parseErrorResponse(response);
  throw new ApiError(response.status, detail);
}

// ─── Fetch with auto-refresh on 401 ────────────────────────────────

async function fetchWithAuth(
  url: string,
  init: RequestInit,
): Promise<Response> {
  let response = await fetch(url, {
    ...init,
    headers: { ...authHeaders(), ...init.headers },
  });

  // If 401, attempt token refresh and retry once
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      const retryHeaders: Record<string, string> = {
        ...(init.headers as Record<string, string>),
        Authorization: `Bearer ${newToken}`,
      };
      response = await fetch(url, { ...init, headers: retryHeaders });
    } else {
      // Refresh failed — session is truly expired, redirect to login
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
    }
  }

  return response;
}

// ─── HTTP Methods ───────────────────────────────────────────────────

export async function apiGet<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetchWithAuth(path, { signal });
  return handleResponse<T>(response);
}

export async function apiPost<T>(
  path: string,
  body: unknown,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetchWithAuth(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetchWithAuth(path, {
    method: 'POST',
    body: formData,
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiPut<T>(
  path: string,
  formData: FormData,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetchWithAuth(path, {
    method: 'PUT',
    body: formData,
    signal,
  });
  return handleResponse<T>(response);
}

export async function apiDelete<T>(
  path: string,
  signal?: AbortSignal,
): Promise<T> {
  const response = await fetchWithAuth(path, {
    method: 'DELETE',
    signal,
  });
  return handleResponse<T>(response);
}

