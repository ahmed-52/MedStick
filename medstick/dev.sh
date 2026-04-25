#!/bin/bash
cd "$(dirname "$0")"

mkdir -p data/photos data/logs

LLAMA_PID=""
NODE_PID=""
WEB_PID=""

# ── llama-server: reuse if 8080 is already healthy, otherwise start one ──
if curl -sf http://127.0.0.1:8080/health >/dev/null 2>&1; then
  echo "✓ llama-server already running on :8080 — reusing it."
else
  if [ -x "bin/llama-server" ]; then
    LLAMA_BIN="./bin/llama-server"
  elif [ -x "bin/llama-b8931/llama-server" ]; then
    LLAMA_BIN="./bin/llama-b8931/llama-server"
  elif command -v llama-server >/dev/null; then
    LLAMA_BIN="$(command -v llama-server)"
  fi

  MODEL=$(ls models/*.gguf 2>/dev/null | grep -v mmproj | head -n1 || true)
  MMPROJ=$(ls models/*mmproj*.gguf 2>/dev/null | head -n1 || true)

  if [ -z "$LLAMA_BIN" ] || [ -z "$MODEL" ]; then
    echo "⚠ llama-server or GGUF model missing — chat will be disabled."
    echo "  Frontend HMR still works; UI loads with model offline indicator."
  else
    LLAMA_ARGS=(-m "$MODEL" -c 8192 --port 8080 --host 127.0.0.1)
    if [ -n "$MMPROJ" ]; then
      LLAMA_ARGS+=(--mmproj "$MMPROJ")
      echo "→ Vision projector: $MMPROJ"
    fi
    echo "→ Starting llama-server ($MODEL)…"
    "$LLAMA_BIN" "${LLAMA_ARGS[@]}" > data/logs/llama-dev.log 2>&1 &
    LLAMA_PID=$!

    for i in {1..60}; do
      if curl -sf http://127.0.0.1:8080/health >/dev/null 2>&1; then break; fi
      sleep 1
      if [ "$i" = "60" ]; then
        echo "⚠ llama-server didn't become ready in 60s (see data/logs/llama-dev.log) — continuing without warm-up."
      fi
    done

    curl -sf -X POST http://127.0.0.1:8080/v1/chat/completions \
      -H 'content-type: application/json' \
      -d '{"messages":[{"role":"user","content":"hi"}],"max_tokens":1}' >/dev/null 2>&1 || true
  fi
fi

# ── Express in watch mode ──
# If something else is on :3000 (e.g. previous start.sh), stop it first.
if lsof -ti :3000 >/dev/null 2>&1; then
  echo "→ :3000 already in use — stopping previous process."
  lsof -ti :3000 | xargs kill 2>/dev/null || true
  sleep 1
fi

echo "→ Starting API server in watch mode (tsx watch)…"
DATA_DIR="$(pwd)/data" PORT=3000 \
  npm --prefix server run dev > data/logs/server-dev.log 2>&1 &
NODE_PID=$!

for i in {1..30}; do
  if curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1; then break; fi
  sleep 1
  if [ "$i" = "30" ]; then
    echo "⚠ API server didn't become ready in 30s — see data/logs/server-dev.log"
  fi
done

# ── Next.js dev server (HMR — output goes to terminal so you see HMR + errors) ──
if lsof -ti :5173 >/dev/null 2>&1; then
  echo "→ :5173 already in use — stopping previous process."
  lsof -ti :5173 | xargs kill 2>/dev/null || true
  sleep 1
fi

echo
echo "✓ MedStick dev mode running."
[ -n "$LLAMA_PID" ] && echo "    llama-server   pid=$LLAMA_PID  (log: data/logs/llama-dev.log)"
echo "    api server     pid=$NODE_PID   (log: data/logs/server-dev.log)"
echo "    web (Next dev) → http://localhost:5173"
echo
echo "  Edits in web/    → instant HMR in browser"
echo "  Edits in server/ → automatic restart (tail data/logs/server-dev.log)"
echo "  Ctrl+C to stop everything."
echo

if command -v open >/dev/null; then
  (sleep 2 && open -a "Google Chrome" http://localhost:5173) >/dev/null 2>&1 &
fi

cleanup() {
  echo
  echo "→ shutting down…"
  [ -n "$WEB_PID" ] && kill $WEB_PID 2>/dev/null || true
  [ -n "$NODE_PID" ] && kill $NODE_PID 2>/dev/null || true
  [ -n "$LLAMA_PID" ] && kill $LLAMA_PID 2>/dev/null || true
  wait 2>/dev/null || true
}
trap cleanup EXIT INT TERM

# Foreground next dev so HMR / build output is visible right here.
npm --prefix web run dev &
WEB_PID=$!
wait $WEB_PID
