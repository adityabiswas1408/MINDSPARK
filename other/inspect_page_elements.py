import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

doc = fitz.open(r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf')
page = doc[2] # Page 3 (first mockup page)
rect = page.rect
print(f'Page 3 size: {rect.width} x {rect.height}')

for img_info in page.get_images():
    xref = img_info[0]
    rects = page.get_image_rects(xref)
    print(f"  image xref: {xref}, rects: {rects}")
