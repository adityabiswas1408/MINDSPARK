# Feature Traces (`features/`)

This directory stores durable records for shipped features with non-obvious architecture or flows.

## Trace Template (`features/<slug>.md`)
```markdown
# Feature: <name>

**Shipped:** <YYYY-MM-DD>

## What it does
<user-facing functionality>

## How it works
<key non-obvious design decisions, state machines, or data flows>

## Verification
<end-to-end command or test verifying behavior>
```
