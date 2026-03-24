'use server';

import { createClient } from '@/lib/supabase/server';
import { requireRole } from '@/lib/auth/rbac';
import { ActionResult } from '@/lib/types/action-result';
import { adminSupabase } from '@/lib/supabase/admin';
import sanitizeHtml from 'sanitize-html';

interface CreateAnnouncementInput {
  title:            string;
  body_html:        string;
  target_level_id?: string;
  publish_now:      boolean;
}

interface CreateAnnouncementOutput {
  announcement_id: string;
  published_at:    string | null;
}

export async function createAnnouncement(input: CreateAnnouncementInput): Promise<ActionResult<CreateAnnouncementOutput>> {
  const authResult = await requireRole('admin');
  if ('error' in authResult) return { error: authResult.error as unknown as 'UNAUTHORIZED', message: authResult.message };
  const { userId, institutionId } = authResult;

  if (!input.title || input.title.trim() === '') {
    return { error: 'VALIDATION_ERROR', message: 'Title is required' };
  }

  const cleanHtml = sanitizeHtml(input.body_html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3', 'p', 'span']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      'img': ['src', 'alt', 'width', 'height'],
      '*': ['style', 'class']
    }
  });

  if (!cleanHtml || cleanHtml.trim() === '') {
    return { error: 'VALIDATION_ERROR', message: 'Body is empty after sanitization' };
  }

  const supabase = await createClient();

  // verify level exists if provided
  if (input.target_level_id) {
    const { data: level } = await supabase
      .from('levels')
      .select('id')
      .eq('id', input.target_level_id)
      .eq('institution_id', institutionId)
      .single();
    if (!level) return { error: 'NOT_FOUND', message: 'Level not found' };
  }

  const publishedAt = input.publish_now ? new Date().toISOString() : null;

  const { data: announcement, error } = await adminSupabase.from('announcements').insert({
    institution_id: institutionId,
    title: input.title,
    body_html: cleanHtml,
    content: cleanHtml.replace(/<[^>]*>?/gm, ''), // Stripped version for `content`
    target_level_id: input.target_level_id || null,
    published_at: publishedAt,
    target_audience: ['student', 'teacher'], // or derived
    created_by: userId
  }).select('id').single();

  if (error || !announcement) return { error: 'INTERNAL_ERROR', message: error?.message || 'Insert failed' };

  await adminSupabase.from('activity_logs').insert({
    user_id: userId,
    institution_id: institutionId,
    entity_type: 'announcements',
    entity_id: announcement.id,
    action_type: 'CREATE_ANNOUNCEMENT'
  });

  return { ok: true, data: { announcement_id: announcement.id, published_at: publishedAt } };
}
