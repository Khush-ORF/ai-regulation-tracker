# Builds mockup-v4.html by inlining the boundary TopoJSON from public/geo into mockup-v4.src.html.
# Inlining avoids any dependence on fetching side files inside the artifact viewer.
$ErrorActionPreference = 'Stop'
$here = $PSScriptRoot
$geo = Join-Path $here '..\..\public\geo'
$src = [IO.File]::ReadAllText((Join-Path $here 'mockup-v4.src.html'))
foreach ($pair in @(@('__WORLD__','world.topojson'), @('__INDIA__','india.topojson'), @('__ADMIN1__','admin1.topojson'))) {
  $json = [IO.File]::ReadAllText((Join-Path $geo $pair[1]))
  $src = $src.Replace($pair[0], $json)
}
[IO.File]::WriteAllText((Join-Path $here 'mockup-v4.html'), $src, (New-Object Text.UTF8Encoding $false))
"{0:N0} KB" -f ((Get-Item (Join-Path $here 'mockup-v4.html')).Length / 1KB)
