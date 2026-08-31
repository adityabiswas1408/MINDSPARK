

-- 1. Read (Subscribe) Access
-- Admins/Teachers can subscribe to exam:* and lobby:* for their institution.
-- Students can subscribe to lobby:* for their institution (needed for presence).
CREATE POLICY "Authorize channel subscriptions"
ON realtime.messages FOR SELECT
TO authenticated
USING (
  (
    topic LIKE 'exam:%' AND EXISTS (
      SELECT 1 FROM public.exam_papers ep
      JOIN public.profiles p ON p.institution_id = ep.institution_id
      WHERE ep.id = (split_part(realtime.messages.topic, ':', 2))::uuid
      AND p.id = auth.uid()
      AND p.role IN ('admin', 'teacher')
    )
  )
  OR
  (
    topic LIKE 'lobby:%' AND EXISTS (
      SELECT 1 FROM public.exam_papers ep
      JOIN public.profiles p ON p.institution_id = ep.institution_id
      WHERE ep.id = (split_part(realtime.messages.topic, ':', 2))::uuid
      AND p.id = auth.uid()
    )
  )
);

-- 2. Write (Publish) Access
-- No authenticated user can insert to exam:* (server-side only via service_role).
-- Authenticated users (students/admins) can insert to lobby:* (only for presence).
CREATE POLICY "Authorize channel publishes"
ON realtime.messages FOR INSERT
TO authenticated
WITH CHECK (
  topic LIKE 'lobby:%' AND extension = 'presence' AND EXISTS (
    SELECT 1 FROM public.exam_papers ep
    JOIN public.profiles p ON p.institution_id = ep.institution_id
    WHERE ep.id = (split_part(realtime.messages.topic, ':', 2))::uuid
    AND p.id = auth.uid()
  )
);
