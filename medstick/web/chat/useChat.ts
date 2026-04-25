'use client'

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
  const bumpChatList = useApp((s) => s.bumpChatList)
  const setActiveDocs = useApp((s) => s.setActiveDocs)

  const [messages, setMessages] = useState<UiMessage[]>([])
  const [streaming, setStreaming] = useState(false)
  const idCounter = useRef(0)
  const tempId = () => `tmp-${++idCounter.current}`
  const justCreatedChatRef = useRef<string | null>(null)

  useEffect(() => {
    let cancel = false
    const load = async () => {
      if (!activeChatId) {
        setMessages([])
        setActiveDocs([])
        return
      }
      // Always refresh attached docs — even when we just created the chat,
      // since the user could have attached one before the first send.
      try {
        const docs = await api.getChatDocuments(activeChatId)
        if (!cancel) setActiveDocs(docs)
      } catch {
        if (!cancel) setActiveDocs([])
      }
      // Skip refetch when we just created this chat ourselves — the optimistic
      // user message and streaming assistant are already in `messages` and
      // the server-side row isn't fully populated yet, so re-loading would
      // race and wipe the in-flight stream.
      if (justCreatedChatRef.current === activeChatId) {
        justCreatedChatRef.current = null
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
  }, [activeChatId, setActiveDocs])

  const ensureChat = useCallback(async (): Promise<string> => {
    if (activeChatId) return activeChatId
    const c = await api.createChat(activePatientId)
    justCreatedChatRef.current = c.id
    setActiveChat(c.id)
    bumpChatList()
    return c.id
  }, [activeChatId, activePatientId, setActiveChat, bumpChatList])

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
        bumpChatList()
      }
    },
    [ensureChat, stagedPhotoIds, clearStaged, bumpChatList],
  )

  // Auto-fire any prompt seeded from elsewhere (e.g. the home AI card).
  // Runs once on mount.
  const bootstrappedRef = useRef(false)
  useEffect(() => {
    if (bootstrappedRef.current) return
    bootstrappedRef.current = true
    const pending = useApp.getState().pendingPrompt
    if (pending && pending.trim()) {
      useApp.getState().setPendingPrompt(null)
      void send(pending)
    }
  }, [send])

  const appendInline = useCallback((msg: ToolMessage): string => {
    const id = tempId()
    setMessages((m) => [
      ...m,
      {
        id,
        role: msg.role,
        content: msg.content,
        image_ids: msg.image_ids ?? [],
        card: msg.card,
      },
    ])
    return id
  }, [])

  const replaceInline = useCallback((id: string, msg: ToolMessage) => {
    setMessages((m) =>
      m.map((x) =>
        x.id === id
          ? {
              ...x,
              role: msg.role,
              content: msg.content,
              image_ids: msg.image_ids ?? [],
              card: msg.card,
            }
          : x,
      ),
    )
  }, [])

  const reset = useCallback(() => {
    setActiveChat(null)
    setMessages([])
    clearStaged()
    setActiveDocs([])
  }, [setActiveChat, clearStaged, setActiveDocs])

  const deleteCurrent = useCallback(async () => {
    if (!activeChatId) {
      reset()
      return
    }
    try {
      await api.deleteChat(activeChatId)
    } catch {}
    reset()
    bumpChatList()
  }, [activeChatId, reset, bumpChatList])

  return { messages, send, streaming, appendInline, replaceInline, reset, deleteCurrent, activeChatId }
}
