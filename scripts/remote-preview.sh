#!/usr/bin/env bash
# Publishes a repository folder at a temporary public https link (Cloudflare
# Quick Tunnel, no account), to open a prototype on a phone. See
# docs/agents/preview-remoto.md.
#
#   scripts/remote-preview.sh [folder] [port]   # default: prototypes 8765; prints the link and exits
#   scripts/remote-preview.sh stop              # takes down the server and the tunnel

set -euo pipefail

STATE=/tmp/remote-preview
BIN="$HOME/.local/bin/cloudflared"
mkdir -p "$STATE"

stop() {
  for name in tunnel server; do
    if [[ -f "$STATE/$name.pid" ]]; then
      kill "$(cat "$STATE/$name.pid")" 2>/dev/null || true
      rm -f "$STATE/$name.pid"
    fi
  done
}

if [[ "${1:-}" == stop ]]; then
  stop
  echo "Server and tunnel stopped."
  exit 0
fi

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FOLDER="$(cd "$ROOT/${1:-prototipos}" && pwd)"
PORT="${2:-8765}"

# cloudflared: the one on PATH or an official binary downloaded to ~/.local/bin.
CF="$(command -v cloudflared || true)"
if [[ -z "$CF" ]]; then
  if [[ ! -x "$BIN" ]]; then
    case "$(uname -m)" in
      x86_64) ARCH=amd64 ;;
      aarch64 | arm64) ARCH=arm64 ;;
      *) echo "Architecture $(uname -m) has no binary planned here." >&2; exit 1 ;;
    esac
    echo "Downloading cloudflared ($ARCH) to $BIN..." >&2
    mkdir -p "$(dirname "$BIN")"
    curl -fsSL -o "$BIN" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARCH"
    chmod +x "$BIN"
  fi
  CF="$BIN"
fi

# One run at a time: the previous one goes down before the new one comes up.
stop

# The server only listens on 127.0.0.1; whoever comes from outside goes through the tunnel.
python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$FOLDER" >"$STATE/server.log" 2>&1 &
echo $! >"$STATE/server.pid"

"$CF" tunnel --no-autoupdate --url "http://127.0.0.1:$PORT" >"$STATE/tunnel.log" 2>&1 &
echo $! >"$STATE/tunnel.pid"

URL=""
for _ in $(seq 60); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$STATE/tunnel.log" | head -1 || true)"
  [[ -n "$URL" ]] && break
  sleep 0.5
done
if [[ -z "$URL" ]]; then
  echo "The tunnel returned no link within 30 s. Log at $STATE/tunnel.log:" >&2
  tail -20 "$STATE/tunnel.log" >&2
  stop
  exit 1
fi

echo "$URL" >"$STATE/url"
echo "Folder: ${FOLDER#"$ROOT"/}"
for f in "$FOLDER"/*.html; do
  [[ -e "$f" ]] && echo "$URL/$(basename "$f")"
done
