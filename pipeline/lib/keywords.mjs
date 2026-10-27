// AI relevance filter for candidate titles and snippets, in the tracker's four working languages.
// Deliberately conservative: words like "smart" (智能) or "digital" alone are not enough.
const TERMS = [
  // English
  /\bartificial[ -]intelligence\b/i, /\bA\.?I\.?(?=[\s,.;:)\-–—/']|$)/, /\bmachine[ -]learning\b/i, /\bdeep ?fakes?\b/i,
  /\bgenerative\b/i, /\balgorithm(s|ic)?\b/i, /\blarge language models?\b/i, /\bLLMs?\b/, /\bIndiaAI\b/i, /\bchatbots?\b/i,
  /\bautomated decision/i, /\bfoundation models?\b/i, /\bsynthetic(ally)?[ -](generated|content|media)\b/i, /\bneural network/i,
  // Portuguese
  /intelig[êe]ncia artificial/i, /\bIA\b/, /aprendizado de m[áa]quina/i, /\balgoritm/i, /conte[úu]do sint[ée]tico/i, /\bdeepfakes?\b/i,
  // Korean
  /인공지능/, /딥페이크/, /알고리즘/, /생성형/, /초거대/, /AI기본법/,
  // Chinese
  /人工智能/, /算法/, /深度合成/, /生成式/, /大模型/, /智能体/, /算力/, /合成内容/, /人工智能生成/,
];

export function isAiRelevant(...texts) {
  const s = texts.filter(Boolean).join(' \n ');
  return TERMS.some((re) => re.test(s));
}
