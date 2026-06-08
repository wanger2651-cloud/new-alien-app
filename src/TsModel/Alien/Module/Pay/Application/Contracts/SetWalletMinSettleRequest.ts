import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";

export interface SetWalletMinSettleRequest {
		wallet_type: WalletType;
		min_settle_usdt: number;
}
