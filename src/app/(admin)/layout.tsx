import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { AdminClientProvider } from '@/components/layout/admin-client-provider';
import { DevModeBanner } from '@/components/dev/dev-mode-banner';

export default async function AdminLayout({
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
  if (role !== 'admin' && role !== 'teacher') {
    redirect('/login');
  }

  // Fetch the admin's display name for the avatar initials.
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
    <div className="flex flex-col h-screen w-full bg-bg-page overflow-hidden">
      <DevModeBanner role="admin" fullName={fullName} />
      <div className="flex flex-1 w-full overflow-hidden">
      <AdminClientProvider />
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader title="Admin Dashboard" fullName={fullName} />
        <main className="flex-1 overflow-y-auto p-8 relative isolate">
          {children}
        </main>
      </div>
      </div>
    </div>
  );
}
