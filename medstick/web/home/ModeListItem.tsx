'use client'

import type { ComponentType } from 'react'
import { useRouter } from 'next/navigation'
import { RiArrowRightSLine } from '@remixicon/react'
import { useApp } from '@/store/app'
import { cn } from '@/utils/cn'

interface Props {
  title: string
  blurb?: string
  icon: ComponentType<{ className?: string }>
  pendingTool?: string
  onClick?: () => void
  badge?: string
  disabled?: boolean
  iconBg?: string
  iconColor?: string
}

export function ModeListItem({
  title,
  blurb,
  icon: Icon,
  pendingTool,
  onClick,
  badge,
  disabled,
  iconBg,
  iconColor,
}: Props) {
  const router = useRouter()
  const setPendingTool = useApp((s) => s.setPendingTool)

  const handleClick = () => {
    if (disabled) return
    if (onClick) {
      onClick()
      return
    }
    if (pendingTool) {
      setPendingTool(pendingTool)
      router.push('/chat')
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'group flex items-center gap-3 w-full px-3.5 py-3 text-start',
        'border-b border-[var(--color-who-ring)] last:border-b-0',
        'transition-colors duration-150',
        'hover:bg-[var(--color-who-canvas)]',
        'focus:outline-none focus-visible:bg-[var(--color-who-tint)]',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'flex items-center justify-center shrink-0 size-9 rounded-lg transition-colors',
          !iconBg && 'bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)] group-hover:bg-[var(--color-who-blue)] group-hover:text-white',
        )}
        style={iconBg ? { backgroundColor: iconBg, color: iconColor } : undefined}
      >
        <Icon className="size-4.5" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-[14px] font-semibold text-[var(--color-who-ink)] truncate">
            {title}
          </h4>
          {badge && (
            <span className="inline-flex items-center rounded-sm bg-[var(--color-who-tint)] px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-wider text-[var(--color-who-blue-deep)]">
              {badge}
            </span>
          )}
        </div>
        {blurb && (
          <p className="text-[12px] text-[var(--color-who-ink-soft)] mt-0.5 truncate">{blurb}</p>
        )}
      </div>
      <RiArrowRightSLine className="size-4 text-[var(--color-who-ink-mute)] shrink-0 group-hover:text-[var(--color-who-blue-deep)] transition-colors" />
    </button>
  )
}
