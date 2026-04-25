import { useState } from 'react'
import { useI18n } from '../i18n/useI18n'
import { ProtocolsTab } from './ProtocolsTab'
import { ModesTab } from './ModesTab'

export function LibraryScreen() {
  const { t } = useI18n()
  const [tab, setTab] = useState<'protocols' | 'modes'>('protocols')

  return (
    <div className="h-full flex flex-col p-4 md:p-6 max-w-5xl mx-auto w-full">
      <h2 className="text-xl font-bold text-stone-900 mb-3">{t.library.title}</h2>
      <div className="inline-flex rounded-full bg-stone-200 p-0.5 self-start mb-4 text-sm font-medium">
        <button onClick={() => setTab('protocols')}
          className={`px-4 py-1.5 rounded-full transition ${tab === 'protocols' ? 'bg-white shadow text-stone-900' : 'text-stone-600'}`}>
          {t.library.protocols}
        </button>
        <button onClick={() => setTab('modes')}
          className={`px-4 py-1.5 rounded-full transition ${tab === 'modes' ? 'bg-white shadow text-stone-900' : 'text-stone-600'}`}>
          {t.library.modes}
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin">
        {tab === 'protocols' ? <ProtocolsTab /> : <ModesTab />}
      </div>
    </div>
  )
}
