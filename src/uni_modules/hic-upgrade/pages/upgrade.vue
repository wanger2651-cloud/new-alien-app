<template>
	<view class="hic-upgrade">
		<view class="hic-upgrade__content">
			<view class="content-top">
				<image src="../images/bg_top.png"></image>
				<view v-if="title" class="content-top__text">{{ title }}</view>
			</view>
			<view class="content-body">
				<view v-if="subTitle" class="sub-title">{{ subTitle }}</view>
				<scroll-view v-if="serverInfo.desc" class="desc-scroll" scroll-y>
					<text>{{ serverInfo.desc }}</text>
				</scroll-view>
				<view class="content-footer">
					<template v-if="isiOS">
						<!-- ios -->
						<button class="btn" @click="jumpToAppStore">{{ btnTextiOS }}</button>
					</template>
					<template v-else>
						<!-- android -->
						<template v-if="!downloadSuccess">
							<!-- 下载包 -->
							<template v-if="!downloading">
								<!-- 下载按钮 -->
								<button class="btn" @click="downloadPackage">{{ btnTextDownLoad }}</button>
								<!-- 稍后更新按钮 -->
								<button v-if="!forceUpdate" class="btn btn-later" @tap.stop="closeUpdate">稍后更新</button>
							</template>
							<template v-else>
								<!-- 下载中 -->
								<view class="progress-box">
									<progress class="progress" border-radius="35" :percent="downLoadPercent" :active-color="progressColor" show-info stroke-width="10" />
									<view class="progress-text">
										<text>{{ downLoadingText }}</text>
										<text v-if="packageFileSize > 0">({{ downloadedSize }} / {{ packageFileSize }} M)</text>
										<text v-else>(已下载: {{ downloadedSize }} M)</text>
									</view>
								</view>
							</template>
						</template>
						<template v-else>
							<!-- 下载完成 -->
							<template v-if="!installed">
								<!-- 安装 -->
								<template v-if="!installing">
									<!-- 安装按钮 -->
									<button class="btn" @click="installPackage">{{ btnTextInstall }}</button>
								</template>
								<template v-else>
									<!-- 正在安装 -->
									<button class="btn" loading disabled plain>{{ installText }}</button>
								</template>
							</template>
							<template v-else>
								<!-- 重启 -->
								<button class="btn" @click="restart">{{ btnTextRestart }}</button>
							</template>
						</template>
					</template>
				</view>
			</view>
		</view>
		<view v-if="!forceUpdate" class="hic-upgrade__close" @tap.stop="closeUpdate">
			<image src="../images/app_update_close.png"></image>
		</view>
	</view>
</template>

