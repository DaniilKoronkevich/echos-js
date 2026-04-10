#!/bin/bash
# ── ECHOS — двойной клик для запуска ─────────────────────────────────────────
cd "$(dirname "$0")"

PORT=8080
URL="http://localhost:$PORT"

echo "────────────────────────────────────────"
echo "  E C H O S"
echo "  $URL"
echo "────────────────────────────────────────"

# Если порт уже занят — просто открываем браузер
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "→ Сервер уже запущен"
  open "$URL"
  exit 0
fi

# Открываем браузер через 0.8с (пока сервер стартует)
(
  sleep 0.8
  if open -a "Google Chrome" "$URL" 2>/dev/null; then :
  elif open -a "Chromium" "$URL" 2>/dev/null; then :
  elif open -a "Google Chrome Canary" "$URL" 2>/dev/null; then :
  else open "$URL"; fi
) &

# Запускаем сервер
if command -v python3 &>/dev/null; then
  python3 -m http.server $PORT
elif command -v npx &>/dev/null; then
  npx --yes serve . -l $PORT --no-clipboard
elif command -v python &>/dev/null; then
  python -m SimpleHTTPServer $PORT
else
  echo ""
  echo "ОШИБКА: нужен Python или Node.js"
  echo "→ python3 уже должен быть на Mac"
  read -p "Enter..."
fi
