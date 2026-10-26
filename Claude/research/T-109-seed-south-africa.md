# T-109: National seed data for South Africa

Agent: claude-opus (sub-agent) · Checked: 2026-10-26 · Statuses are as of 2026-10-26.

DCDT (dcdt.gov.za) was not crawled because it is down for maintenance (SOURCES.md §3). The main sources were gov.za (documents, gazette PDFs, speeches), SAnews, Parliament, the Information Regulator, SARB/FSCA and Treasury. PMG pages are cited under CC BY 3.0 ZA ("Parliamentary Monitoring Group, pmg.org.za").

Totals: 9 instruments, 4 initiatives, 1 fund. That is below the targets because South Africa has no AI law, no binding AI rules and few AI funding figures with an official amount. I did not add records to fill the gap.

## Records

### Instruments
| id | title | status | main source |
|---|---|---|---|
| za-national-ai-policy-framework-2024 | South Africa National AI Policy Framework | voluntary | PMG gazette summary (18 Nov 2024); OECD.AI; 2026 gazette explanatory note |
| za-draft-national-ai-policy-2026 | Draft South Africa National AI Policy | lapsed | Gazette 54477, Notice 3880 (10 Apr 2026); withdrawal Gazette 54840, Notice 3978 (12 Jun 2026) |
| za-revised-national-ai-policy-2026 | National AI Policy (revised draft in preparation) | proposed | Budget vote speech, gov.za (12 May 2026); PMG NW3567 (Jul 2026); Treasury ENE 2026 Vote 30 |
| za-popia-2013 | Protection of Personal Information Act 4 of 2013 (s71 automated decisions) | in_force | gov.za Act page (commencement dates); justice.gov.za Act PDF |
| za-pc4ir-report-2020 | Report of the Presidential Commission on the 4IR | voluntary | gov.za document (23 Oct 2020); Presidency statement (6 Aug 2020); SAnews |
| za-digital-future-skills-strategy-2020 | National Digital and Future Skills Strategy | voluntary | gov.za notice (Gazette 43730, GN 513, 23 Sep 2020) |
| za-fsca-pa-ai-financial-sector-report-2025 | AI in the South African Financial Sector (FSCA/PA) | voluntary | SARB/PA media release (24 Nov 2025) |
| za-national-policy-data-cloud-2024 | National Policy on Data and Cloud | voluntary | Gazette 50741, GN 2533 (31 May 2024) |
| za-inforeg-elections-guidance-note-2024 | Information Regulator guidance note on voters' data and election mis/disinformation | voluntary | inforegulator.org.za guidance note (14 May 2024) |

### Initiatives
| id | title | status | main source |
|---|---|---|---|
| za-aiisa-2022 | AI Institute of South Africa and AI hubs (UJ, TUT, CUT) | active | gov.za media advisory (30 Nov 2022); TUT hub statement (15 Mar 2023); CUT news |
| za-cair-2011 | Centre for Artificial Intelligence Research | active | cair.org.za; PMG committee meeting 39740 |
| za-fdcr-platform-2022 | Foundational Digital Capabilities Research platform (DSI/CSIR) | active | PMG question NW955; PMG committee meeting 39740 |
| za-chpc-2007 | Centre for High Performance Computing (NICIS) | active | gov.za statement (23 May 2007); chpc.ac.za |

### Funds
| id | title | amount | main source |
|---|---|---|---|
| za-fdcr-allocation-2024 | DSI funding for FDCR, 2024/25 | R110,000,000 (allocated) | PMG question NW955 (ministerial reply) |

## Key status findings (please double-check)
- **The 2026 draft National AI Policy has lapsed.** Cabinet approved it on 25 Mar 2026 (with a special sitting on 1 Apr). It was gazetted for 60 days of comment on 10 Apr 2026, with a deadline of 10 Jun. The Minister announced its withdrawal on 26 Apr after fictitious references were found. Cabinet approved the withdrawal (SAnews, 5 Jun), and the formal withdrawal notice is Notice 3978, signed 4 Jun and gazetted 12 Jun 2026. I used 12 Jun as the `lapsed` date. Some secondary sources give 26 Apr instead (the announcement date).
- **No revised draft had been published as of 26 Oct 2026.** An expert panel chaired by Prof. Benjamin Rosman was announced on 12 May 2026. The PMG reply to NW3567 (asked 23 Jul 2026) says the draft is still under review.
- **The timeline for the revised policy keeps moving.** In May 2026 reports said Cabinet by November 2026 and public comment in January 2027 (ITWeb/Polity). In September and October 2026 reports said a Cabinet submission around March 2027 with consultation from April 2027 (Daily Maverick, 21 Sep; Engineering News, 23 Oct). I could only read these as search snippets because both returned HTTP 403, so they are not in the record fields. Treasury's 2026 ENE (published before the withdrawal) gives a target of "a national AI policy and implementation plan by March 2028". That target is in the record.

