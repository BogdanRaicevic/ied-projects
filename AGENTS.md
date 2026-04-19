# IED Monorepo — Agent Instructions

Turborepo with four workspaces:

- `ied-be/` — Express + Clerk + Sentry + Mongoose + Zod (Node 24)
- `ied-fe/` — React + Vite + MUI + Clerk + TanStack Query + RHF + Zustand
- `ied-shared/` — Zod schemas + shared types
- `mongo-migrator/` — Mongoose + mysql2 migration tool

Package manager: `pnpm@10.33.0`. Linter/formatter: Biome. Test runner: Vitest (per workspace via `turbo test`).

## Skills

Project-scoped skills live in `.agents/skills/` as **real, committed folders** (not symlinks), so this repo is fully portable.

### Installed skills

| Skill | Purpose |
|---|---|
| `find-skills` | Meta-router. Read this first to discover skills you don't have yet via `npx skills find <query>` |
| `turborepo` | Turborepo monorepo conventions (caching, task pipelines, workspace boundaries) |
| `vercel-react-best-practices` | 70+ React perf rules (waterfalls, bundle size, re-renders) — primary reference for `ied-fe` |
| `vercel-composition-patterns` | Compound components, render props, composition over boolean prop proliferation |
| `building-components` | Component design system patterns: a11y, polymorphism, marketplaces |
| `web-design-guidelines` | Accessibility + visual design checklist (used by the `review-ui` slash command) |
| `ui-ux-pro-max` | UX critique reviewer for screens and flows |

When you start a task, prefer reading the most relevant skill's `SKILL.md` over loading rules speculatively.

### Adding skills

```sh
# install a new skill into this project (real files, committed to repo):
npx skills add <owner/repo> -s <skill-name> -a cursor -y --copy

# discover what's available:
npx skills find <query>

# update everything to latest:
npx skills update -p -y
```

### Restoring on a fresh clone

```sh
# reproduces every skill in .agents/skills/ from skills-lock.json
npx skills experimental_install
```

The `skills-lock.json` at repo root pins exact source versions, like `package-lock.json` for skills.

## Cursor plugins

`.cursor/settings.json` declares which Cursor plugins this workspace activates. Currently:

- `sentry`: enabled (used by `ied-be`)
- `vercel`: disabled (no Vercel hosting in this repo)
- `clerk`: disabled (Clerk SDKs are well-typed; the plugin's `auth` skill isn't worth its tokens here)

Update `.cursor/settings.json` in this repo if the stack changes or you need a plugin enabled for this workspace.
