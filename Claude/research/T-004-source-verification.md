# T-004: Source verification

- **Date:** 2026-10-26
- **Agent:** claude-opus (sub-agent run)
- **Scope:** every source in `SOURCES.md` (29 rows, including OECD.AI), plus the alternatives proposed below.
- **Re-check script:** `scripts/check_sources.py` (stdlib only). It was run once from this machine (output summarised below). Run it from a GitHub runner via `workflow_dispatch` to repeat the check.

## How this was tested, and what it does not prove

1. **Local machine.** Windows 11, PowerShell 5.1, Python 3.14 `urllib` and `curl.exe`, on an **Indian ISP connection**. Every request sent `User-Agent: AIRegTrackerBot/0.1 (+https://github.com/<owner>/ai-regulation-tracker)`. Each URL was fetched once, with at least 2 s between requests to the same host.
2. **A US cloud data point.** The WebFetch tool runs on US cloud infrastructure with its own honest agent UA. I used it for the sites that failed locally or that are known to geo-filter. It approximates, but **is not**, a GitHub Actions runner.
3. **Limits.** I did not spoof a browser User-Agent, solve any CAPTCHA, or log in anywhere. A test that would have compared a browser UA with the bot UA was refused by the permission system as bot-check circumvention, and I did not pursue it. So for the Akamai 403s below I **cannot tell whether the block is on the UA string or on the client fingerprint**. Either way, the honest bot is blocked.
4. **robots.txt handling.** This follows RFC 9309. A 4xx on robots.txt means "no rules" (crawler may fetch). A 5xx or a network error means "assume disallow all". Note that Python's `urllib.robotparser.read()` treats 401/403 as disallow-all, so the script fetches robots.txt itself and applies the RFC rule. A 403 on robots.txt is flagged, because in practice it means a WAF is refusing us.
5. **TLS.** Python on Windows first failed on `egazette.gov.in`, `www.dcdt.gov.za` and `www.gov.cn`. After `curl.exe` (Schannel, which fetches missing intermediates and roots on demand) had visited them, Python succeeded, because Windows had cached the certificates. A Linux runner has no such cache:
   - `egazette.gov.in` and `www.dcdt.gov.za` send **only the leaf certificate**, with no intermediate. OpenSSL on Linux will fail with `unable to get local issuer certificate`.
   - `www.gov.cn` sends a full chain to **CFCA EV ROOT**. It works on Linux only if that root is in the runner's CA bundle. The `*.www.gov.cn` leaf also **expires 2026-11-09**.

## 1. India

