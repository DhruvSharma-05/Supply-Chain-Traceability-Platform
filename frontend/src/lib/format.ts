import { formatEther } from 'viem';

/** Unix seconds (uint256) -> local date string. */
export function formatTimestamp(seconds: bigint): string {
  return new Date(Number(seconds) * 1000).toLocaleDateString();
}

/** Wei (uint256) -> "0.01 ETH". */
export function formatPrice(wei: bigint): string {
  return `${formatEther(wei)} ETH`;
}

/** 0x1234…abcd */
export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}
