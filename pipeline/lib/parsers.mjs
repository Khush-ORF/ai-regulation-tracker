// Turn a fetched listing into items { title, url, date, snippet }. Three parsers cover Layer 1:
// rss (RSS 2.0 and Atom), json (any API, mapped by field paths in sources.json) and html-links.
import { decodeEntities, htmlToText } from './http.mjs';

const clean = (s) => decodeEntities(String(s ?? '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
const snip = (s, n = 400) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

/** Normalise many date spellings to YYYY-MM-DD (or '' if unknown). */
export function toIsoDate(s) {
  if (!s) return '';
  s = String(s).trim();
  let m = s.match(/(\d{4})[-./年](\d{1,2})[-./月](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})/); // DD/MM/YYYY (Brazil)
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  const d = new Date(s);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}

function tag(block, name) {
  const m = block.match(new RegExp(`<${name}(?:\\s[^>]*)?>([\\s\\S]*?)</${name}>`, 'i'));
  return m ? m[1] : '';
}

export function parseRss(text) {
  const blocks = text.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) || [];
  return blocks.map((b) => {
    let url = clean(tag(b, 'link'));
    if (!url) { const m = b.match(/<link[^>]+href=["']([^"']+)["']/i); url = m ? m[1] : ''; }
    if (!url) url = clean(tag(b, 'guid'));
    const date = toIsoDate(clean(tag(b, 'pubDate') || tag(b, 'published') || tag(b, 'updated') || tag(b, 'dc:date')));
    return { title: clean(tag(b, 'title')), url: url.trim(), date, snippet: snip(clean(tag(b, 'description') || tag(b, 'summary') || tag(b, 'content:encoded'))) };
  }).filter((i) => i.title && i.url);
}

/** Read "a.b.0.c" from an object. */
export function getPath(obj, path) {
  if (!path) return obj;
  return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
/** A field spec is either a path ("TITLE") or a template with {paths} ("PL {numero}/{ano}"). */
function field(item, spec) {
  if (!spec) return '';
  if (!spec.includes('{')) return getPath(item, spec) ?? '';
  return spec.replace(/\{([^}]+)\}/g, (_, p) => getPath(item, p) ?? '');
}

export function parseJson(text, src) {
  const data = JSON.parse(text);
  let items = getPath(data, src.items || '');
  if (items && !Array.isArray(items)) items = [items];
  if (!Array.isArray(items)) return [];
  const f = src.fields || {};
  return items.map((it) => ({
    title: clean(field(it, f.title)),
    url: String(field(it, f.url) || src.url).trim(),
    date: toIsoDate(field(it, f.date)),
    snippet: snip(clean(field(it, f.snippet))),
  })).filter((i) => i.title);
}

const DATE_NEAR = /(\d{4}[-./]\d{1,2}[-./]\d{1,2}|\d{4}年\d{1,2}月\d{1,2}日|\d{2}\/\d{2}\/\d{4}|\d{1,2} (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{4})/;

/** Links on a listing page. `include` (regex on the absolute URL) keeps only item links. */
export function parseHtmlLinks(html, src, pageUrl) {
  const out = new Map();
  const include = src.include ? new RegExp(src.include, 'i') : null;
  const re = /<a\b[^>]*href=["']([^"'#]+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html))) {
    let url;
    try { url = new URL(decodeEntities(m[1]), pageUrl).href; } catch { continue; }
    if (!/^https?:/.test(url) || (include && !include.test(url))) continue;
    const title = clean(m[2]) || clean((m[0].match(/title=["']([^"']+)["']/i) || [])[1]);
    if (title.length < (src.minTitle ?? 8)) continue;
    const after = htmlToText(html.slice(m.index + m[0].length, m.index + m[0].length + 400));
    const before = htmlToText(html.slice(Math.max(0, m.index - 300), m.index));
    const dm = after.match(DATE_NEAR) || before.match(DATE_NEAR);
    if (!out.has(url)) out.set(url, { title, url, date: dm ? toIsoDate(dm[1]) : '', snippet: '' });
  }
  return [...out.values()];
}

export function parse(kind, text, src, pageUrl) {
  if (kind === 'rss') return parseRss(text);
  if (kind === 'json') return parseJson(text, src);
  if (kind === 'html-links') return parseHtmlLinks(text, src, pageUrl);
  throw new Error(`Unknown parser ${kind}`);
}
