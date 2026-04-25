'use client'

import { useEffect, useRef, useState } from 'react'
import { RiCloseLine } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { getTools, type ToolContext, type ToolMessage } from './ToolRegistry'

interface Props {
  onAppendInline: (msg: ToolMessage) => string
  onReplaceInline: (id: string, msg: ToolMessage) => void
}

/**
 * Renders a centered sheet with the form of whichever tool is set on
 * `pendingTool` in the store. Used to launch tools from the home page.
 */
export function PendingToolSheet({ onAppendInline, onReplaceInline }: Props) {
  const pendingTool = useApp((s) => s.pendingTool)
  const setPendingTool = useApp((s) => s.setPendingTool)
  const { lang } = useI18n()
  const activePatientId = useApp((s) => s.activePatientId)
  const activeChatId = useApp((s) => s.activeChatId)
  const [mounted, setMounted] = useState(false)

  // Guards against React StrictMode double-invocation: a single pendingTool
  // value triggers `run()` exactly once, even if the component re-renders.
  const runOnceRef = useRef<string | null>(null)

  useEffect(() => setMounted(true), [])

  // Run instant (Form-less) tools from an effect rather than during render —
  // running side-effects in render fires twice in dev under StrictMode.
  useEffect(() => {
    if (!mounted || !pendingTool) return
    const tool = getTools().find((t) => t.id === pendingTool)
    if (!tool) {
      setPendingTool(null)
      return
    }
    if (tool.Form) return
    if (runOnceRef.current === pendingTool) return
    runOnceRef.current = pendingTool

    const ctx: ToolContext = {
      lang,
      activePatientId,
      activeChatId,
      appendInline: onAppendInline,
      replaceInline: onReplaceInline,
      closeMenu: () => setPendingTool(null),
    }

    const finish = () => {
      setPendingTool(null)
      // Clear the guard a tick later so a *new* invocation can fire.
      setTimeout(() => {
        if (runOnceRef.current === pendingTool) runOnceRef.current = null
      }, 0)
    }

    if (tool.run) {
      Promise.resolve(tool.run(ctx)).finally(finish)
    } else {
      finish()
    }
  }, [mounted, pendingTool, activeChatId, activePatientId, lang, onAppendInline, onReplaceInline, setPendingTool])

  if (!mounted || !pendingTool) return null

  const tool = getTools().find((t) => t.id === pendingTool)
  if (!tool || !tool.Form) return null

  const close = () => setPendingTool(null)

  const ctx: ToolContext = {
    lang,
    activePatientId,
    activeChatId,
    appendInline: onAppendInline,
    replaceInline: onReplaceInline,
    closeMenu: close,
  }

  const Form = tool.Form

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
      <div className="absolute inset-0 bg-black/40" onClick={close} />
      <div className="relative w-full md:max-w-md bg-bg-white-0 rounded-t-3xl md:rounded-3xl shadow-2xl wise-ring-strong">
        <div className="flex items-center justify-between px-5 py-4 border-b border-stroke-soft-200">
          <h2 className="text-lg font-semibold text-text-strong-950">{tool.label[lang]}</h2>
          <Button.Root
            variant="neutral"
            mode="ghost"
            size="xxsmall"
            onClick={close}
            className="size-8 cursor-pointer p-0 rounded-full hover:bg-bg-weak-50"
            aria-label="close"
          >
            <Button.Icon as={RiCloseLine} className="size-5 text-text-sub-600" />
          </Button.Root>
        </div>
        <div className="p-5 max-h-[80vh] overflow-y-auto">
          <Form ctx={ctx} onClose={close} />
        </div>
      </div>
    </div>
  )
}
