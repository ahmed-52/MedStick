'use client'

import type { UiMessage } from './useChat'
import { AssistantMessage } from './AssistantMessage'

export function MessageBubble({ msg }: { msg: UiMessage }) {
  const isUser = msg.role === 'user'
  const isTool = msg.role === 'tool'

  if (isTool) {
    return (
      <div className="my-2 mx-auto w-full max-w-2xl">
        {msg.card ? (
          msg.card
        ) : (
          <div className="bg-bg-weak-50 text-text-sub-600 rounded-2xl px-3 py-2 text-xs italic">
            {msg.content}
          </div>
        )}
      </div>
    )
  }

  if (isUser) {
    return (
      <div className="flex flex-col items-end gap-1.5">
        {msg.image_ids.length > 0 && (
          <div className="flex flex-wrap justify-end gap-1.5">
            {msg.image_ids.map((id) => (
              <img
                key={id}
                src={`/api/photos/${id}`}
                alt=""
                className="rounded-2xl max-h-40 max-w-[148px] object-cover"
              />
            ))}
          </div>
        )}
        <div className="bg-bg-soft-200 max-w-md rounded-[14px] rounded-br-[8px] px-3.5 py-2.5">
          <div className="text-text-strong-950 text-[14px] leading-5 whitespace-pre-wrap lg:text-[15px] lg:leading-6 tracking-spacing-tiny-2 lg:tracking-spacing-tiny-3">
            {msg.content}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start">
      <div className="flex-1 space-y-2">
        {msg.pending && !msg.content ? (
          <div className="text-text-soft-400 italic px-1 text-[14px]">Thinking…</div>
        ) : (
          <AssistantMessage content={msg.content} />
        )}
      </div>
    </div>
  )
}
