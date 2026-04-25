'use client'

import type { ComponentType, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useApp } from '@/store/app'
import { cn } from '@/utils/cn'

type TileSize = 'featured' | 'core' | 'support' | 'micro'

interface BaseProps {
  title: string
  blurb?: string
  icon?: ComponentType<{ className?: string }>
  emoji?: string
  size?: TileSize
  accent?: boolean
  pendingTool?: string
  onClick?: () => void
  href?: string
  rightSlot?: ReactNode
  disabled?: boolean
  className?: string
  badge?: string
  iconBg?: string
  iconColor?: string
}

const sizeStyles: Record<TileSize, string> = {
  featured: 'rounded-2xl p-5 md:p-6 min-h-[200px]',
  core: 'rounded-xl p-4 md:p-5 min-h-[110px]',
  support: 'rounded-xl p-3.5 min-h-[88px]',
  micro: 'rounded-lg p-3 min-h-[64px]',
}

export function Tile({
  title,
  blurb,
  icon: Icon,
  emoji,
  size = 'core',
  accent,
  pendingTool,
  onClick,
  href,
  rightSlot,
  disabled,
  className,
  badge,
  iconBg,
  iconColor,
}: BaseProps) {
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
      return
    }
    if (href) router.push(href)
  }

  const isFeatured = size === 'featured'
  const isMicro = size === 'micro'

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      className={cn(
        'group relative flex flex-col items-start text-start w-full overflow-hidden',
        'transition-colors duration-150 clinical-press',
        'border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-who-blue)] focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white',
        sizeStyles[size],
        accent
          ? 'bg-[var(--color-who-blue)] text-white hover:bg-[var(--color-who-blue-hover)] border-[var(--color-who-blue)]'
          : 'bg-white text-[var(--color-who-ink)] hover:bg-[var(--color-who-canvas)] hover:border-[var(--color-who-ring-strong)] border-[var(--color-who-ring)]',
        className,
      )}
    >
      {isMicro ? (
        <div className="flex items-center gap-2.5 w-full">
          {(Icon || emoji) && (
            <span
              className={cn(
                'flex items-center justify-center shrink-0 size-8 rounded-md',
                !iconBg && 'bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)]',
              )}
              style={iconBg ? { backgroundColor: iconBg, color: iconColor } : undefined}
            >
              {Icon ? <Icon className="size-4" /> : <span className="text-base">{emoji}</span>}
            </span>
          )}
          <h3 className="text-[12.5px] md:text-[13px] font-semibold tracking-tight leading-tight text-[var(--color-who-ink)]">
            {title}
          </h3>
        </div>
      ) : (
        <>
          <div className="flex items-start gap-3 w-full">
            {(Icon || emoji) && (
              <span
                className={cn(
                  'flex items-center justify-center shrink-0',
                  isFeatured ? 'size-11 rounded-xl' : 'size-9 rounded-lg',
                  accent
                    ? 'bg-white/15 text-white'
                    : !iconBg && 'bg-[var(--color-who-tint)] text-[var(--color-who-blue-deep)]',
                )}
                style={!accent && iconBg ? { backgroundColor: iconBg, color: iconColor } : undefined}
              >
                {Icon ? <Icon className={isFeatured ? 'size-5' : 'size-4.5'} /> : (
                  <span className={isFeatured ? 'text-xl' : 'text-base'}>{emoji}</span>
                )}
              </span>
            )}
            {badge && (
              <span className="ms-auto inline-flex items-center rounded-full bg-[var(--color-who-tint)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-who-blue-deep)]">
                {badge}
              </span>
            )}
            {rightSlot && !badge && <div className="ms-auto">{rightSlot}</div>}
          </div>

          <div className={cn('mt-auto', isFeatured ? 'pt-4' : 'pt-2.5')}>
            <h3
              className={cn(
                'tracking-tight',
                isFeatured ? 'text-[22px] md:text-[26px] font-headline' : 'text-[15px] md:text-[16px] font-semibold',
              )}
            >
              {title}
            </h3>
            {blurb && (
              <p
                className={cn(
                  'mt-1 leading-snug',
                  isFeatured ? 'text-sm md:text-[14.5px] max-w-[44ch]' : 'text-[12px] md:text-[12.5px]',
                  accent ? 'text-white/85' : 'text-[var(--color-who-ink-soft)]',
                )}
              >
                {blurb}
              </p>
            )}
          </div>
        </>
      )}
    </button>
  )
}
