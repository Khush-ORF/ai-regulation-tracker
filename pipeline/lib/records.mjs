// Reading data/ and matching outside items (candidates, OECD.AI entries) against our records.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const DATA = path.join(ROOT, 'data');
export const COLLECTIONS = ['instruments', 'initiatives', 'funds'];
export const today = () => new Date().toISOString().slice(0, 10);

export function loadRecords() {
  const out = [];
  for (const c of COLLECTIONS) {
    const dir = path.join(DATA, c);
    if (!fs.existsSync(dir)) continue;
    for (const f of fs.readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      out.push({ collection: c, file: path.join(dir, f), data: JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) });
    }
  }
  return out;
}

export function writeRecord(collection, data) {
  const file = path.join(DATA, collection, `${data.id}.json`);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n');
  return file;
}

/** Comparable form of a URL: no scheme, no www, no trailing slash, no tracking params. */
export function normUrl(u) {
  try {
    const x = new URL(u);
    for (const k of [...x.searchParams.keys()]) if (/^utm_|^fbclid$|^gclid$/.test(k)) x.searchParams.delete(k);
    return (x.host.replace(/^www\./, '') + x.pathname.replace(/\/+$/, '') + (x.search || '')).toLowerCase();
  } catch { return String(u).toLowerCase(); }
}

const STOP = new Set(['the', 'of', 'and', 'for', 'on', 'in', 'to', 'a', 'an', 'by', 'with', 'act', 'national', 'policy', 'india', 'brazil', 'china', 'korea', 'south', 'africa', 'african', 'brazilian', 'chinese', 'korean', 'indian', 'republic', 'de', 'da', 'do', 'e', 'para']);
export function titleTokens(s) {
  return new Set(String(s).toLowerCase().replace(/indiaai/g, 'india ai').normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?subnational.*?\)/g, ' ').replace(/[^\p{L}\p{N}]+/gu, ' ').split(' ')
    .filter((w) => w && !STOP.has(w) && !/^\d{4}$/.test(w) && (w.length > 1 || /[㐀-鿿가-힯]/.test(w))));
}
export function similarity(a, b) {
  const A = titleTokens(a), B = titleTokens(b);
  if (!A.size || !B.size) return 0;
  let n = 0; for (const t of A) if (B.has(t)) n++;
  return n / Math.min(A.size, B.size);
}

/** Best match for an outside item among records of one jurisdiction: by any URL, else by title similarity. */
export function bestMatch(records, jurisdiction, { title, titleOriginal, urls = [] }) {
  const pool = records.filter((r) => r.data.jurisdiction === jurisdiction);
  const want = new Set(urls.filter(Boolean).map(normUrl));
  for (const r of pool) if (r.data.sources.some((s) => want.has(normUrl(s.url)))) return { record: r, score: 1, by: 'url' };
  let best = null;
  for (const r of pool) {
    const score = Math.max(similarity(title, r.data.title), titleOriginal && r.data.title_original ? similarity(titleOriginal, r.data.title_original) : 0);
    if (!best || score > best.score) best = { record: r, score, by: 'title' };
  }
  return best;
}

export const keyOf = (item) => crypto.createHash('sha1').update(`${normUrl(item.url)}|${item.date || ''}|${item.title}`).digest('hex').slice(0, 16);
