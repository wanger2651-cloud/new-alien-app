import { getDefaultRegisterInviteCode } from '@/config/registerConfig'

const STORAGE_KEY = 'registerInviteCode'

export function saveRegisterInviteCode(code: unknown) {
	if (code === undefined || code === null || code === '') return
	uni.setStorageSync(STORAGE_KEY, String(code))
}

export function getCachedRegisterInviteCode(): string {
	const cached = uni.getStorageSync(STORAGE_KEY)
	if (cached !== undefined && cached !== null && String(cached).trim()) {
		return String(cached).trim()
	}
	const configured = getDefaultRegisterInviteCode()
	return configured != null ? String(configured).trim() : ''
}

export function resolveRegisterInviteCode(manualValue: string): string {
	const manual = String(manualValue || '').trim()
	if (manual) return manual
	return getCachedRegisterInviteCode()
}

export function hasAutoRegisterInviteCode(manualValue = ''): boolean {
	return !!resolveRegisterInviteCode(manualValue)
}
