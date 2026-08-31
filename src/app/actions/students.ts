'use server';

import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';
import { z } from 'zod';

const ImportStudentsCSVSchema = z.object({
  csv_raw: z.string(),
  level_id: z.string().uuid(),
  cohort_id: z.string().uuid().optional(),
  dry_run: z.boolean(),
});
export type ImportStudentsCSVInput = z.infer<typeof ImportStudentsCSVSchema>;

interface ImportStudentsCSVOutput {
  inserted: number;
  skipped: number;
  errors: Array<{ row: number; reason: string }>;
}

export async function importStudentsCSV(input: ImportStudentsCSVInput): Promise<ActionResult<ImportStudentsCSVOutput>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error, message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = ImportStudentsCSVSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  // Enforce 500 rows limit
  const lines = validData.csv_raw.trim().split('\n');
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
        dob: parts[2] || null
      };
    })
    .filter(s => s.roll_number && s.full_name);

  // 1. Gate: Check for duplicate roll numbers
  const rollNumbers = p_students.map(s => s.roll_number);
  const { data: existing } = await adminSupabase
    .from('students')
    .select('roll_number')
    .eq('institution_id', institutionId)
    .in('roll_number', rollNumbers);

  const existingRollNumbers = new Set((existing || []).map(s => s.roll_number));
  
  const toInsert: (typeof p_students[0] & { auth_user_id: string, original_idx: number })[] = [];
  const errors: ImportStudentsCSVOutput['errors'] = [];
  let skipped = 0;

  const validStudents = p_students.map((s, idx) => ({ ...s, original_idx: idx }));

  for (const s of validStudents) {
    if (existingRollNumbers.has(s.roll_number)) {
      skipped++;
      errors.push({ row: s.original_idx + 2, reason: 'Roll number already exists in this institution' });
    } else {
      if (validData.dry_run) {
        toInsert.push({ ...s, auth_user_id: '' });
      } else {
        const placeholderEmail = `${s.roll_number.toLowerCase()}@student.${institutionId}.invalid`;
        const initialPassword = randomUUID().replace(/-/g, '') + '!Ab1';

        const { data: authUser, error: authErr } = await adminSupabase.auth.admin.createUser({
          email: placeholderEmail,
          password: initialPassword,
          email_confirm: true,
          user_metadata: { role: 'student' }
        });

        if (authErr || !authUser.user) {
          skipped++;
          errors.push({ row: s.original_idx + 2, reason: 'Failed to create auth user: ' + (authErr?.message || 'Unknown') });
        } else {
          toInsert.push({ ...s, auth_user_id: authUser.user.id });
        }
      }
    }
  }

  if (validData.dry_run) {
    return { ok: true, data: { inserted: toInsert.length, skipped, errors } };
  }

  if (toInsert.length === 0) {
    return { ok: true, data: { inserted: 0, skipped, errors } };
  }

  const { data, error } = await supabase.rpc('bulk_import_students', {
    p_institution_id: institutionId,
    p_level_id: validData.level_id,
    p_cohort_id: validData.cohort_id ?? '',
    p_rows: toInsert
  });

  if (error) {
    for (const s of toInsert) {
      await adminSupabase.auth.admin.deleteUser(s.auth_user_id);
    }
    return { error: 'INTERNAL_ERROR', message: 'Bulk import failed.' };
  }

  const rpcResult = data as unknown as { inserted: number; skipped: number; errors: any[] };
  
  if (rpcResult.errors && rpcResult.errors.length > 0) {
    const failedRollNumbers = new Set(rpcResult.errors.map(e => e.roll_number));
    for (const s of toInsert) {
      if (failedRollNumbers.has(s.roll_number)) {
        await adminSupabase.auth.admin.deleteUser(s.auth_user_id);
      }
    }
  }

  const rpcErrorsFormatted = rpcResult.errors.map(e => {
    const orig = toInsert.find(s => s.roll_number === e.roll_number);
    return {
      row: orig ? orig.original_idx + 2 : 0,
      reason: e.reason
    };
  });

  const result: ImportStudentsCSVOutput = {
    inserted: rpcResult.inserted,
    skipped: skipped + rpcResult.skipped,
    errors: [...errors, ...rpcErrorsFormatted]
  };

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

const CreateStudentSchema = z.object({
  roll_number: z.string().min(1),
  full_name: z.string().min(1),
  date_of_birth: z.string().nullable().optional(),
  level_id: z.string().uuid(),
  cohort_id: z.string().uuid().optional(),
  send_invite: z.boolean().optional(),
});
export type CreateStudentInput = z.infer<typeof CreateStudentSchema>;

