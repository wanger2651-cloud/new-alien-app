<template>
	<view
		class="aggregated-service"
		:class="{ 'aggregated-service--tab': embeddedTab }"
		:style="rootStyle"
	>
		<wd-navbar
			v-if="!embeddedTab"
			:fixed="true"
			:safeAreaInsetTop="true"
			title="聚合客服"
			left-text="返回"
			left-arrow
			@click-left="handleClickLeft"
			:bordered="false"
		></wd-navbar>
		<view class="poster-wrap" :style="posterWrapStyle">
			<image src="/static/img/juhekfu-Poster.jpg" class="poster-img" mode="widthFix"></image>
			<view v-if="!embeddedTab" class="poster-fill"></view>
		</view>

		<view class="bottom-actions" :class="{ 'bottom-actions--tab': embeddedTab }">
			<view class="workbench-btn" @click="handleEnterWorkbench">
				<text class="workbench-btn-text">进入工作台</text>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		computed,
		onMounted
	} from 'vue'

	const props = defineProps({
		embeddedTab: {
			type: Boolean,
			default: false
		}
	})

	const systemBarHeight = ref(0)

	const rootStyle = computed(() => {
		if (props.embeddedTab) {
			return {}
		}
		return { paddingTop: systemBarHeight.value + 'px' }
	})

	const posterWrapStyle = computed(() => {
		if (props.embeddedTab) {
			return { paddingTop: '0px' }
		}
		return { paddingTop: (systemBarHeight.value + 44) + 'px' }
	})

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

	/* 嵌入底部 Tab 时：填满 tab-panel，避免 100vh 与 Tab 栏重复扣减导致留白 */
	.aggregated-service--tab {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.aggregated-service--tab .poster-wrap {
		flex: 1;
		min-height: 0;
		height: auto;
		overflow-y: auto;
		-webkit-overflow-scrolling: touch;
	}

	.aggregated-service--tab .poster-img {
		width: 100%;
		display: block;
	}

	.aggregated-service--tab .bottom-actions {
		position: relative;
		flex-shrink: 0;
		left: auto;
		right: auto;
		bottom: auto;
		padding: 24rpx 40rpx 32rpx;
		background: linear-gradient(180deg, rgba(200, 236, 254, 0) 0%, #c8ecfe 30%, #c8ecfe 100%);
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
