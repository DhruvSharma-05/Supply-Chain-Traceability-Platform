import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  Agriculture,
  LocalShipping,
  Person,
  Verified,
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const DashboardPage = () => {
  const { getTotalProducts, stakeholderInfo, isConnected } = useWeb3();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalStakeholders: 6, // Predefined stakeholders
  });

  useEffect(() => {
    const fetchStats = () => {
      try {
        const totalProducts = getTotalProducts();
        setStats(prev => ({
          ...prev,
          totalProducts: Number(totalProducts)
        }));
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, [getTotalProducts]);

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', mt: 8 }}>
        <Typography variant="h4" gutterBottom>
          Welcome to Food Traceability Platform
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4 }}>
          Connect your wallet to access the platform
        </Typography>
        <LinearProgress sx={{ maxWidth: 400, mx: 'auto' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        📊 Dashboard
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Welcome back, {stakeholderInfo?.name || 'User'}!
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Agriculture sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main">
                {stats.totalProducts}
              </Typography>
              <Typography color="text.secondary">
                Total Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Person sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="primary.main">
                {stats.totalStakeholders}
              </Typography>
              <Typography color="text.secondary">
                Stakeholders
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Verified sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="info.main">
                100%
              </Typography>
              <Typography color="text.secondary">
                Verified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="warning.main">
                24/7
              </Typography>
              <Typography color="text.secondary">
                Tracking
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Current User Info */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Account Information
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Role:
              </Typography>
              <Chip 
                label={stakeholderInfo?.name || 'User'} 
                color="primary"
                icon={<Verified />}
                sx={{ mb: 2 }}
              />
              
              <Typography variant="subtitle2" color="text.secondary">
                Account Type:
              </Typography>
              <Typography variant="body1">
                {stakeholderInfo?.description || 'Blockchain User'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Platform Features:
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip label="🔍 Product Tracking" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="📦 Product Management" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="🌐 Verified Data" size="small" sx={{ mr: 1, mb: 1 }} />
                <Chip label="📊 Real-time Data" size="small" sx={{ mr: 1, mb: 1 }} />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🚀 Quick Actions
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Agriculture sx={{ fontSize: 30, mb: 1, color: 'success.main' }} />
                  <Typography variant="body2">
                    Create Product
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <LocalShipping sx={{ fontSize: 30, mb: 1, color: 'warning.main' }} />
                  <Typography variant="body2">
                    Track Products
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Person sx={{ fontSize: 30, mb: 1, color: 'primary.main' }} />
                  <Typography variant="body2">
                    Manage Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Card variant="outlined" sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}>
                <CardContent sx={{ textAlign: 'center', py: 3 }}>
                  <Verified sx={{ fontSize: 30, mb: 1, color: 'info.main' }} />
                  <Typography variant="body2">
                    View Reports
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default DashboardPage;