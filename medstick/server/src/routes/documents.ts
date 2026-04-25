import { Router } from 'express'
import * as db from '../db.js'

export const documents = Router()

documents.get('/documents', (req, res) => {
  res.json(db.listDocuments(req.app.locals.db))
})

documents.delete('/documents/:id', (req, res) => {
  db.deleteDocument(req.app.locals.db, req.params.id)
  res.status(204).end()
})

documents.get('/chats/:id/documents', (req, res) => {
  res.json(db.listAttachedDocsForChat(req.app.locals.db, req.params.id))
})

documents.post('/chats/:id/documents', (req, res) => {
  const { document_id } = (req.body ?? {}) as { document_id?: string }
  if (!document_id) return res.status(400).json({ error: 'document_id required' })
  const d = req.app.locals.db as db.DB
  if (!db.getChat(d, req.params.id)) return res.status(404).json({ error: 'chat not found' })
  if (!db.getDocument(d, document_id)) return res.status(404).json({ error: 'document not found' })
  db.attachDocToChat(d, req.params.id, document_id)
  res.json(db.listAttachedDocsForChat(d, req.params.id))
})

documents.delete('/chats/:id/documents/:docId', (req, res) => {
  db.detachDocFromChat(req.app.locals.db, req.params.id, req.params.docId)
  res.status(204).end()
})
