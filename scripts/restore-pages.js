/**
 * 恢复 App 版 pages.json
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const srcPages = path.join(__dirname, '..', 'src', 'pages.json')
const backup = path.join(__dirname, 'pages.json.app-backup')

if (fs.existsSync(backup)) {
	fs.copyFileSync(backup, srcPages)
	fs.unlinkSync(backup)
	console.log('已恢复 pages.json')
}
