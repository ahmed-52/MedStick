import { Router } from 'express'
import * as db from '../db.js'
import { chatCompletionStream, type ChatMessage } from '../llama.js'
import { rewriteImagesInMessages } from '../imageRewrite.js'
import { buildRagSystemMessage } from '../rag.js'
import { buildClinicalSystem } from '../systemPrompt.js'

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

chats.delete('/chats/:id', (req, res) => {
  const d = req.app.locals.db as db.DB
  d.prepare('DELETE FROM chats WHERE id = ?').run(req.params.id)
  res.status(204).end()
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

  // 1) MedStick clinical persona (patient context + matched WHO IMCI summaries).
  const clinical = buildClinicalSystem(d, { chatId, userText: content })
  llamaMessages.push({ role: 'system', content: clinical.base })

  // 2) Contextual safety trigger — only present when the user's message actually
  //    mentions a contraindicated drug/scenario. Kept as a separate message so
  //    the model can't echo a generic "PROACTIVE SAFETY TRIGGERS" header.
  if (clinical.trigger) {
    llamaMessages.push({ role: 'system', content: clinical.trigger })
  }

  // 3) Tool-specific system override (specialty modes pass their own).
  if (system) llamaMessages.push({ role: 'system', content: system })

  // 4) RAG excerpts from attached PDFs, if any.
  const ragSystem = await buildRagSystemMessage(d, chatId, content)
  if (ragSystem) llamaMessages.push({ role: 'system', content: ragSystem })

  // Build messages, collapsing any consecutive same-role messages so Gemma's
  // chat template (which requires strict user/assistant alternation) doesn't
  // throw. This handles cases where past streaming runs failed and only
  // user messages got persisted.
  for (const m of history) {
    if (m.role === 'tool' || m.role === 'system') continue
    const imgIds: string[] = m.image_ids ? JSON.parse(m.image_ids) : []
    let parts: ChatMessage['content']
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

    const prev = llamaMessages[llamaMessages.length - 1]
    if (prev && prev.role === m.role) {
      // merge into previous message of same role
      const prevText =
        typeof prev.content === 'string'
          ? prev.content
          : prev.content.find(p => p.type === 'text')?.text ?? ''
      const newText =
        typeof parts === 'string'
          ? parts
          : parts.find(p => p.type === 'text')?.text ?? ''
      const mergedText = `${prevText}\n\n${newText}`.trim()

      const prevImages =
        typeof prev.content === 'string'
          ? []
          : prev.content.filter(p => p.type === 'image_url')
      const newImages =
        typeof parts === 'string'
          ? []
          : parts.filter(p => p.type === 'image_url')
      const allImages = [...prevImages, ...newImages]

      prev.content = allImages.length > 0
        ? [{ type: 'text', text: mergedText }, ...allImages]
        : mergedText
    } else {
      llamaMessages.push({ role: m.role as any, content: parts })
    }
  }

  const rewritten = rewriteImagesInMessages(llamaMessages, d, photosDir)

  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  ;(res as any).flushHeaders?.()

  res.write(`data: ${JSON.stringify({ user_message_id: userMsg.id })}\n\n`)

  const ac = new AbortController()
  // `res.on('close')` fires when the client actually disconnects;
  // `req.on('close')` in modern Node fires when the request body finishes parsing,
  // which would abort the upstream LLM call immediately.
  res.on('close', () => {
    if (!res.writableEnded) ac.abort()
  })

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
