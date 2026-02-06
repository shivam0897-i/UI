import { Grid } from '@mui/material';
import type { NormalizedImage } from '@/api/types';
import ImageCard from './ImageCard';

interface ImageGridProps {
  images: NormalizedImage[];
  onFindSimilar?: (imageId: string) => void;
}

export default function ImageGrid({ images, onFindSimilar }: ImageGridProps) {
  return (
    <Grid container spacing={2}>
      {images.map((image) => (
        <Grid key={image.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
          <ImageCard image={image} onFindSimilar={onFindSimilar} />
        </Grid>
      ))}
    </Grid>
  );
}
