import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Paper,
  Chip,
  Fade,
  alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { unifiedQuery } from '@/api/endpoints';
import type { QueryResponse, NormalizedImage } from '@/api/types';
import { normalizeFromSearchResult } from '@/api/normalize';
import { ImageGrid } from '@/components/image';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = useCallback(async () => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      const result = await unifiedQuery(trimmed);
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Normalize search results if present
  const normalizedResults: NormalizedImage[] =
    response?.query_type === 'search' && response.search_results
      ? response.search_results.map(normalizeFromSearchResult)
      : [];

  return (
    <Box sx={{ maxWidth: 860, mx: 'auto' }}>
      {/* Hero */}
      <Box sx={{ textAlign: 'center', py: { xs: 6, md: 11 } }}>
        <Typography
          variant="h2"
          fontWeight={700}
          gutterBottom
          sx={{ letterSpacing: '-0.02em' }}
        >
          Search your images
          <br />
          with natural language.
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 5 }}>
          Upload images, search by description, detect objects, and ask
          questions — all from a single input.
        </Typography>

        {/* Unified query input */}
        <Paper
          sx={(t) => ({
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: 2.5,
            maxWidth: 600,
            mx: 'auto',
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'border-color 0.15s, box-shadow 0.15s',
            '&:focus-within': {
              borderColor: 'primary.main',
              boxShadow: `0 0 0 3px ${alpha(t.palette.primary.main, 0.12)}`,
            },
          })}
        >
          <TextField
            id="home-search"
            fullWidth
            placeholder="Ask a question or search for images..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            variant="standard"
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start" sx={{ ml: 1 }}>
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: { px: 1, py: 0.75 },
              },
            }}
          />
          <IconButton
            color="primary"
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            sx={{ mr: 0.5 }}
          >
            {loading ? <CircularProgress size={22} /> : <ArrowForwardIcon />}
          </IconButton>
        </Paper>

        {/* Quick suggestions */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, justifyContent: 'center', mt: 2.5 }}>
          {['dogs in the park', 'red cars', 'sunset landscapes', 'people smiling'].map((suggestion) => (
            <Chip
              key={suggestion}
              label={suggestion}
              variant="outlined"
              size="small"
              onClick={() => {
                setQuery(suggestion);
                setLoading(true);
                setError(null);
                setResponse(null);
                unifiedQuery(suggestion)
                  .then(setResponse)
                  .catch((err) => setError(err instanceof Error ? err.message : 'Query failed'))
                  .finally(() => setLoading(false));
              }}
              sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
            />
          ))}
        </Box>
      </Box>

      {/* Error */}
      {error && (
        <Fade in>
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.main', color: '#fff', borderRadius: 2 }}>
            <Typography>{error}</Typography>
          </Paper>
        </Fade>
      )}

      {/* Results */}
      {response && (
        <Fade in>
          <Box>
            {/* Query type badge */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                label={response.query_type?.toUpperCase() || 'RESULT'}
                size="small"
                color="primary"
              />
            </Box>

            {/* VQA answer */}
            {response.query_type === 'vqa' && (response.vqa_answer || response.answer) && (
              <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Answer</Typography>
                <Typography variant="body1">{response.vqa_answer || response.answer}</Typography>
                {response.confidence != null && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Confidence: {(response.confidence * 100).toFixed(1)}%
                  </Typography>
                )}
              </Paper>
            )}

            {/* Caption result */}
            {response.query_type === 'caption' && (response.vqa_answer || response.answer) && (
              <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Caption</Typography>
                <Typography variant="body1">{response.vqa_answer || response.answer}</Typography>
              </Paper>
            )}

            {/* Search results */}
            {response.query_type === 'search' && normalizedResults.length > 0 && (
              <ImageGrid images={normalizedResults} />
            )}

            {/* Detect result */}
            {response.query_type === 'detect' && (response.vqa_answer || response.answer) && (
              <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>Detection</Typography>
                <Typography variant="body1">{response.vqa_answer || response.answer}</Typography>
              </Paper>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  );
}
