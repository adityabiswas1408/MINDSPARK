from PIL import Image

im = Image.open('A:/MS/qa_page_11.png')
# Crop bottom right corner: width ~ 2325, height ~ 2242
w, h = im.size
crop = im.crop((w - 550, h - 80, w - 20, h - 10))
crop.save('A:/MS/qa_footer_crop.png')
print('qa_footer_crop.png saved, size:', crop.size)