export async function createStudent(input: CreateStudentInput): Promise<ActionResult<{ student_id: string }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = CreateStudentSchema.safeParse(input);
  if (!parsed.success) {
    console.error("ZOD ERROR:", parsed.error);
    return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  }
  const validData = parsed.data;

  const supabase = await createClient();

  // 1. Gate: Check for duplicate roll number before doing anything
  const { data: existing } = await adminSupabase
    .from('students')
    .select('id')
    .eq('institution_id', institutionId)
    .eq('roll_number', validData.roll_number)
    .maybeSingle();

  if (existing) {
    return { error: 'DUPLICATE', message: 'Roll number already exists in this institution' };
  }

  // 2. Create user in Supabase Auth
  const placeholderEmail = `${validData.roll_number.toLowerCase()}@student.${institutionId}.invalid`;
  
  // Cryptographically-random initial password. Admin can subsequently
  // reset via resetPassword() to hand off a new temp password to the
  // student. Never log this value.
  const initialPassword = randomUUID().replace(/-/g, '') + '!Ab1';

  const { data: authUser, error: authErr } = await adminSupabase.auth.admin.createUser({
    email: placeholderEmail,
    password: initialPassword,
    email_confirm: true,
    user_metadata: { role: 'student' }
  });

  if (authErr || !authUser.user) return { error: 'VALIDATION_ERROR', message: authErr?.message };
  const profileId = authUser.user.id;

  // 2.5 Insert into profiles table
  const { error: profileErr } = await adminSupabase
    .from('profiles')
    .insert({
      id: profileId,
      institution_id: institutionId,
      role: 'student',
      email: placeholderEmail,
      full_name: validData.full_name
    });

  if (profileErr) {
    await adminSupabase.auth.admin.deleteUser(profileId);
    return { error: 'INTERNAL_ERROR', message: `Failed to create profile: ${profileErr.message}` };
  }

  // 3. Insert into students table (id = profileId)
  const { error: studentErr } = await adminSupabase
    .from('students')
    .insert({
      id: profileId,
      full_name: validData.full_name,
      roll_number: validData.roll_number,
      date_of_birth: validData.date_of_birth,
      level_id: validData.level_id,
      cohort_id: validData.cohort_id as unknown as string,
      institution_id: institutionId
    });

  if (studentErr) {
    await adminSupabase.auth.admin.deleteUser(profileId); // cascade deletes profiles row too
    return { error: 'INTERNAL_ERROR', message: 'Failed to create student.' };
  }

  // 3. Insert into cohort_history if specified
  if (validData.cohort_id) {
    await adminSupabase.from('cohort_history').insert({
      student_id: profileId,
      cohort_id: validData.cohort_id,
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

  return { ok: true, data: { student_id: profileId } };
}

const UpdateStudentSchema = z.object({
  id: z.string().uuid(),
  roll_number: z.string().optional(),
  full_name: z.string().optional(),
  date_of_birth: z.string().nullable().optional(),
  level_id: z.string().uuid().optional(),
  cohort_id: z.string().uuid().nullable().optional(),
});
export type UpdateStudentInput = z.infer<typeof UpdateStudentSchema>;

export async function updateStudent(input: UpdateStudentInput): Promise<ActionResult<null>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = UpdateStudentSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  const supabase = await createClient();

  // Handle student update
  const { error: updateErr } = await supabase
    .from('students')
    .update({
      full_name: validData.full_name,
      level_id: validData.level_id
    })
    .eq('id', validData.id)
    .eq('institution_id', institutionId);

  if (updateErr) return { error: 'VALIDATION_ERROR' };

  if (validData.cohort_id !== undefined) {
    // Check if cohort has changed. If so, close current and open new.
    await adminSupabase
      .from('cohort_history')
      .update({ valid_to: new Date().toISOString() })
      .eq('student_id', validData.id)
      .is('valid_to', null);

    if (validData.cohort_id !== null) {
      await adminSupabase.from('cohort_history').insert({
        student_id: validData.id,
        cohort_id: validData.cohort_id,
        valid_from: new Date().toISOString()
      });
    }
  }

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'student',
    entity_id: validData.id,
    action_type: 'UPDATE_STUDENT',
    metadata: { changes: validData } as unknown as Record<string, string>
  });

  return { ok: true, data: null };
}

const DeactivateStudentSchema = z.object({
  student_id: z.string().uuid(),
  reason: z.string().optional(),
});
export type DeactivateStudentInput = z.infer<typeof DeactivateStudentSchema>;

export async function deactivateStudent(input: DeactivateStudentInput): Promise<ActionResult<{ deactivated: true }>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  const parsed = DeactivateStudentSchema.safeParse(input);
  if (!parsed.success) return { error: 'VALIDATION_ERROR', message: 'Invalid input' };
  const validData = parsed.data;

  const supabase = await createClient();

  const { error } = await supabase
    .from('students')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', validData.student_id)
    .eq('institution_id', institutionId);

  if (error) return { error: 'NOT_FOUND' };

  await supabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'student',
    entity_id: validData.student_id,
    action_type: 'DEACTIVATE_STUDENT',
    metadata: { reason: validData.reason || null }
  });

  return { ok: true, data: { deactivated: true } };
}
