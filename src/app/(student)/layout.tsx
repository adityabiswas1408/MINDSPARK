import { ReactNode } from 'react';
import { requireRole } from '@/lib/auth/rbac';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { StudentClientProvider } from '@/components/layout/student-client-provider';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import { StudentHeader } from '@/components/layout/student-header';
import { DevModeBanner } from '@/components/dev/dev-mode-banner';

export default async function StudentLayout({ children }: { children: ReactNode }) {
  const authResult = await requireRole('student');
  if ('error' in authResult) redirect('/login');

  const { userId } = authResult;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from('students')
    .select('full_name')
    .eq('id', userId)
    .single();

  const fullName = student?.full_name ?? 'Student';

  return (
    <StudentClientProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
        <DevModeBanner role="student" fullName={fullName} />
        <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
          <StudentSidebar />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <StudentHeader fullName={fullName} />
            <main style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
              {children}
            </main>
          </div>
        </div>
      </div>
    </StudentClientProvider>
  );
}
