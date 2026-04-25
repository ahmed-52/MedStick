import type { ReactNode } from 'react'

interface Props {
  title: string
  emoji?: string
  children: ReactNode
  imageIds?: string[]
}

export function SpecialtyCard({ title, emoji, children, imageIds = [] }: Props) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-stone-100 bg-stone-50">
        {emoji && <span>{emoji}</span>}
        <span className="text-sm font-bold text-stone-800">{title}</span>
      </div>
      {imageIds.length > 0 && (
        <div className="grid grid-cols-2 gap-1 p-2">
          {imageIds.map((id) => (
            <img key={id} src={`/api/photos/${id}`} alt="" className="rounded-lg w-full h-32 object-cover" />
          ))}
        </div>
      )}
      <div className="p-4 text-sm text-stone-800 space-y-2">{children}</div>
    </div>
  )
}

export function Section({ label, body }: { label: string; body: string }) {
  if (!body.trim()) return null
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold mb-1">
        {label}
      </div>
      <p className="whitespace-pre-wrap leading-relaxed">{body}</p>
    </div>
  )
}
