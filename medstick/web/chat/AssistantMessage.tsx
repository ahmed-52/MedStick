'use client'

import ReactMarkdown, { type Components } from 'react-markdown'
import remarkGfm from 'remark-gfm'

const mdComponents: Components = {
  p: ({ children }) => <p className="my-1 leading-snug">{children}</p>,
  strong: ({ children }) => (
    <strong className="font-semibold text-[var(--color-who-ink)]">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => (
    <ul className="my-1 list-disc space-y-1 ps-5 marker:text-[var(--color-who-ink-mute)]">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-1 list-decimal space-y-1 ps-5 marker:text-[var(--color-who-ink-soft)]">
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
    <blockquote className="my-2 border-s-2 border-stroke-soft-200 ps-3 italic text-text-sub-600">
      {children}
    </blockquote>
  ),
  h1: ({ children }) => (
    <h1 className="mt-3 mb-1 text-[16px] font-semibold text-[var(--color-who-ink)]">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-2 mb-1 text-[15px] font-semibold text-[var(--color-who-ink)]">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-2 mb-1 text-[14px] font-semibold text-[var(--color-who-ink)]">
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

export function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="text-text-strong-950 px-1 text-[14px] leading-5 lg:text-[15px] lg:leading-6 tracking-spacing-tiny-2 lg:tracking-spacing-tiny-3">
      <ReactMarkdown components={mdComponents} remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
