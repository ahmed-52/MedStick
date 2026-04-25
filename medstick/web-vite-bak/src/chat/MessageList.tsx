import { useEffect, useRef } from 'react'
import { MessageBubble } from './MessageBubble'
import type { UiMessage } from './useChat'
import { useI18n } from '../i18n/useI18n'

export function MessageList({ messages }: { messages: UiMessage[] }) {
  const { t } = useI18n()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    ref.current?.scrollTo({ top: ref.current.scrollHeight, behavior: 'smooth' })
  }, [messages.length, messages[messages.length - 1]?.content.length])

  return (
    <div
      ref={ref}
      className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-3 md:px-6 py-4"
    >
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-center px-6">
          <p className="text-stone-500 text-sm max-w-md">{t.chat.empty}</p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          {messages.map((m) => (
            <MessageBubble key={m.id} msg={m} />
          ))}
        </div>
      )}
    </div>
  )
}
