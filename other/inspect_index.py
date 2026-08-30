import re

def main():
    with open('a:/MS/index_desktop_incomplete.html', 'r', encoding='utf-8') as f:
        content = f.read()

    print("Index size:", len(content))

    # Find Student sections
    student_matches = re.finditer(r'<section id="section-.*?">.*?</section>', content, re.DOTALL)
    for m in student_matches:
        if 'Assessment-Taking (v5)' in m.group(0):
            print("Found Assessment-Taking (v5) section.")
        if 'Results Flow' in m.group(0):
            print("Found Results Flow section.")

    # Find the dropdown
    nav_match = re.search(r'<nav.*?</nav>', content, re.DOTALL)
    if nav_match:
        print("Found nav")
        nav_html = nav_match.group(0)
        # Look for Student dropdown
        if 'Assessment-Taking' in nav_html:
            print("Found Assessment-Taking in nav")

if __name__ == '__main__':
    main()
