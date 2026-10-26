# T-108: Brazil national seed data

Agent: claude-opus (subagent). Date: 2026-10-26. Brief: `Claude/research/SEED-BRIEF.md`.

Result: **13 instruments, 6 initiatives, 5 funds**, 24 files in total, all with IDs starting `br-`. I checked them with a local script for ID/filename match, the 40–120-word and 900-character summary limits, date formats, stream counts, obligation length and fund cross-references. I did not run npm/astro.

## Records

### Instruments (`data/instruments/`)
| id | title | status | main source |
|---|---|---|---|
| br-pl-2338-ai-bill-2023 | PL 2338/2023, general AI bill | in_progress | Câmara API `/proposicoes/2487262/tramitacoes` (last entry 2026-09-02, "Aguardando Parecer" in the special committee) |
| br-pl-6237-ai-governance-system-2025 | PL 6237/2025, Executive bill creating the SIA | in_progress | Câmara API `/proposicoes/2594000`; Planalto bill text |
| br-lgpd-2018 | LGPD, Law 13.709/2018 (Art. 20 automated decisions) | in_force | Planalto compiled text; Agência Senado 2020-09-18 |
| br-anpd-ai-automated-decisions-regulation-2024 | ANPD regulatory process on AI and Art. 20 review (tomada de subsídios) | in_progress | ANPD (title/date via API); Legismap; Lefosse |
| br-anpd-radar-generative-ai-2024 | ANPD Technology Radar No. 3: Generative AI | voluntary | ANPD news (EN version, 2026-07-27) |
| br-ebia-2021 | Brazilian AI Strategy (EBIA), Portaria MCTI 4.617/2021 | voluntary | OECD.AI; DOU copy of Portaria 4.979/2021 |
| br-tse-res-23732-ai-2024 | TSE Res. 23.732/2024 (AI and deepfake rules, 2024 elections) | in_force | Suffragium (TRE-CE journal) |
| br-tse-res-23755-ai-2026 | TSE Res. 23.755/2026 (AI rules, 2026 elections) | in_force | InvestNews; Tribuna PR |
| br-cnj-res-615-ai-judiciary-2025 | CNJ Res. 615/2025, AI in the Judiciary | in_force | Revista do TRF3 article |
| br-cfm-res-2454-ai-medicine-2026 | CFM Res. 2.454/2026, AI in medicine | in_force (from 2026-08-26) | Mayer Brown; Migalhas; Futuro da Saúde |
| br-lei-15123-ai-violence-women-2025 | Law 15.123/2025, higher penalty for AI-enabled psychological violence against women | in_force | Planalto; Senado legislation API |
| br-lei-15487-ai-child-sexual-abuse-2026 | Law 15.487/2026, child sexual abuse incl. AI-generated material | in_force | Planalto; Senado legislation API |
| br-decree-12976-online-violence-women-2026 | Decree 12.976/2026, protecting women online (AI intimate content chapter) | in_force | Planalto decree text; ANPD news |

### Initiatives (`data/initiatives/`)
| id | title | status | main source |
|---|---|---|---|
| br-pbia-2024 | Brazilian AI Plan 2024–2028 (PBIA) | active | MCTI plan PDF (EN, via OECD.AI); Agência Brasil |
| br-ai-supercomputer-2026 | National AI supercomputer, Macaíba (RN) | announced | Agência Brasil 2026-08-20/21 |
| br-santos-dumont-expansion-2024 | Santos Dumont supercomputer expansion (LNCC) | active | Agência Brasil 2024-04-06, 2024-07-30, 2026-08-20 |
| br-anpd-ai-sandbox-2023 | ANPD AI and data protection regulatory sandbox | active | ANPD news and sandbox pages (2023–2026) |
| br-obia-2024 | Brazilian AI Observatory (OBIA), NIC.br | active | Teletime 2024-07-31 |
| br-bcb-ai-coe-2024 | Central Bank Centre of Excellence in Data Science and AI | active | BCB normativos API (Res. BCB 408/2024) |

The PBIA monitoring working group (May 2025) is covered inside `br-pbia-2024` and has no file of its own.

### Funds (`data/funds/`)
| id | amount | stage | main source |
|---|---|---|---|
| br-pbia-investment-2024 | BRL 23,030,000,000 (2024–2028) | announced | MCTI PBIA document, investment table |
| br-pbia-business-innovation-2024 | BRL 13,790,000,000 (parent: PBIA) | announced | same |
| br-pbia-ai-infrastructure-2024 | BRL 5,790,000,000 (parent: PBIA) | announced | same |
| br-santos-dumont-ai-upgrade-2024 | BRL 1,800,000,000 (parent: PBIA) | announced | Agência Brasil 2024-07-30 |
| br-bndes-ai-credit-2025 | BRL 1,000,000,000 approved credit, 2024 to June 2025 | allocated | Agência Brasil 2025-06-18 |

