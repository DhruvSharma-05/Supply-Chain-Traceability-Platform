import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { hardhat, sepolia } from 'wagmi/chains';

// projectId is only required for WalletConnect wallets. MetaMask/injected works
// without one, so a placeholder is fine for local development.
export const config = getDefaultConfig({
  appName: 'Food Traceability Platform',
  projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID ?? 'PLACEHOLDER_PROJECT_ID',
  chains: [hardhat, sepolia],
  ssr: false,
});
