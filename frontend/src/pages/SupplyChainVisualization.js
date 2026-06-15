import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Avatar,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Divider
} from '@mui/material';
import {
  Agriculture,
  Factory,
  LocalShipping,
  Warehouse,
  Store,
  Person,
  Verified
} from '@mui/icons-material';
import { useWeb3 } from '../context/Web3Context';

const SupplyChainVisualization = () => {
  const { getAllProducts, getAllStakeholders } = useWeb3();
  const [products, setProducts] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const productList = getAllProducts();
        const stakeholderList = getAllStakeholders();
        
        setProducts(productList);
        setStakeholders(stakeholderList);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllProducts, getAllStakeholders]);

  const roles = [
    { value: 0, label: 'Admin', color: 'error', icon: <Verified /> },
    { value: 1, label: 'Farmer', color: 'success', icon: <Agriculture /> },
    { value: 2, label: 'Processor', color: 'info', icon: <Factory /> },
    { value: 3, label: 'Distributor', color: 'warning', icon: <LocalShipping /> },
    { value: 4, label: 'Retailer', color: 'secondary', icon: <Store /> },
    { value: 5, label: 'Consumer', color: 'default', icon: <Person /> },
  ];

  const getStateText = (state) => {
    const states = ['Harvested', 'Processed', 'Shipped', 'Distributed', 'Retail', 'Sold'];
    return states[state] || 'Unknown';
  };

  const getStateColor = (state) => {
    const colors = ['success', 'info', 'warning', 'primary', 'secondary', 'default'];
    return colors[state] || 'default';
  };

  // Group products by current state
  const productsByState = products.reduce((acc, product) => {
    const state = product.currentState;
    if (!acc[state]) {
      acc[state] = [];
    }
    acc[state].push(product);
    return acc;
  }, {});

  // Group stakeholders by role
  const stakeholdersByRole = stakeholders.reduce((acc, stakeholder) => {
    const role = stakeholder.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(stakeholder);
    return acc;
  }, {});

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
        📊 Supply Chain Visualization
      </Typography>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Overview of products and stakeholders in the supply chain
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Agriculture sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="success.main">
                {products.length}
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
                {stakeholders.length}
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
                {products.filter(p => p.isOrganic).length}
              </Typography>
              <Typography color="text.secondary">
                Organic Products
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <LocalShipping sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" component="div" color="warning.main">
                {products.filter(p => p.currentState === 5).length}
              </Typography>
              <Typography color="text.secondary">
                Products Sold
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Supply Chain Flow */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            🔄 Supply Chain Flow
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            {roles.slice(1).map((role, index) => (
              <React.Fragment key={role.value}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${role.color}.main`, 
                      mx: 'auto', 
                      mb: 1,
                      width: 56,
                      height: 56
                    }}
                  >
                    {role.icon}
                  </Avatar>
                  <Typography variant="subtitle2">{role.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stakeholdersByRole[role.value]?.length || 0} stakeholders
                  </Typography>
                </Box>
                {index < roles.length - 2 && (
                  <Box sx={{ flexGrow: 1, height: 2, bgcolor: 'divider' }} />
                )}
              </React.Fragment>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Products by State */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📦 Products by State
          </Typography>
          
          <Grid container spacing={2}>
            {[0, 1, 2, 3, 4, 5].map((state) => {
              const role = roles.find(r => r.value === state + 1) || roles[0];
              const productsInState = productsByState[state] || [];
              
              return (
                <Grid item xs={12} md={4} key={state}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: `${getStateColor(state)}.main`, mr: 1 }}>
                        {role.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {getStateText(state)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {productsInState.length} products
                        </Typography>
                      </Box>
                    </Box>
                    
                    {productsInState.length > 0 ? (
                      <List dense>
                        {productsInState.slice(0, 3).map((product) => (
                          <React.Fragment key={product.id}>
                            <ListItem>
                              <ListItemText
                                primary={product.name}
                                secondary={
                                  <React.Fragment>
                                    <Typography variant="caption" display="block">
                                      Batch: {product.batchNumber}
                                    </Typography>
                                    <Chip 
                                      label={product.isOrganic ? "Organic" : "Conventional"} 
                                      size="small" 
                                      color={product.isOrganic ? "success" : "default"}
                                      variant="outlined"
                                    />
                                  </React.Fragment>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                        {productsInState.length > 3 && (
                          <ListItem>
                            <ListItemText 
                              primary={`+${productsInState.length - 3} more products`} 
                              sx={{ textAlign: 'center' }}
                            />
                          </ListItem>
                        )}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No products in this state
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>

      {/* Stakeholders by Role */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            👥 Stakeholders by Role
          </Typography>
          
          <Grid container spacing={2}>
            {roles.map((role) => {
              const stakeholdersInRole = stakeholdersByRole[role.value] || [];
              
              return (
                <Grid item xs={12} sm={6} md={4} key={role.value}>
                  <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: `${role.color}.main`, mr: 1 }}>
                        {role.icon}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1">
                          {role.label}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {stakeholdersInRole.length} stakeholders
                        </Typography>
                      </Box>
                    </Box>
                    
                    {stakeholdersInRole.length > 0 ? (
                      <List dense>
                        {stakeholdersInRole.slice(0, 3).map((stakeholder, index) => (
                          <React.Fragment key={index}>
                            <ListItem>
                              <ListItemText
                                primary={stakeholder.name}
                                secondary={
                                  <Typography variant="caption" display="block">
                                    {stakeholder.location}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            <Divider />
                          </React.Fragment>
                        ))}
                        {stakeholdersInRole.length > 3 && (
                          <ListItem>
                            <ListItemText 
                              primary={`+${stakeholdersInRole.length - 3} more stakeholders`} 
                              sx={{ textAlign: 'center' }}
                            />
                          </ListItem>
                        )}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        No stakeholders in this role
                      </Typography>
                    )}
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SupplyChainVisualization;