import { useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '../../store/app'
import { api } from '../../lib/api'
import { downscaleImage } from '../../lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode, splitSections } from './_modeBase'

const PROMPT = `You are a dermatologist reviewing a single skin lesion image. Output ABCDE evaluation followed by morphology and recommendation. Use exactly these labels:

Asymmetry: <one line>
Border: <one line>
Color: <one line>
Diameter: <one line>
Evolution: <one line if can be inferred, otherwise "Cannot assess from single image">
Morphology: <one line clinical description>
Recommended action: <one line concrete next step>

Be concise. Do not add extra commentary.`

function DermCard({ raw, imageIds }: { raw: string; imageIds: string[] }) {
  const labels = ['Asymmetry','Border','Color','Diameter','Evolution','Morphology','Recommended action']
  const s = splitSections(raw, labels)
  return (
    <SpecialtyCard title="Dermatology" emoji="🔬" imageIds={imageIds}>
      {labels.map((l) => <Section key={l} label={l} body={s[l]} />)}
    </SpecialtyCard>
  )
}

function DermForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const stagedPhotoIds = useApp((s) => s.stagedPhotoIds)
  const [busy, setBusy] = useState(false)

  const pickAndRun = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    ;(input as any).capture = 'environment'
    const file: File | null = await new Promise((resolve) => {
      input.onchange = () => resolve(input.files?.[0] ?? null)
      input.click()
    })
    if (!file) return
    setBusy(true)
    try {
      const blob = await downscaleImage(file)
      const photo = await api.uploadPhoto(blob, file.name, {
        patient_id: ctx.activePatientId ?? undefined,
      })
      onClose()
      await runSpecialtyMode(ctx, {
        mode: 'derm',
        title: 'Dermatology',
        emoji: '🔬',
        systemPrompt: PROMPT,
        imageIds: [photo.id],
        parser: (raw) => <DermCard raw={raw} imageIds={[photo.id]} />,
      })
    } finally {
      setBusy(false)
    }
  }

  const useStaged = async () => {
    if (stagedPhotoIds.length === 0) return
    onClose()
    await runSpecialtyMode(ctx, {
      mode: 'derm',
      title: 'Dermatology',
      emoji: '🔬',
      systemPrompt: PROMPT,
      imageIds: [stagedPhotoIds[0]],
      parser: (raw) => <DermCard raw={raw} imageIds={[stagedPhotoIds[0]]} />,
    })
  }

  return (
    <div className="space-y-2">
      <button onClick={pickAndRun} disabled={busy}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:bg-stone-300">
        Pick lesion image
      </button>
      {stagedPhotoIds.length > 0 && (
        <button onClick={useStaged}
          className="w-full rounded-lg bg-stone-100 text-stone-800 py-2.5 text-sm font-semibold hover:bg-stone-200">
          Use staged photo
        </button>
      )}
    </div>
  )
}

registerTool({
  id: 'derm',
  group: 'modes',
  label: { en: 'Dermatology', ar: 'الأمراض الجلدية' },
  Form: DermForm,
})

export { DermCard }
