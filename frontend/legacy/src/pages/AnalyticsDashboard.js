import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  LinearProgress,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import {
  Agriculture,
  Factory,
  LocalShipping,
  Store,
  Person,
  Verified,
  TrendingUp,
  BarChart,
  PieChart,
  Download
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  BarChart as RechartsBarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { useWeb3 } from '../context/Web3Context';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const AnalyticsDashboard = () => {
  const { getAllProducts, getAllStakeholders, getSalesData, getQualityData } = useWeb3();
  const [products, setProducts] = useState([]);
  const [stakeholders, setStakeholders] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [qualityData, setQualityData] = useState([]);
  const [timeRange, setTimeRange] = useState('year');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const productList = getAllProducts();
        const stakeholderList = getAllStakeholders();
        const salesDataList = getSalesData();
        const qualityDataList = getQualityData();
        
        setProducts(productList);
        setStakeholders(stakeholderList);
        setSalesData(salesDataList);
        setQualityData(qualityDataList);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllProducts, getAllStakeholders, getSalesData, getQualityData]);

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

  const roles = [
    { value: 0, label: 'Admin', color: 'error', icon: <Verified /> },
    { value: 1, label: 'Farmer', color: 'success', icon: <Agriculture /> },
    { value: 2, label: 'Processor', color: 'info', icon: <Factory /> },
    { value: 3, label: 'Distributor', color: 'warning', icon: <LocalShipping /> },
    { value: 4, label: 'Retailer', color: 'secondary', icon: <Store /> },
    { value: 5, label: 'Consumer', color: 'default', icon: <Person /> },
  ];

  // Export dashboard as PDF
  const exportAsPDF = async () => {
    const dashboardElement = document.getElementById('analytics-dashboard');
    if (!dashboardElement) return;

    try {
      const canvas = await html2canvas(dashboardElement);
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('supply-chain-analytics.pdf');
    } catch (error) {
      console.error('Error exporting PDF:', error);
    }
  };

  // Export data as CSV
  const exportAsCSV = () => {
    // Create CSV content
    let csvContent = 'Product Name,Category,Origin,Current State,Price,Quality Score\n';
    
    products.forEach(product => {
      csvContent += `"${product.name}","${product.category}","${product.origin}","${getStateText(product.currentState)}","${product.price}","${product.qualityScore}"\n`;
    });
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'supply-chain-products.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

  return (
    <Box id="analytics-dashboard">
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
          📊 Analytics Dashboard
        </Typography>
        <Box>
          <FormControl sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel>Time Range</InputLabel>
            <Select
              value={timeRange}
              label="Time Range"
              onChange={(e) => setTimeRange(e.target.value)}
            >
              <MenuItem value="week">This Week</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportAsPDF}
            sx={{ mr: 1 }}
          >
            Export PDF
          </Button>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={exportAsCSV}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      <Typography variant="h6" color="text.secondary" gutterBottom>
        Comprehensive analytics and insights for your supply chain
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
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

      {/* Charts Section */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Sales Trend Chart */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChart sx={{ mr: 1 }} />
                <Typography variant="h6">Sales Trend</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }} 
                    name="Sales (ETH)"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="products" 
                    stroke="#82ca9d" 
                    name="Products Sold"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Quality Score Chart */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChart sx={{ mr: 1 }} />
                <Typography variant="h6">Quality by Category</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={qualityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="score"
                    nameKey="category"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {qualityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, 'Quality Score']} />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Products by State */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BarChart sx={{ mr: 1 }} />
                <Typography variant="h6">Products by State</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsBarChart data={Object.keys(productsByState).map(state => ({
                  name: getStateText(state),
                  count: productsByState[state].length
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of Products" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>

        {/* Stakeholders by Role */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PieChart sx={{ mr: 1 }} />
                <Typography variant="h6">Stakeholders by Role</Typography>
              </Box>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={Object.keys(stakeholdersByRole).map(role => ({
                      name: roles.find(r => r.value === parseInt(role))?.label || 'Unknown',
                      value: stakeholdersByRole[role].length
                    }))}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label
                  >
                    {Object.keys(stakeholdersByRole).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </RechartsPieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Detailed Stats */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📦 Products by State
              </Typography>
              
              <Grid container spacing={2}>
                {[0, 1, 2, 3, 4, 5].map((state) => {
                  const productsInState = productsByState[state] || [];
                  
                  return (
                    <Grid item xs={12} key={state}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          label={getStateText(state)} 
                          color={getStateColor(state)} 
                          size="small" 
                          sx={{ mr: 2 }}
                        />
                        <Typography variant="body2">
                          {productsInState.length} products
                        </Typography>
                      </Box>
                      {productsInState.slice(0, 3).map((product) => (
                        <Box key={product.id} sx={{ ml: 4, mb: 1 }}>
                          <Typography variant="body2">
                            {product.name} - {product.batchNumber}
                          </Typography>
                        </Box>
                      ))}
                      {productsInState.length > 3 && (
                        <Box sx={{ ml: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            +{productsInState.length - 3} more
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                👥 Stakeholders by Role
              </Typography>
              
              <Grid container spacing={2}>
                {roles.map((role) => {
                  const stakeholdersInRole = stakeholdersByRole[role.value] || [];
                  
                  return (
                    <Grid item xs={12} key={role.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Chip 
                          icon={role.icon} 
                          label={role.label} 
                          color={role.color} 
                          size="small" 
                          sx={{ mr: 2 }}
                        />
                        <Typography variant="body2">
                          {stakeholdersInRole.length} stakeholders
                        </Typography>
                      </Box>
                      {stakeholdersInRole.slice(0, 3).map((stakeholder, index) => (
                        <Box key={index} sx={{ ml: 4, mb: 1 }}>
                          <Typography variant="body2">
                            {stakeholder.name} - {stakeholder.location}
                          </Typography>
                        </Box>
                      ))}
                      {stakeholdersInRole.length > 3 && (
                        <Box sx={{ ml: 4 }}>
                          <Typography variant="caption" color="text.secondary">
                            +{stakeholdersInRole.length - 3} more
                          </Typography>
                        </Box>
                      )}
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AnalyticsDashboard;