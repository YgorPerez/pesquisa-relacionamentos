#!/usr/bin/env bash
# Publica uma pasta do repositório num link https público e temporário (Cloudflare
# Quick Tunnel, sem conta), para abrir um protótipo no celular. Ver
# docs/agents/preview-remoto.md.
#
#   scripts/preview-remoto.sh [pasta] [porta]   # padrão: prototipos 8765; imprime o link e sai
#   scripts/preview-remoto.sh parar             # derruba o servidor e o túnel

set -euo pipefail

ESTADO=/tmp/preview-remoto
BIN="$HOME/.local/bin/cloudflared"
mkdir -p "$ESTADO"

parar() {
  for nome in tunel servidor; do
    if [[ -f "$ESTADO/$nome.pid" ]]; then
      kill "$(cat "$ESTADO/$nome.pid")" 2>/dev/null || true
      rm -f "$ESTADO/$nome.pid"
    fi
  done
}

if [[ "${1:-}" == parar ]]; then
  parar
  echo "Servidor e túnel parados."
  exit 0
fi

RAIZ="$(cd "$(dirname "$0")/.." && pwd)"
PASTA="$(cd "$RAIZ/${1:-prototipos}" && pwd)"
PORTA="${2:-8765}"

# cloudflared: o do PATH ou um binário oficial baixado para ~/.local/bin.
CF="$(command -v cloudflared || true)"
if [[ -z "$CF" ]]; then
  if [[ ! -x "$BIN" ]]; then
    case "$(uname -m)" in
      x86_64) ARQ=amd64 ;;
      aarch64 | arm64) ARQ=arm64 ;;
      *) echo "Arquitetura $(uname -m) sem binário previsto aqui." >&2; exit 1 ;;
    esac
    echo "Baixando cloudflared ($ARQ) para $BIN..." >&2
    mkdir -p "$(dirname "$BIN")"
    curl -fsSL -o "$BIN" "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-$ARQ"
    chmod +x "$BIN"
  fi
  CF="$BIN"
fi

# Uma rodada por vez: a anterior cai antes de subir a nova.
parar

# O servidor só escuta em 127.0.0.1; quem chega de fora passa pelo túnel.
python3 -m http.server "$PORTA" --bind 127.0.0.1 --directory "$PASTA" >"$ESTADO/servidor.log" 2>&1 &
echo $! >"$ESTADO/servidor.pid"

"$CF" tunnel --no-autoupdate --url "http://127.0.0.1:$PORTA" >"$ESTADO/tunel.log" 2>&1 &
echo $! >"$ESTADO/tunel.pid"

URL=""
for _ in $(seq 60); do
  URL="$(grep -oE 'https://[a-z0-9-]+\.trycloudflare\.com' "$ESTADO/tunel.log" | head -1 || true)"
  [[ -n "$URL" ]] && break
  sleep 0.5
done
if [[ -z "$URL" ]]; then
  echo "O túnel não devolveu link em 30 s. Log em $ESTADO/tunel.log:" >&2
  tail -20 "$ESTADO/tunel.log" >&2
  parar
  exit 1
fi

echo "$URL" >"$ESTADO/url"
echo "Pasta: ${PASTA#"$RAIZ"/}"
for f in "$PASTA"/*.html; do
  [[ -e "$f" ]] && echo "$URL/$(basename "$f")"
done
