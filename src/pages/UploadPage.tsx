import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Tab,
  Tabs,
  Paper,
  LinearProgress,
  Alert,
  Button,
  Fade,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CollectionsIcon from '@mui/icons-material/Collections';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { ImageUploader, BatchUploadTracker } from '@/components/image';
import { useImageUpload, useBatchUpload } from '@/hooks';
import { Chip } from '@mui/material';

export default function UploadPage() {
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  // Single upload
  const singleUpload = useImageUpload();

  // Batch upload
  const batch = useBatchUpload();

  const onBatchDrop = useCallback(
    (accepted: File[]) => batch.addFiles(accepted),
    [batch],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: onBatchDrop,
    accept: { 'image/*': [] },
    maxFiles: 50,
    disabled: batch.isUploading,
    noClick: false,
  });

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Upload Images
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Upload images for analysis. Our AI will automatically caption, detect objects,
        classify scenes, and generate embeddings for search.
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<CloudUploadIcon />} label="Single" iconPosition="start" />
        <Tab icon={<CollectionsIcon />} label="Batch (up to 50)" iconPosition="start" />
      </Tabs>

      {/* Single upload */}
      {tab === 0 && (
        <Box>
          <ImageUploader
            onFileSelect={singleUpload.uploadFile}
            onUrlSubmit={singleUpload.uploadUrl}
            isUploading={singleUpload.status === 'uploading' || singleUpload.status === 'polling'}
          />

          {/* Progress */}
          {(singleUpload.status === 'uploading' || singleUpload.status === 'polling') && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {singleUpload.status === 'uploading' ? 'Uploading...' : 'Processing image...'}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={singleUpload.progress}
                sx={{ borderRadius: 2, height: 8 }}
              />
            </Box>
          )}

          {/* Success */}
          {singleUpload.status === 'done' && singleUpload.result && (
            <Fade in>
              <Paper sx={{ mt: 3, p: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <CheckCircleIcon color="success" />
                  <Typography variant="h6">Upload Successful!</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Image ID: {singleUpload.result.image_id}
                </Typography>
                {singleUpload.metadata?.caption && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Caption:</strong> {singleUpload.metadata.caption}
                  </Typography>
                )}

                {/* Detected objects */}
                {singleUpload.metadata?.objects && singleUpload.metadata.objects.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Detected Objects</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {singleUpload.metadata.objects.map((obj, i) => (
                        <Chip
                          key={`${obj.label}-${i}`}
                          label={`${obj.label} ${obj.confidence != null ? `(${Math.round(obj.confidence * 100)}%)` : ''}`}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* Scene tags */}
                {singleUpload.metadata?.scene_tags && singleUpload.metadata.scene_tags.length > 0 && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Scene Tags</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {singleUpload.metadata.scene_tags.map((tag) => (
                        <Chip
                          key={tag.label}
                          label={tag.label}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Box>
                )}

                {/* OCR text */}
                {singleUpload.metadata?.ocr_text && (
                  <Box sx={{ mt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">Extracted Text</Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        mt: 0.5,
                        fontFamily: 'monospace',
                        bgcolor: 'action.hover',
                        p: 1,
                        borderRadius: 1,
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {singleUpload.metadata.ocr_text}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    variant="contained"
                    onClick={() => navigate(`/images/${singleUpload.result!.image_id}`)}
                  >
                    View Details
                  </Button>
                  <Button variant="outlined" onClick={singleUpload.reset}>
                    Upload Another
                  </Button>
                </Box>
              </Paper>
            </Fade>
          )}

          {/* Error */}
          {singleUpload.status === 'error' && (
            <Alert severity="error" sx={{ mt: 3 }} action={
              <Button size="small" onClick={singleUpload.reset}>Try Again</Button>
            }>
              {singleUpload.error}
            </Alert>
          )}
        </Box>
      )}

      {/* Batch upload */}
      {tab === 1 && (
        <Box>
          {/* Drop zone for batch */}
          {batch.items.length === 0 && (
            <Box
              {...getRootProps()}
              sx={{
                border: '2px dashed',
                borderColor: isDragActive ? 'primary.main' : 'divider',
                borderRadius: 3,
                p: 6,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                '&:hover': { borderColor: 'primary.main' },
              }}
            >
              <input {...getInputProps()} id="batch-upload-input" name="batch-upload" />
              <CollectionsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                {isDragActive ? 'Drop images here' : 'Drop up to 50 images'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or click to browse
              </Typography>
            </Box>
          )}

          {/* Batch tracker */}
          {batch.items.length > 0 && (
            <Box>
              <BatchUploadTracker
                items={batch.items}
                onRemove={batch.removeFile}
                isUploading={batch.isUploading}
              />

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                {!batch.isUploading && batch.completedCount === 0 && (
                  <>
                    <Button variant="contained" onClick={batch.startUpload}>
                      Upload {batch.items.length} image{batch.items.length > 1 ? 's' : ''}
                    </Button>
                    <Button variant="outlined" onClick={batch.reset}>
                      Clear All
                    </Button>
                  </>
                )}

                {batch.completedCount > 0 && (
                  <>
                    <Button variant="contained" onClick={() => navigate('/gallery')}>
                      View Gallery
                    </Button>
                    <Button variant="outlined" onClick={batch.reset}>
                      Upload More
                    </Button>
                  </>
                )}
              </Box>

              {/* Summary */}
              {batch.completedCount > 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {batch.completedCount} completed, {batch.failedCount} failed
                </Typography>
              )}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}
