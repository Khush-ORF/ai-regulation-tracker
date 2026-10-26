#!/usr/bin/env python3
"""Source reachability check for the AI Regulation Tracker (task T-004).

Standard library only. Fetches every URL in SOURCES once, checks robots.txt
with urllib.robotparser, waits 2 seconds between requests to the same host,
and prints a markdown table. It is meant to be run by hand or from a
workflow_dispatch GitHub Action so the result reflects a GitHub runner's IP.

Usage:
    python3 scripts/check_sources.py              # markdown table to stdout
    python3 scripts/check_sources.py --json out.json   # also write raw results

Polite by design: one GET per URL, one robots.txt per host, 2 s spacing per
host, 20 s timeout, no retries, no loops. URLs disallowed by robots.txt are
NOT fetched (reported as "robots-disallowed").
"""

import argparse
import json
import re
import socket
import ssl
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser

USER_AGENT = "AIRegTrackerBot/0.1 (+https://github.com/<owner>/ai-regulation-tracker)"
ROBOTS_AGENT = "AIRegTrackerBot"
TIMEOUT = 20
PER_HOST_DELAY = 2.0
MAX_BODY = 512 * 1024  # read at most 512 KB per response

# country -> list of (source name, URL). Homepages first, then the concrete
# feed / API / listing endpoints the tracker intends to use (see
# Claude/research/T-004-source-verification.md).
#
# An optional third element overrides the Accept header (some APIs return XML
# unless asked for JSON).
JSON = "application/json"
SOURCES = {
    "India": [
        ("MeitY home", "https://www.meity.gov.in/"),
        ("IndiaAI home", "https://indiaai.gov.in/"),
        ("IndiaAI news listing", "https://indiaai.gov.in/news"),
        ("PIB home", "https://www.pib.gov.in/"),
        ("PIB RSS (all releases, English)", "https://www.pib.gov.in/RssMain.aspx?ModId=6&Lang=1&Regid=3"),
        ("e-Gazette home (monitor only, never scrape)", "https://egazette.gov.in/"),
        ("PRS bill track", "https://prsindia.org/billtrack"),
        ("RBI home", "https://www.rbi.org.in/"),
        ("RBI press releases RSS", "https://www.rbi.org.in/pressreleases_rss.xml"),
        ("RBI notifications RSS", "https://www.rbi.org.in/notifications_rss.xml"),
        ("SEBI RSS", "https://www.sebi.gov.in/sebirss.xml"),
        ("Union Budget home", "https://www.indiabudget.gov.in/"),
        ("Alt: Sansad (Lok Sabha) bills", "https://sansad.in/ls/legislation/bills"),
        ("Alt: TRAI home", "https://www.trai.gov.in/"),
    ],
    "Brazil": [
        ("Camara API - PL 2338/2023",
         "https://dadosabertos.camara.leg.br/api/v2/proposicoes?siglaTipo=PL&numero=2338&ano=2023", JSON),
        ("Camara API - PL 2338/2023 tramitacoes",
         "https://dadosabertos.camara.leg.br/api/v2/proposicoes/2487262/tramitacoes", JSON),
        ("Senado API - PL 2338/2023 (processo)",
         "https://legis.senado.leg.br/dadosabertos/processo?sigla=PL&numero=2338&ano=2023", JSON),
        ("Senado API - federal laws list (DOU alternative)",
         "https://legis.senado.leg.br/dadosabertos/legislacao/lista?tipo=LEI&ano=2026"),
        ("DOU home", "https://www.in.gov.br/"),
        ("DOU daily edition", "https://www.in.gov.br/leiturajornal"),
        ("MCTI news listing", "https://www.gov.br/mcti/pt-br/acompanhe-o-mcti/noticias"),
        ("ANPD news REST (Plone ++api++)",
         "https://www.gov.br/anpd/++api++/pt-br/assuntos/noticias/@search"
         "?sort_on=effective&sort_order=reverse&b_size=10&metadata_fields=effective", JSON),
    ],
    "South Africa": [
        ("DCDT home", "https://www.dcdt.gov.za/"),
        ("Alt: gov.za documents RSS", "https://www.gov.za/rss.xml"),
        ("Alt: gov.za documents listing", "https://www.gov.za/documents"),
        ("GPW feed", "https://www.gpwonline.co.za/feed/"),
        ("Parliament bills listing", "https://www.parliament.gov.za/bills"),
        ("PMG API bills", "https://api.pmg.org.za/bill/?per_page=5"),
        ("PMG API gazettes", "https://api.pmg.org.za/gazette/?per_page=5"),
        ("Information Regulator feed", "https://inforegulator.org.za/feed/"),
    ],
    "South Korea": [
        ("law.go.kr DRF (expects OC error without key)",
         "https://www.law.go.kr/DRF/lawSearch.do?target=law&type=XML&query=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5"),
        ("MSIT press releases", "https://www.msit.go.kr/bbs/list.do?sCode=user&mPid=208&mId=307"),
        ("National Assembly likms (robots: Disallow /)", "https://likms.assembly.go.kr/bill/main.do"),
        ("Alt: Assembly Open API - AI bills (no key = sample mode)",
         "https://open.assembly.go.kr/portal/openapi/nzmimeepazxkubdpn?Type=json&pIndex=1&pSize=5&AGE=22"
         "&BILL_NAME=%EC%9D%B8%EA%B3%B5%EC%A7%80%EB%8A%A5", JSON),
        ("PIPC press releases",
         "https://www.pipc.go.kr/np/cop/bbs/selectBoardList.do?bbsId=BS074&mCode=C020010000"),
    ],
    "China": [
        ("CAC policies listing", "https://www.cac.gov.cn/wxzw/zcfg/A093703index_1.htm"),
        ("NPC home", "http://www.npc.gov.cn/"),
        ("NPC flk law database", "https://flk.npc.gov.cn/"),
        ("State Council latest policies JSON", "https://www.gov.cn/zhengce/zuixin/ZUIXINZHENGCE.json", JSON),
        ("MIIT home", "https://www.miit.gov.cn/"),
        ("MIIT notices (tz) data unit",
         "https://www.miit.gov.cn/api-gateway/jpaas-publish-server/front/page/build/unit"
         "?parseType=buildstatic&webId=8d828e408d90447786ddbe128d495e9e"
         "&tplSetId=209741b2109044b5b7695700b2bec37e&pageType=column"
         "&tagId=%E5%8F%B3%E4%BE%A7%E5%86%85%E5%AE%B9&editType=null"
         "&pageId=3e3ad1a3bec74939890a0d3e54815141", JSON),
        ("DigiChina work feed", "https://digichina.stanford.edu/work/feed/"),
        ("China Law Translate EN feed", "https://www.chinalawtranslate.com/en/feed/"),
        ("Alt: NPC Observer feed", "https://npcobserver.com/feed/"),
    ],
    "Cross-check": [
        ("OECD.AI", "https://oecd.ai/en/"),
    ],
}

