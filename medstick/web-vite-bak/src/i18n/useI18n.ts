import { STRINGS } from './strings'
import { useApp } from '../store/app'

export function useI18n() {
  const lang = useApp((s) => s.lang)
  return { t: STRINGS[lang], lang, isRtl: lang === 'ar' }
}
