const MP_TAB_URLS = [
	'/pages/storeManage/storeManage?mpTab=1',
	'/pages/aggregated-service/aggregated-service?mpTab=1',
	'/pages/user/index?mpTab=1',
] as const

export function preloadMpTabPages(excludeRoute?: string) {
	// #ifdef MP-WEIXIN
	const wxApi = (globalThis as { wx?: { preloadPage?: (opts: { url: string }) => void } }).wx
	if (!wxApi?.preloadPage) return
	MP_TAB_URLS.forEach((url) => {
		const route = url.split('?')[0]
		if (excludeRoute && excludeRoute === route) return
		try {
			wxApi.preloadPage!({ url })
		} catch {
			// preload is best-effort
		}
	})
	// #endif
}
