<template>
	<view class="points-page relative">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-text="返回" left-arrow :safeAreaInsetTop="true"
			:title="currentFunName"></wd-navbar>
		<view :style="`padding-top: calc(${systemBarHeight}px + 44px)`" class="page-container">
			<image src="@/static/shop/fun-bg-cpdt.png" mode="" class="bg-img"></image>
			<view class="page-main" :style="`padding-top: calc(${systemBarHeight}px + 44px + 30rpx)`">
				<view class="t-size-1">让菜品图动起来</view>
				<view class="t-size-2">提升点击率 提升转化率</view>
				<view class="t-size-3">核心亮点 OVERVIEW</view>
				<view class="t-size-4">• 动图视觉革命：让您的菜品在顾客的屏幕上动起来，带来新鲜感诱惑力</view>
				<view class="t-size-4">• 海量模板，一键制作：数百种动图模板，快速替换，立刻拥有动感展示</view>
				<view class="t-size-4">• 个性化定制：支持上传您自己做好的菜品动图进行上传</view>
				<view class="t-size-4">• 效果预览，随时满意：实时预览，确保展示效果达到您的要求</view>
				<view class="t-size-3">功能优势 OVERVIEW</view>
				<view class="box-1">
					<view class="t-size-5">01</view>
					<view class="t-size-4">视觉冲击力：动态效果提高点击率，增加顾客关注</view>
				</view>
				<view class="box-1">
					<view class="t-size-5">02</view>
					<view class="t-size-4">品牌差异化：通过个性化动图，打造独特品牌形象</view>
				</view>
				<view class="box-1">
					<view class="t-size-5">03</view>
					<view class="t-size-4">用户参与度：激发顾客的好奇心和参与感，提高复购率</view>
				</view>
				<view class="t-size-4">让您的菜品"动"起来，让您的生意火起来。</view>
				<view class="box-2">
					到期时间： {{ endTime }}
					<view class="pay-btn" @click="renew">
						续费
					</view>
				</view>
				<view class="box-3" @click="toSetting">
					去使用
				</view>
			</view>
		</view>
		<!-- 全功能购买 -->
		<!-- <wd-popup v-model="authGoodsVisible" v-if="authGoodsVisible" position="bottom" :safe-area-inset-bottom="true"
			closeable @close="handleClose">
			<SettingPopupPlanContent :is-full-popup-plan="isFullPopupPlan" :isV2="false" :auth-goods-list="payList"
				:shopId="shop" :shopType="shopType" :priceTitle="payParams.pricetitle" @close-popup="closeAuthGoodsVisibleHandler"
				@success="subscribe" @updataShopFunc="updataShopFunc" />
		</wd-popup> -->
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app';
	import {
		ref,
		reactive
	} from 'vue';
	import {
		ShopApi
	} from '@/api/shop'
	import {
		ManagementApi
	} from '@/api/management.ts'
	import { getRenewQuoteList } from '@/api/pay'
	import { mapPayQuoteToSpecRow } from '@/utils/payRenewFlow'

	const authGoodsVisible = ref(false)
	const isFullPopupPlan = ref(false)
	const payList = ref([])
	const payParams = reactive({
		shoptype: '',
		pricetitle: '菜品动图_月',
		isKeyWord: true
	})
	const handleClose = () => {
		authGoodsVisible.value = false
	}
	const getPayList = async () => {
		const shopTypeNum = Number(payParams.shoptype) || 1
		try {
			const quotes = await getRenewQuoteList(
				shopTypeNum,
				payParams.pricetitle || '',
				payParams.isKeyWord === true
			)
			payList.value = quotes.map(mapPayQuoteToSpecRow)
		} catch (e) {
			payList.value = []
		}
	}
	// 关闭全功能购买的时候
	const closeAuthGoodsVisibleHandler = () => {
		authGoodsVisible.value = false
	}
	const subscribe = (type) => {
		if (type === 'success') {
			authGoodsVisible.value = false
		}
	}
	const updataShopFunc = (data) => {
		endTime.value = data
		// 更新存的店铺数据
		let currentFun = storageShopInfo.func_enable.filter(item => item.code === funCode.value)
		if (currentFun && currentFun.length) {
			storageShopInfo.func_enable.forEach(item => {
				if (item.code === funCode.value) {
					item.end_time = data
				}
			})
		} else {
			storageShopInfo.func_enable.push({
				code: funCode.value,
				enable: true,
				end_time: data
			})
		}
		uni.setStorageSync('shopInfo', storageShopInfo);
	}
	const renew = () => {
		authGoodsVisible.value = true
	}

	const handleClickLeft = () => {
		uni.navigateBack()
	}
	const toSetting = () => {
		if (endTime.value === '已到期') {
			return uni.showModal({
				title: "提示",
				content: "权限已到期未激活，请续费",
				showCancel: false
			});
		}
		// 菜品美化页面已注释，功能入口已移除
		// uni.navigateTo({
		// 	url: '/pages/beautify/beautify?id=' + shop.value + '&shopType=' + shopType.value
		// })
	}

	const systemBarHeight = ref(0)
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}

	let storageShopInfo = reactive({})
	const endTime = ref('')
	const getEndTime = () => {
		storageShopInfo = uni.getStorageSync('shopInfo');
		console.log(storageShopInfo.func_enable)
		let arr = storageShopInfo.func_enable.filter(item => item.code === funCode.value)
		if (arr && arr.length) {
			const givenDate = new Date(arr[0].end_time.replace(' ', 'T'));
			const currentDate = new Date();
			if (givenDate > currentDate) {
				endTime.value = arr[0].end_time
			} else {
				endTime.value = '已到期'
			}
		} else {
			endTime.value = '已到期'
		}
	}

	const funcList = ref('')
	const currentFunName = ref('')
	const getFuncConf = () => {
		ShopApi.getFuncList({
			shoptype: shopType.value
		}).then(res => {
			if (res.code === 200) {
				funcList.value = res.data
				currentFunName.value = funcList.value.filter(item => item.code === funCode.value)[0].name
			}
		})
	}
	onShow(() => {
		getFuncConf()
		getEndTime()
		getPayList()
	})

	const shop = ref('')
	const shopType = ref('')
	const funCode = ref('')
	onLoad((options) => {
		getSysteminfo()
		if (options) {
			shop.value = options.id
			shopType.value = options.shopType
			payParams.shoptype = options.shopType
			funCode.value = options.code
		}
	})
