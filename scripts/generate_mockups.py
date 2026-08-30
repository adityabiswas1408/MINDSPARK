import os
import base64

OUTPUT_DIR = r"A:\MS\mindspark\.agents\mockups\mindspark-v1"
os.makedirs(OUTPUT_DIR, exist_ok=True)
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "index.html")

def to_b64(html_str):
    return "data:text/html;base64," + base64.b64encode(html_str.encode('utf-8')).decode('utf-8')

# The shared CSS for the mockups (extracted from globals.css)
SHARED_HEAD = """
<head>
    <style>
        :root {
            --bg-page: #F8FAFC;
            --bg-card: #FFFFFF;
            --text-primary: #0F172A;
            --text-secondary: #475569;
            --clr-green-800: #1A3829;
            --clr-green-500: #40916C;
            --shadow-md: 0 4px 12px rgba(0,0,0,.08);
            --radius-card: 14px;
        }
        body {
            font-family: system-ui, sans-serif;
            background-color: var(--bg-page);
            color: var(--text-primary);
            margin: 0;
            padding: 24px;
        }
        .card {
            background: var(--bg-card);
            border-radius: var(--radius-card);
            box-shadow: var(--shadow-md);
            padding: 24px;
            border: 1px solid #E2E8F0;
        }
        .text-sm { font-size: 14px; color: var(--text-secondary); }
        .text-xl { font-size: 24px; font-weight: bold; margin-bottom: 8px; }
        .btn {
            background: var(--clr-green-800);
            color: white;
            padding: 8px 16px;
            border-radius: 6px;
            border: none;
            font-weight: bold;
            cursor: pointer;
        }
    </style>
    <script>
        const resizeObserver = new ResizeObserver(() => {
            window.parent.postMessage({ type: 'resize', height: document.documentElement.scrollHeight }, '*');
        });
        window.addEventListener('load', () => {
            resizeObserver.observe(document.body);
            window.parent.postMessage({ type: 'resize', height: document.documentElement.scrollHeight }, '*');
        });
    </script>
</head>
"""

screens = [
    {
        "id": "student-dashboard-empty",
        "group": "Student Flow",
        "title": "Screen 1 — Student Dashboard (Empty)",
        "note": "Default state for new students before any exams are assigned. ~10% of loads.",
        "html": f"""<!DOCTYPE html><html>{SHARED_HEAD}<body>
            <div class="card" style="text-align: center; padding: 64px 24px;">
                <h2 class="text-xl">Welcome to Mindspark!</h2>
                <p class="text-sm">You don't have any pending assessments right now.</p>
            </div>
        </body></html>"""
    },
    {
        "id": "student-dashboard-populated",
        "group": "Student Flow",
        "title": "Screen 2 — Student Dashboard (Populated)",
        "note": "Default state for active students. ~90% of loads.",
        "html": f"""<!DOCTYPE html><html>{SHARED_HEAD}<body>
            <div class="card">
                <h2 class="text-xl">Your Assessments</h2>
                <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <div style="font-weight: bold;">Term 3 Final Exam (Cohort B)</div>
                        <div class="text-sm">Due: Tomorrow at 11:59 PM</div>
                    </div>
                    <button class="btn">Start Now</button>
                </div>
            </div>
        </body></html>"""
    },
    {
        "id": "student-anzan",
        "group": "Student Flow",
        "title": "Screen 3 — Flash Anzan (Active)",
        "note": "The core assessment player with timing engine running.",
        "html": f"""<!DOCTYPE html><html>{SHARED_HEAD}<body style="display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0;">
            <div style="font-size: 120px; font-weight: bold; font-family: monospace; color: var(--clr-green-800);">7,492</div>
        </body></html>"""
    },
    {
        "id": "admin-dashboard",
        "group": "Admin Flow",
        "title": "Screen 4 — Admin Dashboard",
        "note": "Aggregate statistics for an institution admin.",
        "html": f"""<!DOCTYPE html><html>{SHARED_HEAD}<body>
            <h1 class="text-xl">Global Overview</h1>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 24px;">
                <div class="card"><div class="text-sm">Active Students</div><div style="font-size: 32px; font-weight: bold;">1,284</div></div>
                <div class="card"><div class="text-sm">Pending Submissions</div><div style="font-size: 32px; font-weight: bold;">42</div></div>
                <div class="card"><div class="text-sm">Average Score</div><div style="font-size: 32px; font-weight: bold; color: var(--clr-green-500);">87.4%</div></div>
            </div>
        </body></html>"""
    },
    {
        "id": "admin-announcements",
        "group": "Admin Flow",
        "title": "Screen 5 — Announcements Editor",
        "note": "TipTap editor integration for broadcasting messages.",
        "html": f"""<!DOCTYPE html><html>{SHARED_HEAD}<body>
            <div class="card">
                <h2 class="text-xl">Compose Announcement</h2>
                <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; margin: 16px 0;">
                    <div style="border-bottom: 1px solid #E2E8F0; padding-bottom: 8px; margin-bottom: 8px; font-weight: bold;">B I U <span style="color: #ccc;">|</span> H1 H2</div>
                    <div style="min-height: 150px; color: var(--text-secondary);">Type your announcement here...</div>
                </div>
                <button class="btn">Publish to Students</button>
            </div>
        </body></html>"""
    }
]

