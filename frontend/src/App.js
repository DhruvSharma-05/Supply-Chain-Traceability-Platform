import React from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { Web3Provider } from './context/Web3Context';
import Layout from './components/Layout/Layout';
import DashboardPage from './pages/DashboardPage';
import StakeholdersPage from './pages/StakeholdersPage';
import ProductsPage from './pages/ProductsPage';
import CreateProductPage from './pages/CreateProductPage';
import ProductTrackingPage from './pages/ProductTrackingPage';
import AdminPage from './pages/AdminPage';
import SupplyChainVisualization from './pages/SupplyChainVisualization';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import Marketplace from './pages/Marketplace';
import AdminSupplyChainSimulator from './pages/AdminSupplyChainSimulator';

// Create Material-UI theme
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2E7D32', // Green theme for food/agriculture
    },
    secondary: {
      main: '#FF6F00', // Orange for accent
    },
    background: {
      default: '#F8F9FA',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '12px',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  const [currentPage, setCurrentPage] = React.useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'stakeholders':
        return <StakeholdersPage />;
      case 'products':
        return <ProductsPage />;
      case 'create-product':
        return <CreateProductPage />;
      case 'tracking':
        return <ProductTrackingPage />;
      case 'admin':
        return <AdminPage />;
      case 'visualization':
        return <SupplyChainVisualization />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'marketplace':
        return <Marketplace />;
      case 'supply-chain-simulator':
        return <AdminSupplyChainSimulator />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Web3Provider>
        <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
          {renderCurrentPage()}
        </Layout>
      </Web3Provider>
    </ThemeProvider>
  );
}

export default App;