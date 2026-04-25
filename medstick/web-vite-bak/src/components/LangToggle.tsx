import { useApp } from '../store/app'

export function LangToggle() {
  const lang = useApp((s) => s.lang)
  const setLang = useApp((s) => s.setLang)
  return (
    <div className="inline-flex rounded-full bg-stone-200 p-0.5 text-xs font-medium">
      <button
        onClick={() => setLang('en')}
        className={`px-3 py-1 rounded-full transition ${
          lang === 'en' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ar')}
        className={`px-3 py-1 rounded-full transition ${
          lang === 'ar' ? 'bg-white shadow text-stone-900' : 'text-stone-600'
        }`}
      >
        AR
      </button>
    </div>
  )
}
