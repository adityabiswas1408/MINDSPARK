import os
import json
import requests
import time
import shutil

API_KEY = os.environ.get("OPENROUTER_API_KEY", "")
SKILLS_DIR = r"A:\MS\mindspark\.agents\skills"
OUTPUT_FILE = r"A:\MS\files\AGENT_SKILLS_COMPREHENSIVE_ENCYCLOPEDIA.md"
PROGRESS_FILE = r"A:\MS\files\scripts\generation_progress.json"

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

def get_skill_files(skill_path):
    files_content = []
    for root, _, files in os.walk(skill_path):
        for file in files:
            file_path = os.path.join(root, file)
            # Skip binary files or git folders
            if ".git" in file_path or "node_modules" in file_path:
                continue
            # Only read text files
            if not file.endswith(('.md', '.py', '.sh', '.json', '.txt', '.ts', '.html', '.js', '.xml', '.xsd')):
                continue
                
            try:
                with open(file_path, 'r', encoding='utf-8-sig', errors='ignore') as f:
                    content = f.read()
                    
                # Truncate extremely large files if necessary
                if len(content) > 100000:
                    content = content[:100000] + "\n...[TRUNCATED]"
                    
                rel_path = os.path.relpath(file_path, skill_path)
                files_content.append(f"--- START FILE: {rel_path} ---\n{content}\n--- END FILE: {rel_path} ---")
            except Exception as e:
                print(f"Error reading {file_path}: {e}", flush=True)
                
    return "\n\n".join(files_content)

def process_skill(skill_name, index, total):
    print(f"\n[{index}/{total}] Processing skill: {skill_name}...", flush=True)
    skill_path = os.path.join(SKILLS_DIR, skill_name)
    file_contents = get_skill_files(skill_path)
    
    prompt = PROMPT_TEMPLATE.format(skill_name=skill_name, file_contents=file_contents, index=index)
    
    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "model": "z-ai/glm-5.3-flash",
        "messages": [
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.2
    }
    
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"  > Attempt {attempt+1}... requesting API", flush=True)
            response = requests.post("https://openrouter.ai/api/v1/chat/completions", headers=headers, json=payload, timeout=120)
            if response.status_code == 200:
                data = response.json()
                content = data['choices'][0]['message']['content'].strip()
                # Clean any wrapping markdown fences if returned
                if content.startswith("```markdown"):
                    content = content[len("```markdown"):].strip()
                if content.startswith("```"):
                    content = content[3:].strip()
                if content.endswith("```"):
                    content = content[:-3].strip()
                print(f"  [SUCCESS] Successfully documented {skill_name}", flush=True)
                return content
            else:
                print(f"  [WARNING] Error {response.status_code} on {skill_name}: {response.text}", flush=True)
                time.sleep(3)
        except Exception as e:
            print(f"  [WARNING] Exception on {skill_name}: {e}", flush=True)
            time.sleep(3)
            
    print(f"  [FAIL] Failed to document {skill_name} after {max_retries} attempts.", flush=True)
    return f"## {index}. `{skill_name}`\n\nERROR: Failed to generate documentation after {max_retries} attempts."

def main():
    if not os.path.exists(SKILLS_DIR):
        print(f"Skills directory not found: {SKILLS_DIR}", flush=True)
        return
        
    skills = [d for d in os.listdir(SKILLS_DIR) if os.path.isdir(os.path.join(SKILLS_DIR, d))]
    skills.sort()
    
    total = len(skills)
    print(f"Found {total} skills in {SKILLS_DIR}.\n", flush=True)
    
    # Load progress with strict BOM and parse safety (NEVER silently wipe)
    progress = {}
    if os.path.exists(PROGRESS_FILE):
        try:
            with open(PROGRESS_FILE, 'r', encoding='utf-8-sig') as f:
                progress = json.load(f)
            # Create a safety backup
            shutil.copyfile(PROGRESS_FILE, PROGRESS_FILE + ".bak")
            print(f"Loaded valid cache with {len(progress)}/{total} skills. Backup created.", flush=True)
        except Exception as e:
            print(f"FATAL ERROR: Failed to parse existing progress file {PROGRESS_FILE}: {e}", flush=True)
            print("ABORTING to prevent accidental data loss. Fix the file manually before restarting.", flush=True)
            return

    # Backup existing encyclopedia file if it exists
    if os.path.exists(OUTPUT_FILE):
        shutil.copyfile(OUTPUT_FILE, OUTPUT_FILE + ".bak")
            
    for i, skill in enumerate(skills, 1):
        str_idx = str(i)
        if str_idx in progress and "ERROR: Failed to generate" not in progress[str_idx]:
            print(f"[{i}/{total}] Skipping already cached skill: {skill}", flush=True)
            continue
            
        doc = process_skill(skill, i, total)
        if "ERROR: Failed to generate" not in doc:
            progress[str_idx] = doc
        else:
            print(f"  [NOTICE] Not caching error state for skill {skill}", flush=True)
        
        # Save progress checkpoint
        os.makedirs(os.path.dirname(PROGRESS_FILE), exist_ok=True)
        with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
            json.dump(progress, f, indent=2, ensure_ascii=False)
            
        # Write running document
        os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
        with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
            f.write("# Mindspark Agent Skills Comprehensive Encyclopedia\n\n")
            f.write("> **Exhaustive standalone technical reference covering all 57 skills, their execution pipelines, schemas, and supporting assets.**\n\n")
            f.write("---\n\n")
            for k in range(1, total + 1):
                if str(k) in progress and "ERROR: Failed to generate" not in progress[str(k)]:
                    f.write(progress[str(k)])
                    f.write("\n\n---\n\n")
                    
        time.sleep(0.5) # Gentle pacing
        
    print(f"\n[DONE] Completed! Encyclopedia saved to: {OUTPUT_FILE}", flush=True)

if __name__ == "__main__":
    main()



