/**
 * UT-02 — Number Generator
 * Test plan §2: no consecutive duplicates, sum within 4-digit display bound,
 * seed reproducibility, different seeds produce different sequences, INVALID_COUNT throws.
 */
import { describe, it, expect } from 'vitest';
import { generateFlashSequence } from '@/lib/anzan/number-generator';

describe('Number Generator', () => {
  // UT-02a: no two consecutive identical numbers across 100 random trials
  it('UT-02a: no two consecutive identical numbers', () => {
    for (let trial = 0; trial < 100; trial++) {
      const { numbers } = generateFlashSequence({
        count: 10,
        min: 10,
        max: 99,
        negative_probability: 0.3,
        difficulty: 3,
      });

      for (let i = 1; i < numbers.length; i++) {
        expect(
          numbers[i],
          `Trial ${trial}: consecutive duplicate at index ${i} (${numbers[i - 1]}, ${numbers[i]})`
        ).not.toBe(numbers[i - 1]);
      }
    }
  });

  // UT-02b: |sum| stays within 4-digit display bound (<10,000)
  it('UT-02b: sum stays within 4-digit display bound', () => {
    for (let trial = 0; trial < 100; trial++) {
      const { sum } = generateFlashSequence({
        count: 10,
        min: 10,
        max: 99,
        negative_probability: 0.2,
        difficulty: 2,
      });
      expect(Math.abs(sum), `Trial ${trial}: sum ${sum} out of bound`).toBeLessThan(10_000);
    }
  });

  // UT-02c: same seed → identical sequence (Mulberry32 PRNG is deterministic)
  it('UT-02c: seed reproducibility — same seed produces identical sequence', () => {
    const config = {
      count: 7,
      min: 1,
      max: 9,
      negative_probability: 0.1,
      difficulty: 1 as const,
      seed: '550e8400-e29b-41d4-a716-446655440000',
    };

    const a = generateFlashSequence(config);
    const b = generateFlashSequence(config);

    expect(a.numbers).toEqual(b.numbers);
    expect(a.sum).toBe(b.sum);
    expect(a.seed).toBe(b.seed);
  });

  // UT-02d: different seeds → different sequences (PRNG is sensitive to seed)
  it('UT-02d: different seeds produce different sequences', () => {
    const baseConfig = {
      count: 5,
      min: 1,
      max: 9,
      negative_probability: 0,
      difficulty: 1 as const,
    };

    const a = generateFlashSequence({ ...baseConfig, seed: 'seed-alpha' });
    const b = generateFlashSequence({ ...baseConfig, seed: 'seed-beta' });

    expect(a.numbers).not.toEqual(b.numbers);
  });

  // UT-02e: count outside 2–10 → throws INVALID_COUNT
  it('UT-02e: count > 10 throws INVALID_COUNT', () => {
    expect(() =>
      generateFlashSequence({
        count: 11,
        min: 1,
        max: 9,
        negative_probability: 0,
        difficulty: 1,
      })
    ).toThrow('INVALID_COUNT');
  });

  it('UT-02e-lower: count < 2 also throws INVALID_COUNT', () => {
    expect(() =>
      generateFlashSequence({
        count: 1,
        min: 1,
        max: 9,
        negative_probability: 0,
        difficulty: 1,
      })
    ).toThrow('INVALID_COUNT');
  });

  // UT-02f: seed is echoed in result for audit trail
  it('UT-02f: result includes the seed used for generation', () => {
    const seed = 'audit-trail-seed';
    const result = generateFlashSequence({
      count: 3,
      min: 1,
      max: 9,
      negative_probability: 0,
      difficulty: 1,
      seed,
    });
    expect(result.seed).toBe(seed);
  });

  // UT-02g: first number is always positive (rule: i=0 is always positive)
  it('UT-02g: first number in sequence is always positive', () => {
    for (let trial = 0; trial < 50; trial++) {
      const { numbers } = generateFlashSequence({
        count: 5,
        min: 1,
        max: 9,
        negative_probability: 1.0, // maximum negative probability
        difficulty: 1,
      });
      expect(numbers[0], `Trial ${trial}: first number ${numbers[0]} is negative`).toBeGreaterThan(0);
    }
  });
});
