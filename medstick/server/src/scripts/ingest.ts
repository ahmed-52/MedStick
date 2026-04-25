/**
 * One-shot CLI: extract a PDF, chunk it, persist to SQLite.
 *   npm --prefix server run ingest -- <path/to/file.pdf>
 *
 * Idempotent on SHA-256 of the file: a second run is a no-op. No embedder
 * required — retrieval at chat time uses keyword scoring against the chunk
 * text, so all we need to store is the text itself.
 */
import { resolve, basename } from 'node:path'
import { readFileSync, mkdirSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import * as db from '../db.js'

interface PageText {
  page: number
  text: string
}

interface RawChunk {
  page_start: number
  page_end: number
  heading: string | null
  text: string
}

const TARGET_CHARS = 2000 // ~500 tokens
const OVERLAP_CHARS = 320 // ~80 tokens

async function extractPdf(bytes: Buffer): Promise<PageText[]> {
  const data = new Uint8Array(bytes)
  const doc = await getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise

  const pages: PageText[] = []
  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()
    let lastY: number | null = null
    let buf = ''
    for (const item of content.items as Array<{ str: string; transform?: number[]; hasEOL?: boolean }>) {
      const y = item.transform?.[5] ?? null
      if (lastY != null && y != null && Math.abs(lastY - y) > 1 && buf && !buf.endsWith('\n')) {
        buf += '\n'
      }
      buf += item.str
      if (item.hasEOL) buf += '\n'
      lastY = y
    }
    pages.push({ page: i, text: buf.trim() })
  }
  await doc.destroy()
  return pages
}

function inferTitle(pages: PageText[], fallback: string): string {
  if (pages.length === 0) return fallback
  for (const line of pages[0].text.split('\n')) {
    const t = line.trim()
    if (t.length >= 5 && t.length <= 140) return t
  }
  return fallback
}

function isHeading(line: string): boolean {
  if (line.length < 3 || line.length > 100) return false
  if (/[.!?]\s*$/.test(line)) return false
  const letters = line.replace(/[^A-Za-z]/g, '')
  if (letters.length < 3) return false
  const upper = letters.replace(/[^A-Z]/g, '').length / letters.length
  if (upper > 0.6) return true
  // Title Case With ≥2 Capitalized Words
  const words = line.split(/\s+/).filter(w => /[A-Za-z]/.test(w))
  if (words.length >= 2 && words.length <= 12) {
    const cap = words.filter(w => /^[A-Z]/.test(w)).length
    if (cap / words.length > 0.7) return true
  }
  return false
}

function chunkPages(pages: PageText[]): RawChunk[] {
  const out: RawChunk[] = []
  let currentHeading: string | null = null
  let buf: { text: string; page: number }[] = []
  let bufChars = 0

  const flush = () => {
    if (buf.length === 0) return
    const text = buf.map(b => b.text).join(' ').replace(/\s+/g, ' ').trim()
    if (text.length < 30) {
      buf = []
      bufChars = 0
      return
    }
    out.push({
      page_start: buf[0].page,
      page_end: buf[buf.length - 1].page,
      heading: currentHeading,
      text,
    })
    // Keep tail for overlap
    const overlap: typeof buf = []
    let oc = 0
    for (let i = buf.length - 1; i >= 0 && oc < OVERLAP_CHARS; i--) {
      overlap.unshift(buf[i])
      oc += buf[i].text.length + 1
    }
    buf = overlap
    bufChars = oc
  }

  for (const p of pages) {
    const lines = p.text.split('\n')
    for (const raw of lines) {
      const line = raw.trim()
      if (!line) continue
      if (isHeading(line)) {
        flush()
        currentHeading = line
        continue
      }
      // Sentence-aware split. Lookbehind keeps the punctuation with the sentence.
      const sentences = line.split(/(?<=[.!?])\s+/)
      for (const s of sentences) {
        const sent = s.trim()
        if (!sent) continue
        buf.push({ text: sent, page: p.page })
        bufChars += sent.length + 1
        if (bufChars >= TARGET_CHARS) flush()
      }
    }
  }
  flush()
  return out
}

async function main() {
  const arg = process.argv[2]
  if (!arg) {
    console.error('usage: ingest <path/to/file.pdf>')
    process.exit(1)
  }
  const pdfPath = resolve(arg)
  const bytes = readFileSync(pdfPath)
  const hash = createHash('sha256').update(bytes).digest('hex')

  // Default to <repo>/data (one level up from server/), not the cwd's ./data.
  // npm --prefix server changes cwd, which would otherwise put the DB in
  // server/data/ and silently desync from the app's medstick/data/.
  const dataDir = resolve(
    process.env.DATA_DIR ?? new URL('../../../data', import.meta.url).pathname,
  )
  mkdirSync(dataDir, { recursive: true })
  console.log(`→ writing to ${dataDir}`)
  const d = db.openDb(resolve(dataDir, 'medstick.db'))

  const existing = db.findDocumentByHash(d, hash)
  if (existing) {
    console.log(`already ingested as "${existing.title}" (${existing.id}, ${existing.page_count} pages)`)
    return
  }

  console.log(`→ extracting ${basename(pdfPath)}…`)
  const pages = await extractPdf(bytes)
  if (pages.length === 0) {
    console.error('ERROR: no pages extracted (scanned PDF? OCR not supported)')
    process.exit(1)
  }
  const title = inferTitle(pages, basename(pdfPath))

  console.log(`→ chunking ${pages.length} pages…`)
  const chunks = chunkPages(pages)
  if (chunks.length === 0) {
    console.error('ERROR: no chunks produced (empty / image-only PDF?)')
    process.exit(1)
  }

  const doc = db.insertDocument(d, {
    title,
    source_path: pdfPath,
    pdf_hash: hash,
    page_count: pages.length,
    lang: 'en',
  })
  // `vec` is kept on the schema but unused — retrieval is keyword-based.
  // Empty buffer satisfies the NOT NULL constraint without any embed cost.
  const emptyVec = Buffer.alloc(0)
  db.insertChunks(
    d,
    chunks.map((c, i) => ({
      document_id: doc.id,
      ord: i,
      page_start: c.page_start,
      page_end: c.page_end,
      heading: c.heading,
      text: c.text,
      vec: emptyVec,
    })),
  )
  console.log(`✓ ingested "${title}" — ${pages.length} pages, ${chunks.length} chunks`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
