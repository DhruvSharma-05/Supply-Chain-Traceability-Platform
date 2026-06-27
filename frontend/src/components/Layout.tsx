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
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory,
  People,
  Add,
  Search,
  Storefront,
  Sync,
} from '@mui/icons-material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import type { ReactNode } from 'react';

const DRAWER_WIDTH = 240;

type NavItem = { label: string; path: string; icon: ReactNode };

// Nav entries are added here as their pages are wired up.
const navItems: NavItem[] = [
  { label: 'Dashboard', path: '/', icon: <DashboardIcon /> },
  { label: 'Products', path: '/products', icon: <Inventory /> },
  { label: 'Stakeholders', path: '/stakeholders', icon: <People /> },
  { label: 'Create Product', path: '/create', icon: <Add /> },
  { label: 'Product Tracking', path: '/tracking', icon: <Search /> },
  { label: 'Marketplace', path: '/marketplace', icon: <Storefront /> },
  { label: 'Simulator', path: '/simulator', icon: <Sync /> },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            🌾 Food Traceability Platform
          </Typography>
          <ConnectButton />
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List>
          {navItems.map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                selected={location.pathname === item.path}
                onClick={() => navigate(item.path)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3, bgcolor: 'background.default', minHeight: '100vh' }}>
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
