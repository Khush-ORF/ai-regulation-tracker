# Open questions for the owner

Answer inline under each question. An agent will then record the answer in `DECISIONS.md` and mark the question resolved.

| # | Question | Default if unanswered | Status |
|---|---|---|---|
| Q1 | Is the Key Streams taxonomy in DESIGN §4 right? What should be added, removed or renamed? | Use the draft list | **resolved: keep the draft list of 9 (owner, 2026-10-26)** |
| Q2 | Is the site public, or internal to the organisation? | Public (needed for free GitHub Pages and Actions) | **resolved: public (owner, 2026-10-26)** |
| Q3 | Is the interface in English only, with original-language titles shown alongside? | Yes | **resolved: yes (owner, 2026-10-26)** |
| Q4 | Auto-merge policy: is "auto-merge high-confidence, non-money; review the rest" acceptable? | Yes | **resolved: yes (ADR-004)** |
| Q5 | What are the repo name and site name? | `ai-regulation-tracker` / "AI Regulation Tracker" | **resolved: repo `ai-regulation-tracker`; site renamed "Global South AI Regulation Tracker" (owner, 2026-10-26; ADR-018).** The GitHub account or organisation that owns the repo is still to be named when the repo is created (T-101) |
| Q6 | Is the priority state list in SOURCES §6 right? | Use the draft list | **resolved: keep the draft list (owner, 2026-10-26)** |
| Q7 | How should Taiwan and other disputed areas appear on the China map? | — | **resolved (owner, 2026-10-26):** India uses the official Survey of India boundaries (ADR-005). Taiwan is drawn as a separate territory with its own outline (including Penghu, Kinmen and Matsu), in neutral grey, unlabelled and not tracked (ADR-011) |
| Q8 | Is one free Cloudflare Worker acceptable for the chatbot, given it's the only non-GitHub piece? | Yes | **resolved: yes (ADR-006)** |
| Q9 | India boundary licence: Survey of India's terms allow website display but bar commercial use and sharing with foreign entities, and the public repo makes the files downloadable. Should we (a) proceed with SoI credit and a non-commercial data note, (b) do (a) and also email SoI for written confirmation, or (c) use DataMeet's CC BY 4.0 copy, which has the same SoI geometry underneath? | (b) | **resolved: (a), SoI credit plus a non-commercial data note; no email to SoI (owner, 2026-10-26; ADR-013)** |
| Q10 | SoI's state layer has 4 small "disputed" inter-state areas (MP/Gujarat, MP/Rajasthan, Rajasthan/Gujarat, WB/Bihar/Jharkhand). Keep them as neutral, untracked areas, or merge them into a neighbouring state? | Keep them neutral (faithful to SoI) | **resolved: keep them as neutral, untracked areas (owner, 2026-10-26; ADR-013)** |
| Q11 | The mirrored state layer is from late 2023. If QA shows more than slivers of difference from SoI's 2026 outline, the current file needs a free SoI portal account, created by you. OK? | Only if QA fails | open |
| Q12 | MeitY, PIB and the Union Budget site block our honest bot (Akamai 403). We won't disguise the crawler. Options: (a) rely on the replacement sources (IndiaAI, Sansad, PRS, RBI, SEBI, TRAI), (b) also write to MeitY and PIB asking them to allow the bot, (c) once a year you save the Budget PDFs by hand (this breaks "no manual data"). | (a), plus (b) if you're willing | **resolved: (a), replacement sources only; no outreach to MeitY or PIB, and no manual Budget downloads (owner, 2026-10-26; ADR-014)** |
| Q13 | Korean sources need free keys that only you can register: the National Assembly Open API key (straightforward) and the law.go.kr `OC` ID (its form asks for a server IP). OK to register them later, in Phase 2? | Yes, in Phase 2 | open |
