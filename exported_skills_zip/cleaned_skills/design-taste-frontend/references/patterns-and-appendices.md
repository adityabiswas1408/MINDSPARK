# Pattern Vocabulary, Block Library & Appendices

> Extracted from the main SKILL.md. Read this file when looking for design pattern names, block library specs, or design system install commands.

---

## Reference Vocabulary - Pattern Names (Section 10)

### Hero Paradigms
* **Asymmetric Split Hero** - Text on one side, asset on the other.
* **Editorial Manifesto Hero** - Large type, no asset, almost-poster.
* **Video / Media Mask Hero** - Type cut out as mask over video.
* **Kinetic-Type Hero** - Animated typography as the primary visual.
* **Curtain-Reveal Hero** - Hero parts on scroll like a curtain.
* **Scroll-Pinned Hero** - Hero stays pinned while content scrolls behind.

### Navigation & Menus
* **Mac OS Dock Magnification** - Edge nav, icons scale on hover.
* **Magnetic Button** - Pulls toward cursor.
* **Gooey Menu** - Sub-items detach like viscous liquid.
* **Dynamic Island** - Morphing pill for status / alerts.
* **Contextual Radial Menu** - Circular menu at click point.
* **Floating Speed Dial** - FAB springing into secondary actions.
* **Mega Menu Reveal** - Full-screen dropdown, stagger-fade content.

### Layout & Grids
* **Bento Grid** - Asymmetric tile grouping.
* **Masonry Layout** - Staggered grid, no fixed row height.
* **Chroma Grid** - Borders with animating gradients.
* **Split-Screen Scroll** - Two halves sliding in opposite directions.
* **Sticky-Stack Sections** - Sections that pin and stack on scroll.

### Cards & Containers
* **Parallax Tilt Card** - 3D tilt tracking mouse.
* **Spotlight Border Card** - Borders illuminate under cursor.
* **Glassmorphism Panel** - Frosted glass with inner refraction.
* **Holographic Foil Card** - Iridescent rainbow shift on hover.
* **Tinder Swipe Stack** - Physical card stack, swipe-away.
* **Morphing Modal** - Button expands into its own dialog.

### Scroll Animations
* **Sticky Scroll Stack** - Cards stick and physically stack.
* **Horizontal Scroll Hijack** - Vertical scroll → horizontal pan.
* **Locomotive / Sequence Scroll** - Video/3D sequence tied to scrollbar.
* **Zoom Parallax** - Central image zooming on scroll.
* **Scroll Progress Path** - SVG line drawing along scroll.
* **Liquid Swipe Transition** - Page transition like viscous liquid.

### Galleries & Media
* **Dome Gallery** - 3D panoramic gallery.
* **Coverflow Carousel** - 3D carousel with angled edges.
* **Drag-to-Pan Grid** - Boundless draggable canvas.
* **Accordion Image Slider** - Narrow strips expanding on hover.
* **Hover Image Trail** - Mouse leaves popping image trail.
* **Glitch Effect Image** - RGB-channel shift on hover.

### Typography & Text
* **Kinetic Marquee** - Endless text bands.
* **Text Mask Reveal** - Massive type as transparent window to video.
* **Text Scramble Effect** - Matrix-style decoding.
* **Circular Text Path** - Text curving along spinning circle.
* **Gradient Stroke Animation** - Outlined text with running gradient.
* **Kinetic Typography Grid** - Letters dodging the cursor.

### Micro-Interactions & Effects
* **Particle Explosion Button** - CTA shatters into particles on success.
* **Liquid Pull-to-Refresh** - Reload indicator like detaching droplets.
* **Skeleton Shimmer** - Shifting light across placeholders.
* **Directional Hover-Aware Button** - Fill enters from cursor's exact side.
* **Ripple Click Effect** - Wave from click coordinates.
* **Animated SVG Line Drawing** - Vectors drawing themselves.
* **Mesh Gradient Background** - Organic lava-lamp blobs.
* **Lens Blur Depth** - Background blurred to focus foreground.