| Source | URL tested | HTTP | robots.txt | Best access method + exact endpoint | Key needed | Verdict | Notes |
|---|---|---|---|---|---|---|---|
| MeitY | https://www.meity.gov.in/ | **403** (Akamai "Access Denied") | robots.txt itself 403 | None reachable | – | **blocked** | 403 from the Indian IP **and** from the US cloud fetcher. Same Akamai edge as PIB, India Budget, India Code and data.gov.in. Replacement: IndiaAI (an IBD under MeitY, posts MeitY AI documents), TRAI, OECD.AI cross-check. |
| IndiaAI Mission | https://indiaai.gov.in/news | 200 | 404 (no rules) | html-diff: `https://indiaai.gov.in/news`; discovery: `https://indiaai.gov.in/sitemap.xml` (200, XML) | No | ok | Nuxt SSR pages, so content is in the HTML. Pages are large (>512 KB). Diff an extracted item list, not raw HTML. |
| PIB | https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3 | **403** (Akamai) | 403 | None reachable. `pib.gov.in` 301-redirects to `www.pib.gov.in`, which returns 403 for the homepage, robots.txt and the RSS. | – | **blocked** | 403 from IN and US. `archive.pib.gov.in` returns 200 but only a tiny JS shell (not current releases). Google News RSS for `site:pib.gov.in` is **disallowed by news.google.com robots.txt**, so not an option. Replacements: ministry and regulator feeds that work (RBI, SEBI), IndiaAI, Sansad, TRAI. Owner could ask PIB/NIC to allow-list the bot UA. |
| e-Gazette | https://egazette.gov.in/ | 200 → 302 to a cookieless-session URL `/(S(...))/default.aspx` | 404 (no rules) | **Do not scrape** (search is CAPTCHA-gated, per SOURCES.md) | – | **blocked** (by policy) | The server sends a leaf-only TLS chain, so Linux clients will fail TLS. Rely on regulator notices instead. |
| PRS Legislative Research | https://prsindia.org/billtrack | 200 | 200, **Crawl-delay: 10** | html-diff: `https://prsindia.org/billtrack` | No | ok-with-caveat | No RSS found (`/rss.xml` and `/billtrack/rss` both 404). Honour the 10 s crawl-delay. |
| RBI | https://www.rbi.org.in/ | **418** "Unauthorised Access" on HTML pages | robots.txt 418 (4xx, so no rules) | rss: `https://www.rbi.org.in/pressreleases_rss.xml`, `https://www.rbi.org.in/notifications_rss.xml` (both 200, `text/xml`, 10 items) | No | ok-with-caveat | The WAF blocks HTML pages for our UA, but the RSS files are served. Linked detail pages may also 418, so store the feed item text. |
| SEBI | https://www.sebi.gov.in/sebirss.xml | 200 | 200, allowed | rss: `https://www.sebi.gov.in/sebirss.xml` (30 items) | No | ok | |
| Union Budget | https://www.indiabudget.gov.in/ | **403** (Akamai) | 403 | None reachable | – | **blocked** | Annual source. Replacement: the owner captures the budget PDFs by hand once a year (around 1 Feb). Open Budgets India (`openbudgetsindia.org`) returned HTTP 520 (origin down). `api.data.gov.in` needs a free key, and `www.data.gov.in` is also Akamai 403. |
| *Alt:* Sansad (Lok Sabha) | https://sansad.in/ls/legislation/bills | 200 | 404 (no rules) | html-diff: `https://sansad.in/ls/legislation/bills` | No | ok (alternative) | Next.js SSR. Covers parliamentary bills, a partial substitute for PIB/MeitY announcements. |
| *Alt:* TRAI | https://www.trai.gov.in/ | 200 | 200, allowed | html-diff on the homepage / consultation listings | No | ok (alternative) | TRAI issues AI-related recommendations. Not yet in SOURCES.md. |

## 2. Brazil

| Source | URL tested | HTTP | robots.txt | Best access method + exact endpoint | Key needed | Verdict | Notes |
|---|---|---|---|---|---|---|---|
| Câmara open data | https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=2338&ano=2023 | 200 | `/robots.txt` returns the HTML portal (no rules) | api: the search above returns id **2487262**. Track `https://dadosabertos.camara.leg.br/api/v2/proposicoes/2487262/tramitacoes` (200 JSON, ~400 KB, latest entry 2026-09-02). | **No** | ok | **Send `Accept: application/json`**, or it returns XML. Confirmed sample call works. |
| Senado open data | https://legis.senado.leg.br/dadosabertos/processo?sigla=PL&numero=2338&ano=2023 | 200 JSON | robots.txt **403** (nginx "administrative rules"), so no rules apply under RFC 9309 | api: `/dadosabertos/processo?sigla=PL&numero=2338&ano=2023` returns `id` 8441243 (codigoMateria 157233). Detail: `https://legis.senado.leg.br/dadosabertos/processo/8441243` (200 JSON, ~450 KB). | **No** | ok-with-caveat | The old `/materia/pesquisa/lista` still answers but declares itself deprecated (2025-03-18, full shutdown dated 2026-02-01), with `/processo` as the replacement. Use `/processo` only. robots.txt 403 is odd, so re-check from the runner. |
| Diário Oficial da União | https://www.in.gov.br/ and /leiturajornal | **Connection dropped** (RemoteDisconnected / Schannel "server closed abruptly") | Unreachable, so assume disallow | None reachable from IN or US | – | **blocked** | Azion edge closes the connection both from India and from the US fetcher ("socket hang up"). This looks like a geo or bot block for non-Brazilian clients. INLABS (the DOU XML service) needs an account login, so it is excluded by our rules. **Replacement:** Senado federal-legislation API `https://legis.senado.leg.br/dadosabertos/legislacao/lista?tipo=LEI&ano=2026` (200 XML, 113 KB, lists laws with numbers and dates; `tipo=DEC` etc. for decrees). Add the ANPD and MCTI feeds for regulator-level acts. |
| MCTI | https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/noticias | 200 (redirects to `/noticias/noticias-julho-outubro-2026`) | gov.br robots: allowed | html-diff: `https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/noticias` (follow redirect) | No | ok-with-caveat | The news folder **rotates by period**, so follow the redirect each run. Folder `/RSS` returns 404. The Plone REST API (`@search`) returns **401 "Missing plone.restapi permission"**. gov.br's portal-wide `/pt-br/noticias/*/RSS` feeds redirect to a **login page**, so do not use them. |
| ANPD | https://www.gov.br/anpd/++api++/pt-br/assuntos/noticias/@search?sort_on=effective&sort_order=reverse&b_size=10&metadata_fields=effective | 200 JSON | gov.br robots: allowed | api (Plone 6/Volto REST): the URL above returns `items_total` 792 and the latest items (2026-10-20, 10-19, 10-16, including an AI-sandbox report) | No | ok | Send `Accept: application/json`. The "captcha" hits on ANPD HTML are an invisible hCaptcha on forms only, not a gate. |

