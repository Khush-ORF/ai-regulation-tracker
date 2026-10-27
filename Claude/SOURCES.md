# Source registry (v2, verified 2026-10-26)

> **The pipeline reads `pipeline/sources.json`**, the machine registry of Layer 1 and 2 sources with their parsers. It was built from this document on 2026-10-27; keep the two in step. Disabled entries there carry a `note` explaining why (IndiaAI news is global news, not announcements; MSIT's titles are filled in by JavaScript). OECD.AI's public API (`api.oecd.ai/policy-initiatives/public?countryIds=<id>`) is a Layer 2 source and the audit baseline.

Verified in T-004. Full evidence (HTTP codes, robots.txt, sample calls) is in `Claude/research/T-004-source-verification.md`. The re-check script is `scripts/check_sources.py`.

Checks ran from an Indian desktop plus US cloud servers, not from a GitHub runner yet. **Re-run `check_sources.py` on a runner in Phase 2 (T-201).**

Methods: `rss`, `api`, `html-diff` (watch a listing page for changes), `pdf` (extract text from linked PDFs).

Verdicts: `ok`, `caveat` (usable with a note), `blocked`, `replaced`.

**Rules:**
- Respect robots.txt (RFC 9309) and any crawl-delay.
- Wait at least 2 seconds between requests to the same host.
- Use the honest bot User-Agent `AIRegTrackerBot/0.1 (+repo URL)`.
- **Never bypass CAPTCHAs, logins or bot filters,** and never spoof a browser User-Agent (ADR-014).
- Never disable TLS verification. If a certificate chain is incomplete, ship the missing intermediate certificate in the repo.

## 1. India
| Source | Access (confirmed) | Method | Verdict | Notes |
|---|---|---|---|---|
| IndiaAI Mission | https://indiaai.gov.in/news | html-diff | ok | Primary for national AI initiatives and news |
| PRS Legislative Research | https://prsindia.org | html-diff | caveat | Crawl-delay 10 s; also use its budget analyses for allocations |
| RBI | RSS feeds (see research file) | rss | caveat | Web pages return HTTP 418; RSS works |
| SEBI | RSS feed | rss | ok | |
| Sansad (Lok Sabha bills) | https://sansad.in/ls/legislation/bills | html-diff | ok | **Added** to replace parliamentary coverage lost with PIB |
| TRAI | trai.gov.in | html-diff | ok | **Added**: telecom/AI recommendations |
| MeitY | — | — | **blocked** | Akamai returns 403 to our bot (India and US); covered by the replacements (ADR-014). `check_sources.py` re-tests it in case it opens up |
| PIB | — | — | **blocked** | Same Akamai 403 on the site and RSS; Google News RSS is disallowed by its robots.txt |
| e-Gazette | — | — | **blocked** | CAPTCHA (our rule) and an incomplete TLS chain |
| Union Budget | — | — | **blocked** | Akamai 403. Allocations come from PRS budget analyses and IndiaAI announcements instead (ADR-014; no manual downloads) |

## 2. Brazil
| Source | Access (confirmed) | Method | Verdict | Notes |
|---|---|---|---|---|
| Câmara open data | `https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=2338&ano=2023` → id 2487262; `/proposicoes/2487262/tramitacoes` | api | ok | No key. Send `Accept: application/json` |
| Senado open data | `https://legis.senado.leg.br/dadosabertos/processo?sigla=PL&numero=2338&ano=2023` → id 8441243 | api | caveat | No key. Use `/processo`; `/materia/*` is deprecated |
| Senado legislation list | `https://legis.senado.leg.br/dadosabertos/legislacao/lista?tipo=LEI&ano=2026` | api | ok | **Replaces DOU** for federal laws |
| ANPD | `https://www.gov.br/anpd/++api++/pt-br/assuntos/noticias/@search?sort_on=effective&sort_order=reverse&b_size=10` | api | ok | JSON |
| MCTI | gov.br/mcti news folder | html-diff | caveat | Folder name changes by period, so follow the redirect each run; gov.br RSS redirects to a login page |
| Diário Oficial da União | — | — | **replaced** | Drops connections from outside Brazil; its XML service (INLABS) needs a login |

## 3. South Africa
| Source | Access (confirmed) | Method | Verdict | Notes |
|---|---|---|---|---|
| gov.za | https://www.gov.za/rss.xml, https://www.gov.za/documents | rss, html-diff | ok | **Replaces DCDT** for policy documents and statements |
| Parliament | https://www.parliament.gov.za | html-diff | ok | |
| PMG | `https://api.pmg.org.za/bill/`, `/gazette/`, `/committee-meeting/`, `/call-for-comment/` | api | caveat | CC BY 3.0 ZA, so credit and link PMG. Recent committee reports are paywalled, so use metadata only. Main site crawl-delay 120 s; the API has none |
| Government Gazette (GPW) | gpwonline.co.za listing | html-diff, pdf | caveat | Its RSS feed is corporate news, not gazettes |
| Information Regulator | inforegulator.org.za/media/ | html-diff | caveat | Its RSS feed is stale (2025-08) |
| DCDT | — | — | **replaced** | "Scheduled maintenance" page and robots.txt returns HTTP 500 (don't crawl). Re-check monthly |

## 4. South Korea
| Source | Access (confirmed) | Method | Verdict | Notes |
|---|---|---|---|---|
| MSIT | https://www.msit.go.kr | html-diff | ok | |
| PIPC | https://www.pipc.go.kr | html-diff | ok | |
| National Assembly Open API | `https://open.assembly.go.kr/portal/openapi/nzmimeepazxkubdpn?Type=json&pIndex=1&pSize=5&AGE=22&BILL_NAME=인공지능` | api | ok | **Replaces likms.** Sample mode needs no key (83 AI bills); a free key is needed for full paging (Q13) |
| National Law Information Center | `https://www.law.go.kr/DRF/lawSearch.do` | api | caveat | Needs the owner's free `OC` ID; the sign-up asks for a server IP, which doesn't suit changing runner IPs (Q13) |
| likms.assembly.go.kr | — | — | **replaced** | robots.txt disallows everyone except Naver |

## 5. China
| Source | Access (confirmed) | Method | Verdict | Notes |
|---|---|---|---|---|
| State Council (gov.cn) | `https://www.gov.cn/zhengce/zuixin/ZUIXINZHENGCE.json` | api | caveat | Chinese root certificate (CFCA); **certificate expires 2026-11-09**, so re-check after that date |
| CAC | `https://www.cac.gov.cn/wxzw/zcfg/A093703index_1.htm` | html-diff | caveat | Plain HTML with dates |
| MIIT | JSON endpoint (full URL in research file) | api | caveat | Uses internal IDs that may change |
| NPC Observer | https://npcobserver.com/feed/ | rss | ok | **Replaces NPC** |
| China Law Translate | https://www.chinalawtranslate.com/en/feed/ | rss | ok | Use the `/en/` feed |
| DigiChina (Stanford) | https://digichina.stanford.edu/work/feed/ | rss | caveat | The main `/feed/` is empty; use `/work/feed/` |
| NPC (npc.gov.cn, flk.npc.gov.cn) | — | — | **replaced** | Firewall 403 from India; TLS fails from the US |

## 5a. Additional working sources found during seeding (2026-10-26; not yet in `check_sources.py`)
| Country | Source | Access | Notes |
|---|---|---|---|
| India | PIB backgrounder PDFs | `static.pib.gov.in` | Downloads worked although `pib.gov.in` pages are blocked. Check robots.txt before crawling |
| Brazil | Central Bank rules API | `https://www.bcb.gov.br/api/conteudo/app/normativos/exibenormativo?p1=<type>&p2=<number>` | JSON |
| Brazil | Câmara API | (as §2) | Decode responses as UTF-8 from the raw bytes |
| Brazil | TSE, CNJ | — | Returned 403 to our fetcher; MCTI pages show a CAPTCHA (not attempted) |
| South Korea | PIPC press board | `pipc.go.kr/...selectBoardList.do?bbsId=BS074&mCode=C020010000&searchCnd=0&searchWrd=<term>` | Works without JavaScript |
| South Korea | KDI EIEC | `eiec.kdi.re.kr` | Republishes ministry press releases |
| South Korea | National Assembly API | (as §4) | Sample mode returns only the first 5 rows, whatever `pIndex` is |
| China | China Law Translate | (as §5) | Returned 403 on every page during seeding; re-check in T-201 |

## 6. Priority states and provinces (Phase 3)
Confirmed by the owner (ADR-012):
- **India:** Karnataka, Tamil Nadu, Telangana, Maharashtra, Kerala, Uttar Pradesh, Gujarat, Odisha, West Bengal, Andhra Pradesh
- **Brazil:** São Paulo, Rio de Janeiro, Minas Gerais, Paraná, Santa Catarina, Rio Grande do Sul, Pernambuco
- **South Africa:** Gauteng, Western Cape, KwaZulu-Natal
- **Korea:** Seoul, Gyeonggi, Gwangju, Busan, Daejeon
- **China:** Beijing, Shanghai, Guangdong, Zhejiang, Jiangsu

State sources are verified in Phase 3. Expect Indian state portals to sit behind the same Akamai setup as MeitY.

## 7. Cross-check sources
| Source | Access | Verdict | Use |
|---|---|---|---|
| OECD.AI Policy Observatory | https://oecd.ai | ok | Cross-check national instruments and initiatives |
