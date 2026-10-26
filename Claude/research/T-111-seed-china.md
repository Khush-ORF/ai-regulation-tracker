# T-111: National seed data for China

Date: 2026-10-26. Agent: claude-opus (subagent). All statuses checked against sources current to this date.

## Access notes
- **Worked:** gov.cn (State Council and its policy library and gazette), cac.gov.cn, ndrc.gov.cn, most.gov.cn, miit.gov.cn, nda.gov.cn, openstd.samr.gov.cn, news.cn (Xinhua), NPC Observer, DigiChina `/work/`, CSET.
- **Blocked:** China Law Translate returned HTTP 403 to WebFetch on both article pages and the `/en/feed/`, so it isn't cited. This may be our fetcher's User-Agent; T-201 should re-check.
- **Not attempted:** npc.gov.cn / flk.npc.gov.cn, per SOURCES.md §5. I used the CAC and Xinhua copies of NPC texts instead.
- **PDFs:** Text could not be extracted from gov.cn or CSET PDFs, because pypdf and poppler aren't installed. Where a fact was only in a PDF, I used the HTML pages and lowered confidence.

## Records (26)

### Instruments (18)
| id | title | status | main source |
|---|---|---|---|
| cn-algorithmic-recommendation-provisions-2021 | Provisions on the Management of Algorithmic Recommendations in Internet Information Services | in_force (2022-03-01) | gov.cn gazette, CAC Order No. 9 |
| cn-deep-synthesis-provisions-2022 | Provisions on the Administration of Deep Synthesis Internet Information Services | in_force (2023-01-10) | gov.cn gazette, Order No. 12 |
| cn-generative-ai-interim-measures-2023 | Interim Measures for the Management of Generative AI Services | in_force (2023-08-15) | gov.cn policy library, Order No. 15 |
| cn-ai-content-labelling-measures-2025 | Measures for Labeling AI-Generated Synthetic Content | in_force (2025-09-01) | CAC notice, 国信办通字〔2025〕2号 |
| cn-gb-45438-ai-content-labelling-standard-2025 | GB 45438-2025 labelling method (mandatory national standard) | in_force (2025-09-01) | openstd.samr.gov.cn |
| cn-gbt-45654-genai-security-requirements-2025 | GB/T 45654-2025 basic security requirements for generative AI services | voluntary | CSET translation pages |
| cn-pipl-2021 | Personal Information Protection Law (Arts 24, 55, 73 on automated decisions) | in_force (2021-11-01) | CAC full text |
| cn-cybersecurity-law-amendment-2025 | NPCSC Decision amending the Cybersecurity Law (new Art. 20 on AI) | in_force (2026-01-01) | Xinhua authorised release |
| cn-human-like-interactive-ai-measures-2026 | Interim Measures for Human-like Interactive AI Services | in_force (2026-07-15) | CAC, Order No. 21 |
| cn-internet-information-services-measures-revision-2026 | Internet Information Services Measures, revised draft (AI section) | in_progress | CAC second consultation, 2026-07-03 |
| cn-ai-agents-implementation-opinions-2026 | Implementation Opinions on AI Agents | voluntary | gov.cn, 2026-05-08 |
| cn-comprehensive-ai-law-2026 | Planned comprehensive AI law | proposed | State Council 2026 legislative plan; NPC Observer |
| cn-ai-plus-action-opinions-2025 | State Council Opinions on the "AI+" Action | voluntary | gov.cn, 国发〔2025〕11号 |
| cn-new-generation-ai-development-plan-2017 | New Generation AI Development Plan | voluntary | gov.cn, 国发〔2017〕35号 |
| cn-ai-safety-governance-framework-2025 | AI Safety Governance Framework 2.0 (1.0 in 2024) | voluntary | People's Daily; CAC; NCSTI |
| cn-sci-tech-ethics-review-measures-2023 | Measures for S&T Ethics Review (Trial) | in_force (2023-12-01) | gov.cn, 国科发监〔2023〕167号 |
| cn-ai-ethics-review-service-measures-2026 | AI S&T Ethics Review and Service Measures (Trial) | in_force (2026-03-20) | gov.cn; MOFCOM database |
| cn-government-ai-large-model-guidelines-2025 | Guidelines for AI Large Models in Government Affairs | voluntary | gov.cn, 2025-10-11 |

