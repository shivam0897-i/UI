import { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Alert, CircularProgress } from '@mui/material';
import { searchText, searchSimilarByFile } from '@/api/endpoints';
import type { NormalizedImage, SearchResult } from '@/api/types';
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

  // Filters
  const [minConfidence, setMinConfidence] = useState(0);
  const [objectFilters, setObjectFilters] = useState<string[]>([]);
  const [sceneFilters, setSceneFilters] = useState<string[]>([]);

  const handleTextSearch = useCallback(async (query: string) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    const start = performance.now();

    try {
      const response = await searchText({ query, limit: 50 });
      setResults(response.results);
      setSearchTime(performance.now() - start);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleImageSearch = useCallback(async (file: File) => {
    setLoading(true);
    setError(null);
    setHasSearched(true);
    const start = performance.now();

    try {
      const response = await searchSimilarByFile(file, 50);
      setResults(response.results);
      setSearchTime(performance.now() - start);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Image search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Extract available filter options from results
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

  // Apply filters
  const filteredResults: NormalizedImage[] = useMemo(() => {
    let filtered = results;

    if (minConfidence > 0) {
      filtered = filtered.filter((r) => (r.score ?? 0) >= minConfidence);
    }

    if (objectFilters.length > 0) {
      filtered = filtered.filter((r) =>
        objectFilters.every((f) => r.objects?.includes(f)),
      );
    }

    if (sceneFilters.length > 0) {
      filtered = filtered.filter((r) =>
        sceneFilters.every((f) => r.scene_tags?.includes(f)),
      );
    }

    return filtered.map(normalizeFromSearchResult);
  }, [results, minConfidence, objectFilters, sceneFilters]);

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
            totalCount={filteredResults.length}
            searchTime={searchTime}
            onFindSimilar={handleFindSimilar}
          />
        </Box>
      )}
    </Box>
  );
}
