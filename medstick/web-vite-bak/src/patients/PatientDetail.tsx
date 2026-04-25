import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronDown, ChevronRight } from 'lucide-react'
import { useApp } from '../store/app'
import { useI18n } from '../i18n/useI18n'
import { api } from '../lib/api'
import type { Patient, Encounter, Photo } from '../lib/types'

export function PatientDetail({ id }: { id: string }) {
  const { t, isRtl } = useI18n()
  const setViewing = useApp((s) => s.setViewingPatient)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const setSurface = useApp((s) => s.setSurface)

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
        // photos via /api — list isn't a route; fetch via patient_id query
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

  if (!patient) return <div className="p-6 text-stone-500 text-sm">Loading…</div>

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
    setSurface('chat')
  }

  const ChevronBack = isRtl ? ChevronRight : ChevronLeft

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-5">
        <button onClick={() => setViewing(null)}
          className="inline-flex items-center gap-1 text-sm text-stone-600 hover:text-stone-900">
          <ChevronBack size={16} /> {t.patients.back}
        </button>

        <div className="rounded-2xl bg-white border border-stone-200 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-1">{t.patients.name}</label>
              <input value={editName} onChange={(e) => setEditName(e.target.value)} onBlur={save}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-wide text-stone-500 font-semibold mb-1">{t.patients.age}</label>
              <input type="number" value={editAge} onChange={(e) => setEditAge(e.target.value)} onBlur={save}
                className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div className="text-xs text-stone-500">
            {t.patients.sex}: {t.sex[patient.sex]} · {t.patients.langPref}: {patient.lang_pref.toUpperCase()}
          </div>
          <button onClick={setAsActive}
            className="w-full rounded-lg bg-brand-600 text-white py-2 text-sm font-semibold hover:bg-brand-700">
            {t.patients.setActive}
          </button>
        </div>

        <div>
          <h3 className="text-sm font-bold text-stone-700 mb-2">{t.patients.encounters} · {encs.length}</h3>
          <div className="space-y-2">
            {encs.length === 0 ? (
              <div className="text-xs text-stone-400">No encounters yet</div>
            ) : (
              encs.map((e) => (
                <div key={e.id} className="rounded-xl border border-stone-200 bg-white">
                  <button onClick={() => setOpenEnc(openEnc === e.id ? null : e.id)}
                    className="w-full flex items-center justify-between px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <ChevronDown size={14} className={openEnc === e.id ? '' : '-rotate-90'} />
                      <span className="font-semibold uppercase text-[10px] tracking-wide text-brand-700">{e.mode}</span>
                      <span className="text-stone-500">· {new Date(e.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                  {openEnc === e.id && (
                    <div className="px-4 pb-3 text-sm text-stone-800 space-y-2 border-t border-stone-100 pt-3">
                      {e.soap_subjective && <div><b className="text-xs text-stone-500">S:</b> {e.soap_subjective}</div>}
                      {e.soap_objective && <div><b className="text-xs text-stone-500">O:</b> {e.soap_objective}</div>}
                      {e.soap_assessment && <div><b className="text-xs text-stone-500">A:</b> {e.soap_assessment}</div>}
                      {e.soap_plan && <div><b className="text-xs text-stone-500">P:</b> {e.soap_plan}</div>}
                      {e.raw_result && (
                        <pre className="text-xs whitespace-pre-wrap bg-stone-50 p-2 rounded">{e.raw_result}</pre>
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
            <h3 className="text-sm font-bold text-stone-700 mb-2">{t.patients.photos} · {photos.length}</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
              {photos.map((ph) => (
                <img key={ph.id} src={`/api/photos/${ph.id}`} alt=""
                  className="w-full aspect-square object-cover rounded-lg border border-stone-200" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
