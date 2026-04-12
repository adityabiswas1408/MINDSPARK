import Link from 'next/link';

interface DevModeBannerProps {
  role: 'admin' | 'student';
  fullName?: string;
}

/**
 * Dev-mode auto-login banner. Renders only when DEV_AUTO_LOGIN=true
 * AND NODE_ENV !== 'production'. Reminds the user they are signed in
 * under a test account without having provided credentials.
 *
 * Shows at the very top of the admin and student layouts so it's
 * impossible to miss.
 */
export function DevModeBanner({ role, fullName }: DevModeBannerProps) {
  const isEnabled =
    process.env.DEV_AUTO_LOGIN === 'true' &&
    process.env.NODE_ENV !== 'production';

  if (!isEnabled) return null;

  const otherRole = role === 'admin' ? 'student' : 'admin';
  const otherRedirect =
    role === 'admin' ? '/student/dashboard' : '/admin/dashboard';
  // Route the switch link through the auto-login API so the active
  // session is cleared and the other role is signed in cleanly.
  const otherPath = `/api/dev-auto-login?role=${otherRole}&redirect=${encodeURIComponent(otherRedirect)}`;

  return (
    <div
      role="status"
      aria-live="polite"
      className="w-full flex items-center justify-between font-sans"
      style={{
        backgroundColor: 'var(--bg-warning)',
        color: 'var(--text-warning)',
        borderBottom: '1px solid #FDE68A',
        padding: '8px 16px',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.02em',
        gap: '12px',
      }}
    >
      <div className="flex items-center" style={{ gap: '8px' }}>
        <span
          className="uppercase"
          style={{
            fontSize: '10px',
            fontWeight: 700,
            letterSpacing: '0.08em',
            backgroundColor: 'var(--text-warning)',
            color: 'var(--bg-warning)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-pill)',
          }}
        >
          DEV MODE
        </span>
        <span>
          Auto-signed-in as {role === 'admin' ? 'Test Admin' : 'Test Student'}
          {fullName ? ` — ${fullName}` : ''}
        </span>
      </div>
      <div className="flex items-center" style={{ gap: '16px' }}>
        <Link
          href={otherPath}
          className="underline underline-offset-2"
          style={{ color: 'var(--text-warning)', fontWeight: 600 }}
        >
          Switch to {otherRole}
        </Link>
        <Link
          href="/login"
          className="underline underline-offset-2"
          style={{ color: 'var(--text-warning)', fontWeight: 600 }}
        >
          Sign out
        </Link>
      </div>
    </div>
  );
}
