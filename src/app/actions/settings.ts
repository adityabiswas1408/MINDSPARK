'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

interface UpdateSettingsInput {
  session_timeout_seconds?: number;
  timezone?:                string;
  logo_url?:                string;
  grade_boundaries?:        Array<{
    assessment_type: 'EXAM' | 'TEST' | 'ALL';
    min_score:       number;
    max_score:       number;
    grade:           string;
    label?:          string;
  }>;
}

export async function updateSettings(input: UpdateSettingsInput): Promise<ActionResult<{ updated: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as any, message: authResult.message };
  const { userId, institutionId } = authResult;

  if (input.session_timeout_seconds && (input.session_timeout_seconds < 900 || input.session_timeout_seconds > 86400)) {
    return { error: 'VALIDATION_ERROR', message: 'Timeout out of range' };
  }

  // Basic grade bounds check
  if (input.grade_boundaries) {
    const limits = input.grade_boundaries;
    // ensure no overlaps. O(n^2) is fine for typically <10 bounds
    for (let i = 0; i < limits.length; i++) {
      if (limits[i].min_score > limits[i].max_score) return { error: 'VALIDATION_ERROR', message: 'min > max' };
      for (let j = i + 1; j < limits.length; j++) {
        const a = limits[i];
        const b = limits[j];
        if (a.assessment_type === b.assessment_type || a.assessment_type === 'ALL' || b.assessment_type === 'ALL') {
          if (a.min_score <= b.max_score && b.min_score <= a.max_score) {
            return { error: 'VALIDATION_ERROR', message: 'Overlapping grade boundaries' };
          }
        }
      }
    }
  }

  const updates: Record<string, any> = {};
  if (input.session_timeout_seconds !== undefined) updates.session_timeout_seconds = input.session_timeout_seconds;
  if (input.timezone !== undefined) updates.timezone = input.timezone;
  if (input.logo_url !== undefined) updates.logo_url = input.logo_url;

  if (Object.keys(updates).length > 0) {
    await adminSupabase.from('institutions').update(updates).eq('id', institutionId);
  }

  if (input.grade_boundaries && input.grade_boundaries.length > 0) {
    await adminSupabase.from('grade_boundaries').delete().eq('institution_id', institutionId);
    const boundsPayload = input.grade_boundaries.map(b => ({
      institution_id: institutionId,
      assessment_type: b.assessment_type,
      min_score: b.min_score,
      max_score: b.max_score,
      min_percentage: b.min_score,
      grade_name: b.grade,
      grade: b.grade,
      label: b.label || ''
    }));
    await adminSupabase.from('grade_boundaries').insert(boundsPayload);
  }

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'institutions',
    entity_id: institutionId,
    action_type: 'UPDATE_SETTINGS'
  });

  return { ok: true, data: { updated: true } };
}
