import { Box, Typography } from '@mui/material';
import type { NormalizedImage } from '@/api/types';
import { ImageGrid } from '@/components/image';
import { EmptyState } from '@/components/common';

interface SearchResultsProps {
  results: NormalizedImage[];
  totalCount: number;
  searchTime?: number;
  onFindSimilar?: (imageId: string) => void;
}

export default function SearchResults({ results, totalCount, searchTime, onFindSimilar }: SearchResultsProps) {
  if (results.length === 0) {
    return <EmptyState variant="no-results" />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {totalCount} result{totalCount !== 1 ? 's' : ''}
        </Typography>
        {searchTime != null && (
          <Typography variant="caption" color="text.disabled">
            ({searchTime.toFixed(0)}ms)
          </Typography>
        )}
      </Box>
      <ImageGrid images={results} onFindSimilar={onFindSimilar} />
    </Box>
  );
}
