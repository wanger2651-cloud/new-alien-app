/**
 * 通过微信开发者工具自动化接口检查小程序关键页面能否加载
 */
import automator from 'miniprogram-automator'

const MP_DIR = 'd:/waimai/new-alien-app/dist/build/mp-weixin'
const AUTO_PORT = Number(process.env.WECHAT_AUTOMATOR_PORT || '9420')

const PAGES = [
	'/pages/login/chooseUser',
	'/pages/storeManage/storeManage?mpTab=1',
]

async function main() {
	console.log('=== 小程序运行冒烟测试 ===')
	const wsEndpoint = `ws://127.0.0.1:${AUTO_PORT}`
	let miniProgram

	miniProgram = await automator.connect({ wsEndpoint })
	console.log('OK: 已连接', wsEndpoint)

	const systemInfo = await miniProgram.systemInfo()
	console.log('OK: systemInfo', systemInfo.model, systemInfo.platform)

	for (const path of PAGES) {
		const page = await miniProgram.reLaunch(path)
		await page.waitFor(4000)
		const data = await page.data()
		const keys = Object.keys(data || {})
		const pathOnly = await page.path
		console.log(keys.length ? 'OK' : 'WARN', `页面 ${path}`, `path=${pathOnly}`, `dataKeys=${keys.length}`)
		if (!keys.length) process.exitCode = 1
	}

	const current = await miniProgram.currentPage()
	console.log('OK: 当前页面', current?.path)
	console.log('=== 测试通过 ===')
}

main().catch((err) => {
	console.error('FAIL:', err.message || err)
	process.exit(1)
})
