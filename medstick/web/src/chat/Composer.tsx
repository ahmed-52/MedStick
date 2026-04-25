import { useState, useRef } from 'react'
import { Send, Plus, X } from 'lucide-react'
import { useApp } from '../store/app'
import { useI18n } from '../i18n/useI18n'
import { ToolsMenu } from './ToolsMenu'
import type { ToolMessage } from './ToolRegistry'

interface Props {
  onSend: (content: string) => Promise<void> | void
  onAppendInline: (msg: ToolMessage) => void
  disabled?: boolean
}

export function Composer({ onSend, onAppendInline, disabled }: Props) {
  const { t, isRtl } = useI18n()
  const [text, setText] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const stagedPhotoIds = useApp((s) => s.stagedPhotoIds)
  const removeStaged = useApp((s) => s.removeStagedPhoto)

  const submit = async () => {
    if (disabled) return
    const v = text.trim()
    if (!v && stagedPhotoIds.length === 0) return
    setText('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
    await onSend(v)
  }

  return (
    <div className="relative border-t border-stone-200 bg-white px-3 md:px-6 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
      {stagedPhotoIds.length > 0 && (
        <div className="flex gap-2 mb-2 overflow-x-auto">
          {stagedPhotoIds.map((id) => (
            <div key={id} className="relative shrink-0">
              <img
                src={`/api/photos/${id}`}
                alt=""
                className="w-14 h-14 rounded-lg object-cover border border-stone-200"
              />
              <button
                onClick={() => removeStaged(id)}
                className="absolute -top-1.5 -end-1.5 bg-stone-800 text-white rounded-full p-0.5 shadow"
                aria-label="remove"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-3xl mx-auto relative flex items-end gap-2">
        <button
          onClick={() => setMenuOpen((o) => !o)}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-700 hover:bg-stone-200 transition"
          aria-label={t.chat.tools}
        >
          <Plus size={20} />
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const ta = e.currentTarget
            ta.style.height = 'auto'
            ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder={t.chat.placeholder}
          rows={1}
          dir={isRtl ? 'rtl' : 'ltr'}
          className="flex-1 resize-none rounded-2xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 max-h-40 leading-relaxed"
        />

        <button
          onClick={submit}
          disabled={disabled || (!text.trim() && stagedPhotoIds.length === 0)}
          className="shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-brand-600 text-white hover:bg-brand-700 disabled:bg-stone-300 transition"
          aria-label={t.chat.send}
        >
          <Send size={18} className={isRtl ? 'rotate-180' : ''} />
        </button>
      </div>

      {menuOpen && (
        <ToolsMenu
          onClose={() => setMenuOpen(false)}
          onAppendInline={onAppendInline}
        />
      )}
    </div>
  )
}
