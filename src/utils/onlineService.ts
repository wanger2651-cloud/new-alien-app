export const ONLINE_SERVICE_URL = 'https://chatbot.aliyuncs.com/intl/index.htm?locale=zh-CN&from=9W8nB8mKWl'

export const openOnlineService = () => {
	uni.navigateTo({
		url: `/pages/pjss-web/pjss-web?title=${encodeURIComponent('在线客服')}&url=${encodeURIComponent(ONLINE_SERVICE_URL)}`
	})
}