CAPTCHA_PAT = re.compile(r"captcha|recaptcha|hcaptcha|cf-challenge|challenge-platform|"
                         r"are you a robot|verify you are human|滑动验证|验证码", re.I)
JS_PAT = re.compile(r"enable javascript|requires javascript|javascript is disabled|"
                    r"please turn on javascript", re.I)

_last_hit = {}        # host -> time of last request
_robots_cache = {}    # host -> (RobotFileParser or None, note)


def _ssl_ctx():
    return ssl.create_default_context()


def _wait(host):
    last = _last_hit.get(host)
    if last is not None:
        gap = time.monotonic() - last
        if gap < PER_HOST_DELAY:
            time.sleep(PER_HOST_DELAY - gap)
    _last_hit[host] = time.monotonic()


DEFAULT_ACCEPT = ("text/html,application/xhtml+xml,application/xml,application/json,"
                  "application/rss+xml,application/atom+xml;q=0.9,*/*;q=0.8")


def _get(url, accept=None):
    """One polite GET. Returns dict with status, final_url, ctype, body, error."""
    host = urllib.parse.urlsplit(url).netloc
    _wait(host)
    req = urllib.request.Request(url, headers={
        "User-Agent": USER_AGENT,
        "Accept": accept or DEFAULT_ACCEPT,
        "Accept-Language": "en,*;q=0.5",
    })
    out = {"status": None, "final_url": url, "ctype": "", "body": b"", "error": ""}
    try:
        with urllib.request.urlopen(req, timeout=TIMEOUT, context=_ssl_ctx()) as r:
            out["status"] = r.status
            out["final_url"] = r.geturl()
            out["ctype"] = r.headers.get("Content-Type", "")
            out["body"] = r.read(MAX_BODY)
    except urllib.error.HTTPError as e:
        out["status"] = e.code
        out["final_url"] = e.geturl() or url
        out["ctype"] = e.headers.get("Content-Type", "") if e.headers else ""
        try:
            out["body"] = e.read(MAX_BODY)
        except Exception:
            pass
    except urllib.error.URLError as e:
        reason = e.reason
        if isinstance(reason, ssl.SSLError):
            out["error"] = "TLS: " + str(reason)[:80]
        elif isinstance(reason, socket.timeout):
            out["error"] = "timeout"
        else:
            out["error"] = str(reason)[:80]
    except (socket.timeout, TimeoutError):
        out["error"] = "timeout"
    except Exception as e:  # noqa: BLE001 - report anything else
        out["error"] = type(e).__name__ + ": " + str(e)[:80]
    return out


