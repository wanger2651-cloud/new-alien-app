export default {
	// 应用名称
	appName: '益农数字农业',
	
	// 哪个版本号不同进行整包更新 ('1.0.0'主版本号.子版本号.补丁版本号.日期版本号)
	// 1 主版本号不同进行整包更新, 其余进行热更新
	// 2 子版本号不同进行整包更新, 其余进行热更新
	// 3 补丁版本号不同进行整包更新, 其余进行热更新
	// 4 日期版本号不同进行整包更新, 其余进行热更新
	updatePosition: 2,
	
	// 是否通知 (下载文件 通知栏显示下载进度)
	notify: false,
	// 通知配置
	NotificationConfig: {
		// 渠道Id 字符串
		channelId: 'versionUpdate',
		// 渠道名称
		channelName: '版本更新',
		// 渠道描述 (可以不写)
		channelDesc: '版本更新通知',
		// 通知渠道 重要程度
		importance: 'IMPORTANCE_DEFAULT',
		
		// 是否允许呼吸灯闪烁
		lights: true,
		// 是否振动
		vibration: false,
		// 是否绕过勿打扰模式
		passDnd: false,
		// 桌面launcher的消息角标
		badge: false
	},
	// 通知栏显示的下载进度 (通知栏中实时更新进度条会引起操作界面卡顿 (1s执行40多次(监听函数), 导致UI操作阻塞), 仅指定进度第一次出现时更新)
	NotificationProgress: [1, 10, 30, 50, 70, 90],
	
	// 标题
	title: '发现新版本',
	// 副标题
	subTitle: '有新的版本发布，是否进行新版本下载?',
	// iOS按钮
	btnTextiOS: '立即跳转更新',
	// 下载按钮
	btnTextDownLoad: '立即下载更新',
	// 下载中提示文字
	downLoadingText: '安装包下载中，请稍后',
	// 安装按钮
	btnTextInstall: '下载完成，立即安装',
	// 安装中提示文字
	installText: '正在安装...',
	// 重启按钮
	btnTextRestart: '安装完毕，点击重启',
	
	// 下载完成是否直接安装 false-用户手动点击按钮安装
	directInstall: true,
	// 安装完成是否直接重启 false-用户手动点击按钮重启
	directRestart: true,
	
	// 缓存 key
	localStorageKey: '__package_info__',
	
	// 进度条颜色
	progressColor: '#3DA7FF'
}
