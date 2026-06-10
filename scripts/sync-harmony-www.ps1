$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$wwwSrc = Join-Path $root "dist\build\app-harmony"
$nativeRoot = Join-Path $root "harmony-native"
$wwwDest = Join-Path $nativeRoot "entry\src\main\resources\resfile\apps\__UNI__CABEF04\www"

if (-not (Test-Path $wwwSrc)) {
  throw "Missing dist/build/app-harmony. Run: npm run build:app-harmony"
}

if (-not (Test-Path $nativeRoot)) {
  throw "Missing harmony-native directory."
}

if (-not (Test-Path $wwwDest)) {
  New-Item -ItemType Directory -Path $wwwDest -Force | Out-Null
}

robocopy $wwwSrc $wwwDest /MIR /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
if ($LASTEXITCODE -ge 8) {
  throw "robocopy failed with exit code $LASTEXITCODE"
}

$badEts = Join-Path $wwwDest "uni_modules\index.generated.ets"
if (Test-Path $badEts) {
  Remove-Item -Force $badEts
}

Write-Host "Synced www to $wwwDest"
Write-Host "Open harmony-native in DevEco Studio and Rebuild."
