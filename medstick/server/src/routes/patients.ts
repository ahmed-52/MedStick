import { Router } from 'express'
import * as db from '../db.js'

export const patients = Router()

patients.get('/patients', (req, res) => {
  const list = db.listPatients(req.app.locals.db, { q: (req.query.q as string) || undefined })
  res.json(list)
})

patients.post('/patients', (req, res) => {
  const p = db.createPatient(req.app.locals.db, req.body)
  res.status(201).json(p)
})

patients.get('/patients/:id', (req, res) => {
  const p = db.getPatient(req.app.locals.db, req.params.id)
  if (!p) return res.status(404).json({ error: 'not found' })
  res.json(p)
})

patients.patch('/patients/:id', (req, res) => {
  const p = db.updatePatient(req.app.locals.db, req.params.id, req.body)
  if (!p) return res.status(404).json({ error: 'not found' })
  res.json(p)
})

patients.delete('/patients/:id', (req, res) => {
  db.deletePatient(req.app.locals.db, req.params.id)
  res.status(204).end()
})
