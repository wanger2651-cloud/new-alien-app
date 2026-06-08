/**
 * PayAdmin API 请求类
 * 命名空间: Alien.Module.Pay.Api.Controllers
 * 自动生成，请勿手动修改
 */

import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

import {BillSettleStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/BillSettleStatus";
import {ChannelMetaVo} from "@/TsModel/Alien/Module/Pay/Application/Contracts/ChannelMetaVo";
import {PayBillVo} from "@/TsModel/Alien/Module/Pay/Application/Contracts/PayBillVo";
import {PayOrderStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/PayOrderStatus";
import {PayUserType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/PayUserType";
import {t_pay_channel} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_channel";
import {t_pay_order} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_order";
import {t_pay_wallet} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_wallet";
import {t_pay_withdraw_record} from "@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_withdraw_record";
import {WalletInitResult} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletInitResult";
import {WalletTransferRequest} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletTransferRequest";
import {WalletTransferResult} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletTransferResult";
import {WithdrawStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WithdrawStatus";
import type { PageResultVo } from '@/TsModel/Alien/Entity/GlobalModel/PageResultVo';

export class PayAdminApi {
	private baseUrl: string;
	private axiosInstance: AxiosInstance;

	constructor(axiosInstance: AxiosInstance, baseUrl: string = '') {
		this.axiosInstance = axiosInstance;
		this.baseUrl = baseUrl;
	}

	async GetChannelList(avtag?: boolean): Promise<t_pay_channel[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayAdmin/GetChannelList`,
			params: { avtag },
		};

		const response: AxiosResponse<t_pay_channel[]> = await this.axiosInstance(config);
		return response.data;
	}

	async GetChannelDetail(channelId: string): Promise<t_pay_channel> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayAdmin/GetChannelDetail`,
			params: { channelId },
		};

		const response: AxiosResponse<t_pay_channel> = await this.axiosInstance(config);
		return response.data;
	}

	async GetRegisteredChannels(): Promise<ChannelMetaVo[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayAdmin/GetRegisteredChannels`,
		};

		const response: AxiosResponse<ChannelMetaVo[]> = await this.axiosInstance(config);
		return response.data;
	}

	async GetAllOrders(page: number, pageSize: number, order_status?: PayOrderStatus): Promise<PageResultVo<t_pay_order>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayAdmin/GetAllOrders`,
			params: { order_status, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_pay_order>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetAllBills(page: number, pageSize: number, settle_status?: BillSettleStatus, order_no?: string, channel_id?: string): Promise<PageResultVo<PayBillVo>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayAdmin/GetAllBills`,
			params: { settle_status, order_no, channel_id, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<PayBillVo>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetWithdrawRecords(page: number, pageSize: number, status?: WithdrawStatus): Promise<PageResultVo<t_pay_withdraw_record>> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayAdmin/GetWithdrawRecords`,
			params: { status, page, pageSize },
		};

		const response: AxiosResponse<PageResultVo<t_pay_withdraw_record>> = await this.axiosInstance(config);
		return response.data;
	}

	async GetWalletsByUser(userId: string): Promise<t_pay_wallet[]> {
		const config: AxiosRequestConfig = {
			method: 'GET',
			url: `${this.baseUrl}/PayAdmin/GetWalletsByUser`,
			params: { userId },
		};

		const response: AxiosResponse<t_pay_wallet[]> = await this.axiosInstance(config);
		return response.data;
	}

	async GetChannelWithdrawableBalance(channelId: string): Promise<number> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/GetChannelWithdrawableBalance`,
			params: { channelId },
		};

		const response: AxiosResponse<number> = await this.axiosInstance(config);
		return response.data;
	}

	async SaveChannel(channel: t_pay_channel): Promise<t_pay_channel> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/SaveChannel`,
			data: channel,
		};

		const response: AxiosResponse<t_pay_channel> = await this.axiosInstance(config);
		return response.data;
	}

	async GetChannelConfigSchema(channelCode: string): Promise<any> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/GetChannelConfigSchema`,
			params: { channelCode },
		};

		const response: AxiosResponse<any> = await this.axiosInstance(config);
		return response.data;
	}

	async InitWalletForUser(userId: string, userType: PayUserType): Promise<WalletInitResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/InitWalletForUser`,
			params: { userId, userType },
		};

		const response: AxiosResponse<WalletInitResult> = await this.axiosInstance(config);
		return response.data;
	}

	async TriggerWithdraw(adminUserId: string): Promise<number> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/TriggerWithdraw`,
			params: { adminUserId },
		};

		const response: AxiosResponse<number> = await this.axiosInstance(config);
		return response.data;
	}

	async TransferUsdt(request: WalletTransferRequest): Promise<WalletTransferResult> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/TransferUsdt`,
			data: request,
		};

		const response: AxiosResponse<WalletTransferResult> = await this.axiosInstance(config);
		return response.data;
	}

	async ValidateOrder(orderNo: string): Promise<void> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/ValidateOrder`,
			params: { orderNo },
		};

		const response: AxiosResponse<void> = await this.axiosInstance(config);
		return response.data;
	}

	async CreateMissingBills(orderNo: string): Promise<number> {
		const config: AxiosRequestConfig = {
			method: 'POST',
			url: `${this.baseUrl}/PayAdmin/CreateMissingBills`,
			params: { orderNo },
		};

		const response: AxiosResponse<number> = await this.axiosInstance(config);
		return response.data;
	}

}
