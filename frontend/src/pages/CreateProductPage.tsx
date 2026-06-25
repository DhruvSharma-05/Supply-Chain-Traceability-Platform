import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Switch,
  Alert,
  CircularProgress,
  Stack,
} from '@mui/material';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';
import { Link as RouterLink } from 'react-router-dom';
import { contractAddress, foodTraceabilityAbi } from '../contract';
import { Role } from '../lib/enums';

const EMPTY = {
  name: '',
  category: '',
  origin: '',
  expiry: '',
  batchNumber: '',
  certifications: '',
  isOrganic: false,
  price: '',
};

export default function CreateProductPage() {
  const { address, isConnected } = useAccount();
  const [form, setForm] = useState(EMPTY);

  const { data: stakeholder } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'getStakeholder',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });
  const isFarmer = !!stakeholder && stakeholder.isActive && stakeholder.role === Role.Farmer;

  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleCreate = () => {
    writeContract({
      address: contractAddress,
      abi: foodTraceabilityAbi,
      functionName: 'createFoodProduct',
      args: [
        form.name,
        form.category,
        form.origin,
        BigInt(Math.floor(new Date(form.expiry).getTime() / 1000)),
        form.batchNumber,
        form.certifications
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        form.isOrganic,
        parseEther(form.price || '0'),
      ],
    });
  };

  if (!isConnected) {
    return <Alert severity="info">Connect your wallet to create products.</Alert>;
  }

  if (!isFarmer) {
    return (
      <Alert severity="warning">
        Only registered <strong>Farmer</strong> accounts can create products. Ask an admin to
        register your address as a Farmer on the Stakeholders page.
      </Alert>
    );
  }

  const canSubmit = form.name && form.category && form.origin && form.expiry && form.price;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        ➕ Create Product
      </Typography>

      <Card sx={{ maxWidth: 640 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            <TextField
              label="Category"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <TextField
              label="Origin"
              value={form.origin}
              onChange={(e) => setForm({ ...form, origin: e.target.value })}
            />
            <TextField
              label="Expiry date"
              type="date"
              value={form.expiry}
              onChange={(e) => setForm({ ...form, expiry: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Batch number"
              value={form.batchNumber}
              onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
            />
            <TextField
              label="Certifications (comma-separated)"
              value={form.certifications}
              onChange={(e) => setForm({ ...form, certifications: e.target.value })}
              placeholder="USDA Organic, Non-GMO"
            />
            <TextField
              label="Price (ETH)"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="0.01"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.isOrganic}
                  onChange={(e) => setForm({ ...form, isOrganic: e.target.checked })}
                />
              }
              label="Organic"
            />
            <Button
              variant="contained"
              onClick={handleCreate}
              disabled={!canSubmit || isPending || isConfirming}
              startIcon={isPending || isConfirming ? <CircularProgress size={18} /> : null}
            >
              {isPending ? 'Confirm in wallet…' : isConfirming ? 'Creating…' : 'Create Product'}
            </Button>

            {isSuccess && (
              <Alert severity="success">
                Product created.{' '}
                <RouterLink to="/products">View products</RouterLink>
              </Alert>
            )}
            {writeError && <Alert severity="error">{writeError.message}</Alert>}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