<script>
	import * as utils from '../utils/index.js';
	import NotifiUtil from '../utils/NotifiUtil.js';
	import config from '../config.js';
	import * as storage from '@/uni_modules/hic-plugin/js_sdk/storage/storage.js';
	import modal from '@/uni_modules/hic-plugin/js_sdk/message/modal.js';
	import toast from '@/uni_modules/hic-plugin/js_sdk/message/toast.js';
	import { navigateBack } from '@/uni_modules/hic-plugin/js_sdk/tools/uniTools.js';
	
	// 安全获取页面栈
	function getCurrentPagesSafe() {
		try {
			// #ifdef APP-PLUS || H5 || MP
			if (typeof getCurrentPages !== 'undefined' && typeof getCurrentPages === 'function') {
				return getCurrentPages();
			}
			// #endif
			return [];
		} catch (e) {
			return [];
		}
	}
	
	export default {
		name: 'HicUpgrade',
		data() {
			return {
				updateInfo: {
					update: false,
					type: '',
					url: ''
				},
				serverInfo: {
					version: '',
					versionCode: 0,
					downloadUrl: '',
					wgtUrl: '',
					forceUpdate: false,
					isSilently: false,
					desc: '1. 更新内容\n2.更新内容，更新一些一致功能阿萨的数据库的非法简单方便数据库粉红色的国际法\n3.斯卡哈打卡的环境扩大后就开始的华为官方是个咖啡馆经典回顾'
				},
				
				title: config.title,
				subTitle: config.subTitle,
				btnTextiOS: config.btnTextiOS,
				btnTextDownLoad: config.btnTextDownLoad,
				downLoadingText: config.downLoadingText,
				btnTextInstall: config.btnTextInstall,
				installText: config.installText,
				btnTextRestart: config.btnTextRestart,
				
				// 下载
				downloadSuccess: false,
				downloading: false,
				downLoadPercent: 0,
				downloadedSize: 0,
				packageFileSize: 0,
				task: null,
				
				// 安装
				installForBeforeFilePath: false,	// 从之前下载安装
				filePath: '',	// 要安装的本地包地址
				installed: false,
				installing: false,
				
				// 进度条颜色
				progressColor: config.progressColor
			}
		},
		computed: {
			forceUpdate() {
				if (this.serverInfo && this.serverInfo.forceUpdate) {
					return this.serverInfo.forceUpdate;
				}
				return false;
			},
			isWGT() {
				return this.updateInfo.type === 'wgt';
			},
			isiOS() {
				if (this.isWGT) {
					return false;
				}
				return utils.platform === 'ios';
			}
		},
		async onLoad() {
			this.updateInfo = utils.getUpdateInfo();
			this.serverInfo = utils.getServerVersion();
			
			// console.log('[更新页面] 加载，updateInfo:', this.updateInfo);
			// console.log('[更新页面] 加载，serverInfo:', this.serverInfo);
			// console.log('[更新页面] forceUpdate:', this.forceUpdate);
			
			this.checkLocalStoragePackage();
		},
		onBackPress(event) {
			// 监听页面返回
			// console.log('--- onBackPress 监听页面返回 --->', event);
			if (this.forceUpdate) {
				// 强制更新不允许返回
				return true;
			}
			if (event.from == 'backbutton') {
				// 来源: 左上角返回按钮或 Android 实体返回键
				this.closeUpdate();	// 通过函数判断是否返回上一级页面
				return true;
			}
		},
		methods: {
			jumpToAppStore() {
				utils.updateForIOS();
			},
			async checkLocalStoragePackage() {
				if (!config.localStorageKey) return;
				// 是否有缓存 如果已经有下载好的包
				const data = await storage.getStorage(config.localStorageKey);
				if (data) {
					if (utils.isUpdate(data)) {
						// 删除包
						await this.removeSavedFile(data.url);
						this.downloadSuccess = false;
						this.filePath = '';
					} else {
						// 直接提示安装
						// console.log('--- 已下载安装包 --->', data);
						this.downloadSuccess = true;
						this.filePath = data.url;
						this.installForBeforeFilePath = true;
					}
				}
			},
			downloadPackage() {
				// console.log('[更新页面] 开始下载，URL:', this.updateInfo.url);
				this.downloading = true;
				
				const appName = config.appName;
				const progressObj = {};
				if (config.notify) {
					// 通知栏显示下载进度
					NotifiUtil.setNotification(appName, '开始下载!');
					if (Array.isArray(config.NotificationProgress) && config.NotificationProgress.length) {
						// 指定进度第一次出现时更新 通知栏显示的下载进度
						config.NotificationProgress.forEach(item => {
							const key = String(item);
							progressObj[key] = { progress: item, isFirst: true };
						});
					}
				}
				let failStatusCode = 0;
				const handleFail = (err) => {
					// 下载失败处理函数
					// console.error('[更新页面] 下载失败:', err);
					// console.error('[更新页面] 失败状态码:', failStatusCode);
					this.downloading = false;
					this.task = null;
					uni.showToast({ 
						title: failStatusCode ? `下载失败，错误码: ${failStatusCode}` : '下载失败，请检查网络连接', 
						icon: 'none',
						duration: 3000
					});
					if (config.notify) {
						NotifiUtil.compProgressNotification(appName, '下载失败!');
					}
				}
				this.task = uni.downloadFile({
					url: this.updateInfo.url,
					success: (res) => {
						// console.log('[更新页面] 下载成功，状态码:', res.statusCode);
						if (res.statusCode === 200) {
							// 验证文件大小
							uni.getFileInfo({
								filePath: res.tempFilePath,
								success: (fileInfo) => {
									// console.log('[更新页面] 文件信息:', fileInfo);
									const fileSizeKB = fileInfo.size / 1024;
									const fileSizeMB = fileInfo.size / (1024 * 1024);
									
									// WGT 文件通常应该大于 1KB，APK 文件通常应该大于 1MB
									const minSize = this.isWGT ? 1 * 1024 : 1 * 1024 * 1024;
									if (fileInfo.size < minSize) {
										// console.error('[更新页面] 文件大小异常:', fileSizeMB.toFixed(2), 'MB');
										this.downloading = false;
										this.task = null;
										uni.showToast({
											title: `下载的文件异常（${fileSizeKB.toFixed(2)}KB），请检查服务器文件`,
											icon: 'none',
											duration: 4000
										});
										return;
									}
									
									// console.log('[更新页面] 文件大小正常:', fileSizeMB.toFixed(2), 'MB');
									this.downloadSuccess = true;
									this.filePath = res.tempFilePath;	// 临时文件路径
									
									if (this.forceUpdate || config.directInstall) {
										// 强制更新 直接安装
										this.installPackage();
									}
								},
								fail: (err) => {
									// console.error('[更新页面] 获取文件信息失败:', err);
									// 即使获取文件信息失败，也尝试安装（某些平台可能不支持）
									this.downloadSuccess = true;
									this.filePath = res.tempFilePath;
									
									if (this.forceUpdate || config.directInstall) {
										this.installPackage();
									}
								}
							});
						} else {
							failStatusCode = res.statusCode;
							handleFail({ statusCode: res.statusCode });
						}
					},
					fail: (err) => {
						// console.error('[更新页面] 下载请求失败:', err);
						handleFail(err);
					},
					complete: () => {
						// 注意：complete 会在 success 或 fail 之后执行
						// 如果下载成功，不应该重置这些值
						if (!this.downloadSuccess) {
							this.downloading = false;
							this.task = null;
							this.downLoadPercent = 0;
							this.downloadedSize = 0;
							this.packageFileSize = 0;
						}
						
						if (config.notify && !this.downloadSuccess) {
							NotifiUtil.clearNotification();	// 清除通知栏信息
						}
					}
				});
				this.task.onProgressUpdate((res) => {
					// 监听下载进度变化
					const pro = res.progress;
					this.downLoadPercent = pro;
					
					// 计算文件大小（MB）
					if (res.totalBytesWritten) {
						this.downloadedSize = (res.totalBytesWritten / Math.pow(1024, 2)).toFixed(2);
					}
					if (res.totalBytesExpectedToWrite && res.totalBytesExpectedToWrite > 0) {
						this.packageFileSize = (res.totalBytesExpectedToWrite / Math.pow(1024, 2)).toFixed(2);
					} else {
						// 如果服务器没有返回 Content-Length，显示已下载大小
						this.packageFileSize = this.downloadedSize || '0';
					}
					
					// console.log('[更新页面] 下载进度:', pro + '%', `(${this.downloadedSize} / ${this.packageFileSize} MB)`);
					
					if (progressObj[pro]) {
						const item = progressObj[pro];
						if (item.isFirst) {
							NotifiUtil.setProgress(pro, appName);
							item.isFirst = false;
						}
					}
				});
			},
			removeSavedFile(filePath) {
				return new Promise((resolve, reject) => {
					// 删除缓存
					storage.removeStorageSync(config.localStorageKey);
					// 删除文件
					uni.removeSavedFile({
						filePath,
						success: () => {
							resolve();
						},
						fail: (err) => {
							// console.log(err)
							resolve();
						}
					});
				});
			},
			closeUpdate() {
				// console.log('[更新页面] closeUpdate 被调用');
				// console.log('[更新页面] forceUpdate:', this.forceUpdate);
				// console.log('[更新页面] downloading:', this.downloading);
				// console.log('[更新页面] downloadSuccess:', this.downloadSuccess);
				
				if (this.forceUpdate) {
					// 强制更新
					// console.log('[更新页面] 强制更新，不允许关闭');
					if (this.downloading) {
						toast('下载中，请稍后...');
					} else {
						toast('请完成更新后再使用应用');
					}
					return;
				}
				
				// 如果正在下载，先中断下载任务
				if (this.downloading && this.task) {
					try {
						this.task.abort();
						this.task = null;
						this.downloading = false;
					} catch (e) {
						// console.error('[更新页面] 中断下载任务失败:', e);
					}
				}
				
				// 直接关闭页面
				// console.log('[更新页面] 开始关闭更新页面');
				
				// 先检查页面栈
				const pages = getCurrentPagesSafe();
				// console.log('[更新页面] 当前页面栈长度:', pages.length);
				
				// 如果只有一页或没有页面栈，使用 reLaunch 跳转
				if (pages.length <= 1) {
					// console.log('[更新页面] 页面栈只有一页，使用 reLaunch 跳转');
					uni.reLaunch({
						url: '/pages/login/chooseUser',
						success: () => {
							// console.log('[更新页面] reLaunch 成功');
						},
						fail: (err) => {
							// console.error('[更新页面] reLaunch 失败:', err);
							// 如果 reLaunch 失败，尝试 switchTab 到首页
							try {
								uni.switchTab({
									url: '/pages/master-index/master-index',
									fail: () => {
										// 如果 switchTab 也失败，最后尝试 navigateBack
										uni.navigateBack();
									}
								});
							} catch (e) {
								// console.error('[更新页面] switchTab 异常:', e);
								uni.navigateBack();
							}
						}
					});
					return;
				}
				
				// 直接使用 reLaunch 跳转，更可靠
				const targetUrl = '/pages/login/chooseUser';
				// console.log('[更新页面] 使用 reLaunch 跳转到:', targetUrl);
				
				uni.reLaunch({
					url: targetUrl,
					success: () => {
						// console.log('[更新页面] reLaunch 成功');
					},
					fail: (err) => {
						// console.error('[更新页面] reLaunch 失败:', err);
						// 如果 reLaunch 失败，尝试 navigateBack
						// console.log('[更新页面] reLaunch 失败，尝试 navigateBack');
						setTimeout(() => {
							uni.navigateBack({
								delta: 1,
								success: () => {
									// console.log('[更新页面] navigateBack 成功');
								},
								fail: (err2) => {
									// console.error('[更新页面] navigateBack 也失败:', err2);
								}
							});
						}, 100);
					}
				});
			},
			async saveFile() {
				const data = {
					version: this.serverInfo.version,
					versionCode: this.serverInfo.versionCode,
					url: this.filePath
				};
				await storage.setStorage(config.localStorageKey, data);
			},
			installPackage() {
				// 安装
				// console.log('[更新页面] 开始安装，文件路径:', this.filePath);
				this.installing = true;
				utils.installForAndroid(this.filePath).then(() => {
					// console.log('[更新页面] 安装成功');
					this.installing = false;
					this.installed = true;
					if (this.forceUpdate || config.directRestart) {
						// 强制更新 直接重启
						this.restart();
					}
				}).catch(async (err) => {
					// 安装失败
					// console.error('[更新页面] 安装失败:', err);
					if (this.installForBeforeFilePath) {
						// 安装之前的包 -> 删除之前的包
						await this.removeSavedFile(this.filePath);
						this.installForBeforeFilePath = false;
					}
					// 安装失败 重新下载安装包
					this.downloadSuccess = false;
					this.installing = false;
					this.installed = false;
					
					const errorMessage = (err && err.message) ? err.message : '安装失败，请重新下载';
					await modal({
						title: '更新失败',
						content: errorMessage,
						showCancel: false
					});
					
					// 删除损坏的文件
					try {
						await this.removeSavedFile(this.filePath);
					} catch (e) {
						// console.error('[更新页面] 删除损坏文件失败:', e);
					}
					
					uni.navigateBack({
						success: () => {
							// console.log('[更新页面] 安装失败后返回成功');
						},
						fail: (err) => {
							// console.error('[更新页面] 安装失败后返回失败:', err);
							navigateBack().catch(e => {
								// console.error('[更新页面] navigateBack 也失败:', e);
							});
						}
					});
				});
				if (!this.isWGT) {
					// 非 wgt 包, 直接返回上一页
					// navigateBack();
				}
			},
			restart() {
				// 重启
				utils.restartForAndroid();
			}
		}
	}
