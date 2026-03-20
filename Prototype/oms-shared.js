/* ============================================================
   OMS SHARED STATE & NAVIGATION
   Connects all modules via localStorage + sessionStorage
============================================================ */

const OMS = {
  version: '2.0.0',
  
  // ── Shared State ──────────────────────────────────────────
  state: {
    currentUser: {
      id: 'USR-001',
      name: 'Admin User',
      nameBn: 'প্রশাসক',
      role: 'super_user',
      office: 'Dhaka Division',
      officeCode: 'DHK-DIV-001'
    },
    alerts: 3,
    onlineUsers: 5000,
    lastSync: new Date().toISOString()
  },

  // ── Pages ─────────────────────────────────────────────────
  pages: {
    index:        'index.html',
    offices:      'offices.html',
    dealers:      'dealers.html',
    beneficiaries:'beneficiaries.html',
    distribution: 'distribution.html',
    inspection:   'inspection.html',
    analytics:    'analytics.html',
    notifications:'notifications.html',
    audit:        'audit.html',
  },

  // ── Navigation ────────────────────────────────────────────
  navItems: [
    { id: 'dashboard',      icon: '📊', label: 'Dashboard',       labelBn: 'ড্যাশবোর্ড',   page: 'index.html' },
    { id: 'offices',        icon: '🏛',  label: 'Offices & Programs', labelBn: 'অফিস ও প্রোগ্রাম', page: 'offices.html' },
    { id: 'dealers',        icon: '🏪', label: 'Dealers',          labelBn: 'ডিলার',          page: 'dealers.html',        badge: 2 },
    { id: 'beneficiaries',  icon: '👥', label: 'Beneficiaries',    labelBn: 'সুবিধাভোগী',     page: 'beneficiaries.html' },
    { id: 'distribution',   icon: '🌾', label: 'Distribution',     labelBn: 'বিতরণ',          page: 'distribution.html' },
    { id: 'inspection',     icon: '🔍', label: 'Inspection',       labelBn: 'পরিদর্শন',        page: 'inspection.html' },
    { id: 'analytics',      icon: '📈', label: 'Analytics',        labelBn: 'বিশ্লেষণ',        page: 'analytics.html' },
    { id: 'notifications',  icon: '🔔', label: 'Notifications',    labelBn: 'বিজ্ঞপ্তি',       page: 'notifications.html', badge: 3 },
    { id: 'audit',          icon: '📋', label: 'Audit Log',        labelBn: 'অডিট লগ',        page: 'audit.html' },
  ],

  // ── Sample Data ───────────────────────────────────────────
  sampleDealers: [
    { id:'DLR-0041', name:'Rahman OMS Center', nameBn:'রহমান ওএমএস সেন্টার', area:'Mirpur-10', status:'active', compliance:96, today:187, phone:'+8801711234567' },
    { id:'DLR-0039', name:'Karim Grain Depot', nameBn:'করিম শস্য ডিপো',     area:'Uttara',    status:'offline', compliance:91, today:143, phone:'+8801811234567' },
    { id:'DLR-0052', name:'Ali Distribution',  nameBn:'আলী বিতরণ কেন্দ্র',   area:'Gulshan',   status:'active',  compliance:74, today:98,  phone:'+8801911234567' },
    { id:'DLR-0058', name:'Khan Food Point',   nameBn:'খান ফুড পয়েন্ট',     area:'Demra',     status:'review',  compliance:61, today:21,  phone:'+8801711111111' },
    { id:'DLR-0061', name:'Hossain Agro',      nameBn:'হোসাইন এগ্রো স্টোর',  area:'Banani',    status:'pending', compliance:0,  today:0,   phone:'+8801811111111' },
  ],

  sampleBeneficiaries: [
    { id:'BEN-10021', name:'Amina Khatun',   nameBn:'আমিনা খাতুন',   area:'Mirpur-10', quota:10, consumed:5,  status:'active',   today:'collected', category:'widow' },
    { id:'BEN-10045', name:'Mohammad Ali',   nameBn:'মোহাম্মদ আলী',  area:'Mirpur-10', quota:10, consumed:10, status:'active',   today:'blocked',   category:'poor_family' },
    { id:'BEN-10087', name:'Rina Begum',     nameBn:'রিনা বেগম',      area:'Uttara',    quota:10, consumed:3,  status:'active',   today:'collected', category:'elderly' },
    { id:'BEN-10102', name:'Jabbar Mia',     nameBn:'জব্বার মিয়া',   area:'Gulshan',   quota:10, consumed:0,  status:'review',   today:'exception', category:'disabled' },
    { id:'BEN-10156', name:'Salma Khanom',   nameBn:'সালমা খানম',     area:'Banani',    quota:10, consumed:5,  status:'active',   today:'synced',    category:'widow' },
  ],

  sampleTransactions: [
    { id:'TXN-20260320-7001', ben:'Amina Khatun',   dealer:'Rahman Center', kg:5, product:'Rice',  face:97.7, status:'accepted', time:'09:41:02', sync:'online' },
    { id:'TXN-20260320-6999', ben:'Mohammad Ali',   dealer:'Mirpur Center', kg:5, product:'Rice',  face:0,    status:'blocked',  time:'09:38:45', sync:'online' },
    { id:'TXN-20260320-6998', ben:'Rina Begum',     dealer:'Karim Depot',   kg:3, product:'Flour', face:94.1, status:'accepted', time:'09:36:18', sync:'online' },
    { id:'TXN-20260320-6997', ben:'Jabbar Mia',     dealer:'Karim Depot',   kg:5, product:'Rice',  face:68.0, status:'exception',time:'09:33:07', sync:'online' },
    { id:'TXN-20260320-6989', ben:'Salma Khanom',   dealer:'Noor Center',   kg:5, product:'Rice',  face:91.2, status:'accepted', time:'09:21:00', sync:'offline' },
  ],

  sampleAuditLogs: [
    { code:'AUD-101', action:'distribute',    entity:'TXN-7001', user:'Rahman/DEVICE-001',    result:'success',  time:'09:41:02' },
    { code:'AUD-102', action:'block',         entity:'DUPLICATE', user:'Mirpur/DEVICE-002',   result:'blocked',  time:'09:38:45' },
    { code:'AUD-099', action:'exception',     entity:'VRF-034',  user:'Karim/DEVICE-003',    result:'review',   time:'09:33:07' },
    { code:'AUD-098', action:'sync',          entity:'BATCH-23', user:'System/SyncEngine',   result:'synced',   time:'09:34:02' },
    { code:'AUD-096', action:'anomaly_flag',  entity:'DLR-0058', user:'Analytics Engine',    result:'flagged',  time:'02:17:44' },
    { code:'AUD-095', action:'login',         entity:'USR-001',  user:'Admin/Browser',       result:'success',  time:'08:00:00' },
    { code:'AUD-094', action:'approve_dealer',entity:'DLR-0041', user:'District Officer',    result:'success',  time:'07:45:00' },
  ],

  sampleOffices: [
    { code:'BGD-NAT-001', name:'Directorate General of Food', type:'national',  parent:null,        status:'active' },
    { code:'DHK-DIV-001', name:'Dhaka Division Food Office',  type:'division',  parent:'BGD-NAT-001', status:'active' },
    { code:'DHK-DST-001', name:'Dhaka District Food Office',  type:'district',  parent:'DHK-DIV-001', status:'active' },
    { code:'MIR-UPZ-001', name:'Mirpur Upazila Food Office',  type:'upazila',   parent:'DHK-DST-001', status:'active' },
    { code:'MIR-CTR-001', name:'Mirpur OMS Center',           type:'center',    parent:'MIR-UPZ-001', status:'active' },
  ],

  samplePrograms: [
    { code:'OMS-REG-2026', name:'Regular OMS 2026',  type:'regular',   dailyKg:5, monthlyKg:10, status:'active',   start:'2026-01-01', end:'2026-12-31' },
    { code:'OMS-RAM-2026', name:'Ramadan Special',   type:'ramadan',   dailyKg:7, monthlyKg:14, status:'active',   start:'2026-03-01', end:'2026-04-15' },
    { code:'OMS-EMR-2025', name:'Emergency Relief',  type:'emergency', dailyKg:10,monthlyKg:20, status:'inactive', start:'2025-06-01', end:'2025-08-31' },
  ],

  // ── Utilities ─────────────────────────────────────────────
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-BD', { day:'2-digit', month:'short', year:'numeric' });
  },

  formatTime(time) {
    return time;
  },

  getStatusBadge(status) {
    const map = {
      active:   ['bg', '✓ Active'],
      inactive: ['bs', '○ Inactive'],
      pending:  ['by', '⏳ Pending'],
      offline:  ['bt', '📴 Offline'],
      review:   ['by', '⚠ Review'],
      suspended:['br', '⛔ Suspended'],
      collected:['bg', '✓ Collected'],
      blocked:  ['br', '✗ Blocked'],
      exception:['by', '! Exception'],
      synced:   ['bt', '↑ Synced'],
      accepted: ['bg', '✓ Accepted'],
      online:   ['bg', '🟢 Online'],
      flagged:  ['br', '🚩 Flagged'],
      success:  ['bg', '✓ Success'],
    };
    const [cls, label] = map[status] || ['bs', status];
    return `<span class="b ${cls}">${label}</span>`;
  },

  // ── Build Sidebar ─────────────────────────────────────────
  buildSidebar(activeId) {
    const current = window.location.pathname.split('/').pop() || 'index.html';
    return `
      <div class="d-sidebar" id="sidebar">
        ${this.navItems.map(item => `
          <div class="d-nav ${item.id === activeId ? 'active' : ''}" 
               onclick="window.location.href='${item.page}'" 
               title="${item.labelBn}">
            <span class="d-nav-i">${item.icon}</span>
            ${item.label}
            ${item.badge ? `<span class="d-badge">${item.badge}</span>` : ''}
          </div>
        `).join('')}
        <div class="d-progress">
          <div class="dp-label">TODAY'S PROGRESS</div>
          <div class="dp-val">1,247</div>
          <div class="dp-sub">of 1,800 target</div>
          <div class="dp-bar"><div class="dp-fill" style="width:69%"></div></div>
        </div>
      </div>`;
  },

  // ── Build Topbar ──────────────────────────────────────────
  buildTopbar(title, subtitle) {
    return `
      <div class="d-topbar">
        <div class="d-brand">
          <div class="d-logo" onclick="window.location.href='index.html'" style="cursor:pointer">
            <svg viewBox="0 0 16 16"><path d="M8 1L14 4.5V11.5L8 15L2 11.5V4.5L8 1Z"/></svg>
          </div>
          <div>
            <div class="d-title">OMS National Control Platform</div>
            <div style="font-size:10px;color:var(--text-muted)">${subtitle || 'Ministry of Food · Bangladesh'}</div>
          </div>
        </div>
        <div class="d-status">
          <div class="d-pill"><div class="d-live"></div>System Live</div>
          <div class="d-pill">📡 5,000 online</div>
          <div class="d-pill" id="topbar-time">📅 20 March 2026 — 09:41 BDT</div>
          <div class="d-pill d-alert">⚠ 3 Alerts</div>
          <div class="d-pill" style="cursor:pointer;background:var(--blue-050);color:var(--ink-500)" 
               onclick="window.location.href='index.html'">🏠 Home</div>
        </div>
      </div>`;
  },

  // ── Common CSS ────────────────────────────────────────────
  commonCSS() {
    return `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
:root {
  --ink-900:#050C1A; --ink-800:#0A1628; --ink-700:#0F2040; --ink-600:#1A3058;
  --ink-500:#1E3A8A; --blue-400:#2563EB; --blue-300:#3B82F6;
  --blue-100:#DBEAFE; --blue-050:#EFF6FF;
  --teal-600:#0F766E; --teal-500:#0D9488; --teal-400:#14B8A6;
  --teal-100:#CCFBF1; --teal-050:#F0FDFA;
  --amber-600:#B45309; --amber-500:#D97706; --amber-100:#FEF3C7; --amber-050:#FFFBEB;
  --red-600:#B91C1C; --red-500:#DC2626; --red-100:#FEE2E2;
  --green-600:#15803D; --green-500:#16A34A; --green-100:#DCFCE7; --green-050:#F0FDF4;
  --slate-900:#0F172A; --slate-800:#1E293B; --slate-600:#475569;
  --slate-500:#64748B; --slate-300:#CBD5E1; --slate-200:#E2E8F0;
  --slate-100:#F1F5F9; --slate-050:#F8FAFC; --white:#FFFFFF;
  --bg-light:var(--slate-050); --border-l:var(--slate-200);
  --text-primary:#0F172A; --text-secondary:var(--slate-600); --text-muted:var(--slate-500);
  --font-display:'Fraunces',Georgia,serif;
  --font-body:'Plus Jakarta Sans',system-ui,sans-serif;
  --font-mono:'JetBrains Mono','Courier New',monospace;
  --r-sm:6px; --r-md:10px; --r-lg:14px; --r-xl:20px;
  --sh-sm:0 1px 3px rgba(0,0,0,.06),0 1px 2px rgba(0,0,0,.04);
  --sh-md:0 4px 16px rgba(0,0,0,.08);
}
*,*::before,*::after{margin:0;padding:0;box-sizing:border-box;}
html{font-size:16px;}
body{font-family:var(--font-body);font-size:14px;background:var(--bg-light);color:var(--text-primary);overflow-x:hidden;}
::-webkit-scrollbar{width:4px;} ::-webkit-scrollbar-thumb{background:var(--slate-300);border-radius:2px;}

/* Topbar */
.d-topbar{background:white;border-bottom:1px solid var(--border-l);height:50px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;position:sticky;top:0;z-index:100;box-shadow:var(--sh-sm);}
.d-brand{display:flex;align-items:center;gap:9px;}
.d-logo{width:28px;height:28px;border-radius:6px;background:linear-gradient(135deg,var(--teal-500),var(--blue-400));display:flex;align-items:center;justify-content:center;}
.d-logo svg{width:14px;height:14px;fill:white;}
.d-title{font-family:var(--font-display);font-weight:600;font-size:13px;color:var(--slate-900);letter-spacing:-.2px;}
.d-status{display:flex;align-items:center;gap:8px;}
.d-pill{display:flex;align-items:center;gap:5px;background:var(--slate-100);border-radius:100px;padding:3px 10px;font-size:11px;color:var(--text-secondary);font-weight:500;}
.d-live{width:6px;height:6px;border-radius:50%;background:#22C55E;box-shadow:0 0 6px #22C55E;animation:blink 2s infinite;}
.d-alert{color:var(--red-500);}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.4}}

/* Layout */
.d-layout{display:flex;min-height:calc(100vh - 50px);}
.d-sidebar{width:192px;flex-shrink:0;background:white;border-right:1px solid var(--border-l);padding:8px 0;overflow-y:auto;}
.d-nav{display:flex;align-items:center;gap:8px;padding:8px 14px;font-size:12px;font-weight:500;color:var(--text-secondary);cursor:pointer;border-left:2.5px solid transparent;transition:all .12s;user-select:none;}
.d-nav:hover{color:var(--text-primary);background:var(--slate-050);}
.d-nav.active{color:var(--ink-500);background:var(--blue-050);border-left-color:var(--ink-500);font-weight:600;}
.d-nav-i{font-size:13px;width:16px;text-align:center;}
.d-badge{margin-left:auto;background:var(--red-500);color:white;font-size:9px;padding:1px 5px;border-radius:8px;font-weight:700;}
.d-progress{margin:10px 10px 0;background:var(--blue-050);border-radius:var(--r-md);padding:10px 12px;border:1px solid var(--blue-100);}
.dp-label{font-family:var(--font-mono);font-size:9px;letter-spacing:1px;color:var(--ink-500);margin-bottom:4px;font-weight:500;}
.dp-val{font-family:var(--font-display);font-size:18px;font-weight:700;color:var(--slate-900);}
.dp-sub{font-size:10px;color:var(--text-muted);}
.dp-bar{height:3px;background:var(--blue-100);border-radius:2px;margin-top:6px;}
.dp-fill{height:100%;background:var(--ink-500);border-radius:2px;transition:width 1s ease;}

/* Main */
.d-main{flex:1;overflow-y:auto;padding:20px;}
.dph{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:16px;}
.dph-t{font-family:var(--font-display);font-size:18px;font-weight:700;color:var(--slate-900);letter-spacing:-.4px;}
.dph-s{font-size:11px;color:var(--text-muted);margin-top:2px;}

/* Cards */
.dc{background:white;border-radius:var(--r-lg);border:1px solid var(--border-l);padding:14px 16px;box-shadow:var(--sh-sm);}
.dct{font-family:var(--font-mono);font-size:10px;font-weight:500;text-transform:uppercase;letter-spacing:.8px;color:var(--text-muted);margin-bottom:12px;}

/* Metrics */
.dm-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:14px;}
.dm-card{background:white;border-radius:var(--r-lg);padding:14px;border:1px solid var(--border-l);position:relative;overflow:hidden;box-shadow:var(--sh-sm);transition:transform .14s;}
.dm-card:hover{transform:translateY(-1px);}
.dm-card::after{content:'';position:absolute;top:0;left:0;right:0;height:2.5px;}
.mc-b::after{background:linear-gradient(90deg,var(--ink-500),var(--blue-400));}
.mc-t::after{background:linear-gradient(90deg,var(--teal-600),var(--teal-400));}
.mc-g::after{background:linear-gradient(90deg,var(--green-600),var(--green-500));}
.mc-a::after{background:linear-gradient(90deg,var(--amber-600),var(--amber-500));}
.mc-r::after{background:linear-gradient(90deg,var(--red-600),var(--red-500));}
.dm-lbl{font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);}
.dm-val{font-family:var(--font-display);font-size:24px;font-weight:700;margin:4px 0 2px;line-height:1;}
.mc-b .dm-val{color:var(--ink-500);}
.mc-t .dm-val{color:var(--teal-600);}
.mc-g .dm-val{color:var(--green-600);}
.mc-a .dm-val{color:var(--amber-600);}
.mc-r .dm-val{color:var(--red-600);}
.dm-trend{font-size:10px;color:var(--text-muted);}
.dm-icon{position:absolute;right:12px;top:12px;font-size:18px;opacity:.1;}

/* Grids */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;}
.g3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:12px;}
.g75{display:grid;grid-template-columns:7fr 5fr;gap:12px;margin-bottom:12px;}
.mb12{margin-bottom:12px;}
.mb14{margin-bottom:14px;}
.mono{font-family:var(--font-mono);font-size:10px;}

/* Tables */
.dt{width:100%;border-collapse:collapse;font-size:12px;}
.dt th{background:var(--slate-050);padding:8px 11px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.5px;color:var(--text-muted);font-weight:600;border-bottom:1px solid var(--border-l);}
.dt td{padding:9px 11px;border-bottom:1px solid var(--slate-050);color:var(--text-primary);vertical-align:middle;}
.dt tr:hover td{background:var(--slate-050);}
.dt tr:last-child td{border-bottom:none;}

/* Badges */
.b{display:inline-flex;align-items:center;padding:2px 7px;border-radius:9px;font-size:10px;font-weight:700;}
.bg{background:var(--green-100);color:var(--green-600);}
.br{background:var(--red-100);color:var(--red-600);}
.by{background:var(--amber-100);color:var(--amber-600);}
.bb{background:var(--blue-100);color:var(--ink-500);}
.bt{background:var(--teal-100);color:var(--teal-600);}
.bs{background:var(--slate-100);color:var(--slate-600);}

/* Buttons */
.btn{padding:6px 13px;border-radius:var(--r-sm);font-family:var(--font-body);font-size:11.5px;font-weight:600;cursor:pointer;border:none;transition:all .12s;}
.btn:active{transform:scale(.97);}
.btn-p{background:var(--ink-500);color:white;}
.btn-p:hover{background:var(--blue-400);}
.btn-t{background:var(--teal-500);color:white;}
.btn-t:hover{background:var(--teal-600);}
.btn-o{background:white;border:1.5px solid var(--border-l);color:var(--text-muted);}
.btn-o:hover{border-color:var(--slate-300);color:var(--text-primary);}
.btn-d{background:var(--red-500);color:white;}
.btn-s{background:var(--green-500);color:white;}
.btn-a{background:var(--amber-500);color:white;}

/* Form */
.fg{margin-bottom:10px;}
.fl{font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:3px;display:block;}
.fi{width:100%;padding:7px 10px;border:1.5px solid var(--border-l);border-radius:var(--r-sm);font-family:var(--font-body);font-size:12px;color:var(--text-primary);outline:none;transition:border .12s;}
.fi:focus{border-color:var(--ink-500);}
.fs{width:100%;padding:7px 10px;border:1.5px solid var(--border-l);border-radius:var(--r-sm);font-family:var(--font-body);font-size:12px;background:white;color:var(--text-primary);outline:none;}
.fs:focus{border-color:var(--ink-500);}

/* Alerts */
.al{padding:9px 12px;border-radius:var(--r-sm);font-size:12px;display:flex;align-items:flex-start;gap:7px;margin-bottom:8px;}
.al-e{background:var(--red-100);border:1px solid #FCA5A5;color:var(--red-600);}
.al-w{background:var(--amber-100);border:1px solid #FDE68A;color:var(--amber-600);}
.al-s{background:var(--green-100);border:1px solid #BBF7D0;color:var(--green-600);}
.al-i{background:var(--blue-050);border:1px solid var(--blue-100);color:var(--ink-500);}
.al-ic{font-size:13px;flex-shrink:0;margin-top:1px;}

/* Modal */
.modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:1000;display:none;align-items:center;justify-content:center;backdrop-filter:blur(4px);}
.modal-overlay.open{display:flex;}
.modal{background:white;border-radius:var(--r-xl);padding:24px;width:90%;max-width:520px;box-shadow:0 20px 60px rgba(0,0,0,.2);animation:modalIn .25s ease;}
.modal-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;}
.modal-title{font-family:var(--font-display);font-size:17px;font-weight:700;color:var(--slate-900);}
.modal-close{background:none;border:none;font-size:18px;cursor:pointer;color:var(--text-muted);padding:2px 6px;border-radius:4px;}
.modal-close:hover{background:var(--slate-100);}
@keyframes modalIn{from{opacity:0;transform:scale(.96) translateY(8px)}to{opacity:1;transform:none}}

/* Toast */
#toast-container{position:fixed;top:60px;right:16px;z-index:2000;display:flex;flex-direction:column;gap:7px;pointer-events:none;}
.toast{background:white;border-radius:10px;border:1px solid var(--border-l);padding:10px 14px;box-shadow:0 8px 28px rgba(0,0,0,.12);display:flex;align-items:center;gap:9px;font-size:12px;font-weight:500;color:var(--slate-900);max-width:280px;pointer-events:all;animation:toastIn .3s ease;}
.toast.out{animation:toastOut .25s ease forwards;}
@keyframes toastIn{from{opacity:0;transform:translateX(16px)}to{opacity:1;transform:none}}
@keyframes toastOut{to{opacity:0;transform:translateX(16px)}}

/* Timeline */
.tl-row{display:flex;gap:10px;padding-bottom:12px;position:relative;}
.tl-row:not(:last-child)::before{content:'';position:absolute;left:9px;top:20px;bottom:0;width:1px;background:var(--border-l);}
.tl-dot{width:20px;height:20px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:9px;flex-shrink:0;}
.tl-ok{background:var(--green-100);}
.tl-er{background:var(--red-100);}
.tl-wn{background:var(--amber-100);}
.tl-in{background:var(--blue-100);}
.tl-t{font-size:12px;font-weight:600;color:var(--slate-900);}
.tl-d{font-size:11px;color:var(--text-muted);margin-top:1px;}
.tl-m{font-size:10px;color:var(--text-muted);margin-top:1px;font-family:var(--font-mono);}

/* Bar chart */
.bc-row{display:flex;align-items:center;gap:8px;margin-bottom:7px;}
.bc-lbl{font-size:11px;color:var(--text-muted);width:85px;text-align:right;flex-shrink:0;}
.bc-track{flex:1;height:15px;background:var(--slate-100);border-radius:3px;overflow:hidden;}
.bc-fill{height:100%;border-radius:3px;transition:width 1.2s ease;}
.bc-v{font-size:11px;font-weight:600;color:var(--text-primary);width:32px;}

/* Mono text */
.mono{font-family:var(--font-mono);font-size:10px;}

/* Section nav tabs */
.tabs{display:flex;gap:2px;margin-bottom:14px;background:var(--slate-100);padding:3px;border-radius:var(--r-md);width:fit-content;}
.tab-btn{padding:5px 14px;font-size:12px;font-weight:500;border:none;background:none;cursor:pointer;border-radius:7px;color:var(--text-muted);transition:all .15s;}
.tab-btn.active{background:white;color:var(--ink-500);font-weight:600;box-shadow:var(--sh-sm);}
.tab-pane{display:none;}
.tab-pane.active{display:block;}

@media(max-width:900px){
  .dm-grid{grid-template-columns:1fr 1fr;}
  .g2,.g3,.g75{grid-template-columns:1fr;}
  .d-sidebar{width:160px;}
}
</style>`;
  },

  // ── Toast ─────────────────────────────────────────────────
  toast(msg, type = 'info') {
    const icons = { success:'✅', error:'🔴', warning:'⚠️', info:'ℹ️' };
    const colors = { success:'#16A34A', error:'#DC2626', warning:'#D97706', info:'#1D4ED8' };
    let tc = document.getElementById('toast-container');
    if (!tc) { tc = document.createElement('div'); tc.id = 'toast-container'; document.body.appendChild(tc); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.style.borderLeft = `3px solid ${colors[type]}`;
    t.innerHTML = `<span style="font-size:14px">${icons[type]}</span><span>${msg}</span>`;
    tc.appendChild(t);
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 300); }, 3000);
  },

  // ── Modal ─────────────────────────────────────────────────
  openModal(id) { document.getElementById(id).classList.add('open'); },
  closeModal(id) { document.getElementById(id).classList.remove('open'); },

  // ── Clock ─────────────────────────────────────────────────
  startClock() {
    const updateClock = () => {
      const el = document.getElementById('topbar-time');
      if (el) {
        const now = new Date();
        el.textContent = `📅 20 March 2026 — ${now.toTimeString().slice(0,5)} BDT`;
      }
    };
    updateClock();
    setInterval(updateClock, 30000);
  },

  // ── Tab switching ─────────────────────────────────────────
  initTabs(containerClass) {
    document.querySelectorAll(`.${containerClass} .tab-btn`).forEach(btn => {
      btn.addEventListener('click', () => {
        const group = btn.closest(`.${containerClass}`);
        group.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        group.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById(btn.dataset.tab).classList.add('active');
      });
    });
  },

  // ── Counter animation ─────────────────────────────────────
  countUp(el, target, duration = 1000) {
    let start = 0, startTime = null;
    const step = ts => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      el.textContent = Math.floor(ease * target).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target.toLocaleString();
    };
    requestAnimationFrame(step);
  },

  // ── Init Page ─────────────────────────────────────────────
  init() {
    this.startClock();
    // Animate bar fills
    setTimeout(() => {
      document.querySelectorAll('.bc-fill[data-w]').forEach(f => {
        const w = f.dataset.w;
        f.style.width = '0';
        setTimeout(() => f.style.width = w + '%', 100);
      });
      document.querySelectorAll('[data-count]').forEach(el => {
        this.countUp(el, parseInt(el.dataset.count));
      });
    }, 300);
  },

  // Alias for compatibility
  getSharedCSS() { return this.commonCSS(); }
};

// Auto-init
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => OMS.init());
}
