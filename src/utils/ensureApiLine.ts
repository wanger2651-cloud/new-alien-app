import { getLineApiUrl } from '@/config/lineConfig'

/** 登录/注册前确保本地已有可用 API 线路（默认 HTTPS） */
export function ensureApiLineConfig(): void {
	const savedApiBaseUrl = uni.getStorageSync('apiBaseUrl')
	if (savedApiBaseUrl) {
		return
	}
	const savedLineType = uni.getStorageSync('lineType') || 'default'
	const lineType = savedLineType === 'international' ? 'default' : savedLineType
	const apiUrl = getLineApiUrl(lineType)
	uni.setStorageSync('lineType', lineType)
	uni.setStorageSync('apiBaseUrl', apiUrl)
}