</script>

<style scoped lang="scss">
	.page-container {
		width: 100%;
		height: 100vh;
		box-sizing: border-box;
		position: relative;

		.bg-img {
			width: 100%;
			height: 100%;
			display: block;
		}

		.page-main {
			position: absolute;
			top: 0;
			left: 0;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
			padding: 0 30rpx 60rpx;
			color: #ffffff;
			font-size: 14px;
			line-height: 1.3;
			overflow-y: scroll;
			letter-spacing: 1px;

			.t-size-1 {
				font-size: 32px;
				margin-bottom: 50rpx;
				font-weight: bold;
			}

			.t-size-2 {
				padding: 10rpx 20rpx;
				background-color: rgba(0, 240, 255, .2);
				display: inline-block;
				margin-bottom: 40rpx;
				color: #00F0FF;
			}

			.t-size-3 {
				font-size: 18px;
				color: #00F0FF;
				margin-bottom: 30rpx;
				font-weight: 500;
			}

			.t-size-4 {
				margin-bottom: 20rpx;
				text-align: justify;
			}

			.box-1 {
				width: 100%;
				box-sizing: border-box;
				padding: 20rpx 30rpx 10rpx 30rpx;
				background-color: rgba(0, 240, 255, .2);
				border-radius: 10px;
				overflow: hidden;
				margin-bottom: 20rpx;

				.t-size-5 {
					font-size: 26px;
					margin-bottom: 20rpx;
					font-weight: bold;
					color: #00F0FF;
				}
			}

			.box-2 {
				width: 100%;
				background-color: rgba(255, 255, 255, .1);
				box-sizing: border-box;
				padding: 20rpx 30rpx;
				border-radius: 10px;
				display: flex;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 20rpx;

				.pay-btn {
					padding: 6rpx 12rpx;
					background: rgba(0, 240, 255, .9);
					border-radius: 3px;
					color: rgba(0, 0, 0, .7);
				}
			}

			.box-3 {
				width: 100%;
				box-sizing: border-box;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
				font-size: 14px;
				background: rgba(0, 240, 255, .9);
				border-radius: 10px;
				color: rgb(0, 0, 0);
				font-weight: 500;
			}
		}
	}
</style>