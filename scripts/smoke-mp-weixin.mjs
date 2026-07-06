/**
 * 通过微信开发者工具自动化接口检查小程序关键页面能否加载
 */
import automator from 'miniprogram-automator'

const MP_DIR = 'd:/waimai/new-alien-app/dist/build/mp-weixin'
const CLI = 'D:/xiazai/Stable Build/微信web开发者工具/cli.bat'
const AUTO_PORT = Number(process.env.WECHAT_AUTOMATOR_PORT || '9420')

async function getMiniProgram() {
	const ws = `ws://127.0.0.1:${AUTO_PORT}`
	try {
		return await automator.connect({ wsEndpoint: ws })
	} catch {
		return automator.launch({
			cliPath: CLI,
			projectPath: MP_DIR,
			port: AUTO_PORT,
			timeout: 90000,
		})
	}
}

async function checkPage(miniProgram, path, label) {
	try {
		const page = await miniProgram.reLaunch(path)
		await page.waitFor(5000)
		const keys = Object.keys((await page.data()) || {})
		console.log(keys.length ? 'OK' : 'FAIL', label, `→ ${page.path}`, `dataKeys=${keys.length}`)
		return keys.length > 0
	} catch (err) {
		console.error('FAIL', label, err.message || err)
		return false
	}
}

async function main() {
	console.log('=== 小程序运行冒烟测试 ===')
	const miniProgram = await getMiniProgram()
	console.log('OK: 已连接开发者工具')

	const info = await miniProgram.systemInfo()
	console.log('OK: 模拟器', info.model, info.platform)

	const checks = [
		['/pages/storeManage/storeManage?mpTab=1', '门店管理'],
		['/pages/aggregated-service/aggregated-service?mpTab=1', '聚合客服'],
		['/pages/user/index?mpTab=1', '个人中心'],
	]

	let failed = 0
	for (const [path, label] of checks) {
		if (!(await checkPage(miniProgram, path, label))) failed++
	}

	console.log(failed ? `=== 核心页面失败 ${failed} 项 ===` : '=== 全部通过，小程序可正常使用 ===')
	if (failed) process.exit(1)
}

main().catch((err) => {
	console.error('FAIL:', err.message || err)
	process.exit(1)
})
