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
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import GitHubIcon from '@mui/icons-material/GitHub';
import { ThemeToggle } from '@/components/common';
import { useAuth } from '@/contexts/AuthContext';

// ─── Monospace stack ─────────────────────────────────────────────────
const MONO = 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

// ─── Demo data ───────────────────────────────────────────────────────
const DEMO_QUERIES = [
  {
    text: 'red sports car at sunset',
    count: 42,
    time: '47ms',
    rows: [
      { id: '001', caption: 'Red Ferrari 488 at golden hour, coastal highway', tags: 'car, sunset', score: 0.94 },
      { id: '002', caption: 'Red Mustang GT on highway, evening light', tags: 'car, road', score: 0.87 },
      { id: '003', caption: 'Vintage Porsche 911 in parking lot', tags: 'car, classic', score: 0.78 },
    ],
  },
  {
    text: 'cat sitting on a table',
    count: 18,
    time: '31ms',
    rows: [
      { id: '014', caption: 'Orange tabby beside coffee mug on oak table', tags: 'cat, table', score: 0.96 },
      { id: '015', caption: 'Black-white cat lounging on wooden table', tags: 'cat, furniture', score: 0.89 },
      { id: '016', caption: 'Siamese cat next to laptop on desk', tags: 'cat, desk', score: 0.81 },
    ],
  },
  {
    text: 'mountain landscape with lake',
    count: 27,
    time: '52ms',
    rows: [
      { id: '031', caption: 'Snow-capped peaks reflected in crystal lake', tags: 'mountain, lake', score: 0.97 },
      { id: '032', caption: 'Alpine valley with emerald lake at sunrise', tags: 'valley, water', score: 0.91 },
      { id: '033', caption: 'Rocky peaks over glacial lake, clear sky', tags: 'mountain, glacier', score: 0.84 },
    ],
  },
];

const PIPELINE = [
  { label: 'YOLOv8', desc: 'Object detection' },
  { label: 'CLIP', desc: 'Semantic embeddings' },
  { label: 'Qdrant', desc: 'Vector index' },
  { label: 'Gemini', desc: 'VQA & captions' },
];

const SPECS = [
  { label: 'INDEX', value: '3–8s', desc: 'Per image, one-time' },
  { label: 'SEARCH', value: '<100ms', desc: 'Vector similarity query' },
  { label: 'BATCH', value: '50', desc: 'Images per request' },
  { label: 'MODELS', value: '3', desc: 'YOLOv8 + CLIP + Gemini' },
];

const CAPABILITIES = [
  { title: 'Semantic Search', desc: 'Natural language queries matched against CLIP embeddings. Describe what you remember — ranked results with confidence scores.' },
  { title: 'Reverse Image Search', desc: 'Upload a reference image. Vector similarity finds visually similar frames from your index.' },
  { title: 'Visual Q\u0026A', desc: 'Ask questions about any indexed image. Gemini Vision. Answers grounded in image content.' },
  { title: 'Object Detection', desc: 'YOLOv8 identifies and localizes objects. Bounding boxes, class labels, confidence scores — all indexed.' },
  { title: 'Auto Captioning', desc: 'AI-generated captions describe scene composition, subjects, context. Stored as searchable metadata.' },
  { title: 'Batch Processing', desc: 'Up to 50 images per request. Server-side processing. Each image indexed in 3–8 seconds.' },
];

