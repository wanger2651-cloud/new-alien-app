import {BatchOperationFailItem} from "@/TsModel/Alien/Entity/Function/BatchOperationFailItem";

/** 批量操作结果*/
export interface BatchOperationResult {
		/** 成功数量*/
		SuccessCount: number;
		/** 失败列表（店铺ID + 失败原因）*/
		FailedList: BatchOperationFailItem[];
}
