# Global South AI Regulation Tracker

AI regulation, government AI initiatives and public AI funding in **India, Brazil, South Africa, South Korea and China**, at national and state level, shown on an interactive globe.

- **Free to run:** a static site on GitHub Pages, built and updated by GitHub Actions.
- **Data lives in git:** one JSON file per record in `data/`. The schema in `src/content.config.ts` checks every record on each build.
- **Updates come by pull request:** automated collection from official sources starts in Phase 2.

## Run locally

```bash
npm install
npm run dev
```

Open http://localhost:4321. `npm run build` writes the static site to `dist/`.

## Data pipeline

```bash
npm run crawl     # read the sources in pipeline/sources.json, write pipeline/out/candidates.json
npm run extract   # needs GITHUB_TOKEN (GitHub Models): turn candidates into records in data/
npm run audit     # coverage audit against OECD.AI, written to pipeline/out/audit.md
```

These run daily (`pipeline.yml`) and monthly (`audit.yml`) on GitHub Actions. The design is in `Claude/PIPELINE.md`.

## Project layout

| Path | What it holds |
|---|---|
| `data/` | Records: `instruments/`, `initiatives/`, `funds/` |
| `src/content.config.ts` | Record schema (the single source of truth) |
| `src/pages/` | Globe home, country profiles, explorer, about |
| `src/scripts/globe.js` | The interactive globe (D3) |
| `public/geo/` | Boundary files. See `public/geo/DATA-LICENSE.md`; India is Survey of India data |
| `geo/` | Script that rebuilds the boundary files |
| `Claude/` | Shared planning workspace for the people and AI agents working on the project |
| `.github/workflows/` | Deploy and validate workflows |

## Licences

Code: to be chosen by the owner. The map data in `public/geo/` has its own terms; see `public/geo/DATA-LICENSE.md`.
