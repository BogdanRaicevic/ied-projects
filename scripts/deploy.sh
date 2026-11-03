#!/usr/bin/env bash
#
# Runs ON THE VPS, from the repo root.
#
# By the time this runs the working tree is already at the commit we want to
# deploy (the workflow does the git fetch/checkout before calling this), so this
# script only has to stop the apps, install, build, migrate and restart.
#
# It is safe to run by hand too:  cd /path/to/ied-projects && bash scripts/deploy.sh
#
set -euo pipefail

cd "$(dirname "$0")/.."

# A non-interactive SSH session does NOT source ~/.zshrc or ~/.bashrc, so
# anything installed through nvm (node and Corepack's pnpm shim) is missing
# from PATH.
# This is the single most common reason a deploy that works by hand fails in CI.
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
if [ -s "$NVM_DIR/nvm.sh" ]; then
  # nvm.sh is not written to survive `set -u` (it reads unset internals and
  # dies with "VERSION: unbound variable"). Relax it for the source + activate
  # only, then put it straight back.
  set +u
  # shellcheck disable=SC1091
  . "$NVM_DIR/nvm.sh"
  # Installs (if missing) and activates the version in .nvmrc, so a Renovate
  # Node bump doesn't need a manual `nvm install` on every box. Do NOT swallow
  # a failure here: silently falling back to whatever node is on PATH means
  # building and running production on an unintended Node version.
  nvm_status=0
  nvm install || nvm_status=$?
  # Reboots / `pm2 resurrect` / interactive shells pick up `default`.
  [ "$nvm_status" -eq 0 ] && nvm alias default "$(nvm current)" >/dev/null
  set -u

  if [ "$nvm_status" -ne 0 ]; then
    echo "ERROR: nvm could not install/activate the Node version in .nvmrc." >&2
    exit 1
  fi
fi

# Use exactly the pnpm package.json pins, installed by npm for THIS Node.
# `pnpm -v` alone can't be trusted: any other pnpm (standalone in
# ~/.local/share/pnpm, /usr/local/bin) hands off to a self-downloaded copy in
# ~/.local/share/pnpm/.tools that has no native binary, still prints the pinned
# version, and then turbo can't spawn it (exit 137). So check the npm-global
# binary itself: its output must be the bare version — a wrong version, a
# missing binary or the "running through Node.js" warning all mean reinstall.
pinned_pnpm=$(node -p 'require("./package.json").packageManager.split("+")[0].split("@")[1]')
npm_pnpm="$(npm prefix -g)/bin/pnpm"
if [ "$("$npm_pnpm" -v 2>&1 || true)" != "$pinned_pnpm" ]; then
  echo "==> Installing pnpm $pinned_pnpm for $(node -v)"
  npm install -g --ignore-scripts=false "pnpm@$pinned_pnpm"
fi
hash -r
if [ "$(command -v pnpm)" != "$npm_pnpm" ]; then
  echo "ERROR: 'pnpm' resolves to $(command -v pnpm), not $npm_pnpm." >&2
  echo "       Another pnpm is earlier on PATH; remove it." >&2
  exit 1
fi

for cmd in node pnpm git; do
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

if [ "${PM2_ALREADY_STOPPED:-0}" != "1" ]; then
  echo "==> Stopping pm2"
  pnpm exec pm2 stop all
fi

# NOT --prod: ied-be runs its TypeScript through tsx, and the builds need
# typescript/vite, all of which are devDependencies.
echo "==> Installing dependencies"
pnpm install --frozen-lockfile

echo "==> Building"
pnpm run build

echo "==> Running MongoDB migrations"
pnpm --dir mongo-migrator run dev

echo "==> Starting pm2"
# startOrReload handles both the first deploy (apps not running yet) and every
# one after it. --update-env re-reads the .env files on the box.
pnpm exec pm2 startOrReload ecosystem.config.js --update-env
pnpm exec pm2 save

pnpm exec pm2 list
echo "==> Deploy finished"
