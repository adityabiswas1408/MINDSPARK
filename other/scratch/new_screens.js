const cssBase = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'DM Sans', system-ui, sans-serif; background: #F1F5F9; color: #0F172A; line-height: 1.5; -webkit-font-smoothing: antialiased; }
  h1, h2, h3, h4, h5, h6 { font-weight: 600; color: #0F172A; }
  .card { background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
  .btn-primary { background: #1A3829; color: #fff; border-radius: 8px; padding: 10px 20px; font-size: 14px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; }
  .btn-primary:hover { background: #2D5540; }
  .btn-secondary { background: #fff; color: #1A3829; border: 1.5px solid #1A3829; border-radius: 8px; padding: 9px 20px; font-size: 14px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; font-weight: 600; }
  .input-field { border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 9px 12px; font-size: 14px; background: #F8FAFC; width: 100%; outline: none; }
  .input-field:focus { border-color: #1A3829; }
  .top-app-bar { height: 56px; background: #fff; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; justify-content: space-between; padding: 0 24px; position: sticky; top: 0; z-index: 10; }
  .top-app-bar-title { font-size: 15px; font-weight: 600; color: #0F172A; }
  .table { border-collapse: collapse; width: 100%; }
  .table th { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748B; padding: 10px 16px; background: #F8FAFC; border-bottom: 2px solid #E2E8F0; text-align: left; }
  .table td { padding: 12px 16px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
  .table tbody tr:hover { background: #F8FAFC; }
  .badge { border-radius: 999px; padding: 3px 10px; font-size: 12px; font-weight: 600; display: inline-flex; }
  .badge-success { background: #DCFCE7; color: #16A34A; }
  .badge-warning { background: #FEF9C3; color: #D97706; }
  .badge-danger { background: #FEE2E2; color: #DC2626; }
  .badge-neutral { background: #F1F5F9; color: #64748B; }
  .admin-layout { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; min-width: 180px; background: #1A3829; color: #fff; flex-shrink: 0; display: flex; flex-direction: column; }
  @media (max-width: 768px) { .sidebar { display: none; } }
  .sidebar-header { padding: 20px; font-weight: 700; font-size: 18px; border-bottom: 1px solid rgba(255,255,255,0.1); }
  .sidebar-nav { padding: 12px; display: flex; flex-direction: column; gap: 4px; }
  .sidebar-item { padding: 10px 16px; border-radius: 6px; color: #fff; text-decoration: none; font-size: 14px; display: flex; align-items: center; gap: 10px; }
  .sidebar-item.active { background: rgba(255,255,255,0.15); }
  .sidebar-item svg { width: 16px; height: 16px; }
  .admin-main { flex: 1; overflow-y: auto; background: #F1F5F9; display: flex; flex-direction: column; }
  .admin-content { padding: 24px; flex: 1; }
  .student-layout { width: 100%; min-height: 100vh; background: #F1F5F9; }
  .student-top { height: 56px; background: #1A3829; color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; }
  .student-content { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); display: flex; align-items: center; justify-content: center; z-index: 100; }
  .modal-dialog { width: min(480px, 90vw); }
  .table-responsive { width: 100%; overflow-x: auto; }
`;

const screens = {};

// 1. auth-login
screens['auth-login'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssBase}
    .login-wrapper { min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
    .login-card { width: 100%; max-width: 400px; padding: 32px; }
    .login-logo { width: 48px; height: 48px; background: #1A3829; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin: 0 auto 24px; }
    .login-logo svg { color: white; width: 24px; height: 24px; }
    .login-title { text-align: center; font-size: 24px; margin-bottom: 8px; }
    .login-sub { text-align: center; color: #64748B; margin-bottom: 32px; font-size: 14px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; margin-bottom: 8px; font-size: 13px; font-weight: 500; color: #0F172A; }
    .btn-login { width: 100%; padding: 12px; font-size: 15px; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="login-wrapper">
    <div class="card login-card">
      <div class="login-logo">
        <svg fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2 L3 8 V16 L12 22 L21 16 V8 Z"></path></svg>
      </div>
      <h1 class="login-title">MindSpark</h1>
      <p class="login-sub">Sign in to your account</p>
      <div class="form-group">
        <label>Email Address</label>
        <input type="email" class="input-field" placeholder="name@example.com" value="student@mindspark.edu">
      </div>
      <div class="form-group">
        <label>Password</label>
        <input type="password" class="input-field" value="••••••••">
      </div>
      <button class="btn-primary btn-login">Sign In</button>
    </div>
  </div>
</body>
</html>
`;

// 2. student-consent
screens['student-consent'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssBase}
    .accordion { border: 1px solid #E2E8F0; border-radius: 8px; margin-bottom: 16px; overflow: hidden; }
    .accordion-header { padding: 16px; background: #F8FAFC; font-weight: 600; display: flex; align-items: center; justify-content: space-between; cursor: pointer; }
    .accordion-body { padding: 16px; border-top: 1px solid #E2E8F0; font-size: 14px; color: #334155; }
    .checkbox-wrap { display: flex; gap: 12px; align-items: flex-start; margin-top: 12px; }
    .checkbox-wrap input { margin-top: 3px; }
    .btn-container { margin-top: 32px; text-align: right; }
  </style>
</head>
<body>
  <div class="student-layout">
    <div class="student-top">MindSpark Exams</div>
    <div class="student-content">
      <div class="card">
        <h2 style="margin-bottom: 8px;">Academic Integrity & Consent</h2>
        <p style="color: #64748B; font-size: 14px; margin-bottom: 24px;">Please review and agree to the following terms before proceeding to your first exam.</p>
        
        <div class="accordion">
          <div class="accordion-header">1. Assessment Rules</div>
          <div class="accordion-body">
            <p>By proceeding, you agree to complete the assessment entirely on your own without external assistance. Any violation will result in an immediate fail.</p>
            <label class="checkbox-wrap">
              <input type="checkbox" checked>
              <span>I acknowledge and will abide by the assessment rules.</span>
            </label>
          </div>
        </div>

        <div class="accordion">
          <div class="accordion-header">2. Data Privacy</div>
          <div class="accordion-body">
            <p>Your performance data and timings will be recorded to evaluate your skill progression. We process this data securely.</p>
            <label class="checkbox-wrap">
              <input type="checkbox" checked>
              <span>I understand and consent to data processing.</span>
            </label>
          </div>
        </div>

        <div class="accordion">
          <div class="accordion-header">3. Guardian Consent</div>
          <div class="accordion-body">
            <p style="margin-bottom: 12px;">Since you are under 18, please provide guardian information.</p>
            <div style="display: flex; gap: 16px;">
              <div style="flex:1;"><label style="font-size: 13px; font-weight:500; display:block; margin-bottom:4px;">Guardian Name</label><input type="text" class="input-field" value="Sarah Sharma"></div>
              <div style="flex:1;"><label style="font-size: 13px; font-weight:500; display:block; margin-bottom:4px;">Relationship</label><input type="text" class="input-field" value="Mother"></div>
            </div>
          </div>
        </div>

        <div class="btn-container">
          <button class="btn-primary" style="padding: 12px 24px; font-size: 15px;">I Agree &amp; Continue</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 3. exam-lobby
screens['exam-lobby'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    ${cssBase}
    .lobby-header { text-align: center; margin-bottom: 40px; }
    .lobby-title { font-size: 32px; font-weight: 700; margin-bottom: 12px; }
    .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #16A34A; display: inline-block; margin-right: 6px; box-shadow: 0 0 0 3px #DCFCE7; }
    .status-text { font-size: 13px; font-weight: 600; color: #16A34A; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 24px; background: #fff; padding: 6px 16px; border-radius: 999px; border: 1px solid #E2E8F0; }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 32px; }
    .info-box { background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0; }
    .info-label { font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748B; margin-bottom: 4px; }
    .info-val { font-size: 18px; font-weight: 600; color: #0F172A; }
    .lobby-cta { text-align: center; }
    .lobby-cta button { padding: 16px 32px; font-size: 18px; border-radius: 12px; }
  </style>
</head>
<body>
  <div class="student-layout">
    <div class="student-top">Exam Lobby</div>
    <div class="student-content">
      <div class="lobby-header">
        <div class="status-text"><span class="status-dot"></span> Connection Stable</div>
        <h1 class="lobby-title">Q3 Mental Arithmetic</h1>
        <p style="color: #64748B;">Please review your exam settings before starting. The timer will not begin until you click ready.</p>
      </div>
      
      <div class="card" style="max-width: 600px; margin: 0 auto 32px;">
        <div class="info-grid">
          <div class="info-box"><div class="info-label">Questions</div><div class="info-val">20</div></div>
          <div class="info-box"><div class="info-label">Time Limit</div><div class="info-val">30 Minutes</div></div>
          <div class="info-box"><div class="info-label">Flash Digits</div><div class="info-val">3 Digits</div></div>
          <div class="info-box"><div class="info-label">Flash Speed</div><div class="info-val">1.5 Seconds</div></div>
          <div class="info-box"><div class="info-label">Negatives</div><div class="info-val">Included</div></div>
          <div class="info-box"><div class="info-label">Passing Score</div><div class="info-val">80%</div></div>
        </div>
        <div class="lobby-cta">
          <button class="btn-primary">I'm Ready &mdash; Begin Exam</button>
        </div>
      </div>
    </div>
  </div>
</body>
</html>
`;

module.exports = screens;
