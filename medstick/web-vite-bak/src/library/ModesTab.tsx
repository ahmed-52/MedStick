import { useI18n } from '../i18n/useI18n'

interface ModeCard {
  id: string
  emoji: string
  title: { en: string; ar: string }
  desc: { en: string; ar: string }
}

const MODES: ModeCard[] = [
  {
    id: 'xray',
    emoji: '🩻',
    title: { en: 'Chest X-ray', ar: 'أشعة الصدر' },
    desc: {
      en: 'Findings, impression, and recommended action from a single chest radiograph.',
      ar: 'اكتشافات، انطباع، وإجراء موصى به من صورة أشعة صدر واحدة.',
    },
  },
  {
    id: 'compare',
    emoji: '📊',
    title: { en: 'Compare X-rays', ar: 'مقارنة أشعات' },
    desc: {
      en: 'Side-by-side comparison: changes, what stayed stable, recommended action.',
      ar: 'مقارنة جنباً إلى جنب: ما تغيّر، ما بقي ثابتاً، الإجراء الموصى به.',
    },
  },
  {
    id: 'derm',
    emoji: '🔬',
    title: { en: 'Dermatology', ar: 'الأمراض الجلدية' },
    desc: {
      en: 'ABCDE evaluation of a single skin lesion plus morphology and recommendation.',
      ar: 'تقييم ABCDE لآفة جلدية واحدة مع الشكل والتوصية.',
    },
  },
  {
    id: 'lab',
    emoji: '🧪',
    title: { en: 'Lab report', ar: 'تقرير مختبر' },
    desc: {
      en: 'Extract every test result from a printed lab report into a structured table.',
      ar: 'استخراج كل نتيجة فحص من تقرير مختبر مطبوع إلى جدول منظم.',
    },
  },
  {
    id: 'locate',
    emoji: '📍',
    title: { en: 'Locate feature', ar: 'تحديد معلم' },
    desc: {
      en: 'Describe in words where an anatomical feature appears in a medical image.',
      ar: 'وصف موضع معلم تشريحي في صورة طبية بالكلمات.',
    },
  },
]

export function ModesTab() {
  const { lang, t } = useI18n()
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {MODES.map((m) => (
        <article key={m.id} className="rounded-2xl border border-stone-200 bg-white p-4">
          <div className="flex items-start gap-3">
            <div className="text-3xl">{m.emoji}</div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-stone-900">{m.title[lang]}</h3>
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">{m.desc[lang]}</p>
              <div className="text-[10px] text-stone-400 mt-2">
                {t.library.tryWithSample}: open Chat → Tools → {m.title[lang]}
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}
