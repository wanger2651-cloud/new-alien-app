/**
 * PopoPayCallback API 请求类
 * 命名空间: Alien.Module.Pay.Application.Services
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class PopoPayCallbackApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async PaidNotify(payload: any): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PopoPayCallback/PaidNotify`,
			data: payload,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async RefundNotify(payload: any): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PopoPayCallback/RefundNotify`,
			data: payload,
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

}
