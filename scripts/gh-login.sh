#!/usr/bin/env bash
# Verifica la sesión de gh dentro del GH_CONFIG_DIR aislado de este repo (cuenta personal) y la
# inicia solo si hace falta. No toca la configuración de gh de trabajo (~/.config/gh).
# Uso: ./scripts/gh-login.sh
set -euo pipefail

EXPECTED_GH_DIR="$HOME/.config/gh-self-tesla"
EXPECTED_GH_USER="jaimehenao8126"

if [ "${GH_CONFIG_DIR:-}" != "$EXPECTED_GH_DIR" ]; then
  echo "⚠️  GH_CONFIG_DIR no es '$EXPECTED_GH_DIR' (actual: '${GH_CONFIG_DIR:-vacío}')."
  echo "   Ejecuta 'direnv allow' en la raíz del repo y vuelve a intentar."
  echo "   Sin esta variable, gh usaría la cuenta de trabajo. No continúo."
  exit 1
fi

echo "→ Verificando sesión gh aislada (GH_CONFIG_DIR: ${GH_CONFIG_DIR})..."

if gh auth status >/dev/null 2>&1; then
  echo "✅ Ya hay una sesión en este directorio aislado."
else
  echo "⏳ Sin sesión aquí. Se abrirá el navegador para autorizar."
  echo "   Usa la cuenta personal ($EXPECTED_GH_USER), no la de trabajo (jhenao-nex)."
  gh auth login --hostname github.com --git-protocol https --web
fi

# gh auth status da éxito con cualquier cuenta: comprobamos cuál quedó.
usuario="$(gh api user --jq .login 2>/dev/null || true)"
if [ "$usuario" != "$EXPECTED_GH_USER" ]; then
  echo "❌ La sesión de este directorio es '${usuario:-desconocida}', no $EXPECTED_GH_USER."
  echo "   Cierra esa sesión solo en este directorio con: gh auth logout --hostname github.com"
  exit 1
fi

echo "✅ Sesión verificada como $usuario"
