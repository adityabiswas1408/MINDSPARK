# External Skill Audit, Gap Analysis & Integration Roadmap

> **Audit Date:** August 23, 2026  
> **Source Examined:** `C:\Users\ADI\Downloads\skills-main\skills-main\skills` (19 candidate skills)  
> **Target Ecosystem:** `A:\MS\mindspark\.agents\skills` (46 installed skills)  
> **Evaluation Framework:** `skill-creator`, `skill-stocktake`, `full-output-enforcement`, and `karpathy-guidelines`

---

## 1. Executive Summary & Classification Matrix

| # | Skill Name | Size / Files | Target Category | Overlap with Current 46 Skills | Operational Verdict & Integration Strategy |
|:---|:---|:---|:---|:---|:---|
| 1 | **`docx`** | 1.1 MB (61 files, 15 scripts, 44 schemas) | **Category A: Add Standalone** | None (0% overlap). Workspace lacks Word doc capabilities. | **HIGH VALUE.** Import standalone. Enables generating official examination certificates, offline printable problem sheets, and institutional reports. |
| 2 | **`xlsx`** | 1.07 MB (53 files, 12 scripts, 39 schemas) | **Category A: Add Standalone** | None (0% overlap). Workspace lacks Excel capabilities. | **HIGH VALUE.** Import standalone. Provides `recalc.py` with zero-formula-error tolerance, essential for student grading records, marks imports, and data reconciliation. |
| 3 | **`pdf`** | 57.3 KB (12 files, 8 scripts, 3 docs) | **Category A: Add Standalone** | None (0% overlap). | **HIGH VALUE.** Import standalone. Powers PDF form extraction, bounding box checks, OCR annotation, and scorecard rendering. |
| 4 | **`pptx`** | 1.1 MB (56 files, 15 scripts, 39 schemas) | **Category A: Add Standalone** | None (0% overlap). | **HIGH VALUE.** Import standalone. Supports generating competition slide decks, visual teacher guides, and school board walkthroughs. |
| 5 | **`claude-api`** | 950.5 KB (68 files, 67 markdown references) | **Category A: Add Standalone** | None (0% overlap). | **HIGH VALUE.** Import standalone. Exhaustive multi-language reference for prompt caching, token counting, tool calling, and streaming. |
| 6 | **`canvas-design`** | 5.42 MB (83 files, 54 font files) | **Category A: Add Standalone** | None (0% overlap in font assets). | **HIGH VALUE.** Import standalone. Contains 54 production-grade OFL fonts (Geist Mono, Outfit, DMMono, Bricolage Grotesque) for high-impact visual design. |
| 7 | **`theme-factory`** | 140.7 KB (13 files, 10 theme definitions) | **Category B: Merge & Enhance** | Overlaps with `brandkit` & `design-taste-frontend`. | **MERGE.** Merge the 10 theme markdown files (`ocean-depths`, `tech-innovation`, etc.) directly into `brandkit` to avoid top-level skill bloat. |
| 8 | **`doc-coauthoring`** | 15.4 KB (1 file) | **Category B: Merge & Enhance** | Overlaps with `living-docs-governance` & `writing-plans`. | **MERGE.** Incorporate the 3-phase Socratic co-authoring flow into `living-docs-governance` to enhance user collaboration during spec creation. |
| 9 | **`discernment-nudge`**| 21.4 KB (2 files) | **Category B: Merge & Enhance** | Overlaps with `karpathy-guidelines`. | **MERGE.** Add the "critical assumption-testing probe" invariant into `karpathy-guidelines` rather than keeping a single-rule directory. |
| 10 | **`webapp-testing`** | 21.9 KB (6 files, 4 Python scripts) | **Category C: Update & Adapt** | Overlaps with Playwright/Vitest setup. | **UPDATE & ADAPT.** Uses Python Playwright. Adapt the lifecycle script (`with_server.py`) into native TypeScript/Node.js to align with the Next.js stack. |
| 11 | **`web-artifacts-builder`** | 44.8 KB (5 files, 2 shell scripts) | **Category C: Update & Adapt** | Overlaps with Next.js App Router. | **ADAPT / PROTOTYPE TOOL.** Useful for self-contained single-file HTML/JSX widget bundling; convert shell scripts to PowerShell for Windows compatibility. |
| 12 | **`internal-comms`** | 21.9 KB (6 files, 5 templates) | **Category A: Add Standalone** | None (0% overlap). | **MEDIUM VALUE.** Import standalone. Provides templates for incident postmortems, status updates, and leadership memos. |
| 13 | **`algorithmic-art`** | 58.4 KB (4 files, 1 template, 1 viewer) | **Category A: Add Standalone** | None (0% overlap). | **MEDIUM/LOW VALUE.** Import standalone. Self-contained p5.js art and mathematical curve generator. |
| 14 | **`slack-gif-creator`**| 42.7 KB (7 files, 4 scripts) | **Category A: Add Standalone** | None (0% overlap). | **LOW VALUE.** Import standalone if animated GIFs or math step visualizations are needed. |
| 15 | **`skill-creator`** | 219.7 KB (18 files, 10 scripts) | **Category D: Skip (Duplicate)** | 100% duplicate of installed skill. | **SKIP.** Identical version already active in `.agents/skills/skill-creator/` with full eval harness. |
| 16 | **`mcp-builder`** | 118.9 KB (10 files, 2 scripts) | **Category D: Skip (Duplicate)** | 100% duplicate of installed skill. | **SKIP.** Identical version already active in `.agents/skills/mcp-builder/`. |
| 17 | **`frontend-design`**| 18 KB (2 files) | **Category D: Skip (Duplicate)** | 100% duplicate of installed skill. | **SKIP.** Identical version already active in `.agents/skills/frontend-design/`. |
| 18 | **`brand-guidelines`**| 13.3 KB (2 files) | **Category D: Skip (Conflicting)** | Conflicts with MINDSPARK brand. | **SKIP.** Enforces Anthropic corporate colors (`#CC785C`). Conflicts with MINDSPARK brand guidelines. |
| 19 | **`academy-guide`** | 18.7 KB (2 files) | **Category D: Skip (Irrelevant)** | 0% development utility. | **SKIP.** Training course directory for academy.claude.com; irrelevant to automated software engineering. |

