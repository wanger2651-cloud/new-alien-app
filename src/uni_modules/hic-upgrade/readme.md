# hic-upgrade

APP在线升级、热更新

## 基本用法

### 示例1

APP整包更新、热更新

1. `pages.json` 添加页面路径。**不要设置为`pages.json`中的第一项**

``` json
// #ifdef APP
, {
    "path": "uni_modules/hic-upgrade/pages/upgrade",
    "style": {
        "navigationBarTitleText": "版本更新",
        "navigationStyle": "custom",				// 取消本页面的导航栏
        "backgroundColor": "transparent",
        "disableScroll": true,
        "app-plus": {
            "background": "transparent",			// 背景透明
            "scrollIndicator": "none",				// 不显示滚动条
            "animationType": "fade-in",
            "animationDuration": 200,
            "popGesture": "none"					// 关闭IOS屏幕左边滑动关闭当前页面的功能
        }
    }
}
// #endif
```

2. 创建文件`version.js`

``` js
import * as utils from '@/uni_modules/hic-upgrade/utils/index.js';

/**
 * @description 版本更新
 * @param {Boolean} tip 是否显示提示信息
 * 	app初始化进行版本判断, 不显示提示信息	-> false
 * 	关于页面 手动点击版本更新, 显示提示信息	-> true
 */
export async function versionUpdate (tip) {
	// 1 请求返回服务端版本信息
	const res = await getLatestVersion({
		platform: utils.platform	// 运行平台
	});
	if (!res) {
		if (tip) uni.$z.toast('暂无更新');
		return;
	}
	// 2 存储服务端版本信息
	utils.setServerInfo({
		version: res.versionName,
		versionCode: res.versionCode,
		downloadUrl: res.downloadUrl,
		wgtUrl: res.wgtUrl,
		forceUpdate: res.forceUpdate,
		isSilently: res.isSilently,
		desc: res.versionDesc
	});
	// 3 判断是否更新
	if (!utils.isUpdate()) {
		if (tip) uni.$z.toast('已是最新版本');
		return;
	}
	const updateInfo = utils.getUpdateInfo();
	const info = utils.getServerVersion();
	// 4 wgt 静默更新
	if (updateInfo.type == 'wgt' && info.isSilently) {
		const path = await utils.downloadFile(updateInfo.url);
		// 下载完成 直接安装 下次启动生效
		await utils.installForAndroid(path);
		return;
	}
	// 5 跳转页面 提示更新
	await utils.toUpgradePage('/uni_modules/hic-upgrade/pages/upgrade');
}

/**
 * 模拟服务端请求
 */
function getLatestVersion(data) {
	return new Promise((resolve, reject) => {
		const wgtUrl = 'http://xxx/xx.wgt';
		setTimeout(function () {
			resolve({
				versionName: '1.2.5',
				versionCode: 127,
				downloadUrl: 'http://xxx/xx.apk',
				wgtUrl,
				forceUpdate: 0,
				isSilently: 0,
				versionDesc: '更新一些已知bug...'
			});
		}, 500);
	});
}
```

服务端请求返回数据：getLatestVersion

请求

| 参数     | 说明               |
| -------- | ------------------ |
| platform | 平台 android / ios |

响应

| 参数        | 说明                                          |
| ----------- | --------------------------------------------- |
| versionName | 向用户展示的版本号，如：1.2.3                 |
| versionCode | 内部版本号（整型），如：123                   |
| downloadUrl | 新版本下载地址，apk（ios为App Store跳转地址） |
| wgtUrl      | 新版本下载地址，wgt                           |
| forceUpdate | 是否强制更新                                  |
| isSilently  | 是否静默更新（wgt）                           |
| versionDesc | 更新内容                                      |

3. `App.vue` 应用初始化进行版本判断

``` js
// #ifdef APP
import { versionUpdate } from '@/utils/version.js'
// #endif
export default {
    onLaunch() {
        // #ifdef APP
        versionUpdate(false);	// 版本更新 不显示提示信息
        // #endif
    }
}
```

4. 关于页面 `about.vue`

