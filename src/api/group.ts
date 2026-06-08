import request from '@/utils/request';

export const GroupApi = {
	getGroupData: async (data) => {
		return await request({
			url: `group/getgroups`,
			method: 'get',
			data
		})
	},
	//  增加
	addGroup: async (data) => {
		return await request({
			url: 'group/addgroup',
			method: 'post',
			data,
		})
	},
	//  更改
	editGroup: async (data) => {
		return await request({
			url: 'group/updategroup',
			method: 'post',
			data,
		})
	},
	//  删除
	deleteGroup: async (id) => {
	  return await request({
	    url: `group/deletegroup?id=${id}`,
	    method: 'post',
	  })
	},
	
	// 用户对店铺的分组 -----------------------
	//  将店铺添加到分组
	groupAddShop: async (data) => {
	  return await request({
	    url: `shopusergroup/connectgroup`,
	    method: 'post',
		data
	  })
	},
	//  将店铺移出分组
	groupRemoveShop: async (data) => {
	  return await request({
	    url: `shopusergroup/removegroup`,
	    method: 'post',
		data
	  })
	},
	// 获取指定分组下的店铺列表
	getShopListForGroup: async (data) => {
		return await request({
			url: `shopusergroup/getshoplist`,
			method: 'get',
			data
		})
	},
	// 获取已关联店铺列表或没有关联店铺的列表
	getShopListHas: async (data) => {
		return await request({
			url: `shopusergroup/getshoplisthas`,
			method: 'post',
			data
		})
	},
	// 根据条件获取用户列表
	getAdminList: async (data) => {
		return await request({
			url: `admingroup/getadminlist`,
			method: 'post',
			data
		})
	},
	//  将子代理移出分组
	adminRemoveGroup: async (data) => {
	  return await request({
	    url: `admingroup/removegroup`,
	    method: 'post',
		data
	  })
	},
	//  更新代理
	updateAgency: async (data) => {
	  return await request({
	    url: `admin/updateagency`,
	    method: 'post',
		data
	  })
	},
	//  关联店铺分组列表
	linkShopGroup: async (data) => {
	  return await request({
	    url: `admingroup/linkshopgroup`,
	    method: 'post',
		data
	  })
	},
	//  将店铺加到分组
	connectAdminGroup: async (data) => {
	  return await request({
	    url: `admingroup/connectgroup`,
	    method: 'post',
		data
	  })
	},
	//  将店铺加到分组
	connectGroup: async (data) => {
	  return await request({
	    url: `shopusergroup/connectgroup`,
	    method: 'post',
		data
	  })
	},
	//  设置下级角色
	setSubordinateRoles: async (data) => {
	  return await request({
	    url: `admin/setsubordinateroles`,
	    method: 'post',
		data
	  })
	},
	//  移除下级角色
	removeSubordinateRoles: async (data) => {
	  return await request({
	    url: `admin/removesubordinateroles`,
	    method: 'post',
		data
	  })
	},
}