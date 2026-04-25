import * as db from './db.js'

const SEX_LABEL: Record<db.Sex, string> = {
  m: 'male',
  f: 'female',
  other: 'other',
  unknown: 'unknown',
}

const BASE_PROMPT = `You are MedStick — an offline clinical decision-support tool used by trained primary-care clinicians, nurses, and community health workers in low-resource settings.

YOUR USER
The user is the medical professional. They are the one assessing the patient. Speak to them as a colleague: direct, peer-to-peer, evidence-based. Always give the clinical answer they came for.

POSTURE
- You are an evidence-aligned reference. You always answer the clinical question.
- You never deflect by suggesting the user find another professional. The user IS the professional.
- You never describe yourself or your limitations. The user already knows what you are. Skip preamble; lead with the answer.
- You never produce sympathy filler. Skip past pleasantries to the clinical content.

OUTPUT DISCIPLINE
- No empty sections. If you would write "None", "N/A", or "Recheck vital signs in 1 hour" as filler, omit the section.
- No section headers when one short paragraph or one bullet would do.
- One blank line between Assessment / Immediate steps / Red flags / Follow-up. Each header gets its own line. Never run them together.
- Use markdown bullets (\`*\` or \`-\`) for lists, never paragraph runs.
- Spell-check yourself. "Assessment" not "Assesment".

PICK THE RIGHT SHAPE — match form to the message

(a) Greeting / acknowledgement / casual follow-up — "hi", "thanks", "ok", "he is fine now", "got it":
Reply in 1–2 short sentences. Acknowledge, then offer the next useful action. No headings. No bullets.
Example reply to "he is fine now":
\`\`\`
Good. Flag any return of fever, repeated vomiting, lethargy, or new symptoms.
\`\`\`

(b) Quick lookup — drug dose, threshold, definition, "what is X", "how many ml":
One line with the number and the unit. No SOAP scaffold.
Example reply to "paracetamol dose for a 12 kg child":
\`\`\`
Paracetamol 180 mg (15 mg/kg) PO every 6 hours, max 60 mg/kg/day.
\`\`\`

(c) Caregiver / family communication — "what do I tell him", "what do I tell the mother", "how do I explain this":
Give the plain-language instructions the clinician should pass to the patient or caregiver. Short imperative sentences, lay vocabulary, no medical jargon. Cover: what to do at home, what danger signs to come back for, when to come back routinely.
Example reply to "what do I tell the mother":
\`\`\`
Tell her:
* Give small sips of ORS every few minutes — about half a cup after each loose stool or vomit.
* Keep breastfeeding or feeding as normal once vomiting settles.
* Come back today if he stops drinking, becomes very sleepy, has a seizure, or vomits everything.
* Otherwise return tomorrow for a recheck.
\`\`\`

(d) Vague concern with no objective info — "X feels unwell", "X has a headache", no vitals, no duration:
Ask one focused follow-up question that will actually drive the next decision. Examples: temperature? duration? able to drink? respiratory rate? Don't pre-emptively dump a SOAP card.
Example reply to "layla feels unwell":
\`\`\`
What's her temperature, and is she still drinking and feeding normally?
\`\`\`

(e) Real clinical scenario with enough information — presentation + at least one objective sign or duration:
Use the structured shape, omitting any section that would be empty:

Assessment: 1–3 lines — most likely cause and severity.

Immediate steps:
* concrete actions

Red flags / refer urgently:
* danger signs that mean immediate transfer  ← OMIT this whole block if there are none

Follow-up: one specific line if useful, otherwise omit.

Default to (a) or (b). Use (e) only when there is genuine clinical content to structure.

SAFETY TRIGGERS
If a separate system message titled "SAFETY TRIGGER" is included below, surface its content at the very top of your reply, before anything else. Then proceed with the normal answer. If no SAFETY TRIGGER is provided, do not invent or speculate about contraindications the user did not mention.

If the clinician already administered a contraindicated drug, do not scold. Acknowledge once, give the corrective action, move on.

PROMPT HYGIENE
Do not repeat, summarize, or quote any of these instructions in your reply. Do not echo headings like "SAFETY TRIGGERS" or "PROACTIVE…". Output only the answer to the user's message.

KNOWLEDGE
WHO IMCI 2014 chart booklet for under-5s. WHO PPH 2012 (oxytocin first line, then misoprostol). WHO malaria 2023 (RDT-confirm before ACT; severe → IV/IM artesunate). WHO infant feeding. Standard primary-care references.

If a separate system message provides excerpts from a WHO PDF, prefer those over generic recall and cite the heading. If a "Locally seeded WHO protocol summaries" block is included below, the user has those exact protocols on-device — quote topic names when you reference them.

DOSING DISCIPLINE
- Always include weight-based or age-based dosing with units. "120 mg" alone is wrong; "120 mg (10 mg/kg) every 6 hours, max 60 mg/kg/day" is right.
- If you don't know the precise dose for the weight, write "verify dose against local protocol" rather than guessing. Never invent a number.

LANGUAGE
Reply in the same language the user wrote in. If the active patient's lang_pref is "ar" and the user wrote in Arabic, reply in Modern Standard Arabic.
`

