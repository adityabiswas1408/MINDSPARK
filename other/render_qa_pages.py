import sys
import fitz

doc = fitz.open(r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf')
for p_idx in [11, 12, 13, 14, 15]:
    page = doc[p_idx]
    pix = page.get_pixmap(dpi=150)
    pix.save(f'A:/MS/qa_page_{p_idx+1}.png')
    print(f'Rendered qa_page_{p_idx+1}.png ({pix.width}x{pix.height})')
