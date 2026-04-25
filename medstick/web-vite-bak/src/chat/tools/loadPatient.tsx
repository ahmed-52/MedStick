import { useEffect, useState } from 'react'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '../../store/app'
import { useI18n } from '../../i18n/useI18n'
import { api } from '../../lib/api'
import type { Patient } from '../../lib/types'

function LoadPatientForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const { t } = useI18n()
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const [q, setQ] = useState('')
  const [results, setResults] = useState<Patient[]>([])

  useEffect(() => {
    let cancel = false
    const id = setTimeout(async () => {
      try {
        const r = await api.listPatients(q)
        if (!cancel) setResults(r.slice(0, 10))
      } catch {
        if (!cancel) setResults([])
      }
    }, 200)
    return () => {
      cancel = true
      clearTimeout(id)
    }
  }, [q])

  const choose = (p: Patient) => {
    setActive(p.id)
    setActiveChat(null)
    ctx.appendInline({ role: 'tool', content: `Loaded patient: ${p.name}` })
    onClose()
  }

  return (
    <div className="space-y-3">
      <input
        autoFocus
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.patients.search}
        className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="space-y-1 max-h-64 overflow-y-auto scrollbar-thin">
        {results.length === 0 ? (
          <div className="text-xs text-stone-500 px-2 py-3 text-center">
            {t.patients.none}
          </div>
        ) : (
          results.map((p) => (
            <button
              key={p.id}
              onClick={() => choose(p)}
              className="w-full text-start px-3 py-2 rounded-lg hover:bg-stone-50 border border-transparent hover:border-stone-200 transition"
            >
              <div className="text-sm font-medium text-stone-900">{p.name}</div>
              <div className="text-xs text-stone-500">
                {p.age_years != null ? `${p.age_years}y` : '—'} · {t.sex[p.sex]}
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}

registerTool({
  id: 'loadPatient',
  group: 'patient',
  label: { en: 'Load patient', ar: 'تحميل مريض' },
  Form: LoadPatientForm,
})
