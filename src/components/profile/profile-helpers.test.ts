import { describe, it, expect } from 'vitest';
import { valueOrFallback, computeInitials, formatBirthDate } from './profile-helpers';

describe('valueOrFallback', () => {
  it('returns the value as-is when truthy', () => {
    expect(valueOrFallback('Aditi Sharma')).toEqual({
      node: 'Aditi Sharma',
      isMuted: false,
    });
  });

  it('returns "Not mentioned" when null', () => {
    expect(valueOrFallback(null)).toEqual({
      node: 'Not mentioned',
      isMuted: true,
    });
  });

  it('returns "Not mentioned" when undefined', () => {
    expect(valueOrFallback(undefined)).toEqual({
      node: 'Not mentioned',
      isMuted: true,
    });
  });

  it('returns "Not mentioned" when an empty string', () => {
    expect(valueOrFallback('')).toEqual({
      node: 'Not mentioned',
      isMuted: true,
    });
  });
});

describe('computeInitials', () => {
  it('returns first chars of the first two words', () => {
    expect(computeInitials('Aditi Sharma')).toBe('AS');
  });

  it('returns single char for a single-word name', () => {
    expect(computeInitials('Rohan')).toBe('R');
  });

  it('caps at two chars even when the name has more words', () => {
    expect(computeInitials('Mary Anne O Brien')).toBe('MA');
  });

  it('uppercases the result', () => {
    expect(computeInitials('aditi sharma')).toBe('AS');
  });

  it('handles extra whitespace', () => {
    expect(computeInitials('  Aditi   Sharma  ')).toBe('AS');
  });

  it('returns empty string for empty input', () => {
    expect(computeInitials('')).toBe('');
  });
});

describe('formatBirthDate', () => {
  it('formats dob when present', () => {
    expect(formatBirthDate('2012-08-14', null)).toBe('14 Aug 2012');
  });

  it('falls back to date_of_birth when dob is null', () => {
    expect(formatBirthDate(null, '2010-03-05')).toBe('05 Mar 2010');
  });

  it('prefers dob over date_of_birth when both are present', () => {
    expect(formatBirthDate('2012-08-14', '2010-03-05')).toBe('14 Aug 2012');
  });

  it('returns null when both are null', () => {
    expect(formatBirthDate(null, null)).toBeNull();
  });
});
