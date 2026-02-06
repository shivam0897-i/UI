import { useState, useEffect, useCallback } from 'react';
import { getHealthReady } from '@/api/endpoints';
import { BackendSleepingError } from '@/api/client';

interface BackendHealthState {
  isReady: boolean;
  isWaking: boolean;
  error: string | null;
  retryCount: number;
  checkHealth: () => void;
}

/**
 * Monitors backend health and handles HF Space cold start.
 * On mount, checks /health/ready. If 503 or network error,
 * enters waking state and polls until ready (up to 90 seconds).
 */
export function useBackendHealth(): BackendHealthState {
  const [isReady, setIsReady] = useState(false);
  const [isWaking, setIsWaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const checkHealth = useCallback(async () => {
    try {
      await getHealthReady();
      setIsReady(true);
      setIsWaking(false);
      setError(null);
    } catch (err) {
      if (err instanceof BackendSleepingError || (err instanceof TypeError)) {
        // 503 or network failure — backend is sleeping
        setIsReady(false);
        setIsWaking(true);
        setError(null);
      } else {
        setIsReady(false);
        setIsWaking(false);
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    }
  }, []);

  // Initial check on mount
  useEffect(() => {
    checkHealth();
  }, [checkHealth]);

  // Polling when waking
  useEffect(() => {
    if (!isWaking) return;

    const maxRetries = 30; // 30 × 3s = 90 seconds max
    let currentRetry = 0;

    const interval = setInterval(async () => {
      currentRetry++;
      setRetryCount(currentRetry);

      try {
        await getHealthReady();
        setIsReady(true);
        setIsWaking(false);
        setError(null);
        clearInterval(interval);
      } catch {
        if (currentRetry >= maxRetries) {
          setIsWaking(false);
          setError('Backend did not respond after 90 seconds. Try refreshing the page.');
          clearInterval(interval);
        }
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isWaking]);

  return { isReady, isWaking, error, retryCount, checkHealth };
}
