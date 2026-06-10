<template>
	<view class="app-tutorial">
		<wd-navbar :fixed="true" left-arrow :safeAreaInsetTop="true" title="青柠助手使用教程" @click-left="handleBack" />
		<view class="page-body" :style="`padding-top: calc(${systemBarHeight}px + 44px);`">
			<wd-tabs v-if="tabList.length" v-model="tab" inactiveColor="#666666" color="#333333" @click="selectTab">
				<block v-for="item in tabList" :key="item.id">
					<wd-tab :title="item.name" />
				</block>
			</wd-tabs>
			<scroll-view
				class="video-scroll"
				scroll-y
				:style="`height: calc(100vh - ${systemBarHeight}px - 44px - ${tabList.length ? 46 : 0}px);`"
			>
				<view v-if="loading && !videoList.length" class="state-text">加载中...</view>
				<view v-else-if="!videoList.length" class="state-text">暂无教程视频，请联系管理员上传</view>
				<view v-else class="video-list">
					<view class="video-item" v-for="item in videoList" :key="item.id">
						<video
							:id="'tutorial-video-' + item.id"
							class="video-player"
							:src="item.src"
							:poster="item.img"
							controls
							object-fit="contain"
						/>
						<view class="video-info">
							<view class="video-title">{{ item.title || '未命名教程' }}</view>
							<view class="video-time" v-if="item.crtim">上架时间 {{ item.crtim }}</view>
						</view>
					</view>
				</view>
				<wd-pagination
					v-if="pageTotal > queryParams.pagesize"
					v-model="queryParams.page"
					:total="pageTotal"
					:page-size="queryParams.pagesize"
					show-icon
					@change="handlePageChange"
				/>
			</scroll-view>
		</view>
	</view>
</template>

<script setup>
	import { ref, reactive, onMounted } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { TeachApi } from '@/api/teach'

	const systemBarHeight = ref(0)
	const tab = ref(0)
	const tabList = ref([])
	const videoList = ref([])
	const loading = ref(false)
	const pageTotal = ref(0)
	const queryParams = reactive({
		page: 1,
		pagesize: 10,
		group: ''
	})

	const handleBack = () => {
		uni.navigateBack()
	}

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: (res) => {
				systemBarHeight.value = res.statusBarHeight || 0
			}
		})
	}

	const getList = async () => {
		if (!queryParams.group) return
		loading.value = true
		try {
			const res = await TeachApi.getList({
				page: queryParams.page,
				pagesize: queryParams.pagesize,
				group: queryParams.group
			})
			const rows = res?.data?.rows || res?.Data?.rows || []
			videoList.value = Array.isArray(rows) ? rows : []
			pageTotal.value = Number(res?.data?.total || res?.Data?.total || 0)
		} catch (e) {
			videoList.value = []
			pageTotal.value = 0
		} finally {
			loading.value = false
		}
	}

	const getTabList = async () => {
		loading.value = true
		try {
			const res = await TeachApi.getTabList()
			tabList.value = res?.data || res?.Data || []
			if (tabList.value.length) {
				queryParams.group = tabList.value[0].id
				await getList()
			}
		} catch (e) {
			tabList.value = []
		} finally {
			loading.value = false
		}
	}

	const selectTab = (event) => {
		const index = Number(event?.index ?? tab.value)
		const group = tabList.value[index]
		if (!group) return
		queryParams.group = group.id
		queryParams.page = 1
		getList()
	}

	const handlePageChange = ({ value }) => {
		queryParams.page = value
		getList()
	}

	onLoad(() => {
		getSysteminfo()
	})

	onMounted(() => {
		getTabList()
	})
</script>

<style scoped lang="scss">
	.app-tutorial {
		min-height: 100vh;
		background: #f9f9f9;
	}

	.page-body {
		box-sizing: border-box;
	}

	.video-scroll {
		box-sizing: border-box;
	}

	.state-text {
		padding: 80rpx 40rpx;
		text-align: center;
		font-size: 28rpx;
		color: #999;
	}

	.video-list {
		padding: 20rpx 30rpx 40rpx;
		box-sizing: border-box;
	}

	.video-item {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
		margin-bottom: 24rpx;
		box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.04);
	}

	.video-player {
		width: 100%;
		height: 420rpx;
		background: #000;
	}

	.video-info {
		padding: 24rpx;
	}

	.video-title {
		font-size: 30rpx;
		font-weight: 500;
		color: #333;
		line-height: 1.5;
	}

	.video-time {
		margin-top: 12rpx;
		font-size: 24rpx;
		color: #999;
	}

	::v-deep .wd-tabs__line {
		background-color: #facc05;
	}
</style>
