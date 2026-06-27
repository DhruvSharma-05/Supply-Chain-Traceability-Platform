import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Stack,
  Alert,
  CircularProgress,
  TextField,
  Button,
  Divider,
} from '@mui/material';
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractAddress, foodTraceabilityAbi } from '../contract';
import { State, stateLabels, stateColors } from '../lib/enums';
import { formatPrice, shortenAddress } from '../lib/format';
import type { Product } from '../types/contract';

export default function Marketplace() {
  const { address } = useAccount();

  const { data: total } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'getTotalProducts',
  });
  const count = total ? Number(total) : 0;

  const { data: results, refetch } = useReadContracts({
    contracts: Array.from({ length: count }, (_, i) => ({
      address: contractAddress,
      abi: foodTraceabilityAbi,
      functionName: 'getProduct',
      args: [BigInt(i + 1)],
    })),
    query: { enabled: count > 0 },
  });

  const products: Product[] = (results ?? [])
    .filter((r) => r.status === 'success')
    .map((r) => r.result as unknown as Product);

  const [recipients, setRecipients] = useState<Record<string, string>>({});
  const { writeContract, data: hash, isPending, error: writeError, variables } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) refetch();
  }, [isSuccess, refetch]);

  const ownsProduct = (p: Product) =>
    !!address &&
    [p.farmer, p.processor, p.distributor, p.retailer].some(
      (a) => a.toLowerCase() === address.toLowerCase(),
    );

  const handleTransfer = (p: Product) => {
    const to = recipients[p.id.toString()];
    if (!to) return;
    writeContract({
      address: contractAddress,
      abi: foodTraceabilityAbi,
      functionName: 'transferProduct',
      args: [p.id, to as `0x${string}`, p.currentState + 1, 'Marketplace transfer'],
    });
  };

  const busy = isPending || isConfirming;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🛒 Marketplace
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Browse the on-chain catalog. Products you currently own can be transferred onward to a
        registered buyer.
      </Typography>

      {isSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Transfer confirmed.
        </Alert>
      )}
      {writeError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {writeError.message}
        </Alert>
      )}

      {count === 0 ? (
        <Alert severity="info">No products listed yet.</Alert>
      ) : (
        <Grid container spacing={3}>
          {products.map((p) => {
            const sold = p.currentState === State.Sold;
            const canTransfer = ownsProduct(p) && !sold;
            const pendingThis = busy && variables?.args?.[0] === p.id;
            return (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={p.id.toString()}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="h6">{p.name}</Typography>
                      <Chip label={stateLabels[p.currentState]} color={stateColors[p.currentState]} size="small" />
                    </Box>
                    <Typography color="text.secondary" variant="body2">
                      {p.category} · {p.origin}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {formatPrice(p.price)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Farmer: {shortenAddress(p.farmer)}
                    </Typography>

                    {canTransfer && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <Stack spacing={1}>
                          <TextField
                            label="Transfer to (address)"
                            size="small"
                            value={recipients[p.id.toString()] ?? ''}
                            onChange={(e) =>
                              setRecipients({ ...recipients, [p.id.toString()]: e.target.value })
                            }
                          />
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleTransfer(p)}
                            disabled={busy || !recipients[p.id.toString()]}
                            startIcon={pendingThis ? <CircularProgress size={16} /> : null}
                          >
                            Transfer ({stateLabels[p.currentState + 1]})
                          </Button>
                        </Stack>
                      </>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Box>
  );
}
