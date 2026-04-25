import express, { type ErrorRequestHandler } from 'express'
import helmet from 'helmet'
import { mkdirSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { openDb } from './db.js'
import { logger } from './logger.js'
import { seedProtocolsIfEmpty } from './seed.js'
import { health } from './routes/health.js'
import { patients } from './routes/patients.js'
import { photosRouter } from './routes/photos.js'
import { encounters } from './routes/encounters.js'
import { protocols } from './routes/protocols.js'
import { chats } from './routes/chats.js'
import { chat } from './routes/chat.js'
import { documents } from './routes/documents.js'

const PORT = Number(process.env.PORT ?? 3000)
// Default to <repo>/data, not the cwd's ./data — npm --prefix server changes
// cwd to server/ and would otherwise put the DB in server/data, silently
// desyncing from ingest scripts and start.sh.
const DATA_DIR = resolve(
  process.env.DATA_DIR ?? new URL('../../data', import.meta.url).pathname,
)
const PHOTOS_DIR = resolve(DATA_DIR, 'photos')
const WEB_DIR = resolve(process.env.WEB_DIR ?? '../web/dist')

mkdirSync(DATA_DIR, { recursive: true })
mkdirSync(PHOTOS_DIR, { recursive: true })

const db = openDb(resolve(DATA_DIR, 'medstick.db'))
seedProtocolsIfEmpty(db)

const app = express()
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }))
app.use(express.json({ limit: '12mb' }))
app.locals.db = db
app.locals.PHOTOS_DIR = PHOTOS_DIR

app.use('/api', health)
app.use('/api', patients)
app.use('/api', photosRouter(PHOTOS_DIR))
app.use('/api', encounters)
app.use('/api', protocols)
app.use('/api', chats)
app.use('/api', chat)
app.use('/api', documents)

if (existsSync(WEB_DIR)) {
  // `extensions: ['html']` lets Next.js's static export resolve /patients
  // to patients.html, /library to library.html, etc.
  app.use(express.static(WEB_DIR, { extensions: ['html'] }))
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(resolve(WEB_DIR, 'index.html'))
  })
} else {
  logger.warn({ WEB_DIR }, 'web build not found — serving API only')
}

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  logger.error({ err }, 'unhandled')
  res.status(500).json({ error: err.message ?? 'internal error' })
}
app.use(errorHandler)

app.listen(PORT, () => logger.info({ port: PORT, db: DATA_DIR }, 'medstick server listening'))