``` html
<!-- #ifdef APP -->
<view v-if="appInfo.version">
    <text>版本: v{{ appInfo.version }}</text>
</view>
<button @click="checkUpdate">检查新版本</button>
<!-- #endif -->
```

``` js
// #ifdef APP
import { versionUpdate } from '@/utils/version.js';
import { getCurrentVersion } from '@/uni_modules/hic-upgrade/utils/index.js';
// #endif
export default {
    data() {
        return {
            appInfo: {
                version: '1.0.0'
            },
        };
    },
    onReady() {
        // #ifdef APP
        this.appInfo = getCurrentVersion();
        // #endif
    },
    methods: {
        // #ifdef APP
        async checkUpdate() {	// 检查新版本
            uni.showLoading({
                title: '检查新版本',
            });
            await versionUpdate(true).finally(() => {
                uni.hideLoading();
            });
        }
        // #endif
    }
};
```

5. 修改组件主题颜色
   1. `hic-upgrade/theme.scss`
   2. `hic-upgrade/config.js` 的`progressColor`字段

### 示例2

版本更新，下载文件，通知栏显示下载进度条
使用NJS控制Android通知栏，不用个推实现本地消息

自用...可能有bug...

- 在 `manifest.json` 添加振动权限 (如果需要)

```
<uses-permission android:name="android.permission.VIBRATE"/>
```

- 其他页面同 **示例1**
- 修改`hic-upgrade/config.js`，`notify` 设置为 `true`

## 配置

###  可配置参数

`hic-upgrade/config.js`

| 参数                 | 说明                                   | 类型     | 可选值     | 默认值                              |
| -------------------- | -------------------------------------- | -------- | ---------- | ----------------------------------- |
| appName              | 应用名称                               | String   |            | 益农数字农业                        |
| updatePosition       | 哪个版本号不同进行整包更新，具体看下表 | Number   | 1/2/3/4    | 2                                   |
| notify               | 是否通知                               | Boolean  | true/false | false                               |
| NotificationConfig   | 通知配置，具体看下表                   | Object   |            |                                     |
| NotificationProgress | 通知栏显示的下载进度                   | Array    |            | [1,10,30,50,70,90]                  |
| title                | 标题                                   | String   |            | 发现新版本                          |
| subTitle             | 副标题                                 | String   |            | 有新的版本发布，是否进行新版本下载? |
| btnTextiOS           | iOS按钮                                | String   |            | 立即跳转更新                        |
| btnTextDownLoad      | 下载按钮                               | String   |            | 立即下载更新                        |
| downLoadingText      | 下载中提示文字                         | String   |            | 安装包下载中，请稍后                |
| btnTextInstall       | 安装按钮                               | String   |            | 下载完成，立即安装                  |
| installText          | 安装中提示文字                         | String   |            | 正在安装...                         |
| btnTextRestart       | 重启按钮                               | String   |            | 安装完毕，点击重启                  |
| directInstall        | 下载完成是否直接安装                   | Boolean  | true/false | true                                |
| directRestart        | 下载完成是否直接重启                   | Boolean  | true/false | true                                |
| localStorageKey      | 缓存的 key                             | String   |            | __package_info__                    |
| progressColor        | 进度条颜色                             | HexColor |            | #3DA7FF                             |

### updatePosition

updatePosition 可选值

哪个版本号不同进行整包更新 ('1.0.0'：主版本号.子版本号.补丁版本号.日期版本号)

| 值   | 说明                                       |
| ---- | ------------------------------------------ |
| 1    | 主版本号不同进行整包更新, 其余进行热更新   |
| 2    | 子版本号不同进行整包更新, 其余进行热更新   |
| 3    | 补丁版本号不同进行整包更新, 其余进行热更新 |
| 4    | 日期版本号不同进行整包更新, 其余进行热更新 |

### NotificationConfig

NotificationConfig 配置参数

