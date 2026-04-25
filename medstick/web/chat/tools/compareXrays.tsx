'use client'
import { useState } from 'react'
import * as Button from '@/components/ui/button'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { api } from '@/lib/api'
import { downscaleImage } from '@/lib/image'
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
    <SpecialtyCard title="Compare X-rays" toolId="compareXrays" imageIds={imageIds}>
      <Section label="Changes" body={s['Changes']} variant="highlight" />
      <Section label="Stable" body={s['Stable']} />
      <Section label="Next steps" body={s['Recommended action']} variant="action" />
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
        toolId: 'compareXrays',
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
      <div className="text-text-soft-400 mb-1 text-[10px] uppercase tracking-wider font-semibold">{label}</div>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && onPick(e.target.files[0])}
        className="block w-full text-xs file:rounded-lg file:border-0 file:bg-bg-weak-50 file:px-3 file:py-2 file:text-text-strong-950 file:hover:bg-bg-soft-200 file:font-medium"
      />
      {file && <div className="text-success-dark text-xs mt-1 truncate">✓ {file.name}</div>}
    </div>
  )

  return (
    <div className="space-y-2.5">
      {slot('Prior X-ray', prior, setPrior)}
      {slot('Current X-ray', current, setCurrent)}
      <Button.Root onClick={run} disabled={busy || !prior || !current} className="w-full">
        Compare
      </Button.Root>
    </div>
  )
}

registerTool({
  id: 'compareXrays',
  group: 'modes',
  label: { en: 'Compare X-rays', ar: 'مقارنة أشعات' },
  Form: CompareForm,
})
