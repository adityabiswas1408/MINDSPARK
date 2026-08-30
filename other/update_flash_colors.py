import re

with open(r'A:\MS\flash_anzan_mockup.html', 'r', encoding='utf-8') as f:
    text = f.read()

# Replace #40916C with #1A3829
text_updated = text.replace('#40916C', '#1A3829')
# Replace #52B788 with #2D6A4F where it's used as button/accent or keep as text accent
text_updated = text_updated.replace('background: #40916C;', 'background: #1A3829;')
text_updated = text_updated.replace('background-color: #40916C;', 'background-color: #1A3829;')

with open(r'A:\MS\flash_anzan_mockup.html', 'w', encoding='utf-8') as f:
    f.write(text_updated)

print("Updated flash_anzan_mockup.html with brand primary green (#1A3829)!")
