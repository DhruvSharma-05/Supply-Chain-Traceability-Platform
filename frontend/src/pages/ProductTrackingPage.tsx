import { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Grid,
  Stack,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { contractAddress, foodTraceabilityAbi } from '../contract';
import { State, stateLabels, stateColors } from '../lib/enums';
import { formatPrice, formatTimestamp, shortenAddress } from '../lib/format';
import type { Product, ProductTransaction } from '../types/contract';

export default function ProductTrackingPage() {
  const { address } = useAccount();
  const [searchId, setSearchId] = useState('');
  const [productId, setProductId] = useState<bigint | null>(null);

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'owner',
  });

  const { data: product, refetch: refetchProduct, isError } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'getProduct',
    args: productId !== null ? [productId] : undefined,
    query: { enabled: productId !== null },
  }) as { data: Product | undefined; refetch: () => void; isError: boolean };

  const { data: history, refetch: refetchHistory } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'getProductHistory',
    args: productId !== null ? [productId] : undefined,
    query: { enabled: productId !== null },
  }) as { data: readonly ProductTransaction[] | undefined; refetch: () => void };

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      refetchProduct();
      refetchHistory();
    }
  }, [isSuccess, refetchProduct, refetchHistory]);

  // Write-action form state
  const [notes, setNotes] = useState('');
  const [location, setLocation] = useState('');
  const [recipient, setRecipient] = useState('');

  const isSold = product?.currentState === State.Sold;
  const nextState = product ? product.currentState + 1 : 0;
  const authorized =
    !!address &&
    !!product &&
    ([product.farmer, product.processor, product.distributor, product.retailer].some(
      (a) => a.toLowerCase() === address.toLowerCase(),
    ) ||
      (!!owner && address.toLowerCase() === owner.toLowerCase()));

  const handleSearch = () => {
    const n = Number(searchId);
    setProductId(n > 0 ? BigInt(n) : null);
  };

  const handleAdvance = () => {
    if (!product) return;
    writeContract({
      address: contractAddress,
      abi: foodTraceabilityAbi,
      functionName: 'updateProductState',
      args: [product.id, nextState, notes, location],
    });
  };

  const handleTransfer = () => {
    if (!product) return;
    writeContract({
      address: contractAddress,
      abi: foodTraceabilityAbi,
      functionName: 'transferProduct',
      args: [product.id, recipient as `0x${string}`, nextState, notes],
    });
  };

  const busy = isPending || isConfirming;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🔍 Product Tracking
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <TextField
          label="Product ID"
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
        />
        <Button variant="contained" onClick={handleSearch}>
          Track
        </Button>
      </Box>

      {productId !== null && isError && (
        <Alert severity="error">No product found with ID {productId.toString()}.</Alert>
      )}

      {product && (
        <Stack spacing={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h5">
                  {product.name} <Typography component="span" color="text.secondary">#{product.id.toString()}</Typography>
                </Typography>
                <Chip label={stateLabels[product.currentState]} color={stateColors[product.currentState]} />
              </Box>
              <Grid container spacing={2}>
                <Detail label="Category" value={product.category} />
                <Detail label="Origin" value={product.origin} />
                <Detail label="Batch" value={product.batchNumber} />
                <Detail label="Price" value={formatPrice(product.price)} />
                <Detail label="Harvested" value={formatTimestamp(product.harvestDate)} />
                <Detail label="Expires" value={formatTimestamp(product.expiryDate)} />
                <Detail label="Organic" value={product.isOrganic ? 'Yes' : 'No'} />
                <Detail label="Certifications" value={product.certifications.join(', ') || '—'} />
                <Detail label="Farmer" value={shortenAddress(product.farmer)} />
                <Detail label="Processor" value={shortenAddress(product.processor)} />
                <Detail label="Distributor" value={shortenAddress(product.distributor)} />
                <Detail label="Retailer" value={shortenAddress(product.retailer)} />
              </Grid>
            </CardContent>
          </Card>

          {authorized && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Actions
                </Typography>
                {isSold ? (
                  <Alert severity="info">This product is Sold — the lifecycle is complete.</Alert>
                ) : (
                  <Stack spacing={2}>
                    <Typography variant="body2" color="text.secondary">
                      Next stage: <strong>{stateLabels[nextState]}</strong>
                    </Typography>
                    <TextField label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} size="small" />
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="Location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        size="small"
                      />
                      <Button variant="outlined" onClick={handleAdvance} disabled={busy}>
                        Advance to {stateLabels[nextState]}
                      </Button>
                    </Box>
                    <Divider>or transfer ownership</Divider>
                    <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                      <TextField
                        label="Recipient address"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        size="small"
                        sx={{ minWidth: 380 }}
                      />
                      <Button variant="contained" onClick={handleTransfer} disabled={busy || !recipient}>
                        Transfer
                      </Button>
                    </Box>
                    {busy && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CircularProgress size={18} />
                        <Typography variant="body2">
                          {isPending ? 'Confirm in wallet…' : 'Waiting for confirmation…'}
                        </Typography>
                      </Box>
                    )}
                    {isSuccess && <Alert severity="success">Transaction confirmed.</Alert>}
                    {writeError && <Alert severity="error">{writeError.message}</Alert>}
                  </Stack>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                History
              </Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Date</strong></TableCell>
                      <TableCell><strong>State</strong></TableCell>
                      <TableCell><strong>From</strong></TableCell>
                      <TableCell><strong>To</strong></TableCell>
                      <TableCell><strong>Location</strong></TableCell>
                      <TableCell><strong>Notes</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {(history ?? []).map((t, i) => (
                      <TableRow key={i}>
                        <TableCell>{formatTimestamp(t.timestamp)}</TableCell>
                        <TableCell>
                          <Chip label={stateLabels[t.newState]} color={stateColors[t.newState]} size="small" />
                        </TableCell>
                        <TableCell>{shortenAddress(t.from)}</TableCell>
                        <TableCell>{shortenAddress(t.to)}</TableCell>
                        <TableCell>{t.location}</TableCell>
                        <TableCell>{t.notes}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Stack>
      )}
    </Box>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <Grid size={{ xs: 6, sm: 4, md: 3 }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Grid>
  );
}
