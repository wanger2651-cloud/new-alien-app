import { chacha20poly1305 } from '@noble/ciphers/chacha.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { utf8ToBytes } from '@noble/hashes/utils.js'
import { decompressSync } from 'fflate'

export const EncCompressionType = {
	None: 0,
	Brotli: 1,
	Gzip: 2
}

const MAGIC = 0x454e4331
const VERSION = 1
const ALGORITHM = 1
const NONCE_SIZE = 12
const TAG_SIZE = 16

/** 与 new-alien-web 一致，便于两端切换状态对齐 */
const ENCAPI_ENABLED_STORAGE_KEY = 'encApiEnabled'

const readEncSwitchStorage = () => uni.getStorageSync(ENCAPI_ENABLED_STORAGE_KEY)

/**
 * 将开关入参统一为布尔（wd-switch 等可能传出 { value: false } 对象，不能直接用 truthy 判断）
 * @param {unknown} input
 * @returns {boolean}
 */
const normalizeEncSwitchValue = (input) => {
	if (input && typeof input === 'object' && 'value' in input) {
		return normalizeEncSwitchValue(input.value)
	}
	if (input === true || input === '1' || input === 1) return true
	if (input === false || input === '0' || input === 0) return false
	return Boolean(input)
}

/**
 * 读取 UI 开关状态（仅本地偏好，与 env 是否开启加密通道无关）
 * @returns {boolean}
 */
export const getEncApiSwitchEnabled = () => {
	const envEnabled = import.meta.env.VITE_ENCAPI_ENABLED === 'true'
	const stored = readEncSwitchStorage()
	if (stored === '' || stored === null || stored === undefined) {
		uni.setStorageSync(ENCAPI_ENABLED_STORAGE_KEY, envEnabled ? '1' : '0')
		return envEnabled
	}
	return String(stored) === '1'
}

/**
 * 持久化 UI 开关
 * @param {unknown} enabled 布尔或 wd-switch 传入的对象形态
 */
export const setEncApiSwitchEnabled = (enabled) => {
	const on = normalizeEncSwitchValue(enabled)
	uni.setStorageSync(ENCAPI_ENABLED_STORAGE_KEY, on ? '1' : '0')
}

export const ENC_TEST_VECTOR = {
	secret: 'encapi-test-secret-v1',
	nonceText: 'nonce-test-01',
	timestampMs: 1735689600000,
	route: '/payquery/getmywallets?shopId=1',
	method: 'POST'
}

const resolveServiceGlobal = () => {
	if (typeof uni !== 'undefined' && uni && typeof uni.requireGlobal === 'function') {
		return uni.requireGlobal()
	}
	return typeof globalThis !== 'undefined' ? globalThis : {}
}

let textEncoder
let textDecoder

const getTextEncoder = () => {
	if (!textEncoder) {
		const GlobalTextEncoder = typeof TextEncoder !== 'undefined'
			? TextEncoder
			: resolveServiceGlobal().TextEncoder
		textEncoder = new GlobalTextEncoder()
	}
	return textEncoder
}

const getTextDecoder = () => {
	if (!textDecoder) {
		const GlobalTextDecoder = typeof TextDecoder !== 'undefined'
			? TextDecoder
			: resolveServiceGlobal().TextDecoder
		textDecoder = new GlobalTextDecoder()
	}
	return textDecoder
}

const numberToBytes = (value) => {
	const buf = new ArrayBuffer(4)
	new DataView(buf).setInt32(0, value, true)
	return new Uint8Array(buf)
}

const longToBytes = (value) => {
	const buf = new ArrayBuffer(8)
	new DataView(buf).setBigInt64(0, BigInt(value), true)
	return new Uint8Array(buf)
}

const bytesToNumber = (bytes) => new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getInt32(0, true)
const bytesToLong = (bytes) => Number(new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength).getBigInt64(0, true))

const concatBytes = (...buffers) => {
	const len = buffers.reduce((sum, item) => sum + item.length, 0)
	const out = new Uint8Array(len)
	let offset = 0
	buffers.forEach((item) => {
		out.set(item, offset)
		offset += item.length
	})
	return out
}

const writeString = (parts, value) => {
	const bytes = getTextEncoder().encode(value)
	parts.push(numberToBytes(bytes.length))
	parts.push(bytes)
}

const readString = (bytes, offsetRef) => {
	const len = bytesToNumber(bytes.slice(offsetRef.value, offsetRef.value + 4))
	offsetRef.value += 4
	const valueBytes = bytes.slice(offsetRef.value, offsetRef.value + len)
	offsetRef.value += len
	return getTextDecoder().decode(valueBytes)
}

const encodeRequestPayload = (payload) => {
	const parts = []
	writeString(parts, payload.method.toUpperCase())
	writeString(parts, payload.route)
	writeString(parts, JSON.stringify(payload.headers || {}))
	parts.push(numberToBytes(payload.bodyBytes.length))
	parts.push(payload.bodyBytes)
	return concatBytes(...parts)
}

