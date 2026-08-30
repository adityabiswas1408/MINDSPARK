const screens = require('./new_screens.js');

// 4. flash-display
screens['flash-display'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Mono', monospace; background: #0F172A; color: #fff; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; -webkit-font-smoothing: antialiased; }
    .flash-number { font-size: clamp(80px, 20vw, 240px); font-weight: 500; line-height: 1; letter-spacing: -0.05em; }
    .flash-progress { position: absolute; top: 40px; left: 50%; transform: translateX(-50%); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(255,255,255,0.1); padding: 8px 16px; border-radius: 999px; }
  </style>
</head>
<body>
  <div class="flash-progress">Flash 3 of 8</div>
  <div class="flash-number">-412</div>
</body>
</html>
`;

// 5. flash-mcq
screens['flash-mcq'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F1F5F9; color: #0F172A; display: flex; flex-direction: column; min-height: 100vh; }
    .topbar { height: 64px; background: #fff; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; }
    .q-info { font-size: 18px; font-weight: 700; color: #0F172A; }
    .timer { font-family: 'DM Mono', monospace; font-size: 20px; font-weight: 700; color: #1A3829; background: #EFFAF4; padding: 6px 16px; border-radius: 8px; }
    .layout { display: flex; flex: 1; overflow: hidden; }
    .main-area { flex: 1; padding: 40px; overflow-y: auto; display: flex; flex-direction: column; align-items: center; justify-content: center; }
    .mcq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%; max-width: 600px; margin-bottom: 40px; }
    .mcq-opt { background: #fff; border: 2px solid #E2E8F0; border-radius: 12px; padding: 24px; font-size: 24px; font-weight: 600; text-align: center; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
    .mcq-opt:hover { border-color: #1A3829; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(26,56,41,0.1); }
    .mcq-opt.selected { background: #1A3829; color: #fff; border-color: #1A3829; }
    .action-row { display: flex; gap: 16px; width: 100%; max-width: 600px; justify-content: flex-end; }
    .btn { padding: 12px 24px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: pointer; border: none; }
    .btn-flag { background: #FEF9C3; color: #D97706; }
    .btn-next { background: #1A3829; color: #fff; }
    
    .nav-panel { width: 280px; background: #fff; border-left: 1px solid #E2E8F0; display: flex; flex-direction: column; flex-shrink:0; }
    .nav-head { padding: 20px; border-bottom: 1px solid #E2E8F0; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; }
    .nav-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; padding: 20px; overflow-y: auto; }
    .nav-box { aspect-ratio: 1; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 600; cursor: pointer; }
    .nav-box.answered { background: #1A3829; color: #fff; }
    .nav-box.current { border: 2px solid #1A3829; background: #fff; color: #1A3829; }
    .nav-box.skipped { background: #fff; border: 2px dashed #94A3B8; color: #64748B; }
    @media (max-width: 768px) { .layout { flex-direction: column; } .nav-panel { width: 100%; border-left: none; border-top: 1px solid #E2E8F0; } }
  </style>
</head>
<body>
  <div class="topbar">
    <div class="q-info">Question 4 of 20</div>
    <div class="timer">24:12</div>
  </div>
  <div class="layout">
    <div class="main-area">
      <div class="mcq-grid">
        <div class="mcq-opt">A) 1,420</div>
        <div class="mcq-opt">B) 1,240</div>
        <div class="mcq-opt selected">C) 1,440</div>
        <div class="mcq-opt">D) 1,400</div>
      </div>
      <div class="action-row">
        <button class="btn btn-flag">⚑ Flag for Review</button>
        <button class="btn btn-next">Next Question →</button>
      </div>
    </div>
    <div class="nav-panel">
      <div class="nav-head">Question Navigator</div>
      <div class="nav-grid">
        <div class="nav-box answered">1</div>
        <div class="nav-box answered">2</div>
        <div class="nav-box skipped">3</div>
        <div class="nav-box current">4</div>
        <div class="nav-box skipped">5</div>
        <div class="nav-box skipped">6</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 6. flash-review
screens['flash-review'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F1F5F9; color: #0F172A; display: flex; flex-direction: column; min-height: 100vh; align-items: center; padding: 40px 20px; }
    .card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 32px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); width: 100%; max-width: 800px; }
    .title { font-size: 28px; font-weight: 700; margin-bottom: 24px; text-align: center; }
    .warning-banner { background: #FEF9C3; border: 1px solid #FDE047; padding: 16px; border-radius: 8px; color: #92400E; font-weight: 600; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 16px; margin-bottom: 32px; }
    .cell { border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; display: flex; align-items: center; justify-content: space-between; font-weight: 600; }
    .icon { width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 12px; }
    .icon.ans { background: #16A34A; }
    .icon.skip { background: #D97706; }
    .icon.unans { background: #94A3B8; }
    .submit-row { text-align: center; border-top: 1px solid #E2E8F0; padding-top: 32px; }
    .btn-submit { background: #1A3829; color: #fff; padding: 16px 40px; font-size: 18px; font-weight: 700; border-radius: 12px; border: none; cursor: pointer; }
    .btn-submit:hover { background: #2D5540; }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">Exam Review</div>
    <div class="warning-banner">
      <div style="font-size:24px;">⏱</div>
      <div>Low Time Warning: Less than 60 seconds remaining!</div>
    </div>
    <div class="grid">
      <div class="cell">Q1 <div class="icon ans">✓</div></div>
      <div class="cell">Q2 <div class="icon ans">✓</div></div>
      <div class="cell">Q3 <div class="icon skip">—</div></div>
      <div class="cell">Q4 <div class="icon ans">✓</div></div>
      <div class="cell">Q5 <div class="icon unans">○</div></div>
      <div class="cell">Q6 <div class="icon unans">○</div></div>
    </div>
    <div class="submit-row">
      <button class="btn-submit">Submit Exam Now</button>
    </div>
  </div>
</body>
</html>
`;

module.exports = screens;
