export interface BatchCreateOrderResult {
		order_no: string;
		order_amount: number;
		expire_time: Date;
		pay_link: string;
		shop_count: number;
}
