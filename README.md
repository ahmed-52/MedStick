# MedStick

**Offline-first AI clinical assistant for health workers in low-resource and humanitarian settings.**

MedStick runs entirely on a laptop — no internet, no cloud API calls. A field worker or nurse carries it into areas with no connectivity and gets a clinical AI that can answer dosing questions, run WHO IMCI triage logic, perform RAG over ingested WHO PDFs, and maintain a full patient record — all inference local via llama.cpp + MedGemma 4B.

> The `hospital_ui/` folder in this repo contains a separate React dashboard showing how a regional hospital command center would monitor field workers. This app (in `medstick/`) is the offline worker-side system.


https://github.com/user-attachments/assets/d786ca72-8b45-4883-8214-bfe943390a24


---

## What it does

**AI chat grounded in real clinical knowledge**
- Conversational clinical Q&A — talks like a peer clinician, not a form-filler
- Automatic WHO IMCI protocol surfacing: seeded bilingual (EN/AR) protocol chunks are matched against every query and injected into context
- Cholera quick-reference block fires automatically on any cholera mention (including misspellings and Arabic كوليرا)
- Patient-aware context: active patient's age, sex, and preferred language injected into every turn; IMCI age-bracket logic (young infant / under-5 / pediatric) applied automatically
- Contraindication safety triggers: aspirin in under-16 (Reye's), codeine under-12, tetracyclines under-8, NSAIDs + dehydration, metronidazole + alcohol, beta-blockers + asthma, ACE inhibitors + pregnancy — each fires only when the message matches AND the patient context fits

**RAG over WHO PDFs**
- Ingest any WHO/MSF clinical PDF with `npm --prefix server run ingest -- path/to/doc.pdf`
- Text extracted via pdfjs-dist, split into ~500-token paragraph-aware chunks, stored in SQLite
- Keyword-scored retrieval (BM25-style, no embedder needed) pulls top-4 chunks per query and injects them as a grounded context block
- Documents appear in **Library → Documents**; tap "Attach to chat" to ground replies in them

**Patient records & encounters**
- Create and search patients (name, age, sex, preferred language)
- Attach chats to a patient; all conversations persist in SQLite
- Photo capture route for wound/rash documentation

**Prompt eval suite**
- 16 regression cases covering: refusal/hedging detection, SOAP scaffold suppression, contraindication triggering, dosing precision, IMCI danger signs, caregiver communication, and system-prompt leak prevention
- Run with `npm --prefix server run eval` against a live server

---

## Stack

| Layer | Tech |
|---|---|
| Inference | llama.cpp `llama-server` + MedGemma 4B IT (Q4_K_M GGUF) |
| Vision | MedGemma multimodal projector (mmproj GGUF) |
| Backend | Node.js + Express + SQLite (better-sqlite3) |
| Frontend | Next.js (static export) — PWA, phone-shaped |
| RAG | pdfjs-dist ingestion + keyword scoring, chunks in SQLite |
| Protocols | Bilingual WHO IMCI seed corpus, FTS via SQLite |

---

## Project layout

```
medstick/
├── start.sh              launcher — boots llama-server + node + Chrome
├── dev.sh                dev launcher (HMR)
├── web/                  Next.js PWA (static export)
│   ├── app/
│   │   ├── (dashboard)/chat/       AI chat interface
│   │   ├── (dashboard)/patients/   patient list & records
│   │   ├── (dashboard)/library/    WHO documents & protocols
│   │   └── (dashboard)/settings/   model + app settings
│   └── ...
├── server/               Node + Express API
│   └── src/
│       ├── index.ts          server entry, routes mount
│       ├── db.ts             SQLite schema + queries
│       ├── systemPrompt.ts   clinical system prompt, safety triggers, cholera block
│       ├── rag.ts            keyword-scored PDF RAG
│       ├── llama.ts          llama-server proxy + streaming
│       ├── routes/           patients, chats, chat (streaming), photos, encounters, protocols, documents
│       └── scripts/
│           ├── ingest.ts     PDF → chunks → SQLite
│           ├── eval.ts       prompt regression suite (16 cases)
│           └── seedPatients.ts
├── seed/protocols.json   bilingual WHO IMCI protocol chunks
└── data/                 SQLite DB + photos (created at runtime)
```

---

## One-time setup

1. Install dependencies:
   ```bash
   npm --prefix web install
   npm --prefix server install
   ```

2. Place the llama.cpp `llama-server` binary at `bin/llama-server` (or `bin/llama-b8931/llama-server` — both are detected).

3. Place GGUF weights in `models/`:
   - `medgemma-4b-it-Q4_K_M.gguf` — text model (required)
   - `mmproj-medgemma-4b-it-f16.gguf` — vision projector (required for image features)

---

## Run

```bash
./start.sh
```

Boots `llama-server` on `:8080`, warms the model, starts the Node API on `:3000`, then opens Chrome to `http://localhost:3000`. Ctrl+C kills everything.

For the demo: open Chrome DevTools → device toolbar → Pixel 7. The laptop can be on airplane mode — everything is localhost.

---

## Ingest a WHO PDF

With `start.sh` running:

```bash
npm --prefix server run ingest -- path/to/cholera.pdf
```

Re-ingesting the same file is a no-op (idempotent on SHA-256). The document then appears in **Library → Documents**.

---

## Dev (with HMR)

```bash
npm --prefix server run dev   # tsx watch on :3000
npm --prefix web run dev      # vite on :5173, proxies /api → :3000
```

---

## Eval

```bash
npm --prefix server run eval
```

Runs 16 regression cases against the live server. Checks for refusals, SOAP scaffold suppression, correct dosing numbers, contraindication surfacing, and prompt-leak prevention. Exits 1 if any case fails.

---

## Judging notes

**Impact** — Targets health workers in active conflict zones and humanitarian emergencies (designed around Yemen). Offline-first means it works where internet is unavailable or unsafe. Bilingual (EN/AR). Trained on WHO/MSF protocols, not generic internet text.

**Technical execution** — Fully functional: chat, patient records, PDF RAG, safety triggers, and a prompt eval suite all work end-to-end. All inference is on-device; the demo runs on airplane mode.

**Ethical alignment** — No data leaves the device. Clinical safety triggers are hard-coded (not model-dependent) so they fire reliably. The system prompt is tuned to never refuse a clinician or add unhelpful disclaimers — the goal is to expand access, not gatekeep.
