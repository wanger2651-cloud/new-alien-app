
import request from '@/utils/request'
import type { t_wmt_feedback } from '@/TsModel/Alien/Entity/Tables/sys/t_wmt_feedback'
import type { PageResultVo } from '@/TsModel/Alien/Entity/MethodResult/PageResultVo'

export const FeedBackApi = {
	/** 对接 TsModel: Feedback/AddFeedBack */
	addFeedBack: async (data: Partial<t_wmt_feedback>) => {
		return await request<t_wmt_feedback>({
			url: '/Feedback/AddFeedBack',
			method: 'POST',
			data
		})
	},
	/** 对接 TsModel: Feedback/GetFeedBack */
	getFeedBack: async (page = 1, pageSize = 10) => {
		return await request<PageResultVo<t_wmt_feedback>>({
			url: '/Feedback/GetFeedBack',
			method: 'GET',
			data: { page, pageSize }
		})
	},
	/** 对接 TsModel: Feedback/SetRead */
	setRead: async (id: string, notes?: string) => {
		return await request<t_wmt_feedback>({
			url: '/Feedback/SetRead',
			method: 'POST',
			data: { id, notes }
		})
	},
	/** 后台反馈列表（总账号查看） */
	getAdminFeedBack: async (page = 1, pagesize = 20) => {
		return await request<any>({
			url: '/feedback/getfeedback',
			method: 'GET',
			data: { page, pagesize }
		})
	}
}