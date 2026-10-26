# geo/ — boundary build (T-010)

Builds `public/geo/*.topojson` from the sources chosen in `Claude/research/T-006-india-boundaries.md`.

## Rebuild

1. `npm install` in this folder (installs mapshaper 0.6).
2. Download these files into `geo/sources/` and extract each one there (use 7-Zip for the `.7z`):
   - https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries_ind.zip
   - https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip
   - https://github.com/ramSeraph/indian_admin_boundaries/releases/download/states/SOI_States.geojsonl.7z
   - https://surveyofindia.gov.in/documents/Outline_of_India.zip (QA only)
3. `powershell -File build-geo.ps1`

`sources/`, `build/` and `node_modules/` are not committed.

## QA results (2026-10-26 build)

| Check | Result |
|---|---|
| Survey of India 2026 outline vs the 2023 state layer | Only small coastal pieces differ (largest 43 km², in the Sundarbans and Gulf of Kutch). No land-border change. |
| India units | 36 states and UTs plus 4 neutral SoI disputed inter-state areas |
| Neighbour area inside India's outline | 0 for the world backdrop and for China's admin-1 |
| Admin-1 counts | Brazil 27, South Africa 9, Korea 17, China 33 (31 mainland + Hong Kong + Macao; Natural Earth's Paracel Islands placeholder dropped) |
| Taiwan | Separate `TWN` feature in the world backdrop only |
| Sizes | india 189 KB, world 299 KB, admin1 43 KB |
| Visual checklist (T-006 §2.2) | Pending: needs a visual check of the northern tip, Aksai Chin, Arunachal, Sir Creek and the island UTs |
