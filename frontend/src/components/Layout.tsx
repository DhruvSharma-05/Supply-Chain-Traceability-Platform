import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory,
  People,
  Add,
  Search,
  Storefront,
  Sync,
  BarChart,
  Menu as MenuIcon,
} from '@mui/icons-material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const DRAWER_WIDTH = 240;

type NavItem = { label: string; path: string; icon: ReactNode };

const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Products', path: '/products', icon: <Inventory /> },
  { label: 'Stakeholders', path: '/stakeholders', icon: <People /> },
  { label: 'Create Product', path: '/create', icon: <Add /> },
  { label: 'Product Tracking', path: '/tracking', icon: <Search /> },
  { label: 'Marketplace', path: '/marketplace', icon: <Storefront /> },
  { label: 'Simulator', path: '/simulator', icon: <Sync /> },
  { label: 'Analytics', path: '/analytics', icon: <BarChart /> },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (path: string) => {
    navigate(path);
    setMobileOpen(false);
  };

  const drawerContent = (
    <>
      <Toolbar />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => go(item.path)}
              sx={{
                borderRadius: 2,
                mx: 1,
                my: 0.25,
                '&.Mui-selected': {
                  backgroundColor: 'rgba(34,197,94,0.12)',
                  '&:hover': { backgroundColor: 'rgba(34,197,94,0.18)' },
                  '& .MuiListItemIcon-root': { color: 'primary.main' },
                  '& .MuiListItemText-primary': { color: 'primary.main', fontWeight: 600 },
                },
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              edge="start"
              onClick={() => setMobileOpen((o) => !o)}
              sx={{ display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Box component="span" sx={{ fontSize: '1.4rem', lineHeight: 1 }}>
              🌾
            </Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                background: 'linear-gradient(135deg, #22C55E, #2DD4BF)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Food Traceability Platform
            </Typography>
          </Box>
          <ConnectButton />
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          >
            {drawerContent}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
            open
          >
            {drawerContent}
          </Drawer>
        )}
      </Box>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