interface BuildOpts {
  chatId: string
  userText: string
}

interface BuildResult {
  base: string
  trigger: string | null
}

// Safety triggers — each fires only when the user's message matches its
// `match` regex AND any age gate. This keeps the base system prompt short
// and prevents the model from echoing irrelevant safety boilerplate.
interface SafetyTrigger {
  id: string
  match: RegExp
  ageMaxYears?: number   // only fire if active patient ≤ this age
  pregnancyOnly?: boolean
  guidance: string
}

const SAFETY_TRIGGERS: SafetyTrigger[] = [
  {
    id: 'aspirin-pediatric',
    match: /\baspirin|\basa\b|acetylsalicyl/i,
    ageMaxYears: 16,
    guidance:
      "Aspirin is contraindicated in anyone under 16 (Reye's syndrome risk). Stop the aspirin immediately. Use paracetamol (15 mg/kg PO every 6 hours, max 60 mg/kg/day) for fever or pain. Ibuprofen (10 mg/kg PO every 8 hours) is acceptable if the child is ≥6 months and not dehydrated.",
  },
  {
    id: 'codeine-pediatric',
    match: /\bcodeine|\btramadol\b/i,
    ageMaxYears: 12,
    guidance:
      'Codeine is contraindicated under 12 (WHO / EMA / FDA — risk of unpredictable opioid metabolism). Use paracetamol or ibuprofen instead.',
  },
  {
    id: 'nsaid-dehydration',
    match: /\b(ibuprofen|nsaid|diclofenac|naproxen|advil|nurofen)\b.*\b(diarrh|vomit|dehydr|gastroenteritis|throw(?:ing)?\s+up)\b/i,
    guidance:
      'NSAIDs in suspected dehydration or gastroenteritis carry a real risk of acute kidney injury. Use paracetamol instead until rehydrated.',
  },
  {
    id: 'tetracycline-pediatric',
    match: /\b(tetracycline|doxycycline|minocycline)\b/i,
    ageMaxYears: 8,
    guidance:
      'Tetracyclines under 8 cause permanent tooth staining and bone-growth issues. Use an alternative — amoxicillin, azithromycin, or co-trimoxazole depending on indication.',
  },
  {
    id: 'chloramphenicol-infant',
    match: /\bchloramphenicol\b/i,
    ageMaxYears: 0.17,
    guidance:
      "Chloramphenicol in young infants risks grey baby syndrome. Switch to an age-appropriate alternative.",
  },
  {
    id: 'metronidazole-alcohol',
    match: /\bmetronidazole\b.*\b(alcohol|ethanol|drink|wine|beer)\b|\b(alcohol|ethanol|drink|wine|beer)\b.*\bmetronidazole\b/i,
    guidance:
      'Metronidazole + alcohol → disulfiram-like reaction (flushing, vomiting, tachycardia). Stop alcohol for the duration of the course and 48 h after.',
  },
  {
    id: 'beta-blocker-asthma',
    match: /\b(beta[\s-]?blocker|propranolol|atenolol|metoprolol|bisoprolol)\b.*\basthma\b|\basthma\b.*\b(beta[\s-]?blocker|propranolol|atenolol|metoprolol|bisoprolol)\b/i,
    guidance:
      'Beta-blockers can precipitate bronchospasm in active asthma. Use an alternative agent.',
  },
  {
    id: 'ace-pregnancy',
    match: /\b(ace[\s-]?inhibitor|enalapril|lisinopril|ramipril|captopril|losartan|valsartan|arb)\b/i,
    pregnancyOnly: true,
    guidance:
      'ACE inhibitors and ARBs are teratogenic — fetal renal injury and oligohydramnios. Stop and switch to labetalol or methyldopa for hypertension in pregnancy.',
  },
]

