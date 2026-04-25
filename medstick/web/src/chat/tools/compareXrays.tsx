import { useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { api } from '../../lib/api'
import { downscaleImage } from '../../lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode, splitSections } from './_modeBase'

const PROMPT = `You are a radiologist comparing two chest X-rays. The first image is the PRIOR and the second is the CURRENT study. Output exactly:

Changes: <what changed between prior and current>
Stable: <what looks the same>
Recommended action: <one concrete next step>

Be concise.`

function CompareCard({ raw, imageIds }: { raw: string; imageIds: string[] }) {
  const s = splitSections(raw, ['Changes', 'Stable', 'Recommended action'])
  return (
    <SpecialtyCard title="Compare X-rays" emoji="📊" imageIds={imageIds}>
      <Section label="Changes" body={s['Changes']} />
      <Section label="Stable" body={s['Stable']} />
      <Section label="Recommended action" body={s['Recommended action']} />
    </SpecialtyCard>
  )
}

function CompareForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const [prior, setPrior] = useState<File | null>(null)
  const [current, setCurrent] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async () => {
    if (!prior || !current) return
    setBusy(true)
    try {
      const [pBlob, cBlob] = await Promise.all([downscaleImage(prior), downscaleImage(current)])
      const [pPhoto, cPhoto] = await Promise.all([
        api.uploadPhoto(pBlob, prior.name, { patient_id: ctx.activePatientId ?? undefined }),
        api.uploadPhoto(cBlob, current.name, { patient_id: ctx.activePatientId ?? undefined }),
      ])
      onClose()
      const ids = [pPhoto.id, cPhoto.id]
      await runSpecialtyMode(ctx, {
        mode: 'compare',
        title: 'Compare X-rays',
        emoji: '📊',
        systemPrompt: PROMPT,
        userText: 'First image is prior, second is current. Compare them.',
        imageIds: ids,
        parser: (raw) => <CompareCard raw={raw} imageIds={ids} />,
      })
    } finally {
      setBusy(false)
    }
  }

  const slot = (label: string, file: File | null, onPick: (f: File) => void) => (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-stone-500 mb-1">{label}</div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
        className="block w-full text-xs file:rounded-lg file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-stone-800 file:hover:bg-stone-200 file:font-medium"
      />
      {file && <div className="text-xs text-emerald-700 mt-1 truncate">✓ {file.name}</div>}
    </div>
  )

  return (
    <div className="space-y-3">
      {slot('Prior X-ray', prior, setPrior)}
      {slot('Current X-ray', current, setCurrent)}
      <button onClick={run} disabled={busy || !prior || !current}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:bg-stone-300">
        Compare
      </button>
    </div>
  )
}

registerTool({
  id: 'compareXrays',
  group: 'modes',
  label: { en: 'Compare X-rays', ar: 'مقارنة أشعات' },
  Form: CompareForm,
})

export { CompareCard }
