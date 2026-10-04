#!/usr/bin/env bash
#
# Runs ON THE VPS, from the repo root.
#
# By the time this runs the working tree is already at the commit we want to
# deploy (the workflow does the git fetch/checkout before calling this), so this
# script only has to install, build and restart.
#
# It is safe to run by hand too:  cd /path/to/ied-projects && bash scripts/deploy.sh
#
set -euo pipefail

cd "$(dirname "$0")/.."

# A non-interactive SSH session does NOT source ~/.zshrc or ~/.bashrc, so
# anything installed through nvm (node, pnpm, pm2) is missing from PATH.
# This is the single most common reason a deploy that works by hand fails in CI.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # nvm.sh is not written to survive `set -u` (it reads unset internals and
  # dies with "VERSION: unbound variable"). Relax it for the source + activate
  # only, then put it straight back.
  set +u
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  # Picks up .nvmrc (24.18.0). Do NOT swallow a failure here: silently falling
  # back to whatever node happens to be on PATH means building and running
  # production on an unintended Node version.
  nvm_status=0
  nvm use || nvm_status=$?
  set -u

  if [ "$nvm_status" -ne 0 ]; then
    echo "ERROR: nvm could not activate the Node version in .nvmrc." >&2
    echo "       Run 'nvm install' in $PWD on this server, then retry." >&2
    exit 1
  fi
fi

for cmd in node pnpm pm2 git; do
  if ! command -v "$cmd" >/dev/null 2>&1; then
    echo "ERROR: '$cmd' is not on PATH for a non-interactive shell." >&2
    echo "       PATH=$PATH" >&2
    exit 1
  fi
done

# Second belt: with or without nvm, refuse to deploy on a Node older than the
# one the repo declares. sort -V gives a version-aware comparison, so the
# required version being the minimum of the pair means actual >= required.
required_node=$(sed 's/^v//' .nvmrc | tr -d '[:space:]')
actual_node=$(node -v | sed 's/^v//')
if [ "$(printf '%s\n%s\n' "$required_node" "$actual_node" | sort -V | head -1)" != "$required_node" ]; then
  echo "ERROR: Node $actual_node is older than the required $required_node (.nvmrc)." >&2
  exit 1
fi

echo "==> [${TARGET_NAME:-$(hostname)}] deploying $(git describe --tags --always) ($(node -v), pnpm $(pnpm -v))"

# NOT --prod: ied-be runs its TypeScript through tsx, and the builds need
# typescript/vite, all of which are devDependencies.
echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building"
pnpm run build

echo "==> Reloading pm2"
# startOrReload handles both the first deploy (apps not running yet) and every
# one after it. --update-env re-reads the .env files on the box.
pm2 startOrReload ecosystem.config.js --update-env
pm2 save

pm2 list
echo "==> Deploy finished"
