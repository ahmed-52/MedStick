'use client'
import { api } from '@/lib/api'
import type { EncounterMode } from '@/lib/types'
import type { ToolContext } from '../ToolRegistry'
import { SpecialtyCard } from '../cards/SpecialtyCard'
import { useApp } from '@/store/app'

export interface ModeOptions {
  mode: EncounterMode
  toolId: string
  title: string
  emoji: string
  systemPrompt: string
  userText?: string
  imageIds: string[]
  parser: (raw: string) => React.ReactNode
}

export async function runSpecialtyMode(ctx: ToolContext, opts: ModeOptions) {
  if (opts.imageIds.length === 0) {
    ctx.appendInline({ role: 'tool', content: '⚠ No image attached.' })
    return
  }

  // Drop a placeholder card immediately so the UI shows a proper card
  // (not a chat bubble) the moment the mode starts running. We swap the
  // same message in place once the LLM returns.
  const placeholderId = ctx.appendInline({
    role: 'tool',
    content: '',
    image_ids: opts.imageIds,
    card: (
      <SpecialtyCard
        title={opts.title}
        toolId={opts.toolId}
        imageIds={opts.imageIds}
        pending
      />
    ),
  })

  try {
    const r = await api.oneShotChat({
      messages: [
        { role: 'system', content: opts.systemPrompt },
        {
          role: 'user',
          content: [
            { type: 'text', text: opts.userText ?? 'Please analyze.' },
            ...opts.imageIds.map((id) => ({
              type: 'image_url' as const,
              image_url: { url: `/api/photos/${id}` },
            })),
          ],
        },
      ],
      max_tokens: 800,
      temperature: 0.2,
    })
    const text = r.choices?.[0]?.message?.content ?? ''

    ctx.replaceInline(placeholderId, {
      role: 'tool',
      content: '',
      image_ids: opts.imageIds,
      card: opts.parser(text),
    })

    // Always persist the encounter — even if no patient is explicitly active,
    // the chat itself is usually tied to one, and the server will surface
    // the encounter on that patient's detail via the chat_id join.
    try {
      await api.createEncounter({
        patient_id: ctx.activePatientId,
        chat_id: ctx.activeChatId,
        mode: opts.mode,
        raw_result: text,
      })
      useApp.getState().bumpChatList()
    } catch {}
  } catch (err: any) {
    ctx.replaceInline(placeholderId, {
      role: 'tool',
      content: '',
      image_ids: opts.imageIds,
      card: (
        <SpecialtyCard
          title={opts.title}
          toolId={opts.toolId}
          imageIds={opts.imageIds}
          error={String(err?.message ?? err)}
        />
      ),
    })
  }
}

export function splitSections(raw: string, labels: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const l of labels) out[l] = ''
  if (!raw) return out

  const labelPattern = new RegExp(
    `^\\s*(${labels.map((l) => l.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')).join('|')})\\s*:`,
    'im',
  )

  const lines = raw.split(/\r?\n/)
  let current: string | null = null
  for (const line of lines) {
    const m = line.match(labelPattern)
    if (m) {
      current = m[1]
      const rest = line.replace(labelPattern, '').trim()
      out[current] = rest
    } else if (current) {
      out[current] = (out[current] + '\n' + line).trim()
    }
  }
  if (Object.values(out).every((v) => !v)) out[labels[0]] = raw.trim()
  return out
}

export function makeImagePicker() {
  return new Promise<File | null>((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    ;(input as any).capture = 'environment'
    input.onchange = () => resolve(input.files?.[0] ?? null)
    input.oncancel = () => resolve(null)
    input.click()
  })
}
