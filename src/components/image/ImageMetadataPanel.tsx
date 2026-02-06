import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Chip,
  Box,
  Divider,
  Grid,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import type { ImageDocument } from '@/api/types';
import { formatDateTime, formatFileSize } from '@/utils';
import { ConfidenceBadge, StatusChip } from '@/components/common';

interface ImageMetadataPanelProps {
  metadata: ImageDocument;
}

export default function ImageMetadataPanel({ metadata }: ImageMetadataPanelProps) {
  return (
    <Box>
      {/* Basic info */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography fontWeight={600}>Basic Information</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1.5}>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">Status</Typography>
              <Box><StatusChip status={metadata.status} /></Box>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">Format</Typography>
              <Typography variant="body2">{metadata.mime_type || '—'}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">Dimensions</Typography>
              <Typography variant="body2">
                {metadata.image_width && metadata.image_height ? `${metadata.image_width} × ${metadata.image_height}` : '—'}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">File Size</Typography>
              <Typography variant="body2">
                {metadata.file_size_bytes ? formatFileSize(metadata.file_size_bytes) : '—'}
              </Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">Created</Typography>
              <Typography variant="body2">{formatDateTime(metadata.created_at)}</Typography>
            </Grid>
            <Grid size={6}>
              <Typography variant="caption" color="text.secondary">Version</Typography>
              <Typography variant="body2">{metadata.model_version || '—'}</Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Caption */}
      {metadata.caption && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Caption</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2">{metadata.caption}</Typography>
            {metadata.confidence_scores?.caption != null && (
              <Box sx={{ mt: 1 }}>
                <ConfidenceBadge score={metadata.confidence_scores.caption} showLabel />
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      <Divider />

      {/* Detected Objects */}
      {metadata.objects && metadata.objects.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Detected Objects ({metadata.objects.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {metadata.objects.map((obj, i) => (
                <Chip
                  key={`${obj.label}-${i}`}
                  label={`${obj.label} ${obj.confidence != null ? `(${(obj.confidence * 100).toFixed(0)}%)` : ''}`}
                  size="small"
                  variant="outlined"
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Scene Tags */}
      {metadata.scene_tags && metadata.scene_tags.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Scene Tags ({metadata.scene_tags.length})</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {metadata.scene_tags.map((tag) => (
                <Chip
                  key={typeof tag === 'string' ? tag : tag.label}
                  label={typeof tag === 'string' ? tag : `${tag.label} (${(tag.confidence * 100).toFixed(0)}%)`}
                  size="small"
                  color="secondary"
                  variant="outlined"
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}

      {/* OCR Text */}
      {metadata.ocr_text && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Extracted Text (OCR)</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography
              variant="body2"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                bgcolor: 'action.hover',
                p: 1.5,
                borderRadius: 1.5,
              }}
            >
              {metadata.ocr_text}
            </Typography>
            {metadata.confidence_scores?.ocr_text != null && (
              <Box sx={{ mt: 1 }}>
                <ConfidenceBadge score={metadata.confidence_scores.ocr_text} showLabel />
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Confidence Scores */}
      {metadata.confidence_scores && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={600}>Confidence Scores</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={1}>
              {Object.entries(metadata.confidence_scores).map(([key, val]) => (
                <Grid key={key} size={6}>
                  <Typography variant="caption" color="text.secondary" textTransform="capitalize">
                    {key.replace(/_/g, ' ')}
                  </Typography>
                  <Box>
                    <ConfidenceBadge score={val as number} />
                  </Box>
                </Grid>
              ))}
            </Grid>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
