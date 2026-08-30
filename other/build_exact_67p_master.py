import sys
import os
import shutil
import fitz # PyMuPDF
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

base_orig_pdf = r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review 1.pdf'
final_pdf_path = r'A:\MS\MINDSPARK_Final_Mockups_Clean.pdf'
downloads_pdf_path = r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf'

TOTAL_SCREENS = 64

src_doc = fitz.open(base_orig_pdf)
out_doc = fitz.open()

# Flash Anzan 4 Interactive Screens to insert
flash_screens = [
    {
        "breadcrumb": "STUDENT › FLASH ANZAN TEST — INTERACTIVE EXPERIENCE",
        "title": "Screen 1 — Get Ready (3-2-1 Countdown & Breathing Focus)",
        "path": "/student/assessment/[id]/flash",
        "desc": "Preparation countdown before digits start flashing. 3-second animated countdown with breathing focus indicator and clear instruction to look at the center of the screen.",
        "image": r"A:\MS\flash_screen_1_getready.png"
    },
    {
        "breadcrumb": "STUDENT › FLASH ANZAN TEST — INTERACTIVE EXPERIENCE",
        "title": "Screen 2 — Flash Sequence (Sub-second Rapid Number Display)",
        "path": "/student/assessment/[id]/flash",
        "desc": "Full-screen distraction-free sequence. Numbers flash at 450ms intervals in 96px DM Mono typography with all peripheral chrome, sidebars, and navigation hidden.",
        "image": r"A:\MS\flash_screen_2_flash.png"
    },
    {
        "breadcrumb": "STUDENT › FLASH ANZAN TEST — INTERACTIVE EXPERIENCE",
        "title": "Screen 3 — MCQ Answer Selection (4-Option Grid & Question Timer)",
        "path": "/student/assessment/[id]/flash",
        "desc": "Answer selection interface presented immediately after the flash sequence completes. 4 large tactile multiple-choice options with 64x64px touch targets and question progress indicator.",
        "image": r"A:\MS\flash_screen_3_mcq.png"
    },
    {
        "breadcrumb": "STUDENT › FLASH ANZAN TEST — INTERACTIVE EXPERIENCE",
        "title": "Screen 4 — Completion & Submission (3 of 3 Answered)",
        "path": "/student/assessment/[id]/flash",
        "desc": "Confirmation screen displayed after the final question is answered. Summary stats showing all 3 questions answered, submission confirmation, and return CTA.",
        "image": r"A:\MS\flash_screen_4_submitted.png"
    }
]

def render_flash_mockup_page(doc, info, screen_idx, total_screens=64):
    im = Image.open(info['image'])
    im_w, im_h = im.size
    
    page_w = 1116.0
    img_x0 = 46.0
    img_y0 = 141.0
    img_w = 1043.424
    img_h = img_w * (im_h / im_w)
    
    card_left = 36.0
    card_top = 131.0
    card_right = 1100.0
    card_bottom = img_y0 + img_h + 10.0
    page_h = card_bottom + 56.0
    
    page = doc.new_page(width=page_w, height=page_h)
    page.draw_rect(fitz.Rect(0, 0, page_w, page_h), fill=(1, 1, 1), width=0)
    
    # 1. Breadcrumb: Helvetica-Bold 8.5pt, #1A3829, baseline at y=41.5
    page.insert_text(fitz.Point(36.0, 41.5), info['breadcrumb'], fontname="hebo", fontsize=8.5, color=(26/255, 56/255, 41/255))
    
    # 2. Title: Helvetica-Bold 16.0pt, #0F172A, baseline at y=63.5
    page.insert_text(fitz.Point(36.0, 63.5), info['title'], fontname="hebo", fontsize=16.0, color=(15/255, 23/255, 42/255))
    
    # 3. Path: Courier 8.0pt, #64748B, baseline at y=78.0
    page.insert_text(fitz.Point(36.0, 78.0), info['path'], fontname="courier", fontsize=8.0, color=(100/255, 116/255, 139/255))
    
    # 4. Description: Helvetica 10.5pt, #334155, starting at y=87.2
    page.insert_textbox(fitz.Rect(36.0, 87.2, 1080.0, 126.0), info['desc'], fontname="helv", fontsize=10.5, color=(51/255, 65/255, 85/255), lineheight=1.38)
    
    # 5. Card background: fill #FAFAFA, stroke #E2E8F0 (0.75pt)
    card_rect = fitz.Rect(card_left, card_top, card_right, card_bottom)
    page.draw_rect(card_rect, fill=(0.980392, 0.984314, 0.988235), color=(0.886275, 0.909804, 0.941176), width=0.75)
    
    # 6. Image insertion
    page.insert_image(fitz.Rect(img_x0, img_y0, img_x0 + img_w, img_y0 + img_h), filename=info['image'])
    
    # 7. Footer: Helvetica 7.5pt, #64748B
    footer_text = f"MINDSPARK Mockup Review  ·  Screen {screen_idx} of {total_screens}"
    page.insert_text(fitz.Point(page_w - 200.0, page_h - 22.0), footer_text, fontname="helv", fontsize=7.5, color=(100/255, 116/255, 139/255))

