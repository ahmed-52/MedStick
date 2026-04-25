import { request } from 'undici'

export const LLAMA_BASE = process.env.LLAMA_URL ?? 'http://127.0.0.1:8080'

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | Array<
    | { type: 'text'; text: string }
    | { type: 'image_url'; image_url: { url: string } }
  >
}

export interface ChatBody {
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
  stream?: boolean
  response_format?: { type: 'json_object' | 'text' }
}

export async function llamaPing(): Promise<boolean> {
  try {
    const r = await request(`${LLAMA_BASE}/health`, {
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

export async function chatCompletion(body: ChatBody): Promise<{
  choices: Array<{ message: { role: string; content: string } }>
}> {
  const r = await request(`${LLAMA_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, stream: false }),
    headersTimeout: 0,
    bodyTimeout: 0,
  })
  if (r.statusCode >= 300) {
    const text = await r.body.text()
    throw new Error(`llama-server ${r.statusCode}: ${text}`)
  }
  return await r.body.json() as any
}

export async function chatCompletionStream(
  body: ChatBody,
  onDelta: (text: string) => void,
  signal?: AbortSignal,
): Promise<string> {
  const r = await request(`${LLAMA_BASE}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ ...body, stream: true }),
    headersTimeout: 0,
    bodyTimeout: 0,
    signal,
  })
  if (r.statusCode >= 300) {
    const text = await r.body.text()
    throw new Error(`llama-server ${r.statusCode}: ${text}`)
  }
  let full = ''
  let buffer = ''
  for await (const chunk of r.body) {
    buffer += chunk.toString('utf-8')
    let idx
    while ((idx = buffer.indexOf('\n')) >= 0) {
      const line = buffer.slice(0, idx).trim()
      buffer = buffer.slice(idx + 1)
      if (!line.startsWith('data:')) continue
      const payload = line.slice(5).trim()
      if (payload === '[DONE]') return full
      try {
        const obj = JSON.parse(payload)
        const delta = obj?.choices?.[0]?.delta?.content
        if (typeof delta === 'string' && delta.length > 0) {
          full += delta
          onDelta(delta)
        }
      } catch {
        // ignore malformed
      }
    }
  }
  return full
}
