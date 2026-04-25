import { useCallback, useEffect, useRef, useState } from 'react'
import { useApp } from '../store/app'
import { api } from '../lib/api'
import type { Message } from '../lib/types'
import type { ToolMessage } from './ToolRegistry'

export interface UiMessage {
  id: string
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string
  image_ids: string[]
  card?: React.ReactNode
  pending?: boolean
}

function fromDb(m: Message): UiMessage {
  return {
    id: m.id,
    role: m.role,
    content: m.content,
    image_ids: m.image_ids ? JSON.parse(m.image_ids) : [],
  }
}

export function useChat() {
  const activePatientId = useApp((s) => s.activePatientId)
  const activeChatId = useApp((s) => s.activeChatId)
  const setActiveChat = useApp((s) => s.setActiveChat)
  const stagedPhotoIds = useApp((s) => s.stagedPhotoIds)
  const clearStaged = useApp((s) => s.clearStagedPhotos)

  const [messages, setMessages] = useState<UiMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const idCounter = useRef(0)
  const tempId = () => `tmp-${++idCounter.current}`

  // Load messages whenever active chat changes
  useEffect(() => {
    let cancel = false
    const load = async () => {
      if (!activeChatId) {
        setMessages([])
        return
      }
      try {
        const ms = await api.getMessages(activeChatId)
        if (!cancel) setMessages(ms.map(fromDb))
      } catch {
        if (!cancel) setMessages([])
      }
    }
    load()
    return () => {
      cancel = true
    }
  }, [activeChatId])

  const ensureChat = useCallback(async (): Promise<string> => {
    if (activeChatId) return activeChatId
    const c = await api.createChat(activePatientId)
    setActiveChat(c.id)
    return c.id
  }, [activeChatId, activePatientId, setActiveChat])

  const send = useCallback(
    async (content: string) => {
      const text = content.trim()
      const imageIds = [...stagedPhotoIds]
      if (!text && imageIds.length === 0) return

      const chatId = await ensureChat()
      clearStaged()

      const userTmpId = tempId()
      const asstTmpId = tempId()
      setMessages((m) => [
        ...m,
        { id: userTmpId, role: 'user', content: text, image_ids: imageIds },
        { id: asstTmpId, role: 'assistant', content: '', image_ids: [], pending: true },
      ])
      setStreaming(true)

      try {
        await api.streamChatMessage(
          chatId,
          { content: text, image_ids: imageIds },
          (delta) => {
            setMessages((m) =>
              m.map((x) =>
                x.id === asstTmpId ? { ...x, content: x.content + delta, pending: false } : x,
              ),
            )
          },
          (info) => {
            if (info.error) {
              setMessages((m) =>
                m.map((x) =>
                  x.id === asstTmpId
                    ? { ...x, content: `⚠ ${info.error}`, pending: false }
                    : x,
                ),
              )
            }
          },
        )
      } catch (err: any) {
        setMessages((m) =>
          m.map((x) =>
            x.id === asstTmpId
              ? { ...x, content: `⚠ ${String(err?.message ?? err)}`, pending: false }
              : x,
          ),
        )
      } finally {
        setStreaming(false)
      }
    },
    [ensureChat, stagedPhotoIds, clearStaged],
  )

  const appendInline = useCallback((msg: ToolMessage) => {
    setMessages((m) => [
      ...m,
      {
        id: tempId(),
        role: msg.role,
        content: msg.content,
        image_ids: msg.image_ids ?? [],
        card: msg.card,
      },
    ])
  }, [])

  const reset = useCallback(() => {
    setActiveChat(null)
    setMessages([])
  }, [setActiveChat])

  return { messages, send, streaming, appendInline, reset }
}
