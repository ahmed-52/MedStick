'use client'

import { useState } from 'react'
import { RiArrowUpLine, RiCloseLine } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { cn } from '@/utils/cn'
import { useApp } from '@/store/app'
import { useI18n } from '@/i18n/useI18n'
import { ToolsMenu } from './ToolsMenu'
import type { ToolMessage } from './ToolRegistry'

interface Props {
  onSend: (text: string) => void | Promise<void>
  onAppendInline: (msg: ToolMessage) => string
  onReplaceInline: (id: string, msg: ToolMessage) => void
  disabled?: boolean
  bottomText?: boolean
}

export function Composer({ onSend, onAppendInline, onReplaceInline, disabled, bottomText }: Props) {
  const { t, isRtl } = useI18n()
  const [text, setText] = useState('')
  const stagedPhotoIds = useApp((s) => s.stagedPhotoIds)
  const removeStaged = useApp((s) => s.removeStagedPhoto)
  const activeDocs = useApp((s) => s.activeDocs)
  const placeholder =
    activeDocs.length > 0
      ? `Ask about ${activeDocs[0].title}${activeDocs.length > 1 ? ` (+${activeDocs.length - 1})` : ''}…`
      : t.chat.placeholder

  const submit = async () => {
    if (disabled) return
    const v = text.trim()
    if (!v && stagedPhotoIds.length === 0) return
    setText('')
    await onSend(v)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      submit()
    }
  }

  const canSubmit = text.trim().length > 0 || stagedPhotoIds.length > 0

  return (
    <div className="z-20 flex flex-col items-center px-2 lg:p-1">
      <div className="lg:rounded-20 bg-bg-weak-50 mb-4 w-full rounded-[16px] p-0.25 lg:w-175">
        <div className="bg-bg-white-0 shadow-complex-2 flex flex-col gap-2 rounded-[15px] p-2.5 pt-3 transition-all duration-200 lg:rounded-[19px] lg:p-3">
          {stagedPhotoIds.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {stagedPhotoIds.map((id) => (
                <div key={id} className="relative w-fit">
                  <img
                    src={`/api/photos/${id}`}
                    alt=""
                    className="border-stroke-soft-200 max-h-24 min-h-24 max-w-24 min-w-24 rounded-2xl border object-cover"
                  />
                  <Button.Root
                    variant="neutral"
                    mode="ghost"
                    size="xxsmall"
                    onClick={() => removeStaged(id)}
                    className="bg-bg-surface-800 hover:bg-bg-surface-800 absolute top-2 right-2 size-4 cursor-pointer rounded-full p-0"
                  >
                    <Button.Icon as={RiCloseLine} className="text-text-white-0 size-3.5" />
                  </Button.Root>
                </div>
              ))}
            </div>
          )}

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            dir={isRtl ? 'rtl' : 'ltr'}
            rows={1}
            className={cn(
              'tracking-spacing-tiny-2 max-h-40 min-h-6 w-full resize-none border-0 bg-transparent pt-1 pl-1 text-[14px] leading-5 outline-none focus:border-0 focus:ring-0 focus:outline-none lg:text-[15px] lg:leading-6 placeholder:text-text-soft-400',
              text.trim() ? 'text-text-strong-950' : 'text-text-soft-400',
            )}
            style={{ border: 'none', outline: 'none', boxShadow: 'none' }}
          />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ToolsMenu onAppendInline={onAppendInline} onReplaceInline={onReplaceInline} />
            </div>
            <div>
              <Button.Root
                variant="neutral"
                mode="ghost"
                size="xxsmall"
                onClick={submit}
                disabled={!canSubmit || disabled}
                className={cn(
                  'group size-7 cursor-pointer p-0 duration-200',
                  canSubmit && !disabled
                    ? 'bg-bg-strong-950 hover:bg-bg-strong-950'
                    : 'bg-bg-weak-50 hover:bg-bg-weak-50',
                )}
              >
                <Button.Icon
                  as={RiArrowUpLine}
                  className={cn(
                    'size-5 duration-200',
                    canSubmit && !disabled
                      ? 'text-bg-white-0 group-hover:text-bg-white-0'
                      : 'text-text-soft-400 group-hover:text-text-sub-600',
                  )}
                />
              </Button.Root>
            </div>
          </div>
        </div>
      </div>
      {bottomText && (
        <p className="text-text-soft-400 text-center text-xs lg:w-175">
          AI can make <b className="font-medium">mistakes</b> — verify before clinical use
        </p>
      )}
    </div>
  )
}
