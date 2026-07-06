<template>
	<view class="user" :class="{ 'user--tab': isMpTabLayout }">
		<image src="../../static/user/userBg_001.png" class="teachBg" mode=""></image>
		<view class="page-container" :style="pageContainerStyle">
			<view class="nav-bar-main">
				<view class="nav-bar-left">账号概览</view>
				<view class="nav-bar-right header-actions">
					<view class="service-action" @click="openOnlineService">客服</view>
					<view class="notice-action" @click="openLog">
						<image src="@/static/shop/m_info.png" class="notice-icon" mode="aspectFit"></image>
					</view>
				</view>
			</view>
			<view class="page-main" :style="pageMainStyle">
				<view class="header">
					<view class="handerOne">
						<!-- 个人中心头像使用青柠助手 logo -->
						<image src="@/static/user/jihu-logo.png" class="logo" mode=""></image>
						<view class="logoText">
							<view class="user-name">
								{{ userInfo.admin ? userInfo.admin.user_name : '-' }}
							</view>
							<view class="user-phone">
								手机号：{{ userInfo.admin ? userInfo.admin.phone : '-' }}
							</view>
						</view>
					</view>
					<view class="handerTwo">
						<view class="twoItem" @click="copyTipsMain(userInfo.admin.code)">
							<view class="itemNum">{{ userInfo.admin ? userInfo.admin.code : '-' }}</view>
							<view class="itemText">账号ID</view>
						</view>
						<view class="twoItem" @click="copyTipsMain(userInfo.admin.code)">
							<view class="itemNum">{{ userInfo.admin ? userInfo.admin.code : '-' }}</view>
							<view class="itemText">邀请码 </view>
						</view>
						<view class="twoItem" @click="copyTipsMain(userInfo.admin.team_id)">
							<view class="itemNum">{{ userInfo.admin ? userInfo.admin.team_id : '-' }}</view>
							<view class="itemText">团队ID</view>
						</view>
						<view class="twoItem">
							<view class="itemNum">
								{{ userInfo.admin ? Number(userInfo.admin.balance || 0).toFixed(1) : '-' }}
							</view>
							<view class="itemText">剩余积分</view>
						</view>
					</view>
				</view>
				<view class="shopBox">
				<!-- 门店数量统计标题 -->
				<view class="shop-title">门店数量统计</view>
				<view class="shopRow" v-for="(row, rowIndex) in shopStatRows" :key="'shop-row-' + rowIndex">
					<view
						v-for="cell in row"
						:key="cell.type === 'tutorial' ? 'app-tutorial' : cell.data.ShopType"
						class="shopItem"
						:class="{ 'tutorial-item': cell.type === 'tutorial' }"
						:style="cell.type === 'tutorial' ? tutorialCardStyle : getShopBgStyle(cell.data.ShopType)"
						@click="cell.type === 'tutorial' ? toAppTutorial() : null"
					>
						<template v-if="cell.type === 'shop'">
							<image v-if="getShopLogo(cell.data.ShopType)" :src="getShopLogo(cell.data.ShopType)" class="shopIcon" mode="aspectFit"></image>
							<view class="shopNum">{{ getShopCount(cell.data) }}</view>
							<view class="shopText">{{ getShopTitle(cell.data) }}</view>
						</template>
						<template v-else>
							<image src="@/static/user/jihu-logo.png" class="shopIcon tutorial-icon" mode="aspectFit"></image>
							<view class="shopNum tutorial-num">视频</view>
							<view class="shopText">青柠助手使用教程</view>
						</template>
					</view>
				</view>
				</view>
				<view class="box-title">
					团队管理
				</view>
				<view class="cellBox">
					<wd-cell-group border>
						<wd-cell title="积分管理" clickable is-link @click="toIntagral">
							<template #icon>
								<image src="../../static/shop/icon_023a.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
						<wd-cell title="门店分组管理" clickable is-link @click="toGroup">
							<template #icon>
								<image src="../../static/shop/icon_024a.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
						<wd-cell title="团队成员管理" clickable is-link @click="toNodeChild">
							<template #icon>
								<image src="../../static/shop/icon_025a.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
						<wd-cell title="在线客服" clickable is-link @click="openOnlineService">
							<template #icon>
								<image src="@/static/user/kf.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
						<!-- <wd-cell title="团队信息管理" clickable is-link @click="toIntagral">
							<template #icon>
								<image src="../../static/shop/icon_026a.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell> -->
						<wd-cell title="意见反馈" clickable is-link @click="toFeekBack">
							<template #icon>
								<image src="../../static/shop/icon_027a.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
						<wd-cell v-if="isMainAccount" title="后台反馈" clickable is-link @click="toAdminFeedBack">
							<template #icon>
								<image src="../../static/shop/icon_027a.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell>
					<!-- <wd-cell title="注销账号" clickable is-link @click="delUser">
						<template #icon>
							<image src="../../static/shop/icon_040a.png" class="jfImg" mode=""></image>
						</template>
					</wd-cell> -->
						<!-- <wd-cell title="退出账号" clickable is-link @click="signOut">
							<template #icon>
								<image src="../../static/shop/icon_023a.png" class="jfImg" mode=""></image>
							</template>
						</wd-cell> -->
					</wd-cell-group>
				</view>
				<view class="sign-out" @click="signOut">
					退出当前账号
				</view>
				<IcpFooter />

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

		<!-- <wd-popup v-model="showDel" :close-on-click-modal="false" custom-style="border-radius:3px;width: 600rpx"
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
		</wd-popup> -->
		<wd-popup v-model="logState" position="center" closable
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="logClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					历史公告
				</view>
				<view class="log-main">
					<view class="log-item" v-for="item in logList" :key="item.id">
						<view class="log-item-name">{{ item.name }}</view>
						<view class="log-item-time">{{ item.crtim }}</view>
						<view class="log-item-content" v-html="item.content"></view>
					</view>
				</view>
			</view>
		</wd-popup>
		<!-- #ifdef MP-WEIXIN -->
		<MpTabBar v-if="mpTabMode" active="user" />
		<!-- #endif -->
	</view>