## 3. South Africa

| Source | URL tested | HTTP | robots.txt | Best access method + exact endpoint | Key needed | Verdict | Notes |
|---|---|---|---|---|---|---|---|
| DCDT | https://www.dcdt.gov.za/ | 200 but a **"scheduled maintenance" placeholder** (4.4 KB) | robots.txt **500**, so disallow all | None | – | **blocked** | Also sends a leaf-only TLS chain (Sectigo OV R36 intermediate missing). **Replacement:** `https://www.gov.za/rss.xml` (200 RSS, latest 2026-10-23, carries Acts, Bills and gazetted notices for all departments) and html-diff on `https://www.gov.za/documents`. gov.za robots.txt allows both. Re-check DCDT later. |
| Government Gazette (GPW) | https://www.gpwonline.co.za/feed/ | 200 | 404 (no rules) | rss `https://www.gpwonline.co.za/feed/` is **GPW corporate news only** (latest 2026-02-25), not gazettes | No | ok-with-caveat | The site is now WordPress. No machine-readable gazette index was confirmed (the `shp_attachment-sitemap*.xml` files are empty or unclear). Use gov.za RSS and the PMG gazette API for discovery, and fetch GPW PDFs only when linked. The old `/Gazettes/Pages/...aspx` URL returns 404. |
| Parliament | https://www.parliament.gov.za/bills | 200 | 404 (no rules) | html-diff: `https://www.parliament.gov.za/bills` | No | ok | `/press-releases` returns 404, so the bills page is the confirmed listing. |
| PMG | https://api.pmg.org.za/bill/?per_page=5 | 200 JSON | pmg.org.za: **Crawl-delay: 120**, plus Cloudflare `Content-Signal: search=yes, ai-train=no, use=reference`. api.pmg.org.za: no crawl-delay. | api: `https://api.pmg.org.za/bill/` (count 1280), `https://api.pmg.org.za/gazette/`, `/committee-meeting/`, `/call-for-comment/`, `/policy-document/` (index at `https://api.pmg.org.za/`) | No | ok-with-caveat | **Terms:** content is CC BY 3.0 ZA, so credit "Parliamentary Monitoring Group" and link pmg.org.za. Premium committee reports **from 2025 onward appear to stay subscription-only**; use only the free metadata and never try to reach premium content. Do not use PMG content for AI training. Use the API, not the HTML site (120 s crawl-delay). |
| Information Regulator | https://inforegulator.org.za/feed/ | 200 RSS | 200, allowed | html-diff `https://inforegulator.org.za/media/` (primary); also `https://inforegulator.org.za/enforcement-notices/`; rss `/feed/` as secondary | No | ok-with-caveat | The feed is **stale** (newest item 2025-08-19), because most statements are posted as PDFs on `/media/`. |

