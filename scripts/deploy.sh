#!/usr/bin/env bash
# Deploy: git pull → install → build → PM2 reload (or first start).
# Run on the server from repo root: bash scripts/deploy.sh
#
# Optional env overrides:
#   GIT_REMOTE=origin GIT_BRANCH=main   — pull a specific branch (default: tracked branch)
#   PORT=3001                           — listen port (default: 4322)
#   NODE_BIN, PNPM_BIN, PM2_BIN         — override tool paths (defaults: lando server layout)
#   Node 22.12+ required for Astro 6 — on VPS: nvm install 22.22.2 && nvm alias default 22.22.2
#
# To rename the process, change "name" in ecosystem.config.cjs and PM2_NAME below.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT"

NODE_BIN="${NODE_BIN:-/home/lando/.nvm/versions/node/v22.22.2/bin/node}"
PNPM_BIN="${PNPM_BIN:-/home/lando/.local/share/pnpm/pnpm}"
PM2_BIN="${PM2_BIN:-/home/lando/.local/share/pnpm/pm2}"

export PATH="$(dirname "$NODE_BIN"):$(dirname "$PNPM_BIN"):$PATH"
export NODE_BIN

GIT_REMOTE="${GIT_REMOTE:-origin}"
GIT_BRANCH="${GIT_BRANCH:-}"
PM2_NAME='n4n4'
export PORT="${PORT:-4322}"
export NODE_ENV=production

for f in "$NODE_BIN" "$PNPM_BIN" "$PM2_BIN"; do
  [[ -x "$f" ]] || {
    echo "error: missing or not executable: $f" >&2
    exit 1
  }
done
command -v git >/dev/null 2>&1 || {
  echo "error: git not found in PATH" >&2
  exit 1
}

echo "==> Git pull"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "    Working tree is dirty (likely CMS edits). Stashing before pull..."
  git stash push -m "deploy-auto-stash-$(date +%Y%m%d%H%M%S)"
  STASHED=1
fi
if [[ -n "$GIT_BRANCH" ]]; then
  git fetch "$GIT_REMOTE" "$GIT_BRANCH"
  git pull --ff-only "$GIT_REMOTE" "$GIT_BRANCH"
else
  git pull --ff-only
fi
if [[ "${STASHED:-0}" == "1" ]]; then
  echo "    Restoring stashed CMS edits..."
  if ! git stash pop; then
    echo "    ⚠ Stash pop had conflicts. Resolve manually: git stash list / git stash show"
  fi
fi

echo "==> Dependencies ($PNPM_BIN install --frozen-lockfile)"
"$PNPM_BIN" install --frozen-lockfile

echo "==> Build"
"$PNPM_BIN" run build

if [[ -f .env ]]; then
  if [[ ! -r .env ]]; then
    echo "error: .env exists but is not readable by $(whoami). Fix on the server:" >&2
    echo "  sudo chown $(whoami):$(id -gn) .env && chmod 600 .env" >&2
    exit 1
  fi
  echo "==> Load .env (secrets for PM2 / Keystatic auth)"
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

echo "==> PM2 ($PM2_NAME, PORT=$PORT)"
if "$PM2_BIN" describe "$PM2_NAME" >/dev/null 2>&1; then
  "$PM2_BIN" reload ecosystem.config.cjs --env production --only "$PM2_NAME" --update-env
else
  "$PM2_BIN" start ecosystem.config.cjs --env production --only "$PM2_NAME" --update-env
fi

"$PM2_BIN" save

echo "==> Done: $PM2_NAME listening on port $PORT"
