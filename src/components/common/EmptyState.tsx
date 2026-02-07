import { Box, Typography, Button, alpha } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useNavigate } from 'react-router-dom';

type EmptyVariant = 'no-results' | 'no-images' | 'upload-prompt';

interface EmptyStateProps {
  variant?: EmptyVariant;
  title?: string;
  description?: string;
}

const DEFAULTS: Record<EmptyVariant, { icon: typeof SearchOffIcon; title: string; description: string }> = {
  'no-results': {
    icon: SearchOffIcon,
    title: 'No results found',
    description: 'Try a different search query or adjust your filters.',
  },
  'no-images': {
    icon: ImageNotSupportedIcon,
    title: 'No images yet',
    description: 'Upload some images to get started with search and visual Q&A.',
  },
  'upload-prompt': {
    icon: CloudUploadIcon,
    title: 'Upload an image',
    description: 'Drag and drop an image or click to browse your files.',
  },
};

export default function EmptyState({ variant = 'no-results', title, description }: EmptyStateProps) {
  const navigate = useNavigate();
  const config = DEFAULTS[variant];
  const Icon = config.icon;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        py: 8,
        px: 3,
        textAlign: 'center',
      }}
    >
      <Box
        sx={(t) => ({
          width: 96,
          height: 96,
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 2.5,
          bgcolor: alpha(t.palette.primary.main, 0.08),
        })}
      >
        <Icon sx={(t) => ({ fontSize: 48, color: alpha(t.palette.primary.main, 0.5) })} />
      </Box>
      <Typography variant="h6" gutterBottom fontWeight={600}>
        {title || config.title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400 }}>
        {description || config.description}
      </Typography>
      {variant === 'no-images' && (
        <Button variant="contained" startIcon={<CloudUploadIcon />} onClick={() => navigate('/upload')}>
          Upload Images
        </Button>
      )}
    </Box>
  );
}