## 4. South Korea

| Source | URL tested | HTTP | robots.txt | Best access method + exact endpoint | Key needed | Verdict | Notes |
|---|---|---|---|---|---|---|---|
| National Law Information Center Open API | https://www.law.go.kr/DRF/lawSearch.do?target=law&type=XML&query=인공지능 | 200 XML **error**: "required input missing" (no `OC`) | law.go.kr: `Allow: /` + sitemap `https://law.go.kr/LSW/sitemap.xml` | api: `https://www.law.go.kr/DRF/lawSearch.do?OC=<id>&target=law&type=XML&query=...` (also `lawService.do` for full text) | **Yes, `OC`** (free; the registered e-mail ID from open.law.go.kr) | ok-with-caveat | The endpoint is up and answers with the expected "missing parameter" error, so a keyed call could not be confirmed without the owner's OC. The **application form asks for a server IP (at least 1)**, and GitHub runner IPs are dynamic. A July 2026 Q&A on lawmaking.go.kr says calls are now checked by ID, not IP, but this is unconfirmed. Owner must register and test from a runner. `open.law.go.kr/` redirects to `/LSO/index.html`. |
| MSIT | https://www.msit.go.kr/bbs/list.do?sCode=user&mPid=208&mId=307 | 200 (184 KB, 24 dated rows) | 200, `Allow: /` | html-diff on the press releases (보도자료) board above; also 보도설명 `mId=309` | No | ok | The homepage is a JS redirect to `/index.do`, so always use the board URL. No RSS found. |
| National Assembly bill info (likms) | https://likms.assembly.go.kr/bill/main.do | not fetched | **`User-agent: * Disallow: /`** (only Naver's Yeti is allowed `/bill/`) | – | – | **replace** | **Replacement:** National Assembly Open API, `https://open.assembly.go.kr/portal/openapi/nzmimeepazxkubdpn?Type=json&pIndex=1&pSize=5&AGE=22&BILL_NAME=인공지능` returned 200 JSON with `list_total_count` 83 AI-titled bills (latest 2026-10-21). It works **without a key in sample mode**. Register a free `KEY` for full paging. robots.txt allows it. Note the API returns `Content-Type: text/html` even for JSON. Its DETAIL_LINK values point back to likms, so store them but do not crawl them. |
| PIPC | https://www.pipc.go.kr/np/cop/bbs/selectBoardList.do?bbsId=BS074&mCode=C020010000 | 200 (redirects www → `pipc.go.kr`) | `/robots.txt` → `/np/robots.txt`, which only restricts Googlebot, so we are allowed | html-diff on the 보도자료 board `bbsId=BS074`; 공지사항 board `bbsId=BS061&mCode=C010010000` | No | ok | |

## 5. China

