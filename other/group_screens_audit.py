import sys
import json

sys.stdout.reconfigure(encoding='utf-8')

with open(r'a:\MS\mindspark\docs\PROJECT_EXPLAINED.md', 'r', encoding='utf-8') as f:
    doc_text = f.read()

with open(r'A:\MS\screens_summary.json', 'r', encoding='utf-8') as f:
    screens = json.load(f)

print(f"Total screens in review PDF: {len(screens)}")
print(f"PROJECT_EXPLAINED.md length: {len(doc_text)} characters")

# Group screens by category/breadcrumb
groups = {}
for s in screens:
    lines = s['lines']
    breadcrumb = lines[0] if len(lines) > 0 else 'Unknown'
    title = lines[1] if len(lines) > 1 else 'Unknown'
    cat = breadcrumb.split('›')[0].strip() if '›' in breadcrumb else breadcrumb.split('·')[0].strip()
    subcat = breadcrumb.split('›')[1].strip() if '›' in breadcrumb else (breadcrumb.split('·')[1].strip() if '·' in breadcrumb else '')
    key = f"{cat} › {subcat}" if subcat else cat
    if key not in groups:
        groups[key] = []
    groups[key].append({
        'pdf_page': s['pdf_page'],
        'title': title,
        'breadcrumb': breadcrumb,
        'desc': ' '.join(lines[3:-1])
    })

print("\n=== SCREEN GROUPS IN PDF ===")
for g, items in groups.items():
    print(f"\n[{g}] ({len(items)} screens)")
    for it in items:
        print(f"  Page {it['pdf_page']}: {it['title']}")
