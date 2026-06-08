import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {PayOrderStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/PayOrderStatus";
import {RenewApplyStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/RenewApplyStatus";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_pay_order extends BaseSys {
		order_no: string;
		order_amount: number;
		shop_id: string;
		shop_name: string;
		shop_type: ShopType;
		func_code: string;
		func_name: string;
		function_price_id: string;
		end_user_id: string;
		end_user_name: string;
		channel_id: string;
		channel_code: string;
		channel_name: string;
		order_status: PayOrderStatus;
		renew_apply_status: RenewApplyStatus;
		expire_time: Date;
		paid_time?: Date | null;
		pay_fail_message?: string | null;
}
