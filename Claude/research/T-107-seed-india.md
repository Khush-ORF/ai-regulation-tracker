# T-107: National seed data for India

Agent: claude-opus (sub-agent) · Checked: 2026-10-26 · Statuses are as of 2026-10-26.

MeitY, PIB web pages, e-Gazette and the Union Budget site were not crawled (SOURCES.md §1). Main sources: IndiaAI (indiaai.gov.in, aikosh.indiaai.gov.in), PRS (bill track, Monthly Policy Review, DFG analysis 2026-27), RBI (press releases and draft text loaded fine through WebFetch), SEBI (consultation listing, board memo, circular page), ICMR, negd.gov.in, MyGov, plus law-firm and news coverage where no official page could be opened.

**Note for the lead (sources):** `static.pib.gov.in` backgrounder PDFs ("Transforming India with AI", 12 Oct 2025 and 30 Dec 2025) downloaded fine, unlike pib.gov.in pages. Several records rely on the 30 Dec 2025 PDF. It might be worth adding `static.pib.gov.in/WriteReadData/specificdocs/` to SOURCES.md as a PDF source (`pdf` method) after a robots.txt check. I didn't change SOURCES.md. To read PDFs I used `pypdf` in a throwaway venv in my scratchpad, not the project.

Totals: 15 instruments, 10 initiatives, 5 funds. All 30 files passed a local check of the `src/content.config.ts` constraints (enums, date formats, ID pattern, 40–120 words and 900 characters or fewer per summary, linked fund and parent IDs). That check was a scratch Python script; I ran no npm or astro.

## Records

