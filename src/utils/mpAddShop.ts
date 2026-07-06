/** 小程序端：跳转 web-view 授权添加/修复店铺页 */
export function navigateToMpAddShop(shopType: number, isRepair = false) {
	const repairQuery = isRepair ? '&isRepair=1' : ''
	uni.navigateTo({
		url: `/pages/addshop/addShop?shopType=${shopType}${repairQuery}`
	})
}

/** 各平台商户后台入口（小程序 web-view 打开，需配置业务域名） */
export function getMerchantPortalUrl(shopType: number): string {
	const st = Number(shopType) || 1
	if (st === 1) return 'https://e.waimai.meituan.com/'
	if (st === 3) return 'https://shangoue.meituan.com/'
	if (st === 4) return 'https://yiyao.meituan.com/'
	if (st === 2 || st === 5) return 'https://melody.shop.ele.me/'
	if (st === 6 || st === 8) return 'https://store.jddj.com/'
	if (st === 7 || st === 9) return 'https://fxg.jinritemai.com/'
	return 'https://e.waimai.meituan.com/'
}

export function openMerchantPortalOnMp(shopType: number) {
	const url = getMerchantPortalUrl(shopType)
	uni.navigateTo({
		url: `/pages/common/policy-webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent('店铺后台')}`
	})
}

export const STORE_MANAGE_REFRESH_KEY = 'storeManage_needRefresh'

export function markStoreManageNeedRefresh() {
	try {
		uni.setStorageSync(STORE_MANAGE_REFRESH_KEY, true)
	} catch (e) {
		// ignore
	}
}

export function consumeStoreManageNeedRefresh(): boolean {
	try {
		const need = uni.getStorageSync(STORE_MANAGE_REFRESH_KEY)
		if (need) {
			uni.removeStorageSync(STORE_MANAGE_REFRESH_KEY)
			return true
		}
	} catch (e) {
		// ignore
	}
	return false
}
