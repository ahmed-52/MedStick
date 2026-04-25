'use client'
import { useState } from 'react'
import * as Button from '@/components/ui/button'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { api } from '@/lib/api'
import type { Sex, Lang } from '@/lib/types'

const fieldClass =
  'w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base'

function NewPatientForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const { t } = useI18n()
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Sex>('unknown')
  const [langPref, setLangPref] = useState<Lang>(ctx.lang)
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || busy) return
    setBusy(true)
    try {
      const p = await api.createPatient({
        name: name.trim(),
        age_years: age ? Number(age) : null,
        sex,
        lang_pref: langPref,
      })
      setActive(p.id)
      setActiveChat(null)
      ctx.appendInline({
        role: 'tool',
        content: `Created patient: ${p.name}${p.age_years ? `, ${p.age_years}y` : ''}`,
      })
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2.5">
      <div>
        <label className="text-text-soft-400 mb-1 block text-[10px] uppercase font-semibold tracking-wider">
          {t.patients.name}
        </label>
        <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className={fieldClass} required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-text-soft-400 mb-1 block text-[10px] uppercase font-semibold tracking-wider">{t.patients.age}</label>
          <input type="number" min={0} max={120} value={age} onChange={(e) => setAge(e.target.value)} className={fieldClass} />
        </div>
        <div>
          <label className="text-text-soft-400 mb-1 block text-[10px] uppercase font-semibold tracking-wider">{t.patients.sex}</label>
          <select value={sex} onChange={(e) => setSex(e.target.value as Sex)} className={fieldClass + ' bg-bg-white-0'}>
            <option value="unknown">{t.sex.unknown}</option>
            <option value="m">{t.sex.m}</option>
            <option value="f">{t.sex.f}</option>
            <option value="other">{t.sex.other}</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-text-soft-400 mb-1 block text-[10px] uppercase font-semibold tracking-wider">{t.patients.langPref}</label>
        <select value={langPref} onChange={(e) => setLangPref(e.target.value as Lang)} className={fieldClass + ' bg-bg-white-0'}>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>
      <Button.Root type="submit" disabled={busy} className="w-full">
        {t.patients.new}
      </Button.Root>
    </form>
  )
}

registerTool({
  id: 'newPatient',
  group: 'patient',
  label: { en: 'New patient', ar: 'مريض جديد' },
  Form: NewPatientForm,
})
