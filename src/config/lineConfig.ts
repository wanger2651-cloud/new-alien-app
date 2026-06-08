// 线路配置
export interface LineConfig {
	baseUrl: string;
	name: string;
}

// 线路配置映射
export const LINE_CONFIG: Record<string, LineConfig> = {
	default: {
		baseUrl: 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run/',
		name: '默认线路'
	},
	backup: {
		baseUrl: 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run/',
		name: '备用线路'
	},
	international: {
		baseUrl: 'http://free.xiaolinmen.com/',
		name: '国际线路'
	},
	custom: {
		baseUrl: 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run/',
		name: '自定义线路'
	}
};

/**
 * 获取线路的API地址
 * @param lineType 线路类型
 * @returns API基础地址
 */
export function getLineApiUrl(lineType: string = 'default'): string {
	return LINE_CONFIG[lineType]?.baseUrl || LINE_CONFIG.default.baseUrl;
}

/**
 * 获取自定义线路的接口地址
 * @param apiType 接口类型: 'default' | 'move' | 'batchPrice'
 * @returns 接口地址
 */
export function getCustomLineApiUrl(apiType: 'default' | 'move' | 'batchPrice' = 'default'): string {
	const customUrls = uni.getStorageSync('customLineUrls')
	if (!customUrls) {
		return ''
	}
	
	switch (apiType) {
		case 'move':
			return customUrls.moveUrl || ''
		case 'batchPrice':
			return customUrls.batchPriceUrl || ''
		default:
			return customUrls.defaultUrl || ''
	}
}

