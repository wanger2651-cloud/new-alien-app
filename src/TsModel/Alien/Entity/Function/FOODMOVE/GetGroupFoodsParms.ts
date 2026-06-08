import {FoodGroupItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodGroupItem";
import {TaskProgressBase} from "@/TsModel/Alien/Common/TaskProgressBase";
import {FoodItem} from "@/TsModel/Alien/Entity/Function/FOODMOVE/FoodItem";

export interface GetGroupFoodsParms {
		/** 目标分组*/
		GroupList: FoodGroupItem[];
		/** 进度条*/
		CallProcess?: TaskProgressBase | null;
		/** 商品处理对像*/
		DisQueueTask: Alien.Common.QueueTaskAsync<FoodItem>;
		/** 是否采集商品详情。false 时仅用列表数据构建 FoodItem，不请求详情接口，用于快速采集（如删除前拉列表）*/
		GetDetail: boolean;
}
