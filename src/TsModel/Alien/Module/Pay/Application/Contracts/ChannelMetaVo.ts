import {WalletType} from "@/TsModel/Alien/Module/Pay/Domain/Enums/WalletType";

export interface ChannelMetaVo {
		channel_code: string;
		channel_name: string;
		withdraw_wallet_type: WalletType;
		configured: boolean;
}
