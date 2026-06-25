import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Alert,
  Chip,
  Grid,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  QrCode,
  Search,
  LocalShipping,
  Factory,
  Store,
  Agriculture,
  AccessTime,
  Warehouse,
  ShoppingCart,
  CheckCircle
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const ProductTrackingPage = () => {
  const { getProduct, getProductHistory, error: contextError } = useWeb3();
  const [productId, setProductId] = useState('');
  const [productData, setProductData] = useState(null);
  const [productHistory, setProductHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const stateIcons = {
    0: <Agriculture color="success" />,     // Harvested
    1: <Factory color="info" />,           // Processed
    2: <LocalShipping color="warning" />,  // Shipped
    3: <Warehouse color="primary" />,      // Distributed
    4: <Store color="secondary" />,        // Retail
    5: <ShoppingCart color="success" />    // Sold
  };

  const stateNames = {
    0: 'Harvested',
    1: 'Processed',
    2: 'Shipped',
    3: 'Distributed',
    4: 'Retail',
    5: 'Sold'
  };

  const stateColors = {
    0: 'success',
    1: 'info',
    2: 'warning',
    3: 'primary',
    4: 'secondary',
    5: 'success'
  };

  const searchProduct = () => {
    if (!productId) return;
    
    setLoading(true);
    setError('');
    setProductData(null);
    setProductHistory([]);
    
    try {
      // Get product details
      const product = getProduct(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      setProductData(product);
      
      // Get product history
      const history = getProductHistory(productId);
      setProductHistory(history);
    } catch (err) {
      console.error('Error fetching product:', err);
      setError('Product not found or error occurred: ' + err.message);
      setProductData(null);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = () => {
    if (!productData) return;
    
    const qrData = JSON.stringify({
      productId: productId,
      name: productData.name,
      origin: productData.origin,
      blockchain: 'verified'
    });
    
    // Simple QR code URL
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
    
    // Open QR code in new window
    window.open(qrUrl, '_blank');
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🔍 Product Tracking
      </Typography>

      {contextError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {contextError}
        </Alert>
      )}

      {/* Search Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Search Product by ID
          </Typography>
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Product ID"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                placeholder="Enter product ID (e.g., 1, 2, 3)"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button
                variant="contained"
                onClick={searchProduct}
                disabled={loading || !productId}
                startIcon={loading ? <CircularProgress size={20} /> : <Search />}
                fullWidth
              >
                {loading ? 'Searching...' : 'Track Product'}
              </Button>
            </Grid>
          </Grid>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Product Details */}
      {productData && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Product Details
              </Typography>
              <Button
                variant="outlined"
                startIcon={<QrCode />}
                onClick={generateQRCode}
                size="small"
              >
                Generate QR Code
              </Button>
            </Box>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Product Name</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{productData.name}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Category</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{productData.category}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Origin</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{productData.origin}</Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Batch Number</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{productData.batchNumber}</Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Current Status</Typography>
                <Chip 
                  icon={stateIcons[productData.currentState]}
                  label={stateNames[productData.currentState]}
                  color={stateColors[productData.currentState]}
                  sx={{ mb: 2 }}
                />
                
                <Typography variant="subtitle2" color="text.secondary">Harvest Date</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {productData.harvestDate}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Expiry Date</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {productData.expiryDate}
                </Typography>
                
                <Typography variant="subtitle2" color="text.secondary">Price</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{productData.price} ETH</Typography>
                
                {productData.isOrganic && (
                  <Chip label="🌱 Certified Organic" color="success" variant="outlined" />
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Supply Chain History */}
      {productHistory.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 Supply Chain History
            </Typography>
            
            <List>
              {productHistory.map((event, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle color="success" />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1">
                            {stateNames[event.newState] || 'Unknown State'}
                          </Typography>
                          <Chip 
                            size="small" 
                            label="Completed"
                            variant="outlined"
                            color="success"
                          />
                        </Box>
                      }
                      secondary={
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {event.timestamp.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.location}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {event.notes}
                          </Typography>
                          <Typography variant="caption">
                            From: {event.from.substring(0, 6)}...{event.from.substring(event.from.length - 4)}
                          </Typography>
                          <br />
                          <Typography variant="caption">
                            To: {event.to.substring(0, 6)}...{event.to.substring(event.to.length - 4)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < productHistory.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </CardContent>
        </Card>
      )}

      {/* Supply Chain Journey */}
      {productData && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📋 Supply Chain Journey
            </Typography>
            
            <List>
              {[0, 1, 2, 3, 4, 5].map((state, index) => {
                const isCompleted = state <= productData.currentState;
                return (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemIcon>
                        {isCompleted ? stateIcons[state] : <AccessTime />}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <React.Fragment>
                            <Typography 
                              variant="subtitle1" 
                              color={isCompleted ? 'text.primary' : 'text.disabled'}
                              component="span"
                            >
                              {stateNames[state]}
                            </Typography>
                            {!isCompleted && (
                              <Chip 
                                size="small" 
                                label="Pending"
                                variant="outlined"
                                color="default"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </React.Fragment>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography 
                              variant="body2" 
                              color={isCompleted ? 'text.secondary' : 'text.disabled'}
                            >
                              {state === 0 && productData.harvestDate && `Harvested on ${productData.harvestDate}`}
                              {state === 1 && productData.currentState >= 1 && 'Processing completed'}
                              {state === 2 && productData.currentState >= 2 && 'Shipped to distributor'}
                              {state === 3 && productData.currentState >= 3 && 'Arrived at distribution center'}
                              {state === 4 && productData.currentState >= 4 && 'Available at retail store'}
                              {state === 5 && productData.currentState >= 5 && 'Purchased by consumer'}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < 5 && <Divider />}
                  </React.Fragment>
                );
              })}
            </List>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProductTrackingPage;