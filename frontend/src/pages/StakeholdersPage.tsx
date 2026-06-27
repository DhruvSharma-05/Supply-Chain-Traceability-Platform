import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  TextField,
  Button,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  usePublicClient,
} from 'wagmi';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { contractAddress, foodTraceabilityAbi } from '../contract';
import { Role, roleLabels } from '../lib/enums';
import { shortenAddress } from '../lib/format';
import type { Stakeholder } from '../types/contract';

const ROLE_OPTIONS = [
  Role.Farmer,
  Role.Processor,
  Role.Distributor,
  Role.Retailer,
  Role.Consumer,
  Role.Admin,
];

export default function StakeholdersPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const queryClient = useQueryClient();

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'owner',
  });
  const isOwner = !!address && !!owner && address.toLowerCase() === owner.toLowerCase();

  // Registered stakeholder addresses come from StakeholderRegistered events.
  const { data: addresses } = useQuery({
    queryKey: ['stakeholderAddresses', contractAddress],
    enabled: !!publicClient,
    queryFn: async () => {
      const logs = await publicClient!.getContractEvents({
        address: contractAddress,
        abi: foodTraceabilityAbi,
        eventName: 'StakeholderRegistered',
        fromBlock: 0n,
      });
      const seen = new Set<string>();
      const unique: `0x${string}`[] = [];
      for (const log of logs) {
        const addr = log.args.stakeholder;
        if (addr && !seen.has(addr)) {
          seen.add(addr);
          unique.push(addr);
        }
      }
      return unique;
    },
  });

  const { data: results, isLoading } = useReadContracts({
    contracts: (addresses ?? []).map((addr) => ({
      address: contractAddress,
      abi: foodTraceabilityAbi,
      functionName: 'getStakeholder',
      args: [addr],
    })),
    query: { enabled: (addresses?.length ?? 0) > 0 },
  });

  const stakeholders: Stakeholder[] = (results ?? [])
    .filter((r) => r.status === 'success')
    .map((r) => r.result as unknown as Stakeholder)
    .filter((s) => s.isActive);

  // --- Register form (owner only) ---
  const [form, setForm] = useState<{ addr: string; role: number; name: string; location: string }>({
    addr: '',
    role: Role.Farmer,
    name: '',
    location: '',
  });
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleRegister = () => {
    writeContract(
      {
        address: contractAddress,
        abi: foodTraceabilityAbi,
        functionName: 'registerStakeholder',
        args: [form.addr as `0x${string}`, form.role, form.name, form.location],
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: ['stakeholderAddresses', contractAddress] });
        },
      },
    );
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        👥 Stakeholders
      </Typography>

      {isOwner && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Register Stakeholder
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
              <TextField
                label="Address"
                value={form.addr}
                onChange={(e) => setForm({ ...form, addr: e.target.value })}
                sx={{ minWidth: 380 }}
                size="small"
              />
              <TextField
                select
                label="Role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: Number(e.target.value) })}
                sx={{ minWidth: 140 }}
                size="small"
              >
                {ROLE_OPTIONS.map((r) => (
                  <MenuItem key={r} value={r}>
                    {roleLabels[r]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                size="small"
              />
              <TextField
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleRegister}
                disabled={isPending || isConfirming || !form.addr || !form.name}
                startIcon={isPending || isConfirming ? <CircularProgress size={18} /> : null}
              >
                {isPending ? 'Confirm in wallet…' : isConfirming ? 'Registering…' : 'Register'}
              </Button>
            </Box>
            {isSuccess && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Stakeholder registered.
              </Alert>
            )}
            {writeError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {writeError.message}
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : stakeholders.length === 0 ? (
        <Alert severity="info">No stakeholders registered yet.</Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Registered Stakeholders ({stakeholders.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Address</strong></TableCell>
                    <TableCell><strong>Name</strong></TableCell>
                    <TableCell><strong>Role</strong></TableCell>
                    <TableCell><strong>Location</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {stakeholders.map((s) => (
                    <TableRow key={s.addr}>
                      <TableCell>{shortenAddress(s.addr)}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {s.name}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={roleLabels[s.role]} size="small" color="primary" />
                      </TableCell>
                      <TableCell>{s.location}</TableCell>
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
}
