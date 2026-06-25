import { foodTraceabilityAbi } from './abi/foodTraceability';

// Default address is the Hardhat first-deploy address; override per environment
// with VITE_CONTRACT_ADDRESS once the contract is deployed elsewhere.
const DEFAULT_LOCAL_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const contractAddress = (import.meta.env.VITE_CONTRACT_ADDRESS ??
  DEFAULT_LOCAL_ADDRESS) as `0x${string}`;

export { foodTraceabilityAbi };
