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
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar
} from '@mui/material';
import {
  ShoppingCart,
  Store,
  LocalShipping,
  AccountBalanceWallet,
  CheckCircle
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const Marketplace = () => {
  const { 
    getAllProducts, 
    getStakeholdersByRole, 
    updateProductState, 
    isConnected, 
    userRole, 
    stakeholderInfo,
    account
  } = useWeb3();
  
  const [products, setProducts] = useState([]);
  const [retailers, setRetailers] = useState([]);
  const [distributors, setDistributors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [transactionLoading, setTransactionLoading] = useState(false);
  const [purchaseData, setPurchaseData] = useState({
    productId: '',
    retailer: '',
    quantity: 1
  });

  useEffect(() => {
    const loadData = () => {
      try {
        const productList = getAllProducts();
        const retailerList = getStakeholdersByRole(4); // Retailers
        const distributorList = getStakeholdersByRole(3); // Distributors
        
        // Filter products that are ready for sale (in distributed or retail state)
        const saleableProducts = productList.filter(p => p.currentState >= 3);
        
        setProducts(saleableProducts);
        setRetailers(retailerList);
        setDistributors(distributorList);
      } catch (error) {
        console.error('Error loading data:', error);
        setError('Failed to load marketplace data');
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

  const handlePurchaseClick = (product) => {
    setSelectedProduct(product);
    setPurchaseData({
      productId: product.id,
      retailer: userRole === 4 ? account : '', // Pre-select current retailer
      quantity: 1
    });
    setDialogOpen(true);
  };

  const handlePurchaseSubmit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to make purchases');
      return;
    }

    if (!purchaseData.retailer) {
      setError('Please select a retailer');
      return;
    }

    setTransactionLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update product state to "Sold" and assign to retailer
      await updateProductState(
        purchaseData.productId, 
        5, // Sold state
        purchaseData.retailer, 
        `Purchased by retailer`
      );
      
      setSuccess('Product purchased successfully!');
      
      // Refresh product list
      const productList = getAllProducts();
      const saleableProducts = productList.filter(p => p.currentState >= 3);
      setProducts(saleableProducts);
      
      // Close dialog after delay
      setTimeout(() => {
        setDialogOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error purchasing product:', err);
      setError('Failed to purchase product: ' + err.message);
    } finally {
      setTransactionLoading(false);
    }
  };

  const handleTransferClick = (product) => {
    setSelectedProduct(product);
    setPurchaseData({
      productId: product.id,
      retailer: '',
      quantity: 1
    });
    setDialogOpen(true);
  };

  const handleTransferSubmit = async () => {
    if (!isConnected) {
      setError('Please connect your wallet to transfer products');
      return;
    }

    if (!purchaseData.retailer) {
      setError('Please select a retailer');
      return;
    }

    setTransactionLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update product state to "Retail" and assign to retailer
      await updateProductState(
        purchaseData.productId, 
        4, // Retail state
        purchaseData.retailer, 
        `Transferred to retailer`
      );
      
      setSuccess('Product transferred successfully!');
      
      // Refresh product list
      const productList = getAllProducts();
      const saleableProducts = productList.filter(p => p.currentState >= 3);
      setProducts(saleableProducts);
      
      // Close dialog after delay
      setTimeout(() => {
        setDialogOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error transferring product:', err);
      setError('Failed to transfer product: ' + err.message);
    } finally {
      setTransactionLoading(false);
    }
  };

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
        🛒 Marketplace
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Buy and sell products between stakeholders in the supply chain
      </Typography>

      {!isConnected && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Please connect your wallet to participate in the marketplace
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

      {/* Available Products */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📦 Available Products for Sale
          </Typography>
          
          {products.length === 0 ? (
            <Typography color="text.secondary" align="center" sx={{ py: 4 }}>
              No products available for sale at the moment
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
                        {userRole === 4 ? ( // Retailer
                          product.currentState === 4 ? (
                            <Button
                              variant="contained"
                              startIcon={<ShoppingCart />}
                              onClick={() => handlePurchaseClick(product)}
                              fullWidth
                              disabled={!isConnected}
                            >
                              Purchase
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              startIcon={<CheckCircle />}
                              disabled
                              fullWidth
                            >
                              Already Sold
                            </Button>
                          )
                        ) : userRole === 3 ? ( // Distributor
                          product.currentState === 3 ? (
                            <Button
                              variant="contained"
                              startIcon={<LocalShipping />}
                              onClick={() => handleTransferClick(product)}
                              fullWidth
                              disabled={!isConnected}
                            >
                              Transfer to Retailer
                            </Button>
                          ) : (
                            <Button
                              variant="outlined"
                              startIcon={<CheckCircle />}
                              disabled
                              fullWidth
                            >
                              Already in Retail
                            </Button>
                          )
                        ) : (
                          <Button
                            variant="outlined"
                            startIcon={<Store />}
                            disabled
                            fullWidth
                          >
                            Connect as Retailer/Distributor
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </CardContent>
      </Card>

      {/* Stakeholders */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🏪 Retailers
              </Typography>
              
              {retailers.length === 0 ? (
                <Typography color="text.secondary">
                  No retailers registered
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {retailers.map((retailer, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
                          <Store />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {retailer.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {retailer.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚚 Distributors
              </Typography>
              
              {distributors.length === 0 ? (
                <Typography color="text.secondary">
                  No distributors registered
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {distributors.map((distributor, index) => (
                    <Grid item xs={12} sm={6} key={index}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                          <LocalShipping />
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {distributor.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {distributor.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  ))}
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Purchase/Transfer Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedProduct && (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <ShoppingCart sx={{ mr: 1 }} />
              {userRole === 4 ? 'Purchase Product' : 'Transfer Product'}
            </Box>
          )}
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
              <Typography variant="h6" color="primary.main" gutterBottom>
                {selectedProduct.price} ETH
              </Typography>
              
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Retailer</InputLabel>
                <Select
                  value={purchaseData.retailer}
                  label="Select Retailer"
                  onChange={(e) => setPurchaseData({...purchaseData, retailer: e.target.value})}
                >
                  {retailers.map((retailer, index) => (
                    <MenuItem key={index} value={retailer.address}>
                      {retailer.name} ({retailer.location})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={purchaseData.quantity}
                onChange={(e) => setPurchaseData({...purchaseData, quantity: e.target.value})}
                sx={{ mt: 2 }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={userRole === 4 ? handlePurchaseSubmit : handleTransferSubmit}
            variant="contained"
            disabled={transactionLoading || !purchaseData.retailer}
            startIcon={transactionLoading ? <LinearProgress size={20} /> : null}
          >
            {transactionLoading ? 'Processing...' : (userRole === 4 ? 'Purchase' : 'Transfer')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Marketplace;