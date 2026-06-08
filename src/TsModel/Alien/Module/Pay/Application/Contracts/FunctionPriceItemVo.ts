import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_wmt_function} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function";

export interface FunctionPriceItemVo {
		function_price_id: string;
		title: string;
		shop_type: ShopType;
		price: number;
		add_days: number;
		functions: t_wmt_function[];
}
