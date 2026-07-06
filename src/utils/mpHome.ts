export function goAppHome(options: { reLaunch?: boolean } = {}) {
	const { reLaunch = true } = options
	// #ifdef MP-WEIXIN
	// 主包 Tab Shell 无法引用分包页面组件，会白屏；使用分包页 + 自定义 TabBar
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
