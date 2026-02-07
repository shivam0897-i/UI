import { Box, Skeleton, Grid } from '@mui/material';

type Variant = 'card' | 'detail' | 'list' | 'chat';

interface LoadingSkeletonProps {
  variant?: Variant;
  count?: number;
}

function CardSkeleton() {
  return (
    <Box sx={{ borderRadius: 1, overflow: 'hidden' }}>
      <Skeleton variant="rectangular" height={200} />
      <Box sx={{ p: 2 }}>
        <Skeleton width="60%" height={24} />
        <Skeleton width="40%" height={20} sx={{ mt: 1 }} />
        <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={80} height={24} />
        </Box>
      </Box>
    </Box>
  );
}

function DetailSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
      <Skeleton variant="rectangular" sx={{ width: { xs: '100%', md: 500 }, height: 400, borderRadius: 1 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="80%" height={36} />
        <Skeleton width="50%" height={24} sx={{ mt: 1 }} />
        <Skeleton width="100%" height={100} sx={{ mt: 2 }} />
        <Skeleton width="100%" height={100} sx={{ mt: 1 }} />
      </Box>
    </Box>
  );
}

function ListSkeleton() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 1.5 }}>
      <Skeleton variant="rectangular" width={64} height={64} sx={{ borderRadius: 1 }} />
      <Box sx={{ flex: 1 }}>
        <Skeleton width="40%" height={20} />
        <Skeleton width="25%" height={16} sx={{ mt: 0.5 }} />
      </Box>
      <Skeleton variant="rounded" width={48} height={24} />
    </Box>
  );
}

function ChatSkeleton() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Skeleton variant="rounded" width="60%" height={40} />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
        <Skeleton variant="rounded" width="75%" height={60} />
      </Box>
    </Box>
  );
}

export default function LoadingSkeleton({ variant = 'card', count = 1 }: LoadingSkeletonProps) {
  const Skel = { card: CardSkeleton, detail: DetailSkeleton, list: ListSkeleton, chat: ChatSkeleton }[variant];

  if (variant === 'card' && count > 1) {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: count }, (_, i) => (
          <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
            <Skel />
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Skel key={i} />
      ))}
    </>
  );
}
