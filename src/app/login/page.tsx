'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const loginEmail = (email.includes('@') ? email : `${email}@mindspark.local`).toLowerCase();

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    const role = user?.app_metadata?.role;

    if (role === 'admin' || role === 'teacher') {
      router.push('/admin/dashboard');
    } else if (role === 'student') {
      router.push('/student/dashboard');
    } else {
      router.push('/admin/dashboard');
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#204074',
        padding: '1rem',
        boxSizing: 'border-box'
      }}
    >
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          padding: '40px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          boxSizing: 'border-box'
        }}
      >
        <h1
          style={{
            fontFamily: 'var(--font-sans)',
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#1A3829',
            textAlign: 'center',
            margin: '0 0 8px 0',
          }}
        >
          MINDSPARK
        </h1>
        <p
          style={{
            fontSize: '15px',
            color: '#475569',
            textAlign: 'center',
            margin: '0 0 32px 0',
            fontFamily: 'var(--font-sans)'
          }}
        >
          Sign in to your account
        </p>

        <form onSubmit={handleLogin} style={{ width: '100%' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#0F172A',
              marginBottom: '6px',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Roll Number / Email
          </label>
          <input
            id="email"
            type="text"
            data-testid="roll-number"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoFocus
            style={{
              width: '100%',
              height: '44px',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />

          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#0F172A',
              marginTop: '16px',
              marginBottom: '6px',
              fontFamily: 'var(--font-sans)'
            }}
          >
            Password / DOB
          </label>
          <input
            id="password"
            type="password"
            data-testid="dob"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: '100%',
              height: '44px',
              border: '1px solid #E2E8F0',
              borderRadius: '10px',
              padding: '0 14px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
              boxSizing: 'border-box',
              outline: 'none'
            }}
          />

          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: '#FEF2F2',
                color: '#DC2626',
                padding: '12px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                marginTop: '16px',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box'
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            data-testid="login-submit"
            disabled={loading}
            style={{
              width: '100%',
              height: '48px',
              backgroundColor: '#1A3829',
              color: '#FFFFFF',
              borderRadius: '10px',
              fontFamily: 'var(--font-sans)',
              fontWeight: 600,
              fontSize: '14px',
              marginTop: '24px',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              boxSizing: 'border-box'
            }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  );
}
