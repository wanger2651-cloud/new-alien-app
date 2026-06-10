/**
 * 注册邀请码配置
 *
 * 后端强制要求 codeOrTeamId。App 会按顺序自动使用：
 * 1. 本文件 DEFAULT_REGISTER_INVITE_CODE
 * 2. 登录成功后缓存的 Invite_Code（见 registerInvite.ts）
 *
 * 若都没有，注册页会显示邀请码输入框。
 */
export const DEFAULT_REGISTER_INVITE_CODE = '189191'

/** 有自动邀请码时隐藏输入框；没有则自动显示让用户填写 */
export const HIDE_REGISTER_INVITE_INPUT = true

export function getDefaultRegisterInviteCode(): number | string | null {
	const raw = String(DEFAULT_REGISTER_INVITE_CODE || '').trim()
	if (!raw) return null
	if (/^\d+$/.test(raw)) return Number(raw)
	return raw
}
