import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import {
  Menu as MenuIcon,
  AccountBalanceWallet,
  Dashboard,
  People,
  Inventory,
  Add,
  Search,
  Close,
  AdminPanelSettings,
  Analytics,
  BarChart,
  Storefront,
  Sync
} from '@mui/icons-material';
import { useWeb3 } from '../../context/Web3Context';

const Layout = ({ children, currentPage, onPageChange }) => {
  const { 
    account, 
    isConnected, 
    disconnectWallet, 
    stakeholderInfo, 
    demoAccounts,
    connectToAccount
  } = useWeb3();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [accountSelectOpen, setAccountSelectOpen] = React.useState(false);
  const [selectedAccount, setSelectedAccount] = React.useState('');

  // Menu items with icons
  const menuItems = [
    { 
      label: '📊 Dashboard', 
      value: 'dashboard', 
      roles: [0, 1, 2, 3, 4, 5],
      icon: <Dashboard />
    },
    { 
      label: '👥 Stakeholders', 
      value: 'stakeholders', 
      roles: [0, 1, 2, 3, 4, 5],
      icon: <People />
    },
    { 
      label: '📦 Products', 
      value: 'products', 
      roles: [0, 1, 2, 3, 4, 5],
      icon: <Inventory />
    },
    { 
      label: '➕ Create Product', 
      value: 'create-product', 
      roles: [1],
      icon: <Add />
    },
    { 
      label: '🔍 Product Tracking', 
      value: 'tracking', 
      roles: [0, 1, 2, 3, 4, 5],
      icon: <Search />
    },
    { 
      label: '📊 Supply Chain Visualization', 
      value: 'visualization', 
      roles: [0, 1, 2, 3, 4, 5],
      icon: <Analytics />
    },
    { 
      label: '📈 Analytics Dashboard', 
      value: 'analytics', 
      roles: [0, 1, 2, 3, 4, 5],
      icon: <BarChart />
    },
    { 
      label: '🛒 Marketplace', 
      value: 'marketplace', 
      roles: [3, 4], // Distributors and Retailers
      icon: <Storefront />
    },
    { 
      label: '🔄 Supply Chain Simulator', 
      value: 'supply-chain-simulator', 
      roles: [0], // Admins only
      icon: <Sync />
    },
    { 
      label: '🔧 Admin Panel', 
      value: 'admin', 
      roles: [0],
      icon: <AdminPanelSettings />
    },
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuClick = (page) => {
    onPageChange(page);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const handleConnectClick = () => {
    // Show account selection dialog
    setAccountSelectOpen(true);
  };

  const handleAccountSelect = async () => {
    if (selectedAccount) {
      await connectToAccount(selectedAccount);
      setAccountSelectOpen(false);
      setSelectedAccount('');
    }
  };

  // Filter menu items based on user role
  const filteredMenuItems = isConnected 
    ? menuItems.filter(item => 
        item.roles.includes(stakeholderInfo?.role) || 
        item.roles.includes(0) // Always show items available to admins
      )
    : menuItems.filter(item => item.value === 'products' || item.value === 'tracking' || item.value === 'visualization' || item.value === 'analytics'); // Allow public access

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          🌾 Food Trace
        </Typography>
        <Typography variant="caption">
          Blockchain Supply Chain
        </Typography>
      </Box>
      
      <Divider />

      {isConnected && (
        <>
          <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Typography variant="subtitle2" color="text.secondary">
              Connected as:
            </Typography>
            <Chip 
              label={stakeholderInfo?.name || 'User'} 
              color="primary" 
              size="small"
              sx={{ mt: 0.5 }}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1, wordBreak: 'break-all' }}>
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
            </Typography>
          </Box>
          <Divider />
        </>
      )}

      <List>
        {filteredMenuItems.map((item) => (
          <ListItem key={item.value} disablePadding>
            <ListItemButton
              selected={currentPage === item.value}
              onClick={() => handleMenuClick(item.value)}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: 'primary.lighter',
                  borderRight: 3,
                  borderColor: 'primary.main',
                }
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: '0.95rem',
                  fontWeight: currentPage === item.value ? 600 : 400
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {!isConnected && (
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" paragraph>
            Connect your wallet to access features
          </Typography>
          <Button 
            variant="outlined" 
            onClick={handleConnectClick}
            startIcon={<AccountBalanceWallet />}
            size="small"
            fullWidth
          >
            Connect Wallet
          </Button>
        </Box>
      )}
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Account Selection Dialog */}
      <Dialog open={accountSelectOpen} onClose={() => setAccountSelectOpen(false)}>
        <DialogTitle>Select Account</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mb: 2 }}>
            Choose an account to connect with. This is for demonstration purposes only.
          </Alert>
          <FormControl fullWidth>
            <InputLabel>Select Account</InputLabel>
            <Select
              value={selectedAccount}
              label="Select Account"
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              {demoAccounts.map((acc) => (
                <MenuItem key={acc.address} value={acc.address}>
                  {acc.name} ({acc.description})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAccountSelectOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleAccountSelect} 
            variant="contained"
            disabled={!selectedAccount}
          >
            Connect
          </Button>
        </DialogActions>
      </Dialog>

      {/* App Bar */}
      <AppBar 
        position="fixed" 
        sx={{ 
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          color: 'text.primary',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            🌾 Food Traceability Platform
          </Typography>

          {/* Wallet Connection */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {isConnected ? (
              <>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="body2" color="text.secondary">
                    {stakeholderInfo?.name || 'User'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : ''}
                  </Typography>
                </Box>
                <Button
                  variant="outlined"
                  onClick={disconnectWallet}
                  size="small"
                  color="error"
                >
                  Disconnect
                </Button>
              </>
            ) : (
              <Button
                variant="contained"
                startIcon={<AccountBalanceWallet />}
                onClick={handleConnectClick}
                size="small"
              >
                Connect Wallet
              </Button>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Side Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: 250 }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 250 },
          }}
        >
          <IconButton
            onClick={handleDrawerToggle}
            sx={{ alignSelf: 'flex-end', m: 1 }}
          >
            <Close />
          </IconButton>
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: 250,
              borderRight: '1px solid',
              borderColor: 'divider'
            },
          }}
          open
        >
          <Toolbar /> {/* Spacer for AppBar */}
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 250px)` },
          bgcolor: 'background.default',
          minHeight: '100vh'
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;