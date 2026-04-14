export type FieldValue = { node: string; isMuted: boolean };

export function valueOrFallback(v: string | null | undefined): FieldValue {
  if (v == null || v === '') {
    return { node: 'Not mentioned', isMuted: true };
  }
  return { node: v, isMuted: false };
}

export function computeInitials(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => (w[0] ?? '').toUpperCase())
    .join('');
}

export function formatBirthDate(
  dob: string | null,
  dateOfBirth: string | null,
): string | null {
  const raw = dob ?? dateOfBirth;
  if (raw == null) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}
