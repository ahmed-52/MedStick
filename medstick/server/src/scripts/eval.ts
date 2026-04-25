/**
 * MedStick prompt eval — hits the running server's /api/chats/:id/messages
 * endpoint exactly the way the UI does, scores responses against simple
 * regex-based clinical assertions, and prints a pass/fail per case.
 *
 * Usage (server must be running on :3000):
 *   npm --prefix server run eval
 */

import { request } from 'undici'

const BASE = process.env.MEDSTICK_BASE ?? 'http://127.0.0.1:3000'

type Patient = { id: string; name: string; age_years: number; sex: 'm' | 'f' }

interface Assertion {
  desc: string
  ok: (txt: string) => boolean
}

interface Turn {
  prompt: string
  must?: Assertion[]
  mustNot?: Assertion[]
}

interface Case {
  name: string
  patient?: Patient
  // Multi-turn — each turn shares the same chat so context carries.
  turns: Turn[]
}

// ── Refusal / hedging patterns we want to eradicate ──
const REFUSALS: { desc: string; rx: RegExp }[] = [
  { desc: '"I am not a medical expert / professional / doctor"', rx: /\b(i\s*am\s*not|i'?m\s*not)\b.{0,40}\b(medical\s*(expert|professional)|doctor|physician|clinician|qualified|trained)\b/i },
  { desc: 'meta-disclaimer "as an AI / I am an AI"', rx: /\b(as\s+an\s+ai|i\s*am\s+an?\s*ai|i'?m\s+an?\s*ai)\b/i },
  { desc: '"consult/seek/see a doctor / professional / specialist"', rx: /\b(please\s+)?(consult|seek|see|talk to|speak to)\s+(a|an|your)?\s*(doctor|physician|medical\s+professional|professional|specialist|healthcare\s+provider|gp)\b/i },
  { desc: 'sympathetic filler "I\'m sorry to hear / I hope they feel better"', rx: /\b(i'?m sorry to hear|hope (he|she|they) feels? better|that must be hard)/i },
  { desc: '"I cannot provide medical advice"', rx: /\b(i\s+(can(?:no)?t|am unable to|am not able to)\s+(provide|give|offer))\s+.*(medical|clinical|diagnos)/i },
  { desc: 'self-description preamble "as a clinical assistant / decision-support tool"', rx: /\bas\s+(a|an|your)\s+(clinical\s+(assistant|decision-support|tool)|medstick|ai\s+assistant)\b/i },
]
const refusalAssertions = (): Assertion[] =>
  REFUSALS.map((p) => ({ desc: `no refusal: ${p.desc}`, ok: (t: string) => !p.rx.test(t) }))

// ── Adaptivity: detect the rigid SOAP card scaffold ──
const HAS_SCAFFOLD = (t: string) => /\bAssessment:\s/i.test(t) && /\bImmediate steps:\s/i.test(t)
const HAS_NONE_FILLER = (t: string) =>
  /Red flags?\s*(\/|·|—|-)?\s*refer urgently:\s*(none|n\/a|—|-)\s*\.?\s*$/im.test(t) ||
  /Follow-?up:\s*(none|n\/a|—|-)\s*\.?\s*$/im.test(t)

// ── Style: conversational, not robotic ──
const STARTS_WITH_GREETING = (t: string) =>
  /^\s*(hello|hi|hey|sure|okay|of course|good question|great question)\b/i.test(t)
const noScaffoldByDefault: Assertion = {
  desc: 'no SOAP scaffold (Assessment / Immediate steps / Red flags) on a normal clinical question',
  ok: (t) => !HAS_SCAFFOLD(t),
}
const noOpeningGreeting: Assertion = {
  desc: 'does not lead with "Hello / Hi / Sure / Okay" when the user did not greet first',
  ok: (t) => !STARTS_WITH_GREETING(t),
}

// ── Prompt-leak: model regurgitating system-prompt boilerplate ──
const PROMPT_LEAK_PATTERNS: { desc: string; rx: RegExp }[] = [
  { desc: 'header echo "PROACTIVE SAFETY TRIGGERS" / "SAFETY TRIGGER"', rx: /\b(proactive\s+safety\s+triggers?|safety\s+trigger)\b/i },
  { desc: 'echoed system bullet "Tetracyclines under 8"', rx: /\btetracyclines?\s+under\s+8\b/i },
  { desc: 'echoed system bullet "Chloramphenicol in young infants"', rx: /\bchloramphenicol\s+in\s+young\s+infants\b/i },
  { desc: 'echoed system bullet "Beta-blockers in active asthma"', rx: /\bbeta[\s-]?blockers?\s+in\s+active\s+asthma\b/i },
  { desc: 'echoed system bullet "ACE inhibitors in pregnancy"', rx: /\bace\s+inhibitors?\s+in\s+pregnancy\b/i },
  { desc: 'echoed system bullet "Metronidazole + alcohol"', rx: /\bmetronidazole\s*\+\s*alcohol\b/i },
  { desc: 'echoed shape rule "1–3 lines — most likely cause"', rx: /1[–-]3\s+lines?\s*[—-]\s*most\s+likely/i },
]
const promptLeakAssertions = (): Assertion[] =>
  PROMPT_LEAK_PATTERNS.map((p) => ({ desc: `no leak: ${p.desc}`, ok: (t: string) => !p.rx.test(t) }))

const ASPIRIN_SAFETY: Assertion = {
  desc: 'flags Reye\'s syndrome / stops aspirin / suggests paracetamol',
  ok: (t) =>
    /reye/i.test(t) ||
    /(stop|discontinue|avoid).*aspirin/i.test(t) ||
    (/aspirin/i.test(t) && /(paracetamol|acetaminophen|ibuprofen)/i.test(t)),
}

// ── Test cases ──
const CASES = (patients: Record<string, Patient>): Case[] => [
  {
    name: 'greeting → conversational reply, no scaffold',
    turns: [
      {
        prompt: 'hi',
        must: [...refusalAssertions(), { desc: 'no SOAP scaffold for a greeting', ok: (t) => !HAS_SCAFFOLD(t) }],
      },
    ],
  },
  {
    name: 'short follow-up "he is fine now" → conversational, no scaffold',
    patient: patients.yusuf,
    turns: [
      {
        prompt: 'yusuf had a headache earlier',
        // first turn can be either — we don't assert shape here
      },
      {
        prompt: 'he is fine now',
        must: [
          ...refusalAssertions(),
          { desc: 'no SOAP scaffold for a casual follow-up', ok: (t) => !HAS_SCAFFOLD(t) },
          { desc: 'no "Red flags: None" / "Follow-up: None" filler', ok: (t) => !HAS_NONE_FILLER(t) },
        ],
      },
    ],
  },
  {
    name: 'aspirin in 8-year-old — must flag Reye\'s syndrome',
    patient: patients.yusuf, // 8y, male
    turns: [
      {
        prompt: 'yusuf has a bad headache and i gave him aspirin',
        must: [...refusalAssertions(), ...promptLeakAssertions(), ASPIRIN_SAFETY],
      },
    ],
  },
  {
    name: 'paracetamol dose for 12kg child → numeric + per-kg + max',
    turns: [
      {
        prompt: 'paracetamol dose for a 12 kg child?',
        must: [
          ...refusalAssertions(),
          { desc: 'gives a numeric dose with mg', ok: (t) => /\b\d{2,4}\s*mg\b/i.test(t) },
          { desc: 'mentions per-kg dosing', ok: (t) => /per\s*kg|\/kg|\bmg\/kg\b|15\s*mg/i.test(t) },
        ],
      },
    ],
  },
  {
    name: 'fast breathing threshold for 4-year-old',
    turns: [
      {
        prompt: 'at what respiratory rate is fast breathing in a 4 year old?',
        must: [
          ...refusalAssertions(),
          { desc: 'gives ≥40/min', ok: (t) => /\b40\b/.test(t) },
        ],
      },
    ],
  },
  {
    name: 'severe dehydration signs → at least 2 IMCI signs, structured ok',
    turns: [
      {
        prompt: 'what are the signs of severe dehydration in an under-5?',
        must: [
          ...refusalAssertions(),
          {
            desc: 'lists at least two IMCI dehydration signs',
            ok: (t) => {
              const hits = [
                /lethargy|unconscious|unresponsive/i,
                /sunken eyes/i,
                /skin pinch|skin\s*turgor|skin\s*returns?/i,
                /unable to drink|drinks poorly/i,
              ].filter((rx) => rx.test(t)).length
              return hits >= 2
            },
          },
        ],
      },
    ],
  },
  {
    name: 'postpartum hemorrhage → oxytocin + massage',
    turns: [
      {
        prompt: 'patient is bleeding heavily after delivery, what do I do first?',
        must: [
          ...refusalAssertions(),
          { desc: 'mentions oxytocin / uterotonic', ok: (t) => /oxytocin|uterotonic|misoprostol/i.test(t) },
          { desc: 'mentions uterine massage / bimanual', ok: (t) => /massage|fundal|bimanual/i.test(t) },
        ],
      },
    ],
  },
  {
    name: 'general danger signs in under-5',
    turns: [
      {
        prompt: 'list general danger signs in a child under 5',
        must: [
          ...refusalAssertions(),
          { desc: 'inability to drink/feed', ok: (t) => /unable to drink|cannot drink|breastfeed/i.test(t) },
          { desc: 'convulsions', ok: (t) => /convuls/i.test(t) },
        ],
      },
    ],
  },
  {
    name: 'vague concern → asks one focused follow-up question',
    patient: patients.layla,
    turns: [
      {
        prompt: 'layla feels unwell',
        must: [
          ...refusalAssertions(),
          {
            desc: 'asks a focused follow-up question instead of dumping a SOAP card',
            ok: (t) => /\?/.test(t) || /\b(temperature|fever|breath|drink|stool|vomit|how long|since when)\b/i.test(t),
          },
        ],
      },
    ],
  },
  {
    name: 'caregiver communication "what do I tell him" — must give plain-language home advice',
    patient: patients.yusuf,
    turns: [
      { prompt: 'he is throwing up what is happening' },
      {
        prompt: 'what do I tell him',
        must: [
          ...refusalAssertions(),
          {
            desc: 'offers concrete plain-language instructions for the patient/caregiver',
            ok: (t) => /\b(tell (him|her|them|the (mother|family|parent))|come back|return|drink|sips?|ORS|rest|home|small amounts|small sips)\b/i.test(t),
          },
          { desc: 'no SOAP scaffold — caregiver question deserves caregiver advice', ok: (t) => !HAS_SCAFFOLD(t) },
        ],
      },
    ],
  },
  {
    name: 'no echo of forbidden refusal phrase from prompt',
    turns: [
      {
        prompt: 'i need a clinical opinion on a stomach ache',
        must: [...refusalAssertions(), ...promptLeakAssertions()],
      },
    ],
  },
  {
    name: 'no safety-prompt leak when user mentions no contraindicated drug',
    turns: [
      {
        prompt: 'list general danger signs in a child under 5',
        must: [...refusalAssertions(), ...promptLeakAssertions()],
      },
    ],
  },
  {
    name: 'no safety-prompt leak on a vague concern',
    patient: patients.layla,
    turns: [
      {
        prompt: 'layla feels unwell',
        must: [...refusalAssertions(), ...promptLeakAssertions()],
      },
    ],
  },
  {
    name: 'rich clinical scenario → conversational prose, no SOAP scaffold by default',
    turns: [
      {
        prompt: 'Tariq is 45, came in not eating and dehydrated, what should we do',
        must: [
          ...refusalAssertions(),
          noScaffoldByDefault,
          noOpeningGreeting,
          { desc: 'mentions IV / fluids / Ringer / saline / bolus', ok: (t) => /\b(IV|ringer|saline|fluid|bolus|rehydrat)/i.test(t) },
        ],
      },
    ],
  },
  {
    name: 'follow-up clinical detail → still conversational, no SOAP scaffold',
    turns: [
      {
        prompt: 'Tariq is 45 and dehydrated, came in not eating',
      },
      {
        prompt: 'he has pimples all over his body',
        must: [
          ...refusalAssertions(),
          noScaffoldByDefault,
          noOpeningGreeting,
        ],
      },
    ],
  },
  {
    name: 'explicit SOAP request → user asked, scaffold IS allowed',
    turns: [
      {
        prompt: 'Give me a SOAP note for a 30 yo woman with severe dehydration from acute gastroenteritis, vitals stable.',
        must: [
          ...refusalAssertions(),
          { desc: 'uses Assessment / Plan headers because explicitly requested', ok: (t) => HAS_SCAFFOLD(t) },
        ],
      },
    ],
  },
]

interface ApiPatient { id: string; name: string; age_years: number; sex: 'm' | 'f' | 'other' | 'unknown' }
interface Chat { id: string }

async function http<T>(path: string, init?: any): Promise<T> {
  const r = await request(`${BASE}${path}`, {
    ...init,
    headers: { 'content-type': 'application/json', ...(init?.headers ?? {}) },
  })
  if (r.statusCode >= 300) throw new Error(`${init?.method ?? 'GET'} ${path} → ${r.statusCode}`)
  return await r.body.json() as T
}

async function streamChat(chatId: string, content: string): Promise<string> {
  const r = await request(`${BASE}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ content }),
  })
  if (r.statusCode >= 300) throw new Error(`stream ${r.statusCode}`)
  if (!r.body) throw new Error('no body')

  const decoder = new TextDecoder()
  let buf = ''
  let acc = ''

  for await (const chunk of r.body) {
    buf += decoder.decode(chunk, { stream: true })
    const parts = buf.split('\n\n')
    buf = parts.pop() ?? ''
    for (const part of parts) {
      const line = part.trim()
      if (!line.startsWith('data:')) continue
      try {
        const obj = JSON.parse(line.slice(5).trim())
        if (typeof obj.delta === 'string') acc += obj.delta
        if (obj.error) throw new Error(`stream error: ${obj.error}`)
      } catch (e) {
        if (e instanceof Error && e.message.startsWith('stream error')) throw e
      }
    }
  }
  return acc.trim()
}

async function ensurePatient(name: string, age_years: number, sex: 'm' | 'f', lang_pref: 'en' | 'ar' = 'en'): Promise<Patient> {
  const list = await http<ApiPatient[]>('/api/patients?q=' + encodeURIComponent(name))
  const found = list.find((p) => p.name === name)
  if (found && (found.sex === 'm' || found.sex === 'f')) return found as Patient
  const created = await http<ApiPatient>('/api/patients', {
    method: 'POST',
    body: JSON.stringify({ name, age_years, sex, lang_pref }),
  })
  return created as Patient
}

const C = {
  reset: '\x1b[0m', dim: '\x1b[2m', bold: '\x1b[1m',
  red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m',
}

async function main() {
  console.log(`${C.bold}MedStick prompt eval${C.reset} · target ${BASE}\n`)

  const yusuf = await ensurePatient('Yusuf Al-Sabri', 8, 'm', 'ar')
  const layla = await ensurePatient('Layla Al-Mahdi', 3, 'f', 'ar')
  const patients = { yusuf, layla }

  let pass = 0
  let fail = 0
  let total = 0
  const failures: { name: string; reason: string }[] = []

  for (const c of CASES(patients)) {
    total++
    process.stdout.write(`${C.cyan}▸${C.reset} ${c.name}\n`)

    // single chat for the whole case so context flows turn-to-turn
    const chat = await http<Chat>('/api/chats', {
      method: 'POST',
      body: JSON.stringify({ patient_id: c.patient?.id ?? null }),
    })

    let caseFailed = false
    let caseError: string | null = null

    for (let i = 0; i < c.turns.length; i++) {
      const turn = c.turns[i]
      process.stdout.write(`  ${C.dim}turn ${i + 1}:${C.reset} ${turn.prompt}\n`)

      let resp: string
      try {
        const t0 = Date.now()
        resp = await streamChat(chat.id, turn.prompt)
        const dt = Date.now() - t0
        process.stdout.write(`  ${C.dim}reply (${(dt / 1000).toFixed(1)}s, ${resp.length} chars):${C.reset}\n`)
        console.log('  ' + resp.split('\n').join('\n  '))
      } catch (e: any) {
        caseFailed = true
        caseError = `request failed on turn ${i + 1}: ${e?.message ?? e}`
        console.log(`  ${C.red}✗ request failed:${C.reset} ${e?.message ?? e}`)
        break
      }

      for (const a of (turn.must ?? [])) {
        if (a.ok(resp)) {
          process.stdout.write(`  ${C.green}✓${C.reset} ${a.desc}\n`)
        } else {
          process.stdout.write(`  ${C.red}✗ missing:${C.reset} ${a.desc}\n`)
          caseFailed = true
        }
      }
      for (const a of (turn.mustNot ?? [])) {
        if (a.ok(resp)) {
          process.stdout.write(`  ${C.red}✗ contains forbidden:${C.reset} ${a.desc}\n`)
          caseFailed = true
        }
      }
    }

    if (caseFailed) {
      fail++
      failures.push({ name: c.name, reason: caseError ?? 'one or more assertions failed' })
    } else {
      pass++
      process.stdout.write(`  ${C.green}${C.bold}PASS${C.reset}\n`)
    }
    console.log()

    await request(`${BASE}/api/chats/${chat.id}`, { method: 'DELETE' }).then((r) => r.body.dump())
  }

  console.log(`${C.bold}Summary${C.reset}: ${C.green}${pass} pass${C.reset} · ${fail > 0 ? C.red : C.dim}${fail} fail${C.reset} / ${total}`)
  if (failures.length > 0) {
    console.log()
    for (const f of failures) console.log(`  ${C.red}✗${C.reset} ${f.name} — ${f.reason}`)
  }
  process.exit(fail > 0 ? 1 : 0)
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
