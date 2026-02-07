import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  useMediaQuery,
  useTheme,
  alpha,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  LinearProgress,
  Avatar,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import SearchIcon from '@mui/icons-material/Search';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import QuestionAnswerOutlinedIcon from '@mui/icons-material/QuestionAnswerOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import SpeedIcon from '@mui/icons-material/Speed';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { ThemeToggle } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';

const MotionBox = motion.create(Box);

// â”€â”€â”€ Reveal on scroll â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Reveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  return (
    <MotionBox
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </MotionBox>
  );
}

// â”€â”€â”€ Mock search demo data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const DEMO_QUERIES = [
  'red sports car at sunset',
  'cat sitting on a table',
  'mountain landscape with lake',
];

const DEMO_RESULTS = [
  [
    { caption: 'A sleek red Ferrari 488 parked at golden hour...', tags: ['car', 'sports car', 'sunset'], score: 94 },
    { caption: 'Red Mustang GT on a coastal highway at dusk...', tags: ['car', 'road', 'evening'], score: 87 },
    { caption: 'Vintage red Porsche 911 in a parking lot...', tags: ['car', 'classic', 'outdoor'], score: 78 },
  ],
  [
    { caption: 'Orange tabby cat sitting beside a coffee mug...', tags: ['cat', 'table', 'indoor'], score: 96 },
    { caption: 'Black and white cat lounging on a wooden table...', tags: ['cat', 'furniture', 'home'], score: 89 },
    { caption: 'Siamese cat next to a laptop on a desk...', tags: ['cat', 'desk', 'indoor'], score: 81 },
  ],
  [
    { caption: 'Snow-capped mountains reflected in crystal lake...', tags: ['mountain', 'lake', 'nature'], score: 97 },
    { caption: 'Alpine valley with emerald lake at sunrise...', tags: ['valley', 'water', 'morning'], score: 91 },
    { caption: 'Rocky peaks towering over a glacial lake...', tags: ['mountain', 'glacier', 'outdoor'], score: 84 },
  ],
];

