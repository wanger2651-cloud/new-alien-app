import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";
import {WithdrawStatus} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WithdrawStatus";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_pay_withdraw_record extends BaseSys {
		withdraw_no: string;
		amount: number;
		withdraw_address: string;
		withdraw_wallet_type: WalletType;
		withdraw_time?: Date | null;
		status: WithdrawStatus;
		channel_id: string;
		channel_name: string;
}
