/**
 * Hand-curated dense summary of WHO Cholera Outbreak Response Field Manual.
 * Replaces whatever raw chunks are currently stored for the cholera doc with
 * this tight set, one chunk per clinical topic. Re-runnable.
 *
 *   npm --prefix server run seed:cholera
 */
import { resolve } from 'node:path'
import { randomUUID } from 'node:crypto'
import * as db from '../db.js'

interface SummaryChunk {
  heading: string
  page: number
  text: string
}

// Sourced from WHO + Global Task Force on Cholera Control field guidance.
// Each entry is a stand-alone retrieval target — keep doses, thresholds and
// decision rules verbatim.
const SUMMARIES: SummaryChunk[] = [
  {
    heading: 'Case definition',
    page: 8,
    text: `- Suspected cholera (no outbreak declared, area >5y since last outbreak): any patient ≥2y with acute watery diarrhoea AND severe dehydration OR death from acute watery diarrhoea.
- Suspected cholera (outbreak area or known cholera-affected area): any patient ≥2y presenting with acute watery diarrhoea, with or without vomiting.
- Confirmed cholera: a suspected case with stool culture or PCR positive for Vibrio cholerae O1 or O139.
- Outbreak declared: at least 1 confirmed case of V. cholerae O1/O139 + epidemiological evidence of local transmission.`,
  },
  {
    heading: 'Dehydration assessment (WHO IMCI grades)',
    page: 24,
    text: `- Severe dehydration (Plan C): two or more of — lethargic/unconscious, sunken eyes, drinks poorly or unable to drink, skin pinch goes back very slowly (≥2 s).
- Some dehydration (Plan B): two or more of — restless/irritable, sunken eyes, drinks eagerly/thirsty, skin pinch goes back slowly.
- No dehydration (Plan A): not enough signs to classify as some/severe.
- Reassess every 1-2 h on Plan B, every 15-30 min on Plan C until hydrated.`,
  },
  {
    heading: 'Plan A — no dehydration, home management',
    page: 26,
    text: `- Give extra fluids after each loose stool: <2 y → 50-100 ml; 2-9 y → 100-200 ml; ≥10 y → as much as wanted.
- Continue feeding (breastfeeding, age-appropriate diet). Do not stop food.
- Zinc for children 2 mo - 5 y: 10 mg/day if <6 mo; 20 mg/day if ≥6 mo, for 10-14 days.
- Return immediately if: many watery stools, repeated vomiting, marked thirst, fever, blood in stool, drinks poorly.`,
  },
  {
    heading: 'Plan B — some dehydration, ORS in clinic',
    page: 27,
    text: `- ORS volume in first 4 h = body weight (kg) × 75 ml. If weight unknown: <4 mo (<6 kg) 200-400 ml; 4-11 mo (6-9.9 kg) 400-700 ml; 12-23 mo (10-11.9 kg) 700-900 ml; 2-4 y (12-19 kg) 900-1400 ml; 5-14 y (20-29 kg) 1400-2200 ml; ≥15 y (≥30 kg) 2200-4000 ml.
- Give frequent small sips by cup or spoon. If vomiting, wait 10 min then resume more slowly.
- Reassess after 4 h: reclassify hydration status and choose Plan A, B or C.
- Continue breastfeeding throughout. Add zinc as in Plan A.`,
  },
  {
    heading: 'Plan C — severe dehydration, IV resuscitation',
    page: 28,
    text: `- First-line IV fluid: Ringer's lactate (preferred). Acceptable: normal saline. Avoid plain dextrose.
- Adults and children ≥1 y: 100 ml/kg total — 30 ml/kg in first 30 min, then 70 ml/kg in next 2.5 h.
- Infants <1 y: 100 ml/kg total — 30 ml/kg in first 1 h, then 70 ml/kg in next 5 h.
- Reassess pulse, mental status, skin pinch every 15-30 min. If radial pulse not detectable, repeat the first bolus.
- Start ORS (about 5 ml/kg/h) by mouth as soon as patient can drink, usually after 3-4 h in children, 1-2 h in adults.
- Reassess after total IV completed: if still severe dehydration, repeat. If improved to some, switch to Plan B with ORS.`,
  },
  {
    heading: 'Antibiotics — when to give',
    page: 32,
    text: `- Indicated only for: severe dehydration; some dehydration with high purging; comorbidity (severe acute malnutrition, pregnancy, HIV); suspected cholera in elderly with comorbidities.
- Antibiotics shorten illness, reduce stool volume by ~50%, shorten shedding. They do NOT replace rehydration.
- Choice should reflect local susceptibility data; the GTFCC keeps a running susceptibility table per country.`,
  },
  {
    heading: 'Antibiotic regimens (first-line)',
    page: 33,
    text: `- Adults (non-pregnant): doxycycline 300 mg PO single dose (first-line where susceptible).
- Pregnancy: azithromycin 1 g PO single dose.
- Children: azithromycin 20 mg/kg PO single dose (max 1 g).
- Alternatives where doxycycline resistant: ciprofloxacin 1 g PO single dose (adults) or 20 mg/kg single dose (children, max 1 g); azithromycin as above.
- Erythromycin 12.5 mg/kg PO 4× daily for 3 days is an option in children if azithromycin unavailable.`,
  },
  {
    heading: 'Severe acute malnutrition + cholera',
    page: 35,
    text: `- Do NOT use standard Plan C: high risk of fluid overload and heart failure.
- Use ReSoMal ORS (lower sodium, higher potassium): 5 ml/kg every 30 min for first 2 h, then 5-10 ml/kg/h alternating with F-75 milk.
- IV only if shock present: half-strength Darrow's with 5% dextrose, or Ringer's lactate + 5% dextrose, 15 ml/kg over 1 h, reassess.
- Monitor closely for signs of overhydration (increased respiratory rate, puffy eyelids).
- Add antibiotics per SAM protocol (broad-spectrum) plus cholera-specific agent.`,
  },
  {
    heading: 'Oral Rehydration Points (ORPs)',
    page: 56,
    text: `- ORPs are community-level entry points: triage, ORS for Plan A/B, refer Plan C to a Cholera Treatment Unit/Centre.
- Staffed by community health workers, open continuously during an outbreak, located within 1-2 h walk of affected populations.
- Minimum supplies per ORP: ORS sachets, clean water, drinking cups, soap, chlorine (0.05% / 0.2% / 2% solutions), gloves, registers, referral forms.
- Each suspected case is logged (line list) and reported daily up the surveillance chain.`,
  },
  {
    heading: 'Cholera Treatment Unit / Centre setup (CTU / CTC)',
    page: 60,
    text: `- One-way patient flow: triage → observation (some dehydration) → hospitalisation (severe) → recovery → exit. No backtracking.
- Cholera beds (holed) over buckets with chlorine; separate cubicles for paediatric, adult, severe.
- Dedicated WaSH zone: handwashing at every threshold (0.05% chlorine), foot baths (0.2%), waste/excreta in 2% chlorine for ≥30 min before disposal.
- Staff PPE: gown, gloves, closed shoes, apron in high-soiling areas. Strict hand hygiene 5 moments.
- Stock buffer: ≥1 week of ORS, IV fluids, antibiotics, chlorine, beds for projected attack rate.`,
  },
  {
    heading: 'Laboratory diagnosis',
    page: 40,
    text: `- Rapid diagnostic test (RDT) on stool: useful for outbreak alert and surveillance, NOT for individual case confirmation. Sensitivity ~90%, specificity ~80%.
- Confirmation: stool culture on TCBS / taurocholate-tellurite-gelatin agar; or PCR for ctxA / O1 rfb / O139 wbf genes.
- Send first 5-10 suspected stool samples per outbreak to reference lab; thereafter only enough to monitor strain and antibiotic susceptibility.
- Transport medium: Cary-Blair at ambient temperature; viable up to 4 weeks. Do not refrigerate.`,
  },
  {
    heading: 'Surveillance and case reporting',
    page: 14,
    text: `- Daily line list per treatment site: name/ID, age, sex, address, date of onset, date seen, dehydration on arrival, treatment plan, outcome.
- Weekly aggregated indicators: attack rate, case-fatality ratio (CFR), proportion <5y, proportion severe.
- CFR target during outbreak: <1%. CFR ≥1% triggers urgent case management review (training, supplies, access).
- Notify WHO via IHR if outbreak meets unusual/unexpected criteria; report under the GTFCC global tracking dashboard.`,
  },
  {
    heading: 'Infection prevention and control (IPC)',
    page: 70,
    text: `- Five moments of hand hygiene; alcohol-based handrub or soap+water.
- Chlorine concentrations: 0.05% (hands, bodies), 0.2% (surfaces, floors, gloves, equipment), 2% (corpses, vomit, stool, severely contaminated waste).
- Body of deceased: disinfect with 2% chlorine, plug orifices, body bag, no traditional washing; rapid burial within 24 h, supervised funerals only.
- No visitors in high-care zones; designated caregiver only, instructed in hand hygiene.`,
  },
  {
    heading: 'Water, Sanitation and Hygiene (WaSH)',
    page: 80,
    text: `- Safe water: aim for ≥0.5 mg/L free residual chlorine at point of use; ≥7.5 L/person/day in stable settings, ≥15 L in CTUs.
- Household water treatment options: chlorination (Aquatabs / NaDCC), boiling (rolling boil 1 min), filtration + chlorination, solar disinfection (SODIS) as last resort.
- Sanitation: 1 latrine / 20 people target; ≥30 m from water sources; handwashing station with soap or chlorinated water at every latrine.
- Hygiene promotion focus: handwashing with soap (especially after defecation, before food), safe food (cooked hot, peeled fruit), safe storage of treated water in narrow-neck containers.`,
  },
  {
    heading: 'Oral cholera vaccine (OCV)',
    page: 95,
    text: `- Inactivated oral vaccines (Shanchol, Euvichol, Euvichol-Plus, Dukoral) — WHO-prequalified.
- Standard schedule: 2 doses ≥14 days apart for ≥1 y old; protection ≥65% for ≥3 years after 2 doses.
- Reactive vaccination during outbreak: single dose acceptable if supply limited (≥40% short-term protection, 6-month horizon).
- Co-administer with case management, WaSH and risk communication — vaccine alone does not stop transmission.
- Request from the global OCV stockpile via the ICG (International Coordinating Group) within days of outbreak declaration.`,
  },
  {
    heading: 'Risk communication and community engagement',
    page: 105,
    text: `- Three priority messages: (1) seek care immediately for any acute watery diarrhoea, especially with vomiting; (2) drink only safe water; (3) wash hands with soap.
- Engage community leaders, religious leaders, traditional healers; tailor messages to local language, literacy, beliefs.
- Address rumours and myths actively (vaccination, burial practices, food taboos).
- Pre-test all materials with target audience before mass distribution.`,
  },
  {
    heading: 'Outbreak alert and response thresholds',
    page: 12,
    text: `- Alert threshold (low-risk areas): a single confirmed cholera case OR a sudden rise in acute watery diarrhoea — investigate within 48 h.
- Outbreak response activated when alert is confirmed: case management scale-up, lab confirmation, multi-sector coordination cell, daily situation reports.
- Closing an outbreak: no new confirmed case for at least 2 incubation periods (≥4 weeks) AND active surveillance maintained.
- Hotspot definition (GTFCC): geographically limited area with persistent or recurrent cholera; targeted multi-year multi-sector intervention.`,
  },
  {
    heading: 'Pregnancy considerations',
    page: 36,
    text: `- Rehydrate aggressively: maternal dehydration is the main driver of foetal loss; do not under-treat.
- Antibiotic of choice: azithromycin 1 g PO single dose; avoid doxycycline and ciprofloxacin.
- Continue normal obstetric monitoring (foetal heart, contractions). Premature labour is a recognised complication of severe cholera.
- Do not withhold IV fluids over fears of overload; hypovolaemic shock is the greater risk.`,
  },
]

