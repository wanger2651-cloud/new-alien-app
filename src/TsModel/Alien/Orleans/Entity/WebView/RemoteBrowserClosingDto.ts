import {RemoteBrowserClosingReason} from "@/TsModel/Alien/Orleans/Entity/WebView/RemoteBrowserClosingReason";

export interface RemoteBrowserClosingDto {
		ShopId: string;
		Reason: RemoteBrowserClosingReason;
		Message?: string | null;
}
