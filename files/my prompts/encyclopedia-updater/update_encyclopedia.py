import os
import json
import hashlib
import requests
import time
import shutil
import argparse

# ==============================================================================
# CONFIGURATION
# ==============================================================================
API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
MODEL = "z-ai/glm-5.3-flash"
SKILLS_DIR = r"A:\MS\mindspark\.agents\skills"
OUTPUT_FILE = r"A:\MS\files\AGENT_SKILLS_COMPREHENSIVE_ENCYCLOPEDIA.md"
PROGRESS_FILE = r"A:\MS\files\scripts\generation_progress.json"
HASH_REGISTRY_FILE = r"A:\MS\files\scripts\skill_hashes.json"

PROMPT_TEMPLATE = """You are an elite technical documentation agent.
Your task is to comprehensively document the following AI agent skill following a strict 7-section schema.
You MUST output ONLY the raw markdown for this skill. Do NOT wrap the entire output in markdown code fences (```markdown). Output valid markdown directly. Do NOT include conversational greetings or conclusions.

### Skill Context & Raw Files:
Below is the raw file content for the skill `{skill_name}`.
{file_contents}

### Mandatory Output Schema:
Generate the documentation exactly in this format. Do not omit any sections.

## {index}. `{skill_name}`

- **Canonical Directory:** `.agents/skills/{skill_name}/`
- **Author & Version:** [Extract from SKILL.md metadata, or state "Workspace Built-in"]
- **Primary Domain & Category:** [Extract from SKILL.md or categorize logically]

### 1. Executive Summary & Core Working Principle
[In-depth explanation of the philosophy, core mental model, and fundamental objective of this skill based on the SKILL.md]

### 2. When to Use (Positive Triggers) vs. When NOT to Use (Negative Triggers)
- **Positive Triggers:** [Verbatim phrases, explicit scenarios, and workflows where this skill MUST be activated]
- **Negative Triggers / Anti-Patterns:** [Scenarios where this skill should NOT be used and what alternative to use instead]

### 3. Hard Execution Gates & Invariants
[Explicit listing of all <HARD-GATE>, mandatory halts, approval requirements, or behavioral invariants enforced by this skill.]

### 4. Step-by-Step Execution Workflow & Pipeline
[Comprehensive, step-by-step breakdown of how the skill executes from entry to completion, including all phases.]

### 5. Supporting Files, Scripts & Internal Assets Breakdown
| File Name | File Type | Purpose & Exact Working Mechanism |
| :--- | :--- | :--- |
[Extract this table based on the files provided. If only SKILL.md exists, explicitly write "Self-contained single-file skill" instead of a table. If there are .py, .sh, .ts, or .json files, describe their exact CLI flags, mechanisms, and schemas.]

### 6. Inputs, Outputs & Produced Artifacts
- **Expected Inputs:** [Prompts, file paths, raw data, or arguments required]
- **Produced Outputs / Artifacts:** [Exact file paths, reports, or PRD documents created]

### 7. Ecosystem Coordination & Related Skills
- **Pairs With:** [Complementary skills that should be invoked alongside it]
- **Conflicts / Disambiguation:** [How this skill differs from closely related skills]
"""

# ==============================================================================
# HASHING & CHANGE DETECTION
# ==============================================================================
def compute_skill_hash(skill_path):
    """Computes a SHA-256 fingerprint for all text files inside a skill directory."""
    hasher = hashlib.sha256()
    file_count = 0
    
    for root, _, files in sorted(os.walk(skill_path)):
        for file in sorted(files):
            file_path = os.path.join(root, file)
            if ".git" in file_path or "node_modules" in file_path:
                continue
            if not file.endswith(('.md', '.py', '.sh', '.json', '.txt', '.ts', '.html', '.js', '.xml', '.xsd')):
                continue
            
            try:
                rel_path = os.path.relpath(file_path, skill_path).replace("\\", "/")
                hasher.update(rel_path.encode('utf-8'))
                with open(file_path, 'rb') as f:
                    while chunk := f.read(65536):
                        hasher.update(chunk)
                file_count += 1
            except Exception as e:
                print(f"  [WARN] Failed to hash {file_path}: {e}")
                
    return hasher.hexdigest(), file_count

