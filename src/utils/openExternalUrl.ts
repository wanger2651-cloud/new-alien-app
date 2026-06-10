/** 鸿蒙不支持 plus.runtime.openURL，用复制链接代替 */
export function openExternalUrl(url: string, title = '提示') {
	// #ifdef APP-HARMONY
	uni.setClipboardData({
		data: url,
		success: () => {
			uni.showModal({
				title,
				content: '链接已复制。请打开手机浏览器，粘贴地址栏访问。',
				showCancel: false,
				confirmText: '知道了'
			})
		},
		fail: () => {
			uni.showToast({ title: '复制失败，请稍后重试', icon: 'none' })
		}
	})
	return
	// #endif
	// #ifdef APP-PLUS
	plus.runtime.openURL(url)
	return
	// #endif
	// #ifdef H5
	window.open(url, '_blank')
	// #endif
	// #ifdef MP
	uni.setClipboardData({
		data: url,
		success: () => {
			uni.showToast({ title: '链接已复制', icon: 'none' })
		}
	})
	// #endif
}
