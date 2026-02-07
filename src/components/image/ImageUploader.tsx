import { useCallback, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Tab,
  Tabs,
  CircularProgress,
  alpha,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onFileSelect: (file: File) => void;
  onUrlSubmit: (url: string) => void;
  isUploading: boolean;
  accept?: Record<string, string[]>;
}

const DEFAULT_ACCEPT = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/gif': ['.gif'],
  'image/bmp': ['.bmp'],
  'image/tiff': ['.tif', '.tiff'],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function ImageUploader({
  onFileSelect,
  onUrlSubmit,
  isUploading,
  accept = DEFAULT_ACCEPT,
}: ImageUploaderProps) {
  const [tab, setTab] = useState(0);
  const [url, setUrl] = useState('');

  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) {
        if (accepted[0].size > MAX_FILE_SIZE) {
          alert('File size exceeds 20 MB limit.');
          return;
        }
        onFileSelect(accepted[0]);
      }
    },
    [onFileSelect],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    disabled: isUploading,
  });

  const handleUrlSubmit = () => {
    const trimmed = url.trim();
    if (trimmed) {
      onUrlSubmit(trimmed);
      setUrl('');
    }
  };

  return (
    <Box>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab icon={<CloudUploadIcon />} label="File" iconPosition="start" />
        <Tab icon={<LinkIcon />} label="URL" iconPosition="start" />
      </Tabs>

      {tab === 0 && (
        <Box
          {...getRootProps()}
          sx={(theme) => ({
            border: '2px dashed',
            borderColor: isDragActive ? 'primary.main' : 'divider',
            borderRadius: 1,
            p: 6,
            textAlign: 'center',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            bgcolor: isDragActive ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
            transition: 'all 0.2s',
            '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.04) },
          })}
        >
          <input {...getInputProps()} id="upload-file-input" name="upload-file" />
          {isUploading ? (
            <CircularProgress size={48} />
          ) : (
            <>
              <CloudUploadIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop your image here' : 'Drag & drop an image'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse. Supports JPEG, PNG, WebP, GIF, BMP, TIFF (max 20 MB)
              </Typography>
            </>
          )}
        </Box>
      )}

      {tab === 1 && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            id="upload-url"
            fullWidth
            placeholder="https://example.com/image.jpg"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isUploading}
            onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
          />
          <Button
            variant="contained"
            onClick={handleUrlSubmit}
            disabled={!url.trim() || isUploading}
            sx={{ minWidth: 100 }}
          >
            {isUploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </Box>
      )}
    </Box>
  );
}