| Source | URL tested | HTTP | robots.txt | Best access method + exact endpoint | Key needed | Verdict | Notes |
|---|---|---|---|---|---|---|---|
| CAC | https://www.cac.gov.cn/wxzw/zcfg/A093703index_1.htm | 200 (17.5 KB, server-rendered list with dates) | 200, disallows only `/zfz/`, `/wxb_zfz/`, `/wxzf/`, video | html-diff on page 1 of 政策法规 (above). Later pages load by `POST /cms/JsonList`; do not page. | No | ok-with-caveat | Reachable locally and from the US fetcher. Python's first attempt timed out at 20 s, while curl took about 5 s. Use a ≥30 s timeout. **Runner re-check needed.** |
| NPC | http://www.npc.gov.cn/ and https://flk.npc.gov.cn/ | **403** WAF (`WZWS-RAY`, `reason:UrlACL`) on HTTP; **TLS handshake failure** on HTTPS | robots.txt also 403 | None reachable | – | **blocked** | Blocked from the Indian IP **and** the US fetcher (TLS alert). **Replacements:** NPC Observer `https://npcobserver.com/feed/` (200 RSS, 10 items, latest 2026-10-26, covers NPCSC sessions and drafts), China Law Translate (below), and the gov.cn JSON (laws and State Council docs). |
| State Council (gov.cn) | https://www.gov.cn/zhengce/zuixin/ZUIXINZHENGCE.json | 200 JSON (266 KB; TITLE/URL/DOCRELPUBTIME; latest 2026-10-23, an AI-and-employment opinion) | 200, disallows only `/2016*` legacy paths and a few others | api: `https://www.gov.cn/zhengce/zuixin/ZUIXINZHENGCE.json` (it feeds the "最新政策" page, which is JS-rendered) | No | ok-with-caveat | TLS chain to CFCA EV ROOT; leaf **expires 2026-11-09**. The `/zhengce/zhengceku/` root returns 403, and the `bmwj/` department-docs page has a stale static list (Feb 2026), so do not use it. Reachable from the US fetcher. |
| MIIT | https://www.miit.gov.cn/ | 200 (homepage); listing pages are JS shells | 404 (no rules) | api (the CMS JSON the page itself loads), for the 通知 column: `https://www.miit.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit?parseType=buildstatic&webId=8d828e408d90447786ddbe128d495e9e&tplSetId=209741b2109044b5b7695700b2bec37e&pageType=column&tagId=右侧内容&editType=null&pageId=3e3ad1a3bec74939890a0d3e54815141` (200 JSON with HTML fragment, latest 2026-10-23) | No | ok-with-caveat | The IDs are internal CMS IDs taken from `/zwgk/zcwj/wjfb/tz/index.html` and may change, so re-derive them if they break. Sister columns: `/zwgk/zcwj/wjfb/{gg,tg,yj,jd,...}/index.html`. **Intermittent timeouts** locally (3 of 4 requests in one burst timed out). Use a long timeout and a single daily request. |
| DigiChina (Stanford) | https://digichina.stanford.edu/work/feed/ | 200 RSS (10 items) | `Disallow:` (empty), so everything is allowed | rss: `https://digichina.stanford.edu/work/feed/` | No | ok-with-caveat | **The main `/feed/` is empty** because articles are the custom post type `work`, which is not in the REST API or the sitemaps. Use the `/work/feed/` URL. |
| China Law Translate | https://www.chinalawtranslate.com/en/feed/ | 200 RSS (10 items, latest 2026-10-26) | 200; disallows `/wp-admin/` and one page only | rss: `https://www.chinalawtranslate.com/en/feed/` (English); `/feed/` returns the same items with Chinese titles | No | ok | The hCaptcha hits are on comment forms only. |

## 6. Cross-check

| Source | URL tested | HTTP | robots.txt | Best access method + exact endpoint | Key needed | Verdict | Notes |
|---|---|---|---|---|---|---|---|
| OECD.AI | https://oecd.ai/en/ | 200 | 200, allowed | html-diff on the country dashboards, e.g. `https://oecd.ai/en/dashboards/national/India` (old `/countries/` path redirects there) | No | ok | Cross-check only. |

## Verdict count (29 SOURCES.md rows)

| Verdict | Count | Sources |
|---|---|---|
| ok | 9 | IndiaAI, SEBI, Câmara, ANPD, Parliament (ZA), MSIT, PIPC, China Law Translate, OECD.AI |
| ok-with-caveat | 12 | PRS, RBI, Senado, MCTI, GPW, PMG, Information Regulator, open.law.go.kr, CAC, gov.cn, MIIT, DigiChina |
| blocked | 7 | MeitY, PIB, e-Gazette (by policy), Union Budget, DOU, DCDT, NPC |
| replace | 1 | likms.assembly.go.kr |
| **Total** | **29** | |

## Risks and replacements

