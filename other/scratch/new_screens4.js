const screens = require('./new_screens3.js');

// 9. monitor-detail
screens['monitor-detail'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F1F5F9; color: #0F172A; }
    .top-app-bar { height: 56px; background: #fff; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; padding: 0 24px; gap: 16px; position: sticky; top: 0; }
    .back-link { font-size: 14px; font-weight: 600; color: #64748B; text-decoration: none; cursor: pointer; }
    .back-link:hover { color: #1A3829; }
    .title { font-size: 16px; font-weight: 600; border-left: 1px solid #E2E8F0; padding-left: 16px; }
    .container { padding: 32px; max-width: 1000px; margin: 0 auto; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #F8FAFC; border-bottom: 2px solid #E2E8F0; padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 16px; border-bottom: 1px solid #F1F5F9; font-size: 14px; font-weight: 500; }
    tr:hover { background: #F8FAFC; }
    .badge { padding: 4px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; }
    .b-prog { background: #DBEAFE; color: #1D4ED8; }
    .b-sub { background: #DCFCE7; color: #16A34A; }
    .b-time { background: #FEE2E2; color: #DC2626; }
    .b-not { background: #F1F5F9; color: #64748B; }
  </style>
</head>
<body>
  <div class="top-app-bar">
    <a class="back-link">← Back to Monitor</a>
    <div class="title">Q3 Mental Arithmetic (MS-L3-001)</div>
  </div>
  <div class="container">
    <div class="card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Roll No.</th>
              <th>Status</th>
              <th>Questions</th>
              <th>Time Elapsed</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Aditi Sharma</td>
              <td>MS-001</td>
              <td><span class="badge b-prog">In Progress</span></td>
              <td>4/20</td>
              <td><span style="font-family:'DM Mono', monospace;">05:48</span></td>
            </tr>
            <tr>
              <td>Ravi Kumar</td>
              <td>MS-002</td>
              <td><span class="badge b-sub">Submitted</span></td>
              <td>20/20</td>
              <td><span style="font-family:'DM Mono', monospace;">14:12</span></td>
            </tr>
            <tr>
              <td>Priya Singh</td>
              <td>MS-003</td>
              <td><span class="badge b-time">Timed Out</span></td>
              <td>16/20</td>
              <td><span style="font-family:'DM Mono', monospace;">30:00</span></td>
            </tr>
            <tr>
              <td>Arjun Patel</td>
              <td>MS-004</td>
              <td><span class="badge b-not">Not Started</span></td>
              <td>0/20</td>
              <td><span style="font-family:'DM Mono', monospace;">00:00</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 10. activity-log
screens['activity-log'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F1F5F9; color: #0F172A; }
    .top-app-bar { height: 56px; background: #fff; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; padding: 0 24px; position: sticky; top: 0; }
    .title { font-size: 16px; font-weight: 600; }
    .container { padding: 32px; max-width: 1000px; margin: 0 auto; }
    .filters { display: flex; gap: 16px; margin-bottom: 24px; }
    .filter-btn { background: #fff; border: 1px solid #E2E8F0; padding: 8px 16px; border-radius: 8px; font-size: 14px; font-weight: 500; display: flex; align-items: center; gap: 8px; cursor: pointer; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; overflow: hidden; }
    .table-responsive { width: 100%; overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; text-align: left; }
    th { background: #F8FAFC; border-bottom: 2px solid #E2E8F0; padding: 12px 16px; font-size: 12px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.05em; }
    td { padding: 16px; border-bottom: 1px solid #F1F5F9; font-size: 14px; }
    tr:hover { background: #F8FAFC; }
    .mono { font-family: 'DM Mono', monospace; font-size: 13px; color: #64748B; }
    .badge { padding: 4px 8px; border-radius: 6px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .b-admin { background: #FEE2E2; color: #DC2626; }
    .b-stud { background: #DBEAFE; color: #1D4ED8; }
  </style>
</head>
<body>
  <div class="top-app-bar"><div class="title">Activity Log</div></div>
  <div class="container">
    <div class="filters">
      <button class="filter-btn">📅 Last 7 Days</button>
      <button class="filter-btn">👤 All Users</button>
    </div>
    <div class="card">
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Role</th>
              <th>Action Description</th>
              <th>Target</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="mono">2026-06-09 10:15:02</td>
              <td style="font-weight:600;">Admin User</td>
              <td><span class="badge b-admin">Admin</span></td>
              <td>Started Exam Session</td>
              <td>Q3 Mental Arithmetic</td>
            </tr>
            <tr>
              <td class="mono">2026-06-09 10:16:45</td>
              <td style="font-weight:600;">Aditi Sharma</td>
              <td><span class="badge b-stud">Student</span></td>
              <td>Joined Exam</td>
              <td>Q3 Mental Arithmetic</td>
            </tr>
            <tr>
              <td class="mono">2026-06-09 10:45:12</td>
              <td style="font-weight:600;">Aditi Sharma</td>
              <td><span class="badge b-stud">Student</span></td>
              <td>Submitted Exam</td>
              <td>Q3 Mental Arithmetic</td>
            </tr>
            <tr>
              <td class="mono">2026-06-09 10:50:00</td>
              <td style="font-weight:600;">Admin User</td>
              <td><span class="badge b-admin">Admin</span></td>
              <td>Released Results</td>
              <td>Q3 Mental Arithmetic</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>
`;

// 11. announcements
screens['announcements'] = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'DM Sans', sans-serif; background: #F1F5F9; color: #0F172A; }
    .top-app-bar { height: 56px; background: #fff; border-bottom: 1px solid #E2E8F0; display: flex; align-items: center; padding: 0 24px; position: sticky; top: 0; }
    .title { font-size: 16px; font-weight: 600; }
    .container { padding: 32px; max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .card { background: #fff; border-radius: 12px; border: 1px solid #E2E8F0; padding: 24px; }
    .card-title { font-size: 18px; font-weight: 700; margin-bottom: 24px; }
    .form-group { margin-bottom: 20px; }
    .form-group label { display: block; font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #334155; }
    .input { width: 100%; border: 1.5px solid #E2E8F0; border-radius: 8px; padding: 10px 12px; font-size: 14px; font-family: inherit; outline: none; background: #F8FAFC; }
    .input:focus { border-color: #1A3829; }
    textarea.input { resize: vertical; min-height: 120px; }
    select.input { cursor: pointer; }
    .btn-send { background: #1A3829; color: #fff; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; }
    .btn-send:hover { background: #2D5540; }
    
    .history-item { padding: 16px 0; border-bottom: 1px solid #E2E8F0; }
    .history-item:last-child { border-bottom: none; }
    .h-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
    .h-meta { font-size: 13px; color: #64748B; display: flex; gap: 12px; }
    .h-stats { margin-top: 8px; font-size: 13px; font-weight: 500; color: #16A34A; }
    @media (max-width: 768px) { .container { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="top-app-bar"><div class="title">Announcements</div></div>
  <div class="container">
    <div class="card">
      <div class="card-title">Compose Announcement</div>
      <div class="form-group">
        <label>Title</label>
        <input type="text" class="input" placeholder="e.g., Upcoming Exam Schedule">
      </div>
      <div class="form-group">
        <label>Message Body</label>
        <textarea class="input" placeholder="Write your announcement here..."></textarea>
      </div>
      <div class="form-group">
        <label>Audience</label>
        <select class="input">
          <option>All Students</option>
          <option>Level 3 Only</option>
          <option>Level 4 Only</option>
        </select>
      </div>
      <button class="btn-send">Send Announcement</button>
    </div>
    
    <div class="card">
      <div class="card-title">Sent History</div>
      <div class="history-item">
        <div class="h-title">Upcoming Exam Schedule</div>
        <div class="h-meta"><span>To: All Students</span><span>Sent: Today, 09:00 AM</span></div>
        <div class="h-stats">✓ 42/45 Read</div>
      </div>
      <div class="history-item">
        <div class="h-title">Level 3 Results Released</div>
        <div class="h-meta"><span>To: Level 3 Only</span><span>Sent: Yesterday, 14:30 PM</span></div>
        <div class="h-stats">✓ 15/15 Read</div>
      </div>
      <div class="history-item">
        <div class="h-title">System Maintenance Notice</div>
        <div class="h-meta"><span>To: All Students</span><span>Sent: 2026-06-05</span></div>
        <div class="h-stats">✓ 45/45 Read</div>
      </div>
    </div>
  </div>
</body>
</html>
`;

module.exports = screens;
