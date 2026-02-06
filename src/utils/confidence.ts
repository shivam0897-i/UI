/**
 * Get display color for a confidence score.
 * Returns MUI palette path suitable for sx prop (e.g. 'success.main').
 */
export function getConfidenceColor(confidence: number): 'success.main' | 'warning.main' | 'error.main' {
  if (confidence >= 0.7) return 'success.main';
  if (confidence >= 0.4) return 'warning.main';
  return 'error.main';
}

/**
 * Get text label for a confidence score.
 */
export function getConfidenceLabel(confidence: number): string {
  if (confidence >= 0.7) return 'High';
  if (confidence >= 0.4) return 'Medium';
  return 'Low';
}

/**
 * Format a confidence score as a percentage string.
 */
export function formatConfidence(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

/**
 * Get a color for relevance/similarity scores in search results.
 * Slightly different thresholds than confidence.
 */
export function getScoreColor(score: number): 'success.main' | 'warning.main' | 'error.main' {
  if (score >= 0.6) return 'success.main';
  if (score >= 0.3) return 'warning.main';
  return 'error.main';
}
