// Daily crawl (Claude/PIPELINE.md): run every enabled source, keep AI-relevant items that are new,
// and write pipeline/out/candidates.json for the extractor plus a per-source crawl report.
//   node pipeline/crawl.mjs [--only <source-id>] [--since <days>] [--list]
import fs from 'node:fs';
import path from 'node:path';
import { politeFetch, FetchRefused } from './lib/http.mjs';
import { parse } from './lib/parsers.mjs';
import { isAiRelevant } from './lib/keywords.mjs';
import { ROOT, loadRecords, normUrl, bestMatch, keyOf, today } from './lib/records.mjs';

const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(`--${name}`); return i < 0 ? dflt : args[i + 1]; };
const only = opt('only');
const sinceDays = Number(opt('since', 180));
const listMode = args.includes('--list');

const OUT = path.join(ROOT, 'pipeline', 'out');
const STATE = path.join(ROOT, 'pipeline', 'state', 'seen.json');
fs.mkdirSync(OUT, { recursive: true });
fs.mkdirSync(path.dirname(STATE), { recursive: true });

const { sources } = JSON.parse(fs.readFileSync(path.join(ROOT, 'pipeline', 'sources.json'), 'utf8'));
const seen = fs.existsSync(STATE) ? JSON.parse(fs.readFileSync(STATE, 'utf8')) : {};
const records = loadRecords();
const knownUrls = new Set(records.flatMap((r) => r.data.sources.map((s) => normUrl(s.url))));
const cutoff = new Date(Date.now() - sinceDays * 864e5).toISOString().slice(0, 10);

function resolveUrl(src) {
  let u = src.url.replace('{YEAR}', String(new Date().getFullYear()));
  return u.replace(/\{ENV:([A-Z_]+)\}/g, (_, name) => (process.env[name] ? (src.envParam?.[name] ?? '') + encodeURIComponent(process.env[name]) : ''));
}

const report = [];
const candidates = [];
for (const src of sources) {
  if (only && src.id !== only) continue;
  if (src.disabled) continue;
  const row = { id: src.id, country: src.country, layer: src.layer, status: 'ok', items: 0, relevant: 0, new: 0 };
  try {
    const page = await politeFetch(resolveUrl(src), { accept: src.accept || 'application/rss+xml, application/xml, text/html;q=0.9, */*;q=0.5' });
    const items = parse(src.parser, page.text, src, page.url);
    row.items = items.length;
    if (listMode) { console.log(`\n# ${src.id} (${items.length})`); for (const i of items.slice(0, 12)) console.log(`  ${i.date || '----------'}  ${i.title.slice(0, 110)}  ${i.url}`); }
    for (const it of items) {
      const key = keyOf(it);
      // Titles decide relevance; snippets only where a source's titles are too terse (matchSnippet).
      const relevant = src.allRelevant || isAiRelevant(it.title, src.matchSnippet ? it.snippet : '');
      if (!relevant) continue;
      row.relevant++;
      if (seen[key]) continue;
      if (it.date && it.date < cutoff) { seen[key] = today(); continue; }
      // Tracked bills: only steps after the record was last checked are news.
      if (src.trackRecord) { const r = records.find((x) => x.data.id === src.trackRecord); if (r && it.date && it.date <= r.data.last_checked) { seen[key] = today(); continue; } }
      // OECD.AI lists state-level items; those belong to Phase 3.
      if (/\(Subnational:/i.test(it.title)) { seen[key] = today(); continue; }
      if (!src.trackRecord && knownUrls.has(normUrl(it.url))) { seen[key] = today(); continue; }
      // Layer 2 trackers list items we often already hold: skip clear title matches before spending an LLM call.
      if (src.matchExisting) { const m = bestMatch(records, src.country, { title: it.title, urls: [it.url] }); if (m && m.score >= 0.6) { seen[key] = today(); continue; } }
      row.new++;
      candidates.push({ key, source: src.id, country: src.country, layer: src.layer, publisher: src.publisher, noFetch: !!src.noFetch, trackRecord: src.trackRecord, ...it });
    }
  } catch (e) {
    row.status = e instanceof FetchRefused ? e.kind : 'error';
    row.detail = e.message.slice(0, 200);
  }
  report.push(row);
  console.log(`${row.status.padEnd(8)} ${src.id.padEnd(28)} items ${String(row.items).padStart(4)}  relevant ${String(row.relevant).padStart(3)}  new ${String(row.new).padStart(3)}${row.detail ? '  ' + row.detail : ''}`);
}

// Newest first, Layer 1 before Layer 2, so the extractor's daily cap spends calls on the freshest primary evidence.
candidates.sort((a, b) => a.layer - b.layer || (b.date || '').localeCompare(a.date || ''));
fs.writeFileSync(path.join(OUT, 'candidates.json'), JSON.stringify(candidates, null, 2));
fs.writeFileSync(path.join(OUT, 'crawl-report.json'), JSON.stringify({ date: today(), sources: report }, null, 2));
fs.writeFileSync(STATE, JSON.stringify(seen));
console.log(`\n${candidates.length} new candidates from ${report.filter((r) => r.status === 'ok').length}/${report.length} sources`);