const VQA_DEMO = [
  { q: 'What brand is on the car?', a: 'The car has a Ferrari badge on the front grille and a prancing horse logo on the fender.' },
  { q: 'Is it daytime or nighttime?', a: 'It appears to be golden hour/sunset â€” the sky shows warm orange and pink tones.' },
  { q: 'What color is the car?', a: 'The car is a deep metallic red, sometimes called Rosso Corsa in Ferrari\'s color range.' },
];

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dark = theme.palette.mode === 'dark';

  // Demo state
  const [demoQueryIdx, setDemoQueryIdx] = useState(0);
  const [typedText, setTypedText] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [vqaIdx, setVqaIdx] = useState(0);
  const [showVqa, setShowVqa] = useState(false);

  const featRef = useRef<HTMLElement>(null);

  // Redirect logged-in users
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // â”€â”€â”€ Typing animation â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  useEffect(() => {
    const query = DEMO_QUERIES[demoQueryIdx % DEMO_QUERIES.length]!;
    setShowResults(false);
    setTypedText('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTypedText(query.slice(0, i));
      if (i >= query.length) {
        clearInterval(interval);
        setTimeout(() => setShowResults(true), 400);
      }
    }, 55);
    return () => clearInterval(interval);
  }, [demoQueryIdx]);

  // Cycle through queries
  useEffect(() => {
    const timer = setInterval(() => {
      setDemoQueryIdx((p) => (p + 1) % DEMO_QUERIES.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // VQA cycling
  useEffect(() => {
    setShowVqa(false);
    const t = setTimeout(() => setShowVqa(true), 300);
    return () => clearTimeout(t);
  }, [vqaIdx]);

  useEffect(() => {
    const timer = setInterval(() => {
      setVqaIdx((p) => (p + 1) % VQA_DEMO.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // â”€â”€â”€ Shared glass card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const glassCard = {
    bgcolor: dark ? alpha('#161B22', 0.8) : alpha('#fff', 0.85),
    backdropFilter: 'blur(16px) saturate(1.3)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 3,
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', overflow: 'hidden', position: 'relative' }}>

      {/* â•â•â• Background â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box sx={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <Box sx={{
          position: 'absolute', width: '50vw', height: '50vw', maxWidth: 600, maxHeight: 600,
          borderRadius: '50%', top: '-8%', right: '-5%',
          background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, dark ? 0.15 : 0.1)} 0%, transparent 70%)`,
          filter: 'blur(60px)',
        }} />
        <Box sx={{
          position: 'absolute', width: '40vw', height: '40vw', maxWidth: 500, maxHeight: 500,
          borderRadius: '50%', bottom: '10%', left: '-8%',
          background: `radial-gradient(circle, ${alpha(theme.palette.secondary.main, dark ? 0.1 : 0.06)} 0%, transparent 70%)`,
          filter: 'blur(70px)',
        }} />
      </Box>

      {/* â•â•â• Navbar â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box component="header" sx={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1100,
        transition: 'all 0.3s ease',
        bgcolor: scrolled ? alpha(theme.palette.background.default, 0.92) : 'transparent',
        backdropFilter: scrolled ? 'blur(20px) saturate(1.4)' : 'none',
        borderBottom: scrolled ? `1px solid ${theme.palette.divider}` : '1px solid transparent',
      }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
              <Box sx={{
                width: 32, height: 32, borderRadius: 1.5, bgcolor: 'primary.main',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem' }}>VQ</Typography>
              </Box>
              <Typography sx={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>
                VQA<Typography component="span" sx={{ color: 'primary.main', fontWeight: 800, fontSize: 'inherit' }}>Search</Typography>
              </Typography>
            </Box>
            {!isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ThemeToggle />
                <Button color="inherit" onClick={() => navigate('/login')} sx={{ fontWeight: 600 }}>Log in</Button>
                <Button variant="contained" onClick={() => navigate('/register')} sx={{ px: 3 }}>
                  Get Started
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThemeToggle />
                <IconButton onClick={() => setMenuOpen(true)} color="inherit"><MenuIcon /></IconButton>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Mobile drawer */}
      <Drawer anchor="right" open={menuOpen} onClose={() => setMenuOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 280, bgcolor: 'background.default', p: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <IconButton onClick={() => setMenuOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <List disablePadding>
          <ListItemButton onClick={() => { setMenuOpen(false); navigate('/login'); }} sx={{ borderRadius: 2 }}>
            <ListItemText primary="Log in" />
          </ListItemButton>
          <ListItemButton onClick={() => { setMenuOpen(false); navigate('/register'); }}
            sx={{ bgcolor: 'primary.main', borderRadius: 2, mt: 1, '&:hover': { bgcolor: 'primary.dark' } }}>
            <ListItemText primary="Get Started" primaryTypographyProps={{ sx: { color: '#fff', fontWeight: 700 } }} />
          </ListItemButton>
        </List>
      </Drawer>

      {/* â•â•â• Hero â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box component="section" sx={{ position: 'relative', zIndex: 1, pt: { xs: 14, md: 16 }, pb: { xs: 4, md: 6 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto' }}>
            {/* Badge */}
            <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <Chip
                icon={<AutoAwesomeIcon sx={{ fontSize: 16 }} />}
                label="AI-Powered Image Intelligence"
                size="small"
                sx={{
                  mb: 3,
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: 'primary.main',
                  fontWeight: 600,
                  '& .MuiChip-icon': { color: 'primary.main' },
                }}
              />
            </MotionBox>

            {/* Headline */}
            <MotionBox initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
              <Typography variant="h1" sx={{
                fontSize: { xs: '2.2rem', sm: '3rem', md: '3.8rem' },
                fontWeight: 800, letterSpacing: '-0.035em', lineHeight: 1.1, mb: 2.5,
              }}>
                Search your images{' '}
                <Box component="span" sx={{
                  position: 'relative', display: 'inline-block',
                  color: 'primary.main',
                  '&::after': {
                    content: '""', position: 'absolute', bottom: 2, left: 0, right: 0, height: 4,
                    bgcolor: alpha(theme.palette.primary.main, 0.3), borderRadius: 2,
                  },
                }}>
                  by describing them
                </Box>
              </Typography>
            </MotionBox>

            <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
              <Typography variant="body1" color="text.secondary" sx={{
                fontSize: { xs: '1rem', md: '1.12rem' }, lineHeight: 1.65,
                maxWidth: 540, mx: 'auto', mb: 4,
              }}>
                Upload images, AI analyzes them once â€” objects, scenes, captions.
                Then search with natural language or ask questions about any image. Instantly.
              </Typography>
            </MotionBox>

            {/* CTA */}
            <MotionBox initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.5 }}
              sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap', mb: { xs: 6, md: 8 } }}>
              <Button variant="contained" size="large" onClick={() => navigate('/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2.5 }}>
                Start for free
              </Button>
              <Button size="large" onClick={() => featRef.current?.scrollIntoView({ behavior: 'smooth' })}
                sx={{
                  px: 4, py: 1.5, fontSize: '1rem', borderRadius: 2.5,
                  color: 'text.secondary', '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.04) },
                }}>
                See how it works
              </Button>
            </MotionBox>
          </Box>

          {/* â”€â”€â”€ LIVE DEMO â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
          <MotionBox
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Paper sx={{
              ...glassCard, p: { xs: 2, md: 3 }, maxWidth: 900, mx: 'auto',
              boxShadow: dark
                ? `0 20px 60px ${alpha('#000', 0.4)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}`
                : `0 20px 60px ${alpha('#000', 0.08)}, 0 0 0 1px ${alpha(theme.palette.primary.main, 0.06)}`,
            }}>
              {/* Browser chrome */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2, px: 1 }}>
                <Box sx={{ display: 'flex', gap: 0.7 }}>
                  {['#FF5F57', '#FFBD2E', '#28CA41'].map((c) => (
                    <Box key={c} sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: c, opacity: 0.8 }} />
                  ))}
                </Box>
                <Box sx={{
                  flex: 1, ml: 2, px: 2, py: 0.6, borderRadius: 1.5,
                  bgcolor: dark ? alpha('#fff', 0.05) : alpha('#000', 0.04),
                  display: 'flex', alignItems: 'center', gap: 1,
                }}>
                  <SearchIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                    vqa-image-search.vercel.app
                  </Typography>
                </Box>
              </Box>

              {/* Search input */}
              <Box sx={{ mb: 2 }}>
                <TextField
                  fullWidth
                  value={typedText}
                  placeholder="Search your images..."
                  slotProps={{
                    input: {
                      readOnly: true,
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: 'primary.main' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Chip label="Enter" size="small" sx={{ height: 24, fontSize: '0.7rem', fontWeight: 600 }} />
                        </InputAdornment>
                      ),
                      sx: { bgcolor: dark ? alpha('#fff', 0.03) : alpha('#000', 0.02), fontSize: '0.95rem' },
                    },
                  }}
                  size="small"
                />
              </Box>

              {/* Results */}
              <AnimatePresence mode="wait">
                {showResults ? (
                  <MotionBox key={`results-${demoQueryIdx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' }, gap: 1.5 }}>
                    {(DEMO_RESULTS[demoQueryIdx % DEMO_RESULTS.length] ?? []).map((r, i) => (
                      <MotionBox key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: i * 0.1 }}>
                        <Box sx={{
                          p: 2, borderRadius: 2,
                          bgcolor: dark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                          border: `1px solid ${theme.palette.divider}`,
                          transition: 'border-color 0.2s',
                          '&:hover': { borderColor: theme.palette.primary.main },
                        }}>
                          <Box sx={{
                            width: '100%', height: 80, borderRadius: 1.5, mb: 1.5,
                            bgcolor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
                            <PhotoLibraryOutlinedIcon sx={{ fontSize: 28, color: 'text.secondary', opacity: 0.4 }} />
                          </Box>
                          <Typography variant="caption" sx={{
                            display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                            overflow: 'hidden', lineHeight: 1.4, mb: 1, fontSize: '0.72rem', color: 'text.secondary',
                          }}>
                            {r.caption}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                            {r.tags.map((t) => (
                              <Chip key={t} label={t} size="small" sx={{
                                height: 20, fontSize: '0.6rem', fontWeight: 600,
                                bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main',
                              }} />
                            ))}
                            <Typography variant="caption" sx={{
                              ml: 'auto', fontWeight: 700, fontSize: '0.65rem',
                              color: r.score > 90 ? 'success.main' : r.score > 80 ? 'warning.main' : 'text.secondary',
                            }}>
                              {r.score}%
                            </Typography>
                          </Box>
                        </Box>
                      </MotionBox>
                    ))}
                  </MotionBox>
                ) : (
                  <MotionBox key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} sx={{ py: 4 }}>
                    <LinearProgress sx={{ mx: 'auto', maxWidth: 300, borderRadius: 2, height: 3 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1.5 }}>
                      Searching with AI...
                    </Typography>
                  </MotionBox>
                )}
              </AnimatePresence>
            </Paper>
          </MotionBox>

          {/* Trust strip */}
          <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 1 }}
            sx={{ display: 'flex', justifyContent: 'center', gap: { xs: 3, md: 6 }, flexWrap: 'wrap', mt: { xs: 4, md: 6 }, mb: 2 }}>
            {[
              { icon: <SpeedIcon sx={{ fontSize: 18 }} />, label: '<100ms search' },
              { icon: <CloudUploadOutlinedIcon sx={{ fontSize: 18 }} />, label: '50+ batch upload' },
              { icon: <SmartToyOutlinedIcon sx={{ fontSize: 18 }} />, label: 'YOLOv8 + CLIP + Gemini' },
            ].map((s) => (
              <Box key={s.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                <Box sx={{ color: 'primary.main', display: 'flex' }}>{s.icon}</Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
                  {s.label}
                </Typography>
              </Box>
            ))}
          </MotionBox>
        </Container>
      </Box>

      {/* â•â•â• Features â€” Show don't tell â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box ref={featRef} component="section" sx={{ position: 'relative', zIndex: 1, py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Reveal>
            <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 10 } }}>
              <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.12em', mb: 1, display: 'block' }}>
                Features
              </Typography>
              <Typography variant="h2" sx={{ fontWeight: 800, letterSpacing: '-0.03em', mb: 1.5 }}>
                Three things that make it powerful
              </Typography>
              <Typography color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
                Each image is processed once by AI. After that, every interaction is instant.
              </Typography>
            </Box>
          </Reveal>

          {/* Feature 1: Upload */}
          <Reveal>
            <Box sx={{
              display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 6 }, alignItems: 'center', mb: { xs: 8, md: 14 },
            }}>
              <Box>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', mb: 2,
                }}>
                  <CloudUploadOutlinedIcon />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.02em' }}>
                  Upload & Understand
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Drop your images, and AI does the rest. Objects detected. Scenes classified.
                  Rich captions generated. All in 3-8 seconds per image.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Object detection with YOLOv8', 'Scene classification & tagging', 'AI captions via Gemini', 'Batch upload up to 50 images'].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Mock upload UI */}
              <Paper sx={{
                ...glassCard, p: 3,
                boxShadow: dark ? `0 8px 32px ${alpha('#000', 0.3)}` : `0 8px 32px ${alpha('#000', 0.06)}`,
              }}>
                <Box sx={{
                  border: `2px dashed ${alpha(theme.palette.primary.main, 0.3)}`,
                  borderRadius: 2, p: 4, textAlign: 'center',
                  bgcolor: alpha(theme.palette.primary.main, 0.03),
                }}>
                  <CloudUploadOutlinedIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1.5 }} />
                  <Typography variant="body2" fontWeight={600} sx={{ mb: 0.5 }}>
                    Drag & drop images here
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    JPG, PNG, WebP up to 10MB each
                  </Typography>
                </Box>
                <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                  {[
                    { name: 'sunset_car.jpg', status: 'Completed', progress: 100 },
                    { name: 'mountain_view.png', status: 'Processing...', progress: 65 },
                    { name: 'cat_photo.jpg', status: 'Queued', progress: 0 },
                  ].map((file) => (
                    <Box key={file.name} sx={{
                      display: 'flex', alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 1.5,
                      bgcolor: dark ? alpha('#fff', 0.03) : alpha('#000', 0.02),
                    }}>
                      <Box sx={{
                        width: 36, height: 36, borderRadius: 1, bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <PhotoLibraryOutlinedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="caption" fontWeight={600} noWrap sx={{ display: 'block' }}>
                          {file.name}
                        </Typography>
                        {file.progress > 0 && file.progress < 100 && (
                          <LinearProgress variant="determinate" value={file.progress}
                            sx={{ mt: 0.5, height: 3, borderRadius: 2 }} />
                        )}
                      </Box>
                      <Chip label={file.status} size="small" sx={{
                        height: 22, fontSize: '0.65rem', fontWeight: 600, flexShrink: 0,
                        bgcolor: file.status === 'Completed'
                          ? alpha(theme.palette.success.main, 0.12)
                          : file.status === 'Processing...'
                            ? alpha(theme.palette.warning.main, 0.12)
                            : alpha(theme.palette.text.secondary, 0.08),
                        color: file.status === 'Completed' ? 'success.main'
                          : file.status === 'Processing...' ? 'warning.main' : 'text.secondary',
                      }} />
                    </Box>
                  ))}
                </Box>
              </Paper>
            </Box>
          </Reveal>

          {/* Feature 2: Search */}
          <Reveal>
            <Box sx={{
              display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 6 }, alignItems: 'center', mb: { xs: 8, md: 14 },
              direction: { md: 'rtl' },
            }}>
              <Box sx={{ direction: 'ltr' }}>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', mb: 2,
                }}>
                  <ImageSearchIcon />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.02em' }}>
                  Search with Language
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Type what you remember â€” "red car at sunset", "cat on a table".
                  AI matches your description against deep image embeddings in milliseconds.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Natural language text search', 'Reverse image search (upload reference)', 'Filter by objects, scenes, confidence', 'Results ranked by relevance score'].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Mock search result */}
              <Paper sx={{
                ...glassCard, p: 3, direction: 'ltr',
                boxShadow: dark ? `0 8px 32px ${alpha('#000', 0.3)}` : `0 8px 32px ${alpha('#000', 0.06)}`,
              }}>
                <Box sx={{
                  display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.2, borderRadius: 2,
                  bgcolor: dark ? alpha('#fff', 0.04) : alpha('#000', 0.03), mb: 2,
                }}>
                  <SearchIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    "red car at sunset"
                  </Typography>
                  <Chip label="94% match" size="small" sx={{
                    ml: 'auto', height: 22, fontSize: '0.65rem', fontWeight: 700,
                    bgcolor: alpha(theme.palette.success.main, 0.12), color: 'success.main',
                  }} />
                </Box>
                {[
                  { caption: 'A sleek red Ferrari 488 parked at golden hour with warm light...', tags: ['car', 'sunset', 'sports car'], score: 94 },
                  { caption: 'Red Mustang GT on a coastal highway during evening...', tags: ['car', 'road'], score: 87 },
                ].map((r, i) => (
                  <Box key={i} sx={{
                    display: 'flex', gap: 1.5, p: 1.5, borderRadius: 1.5, mb: 1,
                    bgcolor: dark ? alpha('#fff', 0.02) : alpha('#000', 0.015),
                    border: i === 0 ? `1px solid ${alpha(theme.palette.primary.main, 0.2)}` : '1px solid transparent',
                  }}>
                    <Box sx={{
                      width: 60, height: 60, borderRadius: 1.5, flexShrink: 0,
                      bgcolor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <PhotoLibraryOutlinedIcon sx={{ fontSize: 22, color: 'text.secondary', opacity: 0.4 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="caption" sx={{ display: 'block', lineHeight: 1.4, mb: 0.5, fontSize: '0.72rem' }}>
                        {r.caption}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                        {r.tags.map((t) => (
                          <Chip key={t} label={t} size="small" sx={{
                            height: 18, fontSize: '0.58rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.08), color: 'primary.main',
                          }} />
                        ))}
                        <Typography variant="caption" sx={{ ml: 'auto', fontWeight: 700, fontSize: '0.65rem', color: 'success.main' }}>
                          {r.score}%
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                ))}
              </Paper>
            </Box>
          </Reveal>

          {/* Feature 3: VQA */}
          <Reveal>
            <Box sx={{
              display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 6 }, alignItems: 'center',
            }}>
              <Box>
                <Box sx={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: 44, height: 44, borderRadius: 2,
                  bgcolor: alpha(theme.palette.primary.main, 0.12), color: 'primary.main', mb: 2,
                }}>
                  <QuestionAnswerOutlinedIcon />
                </Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1.5, letterSpacing: '-0.02em' }}>
                  Ask Anything
                </Typography>
                <Typography color="text.secondary" sx={{ mb: 2, lineHeight: 1.7 }}>
                  Point at any image and ask a question. "What brand is that?"
                  "How many people?" AI answers based on what it actually sees.
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {['Questions about any uploaded image', 'Powered by Gemini Vision', 'Answers grounded in image content', 'Works with text and visual context'].map((item) => (
                    <Box key={item} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <CheckCircleOutlineIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">{item}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
              {/* Mock VQA */}
              <Paper sx={{
                ...glassCard, p: 3,
                boxShadow: dark ? `0 8px 32px ${alpha('#000', 0.3)}` : `0 8px 32px ${alpha('#000', 0.06)}`,
              }}>
                <Box sx={{
                  width: '100%', height: 120, borderRadius: 2, mb: 2,
                  bgcolor: dark ? alpha('#fff', 0.05) : alpha('#000', 0.03),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: `1px solid ${theme.palette.divider}`,
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <PhotoLibraryOutlinedIcon sx={{ fontSize: 32, color: 'text.secondary', opacity: 0.3, mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.65rem' }}>
                      sunset_car.jpg
                    </Typography>
                  </Box>
                </Box>
                <AnimatePresence mode="wait">
                  {showVqa && (
                    <MotionBox key={vqaIdx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1.5 }}>
                        <Box sx={{
                          px: 2, py: 1.2, borderRadius: '14px 14px 4px 14px', maxWidth: '80%',
                          bgcolor: 'primary.main', color: '#fff',
                        }}>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem' }}>
                            {VQA_DEMO[vqaIdx % VQA_DEMO.length]!.q}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Avatar sx={{ width: 26, height: 26, bgcolor: alpha(theme.palette.primary.main, 0.15) }}>
                          <AutoAwesomeIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                        </Avatar>
                        <Box sx={{
                          px: 2, py: 1.2, borderRadius: '14px 14px 14px 4px', maxWidth: '85%',
                          bgcolor: dark ? alpha('#fff', 0.06) : alpha('#000', 0.04),
                        }}>
                          <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.5 }}>
                            {VQA_DEMO[vqaIdx % VQA_DEMO.length]!.a}
                          </Typography>
                        </Box>
                      </Box>
                    </MotionBox>
                  )}
                </AnimatePresence>
              </Paper>
            </Box>
          </Reveal>
        </Container>
      </Box>

      {/* â•â•â• CTA â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box component="section" sx={{ position: 'relative', zIndex: 1, py: { xs: 10, md: 16 } }}>
        <Container maxWidth="sm">
          <Reveal>
            <Paper sx={{
              ...glassCard, textAlign: 'center', p: { xs: 4, md: 6 },
              boxShadow: dark
                ? `0 16px 48px ${alpha('#000', 0.3)}, inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.1)}`
                : `0 16px 48px ${alpha('#000', 0.06)}, inset 0 0 0 1px ${alpha(theme.palette.primary.main, 0.08)}`,
            }}>
              <AutoAwesomeIcon sx={{ fontSize: 36, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: '-0.02em', mb: 1.5 }}>
                Ready to try it?
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 360, mx: 'auto' }}>
                Upload your first image, search it with words, ask it a question. Takes less than a minute.
              </Typography>
              <Button variant="contained" size="large" onClick={() => navigate('/register')}
                endIcon={<ArrowForwardIcon />}
                sx={{ px: 5, py: 1.5, fontSize: '1rem', borderRadius: 2.5 }}>
                Get started free
              </Button>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 2 }}>
                No credit card Â· No usage limits
              </Typography>
            </Paper>
          </Reveal>
        </Container>
      </Box>

      {/* â•â•â• Footer â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      <Box component="footer" sx={{ position: 'relative', zIndex: 1, py: 3.5, borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="caption" color="text.secondary">
              Â© {new Date().getFullYear()} VQASearch Â· Built with YOLOv8, CLIP & Gemini
            </Typography>
            <IconButton size="small" href="https://github.com/shivam0897-i/UI" target="_blank" rel="noopener" sx={{ color: 'text.secondary' }}>
              <GitHubIcon fontSize="small" />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}

