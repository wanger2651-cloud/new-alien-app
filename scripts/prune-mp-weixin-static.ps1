# 微信小程序上传前裁剪 static（仅保留必需资源）
$Root = Split-Path $PSScriptRoot -Parent
$DistDir = Join-Path $Root "dist\build\mp-weixin"

if (-not (Test-Path -LiteralPath $DistDir)) {
    Write-Host "未找到 $DistDir" -ForegroundColor Yellow
    exit 1
}

$static = Join-Path $DistDir "static"
if (-not (Test-Path -LiteralPath $static)) { exit 0 }

$allow = @(
    "choose/phone.png", "choose/mima.png", "choose/ids.png", "choose/yy.png", "choose/choose-bg.png",
    "store/add_icon.png", "store/bind_icon.png", "store/del_icon.png", "store/shaix_icon.png",
    "icon/icon_copy.png", "icon/icon_down.png", "icon/icon_edit.png", "icon/icon_add.png", "icon/icon_delete.png",
    "user/userBg_001.png", "user/jihu-logo.png", "user/kf.png",
    "img/juhekfu-Poster-sm.jpg", "img/juhekfu-logo-sm.jpg", "img/bind-sm.jpg", "img/robotonline.png", "img/yesterdays-review.png",
    "shop/icon_016a.png", "shop/icon_037a.png", "shop/icon_036a.png", "shop/icon_038a.png", "shop/icon_031a.png",
    "shop/icon_045a.png", "shop/icon_044a.png", "shop/icon_041a.png", "shop/icon_048a.png", "shop/icon_051a.png",
    "shop/icon_043a.png", "shop/icon_046a.png", "shop/icon_023a.png", "shop/icon_024a.png", "shop/icon_025a.png",
    "shop/icon_026a.png", "shop/icon_027a.png", "shop/icon_040a.png", "shop/m_info.png",
    "shop/icon_013a.png", "shop/icon_014a.png", "shop/icon_015a.png", "shop/icon_032a.png",
    "shop/setting10.png", "shop/setting11.png", "shop/setting12.png", "shop/setting13.png", "shop/logo.png", "shop/arrow.png",
    "shop/item-bg-mt.png", "shop/item-bg-elm.png", "shop/shopBg-2.png", "shop/shopBg-3.png", "shop/fun-bg-cpdt.png"
)

$allowSet = @{}
foreach ($a in $allow) { $allowSet[$a.Replace('/', [char]92).ToLower()] = $true }

Get-ChildItem -LiteralPath $static -Recurse -File -ErrorAction SilentlyContinue | ForEach-Object {
    $rel = $_.FullName.Substring($static.Length + 1)
    if (-not $allowSet.ContainsKey($rel.ToLower())) {
        Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

Get-ChildItem -LiteralPath $static -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.Name -match "[\s']" } | ForEach-Object {
    Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
}

Get-ChildItem -LiteralPath $static -Recurse -Directory -ErrorAction SilentlyContinue | Sort-Object FullName -Descending | ForEach-Object {
    if ((Get-ChildItem -LiteralPath $_.FullName -File -Recurse -ErrorAction SilentlyContinue | Measure-Object).Count -eq 0) {
        Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
    }
}

$staticSize = (Get-ChildItem -LiteralPath $static -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
$mainPages = @(
    (Join-Path $DistDir "pages\login"),
    (Join-Path $DistDir "pages\common"),
    (Join-Path $DistDir "pages\customer-service"),
    (Join-Path $DistDir "pages\addshop"),
    (Join-Path $DistDir "pages\pkg-tabs"),
    (Join-Path $DistDir "app.js"),
    (Join-Path $DistDir "app.json"),
    (Join-Path $DistDir "app.wxss"),
    (Join-Path $DistDir "common"),
    (Join-Path $DistDir "components"),
    (Join-Path $DistDir "utils"),
    (Join-Path $DistDir "static")
)
$mainSize = 0
foreach ($p in $mainPages) {
    if (Test-Path -LiteralPath $p) {
        if ((Get-Item -LiteralPath $p).PSIsContainer) {
            $mainSize += (Get-ChildItem -LiteralPath $p -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum
        } else {
            $mainSize += (Get-Item -LiteralPath $p).Length
        }
    }
}
Write-Host ("Static: {0:N2} MB, Main pkg est: {1:N2} MB" -f ($staticSize / 1MB), ($mainSize / 1MB))
