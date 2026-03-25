'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';

interface ImportStudentsCSVInput {
  csv_raw: string;
  level_id: string;
  cohort_id?: string;
  dry_run: boolean;
}

interface ImportStudentsCSVOutput {
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}

export async function importStudentsCSV(input: ImportStudentsCSVInput): Promise<ActionResult<ImportStudentsCSVOutput>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  // Enforce 500 rows limit
  const lines = input.csv_raw.trim().split('\n');
  if (lines.length > 501) { // including header
    return { error: 'QUOTA_EXCEEDED', message: 'Maximum 500 rows per import allowed.' };
  }

  const supabase = await createClient();

  // Call the bulk import RPC which handles ATOMIC transaction, cohort_history, and rollback on error
  const p_students = lines.slice(1)
    .filter(line => line.trim().length > 0)
    .map(line => {
      const parts = line.split(',').map(s => s.trim());
      return {
        roll_number: parts[0] || '',
        full_name: parts[1] || '',
        date_of_birth: parts[2] || null
      };
    })
    .filter(s => s.roll_number && s.full_name);

  if (input.dry_run) {
    return { ok: true, data: { inserted: p_students.length, skipped: 0, errors: [] } };
  }

  const { data, error } = await supabase.rpc('bulk_import_students', {
    p_institution_id: institutionId,
    p_level_id: input.level_id,
    p_cohort_id: input.cohort_id ?? '',
    p_students
  });

  if (error) {
    return { error: 'INTERNAL_ERROR', message: 'Bulk import failed.' };
  }

  const result = data as unknown as ImportStudentsCSVOutput;

  if (!input.dry_run && result.inserted > 0) {
    await supabase.from('activity_logs').insert({
      user_id: userId,
      institution_id: institutionId,
      entity_type: 'bulk_import',
      action_type: 'IMPORT_STUDENTS',
      metadata: { count: result.inserted }
    });
  }

  return { ok: true, data: result };
}

interface CreateStudentInput {
  full_name: string;
  roll_number: string;
  date_of_birth?: string;
  level_id: string;
  cohort_id?: string;
  send_invite: boolean;
}

export async function createStudent(input: CreateStudentInput): Promise<ActionResult<{ student_id: string; profile_id: string }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  // 1. Create user in Supabase Auth
  const placeholderEmail = `${input.roll_number.toLowerCase()}@student.${institutionId}.invalid`;
  
  const { data: authUser, error: authErr } = await adminSupabase.auth.admin.createUser({
    email: placeholderEmail,
    password: 'tempPassword123!', // usually auto-generated or forced reset
    email_confirm: true,
    user_metadata: { role: 'student' }
  });

  if (authErr || !authUser.user) return { error: 'VALIDATION_ERROR', message: authErr?.message };
  const profileId = authUser.user.id;

  // 2. Insert into students table (id = profileId)
  const { error: studentErr } = await adminSupabase
    .from('students')
    .insert({
      id: profileId,
      full_name: input.full_name,
      roll_number: input.roll_number,
      date_of_birth: input.date_of_birth,
      level_id: input.level_id,
      cohort_id: input.cohort_id as unknown as string,
      institution_id: institutionId
    });

  if (studentErr) {
    await adminSupabase.auth.admin.deleteUser(profileId); // rollback auth
    return { error: 'DUPLICATE', message: 'Roll number may already exist' };
  }

  // 3. Insert into cohort_history if specified
  if (input.cohort_id) {
    await adminSupabase.from('cohort_history').insert({
      student_id: profileId,
      cohort_id: input.cohort_id,
      valid_from: new Date().toISOString()
    });
  }

  // 4. Activity Logs
  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'student',
    entity_id: profileId,
    action_type: 'CREATE_STUDENT'
  });

  return { ok: true, data: { student_id: profileId, profile_id: profileId } };
}

interface UpdateStudentInput {
  student_id: string;
  full_name?: string;
  level_id?: string;
  cohort_id?: string;
  status?: 'active' | 'suspended' | 'graduated';
  accessibility_flags?: Record<string, boolean>;
}

export async function updateStudent(input: UpdateStudentInput): Promise<ActionResult<{ updated: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  // Handle student update
  const { error: updateErr } = await supabase
    .from('students')
    .update({
      full_name: input.full_name,
      level_id: input.level_id,
      accessibility_flags: input.accessibility_flags
    })
    .eq('id', input.student_id)
    .eq('institution_id', institutionId);

  if (updateErr) return { error: 'VALIDATION_ERROR' };

  if (input.cohort_id) {
    // Check if cohort has changed. If so, close current and open new.
    await adminSupabase
      .from('cohort_history')
      .update({ valid_to: new Date().toISOString() })
      .eq('student_id', input.student_id)
      .is('valid_to', null);

    await adminSupabase.from('cohort_history').insert({
      student_id: input.student_id,
      cohort_id: input.cohort_id,
      valid_from: new Date().toISOString()
    });
  }

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'student',
    entity_id: input.student_id,
    action_type: 'UPDATE_STUDENT',
    metadata: { changes: input } as unknown as Record<string, string>
  });

  return { ok: true, data: { updated: true } };
}

interface DeactivateStudentInput {
  student_id: string;
  reason?: string;
}

export async function deactivateStudent(input: DeactivateStudentInput): Promise<ActionResult<{ deactivated: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', input.student_id)
    .eq('institution_id', institutionId);

  if (error) return { error: 'NOT_FOUND' };

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'student',
    entity_id: input.student_id,
    action_type: 'DEACTIVATE_STUDENT',
    metadata: { reason: input.reason || null }
  });

  return { ok: true, data: { deactivated: true } };
}
