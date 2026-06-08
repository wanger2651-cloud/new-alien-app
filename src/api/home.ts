import request from '@/utils/request';

export const HomeApi = {
	getHomeData: async (data) => {
		return await request({
			url: `homedata/v2/gethomedata`,
			method: 'get',
			data
		})
	},
	getlistorderbyctime: async (data) => {
		return await request({
			url: `system/business/calendar/getlistorderbyctime`,
			method: 'get',
			data
		})
	},
	//  增加事项√
	addcalendar: async (data) => {
		return await request({
			url: 'system/business/calendar/add',
			method: 'post',
			data,
		})
	},
	//  更改事项√
	editcalendar: async (data) => {
		return await request({
			url: 'system/business/calendar/update',
			method: 'post',
			data,
		})
	},
	//  删除√
	deletecalendar: async (id) => {
	  return await request({
	    url: `system/business/calendar/delete?id=${id}`,
	    method: 'post',
	  })
	},
	agencyreg: async (data) => {
	  return await request({
	    url: `admin/agencyreg`,
	    method: 'post',
		data
	  })
	},
	agencyLogin: async (data) => {
	  return await request({
	    url: `admin/agencylogin`,
	    method: 'post',
		data
	  })
	},
	agencyForget: async (data) => {
	  return await request({
	    url: `admin/agencyforget`,
	    method: 'post',
		data
	  })
	},
}