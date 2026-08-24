# Redesign Protocol & Dark Mode Reference

> Extracted from the main SKILL.md. Read this file when working on site redesigns or implementing dark mode.

---

## Dark Mode Protocol (Section 8)

Dual-mode by default. Never assume light-only unless the brief is print-emulating editorial.

### Token Strategy (pick one, stick to it)
* **Tailwind `dark:` variant** (default for utility-first): every color utility paired with its dark variant.
* **CSS variables** (for shadcn/ui, Radix Themes, or component libraries with theming): define semantic tokens and swap values.

### Rules
* **Do Not Prescribe Specific Colors.** The brief and brand decide. This skill enforces only:
  - **Contrast** - WCAG AA minimum for body, AAA target for hero copy.
  - **Hierarchy parity** - visual hierarchy that works in light must work in dark.
  - **Brand fidelity** - primary brand color stays recognisable.
  - **No pure `#000000` and no pure `#ffffff`** - use off-black and off-white.
* Respect `prefers-color-scheme` unless the brand insists.
* **Test in both modes before finishing.**

---

## Redesign Protocol (Section 11)

### Detect the Mode (first action)
* **Greenfield** - no existing site, or full overhaul approved.
* **Redesign - Preserve** - modernise without breaking the brand. Audit first.
* **Redesign - Overhaul** - new visual language on top of existing content.

If ambiguous, ask once: "Should this redesign preserve the existing brand, or are we starting visually from scratch?"

### Audit Before Touching
Document the current state:
* Brand tokens - colors, type stack, logo treatment, radii.
* Information architecture - page tree, primary nav, key conversion paths.
* Content blocks - what exists, what's doing work, what's filler.
* Patterns to preserve - signature interactions, recognisable hero, copy voice.
* Patterns to retire - AI-slop tells, broken layouts, dead links.
* Dial reading of the existing site.
* SEO baseline - current ranking pages, meta titles, structured data.

### Preservation Rules
* Do not change information architecture unless asked.
* Extract brand colors before applying palette rules.
* Preserve copy voice unless asked for a rewrite.
* Honor existing accessibility wins.
* Respect existing analytics events.

### Modernisation Levers (priority order)
1. Typography refresh - biggest visual lift per unit of risk.
2. Spacing & rhythm - increase section padding, fix vertical rhythm.
3. Color recalibration - desaturate, unify neutrals, keep brand accent.
4. Motion layer - add appropriate micro-interactions.
5. Hero & key-section recomposition.
6. Full block replacement - only when unsalvageable.

### Decision Tree
* IA, content, and SEO sound → **targeted evolution** (Levers 1-4).
* Visual debt is structural → **full redesign** with strict content preservation.
* Brand itself is changing → **greenfield**.

### What Never Changes Silently
* URL structure / route slugs.
* Primary nav labels.
* Form field names or order.
* Brand logo or wordmark.
* Existing legal / consent / cookie copy.
