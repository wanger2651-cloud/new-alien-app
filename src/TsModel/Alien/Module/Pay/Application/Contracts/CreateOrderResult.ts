export interface CreateOrderResult {
		order_no: string;
		order_amount: number;
		expire_time: Date;
		pay_link: string;
}
