'use client'
import type { ReactNode } from 'react'
import { RiArrowRightLine, RiAlertLine, RiSparkling2Line } from '@remixicon/react'
import { getToolStyle } from '../toolStyles'
import { cn } from '@/utils/cn'

interface Props {
  title: string
  emoji?: string
  toolId?: string
  children?: ReactNode
  imageIds?: string[]
  pending?: boolean
  error?: string
}

export function SpecialtyCard({
  title,
  emoji,
  toolId,
  children,
  imageIds = [],
  pending,
  error,
}: Props) {
  const style = toolId ? getToolStyle(toolId) : null
  const Icon = style?.icon

  return (
    <div className="rounded-2xl border border-stroke-soft-200 bg-bg-white-0 shadow-regular-xs overflow-hidden">
      <div
        className="flex items-center gap-2.5 px-4 py-3"
        style={style ? { backgroundColor: style.bg } : undefined}
      >
        {Icon ? (
          <span
            className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-white/70 shadow-sm"
            style={{ color: style!.fg }}
          >
            <Icon className="size-4.5" />
          </span>
        ) : emoji ? (
          <span className="text-base">{emoji}</span>
        ) : null}
        <div className="flex-1 min-w-0">
          <div
            className="text-[10px] font-bold uppercase tracking-wider"
            style={style ? { color: style.fg } : undefined}
          >
            AI mode
          </div>
          <div className="text-text-strong-950 text-[14px] font-semibold leading-tight truncate">
            {title}
          </div>
        </div>
        {pending && (
          <span
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-white/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={style ? { color: style.fg } : { color: '#475569' }}
          >
            <span className="size-1.5 rounded-full animate-pulse" style={{ backgroundColor: style?.fg ?? '#475569' }} />
            Analyzing
          </span>
        )}
      </div>

      {imageIds.length > 0 && (
        <div className={cn(
          'grid gap-1 p-2 bg-bg-weak-50/40',
          imageIds.length === 1 ? 'grid-cols-1' : 'grid-cols-2',
        )}>
          {imageIds.map((id) => (
            <img
              key={id}
              src={`/api/photos/${id}`}
              alt=""
              className="rounded-lg w-full h-36 object-cover border border-stroke-soft-200"
            />
          ))}
        </div>
      )}

      <div className="p-4 text-text-strong-950 text-sm space-y-3">
        {error ? (
          <div className="flex items-start gap-2 rounded-xl bg-error-lighter p-3 text-error-dark">
            <RiAlertLine className="size-4 shrink-0 mt-0.5" />
            <div className="text-[13px] leading-snug">{error}</div>
          </div>
        ) : pending ? (
          <SkeletonContent />
        ) : (
          children
        )}
      </div>
    </div>
  )
}

function SkeletonContent() {
  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="h-2.5 w-20 rounded bg-bg-soft-200 animate-pulse" />
        <div className="h-3 w-full rounded bg-bg-weak-50 animate-pulse" />
        <div className="h-3 w-11/12 rounded bg-bg-weak-50 animate-pulse" />
        <div className="h-3 w-3/4 rounded bg-bg-weak-50 animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 w-24 rounded bg-bg-soft-200 animate-pulse" />
        <div className="h-3 w-full rounded bg-bg-weak-50 animate-pulse" />
        <div className="h-3 w-5/6 rounded bg-bg-weak-50 animate-pulse" />
      </div>
      <div className="space-y-1.5">
        <div className="h-2.5 w-16 rounded bg-bg-soft-200 animate-pulse" />
        <div className="h-3 w-2/3 rounded bg-bg-weak-50 animate-pulse" />
      </div>
    </div>
  )
}

export function Section({
  label,
  body,
  variant = 'default',
}: {
  label: string
  body: string
  variant?: 'default' | 'action' | 'highlight'
}) {
  if (!body.trim()) return null

  if (variant === 'action') {
    return (
      <div className="rounded-xl border border-[var(--color-who-ring)] bg-[var(--color-who-tint)]/40 p-3">
        <div className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-who-blue-deep)]">
          <RiArrowRightLine className="size-3.5" />
          {label}
        </div>
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-text-strong-950">
          {body}
        </p>
      </div>
    )
  }

  if (variant === 'highlight') {
    return (
      <div>
        <div className="mb-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--color-who-blue-deep)]">
          <RiSparkling2Line className="size-3.5" />
          {label}
        </div>
        <p className="whitespace-pre-wrap text-[13.5px] leading-relaxed text-text-strong-950">
          {body}
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="text-text-soft-400 text-[10px] uppercase tracking-wider font-semibold mb-1">
        {label}
      </div>
      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-text-strong-950">
        {body}
      </p>
    </div>
  )
}
