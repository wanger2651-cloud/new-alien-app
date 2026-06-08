<template>
	<view class="workbench">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="聚合客服工作台" left-text="返回" left-arrow @click-left="handleClickLeft" :bordered="false"></wd-navbar>
		
		<!-- 工作台内容区域 -->
		<view class="workbench-content" :style="{paddingTop: (systemBarHeight + 44) + 'px'}">
			<view class="welcome-section">
				<text class="welcome-text">欢迎使用聚合客服工作台</text>
				<text class="welcome-desc">统一管理您的客服消息、店铺和团队成员</text>
			</view>
			
			<!-- 功能卡片区域 -->
			<view class="function-cards">
				<view class="function-card" @click="handleMessageManage">
					<view class="card-icon message-icon">💬</view>
					<view class="card-content">
						<text class="card-title">消息管理</text>
						<text class="card-desc">查看和处理客户消息</text>
					</view>
					<view class="card-arrow">›</view>
				</view>
				
				<view class="function-card" @click="handleShopManage">
					<view class="card-icon shop-icon">🏪</view>
					<view class="card-content">
						<text class="card-title">店铺管理</text>
						<text class="card-desc">管理店铺和激活IM客服</text>
					</view>
					<view class="card-arrow">›</view>
				</view>
				
				<view class="function-card" @click="handleServiceManage">
					<view class="card-icon service-icon">👥</view>
					<view class="card-content">
						<text class="card-title">客服管理</text>
						<text class="card-desc">管理客服成员和分配店铺</text>
					</view>
					<view class="card-arrow">›</view>
				</view>
			</view>
		</view>
		
		<!-- 底部功能按钮（小卡片形式） -->
		<view class="bottom-function-buttons">
			<view class="function-mini-card" @click="handleMessageManage">
				<text class="mini-card-icon">💬</text>
				<text class="mini-card-text">消息</text>
			</view>
			<view class="function-mini-card" @click="handleShopManage">
				<text class="mini-card-icon">🏪</text>
				<text class="mini-card-text">店铺</text>
			</view>
			<view class="function-mini-card" @click="handleServiceManage">
				<text class="mini-card-icon">👥</text>
				<text class="mini-card-text">客服</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted } from 'vue'

	const systemBarHeight = ref(0)

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight
			}
		})
	}

	const handleClickLeft = () => {
		uni.navigateBack()
	}

	// 跳转到消息管理页面（全屏显示）
	const handleMessageManage = () => {
		uni.navigateTo({
			url: '/pages/aggregated-service/message-manage'
		}).catch(err => {
			console.error('跳转失败:', err)
			uni.showToast({
				title: '页面未找到，请检查路由配置',
				icon: 'none'
			})
		})
	}

	// 跳转到店铺管理页面（全屏显示）
	const handleShopManage = () => {
		uni.navigateTo({
			url: '/pages/aggregated-service/shop-manage'
		}).catch(err => {
			console.error('跳转失败:', err)
			uni.showToast({
				title: '页面未找到，请检查路由配置',
				icon: 'none'
			})
		})
	}

	// 跳转到客服管理页面（全屏显示）
	const handleServiceManage = () => {
		uni.navigateTo({
			url: '/pages/aggregated-service/service-manage'
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
	.workbench {
		width: 100%;
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.workbench-content {
		flex: 1;
		overflow-y: auto;
		padding: 40rpx 30rpx;
		padding-bottom: 200rpx; // 为底部按钮留出空间
		box-sizing: border-box;
	}

	.welcome-section {
		text-align: center;
		margin-bottom: 60rpx;
	}

	.welcome-text {
		display: block;
		font-size: 40rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 20rpx;
	}

	.welcome-desc {
		display: block;
		font-size: 26rpx;
		color: #999;
	}

	.function-cards {
		display: flex;
		flex-direction: column;
		gap: 20rpx;
	}

	.function-card {
		background: #fff;
		border-radius: 16rpx;
		padding: 30rpx;
		display: flex;
		align-items: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		transition: all 0.3s;
	}

	.function-card:active {
		transform: scale(0.98);
		opacity: 0.9;
	}

	.card-icon {
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 48rpx;
		border-radius: 12rpx;
		margin-right: 20rpx;
	}

	.message-icon {
		background: linear-gradient(135deg, #667eea15 0%, #764ba215 100%);
	}

	.shop-icon {
		background: linear-gradient(135deg, #f093fb15 0%, #f5576c15 100%);
	}

	.service-icon {
		background: linear-gradient(135deg, #4facfe15 0%, #00f2fe15 100%);
	}

	.card-content {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.card-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
	}

	.card-desc {
		font-size: 24rpx;
		color: #999;
	}

	.card-arrow {
		font-size: 40rpx;
		color: #ccc;
		margin-left: 20rpx;
	}

	.bottom-function-buttons {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		display: flex;
		justify-content: space-around;
		align-items: center;
		padding: 20rpx 30rpx;
		padding-bottom: calc(20rpx + env(safe-area-inset-bottom));
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10rpx);
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
		z-index: 100;
		border-top: 1px solid #f0f0f0;
	}

	.function-mini-card {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 20rpx 10rpx;
		border-radius: 12rpx;
		margin: 0 10rpx;
		transition: all 0.3s;
		// 无背景色，只有边框和阴影
		border: 1px solid #e0e0e0;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.function-mini-card:active {
		transform: scale(0.95);
		opacity: 0.8;
		background: #f8f8f8;
	}

	.mini-card-icon {
		font-size: 40rpx;
		margin-bottom: 8rpx;
	}

	.mini-card-text {
		font-size: 24rpx;
		color: #666;
		font-weight: 500;
	}
</style>

