/** 批量操作失败项*/
export interface BatchOperationFailItem {
		/** 店铺ID（内部主键）*/
		ShopId: string;
		/** 门店ID（office_id，平台侧门店编号）*/
		OffId: string;
		/** 店铺名称*/
		ShopName: string;
		/** 失败原因*/
		Reason: string;
}
