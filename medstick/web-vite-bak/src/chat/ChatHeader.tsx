import { Plus, Trash2 } from 'lucide-react'

interface Props {
  hasMessages: boolean
  onNew: () => void
  onDelete: () => void
}

export function ChatHeader({ hasMessages, onNew, onDelete }: Props) {
  if (!hasMessages) return null
  return (
    <div className="flex items-center justify-end gap-2 px-3 md:px-6 py-2 border-b border-stone-100 bg-white">
      <button
        onClick={onNew}
        className="inline-flex items-center gap-1 text-xs font-medium text-stone-700 hover:text-brand-700 px-2.5 py-1 rounded-md hover:bg-stone-100"
      >
        <Plus size={14} /> New chat
      </button>
      <button
        onClick={() => {
          if (window.confirm('Delete this entire chat? Messages cannot be recovered.')) onDelete()
        }}
        className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 px-2.5 py-1 rounded-md hover:bg-rose-50"
      >
        <Trash2 size={14} /> Delete
      </button>
    </div>
  )
}
