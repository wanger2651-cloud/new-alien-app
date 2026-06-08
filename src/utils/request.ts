// import API_CONFIG from '@/config/index'
import router from '@/router'
import useAccountStore from '@/store/account'
import { debounce } from '@/utils/common'
import { useAuthStore } from '@/store/auth.ts'
import { getLineApiUrl } from '@/config/lineConfig'
import {
	getEncRuntimeOptions,
	encodeEncApiRequest,
	decodeEncApiResponse,
	objectToBytes,
	bytesToJson,
	buildRouteWithParams
} from '@/utils/encApi.js'

let authStore : any = null
function getAuthStore() {
	if (authStore) {
		return authStore;
	}
	authStore = useAuthStore()

}
export interface RequestOptions {
	url : string
	path ?: string  // 可选属性，因为实际代码中未使用
	data ?: Record<string, any>
	method ?: UniNamespace.RequestOptions['method']
	header ?: Record<string, any>
	loading ?: boolean | string | UniNamespace.ShowLoadingOptions
	responseType ?: 'arraybuffer' | 'text'
	dataType ?: 'json' | 'text'
	authRequired ?: boolean
}

export interface RequestConfig extends RequestOptions {
	url : string
	baseURL : string
}

export type ResponseResult = Pick<
	UniApp.RequestSuccessCallbackResult,
	'cookies' | 'errMsg' | 'header' | 'profile' | 'statusCode'
> & {
	config : RequestConfig
	data : ResponseData
}

export interface ResponseData<T = any> {
	Data : T
	Success : boolean
	Msg : string
	Total : number
	Code : number
}

/**
 * 与 PC `ApiManager` / 后端 JWT 约定一致：`Authorization: Bearer <token>`
 */
const formatAuthorizationBearer = (raw : string | undefined) : string | undefined => {
	if (!raw || String(raw).trim() === '') {
		return undefined
	}
	const t = String(raw).trim()
	if (/^Bearer\s+/i.test(t)) {
		return t.replace(/^bearer\s+/i, 'Bearer ')
	}
	return `Bearer ${t}`
}

/**
 * 请求拦截器
 * @param config
 * @returns
 */
const requestInterceptor = (config : RequestConfig) => {
	const store = useAccountStore()
	store.syncTokenFromStorage()
	const token = store.token
	if (config.authRequired && !token) {
		openLogin()
		throw new Error('请求接口未登录')
	}
	const bearer = formatAuthorizationBearer(token)
	if (bearer) {
		config.header = { ...config.header, Authorization: bearer }
	}
	// #ifdef APP-PLUS
	config.header = { ...config.header, 'client-version': '5.2.7' }
	// #endif
	return config
}

const isEncApiPath = (url : string) => url.toLowerCase().includes('/encapi')

/**
 * 打开登录
 */
const openLogin = debounce(() =>
	router.push('/pages/login/chooseUser?showModal=true')
)

/**
 * 响应拦截器
 * @param res
 * @returns
 */
