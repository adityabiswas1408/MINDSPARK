import sys
import re
import html

sys.stdout.reconfigure(encoding='utf-8')

with open(r'C:\Users\ADI\Downloads\index.html', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

print('Length of index.html:', len(text))

# Search for all h2 screen-title or h3
titles = re.findall(r'<h2 class="screen-title">([^<]+)</h2>', text)
print(f'Total screen-title elements: {len(titles)}')
for i, t in enumerate(titles):
    print(f'{i+1}: {t.strip()}')

# Check if there is flash anzan code or overlay
if 'fa-overlay' in text or 'flashAnzanInit' in text or 'screen-0' in text:
    print('Found flash anzan interactive code directly in index.html!')

# Check for iframes
iframes = re.findall(r'<iframe([^>]+)>', text)
print(f'Total iframes: {len(iframes)}')
