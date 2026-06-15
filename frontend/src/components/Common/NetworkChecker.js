import React from 'react';
import { Alert, Button, Box } from '@mui/material';
import { useWeb3 } from '../../context/Web3Context';

const NetworkChecker = () => {
  const { provider, isConnected } = useWeb3();
  const [wrongNetwork, setWrongNetwork] = React.useState(false);

  React.useEffect(() => {
    const checkNetwork = async () => {
      if (provider) {
        const network = await provider.getNetwork();
        setWrongNetwork(network.chainId.toString() !== '31337');
      }
    };
    
    checkNetwork();
  }, [provider]);

  const switchNetwork = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x7A69' }], // 31337 in hex
      });
    } catch (error) {
      console.error('Failed to switch network:', error);
    }
  };

  if (!isConnected || !wrongNetwork) {
    return null;
  }

  return (
    <Alert severity="error" sx={{ mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        Wrong Network! Please switch to Hardhat Local.
        <Button variant="outlined" size="small" onClick={switchNetwork}>
          Switch Network
        </Button>
      </Box>
    </Alert>
  );
};

export default NetworkChecker;
