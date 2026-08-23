# Rollback & Recovery Procedures

> Safe rollback, failure recovery, and state preservation protocols for MINDSPARK.

---

## 1. Branch Strategy (Branch-Per-Phase)
- Every phase operates on a dedicated working branch: `phase-<N>-<slug>` (e.g., `phase-1-2-recon-audit`).
- Work is committed locally in small, logical chunks.
- Never commit broken TypeScript or failing tests to `main`.

---

## 2. Safety Tagging Before High-Risk Subsystems
- Before modifying **Timing Engine** (`src/lib/anzan/`), **Anti-Cheat** (`src/lib/anticheat/`), or **Auth & RBAC** (`src/lib/auth/`, `src/lib/supabase/`), create a git safety tag:
  ```bash
  git tag -a pre-<subsystem>-edit -m "Safe checkpoint before <subsystem> changes"
  ```

---

## 3. Fast Revert on Build or Test Failures
If `npm run tsc` or `npm run test` fails after an edit and cannot be fixed with a clean surgical diff:
1. Revert dirty working tree changes:
   ```bash
   git restore <modified-files>
   ```
2. Or reset uncommitted changes back to phase start:
   ```bash
   git reset --hard HEAD
   ```
3. Re-run `npm run tsc && npm run test` to verify return to green baseline.

---

## 4. Database Migration Invariance
- As confirmed by the Step C git history audit (27 additive migrations, 0 deletions), database changes must **never** edit or drop existing applied migrations.
- If a schema alteration is needed, create a new numbered migration file `supabase/migrations/<next_number>_<description>.sql`.
- In case of local migration failure: rollback using downward migration scripts or restore from the remote database schema snapshot.

---

## 5. Environment & Credentials Protection
- Before and after every session, check `.env.local` status:
  ```bash
  git status --ignored
  ```
- If `.env.local` or environment keys are accidentally modified, restore from `.env.example` or backup without exposing secrets in git commits.
