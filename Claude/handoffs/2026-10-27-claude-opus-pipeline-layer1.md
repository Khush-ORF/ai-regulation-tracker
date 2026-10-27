# Hand-off: pipeline design, Layer 1 crawler, extractor, coverage audit

- **Date:** 2026-10-27
- **Agent:** claude-opus
- **Tasks touched:** T-204 to T-216

## Done
- **Design:** `Claude/PIPELINE.md` and ADR-019, five layers with legitimate access only. The owner agreed.
- **Shared schema:** `src/schema.mjs` (Zod via `astro/zod`) is used by both `src/content.config.ts` and the pipeline.
- **Crawler** (`pipeline/crawl.mjs`, `pipeline/lib/*`, `pipeline/sources.json`):
  - robots.txt per RFC 9309, crawl-delay, at least 2 s per host, honest User-Agent, block detection, one retry on network errors.
  - `rss`, `json` and `html-links` parsers.
  - Multilingual AI keyword filter on titles.
  - De-duplication by seen-state and existing source URLs; tracked-bill feeds that report only steps after `last_checked`; OECD pre-matching.
  - Local run: 24/24 enabled sources read, 62 candidates.
- **Extractor** (`pipeline/extract.mjs`, `pipeline/lib/llm.mjs`):
  - Model proposes ignore, new or update. Code validates against the schema and caps confidence by evidence: page 0.95, listing 0.8, Layer 2 0.8, unsupported 0.5.
  - Tested with mock replies only. The test record was deleted.
- **Decision and PR body:** `pipeline/decide.mjs` implements the auto-merge rules.
- **Audit:** `pipeline/audit.mjs`. Local run: OECD national items matched 48/131; 3 status flags; 16 low-confidence records; two zero Key Streams (sector rules for Korea and China).
- **Workflows:** `pipeline.yml` (daily 20:30 UTC) and `audit.yml` (monthly, 1st). Neither has run on GitHub yet.

## Not done / next step
- **Owner:** enable "Read and write permissions" and "Allow GitHub Actions to create and approve pull requests" (Settings → Actions → General).
- First real run: trigger "Daily data update" manually with max 5. Check the model endpoint and model (`models.github.ai`, `openai/gpt-4.1-mini`) and the PR creation.
- T-214 (MSIT feed), T-215 (triage OECD gaps), T-216 (status-history backfill), and Layers 3–5 (T-211 to T-213).

## Watch out for
- CAC: Node times out connecting from this PC (curl works). Check from a runner. Don't route around it.
- The Câmara keyword search is loose; the title filter does the real filtering.
- PRs opened with `GITHUB_TOKEN` don't trigger `validate.yml`, so `pipeline.yml` validates itself and dispatches `deploy.yml` after an auto-merge.
- GitHub Models free limits: the extractor stops cleanly on long 429s and continues the next day.

## Files changed
- New: `src/schema.mjs`, `pipeline/**`, `.github/workflows/pipeline.yml`, `.github/workflows/audit.yml`, `Claude/PIPELINE.md`
- Updated: `src/content.config.ts`, `package.json`, `.gitignore`, `README.md`, `Claude/DECISIONS.md`, `Claude/TASKS.md`, `Claude/SOURCES.md`
