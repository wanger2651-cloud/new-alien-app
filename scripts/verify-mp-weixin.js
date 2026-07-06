/**
 * 微信小程序 build 产物自动化验收（编译/体积/上传前检查）
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const mpDir = path.join(root, 'dist', 'build', 'mp-weixin')

const REQUIRED = [
	'app.json',
	'project.config.json',
	'pages/mp-shell/mp-shell.js',
	'pages/storeManage/storeManage.js',
	'pages/aggregated-service/aggregated-service.js',
	'pages/user/index.js',
	'components/MpTabBar.js',
]

function fail(msg) {
	console.error('FAIL:', msg)
	process.exitCode = 1
	return false
}

function ok(msg) {
	console.log('OK:', msg)
	return true
}

console.log('=== mp-weixin 验收 ===')
console.log('目录:', mpDir)

if (!fs.existsSync(path.join(mpDir, 'app.json'))) {
	fail('缺少 app.json，请先 npm run build:mp-weixin')
	process.exit(1)
}

for (const rel of REQUIRED) {
	const p = path.join(mpDir, rel)
	if (!fs.existsSync(p)) fail(`缺少 ${rel}`)
	else ok(`存在 ${rel}`)
}

const app = JSON.parse(fs.readFileSync(path.join(mpDir, 'app.json'), 'utf8'))
if (app.tabBar?.list?.length) fail('app.json 不应再使用原生 tabBar（已改自定义 TabBar）')
else ok('未使用原生 tabBar')
if (!app.subPackages?.length) fail('app.json 缺少 subPackages')
else ok(`subPackages ${app.subPackages.length} 个`)
if (!app.preloadRule) fail('app.json 缺少 preloadRule')
else ok('preloadRule 已配置')
if (app.lazyCodeLoading) fail('app.json 不应启用 lazyCodeLoading')
else ok('未启用 lazyCodeLoading')

const storeJs = fs.readFileSync(path.join(mpDir, 'pages/storeManage/storeManage.js'), 'utf8')
if (!storeJs.includes('wx.createPage(')) fail('storeManage 须为 Page 而非 Component')
else ok('storeManage 使用 createPage')

const cli = process.env.WECHAT_DEVTOOLS_CLI || 'D:\\xiazai\\Stable Build\\微信web开发者工具\\cli.bat'
if (fs.existsSync(cli)) {
	const port = process.env.WECHAT_DEVTOOLS_PORT || '31993'
	const auto = spawnSync('cmd.exe', ['/c', cli, '--auto-port', port, 'auto', '--project', mpDir], {
		cwd: root,
		encoding: 'utf8',
	})
	if (auto.status === 0) ok('微信开发者工具 auto 编译通过')
	else fail(`微信开发者工具 auto 编译失败: ${auto.stderr || auto.stdout}`)
} else {
	console.warn('跳过 DevTools 编译（未找到 cli）')
}

console.log('=== 验收完成 ===')
if (process.exitCode) process.exit(process.exitCode)
