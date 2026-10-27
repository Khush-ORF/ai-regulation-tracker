# Task board

Status values: `todo`, `in-progress`, `blocked`, `review`, `done`.

Claim a task by setting `Owner` and `Status` before starting (see README rule 1).

## Phase 0 — Design and workspace

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| T-001 | Set up `Claude/` workspace and protocol | claude-opus | done | |
| T-002 | Draft DESIGN, PHASES, SCHEMA, SOURCES, DECISIONS | claude-opus | done | |
| T-003 | Map home mockup | claude-opus | done | Approved by the owner 2026-10-26 (ADR-015 to ADR-017). v4 (interactive globe: drag, scroll/pinch zoom, fly-to) published 2026-10-26 to https://claude.ai/artifact/RweA6buno5DQbqCGdHZbep. Spec in `Claude/design/mockup-v3.md` plus its v4 note. Interaction tested in the browser pane (drag, wheel zoom, drill-in, state click, no console errors). Awaiting owner feedback (ADR-015, ADR-016, ADR-017) |
| T-004 | Check every source in SOURCES.md is reachable from a GitHub runner; record method and robots.txt notes | claude-opus (subagent) | done | 21 usable, 7 blocked, 1 replaced → SOURCES v2 and ADR-014. Re-check on a runner in T-201 |
| T-005 | Confirm the Key Streams taxonomy (Q1) | owner | done | Draft list of 9 kept (ADR-012) |
| T-006 | Find a licensable, Survey of India–compliant India boundary dataset (national + states) | claude-opus (subagent) | review | Recipe in `Claude/research/T-006-india-boundaries.md`; awaiting owner answers to Q9–Q11 |
| T-010 | Build the boundary TopoJSON files with mapshaper and run the QA checklist | claude-opus | review | Built 2026-10-26 by `geo/build-geo.ps1` → `public/geo/` (india 189 KB, world 299 KB, admin1 43 KB). Automated QA passed (`geo/README.md`); rendered views show the full J&K, Ladakh, Aksai Chin and Arunachal. A close-up check of Sir Creek, the northern tip and the island UTs is still to do |
| T-011 | Install git on this machine (needed for T-101) | claude-opus | done | Git 2.56 via winget, 2026-10-26. Repo initialised on `main`, remote `https://github.com/Khush-ORF/ai-regulation-tracker.git`, commit identity `Khush-ORF` (noreply email, repo-local) |
| T-007 | Choose the repo name and site name (Q5) | owner | done | `ai-regulation-tracker` / "AI Regulation Tracker"; the owning GitHub account is named at T-101 |
| T-008 | Freeze the data schema v1 | claude-opus | done | Zod schema in `src/content.config.ts`, checked on every build |
| T-009 | Write a 30-question chatbot test set with expected cited answers | — | todo | Phase 4 exit criterion; can start early |

