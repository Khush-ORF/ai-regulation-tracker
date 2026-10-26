# Data schema v1 (frozen 2026-10-26, T-008)

All data lives in git as JSON, one file per record.

**The schema is code: `src/content.config.ts`** (Zod, via Astro content collections). Every build checks every file in `data/` against it, so `validate.yml` fails a PR with an invalid record. That file wins if this document disagrees. The agent-facing version is `Claude/research/SEED-BRIEF.md`.

Changes from the draft below:
- Jurisdiction codes are ISO alpha-2 (`IN`, `BR`, `ZA`, `KR`, `CN`). State codes arrive in Phase 3.
- Dates may be partial (`YYYY`, `YYYY-MM`).
- `amount_usd` is not stored yet; FX conversion comes in Phase 2.

## File layout

```
data/
  jurisdictions/IN.json, IN-KA.json, BR-SP.json ...
  instruments/<id>.json        # regulations, bills, guidelines, standards
  initiatives/<id>.json        # AI diffusion programmes
  funds/<id>.json              # incentives and allocations
  fx/2025.json                 # annual average FX → USD
corpus/<source-id>/<hash>.txt  # extracted source text (not shown on site)
sources/registry.json          # crawl targets (generated from SOURCES.md)
```

## IDs
- **Jurisdiction:** ISO 3166-2, e.g. `IN`, `IN-KA`, `BR-SP`, `ZA-GP`, `KR-11`, `CN-BJ`.
- **Records:** `<jurisdiction>-<slug>-<year>`, lowercase, e.g. `in-ai-governance-guidelines-2025` or `br-pl-2338-2023`.

## Common fields (all record types)

| Field | Type | Notes |
|---|---|---|
| `id` | string | Stable; never reused |
| `jurisdiction` | string | Jurisdiction ID |
| `title` | string | English |
| `title_original` | string? | Original language and script |
| `summary` | string | English, 40–120 words, neutral tone |
| `streams` | Stream[] | 1–3 items (DESIGN §4) |
| `sources` | Source[] | At least 1. `{url, title, publisher, date, lang}` |
| `provenance` | enum | `auto` \| `reviewed` |
| `confidence` | number | 0–1, from extraction |
| `first_seen` | date | |
| `last_checked` | date | |

## Instrument (regulation)

| Field | Type | Notes |
|---|---|---|
| `type` | enum | `law`, `bill`, `rule`, `guideline`, `framework`, `standard`, `advisory`, `strategy`, `order` |
| `status` | enum | `proposed`, `in_progress`, `passed`, `in_force`, `voluntary`, `lapsed` |
| `binding` | boolean | |
| `issuing_body` | string | e.g. "MeitY", "CAC", "MSIT" |
| `dates` | object | `{announced?, introduced?, passed?, effective?, lapsed?}` |
| `sectors` | string[] | e.g. `finance`, `health`, `all` |
| `approach` | enum? | `risk_based`, `sectoral`, `principles`, `content_specific`, `other` |
| `key_obligations` | string[] | Short bullets |
| `status_history` | `{status, date, source_url}[]` | Appended on change |

## Initiative (AI diffusion)

| Field | Type | Notes |
|---|---|---|
| `kind` | enum | `mission`, `coe`, `compute`, `skilling`, `public_service`, `startup_support`, `data_platform`, `research`, `other` |
| `agency` | string | |
| `start` / `end` | date? | |
| `status` | enum | `announced`, `active`, `completed`, `paused` |
| `beneficiaries` | string? | e.g. "MSMEs", "state schools" |
| `linked_funds` | string[] | Fund IDs |

## Fund / incentive

| Field | Type | Notes |
|---|---|---|
| `kind` | enum | `budget_allocation`, `grant`, `subsidy`, `tax_incentive`, `compute_subsidy`, `vc_fund`, `prize`, `other` |
| `amount` | number | In the local currency's base unit (e.g. rupees, not crore) |
| `currency` | ISO 4217 | `INR`, `BRL`, `ZAR`, `KRW`, `CNY` |
| `amount_usd` | number | Computed at build time from `fx/<fiscal_year>.json`; never extracted |
| `stage` | enum | `announced`, `allocated`, `disbursed` |
| `fiscal_year` | string | Local fiscal year, e.g. `2025-26` (India), `2025` (Brazil) |
| `period` | object? | `{from, to}` for multi-year envelopes |
| `purpose` | string | |
| `parent` | string? | Fund ID when it's a tranche of a larger envelope |

**Automation rule:** any record with a fund field always goes to owner review (`provenance: auto` is never auto-merged for funds). See ADR-004.
