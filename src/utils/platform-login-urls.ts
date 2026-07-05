const PLATFORM_LOGIN_URLS: Record<number, string> = {
	1: 'https://e.waimai.meituan.com/#/new_fe/business#/index',
	2: 'https://melody.shop.ele.me', 3: 'https://shangoue.meituan.com/#/new_fe/business#/index',
	4: 'https://yiyao.meituan.com/#/new_fe/business#/index', 5: 'https://nr.ele.me/',
	6: 'https://store.jddj.com/login', 7: 'https://fxg.jinritemai.com/login/common',
	8: 'https://store.jddj.com/login', 9: 'https://fxg.jinritemai.com/login/common',
}
export function getPlatformLoginUrl(shopType: number): string {
	return PLATFORM_LOGIN_URLS[shopType] || ''
}
export function getPlatformLoginFinalUrl(shopType: number, baseUrl: string): string {
	return shopType === 2 ? `${baseUrl.replace(/\/$/, '')}/login` : baseUrl
}
