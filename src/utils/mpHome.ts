export function goAppHome(options: { reLaunch?: boolean } = {}) {
	const { reLaunch = true } = options
	// #ifdef MP-WEIXIN
	// 直接进入分包页面 + 自定义 TabBar，避免主包 tab 页异步注入 storeManage 组件超时
	const homeUrl = '/pages/storeManage/storeManage?mpTab=1'
	uni.reLaunch({
		url: homeUrl,
		fail: (err) => {
			console.error('[mpHome] reLaunch failed', err)
			uni.showToast({ title: '进入首页失败，请重新编译', icon: 'none' })
		}
	})
	// #endif
	// #ifndef MP-WEIXIN
	const url = '/pages/master-index/master-index'
	if (reLaunch) uni.reLaunch({ url })
	else uni.navigateTo({ url })
	// #endif
}
