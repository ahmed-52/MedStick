'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { RiBookOpenLine, RiCheckLine } from '@remixicon/react'
import { cn } from '@/utils/cn'
import { useI18n } from '@/i18n/useI18n'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import type { Document, Protocol } from '@/lib/types'

export function LibraryScreen() {
  const { t, lang } = useI18n()
  const [tab, setTab] = useState<'documents' | 'protocols' | 'modes'>('documents')

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div className="bg-bg-white-0 lg:border-stroke-soft-200 relative flex h-full flex-col pb-4 lg:rounded-3xl lg:border lg:py-4 lg:pr-4 lg:pl-5">
        <header className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-text-soft-400 text-sm">MedStick</h1>
            <span className="text-text-soft-400 text-sm">/</span>
            <span className="text-text-sub-600 text-sm">{t.library.title}</span>
          </div>
        </header>

        <div className="px-1 mb-3">
          <div className="inline-flex rounded-full bg-bg-weak-50 p-0.5">
            <button
              onClick={() => setTab('documents')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition',
                tab === 'documents' ? 'bg-bg-white-0 shadow text-text-strong-950' : 'text-text-sub-600',
              )}
            >
              Documents
            </button>
            <button
              onClick={() => setTab('protocols')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition',
                tab === 'protocols' ? 'bg-bg-white-0 shadow text-text-strong-950' : 'text-text-sub-600',
              )}
            >
              {t.library.protocols}
            </button>
            <button
              onClick={() => setTab('modes')}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition',
                tab === 'modes' ? 'bg-bg-white-0 shadow text-text-strong-950' : 'text-text-sub-600',
              )}
            >
              {t.library.modes}
            </button>
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto px-1">
          {tab === 'documents' ? <DocumentsTab /> :
           tab === 'protocols' ? <ProtocolsTab lang={lang} /> :
           <ModesTab lang={lang} />}
        </div>
      </div>
    </div>
  )
}

function DocumentsTab() {
  const router = useRouter()
  const activeChatId = useApp((s) => s.activeChatId)
  const activePatientId = useApp((s) => s.activePatientId)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const activeDocs = useApp((s) => s.activeDocs)
  const setActiveDocs = useApp((s) => s.setActiveDocs)
  const bumpChatList = useApp((s) => s.bumpChatList)

  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let cancel = false
    api.listDocuments()
      .then((d) => { if (!cancel) { setDocs(d); setLoading(false) } })
      .catch(() => { if (!cancel) setLoading(false) })
    return () => { cancel = true }
  }, [])

  const isAttached = (id: string) => activeDocs.some((d) => d.id === id)

  const toggle = async (doc: Document) => {
    setBusyId(doc.id)
    try {
      let chatId = activeChatId
      if (isAttached(doc.id)) {
        if (chatId) await api.detachDocument(chatId, doc.id)
        setActiveDocs(activeDocs.filter((d) => d.id !== doc.id))
      } else {
        if (!chatId) {
          const c = await api.createChat(activePatientId)
          chatId = c.id
          setActiveChat(chatId)
          bumpChatList()
        }
        const updated = await api.attachDocument(chatId, doc.id)
        setActiveDocs(updated)
        router.push('/chat')
      }
    } finally {
      setBusyId(null)
    }
  }

  if (loading) return <div className="text-xs text-text-soft-400">…</div>
  if (docs.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-stroke-soft-200 bg-bg-weak-50 p-6 text-center">
        <RiBookOpenLine className="text-text-soft-400 mx-auto mb-2 size-6" />
        <div className="text-sm text-text-sub-600 font-medium">No documents ingested yet</div>
        <div className="text-xs text-text-soft-400 mt-1.5 leading-relaxed max-w-xs mx-auto">
          From the project root, run:
          <pre className="bg-bg-white-0 border border-stroke-soft-200 mt-2 rounded-md px-2 py-1.5 text-[11px] text-text-strong-950 text-start">
{`npm --prefix server run ingest -- path/to/cholera.pdf`}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="text-text-soft-400 px-1 pb-1 text-[11px] uppercase tracking-wider font-semibold">
        Attach a document to this chat to ground replies in its content (RAG).
      </div>
      {docs.map((d) => {
        const attached = isAttached(d.id)
        return (
          <article
            key={d.id}
            className={cn(
              'rounded-2xl border bg-bg-white-0 p-4 transition',
              attached ? 'border-amber-300 bg-amber-50' : 'border-stroke-soft-200',
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-text-strong-950 text-sm font-bold flex items-center gap-1.5">
                  <RiBookOpenLine className="size-4 shrink-0 text-amber-700" />
                  <span className="truncate">{d.title}</span>
                </h3>
                <div className="text-text-soft-400 text-[11px] mt-1">
                  {d.page_count} pages · {d.lang.toUpperCase()}
                </div>
              </div>
              <button
                onClick={() => toggle(d)}
                disabled={busyId === d.id}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition',
                  attached
                    ? 'bg-amber-200 text-amber-900 hover:bg-amber-300'
                    : 'bg-text-strong-950 text-bg-white-0 hover:opacity-90',
                  busyId === d.id && 'opacity-50',
                )}
              >
                {attached ? (
                  <span className="inline-flex items-center gap-1">
                    <RiCheckLine className="size-3.5" />
                    Attached
                  </span>
                ) : (
                  'Attach to chat'
                )}
              </button>
            </div>
          </article>
        )
      })}
    </div>
  )
}

