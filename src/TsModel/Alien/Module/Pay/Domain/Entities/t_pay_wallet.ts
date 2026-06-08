import {PayUserType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/PayUserType";
import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";

import {BaseSys} from "@/TsModel/Alien/Entity/Tabls/BaseSys";
export interface t_pay_wallet extends BaseSys {
		user_id: string;
		user_type: PayUserType;
		wallet_type: WalletType;
		wallet_name: string;
		wallet_address: string;
		private_key: string;
		public_key: string;
		mnemonic: string;
		balance: number;
		min_settle_usdt: number;
}
