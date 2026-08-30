---
name: design-rules
description: Use when writing any UI component, CSS, Tailwind class, or anything that touches colour, typography, or layout. Read design-system.html for all token values. Read docs/07_hifi-spec.md and docs/08_a11y.md for Phase 5 and beyond.
---

# MINDSPARK — Design System Rules

## Canonical source
design-system.html is Priority 4 for all colour values.
When any colour is needed: check design-system.html. Do not guess hex values.
Read docs/07_hifi-spec.md completely before building any UI component.

## Permitted colours (complete list)

Backgrounds:
  #F8FAFC   bg-page — page background, BOTH admin and student panels, no exceptions
  #FFFFFF   bg-card — cards, modals, sidebars

Brand:
  #1A3829   green-800 — primary CTA buttons, LIVE card border, selected states
  #204074   brand-navy — boot screen and login page ONLY, nowhere else
  #F57A39   brand-orange — progress bar on navy background ONLY

Text:
  #0F172A   text-primary — headings, flash numbers at 500ms or above (19.6:1 contrast on white)
  #475569   text-secondary — body copy, table cells
  #94A3B8   text-subtle — placeholder text and disabled labels only
  #991B1B   text-negative — NEGATIVE ARITHMETIC OPERANDS ONLY (9.7:1 AAA)
  #DC2626   text-danger — wrong answers, errors, validation failures, destructive actions
  #854D0E   text-warning — offline banner text, Disconnected row label

Semantic states:
  #DCFCE7 bg + #166534 text   success — correct answer, Submitted badge
  #FEF9C3 bg + #854D0E text   warning — offline banner, timer at 20% or below, Disconnected row
  #FEE2E2 bg + #DC2626 text   error — wrong-answer row, form validation error
  #EFF6FF bg + #1D4ED8 text   info — informational toasts and notices
  #EF4444 bg + #FFFFFF text   live badge — LIVE badge indicator ONLY

Flash Anzan contrast ramp (3 tiers — never mix tiers):
  Interval 500ms and above:   #FFFFFF bg, #0F172A text — 21:1 ratio, no fade
  Interval 300ms to 499ms:    #F8FAFC bg, #1E293B text — ~14:1 ratio, no fade
  Interval below 300ms:       #F1F5F9 bg, #334155 text — ~11:1 ratio, 30ms opacity fade on CONTAINER

Absolutely banned colours:
  #FF6B6B   fails WCAG AA (3.6:1 on white) — never use for anything
  #1A1A1A   banned everywhere without exception
  #E0E0E0   banned everywhere without exception
  #121212   banned as any background colour
  #FFD700   banned (v1 superseded design)

## Critical colour rule
#991B1B is for negative arithmetic numbers ONLY.
Wrong answers use #DC2626 text on #FEE2E2 background.
Error states use #DC2626 text on #FEE2E2 background.
Validation failures use #DC2626 text on #FEE2E2 background.
Destructive action buttons use #DC2626 text on #FEE2E2 background.
#991B1B in any of these contexts is wrong.

## Typography

Fonts (loaded via next/font/google — never CDN link):
  DM Sans   ALL UI text — headings, labels, body copy, buttons
  DM Mono   ALL numbers — timers, equations, scores, roll numbers, flash numbers, table values

DM Mono always pairs with:
  font-variant-numeric: tabular-nums
  This applies to every element that uses DM Mono without exception.

Banned fonts:
  Inter         banned UI font — was the original choice, replaced with DM Sans
  Roboto Mono   banned numeric font — replaced with DM Mono

## Touch targets (ages 6–18 — Fitts Law compliance)
MCQ option buttons:  minimum 64px × 64px
CTA buttons:         minimum 48px height
Standard buttons:    minimum 40px height

## Accessibility — WCAG 2.2 AAA
Target level is AAA, not AA.
All axe-playwright scans use: wcag2a, wcag2aa, wcag21aa, wcag21aaa, wcag22aa
aria-live="polite" on exam timer — announcements at 5 minutes remaining and 1 minute remaining only
aria-hidden="true" on flash number element during PHASE_2_FLASH
SRAnnouncerRef must use React.forwardRef — without it useImperativeHandle silently does nothing

## Flash number CSS — absolute rule
.flash-number { transition: none !important; }
Any CSS transition on .flash-number causes retinal ghosting.
The 30ms opacity fade during interval below 300ms belongs on the CONTAINER wrapper element.
Never put any transition property on .flash-number itself.

## navigator style — UNMOUNTED not hidden
CORRECT: {phase !== 'PHASE_2_FLASH' && <Navigator/>}
WRONG:   <Navigator style={{ display: phase === 'PHASE_2_FLASH' ? 'none' : 'block' }}/>

Hidden components stay in DOM and cause peripheral visual artifacts during the flash sequence.
The Navigator must be truly absent from the DOM during PHASE_2_FLASH and PHASE_3_MCQ.

## Student routes — plural
/student/exams    not /student/exam
/student/tests    not /student/test
Singular forms return 404 on all student assessment listings.

## Admin monitor route
/admin/monitor/[id]    not /admin/live-monitor/[id]
The live- prefix does not exist. Wrong path returns 404 during live incidents.

## Metronome — Web Audio API only
880Hz sine wave, 80ms duration, 3 beats at t=500ms, t=1000ms, t=1500ms
No MP3 file. No network dependency. Pure Web Audio API.
