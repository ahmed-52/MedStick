import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { UiMessage } from './useChat'
import { useI18n } from '../i18n/useI18n'

export function MessageBubble({ msg }: { msg: UiMessage }) {
  const { t } = useI18n()
  const isUser = msg.role === 'user'
  const isTool = msg.role === 'tool'

  if (isTool) {
    return (
      <div className="my-2 mx-auto max-w-2xl">
        {msg.card ? (
          msg.card
        ) : (
          <div className="px-3 py-2 rounded-lg bg-stone-100 text-xs text-stone-600 italic">
            {msg.content}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} my-2`}>
      <div
        className={`max-w-[85%] md:max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm ${
          isUser
            ? 'bg-brand-600 text-white rounded-ee-sm'
            : 'bg-white border border-stone-200 text-stone-900 rounded-es-sm'
        }`}
      >
        {msg.image_ids.length > 0 && (
          <div className="mb-2 grid grid-cols-2 gap-1">
            {msg.image_ids.map((id) => (
              <img
                key={id}
                src={`/api/photos/${id}`}
                alt=""
                className="rounded-lg w-full h-32 object-cover"
              />
            ))}
          </div>
        )}
        {msg.pending && !msg.content ? (
          <span className="italic text-stone-400">{t.chat.assistantThinking}</span>
        ) : isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <div className="prose prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-stone">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  )
}
