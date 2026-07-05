/**
 * 用微信开发者工具打开小程序（仅首次导入时用，日常请用 npm run start:mp-weixin）
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const mpDir = path.join(root, 'dist', 'build', 'mp-weixin')
const appJson = path.join(mpDir, 'app.json')

function assertBuildOutput() {
	if (!fs.existsSync(appJson)) {
		console.error('未找到编译产物，请先执行: npm run build:mp-weixin')
		process.exit(1)
	}
	const app = JSON.parse(fs.readFileSync(appJson, 'utf8'))
	const hasMpTabs = app.pages?.some((p) => String(p).includes('pkg-tabs/manage-tab'))
	if (!hasMpTabs) {
		console.error('dist/build/mp-weixin 不是小程序专用配置，请执行: npm run build:mp-weixin')
		process.exit(1)
	}
}

assertBuildOutput()

// 默认直接打开编译产物目录，避免误开 dist/dev 或 App 版配置
const projectPath = process.env.MP_WEIXIN_PROJECT || mpDir

const cliCandidates = [
	process.env.WECHAT_DEVTOOLS_CLI,
	'D:\\xiazai\\Stable Build\\微信web开发者工具\\cli.bat',
].filter(Boolean)

let cli = cliCandidates.find((p) => fs.existsSync(p))
if (!cli) {
	console.error('未找到微信开发者工具 cli.bat')
	process.exit(1)
}

const port = process.env.WECHAT_DEVTOOLS_PORT || '31993'
const args = ['open', '--project', projectPath, '--auto-port', port]
console.log('打开小程序项目:', projectPath)
console.log('代码目录:', mpDir)
const r = spawnSync('cmd.exe', ['/c', cli, ...args], { stdio: 'inherit', cwd: root })
process.exit(r.status ?? 1)
