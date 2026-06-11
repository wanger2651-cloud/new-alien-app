# 打开微信开发者工具（导入编译后的小程序目录，不是源码根目录）
$DistPath = Join-Path $PSScriptRoot "..\dist\dev\mp-weixin" | Resolve-Path -ErrorAction SilentlyContinue
if (-not $DistPath) {
    Write-Host "未找到 dist\dev\mp-weixin，请先运行: npm run dev:mp-weixin" -ForegroundColor Yellow
    exit 1
}

$Cli = "D:\xiazai\Stable Build\微信web开发者工具\cli.bat"
if (-not (Test-Path $Cli)) {
    Write-Host "未找到微信开发者工具 CLI: $Cli" -ForegroundColor Red
    exit 1
}

Write-Host "打开小程序目录: $DistPath"
& $Cli open --project $DistPath --port 28028
