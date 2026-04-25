import { Router } from 'express'
import * as db from '../db.js'

export const protocols = Router()

protocols.get('/protocols/search', (req, res) => {
  const q = String(req.query.q ?? '').trim()
  const lang = (req.query.lang === 'ar' ? 'ar' : 'en') as 'en' | 'ar'
  if (!q) return res.json([])
  const results = db.searchProtocols(req.app.locals.db, q, lang, 5)
  res.json(results)
})

protocols.get('/protocols', (req, res) => {
  const lang = (req.query.lang === 'ar' ? 'ar' : 'en') as 'en' | 'ar'
  const list = (req.app.locals.db.prepare('SELECT * FROM protocols WHERE lang = ? ORDER BY topic').all(lang)) as any[]
  res.json(list)
})