function ProtocolsTab({ lang }: { lang: 'en' | 'ar' }) {
  const { t } = useI18n()
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
        className="w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base"
      />
      {loading && <div className="text-xs text-text-soft-400">…</div>}
      {!loading && items.length === 0 && (
        <div className="text-sm text-text-soft-400 py-6 text-center">{t.library.noResults}</div>
      )}
      <div className="space-y-2">
        {items.map((p) => (
          <article key={p.id} className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4">
            <h3 className="text-primary-base text-sm font-bold">{p.topic}</h3>
            <p className="text-text-strong-950 text-sm mt-1.5 leading-relaxed whitespace-pre-wrap">{p.content}</p>
            <div className="text-[10px] text-text-soft-400 mt-2">{p.source}</div>
          </article>
        ))}
      </div>
    </div>
  )
}

interface ModeCard {
  id: string
  emoji: string
  title: { en: string; ar: string }
  desc: { en: string; ar: string }
}

const MODES: ModeCard[] = [
  {
    id: 'xray',
    emoji: '🩻',
    title: { en: 'Chest X-ray', ar: 'أشعة الصدر' },
    desc: { en: 'Findings, impression, and recommended action from a single chest radiograph.', ar: 'اكتشافات، انطباع، وإجراء موصى به.' },
  },
  {
    id: 'compare',
    emoji: '📊',
    title: { en: 'Compare X-rays', ar: 'مقارنة أشعات' },
    desc: { en: 'Side-by-side comparison: changes, what stayed stable, recommended action.', ar: 'مقارنة جنباً إلى جنب.' },
  },
  {
    id: 'derm',
    emoji: '🔬',
    title: { en: 'Dermatology', ar: 'الأمراض الجلدية' },
    desc: { en: 'ABCDE evaluation of a single skin lesion plus morphology and recommendation.', ar: 'تقييم ABCDE لآفة جلدية.' },
  },
  {
    id: 'lab',
    emoji: '🧪',
    title: { en: 'Lab report', ar: 'تقرير مختبر' },
    desc: { en: 'Extract every test result from a printed lab report into a structured table.', ar: 'استخراج نتائج المختبر إلى جدول.' },
  },
  {
    id: 'locate',
    emoji: '📍',
    title: { en: 'Locate feature', ar: 'تحديد معلم' },
    desc: { en: 'Describe in words where an anatomical feature appears in a medical image.', ar: 'وصف موضع معلم تشريحي بالكلمات.' },
  },
]

function ModesTab({ lang }: { lang: 'en' | 'ar' }) {
  const { t } = useI18n()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {MODES.map((m) => (
        <article key={m.id} className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{m.emoji}</div>
            <div className="flex-1">
              <h3 className="text-text-strong-950 text-sm font-bold">{m.title[lang]}</h3>
              <p className="text-text-sub-600 text-xs mt-1 leading-relaxed">{m.desc[lang]}</p>
              <div className="text-[10px] text-text-soft-400 mt-2">
                {t.library.tryWithSample}: New chat → + → {m.title[lang]}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