---

## 2. Exhaustive Item-by-Item Skill Teardown

### 1. `docx` — Professional Word Document Generation & Redlining
- **Source Directory:** `skills/docx/`
- **File & Code Inventory (61 items):**
  - Core: `SKILL.md`, `LICENSE.txt`
  - Scripts: `accept_changes.py`, `comment.py`, `merge_runs.py`, `validate.py`, `soffice.py`
  - Schema Specifications: 44 ECMA-376 / ISO-IEC 29500 WML and DrawingML `.xsd` files.
  - Test Schemas: `comments.xml`, `commentsExtended.xml`, `people.xml`.
- **Capability Analysis:** Enables automated generation, editing, tracked changes, table-of-contents insertion, and schema-level validation for Microsoft Word `.docx` documents.
- **Environment Compatibility:** Python 3 + `python-docx` + LibreOffice headless (optional for PDF conversion). Natively compatible with Windows.
- **Verdict: Category A (Add Standalone).**

---

### 2. `xlsx` — Spreadsheet Creation, Editing & Strict Recalculation
- **Source Directory:** `skills/xlsx/`
- **File & Code Inventory (53 items):**
  - Core: `SKILL.md`, `LICENSE.txt`
  - Scripts: `recalc.py`, `soffice.py`, `validate.py`, chart helpers (`pptx_chart.py`, `pptx_slide.py`).
  - Schema Specifications: 39 ISO-IEC 29500 SpreadsheetML `.xsd` files.
- **Capability Analysis:** Provides strict formula verification (`recalc.py`), preventing broken formulas (`#VALUE!`, `#REF!`, `#NAME?`) from being written to production spreadsheets.
- **Environment Compatibility:** Python 3 + `openpyxl` + `pandas`. Zero platform lock-in.
- **Verdict: Category A (Add Standalone).**

---

### 3. `pdf` — PDF Form Filling, Bounding Box Inspection & OCR
- **Source Directory:** `skills/pdf/`
- **File & Code Inventory (12 items):**
  - Core: `SKILL.md`, `forms.md`, `reference.md`, `LICENSE.txt`
  - Scripts: `check_bounding_boxes.py`, `check_fillable_fields.py`, `convert_pdf_to_images.py`, `create_validation_image.py`, `extract_form_field_info.py`, `extract_form_structure.py`, `fill_fillable_fields.py`, `fill_pdf_form_with_annotations.py`.
- **Capability Analysis:** Bridges the gap between static PDF files and interactive form population, coordinate validation, and PDF-to-image conversions.
- **Environment Compatibility:** Python 3 + `pypdf` / `pdfplumber` / `fitz`.
- **Verdict: Category A (Add Standalone).**

