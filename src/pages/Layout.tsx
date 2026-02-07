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
  Menu,
  MenuItem,
  Avatar,
  Divider,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import SearchIcon from '@mui/icons-material/Search';
import CollectionsIcon from '@mui/icons-material/Collections';
import CircleIcon from '@mui/icons-material/Circle';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';
import type { SxProps, Theme } from '@mui/material';
import { ThemeToggle, BackendWaking } from '@/components/common';
import { useBackendHealth } from '@/hooks';
import { useAuth } from '@/contexts/AuthContext';
import { revokeAllImageUrls } from '@/utils/imageUrl';

const NAV_ITEMS = [
  { label: 'Home', path: '/dashboard', icon: <HomeIcon /> },
  { label: 'Upload', path: '/upload', icon: <CloudUploadIcon /> },
  { label: 'Search', path: '/search', icon: <SearchIcon /> },
  { label: 'Gallery', path: '/gallery', icon: <CollectionsIcon /> },
];

const DRAWER_WIDTH = 240;

const layoutStyles: Record<string, SxProps<Theme>> = {
  root: { display: 'flex', minHeight: '100vh' },
  appBar: {
    zIndex: (t: Theme) => t.zIndex.drawer + 1,
    bgcolor: 'background.paper',
    borderBottom: 1,
    borderColor: 'divider',
  },
  logoMark: {
    width: 28,
    height: 28,
    borderRadius: '2px',
    border: 2,
    borderColor: 'text.primary',
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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isReady, isWaking, retryCount } = useBackendHealth();
  const { user, logout } = useAuth();

  const healthColor = isReady ? 'success.main' : isWaking ? 'warning.main' : 'error.main';

  const handleLogout = () => {
    setAnchorEl(null);
    revokeAllImageUrls();
    logout();
    navigate('/', { replace: true });
  };

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
              <Box sx={{ width: 6, height: 6, bgcolor: 'primary.main', borderRadius: '1px' }} />
            </Box>
            <Typography
              variant="h6"
              fontWeight={700}
              sx={{ letterSpacing: '0.04em', textTransform: 'uppercase', fontSize: '0.88rem' }}
            >
              AskFrame
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }} />

          {/* Health indicator */}
          <Tooltip title={isReady ? 'Backend online' : isWaking ? 'Backend waking...' : 'Backend offline'}>
            <CircleIcon sx={{ fontSize: 10, color: healthColor, mr: 1.5 }} />
          </Tooltip>

          <ThemeToggle />

          {/* User menu */}
          {user && (
            <>
              <Tooltip title={user.email}>
                <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ ml: 0.5 }}>
                  <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem', bgcolor: 'primary.main' }}>
                    {(user.email?.[0] ?? 'U').toUpperCase()}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem disabled>
                  <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                  <ListItemText
                    primary={user.email}
                    secondary={user.is_admin ? 'Admin' : undefined}
                  />
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText primary="Sign out" />
                </MenuItem>
              </Menu>
            </>
          )}
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
                bgcolor: 'background.paper',
                borderRight: 1,
                borderColor: 'divider',
                borderLeft: 'none',
                borderTop: 'none',
                borderBottom: 'none',
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
