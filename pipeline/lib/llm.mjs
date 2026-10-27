// Provider-agnostic chat client (ADR-006). Default: GitHub Models from inside Actions, which is free
// with the workflow's GITHUB_TOKEN (permissions: models: read). Any OpenAI-compatible endpoint works:
//   LLM_ENDPOINT  default https://models.github.ai/inference/chat/completions
//   LLM_MODEL     default openai/gpt-4.1-mini
//   LLM_TOKEN     default $GITHUB_TOKEN

export class QuotaExhausted extends Error {}

export async function chatJson({ system, user, maxTokens = 1800 }) {
  const endpoint = process.env.LLM_ENDPOINT || 'https://models.github.ai/inference/chat/completions';
  const model = process.env.LLM_MODEL || 'openai/gpt-4.1-mini';
  const token = process.env.LLM_TOKEN || process.env.GITHUB_TOKEN;
  if (!token) throw new Error('No LLM token: set LLM_TOKEN or GITHUB_TOKEN');
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ model, temperature: 0, max_tokens: maxTokens, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: system }, { role: 'user', content: user }] }),
      signal: AbortSignal.timeout(90000),
    });
    if (res.status === 429) {
      const wait = Number(res.headers.get('retry-after') || 30);
      // A long wait means the daily quota is used up: stop for today and pick up tomorrow.
      if (wait > 90) throw new QuotaExhausted(`LLM quota exhausted (retry after ${wait}s)`);
      await new Promise((r) => setTimeout(r, (wait + 1) * 1000));
      continue;
    }
    if (!res.ok) throw new Error(`LLM HTTP ${res.status}: ${(await res.text()).slice(0, 300)}`);
    const body = await res.json();
    const text = body.choices?.[0]?.message?.content ?? '';
    try { return JSON.parse(text); } catch { throw new Error(`LLM returned non-JSON: ${text.slice(0, 200)}`); }
  }
  throw new QuotaExhausted('LLM rate limit: giving up after 3 attempts');
}
