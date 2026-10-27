// Monthly coverage audit (Claude/PIPELINE.md): find what we're missing and what has gone stale.
// Writes pipeline/out/audit.md (for the GitHub issue) and pipeline/out/audit.json.
//   node pipeline/audit.mjs [--links]
import fs from 'node:fs';
import path from 'node:path';
import { politeFetch, FetchRefused } from './lib/http.mjs';
import { ROOT, loadRecords, bestMatch, today } from './lib/records.mjs';
import { STREAMS } from '../src/schema.mjs';

const checkLinks = process.argv.includes('--links');
const OUT = path.join(ROOT, 'pipeline', 'out');
fs.mkdirSync(OUT, { recursive: true });
const records = loadRecords();
const NOW = today();
const daysAgo = (n) => new Date(Date.now() - n * 864e5).toISOString().slice(0, 10);
const COUNTRIES = { IN: ['India', 79], BR: ['Brazil', 26], ZA: ['South Africa', 162], KR: ['South Korea', 92], CN: ['China', 35] };
const STREAM_LABEL = { safety: 'Safety', 'data-protection': 'Data protection', compute: 'Compute', skilling: 'Skilling', 'public-sector': 'Public sector', 'sector-rules': 'Sector rules', industry: 'Industry', research: 'Research', content: 'Content' };

