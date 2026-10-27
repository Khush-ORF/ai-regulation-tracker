# Data pipeline design (Phase 2)

Status: **v1, agreed with the owner 2026-10-27** (ADR-019). Layer 1 and the coverage audit are being built; Layers 2–5 come next.

## Goal
Keep the tracker complete and current with **no manual data entry**, using only legitimate channels and reputable sources. The owner's only routine job is reviewing pull requests.

## Ground rule: legitimate access only
Public information doesn't give us permission to get around a site's access controls. The pipeline therefore:
- **Identifies itself honestly.** User-Agent `AIRegTrackerBot/0.1 (+https://github.com/Khush-ORF/ai-regulation-tracker)`, never a browser imitation.
- **Respects robots.txt** (RFC 9309) and any crawl-delay, waits at least 2 seconds per host, and caches responses.
- **Never bypasses** CAPTCHAs, logins, paywalls, bot filters (Akamai, Cloudflare challenges), geo-blocks or IP blocks. No proxies, VPNs or residential IPs to get round a block.
- **Treats a block as an answer.** A `401`, `403`, `429` or challenge page means "not allowed": log it, don't retry with tricks, and use another layer.
- **Registers where registration is offered.** Free official API keys and accounts (Korea's Assembly and law.go.kr, Brazil's INLABS) are legitimate. The owner registers; the keys go in Actions secrets.
- **Stores facts and links, not copies.** Summaries are written in our own words.

The rationale (unauthorised-access risk under India's IT Act s.43 and similar laws, and reputational risk) is in ADR-014 and ADR-019.

## Five layers

| Layer | What | Examples | Role |
|---|---|---|---|
| **1. Official machine-readable channels** | APIs, RSS, JSON feeds, listing pages that allow crawling | Câmara and Senado APIs, ANPD JSON, PMG API, gov.za RSS, Assembly Open API, gov.cn JSON, CAC listing, RBI and SEBI RSS, IndiaAI news | **Primary discovery and evidence.** Can support auto-merge |
| **2. Reputable secondary trackers** | Expert trackers and translators | OECD.AI policy database, NPC Observer, DigiChina, CSET translations, PRS | Discovery plus cross-checking. Evidence capped at confidence 0.8 (always reviewed) |
| **3. Web archives** | Internet Archive Wayback (CDX API), read-only | Archived MeitY, PIB and e-Gazette pages | Confirms items from blocked sites. Never used to fetch live pages |
| **4. Publisher push** | A dedicated inbox subscribed to official alerts and newsletters | PIB/ministry email alerts, regulator newsletters, law-firm AI bulletins | Recovers most of what blocked sites publish |
| **5. News discovery** | GDELT news API and reputable outlets' RSS | — | **Discovery only.** A news item never becomes a record unless Layers 1–4 confirm it |

## Daily flow (`.github/workflows/pipeline.yml`, 20:30 UTC = 02:00 IST)

```
crawl (Layer 1 now; Layers 2–5 later)
  → candidates: { source, country, title, url, date, snippet }
  → AI-relevance filter (multilingual keywords) + de-duplication
      (against the seen-URL state and every source URL already in data/)
extract (GitHub Models, free with GITHUB_TOKEN)
  → per candidate: fetch the page text if robots.txt allows
  → LLM decides: ignore | new record | update existing record
  → output validated against src/schema.mjs (the same schema the site uses)
  → deterministic confidence caps (see below)
validate (npm run validate: full site build)
  → if data changed: branch data/YYYY-MM-DD, commit, open a PR with a change report
  → auto-merge only if every rule below holds, then dispatch deploy.yml
```

### Auto-merge rules (ADR-004, made precise)
A data PR merges automatically only if **all** of these hold:
1. Every changed record has confidence ≥ 0.85.
2. No record has fund fields (no `funds/` changes).
3. No status moves backwards, and nothing becomes `lapsed`.
4. Every new record's evidence is a Layer 1 page from an official domain whose text was fetched.
5. `npm run validate` passed.

Everything else stays open for the owner.

### Confidence caps (applied by code, not chosen by the model)
| Evidence | Max confidence |
|---|---|
| Official page text fetched and quoted | model's value, max 0.95 |
| Official listing title and snippet only | 0.8 |
| Secondary source (Layer 2) | 0.8 |
| Archive copy (Layer 3) | 0.75 |
| Inbox or news (Layers 4–5) | 0.6, and needs confirmation |

## Monthly coverage audit (`.github/workflows/audit.yml`)
Opens or updates a GitHub issue "Coverage audit YYYY-MM" with:
1. **OECD.AI comparison.** For each country, every initiative in OECD.AI's public policy database (`api.oecd.ai/policy-initiatives/public?countryIds=<id>`, the same API its website uses) that doesn't match one of our records by title or URL. OECD IDs: IND 79, BRA 26, ZAF 162, KOR 92, CHN 35.
2. **Status checks.** Records marked `passed` whose effective date has passed, and `proposed` or `in_progress` records older than 12 months.
3. **Stale records.** `last_checked` more than 90 days ago.
4. **Dead source links.** Sources returning 404 or 410. Blocked sources (401/403) are reported separately, not as dead.
5. **Coverage counts** per country × record type × Key Stream, so thin areas stand out.

Unmatched OECD items also feed the next daily run as Layer 2 candidates.

## Code layout
| Path | What |
|---|---|
| `src/schema.mjs` | Record schemas (Zod), shared by the site build and the pipeline |
| `pipeline/sources.json` | Source registry: id, country, layer, parser, URL, options |
| `pipeline/lib/http.mjs` | Polite fetch: robots.txt, crawl-delay, per-host spacing, timeouts, block detection |
| `pipeline/lib/parsers.mjs` | `rss`, `json`, `html-links` parsers |
| `pipeline/lib/keywords.mjs` | AI relevance terms in English, Portuguese, Korean and Chinese |
| `pipeline/lib/llm.mjs` | Provider-agnostic chat client (GitHub Models by default; ADR-006) |
| `pipeline/crawl.mjs` | Runs the sources and writes `pipeline/out/candidates.json` |
| `pipeline/extract.mjs` | Turns candidates into new or updated records in `data/` |
| `pipeline/audit.mjs` | Coverage audit, writes `pipeline/out/audit.md` |
| `pipeline/out/` | Run outputs, not committed. The seen-URL state lives in the Actions cache |

## One-time owner setup (before the first scheduled run)
1. **Settings → Actions → General → Workflow permissions:** "Read and write permissions", and tick "Allow GitHub Actions to create and approve pull requests".
2. **Optional free keys** as repo secrets: `KR_ASSEMBLY_KEY` (open.assembly.go.kr) and `KR_LAW_OC` (open.law.go.kr). The pipeline works without them, with less depth for Korea.

## Known limits
- Pull requests opened by `GITHUB_TOKEN` don't trigger other workflows, so the pipeline runs validation itself and dispatches the deploy after an auto-merge.
- GitHub Models' free limits are per day and per minute. The extractor caps candidates per run (default 25) and processes the rest the next day.
- PDFs: Layer 1 reads HTML and feeds. A PDF candidate is passed on with its listing title and snippet, which caps its confidence at 0.8 so it gets reviewed.
