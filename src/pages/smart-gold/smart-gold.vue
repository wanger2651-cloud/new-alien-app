<template>
	<view class="points-page relative h-100vh flex flex-1 flex-col overflow-y-auto bg-white">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-arrow :safeAreaInsetTop="true"
			title="自动竞价"></wd-navbar>
		<!-- <view style="width: 100%;box-sizing: border-box;padding: 0 30rpx;display: flex;align-items: center;justify-content: space-between;"
			:style="`padding-top: calc(${systemBarHeight}px + 44px + 30rpx)`">
			<wd-checkbox v-model="checkValue" :checked-color="shopType == 1 ? '#FACC05' : '#0492FA'" shape="square">只看有分配预算时段</wd-checkbox>
			<view class="close-list" :class="{'is-elm-btn': shopType == 2}">收起</view>
		</view> -->
		<view class="flex-shrink-0" :style="`padding-top: calc(${systemBarHeight}px + 44px)`">
			<view class="headerBg mt-10 h-40 w-full flex flex-row items-center text-13 text-#A1797E">
				<span class="w-139 flex flex-shrink-0 items-center justify-center pl-15">时间段</span>
				<span class="flex flex-1 flex-shrink-0 items-center justify-center">出价</span>
			</view>
		</view>
		<view class="tree-container" :style="`height: calc(100vh - 44px - ${systemBarHeight}px - 60rpx - 30rpx - 50px - 120rpx);overflow-y:scroll`">
			<TimeTree ref="timeTreeRef" @savePlanOffers="savePlanOffers"/>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	
	let queryParams = reactive({
		code: '',
		shop: ''
	})
	const isV2 = ref(false)
	const checkValue = ref(false)
	import {
		logApi
	} from '@/api/log'
	let conf_json = reactive({})
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
	const getConfData = () => {
		logApi.getConfFunc(queryParams).then(res => {
			if (res.code === 200) {
				conf_json = res.data.conf_json
			}
		})
	}
	const savePlanOffers = (data) => {
		let Plan_Offers = []
		data.forEach(item => {
			Plan_Offers.push(...item)
		})
		const params = {
			code: queryParams.code,
			shop: queryParams.shop,
			ConfObj: {
				AutoAdType: conf_json.AutoAdType,
				AutoAdType_fool: {
					offer_anyway: conf_json.AutoAdType_fool.offer_anyway,
					Plan_Offers
				}
			}
		}
		logApi.saveConfFunc(params).then(res => {
			if (res.code === 200) {
				getConfData()
				return uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			}
		})
	}
	
	const shopType = ref('')
	onLoad((options) => {
		getSysteminfo()
		if (options) {
			queryParams.shop = options.shopId
			queryParams.code = options.type
			isV2.value = JSON.parse(options.isV2)
			shopType.value = options.shopType
			if (queryParams.shop) {
				getConfData()
			}
		}
	})
</script>

<style lang="scss" scoped>
	.headerBg {
		width: 750rpx;
		height: 80rpx;
		background: #F8F7F4;
	}

	.wd-button.isV2 {
		background-color: #F81C3A !important;
	}
	
	.close-list {
		width: 100rpx;
		height: 60rpx;
		background: #FACC05;
		border-radius: 8rpx;
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
		line-height: 60rpx;
		text-align: center;
	}
	.is-elm-btn {
		background: #0492FA;
		color: #fff;
	}
</style>