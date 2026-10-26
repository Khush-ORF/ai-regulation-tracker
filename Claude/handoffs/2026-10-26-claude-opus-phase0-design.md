# Hand-off: Phase 0 design and workspace setup

- **Date:** 2026-10-26
- **Agent:** claude-opus
- **Tasks touched:** T-001, T-002, T-003

## Done
- Created the `Claude/` workspace with its working rules, plus root `AGENTS.md` and `CLAUDE.md` pointers.
- Drafted DESIGN (zero-cost GitHub architecture and visual system), PHASES, DATA_SCHEMA, SOURCES, DECISIONS, TASKS and OPEN_QUESTIONS.
- Showed map home mockup v1 in chat (dark map, status markers, layer chips, legend, chat launcher, selection panel).
- The owner accepted ADR-004 (auto-merge, but money and low-confidence items go to review), ADR-006 (free Cloudflare Worker for the chatbot), ADR-009 (right-side panel) and ADR-010 (dark default with light toggle).

## Not done / next step
- Owner to answer Q1 (Key Streams), Q2, Q3, Q5, Q6 and Q7.
- Mockup v2 with the right-side panel and real boundary shapes.
- T-004: check that each source is reachable from GitHub runners.
- T-006: find an India boundary dataset that matches the Survey of India boundaries.
- No git repo yet; the repo is created in T-101 after the repo name is chosen (Q5).

## Watch out for
- Free-tier limits (GitHub Models, Gemini, Groq, Cloudflare) change often. Check current limits before building Phase 2 and Phase 4.
- The India boundary requirement (DESIGN §1.2) rules out off-the-shelf basemaps and most open boundary datasets.
- The figures in the mockup are illustrative only. Never copy them into `data/`.

## Files changed
- `AGENTS.md`, `CLAUDE.md`, `Claude/*`
