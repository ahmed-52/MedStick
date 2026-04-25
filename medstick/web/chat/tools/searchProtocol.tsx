'use client'
import { useEffect, useState } from 'react'
import * as Button from '@/components/ui/button'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useI18n } from '@/i18n/useI18n'
import { api } from '@/lib/api'
import type { Protocol } from '@/lib/types'

function ProtocolResultsCard({ items }: { items: Protocol[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 text-sm text-text-soft-400">
        No matching protocols.
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-3 space-y-2">
      {items.map((p) => (
        <div key={p.id} className="border-b border-stroke-soft-200 last:border-0 pb-2 last:pb-0">
          <div className="text-primary-base text-xs font-bold">{p.topic}</div>
          <p className="text-text-strong-950 text-sm mt-1 leading-relaxed whitespace-pre-wrap">{p.content}</p>
          <div className="text-[10px] text-text-soft-400 mt-1">{p.source}</div>
        </div>
      ))}
    </div>
  )
}

function SearchProtocolForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const { t, lang } = useI18n()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Protocol[]>([])

  useEffect(() => {
    let cancel = false
    if (!q.trim()) {
      setItems([])
      return
    }
    const id = setTimeout(async () => {
      try {
        const r = await api.searchProtocols(q, lang)
        if (!cancel) setItems(r)
      } catch {}
    }, 250)
    return () => {
      cancel = true
      clearTimeout(id)
    }
  }, [q, lang])

  const submit = () => {
    if (items.length === 0) return
    ctx.appendInline({
      role: 'tool',
      content: '',
      card: <ProtocolResultsCard items={items} />,
    })
    onClose()
  }

  return (
    <div className="space-y-2.5">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.library.searchProtocols}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
      />
      <div className="max-h-64 overflow-y-auto space-y-1.5">
        {items.map((p) => (
          <div key={p.id} className="px-3 py-2 rounded-lg border border-stroke-soft-200">
            <div className="text-primary-base text-xs font-semibold">{p.topic}</div>
            <p className="text-text-sub-600 text-xs mt-0.5 line-clamp-3">{p.content}</p>
          </div>
        ))}
      </div>
      <Button.Root onClick={submit} disabled={items.length === 0} className="w-full">
        Insert into chat
      </Button.Root>
    </div>
  )
}

registerTool({
  id: 'searchProtocol',
  group: 'lookup',
  label: { en: 'Search protocol', ar: 'بحث في البروتوكولات' },
  Form: SearchProtocolForm,
})
