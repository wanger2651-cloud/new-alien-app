<template>
	<view class="icp-footer" @click="openBeianSite">
		<text class="icp-text">粤ICP备2024027990号-1A</text>
	</view>
</template>

<script setup>
	const BEIAN_URL = 'https://beian.miit.gov.cn/'

	const openBeianSite = () => {
		// #ifdef H5
		window.open(BEIAN_URL, '_blank')
		// #endif
		// #ifdef APP-PLUS
		plus.runtime.openURL(BEIAN_URL)
		// #endif
		// #ifdef MP
		uni.setClipboardData({
			data: BEIAN_URL,
			success: () => {
				uni.showToast({
					title: '备案查询链接已复制',
					icon: 'none'
				})
			}
		})
		// #endif
	}
</script>

<style scoped lang="scss">
	.icp-footer {
		width: 100%;
		padding: 24rpx 0;
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.icp-text {
		font-size: 22rpx;
		color: #999999;
		text-decoration: underline;
	}
</style>
