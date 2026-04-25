import { useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '../../store/app'
import { useI18n } from '../../i18n/useI18n'
import { api } from '../../lib/api'
import { downscaleImage } from '../../lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode, splitSections } from './_modeBase'

const PROMPT = `You are a radiologist reviewing a chest X-ray. Output exactly three sections separated by blank lines.

Findings: <2-4 sentences describing what you see>

Impression: <1-2 sentences with the most likely interpretation>

Recommended action: <concrete next step for a community health worker>

Be concise and clinical. If the image is not a chest X-ray, say so in Findings.`

function XrayCard({ raw, imageIds }: { raw: string; imageIds: string[] }) {
  const s = splitSections(raw, ['Findings', 'Impression', 'Recommended action'])
  return (
    <SpecialtyCard title="Chest X-ray" emoji="🩻" imageIds={imageIds}>
      <Section label="Findings" body={s['Findings']} />
      <Section label="Impression" body={s['Impression']} />
      <Section label="Recommended action" body={s['Recommended action']} />
    </SpecialtyCard>
  )
}

function XrayForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const { t } = useI18n()
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
        mode: 'xray',
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
      title: 'Chest X-ray',
      emoji: '🩻',
      systemPrompt: PROMPT,
      imageIds: [stagedPhotoIds[0]],
      parser: (raw) => <XrayCard raw={raw} imageIds={[stagedPhotoIds[0]]} />,
    })
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-stone-500">{t.tools.xray}</p>
      <button
        onClick={pickAndRun}
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:bg-stone-300"
      >
        Pick X-ray image
      </button>
      {stagedPhotoIds.length > 0 && (
        <button
          onClick={useStaged}
          className="w-full rounded-lg bg-stone-100 text-stone-800 py-2.5 text-sm font-semibold hover:bg-stone-200"
        >
          Use staged photo
        </button>
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

export { XrayCard }
