import request from '@/utils/request';

export const logApi = {
	// 获取日志列表
	getList: async (data) => {
		return await request({
			url: 'logcontrolller/getlogbalance',
			method: 'get',
			data
		})
	},
	// 获取日志列表
	getLogList: async (data) => {
		return await request({
			url: 'functionuser/getlog',
			method: 'post',
			data
		})
	},
	// Fucn-取自动出餐配置
	getConfFunc: async (data) => {
		return await request({
			url: 'functionuser/getconf_func',
			method: 'post',
			data
		})
	},
	// Fucn-取自动出餐配置
	getConfFuncOther: async (data) => {
		return await request({
			url: 'functionuser/getfuncinfo',
			method: 'get',
			data
		})
	},
	// Fucn-提交自动出餐配置
	saveConfFunc: async (data) => {
		return await request({
			url: 'functionuser/setconf_func',
			method: 'post',
			data
		})
	},
	// 分配积分
	giveIntegral: async (data) => {
		return await request({
			url: 'admin/giveintegral',
			method: 'post',
			data
		})
	},
	// 从客户端执行某店铺的功能中的某个方法（动图上传等）
	callCpData: async (data) => {
		return await request({
			url: 'functionuser/call',
			method: 'post',
			data
		})
	},
}