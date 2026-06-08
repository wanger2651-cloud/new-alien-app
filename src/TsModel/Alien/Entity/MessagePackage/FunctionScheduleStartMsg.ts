import {ShopType} from "@/TsModel/Alien/Entity/Enums/ShopType";
import {t_wmt_shop_list} from "@/TsModel/Alien/Entity/Tables/shop/t_wmt_shop_list";
import {t_wmt_function_shop} from "@/TsModel/Alien/Entity/Tables/function/t_wmt_function_shop";

/** 功能启动调度消息*/
export interface FunctionScheduleStartMsg {
		TaskId: string;
		TaskKey: string;
		ShopId: string;
		ShopType: ShopType;
		FunctionCode: string;
		Uptim?: Date | null;
		AutoRunSec: number;
		Shop: t_wmt_shop_list;
		ShopFunc: t_wmt_function_shop;
		EnqueueAt: Date;
		RetryCount: number;
		TraceId: string;
}
