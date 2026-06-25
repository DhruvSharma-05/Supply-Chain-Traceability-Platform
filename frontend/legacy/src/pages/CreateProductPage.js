import React, { useState } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Chip
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const CreateProductPage = () => {
  const { createProduct, isConnected, userRole, error: contextError } = useWeb3();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    origin: '',
    harvestDate: '',
    expiryDate: '',
    batchNumber: '',
    isOrganic: false,
    price: ''
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setSuccess('');
    
    if (!isConnected) {
      setError('Please connect your wallet to create products. MetaMask is required for transactions.');
      return;
    }

    // Check if user is a farmer (role 1)
    if (userRole !== 1 && userRole !== '1') {
      setError('Only farmers can create products');
      return;
    }

    if (!formData.name || !formData.category || !formData.origin || !formData.expiryDate || !formData.batchNumber || !formData.price) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Prepare product data
      const productData = {
        name: formData.name,
        category: formData.category,
        origin: formData.origin,
        harvestDate: formData.harvestDate,
        expiryDate: formData.expiryDate,
        currentState: 0, // Harvested
        batchNumber: formData.batchNumber,
        isOrganic: formData.isOrganic,
        price: formData.price
      };

      console.log('Creating product with data:', productData);

      // Create product through context
      const newProduct = await createProduct(productData);
      
      setSuccess(`Product "${formData.name}" created successfully! Product ID: ${newProduct.id}`);
      
      // Reset form
      setFormData({
        name: '',
        category: '',
        origin: '',
        harvestDate: '',
        expiryDate: '',
        batchNumber: '',
        isOrganic: false,
        price: ''
      });

    } catch (error) {
      console.error('Error creating product:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🌱 Create New Food Product
      </Typography>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Product Information
          </Typography>
          
          {contextError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {contextError}
            </Alert>
          )}
          
          {!isConnected && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Note: You need to connect your wallet to create products. 
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => window.location.hash = '#/'} 
                sx={{ ml: 2 }}
              >
                Connect Wallet
              </Button>
            </Alert>
          )}
          
          <form onSubmit={handleSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., Organic Apples"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="e.g., Fruit, Vegetable"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Origin Location"
                  value={formData.origin}
                  onChange={(e) => handleInputChange('origin', e.target.value)}
                  placeholder="e.g., Green Valley Farm, CA"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Batch Number"
                  value={formData.batchNumber}
                  onChange={(e) => handleInputChange('batchNumber', e.target.value)}
                  placeholder="e.g., BATCH-2023-001"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Harvest Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.harvestDate}
                  onChange={(e) => handleInputChange('harvestDate', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expiry Date"
                  InputLabelProps={{ shrink: true }}
                  value={formData.expiryDate}
                  onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price (ETH)"
                  type="number"
                  value={formData.price}
                  onChange={(e) => handleInputChange('price', e.target.value)}
                  placeholder="e.g., 0.01"
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={formData.isOrganic ? "🌱 Organic" : "Conventional"}
                    color={formData.isOrganic ? "success" : "default"}
                    onClick={() => handleInputChange('isOrganic', !formData.isOrganic)}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Click to toggle organic certification
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
                {success && (
                  <Alert severity="success" sx={{ mb: 2 }}>
                    {success}
                  </Alert>
                )}
                
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || (!isConnected && formData.name)}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {loading ? 'Creating Product...' : 'Create Product'}
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CreateProductPage;