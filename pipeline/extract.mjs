// Extractor (Claude/PIPELINE.md): turn crawl candidates into new or updated records in data/.
// The model proposes; code decides. Every output is validated against src/schema.mjs, and confidence
// is capped by the evidence actually seen, not by what the model claims.
//   node pipeline/extract.mjs [--max 25] [--dry-run] [--mock <responses.json>]
import fs from 'node:fs';
import path from 'node:path';
import { SCHEMAS, STREAMS, INSTRUMENT_STATUS, INSTRUMENT_TYPES, INITIATIVE_KINDS, INITIATIVE_STATUS, FUND_KINDS } from '../src/schema.mjs';
import { politeFetch, htmlToText, FetchRefused } from './lib/http.mjs';
import { chatJson, QuotaExhausted } from './lib/llm.mjs';
import { ROOT, loadRecords, writeRecord, today, normUrl } from './lib/records.mjs';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i < 0 ? dflt : args[i + 1]; };
const MAX = Number(opt('max', 25));
const DRY = args.includes('--dry-run');
const MOCK = opt('mock') ? JSON.parse(fs.readFileSync(opt('mock'), 'utf8')) : null;

const OUT = path.join(ROOT, 'pipeline', 'out');
const STATE = path.join(ROOT, 'pipeline', 'state', 'seen.json');
const candidates = JSON.parse(fs.readFileSync(path.join(OUT, 'candidates.json'), 'utf8'));
const seen = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
let records = loadRecords();

const LANG = { IN: 'en', BR: 'pt', ZA: 'en', KR: 'ko', CN: 'zh' };
const COUNTRY = { IN: 'India', BR: 'Brazil', ZA: 'South Africa', KR: 'South Korea', CN: 'China' };
const ORDER = { proposed: 0, in_progress: 1, passed: 2, in_force: 3 };

const SYSTEM = `You maintain the Global South AI Regulation Tracker: national AI regulation, government AI initiatives and public AI funding in India, Brazil, South Africa, South Korea and China. You receive one candidate item found on an official or reputable source, plus the tracker's existing records for that country. Decide what, if anything, it changes. Reply with one JSON object only.

Decide "action":
- "ignore": not a national government AI instrument, initiative or fund (events, meetings, speeches, awards, studies, international news, other countries, state-level items, bills that only mention AI in passing), or already fully covered by an existing record.
- "update": it changes an existing record (new status, new key date, or an important new official source). Give the existing id.
- "new": a national AI instrument, initiative or fund the tracker doesn't have. A bill counts only if AI is its main subject.

Rules:
- Use only facts stated in the candidate text or page text. Never use outside knowledge to fill fields. Leave out any field you can't support.
- "evidence": copy one short verbatim passage (under 300 characters) from the provided text that supports your decision.
- Dates: YYYY-MM-DD, YYYY-MM or YYYY. Write English; put the original-language title in "title_original" when the source isn't English.
- Summary: 40–120 words, neutral and factual, your own words.
- Statuses for instruments: proposed (announced/drafted), in_progress (consultation or before parliament), passed (enacted, not yet in effect), in_force (binding and in effect), voluntary (non-binding guidance/strategy, published), lapsed (withdrawn/repealed).
- Funds: only with an amount stated in the text, in the base unit of the currency (rupees, reais, rand, won, yuan). Never convert currencies.
- streams: 1–3 of ${STREAMS.join(', ')}.

Shape:
{"action":"ignore|update|new","reason":"one sentence","evidence":"verbatim quote","confidence":0.0-1.0,
 "update":{"id":"existing id","status":"new status if changed","status_date":"date of the change","dates":{"introduced|passed|effective|announced|lapsed":"date"},"add_source":true},
 "collection":"instruments|initiatives|funds",
 "record":{"slug":"short-lowercase-slug","title":"","title_original":"","summary":"","streams":[],
   instruments: "type":"${INSTRUMENT_TYPES.join('|')}","status":"${INSTRUMENT_STATUS.join('|')}","binding":true|false,"issuing_body":"","dates":{},"sectors":["all"],"approach":"risk_based|sectoral|principles|content_specific|other","key_obligations":[],
   initiatives: "kind":"${INITIATIVE_KINDS.join('|')}","agency":"","start":"","status":"${INITIATIVE_STATUS.join('|')}","beneficiaries":"",
   funds: "kind":"${FUND_KINDS.join('|')}","amount":0,"currency":"INR|BRL|ZAR|KRW|CNY|USD","stage":"announced|allocated|disbursed","fiscal_year":"","purpose":""}}
Include "update" only for action update, "collection" and "record" only for action new.`;

