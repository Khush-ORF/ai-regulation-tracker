# T-110: South Korea national seed data

Agent: claude-opus (subagent) · Date: 2026-10-26 · Statuses checked as of 2026-10-26.

24 records: 13 instruments, 6 initiatives, 5 funds. All files have `provenance: "auto"`. JSON parse, ID pattern, file-name/ID match and summary length (73–105 words) were checked with PowerShell. No build or `npm` was run.

## Records

### Instruments (`data/instruments/`)
| id | title | status | main source |
|---|---|---|---|
| kr-ai-basic-act-2025 | AI Basic Act (Act No. 20676; amended by Act No. 21311) | in_force (2026-01-22) | KLRI eLaw English text; MSIT press release nttSeqNo=1214 |
| kr-ai-basic-act-enforcement-decree-2026 | Enforcement Decree of the AI Basic Act | in_force (2026-01-22) | MSIT nttSeqNo=1214 and 1191 |
| kr-ai-transparency-guidelines-2026 | Guidelines on Ensuring AI Transparency | voluntary | MSIT nttSeqNo=1215 |
| kr-pipa-automated-decisions-2023 | PIPA Art. 37-2 (Act No. 19234) | in_force (2024-03-15) | KLRI eLaw PIPA text (addenda) |
| kr-pipc-automated-decision-standards-2024 | PIPC notice on automated decisions + rights guide | in_force (2024-09-26) | PIPC press release nttId=10611 |
| kr-pipc-generative-ai-guide-2025 | PIPC Generative AI personal-data guide | voluntary | PIPC press release nttId=11410 |
| kr-pipa-ai-development-amendment-2026 | PIPA AI-development special provision (Act No. 21910) | passed (effective 2027-03-09) | PIPC press release nttId=12391; Law Times |
| kr-election-act-deepfake-2023 | Public Official Election Act Art. 82-8 (deepfakes) | in_force (2024-01-29) | Journalists Association of Korea; Open Net Korea; Herald (NEC 2026 notice) |
| kr-sexual-crimes-deepfake-amendment-2024 | Sexual Crimes Punishment Act amendment (Act No. 20459) | in_force (2024-10-16) | Ministry of Justice notice |
| kr-national-ai-strategy-2019 | National Strategy for AI (2019) | lapsed | MSIT; Korea.net; OECD.AI (inactive, 2020–2022) |
| kr-digital-bill-of-rights-2023 | Digital Bill of Rights | voluntary | MSIT nttSeqNo=878; korea.kr |
| kr-ai-action-plan-2026 | AI Action Plan / AI Basic Plan 2026–2028 | voluntary | aikorea.go.kr (committee site), 2026-02-25 |
| kr-ai-semiconductor-initiative-2024 | AI-Semiconductor Initiative | voluntary | Korea.net 2024-04-11 |

### Initiatives (`data/initiatives/`)
| id | title | status | main source |
|---|---|---|---|
| kr-national-ai-computing-center-2024 | National AI Computing Center (Haenam) | active (construction began 2026-08-03) | MSIT nttSeqNo=1166; Korea.net 2026-08-04 |
| kr-national-ai-strategy-committee-2025 | National AI Strategy Committee | active | MSIT nttSeqNo=1165; KDI EIEC copy of launch release |
| kr-sovereign-ai-foundation-model-2025 | Independent AI Foundation Model Project | active | MSIT release via KDI EIEC; korea.kr briefing 2026-08-19 |
| kr-ai-safety-institute-2024 | Korea AI Safety Institute | active | MSIT nttSeqNo=1058 |
| kr-pan-government-ai-common-infrastructure-2025 | Pan-Government AI Common Infrastructure | active | korea.kr 2025-11-24 |
| kr-ai-centered-universities-2026 | AI-Centered Universities and AX Graduate Schools | active | korea.kr 2026-09-29 and 2026-01-19 |

