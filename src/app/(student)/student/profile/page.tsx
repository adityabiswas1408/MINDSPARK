import { requireRole } from '@/lib/auth/rbac';
import { createClient } from '@/lib/supabase/server';

/**
 * Student profile card page — full name, roll number (Candidate ID),
 * level pill, and a meta strip showing member-since + status. Styled
 * per 07_hifi-spec §6 using MINDSPARK forest-green tokens.
 */
export default async function StudentProfilePage() {
  const authResult = await requireRole('student');
  if ('error' in authResult) return null;
  const { userId } = authResult;

  const supabase = await createClient();
  const { data: student } = await supabase
    .from('students')
    .select('full_name, roll_number, level_id, created_at, levels(name)')
    .eq('id', userId)
    .single();

  if (!student) return null;

  const fullName = (student.full_name as string | null) ?? '—';
  const rollNumber = (student.roll_number as string | null) ?? '—';

  const levelData = Array.isArray(student.levels)
    ? student.levels[0]
    : student.levels;
  const levelName = (levelData?.name as string | undefined) ?? 'Level 1';

  const memberSince = student.created_at
    ? new Date(student.created_at as string).toLocaleDateString('en', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : '—';

  const initials =
    fullName
      .split(' ')
      .slice(0, 2)
      .map((w) => w[0] ?? '')
      .join('')
      .toUpperCase() || 'U';

  return (
    <div className="max-w-[560px] mx-auto mt-12 space-y-6">
      {/* Page heading */}
      <h1
        className="font-sans tracking-tight"
        style={{
          fontSize: '30px',
          fontWeight: 700,
          color: 'var(--text-primary)',
        }}
      >
        My Profile
      </h1>

      {/* Hero ID card */}
      <div
        className="bg-white flex items-center"
        style={{
          borderRadius: 'var(--radius-card)',
          padding: '32px',
          gap: '24px',
          boxShadow: 'var(--shadow-md)',
          border: '1px solid var(--color-slate-200)',
        }}
      >
        {/* Avatar circle */}
        <div
          className="flex items-center justify-center shrink-0 rounded-full font-sans"
          aria-hidden="true"
          style={{
            width: '96px',
            height: '96px',
            backgroundColor: 'var(--clr-green-800)',
            color: '#FFFFFF',
            fontSize: '32px',
            fontWeight: 700,
            letterSpacing: '0.02em',
          }}
        >
          {initials}
        </div>

        {/* Info stack */}
        <div className="flex-1 min-w-0 space-y-2">
          <h2
            className="font-sans"
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'var(--text-primary)',
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            {fullName}
          </h2>

          {/* Roll number */}
          <div>
            <div
              className="font-sans uppercase"
              style={{
                fontSize: '10px',
                fontWeight: 600,
                color: 'var(--text-subtle)',
                letterSpacing: '0.08em',
                marginBottom: '2px',
              }}
            >
              Candidate ID
            </div>
            <div
              className="font-mono tabular-nums"
              style={{
                fontFamily: 'var(--font-mono), monospace',
                fontSize: '16px',
                fontWeight: 500,
                color: 'var(--text-secondary)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: 0,
              }}
            >
              {rollNumber}
            </div>
          </div>

          {/* Level pill */}
          <div
            className="inline-flex items-center font-sans"
            style={{
              backgroundColor: 'var(--clr-green-50)',
              border: '1px solid var(--clr-green-200)',
              padding: '6px 14px',
              borderRadius: 'var(--radius-pill)',
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--clr-green-800)',
              marginTop: '4px',
            }}
          >
            {levelName}
          </div>
        </div>
      </div>

      {/* Meta strip — small secondary card */}
      <div
        className="bg-white flex items-center justify-between font-sans"
        style={{
          borderRadius: 'var(--radius-card)',
          padding: '20px',
          gap: '16px',
          boxShadow: 'var(--shadow-sm)',
          border: '1px solid var(--color-slate-200)',
        }}
      >
        <div>
          <div
            className="uppercase"
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-subtle)',
              letterSpacing: '0.08em',
            }}
          >
            Member since
          </div>
          <div
            className="font-mono tabular-nums"
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--text-primary)',
              marginTop: '2px',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {memberSince}
          </div>
        </div>

        <div
          aria-hidden="true"
          style={{
            width: '1px',
            height: '32px',
            backgroundColor: 'var(--color-slate-200)',
          }}
        />

        <div className="text-right">
          <div
            className="uppercase"
            style={{
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--text-subtle)',
              letterSpacing: '0.08em',
            }}
          >
            Status
          </div>
          <div
            style={{
              fontSize: '14px',
              fontWeight: 500,
              color: 'var(--clr-green-800)',
              marginTop: '2px',
            }}
          >
            Active
          </div>
        </div>
      </div>
    </div>
  );
}
