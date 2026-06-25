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
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const AdminPage = () => {
  const { addProductToJSON, addStakeholderToJSON } = useWeb3();
  
  // Product form state
  const [productFormData, setProductFormData] = useState({
    name: '',
    category: '',
    origin: '',
    harvestDate: '',
    expiryDate: '',
    farmer: '',
    currentState: 0,
    batchNumber: '',
    isOrganic: false,
    price: ''
  });
  
  // Stakeholder form state
  const [stakeholderFormData, setStakeholderFormData] = useState({
    address: '',
    role: '',
    name: '',
    location: '',
    isActive: true
  });
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleProductInputChange = (field, value) => {
    setProductFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStakeholderInputChange = (field, value) => {
    setStakeholderFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    if (!productFormData.name || !productFormData.category || !productFormData.origin || 
        !productFormData.harvestDate || !productFormData.expiryDate || !productFormData.batchNumber || 
        !productFormData.price) {
      setError('Please fill in all product fields');
      return;
    }

    try {
      const newProduct = addProductToJSON({
        ...productFormData,
        isOrganic: productFormData.isOrganic === true || productFormData.isOrganic === 'true'
      });
      
      setSuccess(`Product "${newProduct.name}" added successfully! Product ID: ${newProduct.id}`);
      
      // Reset form
      setProductFormData({
        name: '',
        category: '',
        origin: '',
        harvestDate: '',
        expiryDate: '',
        farmer: '',
        currentState: 0,
        batchNumber: '',
        isOrganic: false,
        price: ''
      });
    } catch (err) {
      setError(`Error adding product: ${err.message}`);
    }
  };

  const handleAddStakeholder = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setError('');
    setSuccess('');
    
    if (!stakeholderFormData.address || !stakeholderFormData.name || 
        stakeholderFormData.role === '' || !stakeholderFormData.location) {
      setError('Please fill in all stakeholder fields');
      return;
    }

    try {
      const newStakeholder = addStakeholderToJSON(stakeholderFormData);
      
      setSuccess(`Stakeholder "${newStakeholder.name}" added successfully!`);
      
      // Reset form
      setStakeholderFormData({
        address: '',
        role: '',
        name: '',
        location: '',
        isActive: true
      });
    } catch (err) {
      setError(`Error adding stakeholder: ${err.message}`);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🔧 Admin Panel
      </Typography>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Add data to JSON storage without MetaMask
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {/* Add Product Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Product
          </Typography>
          
          <form onSubmit={handleAddProduct}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name"
                  value={productFormData.name}
                  onChange={(e) => handleProductInputChange('name', e.target.value)}
                  placeholder="e.g., Organic Apples"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Category"
                  value={productFormData.category}
                  onChange={(e) => handleProductInputChange('category', e.target.value)}
                  placeholder="e.g., Fruit, Vegetable"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Origin Location"
                  value={productFormData.origin}
                  onChange={(e) => handleProductInputChange('origin', e.target.value)}
                  placeholder="e.g., Green Valley Farm, CA"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Farmer"
                  value={productFormData.farmer}
                  onChange={(e) => handleProductInputChange('farmer', e.target.value)}
                  placeholder="e.g., Green Valley Farm"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Batch Number"
                  value={productFormData.batchNumber}
                  onChange={(e) => handleProductInputChange('batchNumber', e.target.value)}
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
                  value={productFormData.harvestDate}
                  onChange={(e) => handleProductInputChange('harvestDate', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Expiry Date"
                  InputLabelProps={{ shrink: true }}
                  value={productFormData.expiryDate}
                  onChange={(e) => handleProductInputChange('expiryDate', e.target.value)}
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Price (ETH)"
                  type="number"
                  value={productFormData.price}
                  onChange={(e) => handleProductInputChange('price', e.target.value)}
                  placeholder="e.g., 0.01"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Current State</InputLabel>
                  <Select
                    value={productFormData.currentState}
                    label="Current State"
                    onChange={(e) => handleProductInputChange('currentState', e.target.value)}
                  >
                    <MenuItem value={0}>Harvested</MenuItem>
                    <MenuItem value={1}>Processed</MenuItem>
                    <MenuItem value={2}>Shipped</MenuItem>
                    <MenuItem value={3}>Distributed</MenuItem>
                    <MenuItem value={4}>Retail</MenuItem>
                    <MenuItem value={5}>Sold</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Chip 
                    label={productFormData.isOrganic ? "🌱 Organic" : "Conventional"}
                    color={productFormData.isOrganic ? "success" : "default"}
                    onClick={() => handleProductInputChange('isOrganic', !productFormData.isOrganic)}
                    sx={{ cursor: 'pointer' }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    Click to toggle organic certification
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                >
                  Add Product
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>

      {/* Add Stakeholder Section */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Stakeholder
          </Typography>
          
          <form onSubmit={handleAddStakeholder}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Wallet Address"
                  value={stakeholderFormData.address}
                  onChange={(e) => handleStakeholderInputChange('address', e.target.value)}
                  placeholder="0x..."
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <Select
                    value={stakeholderFormData.role}
                    label="Role"
                    onChange={(e) => handleStakeholderInputChange('role', e.target.value)}
                    required
                  >
                    <MenuItem value={0}>Admin</MenuItem>
                    <MenuItem value={1}>Farmer</MenuItem>
                    <MenuItem value={2}>Processor</MenuItem>
                    <MenuItem value={3}>Distributor</MenuItem>
                    <MenuItem value={4}>Retailer</MenuItem>
                    <MenuItem value={5}>Consumer</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Name/Company"
                  value={stakeholderFormData.name}
                  onChange={(e) => handleStakeholderInputChange('name', e.target.value)}
                  placeholder="e.g., Green Valley Farm"
                  required
                />
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Location"
                  value={stakeholderFormData.location}
                  onChange={(e) => handleStakeholderInputChange('location', e.target.value)}
                  placeholder="e.g., California, USA"
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                >
                  Add Stakeholder
                </Button>
              </Grid>
            </Grid>
          </form>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AdminPage;