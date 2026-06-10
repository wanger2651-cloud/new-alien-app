<template>
	<view class="customer-service-page">
		<view class="top-bar" :style="{ paddingTop: topPadding }" @tap="goBack">
			<text class="back-text">‹ 返回</text>
		</view>

		<!-- 鸿蒙：web-view 内无法正常输入，改用原生页 + 复制链接 -->
		<!-- #ifdef APP-HARMONY -->
		<view class="native-body">
			<text class="native-title">在线客服</text>
			<text class="native-desc">受鸿蒙系统限制，App 内暂无法显示完整客服对话框。请点击下方按钮复制链接，在手机浏览器中打开即可与客服对话。</text>
			<button class="native-btn" @tap="copyServiceLink">复制客服链接</button>
			<text class="native-tip">复制后打开浏览器，粘贴到地址栏访问</text>
		</view>
		<!-- #endif -->

		<!-- #ifndef APP-HARMONY -->
		<web-view v-if="serviceUrl" class="service-webview" :src="serviceUrl" @error="handleWebError" />
		<view v-if="!serviceUrl" class="fallback">
			<text class="fallback-text">在线客服加载失败，请稍后重试</text>
			<button class="fallback-btn" @tap="copyServiceLink">复制客服链接</button>
		</view>
		<!-- #endif -->
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad, onBackPress } from '@dcloudio/uni-app'
import {
	ONLINE_SERVICE_URL,
	ONLINE_SERVICE_HYBRID_URL,
	openOnlineServiceInBrowser
} from '@/utils/onlineService'

const LOGIN_FALLBACK = '/pages/login/merchantLogin?peageFlag=2'
const topPadding = `calc(env(safe-area-inset-top) + 12rpx)`
const serviceUrl = ref(ONLINE_SERVICE_HYBRID_URL)

const goBack = () => {
	uni.redirectTo({ url: LOGIN_FALLBACK })
}

const copyServiceLink = () => {
	openOnlineServiceInBrowser()
}

const handleWebError = () => {
	serviceUrl.value = ONLINE_SERVICE_URL
	uni.showToast({ title: '正在切换备用客服页', icon: 'none' })
}

onLoad((options) => {
	if (options?.url) {
		try {
			serviceUrl.value = decodeURIComponent(String(options.url))
		} catch (e) {
			serviceUrl.value = String(options.url)
		}
	}
})

onBackPress(() => {
	goBack()
	return true
})
</script>

<style scoped lang="scss">
.customer-service-page {
	width: 100%;
	min-height: 100vh;
	background: #fff;
	display: flex;
	flex-direction: column;
}

.top-bar {
	flex-shrink: 0;
	padding-left: 32rpx;
	padding-right: 32rpx;
	padding-bottom: 12rpx;
	background: #fff;
}

.back-text {
	font-size: 32rpx;
	color: #333;
	line-height: 48rpx;
}

.native-body {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48rpx;
	box-sizing: border-box;
}

.native-title {
	font-size: 36rpx;
	font-weight: 600;
	color: #333;
	margin-bottom: 24rpx;
}

.native-desc {
	font-size: 28rpx;
	color: #666;
	line-height: 1.6;
	text-align: center;
	margin-bottom: 48rpx;
}

.native-btn {
	width: 100%;
	max-width: 560rpx;
	height: 88rpx;
	line-height: 88rpx;
	background: #facc05;
	color: #000;
	border: none;
	border-radius: 12rpx;
	font-size: 30rpx;
}

.native-tip {
	margin-top: 24rpx;
	font-size: 24rpx;
	color: #999;
	text-align: center;
}

.service-webview {
	flex: 1;
	width: 100%;
	height: calc(100vh - 88rpx);
}

.fallback {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48rpx;
	box-sizing: border-box;
}

.fallback-text {
	font-size: 28rpx;
	color: #666;
	margin-bottom: 32rpx;
	text-align: center;
}

.fallback-btn {
	background: #facc05;
	color: #000;
	border: none;
	border-radius: 12rpx;
	padding: 0 40rpx;
	height: 80rpx;
	line-height: 80rpx;
	font-size: 28rpx;
}
</style>
