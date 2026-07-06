const CACHE_PREFIX = 'mp_store_list_v1_'
const CACHE_TTL_MS = 60_000

export type MpStoreListCache = {
	shopType: number
	rows: Record<string, unknown>[]
	total: number
	ts: number
}

function cacheKey(shopType: number) {
	return `${CACHE_PREFIX}${shopType}`
}

export function readMpStoreListCache(shopType: number): MpStoreListCache | null {
	try {
		const raw = uni.getStorageSync(cacheKey(shopType))
		if (!raw || typeof raw !== 'object') return null
		const entry = raw as MpStoreListCache
		if (!Array.isArray(entry.rows) || typeof entry.total !== 'number' || typeof entry.ts !== 'number') {
			return null
		}
		if (Date.now() - entry.ts > CACHE_TTL_MS) return null
		return entry
	} catch {
		return null
	}
}

export function writeMpStoreListCache(payload: Omit<MpStoreListCache, 'ts'>) {
	try {
		uni.setStorageSync(cacheKey(payload.shopType), {
			...payload,
			ts: Date.now(),
		})
	} catch {
		// ignore quota / serialization errors
	}
}
