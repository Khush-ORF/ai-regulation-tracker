# T-006: Boundary data for the tracker map (India per Survey of India, admin-1 for 5 countries, world backdrop)

- Researched: 2026-10-26 by a claude-opus research subagent
- Scope: free, redistributable vector boundaries for a static MapLibre GL JS map served from GitHub Pages
- Hard requirement: India's boundaries follow the official Survey of India (SoI) depiction. All of J&K and Ladakh, including PoK, Gilgit-Baltistan, Aksai Chin and the Shaksgam valley, plus all of Arunachal Pradesh, lie inside India, and no neighbour polygon overlaps them.

## How sure each claim is

| Tag | Meaning |
|---|---|
| **[V]** | Verified this session by reading the file itself: the attribute table (.dbf), the shapefile index or header bounding boxes, the PMTiles metadata, the ZIP central directory, or an official page I fetched. |
| **[V-img]** | Verified by eye from a small preview or coverage image. |
| **[I]** | Inferred: reasoned from verified facts or from documentation, but not checked against the geometry. |
| **[U]** | Unverified or unknown. |

**How I checked without downloading large geometry.** I fetched only small files: .dbf attribute tables, .shx indexes, a few 44-byte record headers fetched by HTTP Range, PMTiles headers and metadata, and ZIP directories. Nothing I downloaded was executed. The small files are in `C:\Users\WiN\AppData\Local\Temp\claude\E--AI-Regulatory-Tracker\604f3499-be63-406f-969d-8ad1b5dc4e0f\scratchpad\t006-downloads\`. None of the mapshaper commands below has been run. They are a recipe, and file sizes must be checked when they are first run.

---

## 1. Candidate evaluation

### 1.1 Natural Earth (NE) v5.1.1, "point of view" (POV) admin-0 countries, India version (`_ind`)

| Item | Finding |
|---|---|
| What exists | Ready-made POV country files at **1:10m only**. There are 31 to 33 viewpoints: arg, bdg, bra, chn, deu, egy, esp, fra, gbr, grc, idn, **ind**, iso, isr, ita, jpn, kor, mar, nep, nld, pak, pol, prt, pse, rus, sau, swe, tlc, tur, twn, ukr, usa, vnm. [V] (download page and CHANGELOG) The 50m and 110m folders have **no** POV country files. [V] (GitHub `50m_cultural` listing) |
| Admin-1 POV? | **No ready-made admin-1 POV file.** v5.0.x added `fclass_*` POV properties to admin-1 lines and label points only. [V] (CHANGELOG) Admin-1 polygons stay de facto. |
| Kashmir | In NE's disputed-areas table, the column `ADM0_A3_IN` = `IND` for **Gilgit-Baltistan, Azad Kashmir, Siachen Glacier**, Jammu and Kashmir, and Junagadh and Manavadar. [V] (`ne_10m_admin_0_disputed_areas.dbf`) In the `_ind` file, India's bounding box reaches **37.054°N**. In the default de facto file it stops at 35.495°N. Pakistan's eastern edge moves back from 77.05°E to 75.36°E. [V] (record bounding boxes from .shx and .shp) |
| Aksai Chin and Shaksgam | `ADM0_A3_IN` = `IND` for **Aksai Chin** and **"Shaksam Valley"** (the Trans-Karakoram tract). [V] So in the India view, China loses both areas. [I] I did not compare China's polygon line by line. |
| Arunachal | Arunachal Pradesh, Demchok, the Samdu, Tirpani and Bara Hotii valleys, and "Near Om Parvat" (Kalapani) all = `IND`. [V] De facto NE already places Arunachal in India. [V] |
| Taiwan | In the `_ind` file, Taiwan is its own feature (`ADM0_A3=TWN`, `TYPE="Sovereign country"`). Hong Kong (`HKG`) and Macao (`MAC`) are separate features with sovereign = China. [V] **Strip the `TYPE`/`SOVEREIGNT` attributes before publishing** so the site's data makes no sovereignty claim. |
| Currency | v5.1.1. NE's last release is v5.2.0 (2022-06-02), and the POV zips are dated 2022-05-13 on the CDN. [V] National borders in South Asia have not changed since, so this is acceptable. [I] |
| Format and size | Zipped shapefile, **4.9 MB** (`.shp` 8.8 MB). The same data is on GitHub as a 13.2 MB GeoJSON. [V] |
| Licence | **Public domain.** The terms say "Crediting the authors is unnecessary". The optional credit line is "Made with Natural Earth. Free vector and raster map data @ naturalearthdata.com." [V] |
| URL | `https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries_ind.zip`, which returned HTTP 200 [V]. The website link is `https://www.naturalearthdata.com/http//www.naturalearthdata.com/download/10m/cultural/ne_10m_admin_0_countries_ind.zip`. |
| Pitfalls | (a) The data is 10m only, so it must be heavily simplified. (b) NE's India outline is close to SoI but is **not SoI data**: the line through Aksai Chin and the northern tip differ in detail. [I] Use it for neighbours only, never as India's own outline. (c) The IND view also encodes other Government of India positions, for example Kosovo not recognised. That is consistent with the MEA's positions, but be aware of it. [V] (CHANGELOG) |

