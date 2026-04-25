import { useEffect, useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useI18n } from '../../i18n/useI18n'
import { api } from '../../lib/api'
import type { Protocol } from '../../lib/types'

function ProtocolResultsCard({ items }: { items: Protocol[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-stone-200 bg-white p-3 text-sm text-stone-500">
        No matching protocols.
      </div>
    )
  }
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-3 space-y-2">
      {items.map((p) => (
        <div key={p.id} className="border-b border-stone-100 last:border-0 pb-2 last:pb-0">
          <div className="text-xs font-bold text-brand-700">{p.topic}</div>
          <p className="text-sm text-stone-800 mt-1 leading-relaxed whitespace-pre-wrap">{p.content}</p>
          <div className="text-[10px] text-stone-400 mt-1">{p.source}</div>
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
    <div className="space-y-3">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.library.searchProtocols}
        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <div className="max-h-64 overflow-y-auto scrollbar-thin space-y-2">
        {items.map((p) => (
          <div key={p.id} className="px-3 py-2 rounded-lg border border-stone-200">
            <div className="text-xs font-semibold text-brand-700">{p.topic}</div>
            <p className="text-xs text-stone-700 mt-0.5 line-clamp-3">{p.content}</p>
          </div>
        ))}
      </div>
      <button onClick={submit} disabled={items.length === 0}
        className="w-full rounded-lg bg-brand-600 text-white py-2.5 text-sm font-semibold hover:bg-brand-700 disabled:bg-stone-300">
        Insert into chat
      </button>
    </div>
  )
}

registerTool({
  id: 'searchProtocol',
  group: 'lookup',
  label: { en: 'Search protocol', ar: 'بحث في البروتوكولات' },
  Form: SearchProtocolForm,
})

export { ProtocolResultsCard }