## Uncertain items, and records left out
- **Status of the 2024 Framework.** It was never gazetted, adopted or withdrawn, and it was superseded in practice by the 2026 draft, which then lapsed. I set it to `voluntary` (non-binding, published, never withdrawn) with confidence 0.6. `in_progress` would also be defensible (OECD.AI lists it as "proposed/under development"). The lead agent may want a rule for superseded consultation documents.
- **Publication date of the 2024 Framework.** PMG says it "appears" to have been published on 14 Aug 2024 and was re-posted with a comment deadline of 29 Nov 2024. OECD.AI says October 2024. The 2026 gazette calls it the "Framework of August 2024". I used `announced: 2024-08`.
- **Pillar count of the 2024 Framework.** PMG lists 9 pillars and OECD.AI says 12. The summary avoids giving a number.
- **The PC4IR report.** The gov.za PDF (43834gen591.pdf, 8.8 MB) was not read in full. Its recommendations come from the Presidency statement and SAnews. The file name suggests Gazette 43834, Notice 591, but this is not confirmed, so it is not in the record.
- **Information Regulator AI guidance.** I found no guidance note, statement or code on AI or on POPIA s71 automated decision-making (I checked the guidance-notes, media-statements and resource pages). The Direct Marketing guidance note (3 Dec 2024) may discuss s71 according to a search snippet. I could only extract its first pages, could not confirm this, and left it out. The elections guidance note is included because its text does mention generative AI.
- **FSCA/PA discussion paper.** Secondary sources (Moonstone, law firms) say a follow-up discussion paper is planned. I found none published, and the SARB page does not mention one. There are no binding AI-specific financial-sector rules.
- **Funds left out:**
  - **R484 million over four years** for "AI, blockchain and related technologies", and **R98.5 million for FDCR in 2025/26.** Both are attributed to a parliamentary reply by Minister Nzimande, but come only from iafrica.com (17 Jul 2025). I could not find the official reply. The R98.5m also conflicts with the official 2024 reply, which projects R110m growing 5% a year (about R115.5m for 2025/26). I kept the official R110m figure.
  - **R226,726,000 for 2022/23 to 2023/24** (same reply as NW955). The reply's wording is ambiguous about whether this figure covers FDCR alone or all of DSI's digital innovation spending, so I left it out.
  - **DCDT's R524.4 million Digital Society and Economy programme** (ENE 2026, over the medium term). It covers the AI policy and much else, and is not AI-specific.
  - **DSTI's R2.9 billion for research infrastructure and human capital** (ENE 2026). It includes HPC but is not AI-specific.
- **Other items left out:**
  - **Digital Transformation Roadmap for Government** (May 2025): no AI-specific commitments found.
  - **Cybercrimes Act 2020:** not AI-specific, and South Africa has no deepfake-specific law.
  - **Copyright Amendment Bill:** AI link is indirect.
  - **NACI's 2025 "Recommendations towards a National AI Strategy"** (cited in the 2026 draft): not located.
  - **National AI Government Summit discussion document** (2024): only on the DCDT site, which is down.
  - **Competition Commission Media and Digital Platforms Market Inquiry:** AI aspects not verified.
- **No AI bill in Parliament.** The first page of `https://api.pmg.org.za/bill/` (the 50 most recent bills, 2026) has no AI, data, cyber or deepfake bill.
- **CAIR:** its "about" page says "eight universities" but names nine group locations. The record lists names without a count.
- **AIISA:** I found no 2025–2026 activity reports. `active` rests on the April 2026 draft policy, which treats it as an existing body (confidence 0.75).

## State-level items for Phase 3 (no files created)
- **Free State:** the CUT AIISA hub was launched with the Free State Provincial Government (2024).
- **Gauteng:** the UJ and TUT AIISA hubs are in Johannesburg and Pretoria. A June 2026 allAfrica item mentions an R1.9 billion provincial digital transformation budget that includes an "Artificial Intelligence Office". The province is unnamed in the snippet and this is not verified.
- **Western Cape:** the CHPC is in Cape Town. The City of Cape Town submitted comments on the 2024 Framework.

## Notes for the lead agent
- `scratchpad/scripts/pdftext.py` was overwritten during the session (it now imports `pypdf`, which is not installed here). I did not write that version. I used my own `t109_pdftext_stdlib.py` instead. Both are in the scratchpad only.
- I ran no npm or astro. I only checked the JSON shape with a local Python script (ids, summary 40–120 words, date formats, no nulls).
