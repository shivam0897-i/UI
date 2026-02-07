import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { Box, Typography, Alert, CircularProgress, Pagination } from '@mui/material';
import { searchText, searchSimilarByFile } from '@/api/endpoints';
import type { NormalizedImage, SearchResult, PaginationInfo } from '@/api/types';
import { normalizeFromSearchResult } from '@/api/normalize';
import { SearchBar, SearchResults, SearchFilters } from '@/components/search';
import { useNavigate } from 'react-router-dom';

export default function SearchPage() {
  const navigate = useNavigate();
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTime, setSearchTime] = useState<number | undefined>();
  const [hasSearched, setHasSearched] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [currentQuery, setCurrentQuery] = useState('');

  // Filters — sent to backend (server-side filtering)
  const DEFAULT_MIN_CONFIDENCE = 0.2;
  const [minConfidence, setMinConfidence] = useState(DEFAULT_MIN_CONFIDENCE);
  const [objectFilters, setObjectFilters] = useState<string[]>([]);
  const [sceneFilters, setSceneFilters] = useState<string[]>([]);

  // Track whether this is the first render to avoid running filter effect on mount
  const isInitialMount = useRef(true);

  const executeTextSearch = useCallback(async (query: string, page: number, confidence: number, objects: string[], scenes: string[]) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await searchText({
        query,
        limit: 20,
        page,
        min_confidence: confidence > 0 ? confidence : undefined,
        filters:
          objects.length > 0 || scenes.length > 0
            ? {
                objects: objects.length > 0 ? objects : undefined,
                scene_tags: scenes.length > 0 ? scenes : undefined,
              }
            : undefined,
      });
      setResults(response.results);
      setSearchTime(response.search_time_ms);
      setPagination(response.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleTextSearch = useCallback(async (query: string, page = 1) => {
    // New text query → reset filters to avoid stale cross-query filters
    setMinConfidence(DEFAULT_MIN_CONFIDENCE);
    setObjectFilters([]);
    setSceneFilters([]);
    setCurrentQuery(query);
    await executeTextSearch(query, page, DEFAULT_MIN_CONFIDENCE, [], []);
  }, [executeTextSearch]);

  // Auto-re-search when filters change (only if there's an active query)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!currentQuery) return;
    executeTextSearch(currentQuery, 1, minConfidence, objectFilters, sceneFilters);
  }, [minConfidence, objectFilters, sceneFilters]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageSearch = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    setCurrentQuery('');
    setMinConfidence(0);
    setObjectFilters([]);
    setSceneFilters([]);

    try {
      const response = await searchSimilarByFile(file, 50);
      setResults(response.results);
      setSearchTime(response.search_time_ms);
      setPagination(response.pagination ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image search failed');
      setResults([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePageChange = useCallback((_: unknown, page: number) => {
    if (currentQuery) {
      executeTextSearch(currentQuery, page, minConfidence, objectFilters, sceneFilters);
    }
  }, [currentQuery, executeTextSearch, minConfidence, objectFilters, sceneFilters]);

  // Extract available filter options from results (for UI display)
  const availableObjects = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => r.objects?.forEach((o) => set.add(o)));
    return Array.from(set).sort();
  }, [results]);

  const availableScenes = useMemo(() => {
    const set = new Set<string>();
    results.forEach((r) => r.scene_tags?.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [results]);

  // Results are already filtered server-side, just normalize
  const filteredResults: NormalizedImage[] = useMemo(() => {
    return results.map(normalizeFromSearchResult);
  }, [results]);

  const handleFindSimilar = useCallback(
    (imageId: string) => {
      navigate(`/images/${imageId}`);
    },
    [navigate],
  );

  const toggleObject = (obj: string) => {
    setObjectFilters((prev) => (prev.includes(obj) ? prev.filter((o) => o !== obj) : [...prev, obj]));
  };

  const toggleScene = (scene: string) => {
    setSceneFilters((prev) => (prev.includes(scene) ? prev.filter((s) => s !== scene) : [...prev, scene]));
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Search Images
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Search by text description or find visually similar images by uploading a photo.
      </Typography>

      <SearchBar
        onTextSearch={handleTextSearch}
        onImageSearch={handleImageSearch}
        isSearching={loading}
      />

      {/* Filters (only when we have results) */}
      {results.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <SearchFilters
            minConfidence={minConfidence}
            onMinConfidenceChange={setMinConfidence}
            objectFilters={objectFilters}
            availableObjects={availableObjects}
            onObjectToggle={toggleObject}
            sceneFilters={sceneFilters}
            availableScenes={availableScenes}
            onSceneToggle={toggleScene}
          />
        </Box>
      )}

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Results */}
      {!loading && hasSearched && (
        <Box sx={{ mt: 3 }}>
          <SearchResults
            results={filteredResults}
            totalCount={pagination?.total ?? filteredResults.length}
            searchTime={searchTime}
            onFindSimilar={handleFindSimilar}
          />

          {/* Server-side pagination */}
          {pagination && pagination.total_pages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
              <Pagination
                count={pagination.total_pages}
                page={pagination.page}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
