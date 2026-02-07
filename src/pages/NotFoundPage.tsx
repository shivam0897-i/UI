import { Box, Typography, Button, alpha } from '@mui/material';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
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
          bgcolor: alpha(t.palette.error.main, 0.08),
        })}
      >
        <SentimentDissatisfiedIcon sx={(t) => ({ fontSize: 48, color: alpha(t.palette.error.main, 0.5) })} />
      </Box>
      <Typography variant="h3" fontWeight={700} gutterBottom>
        404
      </Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Page not found
      </Typography>
      <Typography variant="body2" color="text.disabled" sx={{ mb: 3 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button variant="contained" onClick={() => navigate('/')}>
        Go Home
      </Button>
    </Box>
  );
}
