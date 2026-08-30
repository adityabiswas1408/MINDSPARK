import sys
import fitz
import json

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf'
doc = fitz.open(pdf_path)

screens = []

for i, page in enumerate(doc):
    text = page.get_text()
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    
    # Check if page is cover or section divider
    if i == 0:
        continue # Cover
    if i == 1:
        continue # Student divider
    if 'ADMIN' in lines and len(lines) <= 4 and 'screens in this section' in text:
        continue # Admin divider
        
    # Mockup page
    screens.append({
        'pdf_page': i + 1,
        'full_text': text,
        'lines': lines
    })

print(f"Total mockup screens extracted: {len(screens)}")

with open(r'A:\MS\screens_summary.json', 'w', encoding='utf-8') as f:
    json.dump(screens, f, indent=2)

for s in screens:
    # Print clean summary: Screen Number, Section/Breadcrumb, Title, Source Path, Description snippet
    lines = s['lines']
    breadcrumb = lines[0] if len(lines) > 0 else ''
    title = lines[1] if len(lines) > 1 else ''
    path = lines[2] if len(lines) > 2 else ''
    desc = ' '.join(lines[3:-1]) if len(lines) > 4 else ''
    footer = lines[-1] if len(lines) > 0 else ''
    print(f"Page {s['pdf_page']} | {footer} | {breadcrumb} | {title} | {path}")
