/**
 * One-shot CLI: collapse a document's raw chunks into dense clinical bullets,
 * then atomically replace them in the DB. Re-runnable safely.
 *
 *   npm --prefix server run summarize             # finds the cholera doc
 *   npm --prefix server run summarize -- <docId>  # explicit
 *
 * Why: the WHO field manual is 148 pages of mostly admin prose. The model
 * doesn't need to read 184 verbose chunks every turn — a few dozen tight
 * bullets keyed by section heading retrieve cleaner and grade better in
 * context.
 */
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import * as db from '../db.js'
import { chatCompletion } from '../llama.js'

const BATCH_CHARS = 9000      // ~2.2k tokens of input → fits comfortably in 4k ctx
const MAX_TOKENS = 380        // ~1500 chars of bullets out per batch

const SYSTEM_PROMPT = `You compress WHO clinical text into dense, factual bullet points for downstream RAG retrieval.

Rules:
- Output 4-8 bullets max, one per line, each starting with "- ".
- Preserve EXACTLY: drug names, doses (mg/kg, ml/kg), thresholds, age cutoffs, time windows, decision criteria, contraindications.
- Drop: acknowledgments, references, footnotes, generic advice, repetition, page numbers, citations.
- If the input is purely administrative (TOC, foreword, acknowledgments, glossary), output exactly: SKIP
- No preamble, no commentary, no headings — just bullets or SKIP.`

interface Group {
  heading: string | null
  page_start: number | null
  page_end: number | null
  text: string
}

function groupChunksByHeading(chunks: db.DocumentChunk[]): Group[] {
  const groups: Group[] = []
  for (const c of chunks) {
    const last = groups[groups.length - 1]
    if (last && last.heading === c.heading) {
      last.text += '\n\n' + c.text
      last.page_end = c.page_end ?? last.page_end
    } else {
      groups.push({
        heading: c.heading,
        page_start: c.page_start,
        page_end: c.page_end,
        text: c.text,
      })
    }
  }
  return groups
}

function splitForBatch(text: string, max: number): string[] {
  if (text.length <= max) return [text]
  const out: string[] = []
  // Split on paragraph boundaries first; fall back to hard cuts.
  const paragraphs = text.split(/\n\n+/)
  let buf = ''
  for (const p of paragraphs) {
    if (p.length > max) {
      if (buf) { out.push(buf); buf = '' }
      for (let i = 0; i < p.length; i += max) out.push(p.slice(i, i + max))
      continue
    }
    if (buf.length + p.length + 2 > max) {
      out.push(buf)
      buf = p
    } else {
      buf = buf ? `${buf}\n\n${p}` : p
    }
  }
  if (buf) out.push(buf)
  return out
}

async function summarizeBatch(input: string): Promise<string> {
  const r = await chatCompletion({
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: input },
    ],
    max_tokens: MAX_TOKENS,
    temperature: 0.1,
  })
  return (r.choices?.[0]?.message?.content ?? '').trim()
}

function looksLikeSkip(s: string): boolean {
  const t = s.trim().toUpperCase()
  return t === 'SKIP' || t.startsWith('SKIP\n') || t === '' || t === '-' || t === '- SKIP'
}

async function main() {
  const dataDir = resolve(
    process.env.DATA_DIR ?? new URL('../../../data', import.meta.url).pathname,
  )
  const d = db.openDb(resolve(dataDir, 'medstick.db'))

  const arg = process.argv[2]
  let doc: db.Document | null = null
  if (arg) {
    doc = db.getDocument(d, arg)
    if (!doc) {
      console.error(`ERROR: no document with id ${arg}`)
      process.exit(1)
    }
  } else {
    const all = db.listDocuments(d)
    doc = all.find((x) => /chol(e|é)ra/i.test(x.title)) ?? null
    if (!doc) {
      console.error('ERROR: no cholera document found. Pass an id explicitly: npm --prefix server run summarize -- <docId>')
      process.exit(1)
    }
  }

  const chunks = db.listChunksForDocs(d, [doc.id])
  if (chunks.length === 0) {
    console.error(`ERROR: document "${doc.title}" has no chunks`)
    process.exit(1)
  }

  console.log(`→ summarizing "${doc.title}" — ${chunks.length} chunks across ${doc.page_count} pages`)
  const groups = groupChunksByHeading(chunks)
  console.log(`→ ${groups.length} heading groups`)

  const newChunks: db.ChunkInput[] = []
  let totalBatches = 0
  let kept = 0
  let skipped = 0
  let ord = 0

  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi]
    const batches = splitForBatch(g.text, BATCH_CHARS)
    const headingLabel = g.heading ? `"${g.heading.slice(0, 50)}"` : '(no heading)'
    process.stdout.write(`  [${gi + 1}/${groups.length}] ${headingLabel} · ${batches.length} batch(es) · `)
    const sectionBullets: string[] = []
    for (const batch of batches) {
      totalBatches++
      try {
        const summary = await summarizeBatch(batch)
        if (looksLikeSkip(summary)) {
          skipped++
          process.stdout.write('·')
          continue
        }
        kept++
        sectionBullets.push(summary)
        process.stdout.write('✓')
      } catch (err) {
        console.warn(`\n    batch failed: ${String((err as Error).message)}`)
      }
    }
    process.stdout.write('\n')
    if (sectionBullets.length > 0) {
      const joined = sectionBullets.join('\n')
      newChunks.push({
        document_id: doc.id,
        ord: ord++,
        page_start: g.page_start,
        page_end: g.page_end,
        heading: g.heading,
        text: joined,
        vec: Buffer.alloc(0),
      })
    }
  }

  if (newChunks.length === 0) {
    console.error('ERROR: nothing to write — every batch was skipped or failed')
    process.exit(1)
  }

  // Atomic swap: drop old chunks, insert new ones.
  const tx = d.transaction(() => {
    d.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(doc!.id)
    const stmt = d.prepare(`INSERT INTO document_chunks
      (id, document_id, ord, page_start, page_end, heading, text, vec, created_at)
      VALUES (@id, @document_id, @ord, @page_start, @page_end, @heading, @text, @vec, @created_at)`)
    const created_at = new Date().toISOString()
    for (const c of newChunks) {
      stmt.run({ id: randomUUID(), created_at, ...c })
    }
  })
  tx()

  const beforeChars = chunks.reduce((a, c) => a + c.text.length, 0)
  const afterChars = newChunks.reduce((a, c) => a + c.text.length, 0)
  const ratio = ((afterChars / beforeChars) * 100).toFixed(1)
  console.log(`\n✓ "${doc.title}"`)
  console.log(`  batches: ${totalBatches} (${kept} kept, ${skipped} skipped as admin)`)
  console.log(`  chunks: ${chunks.length} → ${newChunks.length}`)
  console.log(`  text:   ${beforeChars.toLocaleString()} → ${afterChars.toLocaleString()} chars (${ratio}%)`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
