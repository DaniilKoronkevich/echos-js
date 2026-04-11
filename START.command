#!/bin/bash
# ── ECHOS — Chrome ────────────────────────────────────────────────────────────
cd "$(dirname "$0")"

PORT=8080
URL="http://localhost:$PORT"

open_chrome() {
  if open -a "Google Chrome" "$1" 2>/dev/null; then return 0
  elif open -a "Chromium" "$1" 2>/dev/null; then return 0
  elif open -a "Google Chrome Canary" "$1" 2>/dev/null; then return 0
  else echo "Chrome не найден — открываю в браузере по умолчанию"; open "$1"; fi
}

echo "────────────────────────────────────────"
echo "  E C H O S  →  Chrome"
echo "  $URL"
echo "────────────────────────────────────────"

if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "→ Сервер уже запущен"
  open_chrome "$URL"
  exit 0
fi

( sleep 0.8; open_chrome "$URL" ) &

if command -v python3 &>/dev/null; then
  python3 -m http.server $PORT
elif command -v npx &>/dev/null; then
  npx --yes serve . -l $PORT --no-clipboard
else
  echo "ОШИБКА: нужен Python или Node.js"
  read -p "Enter..."
fi
