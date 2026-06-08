/**
 * PayOrder API 请求类
 * 命名空间: Alien.Module.Pay.Api.Controllers
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BatchCreateOrderRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/BatchCreateOrderRequest";
import {BatchCreateOrderResult} from "@/TsModel/Alien/Module/Pay/Application/Contracts/BatchCreateOrderResult";
import {CreateAdminOrderRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/CreateAdminOrderRequest";
import {CreateOrderRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/CreateOrderRequest";
import {CreateOrderResult} from "@/TsModel/Alien/Module/Pay/Application/Contracts/CreateOrderResult";
import {FunctionPriceItemVo} from "@/TsModel/Alien/Module/Pay/Application/Contracts/FunctionPriceItemVo";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_pay_order} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_order";

export class PayOrderApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async GetQuote(functionPriceId: string): Promise<FunctionPriceItemVo> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayOrder/GetQuote`,
			params: { functionPriceId },
		};

		const response: AxiosResponse<FunctionPriceItemVo> = await this.axiosInstance(config);
		return response.data;
	}

	async GetQuoteList(shopType: ShopType, priceTitle: string, isKeyWord: boolean): Promise<FunctionPriceItemVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayOrder/GetQuoteList`,
			params: { shopType, priceTitle, isKeyWord },
		};

		const response: AxiosResponse<FunctionPriceItemVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	async CreateOrder(request: CreateOrderRequest): Promise<CreateOrderResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayOrder/CreateOrder`,
			data: request,
		};

		const response: AxiosResponse<CreateOrderResult> = await this.axiosInstance(config);
		return response.data;
	}

	async CreateBatchOrder(request: BatchCreateOrderRequest): Promise<BatchCreateOrderResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayOrder/CreateBatchOrder`,
			data: request,
		};

		const response: AxiosResponse<BatchCreateOrderResult> = await this.axiosInstance(config);
		return response.data;
	}

	async CreateAdminOrder(request: CreateAdminOrderRequest): Promise<CreateOrderResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayOrder/CreateAdminOrder`,
			data: request,
		};

		const response: AxiosResponse<CreateOrderResult> = await this.axiosInstance(config);
		return response.data;
	}

	async QueryStatus(orderNo: string): Promise<t_pay_order> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayOrder/QueryStatus`,
			params: { orderNo },
		};

		const response: AxiosResponse<t_pay_order> = await this.axiosInstance(config);
		return response.data;
	}

}
