import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";

export interface WalletInitResult {
		user_id: string;
		created_wallets: WalletType[];
}
