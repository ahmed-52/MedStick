'use client'

import { useEffect, useState } from 'react'
import { RiArrowLeftLine, RiArrowRightLine, RiArrowDownSLine } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { api } from '@/lib/api'
import type { Patient, Encounter, Photo } from '@/lib/types'

export function PatientDetail({ id }: { id: string }) {
  const { t, isRtl } = useI18n()
  const setViewing = useApp((s) => s.setViewingPatient)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [encs, setEncs] = useState<Encounter[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [editName, setEditName] = useState('')
  const [editAge, setEditAge] = useState('')
  const [openEnc, setOpenEnc] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    const load = async () => {
      try {
        const p = await api.getPatient(id)
        const e = await api.listEncounters(id)
        if (cancel) return
        setPatient(p)
        setEditName(p.name)
        setEditAge(p.age_years?.toString() ?? '')
        setEncs(e)
        const pr = await fetch(`/api/photos?patient_id=${id}`).catch(() => null)
        if (pr?.ok) {
          const arr = await pr.json()
          if (!cancel) setPhotos(Array.isArray(arr) ? arr : [])
        }
      } catch {}
    }
    load()
    return () => {
      cancel = true
    }
  }, [id])

  if (!patient) return <div className="p-6 text-text-soft-400 text-sm">Loading…</div>

  const save = async () => {
    const updated = await api.updatePatient(patient.id, {
      name: editName,
      age_years: editAge ? Number(editAge) : null,
    })
    setPatient(updated)
  }

  const setAsActive = () => {
    setActive(patient.id)
    setActiveChat(null)
  }

  const Back = isRtl ? RiArrowRightLine : RiArrowLeftLine

  const fc =
    'w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base'

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div className="bg-bg-white-0 lg:border-stroke-soft-200 relative flex h-full flex-col pb-4 lg:rounded-3xl lg:border lg:py-4 lg:pr-4 lg:pl-5">
        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-3xl mx-auto p-2 space-y-5">
            <button
              onClick={() => setViewing(null)}
              className="inline-flex items-center gap-1 text-sm text-text-sub-600 hover:text-text-strong-950"
            >
              <Back className="size-4" /> {t.patients.back}
            </button>

            <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
                    {t.patients.name}
                  </label>
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={save} className={fc} />
                </div>
                <div>
                  <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
                    {t.patients.age}
                  </label>
                  <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} onBlur={save} className={fc} />
                </div>
              </div>
              <div className="text-xs text-text-soft-400">
                {t.patients.sex}: {t.sex[patient.sex]} · {t.patients.langPref}: {patient.lang_pref.toUpperCase()}
              </div>
              <Button.Root onClick={setAsActive} className="w-full">
                {t.patients.setActive}
              </Button.Root>
            </div>

            <div>
              <h3 className="text-text-strong-950 text-sm font-bold mb-2 px-1">{t.patients.encounters} · {encs.length}</h3>
              <div className="space-y-2">
                {encs.length === 0 ? (
                  <div className="text-xs text-text-soft-400 px-1">No encounters yet</div>
                ) : (
                  encs.map((e) => (
                    <div key={e.id} className="rounded-xl border border-stroke-soft-200 bg-bg-white-0">
                      <button
                        onClick={() => setOpenEnc(openEnc === e.id ? null : e.id)}
                        className="w-full flex items-center justify-between px-3 py-2 text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <RiArrowDownSLine className={`size-4 transition ${openEnc === e.id ? '' : '-rotate-90'}`} />
                          <span className="font-bold uppercase text-[10px] tracking-wider text-primary-base">{e.mode}</span>
                          <span className="text-text-soft-400">· {new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                      </button>
                      {openEnc === e.id && (
                        <div className="px-4 pb-3 text-sm text-text-strong-950 space-y-2 border-t border-stroke-soft-200 pt-3">
                          {e.soap_subjective && <div><b className="text-xs text-text-soft-400">S:</b> {e.soap_subjective}</div>}
                          {e.soap_objective && <div><b className="text-xs text-text-soft-400">O:</b> {e.soap_objective}</div>}
                          {e.soap_assessment && <div><b className="text-xs text-text-soft-400">A:</b> {e.soap_assessment}</div>}
                          {e.soap_plan && <div><b className="text-xs text-text-soft-400">P:</b> {e.soap_plan}</div>}
                          {e.raw_result && (
                            <pre className="text-xs whitespace-pre-wrap bg-bg-weak-50 p-2 rounded">{e.raw_result}</pre>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {photos.length > 0 && (
              <div>
                <h3 className="text-text-strong-950 text-sm font-bold mb-2 px-1">{t.patients.photos} · {photos.length}</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                  {photos.map((ph) => (
                    <img
                      key={ph.id}
                      src={`/api/photos/${ph.id}`}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg border border-stroke-soft-200"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
