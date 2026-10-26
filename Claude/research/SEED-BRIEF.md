# Seed-data brief (Phase 1, T-107 to T-111)

You are seeding the **national-level** records for one country in the Global South AI Regulation Tracker. Read `Claude/README.md` first and follow its rules. The most important one: **never invent data.** Every record needs a source you actually opened.

Today is **2026-10-26**. Statuses must be correct as of today.

## What to produce
Write one JSON file per record:
- `data/instruments/<id>.json`: laws, bills, rules, guidelines, frameworks, standards, advisories, strategies, orders about AI. Include AI-specific instruments and the most relevant adjacent ones, e.g. data-protection laws that govern automated decisions, and deepfake or content rules.
- `data/initiatives/<id>.json`: government programmes that spread AI use (national missions, compute access, centres of excellence, skilling, AI in public services, startup support, data platforms, research programmes).
- `data/funds/<id>.json`: government money for AI with an **officially stated amount** (budget allocations, multi-year envelopes, grants, subsidies, tax incentives). Skip any figure you can't trace to an official or authoritative source.

**Targets:** about 10–15 instruments, 6–10 initiatives and 2–6 funds. Quality matters more than count: fewer well-sourced records beat padding.

Also write `Claude/research/T-1xx-seed-<country>.md` (your task ID is in your prompt). Include:
- a table of every record: id, title, status, main source;
- anything you weren't sure about and left out;
- any conflicting figures or dates and which one you chose.

Touch **no other files**. Don't run `npm`, `astro` or any build: the lead agent validates everything together.

## File format (must match `src/content.config.ts` exactly)
- **IDs:** lowercase `<jurisdiction>-<slug>-<year>`, letters, digits and hyphens only, e.g. `in-dpdp-act-2023`. The file name is `<id>.json`.
- **Jurisdiction codes:** `IN`, `BR`, `ZA`, `KR`, `CN`; ID prefixes `in-`, `br-`, `za-`, `kr-`, `cn-`.
- **Dates:** `YYYY`, `YYYY-MM` or `YYYY-MM-DD`. Use the most precise one the source supports. Omit date keys you don't know; never use `null`.
- Optional fields you don't know: leave them out entirely. Don't use `null` or empty strings.

### Fields every record has
| Field | Value |
|---|---|
| `id` | as above |
| `jurisdiction` | `IN` \| `BR` \| `ZA` \| `KR` \| `CN` |
| `title` | English title (official English title if one exists) |
| `title_original` | optional; title in the original language and script (Portuguese, Korean, Chinese) |
| `summary` | 40–120 words, neutral, factual, in plain English. What it is, who issued it, what it does. No adjectives like "landmark" or "ambitious". |
| `streams` | 1–3 of: `safety`, `data-protection`, `compute`, `skilling`, `public-sector`, `sector-rules`, `industry`, `research`, `content` |
| `sources` | at least 1 `{ "url", "title", "publisher", "date"?, "lang" }`. Prefer the official text or the government's own page; add a reputable secondary source (e.g. PRS, DigiChina, China Law Translate, NPC Observer, OECD.AI) when it helps. `lang` is a code like `en`, `pt`, `ko`, `zh`. |
| `provenance` | always `"auto"` (the owner reviews later) |
| `confidence` | 0–1. 0.9+ only when an official source states every field; lower it when you inferred a date or status |
| `first_seen` | `"2026-10-26"` |
| `last_checked` | `"2026-10-26"` |

### Instrument fields
| Field | Value |
|---|---|
| `type` | `law` \| `bill` \| `rule` \| `guideline` \| `framework` \| `standard` \| `advisory` \| `strategy` \| `order` |
| `status` | see the status table below |
| `binding` | `true` / `false` |
| `issuing_body` | short name, e.g. `MeitY`, `Câmara dos Deputados`, `DCDT`, `MSIT`, `CAC` |
| `dates` | object with any of `announced`, `introduced`, `passed`, `effective`, `lapsed` |
| `sectors` | e.g. `["all"]`, `["finance"]`, `["health","finance"]` |
| `approach` | optional: `risk_based` \| `sectoral` \| `principles` \| `content_specific` \| `other` |
| `key_obligations` | 0–5 short bullets (strings), each under 20 words |
| `status_history` | optional list of `{ "status", "date", "source_url" }`, oldest first |

