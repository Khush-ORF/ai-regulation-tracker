// Shared metadata, labels and formatters for pages and the globe.
import { getCollection, type CollectionEntry } from 'astro:content';

export const COUNTRIES = {
  IN: { name: 'India', iso3: 'IND', slug: 'india', units: '36 states and union territories' },
  BR: { name: 'Brazil', iso3: 'BRA', slug: 'brazil', units: '26 states and the Federal District' },
  ZA: { name: 'South Africa', iso3: 'ZAF', slug: 'south-africa', units: '9 provinces' },
  KR: { name: 'South Korea', iso3: 'KOR', slug: 'south-korea', units: '17 provinces and metropolitan cities' },
  CN: { name: 'China', iso3: 'CHN', slug: 'china', units: '31 provinces and regions, plus Hong Kong and Macao' },
} as const;
export type Code = keyof typeof COUNTRIES;
export const CODES = Object.keys(COUNTRIES) as Code[];

export const STATUS_LABEL: Record<string, string> = {
  proposed: 'Proposed', in_progress: 'In progress', passed: 'Passed', in_force: 'In force', voluntary: 'Voluntary', lapsed: 'Lapsed',
  announced: 'Announced', active: 'Active', completed: 'Completed', paused: 'Paused',
  allocated: 'Allocated', disbursed: 'Disbursed',
};
// Strongest-to-weakest order for colouring a jurisdiction by its most advanced instrument.
export const STATUS_RANK = ['in_force', 'passed', 'voluntary', 'in_progress', 'proposed'] as const;

export const STREAM_LABEL: Record<string, string> = {
  safety: 'Safety and accountability', 'data-protection': 'Data protection', compute: 'Compute and infrastructure',
  skilling: 'Skilling and talent', 'public-sector': 'Public-sector AI', 'sector-rules': 'Sector rules',
  industry: 'Startups and industry', research: 'Research and innovation', content: 'Content and deepfakes',
};

export const TYPE_LABEL: Record<string, string> = {
  law: 'Law', bill: 'Bill', rule: 'Rule', guideline: 'Guideline', framework: 'Framework', standard: 'Standard',
  advisory: 'Advisory', strategy: 'Strategy', order: 'Order',
  mission: 'Mission', coe: 'Centre of excellence', compute: 'Compute', skilling: 'Skilling', public_service: 'Public service',
  startup_support: 'Startup support', data_platform: 'Data platform', research: 'Research', other: 'Other',
  budget_allocation: 'Budget allocation', grant: 'Grant', subsidy: 'Subsidy', tax_incentive: 'Tax incentive',
  compute_subsidy: 'Compute subsidy', vc_fund: 'Venture fund', prize: 'Prize',
};

