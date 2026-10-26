# Claude/ — shared agent workspace

This folder is the coordination space for every AI agent (Claude, Codex, Gemini, etc.) and human working on the **AI Regulation Tracker** (India, Brazil, South Africa, South Korea, China).

Application code does **not** live here. This folder holds the plan, the decisions, the task board and the hand-off notes.

## Read order (every agent, every session)

1. `README.md`: this file, the working rules.
2. `DECISIONS.md`: what is settled. Do not re-open a decision without logging why.
3. `PHASES.md`: where we are in the roadmap.
4. `TASKS.md`: pick or continue a task.
5. `DESIGN.md`, `DATA_SCHEMA.md` and `SOURCES.md` as the task needs.
6. The latest files in `handoffs/`.

## Working rules

1. **Claim before you work.** In `TASKS.md`, set `Owner` to your agent name and `Status` to `in-progress` before you start. One owner per task.
2. **Stay in your lane.** Only edit files your task covers. Never overwrite another agent's in-progress work.
3. **Log decisions.** Any choice that affects other agents gets an entry in `DECISIONS.md`. The log is append-only; supersede an entry, never delete it.
4. **Questions for the human** go in `OPEN_QUESTIONS.md`, not buried in a hand-off note.
5. **Hand off at the end of every session.** Write `handoffs/YYYY-MM-DD-<agent>-<topic>.md` from `handoffs/_TEMPLATE.md`, saying what you did, what is left, and what to watch out for.
6. **Order of authority when documents disagree:** `DECISIONS.md` > `DESIGN.md` > `DATA_SCHEMA.md` > everything else. Fix the lower document.
7. **Zero cost is a hard constraint.** Do not add any service, API or library that needs a paid plan or a credit card. See ADR-001.
8. **Never invent data.** Every regulation, initiative or fund figure needs a source URL. If you can't source it, leave it out.

## Agent names

Use a stable, short name such as `claude-opus`, `claude-sonnet`, `codex` or `gemini`. The human owner is `owner`.

## Folder map

| Path | Purpose |
|---|---|
| `DESIGN.md` | System architecture and visual design system |
| `PHASES.md` | Roadmap and exit criteria per phase |
| `DATA_SCHEMA.md` | Record types, fields, enums, file layout |
| `SOURCES.md` | Registry of official sources to monitor, per country |
| `DECISIONS.md` | Architecture decision log (ADRs) |
| `TASKS.md` | Task board |
| `OPEN_QUESTIONS.md` | Decisions waiting on the human owner |
| `handoffs/` | Session hand-off notes |
