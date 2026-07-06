/** 鸿蒙不支持 plus.runtime.openURL，用复制链接代替 */
export function openExternalUrl(url: string, title = '提示') {
	const showCopiedModal = (failMsg?: string) => {
		if (failMsg) {
			uni.showToast({ title: failMsg, icon: 'none' })
			return
		}
		// #ifdef MP-WEIXIN
		uni.showModal({
			title,
			content: '客服链接已复制。请打开手机浏览器，粘贴到地址栏访问即可与客服对话。',
			showCancel: false,
			confirmText: '知道了'
		})
		// #endif
		// #ifdef APP-HARMONY
		uni.showModal({
			title,
			content: '链接已复制。请打开手机浏览器，粘贴地址栏访问。',
			showCancel: false,
			confirmText: '知道了'
		})
		// #endif
		// #ifndef MP-WEIXIN
		// #ifndef APP-HARMONY
		uni.showToast({ title: '链接已复制', icon: 'none' })
		// #endif
		// #endif
	}

	// #ifdef APP-HARMONY
	uni.setClipboardData({
		data: url,
		success: () => showCopiedModal(),
		fail: () => showCopiedModal('复制失败，请稍后重试')
	})
	// #endif
	// #ifdef APP-PLUS
	plus.runtime.openURL(url)
	// #endif
	// #ifdef H5
	window.open(url, '_blank')
	// #endif
	// #ifdef MP-WEIXIN
	uni.setClipboardData({
		data: url,
		success: () => showCopiedModal(),
		fail: () => showCopiedModal('复制失败，请稍后重试')
	})
	// #endif
}
