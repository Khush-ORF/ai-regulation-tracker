# Decision log (ADRs)

Append-only. To change a decision, add a new ADR that supersedes the old one, and mark the old one `Superseded by ADR-xxx`.

Statuses: `Proposed`, `Accepted`, `Superseded`.

---

### ADR-001 — Zero-cost stack
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** The project must be buildable and runnable at no cost. No service that needs a paid plan or a credit card.
- **Consequence:** Free tiers (GitHub, Cloudflare, free LLM tiers) carry rate limits. Every design must degrade gracefully when a limit is hit.

### ADR-002 — GitHub Pages hosting, public repo
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** A static site deployed to GitHub Pages from a public repo. Automation runs on GitHub Actions.
- **Consequence:** No server-side code on the site. Anything dynamic is done at build time, in the browser, or in the one free proxy (ADR-006).

### ADR-003 — Git as the database
- **Status:** Proposed
- **Decision:** One JSON file per record in `data/`, validated by JSON Schema in CI. Build emits a static JSON API.
- **Why:** free, versioned, auditable, reviewable through PRs.

### ADR-004 — Automation through pull requests
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** Bots never push to `main`. A daily data PR is auto-merged only when every record has confidence ≥ 0.85, the PR has no fund or money fields, and validation passes. Everything else waits for one-click owner approval.
- **Why:** meets "no manual data entry" while keeping wrong figures off a research site.

### ADR-005 — Own boundary files; official India map
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** No third-party basemap. Render only our own TopoJSON. India is always shown with the official Survey of India boundaries, including J&K, Ladakh, Aksai Chin and Arunachal Pradesh. This applies to every map view, the world backdrop, thumbnails and social-share images.
- **Consequence:** Pakistan, China and other neighbouring shapes in the backdrop must be clipped to match India's official boundary. T-006 must supply a dataset that does this before any map ships.

### ADR-006 — Free, provider-agnostic LLMs
- **Status:** Accepted (owner, 2026-10-26; the Cloudflare Worker for the chatbot is approved)
- **Decision:** Extraction uses GitHub Models inside Actions. The chatbot uses a free-tier LLM (Gemini primary, Groq fallback) through a free Cloudflare Worker. All calls go through one adapter so the provider can be swapped by config.
- **Note:** The Claude API is paid, so it's excluded under ADR-001. It can be swapped in later if a budget appears.

### ADR-007 — `Claude/` as the shared agent workspace
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** All plans, decisions, tasks and hand-offs live in `Claude/`. Root `AGENTS.md` and `CLAUDE.md` point agents there.

### ADR-008 — Astro + MapLibre + Pagefind
- **Status:** Proposed
- **Decision:** An Astro static site with React islands, MapLibre GL JS for the map, and Pagefind for search.
- **Why:** content-heavy static site, small JavaScript payload, works on Pages.

### ADR-009 — Selection panel on the right (desktop)
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** On desktop, the selected country or state opens a 400px right-side panel and the map re-fits around it. On mobile it's a bottom sheet. This supersedes the bottom panel shown in mockup v1.

### ADR-010 — Dark default with a light theme
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** The dark "night map" theme is the default, with a light theme toggle for print, reports and presentations. Both themes use the same tokens (DESIGN §3.2).

### ADR-011 — Taiwan shown as a separate territory
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:** Taiwan is drawn with its own outline (including Penghu, Kinmen and Matsu) as a separate territory. It's filled neutral grey (`--land`), has no label, and is not tracked. China's tracked units are its 31 mainland provincial-level divisions plus Hong Kong and Macau (33 in total).

### ADR-012 — Remaining Phase 0 defaults accepted
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:**
  - Key Streams: keep the draft list of 9 (DESIGN §4).
  - Priority states: keep the draft list (SOURCES §6).
  - Names: repo `ai-regulation-tracker`, site "AI Regulation Tracker".
  - Interface language: English, with original-language titles shown alongside.

### ADR-013 — India boundary data: SoI credit, non-commercial; disputed inter-state areas neutral
- **Status:** Accepted (owner, 2026-10-26)
- **Decision:**
  - Use the SoI state layer (DataMeet/ramSeraph mirror) as recommended in T-006.
  - Credit "Source: Survey of India, Government of India" on `/about`.
  - Add a `DATA-LICENSE` note beside the TopoJSON files saying the data is SoI-derived, for non-commercial display, and not covered by the repo licence.
  - Do not ask SoI for written permission.
  - The 4 SoI "DISPUTED" inter-state polygons stay as separate neutral areas: `--land` fill, no label, no data, no hover. They are not merged into any state.