### Initiatives (6)
| id | title | status | main source |
|---|---|---|---|
| cn-east-data-west-computing-2022 | "East Data, West Computing" and national integrated computing network | active | NDRC Q&A 2022; gov.cn 发改数据〔2023〕1779号 |
| cn-ai-innovation-development-pilot-zones-2019 | MOST New Generation AI Innovation and Development Pilot Zones | active | MOST revised guidelines 2020 |
| cn-ai-innovation-application-pilot-zones-2019 | MIIT AI Innovation Application Pilot Zones (11) | active | CAC/Xinhua 2019; NCSTI 2022; Xinhua 2026 |
| cn-ai-education-primary-secondary-2025 | AI general education in primary and secondary schools | active | gov.cn, 2025-05-15 |
| cn-industry-high-quality-datasets-2026 | NDA action plan for high-quality industry datasets | active | NDA interpretation; 国数科基〔2026〕25号 |
| cn-new-generation-ai-major-project-2018 | S&T Innovation 2030 "New Generation AI" major project | active | MOST 2018 notice; NYU Shanghai 2026 call |

### Funds (2)
| id | title | amount | main source |
|---|---|---|---|
| cn-national-ai-industry-investment-fund-2025 | National AI Industry Investment Fund | CNY 60,000,000,000 | Shanghai government 2025-01-23; MIIT minister 2025-11-03 |
| cn-national-venture-capital-guidance-fund-2025 | National Venture Capital Guidance Fund (multi-sector, AI included) | CNY 100,000,000,000 | Xinhua briefing with MOF and NDRC, 2025-12-26 |

## Key status findings for 2025–2026
- **AI law:** There is no draft, and nothing has been introduced. The State Council's 2023 plan listed an "AI Law draft" for preparatory submission. Its 2026 plan (国办发〔2026〕14号) now calls for faster work on "comprehensive legislation for the healthy development of AI". NPC Observer reads the NPCSC 2026 plan as listing AI only as a research topic among its backup items, not as a bill. So the status is `proposed`.
- **New binding rules since 2025:** These are the Cybersecurity Law amendment (in force 2026-01-01), the human-like interactive AI measures (in force 2026-07-15) and the AI ethics review and service measures (dated 2026-03-20).
- **Pending:** The revised Internet Information Services Measures, whose second consultation closed on 2026-08-02. I found no report that it has been adopted.
- **Earlier rules:** I found no amendment or repeal of the 2021, 2022 or 2023 CAC rules.

