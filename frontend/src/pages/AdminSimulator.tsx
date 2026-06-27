import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Stack,
  Alert,
  CircularProgress,
} from '@mui/material';
import { useAccount, useReadContract, usePublicClient, useWriteContract } from 'wagmi';
import { contractAddress, foodTraceabilityAbi } from '../contract';
import { State, stateLabels, stateColors } from '../lib/enums';
import type { Product } from '../types/contract';

export default function AdminSimulator() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [searchId, setSearchId] = useState('');
  const [productId, setProductId] = useState<bigint | null>(null);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'owner',
  });
  const isOwner = !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  const { data: product, refetch } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'getProduct',
    args: productId !== null ? [productId] : undefined,
    query: { enabled: productId !== null },
  }) as { data: Product | undefined; refetch: () => void };

  const load = () => {
    const n = Number(searchId);
    setProductId(n > 0 ? BigInt(n) : null);
    setLog([]);
  };

  const runSimulation = async () => {
    if (!product || !publicClient) return;
    setRunning(true);
    setLog([]);
    try {
      for (let s = product.currentState + 1; s <= State.Sold; s++) {
        setLog((prev) => [...prev, `Advancing to ${stateLabels[s]}… (confirm in wallet)`]);
        const hash = await writeContractAsync({
          address: contractAddress,
          abi: foodTraceabilityAbi,
          functionName: 'updateProductState',
          args: [product.id, s, 'Simulated step', 'Simulator'],
        });
        await publicClient.waitForTransactionReceipt({ hash });
        setLog((prev) => [...prev, `✓ ${stateLabels[s]} confirmed`]);
      }
      setLog((prev) => [...prev, 'Simulation complete — product is Sold.']);
      refetch();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setLog((prev) => [...prev, `Error: ${msg}`]);
    } finally {
      setRunning(false);
    }
  };

  if (!isOwner) {
    return (
      <Alert severity="warning">
        The supply-chain simulator is restricted to the contract owner (admin).
      </Alert>
    );
  }

  const isSold = product?.currentState === State.Sold;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🔄 Supply Chain Simulator
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Advance a product through every remaining stage to Sold. Each step is a real transaction
        and requires a wallet confirmation.
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Product ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          size="small"
        />
        <Button variant="outlined" onClick={load}>
          Load
        </Button>
      </Box>

      {product && (
        <Card sx={{ maxWidth: 560 }}>
          <CardContent>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">
                  {product.name} #{product.id.toString()}
                </Typography>
                <Chip
                  label={stateLabels[product.currentState]}
                  color={stateColors[product.currentState]}
                />
              </Box>

              {isSold ? (
                <Alert severity="info">This product has already completed the supply chain.</Alert>
              ) : (
                <Button
                  variant="contained"
                  onClick={runSimulation}
                  disabled={running}
                  startIcon={running ? <CircularProgress size={18} /> : null}
                >
                  {running ? 'Simulating…' : 'Run full supply chain'}
                </Button>
              )}

              {log.length > 0 && (
                <Box sx={{ bgcolor: 'grey.100', borderRadius: 1, p: 2 }}>
                  {log.map((line, i) => (
                    <Typography key={i} variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {line}
                    </Typography>
                  ))}
                </Box>
              )}
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
