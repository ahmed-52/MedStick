'use client'
import { useState } from 'react'
import { RiBookOpenLine } from '@remixicon/react'
import * as Button from '@/components/ui/button'
import { registerTool, type ToolContext } from '../ToolRegistry'
import { useApp } from '@/store/app'
import { api } from '@/lib/api'
import { SpecialtyCard } from '../cards/SpecialtyCard'
import { AssistantMessage } from '../AssistantMessage'

const FALLBACK_SOURCE = 'WHO Cholera Outbreak Response · 2019'

const PROMPT_BASE = `You are a WHO-aligned cholera response assistant. The user is a clinician in an outbreak setting. Help them figure out what to do — do not just fill a template.

Output format. Begin with two short labeled lines and nothing else on those lines:

Severity: <None | Some | Severe> dehydration
Plan: <A | B | C>

Then leave a blank line, then write a clinical brief in markdown that ACTUALLY HELPS the clinician. Use these sections (omit any that do not apply):

## Why this classification
2–3 sentences linking the patient's signs to the WHO IMCI / cholera severity rules. Reference what tipped the call (e.g. "skin pinch ≥2 s and lethargy meet WHO severe-dehydration criteria").

## Protocol — Plan <A/B/C>
Concrete, ordered steps. For Plan A: home ORS amounts after each loose stool by age, continued feeding, danger signs to return for. For Plan B: 75 ml/kg ORS over 4 h, exact volume for THIS weight, sip rate, reassessment at 4 h. For Plan C: Ringer's lactate 100 ml/kg IV — split as 30 ml/kg in the first 30 min then 70 ml/kg over 2.5 h (1 h + 5 h respectively if <12 mo); reassess every 15–30 min; start ORS as soon as the patient can drink.

## Antibiotic
When indicated (Plan C, severe, pregnant, or comorbid), give the drug + weight-based dose. Adults: doxycycline 300 mg PO single dose. Pregnant or children <8 y: azithromycin 20 mg/kg single dose. State "Not routinely indicated" only if the case is mild and the patient is not pregnant.

## Monitor
Specific things to recheck and at what interval — pulse, hydration status, urine output, skin pinch, mental status, ongoing stool/vomit losses.

## When to step up or refer
Concrete triggers. If Plan B fails (no improvement in 4 h, ongoing high-volume losses, can't tolerate ORS, signs worsen), step to Plan C and refer to a treatment centre. Severe with shock → IV first then transfer.

Style.
- Use real numbers tied to the weight given. If the weight is 14 kg, "1050 ml ORS over 4 h", not "75 ml/kg".
- Use bullet lists for actions. Bold key drug names and amounts.
- Be useful, not formal. No preamble, no closing remarks, no "I hope this helps".
- Never invent a drug name or dose you are not confident about. If unsure, say "verify against your local protocol".`

const PROMPT_RAG_SUFFIX = `

GROUNDING — A separate system message below contains excerpts from the locally ingested cholera PDF. Treat those excerpts as the source of truth. When a number, plan, or drug is supported by an excerpt, prefer the excerpt's wording and quote a short phrase. When the excerpts do not cover a point, fall back to general WHO 2019 knowledge.`

const PROMPT_PLAIN_SUFFIX = `

Use WHO Cholera Outbreak Response 2019 guidance as your knowledge base.`

interface ParsedHeader {
  severity: string
  plan: string
  body: string
}

function parseCholera(raw: string): ParsedHeader {
  const sevMatch = raw.match(/^\s*Severity\s*:\s*(.+?)\s*$/im)
  const planMatch = raw.match(/^\s*Plan\s*:\s*(.+?)\s*$/im)
  const severity = sevMatch ? sevMatch[1].trim().replace(/\*+/g, '') : ''
  const plan = planMatch ? planMatch[1].trim().replace(/\*+/g, '') : ''

  // Strip the two header lines from the body so markdown renders cleanly.
  let body = raw
  if (sevMatch) body = body.replace(sevMatch[0], '')
  if (planMatch) body = body.replace(planMatch[0], '')
  body = body.replace(/^\s+/, '').trim()

  return { severity, plan, body }
}

