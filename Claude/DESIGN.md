# Design spec — AI Regulation Tracker

Status: **draft v0.2 (Phase 0, being fine-tuned with the owner)**. Last updated 2026-10-26.

Scope: AI regulation, AI diffusion initiatives, government incentives and funds at **national and state/province level** for **India, Brazil, South Africa, South Korea and China**.

Hard constraints:
- **Zero cost** (ADR-001).
- **Hosted on GitHub** (ADR-002).
- **No manual data entry.** The owner only approves pull requests (ADR-004).

---

## 1. Architecture (zero-cost)

```
 Official sources (gazettes, ministries, parliaments, regulators)
        │  daily, GitHub Actions cron
        ▼
 Crawlers  ──►  corpus/ (extracted text + hashes; no PDFs stored)
        │
        ▼
 LLM extraction (GitHub Models, free via GITHUB_TOKEN)
   translate → classify → fill schema → confidence score
        │
        ▼
 Bot opens a pull request "data: YYYY-MM-DD updates"
   high confidence + non-financial  → auto-merge
   low confidence OR any money field → waits for owner review
        │  merge to main
        ▼
 Build (Astro static site) ──► GitHub Pages
        │
        ├─ Map, profiles, explorer, funds, streams, updates feed, RSS
        └─ Chat panel ──► Cloudflare Worker (free) ──► free-tier LLM
```

### Components

| Layer | Choice | Why it's free |
|---|---|---|
| Repo | Public GitHub repo | Public repos get free Pages and free Actions minutes |
| Site | **Astro** static site + React "islands" for map, explorer and chat | Pure static output for Pages |
| Hosting | **GitHub Pages** | Free for public repos |
| Database | **Git itself.** One JSON file per record in `data/`, validated in CI | No DB server; git history is the version history and audit trail |
| Static API | Build emits `/api/*.json`, e.g. `/api/jurisdictions/IN-KA.json` | Served by Pages |
| Map | **MapLibre GL JS** with **our own boundary files**, no third-party basemap | No API key; full control of boundaries (see §1.2) |
| Search | **Pagefind** (static full-text search index) | Runs in the browser |
| Scheduler | **GitHub Actions** cron | Free on public repos |
| Extraction LLM | **GitHub Models** from inside Actions (`permissions: models: read`) | Free, rate-limited; no key to manage |
| Chatbot LLM | Free tier of Gemini API (primary), Groq (fallback), behind a **Cloudflare Worker** | Worker free tier; the key never reaches the browser |
| Retrieval | Phase 4a: BM25 keyword index (MiniSearch) built at deploy time. Phase 4b: embeddings with a small open model run in Actions | No paid embedding API |
| FX conversion | ECB reference rates (free, no key), annual average per fiscal year | Free |
| Analytics (optional) | GoatCounter free tier, or none | Free and privacy-friendly |

**Provider-agnostic by design.** All LLM calls go through one adapter (`lib/llm.ts`) configured by environment variables. If a free tier changes, or a budget appears later, for example for Claude, switching provider is a config change, not a rewrite.

**Why there's one non-GitHub piece.** A public static site cannot call an LLM without exposing a key. The Cloudflare Worker is the smallest free proxy that solves this. If the owner rejects it, the fallback is that the chatbot ships disabled and the rest of the site stays 100% GitHub.

### 1.1 GitHub Actions workflows

| Workflow | Trigger | Job |
|---|---|---|
| `crawl.yml` | cron daily 02:00 IST (20:30 UTC) | Fetch every source in `sources/registry.json`; diff against last hash; write new text to `corpus/` |
| `extract.yml` | after crawl | LLM-extract candidate records → open or update the daily data PR with a confidence report in the PR body |
| `validate.yml` | every PR | JSON-schema validation, dead-link check, required `source_url`, duplicate detection |
| `automerge.yml` | PR labelled `auto-ok` by extract | Merge only if validate passes |
| `deploy.yml` | push to `main` | Build Astro → Pagefind → chat index → deploy to Pages |
| `fx.yml` | monthly | Refresh ECB rates → `data/fx/` |

Notes:
- **Scheduled workflows on public repos pause after 60 days without repo activity.** The daily bot commits keep the repo active; `deploy.yml` also has a manual `workflow_dispatch`.
- **Crawling etiquette is mandatory:** respect robots.txt, rate-limit to 1 request every 2 seconds per host, send an identifying User-Agent with the repo URL, and **never bypass CAPTCHAs or logins**. If a source is gated, use an alternative source (see `SOURCES.md`).
- Store only extracted text excerpts and hashes, never copies of news articles or PDFs. Link to the original.

### 1.2 Map and boundaries (important)

