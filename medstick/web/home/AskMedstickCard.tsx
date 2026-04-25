'use client'

import { useState, useRef, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { RiArrowUpLine } from '@remixicon/react'
import { useApp } from '@/store/app'
import { cn } from '@/utils/cn'
import { HomeToolsMenu } from './HomeToolsMenu'

export function AskMedstickCard() {
  const router = useRouter()
  const setActiveChat = useApp((s) => s.setActiveChat)
  const clearStaged = useApp((s) => s.clearStagedPhotos)
  const setPendingPrompt = useApp((s) => s.setPendingPrompt)

  const [text, setText] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const taRef = useRef<HTMLTextAreaElement>(null)

  const submit = () => {
    const v = text.trim()
    if (!v || submitting) return
    setSubmitting(true)
    setText('')
    setActiveChat(null)
    clearStaged()
    setPendingPrompt(v)
    router.push('/chat')
  }

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const canSend = text.trim().length > 0 && !submitting

  return (
    <div className="rounded-2xl border border-[var(--color-who-ring)] bg-white p-5 md:p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[var(--color-who-blue)] shadow-[0_10px_24px_rgba(0,158,219,0.16)]">
          <Image
            src="/images/logo.svg"
            alt="MedStick"
            width={20}
            height={20}
            className="h-auto w-5"
            priority
          />
        </div>
        <div className="min-w-0">
          <h3 className="font-headline text-[18px] md:text-[20px] text-[var(--color-who-navy)]">
            Ask MedStick
          </h3>
          <p className="mt-0.5 text-[12.5px] text-[var(--color-who-ink-soft)]">
            Start a fresh consult from a clinical question.
          </p>
        </div>
      </div>

      <div className="rounded-[18px] border border-[var(--color-who-ring)] bg-white p-3 md:p-4 shadow-[0_10px_30px_rgba(10,22,40,0.06)] transition-colors focus-within:border-[var(--color-who-ring-strong)]">
        <textarea
          ref={taRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            const ta = e.currentTarget
            ta.style.height = 'auto'
            ta.style.height = Math.min(ta.scrollHeight, 220) + 'px'
          }}
          onKeyDown={onKey}
          placeholder="Type a clinical question or scenario…"
          rows={3}
          disabled={submitting}
          className={cn(
            'block max-h-[220px] min-h-[96px] w-full resize-none border-0 bg-transparent px-1 pt-1 text-[14.5px] leading-6 outline-none placeholder:text-[var(--color-who-ink-mute)] md:text-[15px]',
            text.trim() ? 'text-[var(--color-who-ink)]' : 'text-[var(--color-who-ink-soft)]',
          )}
          style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
        />

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HomeToolsMenu />
            <span className="text-[11.5px] text-[var(--color-who-ink-mute)]">
              Opens in chat
            </span>
          </div>
          <button
            onClick={submit}
            disabled={!canSend}
            className={cn(
              'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
              canSend
                ? 'bg-[var(--color-who-navy)] text-white hover:bg-[var(--color-who-ink)]'
                : 'bg-[var(--color-who-surface)] text-[var(--color-who-ink-mute)]',
            )}
            aria-label="Send"
          >
            <RiArrowUpLine className="size-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
