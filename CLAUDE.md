@AGENTS.md

## Claude Code specifics

- `AGENTS.md` (imported above) is the single source of project instructions so
  Cursor, Codex and Claude all read the same rules. Edit it there, not here.
- Shared permissions live in `.claude/settings.json` (committed). Personal
  overrides go in `.claude/settings.local.json` (gitignored).
- Work on a branch, one concern per PR. For larger changes, propose a plan
  first and wait for approval.
