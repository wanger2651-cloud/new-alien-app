import type { t_pay_order } from '@/TsModel/Alien/Module/Pay/Domain/Entities/t_pay_order'
import { PayOrderStatus } from '@/TsModel/Alien/Module/Pay/Domain/Enums/PayOrderStatus'
import type { FunctionPriceItemVo } from '@/TsModel/Alien/Module/Pay/Application/Contracts/FunctionPriceItemVo'

/**
 * Pay 报价转弹窗/列表通用行（兼容原 price_id、cost、add_time、func_name）。
 */
export function mapPayQuoteToSpecRow(vo: FunctionPriceItemVo) {
	return {
		...vo,
		price_id: vo.function_price_id,
		cost: vo.price,
		add_time: vo.add_days,
		func_name: vo.title,
		pricetitle: vo.title
	}
}

/**
 * 从 App request 返回体中取出业务数据（兼容 code/Data/Success 等形态）。
 */
export function unwrapPayBusinessData<T>(res: unknown): T {
	if (res == null) {
		return res as T
	}
	if (Array.isArray(res)) {
		return res as T
	}
	if (res && typeof res === 'object') {
		const r = res as Record<string, unknown>
		const okSuccess =
			r.Success === true ||
			r.success === true ||
			r.code === 200 ||
			r.Code === 200
		if (okSuccess && 'data' in r && r.data !== undefined) {
			return r.data as T
		}
		if (okSuccess && 'Data' in r && r.Data !== undefined) {
			return r.Data as T
		}
		if (r.code === 200 && 'data' in r) {
			return r.data as T
		}
		if (r.Code === 200 && 'Data' in r) {
			return r.Data as T
		}
		if (r.Success === true && 'Data' in r) {
			return r.Data as T
		}
		if (r.Success === true && 'data' in r) {
			return r.data as T
		}
		if (r.success === true && 'data' in r) {
			return r.data as T
		}
		if (r.success === true && 'Data' in r) {
			return r.Data as T
		}
	}
	return res as T
}

export type OrderPollOutcome =
	| { kind: 'paid' | 'closed' | 'pending' }
	| { kind: 'failed'; message: string }

const NO_LINK_POLL_MAX_MS = 20_000
const NO_LINK_POLL_INTERVAL_MS = 3000

/**
 * 查询一次订单支付结果语义。
 */
export async function pollPayOrderOutcome(
	orderNo: string,
	queryStatus: (orderNo: string) => Promise<t_pay_order>
): Promise<OrderPollOutcome> {
	const order = await queryStatus(orderNo)
	if (!order) {
		return { kind: 'pending' }
	}
	if (order.order_status === PayOrderStatus.Paid) {
		return { kind: 'paid' }
	}
	if (order.order_status === PayOrderStatus.Closed) {
		return { kind: 'closed' }
	}
	if (order.order_status === PayOrderStatus.PaymentFailed) {
		const message = (order.pay_fail_message && String(order.pay_fail_message).trim()) || '支付失败'
		return { kind: 'failed', message }
	}
	return { kind: 'pending' }
}

function sleepCancellable(ms: number, isCancelled: () => boolean): Promise<void> {
	return new Promise<void>((resolve) => {
		const start = Date.now()
		const step = () => {
			if (isCancelled()) {
				resolve()
				return
			}
			if (Date.now() - start >= ms) {
				resolve()
				return
			}
			setTimeout(step, 100)
		}
		step()
	})
}

/**
 * 在外部浏览器打开支付链接（App 使用 plus，H5 使用 window）。
 */
export function openExternalPayLink(link: string): void {
	const url = String(link || '').trim()
	if (!url) {
		return
	}
	// #ifdef APP-PLUS
	const runtime = typeof plus !== 'undefined' ? plus.runtime : null
	runtime?.openURL(url)
	// #endif
	// #ifdef H5
	if (typeof window !== 'undefined') {
		window.open(url, '_blank')
	}
	// #endif
}

export function hasPayLink(link: unknown): boolean {
	return typeof link === 'string' && link.trim().length > 0
}

export type FinishPayOrderHandlers = {
	/** 单次查询订单状态（已解包为 t_pay_order） */
	queryStatus: (orderNo: string) => Promise<t_pay_order>
	/** 支付成功 */
	onPaid?: () => void
	/** 订单关闭 */
	onClosed?: () => void
	/** 支付失败 */
	onFailed?: (message: string) => void
	/** 仍在处理或超时 */
	onPending?: (message: string) => void
}

/**
 * 下单后闭环：短轮询订单状态（约 20s，与 PC 一致），避免在高层级弹窗内再调 uni.showModal 被遮挡。
 * 若已打开外部支付页，先 toast 提示再轮询。
 */
export async function finishOrderAfterCreate(
	orderNo: string,
	openedPayLink: boolean,
	handlers: FinishPayOrderHandlers
): Promise<void> {
	const { queryStatus, onPaid, onClosed, onFailed, onPending } = handlers

	if (openedPayLink) {
		uni.showToast({
			title: '已尝试打开支付页，完成后将自动查询订单',
			icon: 'none',
			duration: 2500
		})
	}

	uni.showLoading({ title: '查询支付状态...', mask: true })
	const pollStart = Date.now()
	try {
		while (true) {
			const outcome = await pollPayOrderOutcome(orderNo, queryStatus)
			if (outcome.kind === 'paid') {
				onPaid?.()
				return
			}
			if (outcome.kind === 'closed') {
				onClosed?.()
				return
			}
			if (outcome.kind === 'failed') {
				onFailed?.(outcome.message)
				return
			}
			const elapsed = Date.now() - pollStart
			if (elapsed >= NO_LINK_POLL_MAX_MS) {
				onPending?.('等待超时，订单仍未支付或仍在处理中，请稍后再查')
				return
			}
			const waitMs = Math.min(NO_LINK_POLL_INTERVAL_MS, NO_LINK_POLL_MAX_MS - elapsed)
			if (waitMs <= 0) {
				onPending?.('等待超时，订单仍未支付或仍在处理中，请稍后再查')
				return
			}
			await sleepCancellable(waitMs, () => false)
		}
	} finally {
		uni.hideLoading()
	}
}
