import { useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '../../store/app'
import { api } from '../../lib/api'
import { downscaleImage } from '../../lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode } from './_modeBase'

const PROMPT = `Describe in plain words where the queried anatomical feature is located in this medical image. Do NOT output coordinates, percentages, or pixel positions — you cannot localize. Use directional language only (upper/lower, left/right, near, between, lateral to, medial to). 1-3 sentences.`

function LocateCard({ raw, query, imageIds }: { raw: string; query: string; imageIds: string[] }) {
  return (
    <SpecialtyCard title={`Locate: ${query}`} emoji="📍" imageIds={imageIds}>
      <Section label="Description" body={raw} />
    </SpecialtyCard>
  )
}

function LocateForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const stagedPhotoIds = useApp((s) => s.stagedPhotoIds)
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)

  const run = async (imageId: string) => {
    setBusy(true)
    try {
      onClose()
      await runSpecialtyMode(ctx, {
        mode: 'locate',
        title: `Locate: ${query}`,
        emoji: '📍',
        systemPrompt: PROMPT,
        userText: `Where is "${query}" in this image?`,
        imageIds: [imageId],
        parser: (raw) => <LocateCard raw={raw} query={query} imageIds={[imageId]} />,
      })
    } finally {
      setBusy(false)
    }
  }

  const pick = async () => {
    if (!query.trim()) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    const file: File | null = await new Promise((resolve) => {
      input.onchange = () => resolve(input.files?.[0] ?? null)
      input.click()
    })
    if (!file) return
    const blob = await downscaleImage(file)
    const photo = await api.uploadPhoto(blob, file.name, {
      patient_id: ctx.activePatientId ?? undefined,
    })
    await run(photo.id)
  }

  return (
    <div className="space-y-3">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='e.g. "heart shadow", "left lung apex"'
        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button onClick={pick} disabled={busy || !query.trim()}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:bg-stone-300">
        Pick image
      </button>
      {stagedPhotoIds.length > 0 && (
        <button onClick={() => run(stagedPhotoIds[0])} disabled={busy || !query.trim()}
          className="w-full rounded-lg bg-stone-100 text-stone-800 py-2.5 text-sm font-semibold hover:bg-stone-200 disabled:opacity-50">
          Use staged photo
        </button>
      )}
    </div>
  )
}

registerTool({
  id: 'locate',
  group: 'modes',
  label: { en: 'Locate feature', ar: 'تحديد معلم' },
  Form: LocateForm,
})

export { LocateCard }
