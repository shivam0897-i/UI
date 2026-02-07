import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Pagination,
  Alert,
} from '@mui/material';
import { listImages } from '@/api/endpoints';
import type { ImageListItem, ImageStatus, NormalizedImage, ImageListParams } from '@/api/types';
import { normalizeFromListItem } from '@/api/normalize';
import { ImageGrid } from '@/components/image';
import { preloadThumbnails } from '@/utils/imageUrl';
import { EmptyState, LoadingSkeleton } from '@/components/common';
import { useNavigate } from 'react-router-dom';

const STATUS_TABS: (ImageStatus | 'all')[] = ['all', 'completed', 'processing', 'pending', 'failed'];

export default function GalleryPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<ImageStatus | 'all'>('all');
  const [page, setPage] = useState(1);
  const [images, setImages] = useState<ImageListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params: ImageListParams = {
        page,
        limit: 20,
        ...(status !== 'all' && { status }),
      };

      const response = await listImages(params);
      setImages(response.images);
      setTotalPages(response.pagination.total_pages);
      setTotalImages(response.pagination.total);
      // Preload thumbnails in parallel
      preloadThumbnails(response.images.map((img) => img.image_id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch images');
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  const handleStatusChange = (_: React.SyntheticEvent, value: string) => {
    setStatus(value as ImageStatus | 'all');
    setPage(1);
  };

  const normalized: NormalizedImage[] = images.map(normalizeFromListItem);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Gallery
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Browse all {totalImages} uploaded images.
      </Typography>

      {/* Status tabs */}
      <Tabs
        value={status}
        onChange={handleStatusChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        {STATUS_TABS.map((s) => (
          <Tab key={s} value={s} label={s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)} />
        ))}
      </Tabs>

      {/* Error */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton variant="card" count={8} />}

      {/* Image grid */}
      {!loading && normalized.length > 0 && (
        <ImageGrid
          images={normalized}
          onFindSimilar={(id) => navigate(`/images/${id}`)}
        />
      )}

      {/* Empty */}
      {!loading && normalized.length === 0 && !error && (
        <EmptyState variant="no-images" />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, p) => setPage(p)}
            color="primary"
          />
        </Box>
      )}
    </Box>
  );
}
