<template>
	<!-- 选择身份 -->
	<view class="choose">
		<view class="box">
			<view class="boxBg" :class="index==active?'buleColor':''" v-for="(item,index) in itemList" :key="index"
				@tap="chooseType(index)">
				<image :src="item.image" mode="" class="sjImg"></image>
				<view class="box-text">{{item.text}}</view>
				<!-- 版本号信息 -->
				<view class="version-info" v-if="index === 0">
					<view class="version-item">当前版本: v{{currentVersion}}</view>
					<view class="version-item" v-if="serverVersion">最新版本: v{{serverVersion}}</view>
				</view>
			</view>
		</view>
		<view class="but" hover-class="but-hover" @tap="toType">确定</view>
		<view class="online-service" hover-class="online-service-hover" @tap="openOnlineService">在线客服</view>
		<IcpFooter class="icp-bar" />
		<!-- #ifdef APP-HARMONY -->
		<PrivacyConsentDialog :visible="showPrivacyDialog" @agree="onPrivacyAgree" />
		<!-- #endif -->
	</view>
</template>

<script setup>
	// import { useRoute, useRouter } from '@/utils/router';
	import {
		ref
	} from 'vue';
	import { onLoad } from '@dcloudio/uni-app'
	import { useAuthStore } from '@/store/auth.ts'
	import * as versionUtils from '@/uni_modules/hic-upgrade/utils/index.js'
	import { getLatestVersion } from '@/utils/version.js'
	import { openOnlineService } from '@/utils/onlineService'
	import { goAppHome } from '@/utils/mpHome'
	import { ensureApiLineConfig } from '@/utils/ensureApiLine'
	import { clearAuthSession } from '@/utils/authSession'
	import { UserApi } from '@/api/login'
	import IcpFooter from '@/components/IcpFooter.vue'
	// #ifdef APP-HARMONY
	import PrivacyConsentDialog from '@/components/PrivacyConsentDialog.vue'
	import { hasAgreedPrivacy } from '@/utils/privacyConsent'
	// #endif
	// const route = useRoute()
	// const router = useRouter()
	
	const authStore = useAuthStore()
	const currentVersion = ref('')
	const serverVersion = ref('')
	// #ifdef APP-HARMONY
	const showPrivacyDialog = ref(!hasAgreedPrivacy())
	// #endif
	
	// 获取版本信息
	const getVersionInfo = async () => {
		// #ifdef APP-PLUS
		try {
			// 获取当前版本
			if (typeof plus !== 'undefined' && plus.runtime) {
				versionUtils.getVersionInfo()
				// 等待一下让 getVersionInfo 完成
				setTimeout(() => {
					const current = versionUtils.getCurrentVersion()
					currentVersion.value = current.version || '1.0.0'
				}, 500)
				
				// 获取服务器版本（静默获取，不显示提示）
				try {
					const res = await getLatestVersion({
						platform: versionUtils.platform
					})
					if (res && res.versionName) {
						serverVersion.value = res.versionName
					}
				} catch (e) {
					// console.error('获取服务器版本失败:', e)
					// 获取失败不影响页面显示
				}
			}
		} catch (e) {
			// console.error('获取版本信息失败:', e)
		}
		// #endif
		
		// #ifdef MP-WEIXIN
		currentVersion.value = '1.0.15'
		// #endif
		// #ifdef H5
		currentVersion.value = '1.0.0'
		// #endif
	}
	
	const redirectIfLoggedIn = async () => {
		const token = uni.getStorageSync('token')
		if (!token || token.trim() === '') {
			return false
		}
		if (!authStore.token) {
			authStore.setToken(token)
		}
		const userId = uni.getStorageSync('userId')
		if (userId && !authStore.userId) {
			authStore.setUserId(userId)
		}
		// #ifdef MP-WEIXIN
		try {
			const res = await Promise.race([
				UserApi.getUser(),
				new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 8000))
			])
			if (res.code === 200 && res.data) {
				goAppHome({ reLaunch: true })
				return true
			}
		} catch (e) {
			// 网络慢 / token 失效：清掉后留在登录入口，不阻塞首屏
		}
		clearAuthSession()
		return false
		// #endif
		// #ifndef MP-WEIXIN
		goAppHome({ reLaunch: true })
		return true
		// #endif
	}

	// #ifdef APP-HARMONY
	const onPrivacyAgree = () => {
		showPrivacyDialog.value = false
		if (!redirectIfLoggedIn()) {
			getVersionInfo()
		}
	}
	// #endif

	// 页面加载：先展示界面，登录态校验放后台（避免 API 慢导致首屏卡死）
	onLoad(() => {
		// #ifdef MP-WEIXIN
		ensureApiLineConfig()
		getVersionInfo()
		redirectIfLoggedIn()
		return
		// #endif
		// #ifdef APP-HARMONY
		if (showPrivacyDialog.value) {
			return
		}
		// #endif
		redirectIfLoggedIn().then((ok) => {
			if (!ok) getVersionInfo()
		})
	})
	
	const itemList = [
		// {
		// 	image: "../../static/choose/sj.png",
		// 	text: "我是商家"
		// },
		{
			image: "/static/choose/yy.png",
			text: "欢迎使用"
		}
	]
	const active = ref(0)
	const chooseType = (index) => {
		active.value = index

	}
	const toType = () => {
		uni.navigateTo({
			url: '/pages/login/merchantLogin?peageFlag=2',
			fail: (err) => {
				console.error('navigateTo merchantLogin failed', err)
				uni.showToast({ title: '页面跳转失败', icon: 'none' })
			}
		})
	}
