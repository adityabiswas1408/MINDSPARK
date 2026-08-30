import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

for path in [r'A:\MS\flash_anzan_standalone.html', r'A:\MS\flash_anzan_mockup.html', r'A:\MS\flash_anzan_config.html']:
    try:
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        print(f'{path}: {len(content)} bytes')
        # find screen ids
        screens = re.findall(r'id=[\"\'](screen-[0-9]+|fa-[a-zA-Z0-9_-]+)[\"\']', content)
        print(f'  Screens/IDs: {set(screens)}')
    except Exception as e:
        print(f'Error reading {path}: {e}')