</script>

<style>
page {
	background-color: rgba(0,0,0,0.4);
}
</style>
<style lang="scss" scoped>
@import '../theme.scss';
	
.hic-upgrade {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
	&__content {
		width: 600rpx;
		.content-top {
			position: relative;
			z-index: 1;
			image {
				width: 100%;
				height: 270rpx;
			}
			&__text {
				position: absolute;
				top: 120rpx;
				left: 50rpx;
				color: #FFFFFF;
				font-size: $font-xl;
				font-weight: bold;
			}
		}
		$distance: 50rpx;
		$padding: 40rpx;
		.content-body {
			transform: translateY(-$distance);
			min-height: 300rpx;
			padding: $padding;
			padding-top: $distance + 10rpx;
			background-color: #FFFFFF;
			border-bottom-left-radius: 30rpx;
			border-bottom-right-radius: 30rpx;
			.sub-title {
				font-size: $font-lg;
				font-weight: bold;
				color: $hic-upgrade-subtitle;
				padding: 20rpx 0;
			}
			.desc-scroll {
				box-sizing: border-box;
				padding: 0 40rpx;
				height: 200rpx;
				text-align: left;
				line-height: 1.4;
			}
			.content-footer {
				margin: 40rpx 20rpx 0;
				display: flex;
				flex-direction: column;
				align-items: center;
				gap: 20rpx;
				.progress-box {
					width: 100%;
					display: flex;
					flex-direction: column;
					align-items: center;
					.progress {
						width: 90%;
						height: 40rpx;
						border-radius: 35px;
						.progress-text {
							width: 100%;
							font-size: 28rpx;
							display: flex;
							justify-content: space-around;
						}
					}
				}
			}
		}
	}
	&__close {
		margin-top: 40rpx;
		width: 70rpx;
		height: 70rpx;
		position: relative;
		z-index: 999;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
		-webkit-tap-highlight-color: transparent;
		image {
			width: 100%;
			height: 100%;
			pointer-events: none;
		}
	}
}
.btn {
	height: 80rpx;
	line-height: 80rpx;
	text-align: center;
	padding: 0 40rpx;
	color: $hic-upgrade-btn-color;
	background: $hic-upgrade-btn-bg-color;
	box-sizing: border-box;
	overflow: visible;
	border: 0;
	border-radius: 5000rpx;
	text-decoration: none;
	transform: translate(0rpx, 0rpx);
	position: relative;
	width: 100%;
	&::after {
		display: none;
	}
	&.btn-later {
		background: transparent;
		color: #999999;
		border: 1px solid #E0E0E0;
		margin-top: 0;
	}
}
</style>
