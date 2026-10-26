# Map home — mockup v3 spec

> **Superseded in part by v4 (2026-10-26):** the flat map became an interactive orthographic **globe**. Everything below still applies except the flat-map items, which v4 replaces as follows:
> - **Globe:** drag to turn; scroll or pinch to zoom from ×0.8 to ×18; +/−/reset buttons; arrow keys turn it and +/− zoom.
> - **Fly-to:** clicking a country, a "Go to" chip or a search result spins and zooms the globe to it.
> - **Map furniture:** the double rim with 5° ticks replaces the neatline corners. A centre-coordinate and zoom readout plus a scale bar replace the corner coordinates.
> - **Reference box** is collapsible and starts closed when the map is narrower than 760 px.
> - **Data:** the boundary TopoJSON is inlined in the page, so there are no side-file fetches.
> - **Build:** `Claude/design/mockup-v4.src.html` is the source; `build-mockup.ps1` produces `mockup-v4.html`, which is published to the same artifact URL.
> - **Small countries:** any focus country under 34 px across (South Korea at most zooms, South Africa on phones) gets a locator ring with a status dot. Its label sits outside the rim as a callout, kept inside the frame. The ring is clickable.
> - **Robustness:** the frame re-measures with a ResizeObserver. On narrow screens it has a fixed height (`clamp(440px, 64vh, 720px)`). It shows a visible message if the map scripts fail to load.

- **Status:** published 2026-10-26 as a private artifact, https://claude.ai/artifact/RweA6buno5DQbqCGdHZbep; awaiting owner feedback.
- **Source:** `Claude/design/mockup-v3.html`, which loads `geo/*.topojson` from `public/geo/`.
- **Replaces** v2's dots-on-a-grid map, which had no geography, and its generic dark-UI look.

## Visual direction (proposed, ADR-016)
The design takes its look from the tracker's own subject, survey mapping and official records, instead of a generic SaaS dark mode.

- **Dark theme (default): a cyanotype print.** Prussian-blue ground (`--paper #0C1C2C`, `--sea #0F2437`), land in lighter blues, white ink.
- **Light theme: a Survey of India sheet.** Grey-blue water (`--sea #D3E0E1`), buff land (`--land #E8E3D1`, focus `#DCCD9C`), blue-black ink (`--ink #1C2A31`). Deliberately not the cream-and-terracotta look.
- **Map furniture:** a double-ruled neatline frame; live corner coordinates (e.g. `45°N 37°E`) that update on zoom; a scale bar computed from the projection; a "Reference" legend box in Spectral SC like a printed map's key.
- **Cartographic conventions:**
  - The boundary of India uses the dash-dot international-boundary line when zoomed in, and a solid thin line at world scale.
  - Country names are letter-spaced small caps; sea names are spaced italics (hydrography convention).
  - Funds use proportional circles, not a choropleth, because totals shouldn't be shaded by area.
- **Status as ink stamps.** Uppercase stamp marks, with a shape cue per status so it reads without colour:

  | Status | Border |
  |---|---|
  | Proposed | dotted |
  | In progress | dashed |
  | Passed | solid |
  | In force | double |
  | Voluntary | rounded pill |

- **Type:** Spectral (display, record titles, figures), Spectral SC (labels), Public Sans (UI), IBM Plex Mono (dates, codes, coordinates, sync stamp).
- **Register panel** (right side, 400 px):
  - Eyebrow with jurisdiction kind and official code (e.g. `State · India · LGD 29`, `Metropolitan city · South Korea · KR-29`).
  - Name, then a one-line status summary.
  - Tabs, a four-figure strip, and funds with source and period.
  - Dated change log with provenance (Reviewed = filled dot, Auto-extracted = hollow).
  - "Ask about …" opens the chat inside the panel, seeded with a question about that jurisdiction.

## Behaviour
- **World view:** the five countries are tinted by their strongest national status; other land is neutral. Taiwan is a separate, unlabelled, untracked shape (ADR-011).
- **Click a country:** the map zooms to it (850 ms; instant with reduced motion). Other focus countries are muted but still clickable. The view is centred clear of the Reference box.
- **States:** coloured by the active layer (Regulations status, Initiatives count, or Funds circles for India). The 4 SoI disputed inter-state areas stay neutral and not interactive (ADR-013).
- **Grid toggle** (India): the tile grid from v2, as an accessible, equal-size alternative.
- **Search:** country or state name, with autocomplete.
- **Theme toggle** in the header.

## Rendering
D3 v7 + topojson-client drawing SVG, with no basemap tiles (ADR-015, proposed). Strokes use `vector-effect: non-scaling-stroke`, so lines stay crisp at any zoom.

## Data in the mockup
All records are samples (marked in the footer). National items are real headline instruments but unverified; state items are generic placeholders. Never copy them into `data/`.
