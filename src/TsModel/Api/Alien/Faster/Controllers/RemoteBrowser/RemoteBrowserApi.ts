/**
 * RemoteBrowser API 请求类
 * 命名空间: Alien.Faster.Controllers.RemoteBrowser
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {GetShopsForRemoteBrowserRequest} from "@/TsModel/Alien/Faster/Models/RemoteBrowser/GetShopsForRemoteBrowserRequest";
import {RemoteBrowserKeyResult} from "@/TsModel/Alien/Faster/Controllers/RemoteBrowser/RemoteBrowserKeyResult";
import {RemoteBrowserShopItem} from "@/TsModel/Alien/Entity/RemoteBrowser/RemoteBrowserShopItem";

/** 远程浏览器（Electron）连接密钥等 */
export class RemoteBrowserApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	/** 获取店铺远程浏览器连接密钥，用于 Electron JoinRemoteBrowser */
	async GetConnectionKey(shopId: string, shopType: number): Promise<RemoteBrowserKeyResult> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/RemoteBrowser/GetConnectionKey`,
			params: { shopId, shopType },
		};

		const response: AxiosResponse<RemoteBrowserKeyResult> = await this.axiosInstance(config);
		return response.data;
	}

	/** 获取需要打开远程浏览器的店铺（老到新复制、竞对等场景）。
老到新复制时传入 [老店id, 新店id]；竞对复制时只传 [新店id]。按店铺类型分组，取每个分组的第一个店铺判断平台是否需要远程浏览器，只返回需要远程浏览器的平台下的店铺。对传入的每个店铺做存在性和权限校验。 */
	async GetShopsForRemoteBrowser(request: GetShopsForRemoteBrowserRequest): Promise<RemoteBrowserShopItem[]> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/RemoteBrowser/GetShopsForRemoteBrowser`,
			data: request,
		};

		const response: AxiosResponse<RemoteBrowserShopItem[]> = await this.axiosInstance(config);
		return response.data;
	}

}
