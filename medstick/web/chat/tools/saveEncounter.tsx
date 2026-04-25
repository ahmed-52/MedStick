'use client'
import { registerTool } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import { SoapCard, parseSoap } from '../cards/SoapCard'

const SOAP_PROMPT = `You extract SOAP notes from clinical conversations. Return ONLY valid minified JSON with this exact shape, no prose, no markdown:
{"subjective":"…","objective":"…","assessment":"…","plan":"…","red_flags":["…"]}
Use empty strings for missing sections. Use [] for red_flags if none. Do not add fields. Do not wrap in code fences.`

registerTool({
  id: 'saveEncounter',
  group: 'patient',
  label: { en: 'Save encounter', ar: 'حفظ الزيارة' },
  run: async (ctx) => {
    const chatId = ctx.activeChatId
    const patientId = ctx.activePatientId

    let chatText = ''
    if (chatId) {
      try {
        const ms = await api.getMessages(chatId)
        chatText = ms
          .filter((m) => m.role === 'user' || m.role === 'assistant')
          .map((m) => `${m.role}: ${m.content}`)
          .join('\n')
      } catch {}
    }

    if (!chatText.trim()) {
      ctx.appendInline({
        role: 'tool',
        content: '',
        card: (
          <SoapCard
            initial={{ subjective: '', objective: '', assessment: '', plan: '', red_flags: [] }}
            patientId={patientId}
            chatId={chatId}
            onSaved={() => {}}
          />
        ),
      })
      return
    }

    ctx.appendInline({ role: 'tool', content: 'Extracting encounter…' })

    let initial = null
    try {
      const r = await api.oneShotChat({
        messages: [
          { role: 'system', content: SOAP_PROMPT },
          { role: 'user', content: chatText },
        ],
        max_tokens: 600,
        temperature: 0,
      })
      const raw = r.choices?.[0]?.message?.content ?? ''
      initial = parseSoap(raw)
    } catch {}

    const fallback = initial ?? {
      subjective: chatText.slice(0, 800),
      objective: '',
      assessment: '',
      plan: '',
      red_flags: [],
    }

    ctx.appendInline({
      role: 'tool',
      content: '',
      card: (
        <SoapCard
          initial={fallback}
          patientId={patientId}
          chatId={chatId}
          onSaved={() => {
            useApp.getState().setActiveChat(null)
          }}
        />
      ),
    })
  },
})
