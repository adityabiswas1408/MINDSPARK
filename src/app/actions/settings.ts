'use server';

import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';
import { z } from 'zod';

const UpdateSettingsSchema = z.object({
  name: z.string().optional(),
  session_timeout_seconds: z.number().int().min(900).max(86400).optional(),
  timezone: z.string().optional(),
  logo_url: z.string().url().optional(),
  auto_archive_enabled: z.boolean().optional(),
  default_duration_minutes: z.number().int().min(1).max(180).optional().nullable(),
  default_per_question_time_seconds: z.number().int().min(5).max(600).optional().nullable(),
  grade_boundaries: z.array(z.object({
    assessment_type: z.enum(['EXAM', 'TEST', 'ALL']),
    min_score: z.number(),
    max_score: z.number(),
    grade: z.string(),
    label: z.string().optional(),
  })).optional(),
});
export type UpdateSettingsInput = z.infer<typeof UpdateSettingsSchema>;

export async function updateSettings(input: UpdateSettingsInput): Promise<ActionResult<{ updated: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = UpdateSettingsSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  if (validData.name !== undefined && !validData.name.trim()) {
    return { error: 'VALIDATION_ERROR', message: 'Institution name cannot be empty' };
  }

  // Basic grade bounds check
  if (validData.grade_boundaries) {
    const limits = validData.grade_boundaries;
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

  const updates: Record<string, unknown> = {};
  if (validData.name !== undefined) updates.name = validData.name.trim();
  if (validData.session_timeout_seconds !== undefined) updates.session_timeout_seconds = validData.session_timeout_seconds;
  if (validData.timezone !== undefined) updates.timezone = validData.timezone;
  if (validData.logo_url !== undefined) updates.logo_url = validData.logo_url;
  if (validData.auto_archive_enabled !== undefined) updates.auto_archive_enabled = validData.auto_archive_enabled;
  if (validData.default_duration_minutes !== undefined) updates.default_duration_minutes = validData.default_duration_minutes;
  if (validData.default_per_question_time_seconds !== undefined) updates.default_per_question_time_seconds = validData.default_per_question_time_seconds;
  
  if (Object.keys(updates).length > 0) {
    await adminSupabase.from('institutions').update(updates).eq('id', institutionId);
  }

  if (validData.grade_boundaries) {
    // Backup existing rows before destructive delete
    const { data: backup } = await adminSupabase
      .from('grade_boundaries')
      .select('institution_id, grade_name, min_percentage, grade, label, assessment_type, min_score, max_score, color_hex')
      .eq('institution_id', institutionId);

    const { error: deleteErr } = await adminSupabase
      .from('grade_boundaries')
      .delete()
      .eq('institution_id', institutionId);

    if (deleteErr) return { error: 'INTERNAL_ERROR', message: 'Failed to update boundaries' };

    const { error: insertErr } = await adminSupabase
      .from('grade_boundaries')
      .insert(validData.grade_boundaries.map(b => ({ ...b, institution_id: institutionId, grade_name: b.grade, min_percentage: b.min_score })));
    
    if (insertErr) {
      // Attempt restore to prevent data loss
      if (backup && backup.length > 0) {
        await adminSupabase.from('grade_boundaries').insert(backup);
      }
      return { error: 'DB_ERROR', message: 'Failed to save grade boundaries — previous values restored' };
    }
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
