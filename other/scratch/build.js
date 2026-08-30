const fs = require('fs');
const cheerio = require('cheerio');
const newScreens = require('./new_screens4.js');

const inputHTML = fs.readFileSync('../index (1).html', 'utf8');
const $ = cheerio.load(inputHTML);

// 1. Extract 20 existing screens
const existingScreens = {};
$('.screen-block').each((i, el) => {
    let id = $(el).attr('id');
    if (id === 'student-dashboard') id = 'top'; // renamed to top as per prompt
    
    let title = $(el).find('.screen-title').text();
    let subtitle = $(el).find('.screen-path').text() || '';
    
    let iframeSrc = $(el).find('iframe').attr('src');
    let srcdoc = '';
    if (iframeSrc && iframeSrc.startsWith('data:text/html;base64,')) {
        let base64 = iframeSrc.replace('data:text/html;base64,', '');
        srcdoc = Buffer.from(base64, 'base64').toString('utf8');
    }
    existingScreens[id] = { id, title, subtitle, srcdoc };
});

const finalScreenOrder = [
    { group: 'AUTH', screens: [{ id: 'auth-login', title: 'Login' }] },
    { group: 'STUDENT', screens: [
        { id: 'top', title: 'Student Dashboard', existingId: 'top' },
        { id: 'student-exams-tests', title: 'Student Exams & Tests' },
        { id: 'student-consent', title: 'Student Consent & Academic Integrity' },
        { id: 'exam-lobby', title: 'Exam Lobby' },
        { id: 'flash-display', title: 'Flash Anzan — Number Display' },
        { id: 'flash-mcq', title: 'Flash Anzan — MCQ Answering' },
        { id: 'flash-review', title: 'Flash Anzan — Review & Submit' },
        { id: 'exam-complete', title: 'Exam Completion' },
        { id: 'student-assessment-v5', title: 'Assessment-Taking (v5)' },
        { id: 'student-results-flow', title: 'Results Flow' },
        { id: 'student-profile', title: 'Student Profile' }
    ]},
    { group: 'ADMIN', screens: [
        { id: 'admin-dashboard', title: 'Admin Dashboard' },
        { id: 'students-list', title: 'Students — List' },
        { id: 'student-detail', title: 'Students — Detail' },
        { id: 'student-drawer', title: 'Students — Drawer' },
        { id: 'student-dialogs', title: 'Students — Dialogs' },
        { id: 'levels-list', title: 'Levels — List' },
        { id: 'level-detail', title: 'Levels — Detail' },
        { id: 'level-dialog', title: 'Levels — Dialog' },
        { id: 'assessments-list', title: 'Assessments — List' },
        { id: 'assessment-wizard', title: 'Assessments — Wizard' },
        { id: 'flash-config', title: 'Flash Anzan — Configuration' },
        { id: 'live-monitor', title: 'Live Monitor' },
        { id: 'monitor-detail', title: 'Monitor — Detail' },
        { id: 'activity-log', title: 'Activity Log' },
        { id: 'announcements', title: 'Announcements' },
        { id: 'hub-layout-v4', title: 'Results — Hub' },
        { id: 'detail-layout-v3', title: 'Results — Detail' },
        { id: 'answer-sheet', title: 'Results — Answer Sheet' },
        { id: 'settings', title: 'Settings' }
    ]}
];

// Helper to escape srcdoc
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/"/g, "&quot;");
}

// Post message script
const postMessageScript = `<script>
      function reportHeight() {
        const h = document.documentElement.scrollHeight;
        window.parent.postMessage({ iframeId: '__SCREEN_ID__', height: h }, '*');
      }
      window.addEventListener('load', reportHeight);
      window.addEventListener('resize', reportHeight);
      if (document.readyState === 'complete') reportHeight();
      if (window.ResizeObserver) {
        new ResizeObserver(reportHeight).observe(document.documentElement);
      }
    </script>
</body>`;

// Font link
const fontLink = '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">';

