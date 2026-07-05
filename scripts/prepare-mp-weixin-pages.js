/**
 * 微信小程序构建/开发前：用 pages.mp-weixin.json 替换 pages.json
 * 备份仅创建一次，避免 dev 多次运行覆盖 App 版配置
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcPages = path.join(__dirname, '..', 'src', 'pages.json')
const mpPages = path.join(__dirname, '..', 'src', 'pages.mp-weixin.json')
const backup = path.join(__dirname, 'pages.json.app-backup')

if (!fs.existsSync(mpPages)) {
	console.error('缺少 src/pages.mp-weixin.json')
	process.exit(1)
}

if (!fs.existsSync(backup)) {
	if (!fs.existsSync(srcPages)) {
		console.error('缺少 src/pages.json')
		process.exit(1)
	}
	fs.copyFileSync(srcPages, backup)
	console.log('已备份 App 版 pages.json')
}

fs.copyFileSync(mpPages, srcPages)
console.log('已应用 pages.mp-weixin.json')
