export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sb-brand">
        <div className="sb-logo">MedStick</div>
        <div className="sb-tagline">Field Health Intelligence</div>
      </div>

      <div className="sb-hospital">
        <div className="sb-hosp-lbl">Current facility</div>
        <div className="sb-hosp-name">Al-Thawra Medical Complex</div>
        <div className="sb-hosp-loc">Sanaa · Yemen</div>
        <div className="sb-hosp-switch">↕ Switch hospital</div>
      </div>

      <div className="sb-nav">
        <div className="sb-section-lbl">Operations</div>

        <div className="nav-item active">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="1" width="5" height="5" rx="1" fill="currentColor"/>
            <rect x="8" y="1" width="5" height="5" rx="1" fill="currentColor"/>
            <rect x="1" y="8" width="5" height="5" rx="1" fill="currentColor"/>
            <rect x="8" y="8" width="5" height="5" rx="1" fill="currentColor"/>
          </svg>
          Dashboard
        </div>

        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="4.5" r="2.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M2 12c0-2.8 2.2-5 5-5s5 2.2 5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Workers
        </div>

        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="6" r="4" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 10v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M5 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          Coverage Map
        </div>

        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M4.5 5h5M4.5 7.5h5M4.5 10h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Protocols
        </div>

        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <rect x="1" y="8" width="3" height="5" rx="1" fill="currentColor"/>
            <rect x="5.5" y="5" width="3" height="8" rx="1" fill="currentColor"/>
            <rect x="10" y="2" width="3" height="11" rx="1" fill="currentColor"/>
          </svg>
          Reports
        </div>

        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 1L8.5 5h4l-3.2 2.4 1.2 3.8L7 9 3.5 11.2l1.2-3.8L1.5 5h4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
          </svg>
          Alerts
          <span className="nav-badge">3</span>
        </div>

        <div className="sb-section-lbl" style={{ marginTop: 6 }}>Admin</div>

        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 1v2M7 11v2M1 7h2M11 7h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            <path d="M2.9 2.9l1.4 1.4M9.7 9.7l1.4 1.4M2.9 11.1l1.4-1.4M9.7 4.3l1.4-1.4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
          </svg>
          Settings
        </div>

        <div className="nav-item">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M5 7h8M5 3H3a1 1 0 00-1 1v6a1 1 0 001 1h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M11 5l2 2-2 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Sign out
        </div>
      </div>

      <div className="sb-foot">
        <div className="sb-settings">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3"/>
            <path d="M6 4v2.5L7.5 8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          </svg>
          Last login: Today 05:47
        </div>
        <div className="sb-user">
          <div className="sb-avatar">SA</div>
          <div>
            <div className="sb-uname">Dr. Sarah Al-Akhdar</div>
            <div className="sb-urole">Field Supervisor</div>
          </div>
        </div>
      </div>
    </div>
  );
}
