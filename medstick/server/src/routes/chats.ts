import { Router } from 'express'
import * as db from '../db.js'
import { chatCompletionStream, type ChatMessage } from '../llama.js'
import { rewriteImagesInMessages } from '../imageRewrite.js'

export const chats = Router()

chats.get('/chats', (req, res) => {
  const list = db.listChats(req.app.locals.db, {
    patient_id: (req.query.patient_id as string) || undefined,
  })
  res.json(list)
})

chats.post('/chats', (req, res) => {
  const c = db.createChat(req.app.locals.db, req.body?.patient_id ?? null)
  res.status(201).json(c)
})

chats.get('/chats/:id', (req, res) => {
  const c = db.getChat(req.app.locals.db, req.params.id)
  if (!c) return res.status(404).json({ error: 'not found' })
  res.json(c)
})

chats.get('/chats/:id/messages', (req, res) => {
  const list = db.listMessages(req.app.locals.db, req.params.id)
  res.json(list)
})

chats.post('/chats/:id/messages', async (req, res) => {
  const d = req.app.locals.db as db.DB
  const photosDir = req.app.locals.PHOTOS_DIR as string
  const chatId = req.params.id
  const c = db.getChat(d, chatId)
  if (!c) return res.status(404).json({ error: 'chat not found' })

  const { content, image_ids = [], system } = req.body as {
    content: string
    image_ids?: string[]
    system?: string
  }

  const userMsg = db.appendMessage(d, {
    chat_id: chatId,
    role: 'user',
    content,
    image_ids: image_ids.length > 0 ? JSON.stringify(image_ids) : null,
  })

  const history = db.listMessages(d, chatId)

  const llamaMessages: ChatMessage[] = []
  if (system) llamaMessages.push({ role: 'system', content: system })

  for (const m of history) {
    if (m.role === 'tool') continue
    let parts: ChatMessage['content']
    const imgIds: string[] = m.image_ids ? JSON.parse(m.image_ids) : []
    if (imgIds.length > 0) {
      parts = [
        { type: 'text', text: m.content },
        ...imgIds.map(id => ({
          type: 'image_url' as const,
          image_url: { url: `/api/photos/${id}` },
        })),
      ]
    } else {
      parts = m.content
    }
    llamaMessages.push({ role: m.role as any, content: parts })
  }

  const rewritten = rewriteImagesInMessages(llamaMessages, d, photosDir)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  ;(res as any).flushHeaders?.()

  res.write(`data: ${JSON.stringify({ user_message_id: userMsg.id })}\n\n`)

  const ac = new AbortController()
  req.on('close', () => ac.abort())

  try {
    const full = await chatCompletionStream(
      { messages: rewritten, max_tokens: 1024 },
      delta => res.write(`data: ${JSON.stringify({ delta })}\n\n`),
      ac.signal,
    )
    const asst = db.appendMessage(d, {
      chat_id: chatId,
      role: 'assistant',
      content: full,
    })
    res.write(`data: ${JSON.stringify({ done: true, message_id: asst.id })}\n\n`)
    res.end()
  } catch (err: any) {
    res.write(`data: ${JSON.stringify({ error: String(err?.message ?? err) })}\n\n`)
    res.end()
  }
})
