import { formatEther } from 'viem';
import { stateLabels } from './enums';
import type { Product } from '../types/contract';

export function countByCategory(products: Product[]): { category: string; count: number }[] {
  const map = new Map<string, number>();
  for (const p of products) map.set(p.category, (map.get(p.category) ?? 0) + 1);
  return [...map.entries()].map(([category, count]) => ({ category, count }));
}

export function countByState(products: Product[]): { state: string; count: number }[] {
  const counts = Array<number>(6).fill(0);
  for (const p of products) counts[p.currentState]++;
  return counts.map((count, state) => ({ state: stateLabels[state], count }));
}

export function organicSplit(products: Product[]): { organic: number; conventional: number } {
  const organic = products.filter((p) => p.isOrganic).length;
  return { organic, conventional: products.length - organic };
}

export function totalValueEth(products: Product[]): string {
  const total = products.reduce((sum, p) => sum + p.price, 0n);
  return formatEther(total);
}
