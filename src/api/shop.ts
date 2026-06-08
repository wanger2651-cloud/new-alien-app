
import request from '@/utils/request';

export const ShopApi = {
	// 获取也i按列表
	getList: async (data) => {
		return await request({
			url: 'shopmg/getshoplist',
			method: 'post',
			data
		})
	},
	// 获取店铺列表（ShopMg/GetShopList）
	getShopList: async (data) => {
		return await request({
			url: 'ShopMg/GetShopList',
			method: 'post',
			data
		})
	},
	// 获取店铺列表 V2
	getV2List: async (data) => {
		return await request({
			url: 'ShopMg/GetShopListV2',
			method: 'post',
			data
		})
	},
	//获取店铺数据(营业数据，营业时间，店铺头像，状态等) 
	getShopDetails: async (id) => {
		return await request({
			url: `shopmg/getshopdata?shopid=${id}`,
			method: 'get'
		})
	},
	bindShop: async (data) => {
		return await request({
			url: `shopmg/bindshop?code=${data}`,
			method: 'post'
		})
	},
	recoveryShop: async (data) => {
		return await request({
			url: `shopmg/recoverbindshop`,
			method: 'post',
			data
		})
	},
	getprovincewithcitys: async (data) => {
		return await request({
			url: `system/service/getprovincewithcitys`,
			method: 'get',
			data
		})
	},
	getGroup: async (data) => {
		return await request({
			url: `group/getgroups`,
			method: 'get',
			data
		})
	},
	getShopBindCode: async (id) => {
		return await request({
			url: `shopmg/createbindingcode?shopid=${id}`,
			method: 'post'
		})
	},
	updateShop: async (data) => {
		return await request({
			url: `shopmg/updateshop`,
			method: 'post',
			data
		})
	},
	delShop: async (data) => {
		return await request({
			url: `shopmg/deleteshop`,
			method: 'post',
			data
		})
	},
	unBindShop: async (data) => {
		return await request({
			url: `shopmg/unbindshop`,
			method: 'post',
			data
		})
	},
	agentAddShop: async (data) => {
		return await request({
			url: `shopmg/addshop`,
			method: 'post',
			data
		})
	},
	setShopTop: async (data) => {
		const { shop, top } = data
		return await request({
			url: `shopmg/setshoptop?shop=${shop}&top=${top}`,
			method: 'post'
		})
	},
	getGifList: async (data) => {
		return await request({
			url: `foodgif/getgiflist`,
			method: 'post',
			data
		})
	},
	getFuncList: async (data) => {
		return await request({
			url: `functionprice/getfunclist`,
			method: 'get',
			data
		})
	},
	getShopBindInfo: async (data) => {
		return await request({
			url: `shopmg/getshopbindinfo`,
			method: 'get',
			data
		})
	},
	unShopBind: async (data) => {
		const { shopid, shopuserid } = data
		return await request({
			url: `shopmg/unshopbind?shopid=${shopid}&shopuserid=${shopuserid}`,
			method: 'post',
		})
	},
	setShopUserInfo: async (data) => {
		const { shopid, shopuser, shoppwd } = data
		return await request({
			url: `shopmg/setshopuserinfo?shopid=${shopid}&shopuser=${shopuser}&shoppwd=${shoppwd}`,
			method: 'post',
		})
	},
	connectGroup: async (data) => {
		return await request({
			url: `admingroup/connectgroup`,
			method: 'post',
			data
		})
	},
	createclient:async (data)=>{
		return await request({
			url:'fdmvmanager/createclient',
			method: 'post',
			data
		})
	},
	// 查询名下店铺（复制功能使用）
	// 对齐电脑端: FdmvManager/QueryShops?words=xxx&queyShopType=0&newShopType=1001
	queryshops: async (words:any, queyShopType?:number, newShopType?:number)=>{
		let url = `FdmvManager/QueryShops?words=${words}`
		if (queyShopType !== undefined) {
			url += `&queyShopType=${queyShopType}`
		}
		if (newShopType !== undefined) {
			url += `&newShopType=${newShopType}`
		}
		return await request({
		  url: url,
		  method:'get',
		})
	},
	// 获取官方授权地址（用于饿了么复制版等支持官方接口的平台）
	getOfficeAuth: async (shopType) => {
		return await request({
			url: `shopmg/getofficeauth?shopType=${shopType}`,
			method: 'get'
		})
	},
	
	// FoodMove相关接口
	// 创建任务
	createTask: async (data) => {
		return await request({
			url: 'foodmove/createtask',
			method: 'post',
			data
		})
	},
	
	// 获取老店菜单分组列表
	getOldShopGroupList: async (taskId, forceRefresh = false) => {
		// 如果强制刷新，添加时间戳参数避免缓存
		const url = forceRefresh 
			? `foodmove/getoldshopgrouplist?taskId=${taskId}&_t=${Date.now()}`
			: `foodmove/getoldshopgrouplist?taskId=${taskId}`
		return await request({
			url: url,
			method: 'get'
		})
	},
	
	// 获取未授权给指定用户的店铺列表
	getUnassignedShopsForUser: async (userId, page, pageSize, shopType, keyword) => {
		// 构建查询参数字符串
		let url = `ShopMg/GetUnassignedShopsForUser?userId=${userId}&page=${page}&pageSize=${pageSize}`
		if (shopType) {
			url += `&shopType=${shopType}`
		}
		if (keyword) {
			url += `&keyword=${encodeURIComponent(keyword)}`
		}
		return await request({
			url: url,
			method: 'GET'
		})
	},
	
	// 获取指定用户已分配的店铺列表
	getUserAssignedShops: async (userId, page, pageSize, shopType) => {
		// 构建查询参数字符串
		let url = `ShopMg/GetUserAssignedShops?userId=${userId}&page=${page}&pageSize=${pageSize}`
		if (shopType) {
			url += `&shopType=${shopType}`
		}
		return await request({
			url: url,
			method: 'GET'
		})
	},
	
	// 批量分配店铺给用户
	batchAssignShopsToUser: async (data) => {
		return await request({
			url: 'ShopMg/BatchAssignShopsToUser',
			method: 'POST',
			data
		})
	},
	
	// 批量取消用户对店铺的管理权限
	batchUnassignShopsFromUser: async (data) => {
		return await request({
			url: 'ShopMg/BatchUnassignShopsFromUser',
			method: 'POST',
			data
		})
	}
	
	// disposetask:async (taskid)=>{ 
	// 	return await request({
	// 		url:`/foodmove/disposetask?taskid=${taskid}`,
	// 		method: 'post',
	// 	})
	// }
}