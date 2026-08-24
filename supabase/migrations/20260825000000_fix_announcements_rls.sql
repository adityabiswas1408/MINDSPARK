-- Drop the old insecure policies
DROP POLICY IF EXISTS "Read announcements" ON announcements;
DROP POLICY IF EXISTS "Admins manage announcements" ON announcements;

-- 1. Everyone can read announcements within their own institution
CREATE POLICY "Read announcements" ON announcements
FOR SELECT
USING (
  ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid = institution_id
);

-- 2. Admins can manage all announcements within their own institution
CREATE POLICY "Admins manage announcements" ON announcements
FOR ALL
USING (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'admin') AND
  (((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid = institution_id)
);

-- 3. Teachers can insert announcements for their own institution
-- (SELECT is already covered by policy #1 above)
CREATE POLICY "Teachers insert announcements" ON announcements
FOR INSERT
WITH CHECK (
  ((auth.jwt() -> 'app_metadata') ->> 'role' = 'teacher') AND
  (((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid = institution_id)
);
