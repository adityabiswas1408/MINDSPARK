import { requireRole } from '@/lib/auth/rbac';
import { adminSupabase } from '@/lib/supabase/admin';
import SettingsClient, { type GradeBoundaryInput, type InstitutionInput } from './settings-client';

export default async function AdminSettingsPage() {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return null;
  const { institutionId } = authResult;

  const [{ data: inst }, { data: bounds }] = await Promise.all([
    adminSupabase
      .from('institutions')
      .select('name, timezone, session_timeout_seconds')
      .eq('id', institutionId)
      .single(),
    adminSupabase
      .from('grade_boundaries')
      .select('grade_name, min_percentage, min_score, max_score, assessment_type, label')
      .eq('institution_id', institutionId)
      .order('min_percentage', { ascending: false }),
  ]);

  // Deduplicate by grade_name — keep first occurrence (highest min_percentage wins)
  const seen = new Set<string>();
  const uniqueBounds: GradeBoundaryInput[] = (bounds ?? []).filter(b => {
    if (seen.has(b.grade_name)) return false;
    seen.add(b.grade_name);
    return true;
  });

  const institution: InstitutionInput = {
    name: inst?.name ?? '',
    timezone: inst?.timezone ?? 'Asia/Kolkata',
    session_timeout_seconds: inst?.session_timeout_seconds ?? 3600,
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Settings</h1>
      <SettingsClient
        institution={institution}
        gradeBoundaries={uniqueBounds}
      />
    </div>
  );
}
