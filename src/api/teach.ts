import request from '@/utils/request';

export const TeachApi = {
	// 获取导航列表
	getTabList: async () => {
		return await request({
			url: 'course/getgroups',
			method: 'get'
		})
	},

	// 获取页面列表
	getList: async (data) => {
		return await request({
			url: 'course/getcourses',
			method: 'get',
			data
		})
	},

}