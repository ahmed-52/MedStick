#!/bin/bash
# Build a self-contained MedStick distribution ready to copy onto a USB-C stick.
# Output: dist-stick/ — drop this folder on the stick and run ./start.sh.
#
# Platform: same OS + arch as the machine that runs this script (better-sqlite3
# and llama-server are native binaries). Run on macOS arm64 to ship to macOS
# arm64, etc.

set -e
cd "$(dirname "$0")"

ROOT="$(pwd)"
OUT="$ROOT/dist-stick"
SKIP_MODELS="${SKIP_MODELS:-0}"
EMBED_NODE="${EMBED_NODE:-1}"

echo "▸ MedStick stick packager"
echo "  source:  $ROOT"
echo "  target:  $OUT"
echo

# 0. Sanity: required binaries / models present
if [ ! -d "bin" ] || [ -z "$(find bin -name llama-server -type f 2>/dev/null)" ]; then
  echo "✗ bin/llama-server not found. Drop the llama.cpp build into bin/ first." >&2
  exit 1
fi
if [ "$SKIP_MODELS" != "1" ]; then
  if [ -z "$(ls models/*.gguf 2>/dev/null)" ]; then
    echo "✗ no GGUF model in models/. Drop weights in or run with SKIP_MODELS=1." >&2
    exit 1
  fi
fi

# 1. Reset output dir
echo "▸ resetting $OUT"
rm -rf "$OUT"
mkdir -p "$OUT"

# 2. Build web (static export with PWA service worker)
echo "▸ building web (next.js static export + PWA)"
npm --prefix web run build

# 3. Build server (tsc → dist)
echo "▸ building server (tsc)"
npm --prefix server run build

# 4. Copy artifacts
echo "▸ copying artifacts"
mkdir -p "$OUT/web" "$OUT/server" "$OUT/data/photos" "$OUT/data/logs"
cp -R web/out          "$OUT/web/out"
cp -R server/dist      "$OUT/server/dist"
cp    server/package.json "$OUT/server/package.json"
cp -R bin              "$OUT/bin"
cp -R seed             "$OUT/seed" 2>/dev/null || true
[ -f logo.svg ]    && cp logo.svg    "$OUT/logo.svg"
[ -f README.md ]   && cp README.md   "$OUT/README.md"

# 5. Models (largest payload — opt-out via SKIP_MODELS=1)
if [ "$SKIP_MODELS" = "1" ]; then
  echo "▸ skipping models (SKIP_MODELS=1)"
  mkdir -p "$OUT/models"
  echo "Drop GGUF weights here before launch." > "$OUT/models/README.txt"
else
  echo "▸ copying models (this is the slow part — 3+ GB)"
  cp -R models "$OUT/models"
fi

# 6. Optionally embed a portable Node distribution so the stick is self-contained.
#    We download from nodejs.org rather than copying $(which node) because
#    Homebrew's node is a 68KB shim that needs external dylibs from the Cellar
#    and won't run on a fresh target machine.
PORTABLE_NODE_VERSION="${PORTABLE_NODE_VERSION:-v20.18.1}"
PORTABLE_NODE_DIR=""
if [ "$EMBED_NODE" = "1" ]; then
  case "$(uname -s)-$(uname -m)" in
    Darwin-arm64)  NODE_TARBALL_ARCH="darwin-arm64" ;;
    Darwin-x86_64) NODE_TARBALL_ARCH="darwin-x64" ;;
    Linux-x86_64)  NODE_TARBALL_ARCH="linux-x64" ;;
    Linux-aarch64) NODE_TARBALL_ARCH="linux-arm64" ;;
    *) echo "⚠ unsupported platform for portable node embed; skipping" >&2 ;;
  esac
  if [ -n "${NODE_TARBALL_ARCH:-}" ]; then
    NODE_PKG="node-${PORTABLE_NODE_VERSION}-${NODE_TARBALL_ARCH}"
    NODE_URL="https://nodejs.org/dist/${PORTABLE_NODE_VERSION}/${NODE_PKG}.tar.gz"
    CACHE_DIR="$ROOT/.node-cache"
    mkdir -p "$CACHE_DIR"
    if [ ! -d "$CACHE_DIR/$NODE_PKG" ]; then
      echo "▸ downloading portable node ($NODE_URL)"
      curl -fsSL "$NODE_URL" | tar -xz -C "$CACHE_DIR"
    else
      echo "▸ using cached portable node ($CACHE_DIR/$NODE_PKG)"
    fi
    PORTABLE_NODE_DIR="$CACHE_DIR/$NODE_PKG"
    mkdir -p "$OUT/bin/node-runtime"
    cp -R "$PORTABLE_NODE_DIR/bin"     "$OUT/bin/node-runtime/bin"
    cp -R "$PORTABLE_NODE_DIR/lib"     "$OUT/bin/node-runtime/lib"
    cp -R "$PORTABLE_NODE_DIR/include" "$OUT/bin/node-runtime/include" 2>/dev/null || true
    ln -sf node-runtime/bin/node "$OUT/bin/node"
  fi
fi

