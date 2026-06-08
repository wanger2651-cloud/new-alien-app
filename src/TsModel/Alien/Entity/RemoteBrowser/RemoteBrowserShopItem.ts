import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

/** 远程浏览器要展示的店铺项（仅必要字段）*/
export interface RemoteBrowserShopItem {
		Id: string;
		Name: string;
		ShopType: ShopType;
		OfficeId?: string | null;
}
