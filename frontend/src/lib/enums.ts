import type { ChipProps } from '@mui/material';

// Mirrors the State enum in FoodTraceability.sol.
export const State = {
  Harvested: 0,
  Processed: 1,
  Shipped: 2,
  Distributed: 3,
  Retail: 4,
  Sold: 5,
} as const;

export const stateLabels: Record<number, string> = {
  0: 'Harvested',
  1: 'Processed',
  2: 'Shipped',
  3: 'Distributed',
  4: 'Retail',
  5: 'Sold',
};

// MUI Chip color per state, for status badges.
export const stateColors: Record<number, ChipProps['color']> = {
  0: 'success',
  1: 'info',
  2: 'secondary',
  3: 'warning',
  4: 'primary',
  5: 'default',
};

// Mirrors the Role enum in FoodTraceability.sol.
export const Role = {
  Admin: 0,
  Farmer: 1,
  Processor: 2,
  Distributor: 3,
  Retailer: 4,
  Consumer: 5,
} as const;

export const roleLabels: Record<number, string> = {
  0: 'Admin',
  1: 'Farmer',
  2: 'Processor',
  3: 'Distributor',
  4: 'Retailer',
  5: 'Consumer',
};
