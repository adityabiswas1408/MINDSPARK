import os
import shutil
import sys

sys.stdout.reconfigure(encoding='utf-8')

mindspark_dir = r'A:\MS\mindspark'
other_dir = r'A:\MS\other\mindspark_clutter'
os.makedirs(other_dir, exist_ok=True)

# List of folders to archive
folders_to_move = [
    # IDE / Third-party Agent Dot Folders
    '.adal', '.agent', '.augment', '.codebuddy', '.commandcode', '.continue',
    '.cortex', '.crush', '.factory', '.goose', '.iflow', '.junie',
    '.kilocode', '.kiro', '.kode', '.mcpjam', '.mux', '.neovate',
    '.openhands', '.pi', '.pochi', '.qoder', '.qwen', '.roo',
    '.trae', '.vibe', '.windsurf', '.zencoder', '.superpowers', '.playwright-mcp',
    # Legacy Task / Test Output Folders
    'T1', 'T2', 't3', 'TASK 5', 'new convo', 'client-deliverables',
    'k6-results', 'playwright-report', 'playwright-results', 'skills'
]

# List of files to archive
files_to_move = [
    # Log files and build dumps
    'build-output.txt', 'build-output2.txt', 'build-output3.txt',
    'build-output4.txt', 'build-output5.txt', 'vitest_output.txt',
    # Scraper scripts and JSONs
    'audit-admin-dom.js', 'audit-admin.js', 'audit-student-dom.js',
    'fetch-css.js', 'fetch-prod-css.js', 'audit-admin-results.json',
    'audit-admin-dom.json', 'audit-student-dom.json',
    # Snapshots and duplicate markdown dumps
    'snap.md', 'snap2.md', 'snap3.md', 'snap4.md',
    'UI_DIAGNOSTIC_REPORT.md', 'mindspark_diagnostic_audit_v2.md', 'stack-audit.md'
]

moved_folders = []
moved_files = []

for folder in folders_to_move:
    src = os.path.join(mindspark_dir, folder)
    dst = os.path.join(other_dir, folder)
    if os.path.exists(src):
        if os.path.exists(dst):
            shutil.rmtree(dst)
        shutil.move(src, dst)
        moved_folders.append(folder)
        print(f"Moved directory: {folder}")

for f in files_to_move:
    src = os.path.join(mindspark_dir, f)
    dst = os.path.join(other_dir, f)
    if os.path.exists(src):
        if os.path.exists(dst):
            os.remove(dst)
        shutil.move(src, dst)
        moved_files.append(f)
        print(f"Moved file: {f}")

print(f"\nCleanup completed!")
print(f"Total folders moved: {len(moved_folders)}")
print(f"Total files moved: {len(moved_files)}")

# Write manifest into docs
manifest_path = os.path.join(mindspark_dir, 'docs', 'CLEANUP_MANIFEST.txt')
with open(manifest_path, 'w', encoding='utf-8') as f:
    f.write("=== MINDSPARK CLEANUP MANIFEST ===\n\n")
    f.write("Folders moved to A:\\MS\\other\\mindspark_clutter:\n")
    for d in sorted(moved_folders):
        f.write(f"  [DIR]  {d}\n")
    f.write("\nFiles moved to A:\\MS\\other\\mindspark_clutter:\n")
    for fl in sorted(moved_files):
        f.write(f"  [FILE] {fl}\n")

print(f"Manifest written to: {manifest_path}")