- **Consequence:** the site must stay non-commercial (no ads, no paid tiers) while it uses this geometry.

### ADR-014 — Source registry v2 and crawler honesty
- **Status:** Accepted (owner, 2026-10-26; Q12 = rely on the replacement sources only). Q13 (Korean keys) is still open.
- **Decision:**
  - Adopt the verified registry in SOURCES.md v2.
  - Replacements: DOU → Senado legislation API; DCDT → gov.za; NPC → NPC Observer, China Law Translate and DigiChina; likms → Assembly Open API; MeitY, PIB and Union Budget → IndiaAI, Sansad, TRAI, RBI, SEBI and PRS.
  - The crawler always identifies itself honestly. It never spoofs a browser User-Agent and never works around bot filters, CAPTCHAs or logins. It never disables TLS verification.
- **Why:** getting past a site's bot protection is unauthorised access in practice, whatever the intent, and it's a reputational risk for a research institution.

### ADR-015 — Render the map with D3 + SVG instead of MapLibre
- **Status:** Accepted (owner approved mockup v4, 2026-10-26). Supersedes the MapLibre part of ADR-008
- **Decision:** Draw our own TopoJSON with D3 v7 (`d3-geo`) and topojson-client as SVG. Zoom by transforming a group, with non-scaling strokes.
- **Why:** there's no basemap or tiles to serve (ADR-005 rules out third-party basemaps anyway). It's lighter: about 530 KB of boundary data for all views. It allows cartographic styling (dash-dot boundaries, hatching, labels) and prints cleanly. MapLibre's strengths (vector tiles, street-level zoom) aren't needed for admin-1 maps. Proven in mockup v3.

### ADR-016 — Visual direction: survey sheet (light) and cyanotype (dark)
- **Status:** Accepted (owner approved mockup v4, 2026-10-26)
- **Decision:** Replace the generic dark-UI tokens in DESIGN §3 with the survey-sheet and cyanotype system in `Claude/design/mockup-v3.md`: Spectral, Spectral SC, Public Sans and IBM Plex Mono; stamp-style statuses; map collar with coordinates, scale bar and Reference box.
- **Why:** the owner rejected v2 as looking AI-generated and asked for a handcrafted feel. This direction comes from the subject's own materials (survey maps, gazettes, registers).

### ADR-017 — Interactive globe as the map home
- **Status:** Accepted (owner approved mockup v4, 2026-10-26)
- **Decision:**
  - The home map is a D3 orthographic globe. Drag turns it; wheel or pinch zooms from ×0.8 to ×18.
  - Zoom buttons and arrow/+/− keys give a non-gesture path.
  - Clicking a country flies to it and shows its states.
  - The India Grid view stays as the accessible alternative.
- **Note:** an orthographic globe shows one hemisphere at a time, so Brazil and Korea are never both visible. The "Go to" country chips cover this.

### ADR-018 — Site name: Global South AI Regulation Tracker
- **Status:** Accepted (owner, 2026-10-26). Supersedes the site name in ADR-012; the repo name `ai-regulation-tracker` is unchanged.
- **Decision:**
  - The site is called "Global South AI Regulation Tracker".
  - Wordmark: a small globe with its southern hemisphere hatched; "Global South" in letter-spaced Spectral SC with ISO codes `IN · BR · ZA · KR · CN`; "AI Regulation *Tracker*" in Spectral.
  - The page `<title>` uses the full name.
- **Note:** South Korea isn't usually classed as Global South (it's a high-income OECD member). `/about` should say in one line why it's included, e.g. as a comparator for state-led AI regulation.

### ADR-019 — Layered, legitimate-access data pipeline
- **Status:** Accepted (owner, 2026-10-27)
- **Decision:** Collect data through five layers, as specified in `Claude/PIPELINE.md`:
  1. official APIs and feeds;
  2. reputable secondary trackers;
  3. read-only web archives;
  4. publisher email push;
  5. news, used for discovery only.

  A monthly coverage audit compares our records with OECD.AI's public policy database.

  Access restrictions are never circumvented: no browser imitation, proxies, VPNs, CAPTCHA solving or bot-filter evasion. A block is treated as an answer, and another layer is used instead.
- **Why:** completeness without legal or reputational risk. The owner noted the data is public, but that doesn't authorise getting round access controls. Several layers overlapping, plus an audit against an independent baseline, makes gaps visible instead of silent.
- **Consequence:** Layer 2–5 evidence is confidence-capped and always reviewed. Auto-merge needs Layer 1 evidence (see PIPELINE.md "Auto-merge rules").
