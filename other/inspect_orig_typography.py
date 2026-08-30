import sys
import fitz
import json

sys.stdout.reconfigure(encoding='utf-8')

# Let's inspect page 3, 4, 12 in the original PDF
# Also check if we have a backup of the original PDF before our save or check extracted_pdf_pages.json
with open(r'A:\MS\extracted_pdf_pages.json', 'r', encoding='utf-8') as f:
    orig_pages = json.load(f)

print(f"Total extracted original pages: {len(orig_pages)}")

# Print detailed spans from original page 3, 12, 13
for p_idx in [2, 11, 12]:
    p = orig_pages[p_idx]
    print(f"\n=== Original Page {p['page_num']} (Size: {p['width']} x {p['height']}) ===")
    for s in p['spans']:
        print(f"  Text: {repr(s['text'][:60])} | Font: {s['font']} | Size: {s['size']} | Color: {s['color']} | BBox: {s['bbox']}")
