'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/utils/cn'
import { useI18n } from '@/i18n/useI18n'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'

function ModelStatus() {
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

  const dot = online === null ? 'bg-bg-soft-200' : online ? 'bg-success-base' : 'bg-error-base'
  const label = online === null ? '…' : online ? t.settings.online : t.settings.offline

  return (
    <span className="inline-flex items-center gap-2 text-sm text-text-sub-600">
      <span className={cn('w-2 h-2 rounded-full', dot)} />
      <span>{label}</span>
    </span>
  )
}

function LangToggle() {
  const lang = useApp((s) => s.lang)
  const setLang = useApp((s) => s.setLang)
  return (
    <div className="inline-flex rounded-full bg-bg-weak-50 p-0.5">
      <button
        onClick={() => setLang('en')}
        className={cn(
          'px-4 py-1.5 rounded-full text-sm font-medium transition',
          lang === 'en' ? 'bg-bg-white-0 shadow text-text-strong-950' : 'text-text-sub-600',
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLang('ar')}
        className={cn(
          'px-4 py-1.5 rounded-full text-sm font-medium transition',
          lang === 'ar' ? 'bg-bg-white-0 shadow text-text-strong-950' : 'text-text-sub-600',
        )}
      >
        AR
      </button>
    </div>
  )
}

export function SettingsScreen() {
  const { t } = useI18n()

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div className="bg-bg-white-0 lg:border-stroke-soft-200 relative flex h-full flex-col pb-4 lg:rounded-3xl lg:border lg:py-4 lg:pr-4 lg:pl-5">
        <header className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-1.5">
            <h1 className="text-text-soft-400 text-sm">MedStick</h1>
            <span className="text-text-soft-400 text-sm">/</span>
            <span className="text-text-sub-600 text-sm">{t.settings.title}</span>
          </div>
        </header>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="max-w-2xl mx-auto p-2 space-y-3">
            <section className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 space-y-2">
              <div className="text-text-strong-950 text-sm font-semibold">{t.settings.language}</div>
              <LangToggle />
            </section>

            <section className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 space-y-2">
              <div className="text-text-strong-950 text-sm font-semibold">{t.settings.modelStatus}</div>
              <ModelStatus />
            </section>

            <section className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 p-4 text-xs text-text-soft-400 leading-relaxed">
              MedStick is an offline-first AI clinical workspace for rural and humanitarian-setting health workers. Inference runs on-device via llama.cpp + MedGemma 4B.
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
