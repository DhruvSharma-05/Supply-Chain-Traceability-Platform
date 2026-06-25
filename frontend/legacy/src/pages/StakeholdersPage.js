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
  MenuItem,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { useWeb3 } from '../context/Web3Context';

const StakeholdersPage = () => {
  const { registerStakeholder, getAllStakeholders, isConnected, userRole, account, error: contextError } = useWeb3();
  
  const [formData, setFormData] = useState({
    address: '',
    role: '',
    name: '',
    location: ''
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const roles = [
    { value: 0, label: 'Admin', color: 'error' },
    { value: 1, label: 'Farmer', color: 'success' },
    { value: 2, label: 'Processor', color: 'info' },
    { value: 3, label: 'Distributor', color: 'warning' },
    { value: 4, label: 'Retailer', color: 'secondary' },
    { value: 5, label: 'Consumer', color: 'default' },
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setError('');
    setSuccess('');
    
    if (!isConnected) {
      setError('Please connect your wallet to manage stakeholders. MetaMask is required for transactions.');
      return;
    }

    if (userRole !== 0 && userRole !== '0') {
      setError('Only admins can register stakeholders');
      return;
    }

    if (!formData.address || !formData.name || formData.role === '' || !formData.location) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      console.log('Registering stakeholder:', formData);

      // Register stakeholder through context
      const newStakeholder = await registerStakeholder({
        address: formData.address,
        role: parseInt(formData.role),
        name: formData.name,
        location: formData.location,
        isActive: true
      });

      console.log('Stakeholder registered:', newStakeholder);

      const roleName = roles.find(r => r.value === parseInt(formData.role))?.label || 'Unknown';
      setSuccess(`${formData.name} registered as ${roleName} successfully!`);
      
      // Reset form
      setFormData({ address: '', role: '', name: '', location: '' });

    } catch (error) {
      console.error('Error registering stakeholder:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Quick register accounts for demo
  const quickRegisterAccounts = [
    { address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8', role: 1, name: 'Green Valley Farm', location: 'California, USA' },
    { address: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC', role: 2, name: 'Fresh Food Processing Co', location: 'New York, USA' },
    { address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906', role: 3, name: 'National Distribution Ltd', location: 'Texas, USA' },
    { address: '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65', role: 4, name: 'City Supermarket Chain', location: 'Florida, USA' },
    { address: '0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc', role: 5, name: 'John Doe Consumer', location: 'Washington, USA' },
  ];

  const handleQuickRegister = async (stakeholder) => {
    if (!isConnected) {
      setError('Please connect your wallet to manage stakeholders. MetaMask is required for transactions.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      console.log('Registering:', stakeholder.name);
      
      // Register stakeholder through context
      const newStakeholder = await registerStakeholder({
        address: stakeholder.address,
        role: stakeholder.role,
        name: stakeholder.name,
        location: stakeholder.location,
        isActive: true
      });
      
      console.log('Stakeholder registered:', newStakeholder);
      
      const roleName = roles.find(r => r.value === stakeholder.role)?.label;
      setSuccess(`✅ ${stakeholder.name} registered as ${roleName}!`);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError(`❌ Failed to register ${stakeholder.name}. ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Get all stakeholders
  const stakeholders = getAllStakeholders();

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        👥 Stakeholders
      </Typography>

      {contextError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {contextError}
        </Alert>
      )}

      {/* Stakeholders List */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Registered Stakeholders ({stakeholders.length})
          </Typography>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Name</strong></TableCell>
                  <TableCell><strong>Role</strong></TableCell>
                  <TableCell><strong>Location</strong></TableCell>
                  <TableCell><strong>Address</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stakeholders.map((stakeholder, index) => {
                  const role = roles.find(r => r.value === stakeholder.role);
                  return (
                    <TableRow key={index}>
                      <TableCell>{stakeholder.name}</TableCell>
                      <TableCell>
                        <Chip 
                          label={role?.label || 'Unknown'} 
                          color={role?.color || 'default'} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell>{stakeholder.location}</TableCell>
                      <TableCell>
                        <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                          {stakeholder.address.substring(0, 6)}...{stakeholder.address.substring(stakeholder.address.length - 4)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={stakeholder.isActive ? 'Active' : 'Inactive'} 
                          color={stakeholder.isActive ? 'success' : 'default'} 
                          size="small" 
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Admin Registration Form */}
      {isConnected && userRole === 0 || userRole === '0' ? (
        <>
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Register New Stakeholder
              </Typography>
              
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Wallet Address"
                      value={formData.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="0x..."
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      select
                      label="Role"
                      value={formData.role}
                      onChange={(e) => handleInputChange('role', e.target.value)}
                      required
                    >
                      {roles.slice(1).map((role) => (
                        <MenuItem key={role.value} value={role.value}>
                          {role.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Name/Company"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      placeholder="e.g., Green Valley Farm"
                      required
                    />
                  </Grid>
                  
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={(e) => handleInputChange('location', e.target.value)}
                      placeholder="e.g., California, USA"
                      required
                    />
                  </Grid>

                  <Grid item xs={12}>
                    {error && <Alert severity="error" sx={{ mb: 2, whiteSpace: 'pre-line' }}>{error}</Alert>}
                    {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                    
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : null}
                    >
                      {loading ? 'Registering...' : 'Register Stakeholder'}
                    </Button>
                  </Grid>
                </Grid>
              </form>
            </CardContent>
          </Card>

          {/* Quick Demo Registration */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                🚀 Quick Demo Setup
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Register sample stakeholders for demonstration:
              </Typography>
              
              <Grid container spacing={2}>
                {quickRegisterAccounts.map((stakeholder, index) => {
                  const role = roles.find(r => r.value === stakeholder.role);
                  return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="subtitle2" gutterBottom>
                            {stakeholder.name}
                          </Typography>
                          <Chip 
                            label={role?.label} 
                            color={role?.color} 
                            size="small" 
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="caption" display="block">
                            {stakeholder.location}
                          </Typography>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleQuickRegister(stakeholder)}
                            disabled={loading}
                            sx={{ mt: 1 }}
                          >
                            Register
                          </Button>
                        </CardContent>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </CardContent>
          </Card>
        </>
      ) : isConnected ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          Only admins can register new stakeholders. You are currently registered as: {roles.find(r => r.value === parseInt(userRole))?.label || 'Unknown'}
        </Alert>
      ) : null}

      {/* Current User Info */}
      {isConnected && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Account Information
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Wallet Address:
                </Typography>
                <Typography variant="body1" sx={{ fontFamily: 'monospace' }}>
                  {account}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="body2" color="text.secondary">
                  Current Role:
                </Typography>
                <Chip 
                  label={roles.find(r => r.value === parseInt(userRole))?.label || 'Not Registered'} 
                  color={roles.find(r => r.value === parseInt(userRole))?.color || 'default'}
                  size="small"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StakeholdersPage;