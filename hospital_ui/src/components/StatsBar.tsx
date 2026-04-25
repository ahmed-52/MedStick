import { useEffect, useState } from 'react';

function useCountUp(target: number, suffix: string, duration: number) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let v = 0;
    const step = target / (duration / 16);
    const t = setInterval(() => {
      v = Math.min(v + step, target);
      setValue(Math.round(v));
      if (v >= target) clearInterval(t);
    }, 16);
    return () => clearInterval(t);
  }, [target, duration]);
  return `${value}${suffix}`;
}

export default function StatsBar() {
  const crit = useCountUp(23, '', 900);
  const cases = useCountUp(847, '', 1400);
  const adh = useCountUp(91, '%', 1100);
  const peak = useCountUp(143, '', 1200);

  return (
    <div className="stats-bar">
      <div className="sblock" style={{ paddingLeft: 10, borderLeft: '2px solid var(--err)' }}>
        <div className="snum" style={{ color: 'var(--err)' }}>{crit}</div>
        <div className="slbl">Critical Referrals</div>
        <div className="ssub">Immediate action</div>
      </div>
      <div className="sblock">
        <div className="snum" style={{ color: 'var(--navy)' }}>{cases}</div>
        <div className="slbl">Cases This Week</div>
        <div className="ssub">↑ 12% vs Week 11</div>
      </div>
      <div className="sblock">
        <div className="snum" style={{ color: 'var(--ok)' }}>{adh}</div>
        <div className="slbl">Protocol Adherence</div>
        <div className="ssub">WHO threshold &gt;85%</div>
      </div>
      <div className="sblock">
        <div className="snum" style={{ color: 'var(--navy)' }}>10/14</div>
        <div className="slbl">Workers Active</div>
        <div className="ssub">4 requiring check-in</div>
      </div>
      <div className="spills">
        <span className="spill sp-blue">91% adherence ✓</span>
        <span className="spill sp-err">1 offline</span>
        <span className="spill sp-warn">1 overdue</span>
      </div>
      {/* peak used in MapView's below strip — expose via context or prop if needed */}
      <span style={{ display: 'none' }} id="peak-val">{peak}</span>
    </div>
  );
}
