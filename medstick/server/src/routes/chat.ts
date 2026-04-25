import { Router } from 'express'
import { chatCompletion, type ChatBody, type ChatMessage } from '../llama.js'
import { rewriteImagesInMessages } from '../imageRewrite.js'
import { buildRagFromDocs } from '../rag.js'

export const chat = Router()

interface OneShotBody extends ChatBody {
  // Optional grounding — if present, the server runs RAG against these docs
  // and prepends the retrieved excerpts as a system message before forwarding
  // to llama. `query` defaults to the last user message's text content.
  doc_ids?: string[]
  query?: string
}

function lastUserText(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i]
    if (m.role !== 'user') continue
    if (typeof m.content === 'string') return m.content
    const text = m.content.find(p => p.type === 'text')?.text
    if (text) return text
  }
  return ''
}

chat.post('/chat', async (req, res, next) => {
  try {
    const body = req.body as OneShotBody
    let messages = body.messages

    // RAG: prepend retrieved excerpts if doc_ids were provided.
    if (body.doc_ids && body.doc_ids.length > 0) {
      const query = body.query?.trim() || lastUserText(messages)
      if (query) {
        const rag = await buildRagFromDocs(req.app.locals.db, body.doc_ids, query)
        if (rag) {
          // Merge RAG into the existing system message (or prepend a new one)
          // so we never end up with multiple consecutive system messages —
          // Gemma's chat template rejects that.
          if (messages[0]?.role === 'system') {
            messages = [
              { role: 'system', content: `${messages[0].content as string}\n\n${rag}` },
              ...messages.slice(1),
            ]
          } else {
            messages = [{ role: 'system', content: rag }, ...messages]
          }
        }
      }
    }

    messages = rewriteImagesInMessages(
      messages,
      req.app.locals.db,
      req.app.locals.PHOTOS_DIR,
    )
    const out = await chatCompletion({ ...body, messages })
    res.json(out)
  } catch (e) {
    next(e)
  }
})
