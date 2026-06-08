import request from '@/utils/request'
import { unwrapPayBusinessData } from '@/utils/payRenewFlow'
import type { FunctionPriceItemVo } from '@/TsModel/Alien/Module/Pay/Application/Contracts/FunctionPriceItemVo'
import type { CreateOrderRequest } from '@/TsModel/Alien/Module/Pay/Application/Contracts/CreateOrderRequest'
import type { CreateOrderResult } from '@/TsModel/Alien/Module/Pay/Application/Contracts/CreateOrderResult'
import type { BatchCreateOrderRequest } from '@/TsModel/Alien/Module/Pay/Application/Contracts/BatchCreateOrderRequest'
import type { BatchCreateOrderResult } from '@/TsModel/Alien/Module/Pay/Application/Contracts/BatchCreateOrderResult'
import type { RenewChannelVo } from '@/TsModel/Alien/Module/Pay/Application/Contracts/RenewChannelVo'
import type { t_pay_order } from '@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_order'
import type { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'

async function rawRequest<T>(options: Parameters<typeof request>[0]): Promise<T> {
	const res = await request<T>(options)
	return unwrapPayBusinessData<T>(res)
}

/**
 * 单条功能价格报价（续费规格列表）。
 */
export async function getRenewQuoteList(
	shopType: ShopType | number,
	priceTitle: string,
	isKeyWord: boolean
): Promise<FunctionPriceItemVo[]> {
	const data = await rawRequest<FunctionPriceItemVo[]>({
		url: 'payorder/getquotelist',
		method: 'GET',
		data: { shopType, priceTitle, isKeyWord },
		authRequired: true
	})
	return Array.isArray(data) ? data : []
}

/**
 * 可选支付渠道列表。
 */
export async function getRenewChannels(): Promise<RenewChannelVo[]> {
	const data = await rawRequest<RenewChannelVo[]>({
		url: 'payquery/getrenewchannels',
		method: 'GET',
		authRequired: true
	})
	return Array.isArray(data) ? data : []
}

/**
 * 单店续费下单。
 */
export async function createPayOrder(body: CreateOrderRequest): Promise<CreateOrderResult> {
	return await rawRequest<CreateOrderResult>({
		url: 'payorder/createorder',
		method: 'POST',
		data: body,
		authRequired: true
	})
}

/**
 * 多店聚合续费下单。
 */
export async function createBatchPayOrder(body: BatchCreateOrderRequest): Promise<BatchCreateOrderResult> {
	return await rawRequest<BatchCreateOrderResult>({
		url: 'payorder/createbatchorder',
		method: 'POST',
		data: body,
		authRequired: true
	})
}

/**
 * 查询订单当前状态。
 */
export async function queryPayOrderStatus(orderNo: string): Promise<t_pay_order> {
	return await rawRequest<t_pay_order>({
		url: 'payorder/querystatus',
		method: 'GET',
		data: { orderNo },
		authRequired: true
	})
}
