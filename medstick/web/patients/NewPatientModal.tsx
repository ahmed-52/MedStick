'use client'

import { useEffect, useRef, useState } from 'react'
import { RiCloseLine, RiUserAddLine } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { useI18n } from '@/i18n/useI18n'
import { api } from '@/lib/api'
import type { Patient, Sex, Lang } from '@/lib/types'
import { cn } from '@/utils/cn'

interface Props {
  isOpen: boolean
  onClose: () => void
  onCreated: (patient: Patient) => void
}

export function NewPatientModal({ isOpen, onClose, onCreated }: Props) {
  const { t } = useI18n()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Sex>('unknown')
  const [langPref, setLangPref] = useState<Lang>('en')
  const [busy, setBusy] = useState(false)
  const [animating, setAnimating] = useState(false)
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      const id = window.setTimeout(() => {
        setAnimating(true)
        nameRef.current?.focus()
      }, 10)
      return () => window.clearTimeout(id)
    }
    setAnimating(false)
  }, [isOpen])

  const reset = () => {
    setName('')
    setAge('')
    setSex('unknown')
    setLangPref('en')
  }

  const handleClose = () => {
    setAnimating(false)
    window.setTimeout(() => {
      reset()
      onClose()
    }, 250)
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const v = name.trim()
    if (!v || busy) return
    setBusy(true)
    try {
      const p = await api.createPatient({
        name: v,
        age_years: age ? Number(age) : null,
        sex,
        lang_pref: langPref,
      })
      onCreated(p)
      handleClose()
    } finally {
      setBusy(false)
    }
  }

  if (!isOpen) return null

  const fc =
    'w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2.5 text-sm text-text-strong-950 placeholder:text-text-soft-400 focus:outline-none focus:border-[var(--color-who-blue)] focus:ring-2 focus:ring-[var(--color-who-blue)]/20'

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex h-full w-full items-end justify-center transition-colors duration-300 lg:items-center',
        animating ? 'bg-black/40' : 'bg-transparent',
      )}
      onClick={handleClose}
    >
      <div
        className={cn(
          'w-full bg-bg-white-0 rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out lg:max-w-md lg:rounded-3xl',
          animating
            ? 'translate-y-0 lg:opacity-100'
            : 'translate-y-full lg:translate-y-0 lg:opacity-0',
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-5 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)]">
              <RiUserAddLine className="size-5" />
            </span>
            <div>
              <h2 className="text-text-strong-950 text-base font-semibold leading-tight">
                {t.patients.new}
              </h2>
              <p className="text-text-soft-400 text-xs mt-0.5">
                Add a patient to track encounters and chats
              </p>
            </div>
          </div>
          <Button.Root
            type="button"
            variant="neutral"
            mode="ghost"
            size="xxsmall"
            className="size-7 cursor-pointer rounded-md p-0 hover:bg-bg-weak-50"
            onClick={handleClose}
            aria-label="Close"
          >
            <Button.Icon as={RiCloseLine} className="size-5 text-text-soft-400" />
          </Button.Root>
        </div>

        <form onSubmit={submit} className="px-5 pb-5 space-y-3">
          <div>
            <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
              {t.patients.name}
            </label>
            <input
              ref={nameRef}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Yusuf Al-Sabri"
              required
              className={fc}
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
                {t.patients.age}
              </label>
              <input
                type="number"
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="—"
                className={fc}
              />
            </div>
            <div>
              <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
                {t.patients.sex}
              </label>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex)}
                className={fc}
              >
                <option value="unknown">{t.sex.unknown}</option>
                <option value="m">{t.sex.m}</option>
                <option value="f">{t.sex.f}</option>
                <option value="other">{t.sex.other}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
              {t.patients.langPref}
            </label>
            <select
              value={langPref}
              onChange={(e) => setLangPref(e.target.value as Lang)}
              className={fc}
            >
              <option value="en">English</option>
              <option value="ar">العربية</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <Button.Root
              type="button"
              variant="neutral"
              mode="stroke"
              size="small"
              onClick={handleClose}
              className="flex-1 cursor-pointer"
            >
              Cancel
            </Button.Root>
            <Button.Root
              type="submit"
              variant="primary"
              mode="filled"
              size="small"
              disabled={!name.trim() || busy}
              className="flex-1 cursor-pointer bg-[var(--color-who-blue)] hover:bg-[var(--color-who-blue-hover)] disabled:opacity-50"
            >
              {busy ? 'Creating…' : t.patients.new}
            </Button.Root>
          </div>
        </form>
      </div>
    </div>
  )
}
