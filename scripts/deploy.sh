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
  # Installs (if missing) and activates the version in .nvmrc. Do not fall
  # back to another Node version if this fails.
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

# Use the native pnpm pinned by package.json, installed for this Node version.
pinned_pnpm=$(node -p 'require("./package.json").packageManager.split("+")[0].split("@")[1]')
npm_bin="$(npm prefix -g)/bin"
npm_pnpm="$npm_bin/pnpm"
if [ "$("$npm_pnpm" -v 2>&1 || true)" != "$pinned_pnpm" ]; then
  echo "==> Installing pnpm $pinned_pnpm for $(node -v)"
  npm install -g --force --ignore-scripts=false --include=optional "pnpm@$pinned_pnpm"
  # pnpm's `bin/pnpm` is a shebang-less placeholder until install.js swaps in
  # the native binary from @pnpm/exe.<platform>. npm can skip that script; a
  # shell still runs the placeholder (with the "running through Node.js"
  # warning), but turbo execs it directly and dies with exit 137. Run it here.
  (cd "$(npm root -g)/pnpm" && node install.js)
fi
export PATH="$npm_bin:$PATH"
hash -r
if [ "$(pnpm -v 2>&1 || true)" != "$pinned_pnpm" ]; then
  echo "ERROR: pnpm $pinned_pnpm was installed but cannot run natively." >&2
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

echo "==> [${TARGET_NAME:-$(hostname)}] deploying $(git describe --tags --always) ($(node -v), npm $(npm -v), pnpm $(pnpm -v))"

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
# The pm2 daemon keeps running the pm2 and Node it was first started with, so
# a pm2 bump in package.json or a Node bump in .nvmrc never reaches it on its
# own ("In-memory PM2 is out-of-date"). `pm2 update` saves the process list,
# kills the daemon and starts a new one from node_modules on the current Node.
pnpm exec pm2 update
# startOrReload handles both the first deploy (apps not running yet) and every
# one after it. --update-env re-reads the .env files on the box.
pnpm exec pm2 startOrReload ecosystem.config.js --update-env
pnpm exec pm2 save

# `pm2 startup` writes the current Node's bin dir into the systemd unit, so
# after a Node bump a reboot would resurrect the apps on the old Node (or fail
# once it's removed). Regenerate the unit only when that path is stale.
pm2_unit="/etc/systemd/system/pm2-$(id -un).service"
node_bin_dir="$(dirname "$(command -v node)")"
if [ "$(id -u)" -eq 0 ] && ! grep -qF "$node_bin_dir" "$pm2_unit" 2>/dev/null; then
  echo "==> Refreshing pm2 boot service for $(node -v)"
  pnpm exec pm2 startup systemd
fi

pnpm exec pm2 list
echo "==> Deploy finished"