</script>
<style lang="scss" scoped>
	.choose {
		min-height: 100vh;
		width: 750rpx;
		position: relative;
		background-image: url('../../static/choose/choose-bg.png');
		background-size: 100% 100%;
		padding-bottom: calc(120rpx + env(safe-area-inset-bottom));

		.box {
			margin-top: 500rpx;
			display: flex;
			flex-direction: row;
			padding: 0 30rpx;
			// justify-content: space-between; // 屏蔽商家端后改为居中显示
			justify-content: center;
		}

		

		.boxBg {
			width: 335rpx;
			min-height: 300rpx;
			border-radius: 12rpx;
			background-color: #fff;
			position: relative;
			border: 2rpx solid transparent;
			padding-bottom: 40rpx;

			.sjImg {
				position: absolute;
				top: -64rpx;
				left: 71rpx;
				width: 194rpx;
				height: 200rpx;
			}

			.box-text {
				position: absolute;
				left: 107rpx;
				top: 184rpx;
				color: #333333;
				font-size: 30rpx;
				font-weight: 600;
			}
			
			.version-info {
				position: absolute;
				left: 0;
				right: 0;
				top: 230rpx;
				display: flex;
				flex-direction: column;
				align-items: center;
				padding: 0 20rpx;
				
				.version-item {
					color: #999999;
					font-size: 22rpx;
					line-height: 32rpx;
					margin-bottom: 4rpx;
				}
			}
		}
		
		.buleColor {
			border: 2rpx solid #FACC05;
		}

		.but {
			width: 690rpx;
			height: 90rpx;
			background-color: #FACC05;
			border-radius: 12rpx;
			color: #000000;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			margin: 90rpx 30rpx 0;
			position: relative;
			z-index: 2;
		}

		.but-hover {
			opacity: 0.85;
		}

		.online-service {
			width: 690rpx;
			height: 72rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin: 18rpx 30rpx 0;
			color: #333333;
			font-size: 28rpx;
			border-radius: 12rpx;
			background-color: rgba(255, 255, 255, 0.88);
			position: relative;
			z-index: 2;
		}

		.online-service-hover {
			opacity: 0.85;
		}

		.icp-bar {
			margin-top: 40rpx;
			position: relative;
			z-index: 1;
		}
	}
</style>