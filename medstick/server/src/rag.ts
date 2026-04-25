import * as db from './db.js'
import { logger } from './logger.js'

const TOP_K = 4

// Cheap keyword scorer. No embeddings, no second server, no model files —
// just token overlap on chunk text + heading. Good enough for the demo and
// has zero ops cost. We can layer real vectors back on later if needed.
function normalize(s: string): string {
  return s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim()
}

const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'have',
  'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'should', 'that',
  'the', 'this', 'to', 'was', 'we', 'what', 'when', 'where', 'which', 'who',
  'why', 'with', 'you', 'your', 'do', 'does', 'can', 'could', 'would', 'will',
  'about', 'any', 'some', 'just', 'one',
])

function tokens(s: string): string[] {
  return normalize(s).split(' ').filter(t => t.length >= 2 && !STOPWORDS.has(t))
}

function scoreChunk(qTokens: string[], chunkText: string, heading: string | null): number {
  if (qTokens.length === 0) return 0
  const hay = normalize(`${heading ?? ''} ${chunkText}`)
  let score = 0
  for (const t of qTokens) {
    // count occurrences (capped) — punishes irrelevant chunks, rewards repeats
    let count = 0
    let idx = 0
    while ((idx = hay.indexOf(t, idx)) !== -1 && count < 5) {
      count++
      idx += t.length
    }
    score += count
    // small boost when the term appears in the heading
    if (heading && normalize(heading).includes(t)) score += 2
  }
  return score
}

export async function buildRagSystemMessage(
  d: db.DB,
  chatId: string,
  query: string,
): Promise<string | null> {
  const docIds = db.listAttachedDocIdsForChat(d, chatId)
  if (docIds.length === 0) return null

  const trimmed = query.trim()
  if (!trimmed) return null

  const qTokens = tokens(trimmed)

  let chunks
  try {
    chunks = db.listChunksForDocs(d, docIds)
  } catch (err) {
    logger.warn({ err }, 'rag: failed to load chunks')
    return null
  }
  if (chunks.length === 0) return null

  const titleByDoc = new Map(
    db.listDocumentsByIds(d, docIds).map(doc => [doc.id, doc.title]),
  )

  const scored = chunks
    .map(c => ({ chunk: c, score: scoreChunk(qTokens, c.text, c.heading) }))
    .sort((a, b) => b.score - a.score)

  // If the query has no useful tokens (or no chunk matched anything), fall back
  // to the first few chunks of the document — better than no grounding.
  const top = scored[0]?.score > 0 ? scored.slice(0, TOP_K) : chunks.slice(0, TOP_K).map(c => ({ chunk: c, score: 0 }))

  const excerpts = top
    .map((s, i) => {
      const docTitle = titleByDoc.get(s.chunk.document_id) ?? 'document'
      const heading = s.chunk.heading ? ` — ${s.chunk.heading}` : ''
      const page = s.chunk.page_start != null ? ` (p${s.chunk.page_start})` : ''
      return `[${i + 1}] ${docTitle}${heading}${page}\n${s.chunk.text}`
    })
    .join('\n\n')

  return [
    'You have access to the following excerpts from official WHO clinical protocols. Ground your answer in them. When the answer is supported by an excerpt, cite the section heading inline. If the excerpts do not cover the question, say so plainly rather than inventing guidance.',
    '',
    '--- BEGIN EXCERPTS ---',
    excerpts,
    '--- END EXCERPTS ---',
  ].join('\n')
}
