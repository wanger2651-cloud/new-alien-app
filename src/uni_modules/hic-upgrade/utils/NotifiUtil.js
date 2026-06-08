import baseConfig from '../config.js';
import { compareVersion } from '@/uni_modules/hic-plugin/js_sdk/tools/tools.js';

let config = {};
if (baseConfig.notify && baseConfig.NotificationConfig) {
	config = baseConfig.NotificationConfig;
}

/**
 * 通知栏显示下载进度条
 */
class NotificationCustom {
	constructor() {
		if (plus.os.name != 'Android') {
			return;
		}
		// 当前版本号
		const SystemVersion = plus.os.version;
		const Context = plus.android.importClass('android.content.Context');
		const main = plus.android.runtimeMainActivity();
		const NotificationManager = plus.android.importClass('android.app.NotificationManager');
		const nm = main.getSystemService(Context.NOTIFICATION_SERVICE);
		
		// Notification build 要android api16以上才能使用(4.1.2以上)
		let Notification = null;
		if (compareVersion('4.1.1', SystemVersion)) {
			Notification = plus.android.importClass('android.app.Notification');
		} else {
			Notification = plus.android.importClass('android.support.v4.app.NotificationCompat');
		}
		if (!Notification) return;
		
		const Build = plus.android.importClass('android.os.Build');
		if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
			/**
			 * android8.0及以上 显示通知 需设置通知渠道
			 * 创建通知渠道不会执行任何操作, 所以在启动应用程序时执行代码最好
			 * 创建通知渠道之后, 程序无法修改通知行为, 只有用户可以修改, 程序只能修改渠道名称跟渠道描述
			 */
			const description = '版本更新通知';	// 渠道描述
			/**
			 * 重要程度
			 * IMPORTANCE_HIGH		开启通知   会弹出 有声音 状态栏中显示
			 * IMPORTANCE_DEFAULT	开启通知 不会弹出 有声音 状态栏中显示 有震动
			 * IMPORTANCE_LOW		开启通知 不会弹出 无声音 状态栏中显示 无震动
			 * IMPORTANCE_MIN 		开启通知 不会弹出 无声音 状态栏中无显示
			 * IMPORTANCE_NONE		关闭通知
			 */
			const importance = NotificationManager[config.importance];
			
			const NotificationChannel = plus.android.importClass('android.app.NotificationChannel');
			const mChannel = new NotificationChannel(config.channelId, config.channelName, importance);
			if (config.channelDesc) {
				mChannel.setDescription(config.channelDesc);		// 渠道描述 (可以不写)
			}
			mChannel.enableLights(config.lights);		// 是否允许呼吸灯闪烁
			if (config.vibration) {
				// 是否允许震动
				mChannel.enableVibration(true);
				// 震动频率: 先震动1秒，然后停止0.5秒，再震动2秒则可设置数组为：new long[]{1000, 500, 2000}
				mChannel.setVibrationPattern([1000, 500, 2000]);
			} else {
				mChannel.enableVibration(false);
				mChannel.setVibrationPattern([0]);
			}
			if (config.passDnd) {
				mChannel.setBypassDnd(true);
			}
			if (config.badge) {
				mChannel.canShowBadge();
			}
			nm.createNotificationChannel(mChannel);		// 创建通知渠道
			this.mNotificationBuild = new Notification.Builder(main, config.channelId);	// 实例化通知
		} else {
			this.mNotificationBuild = new Notification.Builder(main);
		}
		
		this.notifyManager = nm;
		
		this.mNotificationBuild.setOngoing(false);	// 是否允许滑动关闭, 设为true代表常驻状态栏
		
		// 通知栏点击 回到应用当前页
		const Intent = plus.android.importClass('android.content.Intent');
		const intent = new Intent(main, main.getClass());
		const PendingIntent = plus.android.importClass('android.app.PendingIntent');
		const pendingIntent = PendingIntent.getActivity(main, 0, intent, PendingIntent.FLAG_CANCEL_CURRENT);	// flag_cancel_current
		this.mNotificationBuild.setContentIntent(pendingIntent);	// 设置通知栏点击意图
		
		// 安卓系统自带图标 http://blog.sina.com.cn/s/blog_6db07bd60101dz09.html
		const R = plus.android.importClass('android.R');
		this.mNotificationBuild.setSmallIcon(R.drawable.stat_sys_download);	// 设置小图标
		
