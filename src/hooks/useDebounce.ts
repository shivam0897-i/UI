import { useState, useEffect } from 'react';

/**
 * Debounce a value by the specified delay in milliseconds.
 * Useful for search-as-you-type to avoid spamming API requests.
 */
export function useDebounce<T>(value: T, delayMs = 300): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debouncedValue;
}
