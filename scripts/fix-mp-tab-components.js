/**

 * 微信小程序 build 后处理：移除 lazyCodeLoading（会导致分包页面白屏/超时）

 */

import fs from 'fs'

import path from 'path'

import { fileURLToPath } from 'url'



const __dirname = path.dirname(fileURLToPath(import.meta.url))

const root = path.join(__dirname, '..')



function fixAppJson(dist) {

	const appJsonPath = path.join(dist, 'app.json')

	if (!fs.existsSync(appJsonPath)) return

	const app = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))

	delete app.lazyCodeLoading

	fs.writeFileSync(appJsonPath, JSON.stringify(app, null, 2) + '\n')

	console.log('已移除 app.json lazyCodeLoading')

}



function fixDist(dist) {

	if (!fs.existsSync(dist)) return 0

	fixAppJson(dist)

	return 1

}



const distArg = process.argv[2]

const distDirs = distArg

	? [path.resolve(distArg)]

	: [

		path.join(root, 'dist', 'build', 'mp-weixin'),

		path.join(root, 'dist', 'dev', 'mp-weixin'),

	]



let total = 0

for (const dist of distDirs) {

	total += fixDist(dist)

}

if (total === 0 && distArg) {

	console.warn('未找到可修复目录:', distArg)

	process.exit(1)

}

