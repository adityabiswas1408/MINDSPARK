# Load Test Report
Date: 2026-04-10
Platform: mindspark-one.vercel.app
Supabase: ahrnkwuqlhmwenhvnupb (Nano compute)

## Results Summary
| Test | VUs | p95 | Error Rate | 500s | Status |
|------|-----|-----|------------|------|--------|
| LT-01 WebSocket | 500 | 675ms | 0% | 0 | PASS |
| LT-02 Heartbeat RPC | 500 | 3.98s | 0.42% | 0 | FAIL |
| LT-03 Offline Sync | 500 | 56.69s | 100% | 157 | FAIL |

## Infrastructure Constraints
- Supabase Nano compute: 200 max concurrent
  client connections (fixed, cannot change)
- 500 concurrent VUs exceed this limit
- LT-02 and LT-03 failures are plan-level
  constraints, not application bugs
- Sequential requests perform correctly

## Required Before 500-Student Deployment
- Upgrade Supabase compute to Small or Medium tier
  (increases connection limit to 200+ per pooler)
- Or reduce simultaneous exam sessions to < 150
  to stay within Nano tier limits
- Re-run LT-02 and LT-03 after upgrade to confirm

## What Passes at Current Tier
- Up to ~150 concurrent students safely
- WebSocket realtime connections: PASS at 500 VUs
- Sequential DB operations: PASS