---

### 4. `pptx` — Presentation Slide Deck Automation & Templating
- **Source Directory:** `skills/pptx/`
- **File & Code Inventory (56 items):**
  - Core: `SKILL.md`, `LICENSE.txt`
  - Scripts: `add_slide.py`, `clean.py`, `thumbnail.py`, `validate.py`, `soffice.py`.
  - Schemas: 39 PresentationML XSD files.
- **Capability Analysis:** Generates formatted PowerPoint presentations with dynamic charts, notes, and layout templates.
- **Environment Compatibility:** Python 3 + `python-pptx`.
- **Verdict: Category A (Add Standalone).**

---

### 5. `claude-api` — Multi-Language API Reference & SDK Architecture
- **Source Directory:** `skills/claude-api/`
- **File & Code Inventory (68 items):**
  - Core: `SKILL.md`, `LICENSE.txt`
  - Language Modules (67 references): `typescript/`, `python/`, `go/`, `java/`, `csharp/`, `php/`, `ruby/`, `curl/`.
  - Topics: `batches.md`, `files-api.md`, `streaming.md`, `tool-use.md`, `managed-agents.md`, `prompt-caching.md`, `token-counting.md`, `model-migration.md`.
- **Capability Analysis:** The most comprehensive reference library available for integrating LLM tool use, streaming, token counting, and prompt caching.
- **Environment Compatibility:** Pure Markdown reference; zero dependencies.
- **Verdict: Category A (Add Standalone).**

---

### 6. `canvas-design` — Visual Poster Design & 54 Curated Font Assets
- **Source Directory:** `skills/canvas-design/`
- **File & Code Inventory (83 items, 5.42 MB):**
  - Core: `SKILL.md`, `LICENSE.txt`
  - Typography Assets (54 `.ttf` fonts): `GeistMono`, `DMMono`, `Outfit`, `BricolageGrotesque`, `InstrumentSans`, `JetBrainsMono`, `IBMPlexSerif`, `Lora`, `WorkSans`, `CrimsonPro`, etc.
- **Capability Analysis:** Visual layout rules for creating posters and printable documents, bundled with high-quality fonts.
- **Environment Compatibility:** Cross-platform asset bundle.
- **Verdict: Category A (Add Standalone).**

---

### 7. `theme-factory` — Curated Font & Color Design Systems
- **Source Directory:** `skills/theme-factory/`
- **File & Code Inventory (13 items):**
  - Core: `SKILL.md`, `theme-showcase.pdf`, `LICENSE.txt`
  - Themes (10 `.md` files): `arctic-frost.md`, `botanical-garden.md`, `desert-rose.md`, `forest-canopy.md`, `golden-hour.md`, `midnight-galaxy.md`, `modern-minimalist.md`, `ocean-depths.md`, `sunset-boulevard.md`, `tech-innovation.md`.
- **Capability Analysis:** 10 curated hex color palettes and font pairings.
- **Verdict: Category B (Merge & Enhance).** Copy theme definitions into `.agents/skills/brandkit/themes/` to enrich existing branding skills without creating directory clutter.

---

### 8. `doc-coauthoring` — Socratic Documentation Co-Authoring Protocol
- **Source Directory:** `skills/doc-coauthoring/`
- **File & Code Inventory (1 item):** `SKILL.md`
- **Capability Analysis:** Guides structured document drafting through iterative user dialogue.
- **Verdict: Category B (Merge & Enhance).** Merge workflow into `.agents/skills/living-docs-governance/` and `writing-plans/`.

---

### 9. `discernment-nudge` — Assumption-Testing Verification Prompt
- **Source Directory:** `skills/discernment-nudge/`
- **File & Code Inventory (2 items):** `SKILL.md`, `LICENSE.txt`
- **Capability Analysis:** Prompts the agent to append 2-3 critical assumption-testing questions to strategic advice.
- **Verdict: Category B (Merge & Enhance).** Merge rule into `.agents/skills/karpathy-guidelines/` as a core behavioral check.

---

### 10. `webapp-testing` — Local Web App Playwright Automation Runner
- **Source Directory:** `skills/webapp-testing/`
- **File & Code Inventory (6 items):**
  - Scripts: `scripts/with_server.py`, `examples/static_html_automation.py`, `examples/element_discovery.py`, `examples/console_logging.py`.
