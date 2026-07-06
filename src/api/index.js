import Request from './request'
import apiList from './api'
import store from './store/index.js'

export default function api(url, data = {}) {
	const request = new Request();
	let api = getApiObj(url);
    
	request.interceptor.request((config, cancel) => { /* 请求之前拦截器 */
        let tokenFlag = store.getters.loginFlag;
		config.header['X-Access-Token'] = uni.getStorageSync('tokenInfo') ? uni.getStorageSync('tokenInfo'):'';
		// #ifdef APP-PLUS
		config.header['client-version'] = '5.2.7';
		// #endif
		return config
	});

	request.interceptor.response((response) => { /* 请求之后拦截器 */

		if (response.data.code == 401) { // 服务端返回的状态码等于500，有可能就是token失效，请求是否失效并且跳转登录
		uni.showModal({
			title: '提示',
			content: '登录失效，是否重新登录？',
			success: async (res) => {
				if (res.confirm) {
					uni.reLaunch({
						url: '/pages/login/chooseUser'
					})
				}
			}
		});
		}

		// if (response.config.custom.verification) { // 演示自定义参数的作用
		//   return response.data
		// }
		return response
	}, (response) => { // 预留可以日志上报
		return response
	})

	return request.request({
		url: api.url,
		data,
		method: api.method
	})

}

function getApiObj(url) {
	let apiArray = url.split(".");
	let api = apiList;
	apiArray.forEach(v => {
		api = api[v];
	});
	return api;
}
