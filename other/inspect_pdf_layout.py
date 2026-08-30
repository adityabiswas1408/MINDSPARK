import sys
import fitz # PyMuPDF

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf')
print(f'Total pages: {len(doc)}')

for page_num in [0, 1, 2, 11, 12]:
    page = doc[page_num]
    rect = page.rect
    print(f'\n--- Page {page_num + 1} (Size: {rect.width}x{rect.height}) ---')
    print('Text blocks:')
    blocks = page.get_text('blocks')
    for b in blocks:
        text = b[4].strip().replace('\n', ' ')
        print(f'  [{b[0]:.1f}, {b[1]:.1f}, {b[2]:.1f}, {b[3]:.1f}]: {text[:100]}')
    
    images = page.get_images()
    print(f'Images count: {len(images)}')
    for img in images:
        xref = img[0]
        base_image = doc.extract_image(xref)
        print(f'  Image xref {xref}: {base_image["width"]}x{base_image["height"]} ({base_image["ext"]})')
