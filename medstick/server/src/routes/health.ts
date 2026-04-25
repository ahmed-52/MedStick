import { Router } from 'express'
import { llamaPing } from '../llama.js'

export const health = Router()

health.get('/health', async (_req, res) => {
  const llama = await llamaPing()
  res.json({ ok: true, llama })
})
