import { describe, it, expect, beforeEach, vi } from 'vitest';
import TeacherLayout from './layout';
import { redirect } from 'next/navigation';

// Mock Next.js redirect
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
}));

// Mock components to avoid deep rendering issues
vi.mock('@/components/layout/top-header', () => ({
  TopHeader: () => <div data-testid="top-header" />
}));
vi.mock('@/components/layout/admin-client-provider', () => ({
  AdminClientProvider: () => <div data-testid="admin-provider" />
}));

const mockGetUser = vi.fn();
const mockFrom = vi.fn();

vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    from: mockFrom
  })
}));

describe('TeacherLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFrom.mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: { full_name: 'Test User' } })
    });
  });

  it('redirects to /login if no user', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null }, error: new Error('No user') });
    
    try {
      await TeacherLayout({ children: <div /> });
    } catch (e) {
      // Ignored, React throws on redirect in some test setups
    }
    
    expect(redirect).toHaveBeenCalledWith('/login');
  });

  it('redirects admin to /admin/dashboard', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'admin1', app_metadata: { role: 'admin' } } }, 
      error: null 
    });
    
    try {
      await TeacherLayout({ children: <div /> });
    } catch (e) {
      // Ignored
    }
    
    expect(redirect).toHaveBeenCalledWith('/admin/dashboard');
  });

  it('redirects student to /student/dashboard', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'student1', app_metadata: { role: 'student' } } }, 
      error: null 
    });
    
    try {
      await TeacherLayout({ children: <div /> });
    } catch (e) {
      // Ignored
    }
    
    expect(redirect).toHaveBeenCalledWith('/student/dashboard');
  });

  it('renders children for teacher', async () => {
    mockGetUser.mockResolvedValue({ 
      data: { user: { id: 'teacher1', app_metadata: { role: 'teacher' } } }, 
      error: null 
    });
    
    const result = await TeacherLayout({ children: <div data-testid="child" /> });
    
    expect(redirect).not.toHaveBeenCalled();
    expect(result).toBeDefined();
  });
});
