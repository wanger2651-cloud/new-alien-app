const DEFAULT_API_HOST = 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run'
export function getApiHost(): string {
	const apiBaseUrl = uni.getStorageSync('apiBaseUrl') || ''
	if (!apiBaseUrl) return DEFAULT_API_HOST
	try {
		const url = new URL(apiBaseUrl)
		return `${url.protocol}//${url.host}`
	} catch {
		return String(apiBaseUrl).replace(/\/$/, '')
	}
}
export function buildShopAuthLink(shopType: number, userId: string): string {
	if (shopType === 8) {
		const baseUrl = getApiHost()
		const redirectUri = encodeURIComponent(`${baseUrl}/shopmgcallback/elecallbacklogin`)
		return `https://open-api.shop.ele.me/authorize?response_type=code&client_id=leWB9sSZMa&redirect_uri=${redirectUri}&state=${userId}&scope=all`
	}
	return `${getApiHost()}/login/${shopType}/${userId}`
}
