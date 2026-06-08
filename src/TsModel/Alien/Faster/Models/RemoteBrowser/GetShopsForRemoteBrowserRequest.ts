/** 获取远程浏览器店铺列表请求参数*/
export interface GetShopsForRemoteBrowserRequest {
		/** 店铺ID列表（老到新复制传 老店id,新店id；竞对复制只传新店 id）*/
		ShopIds: string[];
}
