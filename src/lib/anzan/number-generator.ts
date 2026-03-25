export interface NumberGeneratorConfig {
  /** How many numbers in the sequence (rows count) */
  count: number; // 2–10
  /** Minimum absolute value of each number */
  min: number; // e.g. 10 for 2-digit
  /** Maximum absolute value of each number */
  max: number; // e.g. 99 for 2-digit
  /** Probability (0–1) that any given number is negative */
  negative_probability: number; // e.g. 0.3 = 30% negative
  /** Difficulty multiplier: affects variance and sum constraints */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /**
   * Seed for reproducibility.
   * REQUIRED for assessment questions so re-evaluation produces identical sequences.
   * If omitted: uses crypto.randomUUID() — non-reproducible.
   */
  seed?: string;
}

export interface GeneratedSequence {
  numbers: number[];
  sum: number; // sum of all numbers (for answer validation)
  seed: string; // echoed back for audit trail
}

/**
 * Seeded PRNG — Mulberry32 (fast, deterministic, 32-bit state)
 * Selected over Math.random() for: reproducibility, portability, no import overhead.
 */
function mulberry32(seed: number): () => number {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = t + Math.imul(t ^ (t >>> 7), 61 | t) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashSeedToNumber(seed: string): number {
  // FNV-1a 32-bit hash of seed string → numeric seed for Mulberry32
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function generateFlashSequence(
  config: NumberGeneratorConfig
): GeneratedSequence {
  // Validate inputs
  if (config.count < 2 || config.count > 10) {
    throw new Error(`INVALID_COUNT: ${config.count} must be 2–10`);
  }
  if (config.min > config.max) {
    throw new Error(`INVALID_RANGE: min ${config.min} > max ${config.max}`);
  }

  const seed = config.seed ?? crypto.randomUUID();
  const rand = mulberry32(hashSeedToNumber(seed));
  const numbers: number[] = [];
  let sum = 0;
  let prev: number | null = null;

  // Sum constraint: keeps answer within 4 digits (max 9999 for digit-count display)
  const MAX_SUM = Math.pow(10, Math.ceil(Math.log10(config.max)) + 1) - 1;

  for (let i = 0; i < config.count; i++) {
    let n: number;
    let attempts = 0;

    do {
      attempts++;
      if (attempts > 100) {
        // Safety valve: relax constraints after 100 attempts
        n = Math.round(rand() * (config.max - config.min) + config.min);
        break;
      }

      // Generate magnitude
      const magnitude = Math.round(
        rand() * (config.max - config.min) + config.min
      );

      // Apply negativity
      const isNegative = rand() < config.negative_probability && i > 0;
      // First number (i=0) is always positive — ensures positive running total at start
      n = isNegative ? -magnitude : magnitude;
    } while (
      // Constraint 1: no consecutive identical numbers
      n === prev ||
      // Constraint 2: running sum must stay within display bounds
      Math.abs(sum + n) > MAX_SUM
    );

    numbers.push(n);
    sum += n;
    prev = n;
  }

  return { numbers, sum, seed };
}