// Process srcdoc
function processSrcdoc(html, screenId) {
    let $doc = cheerio.load(html, { decodeEntities: false });
    
    // Constraint 1: UTF-8 encoding as first head element
    $doc('head meta[charset]').remove();
    $doc('head').prepend('<meta charset="UTF-8">\n');
    
    // Constraint 8: Google Fonts
    $doc('head link[href*="fonts.googleapis.com"]').remove();
    $doc('head meta[charset]').after('\n  ' + fontLink);
    
    // Constraint 5: Viewport Meta
    if ($doc('head meta[name="viewport"]').length === 0) {
        $doc('head').append('\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">');
    }
    
    // Fix existing bugs
    let cssText = $doc('style').html() || '';
    if (cssText) {
        // Fix empty blocks using simple regex logic
        cssText = cssText.replace(/[^\{]+\{\s*\}/g, '');
        // Fix overflow
        if (!cssText.includes('@media (max-width: 768px) { .sidebar')) {
            cssText += '\n  @media (max-width: 768px) { .sidebar { display: none; } }';
        }
        $doc('style').html(cssText);
    }
    
    // Replace old height scripts
    $doc('script').remove();
    
    let htmlString = $doc.html();
    htmlString = htmlString.replace('</body>', postMessageScript.replace('__SCREEN_ID__', screenId));
    
    return htmlString;
}

let finalBlocks = [];
let dropdownOptions = [];

for (let g of finalScreenOrder) {
    let groupCount = g.screens.length;
    
    finalBlocks.push(`
  <div class="group-block">
    <div class="group-header">
      <span class="group-label">${g.group}</span>
      <span class="group-count">${groupCount} screen${groupCount > 1 ? 's' : ''}</span>
    </div>`);
    
    dropdownOptions.push(`    <optgroup label="${g.group}">`);
    
    for (let s of g.screens) {
        let existingId = s.existingId || s.id;
        let isExisting = !!existingScreens[existingId];
        let srcHtml = isExisting ? existingScreens[existingId].srcdoc : newScreens[s.id];
        
        let processedHtml = processSrcdoc(srcHtml, s.id);
        let escapedSrcdoc = escapeHtml(processedHtml);
        
        let subtitleHtml = '';
        if (isExisting && existingScreens[existingId].subtitle) {
             subtitleHtml = `\n          <code class="screen-path">${existingScreens[existingId].subtitle}</code>`;
        }
        
        finalBlocks.push(`
    <div class="screen-block" id="${s.id}">
      <div class="screen-header">
        <div class="screen-meta">
          <h2 class="screen-title">${s.title}</h2>${subtitleHtml}
        </div>
        <a href="#main-nav" class="back-btn">&#8593; Top</a>
      </div>
      <iframe
        name="${s.id}"
        scrolling="no"
        width="100%"
        height="600"
        frameborder="0"
        srcdoc="${escapedSrcdoc}"
        title="${s.title}"
        style="width:100%;border:1px solid #E2E8F0;border-radius:14px;display:block;background:#fff;"
      ></iframe>
    </div>`);
        
        dropdownOptions.push(`      <option value="#${s.id}">${s.title}</option>`);
    }
    
    finalBlocks.push(`  </div>`);
    dropdownOptions.push(`    </optgroup>`);
}

// Outer shell modifications
let outerHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>MINDSPARK — Final Mockups</title>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', system-ui, sans-serif; background: #F1F5F9; color: #0F172A; min-height: 100vh; }
    .topnav { position: sticky; top: 0; z-index: 100; background: #1A3829; color: #fff; display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 8px 24px; min-height: 56px; box-shadow: 0 1px 6px rgba(0,0,0,.25); }
    .topnav-logo { font-size: 13px; font-weight: 700; letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; color: #fff; }
    .topnav-logo span { opacity: .55; font-weight: 400; }
    .topnav-sep { flex: 1; }
    .topnav select { background: rgba(255,255,255,.12); color: #fff; border: 1px solid rgba(255,255,255,.25); border-radius: 8px; padding: 6px 12px; font-family: inherit; font-size: 13px; cursor: pointer; outline: none; max-width: 280px; }
    /* Constraint 3 Fix: removed option background/color */
    .topnav select option { }
    .topnav-count { font-size: 12px; opacity: .6; white-space: nowrap; }
    .container { max-width: 1400px; margin: 0 auto; padding: 32px 24px 80px; }
    .group-block { margin-bottom: 48px; }
    .group-header { display: flex; align-items: baseline; gap: 12px; margin-bottom: 24px; padding-bottom: 10px; border-bottom: 2px solid #1A3829; }
    .group-label { font-size: 11px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: #1A3829; }
    .group-count { font-size: 12px; color: #64748B; }
    .screen-block { margin-bottom: 40px; scroll-margin-top: 72px; }
    .screen-header { display: flex; align-items: flex-end; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .screen-meta { display: flex; flex-direction: column; gap: 3px; }
    .screen-title { font-size: 16px; font-weight: 600; color: #0F172A; }
    .screen-path { font-family: 'DM Mono', monospace; font-size: 11px; color: #94A3B8; }
    .back-btn { font-size: 12px; color: #1A3829; text-decoration: none; padding: 4px 10px; border: 1px solid #1A3829; border-radius: 6px; white-space: nowrap; transition: background .15s; }
    .back-btn:hover { background: #1A3829; color: #fff; }
    iframe { transition: height .2s ease; }
  </style>
  <script>
    window.addEventListener('message', function(e) {
      if (e.data && e.data.height) {
        // 1. Primary Route: Find the iframe using its exact contentWindow reference.
        // This completely bypasses any internal copy-paste string mismatches or duplicate IDs.
        let iframe = Array.from(document.querySelectorAll('iframe')).find(f => f.contentWindow === e.source);
        
        // 2. Fallback Route: If window matching isn't available, drop back to lookup by ID or name
        if (!iframe) {
          let iframeId = e.data.iframeId || e.data.id;
          if (iframeId) {
            iframe = document.querySelector('#' + iframeId + ' iframe') || 
                     document.querySelector('iframe[name="' + iframeId + '"]');
          }
        }
        
        // 3. Apply the height smoothly
        if (iframe) {
          iframe.style.height = e.data.height + 'px';
        }
      }
    });
  </script>
</head>
<body>
<nav class="topnav" id="main-nav">
  <div class="topnav-logo">MINDSPARK <span>Final Mockups</span></div>
  <div class="topnav-sep"></div>
  <select id="nav-select" onchange="location.hash=this.value;this.value=''">
    <option value="">Jump to screen…</option>
${dropdownOptions.join('\n')}
  </select>
  <div class="topnav-count">31 screens</div>
</nav>

<div class="container">
${finalBlocks.join('\n')}
</div>
</body>
</html>`;

fs.writeFileSync('../index_complete.html', outerHtml);
console.log('Successfully wrote index_complete.html!');