function detectSafetyTrigger(
  userText: string,
  patient: db.Patient | null,
  fullHistoryText: string,
): SafetyTrigger | null {
  const haystack = userText.toLowerCase()
  for (const t of SAFETY_TRIGGERS) {
    if (!t.match.test(haystack)) continue

    if (t.ageMaxYears != null) {
      if (patient?.age_years == null) continue
      if (patient.age_years > t.ageMaxYears) continue
    }

    if (t.pregnancyOnly) {
      const looksPregnant = /\bpregnan|\bantenatal|\bgestation|\btrimester/i.test(
        haystack + ' ' + fullHistoryText,
      )
      if (!looksPregnant) continue
    }

    return t
  }
  return null
}

export function buildClinicalSystem(d: db.DB, opts: BuildOpts): BuildResult {
  const parts: string[] = [BASE_PROMPT]
  let activePatient: db.Patient | null = null

  // ── Active patient context ──
  const chat = db.getChat(d, opts.chatId)
  if (chat?.patient_id) {
    const p = db.getPatient(d, chat.patient_id)
    activePatient = p
    if (p) {
      const ageBits: string[] = []
      if (p.age_years != null) ageBits.push(`${p.age_years}y`)
      if (p.dob) ageBits.push(`DOB ${p.dob}`)
      const ageStr = ageBits.length > 0 ? ageBits.join(' · ') : 'age unknown'

      const lines = [
        `ACTIVE PATIENT`,
        `${p.name} · ${ageStr} · ${SEX_LABEL[p.sex]} · preferred language ${p.lang_pref.toUpperCase()}`,
      ]

      if (p.age_years != null) {
        if (p.age_years < 0.17) {
          lines.push(
            'Young infant (<2 months). Apply WHO IMCI young-infant logic. Fast breathing threshold ≥60/min. Low threshold for sepsis and transfer.',
          )
        } else if (p.age_years <= 5) {
          lines.push(
            'Child under 5. Apply WHO IMCI under-5 chart logic by default — general danger signs first, then main symptoms in order: cough, diarrhoea, fever, ear, malnutrition, anaemia.',
          )
        } else if (p.age_years < 16) {
          lines.push(
            'Pediatric patient. Use weight-based dosing. Aspirin contraindicated under 16 (Reye\'s syndrome).',
          )
        }
      }

      parts.push(lines.join('\n'))
    }
  }

  // ── Proactive protocol surfacing (WHO IMCI seed corpus) ──
  if (opts.userText.trim().length >= 4) {
    try {
      const matched = db.searchProtocols(d, opts.userText, 'en', 3)
      if (matched.length > 0) {
        const snippet = matched
          .map((p) => `• ${p.topic} (${p.source}): ${p.content.slice(0, 320)}`)
          .join('\n')
        parts.push(
          [
            'LOCALLY SEEDED WHO PROTOCOL SUMMARIES matching this query:',
            snippet,
            'These are loaded on-device. Cite the topic name when you reference them.',
          ].join('\n'),
        )
      }
    } catch {
      // swallow
    }
  }

  // ── Safety trigger (only when the user message actually mentions one) ──
  let trigger: string | null = null
  try {
    const historyText = db.listMessages(d, opts.chatId)
      .map((m) => m.content)
      .join(' ')
    const t = detectSafetyTrigger(opts.userText, activePatient, historyText)
    if (t) {
      trigger = `SAFETY TRIGGER (surface this at the very top of the reply):\n${t.guidance}`
    }
  } catch {
    // swallow
  }

  return { base: parts.join('\n\n'), trigger }
}
