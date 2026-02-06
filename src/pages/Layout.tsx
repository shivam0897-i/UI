import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Tooltip,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import CollectionsIcon from '@mui/icons-material/Collections';
import CircleIcon from '@mui/icons-material/Circle';
import type { SxProps, Theme } from '@mui/material';
import { ThemeToggle, BackendWaking } from '@/components/common';
import { useBackendHealth } from '@/hooks';

const NAV_ITEMS = [
  { label: 'Home', path: '/', icon: <HomeIcon /> },
  { label: 'Upload', path: '/upload', icon: <CloudUploadIcon /> },
  { label: 'Search', path: '/search', icon: <SearchIcon /> },
  { label: 'Gallery', path: '/gallery', icon: <CollectionsIcon /> },
];

const DRAWER_WIDTH = 240;

const layoutStyles: Record<string, SxProps<Theme>> = {
  root: { display: 'flex', minHeight: '100vh' },
  appBar: {
    zIndex: (t: Theme) => t.zIndex.drawer + 1,
    bgcolor: 'background.default',
    borderBottom: 1,
    borderColor: 'divider',
  },
  logoMark: {
    width: 30,
    height: 30,
    borderRadius: 1.5,
    bgcolor: 'primary.main',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  mainContent: {
    flexGrow: 1,
    p: { xs: 2, sm: 3 },
    mt: '64px',
    maxWidth: '100%',
    overflow: 'auto',
  },
};

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isReady, isWaking, retryCount } = useBackendHealth();

  const healthColor = isReady ? 'success.main' : isWaking ? 'warning.main' : 'error.main';

  const navContent = (
    <List>
      {NAV_ITEMS.map((item) => (
        <ListItemButton
          key={item.path}
          selected={location.pathname === item.path}
          onClick={() => {
            navigate(item.path);
            if (isMobile) setDrawerOpen(false);
          }}
        >
          <ListItemIcon>{item.icon}</ListItemIcon>
          <ListItemText primary={item.label} />
        </ListItemButton>
      ))}
    </List>
  );

  return (
    <Box sx={layoutStyles.root}>
      <BackendWaking isWaking={isWaking} retryCount={retryCount} />

      <AppBar
        position="fixed"
        elevation={0}
        sx={layoutStyles.appBar}
      >
        <Toolbar>
          {isMobile && (
            <IconButton color="inherit" edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1 }}>
              <MenuIcon />
            </IconButton>
          )}

          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            {/* Logo mark */}
            <Box
              sx={layoutStyles.logoMark}
            >
              <Typography sx={{ color: '#fff', fontWeight: 800, fontSize: '0.8rem', lineHeight: 1 }}>
                VQ
              </Typography>
            </Box>
            <Typography
              variant="h6"
              fontWeight={800}
              sx={{ letterSpacing: '-0.03em' }}
            >
              VQA<Typography component="span" sx={{ color: 'primary.main', fontWeight: 800, fontSize: 'inherit' }}>Search</Typography>
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Health indicator */}
          <Tooltip title={isReady ? 'Backend online' : isWaking ? 'Backend waking...' : 'Backend offline'}>
            <CircleIcon sx={{ fontSize: 10, color: healthColor, mr: 1.5 }} />
          </Tooltip>

          <ThemeToggle />
        </Toolbar>
      </AppBar>

      {/* Side navigation — persistent on desktop, drawer on mobile */}
      {!isMobile && (
        <Box
          component="nav"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
          }}
        >
          <Drawer
            variant="permanent"
            open
            sx={{
              '& .MuiDrawer-paper': {
                width: DRAWER_WIDTH,
                boxSizing: 'border-box',
                bgcolor: 'background.default',
                border: 'none',
              },
            }}
          >
            <Toolbar /> {/* spacer for AppBar */}
            {navContent}
          </Drawer>
        </Box>
      )}

      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              bgcolor: 'background.default',
            },
          }}
        >
          <Toolbar /> {/* spacer */}
          {navContent}
        </Drawer>
      )}

      {/* Main content */}
      <Box
        component="main"
        sx={layoutStyles.mainContent}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
