import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import * as db from './db.js'
import type { ChatMessage } from './llama.js'

const PHOTO_REF = /\/api\/photos\/([^?#"\s]+)/

export function rewriteImagesInMessages(
  messages: ChatMessage[],
  d: db.DB,
  photosDir: string,
): ChatMessage[] {
  return messages.map(m => {
    if (typeof m.content === 'string') return m
    return {
      ...m,
      content: m.content.map(part => {
        if (part.type !== 'image_url') return part
        const url = part.image_url.url
        if (url.startsWith('data:')) return part
        const match = url.match(PHOTO_REF)
        if (!match) return part
        const id = match[1]
        const photo = db.getPhoto(d, id)
        if (!photo) return part
        try {
          const bytes = readFileSync(join(photosDir, photo.filepath))
          const dataUrl = `data:${photo.mime};base64,${bytes.toString('base64')}`
          return { type: 'image_url', image_url: { url: dataUrl } }
        } catch {
          return part
        }
      }),
    }
  })
}
