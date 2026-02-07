import { useState } from 'react';
import { Card, CardActionArea, CardMedia, CardContent, Typography, Box, Chip, IconButton, Tooltip, alpha } from '@mui/material';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import ImageNotSupportedIcon from '@mui/icons-material/ImageNotSupported';
import { useNavigate } from 'react-router-dom';
import type { NormalizedImage } from '@/api/types';
import { useAuthImage } from '@/hooks';
import { ConfidenceBadge, StatusChip } from '@/components/common';

interface ImageCardProps {
  image: NormalizedImage;
  onFindSimilar?: (imageId: string) => void;
}

export default function ImageCard({ image, onFindSimilar }: ImageCardProps) {
  const navigate = useNavigate();
  const imageSrc = useAuthImage(image.id);
  const [imgError, setImgError] = useState(false);
  const showPlaceholder = !imageSrc || imgError;

  return (
    <Card
      sx={(t) => ({
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: 1,
        borderColor: 'divider',
        transition: 'border-color 0.2s ease',
        '&:hover': {
          borderColor: alpha(t.palette.primary.main, 0.4),
        },
      })}
    >
      <CardActionArea onClick={() => navigate(`/images/${image.id}`)}>
        <Box sx={{ position: 'relative', overflow: 'hidden' }}>
          {showPlaceholder ? (
            <Box
              sx={{
                height: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              }}
            >
              <ImageNotSupportedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 0.5 }} />
              <Typography variant="caption" color="text.disabled">
                Image unavailable
              </Typography>
            </Box>
          ) : (
            <CardMedia
              component="img"
              height={200}
              image={imageSrc}
              alt={image.caption || 'Image'}
              onError={() => setImgError(true)}
              sx={{
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
                '.MuiCardActionArea-root:hover &': { transform: 'scale(1.03)' },
              }}
              loading="lazy"
            />
          )}
          {image.status && (
            <Box sx={{ position: 'absolute', top: 10, right: 10 }}>
              <StatusChip status={image.status} />
            </Box>
          )}
        </Box>

        <CardContent sx={{ flexGrow: 1, pb: 1 }}>
          <Typography variant="subtitle2" noWrap gutterBottom fontWeight={600}>
            {image.caption || image.filename || 'Untitled'}
          </Typography>

          {/* Object labels */}
          {image.objectLabels.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
              {image.objectLabels.slice(0, 4).map((label) => (
                <Chip
                  key={label}
                  label={label}
                  size="small"
                  variant="outlined"
                  sx={(t) => ({
                    fontSize: '0.7rem',
                    borderColor: alpha(t.palette.primary.main, 0.25),
                    color: 'text.secondary',
                  })}
                />
              ))}
              {image.objectLabels.length > 4 && (
                <Chip
                  label={`+${image.objectLabels.length - 4}`}
                  size="small"
                  sx={(t) => ({
                    fontSize: '0.7rem',
                    bgcolor: alpha(t.palette.primary.main, 0.1),
                    color: 'primary.main',
                  })}
                />
              )}
            </Box>
          )}

          {/* Score (search results) */}
          {image.score != null && (
            <Box sx={{ mt: 1 }}>
              <ConfidenceBadge score={image.score} showLabel />
            </Box>
          )}
        </CardContent>
      </CardActionArea>

      {/* Find Similar button */}
      {onFindSimilar && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pb: 1 }}>
          <Tooltip title="Find similar images">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onFindSimilar(image.id);
              }}
              sx={(t) => ({
                color: 'text.secondary',
                '&:hover': {
                  color: 'primary.main',
                  bgcolor: alpha(t.palette.primary.main, 0.08),
                },
              })}
            >
              <FindInPageIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      )}
    </Card>
  );
}
