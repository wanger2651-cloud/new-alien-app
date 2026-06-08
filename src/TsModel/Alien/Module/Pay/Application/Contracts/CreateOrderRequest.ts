export interface CreateOrderRequest {
		external_order_no?: string | null;
		shop_id: string;
		function_price_id: string;
		channel_id: string;
}
