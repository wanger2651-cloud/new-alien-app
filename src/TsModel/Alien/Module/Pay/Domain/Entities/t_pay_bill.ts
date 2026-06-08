import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";
import {BillSettleStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/BillSettleStatus";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_pay_bill extends BaseSys {
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
		agent_id: string;
		agent_share_ratio: number;
		parent_share_ratio: number;
		share_amount: number;
		wallet_type: WalletType;
		receive_address: string;
		channel_id: string;
		channel_code: string;
		channel_name: string;
		channel_fee_rate?: number | null;
		settle_status: BillSettleStatus;
		actual_amount: number;
		order_time: Date;
		settle_time?: Date | null;
		settle_batch_id?: string | null;
		settle_tx_hash?: string | null;
		chain_fee_usdt?: number | null;
		channel_fee_usdt?: number | null;
}
