import sys
import json
import fitz

sys.stdout.reconfigure(encoding='utf-8')

with open(r'a:\MS\mindspark\docs\PROJECT_EXPLAINED.md', 'r', encoding='utf-8') as f:
    doc_text = f.read()

doc = fitz.open(r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf')

audit_results = []

for i, page in enumerate(doc):
    text = page.get_text()
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    if i == 0 or i == 1 or (len(lines) <= 3 and 'screens in this section' in text):
        continue
    
    bc = lines[0] if len(lines) > 0 else ''
    title = lines[1] if len(lines) > 1 else ''
    path = lines[2] if len(lines) > 2 else ''
    desc = ' '.join(lines[3:-1]) if len(lines) > 4 else ''
    footer = lines[-1] if len(lines) > 0 else ''
    
    # Analyze presence of key keywords and UI features in PROJECT_EXPLAINED.md
    keywords = []
    if 'Empty state' in title:
        keywords.append('empty state')
    if 'Drawer' in title or 'drawer' in desc:
        keywords.append('drawer')
    if 'Dialog' in title or 'dialog' in desc:
        keywords.append('dialog')
    if 'Release' in title or 'un-release' in title or 'gate logic' in desc:
        keywords.append('answer key release gate')
    if 'Pending' in title or 'awaiting grading' in desc:
        keywords.append('pending state')
    if 'Locked' in title or 'locked state' in desc:
        keywords.append('locked answer sheet')
    if 'Flash Preview Modal' in title:
        keywords.append('flash preview modal')
    if 'Force Close Dialog' in title or 'type-to-confirm' in desc:
        keywords.append('type-to-confirm force close')
    if 'Exam Closed Summary' in title:
        keywords.append('session summary card')
    if 'More Info' in title or 'Not mentioned' in desc:
        keywords.append('profile collapsible / null fallback')
    if 'Edit mode' in title or 'Edit Profile' in desc:
        keywords.append('student edit mode banner')
        
    audit_results.append({
        'page_num': i + 1,
        'footer': footer,
        'breadcrumb': bc,
        'title': title,
        'path': path,
        'desc': desc,
        'flags': keywords
    })

print(f"Total audit items: {len(audit_results)}")

with open(r'A:\MS\detailed_cross_verification.json', 'w', encoding='utf-8') as f:
    json.dump(audit_results, f, indent=2)

print("Saved detailed_cross_verification.json!")
