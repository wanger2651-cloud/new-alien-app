/**
 * 跨端安全解析日期（兼容 iOS 不支持 "yyyy-MM-dd HH:mm:ss" 的问题）
 */
export function parseDateSafe(val: unknown): Date | null {
	if (val == null || val === '') return null
	if (val instanceof Date) return Number.isNaN(val.getTime()) ? null : val
	if (typeof val === 'number') {
		const d = new Date(val)
		return Number.isNaN(d.getTime()) ? null : d
	}
	if (typeof val === 'string') {
		const trimmed = val.trim()
		if (!trimmed) return null
		let d = new Date(trimmed)
		if (!Number.isNaN(d.getTime())) return d
		if (/^\d{4}-\d{2}-\d{2}\s/.test(trimmed)) {
			d = new Date(trimmed.replace(' ', 'T'))
			if (!Number.isNaN(d.getTime())) return d
		}
		d = new Date(trimmed.replace(/-/g, '/'))
		if (!Number.isNaN(d.getTime())) return d
	}
	return null
}

export function parseDateTimestamp(val: unknown, fallback = Number.NaN): number {
	const ts = parseDateSafe(val)?.getTime()
	return ts == null || Number.isNaN(ts) ? fallback : ts
}

export function formatDateYMD(val: unknown, emptyText = '已到期'): string {
	const d = parseDateSafe(val)
	if (!d) return emptyText
	const y = d.getFullYear()
	const m = String(d.getMonth() + 1).padStart(2, '0')
	const day = String(d.getDate()).padStart(2, '0')
	return `${y}-${m}-${day}`
}
