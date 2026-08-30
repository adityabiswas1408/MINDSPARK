const screens = require('./new_screens2.js');

// 7. exam-complete
screens['exam-complete'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F1F5F9; color: #0F172A; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 20px; }
    .card { background: #fff; border-radius: 16px; border: 1px solid #E2E8F0; padding: 48px; text-align: center; width: 100%; max-width: 540px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
    .badge { display: inline-flex; align-items: center; justify-content: center; background: #DCFCE7; color: #16A34A; width: 64px; height: 64px; border-radius: 50%; font-size: 32px; font-weight: 700; margin-bottom: 24px; }
    .title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
    .score-wrap { margin: 32px 0; }
    .score { font-family: 'DM Mono', monospace; font-size: 64px; font-weight: 700; color: #1A3829; line-height: 1; }
    .perc { font-size: 20px; font-weight: 600; color: #64748B; margin-top: 8px; }
    .breakdown { display: flex; justify-content: center; gap: 24px; margin-bottom: 40px; font-size: 14px; font-weight: 600; color: #334155; }
    .breakdown span.g { color: #16A34A; }
    .breakdown span.r { color: #DC2626; }
    .breakdown span.y { color: #D97706; }
    .actions { display: flex; flex-direction: column; gap: 12px; }
    .btn-primary { background: #1A3829; color: #fff; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; }
    .btn-sec { background: #fff; color: #1A3829; border: 1.5px solid #1A3829; padding: 14px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">A</div>
    <div class="title">Exam Completed!</div>
    <div class="score-wrap">
      <div class="score">18/20</div>
      <div class="perc">90% Accuracy</div>
    </div>
    <div class="breakdown">
      <span><span class="g">18</span> Correct</span>
      <span><span class="r">2</span> Incorrect</span>
      <span><span class="y">0</span> Skipped</span>
    </div>
    <div class="actions">
      <button class="btn-primary">View Answer Sheet</button>
      <button class="btn-sec">Back to Dashboard</button>
    </div>
  </div>
</body>
</html>
`;

// 8. flash-config
screens['flash-config'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F1F5F9; color: #0F172A; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; padding: 32px; max-width: 800px; margin: 40px auto; }
    .title { font-size: 20px; font-weight: 700; border-bottom: 1px solid #E2E8F0; padding-bottom: 16px; margin-bottom: 24px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #334155; }
    .stepper { display: flex; align-items: center; border: 1.5px solid #E2E8F0; border-radius: 8px; width: fit-content; overflow: hidden; }
    .stepper button { width: 40px; height: 40px; background: #F8FAFC; border: none; cursor: pointer; font-size: 18px; font-weight: 600; color: #1A3829; }
    .stepper button:hover { background: #E2E8F0; }
    .stepper input { width: 60px; height: 40px; border: none; text-align: center; border-left: 1px solid #E2E8F0; border-right: 1px solid #E2E8F0; font-family: 'DM Mono', monospace; font-size: 16px; font-weight: 700; outline: none; }
    .toggle { display: flex; align-items: center; gap: 12px; cursor: pointer; }
    .toggle-slider { width: 44px; height: 24px; background: #16A34A; border-radius: 12px; position: relative; }
    .toggle-slider::after { content: ''; position: absolute; top: 2px; right: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; }
    .preview { background: #0F172A; border-radius: 12px; display: flex; align-items: center; justify-content: center; height: 200px; color: #fff; font-family: 'DM Mono', monospace; font-size: 48px; font-weight: 500; }
    .btn-save { background: #1A3829; color: #fff; border-radius: 8px; padding: 12px 24px; border: none; font-size: 15px; font-weight: 600; cursor: pointer; float: right; margin-top: 24px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="title">Flash Anzan Configuration</div>
    <div class="grid">
      <div>
        <div class="form-group">
          <label>Number of Digits</label>
          <div class="stepper"><button>-</button><input type="text" value="3"><button>+</button></div>
        </div>
        <div class="form-group">
          <label>Flashes per Question</label>
          <div class="stepper"><button>-</button><input type="text" value="8"><button>+</button></div>
        </div>
        <div class="form-group">
          <label>Total Questions</label>
          <div class="stepper"><button>-</button><input type="text" value="20"><button>+</button></div>
        </div>
        <div class="form-group">
          <label>Include Negative Numbers</label>
          <div class="toggle"><div class="toggle-slider"></div><span style="font-size:14px;font-weight:500;">Yes</span></div>
        </div>
      </div>
      <div>
        <div class="form-group">
          <label>Live Preview</label>
          <div class="preview">-412</div>
        </div>
        <div class="form-group" style="margin-top: 24px;">
          <label>Flash Speed: <span style="color:#1A3829;">1.5s</span></label>
          <input type="range" min="0.5" max="3" step="0.1" value="1.5" style="width: 100%;">
        </div>
      </div>
    </div>
    <button class="btn-save">Save Configuration</button>
    <div style="clear:both;"></div>
  </div>
</body>
</html>
`;

module.exports = screens;
