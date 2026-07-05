/**
 * 构建并同步到 dist/build/mp-weixin，仅在当前已打开的项目上触发编译（不新开窗口）
 *
 * 默认项目路径 = 仓库根目录（miniprogramRoot 指向 dist/build/mp-weixin）
 * 也可设置环境变量 MP_WEIXIN_PROJECT 指向 dist/build/mp-weixin
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const mpDir = path.join(root, 'dist', 'build', 'mp-weixin')
const devDir = path.join(root, 'dist', 'dev', 'mp-weixin')
// 默认打开 dist/build/mp-weixin，勿用 dist/dev（那是 App 版错误产物）
const projectPath = process.env.MP_WEIXIN_PROJECT || mpDir

const cliCandidates = [
	process.env.WECHAT_DEVTOOLS_CLI,
	'D:\\xiazai\\Stable Build\\微信web开发者工具\\cli.bat',
].filter(Boolean)

function runCli(args, label) {
	const cli = cliCandidates.find((p) => fs.existsSync(p))
	if (!cli) {
		console.warn('未找到微信开发者工具，请手动在已打开的项目里点「编译」')
		return false
	}
	const port = process.env.WECHAT_DEVTOOLS_PORT || '31993'
	console.log(`>>> ${label}`)
	const r = spawnSync('cmd.exe', ['/c', cli, '--auto-port', port, ...args], {
		cwd: root,
		encoding: 'utf8',
	})
	const out = (r.stdout || '') + (r.stderr || '')
	if (out.trim()) process.stdout.write(out)
	return r.status === 0
}

console.log('=== 同步小程序 build 产物 ===')

console.log('>>> 1/2 npm run build:mp-weixin')
const build = spawnSync('npm', ['run', 'build:mp-weixin'], { cwd: root, stdio: 'inherit', shell: true })
if (build.status !== 0) process.exit(build.status || 1)

if (!fs.existsSync(path.join(mpDir, 'app.json'))) {
	console.error('缺少', path.join(mpDir, 'app.json'))
	process.exit(1)
}

try {
	if (fs.existsSync(devDir)) {
		fs.rmSync(devDir, { recursive: true, force: true })
		console.log('已清理干扰目录:', devDir)
	}
} catch {
	console.warn('未能删除 dist/dev/mp-weixin，请从项目列表移除 dev 项目')
}

console.log('>>> 2/2 在当前开发者工具项目触发编译（不新开窗口）')
console.log('项目路径:', projectPath)
if (!runCli(['auto', '--project', projectPath], '编译')) {
	console.warn('自动编译未成功，请在你已打开的开发者工具里手动点「编译」')
}

console.log('=== 同步完成 ===')
console.log('小程序代码目录:', mpDir)
console.log('请在开发者工具打开此目录（不要打开 dist/dev/mp-weixin）')
