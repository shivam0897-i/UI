import { useState, useCallback, useEffect } from 'react';
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
  Skeleton,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ImageSearchOutlinedIcon from '@mui/icons-material/ImageSearchOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import { useNavigate } from 'react-router-dom';
import { unifiedQuery, listImages } from '@/api/endpoints';
import { normalizeFromListItem, normalizeFromSearchResult } from '@/api/normalize';
import { preloadThumbnails } from '@/utils/imageUrl';
import type { QueryResponse, NormalizedImage, ImageListItem } from '@/api/types';
import { ImageGrid } from '@/components/image';
import { useAuth } from '@/contexts/AuthContext';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<QueryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentImages, setRecentImages] = useState<NormalizedImage[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [totalImages, setTotalImages] = useState<number | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch recent images on mount
  useEffect(() => {
    let cancelled = false;
    setRecentLoading(true);
    listImages({ limit: 6, page: 1 })
      .then((res) => {
        if (cancelled) return;
        const items = res.images.map((img: ImageListItem) => normalizeFromListItem(img));
        setRecentImages(items);
        setTotalImages(res.pagination.total);
        // Preload thumbnails so they render instantly
        preloadThumbnails(items.map((img) => img.id));
      })
      .catch(() => {
        if (!cancelled) setRecentImages([]);
      })
      .finally(() => {
        if (!cancelled) setRecentLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

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

  const normalizedResults: NormalizedImage[] =
    response?.search_results
      ? response.search_results.map(normalizeFromSearchResult)
      : [];

  const greeting = user?.email ? user.email.split('@')[0] : 'there';

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto' }}>
      {/* Greeting + search */}
      <Box sx={{ pt: { xs: 2, md: 4 }, pb: 3 }}>
        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
          Welcome back, {greeting}.
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Search your indexed images or ask questions about any frame.
        </Typography>

        {/* Search input */}
        <Paper
          sx={{
            display: 'flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: 1,
            maxWidth: 640,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            transition: 'border-color 0.15s',
            '&:focus-within': { borderColor: 'primary.main' },
          }}
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
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mt: 1.5 }}>
          {['dogs in the park', 'red cars', 'sunset landscapes', 'people smiling'].map((s) => (
            <Chip
              key={s}
              label={s}
              variant="outlined"
              size="small"
              onClick={() => {
                setQuery(s);
                setLoading(true);
                setError(null);
                setResponse(null);
                unifiedQuery(s)
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
          <Paper sx={{ p: 2, mb: 3, bgcolor: 'error.main', color: '#fff', borderRadius: 1 }}>
            <Typography>{error}</Typography>
          </Paper>
        </Fade>
      )}

      {/* Search results */}
      {response && (
        <Fade in>
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                label={response.query_type?.toUpperCase() || 'RESULT'}
                size="small"
                color="primary"
              />
            </Box>

            {response.query_type === 'vqa' && response.vqa_answer && (
              <Paper sx={{ p: 3, borderRadius: 1, mb: 3, border: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>Answer</Typography>
                <Typography variant="body1">{response.vqa_answer}</Typography>
              </Paper>
            )}

            {response.query_type === 'hybrid' && (
              <>
                {response.vqa_answer && (
                  <Paper sx={{ p: 3, borderRadius: 1, mb: 3, border: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>Answer</Typography>
                    <Typography variant="body1">{response.vqa_answer}</Typography>
                  </Paper>
                )}
                {normalizedResults.length > 0 && <ImageGrid images={normalizedResults} />}
              </>
            )}

            {response.query_type === 'search' && (
              normalizedResults.length > 0 ? (
                <ImageGrid images={normalizedResults} />
              ) : (
                <Paper sx={{ p: 3, borderRadius: 1, mb: 3, textAlign: 'center', border: 1, borderColor: 'divider' }}>
                  <Typography variant="body1" color="text.secondary">
                    No images found. Try a different query or upload some images first.
                  </Typography>
                </Paper>
              )
            )}

            {response.query_type === 'clarification' && response.vqa_answer && (
              <Paper sx={{ p: 3, borderRadius: 1, mb: 3, bgcolor: 'info.main', color: 'info.contrastText' }}>
                <Typography variant="subtitle2" gutterBottom>Need more info</Typography>
                <Typography variant="body1">{response.vqa_answer}</Typography>
              </Paper>
            )}
          </Box>
        </Fade>
      )}

      {/* Quick actions — only show when no search results */}
      {!response && (
        <>
          <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
            {[
              { label: 'Upload', desc: 'Add images to your index', icon: <CloudUploadOutlinedIcon />, path: '/upload' },
              { label: 'Search', desc: 'Advanced search options', icon: <ImageSearchOutlinedIcon />, path: '/search' },
              { label: 'Gallery', desc: totalImages != null ? `${totalImages} indexed` : 'Browse all', icon: <CollectionsOutlinedIcon />, path: '/gallery' },
            ].map((action) => (
              <Paper
                key={action.path}
                onClick={() => navigate(action.path)}
                sx={{
                  flex: '1 1 180px',
                  p: 2.5,
                  borderRadius: 1,
                  border: 1,
                  borderColor: 'divider',
                  cursor: 'pointer',
                  transition: 'border-color 0.15s',
                  '&:hover': { borderColor: 'primary.main' },
                }}
              >
                <Box sx={{ color: 'text.secondary', mb: 1 }}>{action.icon}</Box>
                <Typography variant="subtitle2" fontWeight={600}>{action.label}</Typography>
                <Typography variant="caption" color="text.secondary">{action.desc}</Typography>
              </Paper>
            ))}
          </Box>

          {/* Recent images */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="subtitle2" fontWeight={600} textTransform="uppercase" letterSpacing="0.06em" color="text.secondary">
                Recent uploads
              </Typography>
              {totalImages != null && totalImages > 6 && (
                <Typography
                  variant="caption"
                  color="primary"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/gallery')}
                >
                  View all
                </Typography>
              )}
            </Box>
            {recentLoading ? (
              <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 2 }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} variant="rectangular" height={140} sx={{ borderRadius: 1 }} />
                ))}
              </Box>
            ) : recentImages.length > 0 ? (
              <ImageGrid images={recentImages} />
            ) : (
              <Paper sx={{ p: 4, textAlign: 'center', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                  No images yet.
                </Typography>
                <Typography
                  variant="body2"
                  color="primary"
                  sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                  onClick={() => navigate('/upload')}
                >
                  Upload your first image
                </Typography>
              </Paper>
            )}
          </Box>
        </>
      )}
    </Box>
  );
}
