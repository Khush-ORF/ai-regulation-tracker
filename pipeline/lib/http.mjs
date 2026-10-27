// Polite HTTP for the pipeline (ADR-014, ADR-019): honest User-Agent, robots.txt (RFC 9309) with
// crawl-delay, at least 2 s between requests to one host, size and time limits. A block is reported,
// never worked around.

export const UA = 'AIRegTrackerBot/0.1 (+https://github.com/Khush-ORF/ai-regulation-tracker)';
const UA_TOKEN = 'airegtrackerbot';
const MIN_DELAY_MS = 2000;

export class FetchRefused extends Error {
  constructor(kind, url, detail = '') {
    super(`${kind}: ${url}${detail ? ' (' + detail + ')' : ''}`);
    this.kind = kind; // 'robots' | 'blocked' | 'http' | 'network' | 'too-large'
    this.url = url;
  }
}

const robotsCache = new Map(); // origin -> { rules, delayMs } | 'deny-all'
const nextSlot = new Map(); // host -> earliest time of the next request

function patternToRegex(p) {
  const anchored = p.endsWith('$');
  const body = (anchored ? p.slice(0, -1) : p).replace(/[.+?^{}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp('^' + body + (anchored ? '$' : ''));
}

/** Parse robots.txt and keep the group for our token, else "*". */
export function parseRobots(text) {
  const groups = [];
  let cur = null, lastWasUA = false;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.replace(/#.*/, '').trim();
    if (!line) continue;
    const m = line.match(/^([A-Za-z-]+)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1].toLowerCase(), val = m[2].trim();
    if (key === 'user-agent') {
      if (!cur || !lastWasUA) { cur = { agents: [], rules: [], delay: null }; groups.push(cur); }
      cur.agents.push(val.toLowerCase()); lastWasUA = true; continue;
    }
    lastWasUA = false;
    if (!cur) continue;
    if (key === 'allow' || key === 'disallow') { if (val || key === 'allow') cur.rules.push({ allow: key === 'allow', path: val, re: patternToRegex(val || '/') }); if (!val && key === 'disallow') cur.rules.push({ allow: true, path: '', re: /^/ }); }
    else if (key === 'crawl-delay') { const n = parseFloat(val); if (!isNaN(n)) cur.delay = n; }
  }
  const mine = groups.find((g) => g.agents.some((a) => a !== '*' && UA_TOKEN.includes(a)));
  const star = groups.find((g) => g.agents.includes('*'));
  const g = mine || star || { rules: [], delay: null };
  return { rules: g.rules, delayMs: g.delay ? Math.min(g.delay, 180) * 1000 : 0 };
}

/** Longest matching rule wins; ties go to Allow (RFC 9309 §2.2.2). */
export function robotsAllows(robots, pathAndQuery) {
  let best = null;
  for (const r of robots.rules) {
    if (r.path === '' && !r.allow) continue;
    if (r.re.test(pathAndQuery) && (!best || r.path.length > best.path.length || (r.path.length === best.path.length && r.allow))) best = r;
  }
  return !best || best.allow;
}

async function robotsFor(origin) {
  if (robotsCache.has(origin)) return robotsCache.get(origin);
  let result;
  try {
    const res = await withRetry(() => rawFetch(origin + '/robots.txt', 'text/plain', 30000));
    if (res.status >= 200 && res.status < 300) result = parseRobots(await res.text());
    else if (res.status >= 500) result = 'deny-all'; // RFC 9309: unreachable robots.txt means assume full disallow
    else result = { rules: [], delayMs: 0 }; // 4xx: no robots.txt, crawling allowed
  } catch {
    result = 'deny-all';
  }
  robotsCache.set(origin, result);
  return result;
}

/** One retry after 5 s for network errors and timeouts only (never for HTTP refusals). */
async function withRetry(fn) {
  try { return await fn(); } catch { await new Promise((r) => setTimeout(r, 5000)); return fn(); }
}

function rawFetch(url, accept, timeout) {
  return fetch(url, {
    headers: { 'User-Agent': UA, Accept: accept, 'Accept-Language': 'en,pt;q=0.8,ko;q=0.7,zh;q=0.7' },
    redirect: 'follow',
    signal: AbortSignal.timeout(timeout),
  });
}

async function waitForHost(host, delayMs) {
  const now = Date.now();
  const at = Math.max(now, nextSlot.get(host) || 0);
  nextSlot.set(host, at + Math.max(MIN_DELAY_MS, delayMs));
  if (at > now) await new Promise((r) => setTimeout(r, at - now));
}

function decode(buf, contentType) {
  let charset = (contentType.match(/charset=([\w-]+)/i) || [])[1];
  if (!charset) {
    const head = new TextDecoder('latin1').decode(buf.slice(0, 2048));
    charset = (head.match(/<meta[^>]+charset=["']?([\w-]+)/i) || head.match(/encoding=["']([\w-]+)["']/i) || [])[1];
  }
  try { return new TextDecoder((charset || 'utf-8').toLowerCase()).decode(buf); } catch { return new TextDecoder('utf-8').decode(buf); }
}

const CHALLENGE = /<title>\s*(just a moment|attention required|access denied|captcha)|cf-challenge|g-recaptcha|hcaptcha\.com\/1\/api|verify you are human/i;

/**
 * Fetch a URL politely. Returns { url, status, contentType, text }.
 * Throws FetchRefused for robots disallow, blocks (401/403/429/451 or a challenge page), HTTP errors and network failures.
 */
export async function politeFetch(url, { accept = '*/*', timeout = 45000, maxBytes = 5_000_000 } = {}) {
  const u = new URL(url);
  const robots = await robotsFor(u.origin);
  if (robots === 'deny-all') throw new FetchRefused('robots', url, 'robots.txt unreachable');
  if (!robotsAllows(robots, u.pathname + u.search)) throw new FetchRefused('robots', url, 'disallowed by robots.txt');
  await waitForHost(u.host, robots.delayMs);
  let res;
  try { res = await withRetry(() => rawFetch(url, accept, timeout)); }
  catch (e) { throw new FetchRefused('network', url, e.cause?.code || e.name); }
  if ([401, 403, 429, 451].includes(res.status)) throw new FetchRefused('blocked', url, `HTTP ${res.status}`);
  if (res.status >= 400) throw new FetchRefused('http', url, `HTTP ${res.status}`);
  const len = Number(res.headers.get('content-length') || 0);
  if (len > maxBytes) throw new FetchRefused('too-large', url, `${len} bytes`);
  const buf = new Uint8Array(await res.arrayBuffer());
  if (buf.length > maxBytes) throw new FetchRefused('too-large', url, `${buf.length} bytes`);
  const contentType = res.headers.get('content-type') || '';
  const text = /pdf|octet-stream|zip|image\//i.test(contentType) ? '' : decode(buf, contentType);
  if (/html/i.test(contentType) && text.length < 20000 && CHALLENGE.test(text)) throw new FetchRefused('blocked', url, 'challenge page');
  return { url: res.url, status: res.status, contentType, text };
}

/** Plain text from HTML: drop scripts, styles and tags; collapse whitespace. */
export function htmlToText(html) {
  return decodeEntities(html.replace(/<(script|style|noscript|svg|nav|footer|header)[\s\S]*?<\/\1>/gi, ' ').replace(/<br\s*\/?>|<\/(p|div|li|h\d|tr)>/gi, '\n').replace(/<[^>]+>/g, ' '))
    .replace(/[ \t ]+/g, ' ').replace(/\s*\n\s*/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}

const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…', rsquo: '’', lsquo: '‘', rdquo: '”', ldquo: '“' };
export function decodeEntities(s) {
  return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === '#') { const n = e[1].toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return Number.isFinite(n) ? String.fromCodePoint(n) : m; }
    return NAMED[e.toLowerCase()] ?? m;
  });
}
