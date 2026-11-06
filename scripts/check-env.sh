#!/usr/bin/env bash
# Verifica que el entorno de este repo esté bien aislado antes de trabajar:
# direnv, gh personal, identidad de git, Node y que .env.local esté ignorado.
# Uso: ./scripts/check-env.sh   (sale con 1 si falta algo obligatorio)
set -uo pipefail

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR" || exit 1

EXPECTED_GH_DIR="$HOME/.config/gh-self-tesla"
EXPECTED_GH_USER="jaimehenao8126"
EXPECTED_EMAIL="arheanja@gmail.com"
EXPECTED_NODE_MAJOR="$(tr -d 'v[:space:]' < .nvmrc 2>/dev/null | cut -d. -f1)"

errores=0
pass() { echo "✅ $1"; }
aviso() { echo "⚠️  $1"; }
falla() { echo "❌ $1"; errores=$((errores + 1)); }

echo "== direnv"
if [ "${GH_CONFIG_DIR:-}" = "$EXPECTED_GH_DIR" ]; then
  pass "GH_CONFIG_DIR apunta a la config personal ($EXPECTED_GH_DIR)"
else
  falla "GH_CONFIG_DIR no coincide (actual: '${GH_CONFIG_DIR:-vacío}'). Ejecuta 'direnv allow'."
fi

echo "== GitHub CLI"
if [ "${GH_CONFIG_DIR:-}" != "$EXPECTED_GH_DIR" ]; then
  # Sin la config aislada, gh usaría la cuenta de trabajo. No la consultamos.
  aviso "Omitido: sin GH_CONFIG_DIR correcto no se consulta gh, para no usar la cuenta de trabajo."
elif gh_user="$(gh api user --jq .login 2>/dev/null)"; then
  if [ "$gh_user" = "$EXPECTED_GH_USER" ]; then
    pass "gh autenticado como $gh_user"
  else
    falla "gh está autenticado como '$gh_user', no como $EXPECTED_GH_USER. Cierra esa sesión con: gh auth logout --hostname github.com"
  fi
else
  aviso "gh sin sesión en esta carpeta. Ejecuta ./scripts/gh-login.sh cuando lo necesites."
fi

echo "== identidad de git"
email="$(git config user.email || true)"
if [ "$email" = "$EXPECTED_EMAIL" ]; then
  pass "user.email del repo: $email"
else
  falla "user.email es '${email:-vacío}', se esperaba $EXPECTED_EMAIL"
fi

echo "== AWS"
if [ -n "${AWS_ACCESS_KEY_ID:-}" ] || [ -n "${AWS_SECRET_ACCESS_KEY:-}" ]; then
  aviso "Hay credenciales AWS estáticas en el shell. Este repo no usa AWS todavía."
else
  pass "Sin credenciales AWS estáticas en el shell"
fi

echo "== Node"
node_major="$(node -v 2>/dev/null | tr -d 'v' | cut -d. -f1)"
if [ -z "$EXPECTED_NODE_MAJOR" ]; then
  aviso "No se pudo leer .nvmrc"
elif [ "$node_major" = "$EXPECTED_NODE_MAJOR" ]; then
  pass "Node $node_major (coincide con .nvmrc)"
else
  aviso "Node ${node_major:-no instalado} (.nvmrc pide $EXPECTED_NODE_MAJOR). Usa 'nvm use'."
fi

echo "== secretos"
if [ -f .env.local ]; then
  if git check-ignore -q .env.local; then
    pass ".env.local existe y está ignorado por git"
  else
    falla ".env.local NO está ignorado por git. Revisa .gitignore antes de cualquier commit."
  fi
else
  pass "Sin .env.local (la fase actual no necesita secretos)"
fi

echo
if [ "$errores" -gt 0 ]; then
  echo "❌ $errores problema(s) obligatorio(s)."
  exit 1
fi
echo "✅ Entorno listo."
