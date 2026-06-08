/**
 * 接口列表文件
 * auth代表接口是否需要token
 */
export default {
	/**注册**/
	register: {
		url: 'jishiyu/xiaojuzi/user/zhuceyonghu',
		auth: false,
		method: 'POST',
	},
	/**获取验证码**/
	getCode: {
		url: 'jishiyu/xiaojuzi/user/sendSms',
		auth: false,
		method: 'GET',
	},
	/**登陆**/
	loginuser: {
		url: 'jishiyu/xiaojuzi/user/loginuser',
		auth: false,
		method: 'POST',
	},
	/**查询token是否过期**/
	checktoken: {
		url: 'jishiyu/xiaojuzi/user/checktoken',
		auth: true,
		method: 'POST',
	},
	/**个人信息**/
	getuserinfo: {
		url: 'jishiyu/xiaojuzi/user/getuserinfo',
		auth: true,
		method: 'GET',
	},
	/**收益概况**/
	shouyitongji: {
		url: 'jishiyu/xiaojuzi/user/shouyitongji',
		auth: true,
		method: 'GET',
	},
	/**修改密码**/
	xiugaimima: {
		url: 'jishiyu/xiaojuzi/user/xiugaimima',
		auth: true,
		method: 'POST',
	},
	/**忘记密码**/
	xiugaimimabydianhua: {
		url: 'jishiyu/xiaojuzi/user/xiugaimimabydianhua',
		auth: false,
		method: 'POST',
	},
	/**团队概况**/
	tuanduitongji: {
		url: 'jishiyu/xiaojuzi/user/tuanduitongji',
		auth: true,
		method: 'GET',
	},
	/**提现申请**/
	addtxsq: {
		url: 'jishiyu/xiaojuzi/user/addtxsq',
		auth: true,
		method: 'POST',
	},
	/**佣金明细**/
	yjlist: {
		url: 'jishiyu/xiaojuzi/user/yjlist',
		auth: true,
		method: 'GET',
	},
	/**获取个人积分**/
	getuserjf: {
		url: 'jishiyu/xiaojuzi/user/getuserjf',
		auth: true,
		method: 'GET',
	},
	/**积分套餐**/
	taocanlist: {
		url: 'jishiyu/xiaojuzi/user/taocanlist',
		auth: true,
		method: 'GET',
	},
	/**佣金排行榜**/
	yongjinpaihangbang: {
		url: 'jishiyu/xiaojuzi/user/yongjinpaihangbang',
		auth: true,
		method: 'GET',
	},
	/**海报**/
	createhaibao: {
		url: 'jishiyu/xiaojuzi/user/createhaibao',
		auth: true,
		method: 'GET',
	},
	/**消费卡类型**/
	xflist: {
		url: 'jishiyu/xiaojuzi/user/list',
		auth: true,
		method: 'GET',
	},
	/**订单列表**/
	dingdanlist: {
		url: 'jishiyu/xiaojuzi/user/dingdanlist',
		auth: true,
		method: 'GET',
	},
	/**订单删除**/
	deletedingdan: {
		url: 'jishiyu/xiaojuzi/user/deletedingdan',
		auth: true,
		method: 'POST',
	},
	/** 门店绑定 **/
	addmendian: {
		url: 'jishiyu/xiaojuzi/mendian/addmendian',
		auth: true,
		method: 'POST',
	},
	/** 门店列表**/
	mdlist: {
		url: 'jishiyu/xiaojuzi/mendian/mdlist',
		auth: true,
		method: 'GET',
	},
	/** 续费**/
	xufei: {
		url: 'jishiyu/xiaojuzi/user/xufei',
		auth: true,
		method: 'POST',
	},
	/** 解绑**/
	jiechumendian: {
		url: 'jishiyu/xiaojuzi/mendian/jiechumendian',
		auth: true,
		method: 'POST',
	},
	/** 饿了么门店基础数据**/
	getelemdjcxx: {
		url: 'jishiyu/xiaojuzi/mendian/getelemdjcxx',
		auth: true,
		method: 'GET',
	},
	/** 饿了么门店评分预测**/
	getelmmdpfyc: {
		url: 'jishiyu/xiaojuzi/mendian/getelmmdpfyc',
		auth: true,
		method: 'GET',
	},
	/** 饿了么经营数据**/
	getelmjysj: {
		url: 'jishiyu/xiaojuzi/mendian/getelmjysj',
		auth: true,
		method: 'GET',
	},
	/** 美团门店基础数据**/
	getmtmdjcxx: {
		url: 'jishiyu/xiaojuzi/mendian/getmtmdjcxx',
		auth: true,
		method: 'GET',
	},
	/** 美团门店评分预测**/
	getmtmdpfyc: {
		url: 'jishiyu/xiaojuzi/mendian/getmtmdpfyc',
		auth: true,
		method: 'GET',
	},
	/** 美团经营数据**/
	getmtjysj: {
		url: 'jishiyu/xiaojuzi/mendian/getmtjysj',
		auth: true,
		method: 'GET',
	},
	/** 美团门店服务功能 **/
	getmtmdfwgn: {
		url: 'jishiyu/xiaojuzi/mendian/getmtmdfwgn',
		auth: true,
		method: 'GET',
	},
	/** 饿了吗门店服务功能 **/
	getelmmdfwgn: {
		url: 'jishiyu/xiaojuzi/mendian/getelmmdfwgn',
		auth: true,
		method: 'GET',
	},
	/** 美团自动竞价**/
	adddianjinshezhi: {
		url: 'jishiyu/xiaojuzi/dianjintuiguang/adddianjinshezhi',
		auth: true,
		method: 'POST',
	},
	/** 美团自动回复**/
	addimshezhi: {
		url: 'jishiyu/xiaojuzi/huiping/addimshezhi',
		auth: true,
		method: 'POST',
	},
	/** 美团评价助手**/
	huipadd: {
		url: 'jishiyu/xiaojuzi/huiping/add',
		auth: true,
		method: 'POST',
	},
	/** 美团出餐助手**/
	addorupdate: {
		url: 'jishiyu/xiaojuzi/chucanforeign/addorupdate',
		auth: true,
		method: 'POST',
	},
	/** 美团中差评 **/
	mtzcplist: {
		url: 'jishiyu/xiaojuzi/huiping/mtzcplist',
		auth: true,
		method: 'GET',
	},
	/** 饿了么中差评 **/
	elmzcplist: {
		url: 'jishiyu/xiaojuzi/huiping/elmzcplist',
		auth: true,
		method: 'GET',
	},
	/** 好评模板 **/
	hpmblist: {
		url: 'jishiyu/xiaojuzi/huiping/hpmblist',
		auth: true,
		method: 'GET',
	},
	/** 出餐日志 **/
	ccrzlist: {
		url: 'jishiyu/xiaojuzi/chucanforeign/ccrzlist',
		auth: true,
		method: 'GET',
	},
	/** 美团商品菜单 **/
	mtshangpincaidan: {
		url: 'jishiyu/xiaojuzi/mendian/mtshangpincaidan',
		auth: true,
		method: 'GET',
	},
	/** 动图列表 **/
	dtlist: {
		url: 'jishiyu/xiaojuzi/dongtu/dtlist',
		auth: true,
		method: 'GET',
	},
	/** 团队列表 **/
	gettuanduiliebiao: {
		url: 'jishiyu/xiaojuzi/user/gettuanduiliebiao',
		auth: true,
		method: 'GET',
	},
	/** 授权码绑定**/
	addsqmmendian: {
		url: 'jishiyu/xiaojuzi/mendian/addsqmmendian',
		auth: true,
		method: 'POST',
	},
	/** 消费记录**/
	getxiaofeijilu: {
		url: 'jishiyu/xiaojuzi/user/getxiaofeijilu',
		auth: true,
		method: 'GET',
	},
	/** 我的上级**/
	myshangji: {
		url: 'jishiyu/xiaojuzi/user/xiugailianxifangshi',
		auth: true,
		method: 'GET',
	},
	/** 修改上级联系方式**/
	xiugailianxifangshi: {
		url: 'jishiyu/xiaojuzi/user/xiugailianxifangshi',
		auth: true,
		method: 'POST',
	},
	/** 门店-通过offid查询门店**/
	querymendianByoffId: {
		url: 'jishiyu/xiaojuzi/mendian/querymendianByoffId',
		auth: true,
		method: 'GET',
	},
	/** 修改代理 **/
	xiugaidaili: {
		url: 'jishiyu/xiaojuzi/user/xiugaidaili',
		auth: true,
		method: 'POST',
	},
	/** 注销账号-操作下级开关 **/
	zhuxiaoorkaiqixiaji: {
		url: 'jishiyu/xiaojuzi/user/zhuxiaoorkaiqixiaji',
		auth: true,
		method: 'GET',
	},
	/** 操作视频-分页列表查询 **/
	czsplist: {
		url: 'jishiyu/xiaojuzi/user/czsplist',
		auth: true,
		method: 'GET',
	},
	/** 评价详情 **/
	pingjiaxiangqing: {
		url: 'jishiyu/xiaojuzi/huiping/pingjiaxiangqing',
		auth: true,
		method: 'GET',
	},
	/** 转让积分 **/
	zrjf: {
		url: 'jishiyu/xiaojuzi/user/zrjf',
		auth: true,
		method: 'GET',
	},
	/** 修改评价查看时间 **/
	chapingchakanadd: {
		url: 'jishiyu/xiaojuzi/user/chapingchakanadd',
		auth: true,
		method: 'GET',
	},
	/** 美团菜品动图上传**/
	caipintupian: {
		url: 'jishiyu/xiaojuzi/dongtu/caipintupian',
		auth: true,
		method: 'POST',
	},
	/** 美团菜品自定义动图上传**/
	zidingyidongtu: {
		url: 'jishiyu//xiaojuzi/dongtu/zidingyidongtu',
		auth: true,
		method: 'POST',
	},
	/** 复制美团所有商品菜单到美团**/
	copymtallshangpincaidan: {
		url: 'jishiyu/xiaojuzi/copyproduct/copymtallshangpincaidan',
		auth: true,
		method: 'GET',
	},
	/** 复制饿了么所有商品菜单到美团**/
	copyelmallshangpincaidantomt: {
		url: 'jishiyu/xiaojuzi/copymeshuju/copyelmallshangpincaidantomt',
		auth: true,
		method: 'GET',
	},
	/** 美团to饿了么商品**/
	meituantoelemepro: {
		url: 'jishiyu/xiaojuzi/copymeshuju/meituantoelemepro',
		auth: true,
		method: 'GET',
	},
	/** 复制饿了么商品活动到饿了么 **/
	copyallshangpinhuoodng: {
		url: 'jishiyu/xiaojuzi/copymeshuju/copyallshangpinhuoodng',
		auth: true,
		method: 'GET',
	},
	/** 美团门店昨日数据概览**/
	getmtmdzrsjgl: {
		url: 'jishiyu/xiaojuzi/mendian/getmtmdzrsjgl',
		auth: true,
		method: 'GET',
	},
	/** 门店-到期数量,异常数量 **/
	mddqsl: {
		url: 'jishiyu/xiaojuzi/mendian/mddqsl',
		auth: true,
		method: 'GET',
	},
	/** 点金日志-分页列表查询 **/
	djrzlist: {
		url: 'jishiyu/xiaojuzi/dianjintuiguang/djrzlist',
		auth: true,
		method: 'GET',
	},
	/** 支付宝支付 **/
	zhifuxinxi: {
		url: 'jishiyu/xiaojuzi/zfbzhifu/zhifuxinxi',
		auth: true,
		method: 'GET',
	},
	/** 留言-添加 **/
	addliuyan: {
		url: 'jishiyu/xiaojuzi/user/addliuyan',
		auth: true,
		method: 'POST',
	},
	/** 退出登陆 **/
	tuichudenglu: {
		url: 'jishiyu/xiaojuzi/user/tuichudenglu',
		auth: true,
		method: 'POST',
	},
	/** 注销登陆 **/
	zhuxiaozhanghao: {
		url: 'jishiyu/xiaojuzi/user/zhuxiaozhanghao',
		auth: true,
		method: 'POST',
	},
	/** 美团商品图片还原 **/
	mttupianhuanyuan: {
		url: 'jishiyu/xiaojuzi/mendian/mttupianhuanyuan',
		auth: true,
		method: 'POST',
	},
	/** 动图上传次数查询 **/
	getdongtucishu: {
		url: 'jishiyu/xiaojuzi/dongtu/getdongtucishu',
		auth: true,
		method: 'GET',
	},
	/** 获取公告 **/
	getgongao: {
		url: 'jishiyu/xiaojuzi/user/getgongao',
		auth: true,
		method: 'GET',
	},
	/** 获取最新版本号 **/
	getbanbenhao: {
		url: 'jishiyu/xiaojuzi/user/getbanbenhao',
		auth: true,
		method: 'GET',
	},
	/** 留言-分页列表查询 **/
	liuyanlist: {
		url: 'jishiyu/xiaojuzi/user/liuyanlist',
		auth: true,
		method: 'GET',
	},
	/** 获取动图树 **/
	allCaipingdongtucaidanList: {
		url: 'jishiyu//xiaojuzi/dongtu/allCaipingdongtucaidanList',
		auth: true,
		method: 'GET',
	},
	/** 静态图贴图 **/
	jintaishangchuan: {
		url: 'jishiyu/xiaojuzi/dongtu/jintaishangchuan',
		auth: true,
		method: 'GET',
	},
	/** 静态图分页 **/
	rootList: {
		url: 'jishiyu/xiaojuzi/dongtu/rootList',
		auth: true,
		method: 'GET',
	},
	/*修改备注*/
	updatebeizhu: {
		url: 'jishiyu/xiaojuzi/mendian/updatebeizhu',
		auth: true,
		method: 'POST',
	},
	/** 门店提醒回显 **/
	gettx: {
		url: 'jishiyu/xiaojuzi/mendian/gettx',
		auth: true,
		method: 'GET',
	},
	/** 获取账号下绑定的微信用户 **/
	getwxusers: {
		url: 'jishiyu/xiaojuzi/user/getwxusers',
		auth: true,
		method: 'GET',
	},
	/*门店提醒设置*/
	updattx: {
		url: 'jishiyu/xiaojuzi/mendian/updattx',
		auth: true,
		method: 'POST',
	},
	/** 门店时间转移 **/
	zhuanyishijian: {
		url: 'jishiyu/jishiyu/zhuanyi/zhuanyishijian',
		auth: true,
		method: 'GET',
	},
	/*修改下级用户备注*/
	xiugaibeizhu: {
		url: 'jishiyu/xiaojuzi/user/xiugaibeizhu',
		auth: true,
		method: 'POST',
	},
	/* 餐饮置顶 */
	cymendianzhiding: {
		url: 'jishiyu/xiaojuzi/mendian/cymendianzhiding',
		auth: true,
		method: 'POST',
	},
	
	
	
	
	
    /** 获取天气 **/
    test: {
    	url: 'api?version=v9&appid=23035354&appsecret=8YvlPNrz',
    	auth: false,
    	method: 'GET',
    	// desc: '初始化数据',
    },
    
	/** 初始化 ↓ **/
	init: {
		url: 'index/init',
		auth: false,
		method: 'GET',
		// desc: '初始化数据',
	},

	/** 上传Base64图片 ↓ **/
	uploadBase64: {
		url: 'index/uploadBase64',
		auth: false,
		method: 'POST',
		// desc: '上传Base64位图片',
	},

	/** 用户 ↓ **/
	user: {
		info: {
			url: 'user',
			auth: true,
			method: 'GET',
			// desc: '用户信息',
		},

		profile: {
			url: 'user/profile',
			auth: true,
			method: 'POST',
			// desc: '修改用户信息',
		},

		changeMobile: {
			url: 'user/changemobile',
			auth: true,
			method: 'POST',
			// desc: '修改手机号',
		},

	},

};
