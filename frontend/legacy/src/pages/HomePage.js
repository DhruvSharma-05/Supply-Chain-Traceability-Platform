import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const HomePage = () => {
  const { isConnected, account, contract, connectWallet } = useWeb3();
  const [stats, setStats] = useState({ totalProducts: 0, loading: true });

  useEffect(() => {
    const loadStats = async () => {
      if (contract) {
        try {
          const totalProducts = await contract.getTotalProducts();
          setStats({ totalProducts: totalProducts.toString(), loading: false });
        } catch (error) {
          console.error('Error loading stats:', error);
          setStats({ totalProducts: 0, loading: false });
        }
      } else {
        setStats({ totalProducts: 0, loading: false });
      }
    };

    loadStats();
  }, [contract]);

  return (
    <Box>
      {/* Hero Section */}
      <Box sx={{ mb: 4, textAlign: 'center' }}>
        <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          🍎 Food Traceability Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph>
          Blockchain-powered transparency for the entire food supply chain
        </Typography>
        
        {isConnected ? (
          <Card sx={{ mt: 3, backgroundColor: 'primary.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                ✅ Wallet Connected Successfully!
              </Typography>
              <Typography variant="body1">
                Connected as: {account?.slice(0, 6)}...{account?.slice(-4)}
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Card sx={{ mt: 3, backgroundColor: 'warning.main', color: 'white' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connect Your Wallet to Get Started
              </Typography>
              <Typography variant="body2" paragraph>
                You need to connect MetaMask to interact with the blockchain
              </Typography>
              <Button 
                variant="contained" 
                onClick={connectWallet}
                sx={{ backgroundColor: 'white', color: 'warning.main', '&:hover': { backgroundColor: '#f5f5f5' } }}
              >
                Connect Now
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Live Stats */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Live Platform Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                {stats.loading ? (
                  <CircularProgress size={40} />
                ) : (
                  <Typography variant="h4" color="primary.main">
                    {stats.totalProducts}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Products on Blockchain
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {isConnected ? '🟢 Online' : '🔴 Offline'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Blockchain Status
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default HomePage;
