# Map home — mockup v2 spec

- **Status:** shown to the owner 2026-10-26; awaiting feedback.
- **Implements:** ADR-009 (right-side panel) and ADR-010 (dark default with light toggle). It also shows the state drill-down.
- The mockup was an inline chat widget, so it has no file of its own. This document is the reference for building it (T-102, T-103).

## Layout (desktop)

```
┌───────────────────────────────────────────────────────────────────────────┐
│ ▢ AI REGULATION TRACKER  map explorer initiatives funds streams updates  │
│                         [ search jurisdictions… ]  ● Synced …  ☾/☀       │
├────────────────────────────────────────────────┬──────────────────────────┤
│ All countries / India / Karnataka   [Regs][Init][Funds] │ Karnataka        │
│                                                │ State · India            │
│               map canvas                       │ ─ Instruments      3     │
│   (world markers  →  state view)               │ ─ Initiatives      6     │
│                                                │ ─ Funds allocated  ₹…    │
│                                                │ Latest changes           │
│                                                │  [Voluntary] title       │
│ legend: ● Proposed ● In progress …   [Ask the tracker] │  meta · source ↗  │
│                                                │ Open profile →           │
└────────────────────────────────────────────────┴──────────────────────────┘
```

- **Top bar:** logo, nav, search, sync stamp, theme toggle (moon/sun icon). The sync stamp's dot uses the in-force green.
- **Toolbar row above the map:** a breadcrumb (`All countries / India / <state>`, each level clickable) and the layer chips (Regulations, Initiatives, Funds; one active, white filled).
- **Legend strip below the map, not overlaid on it.** Overlays covered Brazil and South Africa markers in v1. The "Ask the tracker" launcher sits at the right end of the strip.
- **Right panel**, 236 px in the mockup and 400 px in the product (DESIGN §3.6). From top to bottom:
  - name (sans, 17 px) and level (mono, muted);
  - an action chip ("View states →" at country level);
  - stat rows (label left, value right);
  - "Latest changes" items (status pill, external-link icon, title, meta line);
  - "Open profile →".

## Interaction
1. **World view:** national markers (r 5.5 with a ring) and state markers (r 3.5), coloured by the most advanced status.
2. **Clicking India** drills down to the state view and the breadcrumb becomes `All countries / India`. Clicking any other country updates the panel; the mockup only drills into India, but the product drills into all five.
3. **Clicking a state** highlights it with a focus-coloured outline, shows its panel, and extends the breadcrumb.
4. **A state with no tracked items** shows an empty-state line instead of a list: "Nothing tracked here yet. The crawler checks this state's sources every day."
5. **The theme toggle** swaps the token set in place (tokens in DESIGN §3.2; light status colours below).

## State view in the mockup: tile grid
The mockup used a **tile-grid view** of India's 36 states and UTs (one 40×34 tile each, arranged roughly by geography) instead of drawn boundaries. Hand-drawn shapes can't meet the Survey of India requirement (ADR-005). The real product uses the SoI geometry (T-010).

**Proposal:** keep the tile grid in the product as a **"Grid" toggle** next to the map. It's the accessible, equal-size alternative: small UTs such as Chandigarh, Puducherry and Lakshadweep are as clickable as Rajasthan. It's also the basis of the list view (DESIGN §3.6). This needs the owner's OK.

India tile positions (`code, row, col`):
```
JK 0 2 | LA 0 3 | PB 1 2 | HP 1 3 | CH 2 1 | HR 2 2 | UK 2 3
RJ 3 1 | DL 3 2 | UP 3 3 | BR 3 4 | SK 3 5 | AS 3 6 | AR 3 7
GJ 4 1 | MP 4 2 | CG 4 3 | JH 4 4 | WB 4 5 | ML 4 6 | NL 4 7
DH 5 1 | MH 5 2 | TS 5 3 | OD 5 4 | TR 5 6 | MN 5 7
GA 6 1 | KA 6 2 | AP 6 3 | MZ 6 6
KL 7 2 | TN 7 3 | PY 7 4
LD 8 0 | AN 8 6
```
Tiles with data use the status colour at 22% fill with a solid outline. Tiles without data use `--none` fill with a `--bd` outline.

## Light-theme status colours (darker, for contrast on light backgrounds)
| Status | Dark | Light |
|---|---|---|
| Proposed | `#9AA0A6` | `#6B7178` |
| In progress | `#F2A33A` | `#B86E00` |
| Passed | `#4C9AFF` | `#2F6FD6` |
| In force | `#34C38F` | `#1F8A5B` |
| Voluntary | `#A78BFA` | `#7C5CD6` |

Other light tokens: `--bg #F7F7F5`, `--panel #FFFFFF`, `--bd #D9D8D2`, `--tx #1A1C1F`, `--mu #5F646B`, `--acc #1A1C1F` (the primary button becomes black on light), `--focus #1F6FD6`, `--none #ECEBE6`.

## Data in the mockup
Placeholder only. State items are generic ("State AI policy", etc.) and marked "sample". Never copy mockup figures into `data/`.
