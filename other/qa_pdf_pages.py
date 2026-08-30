import sys
import fitz

sys.stdout.reconfigure(encoding='utf-8')

pdf_path = r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf'
doc = fitz.open(pdf_path)
print(f'Total pages in generated PDF: {len(doc)}')

for p_num in range(10, 17):
    page = doc[p_num]
    text = [line.strip() for line in page.get_text().split('\n') if line.strip()]
    images = page.get_images()
    print(f'\n--- Page {p_num+1} ({page.rect.width}x{page.rect.height}) | Images: {len(images)} ---')
    print('Header/Title:', text[:3])
    print('Footer:', text[-2:] if len(text) >= 2 else text)
