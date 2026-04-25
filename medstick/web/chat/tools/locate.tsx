'use client'
import { useState } from 'react'
import * as Button from '@/components/ui/button'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import { downscaleImage } from '@/lib/image'
import { SpecialtyCard, Section } from '../cards/SpecialtyCard'
import { runSpecialtyMode, makeImagePicker } from './_modeBase'

const PROMPT = `Describe in plain words where the queried anatomical feature is located in this medical image. Do NOT output coordinates, percentages, or pixel positions — you cannot localize. Use directional language only (upper/lower, left/right, near, between, lateral to, medial to). 1-3 sentences.`

function LocateCard({ raw, query, imageIds }: { raw: string; query: string; imageIds: string[] }) {
  return (
    <SpecialtyCard title={`Locate: ${query}`} toolId="locate" imageIds={imageIds}>
      <Section label="Description" body={raw} variant="highlight" />
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
        toolId: 'locate',
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
    const file = await makeImagePicker()
    if (!file) return
    const blob = await downscaleImage(file)
    const photo = await api.uploadPhoto(blob, file.name, {
      patient_id: ctx.activePatientId ?? undefined,
    })
    await run(photo.id)
  }

  return (
    <div className="space-y-2">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder='e.g. "heart shadow", "left lung apex"'
        className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
      />
      <Button.Root onClick={pick} disabled={busy || !query.trim()} className="w-full">
        Pick image
      </Button.Root>
      {stagedPhotoIds.length > 0 && (
        <Button.Root
          variant="neutral"
          mode="stroke"
          onClick={() => run(stagedPhotoIds[0])}
          disabled={busy || !query.trim()}
          className="w-full"
        >
          Use staged photo
        </Button.Root>
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