| 参数        | 说明                   | 类型    | 可选值     | 默认值             |
| ----------- | ---------------------- | ------- | ---------- | ------------------ |
| channelId   | 渠道Id                 | String  |            | versionUpdate      |
| channelName | 渠道名称               | String  |            | 版本更新           |
| channelDesc | 渠道描述 (可以不写)    | String  |            | 版本更新通知       |
| importance  | 通知渠道 重要程度      | String  | 看下表     | IMPORTANCE_DEFAULT |
| lights      | 是否允许呼吸灯闪烁     | Booleab | true/false | true               |
| vibration   | 是否震动               | Boolean | true/false | false              |
| passDnd     | 是否绕过勿打扰模式     | Boolean | true/false | false              |
| badge       | 桌面launcher的消息角标 | Boolean | true/false | false              |

#### importance

importance 可选值

| 值                 | 通知 | 是否弹出 | 是否有声音 | 是否状态栏中显示 | 是否震动 |
| ------------------ | ---- | -------- | ---------- | ---------------- | -------- |
| IMPORTANCE_HIGH    | √    | √        | √          | √                | √        |
| IMPORTANCE_DEFAULT | √    |          | √          | √                | √        |
| IMPORTANCE_LOW     | √    |          |            | √                |          |
| IMPORTANCE_MIN     | √    |          |            |                  |          |
| IMPORTANCE_NONE    |      |          |            |                  |          |

## 说明

- 安装 wgt 资源包后，须手动重启应用，或执行 `plus.runtime.restart()`，新的内容才会生效
- 静默更新
  - 在后台静默下载并自行安装，新功能在下次启动App时生效，避免更新时打断用户操作
  - **静默更新后不重启应用，可能会导致正在访问的应用的页面数据错乱，请谨慎使用！**
- [uni-app运行环境版本和编译器版本不一致的问题](https://ask.dcloud.net.cn/article/35627)
  - 选择了简单粗暴的解决方式：文件 `manifest.json` 添加配置：`ignoreVersion: true` 忽略版本检查提示框
  - 手机端SDK版本：云打包，云端打包版本？跟着apk走
  - HBuilderX版本：电脑打包时的HbuilderX版本，热更新会更新Hbuilder版本
- [语雀：APP更新流程图](https://www.yuque.com/docs/share/2529b555-b671-4fec-93b1-c4cb8f0c3329?# )
- [语雀：wgt热更新重启白屏（可能原因）](https://www.yuque.com/hanweixi/duyi/oyign6#DyvLv)
  - **HBuilder版本更新，后续打包的app版本更新，需更新`apk`，不能只是`wgt`**



### APP页面背景透明

文件`pages.json`

``` json
// #ifdef APP
{
	"path": "uni_modules/hic-upgrade/pages/upgrade",
	"style": {
		"navigationBarTitleText": "版本更新",
		"navigationStyle": "custom",		// 取消本页面的导航栏
		"backgroundColor": "transparent",
		"app-plus": {
			"background": "transparent",	// 背景透明
			"animationType": "fade-in",
			"popGesture": "none"			// 关闭IOS屏幕左边滑动关闭当前页面的功能
		}
	}
}
// #endif
```

文件`upgrade.vue`添加样式

``` html
<style>
	/* 不加scoped */
    page {
        background-color: rgba(0,0,0,0.4);
    }
</style>
```

## 参考

> [简书：通知栏显示下载进度—版本更新](https://www.jianshu.com/p/0072f0caef45)
> 
> [简书：Android通知的使用](https://www.jianshu.com/p/deaa263f360f)
> 
> [博客：Android 8.0以上的系统使用通知详细教程代码（兼容8.0以下的系统）](https://xiao7.blog.csdn.net/article/details/109538124)
> 
> [DCloud社区：App资源在线升级更新](https://ask.dcloud.net.cn/article/182)
> 
> [DCloud社区：uniapp 资源在线升级/热更新](https://ask.dcloud.net.cn/article/35667)
> 
> [插件市场：升级中心 uni-upgrade-center - App](https://ext.dcloud.net.cn/plugin?name=uni-upgrade-center-app)
> 
> [插件市场：升级中心 uni-upgrade-center - App](https://ext.dcloud.net.cn/plugin?id=4542)
