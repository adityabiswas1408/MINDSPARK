import re

def build_v2():
    with open('a:/MS/index_desktop_incomplete.html', 'r', encoding='utf-8') as f:
        index_html = f.read()
        
    with open('a:/MS/flash_anzan_mockup.html', 'r', encoding='utf-8') as f:
        flash_html = f.read()

    # 1. Extract Flash CSS
    css_match = re.search(r'<style>(.*?)</style>', flash_html, re.DOTALL)
    flash_css = css_match.group(1) if css_match else ''
    
    # Extract :root variables from Flash CSS
    root_vars = ""
    root_match = re.search(r':root\s*\{([^}]+)\}', flash_css)
    if root_match:
        root_vars = root_match.group(1)
        # Remove :root from flash_css to avoid duplicate
        flash_css = flash_css.replace(root_match.group(0), '')
        
    # Inject into index CSS
    # Find index :root
    if ':root' in index_html:
        index_html = re.sub(r':root\s*\{', ':root {\n' + root_vars + '\n', index_html, count=1)
    else:
        # If no :root exists, insert one
        flash_css = ':root {' + root_vars + '}\n' + flash_css

    # Insert remaining flash_css into index <head>
    style_tag = f'\n<style id="flash-anzan-styles">\n{flash_css}\n</style>\n'
    index_html = index_html.replace('</head>', style_tag + '</head>')

    # 2. Extract Flash HTML screens
    # We want everything between <body> and <script>
    body_content_match = re.search(r'<body>(.*?)<script>', flash_html, re.DOTALL)
    flash_body = body_content_match.group(1) if body_content_match else ''
    
    # 3. Modify Flash HTML for Exit Button and Persistent Exit
    exit_html_persistent = '''
    <button onclick="confirmFlashAnzanExit()" style="position: fixed; top: 16px; right: 20px; z-index: 10001; font-family: 'DM Sans', sans-serif; font-size: 12px; font-weight: 500; color: #94A3B8; background: transparent; border: none; cursor: pointer; padding: 6px 10px;">✕  Exit test</button>
    <div id="fa-exit-tooltip" style="display: none; position: fixed; top: 48px; right: 20px; z-index: 10001; background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 8px; padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); font-family: 'DM Sans', sans-serif; font-size: 13px; color: #475569;">
        This will end the test. <a href="#" onclick="flashAnzanExit(); return false;" style="color: #EF4444; font-weight: 600; text-decoration: none; margin-left: 8px;">Confirm Exit</a>
    </div>
    '''
    
    exit_html_submit = '''
    <div style="text-align: center; margin-top: 12px; width: 100%;">
        <button class="btn-exit" onclick="flashAnzanExit()" style="background: transparent; border: 1.5px solid #E2E8F0; color: #475569; font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 500; padding: 11px 24px; border-radius: 10px; cursor: pointer;">← Exit Flash Test</button>
    </div>
    '''
    
    flash_body = flash_body.replace('<div class="cta">', exit_html_persistent + '<div class="cta">')
    # Better to just append persistent to the overlay root and exit_submit to the card.
    # Wait, let's just append persistent exit to the overlay directly.
    flash_body = exit_html_persistent + flash_body
    
    # Find the end of the card in screen 4 to append the exit button
    flash_body = flash_body.replace('</div>\n        </div>\n    </div>\n\n    <!-- Mockup Developer Toolbar -->', '</div>\n' + exit_html_submit + '        </div>\n    </div>\n\n    <!-- Mockup Developer Toolbar -->')
    
    # 4. Extract Flash JS
    js_match = re.search(r'<script>(.*?)</script>', flash_html, re.DOTALL)
    flash_js = js_match.group(1) if js_match else ''
    
    # Remove window.onload from flash_js
    flash_js = re.sub(r'// Initialize flow on load\s*window\.onload = \(\) => \{\s*setPhase\(\'getready\'\);\s*\};', '', flash_js)
    
    # Wrap JS in IIFE and add hooks
    wrapper_js = f'''
(function() {{
{flash_js}

window.confirmFlashAnzanExit = function() {{
    const tooltip = document.getElementById('fa-exit-tooltip');
    tooltip.style.display = tooltip.style.display === 'none' ? 'block' : 'none';
}};

window.flashAnzanExit = function() {{
    const overlay = document.getElementById('fa-overlay');
    overlay.style.transition = 'opacity 180ms ease-in';
    overlay.style.opacity = '0';
    
    const onExitEnd = () => {{
        overlay.removeEventListener('transitionend', onExitEnd);
        overlay.style.display = 'none';
        flashAnzanReset();
        document.body.style.overflow = '';
        
        const btn = document.getElementById('btn-launch-flash');
        if (btn) {{
            btn.textContent = '▶  Try Flash Test';
            btn.style.opacity = '1';
            btn.style.pointerEvents = 'auto';
            btn.style.background = '#40916C';
        }}
        
        const section = document.getElementById('student-flash-anzan');
        if (section) section.scrollIntoView({{ behavior: 'smooth' }});
    }};
    overlay.addEventListener('transitionend', onExitEnd);
}};

window.flashAnzanReset = function() {{
    clearAllTimers();
    currentQuestion = 0;
    answers = [null, null, null];
    phase = 'getready';
    showScreen('screen-0');
    
    document.getElementById('countdown-digit').textContent = '3';
    document.getElementById('cd-dot-1').style.backgroundColor = 'var(--t3)';
    document.getElementById('cd-dot-2').style.backgroundColor = 'var(--t3)';
    document.getElementById('cd-dot-3').style.backgroundColor = 'var(--t3)';
    
    const card = document.getElementById('card');
    if (card) {{
        card.style.transition = 'none';
        card.style.transform = 'translateY(0)';
        card.style.opacity = '1';
    }}
    
    const grid = document.getElementById('mcq-grid');
    if (grid) grid.innerHTML = '';
}};

window.flashAnzanInit = function() {{
    flashAnzanReset();
    const overlay = document.getElementById('fa-overlay');
    overlay.style.display = 'block';
    
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity 200ms ease-out';
    void overlay.offsetWidth; // reflow
    overlay.style.opacity = '1';
    
    document.body.style.overflow = 'hidden';
    
    const btn = document.getElementById('btn-launch-flash');
    if (btn) {{
        btn.textContent = '◼ Test running...';
        btn.style.opacity = '0.5';
        btn.style.pointerEvents = 'none';
        btn.style.background = '#475569';
    }}
    
    document.getElementById('fa-exit-tooltip').style.display = 'none';
    
    runGetReady();
}};

document.addEventListener('keydown', function(e) {{
    if (e.key === 'Escape') {{
        const overlay = document.getElementById('fa-overlay');
        if (overlay && overlay.style.display === 'block') {{
            flashAnzanExit();
        }}
    }}
}});
}})();
'''
    
    # 5. Build overlay container
    overlay_container = f'''
    <div id="fa-overlay" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; background: #FFFFFF; overflow: hidden;">
        {flash_body}
    </div>
    <script>
    {wrapper_js}
    </script>
    '''
    
    index_html = index_html.replace('</body>', overlay_container + '\n</body>')
    
    # 6. Insert Launch Card
    launch_card = '''
    <div class="screen-block" id="student-flash-anzan">
      <div class="screen-header">
        <div class="screen-meta">
          <h2 class="screen-title">Flash Anzan TEST — Interactive Experience</h2>
          <code class="screen-path">/student/assessment/[id]/flash</code>
        </div>
        <a href="#top" class="back-btn">↑ Top</a>
      </div>
      <div class="launch-card" style="background: #0F172A; border-radius: 14px; padding: 48px 56px; max-width: 900px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; gap: 48px;">
        <div class="lc-left" style="flex: 1;">
          <div style="background: #1A3829; color: #52B788; font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: 0.1em; padding: 4px 12px; border-radius: 9999px; display: inline-block; margin-bottom: 20px;">INTERACTIVE DEMO</div>
          <h3 style="font-family: 'DM Sans', sans-serif; font-size: 32px; font-weight: 700; color: #FFFFFF; margin: 0 0 12px 0;">Flash Anzan TEST</h3>
          <p style="font-family: 'DM Sans', sans-serif; font-size: 15px; font-weight: 400; color: #94A3B8; line-height: 1.7; margin: 0 0 28px 0;">Experience the live exam as a student. Numbers flash on screen — you calculate the total in your head and answer the multiple-choice question before time runs out.</p>
          <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 32px;">
            <div style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #CBD5E1; font-family: 'DM Mono', monospace; font-size: 12px; padding: 5px 14px; border-radius: 9999px;">3 Questions</div>
            <div style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #CBD5E1; font-family: 'DM Mono', monospace; font-size: 12px; padding: 5px 14px; border-radius: 9999px;">450ms flash speed</div>
            <div style="background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); color: #CBD5E1; font-family: 'DM Mono', monospace; font-size: 12px; padding: 5px 14px; border-radius: 9999px;">2-digit numbers</div>
          </div>
          <button id="btn-launch-flash" onclick="flashAnzanInit()" style="background: #40916C; color: #FFFFFF; font-family: 'DM Sans', sans-serif; font-size: 16px; font-weight: 600; padding: 14px 32px; border-radius: 10px; border: none; cursor: pointer; letter-spacing: 0.01em; transition: none;">▶  Try Flash Test</button>
        </div>
        <div class="lc-right" style="text-align: center;">
          <div style="font-family: 'DM Mono', monospace; font-size: 96px; font-weight: 600; color: #FFFFFF; opacity: 0.12; font-variant-numeric: tabular-nums; user-select: none; pointer-events: none; line-height: 1;">47</div>
          <div style="color: #475569; font-family: 'DM Sans', sans-serif; font-size: 12px; margin-top: 8px;">sample flash number</div>
        </div>
      </div>
    </div>
    '''
    
    # Insert between Assessment-Taking and Results Flow
    target_str = '</iframe>\n    </div>\n    <div class="screen-block" id="student-results-flow">'
    replace_str = '</iframe>\n    </div>\n' + launch_card + '\n    <div class="screen-block" id="student-results-flow">'
    
    if target_str in index_html:
        index_html = index_html.replace(target_str, replace_str)
    else:
        print("ERROR: Could not find target insertion point for gallery section!")
        
    # 7. Add to dropdown nav
    nav_target = '<option value="#student-assessment-v5">STUDENT: Assessment-Taking (v5)</option>'
    nav_replace = nav_target + '\n        <option value="#student-flash-anzan">STUDENT: Flash Anzan TEST ✦</option>'
    
    if nav_target in index_html:
        index_html = index_html.replace(nav_target, nav_replace)
    else:
        print("ERROR: Could not find target insertion point for nav!")
        
    # Write to v2
    with open('a:/MS/mindspark_mockup_v2.html', 'w', encoding='utf-8') as f:
        f.write(index_html)
    print("Successfully built mindspark_mockup_v2.html")

if __name__ == '__main__':
    build_v2()
