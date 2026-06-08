import request from '@/utils/request';

export const FunctionPriceApi = {
	/**
	 * 获取功能列表
	 * @param shopType 店铺类型
	 * @returns 返回该店铺类型支持的功能列表（不支持的功能不会返回，比如美团闪购不支持出餐）
	 */
	getFuncList: async (shopType: number) => {
		return await request({
			url: 'FunctionPrice/GetFuncList',
			method: 'GET',
			data: { shopType }
		})
	}
}
