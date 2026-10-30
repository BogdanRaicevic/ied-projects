@AGENTS.md

## Claude Code specifics

- All project rules live in `AGENTS.md` (imported above) so every agent reads
  the same thing. Edit them there, not here.
- Shared permissions: `.claude/settings.json` (committed). Personal
  overrides: `.claude/settings.local.json` (gitignored).
