const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&family=Syne:wght@700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #F5F2EC;
    --surface: #FDFCFA;
    --surface-2: #EFECE5;
    --border: rgba(60,50,30,0.12);
    --border-strong: rgba(60,50,30,0.22);
    --ink: #1C1A14;
    --ink-2: #6B6355;
    --ink-3: #A09888;
    --accent: #C4622D;
    --accent-light: #F5E8DF;
    --accent-dark: #8C3E17;
    --success: #2E7D52;
    --success-bg: #E6F4ED;
    --warning: #A05A00;
    --warning-bg: #FEF3E2;
    --danger: #B83232;
    --danger-bg: #FCEAEA;
    --info: #1B5EA0;
    --info-bg: #E6F0FB;
    --radius: 10px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --font-display: 'Outfit', sans-serif;
    --font-body: 'Plus Jakarta Sans', sans-serif;
  }

  body { background: var(--bg); color: var(--ink); font-family: var(--font-body); font-size: 15px; line-height: 1.6; }
  .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
  .main-content { flex: 1; max-width: 1100px; margin: 0 auto; width: 100%; padding: 2rem 1.5rem 4rem; }
  .nav { background: var(--surface); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
  .nav-inner { max-width: 1100px; margin: 0 auto; padding: 0 1.5rem; height: 60px; display: flex; align-items: center; justify-content: space-between; }
  .nav-logo { font-family: 'Syne', sans-serif; font-size: 1.25rem; font-weight: 800; color: var(--ink); letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
  .nav-logo span { color: var(--accent); }
  .nav-tabs { display: flex; gap: 4px; }
  .nav-tab { padding: 6px 14px; border-radius: var(--radius); border: none; background: transparent; color: var(--ink-2); font-family: var(--font-body); font-size: 14px; cursor: pointer; transition: all 0.15s; font-weight: 500; }
  .nav-tab:hover { background: var(--surface-2); color: var(--ink); }
  .nav-tab.active { background: var(--accent); color: #fff; }
  .nav-right { display: flex; align-items: center; gap: 12px; }
  .btn { display: inline-flex; align-items: center; gap: 6px; padding: 9px 18px; border-radius: var(--radius); border: 1.5px solid transparent; font-family: var(--font-body); font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.15s; line-height: 1; white-space: nowrap; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--accent); color: #fff; border-color: var(--accent); }
  .btn-primary:hover:not(:disabled) { background: var(--accent-dark); border-color: var(--accent-dark); }
  .btn-secondary { background: var(--surface); color: var(--ink); border-color: var(--border-strong); }
  .btn-secondary:hover:not(:disabled) { background: var(--surface-2); }
  .btn-ghost { background: transparent; color: var(--ink-2); border-color: transparent; }
  .btn-ghost:hover:not(:disabled) { background: var(--surface-2); color: var(--ink); }
  .btn-danger { background: var(--danger-bg); color: var(--danger); border-color: transparent; }
  .btn-danger:hover:not(:disabled) { background: #f7d0d0; }
  .btn-success { background: var(--success-bg); color: var(--success); border-color: transparent; }
  .btn-success:hover:not(:disabled) { background: #c8e6d6; }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; }
  .card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.25rem; }
  .course-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; transition: box-shadow 0.15s, transform 0.15s; }
  .course-card:hover { box-shadow: 0 8px 32px rgba(0,0,0,0.10); transform: translateY(-2px); }
  .course-card-title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--ink); cursor: pointer; }
  .course-card-title:hover { color: var(--accent); }
  .course-card-desc { font-size: 13px; color: var(--ink-2); line-height: 1.5; }
  .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; line-height: 1.4; }
  .badge-accent { background: var(--accent-light); color: var(--accent-dark); }
  .badge-success { background: var(--success-bg); color: var(--success); }
  .badge-warning { background: var(--warning-bg); color: var(--warning); }
  .badge-danger { background: var(--danger-bg); color: var(--danger); }
  .badge-info { background: var(--info-bg); color: var(--info); }
  .badge-neutral { background: var(--surface-2); color: var(--ink-2); }
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .form-label { font-size: 13px; font-weight: 500; color: var(--ink-2); }
  .form-input { padding: 10px 13px; border: 1.5px solid var(--border-strong); border-radius: var(--radius); background: var(--surface); color: var(--ink); font-family: var(--font-body); font-size: 15px; outline: none; transition: border-color 0.15s; }
  .form-input:focus { border-color: var(--accent); }
  .form-input::placeholder { color: var(--ink-3); }
  select.form-input { cursor: pointer; }
  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  .form-grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.75rem; }
  .form-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 0.5rem; }
  .page-header { margin-bottom: 2rem; }
  .page-title { font-family: var(--font-display); font-size: 2rem; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; line-height: 1.2; }
  .page-subtitle { color: var(--ink-2); margin-top: 0.4rem; font-size: 15px; }
  .page-header-row { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 2rem; }
  .auth-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-xl); padding: 2.5rem; width: 100%; max-width: 420px; box-shadow: 0 8px 32px rgba(0,0,0,0.10); }
  .auth-logo { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 800; color: var(--ink); letter-spacing: -0.03em; margin-bottom: 1.75rem; text-align: center; }
  .auth-logo span { color: var(--accent); }
  .auth-toggle { text-align: center; margin-top: 1.25rem; font-size: 14px; color: var(--ink-2); }
  .auth-toggle button { background: none; border: none; color: var(--accent); font-weight: 500; cursor: pointer; font-size: 14px; }
  .auth-form { display: flex; flex-direction: column; gap: 1rem; }
  .auth-title { font-family: var(--font-display); font-size: 1.35rem; font-weight: 700; margin-bottom: 0.25rem; }
  .toast-wrap { position: fixed; bottom: 1.5rem; right: 1.5rem; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .toast { pointer-events: auto; padding: 12px 18px; border-radius: var(--radius); font-size: 14px; font-weight: 500; box-shadow: 0 8px 32px rgba(0,0,0,0.10); animation: slideIn 0.25s ease; max-width: 340px; }
  .toast-success { background: var(--success); color: #fff; }
  .toast-error { background: var(--danger); color: #fff; }
  .toast-info { background: var(--ink); color: #fff; }
  @keyframes slideIn { from { transform: translateX(120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  .modal-backdrop { position: fixed; inset: 0; background: rgba(20,16,10,0.45); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
  .modal { background: var(--surface); border-radius: var(--radius-xl); padding: 2rem; width: 100%; max-width: 480px; box-shadow: 0 8px 32px rgba(0,0,0,0.10); display: flex; flex-direction: column; gap: 1.25rem; max-height: 90vh; overflow-y: auto; }
  .modal-lg { max-width: 700px; }
  .modal-title { font-family: var(--font-display); font-size: 1.2rem; font-weight: 700; }
  .modal-header { display: flex; align-items: center; justify-content: space-between; }
  .enroll-list { display: flex; flex-direction: column; gap: 0.75rem; }
  .enroll-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.1rem 1.4rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .enroll-info { display: flex; flex-direction: column; gap: 3px; }
  .enroll-label { font-weight: 500; font-size: 15px; }
  .enroll-meta { font-size: 13px; color: var(--ink-2); }
  .enroll-actions { display: flex; gap: 8px; align-items: center; }
  .stats-row { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.75rem; margin-bottom: 1.75rem; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.1rem 1.25rem; min-width: 0; }
  .stat-label { font-size: 12px; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; white-space: nowrap; }
  .stat-value { font-family: var(--font-display); font-size: clamp(1.1rem, 2.5vw, 1.75rem); font-weight: 800; color: var(--ink); margin-top: 4px; line-height: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .stat-value.accent { color: var(--accent); }
  .empty { text-align: center; padding: 3rem 1rem; color: var(--ink-2); }
  .empty-icon { font-size: 2.5rem; margin-bottom: 0.75rem; opacity: 0.4; }
  .empty-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--ink-2); margin-bottom: 0.3rem; }
  .spinner { width: 28px; height: 28px; border: 2.5px solid var(--border-strong); border-top-color: var(--accent); border-radius: 50%; animation: spin 0.7s linear infinite; margin: 0 auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-wrap { display: flex; justify-content: center; padding: 3rem; }
  .price-tag { font-family: var(--font-display); font-size: 1.15rem; font-weight: 800; color: var(--accent); }
  .alert { border-radius: var(--radius); padding: 10px 14px; font-size: 14px; }
  .alert-error { background: var(--danger-bg); color: var(--danger); border: 1px solid #f0c0c0; }
  .alert-info { background: var(--info-bg); color: var(--info); border: 1px solid #b3cef0; }

  /* Search & filters */
  .search-bar { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .search-bar .form-input { flex: 1; min-width: 180px; }

  /* Pagination */
  .pagination { display: flex; align-items: center; gap: 12px; justify-content: center; margin-top: 2rem; }
  .pagination-info { font-size: 13px; color: var(--ink-2); }

  /* Stars */
  .stars { color: #F59E0B; font-size: 13px; letter-spacing: 1px; }
  .rating-label { font-size: 12px; color: var(--ink-3); margin-left: 4px; }

  /* Progress */
  .progress-track { width: 100%; background: var(--surface-2); border-radius: 20px; height: 10px; overflow: hidden; }
  .progress-bar { height: 100%; background: var(--accent); border-radius: 20px; transition: width 0.4s ease; }
  .progress-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 1.25rem 1.5rem; display: flex; flex-direction: column; gap: 0.75rem; }
  .progress-header { display: flex; align-items: center; justify-content: space-between; }
  .progress-title { font-family: var(--font-display); font-weight: 700; font-size: 1rem; }
  .progress-label { font-size: 13px; color: var(--ink-2); }
  .progress-list { display: flex; flex-direction: column; gap: 0.75rem; }

  /* Users table */
  .table-wrap { overflow-x: auto; border: 1px solid var(--border); border-radius: var(--radius-lg); }
  .table { width: 100%; border-collapse: collapse; font-size: 14px; }
  .table th { text-align: left; padding: 10px 16px; font-size: 12px; color: var(--ink-3); text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid var(--border); background: var(--surface-2); font-weight: 600; }
  .table td { padding: 12px 16px; border-bottom: 1px solid var(--border); vertical-align: middle; }
  .table tr:last-child td { border-bottom: none; }
  .table tr:hover td { background: var(--surface-2); }

  /* My Courses */
  .my-course-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; margin-bottom: 1rem; }
  .my-course-header { padding: 1.1rem 1.4rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; }
  .my-course-title { font-family: var(--font-display); font-weight: 700; font-size: 1rem; }
  .my-course-body { border-top: 1px solid var(--border); padding: 1.25rem 1.4rem; background: var(--bg); }
  .section-panel { border: 1px solid var(--border); border-radius: var(--radius); margin-bottom: 0.75rem; overflow: hidden; background: var(--surface); }
  .section-header { padding: 0.7rem 1rem; display: flex; align-items: center; justify-content: space-between; background: var(--surface-2); cursor: pointer; user-select: none; }
  .section-title { font-weight: 600; font-size: 14px; }
  .lesson-list { border-top: 1px solid var(--border); }
  .lesson-item { padding: 0.6rem 1rem; border-bottom: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; font-size: 14px; }
  .lesson-item:last-child { border-bottom: none; }
  .add-inline-form { display: flex; gap: 8px; padding: 0.75rem 1rem; border-top: 1px solid var(--border); background: var(--surface-2); }
  .add-inline-form .form-input { flex: 1; padding: 7px 11px; font-size: 13px; }

  /* Course Detail */
  .detail-section { margin-bottom: 1.5rem; }
  .detail-section-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 0.75rem; color: var(--ink); border-bottom: 1px solid var(--border); padding-bottom: 0.4rem; }
  .detail-lesson { display: flex; align-items: center; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid var(--border); font-size: 14px; }
  .detail-lesson:last-child { border-bottom: none; }
  .lesson-complete-btn { padding: 4px 10px; border-radius: var(--radius); border: 1.5px solid var(--success); background: transparent; color: var(--success); font-size: 12px; font-weight: 500; cursor: pointer; transition: all 0.15s; }
  .lesson-complete-btn.done { background: var(--success-bg); }
  .lesson-complete-btn:hover:not(.done) { background: var(--success-bg); }

  /* Payment processing */
  .processing-banner { background: var(--info-bg); border: 1px solid #b3cef0; border-radius: var(--radius); padding: 1rem 1.25rem; display: flex; align-items: center; gap: 1rem; }
`;

export default styles;
