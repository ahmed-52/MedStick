import { Router } from 'express'
import * as db from '../db.js'

export const encounters = Router()

encounters.get('/encounters', (req, res) => {
  const list = db.listEncounters(req.app.locals.db, {
    patient_id: (req.query.patient_id as string) || undefined,
  })
  res.json(list)
})

encounters.post('/encounters', (req, res) => {
  const e = db.createEncounter(req.app.locals.db, req.body)
  res.status(201).json(e)
})