## Status checks as of 2026-10-26
- **PL 2338/2023**: the Senate approved it on 2024-12-10 (Senado API `dataDeliberacao`). The Câmara received it on 2025-03-17, created a special committee on 2025-04-29 and appointed rapporteur Aguinaldo Ribeiro on 2025-05-20. The API shows no report (parecer) up to the latest entry on 2026-09-02. The last tramitação is an attachment notice, and the status is still "Aguardando Parecer", under priority regime. Press reports said a vote was planned for May and then June 2026 and later slipped to after the October 2026 elections. I relied on the API, not the press, for the status.
- **PL 6237/2025**: submitted by the Executive on 2025-12-08. It was attached to PL 2338 on 2026-04-06 and its status is "Tramitando em Conjunto".
- **ANPD AI regulation**: the tomada de subsídios ran from 2024-11-06 to 2025-01-24 (extended from 2024-12-05). Technical Note 12/2025 followed on 2025-05-15. It is item 7 of the 2025–2026 Regulatory Agenda, and no draft has been published. I chose `in_progress`, but `proposed` is arguable, because the call for input was a preliminary consultation and not a draft rule. I set `binding: true` on the assumption that the end product is a regulation; Lefosse notes the ANPD may produce guides instead. Confidence is 0.6.
- **CFM Res. 2.454/2026**: in force from 2026-08-26. A suit by CNSaúde, FENAESS and SBH asking to suspend it was filed on 2026-08-21 in the 21st Federal Civil Court of the Federal District, and I found no injunction. Re-check this.
- **Decree 12.976/2026**: 60-day vacatio from publication in the DOU on 2026-05-21. I recorded `effective: "2026-07"` rather than computing an exact day.

## Conflicting figures and dates, and what I chose
- **CFM Res. 2.454 dates**: the Mayer Brown article (2026-03-16) gives approval on 27 Feb 2026 and an effective date of 10 Aug 2026. A search snippet from an AMB booklet says it was approved on 11 Feb and published in the DOU on 27 Feb. Futuro da Saúde (2026-08-25) says it "enters into force this Wednesday (26)", meaning 26 Aug, which matches 180 days from 27 Feb. One search summary even said 26 October. I chose passed 2026-02-27 (publication) and effective 2026-08-26, with confidence 0.65.
- **PBIA total**: the official MCTI table gives BRL 23.03 billion, and the plan text says "R$ 23 billion until 2028". Agência Brasil's breakdown by source adds up to about R$ 23.04 billion, a rounding difference. A search snippet mentioned an MCTI slide showing "R$ 23.23 billion" as a typo. OECD.AI lists "€3.8 billion per year", which I ignored. I used 23,030,000,000 from the plan table.
- **Santos Dumont capacity**: 5.1 PF before the 2024 contract, 17 PF target (2024 article), 27 PF reported in August 2026. These are not contradictory, but I could not confirm when the upgrade was finished, so the initiative stays `active`.
- **AI supercomputer cost**: Agência Brasil says "just over R$ 1 billion" and separately mentions R$ 1.276 billion over five years for a national LLM / Portuguese-language AI effort. The PT and EN versions attach that second figure differently. I made **no fund record** for either, because "just over" is not an exact figure and the R$ 1.276 billion is ambiguous.
- **TSE 2026 resolution number**: most sources say 23.755/2026; one law-firm page (Barbieri, seen only in search) cited 23.748/2026. The Artigo 19 note links to a TSE URL for "resolução nº 23.755, de 2 de março de 2026". I chose 23.755.
- **PBIA working group**: Agência Brasil (2025-05-12) says it was created by a "resolução" with 15 bodies. One search snippet said 18 bodies and cited "Decree 12.308/2024". I used Agência Brasil and left out the decree number.