- **India must be drawn with the official Survey of India boundaries**, including J&K and Ladakh. Most open datasets (Natural Earth, geoBoundaries, OSM-based basemaps) do not show them. Publishing them from an Indian institution is a legal and reputational risk. **We therefore use no third-party basemap** and render only our own boundary files.
- **Build recipe (T-006; full commands in `Claude/research/T-006-india-boundaries.md` §2.2):**
  - **India states and UTs** come from the Survey of India's Administrative Boundary Database state layer, via the DataMeet community mirror `ramSeraph/indian_admin_boundaries`. The national outline is a dissolve of that same layer, so the two share edges exactly. It is QA-checked against SoI's own `Outline_of_India` (2026).
  - **Brazil, South Africa, Korea and China admin-1** come from Natural Earth 10m admin-1 (public domain). China is erased by India's outline, because Natural Earth's Xinjiang contains Aksai Chin. Hong Kong and Macau come from the Natural Earth admin-0 features.
  - **World backdrop** uses Natural Earth 10m admin-0 in its **India point-of-view** edition (`_ind`). India is removed from it, every neighbour is erased by India's outline, and India's own outline is added back.
  - geoBoundaries is **rejected** for China: it includes "Taiwan Province" and appears to draw China's claim over Arunachal.
- Output files (simplified with mapshaper, each under 300 KB):
  - `public/geo/world.topojson`: faint backdrop.
  - `public/geo/india.topojson`: states plus the national outline.
  - `public/geo/admin1_bra_zaf_kor_chn.topojson`: the other four countries, split per country if it's too large.
- **Layer order:** ocean → world backdrop → admin-1 for the four countries → India states → India outline stroke (1–1.5 px).
- **Display names** come from an in-app lookup keyed on state codes (LGD for India, ISO 3166-2 elsewhere), not from the file strings. SoI names are upper case, and Natural Earth uses names like "Xizang".
- **Attribution and licence:** credit "Source: Survey of India, Government of India" and "Made with Natural Earth" on `/about`. Put a `DATA-LICENSE` note next to the TopoJSON files saying the India geometry is SoI-derived, for non-commercial display, and not covered by the repo's code licence. Never print SoI's certification wording.
- **QA before any map ships:** the visual checklist in T-006 §2.2 (northern tip near 37.08°N, Aksai Chin, Arunachal, Sir Creek, island UTs, no neighbour pixel inside India).
- **Taiwan** is drawn as a separate territory with its own outline (including Penghu, Kinmen and Matsu), neutral grey, unlabelled and not tracked (ADR-011).
- Admin-1 counts: India 36 (28 states + 8 UTs), Brazil 27 (26 states + DF), South Africa 9 provinces, Korea 17, China 33 (31 mainland provincial-level units plus Hong Kong and Macau).

### 1.3 Chatbot ("Ask the Tracker")

- **Scope:** answers only from the tracker's own records and source excerpts. It declines anything else. It never gives legal advice and shows a disclaimer.
- **Context-aware:** the panel sends the current page's jurisdiction ID, e.g. `IN-KA`, so "what incentives exist here?" works.
- **Two retrieval paths:**
  1. **Structured lookup** for numbers, lists and statuses. The Worker loads `/api/*.json` for the relevant jurisdictions and passes those records as context. Numbers come from records, never from model memory.
  2. **Text retrieval** (BM25 now, embeddings later) over summaries and source excerpts for "what does X require?".
- **Every claim cites record IDs**, rendered as clickable source chips.
- **Abuse protection** (to keep the free tier alive): Cloudflare Turnstile (free), a per-IP limit of 20 questions per hour, a 2 KB maximum question length, and a cache of identical questions for 24 hours.

---

## 2. Information architecture

| Route | Page |
|---|---|
| `/` | **Map** (home) |
| `/country/[iso]` | Country profile, e.g. `/country/in` |
| `/country/[iso]/[state]` | State profile, e.g. `/country/in/karnataka` |
| `/explorer` | Regulations explorer (filterable table) |
| `/initiatives` | AI diffusion initiatives |
| `/funds` | Incentives and funds dashboard |
| `/streams` and `/streams/[stream]` | Key Streams: compare one theme across all countries |
| `/updates` | Change feed, also published as RSS (`/updates.xml`) |
| `/item/[id]` | Single regulation, initiative or fund record, with history |
| `/about` | Methodology, sources, disclaimer, how automation works |

The chat launcher appears on every page.

### Profile page (country or state) — tab layout
`Overview | Regulations | Initiatives | Incentives & funds | Key streams | Timeline`

- **Overview:** 4 stat tiles (instruments tracked, in force, initiatives, funds allocated in INR/BRL/ZAR/KRW/CNY plus USD), the latest 5 changes, and the governing bodies.
- Every list item shows a status pill, its date, the issuing body, a source link, an **Auto-extracted / Reviewed** badge, and when it was last checked.

---

## 3. Visual design system

