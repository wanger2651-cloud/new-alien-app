import request from '@/utils/request';

export const MessageApi = {
	// 获取消息列表
	getList: async (data) => {
		return await request({
			url: 'bossmsg/getmsg',
			method: 'get',
			data
		})
	},

	// 更新消息
	update: async (data) => {
		return await request({
			url: 'bossmsg/updatemsg',
			method: 'post',
			data
		})
	},

}