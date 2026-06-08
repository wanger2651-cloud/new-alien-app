/**
 * PayAgent API 请求类
 * 命名空间: Alien.Module.Pay.Api.Controllers
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {SetAgentMarkupRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/SetAgentMarkupRequest";
import {SetChildMaxShareRatioRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/SetChildMaxShareRatioRequest";
import {WalletInitResult} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletInitResult";

export class PayAgentApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async SetChildMaxShareRatio(request: SetChildMaxShareRatioRequest): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAgent/SetChildMaxShareRatio`,
			data: request,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	async SetAgentMarkup(request: SetAgentMarkupRequest): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAgent/SetAgentMarkup`,
			data: request,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	async InitMyWallets(): Promise<WalletInitResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAgent/InitMyWallets`,
		};

		const response: AxiosResponse<WalletInitResult> = await this.axiosInstance(config);
		return response.data;
	}

}
