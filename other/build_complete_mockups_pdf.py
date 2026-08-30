import sys
import os
import fitz # PyMuPDF
from PIL import Image

sys.stdout.reconfigure(encoding='utf-8')

src_pdf_path = r'C:\Users\ADI\Downloads\MINDSPARK-Mockups-Review.pdf'
out_pdf_path = r'C:\Users\ADI\Downloads\MINDSPARK-Final-Mockups-Complete.pdf'

print(f"Reading from: {src_pdf_path}")
src_doc = fitz.open(src_pdf_path)
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

def render_custom_mockup_page(doc, info, screen_idx, total_screens=64):
    im = Image.open(info['image'])
    im_w, im_h = im.size
    
    page_w = 1116.0
    img_x0 = 46.0
    img_y0 = 141.0
    img_w = 1043.424 # standard width matching other pages
    img_h = img_w * (im_h / im_w)
    
    card_left = 36.0
    card_top = 131.0
    card_right = 1100.0
    card_bottom = img_y0 + img_h + 10.0
    page_h = card_bottom + 56.0
    
    page = doc.new_page(width=page_w, height=page_h)
    page.draw_rect(fitz.Rect(0, 0, page_w, page_h), fill=(1, 1, 1), width=0)
    
    # Breadcrumb
    page.insert_text(fitz.Point(36.0, 33.4 + 6), info['breadcrumb'], fontname="helv", fontsize=8.5, color=(26/255, 56/255, 41/255))
    # Title
    page.insert_text(fitz.Point(36.0, 52.0 + 8), info['title'], fontname="helv", fontsize=16.0, color=(15/255, 23/255, 42/255))
    # Path
    page.insert_text(fitz.Point(36.0, 70.5 + 6), info['path'], fontname="couri", fontsize=8.0, color=(100/255, 116/255, 139/255))
    # Description
    page.insert_textbox(fitz.Rect(36.0, 87.2, 1080.0, 128.0), info['desc'], fontname="helv", fontsize=10.5, color=(51/255, 65/255, 85/255))
    
    # Card background
    card_rect = fitz.Rect(card_left, card_top, card_right, card_bottom)
    page.draw_rect(card_rect, fill=(0.980392, 0.984314, 0.988235), color=(0.886275, 0.909804, 0.941176), width=0.75)
    
    # Image
    page.insert_image(fitz.Rect(img_x0, img_y0, img_x0 + img_w, img_y0 + img_h), filename=info['image'])
    
    # Footer
    footer_text = f"MINDSPARK Mockup Review  ·  Screen {screen_idx} of {total_screens}"
    page.insert_text(fitz.Point(page_w - 200.0, page_h - 22.0), footer_text, fontname="helv", fontsize=7.5, color=(100/255, 116/255, 139/255))

print("Script template ready.")
