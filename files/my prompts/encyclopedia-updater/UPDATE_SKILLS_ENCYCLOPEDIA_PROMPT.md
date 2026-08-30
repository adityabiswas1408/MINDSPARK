USE prompt-optimizer, verification-before-completion, AND full-output-enforcement SKILLS TO EXECUTE:

### Goal:
Synchronize and update `A:\MS\files\AGENT_SKILLS_COMPREHENSIVE_ENCYCLOPEDIA.md` whenever skills in `A:\MS\mindspark\.agents\skills/` are modified, added, or deleted.

---

### Execution Instructions:

1. **Change Detection & Audit:**
   - Scan `A:\MS\mindspark\.agents\skills/` for all skills.
   - Run the intelligent sync engine with `--dry-run` to inspect which skills have modified checksums or missing documentation:
     ```powershell
     python "A:\MS\files\my prompts\encyclopedia-updater\update_encyclopedia.py" --dry-run
     ```

2. **Incremental Update Execution:**
   - Run the sync engine to automatically query the LLM API ONLY for new or modified skills:
     ```powershell
     python "A:\MS\files\my prompts\encyclopedia-updater\update_encyclopedia.py"
     ```
   - *Optional:* To force-regenerate a single specific skill (e.g. `prompt-optimizer`):
     ```powershell
     python "A:\MS\files\my prompts\encyclopedia-updater\update_encyclopedia.py" --force prompt-optimizer
     ```

3. **Integrity & Verification:**
   - Confirm that the total documented skills in `AGENT_SKILLS_COMPREHENSIVE_ENCYCLOPEDIA.md` matches the count of directories on disk.
   - Verify that all headings are sequentially numbered (1..N) in alphabetical order.
   - Ensure zero placeholder comments (`// ...`) or missing sections exist in the updated documentation.
