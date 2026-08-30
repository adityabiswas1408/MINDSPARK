-- ==============================================================================
-- P2/P2b: FIX GLOBAL READ LEAKS ON OPERATIONAL DATA
-- Drop bare USING (true) SELECT policies and replace them with strict 
-- institution scoping.
-- ==============================================================================

-- 1. LEVELS
DROP POLICY IF EXISTS "Read levels" ON levels;
CREATE POLICY "Read levels" ON levels 
FOR SELECT USING (
  institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
);

-- 2. COHORTS
DROP POLICY IF EXISTS "Read cohorts" ON cohorts;
CREATE POLICY "Read cohorts" ON cohorts 
FOR SELECT USING (
  institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
);

-- 3. ASSESSMENT SESSIONS (joined through cohorts)
DROP POLICY IF EXISTS "Read sessions" ON assessment_sessions;
CREATE POLICY "Read sessions" ON assessment_sessions 
FOR SELECT USING (
  cohort_id IN (SELECT id FROM cohorts WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid)
);

-- 4. ASSESSMENT SESSION QUESTIONS (joined through assessment_sessions -> cohorts)
DROP POLICY IF EXISTS "Read session questions" ON assessment_session_questions;
CREATE POLICY "Read session questions" ON assessment_session_questions 
FOR SELECT USING (
  session_id IN (
    SELECT id FROM assessment_sessions WHERE cohort_id IN (
      SELECT id FROM cohorts WHERE institution_id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
    )
  )
);

-- 5. INSTITUTIONS (P2b Fix - Scoped Read)
-- We explicitly restrict institutions to the user's own institution ID.
-- We confirmed via `session.ts` and `settings/page.tsx` that normal client queries
-- only fetch the user's *own* institution row (via profile.institution_id), so this
-- strict isolation matches actual operational use without needing a public view.
DROP POLICY IF EXISTS "Everyone can view institutions" ON institutions;
CREATE POLICY "Users read own institution" ON institutions
FOR SELECT USING (
  id = ((auth.jwt() -> 'app_metadata') ->> 'institution_id')::uuid
);
