import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as db from './db.js'
import { logger } from './logger.js'

const __dirname = dirname(fileURLToPath(import.meta.url))

interface SeedItem {
  topic: string
  content_en: string
  content_ar: string
  source: string
}

export function seedProtocolsIfEmpty(d: db.DB) {
  if (db.countProtocols(d) > 0) return
  const path = join(__dirname, '..', '..', 'seed', 'protocols.json')
  let items: SeedItem[]
  try {
    items = JSON.parse(readFileSync(path, 'utf-8'))
  } catch (err) {
    logger.warn({ err, path }, 'no protocol seed file')
    return
  }
  for (const it of items) {
    db.insertProtocol(d, { lang: 'en', topic: it.topic, content: it.content_en, source: it.source })
    db.insertProtocol(d, { lang: 'ar', topic: it.topic, content: it.content_ar, source: it.source })
  }
  logger.info({ count: items.length }, 'seeded protocols')
}
