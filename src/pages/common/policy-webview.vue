<template>
	<view class="policy-page">
		<web-view v-if="pageUrl" class="policy-webview" :src="pageUrl" @error="handleWebError" />
		<view v-else class="fallback">
			<text class="fallback-text">页面加载失败，请稍后重试</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'

const pageUrl = ref('')

const handleWebError = () => {
	uni.showToast({ title: '页面加载失败', icon: 'none' })
}

onLoad((options) => {
	if (options?.title) {
		try {
			uni.setNavigationBarTitle({
				title: decodeURIComponent(String(options.title))
			})
		} catch (e) {
			uni.setNavigationBarTitle({
				title: String(options.title)
			})
		}
	}
	if (options?.url) {
		try {
			pageUrl.value = decodeURIComponent(String(options.url))
		} catch (e) {
			pageUrl.value = String(options.url)
		}
	}
})
</script>

<style scoped lang="scss">
.policy-page {
	width: 100%;
	height: 100vh;
	background: #ffffff;
}

.policy-webview {
	width: 100%;
	height: 100%;
}

.fallback {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
	padding: 48rpx;
	box-sizing: border-box;
}

.fallback-text {
	font-size: 28rpx;
	color: #999999;
}
</style>
