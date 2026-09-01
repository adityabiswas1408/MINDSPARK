import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { TopHeader } from '@/components/layout/top-header';
import { AdminClientProvider } from '@/components/layout/admin-client-provider';

export const instant = false;

export default async function TeacherLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/login');
  }

  const role = user.app_metadata?.role;
  // Strictly teacher only
  if (role !== 'teacher') {
    if (role === 'admin') redirect('/admin/dashboard');
    if (role === 'student') redirect('/student/dashboard');
    redirect('/login');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .maybeSingle();

  const fullName =
    (profile?.full_name as string | null) ??
    (user.user_metadata?.full_name as string | undefined) ??
    (user.email ?? undefined);

  return (
    <div className="flex h-screen w-full bg-bg-page overflow-hidden">
      <AdminClientProvider />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader title="Teacher Portal" fullName={fullName} />
        <main className="flex-1 overflow-y-auto p-8 relative isolate">
          {children}
        </main>
      </div>
    </div>
  );
}
