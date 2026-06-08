import request from '@/utils/request';

export const ManagementApi = {
	// 获取店铺的功能列表
	getShopManagement: async (data) => {
		return await request({
			url: 'shopmg/getshopfunctionlist',
			method: 'get',
			data
		})
	},
	
	// 获取店铺的功能列表
	getShopFuncList: async (data) => {
		return await request({
			url: 'functionprice/GetFuncList',
			method: 'get',
			data
		})
	},

	// 获取功能配置Schema
	getFuncConfSchema: async (shopType, funcCode) => {
		return await request({
			url: `FuncRunTask/GetFuncConfSchema?shopType=${shopType}&funcCode=${funcCode}`,
			method: 'get'
		})
	},

	// 获取多个功能配置Schema（批量）
	getFuncConfSchemas: async (data) => {
		return await request({
			url: 'FuncRunTask/GetFuncConfSchemas',
			method: 'post',
			data
		})
	},
	
	// 获取指定功能到期信息统计（V2）
	getFuncCountV2: async (shopType, funcCode) => {
		return await request({
			url: `ShopMg/ShopMg/GetFuncCountV2?shopType=${shopType}&funcCode=${funcCode}`,
			method: 'get'
		})
	},
	
	// 触发功能执行任务
	triggerFuncRun: async (data) => {
		return await request({
			url: 'FuncRunTask/TriggerFuncRun',
			method: 'post',
			data
		})
	},
	
	// 获取功能执行任务列表
	getFuncRunTaskPage: async (data) => {
		return await request({
			url: 'FuncRunTask/GetFuncRunTaskPage',
			method: 'post',
			data
		})
	},

	// 提交自动出餐配置
	setConf: async (data) => {
		return await request({
			url: 'functionuser/setconf_func',
			method: 'post',
			data
		})
	},

	// 获取自动出餐配置
	getConf: async (data) => {
		return await request({
			url: 'functionuser/getconf_func',
			method: 'post',
			data
		})
	},
	
	// IM回复开关
	enableIM: async (data) => {
		return await request({
			url: 'FunctionUser/Enable_func',
			method: 'post',
			data
		})
	},
	
	// 获取店铺详情（包含cookie等信息）
	getShopDetail: async (id) => {
		return await request({
			url: `shopmg/getshopdata?shopid=${id}`,
			method: 'get'
		})
	},
	
	// 获取店铺cookie
	getShopCk: async (id) => {
		return await request({
			url: `shopmg/getshopck?id=${id}`,
			method: 'get'
		})
	},
	
	// 获取店铺分组列表
	getShopGroups: async (shopId) => {
		return await request({
			url: `FuncRunTask/GetShopGroups?shopId=${shopId}`,
			method: 'get'
		})
	},
	
	// 调用功能方法（用于类目属性批量设置等）
	callFunction: async (data) => {
		return await request({
			url: 'FunctionUser/CallFunction',
			method: 'post',
			data
		})
	}
}