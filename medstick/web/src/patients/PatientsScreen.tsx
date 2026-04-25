import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { useApp } from '../store/app'
import { useI18n } from '../i18n/useI18n'
import { api } from '../lib/api'
import type { Patient, Encounter } from '../lib/types'
import { PatientDetail } from './PatientDetail'

export function PatientsScreen() {
  const viewing = useApp((s) => s.viewingPatientId)
  if (viewing) return <PatientDetail id={viewing} />
  return <PatientsList />
}

function PatientsList() {
  const { t } = useI18n()
  const setViewing = useApp((s) => s.setViewingPatient)
  const setSurface = useApp((s) => s.setSurface)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const [patients, setPatients] = useState<Patient[]>([])
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [q, setQ] = useState('')

  useEffect(() => {
    let cancel = false
    const id = setTimeout(async () => {
      try {
        const ps = await api.listPatients(q || undefined)
        if (cancel) return
        setPatients(ps)
        const encs = await Promise.all(ps.map((p) => api.listEncounters(p.id).catch(() => [] as Encounter[])))
        if (cancel) return
        const map: Record<string, number> = {}
        ps.forEach((p, i) => (map[p.id] = encs[i].length))
        setCounts(map)
      } catch {}
    }, 200)
    return () => {
      cancel = true
      clearTimeout(id)
    }
  }, [q])

  const newPatient = async () => {
    const name = window.prompt(t.patients.new + ':')
    if (!name?.trim()) return
    const p = await api.createPatient({ name: name.trim() })
    setPatients((arr) => [p, ...arr])
    setActive(p.id)
    setActiveChat(null)
    setSurface('chat')
  }

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-stone-900">{t.patients.title}</h2>
        <button onClick={newPatient}
          className="inline-flex items-center gap-1 rounded-full bg-brand-600 text-white px-3 py-1.5 text-sm font-semibold hover:bg-brand-700">
          <Plus size={16} /> {t.patients.new}
        </button>
      </div>
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t.patients.search}
        className="w-full mb-3 rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {patients.length === 0 ? (
          <div className="text-center text-stone-400 text-sm py-12">{t.patients.none}</div>
        ) : (
          <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 text-[11px] uppercase tracking-wide text-stone-500">
                <tr>
                  <th className="text-start px-4 py-2">{t.patients.name}</th>
                  <th className="text-start px-4 py-2">{t.patients.age}</th>
                  <th className="text-start px-4 py-2">{t.patients.sex}</th>
                  <th className="text-start px-4 py-2">{t.patients.encounters}</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id}
                    onClick={() => setViewing(p.id)}
                    className="border-t border-stone-100 hover:bg-stone-50 cursor-pointer">
                    <td className="px-4 py-2.5 font-medium text-stone-900">{p.name}</td>
                    <td className="px-4 py-2.5 text-stone-700">{p.age_years ?? '—'}</td>
                    <td className="px-4 py-2.5 text-stone-700">{t.sex[p.sex]}</td>
                    <td className="px-4 py-2.5 text-stone-700">{counts[p.id] ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
