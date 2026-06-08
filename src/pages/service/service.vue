<template>
	<view class="points-page relative">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-text="返回" left-arrow :safeAreaInsetTop="true"
			title="IM智能客服"></wd-navbar>
		<image src="@/static/shop/im_bg_001.png" class="im-bg" :style="`top: calc(${systemBarHeight}px + 44px)`">
		</image>
		<view style="width: 100%;box-sizing: border-box;padding: 0 30rpx 30rpx;position: absolute;left: 0;"
			:style="`top: calc(${systemBarHeight}px + 44px + 303rpx);height: calc(100% - ${systemBarHeight}px - 44px - 303rpx);overflow-y:scroll`">
			<view class="rounded-[12rpx] bg-white px-[30rpx]">
				<view class="h-[120rpx] flex flex-row items-center justify-between">
					<span class="text-[32rpx] text-T333333">普通消息</span>
					<view class="flex items-center" @click="showReplyTimePicker = true">
						<span class="mr-[12rpx] text-[26rpx] text-T333333">{{ getReplyTimeLabel(selectedWaitSeconds) }}</span>
						<image src="../../static/shop/toIcon.png" class="w-[12rpx] h-[22rpx]" mode=""></image>
					</view>
				</view>
				<!-- 回复时间选择器弹窗 -->
				<wd-popup v-model="showReplyTimePicker" position="bottom" :z-index="600">
					<view class="reply-time-picker-popup">
						<view class="picker-header">
							<text class="picker-title">选择回复时间</text>
							<view class="picker-close" @click="showReplyTimePicker = false">✕</view>
						</view>
						<view class="picker-options">
							<view 
								v-for="(option, index) in replyTimeOptions" 
								:key="index"
								class="picker-option"
								:class="{ 'picker-option-selected': option.value === selectedWaitSeconds }"
								@click="selectReplyTime(option.value)"
							>
								<text class="picker-option-text">{{ option.label }}</text>
								<text class="picker-option-check" v-if="option.value === selectedWaitSeconds">✓</text>
							</view>
						</view>
					</view>
				</wd-popup>
				<view class="h-[1rpx] w-[630rpx] bg-#DFDFDF "></view>
				<view class="h-[120rpx] flex flex-row items-center justify-between border-t border-#DFDFDF">
					<view class="flex flex-row items-center">
						<span class="text-[32rpx] text-T333333">紧急消息</span>
						<span class="text-[24rpx] text-T333333">（1分钟内回复）</span>
						<image src="../../static/shop/wh.png" class="w-[30rpx] h-[30rpx]" mode=""></image>
						<view
							class="badge flex items-center ml-[8rpx] justify-center px-[12rpx] py-[4rpx] text-[24rpx]">
							推荐</view>
					</view>
					<view class="flex items-center">
						<wd-switch v-model="checked" active-color="#ECB72D" :size="20" disabled />
					</view>
				</view>
			</view>
			<view class="mt-[30rpx] rounded-[12rpx] bg-white px-[30rpx] pb-[32rpx]">
				<view class="h-[110rpx] flex flex-row items-center justify-between">
					<view class="flex items-center">
						<span class="mr-[12rpx] text-[32rpx] text-T333333">售前回复</span>
						<image src="../../static/shop/wh.png" class="w-[30rpx] h-[30rpx]" mode=""></image>
					</view>
					<view
						class="h-[44rpx] w-[80rpx] border-#B8B8B8 border-1 text-center border-solid rounded-[40rpx] p-0"
						@click="toPre">
						<span class="text-13 text-T333333">修改</span>
					</view>
				</view>
				<p class="rounded-[12rpx] bg-#F5F5F5 p-[30rpx] text-[26rpx] text-T333333">
					{{ preSales }}
				</p>

				<view class="flex flex-row items-center py-[32rpx]">
					<image src="../../static/shop/server-gth.png" class="w-[28rpx] h-[28rpx]" mode=""></image>
					<span class="ml-4 text-11 text-T999999">温馨提示：售前内容存在手机号会导致消息无法回复。</span>
				</view>
				<view class="border-b border-#DFDFDF" />
				<view class="h-[110rpx] flex flex-row items-center justify-between">
					<view class="flex items-center">
						<span class="mr-[12rpx] text-[32rpx] text-T333333">售后回复</span>
						<image src="../../static/shop/wh.png" class="w-[30rpx] h-[30rpx]" mode=""></image>
					</view>
					<view
						class="h-[44rpx] w-[80rpx] border-#B8B8B8 border-1 text-center border-solid rounded-[40rpx] p-0"
						@click="toAfter">
						<span class="text-[26rpx] text-T333333">修改</span>
					</view>
				</view>

				<p class="rounded-[12rpx] bg-#F5F5F5 p-[30rpx] text-[26rpx] text-T333333">
					{{ afterSales }}
				</p>
			</view>
			<view class="table-container">
				<view class="log-table">
					<view class="table-header">
						<view class="table-item">客户昵称</view>
						<view class="table-item">回复内容</view>
						<view class="table-item">回复时间</view>
					</view>
					<view class="table-main">
						<view class="table-row" v-for="(item, index) in list" :key=index>
							<view class="table-item" @click="openMsg(item.receive)">{{ item.receive }}</view>
							<view class="table-item" @click="openMsg(item.reply)">{{ item.reply }}</view>
							<view class="table-item">{{ item.crtim }}</view>
						</view>
					</view>
					<wd-pagination v-if="list.length" class="pagination-pager" v-model.async="queryParams.PageIndex"
						:total="total" :page-size.async="queryParams.PageSize" @change="getPageLogData"
						show-icon></wd-pagination>
				</view>
			</view>
		</view>

		<wd-popup v-model="salesState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="salesClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-main">
					<view class="msg-container">
						<view class="code-input">
							<view class="item-name">
								{{ isPre ? '售前回复' : '售后回复' }}
							</view>
							<view class="code-input-main">
								<wd-textarea v-model="inputData" :placeholder="isPre ? '请填写售前回复' : '请填写售后回复'" />
							</view>
						</view>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="salesClose" block>取消</wd-button>
						<wd-button size="large" class="confirm-group" @click="confirmSales" block
							:class="{'isV2': isV2}">确定</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

		<!-- <van-popup
      v-model:show="visible"
      :duration="0.3"
      round
      :position="popupDir"
      :style="{ width: '100%' }"
    >
      <NormalMessagePopup v-if="popupName === PopupNames.NormalMessage" :messageList="messageList" @close-popup="closeMessagePopup" />
      <AfterSalesResponsePopup v-if="popupName === PopupNames.AfterSalesResponse" @close-popup="closePopup" /> -->
		<!-- 售前 -->
		<!-- <EditResponsePopup v-if="popupName === PopupNames.EditResponse" :currentMessage ="beforeMessage" @close-popup="closeResponsePopup" />
      <UrgentMessagePopup v-if="popupName === PopupNames.UrgentMessage" @close-popup="closePopup" /> -->
		<!-- 售后 -->
		<!-- <AfterResponsePopup v-if="popupName === 'AfterResponseMessage'" :currentMessage="afterMessage" @close-popup="closeAfterPopup" />
    </van-popup> -->

		<!-- <van-popup
      v-if="popupName === PopupNames.UrgentMessage"
      v-model:show="visible"
      :duration="0.3"
      round
      position="center"
      :style="{ width: '100%' }"
    >
      <UrgentMessagePopup @close-popup="closePopup" />
    </van-popup> -->
		<wd-message-box></wd-message-box>
	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		ref,
		reactive
	} from 'vue';
	import {
		logApi
	} from '@/api/log'
	import {
		useMessage
	} from '../../../node_modules/wot-design-uni'
	const message = useMessage()

	const checked = ref(true)
	let queryParams = reactive({
		PageIndex: 1,
		PageSize: 10,
		func_code: '',
		shop: ''
	})
	const list = ref([]);
	const total = ref(0);
	let configureQueryParams = reactive({
		code: '',
		shop: ''
	})
	let preSales = ref('')
	let afterSales = ref('')
	let inputData = ref('')
	let conf_json = reactive({})
	const isPre = ref(true)
	const salesState = ref(false)
	const isV2 = ref(false)
	const systemBarHeight = ref(0)
	
	// 回复时间相关
	const showReplyTimePicker = ref(false)
	const selectedWaitSeconds = ref(180) // 默认3分钟（180秒）
	const replyTimeOptions = [
		{ label: '立即回复', value: 0 },
		{ label: '超过10秒未回复的顾客', value: 10 },
		{ label: '超过30秒未回复的顾客', value: 30 },
		{ label: '超过50秒未回复的顾客', value: 50 },
		{ label: '超过2分钟未回复的顾客', value: 120 },
		{ label: '超过3分钟未回复的顾客', value: 180 },
		{ label: '超过4分钟未回复的顾客', value: 240 }
	]
	
	// 获取回复时间标签
	const getReplyTimeLabel = (value) => {
		const option = replyTimeOptions.find(opt => opt.value === value)
		return option ? option.label : '超过3分钟未回复的顾客'
	}
	
	// 选择回复时间
	const selectReplyTime = async (value) => {
		selectedWaitSeconds.value = value
		showReplyTimePicker.value = false
		
		// 保存配置
		if (!conf_json.content) {
			conf_json.content = []
		}
		
		// 确保配置对象包含所有必要字段
		const conf = {
			code: configureQueryParams.code,
			shop: configureQueryParams.shop,
			ConfObj: {
				content: conf_json.content || [],
				sendNum: conf_json.sendNum || 3,
				waitSeconds: value
			}
		}
		
		uni.showLoading({
			title: '保存中',
			mask: true
		})
		
		try {
			const res = await logApi.saveConfFunc(conf)
			if (res.code === 200) {
				// 更新本地配置
				conf_json.waitSeconds = value
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				uni.showToast({
					title: res?.Msg || res?.message || '保存失败',
					icon: 'none'
				})
			}
		} catch (error) {
			console.error('保存回复时间配置失败:', error)
			uni.showToast({
				title: '保存失败，请重试',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const openMsg = (msg) => {
		message.alert(msg)
	}
	const confirmSales = () => {
		if (isPre.value) {
			conf_json.content[0] = inputData.value
		} else {
			conf_json.content[1] = inputData.value
		}
		
		// 确保包含所有必要字段
		const conf = {
			code: queryParams.func_code,
			shop: queryParams.shop,
			ConfObj: {
				content: conf_json.content || [],
				sendNum: conf_json.sendNum || 3,
				waitSeconds: conf_json.waitSeconds !== undefined ? conf_json.waitSeconds : selectedWaitSeconds.value
			}
		}
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		logApi.saveConfFunc(conf).then(res => {
			if (res.code === 200) {
				getConfData()
				salesClose()
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
	const salesClose = () => {
		salesState.value = false
	}
	const handleClickLeft = () => {
		uni.navigateBack()
	}
	const getPageLogData = ({
		value
	}) => {
		queryParams.PageIndex = value
		getLogData()
	}
	const getLogData = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		logApi.getLogList(queryParams).then(res => {
			if (res.code === 200) {
				list.value = res.data.rows
				total.value = res.data.total
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const getConfData = () => {
		logApi.getConfFunc(configureQueryParams).then(res => {
			if (res.code === 200) {
				conf_json = res.data.conf_json || {}
				
				// 解析ConfObj（可能是字符串或对象）
				let confObj = {}
				if (conf_json.ConfObj) {
					confObj = typeof conf_json.ConfObj === 'string' ? JSON.parse(conf_json.ConfObj) : conf_json.ConfObj
				} else if (conf_json.conf_json) {
					confObj = typeof conf_json.conf_json === 'string' ? JSON.parse(conf_json.conf_json) : conf_json.conf_json
				}
				
				// 设置回复内容
				if (confObj.content && Array.isArray(confObj.content)) {
					preSales.value = confObj.content[0] || ''
					afterSales.value = confObj.content[1] || ''
					conf_json.content = confObj.content
				} else {
					conf_json.content = conf_json.content || []
					preSales.value = conf_json.content[0] || ''
					afterSales.value = conf_json.content[1] || ''
				}
				
				// 设置回复时间（waitSeconds）
				if (confObj.waitSeconds !== undefined) {
					selectedWaitSeconds.value = confObj.waitSeconds
					conf_json.waitSeconds = confObj.waitSeconds
				} else if (conf_json.waitSeconds !== undefined) {
					selectedWaitSeconds.value = conf_json.waitSeconds
				} else {
					// 默认3分钟
					selectedWaitSeconds.value = 180
					conf_json.waitSeconds = 180
				}
				
				// 设置回复条数
				if (confObj.sendNum !== undefined) {
					conf_json.sendNum = confObj.sendNum
				} else if (conf_json.sendNum === undefined) {
					conf_json.sendNum = 3
				}
			}
		})
	}
	const toPre = () => {
		isPre.value = true
		salesState.value = true
		inputData.value = JSON.parse(JSON.stringify(preSales.value))
	}
	const toAfter = () => {
		isPre.value = false
		salesState.value = true
		inputData.value = JSON.parse(JSON.stringify(afterSales.value))
	}

	onLoad((options) => {
		getSysteminfo()
		if (options) {
			queryParams.shop = options.shopId
			queryParams.func_code = options.type
			configureQueryParams.code = options.type
			configureQueryParams.shop = options.shopId
			isV2.value = JSON.parse(options.isV2)
			if (queryParams.shop) {
				getLogData()
				getConfData()
			}
		}
	})
</script>

<style scoped lang="scss">
	.badge {
		background: #FFF5DA;
		border-radius: 10px 10px 10px 0px;
		color: #ECB72D;
	}

	.table-container {
		width: 100%;
		box-sizing: border-box;
		padding: 30rpx;
		background-color: #ffffff;
		margin-top: 20rpx;
		border-radius: 12rpx;

		.table-title {
			font-size: 30rpx;
			color: #333333;
			margin-bottom: 20rpx;
		}
	}

	::v-deep .wd-table__body .wd-table__cell {
		font-size: 20rpx;
	}

	.code-input-main {
		width: 100%;
		border-radius: 14rpx;
		border: 1px solid #DFDFDF;
		box-sizing: border-box;
	}

	.footer {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 40rpx;
	}

	.wd-button.isV2 {
		background-color: #F81C3A !important;
	}

	.item-name {
		font-size: 36rpx;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.im-bg {
		width: 100%;
		height: 694rpx;
		position: absolute;
		left: 0;
	}

	.points-page {
		width: 100%;
		height: 100vh;
		overflow: hidden;
		background-color: #f9f9f9;
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
			width: 33%;
			text-align: center;
			font-weight: 400;
			font-size: 24rpx;
			color: #B0AA8F;
		}

		.table-main {
			.table-row {
				width: 100%;
				display: flex;
				align-items: center;
				height: 80rpx;
				line-height: 80rpx;
				border-bottom: 1px solid #DFDFDF;

				.table-item {
					color: #666666;
					line-height: 1.2;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
					width: 100%;
					box-sizing: border-box;
					padding: 0 20rpx;
				}
			}
		}
	}

	/* 回复时间选择器弹窗样式 */
	.reply-time-picker-popup {
		background: #fff;
		border-radius: 24rpx 24rpx 0 0;
		max-height: 70vh;
		overflow: hidden;
	}

	.picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 40rpx;
		border-bottom: 1px solid #e0e0e0;
	}

	.picker-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.picker-close {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
		color: #999;
	}

	.picker-options {
		max-height: calc(70vh - 120rpx);
		overflow-y: auto;
	}

	.picker-option {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 40rpx;
		border-bottom: 1px solid #f0f0f0;
		background: #fff;
	}

	.picker-option:active {
		background: #f5f5f5;
	}

	.picker-option-selected {
		background: #f0f7ff;
	}

	.picker-option-text {
		font-size: 28rpx;
		color: #333;
	}

	.picker-option-selected .picker-option-text {
		color: #1677ff;
		font-weight: 500;
	}

	.picker-option-check {
		font-size: 28rpx;
		color: #1677ff;
		font-weight: bold;
	}
</style>