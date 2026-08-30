import json

with open(r'A:\MS\extracted_pdf_pages.json', 'r', encoding='utf-8') as f:
    orig_pages = json.load(f)

print(f"Total pages in original PDF snapshot: {len(orig_pages)}")

for p in orig_pages:
    spans = p['spans']
    if len(spans) == 0:
        continue
    # Extract title, breadcrumb, footer
    texts = [s['text'].strip() for s in spans if s['text'].strip()]
    if len(texts) <= 3 and ('MINDSPARK' in texts[0] or 'STUDENT' in texts[0] or 'ADMIN' in texts[0]):
        print(f"Page {p['page_num']} [SECTION/COVER]: {' | '.join(texts)}")
    else:
        # Find breadcrumb, title, path
        bc = spans[0]['text'] if len(spans) > 0 else ''
        title = spans[1]['text'] if len(spans) > 1 else ''
        path = spans[2]['text'] if len(spans) > 2 else ''
        footer = spans[-1]['text'] if len(spans) > 0 else ''
        print(f"Page {p['page_num']:2d} | {footer:42s} | {bc:45s} | {title:55s} | {path}")
