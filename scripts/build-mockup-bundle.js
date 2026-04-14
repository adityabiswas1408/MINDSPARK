#!/usr/bin/env node
// One-off script: packages 20 MINDSPARK mockup HTML files into a single
// self-contained deliverable. Run once, then delete this script.
// Usage: node scripts/build-mockup-bundle.js

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_FILE = path.join(ROOT, 'client-deliverables', 'mindspark-mockups.html');

// ── Source files (order = display order) ──────────────────────────────────────
const SOURCES = [
  // STUDENT group
  {
    id: 'student-dashboard',
    title: 'Student Dashboard',
    group: 'STUDENT',
    file: '.superpowers/brainstorm/223-1776020821/content/student-dashboard.html',
  },
  {
    id: 'student-exams-tests',
    title: 'Student Exams & Tests',
    group: 'STUDENT',
    file: '.superpowers/brainstorm/223-1776020821/content/student-exams-tests.html',
  },
  {
    id: 'student-assessment-v5',
    title: 'Assessment-Taking (v5)',
    group: 'STUDENT',
    file: '.superpowers/brainstorm/1798-1776124309/content/student-assessment-v5.html',
  },
  {
    id: 'student-results-flow',
    title: 'Results Flow',
    group: 'STUDENT',
    file: '.superpowers/brainstorm/1798-1776124309/content/student-results-flow.html',
  },
  {
    id: 'student-profile',
    title: 'Student Profile',
    group: 'STUDENT',
    file: '.superpowers/brainstorm/362-1776136481/content/student-profile.html',
  },

  // ADMIN group
  {
    id: 'admin-dashboard',
    title: 'Admin Dashboard',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/dashboard-layout.html',
  },
  {
    id: 'students-list',
    title: 'Students — List',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/students-list-v2.html',
  },
  {
    id: 'student-detail',
    title: 'Students — Detail',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/student-detail.html',
  },
  {
    id: 'student-drawer',
    title: 'Students — Drawer',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/student-drawer.html',
  },
  {
    id: 'student-dialogs',
    title: 'Students — Dialogs',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/student-dialogs.html',
  },
  {
    id: 'levels-list',
    title: 'Levels — List',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/levels-list.html',
  },
  {
    id: 'level-detail',
    title: 'Levels — Detail',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/level-detail.html',
  },
  {
    id: 'level-dialog',
    title: 'Levels — Dialog',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/level-dialog.html',
  },
  {
    id: 'assessments-list',
    title: 'Assessments — List',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/assessments-list.html',
  },
  {
    id: 'assessment-wizard',
    title: 'Assessments — Wizard',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/assessment-wizard.html',
  },
  {
    id: 'live-monitor',
    title: 'Live Monitor',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/live-monitor.html',
  },
  {
    id: 'hub-layout-v4',
    title: 'Results — Hub',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/hub-layout-v4.html',
  },
  {
    id: 'detail-layout-v3',
    title: 'Results — Detail',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/detail-layout-v3.html',
  },
  {
    id: 'answer-sheet',
    title: 'Results — Answer Sheet',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/answer-sheet.html',
  },
  {
    id: 'settings',
    title: 'Settings',
    group: 'ADMIN',
    file: '.superpowers/brainstorm/223-1776020821/content/settings.html',
  },
];

// ── Resize-bridge injected into every mockup's <head> ─────────────────────────
const RESIZE_BRIDGE = `
<script>
(function() {
  var id = window.name || '';
  function sendHeight() {
    var h = document.documentElement.scrollHeight;
    if (window.parent !== window) {
      window.parent.postMessage({ type: 'iframeHeight', id: id, height: h }, '*');
    }
  }
  document.addEventListener('DOMContentLoaded', function() {
    sendHeight();
    // Re-send after fonts/images load
    window.addEventListener('load', sendHeight);
    // Observe DOM mutations (SPAs / interactive mockups)
    if (window.ResizeObserver) {
      new ResizeObserver(sendHeight).observe(document.documentElement);
    }
  });
})();
</script>`;

// ── Load + encode each source ─────────────────────────────────────────────────
const encoded = SOURCES.map(({ id, file }) => {
  const abs = path.join(ROOT, file);
  if (!fs.existsSync(abs)) {
    console.error(`MISSING: ${file}`);
    process.exit(1);
  }
  let html = fs.readFileSync(abs, 'utf8');
  // Inject bridge before </head>; fall back to top of <body> if no </head>
  if (html.includes('</head>')) {
    html = html.replace('</head>', RESIZE_BRIDGE + '\n</head>');
  } else if (html.includes('<body')) {
    html = html.replace('<body', RESIZE_BRIDGE + '\n<body');
  } else {
    html = RESIZE_BRIDGE + '\n' + html;
  }
  return { id, b64: Buffer.from(html).toString('base64') };
});

// Build a lookup map for encoded data
const enc = {};
encoded.forEach(({ id, b64 }) => { enc[id] = b64; });

// ── Group mockups ─────────────────────────────────────────────────────────────
const groups = {};
SOURCES.forEach(s => {
  if (!groups[s.group]) groups[s.group] = [];
  groups[s.group].push(s);
});

