import {
	PRIVACY_AGREED_KEY,
	PRIVACY_URL,
	TERMS_URL
} from '@/config/privacyConfig'

export function hasAgreedPrivacy(): boolean {
	return uni.getStorageSync(PRIVACY_AGREED_KEY) === true
}

export function setPrivacyAgreed(): void {
	uni.setStorageSync(PRIVACY_AGREED_KEY, true)
}

export function openPolicyPage(url: string, title: string): void {
	uni.navigateTo({
		url: `/pages/common/policy-webview?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
	})
}

export function openTermsPage(): void {
	openPolicyPage(TERMS_URL, '用户服务协议')
}

export function openPrivacyPage(): void {
	openPolicyPage(PRIVACY_URL, '隐私政策')
}

export function exitApp(): void {
	// #ifdef APP-PLUS || APP-HARMONY
	plus.runtime.quit()
	// #endif
}

export function ensureLoginPrivacyAgreed(agreed: boolean): boolean {
	if (agreed) {
		return true
	}
	uni.showToast({
		title: '请先阅读并同意用户协议和隐私政策',
		icon: 'none',
		duration: 2500
	})
	return false
}
