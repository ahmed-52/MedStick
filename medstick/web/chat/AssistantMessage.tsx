'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  RiAlertLine,
  RiArrowRightLine,
  RiSparkling2Line,
  RiTimeLine,
} from '@remixicon/react'
import { cn } from '@/utils/cn'

type Tone = 'neutral' | 'highlight' | 'warning' | 'action' | 'timing'

interface ClinicalSection {
  label: string
  tone: Tone
  body: string
}

// Recognized clinical section labels. The opening word is matched anywhere in
// the message, so labels can appear inline (e.g. "Plan: foo. Red flags: bar.")
// or on their own lines.
const SECTION_REGEX =
  /(\b(?:Assessment|Assesment|Impression|Diagnosis|Differential\s+diagnosis|Differentials?|DDx|Plan|Treatment|Management|Subjective|Objective|History|HPI|Findings|Vitals?|Red\s+flags?|Warning\s+signs?|Refer\s+urgently|Urgent|Alert|Follow[\s-]?up|Recheck|Next\s+steps?|Recommended\s+actions?|Immediate\s+steps?|Quick\s+steps?|Action)[^:\n]{0,40}):\s*/gi

function toneFor(label: string): Tone {
  const l = label.toLowerCase().trim()
  if (/(red\s+flags?|warning\s+signs?|refer\s+urgently|urgent|alert)/.test(l)) return 'warning'
  if (/(follow[\s-]?up|recheck)/.test(l)) return 'timing'
  if (/(next\s+steps?|recommended\s+action|immediate\s+steps?|quick\s+steps?|^action)/.test(l)) return 'action'
  if (/(assessment|assesment|impression|diagnosis|differential|ddx|plan|treatment|management)/.test(l)) {
    return 'highlight'
  }
  return 'neutral'
}

function parseSections(text: string): { preamble: string; sections: ClinicalSection[] } {
  const matches = [...text.matchAll(SECTION_REGEX)]
  if (matches.length === 0) return { preamble: text.trim(), sections: [] }

  const sections: ClinicalSection[] = []
  const firstStart = matches[0].index ?? 0
  const preamble = firstStart > 0 ? text.slice(0, firstStart).trim() : ''

  for (let i = 0; i < matches.length; i++) {
    const m = matches[i]
    const labelEnd = (m.index ?? 0) + m[0].length
    const nextStart = i + 1 < matches.length ? matches[i + 1].index ?? text.length : text.length
    const body = text.slice(labelEnd, nextStart).trim()
    sections.push({ label: m[1].trim(), tone: toneFor(m[1]), body })
  }
  return { preamble, sections }
}

// When a body is a stack of short, period-terminated sentences on their own
// lines, render as a bulleted list — easier to scan than a wall of prose.
function maybeBulletify(body: string): string {
  if (!body) return body
  const lines = body
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
  if (lines.length < 2) return body
  const looksLikeList = lines.every(
    (l) => l.length < 220 && !/^[-*•]\s/.test(l) && !l.includes('  '),
  )
  if (!looksLikeList) return body
  return lines.map((l) => `- ${l}`).join('\n')
}

const mdComponents: Components = {
  p: ({ children }) => <p className="my-1 leading-snug">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-bold text-[var(--color-who-navy)]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-1 list-disc space-y-1 ps-5 marker:text-[var(--color-who-blue)]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 list-decimal space-y-1 ps-5 marker:text-[var(--color-who-blue-deep)] marker:font-semibold">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="leading-snug">{children}</li>,
  code: ({ children, className }) => {
    if (className) {
      return (
        <pre className="my-2 overflow-x-auto rounded-lg bg-bg-weak-50 p-2 text-xs">
          <code className="font-mono">{children}</code>
        </pre>
      )
    }
    return (
      <code className="rounded bg-bg-weak-50 px-1 py-0.5 font-mono text-[12.5px]">
        {children}
      </code>
    )
  },
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-s-2 border-[var(--color-who-blue)] ps-3 italic text-text-sub-600">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => (
    <h1 className="mt-3 mb-1 text-[17px] font-bold text-[var(--color-who-navy)]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-2 mb-1 text-[15.5px] font-bold text-[var(--color-who-navy)]">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 mb-1 text-[14px] font-semibold text-[var(--color-who-navy)]">
      {children}
    </h3>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-[13px]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-stroke-soft-200 bg-bg-weak-50 px-2 py-1 text-start text-[10.5px] font-semibold uppercase tracking-wider text-text-soft-400">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-stroke-soft-200 px-2 py-1">{children}</td>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="text-[var(--color-who-blue-deep)] underline underline-offset-2 hover:text-[var(--color-who-blue)]"
    >
      {children}
    </a>
  ),
}

function Body({ text }: { text: string }) {
  if (!text.trim()) return null
  return (
    <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
      {maybeBulletify(text)}
    </ReactMarkdown>
  )
}

const TONE_STYLES: Record<
  Tone,
  {
    wrapper: string
    label: string
    icon: React.ComponentType<{ className?: string }> | null
  }
> = {
  neutral: {
    wrapper: '',
    label: 'text-text-soft-400',
    icon: null,
  },
  highlight: {
    wrapper: '',
    label: 'text-[var(--color-who-blue-deep)]',
    icon: RiSparkling2Line,
  },
  warning: {
    wrapper:
      'rounded-xl border border-[var(--color-who-err)]/25 bg-[var(--color-who-err)]/[0.06] px-3 py-2',
    label: 'text-[var(--color-who-err)]',
    icon: RiAlertLine,
  },
  action: {
    wrapper:
      'rounded-xl border border-[var(--color-who-ring)] bg-[var(--color-who-tint)]/50 px-3 py-2',
    label: 'text-[var(--color-who-blue-deep)]',
    icon: RiArrowRightLine,
  },
  timing: {
    wrapper:
      'rounded-xl border border-[var(--color-who-ring)] bg-[var(--color-who-canvas)] px-3 py-2',
    label: 'text-[var(--color-who-ink-soft)]',
    icon: RiTimeLine,
  },
}

function SectionView({ section }: { section: ClinicalSection }) {
  const tone = TONE_STYLES[section.tone]
  const Icon = tone.icon
  return (
    <div className={cn('py-0.5', tone.wrapper)}>
      <div
        className={cn(
          'mb-1 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider',
          tone.label,
        )}
      >
        {Icon && <Icon className="size-3.5" />}
        {section.label}
      </div>
      <div className="text-[14px] leading-5 lg:text-[15px] lg:leading-6 text-text-strong-950">
        <Body text={section.body} />
      </div>
    </div>
  )
}

export function AssistantMessage({ content }: { content: string }) {
  const { preamble, sections } = parseSections(content)

  if (sections.length === 0) {
    // Plain markdown — the model didn't use clinical labels.
    return (
      <div className="text-text-strong-950 px-1 text-[14px] leading-5 lg:text-[15px] lg:leading-6 tracking-spacing-tiny-2 lg:tracking-spacing-tiny-3">
        <Body text={content} />
      </div>
    )
  }

  return (
    <div className="px-1 text-text-strong-950 space-y-2.5 tracking-spacing-tiny-2 lg:tracking-spacing-tiny-3">
      {preamble && (
        <div className="text-[14px] leading-5 lg:text-[15px] lg:leading-6">
          <Body text={preamble} />
        </div>
      )}
      {sections.map((s, i) => (
        <SectionView key={i} section={s} />
      ))}
    </div>
  )
}
