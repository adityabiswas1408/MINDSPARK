import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import LoginPage from './page';

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock Supabase client
const mockSignInWithPassword = vi.fn();
const mockGetUser = vi.fn();

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      getUser: mockGetUser,
    },
  }),
}));

describe('LoginPage Redirection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const doLogin = async () => {
    render(<LoginPage />);
    fireEvent.change(screen.getByTestId('roll-number'), { target: { value: 'user@test.com' } });
    fireEvent.change(screen.getByTestId('dob'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByTestId('login-submit'));
  };

  it('redirects admin to /admin/dashboard', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { app_metadata: { role: 'admin' } } },
    });

    await doLogin();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    });
  });

  it('redirects teacher to /teacher/announcements', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { app_metadata: { role: 'teacher' } } },
    });

    await doLogin();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/teacher/announcements');
    });
  });

  it('redirects student to /student/dashboard', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null });
    mockGetUser.mockResolvedValue({
      data: { user: { app_metadata: { role: 'student' } } },
    });

    await doLogin();

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/student/dashboard');
    });
  });
});
