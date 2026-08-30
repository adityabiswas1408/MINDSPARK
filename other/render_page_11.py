import sys
import fitz

doc = fitz.open(r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf')
page = doc[10] # page 11
pix = page.get_pixmap(dpi=150)
pix.save('A:/MS/qa_page_11.png')
print('qa_page_11.png rendered!')