// ── Build nav dropdown items ──────────────────────────────────────────────────
const navItems = SOURCES.map(s =>
  `<option value="#${s.id}">${s.group}: ${s.title}</option>`
).join('\n        ');

// ── Build sections HTML ───────────────────────────────────────────────────────
function buildSections() {
  let html = '';
  for (const [groupName, items] of Object.entries(groups)) {
    html += `
  <div class="group-block">
    <div class="group-header">
      <span class="group-label">${groupName}</span>
      <span class="group-count">${items.length} screens</span>
    </div>`;

    for (const s of items) {
      const b64 = enc[s.id];
      html += `
    <div class="screen-block" id="${s.id}">
      <div class="screen-header">
        <div class="screen-meta">
          <h2 class="screen-title">${s.title}</h2>
          <code class="screen-path">${s.file}</code>
        </div>
        <a href="#top" class="back-btn">↑ Top</a>
      </div>
      <iframe
        name="${s.id}"
        src="data:text/html;base64,${b64}"
        style="width:100%;border:1px solid #E2E8F0;border-radius:14px;display:block;min-height:1200px;background:#fff;"
        loading="lazy"
        scrolling="no"
        title="${s.title}"
      ></iframe>
    </div>`;
    }

    html += `\n  </div>`;
  }
  return html;
}

// ── Parent shell ──────────────────────────────────────────────────────────────
const parentHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>MINDSPARK — Final Mockups</title>
  <link
    href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap"
    rel="stylesheet"
  />
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', system-ui, sans-serif;
      background: #F1F5F9;
      color: #0F172A;
      min-height: 100vh;
    }

    /* ── Top nav ── */
    #top {}
    .topnav {
      position: sticky;
      top: 0;
      z-index: 100;
      background: #1A3829;
      color: #fff;
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 0 24px;
      height: 56px;
      box-shadow: 0 1px 6px rgba(0,0,0,.25);
    }
    .topnav-logo {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: .12em;
      text-transform: uppercase;
      white-space: nowrap;
      color: #fff;
    }
    .topnav-logo span {
      opacity: .55;
      font-weight: 400;
    }
    .topnav-sep {
      flex: 1;
    }
    .topnav select {
      background: rgba(255,255,255,.12);
      color: #fff;
      border: 1px solid rgba(255,255,255,.25);
      border-radius: 8px;
      padding: 6px 12px;
      font-family: inherit;
      font-size: 13px;
      cursor: pointer;
      outline: none;
      max-width: 280px;
    }
    .topnav select option {
      background: #1A3829;
      color: #fff;
    }
    .topnav-count {
      font-size: 12px;
      opacity: .6;
      white-space: nowrap;
    }

    /* ── Layout ── */
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 32px 24px 80px;
    }

    /* ── Group block ── */
    .group-block {
      margin-bottom: 48px;
    }
    .group-header {
      display: flex;
      align-items: baseline;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 10px;
      border-bottom: 2px solid #1A3829;
    }
    .group-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: .14em;
      text-transform: uppercase;
      color: #1A3829;
    }
    .group-count {
      font-size: 12px;
      color: #64748B;
    }

    /* ── Screen block ── */
    .screen-block {
      margin-bottom: 40px;
      scroll-margin-top: 72px;
    }
    .screen-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      gap: 12px;
      margin-bottom: 10px;
    }
    .screen-meta {
      display: flex;
      flex-direction: column;
      gap: 3px;
    }
    .screen-title {
      font-size: 16px;
      font-weight: 600;
      color: #0F172A;
    }
    .screen-path {
      font-family: 'DM Mono', monospace;
      font-size: 11px;
      color: #94A3B8;
    }
    .back-btn {
      font-size: 12px;
      color: #1A3829;
      text-decoration: none;
      padding: 4px 10px;
      border: 1px solid #1A3829;
      border-radius: 6px;
      white-space: nowrap;
      transition: background .15s;
    }
    .back-btn:hover { background: #1A3829; color: #fff; }

    iframe {
      transition: height .2s ease;
    }
  </style>
</head>
<body>

<nav class="topnav" id="top">
  <div class="topnav-logo">MINDSPARK <span>Final Mockups</span></div>
  <div class="topnav-sep"></div>
  <select id="nav-select" onchange="location.hash=this.value;this.value=''">
    <option value="">Jump to screen…</option>
    ${navItems}
  </select>
  <div class="topnav-count">20 screens</div>
</nav>

<div class="container">
${buildSections()}
</div>

<script>
// Listen for height reports from iframes
window.addEventListener('message', function(e) {
  if (!e.data || e.data.type !== 'iframeHeight') return;
  var id = e.data.id;
  var h  = e.data.height;
  if (!id || !h) return;
  var iframe = document.querySelector('iframe[name="' + id + '"]');
  if (iframe) {
    iframe.style.height = (h + 32) + 'px';
  }
});
</script>

</body>
</html>`;

// ── Write output ──────────────────────────────────────────────────────────────
fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
fs.writeFileSync(OUT_FILE, parentHTML, 'utf8');
console.log('Written:', OUT_FILE);
