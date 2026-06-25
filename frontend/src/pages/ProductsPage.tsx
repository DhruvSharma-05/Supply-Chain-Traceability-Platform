import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useReadContract, useReadContracts } from 'wagmi';
import { contractAddress, foodTraceabilityAbi } from '../contract';
import { State, stateLabels, stateColors } from '../lib/enums';
import type { Product } from '../types/contract';

export default function ProductsPage() {
  const { data: total } = useReadContract({
    address: contractAddress,
    abi: foodTraceabilityAbi,
    functionName: 'getTotalProducts',
  });

  const count = total ? Number(total) : 0;

  const { data: results, isLoading } = useReadContracts({
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

  const organicCount = products.filter((p) => p.isOrganic).length;
  const soldCount = products.filter((p) => p.currentState === State.Sold).length;

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        🍎 Food Products
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="primary.main">
                {count}
              </Typography>
              <Typography color="text.secondary">Total Products</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="success.main">
                {organicCount}
              </Typography>
              <Typography color="text.secondary">Organic Products</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Typography variant="h3" color="info.main">
                {soldCount}
              </Typography>
              <Typography color="text.secondary">Products Sold</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : products.length === 0 ? (
        <Alert severity="info">No food products have been registered yet.</Alert>
      ) : (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              All Food Products ({products.length})
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Product Name</strong></TableCell>
                    <TableCell><strong>Category</strong></TableCell>
                    <TableCell><strong>Origin</strong></TableCell>
                    <TableCell><strong>Status</strong></TableCell>
                    <TableCell><strong>Organic</strong></TableCell>
                    <TableCell><strong>Batch</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id.toString()}>
                      <TableCell>{product.id.toString()}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {product.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell>{product.origin}</TableCell>
                      <TableCell>
                        <Chip
                          label={stateLabels[product.currentState]}
                          color={stateColors[product.currentState]}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {product.isOrganic ? (
                          <Chip label="🌱 Organic" color="success" size="small" />
                        ) : (
                          <Chip label="Conventional" size="small" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption">{product.batchNumber}</Typography>
                      </TableCell>
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
