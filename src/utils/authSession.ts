import { useAuthStore } from '@/store/auth'

export const USER_SESSION_CHANGED_EVENT = 'user-session-changed'

/** 清除登录态及与账号绑定的本地缓存 */
export function clearAuthSession() {
	const authStore = useAuthStore()
	authStore.clearToken()
	authStore.clearUserId()

	const userScopedKeys = [
		'shopInfo',
		'storeManage_scrollTop',
		'storeManage_shop_type',
		'loginParams',
	]
	userScopedKeys.forEach((key) => {
		try {
			uni.removeStorageSync(key)
		} catch (e) {
			// ignore
		}
	})

	notifyUserSessionChanged()
}

/** 通知各页面刷新当前登录用户信息 */
export function notifyUserSessionChanged() {
	try {
		uni.$emit(USER_SESSION_CHANGED_EVENT)
	} catch (e) {
		// ignore
	}
}

/** 写入新登录态（会先清理旧账号缓存） */
export function applyAuthSession(token: string, userId?: string | number | null) {
	const authStore = useAuthStore()
	authStore.clearToken()
	authStore.clearUserId()

	const userScopedKeys = [
		'shopInfo',
		'storeManage_scrollTop',
		'storeManage_shop_type',
		'loginParams',
	]
	userScopedKeys.forEach((key) => {
		try {
			uni.removeStorageSync(key)
		} catch (e) {
			// ignore
		}
	})

	authStore.setToken(token)
	if (userId !== undefined && userId !== null && String(userId).trim()) {
		authStore.setUserId(String(userId))
	}
	notifyUserSessionChanged()
}