/** Prefix a site-relative path with the deploy base (GitHub Pages serves under /<repo>/). */
export function url(path = ''): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}/${path.replace(/^\//, '')}`;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
/** "2025-11-05" → "5 Nov 2025", "2025-11" → "Nov 2025", "2025" → "2025". */
export function fmtDate(d?: string, short = false): string {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  if (!m) return y;
  if (!day || short) return `${MONTHS[+m - 1]} ${y}`;
  return `${+day} ${MONTHS[+m - 1]} ${y}`;
}

/** Amounts are stored in base units. India uses crore; the others use million or billion. */
export function fmtMoney(amount: number, currency: string): string {
  if (currency === 'INR') {
    const crore = amount / 1e7;
    if (crore >= 100000) return `₹${(crore / 100000).toLocaleString('en-IN', { maximumFractionDigits: 2 })} lakh crore`;
    return `₹${crore.toLocaleString('en-IN', { maximumFractionDigits: 2 })} crore`;
  }
  const sym: Record<string, string> = { BRL: 'R$', ZAR: 'R', KRW: '₩', CNY: '¥', USD: 'US$' };
  const s = sym[currency] ?? currency + ' ';
  if (amount >= 1e12) return `${s}${(amount / 1e12).toLocaleString('en', { maximumFractionDigits: 2 })} trillion`;
  if (amount >= 1e9) return `${s}${(amount / 1e9).toLocaleString('en', { maximumFractionDigits: 2 })} billion`;
  if (amount >= 1e6) return `${s}${(amount / 1e6).toLocaleString('en', { maximumFractionDigits: 1 })} million`;
  return `${s}${amount.toLocaleString('en')}`;
}

export type Instrument = CollectionEntry<'instruments'>['data'];
export type Initiative = CollectionEntry<'initiatives'>['data'];
export type Fund = CollectionEntry<'funds'>['data'];

const TODAY = new Date().toISOString().slice(0, 10);
/** The record's own most recent milestone that has already happened (future effective dates don't count).
    Falls back to the earliest source date only when the record has no dates of its own. */
function latestDate(r: Instrument | Initiative | Fund): string {
  const own: (string | undefined)[] = [];
  if ('dates' in r) own.push(...Object.values(r.dates));
  if ('start' in r) own.push(r.start);
  if ('period' in r && r.period) own.push(r.period.from);
  const past = own.filter((d): d is string => !!d && d <= TODAY).sort();
  if (past.length) return past.at(-1)!;
  return r.sources.map((s) => s.date).filter((d): d is string => !!d).sort()[0] ?? '';
}

/** General data-protection laws apply to AI but aren't AI regulation; leave them out when judging how far AI rules have got. */
export const isAiSpecific = (r: Instrument) => r.streams.some((s) => s !== 'data-protection');

export interface LogItem { id: string; kind: 'instrument' | 'initiative' | 'fund'; title: string; status: string; date: string; issuer: string; source: string; provenance: string; href: string }

export async function loadAll() {
  const [ins, ini, fun] = await Promise.all([getCollection('instruments'), getCollection('initiatives'), getCollection('funds')]);
  const instruments = ins.map((e) => e.data);
  const initiatives = ini.map((e) => e.data);
  const funds = fun.map((e) => e.data);
  return { instruments, initiatives, funds };
}

export async function countrySummaries() {
  const { instruments, initiatives, funds } = await loadAll();
  return CODES.map((code) => {
    const c = COUNTRIES[code];
    const ins = instruments.filter((r) => r.jurisdiction === code);
    const ini = initiatives.filter((r) => r.jurisdiction === code);
    const fun = funds.filter((r) => r.jurisdiction === code);
    const count = (s: string) => ins.filter((r) => r.status === s).length;
    const status = STATUS_RANK.find((s) => ins.some((r) => r.status === s && isAiSpecific(r))) ?? null;
    const topFund = [...fun].sort((a, b) => b.amount - a.amount)[0];
    const href = url(`country/${c.slug}/`);
    const items: LogItem[] = [
      ...ins.map((r) => ({ id: r.id, kind: 'instrument' as const, title: r.title, status: r.status, date: latestDate(r), issuer: r.issuing_body, source: r.sources[0].url, provenance: r.provenance, href: `${href}#${r.id}` })),
      ...ini.map((r) => ({ id: r.id, kind: 'initiative' as const, title: r.title, status: r.status, date: latestDate(r), issuer: r.agency, source: r.sources[0].url, provenance: r.provenance, href: `${href}#${r.id}` })),
    ].sort((a, b) => b.date.localeCompare(a.date));
    return {
      code, ...c, href, status,
      counts: { in_force: count('in_force'), passed: count('passed'), in_progress: count('in_progress'), voluntary: count('voluntary'), proposed: count('proposed'), total: ins.length },
      initiatives: ini.length, funds: fun.length,
      topFund: topFund ? { label: fmtMoney(topFund.amount, topFund.currency), note: `${topFund.title}, ${topFund.period ? fmtDate(topFund.period.from).slice(-4) + '–' + fmtDate(topFund.period.to).slice(-2) : topFund.fiscal_year}` } : null,
      latest: items.slice(0, 4).map((i) => ({ ...i, dateLabel: fmtDate(i.date, true) })),
    };
  });
}
