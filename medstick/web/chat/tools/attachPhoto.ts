'use client'
import { registerTool } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import { downscaleImage } from '@/lib/image'

registerTool({
  id: 'attachPhoto',
  group: 'attachments',
  label: { en: 'Attach photo', ar: 'إرفاق صورة' },
  run: async (ctx) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true
    ;(input as any).capture = 'environment'

    const fileSelected = new Promise<File[]>((resolve) => {
      input.onchange = () => {
        const files = input.files ? Array.from(input.files) : []
        resolve(files)
      }
      input.oncancel = () => resolve([])
    })

    input.click()
    const files = await fileSelected
    if (files.length === 0) return

    for (const f of files) {
      try {
        const blob = await downscaleImage(f, 1024, 0.85)
        const photo = await api.uploadPhoto(blob, f.name, {
          patient_id: useApp.getState().activePatientId ?? undefined,
        })
        useApp.getState().addStagedPhoto(photo.id)
      } catch (err) {
        ctx.appendInline({
          role: 'tool',
          content: `⚠ Failed to attach ${f.name}: ${String(err)}`,
        })
      }
    }
  },
})
