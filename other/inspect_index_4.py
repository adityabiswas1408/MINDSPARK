import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def main():
    with open('a:/MS/index_desktop_incomplete.html', 'r', encoding='utf-8') as f:
        content = f.read()

    idx1 = content.find('Assessment-Taking')
    if idx1 != -1:
        print("Found Assessment-Taking at", idx1)
        print("Snippet around it:")
        print(content[max(0, idx1 - 200):idx1 + 200])
        print("\n" + "="*50 + "\n")

    idx2 = content.find('Assessment-Taking', idx1 + 10)
    if idx2 != -1:
        print("Found second Assessment-Taking at", idx2)
        print("Snippet around it:")
        print(content[max(0, idx2 - 500):idx2 + 500])
        print("\n" + "="*50 + "\n")

    # Look for Results Flow just after idx2
    idx3 = content.find('Results Flow', idx2 + 10)
    if idx3 != -1:
        print("Found Results Flow near idx2 at", idx3)
        print("Snippet between them:")
        print(content[idx2:idx3 + 200])

if __name__ == '__main__':
    main()
