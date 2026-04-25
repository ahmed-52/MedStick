#!/bin/bash
set -e
cd "$(dirname "$0")"

# Locate llama-server (prefer bundled bin/, fall back to PATH)
if [ -x "bin/llama-server" ]; then
  LLAMA_BIN="./bin/llama-server"
elif [ -x "bin/llama-b8931/llama-server" ]; then
  LLAMA_BIN="./bin/llama-b8931/llama-server"
elif command -v llama-server >/dev/null; then
  LLAMA_BIN="$(command -v llama-server)"
else
  echo "ERROR: llama-server not found in bin/ or on PATH" >&2
  exit 1
fi

# Pick model files
MODEL=$(ls models/*.gguf 2>/dev/null | grep -v mmproj | head -n1 || true)
MMPROJ=$(ls models/*mmproj*.gguf 2>/dev/null | head -n1 || true)

if [ -z "$MODEL" ]; then
  echo "ERROR: no GGUF model found in models/" >&2
  exit 1
fi

# Build web/server if outputs missing
if [ ! -d "web/out" ]; then
  echo "→ Building web (Next.js static export)…"
  npm --prefix web run build
fi
if [ ! -d "server/dist" ]; then
  echo "→ Building server…"
  npm --prefix server run build
fi

mkdir -p data/photos data/logs

LLAMA_ARGS=(-m "$MODEL" -c 4096 --port 8080 --host 127.0.0.1)
if [ -n "$MMPROJ" ]; then
  LLAMA_ARGS+=(--mmproj "$MMPROJ")
  echo "→ Vision projector: $MMPROJ"
else
  echo "⚠ No mmproj projector found — image modes will fall back to text-only."
fi

echo "→ Starting llama-server ($MODEL)…"
"$LLAMA_BIN" "${LLAMA_ARGS[@]}" > data/logs/llama.log 2>&1 &
LLAMA_PID=$!

# Wait for llama
for i in {1..60}; do
  if curl -sf http://127.0.0.1:8080/health >/dev/null 2>&1; then break; fi
  sleep 1
  if [ "$i" = "60" ]; then
    echo "ERROR: llama-server did not become ready (see data/logs/llama.log)" >&2
    kill $LLAMA_PID 2>/dev/null
    exit 1
  fi
done

# Warm up the model with a dummy request (mitigates first-token latency on stage)
curl -sf -X POST http://127.0.0.1:8080/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"hi"}],"max_tokens":1}' > /dev/null 2>&1 || true

echo "→ Starting node server…"
WEB_DIR="$(pwd)/web/out" DATA_DIR="$(pwd)/data" PORT=3000 \
  node server/dist/index.js > data/logs/server.log 2>&1 &
NODE_PID=$!

for i in {1..30}; do
  if curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1; then break; fi
  sleep 1
  if [ "$i" = "30" ]; then
    echo "ERROR: node server did not become ready (see data/logs/server.log)" >&2
    kill $LLAMA_PID $NODE_PID 2>/dev/null
    exit 1
  fi
done

echo
echo "✓ MedStick is running."
echo "  llama-server  pid=$LLAMA_PID  log=data/logs/llama.log"
echo "  node server   pid=$NODE_PID   log=data/logs/server.log"
echo "  → http://localhost:3000"
echo
echo "Ctrl+C to stop everything."
echo

if command -v open >/dev/null; then
  (sleep 1 && open -a "Google Chrome" http://localhost:3000) &
fi

cleanup() {
  echo
  echo "→ shutting down…"
  kill $LLAMA_PID $NODE_PID 2>/dev/null || true
  wait 2>/dev/null
}
trap cleanup EXIT INT TERM
wait
