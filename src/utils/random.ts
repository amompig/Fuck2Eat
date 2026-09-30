import { Restaurant } from '../types';
import { calculateWeight } from './filterEngine';

/**
 * Returns a cryptographically secure random float in [0, 1)
 */
export function getCryptoRandom(): number {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const arr = new Uint32Array(1);
    window.crypto.getRandomValues(arr);
    return arr[0] / (0xffffffff + 1);
  }
  return Math.random();
}

/**
 * Fair random selection: true uniform probability
 */
export function pickFairRandom<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const rand = getCryptoRandom();
  const index = Math.floor(rand * items.length);
  return items[Math.min(index, items.length - 1)];
}

/**
 * Weighted random selection:
 * Probability is proportional to calculateWeight(item)
 */
export function pickWeightedRandom(restaurants: Restaurant[]): { restaurant: Restaurant; weight: number } | null {
  if (restaurants.length === 0) return null;

  const weights = restaurants.map((r) => calculateWeight(r));
  const totalWeight = weights.reduce((acc, w) => acc + w, 0);

  if (totalWeight <= 0) {
    const fallback = pickFairRandom(restaurants)!;
    return { restaurant: fallback, weight: 1 };
  }

  const rand = getCryptoRandom() * totalWeight;
  let running = 0;
  for (let i = 0; i < restaurants.length; i++) {
    running += weights[i];
    if (rand < running) {
      return { restaurant: restaurants[i], weight: weights[i] };
    }
  }

  return {
    restaurant: restaurants[restaurants.length - 1],
    weight: weights[restaurants.length - 1],
  };
}

export interface SimulationResult {
  totalRuns: number;
  expectedPerItem: number;
  itemCounts: { id: string; name: string; count: number; percentage: number }[];
  minCount: number;
  maxCount: number;
  standardDeviation: number;
  threeSigmaMax: number;
  threeSigmaMin: number;
  isWithinThreeSigma: boolean;
}

/**
 * Runs a 1,000-draw simulation to verify the uniform fairness of pickFairRandom
 */
export function runFairnessTest(restaurants: Restaurant[], runs = 1000): SimulationResult {
  const counts: Record<string, number> = {};
  restaurants.forEach((r) => {
    counts[r.id] = 0;
  });

  for (let i = 0; i < runs; i++) {
    const picked = pickFairRandom(restaurants);
    if (picked) {
      counts[picked.id] = (counts[picked.id] || 0) + 1;
    }
  }

  const n = restaurants.length;
  const p = 1 / n;
  const expected = runs * p;
  const variance = runs * p * (1 - p);
  const stdDev = Math.sqrt(variance);

  const threeSigmaMin = Math.max(0, expected - 3 * stdDev);
  const threeSigmaMax = expected + 3 * stdDev;

  let minCount = Infinity;
  let maxCount = -Infinity;
  let allWithinThreeSigma = true;

  const itemCounts = restaurants.map((r) => {
    const count = counts[r.id] || 0;
    if (count < minCount) minCount = count;
    if (count > maxCount) maxCount = count;
    if (count < threeSigmaMin || count > threeSigmaMax) {
      allWithinThreeSigma = false;
    }
    return {
      id: r.id,
      name: r.name,
      count,
      percentage: Number(((count / runs) * 100).toFixed(1)),
    };
  });

  return {
    totalRuns: runs,
    expectedPerItem: Math.round(expected),
    itemCounts,
    minCount: minCount === Infinity ? 0 : minCount,
    maxCount: maxCount === -Infinity ? 0 : maxCount,
    standardDeviation: Number(stdDev.toFixed(2)),
    threeSigmaMin: Math.floor(threeSigmaMin),
    threeSigmaMax: Math.ceil(threeSigmaMax),
    isWithinThreeSigma: allWithinThreeSigma,
  };
}
