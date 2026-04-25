import { Fragment } from 'react';
import { tickerItems } from '../data/demo';

const severityColor: Record<string, string> = {
  hi: '#f87171',
  warn: '#fbbf24',
  ok: '#86efac',
};

function TickItem({ item }: { item: typeof tickerItems[number] }) {
  return (
    <span className="ti">
      <span style={{ color: 'var(--ink-mute)' }}>{item.age}</span>
      {' · '}
      <b>{item.worker}</b>
      {' · '}
      <span style={{ color: severityColor[item.severity] }}>{item.condition}</span>
      {' · '}
      <span className="ok">Validated ✓</span>
      {' · '}
      <span className="mn">{item.cite}</span>
    </span>
  );
}

export default function Ticker() {
  const doubled = [...tickerItems, ...tickerItems];

  return (
    <div className="ticker">
      <div className="tk-lbl">Case log</div>
      <div className="tk-track">
        <div className="tk-inner">
          {doubled.map((item, i) => (
            <Fragment key={i}>
              <TickItem item={item} />
              {i < doubled.length - 1 && <span className="tk-sep">·····</span>}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
