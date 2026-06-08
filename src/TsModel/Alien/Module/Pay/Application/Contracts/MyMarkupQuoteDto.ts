import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";

export interface MyMarkupQuoteDto {
		function_price_id: string;
		title: string;
		shop_type: ShopType;
		base_price: number;
		parent_chain_markup: number;
		my_markup_amount: number;
		final_price_for_my_downstream: number;
		add_days: number;
}
