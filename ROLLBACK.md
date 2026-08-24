# Rollback

## Vercel Frontend Deployment Rollback
**How to undo:**
1. Open the Vercel Dashboard for `mindspark-one`.
2. Navigate to **Deployments** -> select the previous stable deployment.
3. Click the three dots menu -> select **Instant Rollback**.
4. Alternatively via CLI: `vercel rollback <deployment-url>`.
**How to confirm it worked:**
- Request `https://mindspark-one.vercel.app/login` and verify HTTP 200 with correct assets.

## Database Migration Rollback
**How to undo:**
1. Remote Supabase instance `ahrnkwuqlhmwenhvnupb` maintains 27 sequential migrations.
2. Locate the offending migration in `supabase/migrations/`.
3. Formulate the inverse DDL (`DROP TABLE`, `DROP VIEW`, `ALTER TABLE ... DROP COLUMN`).
4. Execute the rollback SQL in the Supabase SQL Editor.
**How to confirm it worked:**
- Query `information_schema.columns` or `information_schema.tables` in Supabase SQL editor to verify restored table structure.

## Client-Side Dexie / IndexedDB Schema Rollback
**How to undo:**
1. Increment the database version in `src/lib/offline/indexed-db-store.ts` and provide an explicit upgrade/downgrade migration handler.
2. For catastrophic client storage corruption, dispatch `Dexie.delete('mindspark_offline_db')` to trigger clean client re-initialization.
**How to confirm it worked:**
- Open DevTools -> Application -> Storage -> IndexedDB -> verify `mindspark_offline_db` opens with valid object stores.
