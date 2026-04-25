'use client'
import { useState } from 'react'
import * as Button from '@/components/ui/button'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import { downscaleImage } from '@/lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode, splitSections, makeImagePicker } from './_modeBase'

const PROMPT = `You are a dermatologist reviewing a single skin lesion image. Output ABCDE evaluation followed by morphology and recommendation. Use exactly these labels:

Asymmetry: <one line>
Border: <one line>
Color: <one line>
Diameter: <one line>
Evolution: <one line if can be inferred, otherwise "Cannot assess from single image">
Morphology: <one line clinical description>
Recommended action: <one line concrete next step>

Be concise.`

function DermCard({ raw, imageIds }: { raw: string; imageIds: string[] }) {
  const labels = ['Asymmetry', 'Border', 'Color', 'Diameter', 'Evolution', 'Morphology', 'Recommended action']
  const s = splitSections(raw, labels)
  return (
    <SpecialtyCard title="Dermatology" toolId="derm" imageIds={imageIds}>
      <Section label="Asymmetry" body={s['Asymmetry']} />
      <Section label="Border" body={s['Border']} />
      <Section label="Color" body={s['Color']} />
      <Section label="Diameter" body={s['Diameter']} />
      <Section label="Evolution" body={s['Evolution']} />
      <Section label="Morphology" body={s['Morphology']} variant="highlight" />
      <Section label="Next steps" body={s['Recommended action']} variant="action" />
    </SpecialtyCard>
  )
}

function DermForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const stagedPhotoIds = useApp((s) => s.stagedPhotoIds)
  const [busy, setBusy] = useState(false)

  const pickAndRun = async () => {
    const file = await makeImagePicker()
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
        toolId: 'derm',
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
      toolId: 'derm',
      title: 'Dermatology',
      emoji: '🔬',
      systemPrompt: PROMPT,
      imageIds: [stagedPhotoIds[0]],
      parser: (raw) => <DermCard raw={raw} imageIds={[stagedPhotoIds[0]]} />,
    })
  }

  return (
    <div className="space-y-2">
      <Button.Root onClick={pickAndRun} disabled={busy} className="w-full">
        Pick lesion image
      </Button.Root>
      {stagedPhotoIds.length > 0 && (
        <Button.Root variant="neutral" mode="stroke" onClick={useStaged} className="w-full">
          Use staged photo
        </Button.Root>
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
