# Worked Examples

Concrete before/after patterns for each principle in `SKILL.md`. Read the section you need, not the whole file.

## Contents
1. [Surface assumptions](#1-surface-assumptions)
2. [Simplicity first](#2-simplicity-first)
3. [Surgical changes](#3-surgical-changes)
4. [Define success criteria, then loop](#4-define-success-criteria-then-loop)
5. [Anti-pattern summary](#anti-pattern-summary)

---

## 1. Surface assumptions

### Hidden scope

**Request:** "Add a feature to export user data."

**Weak:** silently picks a format, a field list, and "all users," then ships an `export_users()` that hardcodes JSON/CSV, writes to a local file, and dumps every field including ones that might be sensitive.

**Better:**
```
Before implementing, I need to clarify:
1. Scope: all users, or a filtered subset? (privacy implications)
2. Delivery: download in-browser, background job + email, or API endpoint?
3. Fields: which ones? Some may be sensitive.
4. Volume: roughly how many users? (affects approach)

Simplest version: an API endpoint returning paginated JSON.
File-based export needs more info first. What's your preference?
```

### Multiple interpretations

**Request:** "Make the search faster."

**Weak:** silently adds caching, indexes, and async processing all at once -- 200 lines of optimization for a "faster" that was never defined.

**Better:**
```
"Faster" could mean:
1. Lower response time (<100ms vs. current ~500ms) -- add indexes + caching, ~2h
2. Higher throughput (more concurrent searches) -- async + pooling, ~4h
3. Faster perceived speed -- progressive/partial results, ~3h

Which matters most for your use case?
```

---

## 2. Simplicity first

### Over-abstraction

**Request:** "Add a function to calculate discount."

**Weak:** an `ABC`-based `DiscountStrategy` hierarchy, a `DiscountConfig` dataclass, and a `DiscountCalculator` class -- 30+ lines of setup for a single multiplication.

**Better:**
```python
def calculate_discount(amount: float, percent: float) -> float:
    """percent should be 0-100."""
    return amount * (percent / 100)
```
Add strategy classes later, only when a second discount type is actually needed.

### Speculative features

**Request:** "Save user preferences to database."

**Weak:** a `PreferenceManager` with optional cache, validator, merge flag, and a notification hook nobody asked for.

**Better:**
```python
def save_preferences(db, user_id: int, preferences: dict):
    db.execute(
        "UPDATE users SET preferences = ? WHERE id = ?",
        (json.dumps(preferences), user_id)
    )
```
Add caching when performance actually matters, validation when bad data actually shows up, merging when the requirement actually emerges -- not before.

---

## 3. Surgical changes

### Drive-by refactor

**Request:** "Fix the bug where empty emails crash the validator."

**Weak diff:** rewrites the whole function -- adds a docstring, changes comments, adds username-length and alphanumeric checks nobody asked for, "improves" email validation beyond the reported bug.

**Better diff:** touches only the lines needed to handle an empty/whitespace email string before the bug check runs. Username validation, comments, and docstrings are untouched because they weren't broken.

### Style drift

**Request:** "Add logging to the upload function."

**Weak diff:** adds logging, but also converts single quotes to double quotes, adds type hints, adds a docstring, reformats whitespace, and changes the boolean return logic -- none of which was requested.

**Better diff:** adds a logger and three `logger.info`/`logger.error`/`logger.exception` calls, keeps the existing single-quote style, no type hints, same boolean pattern, same spacing. Every added line is a logging call; nothing else moved.

---

## 4. Define success criteria, then loop

### Vague vs. verifiable

**Request:** "Fix the authentication system."

**Weak:** "I'll review the code, identify issues, make improvements, and test the changes" -- then starts editing without a defined target.

**Better:**
```
"Fix authentication" needs a specific target. If the issue is
"users stay logged in after a password change":

1. Write a test: change password -> assert old session is invalidated
   verify: test fails (reproduces the bug)
2. Invalidate sessions on password change
   verify: test passes
3. Check edge cases: multiple active sessions, concurrent changes
   verify: additional tests pass
4. Run full auth test suite
   verify: no regressions

What's the specific symptom you're seeing?
```

### Multi-step with verification

**Request:** "Add rate limiting to the API."

**Weak:** implements Redis-backed rate limiting, multiple strategies, a config system, and monitoring in one 300-line commit with no way to check any single piece independently.

**Better:**
```
1. In-memory rate limiting, single endpoint
   verify: 100 requests -> first 10 succeed, rest get 429
2. Extract to middleware, apply to all endpoints
   verify: existing endpoint tests still pass; new endpoints also limited
3. Redis backend (multi-server)
   verify: limit persists across restart; two instances share the counter
4. Per-endpoint configuration
   verify: /search allows 10/min, /users allows 100/min

Each step ships independently. Start with step 1?
```

### Reproduce before fixing

**Request:** "The sorting breaks when there are duplicate scores."

**Weak:** immediately rewrites the sort key without confirming what's actually wrong.

**Better:**
```python
# 1. Reproduce first
def test_sort_with_duplicate_scores():
    scores = [{'name': 'Alice', 'score': 100},
              {'name': 'Bob', 'score': 100},
              {'name': 'Charlie', 'score': 90}]
    result = sort_scores(scores)
    assert result[0]['score'] == 100
    assert result[1]['score'] == 100
    assert result[2]['score'] == 90
# Run several times -> order for the tied pair is inconsistent. Confirmed.

# 2. Now fix, with a stable tiebreaker
def sort_scores(scores):
    return sorted(scores, key=lambda x: (-x['score'], x['name']))
# Verify: test passes consistently across repeated runs.
```

### Executed vs. described verification

**Request:** "Check whether this function handles a negative input correctly."

**Weak:** "Looking at the code, if `n` is negative the `while n > 0` loop is skipped, so it should return `0` correctly." -- never actually run, just reasoned about.

**Better:** write the function to the sandbox, call it with `n = -5`, and show the real return value in the output. If it's wrong, the actual traceback or wrong value is now in front of the user instead of a guess about what "should" happen. This matters more in a chat sandbox than in an editor with a live debugger already open -- executing is the only way to turn a claim into evidence here.

---

## Anti-pattern summary

| Principle | Anti-pattern | Fix |
|---|---|---|
| Surface assumptions | Silently assumes file format, fields, scope | List assumptions explicitly; ask only if the fork is costly |
| Simplicity first | Strategy pattern for one discount calculation | One function until complexity is actually needed |
| Surgical changes | Reformats quotes, adds type hints while fixing an unrelated bug | Only change lines that trace to the request |
| Verifiable execution | "I'll review and improve the code" | "Write a test for bug X, make it pass, verify no regressions" |

**Underlying idea:** none of the "weak" versions above are wrong in isolation -- they follow real patterns and practices. The problem is timing: complexity added before it's needed is harder to review, more likely to hide bugs, and slower to build than the simple version would have been. Complexity earned by an actual second use case is a different thing entirely.
