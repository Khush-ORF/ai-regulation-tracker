# Builds the map boundary files (T-010) following Claude/research/T-006-india-boundaries.md.
# Inputs: geo/sources/ (downloaded and extracted by hand; see geo/README.md).
# Outputs: public/geo/*.topojson. India geometry is Survey of India data (ADR-005, ADR-013).
# mapshaper logs progress to stderr, which PowerShell 5.1 reports as errors, so check exit codes instead.
$ErrorActionPreference = 'Continue'
function ms { & node "$PSScriptRoot\node_modules\mapshaper\bin\mapshaper" @args 2>&1 | ForEach-Object { "$_" }; if ($LASTEXITCODE) { throw "mapshaper failed: $args" } }
Set-Location $PSScriptRoot
$src = 'sources'
$build = 'build'
$out = '..\public\geo'
New-Item -ItemType Directory -Force $build, $out | Out-Null

# 0. Wrap the SoI newline-delimited GeoJSON into a FeatureCollection
$lines = [IO.File]::ReadAllLines("$PSScriptRoot\$src\SOI_States.geojsonl") | Where-Object { $_.Trim() }
[IO.File]::WriteAllText("$PSScriptRoot\$build\SOI_States.geojson", '{"type":"FeatureCollection","features":[' + ($lines -join ',') + ']}', (New-Object Text.UTF8Encoding $false))

# 1. India: states and UTs plus a dissolved national outline sharing the same arcs.
#    An unsimplified outline is also written as the erase mask for neighbours.
$prepIndia = @('-i', "$build/SOI_States.geojson", 'name=states', '-clean',
  '-each', "name=STATE_C; lgd=State_LGD; disputed=STATE_C.indexOf('DISPUTED')===0",
  '-filter-fields', 'name,lgd,disputed',
  '-dissolve', '+', 'name=india_outline',
  '-each', "iso3='IND'", 'target=india_outline')
ms @prepIndia -o "$build/india_outline_full.shp" target=india_outline
ms @prepIndia -simplify 2% weighted keep-shapes "target=states,india_outline" `
  -o format=topojson quantization=100000 "target=states,india_outline" "$out/india.topojson"

# 1b. QA: parts of SoI's 2026 outline not covered by the 2023 state layer (expect only slivers)
ms -i "$src/Outline_of_India/Outline_of_India.shp" -proj wgs84 `
  -erase "$build/india_outline_full.shp" `
  -each "area_km2=Math.round(this.area/1e6)" `
  -o "$build/qa_outline_minus_states.geojson"

# 2. World backdrop: Natural Earth India point-of-view, neighbours erased by India's outline, India added
ms -i "$src/ne_10m_admin_0_countries_ind/ne_10m_admin_0_countries_ind.shp" `
  -filter "ADM0_A3 != 'IND'" `
  -erase "$build/india_outline_full.shp" `
  -each "iso3=ADM0_A3" -filter-fields iso3 `
  -o "$build/world_noind.shp"
ms -i combine-files "$build/world_noind.shp" "$build/india_outline_full.shp" `
  -merge-layers force name=world `
  -filter-fields iso3 `
  -simplify 3% weighted keep-shapes `
  -filter-islands min-area=200km2 remove-empty `
  -o format=topojson quantization=10000 "$out/world.topojson"

# 3. Admin-1 for Brazil, South Africa, Korea and China (plus Hong Kong and Macau); China erased by India's outline
ms -i "$src/ne_10m_admin_1_states_provinces/ne_10m_admin_1_states_provinces.shp" `
  -filter "['BRA','ZAF','KOR','CHN'].indexOf(adm0_a3) > -1" `
  -erase "$build/india_outline_full.shp" `
  -each "iso3=adm0_a3; code=iso_3166_2" -filter-fields "iso3,code,name" `
  -filter "code.indexOf('~') == -1" `
  -o "$build/adm1_4.shp"
# The last filter drops Natural Earth's placeholder units such as CN-X01~ (Paracel Islands, disputed, not a province).
ms -i "$src/ne_10m_admin_0_countries_ind/ne_10m_admin_0_countries_ind.shp" `
  -filter "ADM0_A3 == 'HKG' || ADM0_A3 == 'MAC'" `
  -each "iso3='CHN'; code = ADM0_A3 == 'HKG' ? 'CN-HK' : 'CN-MO'; name = ADM0_A3 == 'HKG' ? 'Hong Kong' : 'Macao'" `
  -filter-fields "iso3,code,name" `
  -o "$build/hkmo.shp"
ms -i combine-files "$build/adm1_4.shp" "$build/hkmo.shp" `
  -merge-layers force name=admin1 `
  -simplify 4% weighted keep-shapes `
  -o format=topojson quantization=100000 "$out/admin1.topojson"

Get-ChildItem "$out\*.topojson" | Select-Object Name, @{n='KB';e={[math]::Round($_.Length/1KB)}}
