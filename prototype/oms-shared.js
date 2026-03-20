/**
 * oms-shared.js
 * Shared utilities, styles, and data for the OMS National Food Control Platform.
 * Pure vanilla JavaScript — no external dependencies.
 *
 * Usage:
 *   <script src="oms-shared.js"></script>
 *   document.addEventListener('DOMContentLoaded', () => OMS.init());
 */

const OMS = (() => {
  'use strict';

  // ─────────────────────────────────────────────────────────────
  // VERSION
  // ─────────────────────────────────────────────────────────────
  const version = '2.0.0';

  // ─────────────────────────────────────────────────────────────
  // SHARED CSS
  // ─────────────────────────────────────────────────────────────
  function getSharedCSS() {
    return `
/* ── Reset & Base ─────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg-base:      #0f172a;
  --bg-surface:   #1e293b;
  --bg-elevated:  #273549;
  --border:       #334155;
  --accent:       #22c55e;
  --accent-hover: #16a34a;
  --accent-dim:   rgba(34,197,94,.15);
  --danger:       #ef4444;
  --danger-hover: #dc2626;
  --warning:      #f59e0b;
  --info:         #3b82f6;
  --text-primary: #f1f5f9;
  --text-muted:   #94a3b8;
  --text-inverse: #0f172a;
  --radius:       8px;
  --radius-lg:    12px;
  --shadow:       0 4px 24px rgba(0,0,0,.4);
  --topbar-h:     60px;
  --sidebar-w:    250px;
  --transition:   .2s ease;
}

html { scroll-behavior: smooth; }

body {
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  background: var(--bg-base);
  color: var(--text-primary);
  font-size: 14px;
  line-height: 1.6;
  min-height: 100vh;
}

a { color: var(--accent); text-decoration: none; }
a:hover { text-decoration: underline; }

/* ── Layout Shell ──────────────────────────────────────────── */
.oms-shell {
  display: flex;
  min-height: 100vh;
}

/* ── Top Bar ───────────────────────────────────────────────── */
.topbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--topbar-h);
  background: var(--bg-surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 16px;
  z-index: 1000;
  box-shadow: 0 2px 12px rgba(0,0,0,.3);
}

.topbar__left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.topbar__hamburger {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 20px;
  cursor: pointer;
  padding: 6px;
  border-radius: var(--radius);
  transition: background var(--transition);
  line-height: 1;
}
.topbar__hamburger:hover { background: var(--bg-elevated); }

.topbar__brand { display: flex; flex-direction: column; line-height: 1.2; }
.topbar__title { font-size: 15px; font-weight: 700; color: var(--accent); letter-spacing: .2px; }
.topbar__subtitle { font-size: 11px; color: var(--text-muted); }

.topbar__center { display: flex; align-items: center; }

#clock {
  font-size: 13px;
  font-variant-numeric: tabular-nums;
  color: var(--text-muted);
  background: var(--bg-elevated);
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid var(--border);
  white-space: nowrap;
}

.topbar__right {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  justify-content: flex-end;
}

.topbar__username { font-size: 13px; color: var(--text-primary); white-space: nowrap; }

/* ── Sidebar ───────────────────────────────────────────────── */
.sidebar {
  position: fixed;
  top: var(--topbar-h);
  left: 0;
  width: var(--sidebar-w);
  height: calc(100vh - var(--topbar-h));
  background: var(--bg-surface);
  border-right: 1px solid var(--border);
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 900;
  transition: transform var(--transition);
}

.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-track { background: transparent; }
.sidebar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }

.sidebar__section-label {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--text-muted);
  padding: 16px 20px 6px;
}

.sidebar__nav { list-style: none; padding: 8px 0; }

.sidebar__link {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 20px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: background var(--transition), color var(--transition), border-color var(--transition);
  cursor: pointer;
}
.sidebar__link:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
  text-decoration: none;
}
.sidebar__link.active {
  background: var(--accent-dim);
  color: var(--accent);
  border-left-color: var(--accent);
}

.sidebar__icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }
.sidebar__label { flex: 1; }

/* ── Main Content Area ─────────────────────────────────────── */
.main-content {
  margin-left: var(--sidebar-w);
  margin-top: var(--topbar-h);
  padding: 28px;
  flex: 1;
  min-width: 0;
}

/* ── Page Header ───────────────────────────────────────────── */
.page-header {
  margin-bottom: 24px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
}
.page-header__title { font-size: 22px; font-weight: 700; color: var(--text-primary); }
.page-header__sub   { font-size: 13px; color: var(--text-muted); margin-top: 2px; }

/* ── Cards ─────────────────────────────────────────────────── */
.card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  box-shadow: var(--shadow);
}

.card--flat { box-shadow: none; }

.card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  gap: 12px;
}
.card__title { font-size: 15px; font-weight: 600; color: var(--text-primary); }
.card__subtitle { font-size: 12px; color: var(--text-muted); margin-top: 2px; }

/* Stat card */
.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: border-color var(--transition), transform var(--transition);
}
.stat-card:hover { border-color: var(--accent); transform: translateY(-2px); }
.stat-card__icon {
  font-size: 28px;
  width: 52px; height: 52px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-elevated);
  border-radius: var(--radius);
  flex-shrink: 0;
}
.stat-card__body { flex: 1; min-width: 0; }
.stat-card__label { font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }
.stat-card__value { font-size: 28px; font-weight: 700; color: var(--text-primary); line-height: 1.1; margin: 4px 0; }
.stat-card__change { font-size: 12px; color: var(--text-muted); }
.stat-card__change.up   { color: var(--accent); }
.stat-card__change.down { color: var(--danger); }

/* Grid helpers */
.grid { display: grid; gap: 20px; }
.grid-2 { grid-template-columns: repeat(2, 1fr); }
.grid-3 { grid-template-columns: repeat(3, 1fr); }
.grid-4 { grid-template-columns: repeat(4, 1fr); }

/* ── Buttons ───────────────────────────────────────────────── */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: var(--radius);
  border: none;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background var(--transition), opacity var(--transition), transform var(--transition);
  white-space: nowrap;
  line-height: 1;
  text-decoration: none !important;
}
.btn:active { transform: scale(.97); }
.btn:disabled { opacity: .5; cursor: not-allowed; }

.btn-primary   { background: var(--accent);   color: var(--text-inverse); }
.btn-primary:hover:not(:disabled) { background: var(--accent-hover); }

.btn-secondary { background: var(--bg-elevated); color: var(--text-primary); border: 1px solid var(--border); }
.btn-secondary:hover:not(:disabled) { background: var(--border); }

.btn-danger    { background: var(--danger);   color: #fff; }
.btn-danger:hover:not(:disabled) { background: var(--danger-hover); }

.btn-ghost { background: transparent; color: var(--text-muted); border: 1px solid var(--border); }
.btn-ghost:hover:not(:disabled) { background: var(--bg-elevated); color: var(--text-primary); }

.btn-sm { padding: 5px 10px; font-size: 12px; }
.btn-lg { padding: 11px 22px; font-size: 15px; }

.btn-icon { padding: 8px; border-radius: var(--radius); background: var(--bg-elevated); border: 1px solid var(--border); color: var(--text-muted); cursor: pointer; font-size: 15px; transition: background var(--transition); }
.btn-icon:hover { background: var(--border); color: var(--text-primary); }

/* ── Badges / Status Chips ─────────────────────────────────── */
.badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 9px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .3px;
  text-transform: uppercase;
  white-space: nowrap;
}

.badge-success  { background: rgba(34,197,94,.15);  color: #4ade80; }
.badge-danger   { background: rgba(239,68,68,.15);  color: #f87171; }
.badge-warning  { background: rgba(245,158,11,.15); color: #fbbf24; }
.badge-info     { background: rgba(59,130,246,.15); color: #60a5fa; }
.badge-muted    { background: rgba(148,163,184,.15);color: var(--text-muted); }

/* ── Tables ────────────────────────────────────────────────── */
.table-wrapper {
  overflow-x: auto;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead th {
  background: var(--bg-elevated);
  color: var(--text-muted);
  font-weight: 600;
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: .5px;
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid var(--border);
  white-space: nowrap;
}

tbody tr {
  border-bottom: 1px solid var(--border);
  transition: background var(--transition);
}
tbody tr:last-child { border-bottom: none; }
tbody tr:hover { background: var(--bg-elevated); }

td { padding: 12px 16px; color: var(--text-primary); vertical-align: middle; }

/* ── Forms ─────────────────────────────────────────────────── */
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-label { font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: .5px; }

.form-control {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  color: var(--text-primary);
  font-size: 13px;
  padding: 9px 12px;
  transition: border-color var(--transition), box-shadow var(--transition);
  width: 100%;
}
.form-control::placeholder { color: var(--text-muted); }
.form-control:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px var(--accent-dim);
}
.form-control:disabled { opacity: .5; cursor: not-allowed; }

select.form-control { cursor: pointer; }
textarea.form-control { resize: vertical; min-height: 80px; }

.form-row { display: grid; gap: 16px; }
.form-row-2 { grid-template-columns: repeat(2, 1fr); }
.form-row-3 { grid-template-columns: repeat(3, 1fr); }

/* ── Modal ─────────────────────────────────────────────────── */
.modal-overlay {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.65);
  z-index: 2000;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(4px);
}
.modal-overlay.open { display: flex; animation: fadeIn .18s ease; }

.modal {
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 540px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: var(--shadow);
  animation: slideUp .2s ease;
}

.modal--lg  { max-width: 720px; }
.modal--xl  { max-width: 940px; }

.modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid var(--border);
  gap: 12px;
}
.modal__title { font-size: 16px; font-weight: 700; }
.modal__close { background: none; border: none; color: var(--text-muted); font-size: 20px; cursor: pointer; line-height: 1; padding: 4px; border-radius: 4px; }
.modal__close:hover { color: var(--text-primary); background: var(--bg-elevated); }

.modal__body   { padding: 24px; }
.modal__footer { padding: 16px 24px; border-top: 1px solid var(--border); display: flex; gap: 10px; justify-content: flex-end; }

/* ── Toast Notifications ───────────────────────────────────── */
#toast-container {
  position: fixed;
  top: 76px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 280px;
  max-width: 380px;
  padding: 14px 16px;
  border-radius: var(--radius);
  border-left: 4px solid transparent;
  background: var(--bg-surface);
  box-shadow: var(--shadow);
  pointer-events: all;
  animation: toastIn .25s ease;
  font-size: 13px;
  line-height: 1.4;
}
.toast.hiding { animation: toastOut .25s ease forwards; }

.toast--success { border-left-color: var(--accent);  }
.toast--error   { border-left-color: var(--danger);  }
.toast--warning { border-left-color: var(--warning); }
.toast--info    { border-left-color: var(--info);    }

.toast__icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
.toast__body { flex: 1; }
.toast__title { font-weight: 700; margin-bottom: 2px; }
.toast__msg   { color: var(--text-muted); font-size: 12px; }
.toast__close { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 16px; line-height: 1; padding: 0 0 0 6px; flex-shrink: 0; }
.toast__close:hover { color: var(--text-primary); }

/* ── Divider ───────────────────────────────────────────────── */
.divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

/* ── Utility ───────────────────────────────────────────────── */
.text-muted    { color: var(--text-muted); }
.text-accent   { color: var(--accent); }
.text-danger   { color: var(--danger); }
.text-warning  { color: var(--warning); }
.text-center   { text-align: center; }
.text-right    { text-align: right; }
.flex          { display: flex; }
.flex-center   { display: flex; align-items: center; justify-content: center; }
.items-center  { align-items: center; }
.gap-8         { gap: 8px; }
.gap-12        { gap: 12px; }
.gap-16        { gap: 16px; }
.gap-20        { gap: 20px; }
.mt-8  { margin-top: 8px; }
.mt-16 { margin-top: 16px; }
.mt-20 { margin-top: 20px; }
.mt-24 { margin-top: 24px; }
.mb-8  { margin-bottom: 8px; }
.mb-16 { margin-bottom: 16px; }
.mb-20 { margin-bottom: 20px; }
.mb-24 { margin-bottom: 24px; }
.p-0   { padding: 0 !important; }
.w-full { width: 100%; }
.truncate { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.hidden { display: none !important; }

/* ── Keyframes ─────────────────────────────────────────────── */
@keyframes fadeIn  { from { opacity: 0; } to { opacity: 1; } }
@keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
@keyframes toastIn  { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
@keyframes toastOut { from { opacity: 1; transform: translateX(0);    } to { opacity: 0; transform: translateX(40px); } }

/* ── Sidebar collapsed (JS toggles .sidebar--collapsed) ────── */
.sidebar--collapsed { transform: translateX(calc(-1 * var(--sidebar-w))); }
.sidebar--collapsed ~ .main-content { margin-left: 0; }

/* ── Responsive ────────────────────────────────────────────── */
@media (max-width: 1024px) {
  .grid-4 { grid-template-columns: repeat(2, 1fr); }
  .grid-3 { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 768px) {
  :root { --sidebar-w: 250px; }
  .sidebar { transform: translateX(calc(-1 * var(--sidebar-w))); transition: transform .25s ease; z-index: 950; }
  .sidebar.open { transform: translateX(0); }
  .main-content { margin-left: 0 !important; padding: 16px; }
  .grid-2, .grid-3, .grid-4 { grid-template-columns: 1fr; }
  .form-row-2, .form-row-3  { grid-template-columns: 1fr; }
  .page-header { flex-direction: column; }
  .topbar__subtitle { display: none; }
}

@media (max-width: 480px) {
  .topbar__center { display: none; }
  .modal { max-width: 100%; margin: 0; border-radius: var(--radius) var(--radius) 0 0; }
  .modal-overlay { align-items: flex-end; padding: 0; }
}
`;
  }

  // ─────────────────────────────────────────────────────────────
  // TOP BAR
  // ─────────────────────────────────────────────────────────────
  /**
   * Returns the HTML string for the fixed top navigation bar.
   * @param {string} activeId - Not used by topbar directly; kept for API symmetry.
   */
  function buildTopbar(activeId) {
    return `
<header class="topbar">
  <div class="topbar__left">
    <button class="topbar__hamburger" id="sidebarToggle" aria-label="Toggle sidebar" title="Toggle Sidebar">&#9776;</button>
    <div class="topbar__brand">
      <span class="topbar__title">OMS National Control Platform</span>
      <span class="topbar__subtitle">Ministry of Food, Bangladesh</span>
    </div>
  </div>

  <div class="topbar__center">
    <div id="clock" aria-live="polite" aria-label="Current time in Bangladesh Standard Time">--:--:-- BDT</div>
  </div>

  <div class="topbar__right">
    <span class="badge badge-info" id="userRoleBadge">ADMIN</span>
    <span class="topbar__username" id="userNameDisplay">Md. Rahim Uddin</span>
    <button class="btn btn-ghost btn-sm" onclick="OMS.toast('You have been logged out.', 'info')" title="Logout">
      &#x2192; Logout
    </button>
  </div>
</header>`;
  }

  // ─────────────────────────────────────────────────────────────
  // SIDEBAR
  // ─────────────────────────────────────────────────────────────
  /**
   * Returns the HTML string for the sidebar navigation.
   * @param {string} activeId - The id string matching one of the nav item ids (e.g. 'dashboard').
   */
  function buildSidebar(activeId) {
    const nav = [
      { id: 'dashboard',      href: 'index.html',        icon: '📊', label: 'Dashboard' },
      { id: 'offices',        href: 'offices.html',       icon: '🏢', label: 'Offices & Programs' },
      { id: 'dealers',        href: 'dealers.html',       icon: '🏪', label: 'Dealer Management' },
      { id: 'beneficiaries',  href: 'beneficiaries.html', icon: '👥', label: 'Beneficiaries' },
      { id: 'distribution',   href: 'distribution.html',  icon: '📦', label: 'Distribution' },
      { id: 'inspection',     href: 'inspection.html',    icon: '🔍', label: 'Field Inspection' },
      { id: 'analytics',      href: 'analytics.html',     icon: '📈', label: 'Analytics' },
      { id: 'notifications',  href: 'notifications.html', icon: '🔔', label: 'Notifications' },
      { id: 'audit',          href: 'audit.html',         icon: '🔒', label: 'Audit Trail' },
    ];

    const items = nav.map(({ id, href, icon, label }) => {
      const isActive = id === activeId ? ' active' : '';
      return `
      <li>
        <a href="${href}" class="sidebar__link${isActive}" data-nav-id="${id}">
          <span class="sidebar__icon" aria-hidden="true">${icon}</span>
          <span class="sidebar__label">${label}</span>
        </a>
      </li>`;
    }).join('');

    return `
<nav class="sidebar" id="sidebar" aria-label="Main navigation">
  <p class="sidebar__section-label">Modules</p>
  <ul class="sidebar__nav">
    ${items}
  </ul>
</nav>`;
  }

  // ─────────────────────────────────────────────────────────────
  // TOAST NOTIFICATIONS
  // ─────────────────────────────────────────────────────────────
  const _toastMeta = {
    success: { icon: '✅', title: 'Success' },
    error:   { icon: '❌', title: 'Error'   },
    warning: { icon: '⚠️', title: 'Warning' },
    info:    { icon: 'ℹ️', title: 'Info'    },
  };

  /**
   * Displays a toast notification.
   * @param {string} msg   - The message to display.
   * @param {string} type  - 'success' | 'error' | 'warning' | 'info'
   */
  function toast(msg, type = 'info') {
    const meta = _toastMeta[type] || _toastMeta.info;
    const container = _ensureToastContainer();

    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.setAttribute('role', 'alert');
    el.innerHTML = `
      <span class="toast__icon" aria-hidden="true">${meta.icon}</span>
      <div class="toast__body">
        <div class="toast__title">${meta.title}</div>
        <div class="toast__msg">${_escapeHtml(msg)}</div>
      </div>
      <button class="toast__close" aria-label="Dismiss notification">&#215;</button>`;

    el.querySelector('.toast__close').addEventListener('click', () => _dismissToast(el));
    container.appendChild(el);

    // Auto-dismiss after 4 s
    setTimeout(() => _dismissToast(el), 4000);
  }

  function _dismissToast(el) {
    if (!el.parentNode) return;
    el.classList.add('hiding');
    el.addEventListener('animationend', () => el.remove(), { once: true });
  }

  function _ensureToastContainer() {
    let c = document.getElementById('toast-container');
    if (!c) {
      c = document.createElement('div');
      c.id = 'toast-container';
      c.setAttribute('aria-live', 'polite');
      document.body.appendChild(c);
    }
    return c;
  }

  // ─────────────────────────────────────────────────────────────
  // MODAL HELPERS
  // ─────────────────────────────────────────────────────────────
  /**
   * Opens a modal overlay element by id.
   * @param {string} id - The id of the .modal-overlay element.
   */
  function openModal(id) {
    const el = document.getElementById(id);
    if (!el) { console.warn(`[OMS] openModal: element #${id} not found`); return; }
    el.classList.add('open');
    document.body.style.overflow = 'hidden';
    // Focus first focusable element for a11y
    const focusable = el.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable) setTimeout(() => focusable.focus(), 80);
  }

  /**
   * Closes a modal overlay element by id.
   * @param {string} id - The id of the .modal-overlay element.
   */
  function closeModal(id) {
    const el = document.getElementById(id);
    if (!el) { console.warn(`[OMS] closeModal: element #${id} not found`); return; }
    el.classList.remove('open');
    document.body.style.overflow = '';
  }

  // ─────────────────────────────────────────────────────────────
  // LIVE CLOCK  (Bangladesh Standard Time = UTC+6)
  // ─────────────────────────────────────────────────────────────
  /**
   * Starts a live clock updating every second inside #clock.
   */
  function startClock() {
    const el = document.getElementById('clock');
    if (!el) return;

    // Use the IANA timezone for Bangladesh Standard Time (UTC+6, no DST)
    const _bdtFmt = new Intl.DateTimeFormat('en-GB', {
      timeZone:    'Asia/Dhaka',
      day:         '2-digit',
      month:       'short',
      year:        'numeric',
      hour:        '2-digit',
      minute:      '2-digit',
      second:      '2-digit',
      hour12:      false,
    });

    function tick() {
      // formatToParts gives locale-independent access to each date component
      const parts = _bdtFmt.formatToParts(new Date());
      const get = (type) => parts.find(p => p.type === type)?.value ?? '';
      el.textContent =
        `${get('day')} ${get('month')} ${get('year')}  ` +
        `${get('hour')}:${get('minute')}:${get('second')} BDT`;
    }

    tick();
    setInterval(tick, 1000);
  }

  // ─────────────────────────────────────────────────────────────
  // COUNT-UP ANIMATION
  // ─────────────────────────────────────────────────────────────
  /**
   * Animates a numeric count-up inside an element.
   * @param {HTMLElement|string} el       - Target element or its id.
   * @param {number}             target   - The final number to count to.
   * @param {number}             duration - Animation duration in milliseconds.
   */
  function countUp(el, target, duration = 1500) {
    const node = (typeof el === 'string') ? document.getElementById(el) : el;
    if (!node) return;

    const startTime = performance.now();
    const startVal  = parseFloat(node.textContent.replace(/[^0-9.]/g, '')) || 0;

    function step(now) {
      const elapsed  = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startVal + (target - startVal) * ease;
      // Preserve decimal places of the target
      const decimals = (target % 1 !== 0) ? 1 : 0;
      node.textContent = current.toFixed(decimals);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  // ─────────────────────────────────────────────────────────────
  // INIT
  // ─────────────────────────────────────────────────────────────
  /**
   * Initialises the page:
   *   - Injects shared CSS into <head>
   *   - Starts the live clock
   *   - Wires sidebar toggle button
   *   - Closes modals when overlay background is clicked
   *   - Closes modals on Escape key
   */
  function init() {
    _injectCSS();
    startClock();
    _wireSidebarToggle();
    _wireModalClose();
  }

  function _injectCSS() {
    if (document.getElementById('oms-shared-css')) return; // already injected
    const style = document.createElement('style');
    style.id = 'oms-shared-css';
    style.textContent = getSharedCSS();
    document.head.appendChild(style);
  }

  function _wireSidebarToggle() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('#sidebarToggle');
      if (!btn) return;
      const sidebar = document.getElementById('sidebar');
      if (!sidebar) return;
      // On mobile: toggle .open; on desktop: toggle .sidebar--collapsed
      if (window.innerWidth <= 768) {
        sidebar.classList.toggle('open');
      } else {
        sidebar.classList.toggle('sidebar--collapsed');
        const main = document.querySelector('.main-content');
        if (main) main.style.marginLeft = sidebar.classList.contains('sidebar--collapsed') ? '0' : '';
      }
    });
  }

  function _wireModalClose() {
    // Close on overlay click (outside .modal)
    document.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-overlay')) {
        e.target.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      const open = document.querySelector('.modal-overlay.open');
      if (open) {
        open.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // UTILITY
  // ─────────────────────────────────────────────────────────────
  function _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ─────────────────────────────────────────────────────────────
  // SAMPLE DATA — DEALERS
  // ─────────────────────────────────────────────────────────────
  const sampleDealers = [
    {
      id: 1,
      dealerCode:      'DLR-DHA-0001',
      name:            'Rahim Traders',
      nameBn:          'রহিম ট্রেডার্স',
      phone:           '01711-223344',
      area:            'Mirpur-10',
      district:        'Dhaka',
      status:          'ACTIVE',
      complianceScore: 94,
    },
    {
      id: 2,
      dealerCode:      'DLR-CTG-0012',
      name:            'Karim Enterprise',
      nameBn:          'করিম এন্টারপ্রাইজ',
      phone:           '01819-334455',
      area:            'Agrabad',
      district:        'Chattogram',
      status:          'ACTIVE',
      complianceScore: 88,
    },
    {
      id: 3,
      dealerCode:      'DLR-SYL-0008',
      name:            'Hasan & Brothers',
      nameBn:          'হাসান ও ব্রাদার্স',
      phone:           '01912-445566',
      area:            'Zindabazar',
      district:        'Sylhet',
      status:          'SUSPENDED',
      complianceScore: 41,
    },
    {
      id: 4,
      dealerCode:      'DLR-KHL-0003',
      name:            'Momotaz Stores',
      nameBn:          'মমতাজ স্টোর্স',
      phone:           '01614-556677',
      area:            'Sonadanga',
      district:        'Khulna',
      status:          'ACTIVE',
      complianceScore: 79,
    },
    {
      id: 5,
      dealerCode:      'DLR-RAJ-0021',
      name:            'Billal Fair Price Shop',
      nameBn:          'বিলাল ফেয়ার প্রাইস শপ',
      phone:           '01513-667788',
      area:            'New Market',
      district:        'Rajshahi',
      status:          'ACTIVE',
      complianceScore: 96,
    },
    {
      id: 6,
      dealerCode:      'DLR-BAR-0014',
      name:            'Sultana Distributor',
      nameBn:          'সুলতানা ডিস্ট্রিবিউটর',
      phone:           '01310-778899',
      area:            'Amtola',
      district:        'Barisal',
      status:          'PENDING',
      complianceScore: 0,
    },
    {
      id: 7,
      dealerCode:      'DLR-COM-0007',
      name:            'Anwar Ration Store',
      nameBn:          'আনোয়ার রেশন স্টোর',
      phone:           '01411-889900',
      area:            'Kandirpar',
      district:        'Cumilla',
      status:          'ACTIVE',
      complianceScore: 83,
    },
    {
      id: 8,
      dealerCode:      'DLR-MYM-0019',
      name:            'Reza Food Corner',
      nameBn:          'রেজা ফুড কর্নার',
      phone:           '01711-990011',
      area:            'Char Pursavaga',
      district:        'Mymensingh',
      status:          'SUSPENDED',
      complianceScore: 32,
    },
    {
      id: 9,
      dealerCode:      'DLR-JES-0005',
      name:            'Noor Ration House',
      nameBn:          'নূর রেশন হাউস',
      phone:           '01612-001122',
      area:            'Shibbari',
      district:        'Jashore',
      status:          'ACTIVE',
      complianceScore: 91,
    },
    {
      id: 10,
      dealerCode:      'DLR-TAN-0031',
      name:            'Faruk & Co.',
      nameBn:          'ফারুক অ্যান্ড কো.',
      phone:           '01912-112233',
      area:            'Victoria Road',
      district:        'Tangail',
      status:          'ACTIVE',
      complianceScore: 76,
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // SAMPLE DATA — BENEFICIARIES
  // ─────────────────────────────────────────────────────────────
  const sampleBeneficiaries = [
    {
      id: 1,
      beneficiaryCode: 'BNF-DHA-00441',
      name:            'Fatema Begum',
      nameBn:          'ফাতেমা বেগম',
      nid:             '1991234567890',
      phone:           '01734-112233',
      area:            'Mirpur-10',
      category:        'WIDOW',
      monthlyQuotaKg:  30,
      isActive:        true,
    },
    {
      id: 2,
      beneficiaryCode: 'BNF-CTG-00892',
      name:            'Abdul Jabbar',
      nameBn:          'আব্দুল জব্বার',
      nid:             '1985678901234',
      phone:           '01856-223344',
      area:            'Panchlaish',
      category:        'ELDERLY',
      monthlyQuotaKg:  20,
      isActive:        true,
    },
    {
      id: 3,
      beneficiaryCode: 'BNF-SYL-00213',
      name:            'Rohima Khatun',
      nameBn:          'রহিমা খাতুন',
      nid:             '1978345678901',
      phone:           '01923-334455',
      area:            'Shahjalal Upashahar',
      category:        'POOR_FAMILY',
      monthlyQuotaKg:  50,
      isActive:        true,
    },
    {
      id: 4,
      beneficiaryCode: 'BNF-KHL-00074',
      name:            'Mofizur Rahman',
      nameBn:          'মফিজুর রহমান',
      nid:             '1990012345678',
      phone:           '01634-445566',
      area:            'Khalishpur',
      category:        'DISABLED',
      monthlyQuotaKg:  25,
      isActive:        false,
    },
    {
      id: 5,
      beneficiaryCode: 'BNF-RAJ-00315',
      name:            'Amena Begum',
      nameBn:          'আমেনা বেগম',
      nid:             '1982456789012',
      phone:           '01556-556677',
      area:            'Boalia',
      category:        'WIDOW',
      monthlyQuotaKg:  30,
      isActive:        true,
    },
    {
      id: 6,
      beneficiaryCode: 'BNF-BAR-00166',
      name:            'Siddiqur Rahman',
      nameBn:          'সিদ্দিকুর রহমান',
      nid:             '1975567890123',
      phone:           '01345-667788',
      area:            'Bandar Road',
      category:        'ELDERLY',
      monthlyQuotaKg:  20,
      isActive:        true,
    },
    {
      id: 7,
      beneficiaryCode: 'BNF-COM-00547',
      name:            'Nargis Akhter',
      nameBn:          'নার্গিস আখতার',
      nid:             '1995678901234',
      phone:           '01478-778899',
      area:            'Laksam',
      category:        'POOR_FAMILY',
      monthlyQuotaKg:  50,
      isActive:        true,
    },
    {
      id: 8,
      beneficiaryCode: 'BNF-MYM-00228',
      name:            'Jamal Uddin',
      nameBn:          'জামাল উদ্দিন',
      nid:             '1965789012345',
      phone:           '01756-889900',
      area:            'Muktagacha',
      category:        'ELDERLY',
      monthlyQuotaKg:  20,
      isActive:        true,
    },
    {
      id: 9,
      beneficiaryCode: 'BNF-JES-00399',
      name:            'Rekha Rani Das',
      nameBn:          'রেখা রানী দাস',
      nid:             '1988890123456',
      phone:           '01623-990011',
      area:            'Bagherpara',
      category:        'POOR_FAMILY',
      monthlyQuotaKg:  45,
      isActive:        true,
    },
    {
      id: 10,
      beneficiaryCode: 'BNF-TAN-00680',
      name:            'Shahida Khatun',
      nameBn:          'শাহিদা খাতুন',
      nid:             '1972901234567',
      phone:           '01912-001122',
      area:            'Basail',
      category:        'DISABLED',
      monthlyQuotaKg:  25,
      isActive:        false,
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // SAMPLE DATA — TRANSACTIONS
  // ─────────────────────────────────────────────────────────────
  const sampleTransactions = [
    {
      id: 1,
      txnId:              'TXN-20240601-0001',
      dealerName:         'Rahim Traders',
      beneficiaryName:    'Fatema Begum',
      productType:        'RICE',
      quantityKg:         30,
      verificationMethod: 'FACE',
      status:             'ACCEPTED',
      createdAt:          '2024-06-01T08:14:22Z',
    },
    {
      id: 2,
      txnId:              'TXN-20240601-0002',
      dealerName:         'Karim Enterprise',
      beneficiaryName:    'Abdul Jabbar',
      productType:        'FLOUR',
      quantityKg:         20,
      verificationMethod: 'FACE',
      status:             'ACCEPTED',
      createdAt:          '2024-06-01T09:03:10Z',
    },
    {
      id: 3,
      txnId:              'TXN-20240601-0003',
      dealerName:         'Hasan & Brothers',
      beneficiaryName:    'Rohima Khatun',
      productType:        'RICE',
      quantityKg:         50,
      verificationMethod: 'EXCEPTION',
      status:             'EXCEPTION',
      createdAt:          '2024-06-01T09:47:55Z',
    },
    {
      id: 4,
      txnId:              'TXN-20240601-0004',
      dealerName:         'Momotaz Stores',
      beneficiaryName:    'Mofizur Rahman',
      productType:        'RICE',
      quantityKg:         25,
      verificationMethod: 'FACE',
      status:             'BLOCKED',
      createdAt:          '2024-06-01T10:22:18Z',
    },
    {
      id: 5,
      txnId:              'TXN-20240601-0005',
      dealerName:         'Billal Fair Price Shop',
      beneficiaryName:    'Amena Begum',
      productType:        'FLOUR',
      quantityKg:         30,
      verificationMethod: 'FACE',
      status:             'ACCEPTED',
      createdAt:          '2024-06-01T11:05:44Z',
    },
    {
      id: 6,
      txnId:              'TXN-20240601-0006',
      dealerName:         'Anwar Ration Store',
      beneficiaryName:    'Siddiqur Rahman',
      productType:        'RICE',
      quantityKg:         20,
      verificationMethod: 'FACE',
      status:             'ACCEPTED',
      createdAt:          '2024-06-01T11:38:07Z',
    },
    {
      id: 7,
      txnId:              'TXN-20240601-0007',
      dealerName:         'Reza Food Corner',
      beneficiaryName:    'Nargis Akhter',
      productType:        'RICE',
      quantityKg:         50,
      verificationMethod: 'EXCEPTION',
      status:             'EXCEPTION',
      createdAt:          '2024-06-01T12:14:33Z',
    },
    {
      id: 8,
      txnId:              'TXN-20240601-0008',
      dealerName:         'Noor Ration House',
      beneficiaryName:    'Jamal Uddin',
      productType:        'FLOUR',
      quantityKg:         20,
      verificationMethod: 'FACE',
      status:             'ACCEPTED',
      createdAt:          '2024-06-01T13:02:59Z',
    },
    {
      id: 9,
      txnId:              'TXN-20240601-0009',
      dealerName:         'Faruk & Co.',
      beneficiaryName:    'Rekha Rani Das',
      productType:        'RICE',
      quantityKg:         45,
      verificationMethod: 'FACE',
      status:             'ACCEPTED',
      createdAt:          '2024-06-01T13:50:11Z',
    },
    {
      id: 10,
      txnId:              'TXN-20240601-0010',
      dealerName:         'Sultana Distributor',
      beneficiaryName:    'Shahida Khatun',
      productType:        'FLOUR',
      quantityKg:         25,
      verificationMethod: 'EXCEPTION',
      status:             'BLOCKED',
      createdAt:          '2024-06-01T14:27:45Z',
    },
  ];

  // ─────────────────────────────────────────────────────────────
  // PUBLIC API
  // ─────────────────────────────────────────────────────────────
  return {
    version,
    getSharedCSS,
    buildTopbar,
    buildSidebar,
    toast,
    openModal,
    closeModal,
    startClock,
    countUp,
    init,
    sampleDealers,
    sampleBeneficiaries,
    sampleTransactions,
  };
})();

// Make OMS available globally in browser environments
if (typeof window !== 'undefined') {
  window.OMS = OMS;
}

// Also support CommonJS / Node environments (useful for testing)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = OMS;
}