def get_skill_files(skill_path):
    """Gathers all text files into a single context payload."""
    files_content = []
    for root, _, files in sorted(os.walk(skill_path)):
        for file in sorted(files):
            file_path = os.path.join(root, file)
            if ".git" in file_path or "node_modules" in file_path:
                continue
            if not file.endswith(('.md', '.py', '.sh', '.json', '.txt', '.ts', '.html', '.js', '.xml', '.xsd')):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
                    content = f.read()
                    
                if len(content) > 100000:
                    content = content[:100000] + "\n...[TRUNCATED]"
                    
                rel_path = os.path.relpath(file_path, skill_path).replace("\\", "/")
                files_content.append(f"--- START FILE: {rel_path} ---\n{content}\n--- END FILE: {rel_path} ---")
            except Exception as e:
                print(f"Error reading {file_path}: {e}", flush=True)
                
    return "\n\n".join(files_content)

def detect_changes():
    """Scans .agents/skills/ and compares with stored hashes and cache."""
    skills_on_disk = sorted([d for d in os.listdir(SKILLS_DIR) if os.path.isdir(os.path.join(SKILLS_DIR, d))])
    
    # Load stored hashes
    stored_hashes = {}
    if os.path.exists(HASH_REGISTRY_FILE):
        try:
            with open(HASH_REGISTRY_FILE, 'r', encoding='utf-8-sig') as f:
                stored_hashes = json.load(f)
        except Exception:
            stored_hashes = {}
            
    # Load progress cache
    progress = {}
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8-sig') as f:
                progress = json.load(f)
        except Exception:
            progress = {}
            
    current_hashes = {}
    new_skills = []
    modified_skills = []
    unchanged_skills = []
    
    for idx, skill in enumerate(skills_on_disk, 1):
        skill_path = os.path.join(SKILLS_DIR, skill)
        h, count = compute_skill_hash(skill_path)
        current_hashes[skill] = {"hash": h, "files": count, "index": idx}
        
        str_idx = str(idx)
        is_cached = str_idx in progress and "ERROR: Failed to generate" not in progress[str_idx]
        
        if skill not in stored_hashes or not is_cached:
            new_skills.append((idx, skill))
        elif stored_hashes[skill].get("hash") != h:
            modified_skills.append((idx, skill))
        else:
            unchanged_skills.append((idx, skill))
            
    deleted_skills = [s for s in stored_hashes if s not in current_hashes]
    
    return {
        "all_skills": skills_on_disk,
        "new": new_skills,
        "modified": modified_skills,
        "unchanged": unchanged_skills,
        "deleted": deleted_skills,
        "current_hashes": current_hashes,
        "progress": progress
    }

