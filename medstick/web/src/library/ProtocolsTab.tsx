import { useEffect, useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { api } from '../lib/api'
import type { Protocol } from '../lib/types'

export function ProtocolsTab() {
  const { t, lang } = useI18n()
  const [q, setQ] = useState('')
  const [items, setItems] = useState<Protocol[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancel = false
    setLoading(true)
    const id = setTimeout(async () => {
      try {
        const r = q.trim() ? await api.searchProtocols(q, lang) : await api.listProtocols(lang)
        if (!cancel) {
          setItems(r)
          setLoading(false)
        }
      } catch {
        if (!cancel) setLoading(false)
      }
    }, 200)
    return () => {
      cancel = true
      clearTimeout(id)
    }
  }, [q, lang])

  return (
    <div className="space-y-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.library.searchProtocols}
        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      {loading && <div className="text-xs text-stone-400">…</div>}
      {!loading && items.length === 0 && (
        <div className="text-sm text-stone-400 py-6 text-center">{t.library.noResults}</div>
      )}
      <div className="space-y-2">
        {items.map((p) => (
          <article key={p.id} className="rounded-2xl border border-stone-200 bg-white p-4">
            <h3 className="text-sm font-bold text-brand-700">{p.topic}</h3>
            <p className="text-sm text-stone-800 mt-1.5 leading-relaxed whitespace-pre-wrap">{p.content}</p>
            <div className="text-[10px] text-stone-400 mt-2">{p.source}</div>
          </article>
        ))}
      </div>
    </div>
  )
}
