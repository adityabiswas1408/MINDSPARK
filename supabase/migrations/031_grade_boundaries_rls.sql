-- Add RLS policies for grade_boundaries

-- Policy 1: Admins can manage grade boundaries for their institution
CREATE POLICY "Admins manage grade boundaries" ON grade_boundaries
  FOR ALL
  TO public
  USING (
    ((auth.jwt() -> 'app_metadata') ->> 'role') = 'admin' AND
    institution_id = (((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
  );
