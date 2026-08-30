import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open(r'A:\MS\flash_anzan_mockup.html', 'r', encoding='utf-8') as f:
    text = f.read()

scripts = re.findall(r'<script[\s\S]*?</script>', text)
print(f'Total script tags: {len(scripts)}')
for i, s in enumerate(scripts):
    print(f'Script {i} (len {len(s)}):\n', s[:1000])
