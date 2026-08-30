import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open(r'A:\MS\flash_anzan_mockup.html', 'r', encoding='utf-8') as f:
    text = f.read()

print('Length:', len(text))
# print the structure of screen-0, screen-2, screen-3, screen-4
for screen_id in ['screen-0', 'screen-2', 'screen-3', 'screen-4']:
    match = re.search(r'<div[^>]*id=[\"\']' + screen_id + r'[\"\'][^>]*>([\s\S]*?)</div>\s*<!--\s*screen', text)
    if not match:
        match = re.search(r'<div[^>]*id=[\"\']' + screen_id + r'[\"\'][^>]*>([\s\S]*?)(?=<div[^>]*id=[\"\']screen|$)', text)
    if match:
        print(f'\n=== {screen_id} ===')
        print(match.group(0)[:400])
    else:
        print(f'\nCould not find {screen_id}')
