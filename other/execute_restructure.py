import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

root_dir = r'A:\MS'
mindspark_dir = r'A:\MS\mindspark'
other_dir = r'A:\MS\other'
docs_dir = r'A:\MS\mindspark\docs'

os.makedirs(other_dir, exist_ok=True)
os.makedirs(docs_dir, exist_ok=True)

# 1. Copy the master design review PDF into mindspark/docs
master_pdf_source = r'A:\MS\MINDSPARK_Final_Mockups_Clean.pdf'
if not os.path.exists(master_pdf_source):
    master_pdf_source = r'A:\MS\MINDSPARK — Final Mockups.pdf'
if os.path.exists(master_pdf_source):
    dest_pdf = os.path.join(docs_dir, 'MINDSPARK-Mockups-Review.pdf')
    shutil.copy2(master_pdf_source, dest_pdf)
    print(f"Copied master PDF to: {dest_pdf}")

# 2. Iterate through all items in A:\MS
moved_files = []
moved_dirs = []

for item in os.listdir(root_dir):
    if item.lower() in ['mindspark', 'other', 'execute_restructure.py']:
        continue
    
    src_path = os.path.join(root_dir, item)
    dst_path = os.path.join(other_dir, item)
    
    # If destination already exists, remove it first to avoid collision
    if os.path.isdir(src_path):
        if os.path.exists(dst_path):
            shutil.rmtree(dst_path)
        shutil.move(src_path, dst_path)
        moved_dirs.append(item)
    else:
        if os.path.exists(dst_path):
            os.remove(dst_path)
        shutil.move(src_path, dst_path)
        moved_files.append(item)

print(f"\nMigration complete!")
print(f"Total directories moved to 'other/': {len(moved_dirs)}")
print(f"Total files moved to 'other/': {len(moved_files)}")

# Output itemized list
with open(os.path.join(docs_dir, 'RESTRUCTURE_MANIFEST.txt'), 'w', encoding='utf-8') as f:
    f.write("=== RESTRUCTURED FILES MANIFEST ===\n\n")
    f.write("Directories moved to A:\\MS\\other:\n")
    for d in sorted(moved_dirs):
        f.write(f"  [DIR]  {d}\n")
    f.write("\nFiles moved to A:\\MS\\other:\n")
    for fl in sorted(moved_files):
        f.write(f"  [FILE] {fl}\n")

print(f"Manifest written to: {os.path.join(docs_dir, 'RESTRUCTURE_MANIFEST.txt')}")
