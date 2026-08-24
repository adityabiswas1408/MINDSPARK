# Example Takeover Brief — MERN Bootcamp Project

**This is a calibration example**, not a live task. It shows the level of specificity a real
Takeover Brief needs. It's drawn from a real request: a user's friend had built a MERN-stack
project as part of a 30-day program, some features had stopped working, and the UI looked
AI-generated. Don't act on this example against a real repository unless the user has actually
attached that project and confirmed they want the work done.

## Filled Takeover Brief

**1. Tech stack:** MongoDB, Express, React, Node (MERN), styled with Tailwind CSS. Explicitly
strict about this — no new frameworks or heavy libraries, because the project sits inside a
30-day program whose whole point is staying within basic MERN + Tailwind.

**2. Scope lock:**
- In scope: debug and fix every existing feature; verify login/auth works correctly; clean up
  the UI.
- Out of scope, explicitly: adding any new feature, removing any existing feature. Zero added,
  zero removed — this is the hard constraint the whole engagement is measured against.

**3. Feature parity requirement:** Yes, explicit — "every single feature must work exactly as
it was meant to be." Not "close enough," not "a reasonable approximation" — the original intent
of each feature is the target.

**4. Environment & credentials rule:** Use the existing credentials and `.env` values directly
from the codebase as they are. Do not overwrite them, do not regenerate them, do not lose them.

**5. Server/launch automation:** Build or update a `start-server.bat` file at the project root
that starts every required server (frontend dev server, backend/API server, and anything else
needed) concurrently with a single double-click/run, on Windows.

**6. UI/aesthetic tier:** A specific, carefully-drawn line rather than a vague "make it nicer":
- Should look like something a student handcrafted for a structured bootcamp project — neat,
  organized, clearly cared-for.
- Should explicitly **not** look like a polished enterprise/professional web app.
- Should also explicitly **not** look like generic AI-generated output — no purple glow
  gradients, no generic equal-width feature cards, no unearned gradients.
- In the tier language from `redesign-existing-projects`, this is **Tier 1 (Student/Bootcamp)**,
  not Tier 2 or Tier 3.

**7. Sibling skills to lean on:** the user asked explicitly for onboarding-style recon, legacy
style matching, systematic debugging, a student-tier UI redesign pass, an anti-bloat review, and
full verification before anything gets marked complete — which maps directly onto this skill's
own Phase 1 (recon, via `codebase-onboarding`/`inherit-legacy-style`), Phase 3 (`systematic-debugging`),
Phase 5 (`redesign-existing-projects`, Tier 1), and Phase 6 (`verification-before-completion`).

## Why this example is useful to read even if your real project is nothing like it

Notice what makes this brief *usable* rather than vague:

- The scope lock has a number attached ("0 features added, 0 features removed"), not just "don't
  change too much."
- The aesthetic ask names what to avoid as specifically as what to aim for — "not enterprise, but
  also not AI slop" only becomes actionable once you also ban purple glows and generic cards by
  name.
- The environment rule is stated as a rule, not assumed — "use the existing `.env` as-is" heads
  off the single most common way a takeover accidentally breaks a working project.
- The launch automation request names the exact filename and platform, so there's no ambiguity
  about what "done" looks like for that piece.

When intake (Phase 0) produces a brief this concrete for whatever project you're actually
working on — regardless of language or stack — the rest of this skill runs cleanly. When it
doesn't, that's the signal to go back and ask, not to fill the gaps with assumptions.
