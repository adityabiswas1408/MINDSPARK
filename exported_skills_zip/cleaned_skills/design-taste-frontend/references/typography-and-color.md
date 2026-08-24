# Typography, Color & Content Density Reference

> Extracted from the main SKILL.md. Read this file when working on typography choices, color palettes, or content density decisions.

---

## Typography (Section 4.1)

* **Display / Headlines:** Default `text-4xl md:text-6xl tracking-tighter leading-none`.
* **Body / Paragraphs:** Default `text-base text-gray-600 leading-relaxed max-w-[65ch]`.
* **Sans font choice:**
  * **Discouraged as default:** `Inter`. Pick `Geist`, `Outfit`, `Cabinet Grotesk`, `Satoshi`, or a brand-appropriate serif first.
  * **Override:** Inter is acceptable when the user explicitly asks for a neutral / standard / Linear-style feel, or when the brief is a public-sector / accessibility-first site.
* **Pairings to know:** `Geist` + `Geist Mono`, `Satoshi` + `JetBrains Mono`, `Cabinet Grotesk` + `Inter Tight`, `GT America` + `IBM Plex Mono`.

* **SERIF DISCIPLINE (VERY DISCOURAGED AS DEFAULT):**
  * Serif is **very discouraged as the default font for any project.** "It feels creative / premium / editorial" is NOT a reason to reach for serif.
  * **Serif is only acceptable when ONE of these is explicitly true:**
    - The brand brief literally names a serif font, OR
    - The aesthetic family is genuinely editorial / luxury / publication / manuscript / heritage / vintage AND you can articulate why this specific serif fits this specific brand
  * For everything else, **default sans-serif display** (Geist Display, ABC Diatype, Söhne Breit, Cabinet Grotesk Display, Migra Sans, GT Walsheim, Inter Display, PP Neue Montreal).
  * **EMPHASIS RULE:** When emphasizing a word within a headline, use **italic or bold of the SAME font**. Do NOT inject a random serif word into a sans headline. Mixed-family emphasis is amateur.
  * **Specifically BANNED as defaults:** `Fraunces` and `Instrument_Serif`.
  * **If a serif is justified** (rare): rotate from this pool: PP Editorial New, GT Sectra Display, Cardinal Grotesque, Reckless Neue, Tiempos Headline, Recoleta, Cormorant Garamond, Playfair Display, EB Garamond, IvyPresto, Migra, Editorial Old, Saol Display, Söhne Breit Kursiv, Domaine Display, Canela, Schnyder, Tobias, NB Architekt, ITC Galliard.

* **ITALIC DESCENDER CLEARANCE (mandatory):** When italic is used in display type and the word contains a descender letter (`y g j p q`), use `leading-[1.1]` minimum and add `pb-1` or `mb-1` reserve.

---

## Color Calibration (Section 4.2)

* Max 1 accent color. Saturation < 80% by default.
* **THE LILA RULE:** "AI Purple / Blue glow" is discouraged as default. Use neutral bases (Zinc / Slate / Stone) with high-contrast singular accents.
* **Override:** if the brand explicitly asks for purple / violet, embrace it with intent.
* **One palette per project.** Do not fluctuate between warm and cool grays.
* **COLOR CONSISTENCY LOCK (mandatory):** Once an accent color is chosen, it is used on the WHOLE page.

* **PREMIUM-CONSUMER PALETTE BAN (mandatory):**
  * For premium-consumer briefs, the LLM default warm beige/cream + brass/clay/oxblood is BANNED.
  * Banned hex families:
    - Backgrounds: `#f5f1ea`, `#f7f5f1`, `#fbf8f1`, `#efeae0`, `#ece6db`, `#faf7f1`, `#e8dfcb`
    - Accents: `#b08947`, `#b6553a`, `#9a2436`, `#9c6e2a`, `#bc7c3a`, `#7d5621`
    - Text: `#1a1714`, `#1a1814`, `#1b1814`
  * **Default alternatives (rotate):**
    - **Cold Luxury:** silver-grey + chrome + smoke
    - **Forest:** deep green + bone + amber accent
    - **Black and Tan:** true off-black + warm tan
    - **Cobalt + Cream:** saturated blue against a single neutral
    - **Terracotta + Slate:** warm rust against cool grey
    - **Olive + Brick + Paper:** muted olive plus brick-red accent
    - **Pure monochrome + single saturated pop**

---

## Content Density (Section 4.9)

* **Default content shape per section:** short headline (≤ 8 words) + short sub-paragraph (≤ 25 words) + one visual asset OR one CTA.
* **No data-dump sections.** Use top 3-5 highlights + "View full list" link.
* **Long lists need a different UI component:** 2-column split, card grid, tabs/accordion, horizontal scroll-snap pills, carousel, marquee.
* **Spec sheets:** Use 2-col card grid, scroll-snap pills, grouped chunks, or featured-vs-rest layout. NOT `border-b` on every row.
* **COPY SELF-AUDIT (mandatory):** Re-read every visible string before ship. Flag grammatically broken, AI-hallucinated, or unclear-referent text.
* **Fake-precise numbers are flagged.** Numbers must come from real data or be labeled as mock.
* **One copy register per page.**

---

## Quotes & Testimonials (Section 4.10)

* **Max 3 lines** of quote body. Attribution: name + role + (optionally) company.
* Quote marks: use real typographic quotes or none. Not straight ASCII.
* **No em-dashes** in quotes or attribution.

## Page Theme Lock (Section 4.11)

* The page has ONE theme. Sections do not invert.
* Section-level background tints within the same theme family are fine; flipping themes mid-page is broken.
