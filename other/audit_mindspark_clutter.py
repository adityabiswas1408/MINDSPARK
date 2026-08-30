import os
import sys

sys.stdout.reconfigure(encoding='utf-8')

mindspark_dir = r'A:\MS\mindspark'

# Check subdirectories
dirs = [d for d in os.listdir(mindspark_dir) if os.path.isdir(os.path.join(mindspark_dir, d))]
files = [f for f in os.listdir(mindspark_dir) if os.path.isfile(os.path.join(mindspark_dir, f))]

print(f"Total subdirectories in mindspark: {len(dirs)}")
print(f"Total root files in mindspark: {len(files)}")

# Group directories
ide_agent_dirs = [d for d in dirs if d.startswith('.') and d not in ['.next', '.agents', '.claude', '.vercel', '.code-review-graph']]
task_dirs = [d for d in dirs if d in ['T1', 'T2', 't3', 'TASK 5', 'new convo', 'k6-results', 'playwright-report', 'playwright-results', 'client-deliverables', 'skills']]
core_dirs = [d for d in dirs if d in ['src', 'public', 'supabase', 'docs', 'e2e', 'k6', 'scripts', 'types', 'db', 'bugs', 'features', '.agents', '.claude', '.next', '.vercel', 'node_modules', '.code-review-graph']]

print("\n--- IDE / Tool Dot Dirs (Potential Clutter): ---")
for d in sorted(ide_agent_dirs):
    p = os.path.join(mindspark_dir, d)
    count = len(os.listdir(p)) if os.path.exists(p) else 0
    print(f"  {d} ({count} items)")

print("\n--- Legacy Task / Report Dirs: ---")
for d in sorted(task_dirs):
    p = os.path.join(mindspark_dir, d)
    count = len(os.listdir(p)) if os.path.exists(p) else 0
    print(f"  {d} ({count} items)")

print("\n--- Root Files Clutter (Logs, Snaps, Scrapers): ---")
log_files = [f for f in files if f.startswith('build-output') or f.startswith('snap') or f.startswith('audit-') or f.startswith('fetch-') or f in ['vitest_output.txt', 'stack-audit.md', 'mindspark_diagnostic_audit_v2.md', 'UI_DIAGNOSTIC_REPORT.md']]
for f in sorted(log_files):
    size = os.path.getsize(os.path.join(mindspark_dir, f))
    print(f"  {f} ({size} bytes)")
