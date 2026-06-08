import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";

export interface ChangeWalletAddressRequest {
		wallet_type: WalletType;
		new_address: string;
}
