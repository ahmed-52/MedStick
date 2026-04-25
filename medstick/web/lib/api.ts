import type {
  Patient, Chat, Message, Encounter, Photo, Protocol, EncounterMode, Document,
} from './types'

async function jsonReq<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(path, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
  if (r.status === 204) return undefined as T
  return r.json() as Promise<T>
}

export interface ChatPart {
  type: 'text' | 'image_url'
  text?: string
  image_url?: { url: string }
}

export interface ChatBody {
  messages: Array<{
    role: 'system' | 'user' | 'assistant'
    content: string | ChatPart[]
  }>
  max_tokens?: number
  temperature?: number
  // When set, the server runs RAG against these document IDs and injects the
  // retrieved excerpts as a system message before forwarding to llama.
  doc_ids?: string[]
  query?: string
}

export const api = {
  health: () => jsonReq<{ ok: boolean; llama: boolean }>('/api/health'),

  listPatients: (q?: string) =>
    jsonReq<Patient[]>(`/api/patients${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  getPatient: (id: string) => jsonReq<Patient>(`/api/patients/${id}`),
  createPatient: (input: Partial<Patient>) =>
    jsonReq<Patient>('/api/patients', { method: 'POST', body: JSON.stringify(input) }),
  updatePatient: (id: string, patch: Partial<Patient>) =>
    jsonReq<Patient>(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }),
  deletePatient: (id: string) =>
    jsonReq<void>(`/api/patients/${id}`, { method: 'DELETE' }),

  listChats: (patient_id?: string) =>
    jsonReq<Chat[]>(`/api/chats${patient_id ? `?patient_id=${patient_id}` : ''}`),
  createChat: (patient_id: string | null) =>
    jsonReq<Chat>('/api/chats', { method: 'POST', body: JSON.stringify({ patient_id }) }),
  deleteChat: (chat_id: string) =>
    jsonReq<void>(`/api/chats/${chat_id}`, { method: 'DELETE' }),
  getMessages: (chat_id: string) =>
    jsonReq<Message[]>(`/api/chats/${chat_id}/messages`),
  // Append message(s) to a chat WITHOUT calling the LLM. Used by tool flows
  // (e.g. Cholera assessment) that compute their own answer but want the
  // exchange in chat history so follow-up turns have context.
  logMessages: (chat_id: string, messages: Array<{ role: 'user' | 'assistant' | 'tool'; content: string }>) =>
    jsonReq<{ messages: Message[] }>(`/api/chats/${chat_id}/log`, {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),

  listEncounters: (patient_id?: string) =>
    jsonReq<Encounter[]>(`/api/encounters${patient_id ? `?patient_id=${patient_id}` : ''}`),
  createEncounter: (input: {
    patient_id?: string | null
    chat_id?: string | null
    mode: EncounterMode
    soap_subjective?: string | null
    soap_objective?: string | null
    soap_assessment?: string | null
    soap_plan?: string | null
    red_flags?: string | null
    raw_result?: string | null
  }) => jsonReq<Encounter>('/api/encounters', { method: 'POST', body: JSON.stringify(input) }),

  uploadPhoto: async (
    blob: Blob,
    filename = 'image.jpg',
    extra: { patient_id?: string; encounter_id?: string } = {},
  ) => {
    const fd = new FormData()
    fd.append('file', blob, filename)
    if (extra.patient_id) fd.append('patient_id', extra.patient_id)
    if (extra.encounter_id) fd.append('encounter_id', extra.encounter_id)
    const r = await fetch('/api/photos', { method: 'POST', body: fd })
    if (!r.ok) throw new Error(`upload ${r.status}`)
    return (await r.json()) as Photo
  },

  searchProtocols: (q: string, lang: 'en' | 'ar') =>
    jsonReq<Protocol[]>(`/api/protocols/search?q=${encodeURIComponent(q)}&lang=${lang}`),
  listProtocols: (lang: 'en' | 'ar') =>
    jsonReq<Protocol[]>(`/api/protocols?lang=${lang}`),

  listDocuments: () => jsonReq<Document[]>('/api/documents'),
  getChatDocuments: (chat_id: string) =>
    jsonReq<Document[]>(`/api/chats/${chat_id}/documents`),
  attachDocument: (chat_id: string, document_id: string) =>
    jsonReq<Document[]>(`/api/chats/${chat_id}/documents`, {
      method: 'POST',
      body: JSON.stringify({ document_id }),
    }),
  detachDocument: (chat_id: string, document_id: string) =>
    jsonReq<void>(`/api/chats/${chat_id}/documents/${document_id}`, { method: 'DELETE' }),

  oneShotChat: (body: ChatBody) =>
    jsonReq<{ choices: Array<{ message: { content: string } }> }>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  streamChatMessage: async (
    chat_id: string,
    payload: { content: string; image_ids?: string[]; system?: string },
    onDelta: (delta: string) => void,
    onDone: (info: { message_id?: string; user_message_id?: string; error?: string }) => void,
  ) => {
    const r = await fetch(`/api/chats/${chat_id}/messages`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!r.ok || !r.body) throw new Error(`stream ${r.status}`)
    const reader = r.body.getReader()
    const decoder = new TextDecoder()
    let buf = ''
    let lastInfo: { message_id?: string; user_message_id?: string; error?: string } = {}
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buf += decoder.decode(value, { stream: true })
      const parts = buf.split('\n\n')
      buf = parts.pop() ?? ''
      for (const part of parts) {
        const line = part.trim()
        if (!line.startsWith('data:')) continue
        try {
          const obj = JSON.parse(line.slice(5).trim())
          if (typeof obj.delta === 'string') onDelta(obj.delta)
          if (obj.user_message_id) lastInfo.user_message_id = obj.user_message_id
          if (obj.message_id) lastInfo.message_id = obj.message_id
          if (obj.error) lastInfo.error = obj.error
        } catch {}
      }
    }
    onDone(lastInfo)
  },
}
