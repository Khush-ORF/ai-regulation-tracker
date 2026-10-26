# Hand-off: Phase 1 site live, national seed data in review

- **Date:** 2026-10-26
- **Agent:** claude-opus (plus five seed subagents)
- **Tasks touched:** T-008, T-011, T-101 to T-112

## Done
- **Site live** at https://khush-orf.github.io/ai-regulation-tracker/ (repo `Khush-ORF/ai-regulation-tracker`). Astro 5 static site:
  - globe home (`src/scripts/globe.js`);
  - country profiles;
  - explorer with filters;
  - about page;
  - 404 page.
- **Schema:** `src/content.config.ts` is checked on every build. `deploy.yml` publishes on push to `main`; `validate.yml` checks every PR.
- **Seed data:** 118 national records (India 30, Brazil 24, China 26, South Korea 24, South Africa 14). All pass the build; IDs are unique. Pushed on the review branch `seed/national-records` for the owner's PR review (ADR-004: fund records need review).
- **Display rules:**
  - Countries are coloured by their most advanced **AI-specific** instrument; pure data-protection laws are excluded (`isAiSpecific` in `src/lib/site.ts`).
  - "Latest changes" uses each record's own most recent past milestone.
  - `binding` means binding by nature, so drafts show "Binding once in force".

## Not done / next step
- The owner reviews and merges the seed PR. Each country's report in `Claude/research/T-10x/T-11x-seed-*.md` lists low-confidence records and open conflicts.
- Phase 1 exit check: run Lighthouse accessibility on the live site (target ≥ 90).
- T-010: close-up check of the boundary in a few places (Sir Creek, the northern tip, the island UTs).
- **Open data questions:**
  - Should national funds that aren't AI-only count? (China's guidance fund.)
  - How should superseded consultation documents be marked? (South Africa's 2024 framework.)

## Watch out for
- Four of five countries show "In force" because each has binding AI-specific rules. A future "comprehensive AI law" layer would separate Korea (horizontal law) from the rest.
- **Commits:** identity is repo-local `Khush-ORF` with the noreply email. Pushing works from the agent shell now that Git Credential Manager has the token.

## Files changed
- New: `src/**`, `data/**`, `.github/workflows/*`, `README.md`, `astro.config.mjs`, `package.json`, `tsconfig.json`, `public/favicon.svg`
- Updated: `Claude/TASKS.md`, `Claude/DATA_SCHEMA.md`, `Claude/SOURCES.md`, `Claude/PHASES.md`, `Claude/DECISIONS.md`, `Claude/DESIGN.md`
