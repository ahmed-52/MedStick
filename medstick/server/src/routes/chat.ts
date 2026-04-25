import { Router } from 'express'
import { chatCompletion, type ChatBody } from '../llama.js'
import { rewriteImagesInMessages } from '../imageRewrite.js'

export const chat = Router()

chat.post('/chat', async (req, res, next) => {
  try {
    const body = req.body as ChatBody
    const messages = rewriteImagesInMessages(
      body.messages,
      req.app.locals.db,
      req.app.locals.PHOTOS_DIR,
    )
    const out = await chatCompletion({ ...body, messages })
    res.json(out)
  } catch (e) {
    next(e)
  }
})
