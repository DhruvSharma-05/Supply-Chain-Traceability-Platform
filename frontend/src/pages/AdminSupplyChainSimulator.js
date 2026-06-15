import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Paper
} from '@mui/material';
import {
  PlayArrow,
  Replay,
  CheckCircle
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const AdminSupplyChainSimulator = () => {
  const { 
    getAllProducts, 
    isConnected, 
    userRole, 
    simulateFullSupplyChain, 
    resetProductToHarvested,
    getStakeholdersByRole
  } = useWeb3();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [farmers, setFarmers] = useState([]);
  const [processors, setProcessors] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [consumers, setConsumers] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const productList = getAllProducts();
        const farmerList = getStakeholdersByRole(1);
        const processorList = getStakeholdersByRole(2);
        const distributorList = getStakeholdersByRole(3);
        const retailerList = getStakeholdersByRole(4);
        const consumerList = getStakeholdersByRole(5);
        
        // Filter products that are in harvested state (0) for simulation
        const harvestableProducts = productList.filter(p => p.currentState === 0);
        
        setProducts(harvestableProducts);
        setFarmers(farmerList);
        setProcessors(processorList);
        setDistributors(distributorList);
        setRetailers(retailerList);
        setConsumers(consumerList);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load supply chain data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllProducts, getStakeholdersByRole]);

  const getStateText = (state) => {
    const states = ['Harvested', 'Processed', 'Shipped', 'Distributed', 'Retail', 'Sold'];
    return states[state] || 'Unknown';
  };

  const getStateColor = (state) => {
    const colors = ['success', 'info', 'warning', 'primary', 'secondary', 'default'];
    return colors[state] || 'default';
  };

  const handleSimulateClick = (product) => {
    setSelectedProduct(product);
    setDialogOpen(true);
  };

  const handleSimulateSubmit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to simulate supply chain');
      return;
    }

    if (userRole !== 0) {
      setError('Only admins can simulate the full supply chain');
      return;
    }

    setSimulationLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate the full supply chain
      await simulateFullSupplyChain(selectedProduct.id);
      
      setSuccess('Full supply chain simulation completed successfully!');
      
      // Refresh product list
      const productList = getAllProducts();
      const harvestableProducts = productList.filter(p => p.currentState === 0);
      setProducts(harvestableProducts);
      
      // Close dialog after delay
      setTimeout(() => {
        setDialogOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error simulating supply chain:', err);
      setError('Failed to simulate supply chain: ' + err.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  const handleResetClick = async (product) => {
    if (!isConnected) {
      setError('Please connect your wallet to reset product');
      return;
    }

    if (userRole !== 0) {
      setError('Only admins can reset products');
      return;
    }

    setResetLoading(true);
    setError('');
    setSuccess('');

    try {
      // Reset product to harvested state
      await resetProductToHarvested(product.id);
      
      setSuccess('Product reset to harvested state successfully!');
      
      // Refresh product list
      const productList = getAllProducts();
      const harvestableProducts = productList.filter(p => p.currentState === 0);
      setProducts(harvestableProducts);
    } catch (err) {
      console.error('Error resetting product:', err);
      setError('Failed to reset product: ' + err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const steps = [
    {
      label: 'Harvested',
      description: 'Product harvested by farmer',
      icon: <CheckCircle color="success" />
    },
    {
      label: 'Processed',
      description: 'Product processed by food processor',
      icon: <CheckCircle color="info" />
    },
    {
      label: 'Shipped',
      description: 'Product shipped by distributor',
      icon: <CheckCircle color="warning" />
    },
    {
      label: 'Distributed',
      description: 'Product distributed to retailer',
      icon: <CheckCircle color="primary" />
    },
    {
      label: 'Retail',
      description: 'Product available for sale at retailer',
      icon: <CheckCircle color="secondary" />
    },
    {
      label: 'Sold',
      description: 'Product purchased by consumer',
      icon: <CheckCircle color="success" />
    }
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🔄 Admin Supply Chain Simulator
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Simulate the complete supply chain process from farmer to consumer
      </Typography>

      {!isConnected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please connect your wallet as an admin to use the supply chain simulator
        </Alert>
      )}

      {userRole !== 0 && isConnected && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Only admins can simulate the full supply chain. You are currently connected as a {getStateText(userRole)}.
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      {/* Harvested Products */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🌱 Harvested Products (Ready for Simulation)
          </Typography>
          
          {products.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No harvested products available for simulation
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
                  <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {product.name}
                      </Typography>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Category: {product.category}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Origin: {product.origin}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Batch: {product.batchNumber}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Chip 
                          label={getStateText(product.currentState)} 
                          color={getStateColor(product.currentState)} 
                          size="small" 
                          sx={{ mr: 1 }}
                        />
                        {product.isOrganic && (
                          <Chip 
                            label="Organic" 
                            color="success" 
                            size="small" 
                          />
                        )}
                      </Box>
                      
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" color="primary.main">
                          {product.price} ETH
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Quality Score: {product.qualityScore}/100
                        </Typography>
                      </Box>
                      
                      <Box sx={{ mt: 'auto' }}>
                        <Button
                          variant="contained"
                          startIcon={<PlayArrow />}
                          onClick={() => handleSimulateClick(product)}
                          fullWidth
                          disabled={!isConnected || userRole !== 0 || simulationLoading}
                          sx={{ mb: 1 }}
                        >
                          Simulate Full Supply Chain
                        </Button>
                        
                        <Button
                          variant="outlined"
                          startIcon={<Replay />}
                          onClick={() => handleResetClick(product)}
                          fullWidth
                          disabled={!isConnected || userRole !== 0 || resetLoading}
                        >
                          Reset to Harvested
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Supply Chain Visualization */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Supply Chain Process Visualization
          </Typography>
          
          <Stepper orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label} active={true}>
                <StepLabel icon={step.icon}>
                  <Typography variant="subtitle1">{step.label}</Typography>
                </StepLabel>
                <StepContent>
                  <Typography>{step.description}</Typography>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </CardContent>
      </Card>

      {/* Stakeholders */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🌾 Farmers
              </Typography>
              
              {farmers.length === 0 ? (
                <Typography color="text.secondary">
                  No farmers registered
                </Typography>
              ) : (
                farmers.map((farmer, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      {farmer.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {farmer.location}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏭 Processors
              </Typography>
              
              {processors.length === 0 ? (
                <Typography color="text.secondary">
                  No processors registered
                </Typography>
              ) : (
                processors.map((processor, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">
                      {processor.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {processor.location}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚚 Distributors & Retailers
              </Typography>
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Distributors:
              </Typography>
              {distributors.length === 0 ? (
                <Typography color="text.secondary">
                  No distributors registered
                </Typography>
              ) : (
                distributors.map((distributor, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {distributor.name}
                    </Typography>
                  </Box>
                ))
              )}
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Retailers:
              </Typography>
              {retailers.length === 0 ? (
                <Typography color="text.secondary">
                  No retailers registered
                </Typography>
              ) : (
                retailers.map((retailer, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {retailer.name}
                    </Typography>
                  </Box>
                ))
              )}
              
              <Typography variant="subtitle2" sx={{ mt: 2 }}>
                Consumers:
              </Typography>
              {consumers.length === 0 ? (
                <Typography color="text.secondary">
                  No consumers registered
                </Typography>
              ) : (
                consumers.map((consumer, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {consumer.name}
                    </Typography>
                  </Box>
                ))
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Simulation Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <PlayArrow sx={{ mr: 1 }} />
            Simulate Full Supply Chain
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedProduct && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedProduct.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {selectedProduct.category} - {selectedProduct.batchNumber}
              </Typography>
              
              <Paper sx={{ p: 2, mt: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Supply Chain Simulation Steps:
                </Typography>
                <Stepper orientation="vertical" nonLinear>
                  {steps.map((step, index) => (
                    <Step key={step.label} completed={index < 6}>
                      <StepLabel icon={step.icon}>
                        {step.label}
                      </StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Paper>
              
              <Alert severity="info" sx={{ mt: 2 }}>
                This will simulate the complete journey of the product through all supply chain stages:
                Farmer → Processor → Distributor → Retailer → Consumer
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleSimulateSubmit}
            variant="contained"
            disabled={simulationLoading}
            startIcon={simulationLoading ? <LinearProgress size={20} /> : <PlayArrow />}
          >
            {simulationLoading ? 'Simulating...' : 'Start Simulation'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSupplyChainSimulator;