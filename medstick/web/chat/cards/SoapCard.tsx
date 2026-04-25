'use client'
import { useState } from 'react'
import * as Button from '@/components/ui/button'
import { useI18n } from '@/i18n/useI18n'
import { api } from '@/lib/api'
import type { EncounterMode } from '@/lib/types'

export interface SoapInitial {
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
  red_flags?: string[]
  raw_excerpt?: string
}

interface Props {
  initial: SoapInitial
  patientId: string | null
  chatId: string | null
  mode?: EncounterMode
  onSaved: (info: { id: string }) => void
}

export function SoapCard({ initial, patientId, chatId, mode = 'chat', onSaved }: Props) {
  const { t } = useI18n()
  const [s, setS] = useState(initial.subjective ?? initial.raw_excerpt ?? '')
  const [o, setO] = useState(initial.objective ?? '')
  const [a, setA] = useState(initial.assessment ?? '')
  const [p, setP] = useState(initial.plan ?? '')
  const [redFlags, setRedFlags] = useState((initial.red_flags ?? []).join(', '))
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState<string | null>(null)

  const save = async () => {
    setBusy(true)
    try {
      const e = await api.createEncounter({
        patient_id: patientId,
        chat_id: chatId,
        mode,
        soap_subjective: s || null,
        soap_objective: o || null,
        soap_assessment: a || null,
        soap_plan: p || null,
        red_flags: redFlags
          ? JSON.stringify(redFlags.split(',').map((x) => x.trim()).filter(Boolean))
          : null,
      })
      setSaved(e.id)
      onSaved({ id: e.id })
    } finally {
      setBusy(false)
    }
  }

  if (saved) {
    return (
      <div className="rounded-2xl border border-success-base/40 bg-success-lighter p-4 text-sm text-success-dark">
        ✓ {t.soap.saved}{' '}
        <span className="font-mono text-xs opacity-60">({saved.slice(0, 8)})</span>
      </div>
    )
  }

  const ta =
    'w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base resize-none'

  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 space-y-3 shadow-regular-xs">
      <div className="text-text-strong-950 text-sm font-bold">{t.soap.title}</div>
      {[
        { label: t.soap.subjective, value: s, setter: setS },
        { label: t.soap.objective, value: o, setter: setO },
        { label: t.soap.assessment, value: a, setter: setA },
        { label: t.soap.plan, value: p, setter: setP },
      ].map(({ label, value, setter }) => (
        <div key={label}>
          <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
            {label}
          </label>
          <textarea value={value} onChange={(e) => setter(e.target.value)} rows={2} className={ta} />
        </div>
      ))}
      <div>
        <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
          {t.soap.redFlags}
        </label>
        <input
          value={redFlags}
          onChange={(e) => setRedFlags(e.target.value)}
          className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
        />
      </div>
      <Button.Root onClick={save} disabled={busy} className="w-full">
        {t.soap.save}
      </Button.Root>
    </div>
  )
}

export function parseSoap(raw: string): SoapInitial | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const match = trimmed.match(/\{[\s\S]*\}/)
  if (!match) return null
  try {
    const obj = JSON.parse(match[0])
    if (typeof obj !== 'object' || obj === null) return null
    return {
      subjective: typeof obj.subjective === 'string' ? obj.subjective : '',
      objective: typeof obj.objective === 'string' ? obj.objective : '',
      assessment: typeof obj.assessment === 'string' ? obj.assessment : '',
      plan: typeof obj.plan === 'string' ? obj.plan : '',
      red_flags: Array.isArray(obj.red_flags)
        ? obj.red_flags.filter((x: unknown) => typeof x === 'string')
        : [],
    }
  } catch {
    return null
  }
}