## Phase 1 — Static site and national data (done 2026-10-26)

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| T-101 | Create the public GitHub repo, Astro skeleton, `deploy.yml` → Pages | claude-opus | done | Live 2026-10-26 at https://khush-orf.github.io/ai-regulation-tracker/ (repo Khush-ORF/ai-regulation-tracker; first green deploy a54e486) |
| T-102 | Design tokens, fonts, top bar, theme toggle | claude-opus | done | `src/styles/global.css`, `src/layouts/Base.astro`; fonts self-hosted via Fontsource |
| T-103 | Map home: country markers, hover, panel, list view | claude-opus | done | Globe (`src/scripts/globe.js`) with real records; chat and extra layers left for later phases |
| T-104 | Country profile template | claude-opus | done | `src/pages/country/[slug].astro` |
| T-105 | Regulations explorer | claude-opus | done | Client-side filters (country, type, status, stream, text). Pagefind deferred: the data is small enough to filter in the page |
| T-106 | `validate.yml` | claude-opus | done | Build-time schema check, plus id/filename and duplicate check |
| T-107 | Seed data: India | claude-opus (subagent) | done | 30 records (15/10/5). Report: `Claude/research/T-107-seed-india.md`. Re-check DPDP phase dates mid-Nov 2026 |
| T-108 | Seed data: Brazil | claude-opus (subagent) | done | 24 records (13/6/5). Report: `T-108-seed-brazil.md`. ANPD order against Meta (2024) still to add |
| T-109 | Seed data: South Africa | claude-opus (subagent) | done | 14 records (9/4/1). Report: `T-109-seed-south-africa.md`. The 2026 draft policy was withdrawn; the revised policy is pending |
| T-110 | Seed data: South Korea | claude-opus (subagent) | done | 24 records (13/6/5). Report: `T-110-seed-south-korea.md`. MSIT final notices not yet sourced |
| T-111 | Seed data: China | claude-opus (subagent) | done | 26 records (18/6/2). Report: `T-111-seed-china.md`. China Law Translate returned 403 to our fetcher |
| T-112 | `/about` methodology and disclaimer | claude-opus | done | Includes SoI/Natural Earth attribution and the South Korea note (ADR-013, ADR-018) |

## Phase 2 — Automation (backlog)

| ID | Task | Owner | Status | Notes |
|---|---|---|---|---|
| T-201 | Run `scripts/check_sources.py` on a GitHub runner; compare with the T-004 results | — | todo | Watch the TLS chains (egazette, gov.cn) and CN reachability |
| T-202 | Ship the missing intermediate certificates for sources with incomplete chains, if the runner fails | — | todo | Never disable verification |
| T-203 | Owner registers the Assembly Open API key and the law.go.kr `OC` ID; store them as Actions secrets | owner | todo | Q13 |
| T-204 | Pipeline design (`Claude/PIPELINE.md`, ADR-019) | claude-opus | done | Agreed 2026-10-27 |
| T-205 | Share the record schema between site and pipeline (`src/schema.mjs`) | claude-opus | done | Site build and Node both validate all 118 records |
| T-206 | Layer 1 crawler: source registry, polite fetch, parsers, AI-relevance filter | claude-opus | review | 24 of 26 sources enabled; local run read 24/24 OK, 62 candidates. CAC timed out from this PC; check on a runner |
| T-207 | Extractor: GitHub Models → validated records, confidence caps, change report | claude-opus | review | Write path and decision rules tested with mock model replies. Real model calls are untested until the first Actions run (needs GITHUB_TOKEN) |
| T-208 | `pipeline.yml`: daily run, data PR, auto-merge rules, deploy dispatch | claude-opus | review | Not yet run on GitHub. Owner must enable Actions PR permissions (PIPELINE.md setup) |
| T-209 | Coverage audit + `audit.yml` (OECD.AI comparison, status, staleness, links, counts) | claude-opus | review | Local run: 48/131 OECD national items matched, 83 listed for triage; 3 status flags; 16 low-confidence records |
| T-210 | Layer 2 sources (NPC Observer, DigiChina, CSET, PRS, OECD.AI as candidates) | claude-opus | in-progress | NPC Observer, DigiChina and OECD.AI (5 countries) are in; CSET still to add |
| T-211 | Layer 3: Wayback CDX lookups for blocked sources | — | todo | |
| T-212 | Layer 4: inbox reader + subscriptions list | — | todo | Owner creates the inbox |
| T-213 | Layer 5: GDELT and news RSS discovery | — | todo | |
| T-214 | MSIT: find a feed with titles (RSS or KDI EIEC) | — | todo | MSIT's list page fills titles with JavaScript |
| T-215 | Triage the first audit's 83 unmatched OECD items (add or note exclusions) | owner | todo | Some are out of scope (e.g. autonomous-vehicle standards, university courses) |
| T-216 | Fix status histories flagged by the audit (e.g. PL 2338's last entry is 2025-05) | — | todo | The daily run's tracked-bill feeds will catch new steps; older ones need a backfill |
