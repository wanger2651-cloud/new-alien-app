import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";
import {WalletAssetCode} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletAssetCode";

export interface WalletWithdrawRequest {
		wallet_type: WalletType;
		to_address: string;
		amount: number;
		asset_code: WalletAssetCode;
}
