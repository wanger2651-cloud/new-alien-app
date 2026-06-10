$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$nativeRoot = Join-Path $root "harmony-native"
$deveco = "D:\DevEcoStudio5\DevEco Studio"
$hvigorw = Join-Path $deveco "tools\hvigor\bin\hvigorw.bat"
$desktopDir = Join-Path ([Environment]::GetFolderPath('Desktop')) "青柠助手\华为"

Set-Location $root
npm run harmony:prepare

$env:DEVECO_SDK_HOME = Join-Path $deveco "sdk"
$env:JAVA_HOME = Join-Path $deveco "jbr"
$env:Path = "$env:JAVA_HOME\bin;" + $env:Path

Set-Location $nativeRoot
& $hvigorw assembleApp -p product=release -p buildMode=release --no-daemon
if ($LASTEXITCODE -ne 0) { throw "hvigor assembleApp failed with exit code $LASTEXITCODE" }

$src = Join-Path $nativeRoot "build\outputs\release\harmony-native-release-signed.app"
if (-not (Test-Path $src)) { throw "Missing signed app: $src" }

New-Item -ItemType Directory -Path $desktopDir -Force | Out-Null
$dest = Join-Path $desktopDir "青柠助手-release-signed-v1.0.12.app"
Copy-Item -Force $src $dest

Write-Host ""
Write-Host "Release package ready:"
Write-Host $dest
Write-Host ""
Write-Host "Upload this file to AppGallery Connect as version 1.0.12"
