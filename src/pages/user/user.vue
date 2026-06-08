<template>
	<view class="user">
		<image src="../../static/user/userBg_001.png" class="teachBg" mode=""></image>
		<view class="page-container" :style="`padding-top: calc(${systemBarHeight}px);`">
			<view class="page-main"
				:style="`height: calc(100vh - ${systemBarHeight}px - 44px - env(safe-area-inset-bottom));`">
				<view class="header">
					<view class="handerOne">
						<view class="" style="display: flex;align-items: center;">
							<image src="../../static/choose/sj.png" class="logo" mode=""></image>
							<view class="logoText">
								<view class="user-name">
									{{ userInfo.admin ? userInfo.admin.user_name : '-' }}
								</view>
							</view>
						</view>
						<view class="nav-bar-right">
							<image src="@/static/shop/icon_021a.png" mode="" class="nav-bar-img"></image>
							<image src="@/static/shop/icon_022a.png" mode="" class="nav-bar-img"></image>
						</view>
					</view>
					<view class="handerTwo">
						<view class="twoItem">
							<view class="itemNum">{{ userInfo.admin ? userInfo.admin.code : '-' }}</view>
							<view class="itemText">当前账号</view>
						</view>
						<view class="item-line"></view>
						<view class="twoItem">
							<view class="itemNum">{{ userInfo.admin ? userInfo.admin.team_id : '-' }}</view>
							<view class="itemText">团队ID</view>
						</view>
						<view class="item-line"></view>
						<view class="twoItem">
							<view class="itemNum">{{ userInfo.admin ? userInfo.admin.balance : '-' }}</view>
							<view class="itemText">剩余积分</view>
						</view>
					</view>
				</view>
				<view class="server-container">
					<view class="box-title">
						服务与反馈
					</view>
					<view class="server-list">
						<view class="server-item">
							<image src="@/static/user/zb.png" mode=""></image>
							<view class="server-item-title">
								联系总部
							</view>
						</view>
						<view class="server-item">
							<image src="@/static/user/kf.png" mode=""></image>
							<view class="server-item-title">
								联系客服
							</view>
						</view>
						<view class="server-item" @click="toFeekBack">
							<image src="@/static/user/fk.png" mode=""></image>
							<view class="server-item-title">
								意见反馈
							</view>
						</view>
						<view class="server-item" @click="feedbackMsg">
							<image src="@/static/user/ID.png" mode=""></image>
							<view class="server-item-title">
								团队ID
							</view>
						</view>
					</view>
				</view>
				<view class="shopBox">
					<view class="shopItem" v-for="item in userInfo.count_shop_type" :key="item.ShopType">
						<view class="shopNum">{{ item.ShopCount }}</view>
						<view class="shopText">{{ item.Title }}</view>
					</view>
				</view>

				<view class="cellBox">
					<wd-cell-group border>
						<wd-cell title="积分管理" clickable is-link @click="toIntagral">
							<template #icon>
								<image src="../../static/user/jf.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
					<!-- <wd-cell title="注销账号" clickable is-link @click="delUser">
						<template #icon>
							<image src="../../static/shop/icon_040a.png" class="jfImg" mode=""></image>
						</template>
					</wd-cell> -->
						<wd-cell title="退出账号" clickable is-link @click="signOut">
							<template #icon>
								<image src="../../static/user/zh.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
					</wd-cell-group>
				</view>
			</view>
			<view class="tips" v-if="tipsShow">
				<view class="tips-title">
					提示
				</view>
				<view class="tips-main">
					你的团队ID为{{ userInfo.admin ? userInfo.admin.team_id : '-' }}
				</view>
				<view class="tips-btn" @click="tipsShow = false">
					确定
				</view>
			</view>
		</view>

		<wd-popup v-model="showDel" :close-on-click-modal="false" custom-style="border-radius:3px;width: 600rpx"
			@close="handleCloseDel">
			<view class="del-title">
				提示
			</view>
			<view class="del-main">
				确定要注销吗？
			</view>
			<view class="btn-footer">
				<wd-button type="info" @click="handleCloseDel">取消</wd-button>
				<wd-button type="error" :disabled="!(countDown === 0)" @click="isDel"> <text
						v-if="countDown">（{{ countDown }}）</text>
					确认注销</wd-button>
			</view>
		</wd-popup>
		<wd-popup v-model="tipsState" custom-style="border-radius:32rpx;width: 600rpx" closable @close="handleClose">
			<view class="tips-container">
				<view class="tips-title">
					{{ tipsTitle }}
				</view>
				<view class="tips-main">
					{{ tipsMain }}
				</view>
				<view class="copy-num" @click="copyTipsMain">
					复制
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		reactive,
		watch
	} from 'vue'
	import {
		UserApi
	} from '@/api/login'
	import {
		useAuthStore
	} from '@/store/auth.ts'
	import {
		onTabItemTap,
		onLoad,
		onShow
	} from '@dcloudio/uni-app';

	const authStore = useAuthStore()
	const userInfo = ref({})
	const tipsShow = ref(false)
	const showDel = ref(false)
	const countDown = ref(5)
	const countDownInterval = ref()
	const systemBarHeight = ref(0)
	const tipsState = ref(false)
	const tipsTitle = ref('')
	const tipsMain = ref('')

	watch(countDown, (newVal) => {
		if (newVal <= 0) {
			clearCountDownInterval()
		}
	})
	const copyTipsMain = () => {
		uni.setClipboardData({
		    data: tipsMain.value, 
		    success: function () {
				uni.showToast({
					title:'复制成功',
					icon:'none'
				})
		    }
		})
	}
	const toFeekBack = () => {
		uni.navigateTo({
			url: '/pages/feedback/feedback'
		});
	}
	const handleClose = () => {
		tipsState.value = false
	}
	const toNodeChild = () => {
		uni.navigateTo({
			url: "/pages/user/nodeChild"
		})
	}
	const connectionHead = () => {
		tipsState.value = true
		tipsTitle.value = '总部联系方式'
		tipsMain.value = '138 8900 2892'
	}
	const connectionServer = () => {
		tipsState.value = true
		tipsTitle.value = '客服联系方式'
		tipsMain.value = '138 8900 2892'
	}
	const feedbackMsg = () => {
		tipsState.value = true
		tipsTitle.value = '当前ID'
		tipsMain.value = userInfo.value.admin.team_id
	}
	const teamId = () => {
		tipsShow.value = true
	}
	const toGroup = () => {
		uni.navigateTo({
			url: "/pages/group/group"
		})
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const isDel = () => {
		UserApi.killMySelf().then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '注销成功',
					icon: 'success',
					duration: 2000 // 显示持续时间，单位为毫秒
				})
				setTimeout(() => {
					authStore.clearToken()
					uni.navigateTo({
						url: '/pages/login/chooseUser'
					});
				}, 2000)
			}
		})
	}

	const clearCountDownInterval = () => {
		if (countDownInterval.value) {
			clearInterval(countDownInterval.value)
		}
		countDownInterval.value = undefined
	}

	const delUser = () => {
		showDel.value = true
		countDown.value = 5
		countDownInterval.value = setInterval(() => {
			countDown.value--
		}, 1000)
	}

	const handleCloseDel = () => {
		clearCountDownInterval()
		showDel.value = false
		setTimeout(() => {
			countDown.value = 5
		}, 500)
	}

	const toIntagral = () => {
		uni.navigateTo({
			url: "/pages/integral/integral?isV2=false"
		})
	}

	const getUserInfo = async () => {
		uni.showLoading({})
		try {
			const data = await UserApi.getUser()
			userInfo.value = data.data
		} catch {
			console.log(15555)
		} finally {
			uni.hideLoading({})
		}
	}

	const showTeamId = () => {
		tipsShow.value = true
	}

	const signOut = () => {
		// 调用 uni.showModal 方法
		uni.showModal({
			title: '提示', // 弹窗的标题
			content: '确认退出吗？', // 弹窗的内容
			success: function(res) {
				// 用户点击了哪个按钮
				if (res.confirm) {
					authStore.clearToken()
					uni.navigateTo({
						url: '/pages/login/chooseUser'
					});
					// 在这里执行确定后的逻辑
				} else if (res.cancel) {
					console.log('用户点击了取消');
					// 在这里执行取消后的逻辑
				}
			},
			fail: function() {
				// 弹窗调用失败的处理
				console.log('调用失败');
			}
		});

	}

	onTabItemTap(() => {
		uni.setTabBarStyle({
			color: '#7A7E83',
			selectedColor: '#FACC05'
		})
	})

	onMounted(() => {
	})

	onShow(() => {
		getUserInfo()
	})

	onLoad(() => {
		getSysteminfo()
	})
