import { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/rbac';
import { redirect } from 'next/navigation';
import { StudentClientProvider } from '@/components/layout/student-client-provider';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const authResult = await requireRole('student');
  
  if ('error' in authResult) {
    redirect('/login');
  }

  // Single column centered layout per rules
  return (
    <StudentClientProvider>
      <div className="min-h-screen bg-page flex flex-col items-center">
        <main className="w-full max-w-5xl px-4 py-8">
          {children}
        </main>
      </div>
    </StudentClientProvider>
  );
}
