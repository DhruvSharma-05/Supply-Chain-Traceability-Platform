import type { ReadContractReturnType } from 'viem';
import { foodTraceabilityAbi } from '../abi/foodTraceability';

// Types are inferred directly from the `as const` ABI, so they stay in sync
// with the contract automatically whenever the ABI is regenerated.
export type Product = ReadContractReturnType<typeof foodTraceabilityAbi, 'getProduct'>;

export type Stakeholder = ReadContractReturnType<typeof foodTraceabilityAbi, 'getStakeholder'>;

export type ProductTransaction = ReadContractReturnType<
  typeof foodTraceabilityAbi,
  'getProductHistory'
>[number];
