import { useState } from 'react';
import { Box, Switch, FormControlLabel, Typography } from '@mui/material';
import type { DetectedObject } from '@/api/types';
import { bboxToCssPercent } from '@/utils';

interface BoundingBoxOverlayProps {
  objects: DetectedObject[];
  imageWidth?: number;
  imageHeight?: number;
}

/**
 * Renders bounding boxes on top of an image.
 * Must be placed inside a position:relative parent wrapping the <img>.
 */
export default function BoundingBoxOverlay({ objects }: BoundingBoxOverlayProps) {
  const [showBoxes, setShowBoxes] = useState(true);

  if (objects.length === 0) return null;

  return (
    <>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 2 }}>
        <FormControlLabel
          control={
            <Switch
              checked={showBoxes}
              onChange={(e) => setShowBoxes(e.target.checked)}
              size="small"
            />
          }
          label={
            <Typography variant="caption" sx={{ color: '#fff', textShadow: '0 1px 3px rgba(0,0,0,0.8)' }}>
              Bounding Boxes
            </Typography>
          }
          sx={{
            bgcolor: 'rgba(0,0,0,0.5)',
            borderRadius: 2,
            px: 1,
            m: 0,
          }}
        />
      </Box>

      {showBoxes &&
        objects.map((obj, i) => {
          if (!obj.bounding_box) return null;
          const css = bboxToCssPercent(obj.bounding_box);
          return (
            <Box
              key={`${obj.label}-${i}`}
              sx={{
                position: 'absolute',
                ...css,
                border: '2px solid',
                borderColor: 'primary.main',
                borderRadius: 1,
                pointerEvents: 'none',
                transition: 'opacity 0.2s',
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  position: 'absolute',
                  top: -20,
                  left: 0,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  px: 0.5,
                  borderRadius: 0.5,
                  fontSize: '0.65rem',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                }}
              >
                {obj.label} {obj.confidence != null ? `(${(obj.confidence * 100).toFixed(0)}%)` : ''}
              </Typography>
            </Box>
          );
        })}
    </>
  );
}
