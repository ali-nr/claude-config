# Root Cause Protocol

**Surface fixes = debt. Root cause fixes = investment.**

## Forbidden Fixes

| Symptom | BANNED | REQUIRED |
|---------|--------|----------|
| Slow loading | Skeleton/spinner | Optimize the slow query |
| Stale data | Frontend cache | Fix data source |
| API timeout | Retry logic | Find why API is slow |
| Wrong display | UI fallback | Fix data corruption source |
| Intermittent failure | Error boundary | Find the race condition |

## Mental Translation

"Fix X" → "Find root cause of X"

- "Fix slow table" → Find what makes it slow
- "Add caching" → Why is this slow enough to need caching?

## When Surface Fixes Are Acceptable

Only when:
1. Root cause is in external code you cannot modify
2. You've documented WHY root cause can't be addressed
3. User explicitly approves the trade-off