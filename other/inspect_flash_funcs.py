import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open(r'A:\MS\flash_anzan_mockup.html', 'r', encoding='utf-8') as f:
    text = f.read()

# find all function declarations
funcs = re.findall(r'(function\s+[a-zA-Z0-9_]+\s*\([^)]*\)|const\s+[a-zA-Z0-9_]+\s*=\s*(?:function|\([^)]*\)\s*=>))', text)
print('Functions found:')
for f in funcs:
    print(' ', f)
