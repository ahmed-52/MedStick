import { useApp } from '../store/app'
import { useFetch } from '../lib/useFetch'
import { api } from '../lib/api'
import { X } from 'lucide-react'

export function PatientChip() {
  const id = useApp((s) => s.activePatientId)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const { data: p } = useFetch(
    () => (id ? api.getPatient(id) : Promise.resolve(null)),
    [id],
  )
  if (!id || !p) return null
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-brand-50 border border-brand-200 px-3 py-1 text-xs text-brand-800">
      <span className="font-semibold">{p.name}</span>
      {p.age_years != null && <span>· {p.age_years}y</span>}
      <button
        onClick={() => {
          setActive(null)
          setActiveChat(null)
        }}
        className="-mr-1 ml-1 rounded-full hover:bg-brand-100 p-0.5"
        aria-label="clear active patient"
      >
        <X size={12} />
      </button>
    </span>
  )
}
