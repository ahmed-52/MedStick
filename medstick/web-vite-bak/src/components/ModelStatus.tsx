import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useI18n } from '../i18n/useI18n'

export function ModelStatus() {
  const [online, setOnline] = useState<boolean | null>(null)
  const { t } = useI18n()

  useEffect(() => {
    let alive = true
    const check = async () => {
      try {
        const r = await api.health()
        if (alive) setOnline(r.llama)
      } catch {
        if (alive) setOnline(false)
      }
    }
    check()
    const id = setInterval(check, 5000)
    return () => {
      alive = false
      clearInterval(id)
    }
  }, [])

  const dot =
    online === null ? 'bg-stone-300' : online ? 'bg-emerald-500' : 'bg-rose-500'
  const label =
    online === null ? '…' : online ? t.settings.online : t.settings.offline

  return (
    <span className="inline-flex items-center gap-2 text-xs text-stone-600">
      <span className={`w-2 h-2 rounded-full ${dot}`} />
      <span>{label}</span>
    </span>
  )
}