</script>

<style scoped lang="scss">
	.teachBg {
		width: 100%;
		height: 332px;
	}

	.page-container {
		position: fixed;
		width: 100%;
		left: 0;
		top: 0;
		box-sizing: border-box;
		padding: 0 30rpx;
	}

	.page-main {
		padding: 40rpx 0 30rpx 0;
		box-sizing: border-box;
		overflow-y: scroll;
	}

	.user {
		width: 100%;
		min-height: 100vh;
		background: #F9F9F9;
		display: flex;
		flex-direction: column;
		align-items: center;

		.header {
			width: 100%;
			display: flex;
			flex-direction: column;

			.handerOne {
				display: flex;
				flex-direction: row;
				align-items: center;
				width: 100%;
				justify-content: space-between;

				.logo {
					width: 90rpx;
					height: 90rpx;
					border-radius: 45rpx;
				}

				.logoText {
					font-weight: 500;
					font-size: 30rpx;
					color: #333333;
					margin-left: 20rpx;

					.user-name {
						font-weight: 400;
						font-size: 30rpx;
						color: #333333;
					}

					.user-phone {
						font-weight: 400;
						font-size: 24rpx;
						color: #999999;
					}
				}
			}

			.handerTwo {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				margin-top: 30rpx;
				width: 100%;
				box-sizing: border-box;
				padding: 0 30rpx;

				.twoItem {
					display: flex;
					flex-direction: column;
					text-align: center;
					justify-content: center;
					height: 117rpx;

					.itemNum {
						font-weight: 400;
						font-size: 28rpx;
						color: #333333;
					}

					.itemText {
						font-weight: 400;
						font-size: 24rpx;
						color: #999999;
						margin-top: 8rpx;
					}
				}

				.twoItem:last-child {
					margin-right: 0;
				}
			}
		}

		.server {
			width: 100%;
			background: #FFFFFF;
			border-radius: 12rpx;
			margin-top: 18rpx;
			padding: 30rpx;
			box-sizing: border-box;

			.serverTitle {
				font-size: 30rpx;
				color: #333333;
				margin-bottom: 24rpx;
			}

			.cardList {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;

				.cardItem {
					display: flex;
					flex-direction: column;
					align-items: center;

					.cardImg {
						width: 70rpx;
						height: 78rpx;
					}

					.cardText {
						font-weight: 400;
						font-size: 26rpx;
						color: #666666;
						margin-top: 15rpx;
					}
				}
			}
		}

		.shopBox {
			display: flex;
			flex-direction: row;
			margin-top: 30rpx;
			width: 100%;
			box-sizing: border-box;
			justify-content: space-between;

			.shopItem {
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				width: calc((100% - 20rpx) / 2);
				height: 154rpx;
				background-image: url('../../static/user/user_bg1.png');
				background-size: 100% 100%;
				background-repeat: no-repeat;

				.shopNum {
					font-weight: 600;
					font-size: 44rpx;
					color: #333333;
				}

				.shopText {
					font-size: 24rpx;
					color: #333333;
				}
			}

			.shopItem:nth-child(2) {
				background-image: url('../../static/user/user_bg2.png');
				background-size: 100% 100%;
				background-repeat: no-repeat;
			}
		}

		.box-title {
			font-weight: 600;
			font-size: 28rpx;
			color: #333333;
			margin-bottom: 20rpx;
		}

		.cellBox {
			width: 100%;
			background: #FFFFFF;
			border-radius: 12rpx;
			margin-top: 30rpx;

			.jfImg {
				width: 32rpx;
				height: 32rpx;
				margin-right: 10rpx;
			}

			::v-deep .wd-cell__left {
				align-items: center;
			}
		}

		.tips {
			width: 80%;
			box-sizing: border-box;
			padding: 40rpx;
			border-radius: 16rpx;
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translateX(-50%) translateY(-50%);
			background-color: #ffffff;
			box-shadow: 0 0 10rpx 5rpx rgba(0, 0, 0, .1);

			.tips-title {
				text-align: center;
				font-size: 30rpx;
				font-weight: bold;
				padding: 10rpx 0;
				margin-bottom: 20rpx;
			}

			.tips-main {
				font-size: 28rpx;
				text-align: center;
				margin-bottom: 20rpx;
			}

			.tips-btn {
				width: 60%;
				padding: 20rpx;
				border-radius: 6rpx;
				background-color: rgb(88, 190, 106);
				color: #ffffff;
				font-size: 26rpx;
				text-align: center;
				margin: 0 auto;
			}
		}
	}

	.btn-footer {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 0;
	}

	.del-title {
		font-weight: 400;
		font-size: 36rpx;
		text-align: center;
		padding: 40rpx 0;
	}

	.del-main {
		font-size: 30rpx;
		text-align: center;
		margin-bottom: 40rpx;
	}

	.nav-bar-main {
		height: 44px;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.nav-bar-left {
			font-weight: 600;
			font-size: 18px;
			color: rgba(0, 0, 0, .9);
		}


	}

	.nav-bar-right {
		display: flex;
		align-items: center;

		.nav-bar-img {
			width: 30rpx;
			height: 30rpx;
			margin-left: 40rpx;
		}
	}

	.sign-out {
		margin-top: 30rpx;
		width: 100%;
		height: 90rpx;
		background: #FFFFFF;
		border-radius: 12rpx;
		font-size: 26rpx;
		color: #333333;
		line-height: 90rpx;
		text-align: center;
	}

	.item-line {
		width: 1px;
		height: 43rpx;
		background-color: #DFDFDF;
	}

	.server-container {
		width: 100%;
		box-sizing: border-box;
		padding: 30rpx;
		border-radius: 12px;
		background-color: #fff;

		.server-list {
			display: flex;
			align-items: center;
			justify-content: space-between;

			.server-item {
				display: flex;
				flex-direction: column;
				align-items: center;

				image {
					width: 70rpx;
					height: 78rpx;
					margin-bottom: 15rpx;
				}

				.server-item-title {
					font-size: 26rpx;
					color: #666666;
				}
			}
		}
	}
	.tips-container {
		width: 100%;
		box-sizing: border-box;
		padding: 40rpx 30rpx;
		text-align: center;
		.tips-title {
			font-weight: 500;
			font-size: 28rpx;
			color: #333333;
		}
		.tips-main {
			font-weight: 500;
			font-size: 44rpx;
			color: #333333;
			margin-top: 40rpx;
		}
	}
	.copy-num {
		width: 200rpx;
		height: 60rpx;
		line-height: 60rpx;
		border-radius: 12rpx;
		background-color: #FACC05;
		color: #333;
		margin: 40rpx auto 0;
	}
</style>