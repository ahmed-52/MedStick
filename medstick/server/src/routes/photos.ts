import { Router, type Request } from 'express'
import multer from 'multer'
import { randomUUID } from 'node:crypto'
import { extname, join } from 'node:path'
import { writeFileSync, readFileSync, existsSync } from 'node:fs'
import * as db from '../db.js'

const ALLOWED = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export function photosRouter(photosDir: string) {
  const r = Router()
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 12 * 1024 * 1024 }
  })

  r.post('/photos', upload.single('file'), (req: Request, res) => {
    if (!req.file) return res.status(400).json({ error: 'no file' })
    const ext = extname(req.file.originalname).toLowerCase()
    const safeExt = ALLOWED.has(ext) ? ext : '.jpg'
    const id = randomUUID()
    const filename = `${id}${safeExt}`
    const filepath = join(photosDir, filename)
    writeFileSync(filepath, req.file.buffer)
    const photo = db.createPhoto(req.app.locals.db, {
      patient_id: req.body.patient_id || null,
      encounter_id: req.body.encounter_id || null,
      filepath: filename,
      mime: req.file.mimetype,
      width: null,
      height: null,
      caption: null,
    })
    res.status(201).json(photo)
  })

  r.get('/photos/:id', (req, res) => {
    const photo = db.getPhoto(req.app.locals.db, req.params.id)
    if (!photo) return res.status(404).end()
    const abs = join(photosDir, photo.filepath)
    if (!existsSync(abs)) return res.status(404).end()
    res.type(photo.mime).send(readFileSync(abs))
  })

  return r
}
