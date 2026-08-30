import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open(r'A:\MS\flash_anzan_mockup.html', 'r', encoding='utf-8') as f:
    flash_css = f.read()

# Extract colors from CSS
colors = set(re.findall(r'#(?:[0-9a-fA-F]{3}){1,2}\b|rgb\([^)]+\)|rgba\([^)]+\)|var\(--[a-zA-Z0-9_-]+\)', flash_css))
print('Flash Anzan CSS colors used:')
for c in sorted(colors):
    print(' ', c)

with open(r'C:\Users\ADI\Downloads\index.html', 'r', encoding='utf-8') as f:
    index_css = f.read()[:5000] # root vars

vars_match = re.findall(r'--[a-zA-Z0-9_-]+:\s*[^;]+;', index_css)
print('\nMain index.html CSS variables:')
for v in vars_match[:20]:
    print(' ', v)
