import sys
import re

file_path = "a:\\MS\\index_complete.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# We need to find the <script> block containing the specific string and remove the entire block.
# Since there might be other script blocks, we want to make sure we match the correct opening and closing tags.
# A safe way is to find the index of the specific string, then search backwards for '<script>' and forwards for '</script>'.

target_string = 'const iframes = document.querySelectorAll("iframe[data-srcdoc]");'

# Find all occurrences of the target string
while target_string in content:
    idx = content.find(target_string)
    
    # Find the nearest <script> before the string
    start_idx = content.rfind('<script>', 0, idx)
    # Find the nearest </script> after the string
    end_idx = content.find('</script>', idx)
    
    if start_idx != -1 and end_idx != -1:
        # Include the closing tag in the deletion
        end_idx += len('</script>')
        
        # We also might want to remove any trailing newline or whitespace just after it, 
        # but to be perfectly safe, we'll just remove exactly from <script> to </script>
        
        content = content[:start_idx] + content[end_idx:]
    else:
        # If we somehow can't find the tags, break to avoid infinite loop
        break

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Robust cleanup applied using index search.")
