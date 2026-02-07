import { createTheme, type ThemeOptions, alpha } from '@mui/material/styles';

// ─── Design Tokens ──────────────────────────────────────────────────
// AskFrame V2: System-native fonts, Swiss precision, flat + bordered.
// NO gradients on interactive elements. Solid, intentional colors.

const shared: ThemeOptions = {
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    h1: { fontWeight: 700, fontSize: '2.5rem', letterSpacing: '-0.025em', lineHeight: 1.15 },
    h2: { fontWeight: 700, fontSize: '2rem', letterSpacing: '-0.02em', lineHeight: 1.2 },
    h3: { fontWeight: 600, fontSize: '1.55rem', letterSpacing: '-0.015em', lineHeight: 1.3 },
    h4: { fontWeight: 600, fontSize: '1.25rem', letterSpacing: '-0.01em' },
    h5: { fontWeight: 600, fontSize: '1.05rem' },
    h6: { fontWeight: 600, fontSize: '0.925rem' },
    button: { textTransform: 'uppercase' as const, fontWeight: 600, letterSpacing: '0.06em' },
    subtitle1: { fontWeight: 500 },
    subtitle2: { fontWeight: 600, fontSize: '0.85rem' },
    body1: { lineHeight: 1.65 },
    body2: { lineHeight: 1.6 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
        },
        '::-webkit-scrollbar': { width: 6 },
        '::-webkit-scrollbar-thumb': { borderRadius: 3, background: 'rgba(128,128,128,0.25)' },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundImage: 'none',
          transition: 'border-color 0.2s ease',
        },
      },
      defaultProps: { elevation: 0 },
    },
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 4, padding: '8px 20px', fontWeight: 600 },
        containedPrimary: {
          '&:hover': { filter: 'brightness(1.1)' },
        },
      },
      defaultProps: { disableElevation: true },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 500, borderRadius: 3 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'medium' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 4 },
      },
    },
    MuiSkeleton: {
      defaultProps: { animation: 'wave' },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: { borderRadius: 3, fontSize: '0.75rem' },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: { borderRight: 'none' },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: { borderRadius: 4, margin: '2px 8px' },
      },
    },
    MuiAccordion: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: { borderRadius: '4px !important', '&::before': { display: 'none' } },
      },
    },
  },
};

export const darkTheme = createTheme({
  ...shared,
  palette: {
    mode: 'dark',
    primary: { main: '#5B9A8B', light: '#7EC8B7', dark: '#3E7A6C' },       // Muted sage
    secondary: { main: '#C08B5C', light: '#D4A373', dark: '#A67444' },     // Warm copper
    background: {
      default: '#0D1117',
      paper: '#161B22',
    },
    error: { main: '#E5736A' },
    warning: { main: '#E0A84B' },
    success: { main: '#5B9A8B' },
    info: { main: '#6B9BCF' },
    text: {
      primary: '#E6EDF3',
      secondary: '#8B949E',
    },
    divider: alpha('#8B949E', 0.12),
  },
});

export const lightTheme = createTheme({
  ...shared,
  palette: {
    mode: 'light',
    primary: { main: '#3E7A6C', light: '#5B9A8B', dark: '#2E5E52' },       // Muted sage
    secondary: { main: '#A67444', light: '#C08B5C', dark: '#8A5E36' },     // Warm copper
    background: {
      default: '#F0F2F5',
      paper: '#FFFFFF',
    },
    error: { main: '#C4463A' },
    warning: { main: '#B8860B' },
    success: { main: '#3E7A6C' },
    info: { main: '#3A6EA5' },
    text: {
      primary: '#1F2328',
      secondary: '#656D76',
    },
    divider: alpha('#656D76', 0.25),
  },
});