**Verdict: best backdrop source.** India's claims are already applied at source, and Taiwan is separate.

### 1.2 Natural Earth admin-1 (`ne_10m_admin_1_states_provinces`, `ne_50m_admin_1_states_provinces`)

| Item | Finding |
|---|---|
| Coverage at 50m | 294 units in total. **IND 36, CHN 31, BRA 27, ZAF 9.** There is **no KOR, TWN, HKG or MAC.** [V] (50m .dbf) |
| Coverage at 10m | Worldwide, including South Korea. [V] (geoBoundaries' KOR ADM1 is taken from NE and has 17 units, including Sejong.) I could not check China's or Korea's unit counts in the 10m attribute table (15 MB), so 31 and 17 are [I]. |
| India | At 50m the 36 units are current: J&K and Ladakh are separate, and "Dadra and Nagar Haveli and Daman and Diu" is merged. [V] But the boundaries are **de facto**: Ladakh tops out at 35.50°N and 79.50°E, and J&K at 34.77°N. [V] So PoK, Gilgit-Baltistan and Aksai Chin are **not** included. **Not compliant; do not use for India.** |
| China | The 31 mainland units carry NE names such as `Xizang` and `Inner Mongol`. [V] Taiwan is **not** among China's admin-1 units. [V] Xinjiang reaches south to 34.34°N, so **Aksai Chin sits inside Xinjiang**. [V] (bounding box) It must be erased using India's outline. Hong Kong and Macao are separate admin-0 units in NE. [V] |
| Brazil, South Africa | 27 and 9 units, current. [V] (counts) South Africa's provinces were updated "for recent constitutional changes" in v5.0.0. [V] (CHANGELOG) |
| Licence | Public domain. [V] |
| URLs and size | `https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip` (**14.9 MB**) [V]. `https://naciscdn.org/naturalearth/50m/cultural/ne_50m_admin_1_states_provinces.zip` (0.9 MB) [V]. |
| Pitfalls | Korea exists only at 10m. China's de facto Aksai Chin needs clipping. The Korean names are older forms, for example "Gangwon" rather than "Gangwon State" (2023) and "North Jeolla" rather than "Jeonbuk State" (2024). Only the names changed, not the boundaries [I], so rename in the app if needed. |

**Verdict: best source for BRA, ZAF, KOR and CHN admin-1.** It is public domain and comes from the same lineage as the backdrop, so edges line up. Use 10m for all four countries for consistency.

### 1.3 Survey of India: national outline, `Outline_of_India.zip` (surveyofindia.gov.in)

| Item | Finding |
|---|---|
| Where | The "Outline Maps of India" page lists "International Boundary Vector data (Outline of India)". `https://surveyofindia.gov.in/documents/Outline_of_India.zip` returned HTTP 200, 7,513,409 bytes, last modified 2026-02-13. [V] |
| Contents | A single-feature polygon shapefile, `.shp` 10.1 MB uncompressed. Fields `Country`="India", `Area`, `Country_Co`=91. Projection is **Lambert Conformal Conic on WGS84** (central meridian 80°E, standard parallels 12.47°N and 35.17°N, latitude of origin 24°N, false easting and northing 4,000,000 m), **not lat/lon**. [V] (ZIP directory, `.prj`, `.dbf`) |
| Lineage | The ESRI metadata shows it is a **dissolve of SoI's "State Boundary" layer from "ABDB_2.0"** (Administrative Boundary Database 2.0), made 2026-02-13. [V] (`.shp.xml`) The page calls it "generalized at 1:16m", but at 10 MB the file looks more detailed than that. [I] |
| Compliance | It is SoI's own line, so it is compliant by definition. The projected bounding box (y from about 2.18 to 5.44 million m) equals roughly 6.7°N to 37.1°N, which is consistent with Gilgit-Baltistan being included. [I] (converted by hand) |
| Terms | SoI's note `https://surveyofindia.gov.in/documents/ibd-vectorformat.pdf` says the outline "can be downloaded for Individual, Internal, Educational, Research, **website purposes**" and that "No commercial usage will be permitted", with IPR held by SoI. [V] The site's general Copyright Policy needs written permission to reproduce *website material* and asks for the credit "Source: Survey of India, Government of India". [V] |
| Pitfalls | Reproject with `-proj wgs84`. The licence is **not open**: no explicit right to redistribute derivatives, and no commercial use. It holds no state boundaries. The `Area` field reads 3.179 million km², below India's official 3.287 million km². That is unexplained but does not affect this use. [V/U] |

**Verdict: the authoritative outline.** Use it for checking. It is also the fallback outline and erase mask.

### 1.4 Survey of India Online Maps Portal (onlinemaps.surveyofindia.gov.in): Administrative Boundary Database

| Item | Finding |
|---|---|
| Products | Four products at ₹0 (free), all "1:1M sheet", all shapefile [V]: OVSF/1M/7 *Entire country up to district level with HQ*; OVSF/1M/6 *up to taluk level*; OVSF/1M/9 and OVSF/1M/8 *per state*. A village boundary database (OVSF/-/10) is also free. No dates or versions are shown. [V] |
| Access | You need a portal account and must place a ₹0 order through the cart. [V] (OSM wiki and cart page) I did not download it. Its layer list and date are **[U]**. |
| Terms (cart page) | You agree to the 15 Feb 2021 Geospatial Guidelines and NGP 2022. You agree to "provide due attribution to the Survey of India", **"not to share the downloaded data with any foreign individual or foreign entity"** except as the law permits, not to sell it, and not to republish it under another brand for commercial use. The data is provided as-is. [V] |
| Policy context | The 2021 Guidelines, as quoted in secondary sources, say that for political maps of India "SoI published maps or SoI digital boundary data are the standard to be used, which shall be made easily downloadable for free and their digital display and printing shall be permissible. Others may publish such maps that adhere to these standards." [V-secondary] I could not open the DST PDF (HTTP 404). The rules for foreign entities apply only to data finer than **1 m horizontal and 3 m vertical** accuracy. [V-secondary] A simplified web map file is far coarser than that. [I] |
| Pitfalls | The account and order flow is not scriptable. The no-foreign-sharing clause sits awkwardly with a public GitHub repository. The licence is not an open licence. |

### 1.5 ramSeraph `indian_admin_boundaries`: a mirror of the SoI, LGD and Bhuvan state layers (DataMeet community)

Release `states`, published 2023-12-11: `https://github.com/ramSeraph/indian_admin_boundaries/releases/tag/states` [V]

| File | Source | Units | Compliance | Size | Notes |
|---|---|---|---|---|---|
| `SOI_States.geojsonl.7z` | SoI Online Maps Portal (Digital_Product_Show) | **40 features: 36 states/UTs + 4 inter-state "DISPUTED" polygons**. These are MP & Gujarat, MP & Rajasthan, Rajasthan & Gujarat, and WB, Bihar & Jharkhand. [V] (PMTiles tilestats) | J&K and Ladakh are separate. DNH & DD is merged. [V] Bounds are 68.18–97.41°E and 6.75–**37.09°N**. [V] The coverage image shows the full SoI shape across the north, including Aksai Chin. [V-img] | 9.1 MB 7z. Also `.parquet` (19 MB) and `.pmtiles` (5.6 MB). [V] | Fields: `STATE` (with diacritics, e.g. "ARUNĀCHAL PRADESH"), `STATE_C` (plain upper case), `State_LGD` (0 for the disputed polygons), `Shape_Area`, `Shape_Leng`. [V] |
| `LGD_States.geojsonl.7z` | LGD/BharatMaps (NIC) map service | **Exactly 36.** `STNAME`, `STCODE11`, `State_LGD`. [V] | Same bounds (37.09°N). [V] The coverage image shows the full shape across the north. [V-img] | 6.5 MB 7z | The maintainer serves these tiles under a `/not-so-open/` path, which signals unclear upstream rights. [V] |
| `bhuvan_states.geojsonl.7z` | Bhuvan Panchayat (NRSC SIS-DP) | not checked | not checked | 1.3 MB | Also under `/not-so-open/`. [V] |

- Licence as stated: "CC0 1.0 but attribute datameet and the original government source where possible". [V] (release notes and `DATA_LICENSE.md`)
- **Caveat:** a CC0 label from the person who repackaged the data cannot waive SoI's rights. The SoI-derived layer is still subject to SoI's terms (attribution, non-commercial, the guideline clause allowing "digital display"). [I]
- Download: `https://github.com/ramSeraph/indian_admin_boundaries/releases/download/states/SOI_States.geojsonl.7z` [V]
- Pitfalls:
  - You need 7-Zip, and you must wrap the newline-delimited GeoJSON into a FeatureCollection.
  - The four disputed inter-state polygons need a styling decision.
  - It is the ABDB as of late 2023, older than the 2026 ABDB 2.0 outline. No state or UT reorganisation is known since January 2020 [I], but small line edits between versions are possible. [U]

**Verdict: the most practical route to SoI's own state boundaries**, with SoI attribution.

### 1.6 DataMeet `datameet/maps`

| Item | Finding |
|---|---|
| States file | `States/Admin2.shp` has **36 features, one field `ST_NM`**, in WGS84. [V] Names include "Jammu & Kashmir", "Ladakh", and "Dadra and Nagar Haveli and Daman and Diu". [V] Commits: "Updated the States & UT to status as per Jan 2020" (2020-05-06), "Updated Ladhak & J&K boundry as per latest SOI Map" (2021-08-24), "Merged the two Ladhak features" (2021-10-25). [V] |
| Compliance | Overall bounding box is 68.09–97.41°E and 6.75–**37.08°N**. [V] **Ladakh** runs 72.53–**80.33°E** and 32.34–**37.08°N**, so it includes Gilgit-Baltistan and Aksai Chin. **J&K** runs 73.39–76.78°E, so it includes Azad Kashmir (PoK). **Arunachal** reaches 26.65–29.46°N. [V] (per-record bounding boxes) This matches SoI's post-2019 map. [I] |
| Country files | `Country/india-composite.geojson`: CC0, stitched together from the US LSIB, an HDX dataset for Pakistan, and NE. `india-soi.geojson`: **CC BY-SA 2.5 / ODbL**, so ShareAlike applies; avoid it. `india-osm.geojson`: ODbL. `india-land-simplified.geojson`: 44 KB. [V] (`Country/README.md`) |
| Licence | The README says datasets are "**CC BY 4.0**" unless stated otherwise (changed from the older licence on 2021-01-04). The repository's LICENSE file is MIT, for code. [V] The CC BY 2.5 India licence quoted by geoBoundaries is out of date. [V] |
| Attribution | "India boundaries by DataMeet India community (CC BY 4.0)", with links to the dataset and datameet.org. [V] |
| Size and URL | `.shp` 17.1 MB. `https://github.com/datameet/maps/tree/master/States` (raw: `https://raw.githubusercontent.com/datameet/maps/master/States/Admin2.shp` plus .dbf, .shx, .prj, .cpg). [V] Last commit to the repository: 2022-05-11. [V] |
| Pitfalls | Its provenance mixes Census 2011 and SoI. DataMeet's right to relicense SoI-derived lines under CC BY is not established, so the same SoI question sits underneath. [I] It has no LGD codes. The line may differ slightly from the 2026 ABDB 2.0. [U] |

**Verdict: the best fallback** if the owner wants a file with an explicit open licence. Its geometry is SoI-aligned and its 36 units are current.

### 1.7 geoBoundaries (gbOpen, build Dec 2023, commit `9469f09`)

All values below come from the geoBoundaries API. [V]

| ISO | Units | Year shown | Source | Licence | Simplified GeoJSON | Notes |
|---|---|---|---|---|---|---|
| BRA | 27 | 2006 | geoBoundaries, Wikimedia Commons | CC BY 2.5 Generic | 1.48 MB | OK |
| ZAF | 9 | 2020 | OCHA ROSEA, Municipal Demarcation Board | CC BY 3.0 IGO | 0.72 MB | OK |
| KOR | 17 | 2021 | **Natural Earth** | Public domain | 0.19 MB | The same data as NE |
| CHN | **34** | 2019 | geoBoundaries, Wikimedia Commons | Public domain | 0.26 MB | Very coarse (393 vertices at most per unit). **Includes "Taiwan Province".** [V] Guangdong is **mislabelled "Guangzhou Province"**. [V] `shapeISO` is just "CHN" for every unit. [V] Tibet reaches south to **26.89°N** between 91.6 and 97.4°E, and Xinjiang reaches 34.36°N between 78 and 80.5°E. [V] So it draws **China's claim over Arunachal and includes Aksai Chin**. [I] **Reject.** |
| IND | 36 | 2011 | DataMeet, Election Commission of India | CC BY 2.5 IN | 5.1 MB | The preview shows the SoI shape across the north. [V-img] It is a copy of DataMeet, so use DataMeet directly. I did not check unit names. [U] |
| TWN | 22 | 2017 | OpenStreetMap | ODbL | n/a | Not needed |
| HKG, MAC | none | | | | | The API returns 404. [V] |

Download pattern: `https://github.com/wmgeolab/geoBoundaries/raw/9469f09/releaseData/gbOpen/<ISO>/ADM1/geoBoundaries-<ISO>-ADM1_simplified.geojson`. Citation: Runfola, D. et al. (2020), *geoBoundaries: A global database of political administrative boundaries*, PLoS ONE 15(4): e0231866.

**Verdict: a fallback for BRA and ZAF only.** NE is preferred for a single, public-domain source.

### 1.8 Others checked

- **Bhuvan (ISRO/NRSC).** The open-data page offers imagery and DEM products and a "Free GIS Data" tab. I found no admin-boundary download with a redistribution licence. [V] (page fetch) The older NOEDA terms were single-user, non-transferable, and excluded internet hosting (OSM wiki, 2015). [V-secondary] The Bhuvan Panchayat state layer is only reachable via a mirror, under a "not-so-open" label (see 1.5). **Not suitable.**
- **LGD (Local Government Directory).** LGD is the authority for **codes and names**, not geometry. Its geometry is on NIC's BharatMaps service, with unclear terms (see 1.5). Use `State_LGD` codes as stable join keys. [I]
- **data.gov.in.** I found no state-boundary polygon dataset under GODL-India. The search was not exhaustive. [U]
- **udit-001/india-maps-data** (TopoJSON per state) has **no licence** and says its data came from "publicly available sources ... for personal usage". [V] **AnujTiwari/India-State-and-Country-Shapefile-Updated-Jan-2020** also has **no licence**. [V] **Reject both.**

---

## 2. Recommended build recipe

### 2.1 Choices

| Layer | Source | Why |
|---|---|---|
| **India states/UTs + national outline** | **SoI ABDB states**: `SOI_States.geojsonl.7z` from the ramSeraph mirror, credited to SoI. The national outline is a **dissolve of the same layer**, so outline and states share arcs exactly. | It is SoI's own data, and the 36 units are current. **QA:** compare with SoI's `Outline_of_India.zip` (2026); only slivers should differ. **Fallback** (owner's choice): DataMeet `States/Admin2` (CC BY 4.0), same recipe. |
| **BRA, ZAF, KOR, CHN admin-1** | **NE 10m admin-1**, filtered to those four, with **China erased by India's outline**. **Hong Kong and Macao** come from the NE `_ind` admin-0 features `HKG` and `MAC`, coded `CN-HK` and `CN-MO`. | Public domain, the same lineage as the backdrop, and Taiwan is not part of China's units. |
| **World backdrop** | **NE 10m admin-0 `_ind`**, minus India, with **every neighbour erased by India's outline**. India's own outline is then added as the `IND` feature. | India's claims are applied at source. The erase is a second safeguard and also removes small mismatches between NE's line and SoI's. |

**How Taiwan comes out.** Taiwan is a separate polygon, `iso3=TWN`, in the backdrop only. Strip all names and attributes except `iso3` (no `TYPE` or `SOVEREIGNT`), draw it in the same faint style as other countries, and give it no label and no hover. It is not in the China admin-1 layer: NE has 31 mainland units and Taiwan is not among them. HK and MO are tracked units within China's 33.

**Layer order in MapLibre.** Ocean background, then the world backdrop fill, then the admin-1 fills for BRA, ZAF, KOR and CHN, then the India states fill, then the India outline line (about 1 to 1.5 px). Hairline gaps or overlaps left by simplifying each file separately are hidden by this order and by the outline stroke.

### 2.2 Commands (Windows PowerShell; mapshaper 0.6.x; **not yet run**)

Notes for PowerShell 5.1: expressions sit in **double quotes**, with **single-quoted** JavaScript strings inside, because 5.1 strips embedded double quotes when calling native programs. None of the expressions uses `$`. The backtick (`` ` ``) continues a line.

```powershell
npm install -g mapshaper            # one-time, owner's machine
mkdir build; cd build
# Download and unzip into build\ :
#   https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_0_countries_ind.zip
#   https://naciscdn.org/naturalearth/10m/cultural/ne_10m_admin_1_states_provinces.zip
#   https://github.com/ramSeraph/indian_admin_boundaries/releases/download/states/SOI_States.geojsonl.7z   (7-Zip: 7z x ...)
#   https://surveyofindia.gov.in/documents/Outline_of_India.zip   (QA only)

# 0. Wrap newline-delimited GeoJSON into a FeatureCollection (or: ogr2ogr -f GeoJSON SOI_States.geojson SOI_States.geojsonl)
$lines = [IO.File]::ReadAllLines("$PWD\SOI_States.geojsonl") | Where-Object { $_.Trim() }
[IO.File]::WriteAllText("$PWD\SOI_States.geojson", '{"type":"FeatureCollection","features":[' + ($lines -join ',') + ']}', (New-Object Text.UTF8Encoding $false))

# 1. India: states + dissolved outline (shared arcs), plus an unsimplified outline used as the erase mask
mapshaper -i SOI_States.geojson name=states `
  -clean `
  -each "name=STATE_C; lgd=State_LGD; disputed=STATE_C.indexOf('DISPUTED')===0" `
  -filter-fields name,lgd,disputed `
  -dissolve + name=india_outline `
  -each "iso3='IND'" target=india_outline `
  -o india_outline_full.shp target=india_outline `
  -simplify 2% weighted keep-shapes target=states,india_outline `
  -o format=topojson quantization=100000 target=states,india_outline india.topojson

# 1b. QA against SoI's own 2026 outline (inspect the result in mapshaper.org; only slivers expected)
mapshaper -i Outline_of_India.shp -proj wgs84 -erase india_outline_full.shp -o qa_outline_minus_states.geojson

# 2. World backdrop (NE India POV), neighbours erased by India's outline, India outline added
mapshaper -i ne_10m_admin_0_countries_ind.shp `
  -filter "ADM0_A3 != 'IND'" `
  -erase india_outline_full.shp `
  -each "iso3=ADM0_A3" -filter-fields iso3 `
  -o world_noind.shp
mapshaper -i combine-files world_noind.shp india_outline_full.shp `
  -merge-layers force name=world `
  -simplify 3% weighted keep-shapes `
  -filter-islands min-area=200km2 remove-empty `
  -filter-fields iso3 `
  -o format=topojson quantization=10000 world.topojson

# 3. Admin-1 for BRA, ZAF, KOR, CHN (+ HK, MO); China erased by India's outline
mapshaper -i ne_10m_admin_1_states_provinces.shp `
  -filter "['BRA','ZAF','KOR','CHN'].indexOf(adm0_a3) > -1" `
  -erase india_outline_full.shp `
  -each "iso3=adm0_a3; code=iso_3166_2" -filter-fields iso3,code,name `
  -o adm1_4.shp
mapshaper -i ne_10m_admin_0_countries_ind.shp `
  -filter "ADM0_A3 == 'HKG' || ADM0_A3 == 'MAC'" `
  -each "iso3='CHN'; code = ADM0_A3 == 'HKG' ? 'CN-HK' : 'CN-MO'; name = ADM0_A3 == 'HKG' ? 'Hong Kong' : 'Macao'" `
  -filter-fields iso3,code,name `
  -o hkmo.shp
mapshaper -i combine-files adm1_4.shp hkmo.shp `
  -merge-layers force name=admin1 `
  -simplify 4% weighted keep-shapes `
  -o format=topojson quantization=100000 admin1_bra_zaf_kor_chn.topojson

# Size check; if a file is over 300 KB, lower its -simplify % (e.g. 2% -> 1.2%) or quantization, and re-run
Get-ChildItem *.topojson | Select-Object Name, @{n='KB';e={[math]::Round($_.Length/1KB)}}
```

**What to expect, and how to tune.**
- **Sizes have not been measured yet.** Starting points are 2% for India, 3% for the world and 4% for admin-1. If a file is over 300 KB, lower the percentage or use `quantization=10000`.
- If `admin1` is too big, split it per country with `-split iso3` and output one file per country.
- `keep-shapes` stops small units from disappearing: Lakshadweep, the Andaman & Nicobar Islands, Chandigarh, Delhi, Puducherry's enclaves, HK, MO, Sejong and Seoul.
- Do **not** apply `-filter-islands` to India.
- NE 10m admin-1 field names are lower case (`adm0_a3`, `name`, `iso_3166_2`) [V at 50m, I at 10m]. NE admin-0 field names are upper case (`ADM0_A3`, `NAME`). [V]

**QA checklist** (visual, after simplifying). Check each of these against an SoI outline map:
- The northern tip near Kilik/Mintaka, about 37.08°N.
- The Shaksgam/Trans-Karakoram tract and Aksai Chin, which should reach about 80.3°E.
- The Demchok and Barahoti areas.
- Kalapani/Lipulekh.
- The eastern tip of Arunachal.
- Sir Creek.
- All the island UTs.
- No Pakistan or China polygon pixel inside India (toggle India's layer off to check).

### 2.3 Attribution for /about

Recommended text:

> **Map data.** Boundaries of India, its states and union territories: **Source: Survey of India, Government of India** (Administrative Boundary Database, via the Survey of India Online Maps Portal; obtained through the DataMeet community mirror *indian_admin_boundaries* by ramSeraph). Outline of India checked against Survey of India's *Outline of India* vector data (2026).
> Other countries and their provinces: **Made with Natural Earth.** Free vector and raster map data @ naturalearthdata.com (public domain), using Natural Earth's India point-of-view edition.
> Boundaries have been simplified for display. Boundaries of countries other than India are shown for reference only.

Lines to add or swap if other sources are used:
- **DataMeet fallback:** "India state boundaries by DataMeet India community (CC BY 4.0), https://github.com/datameet/maps"
- **geoBoundaries:** "Brazil / South Africa provincial boundaries: geoBoundaries (Runfola et al. 2020), CC BY 2.5 / CC BY 3.0 IGO"

**Do not** print SoI's certification wording ("The external boundaries ... agree with the Record/Master Copy certified by Survey of India"). It applies only to maps SoI has actually checked and certified. [I]

Add a short `DATA-LICENSE` note next to the TopoJSON files in the repository. It should say that the India geometry is derived from Survey of India data, credited to SoI, provided for non-commercial website display, and **not** covered by the repository's own licence.

---

## 3. Risks and owner decisions

1. **No fully open-licensed SoI admin-1 source exists.**
   - SoI's own terms allow "website purposes", ban commercial use, and require attribution. The portal also bars sharing with foreign individuals or entities.
   - The guidelines allow "digital display" of SoI boundary data.
   - A public GitHub repository is display, but it also lets anyone download the derived data.
   - The CC0 (ramSeraph) and CC BY 4.0 (DataMeet) labels on the mirrors probably cannot override SoI's rights.
   - **Owner decision:** (a) proceed with SoI attribution and a non-commercial data note (recommended; low practical risk for a free think-tank site); (b) also email SoI for written confirmation; or (c) use DataMeet CC BY 4.0 for cleaner licence wording, accepting the same SoI provenance underneath.
2. **The four "DISPUTED" inter-state polygons** in SoI's state layer (MP/Gujarat, MP/Rajasthan, Rajasthan/Gujarat, WB/Bihar/Jharkhand). **Owner decision:** keep them as neutral, untracked polygons (faithful to SoI; recommended), or merge them into a neighbour (not SoI-faithful). DataMeet and LGD have no such polygons.
3. **Version gap.** The mirror's states date from late 2023, while SoI's outline dates from February 2026 (ABDB 2.0). Run the QA step in 1b. If the differences are more than slivers, get the current OVSF/1M/7 from the SoI portal. That needs a free account, done by the owner.
4. **Simplification error.** Heavy generalisation could clip the narrow northern tip or small enclaves. Run the QA checklist above before publishing.
5. **Neighbour lines are not SoI-certified.** Pakistan's and China's other borders, for example China–Nepal, are NE de facto. That is acceptable for a faint backdrop.
6. **Names.** SoI names are upper case, and `STATE` contains diacritics. Map display names from `State_LGD` in the app's own lookup table rather than trusting the file's strings. NE uses `Xizang` and `Inner Mongol`, and older Korean province names; rename them in the app.
7. **Legal context** (background, not verified this session). Indian law (Criminal Law Amendment Act 1961, s.2) penalises questioning India's frontiers in visible depictions. This is why the SoI outline matters, and why the backdrop's neighbours are erased.

## 4. Sources consulted

- NE download pages: `https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-admin-0-countries/` and the "admin-0-countries-point-of-views" page
- NE terms of use: `https://www.naturalearthdata.com/about/terms-of-use/`
- NE disputed-boundaries policy: `https://www.naturalearthdata.com/about/disputed-boundaries-policy/`
- NE CHANGELOG and `.dbf`/`.shx` files: `https://github.com/nvkelso/natural-earth-vector`
- SoI outline maps page: `https://surveyofindia.gov.in/pages/outline-maps-of-india`
- SoI outline zip: `https://surveyofindia.gov.in/documents/Outline_of_India.zip`
- SoI outline terms note: `https://surveyofindia.gov.in/documents/ibd-vectorformat.pdf`
- SoI copyright policy: `https://surveyofindia.gov.in/pages/copyright-policy`
- SoI Online Maps Portal: `https://onlinemaps.surveyofindia.gov.in/Digital_Product_Show.aspx` and `.../addtocart.aspx`
- ramSeraph mirror: `https://github.com/ramSeraph/indian_admin_boundaries` (states release, PMTiles metadata, coverage PNGs) and `https://github.com/ramSeraph/indianopenmaps/blob/main/DATA_LICENSE.md`
- DataMeet: `https://github.com/datameet/maps` (README, `Country/README.md`, `States/Admin2.*`, commit history)
- geoBoundaries API: `https://www.geoboundaries.org/api/current/gbOpen/<ISO>/ADM1/` and preview PNGs
- Bhuvan open data: `https://bhuvan-app3.nrsc.gov.in/data/download/index.php`
- OSM wiki: `https://wiki.openstreetmap.org/wiki/Open_Geospatial_Data_from_Government_of_India`
- 2021 Guidelines, secondary sources: SCC Online blog (2021-03-04), law-firm summaries, and the excerpt in the ramSeraph README
