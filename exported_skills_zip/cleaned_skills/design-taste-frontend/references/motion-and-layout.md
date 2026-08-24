# Motion, Layout & Proactivity Reference

> Extracted from the main SKILL.md. Read this file when implementing animations, scroll interactions, GSAP patterns, or layout decisions.

---

## Layout Diversification (Section 4.3)

* **ANTI-CENTER BIAS:** Centered Hero / H1 sections are avoided when `DESIGN_VARIANCE > 4`. Force split-screen, asymmetric, or scroll-pinned structures.
* **Override:** centered hero is OK for editorial / manifesto / launch-announcement briefs.

## Materiality, Shadows, Cards (Section 4.4)

* Use cards ONLY when elevation communicates real hierarchy.
* Tint shadows to the background hue. No pure-black drop shadows.
* **SHAPE CONSISTENCY LOCK (mandatory):** Pick ONE corner-radius scale and stick to it.

## Layout Discipline - Hard Rules (Section 4.7)

* **Hero MUST fit initial viewport.** Headline max 2 lines, subtext max 20 words, CTAs visible without scroll.
* **Hero font-scale discipline.** Default: `text-4xl md:text-5xl lg:text-6xl` for most heroes; `text-6xl md:text-7xl` only when 3-5 word headlines.
* **HERO TOP PADDING CAP:** Max `pt-24` at desktop.
* **HERO STACK DISCIPLINE:** Max 4 text elements (eyebrow/brand, headline, subtext, CTAs).
* **"Used by" logo wall belongs UNDER the hero, never inside it.**
* **Navigation on single line, height cap 80px max.**
* **Bento grids must have rhythm.** Vary composition. EXACTLY as many cells as content items.
* **Section-Layout-Repetition Ban:** At least 4 different layout families across 8 sections.
* **ZIGZAG ALTERNATION CAP:** Max 2 consecutive image+text-split sections.
* **EYEBROW RESTRAINT:** Maximum 1 eyebrow per 3 sections.
* **Split-Header Ban:** No "left big headline + right small explainer" pattern. Stack vertically instead.
* **Bento Background Diversity:** At least 2-3 cells need real visual variation.
* **Mobile collapse must be explicit per section.**

---

## Context-Aware Proactivity (Section 5)

* **Liquid Glass / Glassmorphism:** For premium consumer, Apple-adjacent, luxury. Go beyond `backdrop-blur`: add 1px inner border + subtle inner shadow.
* **Magnetic Micro-physics:** Use when `MOTION_INTENSITY > 5`. Implement with Motion's `useMotionValue`.
* **Perpetual Micro-Interactions:** Use when `MOTION_INTENSITY > 5` AND section benefits from motion.
* **"Motion claimed, motion shown."** If `MOTION_INTENSITY > 4`, the page must actually move.
* **MOTION MUST BE MOTIVATED:** Every animation needs a reason: hierarchy, storytelling, feedback, or state transition.
* **MARQUEE MAX-ONE-PER-PAGE.**

### Sticky-Stack - Canonical Skeleton (Section 5.A)

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function StickyStack({ cards }: { cards: React.ReactNode[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !ref.current) return;
    const ctx = gsap.context(() => {
      const cardEls = gsap.utils.toArray<HTMLElement>(".stack-card");
      cardEls.forEach((card, i) => {
        if (i === cardEls.length - 1) return;
        ScrollTrigger.create({
          trigger: card,
          start: "top top",
          endTrigger: cardEls[cardEls.length - 1],
          end: "top top",
          pin: true,
          pinSpacing: false,
        });
        gsap.to(card, {
          scale: 0.92,
          opacity: 0.55,
          ease: "none",
          scrollTrigger: {
            trigger: cardEls[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: true,
          },
        });
      });
    }, ref);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <div ref={ref} className="relative">
      {cards.map((card, i) => (
        <div key={i} className="stack-card sticky top-0 min-h-[100dvh] flex items-center justify-center">
          {card}
        </div>
      ))}
    </div>
  );
}
```

### Horizontal-Pan - Canonical Skeleton (Section 5.B)

```tsx
"use client";
import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "motion/react";

gsap.registerPlugin(ScrollTrigger);

export function HorizontalPan({ children }: { children: React.ReactNode }) {
  const wrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce || !wrap.current || !track.current) return;
    const ctx = gsap.context(() => {
      const distance = track.current!.scrollWidth - window.innerWidth;
      gsap.to(track.current, {
        x: -distance,
        ease: "none",
        scrollTrigger: {
          trigger: wrap.current,
          start: "top top",
          end: () => `+=${distance}`,
          pin: true,
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, wrap);
    return () => ctx.revert();
  }, [reduce]);

  return (
    <section ref={wrap} className="relative overflow-hidden">
      <div ref={track} className="flex h-[100dvh] items-center">
        {children}
      </div>
    </section>
  );
}
```

### Scroll-Reveal Stagger (Section 5.C)

```tsx
"use client";
import { motion, useReducedMotion } from "motion/react";

export function RevealStagger({ items }: { items: string[] }) {
  const reduce = useReducedMotion();
  return (
    <ul className="grid gap-6">
      {items.map((item, i) => (
        <motion.li
          key={item}
          initial={reduce ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
        >
          {item}
        </motion.li>
      ))}
    </ul>
  );
}
```

### Forbidden Animation Patterns (Section 5.D)

* **`window.addEventListener("scroll", ...)`** is banned.
* **Custom scroll progress using `window.scrollY`** in React state - banned.
* **`requestAnimationFrame` loops that touch React state** - use motion values instead.
* **Layout Transitions:** Use Motion's `layout` and `layoutId` for visible state changes.
* **Staggered Orchestration:** Use `staggerChildren` (Motion) or CSS cascade.

---

## Dial Technical Reference (Section 7)

### DESIGN_VARIANCE (1-10)
* **1-3:** Symmetrical CSS Grid, equal paddings, centered.
* **4-7:** Overlaps, varied aspect ratios, left-aligned headers.
* **8-10:** Masonry layouts, fractional grid units, massive empty zones.
* **MOBILE OVERRIDE:** Levels 4-10 MUST collapse to single-column on < 768px.

### MOTION_INTENSITY (1-10)
* **1-3:** No auto animations. CSS `:hover` and `:active` only.
* **4-7:** CSS transitions, `animation-delay` cascades, `transform` and `opacity`.
* **8-10:** Complex scroll-triggered reveals, parallax, GSAP ScrollTrigger.

### VISUAL_DENSITY (1-10)
* **1-3:** Huge whitespace, `py-32` to `py-48`.
* **4-7:** Standard web app spacing, `py-16` to `py-24`.
* **8-10:** Tight paddings, 1px lines, `font-mono` for numbers.

---

## Performance & Accessibility Guardrails (Section 6)

* **Hardware Acceleration:** Animate ONLY `transform` and `opacity`.
* **Reduced Motion (mandatory):** Any motion above `MOTION_INTENSITY > 3` MUST honor `prefers-reduced-motion`.
* **Dark Mode (mandatory for consumer-facing):** Design for both modes from start.
* **Core Web Vitals:** LCP < 2.5s, INP < 200ms, CLS < 0.1.
* **DOM Cost:** Grain/noise on fixed `pointer-events-none` pseudo-elements only.
* **Z-Index Restraint:** No arbitrary `z-50` spam.