// ═════════════════════════════════════════════════════════════════════
export default function LandingPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, isLoading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dark = theme.palette.mode === 'dark';

  // Demo state
  const [qIdx, setQIdx] = useState(0);
  const [typed, setTyped] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  const specsRef = useRef<HTMLElement>(null);

  // Brand palette
  const sage = '#3E7A6C';
  const clay = '#C08B5C';
  const signal = '#C4463A';

  const bg = dark ? '#0D1117' : '#F6F8FA';
  const fg = dark ? '#E6EDF3' : '#1F2328';
  const muted = dark ? '#8B949E' : '#656D76';
  const border = dark ? alpha('#8B949E', 0.15) : alpha('#656D76', 0.18);
  const surface = dark ? '#161B22' : '#FFFFFF';

  // ─── Effects ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Typing animation
  useEffect(() => {
    const q = DEMO_QUERIES[qIdx % DEMO_QUERIES.length]!;
    setShowOutput(false);
    setTyped('');
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setTyped(q.text.slice(0, i));
      if (i >= q.text.length) {
        clearInterval(interval);
        setTimeout(() => setShowOutput(true), 300);
      }
    }, 50);
    return () => clearInterval(interval);
  }, [qIdx]);

  useEffect(() => {
    const t = setInterval(() => setQIdx((p) => (p + 1) % DEMO_QUERIES.length), 6500);
    return () => clearInterval(t);
  }, []);

  const q = DEMO_QUERIES[qIdx % DEMO_QUERIES.length]!;

  // ─── Shared styles ─────────────────────────────────────────────────
  const mono = { fontFamily: MONO };

  const label = {
    fontFamily: MONO,
    fontSize: '0.62rem',
    fontWeight: 600,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    color: muted,
  };

  const frame = {
    border: `1px solid ${border}`,
    borderRadius: '2px',
    bgcolor: surface,
  };

  const ctaBtn = {
    bgcolor: sage,
    color: '#fff',
    fontWeight: 700,
    fontSize: '0.78rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    borderRadius: '2px',
    px: 3.5,
    py: 1.2,
    '&:hover': { bgcolor: alpha(sage, 0.82) },
  };

  // ═══════════════════════════════════════════════════════════════════
  return (
    <Box sx={{ bgcolor: bg, minHeight: '100vh', color: fg }}>

      {/* ═══ Navbar ═══════════════════════════════════════════════════ */}
      <Box
        component="header"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          bgcolor: scrolled ? alpha(bg, 0.96) : 'transparent',
          borderBottom: `1px solid ${scrolled ? border : 'transparent'}`,
          transition: 'background-color 0.2s, border-color 0.2s',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1.5 }}>
            {/* Logo — Geometric frame + focus mark */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'default' }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  border: `2px solid ${fg}`,
                  borderRadius: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box sx={{ width: 6, height: 6, bgcolor: sage, borderRadius: '1px' }} />
              </Box>
              <Typography
                sx={{
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                AskFrame
              </Typography>
            </Box>

            {!isMobile ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <ThemeToggle />
                <Button
                  onClick={() => navigate('/login')}
                  sx={{
                    color: muted,
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderRadius: '2px',
                    px: 2,
                    '&:hover': { bgcolor: alpha(fg, 0.04) },
                  }}
                >
                  Log in
                </Button>
                <Button
                  onClick={() => navigate('/register')}
                  sx={{
                    bgcolor: fg,
                    color: bg,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    borderRadius: '2px',
                    px: 3,
                    py: 0.8,
                    '&:hover': { bgcolor: alpha(fg, 0.82) },
                  }}
                >
                  Create Account
                </Button>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <ThemeToggle />
                <IconButton onClick={() => setMenuOpen(true)} sx={{ color: fg }}>
                  <MenuIcon />
                </IconButton>
              </Box>
            )}
          </Box>
        </Container>
      </Box>

      {/* Mobile drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        sx={{ '& .MuiDrawer-paper': { width: 260, bgcolor: bg, p: 3, borderRadius: 0 } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
          <IconButton onClick={() => setMenuOpen(false)} sx={{ color: fg }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <List disablePadding>
          <ListItemButton
            onClick={() => { setMenuOpen(false); navigate('/login'); }}
            sx={{ borderRadius: '2px' }}
          >
            <ListItemText
              primary="LOG IN"
              primaryTypographyProps={{
                sx: { fontWeight: 600, fontSize: '0.82rem', letterSpacing: '0.08em' },
              }}
            />
          </ListItemButton>
          <ListItemButton
            onClick={() => { setMenuOpen(false); navigate('/register'); }}
            sx={{
              bgcolor: fg,
              borderRadius: '2px',
              mt: 1,
              '&:hover': { bgcolor: alpha(fg, 0.82) },
            }}
          >
            <ListItemText
              primary="CREATE ACCOUNT"
              primaryTypographyProps={{
                sx: { color: bg, fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.08em' },
              }}
            />
          </ListItemButton>
        </List>
      </Drawer>

      {/* ═══ Hero ═════════════════════════════════════════════════════ */}
      <Box component="section" sx={{ pt: { xs: 14, md: 18 }, pb: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ maxWidth: 660 }}>
            <Typography sx={{ ...label, color: sage, mb: 2.5 }}>
              Visual Search Engine
            </Typography>

            <Typography
              sx={{
                fontSize: { xs: '2rem', sm: '2.6rem', md: '3.4rem' },
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.03em',
                mb: 3,
              }}
            >
              Semantic image search.{' '}
              <Box component="span" sx={{ color: muted }}>
                Local index. Zero latency.
              </Box>
            </Typography>

            <Typography sx={{ fontSize: '1.02rem', lineHeight: 1.7, color: muted, maxWidth: 500, mb: 4 }}>
              Upload images. AI indexes objects, scenes, and captions once.
              Then query with natural language or ask questions about any frame.
              Results in milliseconds.
            </Typography>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                onClick={() => navigate('/register')}
                endIcon={<ArrowForwardIcon sx={{ fontSize: '16px !important' }} />}
                sx={ctaBtn}
              >
                Create Account
              </Button>
              <Button
                onClick={() => specsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                sx={{
                  color: muted,
                  fontWeight: 600,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  borderRadius: '2px',
                  border: `1px solid ${border}`,
                  px: 3,
                  py: 1.2,
                  '&:hover': { bgcolor: alpha(fg, 0.03) },
                }}
              >
                View Specs
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ═══ Terminal Demo ════════════════════════════════════════════ */}
      <Box component="section" sx={{ pb: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Box sx={{ ...frame, overflow: 'hidden', maxWidth: 820 }}>
            {/* Terminal chrome */}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.8,
                px: 2.5,
                py: 1.2,
                borderBottom: `1px solid ${border}`,
              }}
            >
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: signal, opacity: 0.7 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: clay, opacity: 0.7 }} />
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: sage, opacity: 0.7 }} />
              <Typography sx={{ ...label, ml: 1.5, fontSize: '0.58rem' }}>
                askframe — search
              </Typography>
            </Box>

            {/* Terminal body */}
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              {/* Command line */}
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Typography sx={{ ...mono, fontSize: '0.82rem', color: sage, fontWeight: 700 }}>
                  $
                </Typography>
                <Typography component="div" sx={{ ...mono, fontSize: '0.82rem' }}>
                  askframe search &quot;{typed}&quot;
                  <Box
                    component="span"
                    sx={{
                      display: 'inline-block',
                      width: 7,
                      height: 15,
                      bgcolor: sage,
                      ml: 0.3,
                      verticalAlign: 'text-bottom',
                      animation: 'cursorBlink 1s step-end infinite',
                      '@keyframes cursorBlink': {
                        '0%, 100%': { opacity: 1 },
                        '50%': { opacity: 0 },
                      },
                    }}
                  />
                </Typography>
              </Box>

              {/* Output */}
              {showOutput && (
                <Box
                  sx={{
                    borderTop: `1px solid ${border}`,
                    pt: 2,
                    animation: 'fadeIn 0.25s ease-out',
                    '@keyframes fadeIn': { from: { opacity: 0 }, to: { opacity: 1 } },
                  }}
                >
                  <Typography sx={{ ...mono, fontSize: '0.72rem', color: muted, mb: 2 }}>
                    {q.count} results · {q.time}
                  </Typography>

                  {/* Table header */}
                  <Box
                    sx={{
                      display: { xs: 'none', sm: 'grid' },
                      gridTemplateColumns: '48px 1fr 100px 64px',
                      gap: 1.5,
                      px: 1,
                      pb: 0.8,
                      borderBottom: `1px solid ${border}`,
                      mb: 0.5,
                    }}
                  >
                    {['#', 'CAPTION', 'TAGS', 'SCORE'].map((h) => (
                      <Typography key={h} sx={{ ...label, fontSize: '0.56rem' }}>
                        {h}
                      </Typography>
                    ))}
                  </Box>

                  {/* Rows */}
                  {q.rows.map((row) => (
                    <Box
                      key={row.id}
                      sx={{
                        display: { xs: 'block', sm: 'grid' },
                        gridTemplateColumns: '48px 1fr 100px 64px',
                        gap: 1.5,
                        px: 1,
                        py: 1,
                        borderBottom: `1px solid ${alpha(border, 0.5)}`,
                        '&:hover': { bgcolor: alpha(sage, 0.04) },
                      }}
                    >
                      <Typography sx={{ ...mono, fontSize: '0.72rem', color: muted, display: { xs: 'none', sm: 'block' } }}>
                        {row.id}
                      </Typography>
                      <Typography sx={{ ...mono, fontSize: '0.72rem' }} noWrap>
                        {row.caption}
                      </Typography>
                      <Typography sx={{ ...mono, fontSize: '0.72rem', color: muted }}>
                        {row.tags}
                      </Typography>
                      <Typography
                        sx={{
                          ...mono,
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: row.score >= 0.9 ? sage : row.score >= 0.8 ? clay : muted,
                        }}
                      >
                        {(row.score * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* ═══ Pipeline ═════════════════════════════════════════════════ */}
      <Box
        component="section"
        sx={{
          py: { xs: 6, md: 10 },
          borderTop: `1px solid ${border}`,
          borderBottom: `1px solid ${border}`,
        }}
      >
        <Container maxWidth="lg">
          <Typography sx={{ ...label, mb: 4 }}>Processing Pipeline</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
            }}
          >
            {PIPELINE.map((step, i) => (
              <Box
                key={step.label}
                sx={{
                  p: { xs: 2.5, md: 3.5 },
                  borderRight: {
                    xs: i % 2 === 0 ? `1px solid ${border}` : 'none',
                    md: i < 3 ? `1px solid ${border}` : 'none',
                  },
                  borderBottom: {
                    xs: i < 2 ? `1px solid ${border}` : 'none',
                    md: 'none',
                  },
                }}
              >
                <Typography sx={{ ...mono, fontWeight: 700, fontSize: '0.68rem', color: sage, mb: 0.5 }}>
                  {String(i + 1).padStart(2, '0')}
                </Typography>
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em', mb: 0.5 }}>
                  {step.label}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: muted }}>
                  {step.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ═══ Specs ════════════════════════════════════════════════════ */}
      <Box ref={specsRef} component="section" sx={{ py: { xs: 8, md: 14 } }}>
        <Container maxWidth="lg">
          <Typography sx={{ ...label, mb: 5 }}>Specifications</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
              border: `1px solid ${border}`,
              borderRadius: '2px',
            }}
          >
            {SPECS.map((spec, i) => (
              <Box
                key={spec.label}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRight: {
                    xs: i % 2 === 0 ? `1px solid ${border}` : 'none',
                    md: i < 3 ? `1px solid ${border}` : 'none',
                  },
                  borderBottom: {
                    xs: i < 2 ? `1px solid ${border}` : 'none',
                    md: 'none',
                  },
                }}
              >
                <Typography sx={{ ...label, mb: 1.5 }}>{spec.label}</Typography>
                <Typography
                  sx={{
                    ...mono,
                    fontSize: { xs: '1.8rem', md: '2.2rem' },
                    fontWeight: 700,
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                    mb: 1,
                  }}
                >
                  {spec.value}
                </Typography>
                <Typography sx={{ fontSize: '0.78rem', color: muted }}>{spec.desc}</Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ═══ Capabilities ═════════════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 6, md: 10 }, borderTop: `1px solid ${border}` }}>
        <Container maxWidth="lg">
          <Typography sx={{ ...label, mb: 5 }}>Capabilities</Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
              border: `1px solid ${border}`,
              borderRadius: '2px',
            }}
          >
            {CAPABILITIES.map((cap, i) => (
              <Box
                key={cap.title}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRight: {
                    xs: 'none',
                    sm: i % 2 === 0 ? `1px solid ${border}` : 'none',
                    md: i % 3 !== 2 ? `1px solid ${border}` : 'none',
                  },
                  borderBottom: i < (isMobile ? 5 : 3) ? `1px solid ${border}` : 'none',
                }}
              >
                <Typography sx={{ fontWeight: 700, fontSize: '0.92rem', letterSpacing: '-0.01em', mb: 1 }}>
                  {cap.title}
                </Typography>
                <Typography sx={{ fontSize: '0.82rem', color: muted, lineHeight: 1.65 }}>
                  {cap.desc}
                </Typography>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* ═══ CTA ══════════════════════════════════════════════════════ */}
      <Box component="section" sx={{ py: { xs: 10, md: 16 }, borderTop: `1px solid ${border}` }}>
        <Container maxWidth="sm">
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ ...label, color: sage, mb: 2 }}>Get Started</Typography>
            <Typography
              sx={{
                fontSize: { xs: '1.6rem', md: '2.2rem' },
                fontWeight: 700,
                letterSpacing: '-0.03em',
                lineHeight: 1.15,
                mb: 2,
              }}
            >
              Upload. Index. Search.
            </Typography>
            <Typography sx={{ color: muted, mb: 4, maxWidth: 340, mx: 'auto', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Create an account. Upload your first image.
              Query it with natural language. Takes 60 seconds.
            </Typography>
            <Button
              onClick={() => navigate('/register')}
              endIcon={<ArrowForwardIcon sx={{ fontSize: '16px !important' }} />}
              sx={{ ...ctaBtn, px: 4 }}
            >
              Create Account
            </Button>
            <Typography sx={{ ...label, mt: 2.5, fontSize: '0.58rem' }}>
              No credit card · No usage limits
            </Typography>
          </Box>
        </Container>
      </Box>

      {/* ═══ Footer ═══════════════════════════════════════════════════ */}
      <Box component="footer" sx={{ py: 3, borderTop: `1px solid ${border}` }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
            <Typography sx={{ ...mono, fontSize: '0.68rem', color: muted }}>
              © {new Date().getFullYear()} AskFrame · YOLOv8 + CLIP + Gemini
            </Typography>
            <IconButton
              size="small"
              href="https://github.com/shivam0897-i/UI"
              target="_blank"
              rel="noopener"
              sx={{ color: muted }}
            >
              <GitHubIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
