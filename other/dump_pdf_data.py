import sys
import fitz
import json

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf')
print(f'Total pages in original PDF: {len(doc)}')

pages_data = []

for i, page in enumerate(doc):
    rect = page.rect
    blocks = page.get_text('dict')['blocks']
    
    # Extract text items
    spans = []
    for b in blocks:
        if 'lines' in b:
            for l in b['lines']:
                for s in l['spans']:
                    spans.append(s)
                    
    # Classify page type
    images = page.get_images()
    
    page_info = {
        'page_num': i + 1,
        'width': rect.width,
        'height': rect.height,
        'has_image': len(images) > 0,
        'image_count': len(images),
        'spans': [{'text': s['text'], 'font': s['font'], 'size': s['size'], 'color': f"#{s['color']:06x}", 'bbox': s['bbox']} for s in spans]
    }
    pages_data.append(page_info)

with open(r'A:\MS\extracted_pdf_pages.json', 'w', encoding='utf-8') as f:
    json.dump(pages_data, f, indent=2)

print('Saved extracted_pdf_pages.json successfully!')
