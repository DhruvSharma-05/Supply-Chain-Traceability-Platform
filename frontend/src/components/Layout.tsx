import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="static"
        sx={{ bgcolor: 'background.paper', color: 'text.primary', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            🌾 Food Traceability Platform
          </Typography>
          <ConnectButton />
        </Toolbar>
      </AppBar>
      <Box component="main" sx={{ p: 3 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
