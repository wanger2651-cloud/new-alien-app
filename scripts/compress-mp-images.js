import sharp from 'sharp'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const staticDir = path.join(__dirname, '..', 'src', 'static')

const jobs = [
	{ file: 'img/bind-sm.jpg', width: 720, quality: 58 },
	{ file: 'img/juhekfu-Poster-sm.jpg', width: 750, quality: 62 },
	{ file: 'img/juhekfu-logo-sm.jpg', width: 320, quality: 68 },
	{ file: 'shop/item-bg-elm.png', width: 560, png: true },
	{ file: 'shop/item-bg-mt.png', width: 560, png: true },
	{ file: 'shop/shopBg-2.png', width: 750, png: true },
	{ file: 'shop/shopBg-3.png', width: 750, png: true },
	{ file: 'shop/fun-bg-cpdt.png', width: 750, png: true },
	{ file: 'user/jihu-logo.png', width: 180, png: true },
	{ file: 'user/userBg_001.png', width: 750, png: true },
]

for (const job of jobs) {
	const input = path.join(staticDir, job.file)
	if (!fs.existsSync(input)) {
		console.warn('skip missing', job.file)
		continue
	}
	const before = fs.statSync(input).size
	let pipeline = sharp(input).resize({ width: job.width, withoutEnlargement: true })
	if (job.png) {
		pipeline = pipeline.png({ compressionLevel: 9, palette: true })
	} else {
		pipeline = pipeline.jpeg({ quality: job.quality, mozjpeg: true })
	}
	await pipeline.toFile(input + '.tmp')
	fs.renameSync(input + '.tmp', input)
	const after = fs.statSync(input).size
	console.log(`${job.file}: ${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB`)
}
