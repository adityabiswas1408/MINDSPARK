import re

def main():
    with open('a:/MS/index_desktop_incomplete.html', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the nav item
    nav_match = re.search(r'(<a[^>]*href="#[^"]*"[^>]*>[^<]*Assessment-Taking \(v5\)[^<]*</a>)', content, re.IGNORECASE)
    if nav_match:
        start = max(0, nav_match.start() - 200)
        end = min(len(content), nav_match.end() + 200)
        print("NAV SNIPPET:")
        print(content[start:end])
    
    print("-" * 50)

    # Find the sections
    sec_match = re.search(r'(<div class="gallery-section"[^>]*>.*?Assessment-Taking \(v5\).*?)(<div class="gallery-section"[^>]*>.*?Results Flow)', content, re.DOTALL | re.IGNORECASE)
    if sec_match:
        print("SECTION SNIPPET:")
        print(sec_match.group(1)[-300:])
        print("--- SPLIT ---")
        print(sec_match.group(2)[:300])

if __name__ == '__main__':
    main()