// 1. OECD.AI comparison: the public API behind oecd.ai's own dashboards.
const oecd = {};
for (const [code, [name, id]] of Object.entries(COUNTRIES)) {
  const items = [];
  try {
    for (let page = 1; page <= 10; page++) {
      const res = await politeFetch(`https://api.oecd.ai/policy-initiatives/public?perPage=100&page=${page}&countryIds=${id}`, { accept: 'application/json' });
      const j = JSON.parse(res.text);
      items.push(...j.data);
      if (page >= j.lastPage) break;
    }
  } catch (e) { oecd[code] = { error: e.message }; continue; }
  const national = items.filter((i) => !/\(Subnational:/i.test(i.englishName));
  const unmatched = [];
  let matched = 0;
  for (const i of national) {
    const m = bestMatch(records, code, { title: i.englishName, titleOriginal: i.originalName, urls: [i.website, ...(i.relevantUrls || []).map((u) => u.url || u)] });
    if (m && m.score >= 0.6) matched++;
    else unmatched.push({ title: i.englishName, type: i.initiativeType?.name || i.category || '', status: i.status || '', start: i.startYear || '', url: `https://oecd.ai/en/dashboards/policy-initiatives/${i.slug}`, closest: m ? `${m.record.data.id} (${Math.round(m.score * 100)}%)` : '' });
  }
  oecd[code] = { total: items.length, national: national.length, subnational: items.length - national.length, matched, unmatched };
}

// 2–3. Status and staleness checks.
const statusFlags = [];
for (const r of records) {
  const d = r.data;
  if (r.collection === 'instruments') {
    if (d.status === 'passed' && d.dates.effective && d.dates.effective <= NOW) statusFlags.push({ id: d.id, issue: `marked passed, but its effective date ${d.dates.effective} has passed. Is it in force?` });
    const lastDate = [...Object.values(d.dates), ...(d.status_history || []).map((h) => h.date)].filter(Boolean).sort().at(-1) || '';
    if (['proposed', 'in_progress'].includes(d.status) && lastDate && lastDate < daysAgo(365)) statusFlags.push({ id: d.id, issue: `${d.status} with no recorded movement since ${lastDate}. Still active?` });
  }
  if (r.collection === 'initiatives' && d.end && d.end <= NOW && d.status === 'active') statusFlags.push({ id: d.id, issue: `active, but its end date ${d.end} has passed` });
}
const stale = records.filter((r) => r.data.last_checked < daysAgo(90)).map((r) => r.data.id);
const lowConfidence = records.filter((r) => r.data.confidence < 0.7).map((r) => ({ id: r.data.id, confidence: r.data.confidence }));

// 4. Source links (optional: slow, one polite request per URL).
const links = { dead: [], blocked: [], unreachable: [], checked: 0 };
if (checkLinks) {
  const urls = [...new Map(records.flatMap((r) => r.data.sources.map((s) => [s.url, r.data.id]))).entries()];
  for (const [u, id] of urls) {
    links.checked++;
    try { await politeFetch(u, { accept: 'text/html, application/pdf, */*', maxBytes: 20_000_000 }); }
    catch (e) {
      if (!(e instanceof FetchRefused) || e.kind === 'too-large') continue;
      const row = { id, url: u, detail: e.message.replace(/^\w+: /, '').slice(0, 120) };
      if (e.kind === 'http' && /HTTP 4(04|10)/.test(e.message)) links.dead.push(row);
      else if (e.kind === 'blocked' || e.kind === 'robots') links.blocked.push(row);
      else links.unreachable.push(row);
    }
  }
}

// 5. Coverage counts.
const counts = Object.fromEntries(Object.keys(COUNTRIES).map((c) => {
  const rs = records.filter((r) => r.data.jurisdiction === c);
  const by = (col) => rs.filter((r) => r.collection === col).length;
  const streams = Object.fromEntries(STREAMS.map((s) => [s, rs.filter((r) => r.data.streams.includes(s)).length]));
  return [c, { instruments: by('instruments'), initiatives: by('initiatives'), funds: by('funds'), streams }];
}));

fs.writeFileSync(path.join(OUT, 'audit.json'), JSON.stringify({ date: NOW, oecd, statusFlags, stale, lowConfidence, links, counts }, null, 2));

const esc = (s) => String(s).replace(/\|/g, '/');
let md = `Monthly coverage audit for ${NOW.slice(0, 7)} (Claude/PIPELINE.md). Generated automatically; work through the lists and tick off what's done.\n\n`;
md += `## 1. OECD.AI items we may be missing\nCompared against OECD.AI's policy database. "Unmatched" means no record of ours has a similar title or the same URL. Some will be out of scope (non-AI, non-government, or covered under a different name). Add the in-scope ones, or note why they're excluded.\n\n`;
md += `| Country | OECD national items | Matched | Unmatched | State-level (Phase 3) |\n|---|---|---|---|---|\n`;
for (const [c, [name]] of Object.entries(COUNTRIES)) { const o = oecd[c]; md += o.error ? `| ${name} | could not read: ${esc(o.error)} | | | |\n` : `| ${name} | ${o.national} | ${o.matched} | ${o.unmatched.length} | ${o.subnational} |\n`; }
for (const [c, [name]] of Object.entries(COUNTRIES)) {
  const o = oecd[c]; if (!o || o.error || !o.unmatched.length) continue;
  md += `\n<details><summary>${name}: ${o.unmatched.length} unmatched</summary>\n\n| OECD item | Type | Status | Start | Closest record |\n|---|---|---|---|---|\n`;
  md += o.unmatched.map((u) => `| - [ ] [${esc(u.title)}](${u.url}) | ${esc(u.type)} | ${esc(u.status)} | ${u.start} | ${esc(u.closest)} |`).join('\n') + '\n</details>\n';
}
md += `\n## 2. Status checks\n${statusFlags.length ? statusFlags.map((f) => `- [ ] \`${f.id}\`: ${f.issue}`).join('\n') : 'Nothing to check.'}\n`;
md += `\n## 3. Records not checked for 90 days\n${stale.length ? stale.map((id) => `\`${id}\``).join(', ') : 'None.'}\n`;
md += `\n## 4. Low-confidence records (below 0.7)\n${lowConfidence.length ? lowConfidence.map((r) => `- [ ] \`${r.id}\` (${r.confidence})`).join('\n') : 'None.'}\n`;
md += `\n## 5. Source links\n`;
md += checkLinks ? `Checked ${links.checked} URLs.\n\n**Dead (404/410), need a replacement source:**\n${links.dead.map((l) => `- [ ] \`${l.id}\`: ${l.url}`).join('\n') || 'None.'}\n\n**Refused our crawler** (not dead; the page may still work in a browser):\n${links.blocked.map((l) => `- \`${l.id}\`: ${l.url} (${esc(l.detail)})`).join('\n') || 'None.'}\n\n**Unreachable this run:** ${links.unreachable.length}\n` : 'Not checked this run (use --links).\n';
md += `\n## 6. Coverage\n| Country | Instruments | Initiatives | Funds | ${STREAMS.map((s) => STREAM_LABEL[s]).join(' | ')} |\n|---|---|---|---|${STREAMS.map(() => '---').join('|')}|\n`;
for (const [c, [name]] of Object.entries(COUNTRIES)) { const k = counts[c]; md += `| ${name} | ${k.instruments} | ${k.initiatives} | ${k.funds} | ${STREAMS.map((s) => (k.streams[s] ? k.streams[s] : '**0**')).join(' | ')} |\n`; }
md += `\nA bold **0** marks a Key Stream with no records for that country: either a real gap in policy, or a gap in our coverage.\n\n🤖 Generated with [Claude Code](https://claude.com/claude-code)\n`;
fs.writeFileSync(path.join(OUT, 'audit.md'), md);
console.log(md.split('\n## 2')[0].split('\n').filter((l) => l.startsWith('| ')).join('\n'));
console.log(`\nstatus flags ${statusFlags.length}, stale ${stale.length}, low confidence ${lowConfidence.length}${checkLinks ? `, dead links ${links.dead.length}, blocked ${links.blocked.length}` : ''}`);
