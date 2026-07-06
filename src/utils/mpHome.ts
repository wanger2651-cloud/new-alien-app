export function goAppHome(options: { reLaunch?: boolean } = {}) {
	const { reLaunch = true } = options
	// #ifdef MP-WEIXIN
	// Tab Shell：单页 v-show 切换，避免 redirectTo 白屏
	const homeUrl = '/pages/mp-shell/mp-shell?tab=manage'
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
