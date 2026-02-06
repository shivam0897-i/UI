import { Box, Typography, Chip, LinearProgress, IconButton, Grid } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import type { BatchItem } from '@/hooks';

interface BatchUploadTrackerProps {
  items: BatchItem[];
  onRemove: (index: number) => void;
  isUploading: boolean;
}

const STATUS_ICON_MAP: Record<string, React.ReactNode> = {
  completed: <CheckCircleIcon color="success" fontSize="small" />,
  failed: <ErrorIcon color="error" fontSize="small" />,
};

export default function BatchUploadTracker({ items, onRemove, isUploading }: BatchUploadTrackerProps) {
  if (items.length === 0) return null;

  return (
    <Grid container spacing={1.5}>
      {items.map((item, index) => (
        <Grid key={`${item.file.name}-${index}`} size={{ xs: 6, sm: 4, md: 3, lg: 2 }}>
          <Box
            sx={{
              position: 'relative',
              borderRadius: 2,
              overflow: 'hidden',
              border: 1,
              borderColor: item.status === 'failed' ? 'error.main' : 'divider',
            }}
          >
            <Box
              component="img"
              src={item.previewUrl}
              alt={item.file.name}
              sx={{ width: '100%', height: 120, objectFit: 'cover', display: 'block' }}
            />

            {/* Status overlay */}
            {(item.status === 'uploading' || item.status === 'processing') && (
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  bgcolor: 'rgba(0,0,0,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <LinearProgress
                  sx={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}
                  variant="indeterminate"
                />
              </Box>
            )}

            {/* Bottom info */}
            <Box sx={{ p: 0.75, display: 'flex', alignItems: 'center', gap: 0.5 }}>
              {STATUS_ICON_MAP[item.status]}
              <Typography variant="caption" noWrap sx={{ flex: 1 }}>
                {item.file.name}
              </Typography>
              <Chip label={item.status} size="small" sx={{ fontSize: '0.6rem', height: 18 }} />
            </Box>

            {/* Error */}
            {item.error && (
              <Typography variant="caption" color="error" sx={{ px: 0.75, pb: 0.5, display: 'block' }}>
                {item.error}
              </Typography>
            )}

            {/* Remove */}
            {!isUploading && (
              <IconButton
                size="small"
                onClick={() => onRemove(index)}
                sx={{ position: 'absolute', top: 2, right: 2, bgcolor: 'rgba(0,0,0,0.6)', color: '#fff', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        </Grid>
      ))}
    </Grid>
  );
}