### Animation Library Choice
* **Motion (`motion/react`)** - default for UI / state-change motion.
* **GSAP + ScrollTrigger** - for scroll hijacks. Isolate in leaf components.
* **Three.js / WebGL** - for 3D scenes. Same isolation rule.
* **NEVER mix GSAP / Three.js with Motion in the same component tree.**

---

## Block Library Schema (Section 12)

### File Location
```
skills/taste-skill/blocks/
  hero/
    asymmetric-split.md
    editorial-manifesto.md
    kinetic-type.md
  feature/
    bento-grid.md
    sticky-scroll-stack.md
    zig-zag.md
  social-proof/
  pricing/
  cta/
  footer/
  navigation/
  portfolio/
  transition/
```

### Required Frontmatter
```yaml
---
name: asymmetric-split-hero
category: hero
dial_compatibility:
  variance: [6, 10]
  motion: [3, 10]
  density: [2, 5]
when_to_use: "Landing pages with one strong asset and one strong message."
not_for: "Editorial / manifesto launches."
stack: ["react", "next", "tailwind", "motion"]
---
```

### Required Body Sections
1. **Visual sketch** - layout description.
2. **Props API** - component interface.
3. **Code sketch** - minimal working implementation.
4. **Mobile fallback** - explicit collapse rules for < 768px.
5. **Motion variants** - one per `MOTION_INTENSITY` band (1-3, 4-7, 8-10).
6. **Dark-mode notes** - token strategy for this block.
7. **Anti-patterns** - common failures.
8. **References** - links to real examples.

---

## Appendix A - Install Commands

```bash
# Material Web (Material 3)
npm install @material/web

# Fluent UI React (v9)
npm install @fluentui/react-components

# IBM Carbon
npm install @carbon/react @carbon/styles

# Radix Themes
npm install @radix-ui/themes

# shadcn/ui
npx shadcn@latest init
npx shadcn@latest add button card badge separator input

# Primer CSS
npm install --save @primer/css

# GOV.UK Frontend
npm install govuk-frontend

# USWDS
npm install uswds

# Bootstrap 5.3
npm install bootstrap
```

## Appendix C - Apple Liquid Glass Web Approximation

```css
.liquid-glass-web-approx {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 999px;
  border: 1px solid rgb(255 255 255 / .32);
  background:
    linear-gradient(135deg, rgb(255 255 255 / .30), rgb(255 255 255 / .08)),
    rgb(255 255 255 / .12);
  backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  -webkit-backdrop-filter: blur(24px) saturate(180%) contrast(1.05);
  box-shadow:
    inset 0 1px 0 rgb(255 255 255 / .48),
    inset 0 -1px 0 rgb(255 255 255 / .12),
    0 18px 60px rgb(0 0 0 / .18);
}

@media (prefers-color-scheme: dark) {
  .liquid-glass-web-approx {
    border-color: rgb(255 255 255 / .18);
    background:
      linear-gradient(135deg, rgb(255 255 255 / .16), rgb(255 255 255 / .04)),
      rgb(15 23 42 / .42);
  }
}

@media (prefers-reduced-transparency: reduce) {
  .liquid-glass-web-approx {
    background: rgb(255 255 255 / .96);
    backdrop-filter: none;
  }
}
```

## Appendix D - Advanced Awwwards & Motion Engineering

### Creative Variance Engine
1. **Ethereal Glass:** OLED dark, radial mesh gradient orbs, `backdrop-blur-2xl`.
2. **Editorial Luxury:** Warm cream/paper, high-contrast serif, CSS noise overlay.
3. **Soft Structuralism:** Light grey/silver, ultra-wide Grotesk, diffused shadows.

### Layout Archetypes
* **Asymmetrical Bento:** Masonry CSS Grid with mixed `col-span`.
* **Z-Axis Cascade:** Overlapping card layers with subtle rotations.
* **Editorial Split:** Massive type left, interactive pills right.

### Haptic Micro-Aesthetics
* **Double-Bezel:** Outer shell + inner core with highlight.
* **Button-in-Button Island CTA:** Pill container with trailing icon badge.
* **Fluid Island Navigation:** Floating glass pill, morphing hamburger.
