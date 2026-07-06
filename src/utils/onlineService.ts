import { openExternalUrl } from '@/utils/openExternalUrl'

export const ONLINE_SERVICE_URL = 'https://chatbot.aliyuncs.com/intl/index.htm?locale=zh-CN&from=9W8nB8mKWl'

export const ONLINE_SERVICE_ALIME_FROM = '9W8nB8mKWl'

export const ONLINE_SERVICE_HYBRID_URL = `/hybrid/html/alime-dialog.html?from=${ONLINE_SERVICE_ALIME_FROM}`

/** 复制链接 / 系统浏览器打开（鸿蒙勿用 plus.runtime.openURL） */
export const openOnlineServiceInBrowser = () => {
	openExternalUrl(ONLINE_SERVICE_URL, '在线客服')
}

/** 打开在线客服：小程序复制链接，App 内打开客服页 */
export const openOnlineService = () => {
	// #ifdef MP-WEIXIN
	openOnlineServiceInBrowser()
	// #endif
	// #ifndef MP-WEIXIN
	uni.navigateTo({
		url: '/pages/customer-service/index'
	})
	// #endif
}

export const isHarmonyPlatform = (): boolean => {
	// #ifdef APP-HARMONY
	return true
	// #endif
	// #ifndef APP-HARMONY
	return false
	// #endif
}