## Access problems (relevant for Phase 2)
- **gov.br electoral blackout**: several federal pages are switched off during the 2026 election period, with the message "Em respeito à legislação eleitoral vigente, esta página está desativada temporariamente". This affected Agência Gov and the LNCC page, which asked for authentication. Older ANPD news items (2024–2025) return HTTP 401 through both the HTML pages and `++api++`. Recent ANPD items (2026) work. For two ANPD sources (the AI consultation extension of 2024-11-29 and the Portuguese Generative AI Radar of 2024-11-29), I could read the title and date through the ANPD `@search` API but not the page body. Those records also cite secondary sources.
- **MCTI (gov.br/mcti)**: pages and PDFs serve a human-verification CAPTCHA, which I did not attempt. The classic-Plone `++api++` returns 404. I used the MCTI PBIA PDF hosted by OECD.AI (official MCTI document, English edition) plus Agência Brasil instead.
- **TSE (tse.jus.br)**: HTTP 403 to the bot and to WebFetch. Both TSE records rely on secondary sources (confidence 0.7). Re-check against the official resolution texts when access allows.
- **CNJ (atos.cnj.jus.br)** and the TSE-hosted DJe copy: HTTP 403. The CNJ record relies on a peer-reviewed article in the TRF3 journal (confidence 0.7). I left the effective date out because I could not verify the vigência clause.
- **CFM (sistemas.cfm.org.br)**: connection refused, so I used secondary sources.
- The **BCB normativos API** (`/api/conteudo/app/normativos/exibenormativo?p1=...&p2=...`) works and returns JSON. It is worth adding to SOURCES.md §2.
- The **Câmara API** needs UTF-8 decoding of the raw bytes. PowerShell's `Invoke-RestMethod` mis-decodes accents.

## Considered and left out
- **ANPD preventive measure against Meta (July 2024, lifted 30 Aug 2024)** on training AI with Brazilian users' data. The ANPD pages return 401, and I found no opened source to support the details. It would be an `order` with status `lapsed`. Add it once the ANPD pages are reachable.
- **ANPD Technology Radar No. 6 on deepfakes (July 2026)**: I verified it (ANPD news 2026-07-29) but folded it into context rather than a separate record, to avoid padding. It could be added as an `advisory`.
- **Decree 12.975/2026** (platform duty-of-care rules under the Marco Civil, with ANPD as supervisor): verified, but its text does not mention AI. It is relevant to platform content rules, so I left it out as not AI-specific.
- **Central Bank and CVM**: I found no AI-specific rule for regulated entities. A BCB director said in October 2024 that no AI-specific regulation was planned (secondary source). CMN Res. 5.274/2025 and BCB Res. 538/2025 on cybersecurity are not AI-specific. I found no CVM AI rule or consultation. The only BCB item is the internal CoE (`br-bcb-ai-coe-2024`).
- **MGI Portaria 3.485/2026** (AI governance policy inside the Ministry of Management) and **Portaria SGD/MGI 5.921/2026** (authorisation to use AI in federal IT contracts, in force 2026-09-01): seen only in search results from secondary sites and not opened, and they are internal or procurement rules. They are candidates for a later pass.
- **ANPD conversion into "Agência Nacional de Proteção de Dados"** (MP 1.317/2025, approved by the Senate in February 2026). The Planalto LGPD page cites the converting law inconsistently, as both 15.352 and 15.452, so I did not verify the law number. It is not an AI instrument, but it changes the ANPD's name and ties it to the Ministry of Justice. I kept `issuing_body: "ANPD"`.
- **Target of training 115,000 public servants by 2026 (PBIA)** and **"25 of 54 PBIA actions delivered"**: these appear only in secondary or search-snippet sources, so I did not record them.
- **Portuguese-language LLM programme (R$ 1.276 billion)**: ambiguous, as explained above.
- **ECA Digital (Law 15.211/2025)**: concerns children online and is not AI-specific.
- **PL 2338's attached bills** (about 37 per Agência Senado, October 2026): not recorded individually.

## State-level items for Phase 3
- São Paulo: FAPESP co-funds the Applied AI Research Centres (CPAs) with MCTI and CGI.br, and USP's C4AI and CIAAM are partners in OBIA and the ANPD sandbox.
- Rio Grande do Norte hosts the planned national AI supercomputer (Augusto Severo park, Macaíba). It is a federal project but has a state angle.
- Rio de Janeiro: a separate supercomputing initiative through RNP with Huawei and iFlytek was mentioned in Agência Brasil (August 2026). I did not verify it.

## Confidence notes
- 0.85–0.9: records whose fields come from official texts or APIs (LGPD, the two bills, the two criminal laws, BCB CoE, PBIA).
- 0.7–0.8: official text plus a secondary source for some fields, or a reliable secondary source only (TSE, CNJ, Decree 12.976, sandbox, EBIA, supercomputer).
- 0.6–0.65: an inferred status or conflicting dates (ANPD AI regulation, CFM, OBIA, Santos Dumont R$ 1.8 billion).