async function main() {
  const dataDir = resolve(
    process.env.DATA_DIR ?? new URL('../../../data', import.meta.url).pathname,
  )
  const d = db.openDb(resolve(dataDir, 'medstick.db'))

  let doc = db.listDocuments(d).find((x) => /chol(e|é)ra/i.test(x.title))
  if (!doc) {
    // Ingest hasn't happened — create a stub document so the tool/UI find it.
    doc = db.insertDocument(d, {
      title: 'WHO Cholera Outbreak Response Field Manual',
      source_path: null,
      pdf_hash: `seed:cholera:${randomUUID()}`,
      page_count: 148,
      lang: 'en',
    })
    console.log(`→ created stub document ${doc.id}`)
  } else {
    console.log(`→ replacing chunks of "${doc.title}" (${doc.id})`)
  }

  const tx = d.transaction(() => {
    d.prepare('DELETE FROM document_chunks WHERE document_id = ?').run(doc!.id)
    const stmt = d.prepare(`INSERT INTO document_chunks
      (id, document_id, ord, page_start, page_end, heading, text, vec, created_at)
      VALUES (@id, @document_id, @ord, @page_start, @page_end, @heading, @text, @vec, @created_at)`)
    const created_at = new Date().toISOString()
    SUMMARIES.forEach((s, i) => {
      stmt.run({
        id: randomUUID(),
        document_id: doc!.id,
        ord: i,
        page_start: s.page,
        page_end: s.page,
        heading: s.heading,
        text: s.text,
        vec: Buffer.alloc(0),
        created_at,
      })
    })
  })
  tx()

  const total = SUMMARIES.reduce((a, s) => a + s.text.length, 0)
  console.log(`✓ "${doc.title}" — ${SUMMARIES.length} curated chunks, ${total.toLocaleString()} chars`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
