import request from '@/utils/request';

export interface UserInfoVo {
	/* */
	admin: {
		/*主键Id */
		id: string;

		/*创建时间 */
		crtim: Record<string, unknown>;

		/*更新时间 */
		uptim: Record<string, unknown>;

		/*是否可用，1可用，0不可用 */
		avtag: boolean;

		/* */
		notes: string;

		/*分组id */
		group: string;

		/*分组名称（避免联表过多） */
		group_name: string;

		/* */
		Parent: string;

		/* */
		AllParent: Record < string, unknown > [];

		/* */
		user_name: string;

		/* */
		password: string;

		/* */
		phone: string;

		/*权限 也代表了他们的权限 */
		role: Record < string, unknown > [];

		/*余额 分配余额功能应单独出来 */
		balance: Record<string, unknown>;

		/* */
		login_ip: string;

		/* */
		login_time: Record<string, unknown>;

		/*邀请码 */
		code: number;

		/*团队id */
		team_id: number;

		/* */
		user_type: { };
	};

	/*归属上级(上级的用户名) */
	parent_name: string;

	/*店铺类型数量统计 */
	count_shop_type: {
		/*店铺类型名称 */
		Title: string;

		/* */
		ShopType: { };

		/*店铺数量 */
		ShopCount: number;
	} [];

	/* */
	count_shop_extra: {
		/*已到期店铺数量 */
		has_end: number;

		/*授权失效的店铺数量 */
		has_out: number;

		/*即将到期的数量 */
		almost_end: number;

		/*没有到期的数量 */
		not_out: number;
	};
}


export const UserApi = {
	// 登录
	login: async (data: any) => {
		return await request({
			url: 'shopmg/loginshop',
			method: 'post',
			data
		})
	},

	// 获取用户信息
	getUser: async () => {
		return await request({
			url: 'admin/getagencyinfo',
			method: 'get'
		})
	},
	
	addUser: async (data) => {
		const {is_boss, phone} = data
		return await request({
			url: `admin/adduser?phone=${phone}&is_boss=${is_boss}`,
			method: 'post'
		})
	},
	
	killMySelf: async () => {
		return await request({
			url: `admin/killmyselfe`,
			method: 'post'
		})
	},
}