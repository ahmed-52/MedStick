import { LangToggle } from './LangToggle'
import { PatientChip } from './PatientChip'
import { ModelStatus } from './ModelStatus'
import { useI18n } from '../i18n/useI18n'

export function TopBar() {
  const { t } = useI18n()
  return (
    <header className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-stone-200 bg-white">
      <div className="flex items-center gap-3 min-w-0">
        <h1 className="text-base font-bold text-brand-700 tracking-tight">{t.appName}</h1>
        <PatientChip />
      </div>
      <div className="flex items-center gap-3">
        <ModelStatus />
        <LangToggle />
      </div>
    </header>
  )
}