**Status meanings:**
| Status | Meaning |
|---|---|
| `proposed` | announced or drafted, not yet formally introduced or put to consultation |
| `in_progress` | in public consultation, or introduced in parliament or committee, not passed |
| `passed` | enacted or adopted, but not yet in effect |
| `in_force` | binding and in effect (including in phases, if any part applies now) |
| `voluntary` | non-binding guidelines, frameworks, strategies or advisories that are published and current |
| `lapsed` | withdrawn, repealed or lapsed |

### Initiative fields
| Field | Value |
|---|---|
| `kind` | `mission` \| `coe` \| `compute` \| `skilling` \| `public_service` \| `startup_support` \| `data_platform` \| `research` \| `other` |
| `agency` | short name |
| `start` / `end` | optional dates |
| `status` | `announced` \| `active` \| `completed` \| `paused` |
| `beneficiaries` | optional short text |
| `linked_funds` | optional list of fund IDs you also created |

### Fund fields
| Field | Value |
|---|---|
| `kind` | `budget_allocation` \| `grant` \| `subsidy` \| `tax_incentive` \| `compute_subsidy` \| `vc_fund` \| `prize` \| `other` |
| `amount` | a number in the currency's **base unit** (rupees, reais, rand, won, yuan). ₹10,371.92 crore = `103719200000`; R$23 billion = `23000000000` |
| `currency` | `INR` \| `BRL` \| `ZAR` \| `KRW` \| `CNY` \| `USD` |
| `stage` | `announced` \| `allocated` \| `disbursed` |
| `fiscal_year` | local fiscal year, e.g. `2024-25` (India), `2025` (Brazil, Korea, China), `2025-26` (South Africa) |
| `period` | optional `{ "from", "to" }` for multi-year envelopes |
| `purpose` | one sentence |
| `parent` | optional fund ID if this is a tranche of a larger envelope |

### Example instrument
```json
{
  "id": "in-dpdp-act-2023",
  "jurisdiction": "IN",
  "title": "Digital Personal Data Protection Act, 2023",
  "summary": "…40–120 words…",
  "streams": ["data-protection"],
  "type": "law",
  "status": "in_force",
  "binding": true,
  "issuing_body": "Parliament of India",
  "dates": { "passed": "2023-08-11" },
  "sectors": ["all"],
  "approach": "principles",
  "key_obligations": ["Obtain consent before processing personal data", "…"],
  "status_history": [{ "status": "passed", "date": "2023-08-11", "source_url": "https://…" }],
  "sources": [{ "url": "https://…", "title": "…", "publisher": "…", "date": "2023-08-11", "lang": "en" }],
  "provenance": "auto",
  "confidence": 0.85,
  "first_seen": "2026-10-26",
  "last_checked": "2026-10-26"
}
```
This example shows the format only. Verify every value yourself; the dates and status above are not checked.

## Research rules
- Use WebSearch and WebFetch (load them with ToolSearch if they're deferred). Open each source you cite and check that it supports the fields you fill.
- **Check that statuses are current as of 2026-10-26.** Your training data may be out of date. Look for 2025–2026 developments (e.g. bills passed, rules notified, effective dates reached).
- Don't bypass logins, paywalls or CAPTCHAs. If an official site blocks you, use a reputable secondary source and lower `confidence`.
- Funds: use figures exactly as stated, with their unit. Don't convert currencies. Don't sum figures from different sources.
- National records only. Note any important state-level items in your report for Phase 3, but don't create files for them.
- Keep summaries in your own words. Don't copy long passages.
