import json

with open(r'a:\MS\mindspark\docs\PROJECT_EXPLAINED.md', 'r', encoding='utf-8') as f:
    explained_text = f.read().lower()

with open(r'A:\MS\detailed_cross_verification.json', 'r', encoding='utf-8') as f:
    mockups = json.load(f)

print("=== MOCKUP COMPARISON AGAINST PROJECT_EXPLAINED.MD ===")
missing_or_partial = []

for m in mockups:
    title = m['title']
    desc = m['desc']
    bc = m['breadcrumb']
    p_num = m['page_num']
    footer = m['footer']
    
    # Check specific features
    reasons = []
    
    # 1. Student Dashboard Empty State
    if 'Empty state' in title and 'DASHBOARD' in bc:
        if 'empty state' not in explained_text or 'shield icon' not in explained_text:
            reasons.append("Empty state for Student Dashboard (friendly shield card with calming subtitle and 'View My Results' escape hatch) is not explicitly detailed.")
            
    # 2. Exams & Tests Type-Specific Empty States & Details
    if 'Exams list (empty state' in title:
        reasons.append("Exams list type-specific empty state (explaining EXAM format with book-open icon and offline warning banner) is not detailed.")
    if 'Tests list (type-specific empty state' in title:
        reasons.append("Tests list type-specific empty state (explaining Flash Anzan with purple zap icon) is not detailed.")
    if 'Exam info detail (PUBLISHED not-yet-live)' in title:
        reasons.append("Pre-live Exam Info detail screen ('Not yet available' notice explaining the exam opens when teacher starts it) is not explicitly detailed.")
        
    # 3. Results Flow Gated Release & Locked States
    if 'Screen 7 — Detail page · pending' in title:
        reasons.append("Pending grading state (amber rail with clock icon when submission exists but results are unpublished) is missing.")
    if 'Screen 10 — Answer Sheet · locked state' in title:
        reasons.append("Locked Answer Sheet state (centered lock card when student pastes direct URL before admin releases answer key) is missing.")
    if 'Screen 11a — Admin Release card' in title or 'Screen 11b — Admin Release card' in title:
        reasons.append("Admin Answer Key Release Card on assessment detail page with release timestamp and student unlock count is missing.")
    if 'Screen 12a — Confirmation dialog · release direction' in title or 'Screen 12b' in title:
        reasons.append("Answer Key Release / Un-release Confirmation Dialogs (with gate logic warning) are missing.")
    if 'Screen 9 — Answer Sheet · TEST one-line reconstruction' in title:
        reasons.append("TEST Answer Sheet single-line reconstruction format (displaying one centered line of flashed sequence) is missing.")
        
    # 4. Student Profile Null-Heavy & Collapsible states
    if 'Frame 1' in title or 'Frame 2' in title or 'Frame 3' in title:
        if 'collapsible' not in explained_text and 'not mentioned' not in explained_text:
            reasons.append("Student Profile collapsible 'More Info' section and 'Not mentioned' fallback states for empty fields are missing.")
            
    # 5. Admin Students Drawer & Edit Mode Banner
    if 'Student Detail — Edit mode' in title:
        reasons.append("Student Profile inline Edit Mode with top banner (editable personal/academic fields vs read-only danger zone) is missing.")
    if 'Student List Drawer' in title:
        reasons.append("Student List right-side Slide-out Drawer (with search, attendance stats, and exam status list) is missing.")
        
    # 6. Admin Level Detail Tabs & Dialogs
    if 'Level Detail — Students tab' in title or 'Level Detail — Assessments tab' in title:
        reasons.append("Level Detail tabbed view (dedicated Students tab vs Assessments tab pre-filtered to level) is missing.")
    if 'Create Level Dialog — single field' in title:
        reasons.append("Create Level Dialog (single-field modal auto-appending to sortable list) is missing.")
        
    # 7. Admin Assessment Wizard Sub-steps & Modals
    if 'Step 3b — MCQ Builder (TEST variant with Flash Config)' in title:
        reasons.append("Wizard Step 3b Flash Config card with inline preview parameters is missing.")
    if 'Flash Preview Modal (on-demand)' in title:
        reasons.append("On-demand Flash Preview Modal within the wizard (with sample flash, progress bar, and playback controls) is missing.")
    if 'Step 4 — Review' in title:
        reasons.append("Wizard Step 4 Bento Grid Review page with per-section jump-back Edit buttons is missing.")
    if 'Step 5 — Success (Draft variant)' in title:
        reasons.append("Wizard Step 5 Draft Success state (with blue file icon and 3 draft action buttons) is missing.")
        
    # 8. Admin Live Monitor Force Close Dialog & Closed Summary
    if 'Screen 3 — Force Close Dialog' in title:
        reasons.append("Live Monitor type-to-confirm Force Close Dialog (requiring exact word 'CLOSE' to unlock destructive button) is missing.")
    if 'Screen 4 — Exam Closed Summary' in title:
        reasons.append("Exam Closed Summary card (session summary, frozen student table, export CTA, and 'Ended at' timestamp) is missing.")
        
    # 9. Admin Results Polish & Detail Layout
    if 'Results Hub — v4' in title:
        reasons.append("Results Hub layout polish (hover-reveal forest green accent bar, sidebar logout & user card, KPI vertical dividers) is missing.")
    if 'Student Answer Sheet — per-student view' in title:
        reasons.append("Admin Per-Student Answer Sheet table (row-by-row table showing all 4 options, student pick, correct pill, and light red error tints) is missing.")
    if 'Admin Settings — single-column layout' in title:
        reasons.append("Admin Settings single-column layout with sticky bottom save bar in unsaved changes state is missing.")
        
    if reasons:
        missing_or_partial.append({
            'page': p_num,
            'footer': footer,
            'title': title,
            'reasons': reasons
        })

print(f"\nTotal mockups with missing/underspecified features: {len(missing_or_partial)}")
for item in missing_or_partial:
    print(f"\nPage {item['page']} ({item['title']}):")
    for r in item['reasons']:
        print(f"  - {r}")
