import { Box, Typography, LinearProgress, Fade, alpha } from '@mui/material';

interface BackendWakingProps {
  isWaking: boolean;
  retryCount: number;
}

/**
 * Full-screen overlay shown when backend HF Space is waking from sleep.
 */
export default function BackendWaking({ isWaking, retryCount }: BackendWakingProps) {
  return (
    <Fade in={isWaking}>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: 'background.default',
          gap: 3,
        }}
      >
        {/* Simple logo */}
        <Box
          sx={{
            width: 56,
            height: 56,
            borderRadius: 2,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography variant="h6" sx={{ color: '#fff', fontWeight: 700, letterSpacing: 0.5 }}>
            VQ
          </Typography>
        </Box>

        <Typography variant="h6" fontWeight={600}>
          Waking up the backend
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340, textAlign: 'center' }}>
          The server is hosted on a free tier and sleeps after inactivity.
          This usually takes 30–60 seconds.
        </Typography>

        <Box sx={{ width: 240 }}>
          <LinearProgress
            variant="indeterminate"
            sx={(t) => ({
              borderRadius: 1,
              height: 4,
              bgcolor: alpha(t.palette.primary.main, 0.1),
            })}
          />
        </Box>

        <Typography variant="caption" color="text.disabled">
          Attempt {retryCount} / 30
        </Typography>
      </Box>
    </Fade>
  );
}
