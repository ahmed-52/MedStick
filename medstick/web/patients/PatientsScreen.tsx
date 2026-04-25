'use client'

import { useEffect, useState } from 'react'
import * as Button from '@/components/ui/button'
import { RiAddLine } from '@remixicon/react'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { api } from '@/lib/api'
import type { Patient, Encounter } from '@/lib/types'
import { PatientDetail } from './PatientDetail'

export function PatientsScreen() {
  const viewing = useApp((s) => s.viewingPatientId)
  if (viewing) return <PatientDetail id={viewing} />
  return <PatientsList />
}

function PatientsList() {
  const { t } = useI18n()
  const setViewing = useApp((s) => s.setViewingPatient)
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
        const encs = await Promise.all(
          ps.map((p) => api.listEncounters(p.id).catch(() => [] as Encounter[])),
        )
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
  }

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div className="bg-bg-white-0 lg:border-stroke-soft-200 relative flex h-full flex-col pb-4 lg:rounded-3xl lg:border lg:py-4 lg:pr-4 lg:pl-5">
        <header className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-text-soft-400 text-sm">MedStick</h1>
            <span className="text-text-soft-400 text-sm">/</span>
            <span className="text-text-sub-600 text-sm">{t.patients.title}</span>
          </div>
          <Button.Root onClick={newPatient} size="small">
            <Button.Icon as={RiAddLine} />
            {t.patients.new}
          </Button.Root>
        </header>

        <div className="px-1 mb-3">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t.patients.search}
            className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          {patients.length === 0 ? (
            <div className="text-center text-text-soft-400 text-sm py-12">{t.patients.none}</div>
          ) : (
            <div className="rounded-2xl border border-stroke-soft-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-bg-weak-50 text-[11px] uppercase tracking-wider text-text-soft-400">
                  <tr>
                    <th className="text-start px-4 py-2.5 font-semibold">{t.patients.name}</th>
                    <th className="text-start px-4 py-2.5 font-semibold">{t.patients.age}</th>
                    <th className="text-start px-4 py-2.5 font-semibold">{t.patients.sex}</th>
                    <th className="text-start px-4 py-2.5 font-semibold">{t.patients.encounters}</th>
                  </tr>
                </thead>
                <tbody>
                  {patients.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setViewing(p.id)}
                      className="border-t border-stroke-soft-200 hover:bg-bg-weak-50 cursor-pointer"
                    >
                      <td className="px-4 py-3 font-medium text-text-strong-950">{p.name}</td>
                      <td className="px-4 py-3 text-text-sub-600">{p.age_years ?? '—'}</td>
                      <td className="px-4 py-3 text-text-sub-600">{t.sex[p.sex]}</td>
                      <td className="px-4 py-3 text-text-sub-600">{counts[p.id] ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