### Funds (`data/funds/`)
| id | amount (KRW) | stage | fiscal year | main source |
|---|---|---|---|---|
| kr-msit-ai-budget-2026 | 5,100,000,000,000 (5.1 trillion) | allocated | 2026 | MSIT nttSeqNo=1195 |
| kr-government-ai-budget-2026 | 10,100,000,000,000 (10.1 trillion) | announced (proposal) | 2026 | Korea.net 2025-09-01 |
| kr-msit-ai-budget-2027 | 9,400,000,000,000 (9.4 trillion) | announced (proposal) | 2027 | MSIT release via KDI EIEC 2026-09-01 |
| kr-ai-semiconductor-investment-2024 | 9,400,000,000,000 (9.4 trillion, 2024–2027) | announced | 2024 | Korea.net 2024-04-11 |
| kr-naicc-government-investment-2025 | 80,000,000,000 (80 billion, to 2030) | announced | 2025 | MSIT nttSeqNo=1166 |

Totals: **13 instruments, 6 initiatives, 5 funds = 24 records.**

## Conflicting figures and dates (and what I chose)
- **Enforcement Decree approval date.** MSIT says the Cabinet approved it on 2026-01-20; White & Case says 2026-01-21. Secondary sources give Presidential Decree No. 36053 dated 2026-01-21 (likely the promulgation date). I used 2026-01-20 as `passed` (MSIT) and left the decree number out of the record.
- **Decree amendment (2026).** Press reports say legislative notice ran 2026-05-21 to 06-19, the Cabinet approved it on 2026-07-14, and it took effect 2026-07-21 with the parts of Act No. 21311 that needed subordinate rules. I found no MSIT original, so I mention it in the summary only and did not add it to `status_history`.
- **Digital Policy Alert** says the promulgated decree was much narrower than the drafts (only dates and committee transition). That conflicts with MSIT's own release describing the 10^26 FLOPs threshold and labelling rules in force. I followed MSIT.
- **2026 AI budget.** Government-wide 10.1 trillion (proposal, Aug 2025) and MSIT 5.1 trillion (final, Dec 2025) measure different scopes. News reports a 206.4 billion won cut to AI items during Assembly review and the Japan Times reports 10.1 trillion "kept"; I found no official post-passage government-wide figure, so the 10.1 trillion record is `announced`. Some outlets give MSIT's 2026 AI budget as KRW 5.0938 trillion (likely including the supplementary budget); I used MSIT's stated 5.1 trillion.
- **2027 MSIT AI budget.** The official release (via KDI EIEC) says 9.4 trillion; news gives the exact figure as KRW 9.4211 trillion and says it is 57% of the government AI budget. I used the official rounded 9.4 trillion.
- **National AI Computing Center.** Korea.net says capacity is "15,000 advanced AI semiconductor wafers"; MSIT says more than 15,000 GPUs. I used GPUs. News puts the total project cost at KRW 2.5 trillion and the public stake at 29%; MSIT's 2025 call said more than KRW 2 trillion and under 30%. I used MSIT's figures.
- **Election deepfake penalties.** Most sources give up to 7 years or a KRW 10–50 million fine; one English report (Nocut) gives 3 years / 6 million. I used the majority figure, which matches the Journalists Association article.
- **AI Basic Act English title.** KLRI uses "...Creation of a Foundation for Trust"; MSIT uses "Basic Act on the Development of AI and the Establishment of Foundation for Trustworthiness" and "AI Basic Act". I used the KLRI title plus "(AI Basic Act)".

