import { useState } from 'react';

export default function ProtocolPanel() {
  const [showAr, setShowAr] = useState(false);

  return (
    <div className="right-col">
      <div className="rp-head">
        <div className="sec-lbl">Protocol &amp; Escalation</div>
        <div className="rp-title">Weekly Operations Review</div>
        <div className="rp-sub">Week 12, Apr 14–20 · Validated case patterns</div>
      </div>

      <div className="rscroll">
        <div className="sdiv">
          <span className="sdiv-lbl">Weekly Summary</span>
          <span className="sdiv-val">Apr 14–20</span>
        </div>
        <div className="summary-block">
          {!showAr ? (
            <div className="d-en">
              23% increase in severe dehydration across Hodeidah, consistent with water disruption reported April 16th. Protocol adherence strong at 91%. Ahmed Qasim (Sanaa, 11 cases/day) flagged for welfare check. Nadia Hassan (Ibb) unreachable 3 days — escalation required.
            </div>
          ) : (
            <div className="d-ar">
              ارتفاع بنسبة 23٪ في حالات الجفاف الشديد بالحديدة. نسبة الالتزام 91٪. أحمد قاسم (11 حالة يومياً) يحتاج فحصاً. نادية حسن في إب لم يُتواصل معها 3 أيام.
            </div>
          )}
        </div>
        <div className="cites-block">
          <div className="cite">WHO-CHOLERA-2023 §4.2 · Plan C IV Ringer's lactate</div>
          <div className="cite">WHO-IMAM-2023 §3.1 · MUAC &lt;11.5cm = SAM</div>
          <div className="cite">MSF-YEMEN-2024 · ORS, conflict settings</div>
        </div>

        <div className="sdiv">
          <span className="sdiv-lbl">Current Risk</span>
          <span className="sdiv-badge" style={{ background: 'var(--err)', color: '#fff' }}>HIGH</span>
        </div>
        <div className="risk-block">
          <div className="risk-item"><div className="ri-box" style={{ background: 'var(--err)' }} />Hodeidah water disruption — dehydration surge</div>
          <div className="risk-item"><div className="ri-box" style={{ background: 'var(--err)' }} />Ibb coverage gap — 3 days dark</div>
          <div className="risk-item"><div className="ri-box" style={{ background: 'var(--warn)' }} />Taiz sync overdue — continuity unconfirmed</div>
          <div className="risk-item"><div className="ri-box" style={{ background: 'var(--ok)' }} />Referral accuracy up 8% vs Week 11</div>
        </div>

        <div className="sdiv">
          <span className="sdiv-lbl">Active Protocols</span>
          <span className="sdiv-badge" style={{ background: 'var(--tint)', color: 'var(--blue-deep)' }}>3 in effect</span>
        </div>
        <div className="proto-block">
          <div className="pcard">
            <div className="pc-cite">WHO-CHOLERA-2023 §4.2</div>
            <div className="pc-action">Severe dehydration — Plan C</div>
            <div className="pc-desc">IV Ringer's lactate 100ml/kg over 3h · reassess every 30 min</div>
          </div>
          <div className="pcard">
            <div className="pc-cite">WHO-IMAM-2023 §3.1</div>
            <div className="pc-action">MUAC &lt;11.5cm — SAM threshold</div>
            <div className="pc-desc">Immediate referral to therapeutic feeding · do not discharge</div>
          </div>
          <div className="pcard">
            <div className="pc-cite">MSF-YEMEN-2024</div>
            <div className="pc-action">ORS — conflict settings</div>
            <div className="pc-desc">Double distribution in active displacement zones</div>
          </div>
        </div>

        <div className="sdiv">
          <span className="sdiv-lbl" style={{ color: 'var(--err)' }}>Escalation Required</span>
          <span className="sdiv-val">3 actions</span>
        </div>
        <div className="esc-block">
          <div className="esc-item">
            <div className="esc-who">Nadia Hassan · Ibb · 3d offline</div>
            <div className="esc-action">Contact NGO field coordinator</div>
            <div className="esc-cite">WHO-CHW-2022 · welfare check</div>
          </div>
          <div className="esc-item warn">
            <div className="esc-who">Ahmed Qasim · Sanaa · 11 cases/day</div>
            <div className="esc-action">Welfare check + ORS resupply request</div>
            <div className="esc-cite">WHO-IMAM-2023 §6.2</div>
          </div>
          <div className="esc-item warn">
            <div className="esc-who">Hodeidah district</div>
            <div className="esc-action">Deploy emergency ORS · monitor water</div>
            <div className="esc-cite">WHO-CHOLERA-2023 §5.1</div>
          </div>
        </div>
      </div>

      <div className="ar-wrap">
        <button className="ar-btn" onClick={() => setShowAr(v => !v)}>
          {showAr ? '← عرض بالإنجليزية' : '← عرض الملخص بالعربية'}
        </button>
      </div>
    </div>
  );
}
