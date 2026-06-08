/**
 * PayQuery API 请求类
 * 命名空间: Alien.Module.Pay.Api.Controllers
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BatchSaveMyMarkupsRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/BatchSaveMyMarkupsRequest";
import {BillSettleStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/BillSettleStatus";
import {ChangeWalletAddressRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/ChangeWalletAddressRequest";
import {MyMarkupQuoteDto} from "@/TsModel/Alien/Module/Pay/Application/Contracts/MyMarkupQuoteDto";
import {PayBillVo} from "@/TsModel/Alien/Module/Pay/Application/Contracts/PayBillVo";
import {PayOrderStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/PayOrderStatus";
import {RenewChannelVo} from "@/TsModel/Alien/Module/Pay/Application/Contracts/RenewChannelVo";
import {SetWalletMinSettleRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/SetWalletMinSettleRequest";
import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {SubAgentVo} from "@/TsModel/Alien/Module/Pay/Application/Contracts/SubAgentVo";
import {t_pay_agent_func_markup} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_agent_func_markup";
import {t_pay_agent_relation} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_agent_relation";
import {t_pay_order} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_order";
import {t_pay_wallet} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_wallet";
import {WalletTransferResult} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletTransferResult";
import {WalletWithdrawRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletWithdrawRequest";
import type { PageResultVo } from '@/TsModel/Alien/Entity/GlobalModel/PageResultVo';

export class PayQueryApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async GetRenewChannels(): Promise<RenewChannelVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetRenewChannels`,
		};

		const response: AxiosResponse<RenewChannelVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	async GetMyMarkupQuoteList(shopType: ShopType, priceTitle: string, isKeyWord: boolean): Promise<MyMarkupQuoteDto[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetMyMarkupQuoteList`,
			params: { shopType, priceTitle, isKeyWord },
		};

		const response: AxiosResponse<MyMarkupQuoteDto[]> = await this.axiosInstance(config);
		return response.data;
	}

	async GetMyWallets(): Promise<t_pay_wallet[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetMyWallets`,
		};

		const response: AxiosResponse<t_pay_wallet[]> = await this.axiosInstance(config);
		return response.data;
	}

	async RefreshMyWalletBalances(): Promise<t_pay_wallet[]> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayQuery/RefreshMyWalletBalances`,
		};

		const response: AxiosResponse<t_pay_wallet[]> = await this.axiosInstance(config);
		return response.data;
	}

	async WithdrawMyWallet(request: WalletWithdrawRequest): Promise<WalletTransferResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayQuery/WithdrawMyWallet`,
			data: request,
		};

		const response: AxiosResponse<WalletTransferResult> = await this.axiosInstance(config);
		return response.data;
	}

	async ChangeMyWalletAddress(request: ChangeWalletAddressRequest): Promise<t_pay_wallet> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayQuery/ChangeMyWalletAddress`,
			data: request,
		};

		const response: AxiosResponse<t_pay_wallet> = await this.axiosInstance(config);
		return response.data;
	}

	async SetMyWalletMinSettle(request: SetWalletMinSettleRequest): Promise<t_pay_wallet> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayQuery/SetMyWalletMinSettle`,
			data: request,
		};

		const response: AxiosResponse<t_pay_wallet> = await this.axiosInstance(config);
		return response.data;
	}

	async GetMyAgentInfo(): Promise<t_pay_agent_relation> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetMyAgentInfo`,
		};

		const response: AxiosResponse<t_pay_agent_relation> = await this.axiosInstance(config);
		return response.data;
	}

	async GetMyOrders(page: number, pageSize: number, order_status?: PayOrderStatus): Promise<PageResultVo<t_pay_order>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetMyOrders`,
			params: { order_status, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_pay_order>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetMyBills(page: number, pageSize: number, settle_status?: BillSettleStatus, order_no?: string, channel_id?: string): Promise<PageResultVo<PayBillVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetMyBills`,
			params: { settle_status, order_no, channel_id, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<PayBillVo>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetMyMarkups(): Promise<t_pay_agent_func_markup[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetMyMarkups`,
		};

		const response: AxiosResponse<t_pay_agent_func_markup[]> = await this.axiosInstance(config);
		return response.data;
	}

	async SaveMyMarkups(request: BatchSaveMyMarkupsRequest): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayQuery/SaveMyMarkups`,
			data: request,
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	async GetSubAgents(): Promise<SubAgentVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetSubAgents`,
		};

		const response: AxiosResponse<SubAgentVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	async GetSubAgentsPage(page: number, pageSize: number, allSub: boolean): Promise<PageResultVo<SubAgentVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetSubAgentsPage`,
			params: { page, pageSize, allSub },
		};

		const response: AxiosResponse<PageResultVo<SubAgentVo>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetSubAgentsWithoutShare(page: number, pageSize: number): Promise<PageResultVo<SubAgentVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetSubAgentsWithoutShare`,
			params: { page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<SubAgentVo>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetSubAgentMarkups(subUserId: string): Promise<t_pay_agent_func_markup[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayQuery/GetSubAgentMarkups`,
			params: { subUserId },
		};

		const response: AxiosResponse<t_pay_agent_func_markup[]> = await this.axiosInstance(config);
		return response.data;
	}

	async EnsureMyAgentRelation(): Promise<t_pay_agent_relation> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayQuery/EnsureMyAgentRelation`,
		};

		const response: AxiosResponse<t_pay_agent_relation> = await this.axiosInstance(config);
		return response.data;
	}

}
