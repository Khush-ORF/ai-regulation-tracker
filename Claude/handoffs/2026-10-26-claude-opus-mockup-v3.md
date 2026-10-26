# Hand-off: boundary build (T-010) and mockup v3

- **Date:** 2026-10-26
- **Agent:** claude-opus
- **Tasks touched:** T-003, T-010, T-011 (new)

## Done
- **T-010:**
  - `geo/build-geo.ps1` builds `public/geo/{india,world,admin1}.topojson` from SoI and Natural Earth (India POV), following the T-006 recipe. Natural Earth's Paracel Islands placeholder (`CN-X01~`) is dropped.
  - Automated QA passed (see `geo/README.md`). `public/geo/DATA-LICENSE.md` is written (ADR-013).
- **Mockup v3** is published as a private artifact (https://claude.ai/artifact/RweA6buno5DQbqCGdHZbep). It has a real D3 map, drill-down, Grid view, search, layers, the register panel and in-panel chat. Verified with headless Edge screenshots (world, India drill-down, light theme).
- Proposed ADR-015 (D3 + SVG instead of MapLibre) and ADR-016 (survey-sheet/cyanotype visual direction).

## Not done / next step
- Owner feedback on v3. If accepted, update DESIGN §3 tokens and fonts to match `Claude/design/mockup-v3.md`.
- T-010: close-up visual check of Sir Creek, the northern tip and the island UTs.
- T-011: git isn't installed; it's needed before the repo is created (T-101).

## Watch out for
- PowerShell 5.1 + mapshaper: call `node node_modules\mapshaper\bin\mapshaper` directly. `npx` inside a pipeline loses the exit code. Quote comma lists such as `"name,lgd,disputed"`.
- The built-in browser pane isn't signed in to claude.ai, so artifacts can't be checked there. Use the local preview method instead: python http.server plus headless Edge `--screenshot`.
- The mockup's national items are real headline instruments but unverified. State items are placeholders.

## Files changed
- New: `geo/build-geo.ps1`, `geo/README.md`, `geo/package.json`, `public/geo/*.topojson`, `public/geo/DATA-LICENSE.md`, `.gitignore`, `Claude/design/mockup-v3.html`, `Claude/design/mockup-v3.md`
- Updated: `Claude/DECISIONS.md`, `Claude/TASKS.md`
