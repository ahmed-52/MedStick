'use client'
import { RiVirusLine, RiBookOpenLine } from '@remixicon/react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import type { Document } from '@/lib/types'

function ScopeCard({ doc }: { doc: Document }) {
  return (
    <div className="rounded-2xl border border-[var(--color-who-ring)] bg-white p-4 shadow-regular-xs">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)]">
          <RiVirusLine className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-[10.5px] uppercase tracking-[0.18em] font-semibold text-[var(--color-who-ink-mute)]">
            Outbreak protocol attached
          </div>
          <div className="text-[15px] font-semibold text-[var(--color-who-navy)] mt-0.5">
            Cholera response
          </div>
          <p className="text-[12.5px] text-[var(--color-who-ink-soft)] mt-1.5 leading-relaxed">
            Replies in this chat are now grounded in <span className="font-semibold text-[var(--color-who-ink)]">{doc.title}</span>.
            Ask about case definition, severity assessment, ORS regimens, IV resuscitation, antibiotics, or contact tracing.
          </p>
          <div className="mt-2.5 inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--color-who-blue-deep)]">
            <RiBookOpenLine className="size-3.5" />
            <span>{doc.page_count} pages · WHO source</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function MissingCard() {
  return (
    <div className="rounded-2xl border border-[var(--color-who-ring)] bg-[var(--color-who-canvas)] p-4">
      <div className="text-[13px] font-semibold text-[var(--color-who-navy)] mb-1">
        ⚠ No cholera document ingested yet
      </div>
      <p className="text-[12px] text-[var(--color-who-ink-soft)] leading-relaxed">
        Ingest the WHO field manual once from the project root, then come back here.
      </p>
      <pre className="mt-2 px-2.5 py-2 rounded-md bg-white border border-[var(--color-who-ring)] text-[11px] text-[var(--color-who-ink)] overflow-x-auto font-tabular">
{`npm --prefix server run ingest -- path/to/cholera.pdf`}
      </pre>
    </div>
  )
}

registerTool({
  id: 'cholera',
  group: 'protocols',
  label: { en: 'Cholera response', ar: 'استجابة الكوليرا' },
  run: async (ctx: ToolContext) => {
    let cholera: Document | undefined
    try {
      const docs = await api.listDocuments()
      cholera = docs.find((d) => /chol(e|é)ra/i.test(d.title))
    } catch {}

    if (!cholera) {
      ctx.appendInline({ role: 'tool', content: '', card: <MissingCard /> })
      return
    }

    const state = useApp.getState()
    let chatId = ctx.activeChatId
    if (!chatId) {
      const c = await api.createChat(ctx.activePatientId)
      chatId = c.id
      state.setActiveChat(chatId)
      state.bumpChatList()
    }

    try {
      const updated = await api.attachDocument(chatId, cholera.id)
      state.setActiveDocs(updated)
    } catch {
      // Already attached or transient error — keep going with the local view.
      state.setActiveDocs([cholera])
    }

    ctx.appendInline({ role: 'tool', content: '', card: <ScopeCard doc={cholera} /> })
  },
})
