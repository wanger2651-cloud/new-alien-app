export type CookiePlatformType = 'meituan' | 'eleme' | 'ebail' | 'jingdong' | 'douyin' | 'unknown'
export function mapShopTypeToCookieType(shopType: number): CookiePlatformType {
	if ([1, 3, 4].includes(shopType)) return 'meituan'
	if (shopType === 2) return 'eleme'
	if (shopType === 5) return 'ebail'
	if ([6, 8].includes(shopType)) return 'jingdong'
	if ([7, 9].includes(shopType)) return 'douyin'
	return 'unknown'
}
function matchCookieValue(cookiestr: string, name: string): string {
	const m = cookiestr.match(new RegExp(`(?:^|;)\\s*${name}=([^;]*)`))
	return m?.[1]?.trim() || ''
}
export function extractShopIdFromCookie(cookiestr: string, cookieType: CookiePlatformType): string | null {
	if (!cookiestr?.trim()) return null
	switch (cookieType) {
		case 'meituan':
			if (!cookiestr.includes('token=') || !cookiestr.includes('wmPoiId=')) return null
			return matchCookieValue(cookiestr, 'wmPoiId') || ''
		case 'eleme':
			if (!cookiestr.includes('x5check_napos=')) return null
			return matchCookieValue(cookiestr, 'shopId') || ''
		default:
			return cookiestr.length > 50 ? '' : null
	}
}
export function formatCookieForPlatform(cookiestr: string, _cookieType?: CookiePlatformType): string {
	return cookiestr.replace('美团cookiestr', '').trim()
}
