<!-- 菜品美化页面已注释，功能入口已移除 -->
<!--
<template>
	<view class="beautify-page relative bg-F9F9F9 flex ">
		<wd-navbar :fixed="true" class="bg-F9F9F9" @click-left="handleClickLeft" left-text="返回" left-arrow
			:safeAreaInsetTop="true" title="菜品美化"></wd-navbar>
		<view class="beautify-content flex flex-1" :style="`margin-top: calc(${systemBarHeight}px + 44px)`">
			<wd-sidebar @change="onChange" v-model="active" style="width: 30%">
				<wd-sidebar-item :label="item.Name" v-for="(item, idx) in catalogList" :value="idx" />
			</wd-sidebar>
			<view class="flex-1 bg-white" style="width: 70%;box-sizing: border-box;padding: 0 30rpx;">
				<view class="flex items-center text-12 h-48 justify-between">
					<text style="font-size: 24rpx;color: #333;">菜单列表</text>
					<text class="flex items-center refresh-icon" @click="getCpData" :class="{'is-elm-text': shopType == 2}">
						<wd-icon name="refresh" size="14px" style="margin-right: 4px;"></wd-icon>更新菜单</text>
				</view>
				<view :loading="loading" :finished="finished" finished-text="没有更多了" style="height: calc(100% - 48px);overflow-y: scroll;">
					<view class="food-card" v-for="(item, idx) in goodsList" :key="idx">
						<image :src="item.Img" class="w-[160rpx] h-[160rpx]" mode=""></image>
						<view class="content flex">
							<view class="title text-[28rpx] ">{{ item.Name }}</view>
							<view class="flex items-center justify-between" style="width: 100%;">
								<text class="text-[24rpx] value">月销{{item.monthSale||0}}</text>
								<view @click="handleGoDetail(item)" class="change-pic" :class="{'is-elm-btn': shopType == 2}">智能换图</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app';
	import {
		logApi
	} from '@/api/log'
	const queryParams = reactive({
		func_code: "CPDT",
		method: "GetGoods",
		parm_obj: {force: false},
		shop: ''
	})
	
	const handleClickLeft = () => {
		uni.navigateBack()
	}
	const onChange = ({ value, label }) => {
		goodsList.value = catalogList.value[value].Items
		console.log(value, label, goodsList.value)
	}
	const active = ref(0)
	const systemBarHeight = ref(0)
	const shopType = ref('')
	const catalogList = ref([])
	const loading = ref(false)
	const finished = () => {
		loading.value = false
	}
	
	const goodsList = ref([])
	const getCpData = () => {
		uni.showLoading({})
		logApi.callCpData(queryParams).then(res => {
			if (res.code === 200) {
				catalogList.value = res.data.Yday.Groups
				if(catalogList.value.length) {
					goodsList.value = catalogList.value[0].Items
				}
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const handleGoDetail = (item) => {
		uni.setStorageSync('currentPic', item);
		uni.navigateTo({
			url: "/pages/smart-pic/smart-pic?shopType=" + shopType.value + '&id=' + queryParams.shop
		})
	}
	onShow(() => {
		getCpData()
	})
	onLoad((options) => {
		getSysteminfo()
		if (options) {
			shopType.value = options.shopType
			queryParams.shop = options.id
		}
	})
</script>


<style lang="scss" scoped>
	.change-pic {
		font-weight: 500;
		font-size: 24rpx;
		color: #333333;
		padding: 16rpx 28rpx;
		background: #FACC05;
		border-radius: 14rpx;
	}
	
	.beautify-page {
		height: 100vh;
		flex-direction: column;
	}

	.beautify-content {
		height: calc(100vh - 88rpx);

		.van-list {
			height: calc(100vh - 88rpx);
			overflow-y: scroll;
		}
	}

	.food-card {
		.title {
			line-height: 29rpx;
			display: -webkit-box;
			-webkit-box-orient: vertical;
			-webkit-line-clamp: 2;
			overflow: hidden;
			text-overflow: ellipsis;
			line-height: 1.2;
		}

		.content {
			width: calc(100% - 190rpx);
			height: 160rpx;
			justify-content: space-between;
			align-items: flex-start;
			flex-direction: column;
		}

		.value {
			color: #999999;
		}
	}

	::v-deep .wd-sidebar-item {
		height: 96rpx;
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx;
		font-size: 26rpx;
		justify-content: flex-start;
	}

	::v-deep .wd-sidebar-item--active {
		font-weight: 400;
		font-size: 26rpx;
		color: #333333;
	}

	::v-deep .wd-sidebar-item--active::before {
		display: none;
	}

	.food-card {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		margin-bottom: 50rpx;
	}
	.refresh-icon {
		color: #FACC05;
	}
	.is-elm-text {
		color: #0493F7;
	}
	.is-elm-btn {
		background: #0493F7;
		color: #fff;
	}
</style>
-->
