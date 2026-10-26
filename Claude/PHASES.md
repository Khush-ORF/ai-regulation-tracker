# Roadmap

Each phase ends with a working, deployed result. Do not start a phase until the previous phase's exit criteria are met, unless `DECISIONS.md` says otherwise.

## Phase 0 — Design and workspace ✓ **done 2026-10-26** (mockup v4 approved; ADR-015 to ADR-018 accepted)
Goal: agree the design before any code.
- Shared workspace (`Claude/`) and working rules
- System design and visual design system (`DESIGN.md`)
- Data schema v1 (`DATA_SCHEMA.md`)
- Source registry (`SOURCES.md`), with each source checked for reachability from GitHub runners
- Map home mockup approved by the owner
- Open questions Q1–Q8 answered

**Exit:** the owner approves `DESIGN.md` and the mockup; ADRs move from *Proposed* to *Accepted*.

## Phase 1 — Static site and national data ← **current**
Goal: a live URL on GitHub Pages with all 5 countries at national level.
- Create the public repo and the Astro skeleton; `deploy.yml` deploys to Pages
- Design tokens, top bar, theme toggle, fonts
- Map home with country-level markers, hover, click to open the panel, and the list-view alternative
- Country profile pages (5), the regulations explorer and Pagefind search
- `validate.yml` with JSON-schema checks
- **Seed data:** agents research each country's national instruments, initiatives and funds, with sources. This one-off seeding is done by agents and reviewed via PR; the owner does no data entry.
- `/about` page with methodology and disclaimer

**Exit:** live site; ≥ 10 sourced records per country; Lighthouse accessibility ≥ 90.

## Phase 2 — Automation
Goal: the tracker keeps itself up to date.
- `sources/registry.json` built from `SOURCES.md`
- Crawlers per source type (RSS, JSON API, HTML change detection, PDF text)
- `extract.yml`: GitHub Models extraction, translation and confidence scoring
- Daily data PR with a confidence report; `automerge.yml` for the safe subset
- `/updates` feed and RSS
- FX conversion (`fx.yml`)

**Exit:** 14 consecutive days of unattended daily runs; the owner's work is limited to reviewing PRs.

## Phase 3 — States, initiatives and funds
Goal: state-level depth plus the diffusion and money views.
- Admin-1 boundaries for all 5 countries (India official boundaries; see DESIGN §1.2)
- State drill-down on the map; state profile pages
- State sources added to the registry, priority states first (see `SOURCES.md` §6)
- `/initiatives` page and the `/funds` dashboard (announced vs allocated vs disbursed; per capita)
- Map layers: Initiatives and Funds choropleths

**Exit:** all priority states have profiles; funds figures each have a source and a fiscal year.

## Phase 4 — Chatbot, Key Streams and alerts
Goal: ask questions; compare themes across countries.
- Cloudflare Worker proxy, free-tier LLM adapter, Turnstile, rate limits
- 4a: structured lookup and BM25 retrieval; answers cite record IDs
- 4b (if needed): embeddings built in Actions
- `/streams` cross-country comparison pages
- Alerts: RSS per country, state and stream (free); optional email via GitHub "watch" or an RSS-to-email service

**Exit:** the chatbot answers a 30-question test set with correct citations at ≥ 90%.
