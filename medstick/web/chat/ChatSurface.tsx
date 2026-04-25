'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'
import { RiArrowDownLine, RiAddLine, RiDeleteBinLine, RiCloseLine, RiBookOpenLine } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useApp } from '@/store/app'
import { useFetch } from '@/lib/useFetch'
import { api } from '@/lib/api'
import { useI18n } from '@/i18n/useI18n'
import { useChat } from './useChat'
import { MessageBubble } from './MessageBubble'
import { Composer } from './Composer'
import { PendingToolSheet } from './PendingToolSheet'
import { useState } from 'react'
import './tools' // register all tools

function ActivePatientChip() {
  const id = useApp((s) => s.activePatientId)
  const setActive = useApp((s) => s.setActivePatient)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const { data: p } = useFetch(
    () => (id ? api.getPatient(id) : Promise.resolve(null)),
    [id],
  )
  if (!id || !p) return null
  return (
    <button
      onClick={() => {
        setActive(null)
        setActiveChat(null)
      }}
      className="bg-primary-alpha-16 text-primary-base hover:bg-primary-alpha-24 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition"
      title="Clear active patient"
    >
      <span className="font-semibold">{p.name}</span>
      {p.age_years != null && <span>· {p.age_years}y</span>}
    </button>
  )
}

function ActiveDocChips() {
  const docs = useApp((s) => s.activeDocs)
  const setActiveDocs = useApp((s) => s.setActiveDocs)
  const activeChatId = useApp((s) => s.activeChatId)
  if (docs.length === 0) return null
  const detach = async (id: string) => {
    if (!activeChatId) {
      setActiveDocs(docs.filter((d) => d.id !== id))
      return
    }
    try {
      await api.detachDocument(activeChatId, id)
    } catch {}
    setActiveDocs(docs.filter((d) => d.id !== id))
  }
  return (
    <>
      {docs.map((d) => (
        <button
          key={d.id}
          onClick={() => detach(d.id)}
          className="bg-amber-100 text-amber-900 hover:bg-amber-200 inline-flex max-w-[14rem] items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition"
          title="Detach document"
        >
          <RiBookOpenLine className="size-3.5 shrink-0" />
          <span className="truncate font-semibold">{d.title}</span>
          <RiCloseLine className="size-3.5 shrink-0 opacity-70" />
        </button>
      ))}
    </>
  )
}

export function ChatSurface() {
  const { t } = useI18n()
  const { messages, send, streaming, appendInline, replaceInline, reset, deleteCurrent } = useChat()

  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const [showScrollButton, setShowScrollButton] = useState(false)

  useEffect(() => {
    const c = messagesContainerRef.current
    if (!c) return
    const last = messages[messages.length - 1]
    c.scrollTo({ top: c.scrollHeight, behavior: streaming ? 'auto' : 'smooth' })
    void last
  }, [messages.length, messages[messages.length - 1]?.content.length, streaming])

  useEffect(() => {
    const c = messagesContainerRef.current
    if (!c) return
    const onScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = c
      const nearBottom = scrollTop + clientHeight >= scrollHeight - 100
      setShowScrollButton(!nearBottom && scrollHeight > clientHeight)
    }
    c.addEventListener('scroll', onScroll)
    return () => c.removeEventListener('scroll', onScroll)
  }, [])

  const scrollDown = () => {
    const c = messagesContainerRef.current
    if (!c) return
    c.scrollTo({ top: c.scrollHeight, behavior: 'smooth' })
  }

  const isEmpty = messages.length === 0

  return (
    <div className="flex h-full flex-col lg:p-1.5 lg:pl-0">
      <div
        className={cn(
          'bg-bg-white-0 lg:border-stroke-soft-200 relative flex h-full flex-col pb-4 lg:rounded-3xl lg:border lg:py-4 lg:pr-4 lg:pl-5',
          isEmpty ? 'lg:justify-end' : 'justify-between',
        )}
      >
        <header className="absolute top-4 left-5 right-5 flex items-center justify-between z-10">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-text-soft-400 text-sm tracking-spacing-tiny-2">MedStick</h1>
            <span className="text-text-soft-400 text-sm">/</span>
            <span className="text-text-sub-600 text-sm tracking-spacing-tiny-2">Chat</span>
            <ActivePatientChip />
            <ActiveDocChips />
          </div>
          {!isEmpty && (
            <div className="flex items-center gap-1.5">
              <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={reset}
                className="bg-bg-weak-50 hover:bg-bg-soft-200 cursor-pointer h-7 gap-1 px-2 text-xs"
              >
                <Button.Icon as={RiAddLine} className="size-4" />
                New chat
              </Button.Root>
              <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={() => {
                  if (window.confirm('Delete this entire chat? Messages cannot be recovered.')) deleteCurrent()
                }}
                className="hover:bg-error-lighter cursor-pointer h-7 gap-1 px-2 text-xs text-error-base"
              >
                <Button.Icon as={RiDeleteBinLine} className="size-4" />
                Delete
              </Button.Root>
            </div>
          )}
        </header>

        {isEmpty ? (
          <div className="absolute top-1/2 left-1/2 flex w-full -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center px-4">
            <div className="mb-5">
              <div className="bg-[var(--color-who-blue)] flex size-14 items-center justify-center rounded-2xl shadow-[0_10px_24px_rgba(0,158,219,0.18)]">
                <Image
                  src="/images/logo.svg"
                  alt="MedStick"
                  width={28}
                  height={28}
                  className="h-auto w-7"
                  priority
                />
              </div>
            </div>
            <div className="tracking-spacing-tiny-1 text-text-strong-950 mb-1 text-lg/snug font-medium">
              {t.appName}
            </div>
            <div className="tracking-spacing-tiny-2 text-text-soft-400 text-center text-sm font-medium max-w-md">
              {t.chat.empty}
            </div>
          </div>
        ) : (
          <div
            ref={messagesContainerRef}
            className="-mt-4 -mb-5 flex w-full flex-1 justify-center overflow-y-auto transition-opacity duration-200 ease-in-out lg:-ml-5 lg:w-[calc(100%+36px)]"
          >
            <div className="flex w-full flex-col px-5 lg:w-175 lg:px-0">
              <div className="space-y-3.5 pt-30 pb-24">
                {messages.map((m) => (
                  <MessageBubble key={m.id} msg={m} />
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          {showScrollButton && (
            <div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2">
              <Button.Root
                variant="neutral"
                mode="ghost"
                size="small"
                onClick={scrollDown}
                className="bg-bg-white-0 hover:bg-bg-weak-50 shadow-complex flex size-8 cursor-pointer items-center rounded-full p-0"
              >
                <Button.Icon as={RiArrowDownLine} className="text-text-sub-600 size-5" />
              </Button.Root>
            </div>
          )}

          <Composer
            onSend={send}
            onAppendInline={appendInline}
            onReplaceInline={replaceInline}
            disabled={streaming}
            bottomText
          />
        </div>
      </div>
      <PendingToolSheet onAppendInline={appendInline} onReplaceInline={replaceInline} />
    </div>
  )
}
