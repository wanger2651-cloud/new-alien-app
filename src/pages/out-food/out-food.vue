<template>
	<view class="order-up-page relative bg-F9F9F9 flex flex-col">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-text="返回" left-arrow :safeAreaInsetTop="true"
			title="出餐设置"></wd-navbar>
		<view class="page-main" :style="`padding-top: calc(${systemBarHeight}px + 44px + 30rpx)`">
			<view class="config">
				<view class="title" v-if="foodCount.expected">
					<view>
						当前普通时段承诺出餐时长：<span>{{ foodCount.expected }}分钟</span>
					</view>
					<image src="@/static/shop/icon_019a.png" mode=""></image>
				</view>
				<view class="config-item flex items-center text-13 mb-6" v-for="(item,idx) in configList" :key="idx">
					<view class="label w-80 mr-10">{{item.title}}</view>
					<view class="value mr-10">
						<wd-input type="text" v-model="item.WaitSecond" no-border placeholder="请输入时间" />
					</view>
					<view class="unit w-30">分钟</view>
					<view class="tips text-11 text-#999" v-if="item.title.includes('午高峰')">（11点-13点）</view>
					<view class="tips text-11 text-#999" v-if="item.title.includes('晚高峰')">（18点-20点）</view>
					<view class="tips text-11 text-#999" v-if="item.title.includes('宵夜')">（21点-24点）</view>
					<view class="tips text-11 text-#999" v-if="item.title.includes('中额')">（订单金额大于50且小于100）</view>
					<view class="tips text-11 text-#999" v-if="item.title.includes('大额')">（订单金额大于100）</view>
				</view>
				<view class="mt-30">
					<view class="save-conf" :class="{'is-elm-btn': shopType == 2, 'isV2': isV2}" @click="saveConf">确定
					</view>
				</view>
			</view>
			<!-- 底部历史记录 -->
			<!-- <OrderUpHistory /> -->
			<view style="width: 100%; box-sizing: border-box;">
				<view class="table-container">
					<view class="table-title">
						今日出餐：<text>{{ foodCount.finished }}/{{foodCount.unfinished }}</text>
					</view>
					<view class="log-table">
						<view class="table-header">
							<view class="table-item">订单序号</view>
							<view class="table-item">出餐用时</view>
							<view class="table-item">出餐时间</view>
							<view class="table-item">出餐状态</view>
						</view>
						<view class="table-main">
							<view class="table-row" v-for="(item, index) in list" :key=index>
								<view class="table-item">#{{ item.dayseq }}</view>
								<view class="table-item">{{ getTime(item) }}</view>
								<view class="table-item">{{ item.out_endTime }}</view>
								<view class="table-item">
									<view v-if="item.state === 2">出餐成功</view>
									<view v-if="item.state === 3">出餐失败</view>
								</view>
							</view>
						</view>
						<wd-pagination v-if="list.length" class="pagination-pager"
							v-model.async="logQueryParams.PageIndex" :total="total"
							:page-size.async="logQueryParams.PageSize" @change="getPageLogData"
							show-icon></wd-pagination>
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
		onLoad
	} from '@dcloudio/uni-app';
	import {
		logApi
	} from '@/api/log'
	import { parseDateSafe } from '@/utils/date'

	let queryParams = reactive({
		funccode: '',
		shopid: ''
	})
	const configList = ref([])
	let confJson = reactive({})
	const list = ref([]);
	const total = ref(0);
	let logQueryParams = reactive({
		PageIndex: 1,
		PageSize: 10,
		func_code: '',
		shop: ''
	})
	const isV2 = ref(false)
	const systemBarHeight = ref(0)
	const shopType = ref('')
	let foodCount = ref({})

	const handleClickLeft = () => {
		uni.navigateBack()
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const getConfData = () => {
		logApi.getConfFuncOther(queryParams).then(res => {
			if (res.code === 200) {
				confJson = res.data.conf
				console.log(confJson.ConfTemplate, confJson.UseTemplate, 'rew')
				let Conf_Time = confJson.ConfTemplate.filter(item => item.Name === confJson.UseTemplate)[0]
					.Conf_Time
				let DefaultConf = confJson.ConfTemplate.filter(item => item.Name === confJson.UseTemplate)[0]
					.DefaultConf
				configList.value = [DefaultConf, ...Conf_Time]
				configList.value.forEach((item, index) => {
					if (item.WaitSecond) {
						item.WaitSecond = item.WaitSecond / 60
					}
					if (item.title === '预定单出餐' && shopType.value == 2) {
						configList.value.splice(index, 1)
					}
				})
				foodCount.value = {
					expected: res.data.site_set ? res.data.site_set.PromiseTime[0].WaitSecond / 60 : null,
					finished: res.data.count_has_out,
					unfinished: res.data.count_wait_out
				}
			}
		})
	}
	const getPageLogData = ({
		value
	}) => {
		logQueryParams.PageIndex = value
		getLogData()
	}
	const getTime = (row) => {
		const endTime = parseDateSafe(row.out_endTime)
		const startTime = parseDateSafe(row.order_time)
		if (!endTime || !startTime) return '-'
		// 计算两个时间点之间的毫秒差
		const diffInMilliseconds = endTime - startTime;

		// 将毫秒转换为分钟和秒
		const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
		const remainingSeconds = Math.round((diffInMilliseconds % (1000 * 60)) / 1000);

		if (diffInMinutes == 0 && remainingSeconds == 0) {
			return ''
		}

		return `${diffInMinutes} 分 ${remainingSeconds} 秒`
	}
	const saveConf = () => {
		let DefaultConf = {}
		let Conf_Time = []
		let configListCopy = JSON.parse(JSON.stringify(configList))
		// console.log(configListCopy._value, 'configListCopy')
		configListCopy._value.forEach((item, index) => {
			item.WaitSecond = item.WaitSecond * 60
			if (index === 0) {
				DefaultConf = item
			} else {
				Conf_Time.push(item)
			}
		})
		const params = {
			code: queryParams.funccode,
			shop: queryParams.shopid,
			ConfObj: {
				UseTemplate: confJson.UseTemplate,
				ConfTemplate: [{
					Name: confJson.ConfTemplate[0].Name, //默认出餐
					DefaultConf,
					Conf_Time
				}]
			}
		}
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		logApi.saveConfFunc(params).then(res => {
			if (res.code === 200) {
				getConfData()
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const getLogData = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		logApi.getLogList(logQueryParams).then(res => {
			if (res.code === 200) {
				list.value = res.data.rows
				total.value = res.data.total
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}

	onLoad((options) => {
		getSysteminfo()
		if (options) {
			queryParams.shopid = options.shopId
			queryParams.funccode = options.type
			logQueryParams.shop = options.shopId
			logQueryParams.func_code = options.type
			shopType.value = options.shopType
			isV2.value = JSON.parse(options.isV2)
			if (queryParams.shopid) {
				getConfData()
			}
			if (logQueryParams.shop) {
				getLogData()
			}
		}
	})
</script>

<style scoped lang="scss">
	.table-container {
		width: 100%;
		box-sizing: border-box;
		padding: 30rpx;
		background-color: #ffffff;
		margin-top: 20rpx;
		border-radius: 12rpx;

		.table-title {
			font-weight: 400;
			font-size: 30rpx;
			color: #666666;
			margin-bottom: 27rpx;

			text {
				color: #333333;
			}
		}
	}

	::v-deep .wd-table__body .wd-table__cell {
		font-size: 20rpx;
	}

	.wd-button.isV2 {
		background-color: #F81C3A !important;
	}

	.tips {
		width: calc(100% - 130px - 90rpx);
	}

	.page-main {
		width: 100%;
		min-height: 100vh;
		background-color: #f9f9f9;
		box-sizing: border-box;
		padding: 0 30rpx;

		.config {
			width: 100%;
			box-sizing: border-box;
			padding: 30rpx;
			background-color: #ffffff;
			border-radius: 12px;

			.title {
				font-weight: 400;
				font-size: 26rpx;
				color: #666666;
				margin-bottom: 30rpx;
				display: flex;
				align-items: center;

				text {
					font-weight: 500;
					font-size: 26rpx;
					color: #333333;
				}

				image {
					width: 14px;
					height: 14px;
					margin: 2px 0 0 6px;
				}
			}

			.value {
				width: 90rpx;
				height: 52rpx;
				background: #F0F0F0;
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				box-sizing: border-box;
				padding: 0 20rpx;

				::v-deep .wd-input {
					background-color: transparent;
				}
			}
		}
	}

	.save-conf {
		width: 100%;
		height: 80rpx;
		background: #FACC05;
		border-radius: 23rpx;
		text-align: center;
		line-height: 80rpx;
		font-weight: 500;
		font-size: 30rpx;
		color: #333333;
	}

	.log-table {
		width: 100%;

		.table-header {
			width: 100%;
			height: 70rpx;
			background: #F8F7F4;
			line-height: 70rpx;
			display: flex;
			align-items: center;

		}

		.table-item {
			width: 25%;
			text-align: center;
			font-weight: 400;
			font-size: 24rpx;
			color: #333;
			line-height: 1.2;
		}

		.table-main {
			.table-row {
				width: 100%;
				display: flex;
				align-items: center;
				height: 80rpx;
				line-height: 80rpx;
				border-bottom: 1px solid #DFDFDF;
			}
		}
	}

	.is-elm-btn {
		background-color: #0492FA;
		color: #ffffff;
	}
</style>