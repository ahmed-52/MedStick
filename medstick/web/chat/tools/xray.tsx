'use client'
import { useState } from 'react'
import * as Button from '@/components/ui/button'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import { downscaleImage } from '@/lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode, splitSections, makeImagePicker } from './_modeBase'

const PROMPT = `You are a radiologist reviewing a chest X-ray. Output exactly three sections separated by blank lines.

Findings: <2-4 sentences>

Impression: <1-2 sentences>

Recommended action: <one concrete next step for a community health worker>

Be concise. If the image is not a chest X-ray, say so in Findings.`

function XrayCard({ raw, imageIds }: { raw: string; imageIds: string[] }) {
  const s = splitSections(raw, ['Findings', 'Impression', 'Recommended action'])
  return (
    <SpecialtyCard title="Chest X-ray" toolId="xray" imageIds={imageIds}>
      <Section label="Findings" body={s['Findings']} />
      <Section label="Impression" body={s['Impression']} variant="highlight" />
      <Section label="Next steps" body={s['Recommended action']} variant="action" />
    </SpecialtyCard>
  )
}

function XrayForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
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
        mode: 'xray',
        toolId: 'xray',
        title: 'Chest X-ray',
        emoji: '🩻',
        systemPrompt: PROMPT,
        imageIds: [photo.id],
        parser: (raw) => <XrayCard raw={raw} imageIds={[photo.id]} />,
      })
    } finally {
      setBusy(false)
    }
  }

  const useStaged = async () => {
    if (stagedPhotoIds.length === 0) return
    onClose()
    await runSpecialtyMode(ctx, {
      mode: 'xray',
      toolId: 'xray',
      title: 'Chest X-ray',
      emoji: '🩻',
      systemPrompt: PROMPT,
      imageIds: [stagedPhotoIds[0]],
      parser: (raw) => <XrayCard raw={raw} imageIds={[stagedPhotoIds[0]]} />,
    })
  }

  return (
    <div className="space-y-2">
      <Button.Root onClick={pickAndRun} disabled={busy} className="w-full">
        Pick X-ray image
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
  id: 'xray',
  group: 'modes',
  label: { en: 'Chest X-ray', ar: 'أشعة الصدر' },
  Form: XrayForm,
})
