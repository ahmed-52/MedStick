import { useEffect, useState, type ComponentType } from 'react'
import { X } from 'lucide-react'
import { useApp } from '../store/app'
import { useI18n } from '../i18n/useI18n'
import { getTools, type ToolGroup, type Tool, type ToolContext, type ToolMessage } from './ToolRegistry'

interface Props {
  onClose: () => void
  onAppendInline: (msg: ToolMessage) => void
}

const groupOrder: ToolGroup[] = ['patient', 'attachments', 'lookup', 'modes', 'language']

export function ToolsMenu({ onClose, onAppendInline }: Props) {
  const { t, lang } = useI18n()
  const activePatientId = useApp((s) => s.activePatientId)
  const activeChatId = useApp((s) => s.activeChatId)

  const [activeForm, setActiveForm] = useState<{
    Form: ComponentType<{ ctx: ToolContext; onClose: () => void }>
    id: string
  } | null>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const ctx: ToolContext = {
    lang,
    activePatientId,
    activeChatId,
    appendInline: onAppendInline,
    closeMenu: onClose,
  }

  const tools = getTools()
  const grouped: Record<ToolGroup, Tool[]> = {
    patient: [], attachments: [], lookup: [], modes: [], language: [],
  }
  for (const tl of tools) grouped[tl.group].push(tl)

  const groupLabel: Record<ToolGroup, string> = {
    patient: t.tools.patient,
    attachments: t.tools.attachments,
    lookup: t.tools.lookup,
    modes: t.tools.modes,
    language: t.tools.language,
  }

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/20" onClick={onClose} />
      <div
        className="fixed md:absolute z-50 inset-x-0 bottom-0 md:bottom-16 md:inset-x-auto md:start-3 md:w-80 max-h-[70vh] overflow-y-auto bg-white border-t md:border md:rounded-2xl border-stone-200 shadow-2xl pb-[env(safe-area-inset-bottom)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
          <span className="text-sm font-semibold text-stone-700">{t.chat.tools}</span>
          <button onClick={onClose} className="p-1 rounded hover:bg-stone-100">
            <X size={16} />
          </button>
        </div>

        {activeForm ? (
          <div className="p-4">
            <activeForm.Form ctx={ctx} onClose={onClose} />
          </div>
        ) : (
          <div className="py-2">
            {groupOrder.map((g) => {
              const items = grouped[g]
              if (items.length === 0) return null
              return (
                <div key={g} className="py-1">
                  <div className="px-4 text-[10px] uppercase tracking-wider text-stone-400 font-semibold mb-1">
                    {groupLabel[g]}
                  </div>
                  {items.map((tl) => (
                    <button
                      key={tl.id}
                      onClick={async () => {
                        if (tl.Form) setActiveForm({ Form: tl.Form, id: tl.id })
                        else if (tl.run) {
                          await tl.run(ctx)
                          onClose()
                        }
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-start hover:bg-stone-50 text-sm text-stone-800"
                    >
                      <span>{tl.label[lang]}</span>
                    </button>
                  ))}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
