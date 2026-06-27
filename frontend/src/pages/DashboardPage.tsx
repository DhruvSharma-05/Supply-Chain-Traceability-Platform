import { Box, Card, CardContent, Typography, Alert } from '@mui/material';
import { useAccount, useReadContract } from 'wagmi';
import { contractAddress, foodTraceabilityAbi } from '../contract';

export default function DashboardPage() {
  const { isConnected } = useAccount();
  const { data, isLoading, isError } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'getTotalProducts',
  });

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>

      {!isConnected && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Connect your wallet to read on-chain data.
        </Alert>
      )}

      <Card sx={{ maxWidth: 320 }}>
        <CardContent>
          <Typography color="text.secondary" gutterBottom>
            Total Products (on-chain)
          </Typography>
          {isError ? (
            <Alert severity="error">
              Failed to read the contract. Is it deployed at {contractAddress}?
            </Alert>
          ) : (
            <Typography variant="h3">{isLoading ? '…' : String(data ?? 0)}</Typography>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
