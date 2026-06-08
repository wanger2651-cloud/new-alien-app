import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";
import {WalletAssetCode} from "@/TsModel/Alien/Module/Pay/Application/Contracts/WalletAssetCode";

export interface WalletTransferRequest {
		wallet_type: WalletType;
		from_private_key: string;
		from_address: string;
		to_address: string;
		amount: number;
		asset_code: WalletAssetCode;
}
