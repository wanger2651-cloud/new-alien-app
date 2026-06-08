import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";

export interface WalletTransferResult {
		wallet_type: WalletType;
		transaction_no: string;
}
