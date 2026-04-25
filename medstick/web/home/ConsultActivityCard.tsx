'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { RiArrowUpLine, RiPulseLine } from '@remixicon/react'

const SERIES = [
  { day: 'Mon', thisWeek: 4, lastWeek: 3 },
  { day: 'Tue', thisWeek: 7, lastWeek: 5 },
  { day: 'Wed', thisWeek: 3, lastWeek: 4 },
  { day: 'Thu', thisWeek: 9, lastWeek: 6 },
  { day: 'Fri', thisWeek: 6, lastWeek: 5 },
  { day: 'Sat', thisWeek: 5, lastWeek: 4 },
  { day: 'Sun', thisWeek: 8, lastWeek: 6 },
]

const tickStyle = {
  fontSize: 10.5,
  fill: '#94a3b8',
  fontWeight: 500,
}

const tooltipStyle = {
  background: '#ffffff',
  border: '1px solid rgba(10,22,40,0.08)',
  borderRadius: 8,
  padding: '6px 10px',
  fontSize: 12,
  boxShadow: '0 2px 8px rgba(10,22,40,0.06)',
}

interface StatProps {
  label: string
  value: string
  delta?: { sign: 'up' | 'down' | 'flat'; pct: string }
}

function Stat({ label, value, delta }: StatProps) {
  return (
    <div>
      <div className="text-[10.5px] uppercase tracking-[0.16em] font-semibold text-[var(--color-who-ink-mute)]">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span className="font-headline text-[var(--color-who-navy)] text-[24px] font-tabular">
          {value}
        </span>
        {delta && (
          <span
            className={`inline-flex items-center text-[11px] font-semibold font-tabular ${
              delta.sign === 'up'
                ? 'text-[var(--color-who-ok)]'
                : delta.sign === 'down'
                  ? 'text-[var(--color-who-err)]'
                  : 'text-[var(--color-who-ink-mute)]'
            }`}
          >
            {delta.sign === 'up' ? <RiArrowUpLine className="size-3" /> : null}
            {delta.pct}
          </span>
        )}
      </div>
    </div>
  )
}

export function ConsultActivityCard() {
  const total = SERIES.reduce((a, b) => a + b.thisWeek, 0)
  const prevTotal = SERIES.reduce((a, b) => a + b.lastWeek, 0)
  const delta = Math.round(((total - prevTotal) / prevTotal) * 100)

  return (
    <div className="bg-white border border-[var(--color-who-ring)] rounded-2xl p-5 md:p-6 h-full flex flex-col min-h-0">
      <header className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[var(--color-who-ink-mute)]">
            <RiPulseLine className="size-3.5 text-[var(--color-who-blue-deep)]" />
            Consult activity · last 7 days
          </div>
          <h3 className="mt-1.5 font-headline text-[20px] md:text-[22px] text-[var(--color-who-navy)]">
            {total} consults this week
          </h3>
        </div>
        <span className="inline-flex items-center gap-3 text-[11px] text-[var(--color-who-ink-soft)]">
          <span className="inline-flex items-center gap-1.5">
            <span className="block w-3 h-0.5 bg-[var(--color-who-blue)] rounded" />
            This week
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="block w-3 h-0.5 border-t border-dashed border-[var(--color-who-ink-mute)]" />
            Last week
          </span>
        </span>
      </header>

      <div className="flex-1 min-h-0 my-3 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={SERIES} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="actFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#009edb" stopOpacity={0.22} />
                <stop offset="100%" stopColor="#009edb" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(10,22,40,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              tick={tickStyle}
              tickLine={false}
              axisLine={{ stroke: 'rgba(10,22,40,0.08)' }}
              dy={4}
            />
            <YAxis
              tick={tickStyle}
              tickLine={false}
              axisLine={false}
              width={28}
              allowDecimals={false}
            />

            <Tooltip
              cursor={{ stroke: 'rgba(10,22,40,0.12)', strokeDasharray: '4 4' }}
              contentStyle={tooltipStyle}
              labelStyle={{
                color: '#0a1628',
                fontWeight: 600,
                fontSize: 11,
                marginBottom: 2,
              }}
              itemStyle={{ color: '#475569', padding: 0 }}
              formatter={(v: number, name: string) => [
                v,
                name === 'thisWeek' ? 'This week' : 'Last week',
              ]}
            />

            <Line
              type="monotone"
              dataKey="lastWeek"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="4 4"
              dot={false}
              activeDot={false}
            />

            <Area
              type="monotone"
              dataKey="thisWeek"
              stroke="#009edb"
              strokeWidth={2}
              fill="url(#actFill)"
              dot={{
                stroke: '#009edb',
                strokeWidth: 2,
                fill: '#fff',
                r: 3,
              }}
              activeDot={{
                stroke: '#009edb',
                strokeWidth: 2,
                fill: '#fff',
                r: 5,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-4 pt-3 border-t border-[var(--color-who-ring)]">
        <Stat
          label="Consults"
          value={String(total)}
          delta={{ sign: delta >= 0 ? 'up' : 'down', pct: `${delta >= 0 ? '+' : ''}${delta}%` }}
        />
        <Stat label="Images read" value="18" delta={{ sign: 'up', pct: '+9%' }} />
        <Stat label="Active patients" value="12" delta={{ sign: 'flat', pct: '—' }} />
      </div>
    </div>
  )
}
