'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import * as Popover from '@radix-ui/react-popover'
import { RiAddLine } from '@remixicon/react'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { getTools, type Tool, type ToolGroup } from '@/chat/ToolRegistry'
import { getToolStyle } from '@/chat/toolStyles'
import { cn } from '@/utils/cn'

const groupOrder: ToolGroup[] = ['modes', 'patient', 'attachments', 'lookup', 'protocols']

export function HomeToolsMenu() {
  const router = useRouter()
  const { t, lang } = useI18n()
  const setPendingTool = useApp((s) => s.setPendingTool)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const clearStaged = useApp((s) => s.clearStagedPhotos)
  const [open, setOpen] = useState(false)

  const launch = (tool: Tool) => {
    setOpen(false)
    setActiveChat(null)
    clearStaged()
    setPendingTool(tool.id)
    router.push('/chat')
  }

  const tools = getTools()
  const grouped: Record<ToolGroup, Tool[]> = {
    protocols: [],
    patient: [],
    attachments: [],
    lookup: [],
    modes: [],
    language: [],
  }
  for (const tl of tools) grouped[tl.group].push(tl)

  const groupLabel: Record<ToolGroup, string> = {
    protocols: (t.tools as any).protocols ?? 'Protocols',
    patient: t.tools.patient,
    attachments: t.tools.attachments,
    lookup: t.tools.lookup,
    modes: t.tools.modes,
    language: t.tools.language,
  }

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Tools"
          className={cn(
            'inline-flex size-9 shrink-0 items-center justify-center rounded-full transition-colors',
            'bg-[var(--color-who-blue)] hover:bg-[var(--color-who-blue-hover)]',
            open && 'bg-[var(--color-who-blue-deep)] hover:bg-[var(--color-who-blue-deep)]',
          )}
        >
          <RiAddLine className="size-5 text-white" />
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-white shadow-[0_18px_40px_rgba(10,22,40,0.16)] z-30 w-80 max-h-[60vh] overflow-y-auto rounded-2xl p-1.5 border border-[var(--color-who-ring)]"
          side="top"
          sideOffset={10}
          align="start"
          alignOffset={0}
          avoidCollisions
        >
          <div className="flex flex-col gap-1 py-0.5">
            {groupOrder.map((g) => {
              const items = grouped[g]
              if (items.length === 0) return null
              return (
                <div key={g}>
                  <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-[var(--color-who-ink-mute)] font-semibold">
                    {groupLabel[g]}
                  </div>
                  {items.map((tl) => {
                    const style = getToolStyle(tl.id)
                    const Icon = style.icon
                    return (
                      <button
                        key={tl.id}
                        type="button"
                        onClick={() => launch(tl)}
                        className="group/menu-item flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left text-[13px] font-medium text-[var(--color-who-ink-soft)] hover:bg-[var(--color-who-canvas)] transition-colors"
                      >
                        <span
                          className="flex size-7 shrink-0 items-center justify-center rounded-md"
                          style={{ backgroundColor: style.bg, color: style.fg }}
                        >
                          <Icon className="size-4" />
                        </span>
                        <span className="truncate text-[var(--color-who-ink)]">{tl.label[lang]}</span>
                      </button>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
