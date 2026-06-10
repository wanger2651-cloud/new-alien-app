<template>
	<!-- 选择身份 -->
	<view class="choose">
		<view class="box">
			<view class="boxBg" :class="index==active?'buleColor':''" v-for="(item,index) in itemList" :key="index"
				@click="chooseType(index)">
				<image :src="item.image" mode="" class="sjImg"></image>
				<view class="box-text">{{item.text}}</view>
				<!-- 版本号信息 -->
				<view class="version-info" v-if="index === 0">
					<view class="version-item">当前版本: v{{currentVersion}}</view>
					<view class="version-item" v-if="serverVersion">最新版本: v{{serverVersion}}</view>
				</view>
			</view>
		</view>
		<view class="but" @click="toType">确定</view>
		<view class="online-service" @tap="openOnlineService">在线客服</view>
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
		
		// #ifndef APP-PLUS
		// 非 APP 环境，使用默认版本
		currentVersion.value = '1.0.0'
		// #endif
	}
	
	const redirectIfLoggedIn = () => {
		const token = uni.getStorageSync('token')
		if (token && token.trim() !== '') {
			if (!authStore.token) {
				authStore.setToken(token)
			}
			const userId = uni.getStorageSync('userId')
			if (userId && !authStore.userId) {
				authStore.setUserId(userId)
			}
			uni.reLaunch({
				url: '/pages/master-index/master-index'
			})
			return true
		}
		return false
	}

	// #ifdef APP-HARMONY
	const onPrivacyAgree = () => {
		showPrivacyDialog.value = false
		if (!redirectIfLoggedIn()) {
			getVersionInfo()
		}
	}
	// #endif

	// 页面加载时检查是否已登录，如果已登录则直接跳转到主页面
	onLoad(() => {
		// #ifdef APP-HARMONY
		if (showPrivacyDialog.value) {
			return
		}
		// #endif
		if (!redirectIfLoggedIn()) {
			getVersionInfo()
		}
	})
	
	const itemList = [
		// {
		// 	image: "../../static/choose/sj.png",
		// 	text: "我是商家"
		// },
		{
			image: "../../static/choose/yy.png",
			text: "欢迎使用"
		}
	]
	const active = ref(0)
	const chooseType = (index) => {
		active.value = index

	}
	const toType = () => {
		// router.push({ name: 'merchantLogin', query: { } })
		// 屏蔽商家端入口，只保留运营端入口
		// if (active.value === 0) {
		// 	uni.navigateTo({
		// 		url: '/pages/login/merchantLogin?peageFlag=' + 1,
		// 	});
		// } else {
			uni.navigateTo({
				url: '/pages/login/merchantLogin?peageFlag=' + 2
			});
		// }
	}
</script>
<style lang="scss" scoped>
	.choose {
		min-height: 100vh;
		width: 750rpx;
		position: fixed;
		background-image: url('../../static/choose/choose-bg.png');
		background-size: 100% 100%;

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
		}

		.icp-bar {
			position: fixed;
			left: 0;
			right: 0;
			bottom: calc(20rpx + env(safe-area-inset-bottom));
		}
	}
</style>