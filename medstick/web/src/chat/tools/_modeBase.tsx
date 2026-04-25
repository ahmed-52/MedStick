import { api } from '../../lib/api'
import type { EncounterMode } from '../../lib/types'
import type { ToolContext } from '../ToolRegistry'

export interface ModeOptions {
  mode: EncounterMode
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

  const placeholderId = Math.random().toString(36).slice(2)
  ctx.appendInline({
    role: 'tool',
    content: `${opts.emoji} ${opts.title} — reading image…`,
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

    ctx.appendInline({
      role: 'tool',
      content: '',
      image_ids: opts.imageIds,
      card: opts.parser(text),
    })

    if (ctx.activePatientId) {
      try {
        await api.createEncounter({
          patient_id: ctx.activePatientId,
          chat_id: ctx.activeChatId,
          mode: opts.mode,
          raw_result: text,
        })
      } catch {}
    }
  } catch (err: any) {
    ctx.appendInline({
      role: 'tool',
      content: `⚠ ${opts.title} failed: ${String(err?.message ?? err)}`,
    })
  }

  void placeholderId
}

// helper: split a labeled-section response into named chunks
export function splitSections(raw: string, labels: string[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const l of labels) out[l] = ''
  if (!raw) return out

  // build regex that finds any label followed by colon
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
  // if nothing parsed, dump everything into first label
  if (Object.values(out).every((v) => !v)) out[labels[0]] = raw.trim()
  return out
}
