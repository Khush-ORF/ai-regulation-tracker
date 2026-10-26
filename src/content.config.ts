// Data schema v1 (T-008). This file is the single source of truth for record shapes:
// every JSON file in data/ is validated against it on each build, so an invalid record fails CI.
// Field meanings are documented in Claude/DATA_SCHEMA.md.
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

export const JURISDICTIONS = ['IN', 'BR', 'ZA', 'KR', 'CN'] as const;
export const STREAMS = [
  'safety', 'data-protection', 'compute', 'skilling', 'public-sector',
  'sector-rules', 'industry', 'research', 'content',
] as const;

// Full or partial ISO dates: 2025, 2025-11 or 2025-11-05.
const isoDate = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, 'Use YYYY, YYYY-MM or YYYY-MM-DD');

const source = z.object({
  url: z.string().url(),
  title: z.string().min(3),
  publisher: z.string().min(2),
  date: isoDate.optional(),
  lang: z.string().min(2).max(5),
});

const common = {
  id: z.string().regex(/^(in|br|za|kr|cn)(-[a-z0-9]+)+$/, 'Use <jurisdiction>-<slug>-<year>, lowercase'),
  jurisdiction: z.enum(JURISDICTIONS),
  title: z.string().min(3),
  title_original: z.string().optional(),
  summary: z.string().min(40).max(900),
  streams: z.array(z.enum(STREAMS)).min(1).max(3),
  sources: z.array(source).min(1),
  provenance: z.enum(['auto', 'reviewed']),
  confidence: z.number().min(0).max(1),
  first_seen: isoDate,
  last_checked: isoDate,
};

export const INSTRUMENT_STATUS = ['proposed', 'in_progress', 'passed', 'in_force', 'voluntary', 'lapsed'] as const;

const instruments = defineCollection({
  loader: glob({ pattern: '*.json', base: './data/instruments' }),
  schema: z.object({
    ...common,
    type: z.enum(['law', 'bill', 'rule', 'guideline', 'framework', 'standard', 'advisory', 'strategy', 'order']),
    status: z.enum(INSTRUMENT_STATUS),
    binding: z.boolean(),
    issuing_body: z.string().min(2),
    dates: z.object({
      announced: isoDate.optional(),
      introduced: isoDate.optional(),
      passed: isoDate.optional(),
      effective: isoDate.optional(),
      lapsed: isoDate.optional(),
    }),
    sectors: z.array(z.string()).min(1),
    approach: z.enum(['risk_based', 'sectoral', 'principles', 'content_specific', 'other']).optional(),
    key_obligations: z.array(z.string()).default([]),
    status_history: z.array(z.object({ status: z.enum(INSTRUMENT_STATUS), date: isoDate, source_url: z.string().url() })).default([]),
  }),
});

const initiatives = defineCollection({
  loader: glob({ pattern: '*.json', base: './data/initiatives' }),
  schema: z.object({
    ...common,
    kind: z.enum(['mission', 'coe', 'compute', 'skilling', 'public_service', 'startup_support', 'data_platform', 'research', 'other']),
    agency: z.string().min(2),
    start: isoDate.optional(),
    end: isoDate.optional(),
    status: z.enum(['announced', 'active', 'completed', 'paused']),
    beneficiaries: z.string().optional(),
    linked_funds: z.array(z.string()).default([]),
  }),
});

const funds = defineCollection({
  loader: glob({ pattern: '*.json', base: './data/funds' }),
  schema: z.object({
    ...common,
    kind: z.enum(['budget_allocation', 'grant', 'subsidy', 'tax_incentive', 'compute_subsidy', 'vc_fund', 'prize', 'other']),
    amount: z.number().positive(),
    currency: z.enum(['INR', 'BRL', 'ZAR', 'KRW', 'CNY', 'USD']),
    stage: z.enum(['announced', 'allocated', 'disbursed']),
    fiscal_year: z.string().min(4),
    period: z.object({ from: isoDate, to: isoDate }).optional(),
    purpose: z.string().min(10),
    parent: z.string().optional(),
  }),
});

export const collections = { instruments, initiatives, funds };
