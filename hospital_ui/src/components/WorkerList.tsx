import { useState } from 'react';
import { workers } from '../data/demo';

interface Props {
  selectedIdx: number | null;
  onSelect: (i: number) => void;
}

export default function WorkerList({ selectedIdx, onSelect }: Props) {
  const [query, setQuery] = useState('');
  const q = query.toLowerCase();
  const filtered = workers.map((w, i) => ({ w, i })).filter(
    ({ w }) => !q || `${w.name} ${w.location}`.toLowerCase().includes(q)
  );

  return (
    <div className="left-col">
      <div className="lp-head">
        <div className="sec-lbl">Active Workers · 10 assigned</div>
        <input
          className="wsearch"
          type="text"
          placeholder="Search workers…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div className="wqueue">
        {filtered.map(({ w, i }) => (
          <div
            key={i}
            className={`wrow${selectedIdx === i ? ' sel' : ''}`}
            onClick={() => onSelect(i)}
          >
            <div className="wav" style={{ background: w.color }}>{w.initials}</div>
            <div className="wi">
              <div className="wname">{w.name}</div>
              <div className="wname-ar">{w.nameAr}</div>
              <div className="wloc">{w.location}</div>
              {w.flag && (
                <div className="wflag-inline" style={{ color: w.flagColor }}>{w.flag}</div>
              )}
            </div>
            <div className="wr">
              <div className="wsync" style={{ color: w.syncColor }}>● {w.syncText}</div>
              <div className="wcases">{w.cases} cases</div>
            </div>
          </div>
        ))}
      </div>

      <div className="lp-foot">
        <div className="lf-row"><span className="lf-l">Last sync</span><span className="lf-r">2 mins ago</span></div>
        <div className="lf-row"><span className="lf-l">Validation</span><span className="lf-r">All reviewed</span></div>
        <div className="lf-row"><span className="lf-l">Coverage</span><span className="lf-r">9 governorates</span></div>
      </div>
    </div>
  );
}
