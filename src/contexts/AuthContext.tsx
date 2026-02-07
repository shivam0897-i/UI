import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react';
import { API_PREFIX } from '@/api/client';

// ─── Types ──────────────────────────────────────────────────────────

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'bearer';
  expires_in: number;
}

interface User {
  user_id: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  getAccessToken: () => string | null;
}

// ─── Token helpers ──────────────────────────────────────────────────

const TOKEN_KEYS = {
  access: 'vqa_access_token',
  refresh: 'vqa_refresh_token',
} as const;

function storeTokens(tokens: TokenResponse) {
  localStorage.setItem(TOKEN_KEYS.access, tokens.access_token);
  localStorage.setItem(TOKEN_KEYS.refresh, tokens.refresh_token);
}

function clearTokens() {
  localStorage.removeItem(TOKEN_KEYS.access);
  localStorage.removeItem(TOKEN_KEYS.refresh);
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.access);
}

export function getStoredRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.refresh);
}

// ─── Refresh logic (exported for use in API client interceptor) ─────

let refreshPromise: Promise<string | null> | null = null;

/**
 * Attempts to refresh the access token using the stored refresh token.
 * Deduplicates concurrent refresh calls.
 * Returns the new access token or null if refresh failed.
 */
export async function refreshAccessToken(): Promise<string | null> {
  // Deduplicate: if a refresh is already in flight, wait for it
  if (refreshPromise) return refreshPromise;

  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) return null;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_PREFIX}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!res.ok) {
        clearTokens();
        return null;
      }

      const data: TokenResponse = await res.json();
      storeTokens(data);
      return data.access_token;
    } catch {
      clearTokens();
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

// ─── Context ────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // Fetch current user profile
  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_PREFIX}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return (await res.json()) as User;
    } catch {
      return null;
    }
  }, []);

  // On mount: check for existing token and validate it
  useEffect(() => {
    let cancelled = false;

    (async () => {
      const token = getStoredAccessToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      let currentUser = await fetchUser(token);

      // Token might be expired — try refresh
      if (!currentUser) {
        const newToken = await refreshAccessToken();
        if (newToken) {
          currentUser = await fetchUser(newToken);
        }
      }

      if (!cancelled) {
        setUser(currentUser);
        if (!currentUser) clearTokens();
        setIsLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [fetchUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_PREFIX}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(body.detail ?? 'Login failed');
    }

    const tokens: TokenResponse = await res.json();
    storeTokens(tokens);

    const profile = await fetchUser(tokens.access_token);
    if (!profile) throw new Error('Failed to load user profile');
    setUser(profile);
  }, [fetchUser]);

  const register = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_PREFIX}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: 'Registration failed' }));
      throw new Error(body.detail ?? 'Registration failed');
    }

    const tokens: TokenResponse = await res.json();
    storeTokens(tokens);

    const profile = await fetchUser(tokens.access_token);
    if (!profile) throw new Error('Failed to load user profile');
    setUser(profile);
  }, [fetchUser]);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const getAccessToken = useCallback(() => getStoredAccessToken(), []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, register, logout, getAccessToken }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
