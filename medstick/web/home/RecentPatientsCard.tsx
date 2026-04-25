'use client'

import { useRouter } from 'next/navigation'
import { RiArrowRightSLine, RiUser3Line } from '@remixicon/react'
import { useApp } from '@/store/app'
import { useFetch } from '@/lib/useFetch'
import { api } from '@/lib/api'
import type { Patient } from '@/lib/types'

function timeAgo(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime()
  const m = Math.floor(ms / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  const d = Math.floor(h / 24)
  if (d === 1) return 'yesterday'
  if (d < 7) return `${d}d ago`
  return new Date(iso).toLocaleDateString()
}

const sexLabel: Record<Patient['sex'], string> = {
  m: 'M',
  f: 'F',
  other: 'X',
  unknown: '—',
}

export function RecentPatientsCard({ limit = 4 }: { limit?: number }) {
  const router = useRouter()
  const setViewing = useApp((s) => s.setViewingPatient)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const { data, loading } = useFetch(() => api.listPatients(), [])
  const recent = (data ?? []).slice(0, limit)

  return (
    <div className="bg-white border border-[var(--color-who-ring)] rounded-2xl p-4 md:p-5">
      <header className="flex items-baseline justify-between mb-2 px-0.5">
        <div className="flex items-center gap-2 text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[var(--color-who-ink-mute)]">
          <RiUser3Line className="size-3.5 text-[var(--color-who-blue-deep)]" />
          Recent patients
        </div>
        <button
          onClick={() => router.push('/patients')}
          className="text-[11.5px] font-semibold text-[var(--color-who-blue-deep)] hover:underline"
        >
          See all →
        </button>
      </header>

      {loading && recent.length === 0 ? (
        <div className="text-[12px] text-[var(--color-who-ink-mute)] py-4 text-center">Loading…</div>
      ) : recent.length === 0 ? (
        <div className="text-[12px] text-[var(--color-who-ink-mute)] py-6 text-center">
          No patient records yet.
        </div>
      ) : (
        <ul className="divide-y divide-[var(--color-who-ring)]">
          {recent.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  setViewing(p.id)
                  router.push('/patients')
                }}
                className="group w-full flex items-center gap-3 py-2.5 px-1.5 -mx-1.5 rounded-lg text-start hover:bg-[var(--color-who-canvas)] transition-colors"
              >
                <span className="size-8 rounded-md bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)] group-hover:bg-[var(--color-who-blue)] group-hover:text-white flex items-center justify-center text-[11px] font-bold shrink-0 transition-colors">
                  {p.name
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[13.5px] font-semibold text-[var(--color-who-ink)] truncate">
                    {p.name}
                  </div>
                  <div className="text-[11.5px] text-[var(--color-who-ink-soft)] font-tabular flex items-center gap-1.5">
                    <span>{p.age_years != null ? `${p.age_years}y` : '—'}</span>
                    <span className="text-[var(--color-who-ink-mute)]">·</span>
                    <span>{sexLabel[p.sex]}</span>
                    <span className="text-[var(--color-who-ink-mute)]">·</span>
                    <span className="text-[var(--color-who-ink-mute)]">{timeAgo(p.updated_at)}</span>
                  </div>
                </div>
                <span
                  onClick={(e) => {
                    e.stopPropagation()
                    setActive(p.id)
                    setActiveChat(null)
                    router.push('/chat')
                  }}
                  className="hidden md:inline-flex shrink-0 items-center gap-1 rounded-full border border-[var(--color-who-ring)] px-2 py-0.5 text-[10.5px] font-semibold text-[var(--color-who-ink-soft)] hover:border-[var(--color-who-blue)] hover:text-[var(--color-who-blue-deep)]"
                  role="button"
                  tabIndex={0}
                >
                  Consult
                </span>
                <RiArrowRightSLine className="size-4 text-[var(--color-who-ink-mute)] shrink-0 group-hover:text-[var(--color-who-blue-deep)]" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