const decodeResponsePayload = (plainBytes) => {
	const offsetRef = { value: 0 }
	const statusCode = bytesToNumber(plainBytes.slice(offsetRef.value, offsetRef.value + 4))
	offsetRef.value += 4
	const headerJson = readString(plainBytes, offsetRef)
	const bodyLen = bytesToNumber(plainBytes.slice(offsetRef.value, offsetRef.value + 4))
	offsetRef.value += 4
	const bodyBytes = plainBytes.slice(offsetRef.value, offsetRef.value + bodyLen)
	return {
		statusCode,
		headers: JSON.parse(headerJson || '{}'),
		bodyBytes
	}
}

const encodeFrame = (timestampMs, compressionType, nonce, cipherBytes, tag) => {
	return concatBytes(
		numberToBytes(MAGIC),
		new Uint8Array([VERSION]),
		new Uint8Array([ALGORITHM]),
		new Uint8Array([compressionType]),
		longToBytes(timestampMs),
		new Uint8Array([nonce.length]),
		nonce,
		numberToBytes(cipherBytes.length),
		cipherBytes,
		new Uint8Array([tag.length]),
		tag
	)
}

const decodeFrame = (frameBytes) => {
	let offset = 0
	const magic = bytesToNumber(frameBytes.slice(offset, offset + 4))
	offset += 4
	if (magic !== MAGIC) throw new Error('EncAPI magic 无效')
	const version = frameBytes[offset++]
	if (version !== VERSION) throw new Error('EncAPI version 无效')
	const algorithm = frameBytes[offset++]
	if (algorithm !== ALGORITHM) throw new Error('EncAPI algorithm 无效')
	const compressionType = frameBytes[offset++]
	const timestampMs = bytesToLong(frameBytes.slice(offset, offset + 8))
	offset += 8
	const nonceLen = frameBytes[offset++]
	const nonce = frameBytes.slice(offset, offset + nonceLen)
	offset += nonceLen
	const cipherLen = bytesToNumber(frameBytes.slice(offset, offset + 4))
	offset += 4
	const cipherBytes = frameBytes.slice(offset, offset + cipherLen)
	offset += cipherLen
	const tagLen = frameBytes[offset++]
	const tag = frameBytes.slice(offset, offset + tagLen)
	return { compressionType, timestampMs, nonce, cipherBytes, tag }
}

const buildKey = (secret) => sha256(utf8ToBytes((secret || '').trim()))

const randomBytes = (size) => {
	const bytes = new Uint8Array(size)
	crypto.getRandomValues(bytes)
	return bytes
}

const compress = (input) => input
const decompress = (input, compressionType) => {
	if (compressionType === EncCompressionType.None) return input
	if (compressionType === EncCompressionType.Gzip) return decompressSync(input)
	if (compressionType === EncCompressionType.Brotli) return decompressSync(input)
	throw new Error(`不支持的压缩类型: ${compressionType}`)
}

export const getEncRuntimeOptions = () => ({
	enabled: (() => {
		const envEnabled = import.meta.env.VITE_ENCAPI_ENABLED === 'true'
		const stored = readEncSwitchStorage()
		if (stored === '' || stored === null || stored === undefined) {
			uni.setStorageSync(ENCAPI_ENABLED_STORAGE_KEY, envEnabled ? '1' : '0')
			return envEnabled
		}
		return envEnabled && String(stored) === '1'
	})(),
	debugToken: import.meta.env.VITE_ENCAPI_DEBUG_TOKEN || '',
	secret: import.meta.env.VITE_ENCAPI_KEY || '',
	forceHeader: import.meta.env.VITE_ENCAPI_FORCE_HEADER === 'true'
})

export const encodeEncApiRequest = (payload, options) => {
	const compressionType = EncCompressionType.None
	const plain = encodeRequestPayload(payload)
	const compressed = compress(plain)
	const nonce = randomBytes(NONCE_SIZE)
	const key = buildKey(options.secret)
	const aead = chacha20poly1305(key, nonce)
	const encrypted = aead.encrypt(compressed)
	const cipherBytes = encrypted.slice(0, encrypted.length - TAG_SIZE)
	const tag = encrypted.slice(encrypted.length - TAG_SIZE)
	return encodeFrame(Date.now(), compressionType, nonce, cipherBytes, tag)
}

export const decodeEncApiResponse = (frameBytes, options) => {
	const frame = decodeFrame(frameBytes)
	const key = buildKey(options.secret)
	const aead = chacha20poly1305(key, frame.nonce)
	const plainCompressed = aead.decrypt(concatBytes(frame.cipherBytes, frame.tag))
	const plainBytes = decompress(plainCompressed, frame.compressionType)
	const decoded = decodeResponsePayload(plainBytes)
	return decoded
}

export const objectToBytes = (input) => {
	if (input === undefined || input === null) return new Uint8Array(0)
	if (input instanceof ArrayBuffer) return new Uint8Array(input)
	if (input instanceof Uint8Array) return input
	if (typeof input === 'string') return getTextEncoder().encode(input)
	return getTextEncoder().encode(JSON.stringify(input))
}

export const bytesToJson = (input) => {
	if (!input || input.length === 0) return null
	const text = getTextDecoder().decode(input)
	return JSON.parse(text)
}

export const buildRouteWithParams = (url, params) => {
	if (!params || Object.keys(params).length === 0) return url
	const query = Object.keys(params)
		.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
		.join('&')
	return url.includes('?') ? `${url}&${query}` : `${url}?${query}`
}