html_out = [
    "<!DOCTYPE html>",
    "<html><head><meta charset='utf-8'><title>Mindspark Mockups</title>",
    "<style>",
    "body { font-family: system-ui, sans-serif; background: #E2E8F0; margin: 0; padding: 0; }",
    ".topbar { position: sticky; top: 0; background: white; padding: 16px 24px; border-bottom: 1px solid #CBD5E1; display: flex; justify-content: space-between; align-items: center; z-index: 100; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }",
    ".container { max-width: 1000px; margin: 40px auto; }",
    ".preview-wrapper { background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); margin-bottom: 48px; border: 1px solid #CBD5E1; }",
    ".preview-header { background: #F8FAFC; border-bottom: 1px solid #E2E8F0; padding: 12px 20px; font-weight: bold; font-family: monospace; font-size: 13px; color: #475569; }",
    "iframe { width: 100%; border: none; display: block; }",
    ".screen-meta { margin-bottom: 16px; }",
    ".screen-title { font-size: 20px; font-weight: bold; margin: 0 0 8px 0; color: #0F172A; }",
    ".screen-note { font-size: 14px; color: #475569; margin: 0; line-height: 1.5; }",
    ".group-title { font-size: 13px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #64748B; margin: 64px 0 24px 0; }",
    "</style>",
    "<script>",
    "window.addEventListener('message', (e) => {",
    "    if (e.data.type === 'resize') {",
    "        const iframes = document.querySelectorAll('iframe');",
    "        iframes.forEach(iframe => {",
    "            if (iframe.contentWindow === e.source) {",
    "                iframe.style.height = e.data.height + 'px';",
    "            }",
    "        });",
    "    }",
    "});",
    "</script>",
    "</head><body>",
    "<div class='topbar'>",
    "  <div style='font-weight: bold; font-size: 18px;'>Mindspark Mockups</div>",
    "  <select onchange='location.hash = this.value;'>"
]

for s in screens:
    html_out.append(f"<option value='{s['id']}'>{s['title']}</option>")
html_out.append("</select>")
html_out.append(f"<div style='font-size: 14px; color: #64748B;'>{len(screens)} States</div>")
html_out.append("</div>")

html_out.append("<div class='container'>")

current_group = ""
for s in screens:
    if s['group'] != current_group:
        current_group = s['group']
        html_out.append(f"<div class='group-title'>{current_group}</div>")
    
    html_out.append(f"<div class='screen-meta' id='{s['id']}'>")
    html_out.append(f"  <h2 class='screen-title'>{s['title']}</h2>")
    html_out.append(f"  <p class='screen-note'>{s['note']}</p>")
    html_out.append(f"</div>")
    html_out.append(f"<div class='preview-wrapper'>")
    html_out.append(f"  <div class='preview-header'>PREVIEW: /{s['id']}</div>")
    html_out.append(f"  <iframe src='{to_b64(s['html'])}'></iframe>")
    html_out.append(f"</div>")

html_out.append("</div></body></html>")

with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("\n".join(html_out))

print(f"Gallery generated at {OUTPUT_FILE}")