> **Superseded by ADR-016 and ADR-017 (accepted 2026-10-26).** The current system is the survey-sheet (light) and cyanotype (dark) design with an interactive globe home, specified in `Claude/design/mockup-v3.md` and its v4 note.
> - **Tokens** live in `src/styles/global.css`.
> - **Fonts:** Spectral, Spectral SC, Public Sans and IBM Plex Mono, self-hosted via Fontsource.
> - **Stamps:** status stamps keep the shape cues below.
> - **Map:** D3 orthographic globe (ADR-015).
>
> The token tables and layout in §3.2–3.6 are the earlier draft. Use them only where the mockup is silent.

Inspiration: ai.regulationcheck.com, which has a full-bleed dark map, monospace micro-labels, floating translucent panels and a monochrome UI where only data carries colour.

### 3.1 Principles
1. **The map is the page.** Chrome floats over it and never boxes it in.
2. **Colour = data.** The UI is monochrome. Only status, layer intensity and the selection carry colour.
3. **Traceable by default.** A source and a last-checked date are always one glance away.
4. **Calm density.** It's a research tool, so it shows more information per screen than a marketing site, but with strict hierarchy.

### 3.2 Tokens (dark default)

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0B0D10` | Page, ocean |
| `--land` | `#15191F` | Non-focus land |
| `--land-focus` | `#1E242C` | The 5 tracked countries |
| `--border` | `#262C35` | Admin-1 lines, panel borders |
| `--surface` | `rgba(18,21,26,0.88)` | Floating panels (blur 12px) |
| `--text` | `#E6E8EB` | Primary text |
| `--muted` | `#8B929C` | Secondary text |
| `--accent` | `#F2F2F2` | Primary button (white, as in the reference) |
| `--focus` | `#7CC4FF` | Keyboard focus ring, selected region outline |

A light theme mirrors these tokens for print and reports (`--bg #F7F7F5`, `--land #E9E8E3`, `--text #1A1C1F`).

### 3.3 Status palette (regulations)

| Status | Meaning | Colour | Shape cue |
|---|---|---|---|
| Proposed | Announced or drafted, not yet introduced or consulted | `#9AA0A6` gray | Hollow dot |
| In progress | In consultation, or in committee or parliament | `#F2A33A` amber | Dot |
| Passed | Enacted, not yet in force | `#4C9AFF` blue | Dot |
| In force | Binding and in effect | `#34C38F` green | Dot with ring |
| Voluntary | Guidelines, frameworks, advisories (non-binding) | `#A78BFA` violet | Diamond |
| Lapsed / withdrawn | No longer active | `#5F6368` dim | Hollow, dashed |

The shape cues make status readable without colour, which matters for colour-blind users.

### 3.4 Map layers (toggle, one at a time)
- **Regulations:** state and national markers coloured by the *most advanced* status in that jurisdiction. National markers are larger (r=7 with ring); state markers are r=4.
- **Initiatives:** states shaded by initiative count, 5-step sequential teal.
- **Funds:** states shaded by funds allocated (USD), 5-step sequential blue. Can switch between total and per capita.
- **Filters** apply on top of any layer: status, Key Stream, instrument type, date range.

### 3.5 Typography (free fonts, self-hosted via Fontsource)
- **IBM Plex Mono:** labels, nav, chips, figures. Uppercase, 11–12px, letter-spacing 0.08em.
- **Inter:** body and headings. Two weights only (400, 600).
- **Number format:** Indian numbering for INR (₹10,372 crore); local conventions elsewhere; always with a USD equivalent and the FX year.

### 3.6 Layout — map home
- **Top bar** (floating, translucent): logo · nav (Map, Explorer, Initiatives, Funds, Streams, Updates) · jurisdiction search · "Synced 27 Oct 02:14 IST" · theme toggle.
- **Top-left chips:** layer toggle and filters.
- **Bottom-left:** legend for the active layer.
- **Selection panel:** on desktop a right panel 400px wide, with the map re-fitted to account for it; on mobile a bottom sheet. Shows the stat tiles, the latest items and an "Open profile →" link.
- **Bottom-right:** "Ask the Tracker" chat launcher, which opens a 380px panel.
- **Interactions:**
  - Hovering a region shows a tooltip (name, item counts, top status).
  - Clicking a country flies to it and shows its states. Clicking a state opens the panel. Esc or Back goes up a level.
  - Respects `prefers-reduced-motion`.
- **Accessibility:**
  - A "List view" toggle replaces the map with an equivalent table.
  - All regions are focusable.
  - WCAG AA contrast.

### 3.7 Trust and transparency
- Footer and `/about` explain the automation in plain words.
- An **Auto-extracted** badge (hollow) vs **Reviewed** (filled).
- Each record page shows its git change history ("Status changed Proposed → In progress on 12 Oct 2026, source: …").

---

## 4. Key Streams (draft taxonomy — owner to confirm, Q1)

1. Safety, risk and accountability
2. Data protection and privacy
3. Compute and infrastructure
4. Skilling and talent
5. Public-sector AI and digital public infrastructure
6. Sector rules (finance, health, telecom, elections, media)
7. Startups, industry and investment
8. Research and innovation
9. Content, deepfakes and labelling

Every record can carry 1–3 streams.
