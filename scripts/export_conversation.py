import json
import re
import os

log_path = r"C:\Users\ADI\.gemini\antigravity-ide\brain\7bd8a1f7-2e9a-44b5-be32-76885fb67a9c\.system_generated\logs\transcript.jsonl"
output_path = r"A:\MS\mindspark\docs\CONVERSATION_EXPORT_CURRENT.md"

entries = []
if os.path.exists(log_path):
    with open(log_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            try:
                data = json.loads(line)
                step_type = data.get("type")
                content = data.get("content", "")
                timestamp = data.get("timestamp", "")
                
                if step_type == "USER_INPUT" and content:
                    clean_content = content
                    if "<USER_REQUEST>" in clean_content:
                        match = re.search(r"<USER_REQUEST>\s*(.*?)\s*</USER_REQUEST>", clean_content, re.DOTALL)
                        if match:
                            clean_content = match.group(1)
                    elif "{{ CHECKPOINT" in clean_content:
                        # Extract user request portion if summary
                        clean_content = re.sub(r"# Conversation History.*", "", clean_content, flags=re.DOTALL)
                    
                    entries.append({"role": "User", "content": clean_content.strip(), "time": timestamp})
                elif step_type == "PLANNER_RESPONSE" and content:
                    entries.append({"role": "Assistant", "content": content.strip(), "time": timestamp})
            except Exception as e:
                pass

with open(output_path, "w", encoding="utf-8") as out:
    out.write("# MINDSPARK — Full Conversation & Execution Export\n\n")
    out.write("> **Session ID:** `7bd8a1f7-2e9a-44b5-be32-76885fb67a9c`  \n")
    out.write("> **Export Date:** 2026-08-23  \n")
    out.write("> **Workspace:** `A:\\MS\\mindspark`  \n\n")
    out.write("---\n\n")
    out.write("## Executive Summary of Session Accomplishments\n\n")
    out.write("1. **AI Onboarding Brief Creation:** Generated `ai_onboarding_brief.md` as the single source of truth for the codebase state.\n")
    out.write("2. **Skill Export & Cleanup:** Audited 55 workspace skills and successfully packaged 29 valid skills into compliant `.zip` bundles for Claude.ai upload.\n")
    out.write("3. **Tech Stack Audit (Salvage vs Rewrite):** Evaluated Next.js 15 + Supabase architecture and performed a code-level recon.\n")
    out.write("4. **Live Code Verification:** Verified that the 27 DB migrations exist, 49/49 Vitest suites pass, and all timing engine logic correctly uses `requestAnimationFrame`.\n")
    out.write("5. **Build Fixes:** Fixed `tsconfig.json` exclude rules to stop testing exported skill scripts, resulting in 0 errors and a clean Next.js production build.\n\n")
    out.write("---\n\n")
    out.write("## Chronological Conversation Log\n\n")
    
    turn = 1
    for entry in entries:
        role = entry["role"]
        content = entry["content"]
        if role == "User":
            out.write(f"### 👤 User (Turn {turn})\n\n")
            out.write(f"{content}\n\n")
        else:
            out.write(f"### 🤖 Assistant (Turn {turn})\n\n")
            out.write(f"{content}\n\n")
            out.write("---\n\n")
            turn += 1

print(f"Successfully generated {output_path} with {len(entries)} turns.")