const responseInterceptor = (res : ResponseResult) => {
	const encOptions = getEncRuntimeOptions()
	const encResponseFlag =
		!!encOptions.enabled
		&& res.config?.responseType === 'arraybuffer'
		&& !!res.config?.url
		&& isEncApiPath(res.config.url)
		&& !!res.data
	if (encResponseFlag) {
		const bufferData = res.data as unknown as ArrayBuffer
		const decoded = decodeEncApiResponse(new Uint8Array(bufferData), encOptions)
		res.statusCode = decoded.statusCode
		res.data = bytesToJson(decoded.bodyBytes)
	}
	// 登录过期
	if (res.statusCode === 401) {
		uni.showToast({
			title: '请求接口未登录',
			icon: 'error',
			duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
			mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
		});
		getAuthStore().clearToken()
		setTimeout(() => {
			uni.navigateTo({
				url: '/pages/login/chooseUser'
			});
		}, 2000)
		// const store = useAccountStore()
		// store.logout()
		// openLogin()
	}
	// 请求接口错误
	if (res.statusCode !== 200) {
		// 安全地提取错误消息，确保是字符串
		let errorMsg = `请求失败 (状态码: ${res.statusCode})`
		if (res.data) {
			if (typeof res.data.message === 'string') {
				errorMsg = res.data.message
			} else if (typeof res.data.Msg === 'string') {
				errorMsg = res.data.Msg
			} else if (typeof res.data.msg === 'string') {
				errorMsg = res.data.msg
			}
		}
		console.error('请求接口错误:', {
			statusCode: res.statusCode,
			url: res.config?.url,
			data: res.data,
			response: res
		})
		// 404错误可能是接口路径不存在，不抛出错误，让调用方处理
		if (res.statusCode === 404) {
			console.warn('接口不存在 (404):', res.config?.url)
			// 不显示弹窗，只记录警告
		} else {
			// 其他错误显示提示，确保 content 是字符串
			uni.showModal({
				title: '提示',
				content: String(errorMsg),
				confirmText: "确定",
				showCancel: false,
				success: () => {}
			});
		}
		throw new Error(String(errorMsg))
	}
	// 登录成功
	if (res.data.Success && res.data.Msg?.includes('成功')) {
		uni.showToast({
			title: res.data.Msg,
			icon: 'success'
		})
	} else if (res.data.Success && res.data.Data && res.data.Data.AccessToken) {
		const { AccessToken: data } = res.data.Data
		const store = useAccountStore()
		store.login(data)
	}
	// 检查是否有序列化错误（Furion异常等）
	if (res.data && typeof res.data === 'object' && res.data.message && typeof res.data.message === 'string') {
		if (res.data.message.includes('codec') || res.data.message.includes('Furion') || res.data.message.includes('FriendlyException')) {
			throw new Error(res.data.message || '请求处理失败，请稍后重试')
		}
	}
	
	// 请求接口失败
	// 兼容两种响应格式：
	// 1. { Success: true, Data: [...], Code: 200, Msg: '' } - 标准ResponseData格式
	// 2. { data: [...], message: "请求成功" } - 实际API返回格式
	// 如果 res.data.Success 存在且为 false，说明请求失败
	// 如果 res.data.Success 不存在，但有 res.data.data 数组，说明是成功响应
	if (res.data && typeof res.data === 'object' && !Array.isArray(res.data)) {
		// 优先检查成功响应：如果 Success 为 true 或者 code 为 200，直接返回
		if (res.data.Success === true || res.data.code === 200 || res.data.Code === 200) {
			// 成功响应，直接返回
			return res
		}
		
		// 如果是对象且不是数组，检查 Success 字段
		// 只有当 Success 明确为 false 时才抛出错误
		// 如果 Success 不存在，但有 data 数组，说明是成功响应（实际API格式）
		if (res.data.Success === false) {
			// 安全地提取错误消息，确保是字符串
			let errorMsg = '请求失败'
			if (typeof res.data.message === 'string') {
				errorMsg = res.data.message
			} else if (typeof res.data.Msg === 'string') {
				errorMsg = res.data.Msg
			} else if (typeof res.data.msg === 'string') {
				errorMsg = res.data.msg
			}
			uni.showModal({
				title: '提示',
				content: String(errorMsg),
				confirmText: "确定",
				showCancel: false,
				success: (res) => {
				}
			});
			throw new Error(String(errorMsg))
		}
		// 如果 Success 不存在，且没有 data 数组，也没有 Data 数组，可能是失败响应
		// 但为了兼容性，我们暂时不抛出错误，让调用方处理
		if (res.data.Success === undefined && !Array.isArray(res.data.data) && !Array.isArray(res.data.Data) && !res.data.message && !res.data.code && !res.data.Code) {
			// 这种情况下，如果既没有 Success，也没有 data/Data 数组，也没有 message，也没有 code，可能是错误响应
			// 但为了兼容性，我们暂时不抛出错误，让调用方处理
		}
	}
	return res
}

/**
 * 请求
 * @param options
 * @returns
 */
