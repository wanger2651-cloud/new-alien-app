/**
 * 上传微信小程序（需先在开发者工具登录，并开启服务端口）
 *
 * 环境变量：
 *   WECHAT_UPLOAD_VERSION  版本号，默认 manifest versionName
 *   WECHAT_UPLOAD_DESC     上传说明
 */
import fs from 'fs'
import path from 'path'
import { spawnSync } from 'child_process'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const mpDir = path.join(root, 'dist', 'build', 'mp-weixin')
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'src', 'manifest.json'), 'utf8'))
const version = process.env.WECHAT_UPLOAD_VERSION || manifest.versionName || '1.0.16'
const desc = process.env.WECHAT_UPLOAD_DESC || `青柠助手 v${version} 上架`

const cliCandidates = [
	process.env.WECHAT_DEVTOOLS_CLI,
	'D:\\xiazai\\Stable Build\\微信web开发者工具\\cli.bat',
].filter(Boolean)

const cli = cliCandidates.find((p) => fs.existsSync(p))
if (!cli) {
	console.error('未找到微信开发者工具 cli，请设置 WECHAT_DEVTOOLS_CLI')
	process.exit(1)
}

if (!fs.existsSync(path.join(mpDir, 'app.json'))) {
	console.error('请先 npm run build:mp-weixin')
	process.exit(1)
}

const port = process.env.WECHAT_DEVTOOLS_PORT || '31993'
console.log('>>> 上传小程序')
console.log('项目:', mpDir)
console.log('版本:', version)
console.log('说明:', desc)

const r = spawnSync(
	'cmd.exe',
	['/c', cli, '--auto-port', port, 'upload', '--project', mpDir, '-v', version, '-d', desc],
	{ cwd: root, encoding: 'utf8' },
)

const out = (r.stdout || '') + (r.stderr || '')
if (out.trim()) process.stdout.write(out)

if (r.status !== 0) {
	console.error('上传失败，请确认：1) 开发者工具已登录 2) 已开启服务端口 3) 有上传权限')
	process.exit(r.status || 1)
}

console.log('>>> 上传完成，请在微信公众平台提交审核')
