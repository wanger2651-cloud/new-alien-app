import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_pay_channel extends BaseSys {
		channel_code: string;
		channel_name: string;
		withdraw_wallet_type: WalletType;
		withdrawable_balance: number;
		fee_rate: number;
		enable_agent_share: boolean;
		config_json?: string | null;
}