def robots_for(url):
    """Fetch and parse robots.txt once per scheme+host."""
    parts = urllib.parse.urlsplit(url)
    key = parts.scheme + "://" + parts.netloc
    if key in _robots_cache:
        return _robots_cache[key]
    robots_url = key + "/robots.txt"
    res = _get(robots_url)
    rp = urllib.robotparser.RobotFileParser(robots_url)
    if res["status"] == 200 and not res["error"]:
        text = res["body"].decode("utf-8", "replace")
        if "<html" in text[:500].lower():
            rp.parse([])  # an HTML page is not a robots file: treat as no rules
            note = "200 (HTML, not robots)"
        else:
            rp.parse(text.splitlines())
            delay = rp.crawl_delay(ROBOTS_AGENT)
            note = "200" + (f", crawl-delay {delay}" if delay else "")
    elif res["status"] in (401, 403):
        # RFC 9309 s2.3.1.3: any 4xx means "unavailable", crawler MAY fetch.
        # (urllib.robotparser.read() would instead disallow all.) A 403 on
        # robots.txt nearly always means a WAF is refusing this client, so
        # flag it loudly; the page fetch below will show the same block.
        rp.allow_all = True
        note = f"{res['status']} on robots.txt (WAF/blocked client?)"
    elif res["status"] and 400 <= res["status"] < 500:
        rp.allow_all = True
        note = f"{res['status']} (no robots: allowed)"
    else:
        # 5xx or network/TLS error: RFC 9309 says assume complete disallow.
        rp.disallow_all = True
        note = "unreachable (page not fetched): " + (res["error"] or str(res["status"]))
    _robots_cache[key] = (rp, note)
    return rp, note


def flags_for(res):
    flags = []
    body = res["body"][:200000].decode("utf-8", "replace") if res["body"] else ""
    if res["error"]:
        flags.append(res["error"])
    if body and CAPTCHA_PAT.search(body):
        # Often just an invisible hCaptcha on a contact form; check by hand.
        flags.append("captcha-hint")
    if body and JS_PAT.search(body):
        flags.append("js-notice")
    if res["status"] == 200 and "html" in res["ctype"] and len(res["body"]) < 2000:
        flags.append(f"tiny-html({len(res['body'])}B)")
    low = res["ctype"].lower()
    if "xml" in low or "rss" in low or "atom" in low or body.lstrip().startswith("<?xml"):
        n = body.count("<item") + body.count("<entry")
        flags.append(f"feed/xml items~{n}")
    if "json" in low:
        flags.append("json")
    return flags


def check(country, name, url, accept=None):
    rp, rnote = robots_for(url)
    allowed = rp.can_fetch(ROBOTS_AGENT, url)
    row = {"country": country, "source": name, "url": url, "robots": rnote,
           "robots_allows": allowed, "status": "", "final_url": "", "bytes": 0,
           "ctype": "", "flags": []}
    if not allowed:
        row["status"] = ("robots-unreachable" if rnote.startswith("unreachable")
                         else "robots-disallowed")
        return row
    res = _get(url, accept)
    row["status"] = res["status"] if res["status"] is not None else "ERR"
    row["final_url"] = res["final_url"] if res["final_url"] != url else ""
    row["bytes"] = len(res["body"])
    row["ctype"] = res["ctype"].split(";")[0]
    row["flags"] = flags_for(res)
    return row


def md_escape(s):
    return str(s).replace("|", "\\|")


def main():
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--json", help="also write raw results to this file")
    ap.add_argument("--country", help="only check one country key")
    args = ap.parse_args()

    rows = []
    for country, items in SOURCES.items():
        if args.country and args.country.lower() != country.lower():
            continue
        for item in items:
            name, url = item[0], item[1]
            accept = item[2] if len(item) > 2 else None
            print(f"checking {name} ...", file=sys.stderr, flush=True)
            rows.append(check(country, name, url, accept))

    print(f"Checked {len(rows)} URLs at {time.strftime('%Y-%m-%d %H:%M:%S %Z')} "
          f"with UA `{USER_AGENT}`\n")
    print("| Country | Source | URL | HTTP | Redirect to | Type | Bytes | robots.txt | Allowed | Flags |")
    print("|---|---|---|---|---|---|---|---|---|---|")
    for r in rows:
        print("| " + " | ".join(md_escape(x) for x in [
            r["country"], r["source"], r["url"], r["status"], r["final_url"] or "-",
            r["ctype"] or "-", r["bytes"], r["robots"],
            "yes" if r["robots_allows"] else "NO", "; ".join(r["flags"]) or "-"]) + " |")

    if args.json:
        with open(args.json, "w", encoding="utf-8") as fh:
            json.dump(rows, fh, ensure_ascii=False, indent=2)
    return 0


if __name__ == "__main__":
    sys.exit(main())
