'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RiArrowLeftLine, RiArrowRightLine, RiArrowDownSLine, RiChat3Line } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { api } from '@/lib/api'
import type { Patient, Encounter, Photo, Chat } from '@/lib/types'

export function PatientDetail({ id }: { id: string }) {
  const { t, isRtl } = useI18n()
  const router = useRouter()
  const setViewing = useApp((s) => s.setViewingPatient)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const chatListVersion = useApp((s) => s.chatListVersion)

  const [patient, setPatient] = useState<Patient | null>(null)
  const [encs, setEncs] = useState<Encounter[]>([])
  const [chats, setChats] = useState<Chat[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [editName, setEditName] = useState('')
  const [editAge, setEditAge] = useState('')
  const [openEnc, setOpenEnc] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    const load = async () => {
      try {
        const p = await api.getPatient(id)
        if (cancel) return
        setPatient(p)
        setEditName(p.name)
        setEditAge(p.age_years?.toString() ?? '')

        const [e, cs] = await Promise.all([
          api.listEncounters(id).catch(() => [] as Encounter[]),
          api.listChats(id).catch(() => [] as Chat[]),
        ])
        if (cancel) return
        setEncs(e)
        setChats(cs)

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
  }, [id, chatListVersion])

  const openChat = (chatId: string) => {
    setActive(id)
    setActiveChat(chatId)
    setViewing(null)
    router.push('/chat')
  }

  const truncate = (s: string | null | undefined, n = 60): string => {
    const v = (s ?? '').trim()
    if (!v) return 'New chat'
    return v.length > n ? v.slice(0, n) + '…' : v
  }

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
              <h3 className="text-text-strong-950 text-sm font-bold mb-2 px-1">
                Chats · {chats.length}
              </h3>
              <div className="space-y-1.5">
                {chats.length === 0 ? (
                  <div className="text-xs text-text-soft-400 px-1">No chats yet</div>
                ) : (
                  chats.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => openChat(c.id)}
                      className="group w-full rounded-xl border border-stroke-soft-200 bg-bg-white-0 hover:border-[var(--color-who-blue)]/40 hover:bg-[var(--color-who-tint)]/30 transition-colors px-3 py-2.5 text-start flex items-center gap-3"
                    >
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)]">
                        <RiChat3Line className="size-4" />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[13.5px] font-medium text-text-strong-950 truncate">
                          {truncate(c.title)}
                        </div>
                        <div className="text-[11px] text-text-soft-400">
                          {new Date(c.created_at).toLocaleString()}
                        </div>
                      </div>
                      <RiArrowRightLine className="size-4 shrink-0 text-text-soft-400 group-hover:text-[var(--color-who-blue-deep)]" />
                    </button>
                  ))
                )}
              </div>
            </div>

            <div>
              <h3 className="text-text-strong-950 text-sm font-bold mb-2 px-1">
                {t.patients.encounters} · {encs.length}
              </h3>
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
                          <span className="font-bold uppercase text-[10px] tracking-wider text-[var(--color-who-blue-deep)]">{e.mode}</span>
                          <span className="text-text-soft-400">· {new Date(e.created_at).toLocaleDateString()}</span>
                        </div>
                        {e.chat_id && (
                          <span
                            onClick={(ev) => {
                              ev.stopPropagation()
                              openChat(e.chat_id!)
                            }}
                            role="button"
                            className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--color-who-blue-deep)] hover:underline px-2 py-0.5 rounded"
                          >
                            <RiChat3Line className="size-3.5" />
                            Open chat
                          </span>
                        )}
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
