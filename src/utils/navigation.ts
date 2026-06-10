/** 安全返回：优先 navigateBack，失败或无上一页时用 redirectTo */
export function goBackOrRedirect(fallbackUrl: string, delta = 1) {
	const pages = getCurrentPages()
	if (pages.length > delta) {
		uni.navigateBack({
			delta,
			fail: () => {
				uni.redirectTo({ url: fallbackUrl })
			}
		})
		return
	}
	uni.redirectTo({ url: fallbackUrl })
}
