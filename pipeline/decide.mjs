// Auto-merge decision and PR body for a data run (ADR-004, PIPELINE.md "Auto-merge rules").
// Prints "auto" or "review" on the first line; writes pipeline/out/pr-body.md.
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './lib/records.mjs';

const OUT = path.join(ROOT, 'pipeline', 'out');
const run = JSON.parse(fs.readFileSync(path.join(OUT, 'changes.json'), 'utf8'));
const crawl = fs.existsSync(path.join(OUT, 'crawl-report.json')) ? JSON.parse(fs.readFileSync(path.join(OUT, 'crawl-report.json'), 'utf8')) : { sources: [] };
const ORDER = { proposed: 0, in_progress: 1, passed: 2, in_force: 3 };

const reasons = [];
for (const c of run.changes) {
  if (c.confidence < 0.85) reasons.push(`${c.id}: confidence ${c.confidence} is below 0.85`);
  if (c.collection === 'funds') reasons.push(`${c.id}: fund records always need review`);
  if (c.status === 'lapsed' && c.from !== 'lapsed') reasons.push(`${c.id}: becomes lapsed`);
  if (c.from && c.from in ORDER && c.status in ORDER && ORDER[c.status] < ORDER[c.from]) reasons.push(`${c.id}: status moves back from ${c.from} to ${c.status}`);
  if (c.type === 'new' && (c.layer !== 1 || c.evidenceClass !== 'page')) reasons.push(`${c.id}: new record without fetched Layer 1 page evidence`);
}
const decision = run.changes.length && !reasons.length ? 'auto' : 'review';

const row = (c) => `| ${c.type === 'new' ? 'New' : 'Update'} | \`${c.id}\` | ${c.title.replace(/\|/g, '/')} | ${c.from ? `${c.from} → ` : ''}${c.status ?? ''} | ${c.confidence} (${c.evidenceClass}) | [source](${c.url}) |`;
const blocked = crawl.sources.filter((s) => s.status !== 'ok');
const body = `Automated data update for ${run.date} (Claude/PIPELINE.md).

**Decision: ${decision === 'auto' ? 'auto-merge (all rules met)' : 'needs owner review'}**
${reasons.length ? reasons.map((r) => `- ${r}`).join('\n') : ''}

| Change | Record | Title | Status | Confidence (evidence) | Source |
|---|---|---|---|---|---|
${run.changes.map(row).join('\n')}

<details><summary>Evidence quotes</summary>

${run.changes.map((c) => `- \`${c.id}\`: “${c.evidence}” (${c.reason})`).join('\n')}
</details>

Processed ${run.processed} candidates; ${run.remaining} left for the next run.${run.stoppedReason ? ` Stopped early: ${run.stoppedReason}.` : ''}
${run.skipped.length ? `\n<details><summary>${run.skipped.length} candidates skipped</summary>\n\n${run.skipped.map((s) => `- ${s.title}: ${s.error}`).join('\n')}\n</details>\n` : ''}
${blocked.length ? `\nSources not read this run: ${blocked.map((s) => `${s.id} (${s.status})`).join(', ')}.` : ''}

Every record above is marked "Auto-extracted". Check the evidence and source before merging a PR that needs review.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
`;
fs.writeFileSync(path.join(OUT, 'pr-body.md'), body);
console.log(decision);
if (reasons.length) console.log(reasons.join('\n'));
