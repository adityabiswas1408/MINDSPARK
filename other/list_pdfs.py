import os
import glob
import fitz

for g in [r'A:\MS\*.pdf', r'C:\Users\ADI\Downloads\*.pdf']:
    for f in glob.glob(g):
        try:
            d = fitz.open(f)
            print(f"{f}: {len(d)} pages, {os.path.getsize(f)} bytes")
        except Exception as e:
            print(f"{f}: error {e}")
