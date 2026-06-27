import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import { PieChart } from '@mui/x-charts/PieChart';
import { useReadContract, useReadContracts, usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { contractAddress, foodTraceabilityAbi } from '../contract';
import { State, stateLabels } from '../lib/enums';
import { countByCategory, countByState, organicSplit, totalValueEth } from '../lib/analytics';
import type { Product } from '../types/contract';

export default function AnalyticsDashboard() {
  const publicClient = usePublicClient();

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

  // Recent on-chain activity from event logs.
  const { data: activity } = useQuery({
    queryKey: ['recentActivity', contractAddress],
    enabled: !!publicClient,
    queryFn: async () => {
      const logs = await publicClient!.getContractEvents({
        address: contractAddress,
        abi: foodTraceabilityAbi,
        fromBlock: 0n,
      });
      return logs
        .sort((a, b) => Number(b.blockNumber - a.blockNumber))
        .slice(0, 10)
        .map((log) => describeEvent(log as unknown as ContractEvent));
    },
  });

  const byCategory = countByCategory(products);
  const byState = countByState(products);
  const { organic, conventional } = organicSplit(products);
  const soldCount = products.filter((p) => p.currentState === State.Sold).length;

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom sx={{ color: 'primary.main' }}>
        📈 Analytics
      </Typography>

      {count === 0 ? (
        <Alert severity="info">No on-chain data yet — create some products to see analytics.</Alert>
      ) : (
        <Grid container spacing={3}>
          <Stat label="Total Products" value={count} />
          <Stat label="Catalog Value" value={`${totalValueEth(products)} ETH`} />
          <Stat label="Organic" value={`${Math.round((organic / count) * 100)}%`} />
          <Stat label="Sold" value={soldCount} />

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Products by Category
                </Typography>
                <BarChart
                  height={300}
                  xAxis={[{ scaleType: 'band', data: byCategory.map((c) => c.category) }]}
                  series={[{ data: byCategory.map((c) => c.count), label: 'Products' }]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Lifecycle Distribution
                </Typography>
                <BarChart
                  height={300}
                  xAxis={[{ scaleType: 'band', data: byState.map((s) => s.state) }]}
                  series={[{ data: byState.map((s) => s.count), label: 'Products' }]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Organic vs Conventional
                </Typography>
                <PieChart
                  height={280}
                  series={[
                    {
                      data: [
                        { id: 0, value: organic, label: 'Organic' },
                        { id: 1, value: conventional, label: 'Conventional' },
                      ],
                    },
                  ]}
                />
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Recent Activity
                </Typography>
                {!activity || activity.length === 0 ? (
                  <Typography color="text.secondary">No activity yet.</Typography>
                ) : (
                  <List dense>
                    {activity.map((line, i) => (
                      <ListItem key={i} disableGutters>
                        <ListItemText primary={line} />
                      </ListItem>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <Grid size={{ xs: 6, sm: 3 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h4" color="primary.main">
            {value}
          </Typography>
          <Typography color="text.secondary">{label}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

type ContractEvent = {
  eventName: string;
  // Heterogeneous event args; this is a display-only formatter.
  args: Record<string, any>;
};

function describeEvent(log: ContractEvent): string {
  const a = log.args;
  const id = a.productId !== undefined ? `#${a.productId}` : '';
  switch (log.eventName) {
    case 'ProductCreated':
      return `Product ${id} "${a.name}" created`;
    case 'StateChanged':
      return `Product ${id} → ${stateLabels[Number(a.newState)]}`;
    case 'ProductOwnershipTransferred':
      return `Product ${id} transferred`;
    case 'StakeholderRegistered':
      return `Stakeholder "${a.name}" registered`;
    case 'QualityAlert':
      return `Quality alert on product ${id}`;
    default:
      return log.eventName;
  }
}
