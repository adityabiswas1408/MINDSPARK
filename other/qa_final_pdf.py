import fitz

doc = fitz.open(r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf')
print(f'Total pages: {len(doc)}')

for p_num in range(11, 16):
    page = doc[p_num]
    print(f'\n--- Page {p_num+1} ({page.rect.width} x {page.rect.height}) ---')
    blocks = page.get_text('dict')['blocks']
    for b in blocks:
        if 'lines' in b:
            for l in b['lines']:
                for s in l['spans']:
                    print(f"  {s['text'][:50]} | Font: {s['font']} | Size: {s['size']:.1f} | Color: #{s['color']:06x} | BBox: {[round(x,1) for x in s['bbox']]}")
