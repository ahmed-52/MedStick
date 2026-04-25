import { useI18n } from '../i18n/useI18n'
import { LangToggle } from '../components/LangToggle'
import { ModelStatus } from '../components/ModelStatus'

export function SettingsScreen() {
  const { t } = useI18n()
  return (
    <div className="h-full overflow-y-auto p-4 md:p-6 max-w-2xl mx-auto w-full space-y-4">
      <h2 className="text-xl font-bold text-stone-900">{t.settings.title}</h2>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 space-y-2">
        <div className="text-sm font-semibold text-stone-700">{t.settings.language}</div>
        <LangToggle />
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 space-y-2">
        <div className="text-sm font-semibold text-stone-700">{t.settings.modelStatus}</div>
        <ModelStatus />
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-4 text-xs text-stone-500 leading-relaxed">
        MedStick is an offline-first AI clinical workspace for rural and humanitarian-setting health workers. Inference runs on-device via llama.cpp + MedGemma 4B.
      </section>
    </div>
  )
}
