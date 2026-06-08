<template>
	<view class="aggregated-service" :style="{paddingTop: systemBarHeight + 'px'}">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="聚合客服" left-text="返回" left-arrow @click-left="handleClickLeft" :bordered="false"></wd-navbar>
		<!-- 全屏海报展示 -->
		<view class="poster-wrap" :style="{paddingTop: (systemBarHeight + 44) + 'px'}">
			<image src="@/static/img/juhekfu-Poster.png" class="poster-img" mode="widthFix"></image>
			<!-- 底部填充区域 -->
			<view class="poster-fill"></view>
		</view>
		
		<!-- 底部操作按钮 -->
		<view class="bottom-actions">
			<view class="workbench-btn" @click="handleEnterWorkbench">
				<text class="workbench-btn-text">进入工作台</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted
	} from 'vue'

	const systemBarHeight = ref(0)

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}

	const handleClickLeft = () => {
		uni.navigateBack()
	}

	// 跳转到工作台页面
	const handleEnterWorkbench = () => {
		uni.navigateTo({
			url: '/pages/aggregated-service/workbench'
		}).catch(err => {
			console.error('跳转失败:', err)
			uni.showToast({
				title: '页面未找到，请检查路由配置',
				icon: 'none'
			})
		})
	}

	onMounted(() => {
		getSysteminfo()
	})
</script>

<style scoped lang="scss">
	.aggregated-service {
		width: 100%;
		height: 100vh;
		position: fixed;
		top: 0;
		left: 0;
		overflow: hidden;
		background: linear-gradient(180deg, #9adefe 0%, #bae8fe 50%, #c8ecfe 100%);
	}

	.poster-wrap {
		width: 100%;
		height: 100%;
		box-sizing: border-box;
		overflow: hidden;
		position: relative;
		display: flex;
		flex-direction: column;
		background: linear-gradient(180deg, #9adefe 0%, #bae8fe 50%, #c8ecfe 100%);
	}

	.poster-img {
		width: 100%;
		display: block;
		flex-shrink: 0;
		position: relative;
		z-index: 1;
	}

	.poster-fill {
		flex: 1;
		width: 100%;
		background: linear-gradient(180deg, 
			#c8ecfe 0%, 
			#c8ecfe 25%, 
			#caeefe 40%, 
			#cceffe 55%, 
			#d0effe 70%, 
			#d4f0fe 85%, 
			#d8f1fe 100%);
		min-height: 0;
		position: relative;
		z-index: 0;
	}

	.bottom-actions {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		z-index: 100;
	}

	.workbench-btn {
		width: 100%;
		max-width: 600rpx;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 44rpx;
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		box-shadow: 0 8rpx 24rpx rgba(22, 119, 255, 0.3);
		transition: all 0.3s;
	}

	.workbench-btn:active {
		transform: scale(0.98);
		opacity: 0.9;
	}

	.workbench-btn-text {
		color: #ffffff;
		font-size: 32rpx;
		font-weight: 600;
	}
</style>