		// this.setData();	// 设置默认声音 ??? (无用?)
		// this.mNotificationBuild.setNumber(1);	// 设置通知集合的数量
		// this.setNotifyId();
	}
	/**
	 * @description 抽离重复代码
	 * @param {String} title 通知栏标题
	 * @param {String} content 通知内容
	 * @param {String} tickerTips 通知提示
	 * @param {Number String} sound 声音
	 * @return {Boolean} 是否可以继续往下执行
	 */
	setData(title, content, tickerTips, sound) {
		if (this.mNotificationBuild == null || this.notifyManager == null) {
			return false;
		}
		title = title || '通知栏标题';
		content = content || '通知内容';
		tickerTips = tickerTips || '通知提示';
		if (typeof(sound) !== 'number') {
			/**
			 * sound 声音
			 * 默认有声音 plus.android.importClass('android.app.Notification').DEFAULT_SOUND
			 * 0	无声音
			 * 
			 * 最简单、最一致的方式是使用当前的用户默认设置，使用defaults属性，可以组合
			 * 通知默认的声音 震动 呼吸灯 setDefaults(Notification.DEFAULT_ALL);
			 * 添加声音 Notification.DEFAULT_SOUND  // requires VIBRATE permission
			 */
			sound = plus.android.importClass('android.app.Notification').DEFAULT_SOUND;
		}
		
		this.mNotificationBuild.setContentTitle(title);		// 设置通知栏标题
		this.mNotificationBuild.setContentText(content);	// 设置通知栏显示内容
		this.mNotificationBuild.setTicker(tickerTips);		// 通知首次出现在通知栏
		this.mNotificationBuild.setDefaults(sound);			// 向通知添加声音、闪灯和振动效果
		this.mNotificationBuild.setAutoCancel(true);		// 设置点击通知之后通知是否消失
		return true;
	}
	/**
	 * @description 抽离重复代码
	 * @param {Number} notifyId id,默认为1000
	 * @return {Boolean} 是否可以继续往下执行
	 */
	setNotifyId(notifyId) {
		if (this.mNotificationBuild == null || this.notifyManager == null) {
			return false;
		}
		notifyId = (typeof(notifyId) === 'number') ? notifyId : 1000;
		const mNb = this.mNotificationBuild.build();	// 创建通知 得到 build
		this.notifyManager.notify(notifyId, mNb);		// 发送通知
	}
	/**
	 * @description 给android通知栏发送通知
	 * @param {String} title 标题
	 * @param {String} content 内容
	 * @param {String} tickerTips 提示
	 * @param {Number} notifyId id
	 */
	setNotification(title, content, tickerTips, notifyId) {
		this.setData(title, content, tickerTips);	// 默认有声音
		this.setNotifyId(notifyId);
	}
	/**
	 * @description 设置进度条
	 * @param {Number} progress
	 * @param {String} title 标题
	 * @param {String} content  内容
	 * @param {String} tickerTips  提示
	 * @param {Number} notifyId id
	 */
	setProgress(progress, title, content, tickerTips, notifyId) {
		title = title || 'APP更新包';
		content = content || `正在下载...【${progress}%】`;
		tickerTips = tickerTips || '进度提示';
		
		this.setData(title, content, tickerTips, 0);	// 进度条显示时 默认无声音
		this.mNotificationBuild.setProgress(100, progress, false);
		this.setNotifyId(notifyId);
		/**
		 * 如果为确定的进度条: 
		 * 	调用setProgress(max, progress, false)来设置通知, 在更新进度的时候在此发起通知更新progress
		 * 	并且在下载完成后要移除进度条, 通过调用setProgress(0, 0, false)即可
		 * 如果为不确定(持续活动)的进度条，这是在处理进度无法准确获知时显示活动正在持续
		 * 	调用setProgress(0, 0, true), 操作结束时, 调用setProgress(0, 0, false)并更新通知以移除指示条
		 */
	}
	/**
	 * @description 完成进度条
	 * @param {String} title 标题
	 * @param {String} content  内容
	 * @param {String} tickerTips  提示
	 * @param {Number} notifyId id
	 */
	compProgressNotification(title, content, tickerTips, notifyId) {
		title = title || 'APP更新包';
		content = content || '下载完毕!';
		tickerTips = tickerTips || '进度提示';
		
		 this.setData(title, content, tickerTips);	// 默认有声音
		var R = plus.android.importClass('android.R');
		this.mNotificationBuild.setSmallIcon(R.drawable.stat_sys_download_done);
		this.mNotificationBuild.setProgress(0, 0, false); // 移除进度条
		this.setNotifyId(notifyId);
	}
	/**
	 * @description 清除通知栏信息
	 * @param {Number} notifyId id
	 */
	clearNotification(notifyId) {
		notifyId = (typeof(notifyId) === 'number') ? notifyId : 1000;
		if (this.notifyManager) {
			this.notifyManager.cancel(notifyId);
		}
	}
	/**
	 * @description 清除所有通知栏信息
	 */
	clearAllNotification() {
		if (this.notifyManager) {
			this.notifyManager.cancelAll();
		}
	}
}

const NotifiUtil = new NotificationCustom();

export default NotifiUtil;
