/** 从后端各种格式的 message 字段里提取可读错误文案 */
export function extractApiErrorMessage(payload: unknown, fallback = '请求失败'): string {
	if (payload == null) {
		return fallback
	}
	if (typeof payload === 'string') {
		const text = payload.trim()
		return text || fallback
	}
	if (typeof payload !== 'object') {
		return String(payload)
	}
	const obj = payload as Record<string, unknown>
	if (typeof obj.message === 'string' && obj.message.trim()) {
		return obj.message.trim()
	}
	if (typeof obj.Msg === 'string' && obj.Msg.trim()) {
		return obj.Msg.trim()
	}
	if (typeof obj.msg === 'string' && obj.msg.trim()) {
		return obj.msg.trim()
	}
	// 校验错误：{ message: { field: ["错误1"] } }
	if (obj.message && typeof obj.message === 'object') {
		const parts: string[] = []
		Object.values(obj.message as Record<string, unknown>).forEach((value) => {
			if (Array.isArray(value)) {
				value.forEach((item) => {
					if (typeof item === 'string' && item.trim()) {
						parts.push(item.trim())
					}
				})
			} else if (typeof value === 'string' && value.trim()) {
				parts.push(value.trim())
			}
		})
		if (parts.length) {
			return parts.join('；')
		}
	}
	return fallback
}

export function isApiSuccess(res: Record<string, unknown>): boolean {
	if (res.Success === true) {
		return true
	}
	const code = res.code ?? res.Code
	return code === 200 || code === '200'
}

export function getApiData<T = unknown>(res: Record<string, unknown>): T | undefined {
	if (res.data !== undefined && res.data !== null) {
		return res.data as T
	}
	if (res.Data !== undefined && res.Data !== null) {
		return res.Data as T
	}
	return undefined
}
