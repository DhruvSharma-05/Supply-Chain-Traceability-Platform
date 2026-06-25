import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  CircularProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const ProductsPage = () => {
  const { getAllProducts, getTotalProducts, error: contextError } = useWeb3();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadProducts = () => {
      try {
        console.log('Loading products from JSON storage...');
        
        // Get all products from context
        const productList = getAllProducts();
        console.log('Products loaded:', productList);
        
        // Get total number of products
        const total = getTotalProducts();
        console.log('Total products:', total);
        
        setProducts(productList);
        setTotalProducts(total);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products: ' + error.message);
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
    
    // Auto-refresh every 10 seconds
    const interval = setInterval(loadProducts, 10000);
    return () => clearInterval(interval);
  }, [getAllProducts, getTotalProducts]);

  const getStateText = (state) => {
    const states = ['Harvested', 'Processed', 'Shipped', 'Distributed', 'Retail', 'Sold'];
    return states[state] || 'Unknown';
  };

  const getStateColor = (state) => {
    const colors = ['success', 'info', 'warning', 'primary', 'secondary', 'default'];
    return colors[state] || 'default';
  };

  // Refresh products function
  const refreshProducts = () => {
    setLoading(true);
    setError('');
    
    try {
      console.log('Refreshing products from JSON storage...');
      
      // Get all products from context
      const productList = getAllProducts();
      console.log('Products refreshed:', productList);
      
      // Get total number of products
      const total = getTotalProducts();
      console.log('Total products:', total);
      
      setProducts(productList);
      setTotalProducts(total);
    } catch (error) {
      console.error('Error loading products:', error);
      setError('Failed to load products: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
          🍎 Food Products
        </Typography>
        <Button 
          variant="outlined" 
          onClick={refreshProducts}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Refreshing...' : 'Refresh Products'}
        </Button>
      </Box>

      {contextError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {contextError}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main">
                {totalProducts}
              </Typography>
              <Typography color="text.secondary">
                Total Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {products.filter(p => p.isOrganic).length}
              </Typography>
              <Typography color="text.secondary">
                Organic Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {products.filter(p => p.currentState === 5).length}
              </Typography>
              <Typography color="text.secondary">
                Products Sold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Typography variant="h6" gutterBottom>
              No Products Found
            </Typography>
            <Typography color="text.secondary" paragraph>
              No food products have been registered yet.
            </Typography>
            <Button variant="contained" color="primary" onClick={refreshProducts}>
              Refresh List
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Food Products ({products.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Product Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Origin</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Organic</strong></TableCell>
                    <TableCell><strong>Batch</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.id}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.origin}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStateText(product.currentState)} 
                          color={getStateColor(product.currentState)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {product.isOrganic ? (
                          <Chip label="🌱 Organic" color="success" size="small" />
                        ) : (
                          <Chip label="Conventional" color="default" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">
                          {product.batchNumber}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default ProductsPage;