## Uncertain points and choices
1. **GB/T 45654-2025 dates.** CSET says the standard was "formulated in April 2025" and published on 2025-06-30. A search summary credited CSET with issue on 2025-04-25 and effect on 2025-11-01, but I couldn't open the CSET PDF or find an openstd page. I recorded `passed: 2025-04`, left out `effective`, and set confidence to 0.65. I treated it as a recommended standard (`voluntary`, `binding: false`) because of the "/T" in its number.
2. **GB 45438-2025 issuer.** The openstd page shows the CAC as competent department, but it doesn't name the issuing bodies or say "mandatory" outright. I inferred mandatory status from the missing "/T" and the CAC measures' reference to mandatory national standards. I recorded the issuer as SAMR / SAC, which is standard practice.
3. **AI ethics review measures' effective date.** I couldn't read the effective clause in the PDF. The MOFCOM database lists the implementation date as 2026-03-20 and the status as in force. MIIT's own page reportedly shows a 成文日期 of 2026-03-30, which conflicts with gov.cn's 2026-03-20. I used gov.cn's date. Confidence 0.75.
4. **AI Safety Governance Framework.** Version 1.0 came from TC260 (2024-09-09). Version 2.0 was drafted by CNCERT under CAC guidance, not by TC260 (People's Daily, 2025-09-16). I made one record for version 2.0, with version 1.0 shown in the summary and status history.
5. **AI law record.** I set `binding: false` and `type: bill` because no text exists yet. The lead may prefer another convention for planned laws. I took the ID year (2026) from the current plan; it was first listed in 2023.
6. **Internet Information Services Measures draft.** I used `type: rule`, `binding: false` and `status: in_progress`. One media report (IT之家) says it is on the State Council 2026 plan, but the gov.cn plan excerpt I read didn't show it, so I left that claim out.
7. **National AI Industry Investment Fund amount.** The business registration figure reported in the media is 600.6亿元. Official sources (Shanghai government, MIIT minister) say 600亿元, so I used CNY 60,000,000,000. The stage is `allocated` (fund capitalised and operating); I found no disbursement figures.
8. **National Venture Capital Guidance Fund.** It isn't AI-only. AI is named as a target sector in a Xinhua report that cites a Ministry of Finance official via SCMP. I included it for the CNY 100 billion national fiscal contribution stated by the MOF official, with confidence 0.65. The "1 trillion yuan" figure is an expected total including leverage, so I didn't use it as the amount. The lead may drop this record if non-AI-specific funds are out of scope.
9. **MOST pilot zones.** I found no 2023–2026 official update on the number of zones or on the programme's current activity. Status `active` is inferred from the guidelines still being valid. Confidence 0.65. I didn't use the commonly cited "18 zones", because I couldn't source it.
10. **AI major project.** The 2026 call is evidenced only by a university research office page (NYU Shanghai), which links to MOST. Confidence 0.65.

## Left out
- **China Law Translate English titles and translations:** blocked (403). I used English titles from DigiChina, CSET and gov.cn where available, and my own translations otherwise. The human-like interactive AI title follows CLT's naming of the draft, as shown in search results.
- **Global AI Governance Initiative (2023), Global AI Governance Action Plan (2025) and the WAICO agreement** (ratification on the NPCSC agenda per NPC Observer, 2026-10-26): international or diplomatic instruments, so not national regulation. Flag for the lead if international items are wanted.
- **15th Five-Year Plan (March 2026) and the National Informatization 15th FYP plan (CAC, 2026-10-23):** broad plans; I didn't verify their AI sections.
- **"AI + energy" action plan (May 2026):** seen only in a secondary search summary, not verified.
- **New Generation AI Ethics Norms (2021, MOST governance committee):** not opened, so skipped. It is covered in substance by the 2023 and 2026 ethics measures.
- **TC260-003 (Feb 2024) technical document:** superseded in practice by GB/T 45654-2025 and mentioned in that record's summary.
- **Big Fund III (CNY 344 billion):** a semiconductor fund, not AI.
- **AI-specific central budget lines:** none found. The 2026 central budget science and technology total (CNY 426.42 billion) isn't AI-specific.
- **Computing vouchers (算力券):** mainly provincial or municipal. Leave for Phase 3.
- **National AI Open Innovation Platforms (MOST):** not researched, for time.

## Phase 3 notes (provincial and municipal)
- Beijing, Shanghai, Guangdong (Guangzhou, Shenzhen), Zhejiang (Hangzhou) and Jiangsu (Nanjing, Suzhou) host MOST pilot zones and/or MIIT pilot zones.
- There are local AI funds and computing vouchers. Search results mention a Guangzhou 20-billion-yuan AI fund-of-funds and a Beijing 50-billion-yuan government investment fund covering AI; both need verifying.
- Shanghai and Shenzhen have local AI regulations, which T-3xx should check.