### Instruments
| id | title | status | main source |
|---|---|---|---|
| in-dpdp-act-2023 | Digital Personal Data Protection Act, 2023 | in_force (phased) | PRS bill track; SCC Online (assent 11 Aug 2023); AZB (commencement) |
| in-dpdp-rules-2025 | Digital Personal Data Protection Rules, 2025 | in_force (phased) | PRS Monthly Policy Review Nov 2025; AZB; MyGov draft consultation |
| in-ai-governance-guidelines-2025 | India AI Governance Guidelines | voluntary | negd.gov.in press release; AZB |
| in-meity-ai-advisory-2024 | MeitY advisory on AI models and synthetic content (15 Mar 2024) | voluntary | JSA via Mondaq; Inc42 |
| in-it-rules-sgi-amendment-2026 | IT (Intermediary Guidelines and Digital Media Ethics Code) Amendment Rules, 2026 | in_force | Hogan Lovells; Khaitan & Co; Digital Policy Alert |
| in-it-rules-second-amendment-draft-2026 | Draft IT ... Second Amendment Rules, 2026 | in_progress | ThePrint (30 Mar 2026); S.S. Rana |
| in-meity-advisory-manipulated-content-2026 | MeitY advisory to SMIs on manipulated/synthetic content (8 Oct 2026) | voluntary | MediaNama; ThePrint |
| in-rbi-free-ai-framework-2025 | RBI FREE-AI Committee framework | voluntary | RBI press release 2025-2026/902; RBI report page |
| in-rbi-model-risk-guidance-draft-2026 | RBI Draft Guidance on Model Risk Management, 2026 | in_progress | RBI press release 2026-2027/528; RBI draft text |
| in-sebi-ai-tools-responsibility-2025 | SEBI amendments assigning responsibility for AI/ML tools | in_force | SEBI board memo (Dec 2024); AZB; Lexplosion |
| in-sebi-ai-ml-guidelines-consultation-2025 | SEBI consultation on responsible AI/ML use in securities markets | in_progress | SEBI listing (20 Jun 2025); Taxmann; Outlook Money (Aug 2026) |
| in-trai-ai-big-data-recommendations-2023 | TRAI recommendations on AI and Big Data in telecom | voluntary | MediaNama; IndiaAI news |
| in-icmr-ai-healthcare-guidelines-2023 | ICMR ethical guidelines for AI in biomedical research and healthcare | voluntary | ICMR page; BioSpectrum |
| in-eci-ai-content-advisory-2025 | ECI advisory on labelling AI content in campaigns (24 Oct 2025) | voluntary | Business Today; IndiaAI |
| in-national-strategy-ai-2018 | NITI Aayog National Strategy for AI (#AIForAll) discussion paper | voluntary | Paper PDF hosted on indiaai.gov.in; Analytics India Magazine |

### Initiatives
| id | title | status | main source |
|---|---|---|---|
| in-indiaai-mission-2024 | IndiaAI Mission | active | PIB backgrounder (30 Dec 2025); PRS DFG 2026-27; IndiaAI |
| in-indiaai-compute-2024 | IndiaAI Compute Capacity | active | IndiaAI compute pages; PIB; PRS; The Week (PTI) |
| in-aikosh-2025 | AIKosh (IndiaAI Datasets Platform) | active | aikosh.indiaai.gov.in; PIB; The Week (PTI) |
| in-indiaai-foundation-models-2025 | IndiaAI Foundation Models (Innovation Centre) | active | IndiaAI call for proposals; PIB (12 teams); Entrepreneur India |
| in-indiaai-futureskills-2024 | IndiaAI FutureSkills | active | IndiaAI FutureSkills hub; IndiaAI labs article; PIB (Oct 2025) |
| in-indiaai-startups-global-2025 | IndiaAI Startups Global (startup financing pillar) | active | IndiaAI (2025 and 2026 cohort pages); BioSpectrum; PIB |
| in-indiaai-safety-institute-2025 | IndiaAI Safety Institute (Safe & Trusted AI pillar) | active | IndiaAI call for partnerships; PIB |
| in-ai-coe-health-agri-cities-2024 | AI CoEs in healthcare, agriculture, sustainable cities | active | IndiaAI article (16 Oct 2024); PIB |
| in-ai-coe-education-2025 | Centre of Excellence in AI for Education (IIT Madras) | active | IndiaAI news; The Policy Edge (Lok Sabha reply 20 Jul 2026) |
| in-bhashini-2022 | Digital India BHASHINI | active | PIB backgrounder (30 Dec 2025) |

### Funds
| id | title | amount | main source |
|---|---|---|---|
| in-indiaai-mission-outlay-2024 | IndiaAI Mission approved outlay | ₹10,371.92 crore = 103,719,200,000 INR (allocated, 5 yrs) | PIB backgrounder; IndiaAI; PRS |
| in-indiaai-mission-be-2025-26 | IndiaAI Mission budget estimate 2025-26 | ₹2,000 crore = 20,000,000,000 INR (parent: outlay) | PRS DFG 2026-27 |
| in-indiaai-mission-be-2026-27 | IndiaAI Mission budget estimate 2026-27 | ₹1,000 crore = 10,000,000,000 INR (parent: outlay) | PRS DFG 2026-27 |
| in-ai-coe-fund-2023 | Three AI CoEs outlay, 2023-24 to 2027-28 | ₹990 crore = 9,900,000,000 INR | IndiaAI article (16 Oct 2024) |
| in-ai-coe-education-fund-2025 | CoE in AI for Education | ₹500 crore = 5,000,000,000 INR | IndiaAI news; The Policy Edge |

## Key status findings (please double-check)
- **DPDP is in force in phases.** Notifications dated 13 Nov 2025 brought in the definitions and Board provisions of the Act, and Rules 1, 2 and 17–21. Consent-manager provisions (s 6(9), s 27(1)(d), Rule 4) start 12 months later, around 13 Nov 2026. Most duties (Rules 3, 5–16, 22, 23) start around 13 May 2027. MeitY consulted industry in Jan–Feb 2026 on cutting the 18-month window to 12 months. As of 20 Oct 2026, dpdprules.org found no notified amendment to the commencement dates. The only 2026 instrument it lists is a Removal of Difficulties Order (S.O. 5458(E)), which changes wording in ss 9(1) and 10(2)(c)(ii). **Re-check in mid-November 2026**: if the compression is notified, the 13 Nov 2026 date becomes the main deadline.
- **The synthetic-content IT Rules amendment is in force** (notified 10 Feb 2026, in force 20 Feb 2026, G.S.R. 120(E) per secondary sources). I found no reported court stay.
- **The draft Second Amendment Rules, 2026 are still a draft** as far as I could find. The draft came out 30 Mar 2026, with further changes on 21 Apr 2026 (continuous SGI labels; MeitY advisories made part of due diligence). Comments closed 7 May 2026. I found no notification or official withdrawal; one undated, non-official page says "withdrawn". Confidence 0.5.
- **A new MeitY advisory came out on 8 Oct 2026** (File No. 16(2)/2026-CyberLaws). It asks platforms to label or contextualise manipulated, synthetic or misleading content. Its labelling request is wider than the Feb 2026 rules because it is not limited to audio-visual content.
- **RBI**: FREE-AI (Aug 2025) is a committee report, not a direction. RBI's draft model-risk guidance (24 Jun 2026, comments to 24 Jul 2026) covers AI/ML models. I found no final version.
- **SEBI**: The AI-responsibility amendments (notified 6 Feb 2025) are in force. The June 2025 AI/ML guidelines are not final. On 19 Aug 2026 the SEBI chairman said they would be issued "shortly" with a tiered approach. One search summary claimed a similar statement on 10 Oct 2026, but I couldn't confirm it.
- **The AI Governance Guidelines** are voluntary and recommend no standalone AI law. Search results say MeitY set up an "AI Governance and Economic Group (AIGEG)" in April 2026, chaired by the IT Minister. The Vikaspedia page returned only its title and the other source was a coaching-site summary, so I **left this out of the record**. It is worth verifying.

## Conflicts and choices
- **DPDP notification date:** AZB and dpdprules.org say the notifications are dated 13 Nov 2025. PRS says 14 Nov, which is probably the Gazette publication date. I used **2025-11-13**. Later milestones are given as 12, 13 or 14 Nov 2026 and 12, 13 or 14 May 2027 depending on the source. I put no future dates in the `dates` fields, only in the summaries, as "November 2026" and "May 2027".
- **IT Amendment Rules 2026 notification date:** Most sources say 10 Feb 2026, Khaitan says 16 Feb. I used **2026-02-10**.
- **Draft Second Amendment release:** ThePrint gives 30 Mar 2026 and others give 31 Mar. I used **2026-03-30**. ThePrint gave an original comment deadline of 14 Apr; the extended deadline of 7 May comes from S.S. Rana.
- **IndiaAI Mission outlay:** The PIB backgrounder and The Week (PTI) give ₹10,371.92 crore. IndiaAI rounds it to ₹10,372 crore, and PRS and the PIB headline say "over ₹10,300 crore". I used **₹10,371.92 crore**. The outlay fund's `fiscal_year` is set to **2023-24**, the year of Cabinet approval (7 Mar 2024). I left out `period` because no source gives the exact five fiscal years. The owner may prefer 2024-25.
- **AI Governance Guidelines date:** The press coverage and AZB give 5 Nov 2025, while the negd.gov.in post is dated 6 Nov. I used **2025-11-05**.
- **December 2023 deepfake advisory:** PIB-quoting sources give 26 Dec 2023 and JSA gives 23 Dec. I mention it only in the March 2024 advisory summary, without a date.
- **AIKosh counts:** The PIB release gives 5,500+ datasets and 251 models (Dec 2025). The AIKosh home page in Oct 2026 shows 16,081+ datasets and 372 models. The summary gives both, with dates.
- **CoE for Education:** One press report (HT via a law-firm archive, which I didn't open) quotes the IT Minister saying the ₹500 crore is part of the IndiaAI Mission allocation. The Ministry of Education reply puts it under MoE at IIT Madras. I set **no `parent`** and kept the claim out of the record.

## Conventions I used (please confirm)
- **`binding` for drafts:** I set `binding: true` for draft or consultation-stage instruments that would be binding once final (the IT Rules second amendment draft, the RBI model-risk draft, the SEBI AI/ML guidelines consultation). Their `status` is `in_progress`, so they are not shown as in force. If the schema intends `binding` to mean "legally binding today", these three should be `false`.
- **Advisories:** I recorded advisories as `voluntary` / `binding: false` (the MeitY Mar 2024 and Oct 2026 advisories, ECI Oct 2025). MeitY says intermediaries must comply under the IT Rules, and ECI says its advisory is "enforceable" under Article 324, but none of them is itself a statute or rule. ECI confidence is 0.65.
- **TRAI recommendations:** I recorded them as `advisory` / `voluntary` because they are statutory recommendations to government that were never acted on. `proposed` would also be defensible.
- **Stream for the AI Governance Guidelines:** I used `safety` only. Add other streams if the owner prefers.

## Left out, and why
- **Digital India Act:** It has not been introduced and there is no official draft, so there is nothing to record.
- **NITI Aayog Responsible AI papers** (Part 1, Feb 2021; Part 2, Aug 2021): niti.gov.in returned 403 and the secondary pages I tried were also blocked, so I couldn't open a source.
- **TEC 57050:2023 AI fairness assessment standard** (Telecommunication Engineering Centre, July 2023): I could only read search snippets because the pages returned 403.
- **SEBI 2019 AI/ML reporting circulars** (4 Jan 2019, 31 Jan 2019, 9 May 2019): these are confirmed by the SEBI board memo, but I folded them into the summary of `in-sebi-ai-tools-responsibility-2025` to stay within the target count. They could become a separate record.
- **IndiaAI Application Development Initiative** (30 applications approved by Jul 2025, per PIB): this one is sourced, but I left it out to keep initiatives at 10. It is easy to add from the PIB backgrounder.
- **IndiaAI Mission 2024-25 allocation:** The PRS chart shows a budget estimate of about ₹552 crore and actual spending of ₹19 crore. These are rounded chart labels, so I didn't record a fund.
- **Budget 2026-27 tax holiday to 2047 for foreign cloud firms using Indian data centres:** there was no stated amount and it is not specific to AI.
- **AIGEG (Apr 2026), the draft "techno-legal" AI framework, and the Oct 2026 SEBI statement:** none could be verified from a source I could open.
- **BharatGen's ₹988.6 crore and Sarvam AI's ~₹246.72 crore** support amounts: these come from secondary reports and IndiaAI allocation tables, not a clear official statement of a grant, so I didn't record funds for them.
- **AI Competency Framework / iGOT-AI (Mission Karmayogi)** and the **five National CoEs for Skilling (PM-SETU)**: they are mentioned by PIB, but I didn't research them enough. They are candidates for later.

## State-level notes for Phase 3 (no files created)
- The IndiaAI compute allocation table shows the **Karnataka AI Cell (Centre for e-Governance)** among large government GPU users. It is a possible lead for Karnataka.
- I didn't research state AI policies (Tamil Nadu, Telangana, Karnataka, etc.) for this task.