1. **India is the weakest country.** Four of eight sources sit behind the same NIC Akamai edge, which returns 403 to our honest bot UA from both India and the US: MeitY, PIB, India Budget, and also India Code and data.gov.in. RBI's WAF returns 418 on HTML (RSS still works).
   - Working India set today: IndiaAI news, PRS bill track, RBI RSS ×2, SEBI RSS, plus the new alternatives Sansad bills and TRAI.
   - Options for the owner (logged in OPEN_QUESTIONS is suggested, not done): (a) ask NIC/PIB webmasters to allow-list `AIRegTrackerBot`; (b) accept manual weekly capture of MeitY/PIB AI notices; (c) rely on OECD.AI and the English press for cross-checks.
   - I did **not** test whether a UA without the word "Bot" is accepted. That is the owner's call, since it would be done to get past a bot filter.
2. **Brazil DOU is unreachable from abroad.** Use the Senado `legislacao/lista` API for federal laws and decrees, the Câmara/Senado APIs for bills, and ANPD REST plus MCTI html-diff for regulator acts. INLABS would need a login, so it is out of scope under our rules.
3. **South Africa DCDT is down for maintenance** (robots.txt 500). Use `https://www.gov.za/rss.xml` and `https://www.gov.za/documents` as the replacement, and re-check DCDT monthly. PMG terms are fine for metadata with CC BY attribution. Avoid premium content and AI-training use.
4. **Korea:**
   - likms forbids crawling, so the Assembly Open API replaces it (free key recommended).
   - open.law.go.kr needs the owner's free `OC` ID, and possibly a registered server IP, which is hard on GitHub-hosted runners. Fallback if IP-locked: html-diff on law.go.kr pages listed in its sitemap (robots.txt allows `/`).
5. **China:**
   - NPC blocks us outright (WAF plus TLS handshake failure from the US). Replace it with NPC Observer RSS and China Law Translate, using gov.cn JSON for promulgated texts.
   - CAC, gov.cn and MIIT worked from here and from the US fetcher, but are slow or flaky. They are the most likely to differ on GitHub's Azure IPs.
   - DigiChina's advertised `/feed/` is empty. Use `/work/feed/`.
6. **TLS on Linux:**
   - `egazette.gov.in` and `www.dcdt.gov.za` send incomplete chains, and `www.gov.cn` depends on CFCA EV ROOT. If the runner fails, the fix is to **ship the missing intermediate PEM in the repo** and pass it via `ssl.create_default_context(cafile=...)`. That keeps verification on and is not a bypass. Never set `verify=False`.
   - gov.cn's certificate expires 2026-11-09, so expect a renewal blip.
7. **Brittle endpoints to watch:**
   - MCTI's rotating news folder.
   - MIIT's CMS IDs.
   - Senado's deprecation cycle (old `/materia/*` endpoints are past their shutdown date but still answering).
   - Câmara/Senado need `Accept: application/json`.
8. **Not edited:** SOURCES.md was left unchanged, as instructed. The replacements above should be merged into it by whoever owns that file, with a DECISIONS.md entry.

## Runner re-check needed

Run `python3 scripts/check_sources.py --json results.json` once from a GitHub-hosted Ubuntu runner (`workflow_dispatch`, no schedule). Pay particular attention to:

- **India (Akamai/NIC):** `www.meity.gov.in`, `www.pib.gov.in` (incl. RSS), `www.indiabudget.gov.in`. Confirm the 403s also hold from Azure US IPs.
- **India (other):** `www.rbi.org.in` RSS (WAF 418 on HTML; check RSS still served to Azure IPs), `egazette.gov.in` (TLS chain on OpenSSL; monitor only), `indiaai.gov.in`, `prsindia.org`.
- **China:** `www.cac.gov.cn`, `www.gov.cn` (JSON, plus CFCA root on Ubuntu), `www.miit.gov.cn` (timeouts), `www.npc.gov.cn` / `flk.npc.gov.cn` (expected blocked).
- **Brazil:** `www.in.gov.br` (expected blocked from US), `legis.senado.leg.br` (robots.txt 403; API worked here).
- **South Africa:** `www.dcdt.gov.za` (maintenance; TLS chain).
- **Korea:** `www.law.go.kr/DRF` with the owner's `OC` secret, to see whether runner IPs are accepted. The script currently calls it without a key, so add the keyed call to a private check once the secret exists. Also `open.assembly.go.kr` with a `KEY`.