- **Capability Analysis:** Manages server start/stop lifecycles and executes Playwright tests.
- **Verdict: Category C (Update & Adapt).** Adapt the Python runner to a TypeScript/Node.js script (`scripts/test-server.ts`) to match MINDSPARK's `@playwright/test` framework.

---

### 11. `web-artifacts-builder` — Single-File HTML/React Bundler
- **Source Directory:** `skills/web-artifacts-builder/`
- **File & Code Inventory (5 items):**
  - Scripts: `scripts/init-artifact.sh`, `scripts/bundle-artifact.sh`, `shadcn-components.tar.gz`.
- **Capability Analysis:** Initializes and bundles multi-component React/Tailwind/shadcn projects into single standalone HTML files.
- **Verdict: Category C (Update & Adapt).** Convert `.sh` shell scripts to `.ps1` for Windows execution.

---

### 12. `internal-comms` — Business & Engineering Communications Templates
- **Source Directory:** `skills/internal-comms/`
- **File & Code Inventory (6 items):**
  - Templates: `3p-updates.md`, `company-newsletter.md`, `faq-answers.md`, `general-comms.md`.
- **Capability Analysis:** Standardized formats for status reports, leadership briefings, and incident postmortems.
- **Verdict: Category A (Add Standalone).**

---

### 13. `algorithmic-art` — p5.js Generative Geometry & Particle Systems
- **Source Directory:** `skills/algorithmic-art/`
- **File & Code Inventory (4 items):** `generator_template.js`, `viewer.html`, `SKILL.md`, `LICENSE.txt`.
- **Capability Analysis:** Generates interactive math art, flow fields, and visual curves using p5.js.
- **Verdict: Category A (Add Standalone).**

---

### 14. `slack-gif-creator` — Eased Animated GIF Creator
- **Source Directory:** `skills/slack-gif-creator/`
- **File & Code Inventory (7 items):** `core/easing.py`, `core/frame_composer.py`, `core/gif_builder.py`, `core/validators.py`.
- **Capability Analysis:** Programmatic animated GIF generation with frame easing and color quantization.
- **Verdict: Category A (Add Standalone).**

---

### 15–19. Duplicates, Conflicting & Out-of-Scope Skills
- **`skill-creator` (Skip):** 100% duplicate of `.agents/skills/skill-creator`.
- **`mcp-builder` (Skip):** 100% duplicate of `.agents/skills/mcp-builder`.
- **`frontend-design` (Skip):** 100% duplicate of `.agents/skills/frontend-design`.
- **`brand-guidelines` (Skip):** Anthropic corporate branding; conflicts with MINDSPARK brand tokens.
- **`academy-guide` (Skip):** Non-operational link catalog for Claude Academy.

---

## 3. Actionable Integration & Migration Blueprint

### PowerShell Automated Import Script

Execute the following PowerShell script to import all approved standalone skills and merge theme assets into the workspace:

```powershell
# 1. Paths Configuration
$srcRoot = "C:\Users\ADI\Downloads\skills-main\skills-main\skills"
$destRoot = "A:\MS\mindspark\.agents\skills"

# 2. Approved High-Value Standalone Skills
$approvedStandalone = @(
    "docx",
    "xlsx",
    "pdf",
    "pptx",
    "claude-api",
    "canvas-design",
    "internal-comms",
    "algorithmic-art",
    "slack-gif-creator"
)

Write-Host "=== Importing High-Value Standalone Skills ===" -ForegroundColor Cyan
foreach ($skill in $approvedStandalone) {
    $src = Join-Path $srcRoot $skill
    $dst = Join-Path $destRoot $skill
    if (Test-Path $src) {
        Write-Host "Importing [$skill] -> $dst" -ForegroundColor Green
        Copy-Item -Path $src -Destination $dst -Recurse -Force
    }
}

# 3. Merge Theme Factory Assets into Brandkit
$themeSrc = Join-Path $srcRoot "theme-factory\themes"
$brandkitThemeDst = Join-Path $destRoot "brandkit\themes"
if (Test-Path $themeSrc) {
    Write-Host "Merging theme palettes into brandkit/themes/..." -ForegroundColor Yellow
    if (!(Test-Path $brandkitThemeDst)) { New-Item -ItemType Directory -Path $brandkitThemeDst -Force }
    Copy-Item -Path (Join-Path $themeSrc "*") -Destination $brandkitThemeDst -Recurse -Force
}

Write-Host "=== Skill Integration Complete! ===" -ForegroundColor Green
```
