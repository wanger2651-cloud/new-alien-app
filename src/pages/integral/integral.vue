<template>
	<view class="integral">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-arrow :safeAreaInsetTop="true"
			title="积分管理"></wd-navbar>
		<view class="jfHander" :style="`padding-top: calc(${systemBarHeight}px + 44px + 20rpx);`">
			<view class="handerLeft">
				<view class="leftText">剩余积分：</view>
				<view class="leftNum">{{ Number(admin_data.balance || 0).toFixed(1) }}</view>
			</view>
			<view class="rightBut" @click="giveIntegral">分配积分</view>
		</view>
		<view class="jfList">
			<view class="listHead">
				<view class="headItem" v-for="item,index in nameList" :key="index" :class="{'other-item': index === 2}">{{item}}</view>
			</view>
			<view class="listData" v-for="item,index in msgList" :key="index">
				<view class="dataItem">
					<view class="itemText time">{{item.crtim}}</view>
					<view class="itemText reason">{{item.why}}</view>
					<view class="itemText jf">{{item.val}}</view>
					<view class="itemText jf">{{ Number(item.new_balance || 0).toFixed(1) }}</view>
				</view>
			</view>
		</view>
		<!-- <view class="pagination" v-if="msgList && msgList.length">
			<view class="btn" :class="{'btn-des': queryParams.page === 1}" @click="prevPage">
				上一页
			</view>
			<view class="page-num">
				{{ queryParams.page }}
			</view>
			<view class="btn" :class="{'btn-des': queryParams.page === maxPageSize}" @click="nextPage">
				下一页
			</view>
		</view> -->
		<wd-pagination v-if="msgList && msgList.length" v-model.async="queryParams.page" :total="pageTotal"
			:page-size.async="queryParams.pagesize" style="width:60%;background-color: transparent;width: 100%;" @change="getList"
			show-icon></wd-pagination>
		<view v-else class="not-data">
			暂无数据
		</view>
		<wd-popup v-model="distributionState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="distributionClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					分配积分
				</view>
				<view class="log-main">
					<view class="msg-container">
						<view class="code-input">
							<view class="item-name">
								对方用户ID
							</view>
							<view class="code-input-main">
								<wd-input v-model="distributionObj.userId" type="number" :no-border="true"
									placeholder="填写对方用户ID" class="" />
							</view>
						</view>
						<view class="code-input">
							<view class="item-name">
								分配积分
							</view>
							<view class="code-input-main">
								<wd-input v-model="distributionObj.giveVal" type="number" :no-border="true"
									placeholder="填写分配积分" class="" />
							</view>
						</view>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="distributionClose" block>取消</wd-button>
						<wd-button size="large" class="confirm-group" @click="confirmDistribution" block>确定</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow
	} from '@dcloudio/uni-app';
	import {
		ref,
		onMounted,
		reactive
	} from 'vue';
	import {
		logApi
	} from '@/api/log'
	import {
		UserApi
	} from '@/api/login'

	const nameList = ref(['时间', '原因', '变动', '剩余'])
	const msgList = ref([])
	const queryParams = reactive({
		page: 1,
		pagesize: 20
	})
	const pageTotal = ref(0)
	const maxPageSize = ref(0)
	const admin_data = ref({})
	const isV2 = ref(false)
	let distributionObj = reactive({})
	const distributionState = ref(false)
	const systemBarHeight = ref(0)

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	onLoad((options) => {
		getSysteminfo()
		if (options) {
			isV2.value = JSON.parse(options.isV2)
		}
	})

	const giveIntegral = () => {
		distributionState.value = true
	}
	const confirmDistribution = () => {
		if (!distributionObj.userId) {
			uni.showToast({
				title: '填写用户ID',
				icon: 'error',
				duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
				mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
			});
			return
		}
		if (!distributionObj.giveVal) {
			uni.showToast({
				title: '填写分配积分',
				icon: 'error',
				duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
				mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
			});
			return
		}
		// 二次确认弹窗
		uni.showModal({
			title: '确认分配积分',
			content: `对方用户ID：${distributionObj.userId}\n分配积分数量：${distributionObj.giveVal}`,
			confirmText: '确认',
			cancelText: '取消',
			success: (res) => {
				if (res.confirm) {
					// 用户确认后执行分配
					doGiveIntegral()
				}
			}
		})
	}
	
	const doGiveIntegral = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		logApi.giveIntegral(distributionObj).then(res => {
			if (res.code === 200) {
				distributionClose()
				uni.showToast({
					title: '分配成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
				// 分配成功后刷新列表
				getList()
			}
		}).catch(err => {
			uni.showToast({
				title: err.message || '分配失败，请重试',
				icon: 'none',
				duration: 2000
			})
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const distributionClose = () => {
		distributionState.value = false
		distributionObj = {}
	}
	const getList = async () => {
		uni.showLoading({})
		try {
			const data = await logApi.getList(queryParams)
			msgList.value = data.data.rows
			pageTotal.value = data.data.total
			maxPageSize.value = Math.ceil(pageTotal.value / queryParams.pagesize)
			scrollTop()
		} catch {
			console.log(15555)
		} finally {
			uni.hideLoading({})
		}
	}

	const prevPage = () => {
		if (queryParams.page > 1) {
			queryParams.page -= 1
			getList()
		}
	}

	const nextPage = () => {
		if (queryParams.page < maxPageSize.value) {
			queryParams.page += 1
			getList()
		}
	}

	const scrollTop = () => {
		uni.pageScrollTo({
			scrollTop: 0, // 滚动到页面的目标位置  这个是滚动到顶部, 0 
			duration: 300 // 滚动动画的时长
		})
	}
	// 获取代理信息
	const getagencyinfo = () => {
		UserApi.getUser().then(res => {
			if (res.code === 200) {
				admin_data.value = res.data.admin
			}
		})
	}

	onMounted(() => {
		getList()
	})
	onShow(() => {
		getagencyinfo()
	})
	const handleClickLeft = () => {
		// 直接返回上一页，避免跳转到错误的页面
		uni.navigateBack()
	}
</script>

<style lang="scss" scoped>
	.integral {
		min-height: 100vh;
		width: 750rpx;

		.jfHander {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			padding: 20rpx 0;

			.handerLeft {
				display: flex;
				margin-left: 30rpx;
				align-items: center;

				.leftText {
					font-weight: 400;
					font-size: 28rpx;
					color: #666666;
				}

				.leftNum {
					font-weight: 500;
					font-size: 28rpx;
					color: #333333;
				}
			}

			.rightBut {
				width: 150rpx;
				height: 60rpx;
				border-radius: 8rpx;
				font-weight: 400;
				font-size: 28rpx;
				color: #333;
				text-align: center;
				line-height: 60rpx;
				margin-right: 32rpx;
				background-color: #FACC05;
			}
		}

		.jfList {
			display: flex;
			flex-direction: column;

			.listHead {
				width: 100%;
				height: 80rpx;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				padding: 0 30rpx;
				box-sizing: border-box;
				background: #F8F7F4;

				.headItem {
					font-weight: 400;
					font-size: 26rpx;
					color: #B0AA8F;
					text-align: center;
					
					&:nth-child(2) {
						text-align: left;
						padding-left: 10rpx;
					}
				}
			}

			.listData {
				display: flex;
				flex-direction: column;

				.dataItem {
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: space-between;
					padding: 20rpx;
					min-height: 114rpx;
					border-bottom: 1rpx solid #DFDFDF;
					box-sizing: border-box;

					.itemText {
						font-weight: 400;
						font-size: 24rpx;
						color: #333333;
						
						&.reason {
							text-align: left;
						}
					}

					.time {
						width: 30%;
						text-align: center;
						flex-shrink: 0;
					}

					.reason {
						width: 30%;
						flex-shrink: 1;
						overflow: visible;
						word-wrap: break-word;
						word-break: break-all;
						white-space: normal;
						padding: 0 10rpx;
						box-sizing: border-box;
						line-height: 1.5;
					}

					.jf {
						width: 20%;
						text-align: center;
						flex-shrink: 0;
					}
				}
			}
		}
	}

	.pagination {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		box-sizing: border-box;
		padding: 40rpx 60rpx;

		.btn {
			padding: 20rpx 30rpx;
			background-color: rgb(241, 240, 238);
			border-radius: 10rpx;
			color: rgb(104, 104, 104);
		}

		.btn-des {
			background-color: rgba(241, 240, 238, .2);
		}

		.page-num {
			color: #000000;
			margin: 0 20rpx;
		}
	}

	.not-data {
		padding: 40rpx;
		text-align: center;
	}

	.footer {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 40rpx;
	}

	.code-input {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;

		.item-name {
			width: 140rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #666666;
			text-align: left;
		}

		.code-input-main {
			width: calc(100% - 140rpx);
			height: 80rpx;
			background: #FFFFFF;
			border-radius: 14rpx;
			border: 1px solid #DFDFDF;
			box-sizing: border-box;
			padding-left: 20rpx;
			display: flex;
			align-items: center;
		}
	}

	.log-title {
		font-size: 36rpx;
		text-align: center;
		margin-bottom: 30rpx;
	}
	
	.headItem:nth-child(1) {
		width: 30%;
		flex-shrink: 0;
	}
	.headItem:nth-child(2) {
		width: 30%;
		flex-shrink: 1;
		padding: 0 10rpx;
		box-sizing: border-box;
	}
	.headItem:nth-child(3) {
		width: 20%;
		flex-shrink: 0;
	}
	.headItem:nth-child(4) {
		width: 20%;
		flex-shrink: 0;
	}
</style>