# 7. Production-only node_modules for the server, built against the embedded
#    node so native modules (better-sqlite3) load on the target machine.
echo "▸ installing server production deps into bundle"
if [ -n "$PORTABLE_NODE_DIR" ]; then
  PORTABLE_BIN="$PORTABLE_NODE_DIR/bin"
  ( cd "$OUT/server" && \
    PATH="$PORTABLE_BIN:$PATH" \
    npm_config_target="${PORTABLE_NODE_VERSION#v}" \
    "$PORTABLE_BIN/npm" install --omit=dev --build-from-source --no-audit --no-fund --silent )
else
  ( cd "$OUT/server" && npm install --omit=dev --no-audit --no-fund --silent )
fi

# 8. Launcher inside the bundle (uses bin/node if present, else PATH node)
cat > "$OUT/start.sh" <<'LAUNCH'
#!/bin/bash
set -e
cd "$(dirname "$0")"

# Pick node: prefer bundled portable runtime, fall back to host PATH
if [ -x "bin/node-runtime/bin/node" ]; then
  NODE_BIN="./bin/node-runtime/bin/node"
elif [ -x "bin/node" ]; then
  NODE_BIN="./bin/node"
elif command -v node >/dev/null; then
  NODE_BIN="$(command -v node)"
else
  echo "ERROR: node not found. Install Node 20+ or rebuild stick with EMBED_NODE=1." >&2
  exit 1
fi

# Pick llama-server: prefer bundled bin/, fall back to PATH
if [ -x "bin/llama-server" ]; then
  LLAMA_BIN="./bin/llama-server"
elif [ -x "bin/llama-b8931/llama-server" ]; then
  LLAMA_BIN="./bin/llama-b8931/llama-server"
elif command -v llama-server >/dev/null; then
  LLAMA_BIN="$(command -v llama-server)"
else
  echo "ERROR: llama-server not found in bin/" >&2
  exit 1
fi

MODEL=$(ls models/*.gguf 2>/dev/null | grep -v mmproj | grep -vi embed | head -n1 || true)
MMPROJ=$(ls models/*mmproj*.gguf 2>/dev/null | head -n1 || true)

if [ -z "$MODEL" ]; then
  echo "ERROR: no GGUF model in models/" >&2
  exit 1
fi

mkdir -p data/photos data/logs

LLAMA_ARGS=(-m "$MODEL" -c 4096 --port 8080 --host 127.0.0.1)
[ -n "$MMPROJ" ] && LLAMA_ARGS+=(--mmproj "$MMPROJ")

echo "→ llama-server  ($MODEL)"
"$LLAMA_BIN" "${LLAMA_ARGS[@]}" > data/logs/llama.log 2>&1 &
LLAMA_PID=$!

for i in {1..60}; do
  curl -sf http://127.0.0.1:8080/health >/dev/null 2>&1 && break
  sleep 1
  if [ "$i" = "60" ]; then
    echo "ERROR: llama-server never became ready (see data/logs/llama.log)" >&2
    kill $LLAMA_PID 2>/dev/null; exit 1
  fi
done

curl -sf -X POST http://127.0.0.1:8080/v1/chat/completions \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":"hi"}],"max_tokens":1}' > /dev/null 2>&1 || true

echo "→ node server"
WEB_DIR="$(pwd)/web/out" DATA_DIR="$(pwd)/data" PORT=3000 \
  "$NODE_BIN" server/dist/index.js > data/logs/server.log 2>&1 &
NODE_PID=$!

for i in {1..30}; do
  curl -sf http://127.0.0.1:3000/api/health >/dev/null 2>&1 && break
  sleep 1
  if [ "$i" = "30" ]; then
    echo "ERROR: node server never became ready (see data/logs/server.log)" >&2
    kill $LLAMA_PID $NODE_PID 2>/dev/null; exit 1
  fi
done

echo
echo "✓ MedStick is running → http://localhost:3000"
echo "  llama  pid=$LLAMA_PID  log=data/logs/llama.log"
echo "  node   pid=$NODE_PID   log=data/logs/server.log"
echo

if command -v open >/dev/null; then
  (sleep 1 && open -a "Google Chrome" http://localhost:3000) &
elif command -v xdg-open >/dev/null; then
  (sleep 1 && xdg-open http://localhost:3000) &
fi

cleanup() { echo; echo "→ shutting down…"; kill $LLAMA_PID $NODE_PID 2>/dev/null || true; wait 2>/dev/null; }
trap cleanup EXIT INT TERM
wait
LAUNCH
chmod +x "$OUT/start.sh"

# 9. Top-level README on the stick
cat > "$OUT/RUN.txt" <<RUN
MedStick — portable distribution

To launch:
    ./start.sh

The launcher boots llama-server (:8080) + node API (:3000), warms the
model, then opens Chrome to http://localhost:3000. Ctrl+C stops both.

Optional: install as a PWA from Chrome's address bar for a standalone
window. The PWA caches the UI shell — chat / patients / library still
need this folder running locally because inference and storage are local.

Built: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
Host:  $(uname -srm)
RUN

# 10. Summary
echo
echo "✓ stick bundle ready at: $OUT"
du -sh "$OUT" 2>/dev/null || true
echo
echo "Copy the entire dist-stick/ folder to your USB-C stick and run ./start.sh from it."