# 1. Cover Page
cover_page = out_doc.new_page(width=1116.0, height=792.0)
cover_page.draw_rect(fitz.Rect(0, 0, 1116.0, 792.0), fill=(1, 1, 1), width=0)
cover_page.insert_text(fitz.Point(36.0, 290.0), "MINDSPARK", fontname="hebo", fontsize=44.0, color=(26/255, 56/255, 41/255))
cover_page.insert_text(fitz.Point(36.0, 325.0), "Final Mockups — Design Review", fontname="hebo", fontsize=18.0, color=(15/255, 23/255, 42/255))
cover_page.insert_text(fitz.Point(36.0, 350.0), f"{TOTAL_SCREENS} screens  ·  generated August 2026", fontname="helv", fontsize=12.0, color=(100/255, 116/255, 139/255))
cover_page.insert_text(fitz.Point(36.0, 730.0), "One mockup per page, with its accompanying design note.", fontname="helv", fontsize=10.0, color=(100/255, 116/255, 139/255))

# 2. Student Section Divider
student_div = out_doc.new_page(width=1116.0, height=400.0)
student_div.draw_rect(fitz.Rect(0, 0, 1116.0, 400.0), fill=(1, 1, 1), width=0)
student_div.insert_text(fitz.Point(36.0, 190.0), "STUDENT", fontname="hebo", fontsize=36.0, color=(26/255, 56/255, 41/255))
student_div.insert_text(fitz.Point(36.0, 215.0), "32 screens in this section", fontname="helv", fontsize=12.0, color=(100/255, 116/255, 139/255))

screen_counter = 0

def copy_mockup_page(src_p, dest_doc, new_idx, total=64):
    p_rect = src_p.rect
    new_p = dest_doc.new_page(width=p_rect.width, height=p_rect.height)
    new_p.show_pdf_page(new_p.rect, src_doc, src_p.number)
    
    # Blank out old footer area cleanly
    footer_rect = fitz.Rect(p_rect.width - 250.0, p_rect.height - 35.0, p_rect.width - 20.0, p_rect.height - 5.0)
    new_p.draw_rect(footer_rect, fill=(1, 1, 1), color=(1, 1, 1), width=0)
    footer_text = f"MINDSPARK Mockup Review  ·  Screen {new_idx} of {total}"
    new_p.insert_text(fitz.Point(p_rect.width - 200.0, p_rect.height - 22.0), footer_text, fontname="helv", fontsize=7.5, color=(100/255, 116/255, 139/255))

# 3. Screens 1 to 9 (from original pages 2 to 10)
for p_idx in range(2, 11):
    screen_counter += 1
    copy_mockup_page(src_doc[p_idx], out_doc, screen_counter, TOTAL_SCREENS)

# 4. Screen 10 (Launch Card, original page 11)
screen_counter += 1
copy_mockup_page(src_doc[11], out_doc, screen_counter, TOTAL_SCREENS)

# 5. Flash Anzan 4 Interactive Screens (Screens 11, 12, 13, 14)
for flash_info in flash_screens:
    screen_counter += 1
    render_flash_mockup_page(out_doc, flash_info, screen_counter, TOTAL_SCREENS)

# 6. Remaining Student screens (from original pages 12 to 29 -> 18 screens)
for p_idx in range(12, 30):
    screen_counter += 1
    copy_mockup_page(src_doc[p_idx], out_doc, screen_counter, TOTAL_SCREENS)

# 7. Admin Section Divider
admin_div = out_doc.new_page(width=1116.0, height=400.0)
admin_div.draw_rect(fitz.Rect(0, 0, 1116.0, 400.0), fill=(1, 1, 1), width=0)
admin_div.insert_text(fitz.Point(36.0, 190.0), "ADMIN", fontname="hebo", fontsize=36.0, color=(26/255, 56/255, 41/255))
admin_div.insert_text(fitz.Point(36.0, 215.0), "32 screens in this section", fontname="helv", fontsize=12.0, color=(100/255, 116/255, 139/255))

# 8. Admin screens (from original pages 31 to 62 -> 32 screens)
for p_idx in range(31, 63):
    screen_counter += 1
    copy_mockup_page(src_doc[p_idx], out_doc, screen_counter, TOTAL_SCREENS)

print(f"Total screens added: {screen_counter}")
print(f"Total pages in clean master PDF: {len(out_doc)}")

out_doc.save(final_pdf_path)
out_doc.close()
src_doc.close()

shutil.copy2(final_pdf_path, downloads_pdf_path)
shutil.copy2(final_pdf_path, r'A:\MS\MINDSPARK — Final Mockups.pdf')
print("Saved to Downloads and A:/MS successfully!")