# ==============================================================================
# LLM GENERATION
# ==============================================================================
def process_skill(skill_name, index, total):
    print(f"\n[{index}/{total}] Generating documentation: {skill_name}...", flush=True)
    skill_path = os.path.join(SKILLS_DIR, skill_name)
    file_contents = get_skill_files(skill_path)
    
    prompt = PROMPT_TEMPLATE.format(skill_name=skill_name, file_contents=file_contents, index=index)
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": MODEL,
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"  > Attempt {attempt+1}... querying {MODEL}", flush=True)
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=120)
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content'].strip()
                if content.startswith("```markdown"):
                    content = content[len("```markdown"):].strip()
                if content.startswith("```"):
                    content = content[3:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()
                print(f"  [SUCCESS] Successfully generated {skill_name}", flush=True)
                return content
            else:
                print(f"  [WARNING] Error {response.status_code} on {skill_name}: {response.text}", flush=True)
                time.sleep(3)
        except Exception as e:
            print(f"  [WARNING] Exception on {skill_name}: {e}", flush=True)
            time.sleep(3)
            
    print(f"  [FAIL] Failed to document {skill_name} after {max_retries} attempts.", flush=True)
    return None

# ==============================================================================
# MAIN SYNC ENGINE
# ==============================================================================
def sync_encyclopedia(dry_run=False, force_skill=None):
    print("==================================================================")
    print("      INTELLIGENT AGENT SKILLS ENCYCLOPEDIA SYNC ENGINE          ")
    print("==================================================================")
    
    diff = detect_changes()
    all_skills = diff["all_skills"]
    total = len(all_skills)
    
    print(f"\nInventory Audit:")
    print(f"  - Total Skills on Disk: {total}")
    print(f"  - Unchanged (Cached)  : {len(diff['unchanged'])}")
    print(f"  - New Skills Detected : {len(diff['new'])}")
    print(f"  - Modified Skills     : {len(diff['modified'])}")
    print(f"  - Deleted Skills      : {len(diff['deleted'])}")
    
    if diff["new"]:
        print("\n[NEW SKILLS]:")
        for idx, s in diff["new"]:
            print(f"  + [{idx}/{total}] {s}")
            
    if diff["modified"]:
        print("\n[MODIFIED SKILLS]:")
        for idx, s in diff["modified"]:
            print(f"  ~ [{idx}/{total}] {s}")
            
    if diff["deleted"]:
        print("\n[DELETED SKILLS]:")
        for s in diff["deleted"]:
            print(f"  - {s}")
            
    to_update = diff["new"] + diff["modified"]
    if force_skill:
        matching = [(idx, s) for idx, s in enumerate(all_skills, 1) if s == force_skill]
        if matching:
            to_update = matching
            print(f"\n[FORCE MODE] Target forced skill: {force_skill}")
            
    if not to_update and not diff["deleted"]:
        print("\n[UP TO DATE] All skills match current checksums. No updates required.")
        return
        
    if dry_run:
        print("\n[DRY RUN] Completed analysis. No API calls made.")
        return
        
    progress = diff["progress"]
    
    # Process only modified/new skills
    for idx, skill in to_update:
        str_idx = str(idx)
        doc = process_skill(skill, idx, total)
        if doc:
            progress[str_idx] = doc
        else:
            print(f"  [SKIPPED CACHING] Error generating {skill}")
            
    # Save Backups
    os.makedirs(os.path.dirname(PROGRESS_FILE), exist_ok=True)
    if os.path.exists(PROGRESS_FILE):
        shutil.copyfile(PROGRESS_FILE, PROGRESS_FILE + ".bak")
    if os.path.exists(OUTPUT_FILE):
        shutil.copyfile(OUTPUT_FILE, OUTPUT_FILE + ".bak")
        
    # Write updated Progress Cache
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f, indent=2, ensure_ascii=False)
        
    # Write updated Hash Registry
    with open(HASH_REGISTRY_FILE, 'w', encoding='utf-8') as f:
        json.dump(diff["current_hashes"], f, indent=2, ensure_ascii=False)
        
    # Rebuild Master Markdown Encyclopedia
    print(f"\nRebuilding master document: {OUTPUT_FILE}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        f.write("# Mindspark Agent Skills Comprehensive Encyclopedia\n\n")
        f.write("> **Exhaustive standalone technical reference covering all 57 skills, their execution pipelines, schemas, and supporting assets.**\n\n")
        f.write("---\n\n")
        
        written_count = 0
        for k in range(1, total + 1):
            str_k = str(k)
            if str_k in progress and "ERROR: Failed to generate" not in progress[str_k]:
                # Ensure correct heading numbering in case of index shifts
                skill_name = all_skills[k - 1]
                section_text = progress[str_k]
                
                # Normalize heading index
                import re
                section_text = re.sub(r'^##\s+\d+\.\s+`[^`]+`', f'## {k}. `{skill_name}`', section_text, count=1, flags=re.MULTILINE)
                
                f.write(section_text)
                f.write("\n\n---\n\n")
                written_count += 1
                
    print(f"[SUCCESS] Encyclopedia successfully synchronized ({written_count}/{total} skills documented)!\n")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Intelligent Agent Skills Encyclopedia Sync Engine")
    parser.add_argument("--dry-run", action="store_true", help="Inspect differences without calling API")
    parser.add_argument("--force", type=str, default=None, help="Force regenerate a specific skill name")
    args = parser.parse_args()
    
    sync_encyclopedia(dry_run=args.dry_run, force_skill=args.force)
