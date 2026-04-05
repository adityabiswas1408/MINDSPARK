import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/layout/admin-sidebar';
import { TopHeader } from '@/components/layout/top-header';
import { AdminClientProvider } from '@/components/layout/admin-client-provider';

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

  return (
    <div className="flex h-screen w-full bg-bg-page overflow-hidden">
      <AdminClientProvider />
      <AdminSidebar />
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <TopHeader title="Admin Dashboard" />
        <main className="flex-1 overflow-y-auto p-8 relative isolate">
          {children}
        </main>
      </div>
    </div>
  );
}
