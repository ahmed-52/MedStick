# MedStick

Offline-first AI-assisted clinical workspace for rural and humanitarian-setting health workers. Phone-shaped PWA, all inference local via llama.cpp + MedGemma 4B.

## Layout

```
medstick/
├── start.sh              launcher (spawns llama-server + node + Chrome)
├── web/                  Vite + React PWA
├── server/               Node + Express + SQLite
├── seed/protocols.json   bilingual WHO chunks
├── bin/                  drop llama-server here
├── models/               drop GGUF weights here
└── data/                 SQLite DB + photos (created at runtime)
```

## One-time setup

1. Install deps:
   ```bash
   npm --prefix web install
   npm --prefix server install
   ```
2. Place the llama.cpp `llama-server` binary at `bin/llama-server` (or `bin/llama-b8931/llama-server` — both work).
3. Place GGUF weights in `models/`:
   - `medgemma-4b-it-Q4_K_M.gguf` (text — required)
   - `mmproj-medgemma-4b-it-f16.gguf` (vision projector — required for image modes)

## Run

```bash
./start.sh
```

The launcher boots `llama-server` on `:8080`, the Node API on `:3000`, warms the model, then opens Chrome to http://localhost:3000. Ctrl+C kills both.

## Dev

Run server and web independently with HMR:

```bash
npm --prefix server run dev   # tsx watch on :3000
npm --prefix web run dev      # vite on :5173, proxies /api → :3000
```

(You still need `llama-server` running for chat to work.)

## Demo

For the on-stage demo, open Chrome DevTools, toggle the device toolbar, and pick Pixel 7 — the PWA presents as a phone. The laptop can be on airplane mode; everything is localhost.