function existingIndex(country) {
  const code = { IN: 'IN', BR: 'BR', ZA: 'ZA', KR: 'KR', CN: 'CN' }[country];
  return records.filter((r) => r.data.jurisdiction === code)
    .map((r) => `${r.data.id} | ${r.collection} | ${r.data.status || r.data.stage} | ${r.data.title}${r.data.title_original ? ' / ' + r.data.title_original : ''}`).join('\n');
}

const norm = (s) => String(s || '').toLowerCase().replace(/\s+/g, ' ').replace(/[“”"'’]/g, '').trim();
function evidenceClass(c, pageText, evidence) {
  const e = norm(evidence).slice(0, 120);
  if (e.length < 12) return 'unsupported';
  if (pageText && norm(pageText).includes(e)) return 'page';
  if (norm(`${c.title} ${c.snippet}`).includes(e)) return 'listing';
  return 'unsupported';
}
function capFor(c, cls) {
  const caps = { page: 0.95, listing: 0.8, unsupported: 0.5 };
  return Math.min(caps[cls], c.layer >= 2 ? 0.8 : 1);
}
const slugify = (s) => String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60) || 'item';

function newId(country, slug, date) {
  const base = `${country.toLowerCase()}-${slugify(slug)}`;
  const year = (date || today()).slice(0, 4);
  let id = base.endsWith(year) ? base : `${base}-${year}`, n = 2;
  while (records.some((r) => r.data.id === id)) id = `${base}-${year}-${n++}`;
  return id;
}

function sourceFor(c) {
  return { url: c.url, title: c.title.slice(0, 200), publisher: c.publisher, ...(c.date ? { date: c.date } : {}), lang: c.layer >= 2 ? 'en' : LANG[c.country] };
}

const changes = [];
const skipped = [];
let processed = 0, stoppedReason = '';

for (const c of candidates) {
  if (processed >= MAX) break;
  // Page text: only from hosts we may fetch, and only HTML.
  let pageText = '';
  if (!c.noFetch && !/\.pdf($|\?)/i.test(c.url)) {
    try { const p = await politeFetch(c.url, { accept: 'text/html, */*;q=0.5' }); if (/html/i.test(p.contentType)) pageText = htmlToText(p.text).slice(0, 15000); }
    catch (e) { if (!(e instanceof FetchRefused)) throw e; }
  }
  const user = `Country: ${COUNTRY[c.country]} (${c.country})\nSource: ${c.publisher} (layer ${c.layer})\nCandidate title: ${c.title}\nCandidate URL: ${c.url}\nCandidate date: ${c.date || 'unknown'}\nListing snippet: ${c.snippet || '(none)'}\n${c.trackRecord ? `This is a procedural step of the tracked record ${c.trackRecord}.\n` : ''}\nPage text:\n${pageText || '(not fetched)'}\n\nExisting records for ${COUNTRY[c.country]} (id | collection | status | title):\n${existingIndex(c.country)}`;
  if (DRY) { console.log(SYSTEM + '\n\n---\n' + user.slice(0, 4000)); process.exit(0); }

  let out;
  try { out = MOCK ? (MOCK[c.key] || { action: 'ignore', reason: 'mock default', evidence: c.title, confidence: 0.9 }) : await chatJson({ system: SYSTEM, user }); }
  catch (e) { if (e instanceof QuotaExhausted) { stoppedReason = e.message; break; } skipped.push({ key: c.key, title: c.title, error: e.message.slice(0, 160) }); continue; }
  processed++;
  seen[c.key] = today();

  const cls = evidenceClass(c, pageText, out.evidence);
  const conf = Math.min(Number(out.confidence) || 0, capFor(c, cls));
  const base = { source: c.source, layer: c.layer, url: c.url, evidence: (out.evidence || '').slice(0, 300), evidenceClass: cls, confidence: Math.round(conf * 100) / 100, reason: out.reason || '' };

  if (out.action === 'new' && out.record && SCHEMAS[out.collection]) {
    const r = out.record;
    const date = r.dates?.effective || r.dates?.passed || r.dates?.introduced || r.dates?.announced || r.start || c.date;
    const data = {
      ...r, slug: undefined,
      id: newId(c.country, r.slug || r.title, date), jurisdiction: c.country,
      sources: [sourceFor(c)], provenance: 'auto', confidence: base.confidence, first_seen: today(), last_checked: today(),
    };
    if (!data.title_original) delete data.title_original;
    if (out.collection === 'instruments' && data.status && date) data.status_history = [{ status: data.status, date, source_url: c.url }];
    const parsed = SCHEMAS[out.collection].safeParse(data);
    if (!parsed.success) { skipped.push({ key: c.key, title: c.title, error: 'schema: ' + parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')} ${i.message}`).join('; ') }); continue; }
    writeRecord(out.collection, parsed.data);
    records = loadRecords();
    changes.push({ type: 'new', collection: out.collection, id: parsed.data.id, title: parsed.data.title, status: parsed.data.status || parsed.data.stage, ...base });
  } else if (out.action === 'update' && out.update?.id) {
    const rec = records.find((x) => x.data.id === out.update.id);
    if (!rec) { skipped.push({ key: c.key, title: c.title, error: `update for unknown id ${out.update.id}` }); continue; }
    const d = structuredClone(rec.data);
    const from = d.status;
    const u = out.update;
    if (u.status && u.status !== d.status) {
      d.status = u.status;
      if (rec.collection === 'instruments') d.status_history = [...(d.status_history || []), { status: u.status, date: u.status_date || c.date || today(), source_url: c.url }];
    }
    if (u.dates && rec.collection === 'instruments') d.dates = { ...d.dates, ...Object.fromEntries(Object.entries(u.dates).filter(([, v]) => v)) };
    if (u.add_source !== false && !d.sources.some((s) => normUrl(s.url) === normUrl(c.url))) d.sources.push(sourceFor(c));
    d.last_checked = today();
    d.confidence = Math.min(d.confidence, base.confidence);
    d.provenance = 'auto';
    const parsed = SCHEMAS[rec.collection].safeParse(d);
    if (!parsed.success) { skipped.push({ key: c.key, title: c.title, error: 'schema: ' + parsed.error.issues.slice(0, 3).map((i) => `${i.path.join('.')} ${i.message}`).join('; ') }); continue; }
    writeRecord(rec.collection, parsed.data);
    records = loadRecords();
    changes.push({ type: 'update', collection: rec.collection, id: d.id, title: d.title, from, status: d.status || d.stage, ...base });
  }
}

fs.writeFileSync(STATE, JSON.stringify(seen));
fs.writeFileSync(path.join(OUT, 'changes.json'), JSON.stringify({ date: today(), processed, remaining: Math.max(0, candidates.length - processed), stoppedReason, changes, skipped }, null, 2));
console.log(`processed ${processed}/${candidates.length} candidates: ${changes.filter((x) => x.type === 'new').length} new, ${changes.filter((x) => x.type === 'update').length} updated, ${skipped.length} skipped${stoppedReason ? ' — stopped: ' + stoppedReason : ''}`);