const request = async <T = any>(options : RequestOptions) => {
	const { url, path, data, method, header, loading, responseType, authRequired } = options
	// 从本地存储读取保存的API地址，如果没有则使用默认线路的地址
	const savedApiBaseUrl = uni.getStorageSync('apiBaseUrl')
	// 如果没有保存的地址，则从本地存储读取线路类型，使用对应线路的地址
	let defaultApiBaseUrl = getLineApiUrl('default')
	const savedLineType = uni.getStorageSync('lineType')
	if (savedLineType && !savedApiBaseUrl) {
		defaultApiBaseUrl = getLineApiUrl(savedLineType)
	}
	let API_CONFIG = savedApiBaseUrl || defaultApiBaseUrl
	// 确保API_CONFIG格式正确（以/结尾，且不包含协议外的其他路径）
	if (API_CONFIG && !API_CONFIG.endsWith('/')) {
		API_CONFIG = API_CONFIG + '/'
	}
	// API_CONFIG.baseURL='https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run/'
	// const regexp = /^(http|https|file):\/\//
	// const url = path
	// const urlTog = regexp.test(path)
	//   ? path
	//   : `${API_CONFIG}${path.startsWith('/') ? path : `/${path}`}`
	const test = getAuthStore() || getAuthStore().token
	// 确保url参数格式正确（去除开头的/，因为API_CONFIG已经以/结尾）
	const cleanUrl = url.startsWith('/') ? url.substring(1) : url
	let finalUrl = API_CONFIG + cleanUrl
	let requestData = data
	
	// 对于 GET 请求，uni.request 会自动将 data 转换为 URL 查询参数
	// 但为了确保兼容性，我们也可以手动构建 URL（可选）
	// 注意：uni.request 的 data 参数在 GET 请求中会自动处理，所以我们保持原样
	
	const config = requestInterceptor({
		baseURL: API_CONFIG,
		url: finalUrl,
		path,
		method,
		data: requestData, // uni.request 会自动将 GET 请求的 data 转换为 URL 查询参数
		header: {
			...header, // 合并传入的header
			Authorization: formatAuthorizationBearer(getAuthStore()?.token || '') || '',
			'Content-Type': method === 'POST' && !header?.['Content-Type'] ? 'application/json' : (header?.['Content-Type'] || 'application/json')
		},
		loading,
		responseType,
		authRequired
	})
	const encOptions = getEncRuntimeOptions()
	const encContentType = String(config.header?.['Content-Type'] || config.header?.['content-type'] || '').toLowerCase()
	const isMultipart = encContentType.includes('multipart/form-data')
	if (encOptions.enabled && !isEncApiPath(config.url) && !isMultipart) {
		const queryParams = (String(config.method || 'GET').toUpperCase() === 'GET' ? (options.data || {}) : {})
		const route = buildRouteWithParams(cleanUrl.startsWith('/') ? cleanUrl : `/${cleanUrl}`, queryParams)
		const packet = encodeEncApiRequest({
			method: (config.method || 'GET').toUpperCase(),
			route,
			headers: {
				authorization: config.header?.Authorization || '',
				'client-version': config.header?.['client-version'] || '',
				// #ifdef APP-PLUS
				'x-uniapp-client': '1',
				// #endif
				'content-type': config.header?.['Content-Type'] || 'application/json'
			},
			bodyBytes: objectToBytes(String(config.method || 'GET').toUpperCase() === 'GET' ? null : config.data)
		}, encOptions)
		config.url = API_CONFIG + 'encapi'
		config.method = 'POST'
		config.data = packet.buffer.slice(packet.byteOffset, packet.byteOffset + packet.byteLength)
		config.header = {
			...config.header,
			'Content-Type': 'application/octet-stream'
		}
		if (encOptions.debugToken) {
			config.header['X-Enc-Debug-Token'] = encOptions.debugToken
		}
		if (encOptions.forceHeader) {
			config.header['X-Enc-Force'] = '1'
		}
		config.responseType = 'arraybuffer'
	}
	if (loading) {
		uni.showLoading(
			typeof loading === 'boolean'
				? { title: '加载中', mask: true }
				: typeof loading === 'string'
					? { title: loading, mask: true }
					: loading
		)
	}
	const res = await uni
		.request({
			url: config.url,
			method: config.method,
			data: config.data,
			header: config.header,
			responseType: config.responseType
		})
		.then(
			(res) => responseInterceptor(<ResponseResult>{ config, ...res }),
			(res) => {
				throw res instanceof Error
					? res
					: new Error(typeof res === 'object' ? res.errMsg : res)
			}
		)
		.finally(() =>
			setTimeout(() => {
				loading && uni.hideLoading()
			}, 200)
		)
	return <ResponseData<T>>res.data
}

export default request