function CholeraCard({
  raw,
  sourceLabel,
  grounded,
}: {
  raw: string
  sourceLabel: string
  grounded: boolean
}) {
  const { severity, plan, body } = parseCholera(raw)
  const sev = severity.toLowerCase()
  const sevBadge = sev.includes('severe')
    ? 'bg-error-lighter text-error-dark border-error-base/30'
    : sev.includes('some')
      ? 'bg-warning-lighter text-warning-dark border-warning-base/30'
      : sev.includes('none')
        ? 'bg-success-lighter text-success-dark border-success-base/30'
        : 'bg-bg-weak-50 text-text-sub-600 border-stroke-soft-200'

  return (
    <SpecialtyCard title="Cholera assessment" toolId="cholera">
      {(severity || plan) && (
        <div className="flex flex-wrap items-center gap-2">
          {severity && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${sevBadge}`}
            >
              {severity}
            </span>
          )}
          {plan && (
            <span className="inline-flex items-center rounded-full border border-[var(--color-who-ring)] bg-[var(--color-who-tint)] px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[var(--color-who-blue-deep)]">
              Plan {plan}
            </span>
          )}
        </div>
      )}

      {body && (
        <div className="-mx-1">
          <AssistantMessage content={body} />
        </div>
      )}

      <div className="mt-1 inline-flex items-center gap-1.5 rounded-md border border-[var(--color-who-ring)] bg-[var(--color-who-tint)] px-2 py-1 text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-who-blue-deep)]">
        <RiBookOpenLine className="size-3.5" />
        {grounded ? 'Grounded · ' : 'Source · '}
        {sourceLabel}
      </div>
    </SpecialtyCard>
  )
}

const fc =
  'w-full rounded-lg border border-stroke-soft-200 bg-bg-white-0 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-base'

function CholeraForm({ ctx, onClose }: { ctx: ToolContext; onClose: () => void }) {
  const activePatientId = ctx.activePatientId
  const [weight, setWeight] = useState('')
  const [summary, setSummary] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async () => {
    const w = Number(weight)
    if (!w || w <= 0 || !summary.trim() || busy) return
    setBusy(true)

    // Make sure we have a chat to log into so follow-up turns inherit context.
    let chatId = ctx.activeChatId
    if (!chatId) {
      try {
        const c = await api.createChat(activePatientId ?? null)
        chatId = c.id
        useApp.getState().setActiveChat(chatId)
        useApp.getState().bumpChatList()
      } catch {}
    }

    onClose()
    const placeholderId = ctx.appendInline({
      role: 'tool',
      content: '',
      card: <SpecialtyCard title="Cholera assessment" toolId="cholera" pending />,
    })

    let docIds: string[] | undefined
    let sourceLabel = FALLBACK_SOURCE
    try {
      const docs = await api.listDocuments()
      const cholera = docs.find((d) => /chol(e|é)ra/i.test(d.title))
      if (cholera) {
        docIds = [cholera.id]
        sourceLabel = cholera.title
      }
    } catch {}

    const grounded = !!docIds
    const systemPrompt = PROMPT_BASE + (grounded ? PROMPT_RAG_SUFFIX : PROMPT_PLAIN_SUFFIX)

    try {
      const r = await api.oneShotChat({
        ...(docIds
          ? {
              doc_ids: docIds,
              query: `cholera severity assessment for ${w} kg patient — ${summary.trim()}`,
            }
          : {}),
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: `Weight: ${w} kg. Summary: ${summary.trim()}`,
          },
        ],
        max_tokens: 1200,
        temperature: 0.2,
      })
      const text = r.choices?.[0]?.message?.content ?? ''
      ctx.replaceInline(placeholderId, {
        role: 'tool',
        content: '',
        card: <CholeraCard raw={text} sourceLabel={sourceLabel} grounded={grounded} />,
      })

      // Persist the exchange into the chat history so subsequent turns
      // (e.g. "his heart rate is elevated") inherit the cholera context
      // instead of treating it as a vague new query.
      if (chatId) {
        const userLogged = `Ran the Cholera assessment.\nWeight: ${w} kg.\nSummary: ${summary.trim()}`
        const asstLogged = `[Cholera assessment · ${grounded ? 'grounded against ' + sourceLabel : 'WHO 2019 reference'}]\n\n${text}`
        try {
          await api.logMessages(chatId, [
            { role: 'user', content: userLogged },
            { role: 'assistant', content: asstLogged },
          ])
          useApp.getState().bumpChatList()
        } catch {}
      }

      if (activePatientId) {
        try {
          await api.createEncounter({
            patient_id: activePatientId,
            chat_id: chatId,
            mode: 'chat',
            raw_result: `[Cholera assessment]\n\n${text}`,
          })
        } catch {}
      }
    } catch (err: any) {
      ctx.replaceInline(placeholderId, {
        role: 'tool',
        content: '',
        card: (
          <SpecialtyCard
            title="Cholera assessment"
            toolId="cholera"
            error={String(err?.message ?? err)}
          />
        ),
      })
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-2.5">
      <div>
        <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
          Weight (kg)
        </label>
        <input
          autoFocus
          type="number"
          step="0.1"
          min={0}
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          placeholder="e.g. 14"
          className={fc}
        />
      </div>
      <div>
        <label className="text-text-soft-400 mb-1 block text-[10px] font-semibold uppercase tracking-wider">
          Patient summary
        </label>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={3}
          placeholder="Stool count, vomiting, dehydration signs (eyes, skin pinch, alert/lethargic), any comorbidities…"
          className={fc + ' resize-none'}
        />
      </div>
      <Button.Root
        onClick={submit}
        disabled={busy || !weight || !summary.trim()}
        className="w-full"
      >
        Run cholera assessment
      </Button.Root>
    </div>
  )
}

registerTool({
  id: 'cholera',
  group: 'modes',
  label: { en: 'Cholera', ar: 'الكوليرا' },
  Form: CholeraForm,
})

void useApp