</template>

<script setup>
	// #ifdef MP-WEIXIN
	import MpTabBar from '@/components/MpTabBar.vue'
	// #endif
	import {
		ref,
		onMounted,
		onUnmounted,
		reactive,
		watch,
		computed
	} from 'vue'
	import {
		UserApi
	} from '@/api/login'
	import {
		HomeApi
	} from '@/api/home'
	import {
		useAuthStore
	} from '@/store/auth.ts'
	import {
		onTabItemTap,
		onLoad
	} from '@dcloudio/uni-app';
	import { openOnlineService } from '@/utils/onlineService'
	import { clearAuthSession, USER_SESSION_CHANGED_EVENT } from '@/utils/authSession'
	import IcpFooter from '@/components/IcpFooter.vue'

	const props = defineProps({
		embeddedTab: {
			type: Boolean,
			default: false
		}
	})

	const mpTabMode = ref(false)
	const isMpTabLayout = computed(() => props.embeddedTab || mpTabMode.value)

	const authStore = useAuthStore()
	const userInfo = ref({})
	const userInfoLoaded = ref(false)
	const tipsShow = ref(false)
	const showDel = ref(false)
	const countDown = ref(5)
	const countDownInterval = ref()
	const systemBarHeight = ref(0)
	const pageContainerStyle = computed(() => {
		if (isMpTabLayout.value) {
			return { paddingTop: `${systemBarHeight.value}px` }
		}
		return { paddingTop: `calc(${systemBarHeight.value}px)` }
	})
	const pageMainStyle = computed(() => {
		if (isMpTabLayout.value) {
			return {
				height: `calc(100% - ${systemBarHeight.value}px - 88rpx)`,
				overflowY: 'auto'
			}
		}
		return {
			height: `calc(100vh - ${systemBarHeight.value}px - 114px - env(safe-area-inset-bottom))`,
			overflowY: 'scroll'
		}
	})
	const logState = ref(false)
	const logList = ref([])
	
	// 店铺类型到Logo的映射（与storeManage.vue中的映射保持一致）
	const shopTypeToLogo = {
		1: 'https://p0.meituan.net/shangouproductapi/8bb7f604d4c10239f736f2c450ce92ef93342.png', // 美团外卖
		2: 'https://p0.meituan.net/shangouproductapi/280765bbbe4aeb0603d386eea888ab8c151948.png', // 淘宝闪购外卖(原饿了么)
		3: 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png', // 京东秒送 (logo key 8 - 京东外卖)
		4: 'https://p0.meituan.net/shangouproductapi/e4f5dff1d5445c2895d6ca9e3a55bf2744440.png', // 美团闪购
		5: 'https://p0.meituan.net/shangouproductapi/a4022ea3fb17f68c43ecbfcec893c836102681.png', // 美团医药
		6: 'https://p0.meituan.net/shangouproductapi/546c580071907f18b7b9ea913fc29812158401.png', // 淘宝闪购零售 (logo key 5 - 饿百零售)
	}
	
	// 店铺类型渐变背景色映射（浅色渐变）
	const shopTypeBgColors = {
		1: ['#FFF9E6', '#FFFFFF'],  // 美团外卖 - 淡黄色渐变
		2: ['#E6F4FF', '#FFFFFF'],  // 淘宝闪购外卖 - 淡蓝色渐变
		3: ['#FFE6E6', '#FFFFFF'],  // 京东秒送 - 淡红色渐变
		4: ['#F0F9FF', '#FFFFFF'],  // 美团闪购 - 淡蓝色渐变
		5: ['#E8F5E9', '#FFFFFF'],  // 美团医药 - 淡绿色渐变
		6: ['#FFF3E0', '#FFFFFF'],  // 淘宝闪购零售 - 淡橙色渐变
	}
	
	// 获取店铺Logo（第3个和第5个对换，第4个和第6个对换）
	const getShopLogo = (shopType) => {
		if (!userInfo.value.count_shop_type || !Array.isArray(userInfo.value.count_shop_type)) {
			return shopTypeToLogo[shopType] || null
		}
		
		const shopList = userInfo.value.count_shop_type
		const currentIndex = shopList.findIndex(s => s.ShopType === shopType)
		
		// 如果找不到当前项，返回原图标
		if (currentIndex === -1) {
			return shopTypeToLogo[shopType] || null
		}
		
		// 第3个（索引2）和第5个（索引4）的图标对换
		if (currentIndex === 2) {
			// 第3个显示第5个的图标
			const shop5 = shopList[4]
			return shop5 ? (shopTypeToLogo[shop5.ShopType] || null) : (shopTypeToLogo[shopType] || null)
		} else if (currentIndex === 4) {
			// 第5个显示第3个的图标
			const shop3 = shopList[2]
			return shop3 ? (shopTypeToLogo[shop3.ShopType] || null) : (shopTypeToLogo[shopType] || null)
		}
		
		// 第4个（索引3）和第6个（索引5）的图标对换
		if (currentIndex === 3) {
			// 第4个显示第6个的图标
			const shop6 = shopList[5]
			return shop6 ? (shopTypeToLogo[shop6.ShopType] || null) : (shopTypeToLogo[shopType] || null)
		} else if (currentIndex === 5) {
			// 第6个显示第4个的图标
			const shop4 = shopList[3]
			return shop4 ? (shopTypeToLogo[shop4.ShopType] || null) : (shopTypeToLogo[shopType] || null)
		}
		
		// 其他情况返回原图标
		return shopTypeToLogo[shopType] || null
	}
	
	// 获取店铺背景样式（渐变背景）
	const getShopBgStyle = (shopType) => {
		const colors = shopTypeBgColors[shopType] || ['#FFFFFF', '#FFFFFF']
		return {
			background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
		}
	}
	
	// 获取店铺数量（从第3个到第6个循环位移，基于数组索引）
	// 第3个（索引2）显示第4个（索引3）的数据
	// 第4个（索引3）显示第5个（索引4）的数据
	// 第5个（索引4）显示第6个（索引5）的数据
	// 第6个（索引5）显示第3个（索引2）的数据
	const getShopCount = (item) => {
		if (!userInfo.value.count_shop_type || !Array.isArray(userInfo.value.count_shop_type)) {
			return item.ShopCount || 0
		}
		
		const shopList = userInfo.value.count_shop_type
		const currentIndex = shopList.findIndex(s => s.ShopType === item.ShopType)
		
		// 如果找不到当前项，返回原数据
		if (currentIndex === -1) {
			return item.ShopCount || 0
		}
		
		// 从第3个（索引2）开始到第6个（索引5），循环位移
		if (currentIndex >= 2 && currentIndex <= 5) {
			// 计算下一个索引：2->3, 3->4, 4->5, 5->2
			const nextIndex = currentIndex === 5 ? 2 : currentIndex + 1
			const nextShop = shopList[nextIndex]
			return nextShop ? (nextShop.ShopCount || 0) : (item.ShopCount || 0)
		}
		
		return item.ShopCount || 0
	}
	
	// 获取店铺类型名称（从第3个到第6个循环位移，基于数组索引）
	// 第3个（索引2）显示第4个（索引3）的数据
	// 第4个（索引3）显示第5个（索引4）的数据
	// 第5个（索引4）显示第6个（索引5）的数据
	// 第6个（索引5）显示第3个（索引2）的数据
	const getShopTitle = (item) => {
		let title = ''
		
		if (!userInfo.value.count_shop_type || !Array.isArray(userInfo.value.count_shop_type)) {
			title = item.Title || ''
		} else {
			const shopList = userInfo.value.count_shop_type
			const currentIndex = shopList.findIndex(s => s.ShopType === item.ShopType)
			
			// 如果找不到当前项，返回原数据
			if (currentIndex === -1) {
				title = item.Title || ''
			} else {
				// 从第3个（索引2）开始到第6个（索引5），循环位移
				if (currentIndex >= 2 && currentIndex <= 5) {
					// 计算下一个索引：2->3, 3->4, 4->5, 5->2
					const nextIndex = currentIndex === 5 ? 2 : currentIndex + 1
					const nextShop = shopList[nextIndex]
					title = nextShop ? (nextShop.Title || '') : (item.Title || '')
				} else {
					title = item.Title || ''
				}
			}
		}
		
		// 删除"门店数"后缀
		if (title && title.includes('门店数')) {
			title = title.replace(/门店数/g, '').trim()
		}
		
		// 如果是第一个美团（ShopType === 1），在后面加上"餐饮"
		if (item.ShopType === 1) {
			// 如果title还没有包含"餐饮"，需要加上"餐饮"
			if (title && !title.includes('餐饮')) {
				// 如果title是"美团外卖"，改为"美团餐饮"
				if (title.includes('美团外卖')) {
					title = title.replace('美团外卖', '美团餐饮')
				} else if (title.includes('美团')) {
					// 其他包含"美团"的情况，在"美团"后面加上"餐饮"
					title = title.replace('美团', '美团餐饮')
				} else {
					// 其他情况，直接加上"餐饮"
					title = title + '餐饮'
				}
			}
		}
		
		return title
	}
	
	const tutorialCardStyle = {
		background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFFFF 100%)'
	}

	// 门店统计卡片：平台卡片 + 教程卡片（教程始终排在最后）
	const shopStatItems = computed(() => {
		const shops = Array.isArray(userInfo.value.count_shop_type) ? userInfo.value.count_shop_type : []
		const shopCells = shops.map((shop) => ({ type: 'shop', data: shop }))
		return [...shopCells, { type: 'tutorial' }]
	})

	const shopStatRows = computed(() => {
		const items = shopStatItems.value
		const rows = []
		for (let i = 0; i < items.length; i += 4) {
			rows.push(items.slice(i, i + 4))
		}
		return rows
	})

	const toAppTutorial = () => {
		uni.navigateTo({
			url: '/pages/user/app-tutorial'
		})
	}

	// 总账号可见：用于控制“后台反馈”入口
	const isMainAccount = computed(() => {
		if (!userInfoLoaded.value) {
			return false
		}
		const admin = userInfo.value?.admin || {}
		const parentId = admin.Parent ?? admin.parent ?? ''
		const isTopByParent = !parentId || parentId === '0' || parentId === '00000000-0000-0000-0000-000000000000'
		const userType = admin.user_type
		const userTypeNum =
			typeof userType === 'number'
				? userType
				: Number(userType?.value ?? userType?.Value ?? userType?.id ?? -1)
		return isTopByParent || userTypeNum === 2
	})

	watch(countDown, (newVal) => {
		if (newVal <= 0) {
			clearCountDownInterval()
		}
	})
	const copyTipsMain = (text) => {
		// uni.setClipboardData({
		// 	data: text, 
		// 	success: function () {
		// 		uni.showToast({
		// 			title:'复制成功',
		// 			icon:'none'
		// 		})
		// 	}
		// })
	}
	const toNodeChild = () => {
		uni.navigateTo({
			url: "/pages/user/nodeChild?isV2=true"
		})
	}
	
	const toGroup = () => {
		uni.navigateTo({
			url: "/pages/group/group?isV2=true"
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
					clearAuthSession()
					uni.reLaunch({
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
		showDel.value = false
		setTimeout(() => {
			countDown.value = 5
		}, 500)
		clearCountDownInterval()
	}

	const toIntagral = () => {
		uni.navigateTo({
			url: "/pages/integral/integral?isV2=true"
		})
	}

	const getUserInfo = async () => {
		userInfoLoaded.value = false
		userInfo.value = {}
		uni.showLoading({})
		try {
			const data = await UserApi.getUser()
			userInfo.value = data.data || {}
		} catch {
			console.log('getUserInfo failed')
		} finally {
			userInfoLoaded.value = true
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
					clearAuthSession()
					uni.reLaunch({
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

	const toFeekBack = () => {
		uni.navigateTo({
			url: '/pages/feedback/feedback?isV2=true'
		});
	}

	const toAdminFeedBack = () => {
		uni.navigateTo({
			url: '/pages/feedback/admin-feedback'
		})
	}

	onTabItemTap(() => {
		uni.setTabBarStyle({
			color: '#7A7E83',
			selectedColor: '#FACC05'
		})
	})

	onMounted(() => {
		if (isMpTabLayout.value) {
			getSysteminfo()
		}
		getUserInfo()
		getNoticeNewItem()
		uni.$on(USER_SESSION_CHANGED_EVENT, getUserInfo)
	})

	onUnmounted(() => {
		uni.$off(USER_SESSION_CHANGED_EVENT, getUserInfo)
	})

	defineExpose({
		refreshUserInfo: getUserInfo
	})

	const openLog = () => {
		logState.value = true
	}

	const logClose = () => {
		logState.value = false
	}

	const getNoticeNewItem = () => {
		HomeApi.getlistorderbyctime({
			pagesize: 10,
			pageindex: 1,
			type: 1,
			state: 0
		}).then(res => {
			if (res.code === 200 && res.data?.rows?.length) {
				logList.value = res.data.rows
			}
		}).catch(() => {})
	}

	onLoad((options) => {
		// #ifdef MP-WEIXIN
		mpTabMode.value = options?.mpTab === '1' || options?.mpTab === 'true'
		// #endif
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

	&.user--tab {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		height: 100%;
		min-height: 0;
		width: 100%;
		overflow: hidden;

		.page-container {
			position: relative;
			left: auto;
			top: auto;
			height: 100%;
		}
	}

		.header {
			width: 100%;
			display: flex;
			flex-direction: column;

			.handerOne {
				display: flex;
				flex-direction: row;
				align-items: center;

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
						margin-bottom: 10rpx;
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

				.twoItem {
					display: flex;
					flex-direction: column;
					text-align: center;
					justify-content: center;
					width: calc((100% - 54rpx) / 4);
					height: 117rpx;
					border-radius: 12rpx;

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

				// 账号ID - 淡蓝色渐变
				.twoItem:nth-child(1) {
					background: linear-gradient(135deg, #e0e7ff 0%, #e9d5ff 100%);
				}

				// 邀请码 - 淡粉色渐变
				.twoItem:nth-child(2) {
					background: linear-gradient(135deg, #fce7f3 0%, #fde2e4 100%);
				}

				// 团队ID - 淡青色渐变
				.twoItem:nth-child(3) {
					background: linear-gradient(135deg, #dbeafe 0%, #e0f2fe 100%);
				}

				// 剩余积分 - 淡黄色渐变
				.twoItem:nth-child(4) {
					background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
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
			flex-direction: column;
			margin-top: 30rpx;
			width: 100%;
			box-sizing: border-box;
			gap: 20rpx;
			
			.shop-title {
				font-size: 28rpx;
				font-weight: 600;
				color: #333333;
				margin-bottom: 10rpx;
			}

			.shopRow {
				display: flex;
				flex-direction: row;
				flex-wrap: wrap;
				justify-content: flex-start;
				align-items: stretch;
				width: 100%;
				gap: 20rpx;
			}

			.shopItem {
				flex: 0 0 calc((100% - 60rpx) / 4);
				width: calc((100% - 60rpx) / 4);
				display: flex;
				flex-direction: column;
				align-items: center;
				justify-content: center;
				min-width: 0;
				min-height: 148rpx;
				border-radius: 12rpx;
				/* 减小内边距，整体卡片高度更紧凑 */
				padding: 16rpx 14rpx;
				box-sizing: border-box;
				box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.04);

				.shopIcon {
					/* 图标稍微变小一点，进一步压缩高度 */
					width: 56rpx;
					height: 56rpx;
					flex-shrink: 0;
					margin-bottom: 8rpx;
				}

				.shopNum {
					font-weight: 600;
					font-size: 32rpx;
					color: #333333;
					line-height: 1.3;
					margin-bottom: 4rpx;
					text-align: center;
				}

				&.tutorial-item {
					cursor: pointer;
				}

				.tutorial-icon {
					border-radius: 12rpx;
				}

				.tutorial-num {
					font-size: 28rpx;
					font-weight: 600;
					color: #f59e0b;
				}

				.shopText {
					font-size: 22rpx;
					color: #666666;
					line-height: 1.4;
					text-align: center;
					word-break: break-all;
					overflow: hidden;
					display: -webkit-box;
					-webkit-line-clamp: 2;
					line-clamp: 2;
					-webkit-box-orient: vertical;
				}
			}

			// 第二行只有3个时，平均分布
			.shopRow:last-child {
				justify-content: flex-start;
				
				.shopItem {
					max-width: calc((100% - 40rpx) / 3);
				}
			}
		}

		.box-title {
			margin: 26rpx 0 20rpx 0;
			font-weight: 600;
			font-size: 28rpx;
			color: #333333;
		}

		.cellBox {
			width: 690rpx;
			background: #FFFFFF;
			border-radius: 12rpx;

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

		.nav-bar-right {
			display: flex;
			align-items: center;
		}

		.header-actions {
			display: flex;
			align-items: center;
			gap: 18rpx;
		}

		.service-action {
			height: 44rpx;
			padding: 0 18rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			color: #333333;
			font-size: 24rpx;
			background-color: rgba(255, 255, 255, 0.9);
			border-radius: 22rpx;
		}

		.notice-action {
			width: 40rpx;
			height: 40rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.notice-icon {
			width: 40rpx;
			height: 40rpx;
		}
	}

	.log-container {
		.log-title {
			font-size: 36rpx;
			text-align: center;
			margin-bottom: 30rpx;
		}

		.log-main {
			max-height: 720rpx;
			overflow-y: scroll;
		}

		.log-item {
			padding-bottom: 30rpx;
			border-bottom: 1rpx solid #e5e5e5;
			margin-bottom: 30rpx;
		}

		.log-item:last-child {
			border: none;
			margin-bottom: 0;
		}

		.log-item-name {
			font-size: 28rpx;
			color: #333333;
			margin-bottom: 10rpx;
		}

		.log-item-time {
			font-size: 24rpx;
			color: #999999;
			margin-bottom: 20rpx;
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
</style>