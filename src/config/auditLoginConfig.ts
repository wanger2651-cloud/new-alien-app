/** 华为审核 / 内部测试账号：跳过腾讯令牌绑定与验证码 */
export const AUDIT_LOGIN_PHONES = [
	'13188888888',
	'13320981683'
]

export function isAuditLoginPhone(phone: string | number | undefined | null): boolean {
	const normalized = String(phone ?? '').trim()
	return AUDIT_LOGIN_PHONES.includes(normalized)
}
