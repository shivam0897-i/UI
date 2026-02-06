import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Paper,
  Grid,
  Alert,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DeleteIcon from '@mui/icons-material/Delete';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { getImageMetadata, deleteImage, askQuestion, searchSimilarById } from '@/api/endpoints';
import type { ImageDocument, ChatMessage, NormalizedImage } from '@/api/types';
import { normalizeFromSearchResult } from '@/api/normalize';
import { BoundingBoxOverlay, ImageMetadataPanel, ImageGrid } from '@/components/image';
import { ChatPanel } from '@/components/vqa';
import { LoadingSkeleton } from '@/components/common';
import { useAuthImage } from '@/hooks';

export default function ImageDetailPage() {
  const { imageId } = useParams<{ imageId: string }>();
  const navigate = useNavigate();

  const [metadata, setMetadata] = useState<ImageDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // VQA Chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatLoading, setChatLoading] = useState(false);

  // Similar images
  const [similarImages, setSimilarImages] = useState<NormalizedImage[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Image loading
  const imageSrc = useAuthImage(imageId ?? '');
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !imageSrc || imgError;

  // Fetch metadata
  useEffect(() => {
    if (!imageId) return;
    setLoading(true);
    setError(null);
    getImageMetadata(imageId)
      .then(setMetadata)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load image'))
      .finally(() => setLoading(false));
  }, [imageId]);

  // Send VQA question
  const handleSendMessage = useCallback(
    async (question: string) => {
      if (!imageId) return;
      setMessages((prev) => [...prev, { role: 'user', content: question }]);
      setChatLoading(true);

      try {
        const response = await askQuestion(imageId, question, true);
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: response.answer,
            confidence: response.confidence,
          },
        ]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            role: 'assistant',
            content: `Error: ${err instanceof Error ? err.message : 'Failed to get answer'}`,
          },
        ]);
      } finally {
        setChatLoading(false);
      }
    },
    [imageId],
  );

  // Find similar
  const handleFindSimilar = useCallback(async () => {
    if (!imageId) return;
    setSimilarLoading(true);
    try {
      const response = await searchSimilarById(imageId, 8, true);
      setSimilarImages(response.results.map(normalizeFromSearchResult));
    } catch {
      // silently fail
    } finally {
      setSimilarLoading(false);
    }
  }, [imageId]);

  // Delete
  const handleDelete = useCallback(async () => {
    if (!imageId) return;
    setDeleting(true);
    try {
      await deleteImage(imageId);
      navigate('/gallery');
    } catch {
      setError('Failed to delete image');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }, [imageId, navigate]);

  if (loading) {
    return (
      <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
        <LoadingSkeleton variant="detail" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Box>
    );
  }

  if (!metadata || !imageId) return null;

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <IconButton onClick={() => navigate(-1)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h5" fontWeight={700} sx={{ flex: 1 }} noWrap>
          {metadata.caption || metadata.source_uri || 'Image Detail'}
        </Typography>
        <Tooltip title="Find similar images">
          <IconButton onClick={handleFindSimilar} disabled={similarLoading}>
            <FindInPageIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete image">
          <IconButton color="error" onClick={() => setDeleteOpen(true)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>

      <Grid container spacing={3}>
        {/* Image with bounding boxes */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper sx={{ position: 'relative', borderRadius: 3, overflow: 'hidden' }}>
            {showPlaceholder ? (
              <Box
                sx={{
                  width: '100%',
                  minHeight: 320,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: (t) => t.palette.action.hover,
                }}
              >
                <ImageNotSupportedIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.disabled">
                  Image unavailable
                </Typography>
              </Box>
            ) : (
              <Box
                component="img"
                src={imageSrc}
                alt={metadata.caption || 'Image'}
                onError={() => setImgError(true)}
                sx={{ width: '100%', display: 'block' }}
              />
            )}
            {metadata.objects && (
              <BoundingBoxOverlay objects={metadata.objects} />
            )}
          </Paper>

          {/* Similar images */}
          {similarImages.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Similar Images
              </Typography>
              <ImageGrid images={similarImages} />
            </Box>
          )}
        </Grid>

        {/* Right panel: metadata + chat */}
        <Grid size={{ xs: 12, md: 5 }}>
          <ImageMetadataPanel metadata={metadata} />

          <Paper sx={{ mt: 2, borderRadius: 2, overflow: 'hidden' }}>
            <ChatPanel
              messages={messages}
              onSendMessage={handleSendMessage}
              isLoading={chatLoading}
              imageId={imageId}
              metadata={metadata}
            />
          </Paper>
        </Grid>
      </Grid>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Delete Image?</DialogTitle>
        <DialogContent>
          <Typography>
            This will permanently delete this image and all its metadata. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
