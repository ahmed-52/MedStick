import { request } from 'undici'

export const EMBED_BASE = process.env.EMBED_URL ?? 'http://127.0.0.1:8081'

export async function embedPing(): Promise<boolean> {
  try {
    const r = await request(`${EMBED_BASE}/health`, {
      method: 'GET',
      headersTimeout: 1500,
      bodyTimeout: 1500,
    })
    await r.body.dump()
    return r.statusCode >= 200 && r.statusCode < 300
  } catch {
    return false
  }
}

// nomic-embed-text-v1.5 expects task prefixes:
//   "search_document: ..." for indexed chunks
//   "search_query: ..." for retrieval queries
// Pass the prefix from the caller; this fn just embeds whatever you give it.
export async function embed(text: string): Promise<Float32Array> {
  const r = await request(`${EMBED_BASE}/v1/embeddings`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ input: text }),
    headersTimeout: 0,
    bodyTimeout: 0,
  })
  if (r.statusCode >= 300) {
    const txt = await r.body.text()
    throw new Error(`embed-server ${r.statusCode}: ${txt}`)
  }
  const data = (await r.body.json()) as { data?: Array<{ embedding: number[] }> }
  const arr = data.data?.[0]?.embedding
  if (!arr || arr.length === 0) throw new Error('embed-server returned empty vector')
  return l2normalize(Float32Array.from(arr))
}

export function l2normalize(v: Float32Array): Float32Array {
  let s = 0
  for (let i = 0; i < v.length; i++) s += v[i] * v[i]
  const norm = Math.sqrt(s) || 1
  for (let i = 0; i < v.length; i++) v[i] /= norm
  return v
}

export function packVec(v: Float32Array): Buffer {
  return Buffer.from(v.buffer, v.byteOffset, v.byteLength)
}

export function unpackVec(b: Buffer): Float32Array {
  // Copy into an aligned ArrayBuffer — SQLite-returned Buffer may not be
  // 4-byte aligned, which breaks Float32Array construction directly.
  const ab = new ArrayBuffer(b.byteLength)
  new Uint8Array(ab).set(b)
  return new Float32Array(ab)
}

export function cosine(a: Float32Array, b: Float32Array): number {
  // Vectors are L2-normalized at insert and query time, so this is a dot product.
  const n = Math.min(a.length, b.length)
  let s = 0
  for (let i = 0; i < n; i++) s += a[i] * b[i]
  return s
}
