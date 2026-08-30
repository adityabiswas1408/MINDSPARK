import sys

file_path = "a:\\MS\\index_complete.html"

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. The .main Clipping Bug (Admin Screens)
content = content.replace(
    ".main { flex: 1; padding: 32px 40px 40px; overflow: hidden; }",
    ".main { flex: 1; padding: 32px 40px 40px; overflow: visible; }"
)

# 2. The Risky #top ID Bug (Student Dashboard)
content = content.replace(
    '<option value="#top">Student Dashboard</option>',
    '<option value="#student-dashboard">Student Dashboard</option>'
)
content = content.replace(
    '<div class="screen-block" id="top">',
    '<div class="screen-block" id="student-dashboard">'
)
content = content.replace(
    'href="#top"',
    'href="#student-dashboard"'
)

# 3. Flash Screens Hard Clipping Bug
# Only inside the srcdoc of flash-mcq, flash-review, and exam-complete
# To do this safely, we will find those specific iframe blocks and do a replace within them.
import re
def fix_flash_screens(content):
    target_titles = ['Flash Anzan — MCQ Answering', 'Flash Anzan — Review & Submit', 'Exam Completion']
    # The user specifically mentioned the screen identifiers: flash-mcq, flash-review, exam-complete. 
    # But those are probably IDs or classes or titles.
    # Let's just look for the class="screen-iframe" and title="..." or similar.
    # Actually, we can just replace it globally IF we ensure we don't touch flash-display.
    # Wait, the instruction says "Apply this strictly inside the srcdoc blocks of flash-mcq, flash-review, and exam-complete."
    # The easiest way is to split the content by "<iframe", do the replace only if it contains the right identifier, and join back.
    parts = content.split('<iframe ')
    for i in range(1, len(parts)):
        # Check if this iframe is one of the target ones
        if 'flash-mcq' in parts[i] or 'flash-review' in parts[i] or 'exam-complete' in parts[i] or \
           'Flash Anzan — MCQ Answering' in parts[i] or 'Flash Anzan — Review & Submit' in parts[i] or 'Exam Completion' in parts[i]:
            parts[i] = parts[i].replace("overflow: hidden; min-height: 100vh;", "min-height: 100vh;")
    return '<iframe '.join(parts)

content = fix_flash_screens(content)

# 4. 31 Simultaneous Iframes Render Stall
content = content.replace(
    '        srcdoc="<!DOCTYPE html>',
    '        data-srcdoc="<!DOCTYPE html>'
)

script_to_inject = """<script>
document.addEventListener("DOMContentLoaded", () => {
  const iframes = document.querySelectorAll("iframe[data-srcdoc]");
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const iframe = entry.target;
        iframe.setAttribute("srcdoc", iframe.getAttribute("data-srcdoc"));
        iframe.removeAttribute("data-srcdoc");
        obs.unobserve(iframe);
      }
    });
  }, { rootMargin: "400px" });
  iframes.forEach(iframe => observer.observe(iframe));
});
</script>
</body>"""

content = content.replace('</body>', script_to_inject)

# 5. Google Fonts URL Invalid HTML
content = content.replace(
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">',
    '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&amp;family=DM+Mono:wght@400;500&amp;display=swap" rel="stylesheet">'
)

# 6. Deprecated Iframe Attributes
# Strip these attributes out of all 31 <iframe> tags independently.
# "Find 1: frameborder="0" Replace With 1: (Leave empty to delete)"
# "Find 2: scrolling="no" Replace With 2: (Leave empty to delete)"
# We'll replace it inside iframe tags to be safe, or just globally since the prompt says "Strip these attributes out of all 31 <iframe> tags independently."
# It's safest to just globally replace them if they are only used for iframes, or just replace within `<iframe` segments.
parts = content.split('<iframe ')
for i in range(1, len(parts)):
    iframe_end = parts[i].find('>')
    if iframe_end != -1:
        iframe_tag = parts[i][:iframe_end]
        iframe_tag = iframe_tag.replace(' frameborder="0"', '')
        iframe_tag = iframe_tag.replace(' scrolling="no"', '')
        parts[i] = iframe_tag + parts[i][iframe_end:]
content = '<iframe '.join(parts)


# 7. Dead .admin-layout CSS
content = content.replace(
    ".admin-layout { display: flex; min-height: 100vh; }",
    ""
)

# 8. Missing Screen-Path Metadata
screens = [
    ("Login", "src/views/auth/login.html"),
    ("Student Consent", "src/views/student/consent.html"),
    ("Exam Lobby", "src/views/student/lobby.html"),
    ("Flash Anzan — Number Display", "src/views/student/flash/display.html"),
    ("Flash Anzan — MCQ Answering", "src/views/student/flash/mcq.html"),
    ("Flash Anzan — Review & Submit", "src/views/student/flash/review.html"),
    ("Exam Completion", "src/views/student/exam-complete.html"),
    ("Flash Anzan — Configuration", "src/views/admin/flash/config.html"),
    ("Monitor — Detail", "src/views/admin/monitor/detail.html"),
    ("Activity Log", "src/views/admin/activity.html"),
    ("Announcements", "src/views/admin/announcements.html"),
]

for title, path in screens:
    # Use exact match as requested
    find_str = f'          <h2 class="screen-title">{title}</h2>'
    # Check if there is already a `<code class="screen-path">` or `<p class="path">` following it.
    # If not, append it. If yes, replace it. 
    # The instructions say:
    # Find:
    #           <h2 class="screen-title">Login</h2>
    # Replace With:
    #           <h2 class="screen-title">Login</h2>
    #           <p class="path">src/views/auth/login.html</p>
    replace_str = f'          <h2 class="screen-title">{title}</h2>\n          <p class="path">{path}</p>'
    content = content.replace(find_str, replace_str)
    
    # We must also clean up any duplicate or old paths if the user already had `<code class="screen-path">` there.
    # Actually, we can just replace it. If `<code class="screen-path">` is below it, it will stay. We might want to remove it.
    # But let's just stick strictly to the literal text provided by the user. "ONLY use the exact Find and Replace With blocks provided below."

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixes applied.")
