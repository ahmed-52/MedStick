'use client'
import { useState, type ComponentType } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { RiAddLine, RiCloseLine } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { getTools, type Tool, type ToolContext, type ToolGroup, type ToolMessage } from './ToolRegistry'
import { getToolStyle } from './toolStyles'

interface Props {
  onAppendInline: (msg: ToolMessage) => string
  onReplaceInline: (id: string, msg: ToolMessage) => void
}

// Modes lead — they are the primary clinical action surface.
const groupOrder: ToolGroup[] = ['modes', 'patient', 'attachments', 'lookup']

export function ToolsMenu({ onAppendInline, onReplaceInline }: Props) {
  const { t, lang } = useI18n()
  const activePatientId = useApp((s) => s.activePatientId)
  const activeChatId = useApp((s) => s.activeChatId)

  const [open, setOpen] = useState(false)
  const [activeForm, setActiveForm] = useState<{
    Form: ComponentType<{ ctx: ToolContext; onClose: () => void }>
    id: string
    label: string
  } | null>(null)

  const close = () => {
    setOpen(false)
    setActiveForm(null)
  }

  const ctx: ToolContext = {
    lang,
    activePatientId,
    activeChatId,
    appendInline: onAppendInline,
    replaceInline: onReplaceInline,
    closeMenu: close,
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
    <Popover.Root
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) setActiveForm(null)
      }}
    >
      <Popover.Trigger asChild>
        <Button.Root
          variant="neutral"
          mode="ghost"
          size="xxsmall"
          className={cn(
            'group size-7 cursor-pointer p-0 transition-colors duration-200',
            'bg-[var(--color-who-blue)] hover:bg-[var(--color-who-blue-hover)]',
            open && 'bg-[var(--color-who-blue-deep)] hover:bg-[var(--color-who-blue-deep)]',
          )}
        >
          <Button.Icon
            as={RiAddLine}
            className="size-5 text-white duration-200"
          />
        </Button.Root>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          className="bg-bg-white-0 shadow-complex z-30 w-80 max-h-[60vh] overflow-y-auto rounded-2xl p-1.5"
          side="top"
          sideOffset={10}
          align="start"
          alignOffset={0}
          avoidCollisions={true}
        >
          {activeForm ? (
            <div className="p-1.5">
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="text-text-strong-950 text-sm font-semibold">{activeForm.label}</span>
                <button
                  onClick={() => setActiveForm(null)}
                  className="text-text-soft-400 hover:text-text-sub-600 rounded p-1 hover:bg-bg-weak-50"
                  aria-label="back"
                >
                  <RiCloseLine className="size-4" />
                </button>
              </div>
              <activeForm.Form ctx={ctx} onClose={close} />
            </div>
          ) : (
            <div className="flex flex-col gap-1 py-0.5">
              {groupOrder.map((g) => {
                const items = grouped[g]
                if (items.length === 0) return null
                return (
                  <div key={g}>
                    <div className="px-2 pt-2 pb-1 text-[10px] uppercase tracking-wider text-text-soft-400 font-semibold">
                      {groupLabel[g]}
                    </div>
                    {items.map((tl) => {
                      const style = getToolStyle(tl.id)
                      const Icon = style.icon
                      return (
                        <button
                          key={tl.id}
                          type="button"
                          onClick={async () => {
                            if (tl.Form) {
                              setActiveForm({ Form: tl.Form, id: tl.id, label: tl.label[lang] })
                            } else if (tl.run) {
                              await tl.run(ctx)
                              close()
                            }
                          }}
                          className="group/menu-item flex w-full items-center gap-2.5 rounded-lg p-1.5 text-left text-[13px] font-medium text-text-sub-600 hover:bg-bg-weak-50 transition-colors"
                        >
                          <span
                            className="flex size-7 shrink-0 items-center justify-center rounded-md"
                            style={{ backgroundColor: style.bg, color: style.fg }}
                          >
                            <Icon className="size-4" />
                          </span>
                          <span className="truncate">{tl.label[lang]}</span>
                        </button>
                      )
                    })}
                  </div>
                )
              })}
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