## Left out, and why
- **The seven MSIT notices and guidelines other than the transparency guideline** (safety-assurance notice, operator-responsibility notice, and guidelines on high-impact AI determination, safety, operator obligations and impact assessment). Drafts were published on 2025-09-17. Secondary sources say the final versions came out around 2026-01-22 (with a revised high-impact guideline on 2026-01-29), but I could not open an official final text or release. DataGuidance is paywalled.
- **National AI Strategy Policy Directions (2024-09-26, MSIT nttSeqNo=1040).** Well sourced, but it was the previous administration's strategy and has effectively been replaced by the statutory AI Action Plan. I was unsure whether to mark it `voluntary` or `lapsed`, so I cited it as a source in the computing-centre and committee records instead of creating a separate record. The owner may want to add it.
- **National Guidelines for AI Ethics (2020).** OECD.AI lists them as active, but I could not confirm their content from an official MSIT or NIA page.
- **GPU-procurement funds (2025 supplementary budget).** Figures conflict: OECD.AI search snippets give about KRW 1.46 trillion for 13,000 GPUs, and another snippet gives KRW 1.6341 trillion for 10,000 GPUs. I could not open an official page that states either figure.
- **AI-centered university fund (KRW 25.5 billion for 2026).** This figure appears only in a search summary; the korea.kr page I opened gives only per-university amounts.
- **Sovereign AI foundation model budget.** MSIT gave only estimates (about KRW 40 billion of GPU cost per team, about KRW 120 billion for three teams) and said the budget was not final.
- **Pending bills.** The National Assembly API (sample mode) shows 42 pending AI Basic Act amendment bills from the 22nd Assembly. The latest were filed 2026-07-21 to 2026-09-01; none has a `PROC_RESULT`. It also shows new framework bills, e.g. 인공지능 기본사회 및 국민권리 보장에 관한 법률안 (2026-09-02) and 산업 디지털 전환 및 인공지능 활용 촉진법 전부개정법률안 (2026-10-21). I created no records for them because none has progressed past committee referral. Phase 2 should track them.
- **PIPC consultations (2026-08-21 and 2026-10-01/23)** on reforming the privacy framework for the AI era. They are still at consultation stage and their scope is unclear, so no record was made.
- **PIPC "Generative AI user privacy guide" (2026-05-19)** and **privacy-policy guideline with generative AI criteria (2026-04-24).** These are minor follow-ups to the 2025 guide and were left out to avoid padding.
- **Public AI Business Support Center (MOIS, 2026-04-02).** The release body was not readable.

## Notes on sources
- MSIT English press releases (`msit.go.kr/eng/bbs/view.do?...nttSeqNo=`) worked, but list pages load by JavaScript, so discovery needed web search. Many pages carry no year, so I inferred years from context (e.g. nttSeqNo=1165 is 2025-09-08; nttSeqNo=1195 is Dec 2025).
- PIPC Korean press board search works without JavaScript: `selectBoardList.do?bbsId=BS074&mCode=C020010000&searchCnd=0&searchWrd=<term>`. This is useful for Phase 2 html-diff.
- law.go.kr pages load content in iframes and returned only titles. I used KLRI eLaw (elaw.klri.re.kr) English texts instead.
- KDI EIEC (eiec.kdi.re.kr) republishes ministry press releases with the issuing division and date. I used it where the original ministry page could not be found.
- The National Assembly Open API sample mode returns only the first 5 rows, whatever `pIndex` is. Committee alternative bills (e.g. the AI Basic Act 대안) did not come up in name searches.

## State-level items for Phase 3 (no files created)
- Jeollanam-do (Haenam, Solasido): the National AI Computing Center site; the province is a consortium member.
- Gwangju: AI data centre (880 H100 GPUs, 416 secured by the government per MSIT Feb 2025) and a 2026 AI-related national budget of KRW 163.8 billion (Gwangju city figure, press only).
- Daegu: the PIPC "Privacy Innovation Zone" at the Daegu Digital Innovation Agency (PIPC 2026-10-23).

## Uncertainties
- `kr-ai-semiconductor-initiative-2024` (confidence 0.6) and its fund: this is a previous-administration plan. It has not been withdrawn, but it may not be current policy.
- `kr-digital-bill-of-rights-2023` (0.7): the same caveat about the change of government.
- `kr-national-ai-strategy-2019` is marked `lapsed` because OECD.AI lists it as inactive for 2020–2022. No formal withdrawal was found, and `dates.lapsed` is omitted.
- `kr-election-act-deepfake-2023` (0.75): no official statute text could be opened (law.go.kr iframes). The exact December 2023 passage date is unconfirmed, so `passed` is "2023-12". A constitutional complaint has been pending since 2025-10-01.
- `kr-pipa-ai-development-amendment-2026`: the Act number and the 2027-03-09 effective date come from one legal-press article. PIPC confirms only "six months after promulgation".
- `kr-pan-government-ai-common-infrastructure-2025` (0.75): I did not confirm that it was rolled out to all governments from March 2026.
