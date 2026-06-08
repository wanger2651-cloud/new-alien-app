<template>
	<view class="manage">
		<wd-navbar :fixed="true" left-text="返回" @click-left="handleClickLeft" left-arrow :safeAreaInsetTop="true"
			:custom-class="navbarCustomClass" custom-style="color: red"
			title="店铺管理"></wd-navbar>
		<view class="hander" :style="handerStyle">
			<view class="handerLeft">
				<image :src="storageShopInfo.img" class="logoIMg" :style="{ width: avatarSize + 'px', height: avatarSize + 'px' }" mode=""></image>
				<!-- <view class="yyz">
					<view class="yyzLeft"></view>
				</view> -->
			</view>
			<view class="handerRight">
				<view class="rightOne">
					<view class="shopName">
						<image src="@/static/shop/mt_002.png" v-if="payParams.shoptype == 1"></image>
						<image src="@/static/shop/elm_002.png" v-if="payParams.shoptype == 2 || payParams.shoptype == 5"></image>
						<image src="https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png" v-if="payParams.shoptype == 6" style="width: 30rpx; height: 30rpx; margin-right: 10rpx;"></image>
						<view class="shop-name">
							{{ storageShopInfo.name }}
						</view>
					</view>
					<image v-if="showSet" src="@/static/shop/icon_017a.png" class="setting" @click="openSetting">
					</image>
				</view>
				<view class="rightTwo">
					<view class="yyzText" :class="{'is-elm-yyz': payParams.shoptype == 2 || payParams.shoptype == 5, 'is-jd-yyz': payParams.shoptype == 6}">
						{{ getShopStatus(storageShopInfo.state) }}
					</view>
					<view class="yyzText" :class="{'is-elm-yyz': payParams.shoptype == 2, 'is-jd-yyz': payParams.shoptype == 6}"
						v-if="(WorkTimeList && WorkTimeList[0])">营业时间
						{{ (WorkTimeList && WorkTimeList[0]) ? WorkTimeList[0].Start: 0 }}-{{ (WorkTimeList && WorkTimeList[0]) ? WorkTimeList[0].End : 0 }}
					</view>
				</view>
			</view>
		</view>
		<view class="shop-msg">
			<view ref="goShopBtnRef" class="go-shop" :class="{'is-elm-shop': payParams.shoptype == 2 || payParams.shoptype == 5, 'is-jd-shop': payParams.shoptype == 6}" v-if="payParams.shoptype >= 1 && payParams.shoptype <= 9" @click="goShop">进入后台</view>
			<view class="shopId">门店ID {{ office_id }}</view>
			<view class="address">
				<image src="@/static/shop/icon_016a.png"></image>
				{{ storageShopInfo.city }}
			</view>
			<view class="shopSq" v-if="storageShopInfo.state === 3">
				<view class="sqText">授权异常</view>
				<view class="sqBut" @click="repair">修复</view>
			</view>
			<view class="shopSq" v-else>
				<image src="@/static/shop/icon_018a.png"></image>
				授权正常
			</view>
		</view>
		<template v-if="showStoreOperatingHighlight">
		<view class="dataAll">
			<view class="dataOne">
				<view class="dataTitle">经营数据</view>
				<view class="datatag">（每3分钟刷新一次）</view>
			</view>
			<view class="dataBox">
				<view class="boxOne">
					<view class="boxItem" :class="{'is-elm-box': payParams.shoptype == 2 || payParams.shoptype == 5, 'is-jd-box': payParams.shoptype == 6}">
						<view class="itemNum">
							<!-- 使用后端 /shopmg/getshoplist 返回的 order_num，-1 时显示 0 -->
							{{ (storageShopInfo.order_num !== undefined && storageShopInfo.order_num !== null && storageShopInfo.order_num !== -1)
								? storageShopInfo.order_num
								: 0 }}
						</view>
						<view class="itemText">今日订单数</view>
					</view>
					<view class="boxItem" :class="{'is-elm-box': payParams.shoptype == 2 || payParams.shoptype == 5, 'is-jd-box': payParams.shoptype == 6}">
						<view class="itemNum">
							<!-- 使用后端 /shopmg/getshoplist 返回的 income，-1 时显示 0 -->
							{{ (storageShopInfo.income !== undefined && storageShopInfo.income !== null && storageShopInfo.income !== -1)
								? storageShopInfo.income
								: 0 }}
						</view>
						<view class="itemText">今日预计收入</view>
					</view>
				</view>
				<view v-if="showBusinessPromotionTiles" class="boxOne boxTwo">
					<view class="boxItem" :class="{'is-elm-box': payParams.shoptype == 2 || payParams.shoptype == 5, 'is-jd-box': payParams.shoptype == 6}">
						<view class="itemNum">
							{{ payParams.shoptype == 1 ? operateData.promotion_promotion : (typeof totalAmount === 'object' && totalAmount !== null ? '暂无' : totalAmount) }}
						</view>
						<view class="itemText">推广消耗</view>
					</view>
					<view class="boxItem" :class="{'is-elm-box': payParams.shoptype == 2 || payParams.shoptype == 5, 'is-jd-box': payParams.shoptype == 6}">
						<view class="itemNum">
							{{ payParams.shoptype == 1 ? operateData.promotion_balance : (typeof totalBalance === 'object' && totalBalance !== null ? '暂无' : totalBalance) }}
						</view>
						<view class="itemText">推广余额</view>
					</view>
				</view>
			</view>
		</view>
		<view class="brightFunction">
			<view class="functionTitle">亮点功能</view>
			<view class="functionList">
				<view class="functionItem" @tap="toBeauty(item)" v-for="(item, index) in heighLightList" :key="index">
					<image :src="item.img" class="itemImg" mode=""></image>
					<view class="itemText">{{ item.name }}</view>
				</view>
			</view>
		</view>
		</template>
		<view class="baseFunction">
			<view class="baseTitle">
				<view class="titleText">基础功能</view>
				<view class="titleTag"></view>
				<!-- 全功能激活按钮 -->
				<view class="fullFunctionBtn" @tap="handleFullFunctionClick">
					{{ (isJingdongGroupBuy(payParams.shoptype) || isJingdongMiaosong(payParams.shoptype)) ? '任务查询' : '功能激活' }}
				</view>
			</view>
			<view class="baseList">
				<!-- 普通功能卡片（排除京东秒送批量管理功能） -->
				<manageCard
					v-for="(item, index) in baseFunctionList"
					:key="item?.id || item?.code || index"
					:logoText="item?.name || ''"
					@add-money="addMoney(item, index)"
					:pageUrl="toPage(item?.code)"
					:time="item?.end_time"
					:enable="item?.enable"
					@update:model-value="changeValue"
					:shopType="payParams.shoptype"
					:effect="effect"
					:percentage="percentage"
					:comment="comment"
					:statusDesc="statusDesc"
					:currentItem="item"
					:elmQueryShopRealtimeInfo="elmQueryShopRealtimeInfo"
					:serviceCookingUpload="serviceCookingUpload"
					:currentMedal="currentMedal"
					:disabled="funcRequesting[item?.code]"
					:shopId="shopId"
				/>

				<!-- 京东秒送批量功能选择器 + 功能卡片 -->
				<view
					v-if="isJingdongMiaosong(payParams.shoptype) && jdBatchFuncList.length"
					class="jd-batch-section"
				>
					<view class="jd-batch-selector-wrapper">
						<view class="jd-batch-selector-label">批量管理功能</view>
						<picker
							mode="selector"
							:range="jdBatchFuncList"
							range-key="name"
							:value="jdBatchSelectedIndex"
							@change="handleJdBatchChange"
						>
							<view class="jd-batch-selector">
								<text class="jd-batch-selector-text">
									{{ jdBatchFuncList[jdBatchSelectedIndex]?.name || '请选择功能' }}
								</text>
								<text class="jd-batch-selector-arrow">▼</text>
							</view>
						</picker>
					</view>

					<view class="jd-batch-card-wrapper" v-if="jdBatchCurrentFunc">
						<manageCard
							:logoText="jdBatchCurrentFunc?.name || ''"
							@add-money="addMoney(jdBatchCurrentFunc, -1)"
							:pageUrl="toPage(jdBatchCurrentFunc?.code)"
							:time="jdBatchCurrentFunc?.end_time"
							:enable="jdBatchCurrentFunc?.enable"
							@update:model-value="changeValue"
							:shopType="payParams.shoptype"
							:effect="effect"
							:percentage="percentage"
							:comment="comment"
							:statusDesc="statusDesc"
							:currentItem="jdBatchCurrentFunc"
							:elmQueryShopRealtimeInfo="elmQueryShopRealtimeInfo"
							:serviceCookingUpload="serviceCookingUpload"
							:currentMedal="currentMedal"
							:disabled="funcRequesting[jdBatchCurrentFunc?.code]"
							:shopId="shopId"
						/>
					</view>
				</view>
			</view>
		</view>
		<!---全功能购买-->
		<wd-popup v-model="authGoodsVisible" position="bottom" :safe-area-inset-bottom="true"
			closable @close="handleClose">
			<SettingPopupPlanContent :is-full-popup-plan="isFullPopupPlan" :isV2="false" :auth-goods-list="payList"
				:shopId="shopId" :shopType="payParams.shoptype" :priceTitle="payParams.pricetitle"
				:currentFuncCode="payParams.currentFuncCode"
				@close-popup="closeAuthGoodsVisibleHandler" @set-endtime="setendtime" @success="subscribe"
				@updataShopFunc="updataShopFunc" />
		</wd-popup>
		<wd-popup v-model="shopSettingState" custom-style="border-radius:30rpx;" :close-on-click-modal="false" :z-index="1000">
			<view class="pop-title">店铺设置</view>
			<view class="pop-main">
				<view class="bin-num">
					当前绑定人数：<text>{{ settingData.BindList.length }}人</text>
					<image src="@/static/shop/icon_019a.png" class="que-img" @click="openAboutBind"></image>
				</view>
				<view class="pop-table">
					<view class="table-header">
						<view class="header-row-1">账号</view>
						<view class="header-row-2">账号ID</view>
						<view class="header-row-3">操作</view>
					</view>
					<view class="table-main">
						<view class="table-item" v-for="item in settingData.BindList" :key="item.id">
							<view class="header-row-1">{{ item.user_name }}</view>
							<view class="header-row-2">{{ item.id }}</view>
							<view class="header-row-3 header-row-4" :class="{'header-row-5': payParams.shoptype == 2 || payParams.shoptype == 5, 'header-row-6': payParams.shoptype == 6}"
								@click="removeUser(item)">
								踢掉账号
							</view>
						</view>
					</view>
				</view>
				<view class="shop-repair">
					<view class="repair-left">
						店铺授权失效自动修复
						<image src="@/static/shop/icon_019a.png" class="que-img" @click="openAboutShop"></image>
					</view>
					<view class="repair-right">
						<wd-switch
							:checked="!!settingData.auto_fix"
							active-color="#2CCA87"
							:size="20"
							@change="onAutoFixSwitchClick"
						/>
					</view>
				</view>
				<view class="pop-input">
					<view class="pop-input-title">店铺账号：</view>
					<wd-input class="pop-input-main" type="text" v-model="settingData.shop_user" :no-border="true" />
				</view>
				<view class="pop-input">
					<view class="pop-input-title">店铺密码：</view>
					<wd-input class="pop-input-main" type="text" v-model="settingData.shop_pwd" :no-border="true" />
				</view>
				<view class="save-btn">
					<view class="btn btn-cancel" @click="closeSetting">取消</view>
					<view class="btn btn-save" :class="{'is-elm-btn': payParams.shoptype == 2 || payParams.shoptype == 5, 'is-jd-btn': payParams.shoptype == 6}" @click="saveSetting">保存
					</view>
				</view>
			</view>
		</wd-popup>
		<wd-popup v-model="aboutBindState" custom-style="border-radius:30rpx;" closable @close="closeAboutBind" :z-index="1000">
			<view class="bind-container">
				<view class="bind-title">关于绑定人数</view>
				<view class="bind-main">
					当前绑定人数指的是您的店铺在我们的系统中被多少用户关联。这些用户拥有操作您店铺的权限。若您发现有未经授权的人员绑定了您的店铺，您可以直接取消其账号的绑定权限。为了保护您的店铺安全，请务必妥善保管您的店铺账号和密码，避免泄露给无关人员。
				</view>
			</view>
		</wd-popup>
		<wd-popup v-model="aboutShopState" custom-style="border-radius:30rpx;" closable @close="closeAboutShop" :z-index="1000">
			<view class="bind-container">
				<view class="bind-title">关于店铺授权失效自动修复</view>
				<view class="bind-main">
					<view>
						当您启用此功能并授权本系统使用您的店铺账号及密码后，若您的店铺出现掉线情况，我们的系统将自动进行授权状态的修复。我们郑重声明，您提供的账号密码仅用于授权失效时的自动修复，我们不会将其用于任何其他目的，也不会向任何第三方或个人泄露这些信息。
					</view>
					<view>
						如果您决定不再授权我们使用您的账号密码，只需更改您的店铺密码即可取消授权。
					</view>
				</view>
			</view>
		</wd-popup>
		<wd-popup v-model="addState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="addClose"
			:z-index="1000">
			<view class="log-container">
				<view class="log-title">
					店铺添加成功
				</view>
				<view class="log-main">
					<view>店铺名称：{{ successObj.name }}</view>
					<view>店铺ID：{{ successObj.office_id }}</view>
					<view class="footer">
						<wd-button size="large" @click="addConfirm" block>确定</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>
		<wd-popup v-model="colseShow" position="bottom" :closable="true" custom-style="height: 90%" @close="colseV"
			:z-index="1000">
			<view class="popup-box">
				<view class="p-title ft30 tc">{{ isRepair ? '修复店铺' : '进入店铺' }}</view>
			</view>
		</wd-popup>
		<view id="pcwebview"></view>
		<!-- 缩放按钮 - 使用 cover-view 确保显示在原生组件之上，只在 popup 打开时显示 -->
		<!-- #ifdef APP-PLUS -->
		<cover-view class="zoom-controls" v-if="showZoomButtons && colseShow">
			<cover-view class="zoom-tip zoom-tip-text">如果点击缩小按钮没有反应，先点一下放大按钮再点缩小按钮就可以了</cover-view>
			<cover-view class="zoom-btn zoom-btn-minus" @tap="zoomOut">
				<cover-image src="/static/tab/suoxiao.png" class="zoom-icon"></cover-image>
			</cover-view>
			<cover-view class="zoom-btn zoom-btn-plus" @tap="zoomIn">
				<cover-image src="/static/tab/fangda.png" class="zoom-icon zoom-icon-black"></cover-image>
			</cover-view>
		</cover-view>
		<!-- #endif -->
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onUnload
	} from '@dcloudio/uni-app';
	import {
		ref,
		reactive,
		computed,
		onMounted,
		onBeforeUnmount,
		watch,
		nextTick
	} from 'vue';
	import {
		ManagementApi
	} from '@/api/management.ts'
	import {
		ShopApi
	} from '@/api/shop.ts'
	import { getRenewQuoteList } from '@/api/pay'
	import { mapPayQuoteToSpecRow } from '@/utils/payRenewFlow'
	import {
		useAuthStore
	} from '@/store/auth.ts'
	import {
		useRouter
	} from '@/utils/router';
	import {
		logApi
	} from '@/api/log';

	const authStore = useAuthStore()
	const router = useRouter()
	const isFullPopupPlan = ref(false)
	const authGoodsVisible = ref(false)
	let functionList = ref([])
	// 京东秒送批量/运营功能编码列表（与后端/其他组件保持一致）
	const JD_MIAOSONG_BATCH_FUNC_CODES = [
		'CATEGORY_ATTR',
		'BATCH_PRICE',
		'BATCH_STOCK',
		'BATCH_NAME',
		'BATCH_STATUS',
		'CREATEFREIGHTPROMO',
		'CREATEBILLIONSUBSIDYCOUPON',
		'CREATEINSHOPCOUPON',
		'CREATEMANJIAN',
		'CREATEBRANDMEALCARD',
		'UPDATESTOREBUSINESSTIME'
	]
	// 京东秒送批量功能选择器相关状态
	/** 「经营数据」整块 + 「亮点功能」整块；设为 true 恢复展示 */
	const showStoreOperatingHighlight = ref(false)
	const jdBatchSelectedIndex = ref(0)
	/** 经营数据中「推广消耗」「推广余额」整块；临时关闭，改为 true 可恢复展示 */
	const showBusinessPromotionTiles = ref(false)
	const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))
	const getShopTypeNum = () => Number(payParams.shoptype) || 0
	const isJingdongShopType = () => {
		const t = getShopTypeNum()
		return t === 6 || t === 8
	}
	const isMeituanShopType = () => {
		const t = getShopTypeNum()
		return t === 1 || t === 3 || t === 4
	}
	const pickCookieString = (val, depth = 0) => {
		if (depth > 3 || !val) return ''
		if (typeof val === 'string') return val
		if (typeof val === 'object') {
			if (typeof val.cookie === 'string') return val.cookie
			if (typeof val.cookies === 'string') return val.cookies
			if (typeof val.ck === 'string') return val.ck
			if (typeof val.data === 'string') return val.data
			if (typeof val.data === 'object') return pickCookieString(val.data, depth + 1)
			if (typeof val.result === 'object') return pickCookieString(val.result, depth + 1)
		}
		return ''
	}
	
	// 基础功能列表（排除京东秒送的批量管理功能）
	const baseFunctionList = computed(() => {
		const shopTypeNum = getShopTypeNum()
		// 只有京东秒送需要拆分批量功能，其它平台直接返回全部功能
		if (shopTypeNum !== 6) {
			return functionList.value || []
		}
		return (functionList.value || []).filter(item => !JD_MIAOSONG_BATCH_FUNC_CODES.includes(item?.code))
	})
	
	// 京东秒送批量管理功能列表
	const jdBatchFuncList = computed(() => {
		const shopTypeNum = getShopTypeNum()
		if (shopTypeNum !== 6) {
			return []
		}
		return (functionList.value || []).filter(item => JD_MIAOSONG_BATCH_FUNC_CODES.includes(item?.code))
	})
	
	// 当前选择的京东秒送批量功能
	const jdBatchCurrentFunc = computed(() => {
		if (!jdBatchFuncList.value.length) return null
		const index = jdBatchSelectedIndex.value
		if (index < 0 || index >= jdBatchFuncList.value.length) {
			return jdBatchFuncList.value[0]
		}
		return jdBatchFuncList.value[index]
	})
	let heighLightList = ref([])
	const payList = ref([])
	let shopDetails = ref({})
	let shop_info = ref({})
	let data_base = ref({})
	let data_dd = ref({})
	let data_Traffic = ref({})
	let data_Yesterday = ref({})
	let WorkInfo = ref({})
	let AdDataV2 = ref({})
	let isV2 = ref(false)
	let storageShopInfo = reactive({})
	let WorkTimeList = ref([])
	// 查找到出餐助手
	const authGoodItem1 = ref({
		id: 0,
		status: 1,
		endTime: ''
	})
	const payParams = reactive({
		shoptype: '',
		pricetitle: '',
		isKeyWord: true,
		currentFuncCode: '' // 当前续费的功能代码，用于续费弹窗只显示当前功能
	})
	let shopId = ref('')
	let office_id = ref('')
	// let appDataTime = ref('')
	let timer = ref(null);
	const currentSaveIndex = ref(0)
	const systemBarHeight = ref(0)
	const goShopBtnRef = ref(null)
	const avatarSize = ref(20)
	const handerStyle = computed(() => {
		return {
			marginTop: 'calc(' + systemBarHeight.value + 'px + 44px)'
		}
	})
	const navbarCustomClass = computed(() => {
		if (payParams.shoptype == 2 || payParams.shoptype == 5) {
			return 'navbar-main is-elm'
		} else if (payParams.shoptype == 6) {
			return 'navbar-main is-jd'
		}
		return 'navbar-main'
	})
	const shopSettingState = ref(false)
	const aboutBindState = ref(false)
	const aboutShopState = ref(false)
	const colseShow = ref(false)
	const isRepair = ref(false)
	let successObj = reactive({})
	const addState = ref(false)
	const cookieStr = ref('')
	let checkinter = null
	let w = null
	/** 京东 open_jddj 并发序号：作废上一次未跑完的 cache/setTimeout，避免切店后仍写入旧 cookie / 旧页面 */
	let jdOpenSeq = 0
	const zoomLevel = ref(50) // 缩放级别，默认50%（最小缩小比例）
	const showZoomButtons = ref(false) // 是否显示缩放按钮（需要webview显示后才能显示）

	// 横屏/窗口尺寸变化时更新 webview 尺寸并触发页面重排（解决横屏右侧空白、左菜单收缩后布局不刷新的问题）
	const webviewResizeHandler = (res) => {
		// #ifdef APP-PLUS
		if (!w || !colseShow.value) return
		try {
			const systemInfo = uni.getSystemInfoSync()
			const statusBarHeight = systemInfo.statusBarHeight || 0
			const winW = (res && res.size && res.size.windowWidth) || systemInfo.windowWidth || systemInfo.screenWidth
			const winH = (res && res.size && res.size.windowHeight) || systemInfo.windowHeight || systemInfo.screenHeight
			const isLandscape = winW > winH
			// 横屏时尽量填满：顶部仅留状态栏+少量边距，底部仅留缩放按钮区域
			const topPx = isLandscape
				? Math.min((systemBarHeight.value || statusBarHeight) + 8, 36)
				: (systemBarHeight.value || statusBarHeight) + 44
			const bottomPx = isLandscape ? 24 : 60
			const webviewHeight = Math.max(200, winH - topPx - bottomPx)
			w.setStyle({
				width: winW + 'px',
				height: webviewHeight + 'px',
				top: topPx + 'px',
				left: '0px'
			})
			w.evalJS('try{window.dispatchEvent(new Event("resize"));window.dispatchEvent(new Event("orientationchange"));}catch(e){}')
		} catch (e) {}
		// #endif
	}

	const goShop = async () => {
		try {
			// APP 端：京东(6/8) 每次打开前都先 colseV（关 webview + 清 cookie），否则关弹层后再开另一店会仍显示上一家
			// 其它平台保持原逻辑：仅当弹层已打开时才 colseV
			// #ifdef APP-PLUS
			if (isJingdongShopType()) {
				colseV()
				// 给原生层极短收尾即可；过长会明显拖慢每次打开（切店正确性主要由 open_jddj 内再次清理保证）
				await sleep(200)
			} else if (colseShow.value) {
				colseV()
				await sleep(300)
			}
			// #endif
			
			uni.showLoading({ title: '加载中...' })
			
			// 通过API获取cookie
			let cookie = ''
			
			try {
				// 优先使用 getShopCk 方法获取cookie
				const ckRes = await ManagementApi.getShopCk(shopId.value)
				cookie = pickCookieString(ckRes && ckRes.data) || pickCookieString(ckRes)
			} catch (e) {
				// 如果 getShopCk 失败，尝试使用 getShopDetail
				try {
					const detailRes = await ManagementApi.getShopDetail(shopId.value)
					
					if (detailRes && detailRes.code === 200 && detailRes.data) {
						cookie = pickCookieString(detailRes.data)
					}
				} catch (e2) {
					// 忽略错误
				}
			}
			
			// 如果API获取失败，尝试使用 storageShopInfo 中的 cookie
			if (!cookie && storageShopInfo.cookies) {
				cookie = pickCookieString(storageShopInfo.cookies)
			}
			
			if (!cookie) {
				uni.hideLoading()
				uni.showToast({
					title: '获取店铺cookie失败',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			// 使用获取到的cookie打开店铺后台
		isRepair.value = false
			// 将cookie保存到 storageShopInfo 中，供 open_web 使用
			storageShopInfo.cookies = cookie
			// 直接调用 open_web，不需要等待 DOM 元素
			open_web()
		} catch (error) {
			uni.hideLoading()
			uni.showToast({
				title: '打开店铺后台失败',
				icon: 'none',
				duration: 2000
			})
		}
	}
	const check_ele = () => {
		try {
			const query = uni.createSelectorQuery();
			query
				.select("#pcwebview")
				.boundingClientRect((data) => {
					if (data) {
					// 调用 open_web 函数
					open_web();
					} else {
						setTimeout(() => {
							check_ele()
						}, 300)
					}
				})
				.exec();
		} catch (error) {
			setTimeout(() => {
				check_ele()
			}, 300)
		}
	}
	const open_web = () => {
		let cookie = storageShopInfo.cookies || ''
		const shopType = getShopTypeNum()
		
		// 根据shopType调用相应的打开函数
		// 1=美团外卖, 2=淘宝闪购外卖(原饿了么), 3=美团闪购, 4=美团医药, 5=淘宝闪购零售, 6=京东零售, 7=抖店即时零售, 8=京东外卖, 9=抖音外卖
		if (isMeituanShopType()) {
			// 美团平台（外卖、闪购、医药）
			open_meituan_with_cookie(cookie, shopType)
		} else if (shopType == 2) {
			// 淘宝闪购外卖（原饿了么）
			open_eleme_with_cookie(cookie)
		} else if (shopType == 5) {
			// 淘宝闪购零售
			open_eleme_retail_with_cookie(cookie)
		} else if (shopType == 6 || shopType == 8) {
			// 京东平台（零售、外卖）
			open_jddj_with_cookie(cookie)
		} else if (shopType == 7 || shopType == 9) {
			// 抖音平台（即时零售、外卖）
			open_jinritemai_with_cookie(cookie)
		} else {
			// 默认使用旧逻辑（向后兼容）
			if (shopType == 1) {
				open_meituan(cookie)
			} else {
				open_melody(cookie)
			}
		}
	}

	// 京东秒送批量功能选择变化
	const handleJdBatchChange = (e) => {
		try {
			const value = Number(e?.detail?.value ?? 0)
			if (isNaN(value)) {
				jdBatchSelectedIndex.value = 0
				return
			}
			// 防御：索引越界时兜底到 0
			if (value < 0 || value >= jdBatchFuncList.value.length) {
				jdBatchSelectedIndex.value = 0
			} else {
				jdBatchSelectedIndex.value = value
			}
		} catch (err) {
			jdBatchSelectedIndex.value = 0
		}
	}
	// 放大网页
	const zoomIn = () => {
		// #ifdef APP-PLUS
		if (w) {
			const newZoom = Math.min(zoomLevel.value + 10, 200)
			if (newZoom !== zoomLevel.value) {
				zoomLevel.value = newZoom
				applyZoom()
			}
		}
		// #endif
	}
	
	// 缩小网页
	const zoomOut = () => {
		// #ifdef APP-PLUS
		if (w) {
			const oldZoom = zoomLevel.value
			const newZoom = Math.max(zoomLevel.value - 10, 50)
			const zoomDiff = oldZoom - newZoom
			
			if (newZoom !== zoomLevel.value) {
				zoomLevel.value = newZoom
				applyZoom()
			}
		}
		// #endif
	}
	
	// 应用缩放
	const applyZoom = () => {
		// #ifdef APP-PLUS
		if (w) {
			try {
				// 使用 viewport width 来实现缩放，与双指缩放效果完全一致
				const scale = zoomLevel.value / 100
				// 确保 scale 是有效的数字
				if (isNaN(scale) || scale <= 0) {
					return
				}
				const zoomScript = `
					(function() {
						try {
							var scale = ${scale};
							if (typeof scale !== 'number' || isNaN(scale) || scale <= 0) {
								return;
							}
							var deviceWidth = window.innerWidth || screen.width;
							var targetWidth = deviceWidth / scale;
							
							// 获取或创建 viewport meta
							var viewport = document.querySelector('meta[name="viewport"]');
							var content = 'width=' + targetWidth + ', initial-scale=' + scale + ', maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes';
							
							if (viewport) {
								viewport.setAttribute('content', content);
							} else {
								// 如果没有 viewport meta，创建一个
								var meta = document.createElement('meta');
								meta.name = 'viewport';
								meta.content = content;
								var head = document.getElementsByTagName('head')[0];
								if (head) {
									head.appendChild(meta);
								}
							}
						} catch(e) {
							// 静默处理错误，避免影响页面正常使用
						}
					})();
				`
				w.evalJS(zoomScript)
			} catch (e) {
				// 静默处理错误，避免影响页面正常使用
			}
		}
		// #endif
	}
	
	const close_web = () => {
		// #ifdef APP-PLUS
		if (typeof plus !== 'undefined' && plus.webview) {
			var wvs = plus.webview.all();
			for (var i = 0; i < wvs.length; i++) {
				let url = wvs[i].getURL()
				if (url && url.indexOf('http') === 0) {
					plus.webview.close(wvs[i])
				}
			}
		}
		// #endif
	}
	/** 只解析 name=value，忽略 Expires/Path/Domain 等段，避免误写入导致切店后身份错乱 */
	const parseCookieNameValuePairs = (cookie) => {
		if (!cookie || typeof cookie !== 'string') return []
		const parts = cookie.split(';')
		const attrNames = new Set([
			'expires', 'max-age', 'path', 'domain', 'secure', 'httponly', 'samesite',
			'partitioned', 'priority', 'size'
		])
		const out = []
		for (let p = 0; p < parts.length; p++) {
			const seg = parts[p].trim()
			if (!seg || seg.indexOf('=') <= 0) continue
			const eq = seg.indexOf('=')
			const name = seg.substring(0, eq).trim()
			if (attrNames.has(name.toLowerCase())) continue
			out.push(name + '=' + seg.substring(eq + 1).trim())
		}
		return out
	}
	const set_cookie = (wv, cookie, home_url, domain) => {
		if (!cookie) {
			return
		}
		
		let js_cookie_arr = parseCookieNameValuePairs(cookie)
		
		// 对于美团平台（shopType=1,3,4），删除isOfflineSelfOpen cookie项（与openShop.vue保持一致）
		// 注意：这里需要通过home_url判断是否为美团平台，或者通过其他方式获取shopType
		// 暂时先检查home_url是否包含meituan.com
		if (home_url && home_url.includes('meituan.com')) {
			js_cookie_arr = js_cookie_arr.filter(item => {
				return !item.trim().toLowerCase().startsWith('isofflineselfopen=')
			})
		}
		
		for (let i in js_cookie_arr) {
			if (!js_cookie_arr[i] || js_cookie_arr[i].trim() === '') {
				continue
			}
			
			// 获取cookie的key和value（正确处理值中包含等号的情况）
			const equalIndex = js_cookie_arr[i].indexOf('=')
			if (equalIndex <= 0) {
				continue
			}
			
			const cookieKey = js_cookie_arr[i].substring(0, equalIndex).trim()
			const cookieValue = js_cookie_arr[i].substring(equalIndex + 1).trim()
			const cookieItem = cookieKey + '=' + cookieValue
			
			let cookie_xx = ''
			if (domain) {
				cookie_xx = cookieItem + '; path=/; domain=' + domain
			} else {
				cookie_xx = cookieItem + '; path=/'
			}
			
			try {
				plus.navigator.setCookie(home_url, cookie_xx)
			} catch (e) {
				// 忽略错误
			}
		}
	}
	const applyJdCookieTargets = (cookie) => {
		// 用少量「源站+domain」组合覆盖 *.jddj.com / *.jd.com
		const jddjCookieTargets = [
			{ url: 'https://store.jddj.com', domains: ['', '.store.jddj.com', '.jddj.com', '.jd.com'] },
			{ url: 'https://m.jd.com', domains: ['', '.jd.com'] },
			{ url: 'https://passport.jd.com', domains: ['', '.jd.com'] },
			{ url: 'https://login.o2o.jd.com', domains: ['', '.o2o.jd.com', '.jd.com'] },
			{ url: 'https://store1.jddj.com', domains: ['', '.jddj.com'] },
			{ url: 'https://lsp-store1.jddj.com', domains: ['', '.jddj.com'] },
			{ url: 'https://josl-privilege1.jddj.com', domains: ['', '.jddj.com'] }
		]
		for (let ti = 0; ti < jddjCookieTargets.length; ti++) {
			const t = jddjCookieTargets[ti]
			for (let di = 0; di < t.domains.length; di++) {
				set_cookie(null, cookie, t.url, t.domains[di])
			}
		}
		const jddjExtraDomains = [
			{ base: 'https://store.jddj.com', domain: '.store1.jddj.com' },
			{ base: 'https://store.jddj.com', domain: '.lsp-store1.jddj.com' },
			{ base: 'https://store.jddj.com', domain: '.josl-privilege1.jddj.com' }
		]
		for (let ei = 0; ei < jddjExtraDomains.length; ei++) {
			const e = jddjExtraDomains[ei]
			set_cookie(null, cookie, e.base, e.domain)
		}
	}
	const buildJdPreloadFixScript = () => `
		(function() {
			try {
				if (typeof qt === 'undefined') {
					window.qt = {
						webChannelTransport: {
							send: function() {},
							onmessage: null
						}
					};
				}
				if (typeof app_version === 'undefined') window.app_version = '1.0.0';
				if (typeof os === 'undefined') window.os = 'unknown';

				// 京东后台很多页面是前端路由切换，右侧布局依赖 resize 事件重算
				var dispatchResize = function() {
					try {
						window.dispatchEvent(new Event('resize'));
						window.dispatchEvent(new Event('orientationchange'));
					} catch (e) {}
				};

				// 监听 history push/replace/pop，确保切换菜单后触发重排
				if (typeof history !== 'undefined') {
					var _pushState = history.pushState;
					if (_pushState) {
						history.pushState = function() {
							var ret = _pushState.apply(this, arguments);
							setTimeout(dispatchResize, 50);
							return ret;
						};
					}
					var _replaceState = history.replaceState;
					if (_replaceState) {
						history.replaceState = function() {
							var ret = _replaceState.apply(this, arguments);
							setTimeout(dispatchResize, 50);
							return ret;
						};
					}
				}
				window.addEventListener('popstate', function() {
					setTimeout(dispatchResize, 50);
				});

				// 点击后延迟触发重排（左侧菜单收缩/展开后右侧需重算布局）
				var resizeTimer;
				document.addEventListener('click', function() {
					clearTimeout(resizeTimer);
					resizeTimer = setTimeout(dispatchResize, 150);
				}, true);
			} catch (e) {}
		})();
	`
	const buildJdInjectCookieScript = (cookieItems) => `
		(function() {
			try {
				if (typeof qt === 'undefined') {
					window.qt = {
						webChannelTransport: {
							send: function() {},
							onmessage: null
						}
					};
				}
				if (typeof app_version === 'undefined') window.app_version = '1.0.0';
				if (typeof os === 'undefined') window.os = 'unknown';
				
				var cookieItems = ${JSON.stringify(cookieItems)};
				cookieItems.forEach(function(item) {
					if (item && item.indexOf('=') > 0) {
						document.cookie = item + '; path=/; domain=.jddj.com';
						document.cookie = item + '; path=/; domain=.store.jddj.com';
						document.cookie = item + '; path=/; domain=.jd.com';
						document.cookie = item + '; path=/';
					}
				});

				// 强制触发一次重排，避免切菜单后右侧区域空白
				try {
					window.dispatchEvent(new Event('resize'));
					window.dispatchEvent(new Event('orientationchange'));
				} catch (e) {}
			} catch (e) {}
		})();
	`
	
	// 使用cookie打开美团平台后台（支持美团外卖、美团闪购、美团医药）
	const open_meituan_with_cookie = (cookie, shopType = 1) => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		uni.showLoading({})
		
		// 判断平台类型（Android/iOS）
		const systemInfo = uni.getSystemInfoSync()
		const isAndroid = systemInfo.platform === 'android'
		
		// 根据shopType获取对应的URL和domain
		let baseUrl = ''
		let domain = ''
		
		if (shopType == 1) {
			// 美团外卖
			baseUrl = 'https://e.waimai.meituan.com/'
			domain = '.meituan.com'
		} else if (shopType == 3) {
			// 美团闪购
			baseUrl = 'https://shangoue.meituan.com/'
			domain = '.meituan.com'
		} else if (shopType == 4) {
			// 美团医药
			baseUrl = 'https://yiyao.meituan.com/'
			domain = '.meituan.com'
		} else {
			// 默认使用美团外卖
			baseUrl = 'https://e.waimai.meituan.com/'
			domain = '.meituan.com'
			shopType = 1
		}
		
		// 第一步：清理cookie和缓存
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清除缓存
		plus.cache.clear(() => {
			// 第二步：设置User-Agent
			let userAgent = ""
			if (shopType == 3 || shopType == 4) {
				// 美团闪购和美团医药：使用PC端User-Agent
				const banben = Math.floor(Math.random() * 601) + 1
				userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
					Math.floor(Math.random() * 16) +
					"_7) AppleWebKit/" + banben +
					".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
			} else {
				// 美团外卖：使用移动端User-Agent
				userAgent = "Mozilla/5.0 (Linux; Android 13; VOG-AL00 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36"
			}
			plus.navigator.setUserAgent(userAgent)
			
			let getWindowInfo = uni.getWindowInfo()
			// 根据平台类型确定初始URL和加载URL
			let url = baseUrl
			let loadUrl = baseUrl
			if (shopType == 1) {
				// 美团外卖使用特殊URL
				url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
				loadUrl = 'https://e.waimai.meituan.com/'
			} else if (shopType == 4) {
				// 美团医药使用特定URL路径
				url = 'https://yiyao.meituan.com/#/new_fe/business#/index'
				loadUrl = 'https://yiyao.meituan.com/'
			}
			
			// 使用唯一的 webview ID（添加时间戳避免冲突）
			const webviewid = `mywebview-${shopType}-${Date.now()}`
			const webview_setting = {
				// 对于美团医药，使用WKWebview（更现代的webview，能更好地模拟PC浏览器）
				'kernel': shopType == 4 ? 'WKWebview' : 'UIWebview',
				'disablePlus': false,
				'scrollIndicator': 'all',
				'width': getWindowInfo.screenWidth + 'px',
				'top': '18%',
				'scalable': true,
			}
			
			// 判断平台类型（Android/iOS）
			const systemInfo = uni.getSystemInfoSync()
			const isAndroid = systemInfo.platform === 'android'
			
			// Android和iOS使用不同的策略
			if (isAndroid) {
				// Android：先创建webview但不加载URL，设置cookie后再加载URL，确保cookie在页面加载前生效
				// 对于美团闪购和美团医药，先创建一个临时webview来设置cookie，然后关闭并重新创建
				if (shopType == 3 || shopType == 4) {
					// 美团闪购和美团医药：先设置cookie，等待生效后再创建webview
					// 先设置cookie（不创建webview）
					set_cookie(null, cookie, baseUrl, domain)
					// 等待cookie设置完成后再创建webview
					setTimeout(() => {
						// 再次设置cookie确保生效
						set_cookie(null, cookie, baseUrl, domain)
						// 等待cookie生效后再创建webview
						setTimeout(() => {
							w = plus.webview.create(loadUrl || baseUrl, webviewid, webview_setting)
							// 创建后再次设置cookie确保生效
							setTimeout(() => {
								set_cookie(null, cookie, baseUrl, domain)
								// 显示webview
								colseShow.value = true
								uni.hideLoading()
								w.show()
							}, 200)
						}, 500)
					}, 500)
				} else {
					// 美团外卖：直接创建并显示
					w = plus.webview.create(loadUrl || baseUrl, webviewid, webview_setting)
					setTimeout(() => {
						set_cookie(null, cookie, baseUrl, domain)
						colseShow.value = true
						uni.hideLoading()
						w.show()
					}, 200)
				}
			} else {
				// iOS：使用原来的逻辑（先创建再关闭再打开）
				w = plus.webview.create(loadUrl || baseUrl, webviewid, webview_setting)
				
				setTimeout(() => {
					plus.webview.close(w)
					setTimeout(() => {
						// 第五步：再次设置User-Agent（确保生效）
						plus.navigator.setUserAgent(userAgent)
						
						// 第六步：重新打开webview（使用about:blank而不是空字符串，避免生产环境白屏）
						w = plus.webview.open("about:blank", webviewid, webview_setting)
					
						// 第七步：等待webview准备好后再设置cookie（对于美团医药需要更长的等待时间）
						const webviewReadyTime = (shopType == 3 || shopType == 4) ? 300 : 100
						setTimeout(() => {
							// 设置cookie
							set_cookie(null, cookie, baseUrl, domain)
						}, webviewReadyTime)
						
						// 等待cookie设置完成后再加载URL（总等待时间 = webviewReadyTime + cookieWaitTime）
						const cookieWaitTime = (shopType == 3 || shopType == 4) ? 800 : 200
						setTimeout(() => {
							// 第八步：对于美团医药，在加载URL之前注入User-Agent
							if (shopType == 4) {
							try {
								let evalUserAgent = ""
								const banben = Math.floor(Math.random() * 601) + 1
								evalUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
									Math.floor(Math.random() * 16) +
									"_7) AppleWebKit/" + banben +
									".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
								
								w.evalJS(`
									(function() {
										if (typeof Object !== 'undefined' && Object.defineProperty) {
											try {
												Object.defineProperty(navigator, 'userAgent', {
													get: function() { return '${evalUserAgent}'; },
													configurable: true,
													enumerable: true
												});
												Object.defineProperty(navigator, 'platform', {
													get: function() { return 'MacIntel'; },
													configurable: true,
													enumerable: true
												});
												Object.defineProperty(navigator, 'vendor', {
													get: function() { return 'Apple Computer, Inc.'; },
													configurable: true,
													enumerable: true
												});
												Object.defineProperty(navigator, 'appVersion', {
													get: function() { return '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'; },
													configurable: true,
													enumerable: true
												});
											} catch(e) {
												// 忽略错误
											}
										}
									})();
								`)
							} catch (e) {
								// 忽略错误
							}
						}
						
						// 第九步：先显示webview，再加载URL（确保webview可见后再加载内容）
						try {
							colseShow.value = true
							uni.hideLoading()
							w.show() // 先显示webview
							// 延迟一小段时间确保webview已经显示，再加载URL
							setTimeout(() => {
								w.loadURL(loadUrl)
							}, 100)
							
							// 对于美团医药，在loadURL后立即再次注入User-Agent，并通过evalJS设置cookie
							if (shopType == 4) {
								setTimeout(() => {
									try {
										let evalUserAgent = ""
										const banben = Math.floor(Math.random() * 601) + 1
										evalUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
											Math.floor(Math.random() * 16) +
											"_7) AppleWebKit/" + banben +
											".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
										
										w.evalJS(`
											(function() {
												if (typeof Object !== 'undefined' && Object.defineProperty) {
													try {
														Object.defineProperty(navigator, 'userAgent', {
															get: function() { return '${evalUserAgent}'; },
															configurable: true,
															enumerable: true
														});
														Object.defineProperty(navigator, 'platform', {
															get: function() { return 'MacIntel'; },
															configurable: true,
															enumerable: true
														});
														Object.defineProperty(navigator, 'vendor', {
															get: function() { return 'Apple Computer, Inc.'; },
															configurable: true,
															enumerable: true
														});
														Object.defineProperty(navigator, 'appVersion', {
															get: function() { return '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'; },
															configurable: true,
															enumerable: true
														});
													} catch(e) {
														// 忽略错误
													}
												}
												
											})();
										`)
										
										// 在loadURL后立即通过evalJS设置cookie
										setTimeout(() => {
											try {
												// 准备cookie项（删除isOfflineSelfOpen）
												let cookieForEvalJS = cookie
												// 分割并过滤
												let cookieItems = cookieForEvalJS.split('; ').filter(item => {
													const trimmed = item.trim()
													return trimmed && trimmed.indexOf('=') > 0 && !trimmed.startsWith('isOfflineSelfOpen=')
												})
												// 如果分割后只有1项，尝试用分号分割
												if (cookieItems.length === 1 && cookieForEvalJS.indexOf(';') >= 0) {
													cookieItems = cookieForEvalJS.split(';').filter(item => {
														const trimmed = item.trim()
														return trimmed && trimmed.indexOf('=') > 0 && !trimmed.startsWith('isOfflineSelfOpen=')
													})
												}
												
												w.evalJS(`
													(function() {
														try {
															const cookieItems = ${JSON.stringify(cookieItems)};
															cookieItems.forEach(function(item) {
																if (item && item.indexOf('=') > 0) {
																	document.cookie = item + '; path=/';
																}
															});
														} catch(e) {
															// 忽略错误
														}
													})();
												`)
											} catch (e) {
												// 忽略错误
											}
										}, 100)
									} catch (e) {
										// 忽略错误
									}
								}, 50)
								
								// 页面加载完成后再次通过evalJS设置cookie，确保cookie生效
								setTimeout(() => {
									try {
										// 准备cookie项（删除isOfflineSelfOpen）
										let cookieForEvalJS = cookie
										// 分割并过滤
										let cookieItems = cookieForEvalJS.split('; ').filter(item => {
											const trimmed = item.trim()
											return trimmed && trimmed.indexOf('=') > 0 && !trimmed.startsWith('isOfflineSelfOpen=')
										})
										// 如果分割后只有1项，尝试用分号分割
										if (cookieItems.length === 1 && cookieForEvalJS.indexOf(';') >= 0) {
											cookieItems = cookieForEvalJS.split(';').filter(item => {
												const trimmed = item.trim()
												return trimmed && trimmed.indexOf('=') > 0 && !trimmed.startsWith('isOfflineSelfOpen=')
											})
										}
										
										w.evalJS(`
											(function() {
												try {
													const cookieItems = ${JSON.stringify(cookieItems)};
													cookieItems.forEach(function(item) {
														if (item && item.indexOf('=') > 0) {
															document.cookie = item + '; path=/';
														}
													});
												} catch(e) {
													// 忽略错误
												}
											})();
										`)
									} catch (e) {
										// 忽略错误
									}
								}, 100)
								
								// 页面加载完成后再次通过evalJS设置cookie，并刷新页面确保数据正常加载
								let hasReloaded = false
								w.addEventListener('loading', (e) => {
									if (!e.loading && shopType == 4 && !hasReloaded) {
										hasReloaded = true
										setTimeout(() => {
											try {
												// 准备cookie项（删除isOfflineSelfOpen）
												let cookieForEvalJS = cookie
												// 分割并过滤
												let cookieItems = cookieForEvalJS.split('; ').filter(item => {
													const trimmed = item.trim()
													return trimmed && trimmed.indexOf('=') > 0 && !trimmed.startsWith('isOfflineSelfOpen=')
												})
												// 如果分割后只有1项，尝试用分号分割
												if (cookieItems.length === 1 && cookieForEvalJS.indexOf(';') >= 0) {
													cookieItems = cookieForEvalJS.split(';').filter(item => {
														const trimmed = item.trim()
														return trimmed && trimmed.indexOf('=') > 0 && !trimmed.startsWith('isOfflineSelfOpen=')
													})
												}
												
												w.evalJS(`
													(function() {
														try {
															const cookieItems = ${JSON.stringify(cookieItems)};
															cookieItems.forEach(function(item) {
																if (item && item.indexOf('=') > 0) {
																	document.cookie = item + '; path=/';
																}
															});
															
															// 等待cookie设置完成后再刷新页面，确保数据能正常加载
															setTimeout(function() {
																try {
																	location.reload();
																} catch(e) {
																	// 忽略错误
																}
															}, 300);
														} catch(e) {
															// 忽略错误
														}
													})();
												`)
											} catch (e) {
												// 忽略错误
											}
										}, 1000)
									}
								})
							}
							// 等待webview显示后再显示缩放按钮
							setTimeout(() => {
								showZoomButtons.value = true
								// 初始化缩放级别（最小缩小比例）
								zoomLevel.value = 50
								// 多次尝试应用初始缩放，确保生效
								setTimeout(() => applyZoom(), 500)
								setTimeout(() => applyZoom(), 1500)
								setTimeout(() => applyZoom(), 3000)
							}, 500)
						} catch (e) {
							uni.hideLoading()
							uni.showToast({
								title: '加载URL失败: ' + (e.message || '未知错误'),
								icon: 'none',
								duration: 3000
							})
						}
					}, cookieWaitTime)
					}, 500)
				}, 500)
			}
		})
		// #endif
	}
	
	// 使用cookie打开淘宝闪购外卖后台（shopType=2，使用melody.shop.ele.me）
	const open_eleme_with_cookie = (cookie) => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		uni.showLoading({})
		
		// 完全按照原始 open_melody 函数的逻辑实现
		const banben = Math.floor(Math.random() * 601) + 1
		const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		
		plus.navigator.setUserAgent(userAgent)
		
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = 'pcwebview'
		const webview_setting = {
			'top': '18%',
		}
		
		// 构建重定向URL（使用 office_id.value 或 storageShopInfo.office_id）
		const shopOfficeId = office_id.value || storageShopInfo.office_id || ''
		if (!shopOfficeId) {
			uni.hideLoading()
			uni.showToast({
				title: '店铺ID为空，无法打开后台',
				icon: 'none',
				duration: 2000
			})
			return
		}
		let redirect_url = `https://melody.shop.ele.me/app/shop/${shopOfficeId}/dashboard#app.shop.dashboard`
		
		// 关闭之前的webview（如果存在）
		if (w) {
			try {
				plus.webview.close(w)
			} catch (e) {
				// 忽略错误
			}
			w = null
		}
		
		// 清理cookie和缓存（必须在创建webview之前清理）
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 判断平台类型（Android/iOS）
		const systemInfo = uni.getSystemInfoSync()
		const isAndroid = systemInfo.platform === 'android'
		
		// 清除缓存，在回调中创建webview、设置cookie和加载URL
		plus.cache.clear(() => {
			try {
				// Android：直接使用目标URL创建webview，避免about:blank导致错误页面
				// iOS：使用about:blank
				if (isAndroid) {
					// Android：直接使用目标URL创建，确保不使用about:blank
					w = plus.webview.create(redirect_url, webviewid, webview_setting)
				} else {
					// iOS：使用about:blank
					w = plus.webview.create("about:blank", webviewid, webview_setting)
				}
				
				// 准备evalJS设置cookie的函数（参考openShop.vue中京东的实现方式）
				const setCookieViaEvalJS = () => {
					try {
						// 使用 "; " 分割cookie（与set_cookie函数保持一致）
						const cookieItems = cookie.split('; ').filter(item => item.trim() && item.indexOf('=') > 0)
						
						// 使用JSON.stringify确保cookie值被正确转义（参考openShop.vue的实现）
						let cookieScript = `
							(function() {
								try {
									const cookieItems = ${JSON.stringify(cookieItems)};
									cookieItems.forEach(function(item) {
										if (item && item.indexOf('=') > 0) {
											document.cookie = item + '; path=/; domain=.ele.me';
										}
									});
								} catch(e) {
									// 忽略错误
								}
							})();
						`
						w.evalJS(cookieScript)
					} catch (e) {
						// 忽略错误
					}
				}
				
				// 添加webview事件监听
				// 使用标志位防止重复执行cookie设置
				let cookieSetFlag = false
				if (w) {
					w.addEventListener('loading', (e) => {
						if (!e.loading) {
							// 页面加载完成
							const currentUrl = w.getURL()
							if (currentUrl && currentUrl.includes('melody.shop.ele.me') && !cookieSetFlag) {
								cookieSetFlag = true // 设置标志位，防止重复执行
								// 延迟一点时间确保页面完全加载
								setTimeout(() => {
									setCookieViaEvalJS()
									// 检查当前URL，如果不在dashboard页面，重新加载
									const urlAfterDelay = w.getURL()
									if (urlAfterDelay && (urlAfterDelay.includes('/login') || !urlAfterDelay.includes('/dashboard'))) {
										setTimeout(() => {
											w.loadURL(redirect_url)
											cookieSetFlag = false // 重置标志位，允许下次重新设置cookie
										}, 300)
									}
								}, 500)
							}
						}
					})
					w.addEventListener('error', (e) => {
						// 忽略错误
					})
					w.addEventListener('receivedTitle', (e) => {
						// 忽略
					})
					w.addEventListener('newWindow', (e) => {
						// 忽略
					})
					w.addEventListener('urlChanged', (e) => {
						// 忽略
					})
					w.addEventListener('close', (e) => {
						// 忽略
					})
				}
			} catch (e) {
				uni.hideLoading()
				uni.showToast({
					title: '创建webview失败',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			set_cookie(w, cookie, 'https://melody.shop.ele.me/', '.ele.me')
			
			// Android：如果已经使用目标URL创建，则不需要再次loadURL；iOS：需要loadURL
			if (isAndroid) {
				// Android：已经使用目标URL创建，直接显示
				colseShow.value = true
				uni.hideLoading()
				w.show()
			} else {
				// iOS：需要加载URL
				try {
					w.loadURL(redirect_url)
				} catch (e) {
					// 忽略错误
				}
				colseShow.value = true
				uni.hideLoading()
				w.show()
			}
			
			// 等待webview显示后再显示缩放按钮
			setTimeout(() => {
				showZoomButtons.value = true
				// 初始化缩放级别（最小缩小比例）
				zoomLevel.value = 50
				// 多次尝试应用初始缩放，确保生效
				setTimeout(() => applyZoom(), 500)
				setTimeout(() => applyZoom(), 1500)
				setTimeout(() => applyZoom(), 3000)
			}, 500)
		})
		// #endif
	}
	
	// 使用cookie打开淘宝闪购零售后台（shopType=5，使用nr.ele.me）
	const open_eleme_retail_with_cookie = (cookie) => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		uni.showLoading({})
		
		// 完全按照 open_eleme_with_cookie 的逻辑实现
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = 'pcwebview'
		const webview_setting = {
			'top': '18%',
		}
		
		const baseUrl = 'https://nr.ele.me/'
		const domain = '.ele.me'
		const redirect_url = baseUrl
		
		// 清理cookie和缓存（必须在创建webview之前清理）
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 判断平台类型（Android/iOS）
		const systemInfo = uni.getSystemInfoSync()
		const isAndroid = systemInfo.platform === 'android'
		
		// 清除缓存，在回调中创建webview、设置cookie和加载URL
		plus.cache.clear(() => {
			try {
				// Android：直接使用目标URL创建webview，避免about:blank导致错误页面
				// iOS：使用about:blank
				if (isAndroid) {
					// Android：直接使用目标URL创建
					w = plus.webview.create(redirect_url, webviewid, webview_setting)
				} else {
					// iOS：使用about:blank
					w = plus.webview.create("about:blank", webviewid, webview_setting)
				}
				
				// 准备evalJS设置cookie的函数（参考openShop.vue中京东的实现方式）
				const setCookieViaEvalJS = () => {
					try {
						// 使用 "; " 分割cookie（与set_cookie函数保持一致）
						const cookieItems = cookie.split('; ').filter(item => item.trim() && item.indexOf('=') > 0)
						
						// 使用JSON.stringify确保cookie值被正确转义（参考openShop.vue的实现）
						let cookieScript = `
							(function() {
								try {
									const cookieItems = ${JSON.stringify(cookieItems)};
									cookieItems.forEach(function(item) {
										if (item && item.indexOf('=') > 0) {
											document.cookie = item + '; path=/; domain=.ele.me';
										}
									});
								} catch(e) {
								}
							})();
						`
						w.evalJS(cookieScript)
					} catch (e) {
					}
				}
				
				// 添加webview事件监听，用于调试和cookie设置
				// 使用标志位防止重复执行cookie设置
				let cookieSetFlag = false
				if (w) {
					w.addEventListener('loading', (e) => {
						if (!e.loading) {
							// 页面加载完成
							const currentUrl = w.getURL()
							if (currentUrl && currentUrl.includes('nr.ele.me') && !cookieSetFlag) {
								cookieSetFlag = true // 设置标志位，防止重复执行
								// 延迟一点时间确保页面完全加载
								setTimeout(() => {
									setCookieViaEvalJS()
									// 检查当前URL，如果在登录页，重新加载
									const urlAfterDelay = w.getURL()
									if (urlAfterDelay && urlAfterDelay.includes('/login')) {
										setTimeout(() => {
											w.loadURL(redirect_url)
											cookieSetFlag = false // 重置标志位，允许下次重新设置cookie
										}, 300)
									}
								}, 500)
							}
						}
					})
					w.addEventListener('error', (e) => {
					})
					w.addEventListener('urlChanged', (e) => {
					})
				}
			} catch (e) {
				uni.hideLoading()
				uni.showToast({
					title: '创建webview失败',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			// 设置cookie（使用plus.navigator.setCookie）
			set_cookie(w, cookie, baseUrl, domain)
			
			// Android：如果已经使用目标URL创建，则不需要再次loadURL；iOS：需要loadURL
			if (isAndroid) {
				// Android：已经使用目标URL创建，直接显示
				colseShow.value = true
				uni.hideLoading()
				w.show()
			} else {
				// iOS：需要加载URL
				try {
					w.loadURL(redirect_url)
				} catch (e) {
				}
				colseShow.value = true
				uni.hideLoading()
				w.show()
			}
			
			// 等待webview显示后再显示缩放按钮
			setTimeout(() => {
				showZoomButtons.value = true
				// 初始化缩放级别（最小缩小比例）
				zoomLevel.value = 50
				// 多次尝试应用初始缩放，确保生效
				setTimeout(() => applyZoom(), 500)
				setTimeout(() => applyZoom(), 1500)
				setTimeout(() => applyZoom(), 3000)
			}, 500)
		})
		// #endif
	}
	
	// 使用cookie打开京东平台后台（支持京东零售、京东外卖）
	const open_jddj_with_cookie = (cookie) => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		const seq = ++jdOpenSeq
		
		uni.showLoading({})
		
		// 第一步：关闭所有 http(s) webview，避免切店后仍显示上一家 SPA / 旧 cookie
		try {
			if (typeof plus !== 'undefined' && plus.webview) {
				const wvs = plus.webview.all()
				for (let i = 0; i < wvs.length; i++) {
					try {
						const u = wvs[i].getURL()
						if (u && (u.indexOf('http') === 0)) {
							plus.webview.close(wvs[i])
						}
					} catch (e) {}
				}
			}
		} catch (e) {}
		if (w) {
			try { plus.webview.close(w) } catch (e) {}
			w = null
		}
		
		// 第二步：清理cookie和缓存
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清缓存不阻塞在回调里（部分机型 cache.clear 回调很慢）；短延迟后再建 webview
		try {
			plus.cache.clear()
		} catch (e) {}
		
		const runJddjOpenAfterClear = () => {
			if (jdOpenSeq !== seq) return
			// 每次打开使用不同入口 URL，避免 WebView / 京东 SPA 复用上一店缓存
			const entryUrl = 'https://store.jddj.com/?_app_entry=' + Date.now()
			// 第三步：设置 User-Agent（只设一次，减少重复开销）
			const banben = Math.floor(Math.random() * 601) + 1
			const jdPcUA =
				'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_' +
				Math.floor(Math.random() * 16) +
				'_7) AppleWebKit/' + banben +
				'.36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/' + banben + '.36'
			plus.navigator.setUserAgent(jdPcUA)
			
			const systemInfo = uni.getSystemInfoSync()
			const isIOS = systemInfo.platform === 'ios'
			const statusBarHeight = systemInfo.statusBarHeight || 0
			let getWindowInfo = uni.getWindowInfo()
			const winW = getWindowInfo.screenWidth || getWindowInfo.windowWidth
			const winH = getWindowInfo.windowHeight || getWindowInfo.screenHeight
			const isLandscape = winW > winH
			// 横屏时尽量填满空间，竖屏保持原有预留
			const topPx = isLandscape
				? Math.min((systemBarHeight.value || statusBarHeight) + 8, 36)
				: (systemBarHeight.value || statusBarHeight) + 44
			const bottomPx = isLandscape ? 24 : 60
			const webviewHeight = Math.max(200, winH - topPx - bottomPx)
			
			// 使用唯一 webview ID，避免与上一实例复用
			const webviewid = 'jddj-webview-' + Date.now() + '-' + Math.floor(Math.random() * 1e6)
			const webview_setting = {
				// iOS 下优先 WKWebview，避免部分后台路由切换后右侧区域不重绘
				'kernel': isIOS ? 'WKWebview' : 'UIWebview',
				'disablePlus': false,
				'scrollIndicator': 'all',
				'width': winW + 'px',
				'left': '0px',
				'top': topPx + 'px',
				'height': webviewHeight + 'px',
				'scalable': true,
			}
			
			// 先创建一次再 open，模仿仓库里 `openShop.vue` 的更稳定打开方式
			w = plus.webview.create(entryUrl, webviewid, webview_setting)
			
			setTimeout(() => {
				if (jdOpenSeq !== seq) return
				try {
					plus.webview.close(w)
				} catch (e) {}
				
				setTimeout(() => {
					if (jdOpenSeq !== seq) return
					// 第四步：重新打开 webview（about:blank 避免部分设备白屏）
					w = plus.webview.open("about:blank", webviewid, webview_setting)
					
					// 第五步：写入 cookie（封装后的目标域集合）
					applyJdCookieTargets(cookie)
					
					// 第六步：在加载URL之前注入修复脚本（避免右侧模块触发时 QWebChannel 相关异常导致空白）
					const preloadFixScript = buildJdPreloadFixScript()
					try {
						w.evalJS(preloadFixScript)
					} catch (e) {}
					
					// 第七步：加载 URL（带时间戳，强制不走上一店文档缓存）
					try {
						w.loadURL(entryUrl)
					} catch (e) {}
					
					colseShow.value = true
					uni.hideLoading()
					w.show()
					
					// 第八步：页面进入后补一次注入（与 set_cookie 相同解析）
					const injectFixAndCookie = () => {
						try {
							if (jdOpenSeq !== seq || !w) return
							const cookieItems = parseCookieNameValuePairs(cookie)
							const cookieScript = buildJdInjectCookieScript(cookieItems)
							
							w.evalJS(cookieScript)
						} catch (e) {}
					}
					
					setTimeout(() => injectFixAndCookie(), 380)
					setTimeout(() => injectFixAndCookie(), 900)
					
					// 等待 webview 显示后再显示缩放按钮
					setTimeout(() => {
						if (jdOpenSeq !== seq) return
						showZoomButtons.value = true
						zoomLevel.value = 50
						// iOS 下不要自动连续注入 viewport meta 缩放，部分后台会出现右侧不重绘问题
						if (!isIOS) {
							setTimeout(() => applyZoom(), 400)
							setTimeout(() => applyZoom(), 1200)
							setTimeout(() => applyZoom(), 2400)
						}
						// 监听横屏/窗口尺寸变化，更新 webview 尺寸并触发重排（解决横屏右侧空白）
						try {
							uni.offWindowResize(webviewResizeHandler)
							uni.onWindowResize(webviewResizeHandler)
						} catch (e) {}
					}, 350)
				}, 200)
			}, 280)
		}
		
		setTimeout(runJddjOpenAfterClear, 100)
		// #endif
	}
	
	// 使用cookie打开抖音平台后台（支持抖店即时零售、抖音外卖）
	const open_jinritemai_with_cookie = (cookie) => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		uni.showLoading({})
		
		const backendUrl = 'https://jsls.jinritemai.com/mfa/homepage'
		
		// 第一步：关闭之前的webview（如果存在）
		if (w) {
			try {
				plus.webview.close(w)
			} catch (e) {
				// 忽略错误
			}
			w = null
		}
		
		// 第二步：清理cookie和缓存
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清除缓存
		plus.cache.clear(() => {
			// 第三步：设置User-Agent（使用PC端User-Agent）
			const banben = Math.floor(Math.random() * 601) + 1
			plus.navigator.setUserAgent(
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
				Math.floor(Math.random() * 16) +
				"_7) AppleWebKit/" + banben +
				".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
			)
			
			// 判断平台类型（Android/iOS）
			const systemInfo = uni.getSystemInfoSync()
			const isAndroid = systemInfo.platform === 'android'
			
			let getWindowInfo = uni.getWindowInfo()
			// 使用唯一的 webview ID（添加时间戳避免冲突）
			const webviewid = `jinritemai-webview-${Date.now()}`
			const webview_setting = {
				'kernel': 'UIWebview',
				'disablePlus': false,
				'scrollIndicator': 'all',
				'width': getWindowInfo.screenWidth + 'px',
				'top': '18%',
				'scalable': true,
			}
			
			if (isAndroid) {
				// Android：直接使用目标URL创建webview，避免about:blank导致错误页面
				w = plus.webview.create(backendUrl, webviewid, webview_setting)
				
				// 设置cookie（为多个域名设置cookie）
				const jinritemaiUrls = [
					'https://fxg.jinritemai.com',
					'https://jsls.jinritemai.com',
					'https://jinritemai.com'
				]
				
				for (const url of jinritemaiUrls) {
					set_cookie(null, cookie, url, '')
				}
				
				// 显示webview
				setTimeout(() => {
					colseShow.value = true
					uni.hideLoading()
					w.show()
					// 等待webview显示后再显示缩放按钮
					setTimeout(() => {
						showZoomButtons.value = true
						// 初始化缩放级别（最小缩小比例）
						zoomLevel.value = 50
						// 多次尝试应用初始缩放，确保生效
						setTimeout(() => applyZoom(), 500)
						setTimeout(() => applyZoom(), 1500)
						setTimeout(() => applyZoom(), 3000)
					}, 500)
				}, 200)
			} else {
				// iOS：使用原来的逻辑
				// 第四步：创建webview
				w = plus.webview.create(backendUrl, webviewid, webview_setting)
				
				setTimeout(() => {
					plus.webview.close(w)
					setTimeout(() => {
						// 第五步：再次设置User-Agent（确保生效）
						const banben2 = Math.floor(Math.random() * 601) + 1
						plus.navigator.setUserAgent(
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
							Math.floor(Math.random() * 16) +
							"_7) AppleWebKit/" + banben2 +
							".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben2 + ".36"
						)
						
						// 第六步：重新打开webview（使用about:blank而不是空字符串，避免生产环境白屏）
						w = plus.webview.open("about:blank", webviewid, webview_setting)
						
						// 第七步：设置cookie（为多个域名设置cookie）
						const jinritemaiUrls = [
							'https://fxg.jinritemai.com',
							'https://jsls.jinritemai.com',
							'https://jinritemai.com'
						]
						
						for (const url of jinritemaiUrls) {
							set_cookie(null, cookie, url, '')
						}
						
						// 第八步：先显示webview，再加载URL（确保webview可见后再加载内容）
						setTimeout(() => {
							try {
								colseShow.value = true
								uni.hideLoading()
								w.show() // 先显示webview
								// 延迟一小段时间确保webview已经显示，再加载URL
								setTimeout(() => {
									w.loadURL(backendUrl)
								}, 100)
								// 等待webview显示后再显示缩放按钮
								setTimeout(() => {
									showZoomButtons.value = true
									// 初始化缩放级别（最小缩小比例）
									zoomLevel.value = 50
									// 多次尝试应用初始缩放，确保生效
									setTimeout(() => applyZoom(), 500)
									setTimeout(() => applyZoom(), 1500)
									setTimeout(() => applyZoom(), 3000)
								}, 500)
							} catch (e) {
								uni.hideLoading()
								uni.showToast({
									title: '加载URL失败: ' + (e.message || '未知错误'),
									icon: 'none',
									duration: 3000
								})
							}
						}, 200)
					}, 500)
				}, 500)
			}
		})
		// #endif
	}
	
	const open_meituan = (cookie) => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		// const app = this;
		uni.showLoading({})
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"
		)
		let getWindowInfo = uni.getWindowInfo()
		let url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'mywebview';
		const webview_setting = {
			'kernel': 'UIWebview',
			'disablePlus': false,
			'scrollIndicator': 'all',
			'width': getWindowInfo.screenWidth + 'px',
			'top': '18%',
			'scalable': true,
		};
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.webview.close(w);
		w = plus.webview.create(url, webviewid, webview_setting)
		// w.show();
		// 判断平台类型（Android/iOS）
		const systemInfo = uni.getSystemInfoSync()
		const isAndroid = systemInfo.platform === 'android'
		
		if (isAndroid) {
			// Android：直接使用目标URL，不需要关闭和重新打开
			set_cookie(w, cookie, 'https://e.waimai.meituan.com/', '')
			colseShow.value = true
			uni.hideLoading()
			w.show()
		} else {
			// iOS：使用原来的逻辑
		setTimeout(() => {
			plus.webview.close(w);
			setTimeout(() => {
					// 使用about:blank而不是空字符串，避免生产环境白屏
					w = plus.webview.open("about:blank", webviewid, webview_setting);
				set_cookie(w, cookie, 'https://e.waimai.meituan.com/', '')
				colseShow.value = true;
				uni.hideLoading()
					w.show() // 先显示webview
					// 延迟一小段时间确保webview已经显示，再加载URL
					setTimeout(() => {
						w.loadURL('https://e.waimai.meituan.com/')
					}, 100)
			}, 500)
		}, 500)
		}
		// #endif
	}
	const open_melody = (cookie) => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		// const app = this;
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		let url = 'https://melody.shop.ele.me';
		let getWindowInfo = uni.getWindowInfo()
		
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'pcwebview';
		const webview_setting = {
			'top': '18%',
		};
		w = plus.webview.create("https://melody.shop.ele.me/login", webviewid, webview_setting);
		
		let redirect_url =
			'https://melody.shop.ele.me/app/shop/' + storageShopInfo.office_id + '/dashboard#app.shop.dashboard'
		let melody_cookie = storageShopInfo.cookies || ''
		plus.navigator.removeAllCookie();
		plus.navigator.removeCookie();
		plus.navigator.removeSessionCookie();
		plus.cache.clear(() => {
			set_cookie(w, melody_cookie, 'https://melody.shop.ele.me/', '.ele.me')
			w.loadURL(redirect_url)
			w.show();
		});
		// #endif
	}
	const openWebView = (url, id, cookie, name) => {
		const partition = 'persist:' + id
		var ckStr = "";
		ckStr = cookie;
		var ckObj = {};
		let cs = ckStr.split(";");
		for (let i = 0; i < cs.length; i++) {

			let c = cs[i].split('=');
			var key = c[0];
			var val = c[1];
			if (key.trim() != "") {
				ckObj[key] = val.trim();
			}
		}
	}
	const create_web = (url) => {
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		let getWindowInfo = uni.getWindowInfo();
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'pcwebview';
		const webview_setting = {
			'kernel': 'UIWebview'
		};
		let w = plus.webview.create(url, webviewid, webview_setting);
		return w
	}
	const repair = () => {
		isRepair.value = true
		addShop()
	}
	const addConfirm = () => {
		let data =
			"店铺名称：" + successObj.name +
			"\n店铺ID：" + successObj.office_id
		uni.setClipboardData({
			data
		});
		addClose()
		getShopList()
	}
	const addClose = () => {
		addState.value = false
	}
	const meituan = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		// const app = this;
		uni.showLoading({})
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"
		)
		let getWindowInfo = uni.getWindowInfo()
		let url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'mywebview';
		const webview_setting = {
			
				'kernel': 'UIWebview',
			'disablePlus': false,
			'scrollIndicator': 'all',
			'width': getWindowInfo.screenWidth + 'px',
			'top': '18%',
			'scalable': true,
		};
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.webview.close(w);
		w = plus.webview.create(url, webviewid, webview_setting)
		// w.show();
		setTimeout(() => {
			plus.webview.close(w);
			setTimeout(() => {
				w = plus.webview.open(url, webviewid, webview_setting);
				colseShow.value = true;
				w.show();
				uni.hideLoading({})
				checkinter = setInterval(() => {
					let str = w.getURL();
					if (str && (str.indexOf("time=") != -1 || str.indexOf("/#/new_fe/") !=
							-1)) {
						let cookiestr = plus.navigator.getCookie(str);
						try {
							if (cookiestr.indexOf("token=") && cookiestr.indexOf("acctId=") &&
								cookiestr.indexOf("wmPoiId=") != -1) {
								// setTimeout(() => {
								// app.add(cookiestr, '美团');
								cookieStr.value = cookiestr
								// }, 1000);
								const params = {
									shop_type: payParams.shoptype,
									cookies: cookieStr.value.replace('美团cookiestr', '')
								}
								agentAddShop(params)
								colseShow.value = false;
								plus.navigator.removeAllCookie()
								plus.navigator.removeCookie()
								plus.navigator.removeSessionCookie()
								plus.webview.close(w);
							}
						} catch (e) {
							plus.navigator.removeAllCookie()
							plus.navigator.removeCookie()
							plus.navigator.removeSessionCookie()
							return;
						}
					}
				}, 500)

			}, 500)
		}, 500)
		// #endif
	}
	const eleme = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		// const app = this;
		uni.showLoading({})
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		let url = 'https://melody.shop.ele.me';
		let getWindowInfo = uni.getWindowInfo()
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'pcwebview';
		const webview_setting = {
			
				'kernel': 'UIWebview',
			'top': '18%',
		};
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.cache.clear(function() {});
		plus.webview.close(w);


		//"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46"
		//"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"

		w = plus.webview.create(url, webviewid, webview_setting);
		// w.show();
		setTimeout(() => {
			plus.webview.close(w);
			setTimeout(() => {
				w = plus.webview.create(url + '/login', webviewid, webview_setting);
				colseShow.value = true;
				w.show();
				uni.hideLoading({})
				checkinter = setInterval(() => {
					let str = w.getURL();
					let cookiestr = plus.navigator.getCookie(str);
					if (cookiestr && cookiestr.indexOf("x5check_napos=") != -1) {
						const params = {
							shop_type: payParams.shoptype,
							cookies: cookiestr
						}
						agentAddShop(params)
						// cna=mYWtHFArpXQCAXjr1KQ+E+sF; __wpkreporterwid_=6be8ead9-d8aa-4461-98ae-b2e6af478511; x5check_napos=ZTFLYZMTA1Mjg1NTU2Mjk5NzAxT1ZIRndDKzZQ; ksid=ZTFLYZMTA1Mjg1NTU2Mjk5NzAxT1ZIRndDKzZQ; shopId=504162536; AEM_TAG_ID_CATCH_DATA_ES00000044={%22tagId%22:%22ES00000044%22%2C%22data%22:%22%E7%94%9C%E7%82%B9%E9%A5%AE%E5%93%81%22%2C%22userId%22:504162536%2C%22time%22:1680250822895}; AEM_TAG_ID_CATCH_DATA_ES00000069={%22tagId%22:%22ES00000069%22%2C%22data%22:%22%E8%80%81%E5%BA%97%22%2C%22userId%22:504162536%2C%22time%22:1680250822898}; AEM_TAG_ID_CATCH_DATA_ES00000035={%22tagId%22:%22ES00000035%22%2C%22userId%22:504162536%2C%22time%22:1680250822902}; AEM_TAG_ID_CATCH_DATA_ES00000021={%22tagId%22:%22ES00000021%22%2C%22data%22:%22%E5%85%A8%E5%9B%BD%E8%BF%9E%E9%94%81%22%2C%22userId%22:504162536%2C%22time%22:1680250822905}; AEM_TAG_ID_CATCH_DATA_ES00000019={%22tagId%22:%22ES00000019%22%2C%22data%22:%22%E6%AD%A6%E6%B1%89%22%2C%22userId%22:504162536%2C%22time%22:1680250822906}; isg=BK2tbMFztSpMIFHGNNpJ3ILqt0AnCuHcV_tr-e-y5cSzZsgYt1gTrVAkUjyAZvmU
						plus.webview.close(w);
						plus.cache.clear();
						colseShow.value = false;
						clearInterval(checkinter);
						// app.add(cookiestr, '饿了么');
						let wmPoiId = cookiestr.match(/shopId=(\S*);/)[1];
						let ksid = cookiestr.match(/ksid=(\S*);/)[1];
						plus.navigator.setCookie(
							"cna=mYWtHFArpXQCAXjr1KQ+E+sF; __wpkreporterwid_=6be8ead9-d8aa-4461-98ae-b2e6af478511; isg=BMXFO3QXDWKkJCm-XGLhBNry3wj_gnkU__NzIccqjfwLXuDQj9Br5fg8bKSoHpHM"
						);
					}
				}, 500)
			}, 500)
		}, 500)
		// #endif
	}
	const addShop = () => {
		if (payParams.shoptype == 1) {
			meituan()
		} else {
			eleme()
		}
	}
	const agentAddShop = (data) => {
		uni.showLoading({})
		ShopApi.agentAddShop(data).then(res => {
			if (res.code === 200) {
				successObj = res.data
				addState.value = true
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const colseV = () => {
		// #ifdef APP-PLUS
		// 移除横屏监听，避免关闭后重复触发
		try {
			uni.offWindowResize(webviewResizeHandler)
		} catch (e) {}
		if (typeof plus !== 'undefined' && plus.webview) {
			// 关闭所有相关的 webview
			try {
				// 关闭当前 webview
				if (w) {
					try {
						plus.webview.close(w)
					} catch (e) {
						// 忽略关闭错误
					}
					w = null
				}
				
				// 关闭所有可能存在的 webview（通过获取所有 webview 并关闭）
				try {
					const allWebviews = plus.webview.all()
					allWebviews.forEach(wv => {
						try {
							const url = wv.getURL()
							if (url && (url.indexOf('http') === 0 || url.indexOf('https') === 0)) {
								plus.webview.close(wv)
							}
						} catch (e) {
							// 忽略错误
						}
					})
				} catch (e) {
					// 忽略错误
				}
			} catch (e) {
				// 忽略错误
			}
			
			// 清理所有 cookie
			try {
				plus.navigator.removeAllCookie()
				plus.navigator.removeCookie()
				plus.navigator.removeSessionCookie()
			} catch (e) {
				// 忽略错误
			}
			
			// 清理缓存
			try {
				plus.cache.clear()
			} catch (e) {
				// 忽略错误
			}
		}
		// #endif
		if (checkinter) {
			clearInterval(checkinter)
			checkinter = null
		}
		isRepair.value = false
		showZoomButtons.value = false // 关闭 popup 时隐藏缩放按钮
		zoomLevel.value = 50 // 重置缩放级别
	}
	const parseCookies = (cookieString) => {
		return cookieString.split(';').reduce((cookies, cookie) => {
			const [key, ...valueParts] = cookie.trim().split('=');
			if (key && valueParts.length > 0) {
				cookies[key] = valueParts.join('=');
			}
			return cookies;
		}, {});
	}
	const openAboutBind = () => {
		aboutBindState.value = true
	}
	const closeAboutBind = () => {
		aboutBindState.value = false
	}
	const openAboutShop = () => {
		aboutShopState.value = true
	}
	const closeAboutShop = () => {
		aboutShopState.value = false
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const closeSetting = () => {
		shopSettingState.value = false
	}
	let settingData = ref({})
	const openSetting = () => {
		uni.showLoading({})
		ShopApi.getShopBindInfo({
			shop: shopId.value
		}).then(res => {
			if (res.code === 200) {
				settingData.value = res.data
				shopSettingState.value = true
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const onAutoFixSwitchClick = () => {
		uni.showToast({
			title: '此功能暂不可用',
			icon: 'none',
			duration: 2000
		})
	}
	const saveSetting = () => {
		if (settingData.value.auto_fix && (!settingData.value.shop_user || !settingData.value.shop_pwd)) {
		return uni.showModal({
			title: '提示',
			content: '请输入店铺账号密码',
		})
		}
		uni.showLoading({})
		ShopApi.setShopUserInfo({
			shopid: storageShopInfo.id,
			shopuser: settingData.value.auto_fix ? settingData.value.shop_user : '',
			shoppwd: settingData.value.auto_fix ? settingData.value.shop_pwd : ''
		}).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '操作成功',
					icon: 'success', // error success
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
				setTimeout(() => {
					openSetting()
				}, 2000)
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const removeUser = (item) => {
	uni.showModal({
		title: '提示',
		content: '确认踢掉账号' + item.user_name + '吗？',
			success: (res) => {
				if (res.confirm) {
					uni.showLoading({})
					ShopApi.unShopBind({
						shopid: storageShopInfo.id,
						shopuserid: item.id
					}).then(res => {
						if (res.code === 200) {
							uni.showToast({
								title: '操作成功',
								icon: 'success', // error success
								duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
								mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
							});
							setTimeout(() => {
								openSetting()
							}, 2000)
						}
					}).finally(() => {
						uni.hideLoading()
					})
				} else {

				}
			}
		})
	}

	const showSet = ref(false)
	// 处理店铺功能开关变化事件（从店铺列表页面触发）
	const handleShopFunctionChanged = (data) => {
		// 只有当变化的是当前店铺时才更新（兼容 id 和 office_id，以及字符串/数字类型）
		const changedShopIdStr = String(data.shopId || '')
		const currentShopIdStr = String(shopId.value || '')
		const currentOfficeIdStr = String(office_id.value || '')
		const storageShopIdStr = String(storageShopInfo.id || '')
		
		// 比较 ID：同时检查 shopId、office_id 和 storageShopInfo.id
		const isCurrentShop = currentShopIdStr === changedShopIdStr || 
		                      currentOfficeIdStr === changedShopIdStr ||
		                      storageShopIdStr === changedShopIdStr ||
		                      shopId.value === data.shopId ||
		                      office_id.value === data.shopId ||
		                      storageShopInfo.id === data.shopId
		
		if (isCurrentShop) {
			// 先更新 functionList 中的功能状态（立即更新UI）
			const funcItem = functionList.value.find(f => f.code === data.code)
			if (funcItem) {
				funcItem.enable = data.enable
			}
			
			// 更新 storageShopInfo 中的功能状态
			if (storageShopInfo.func_enable && Array.isArray(storageShopInfo.func_enable)) {
				const funcItem = storageShopInfo.func_enable.find(f => f.code === data.code)
				if (funcItem) {
					funcItem.enable = data.enable
				} else {
					storageShopInfo.func_enable.push({
						code: data.code,
						enable: data.enable,
						end_time: ''
					})
				}
				// 保存到本地存储
				uni.setStorageSync('shopInfo', storageShopInfo)
			}
			
			// 不重新获取功能列表，避免页面跳转到顶部
			// 因为已经直接更新了 functionList 和 storageShopInfo，不需要重新获取
			// setTimeout(() => {
			// 	getShopManagement(shopId.value)
			// }, 300)
		}
	}
	
	onShow(() => {
		// 从本地存储中获取数据
		const shopInfo = uni.getStorageSync('shopInfo');
		if (shopInfo) {
			Object.assign(storageShopInfo, shopInfo);
		}
		if (storageShopInfo.user === userId.value) {
			showSet.value = true
		} else {
			showSet.value = false
		}
		if (storageShopInfo && storageShopInfo.work_time) {
			WorkTimeList.value = storageShopInfo.work_time
		}
		// setCookiesFromQueryString(storageShopInfo.cookies)
		// 只有美团和饿了么需要解析cookies获取运营数据，京东暂时不需要
		if (storageShopInfo.cookies && (payParams.shoptype == 1 || payParams.shoptype == 2 || payParams.shoptype == 5)) {
		strObj.value = parseCookies(storageShopInfo.cookies)
		getOperateData(strObj.value)
		}
		
		// 当页面显示时，重新获取功能列表以确保数据是最新的
		// 这样可以确保从店铺列表页面设置功能开关后，进入店铺管理页面时能看到最新状态
		// 使用 nextTick 确保 shopId 已经正确设置
		if (shopId.value) {
			nextTick(() => {
				getShopManagement(shopId.value)
			})
		}
	})

	const strObj = ref('')
	const userId = ref('')
	onLoad((options) => {
		getSysteminfo()
		userId.value = authStore.getUserId
		if (options && options.id) {
			// 处理参数值，如果是字符串形式（可能是JSON编码的），需要解析
			const parseValue = (val) => {
				if (typeof val === 'string') {
					try {
						// 尝试解析JSON字符串（可能是双重编码的）
						const decoded = decodeURIComponent(val)
						if (decoded.startsWith('"') && decoded.endsWith('"')) {
							return JSON.parse(decoded)
						}
						return decoded
					} catch (e) {
						return val
					}
				}
				return val
			}
			
			shopId.value = parseValue(options.id)
			office_id.value = parseValue(options.office_id)
			payParams.shoptype = parseValue(options.type)
			
			if (options.isV2) {
				try {
					const parsed = parseValue(options.isV2)
					if (typeof parsed === 'boolean') {
						isV2.value = parsed
					} else if (typeof parsed === 'string') {
						isV2.value = parsed === 'true'
					} else {
						isV2.value = Boolean(parsed)
					}
				} catch (e) {
					isV2.value = options.isV2 === 'true' || options.isV2 === true
				}
			} else {
				isV2.value = false
			}
			
			// 确保storageShopInfo已经加载后再调用getShopManagement
			// 如果onShow还没执行，等待一下
			if (!storageShopInfo.id) {
				// 从本地存储中获取数据（以防onShow还未执行）
				const shopInfo = uni.getStorageSync('shopInfo');
				if (shopInfo) {
					Object.assign(storageShopInfo, shopInfo);
				}
			}
			
			getShopManagement(shopId.value)
			// if (func_enable) {
			// // 	shopDetails.value = params
			// 	const APPDATA = func_enable.filter(item => item.code === 'APPDATA')[0]
			// 	let time = APPDATA.end_time
			// 	// 创建一个新的 Date 对象
			// 	const date = new Date(time);

			// 	// 获取年、月（注意：JavaScript 中的月份是从 0 开始计数的，所以需要加 1）、日
			// 	const year = date.getFullYear();
			// 	const month = String(date.getMonth() + 1).padStart(2, '0'); // 确保两位数显示
			// 	const day = String(date.getDate()).padStart(2, '0'); // 确保两位数显示

			// 	// 拼接成所需的格式
			// 	appDataTime.value = year + '年' + month + '月' + day + '日';
			// }
			// getShopDetails(shopId.value)
		} else {
			// uni.showModal({
			// 	title: '提示',
			// 	content: '未获取到店铺id',
			// 	showCancel: false,
			// 	confirmText: '确定',
			// 	success: (res) => {
			// 		if (res.confirm) {
			// 			uni.switchTab({
			// 				url: '/pages/shop/shop'
			// 			})
			// 		}
			// 	}
			// })
		}
		
		// 监听店铺功能开关变化事件（从店铺列表页面触发）
		// 在 onLoad 中注册，确保页面加载时就注册事件监听器，即使页面在后台也能接收到事件
		uni.$on('shopFunctionChanged', handleShopFunctionChanged)
	})

	onMounted(() => {
		// 获取"进入后台"按钮宽度，设置头像尺寸
		setTimeout(() => {
			nextTick(() => {
				uni.createSelectorQuery().select('.go-shop').boundingClientRect((data) => {
					if (data && data.width) {
						avatarSize.value = data.width
					}
				}).exec()
			})
		}, 100)
		// 每十分钟更新一次
		// timer.value = setInterval(() => {
		// 	getOperateData(strObj.value)
		// 	// 执行你需要的操作
		// }, 600000);
	})

	onBeforeUnmount(() => {
		if (timer.value) {
			clearInterval(timer.value); // 清除定时器
			timer.value = null;
		}
	})
	
	// 页面卸载时移除事件监听
	onUnload(() => {
		uni.$off('shopFunctionChanged', handleShopFunctionChanged)
	})

	const setCookiesFromQueryString = (queryString) => {
		// 清除可能存在的多余空格，并根据分号分割字符串
		const pairs = queryString.split(';').map(pair => pair.trim());

		pairs.forEach(pair => {
			if (pair) {
				const [key, value] = pair.split('=', 2);
				if (key && value !== undefined) {
					// 设置 cookie，有效期可以根据需要调整
					document.cookie = encodeURIComponent(key) + '=' + encodeURIComponent(value) + '; path=/;';
				}
			}
		});
	}

	const operateData = reactive({
		td_num: 0,
		td_money: 0,
		promotion_promotion: 0,
		promotion_balance: 0
	})
	let effect = reactive({})
	const percentage = reactive({
		mealReportPercent: '',
		realMealReportPercent: ''
	})
	const postTime = ref(0)
	const againGetOperateData = (params) => {
	postTime.value++
	uni.request({
		url: 'https://waimaieapp.meituan.com/gw/bizdata/single/overview/panel',
			method: 'GET',
			data: {
				token: params.token,
				wmPoiId: params.wmPoiId,
				acctId: params.acctId,
				appType: '3',
				bizLineType: '0',
				compareType: '0',
				ignoreSetRouterProxy: 'true'
			},
			header: {
				'Content-Type': 'application/json', //自定义请求头信息
			},
			success: (res) => {
				if (res.data.code === 0) {
					res.data.data.list.forEach(item => {
						if (item.title === '有效订单') {
							operateData.td_num = item.base
						} else if (item.title === '预计收入') {
							operateData.td_money = item.base
						}
					})
				} else {
					if (postTime.value < 2) {
						setTimeout(() => {
							againGetOperateData(params)
						}, 500)
					}
				}
			}
		});
	}
	const hpTime = ref(0)
	const getHpData = (params) => {
	hpTime.value++
	uni.request({
		url: 'https://waimaieapp.meituan.com/gw/customer/comment/statistics/score/summary/single/distribution',
			method: 'GET',
			data: {
				token: params.token,
				wmPoiId: params.wmPoiId,
				acctId: params.acctId,
				dt: formatDateToYYYYMMDD(new Date())
			},
			header: {
				'Content-Type': 'application/json', //自定义请求头信息
			},
			success: (res) => {
				if (res.data.code === 0) {
					let currentDateList = res.data.data.list
					comment.favorable = currentDateList[currentDateList.length - 1].fiveNum +
						currentDateList[currentDateList.length - 1].fourNum
					comment.mid = currentDateList[currentDateList.length - 1].threeNum
				} else {
					if (hpTime.value < 2) {
						setTimeout(() => {
							getHpData(params)
						}, 500)
					}
				}
			},
			fail: (err) => {
			}
		})
	}
	const formatDateToYYYYMMDD = (date) => {
		const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0'); // getMonth() 返回值介于 0 和 11 之间
	const day = String(date.getDate()).padStart(2, '0');
	return year + '' + month + '' + day;
	}
	const comment = reactive({
		favorable: 0,
		mid: 0
	})
	const statusDesc = reactive({
		status1: '',
		status2: ''
	})
	const extractPercentages = (str) => {
		// 移除括号及其内容
		const noParenthesesStr = str.replace(/$.*?$/g, '').trim();

		// 提取百分比值的正则表达式
		const regex = /(\d+(\.\d+)?%)|(?<=回复率为)\s*(\d+(\.\d+)?)%/;

		// 执行匹配
		const match = noParenthesesStr.match(regex);

		// 返回匹配到的第一个百分比值，如果没有匹配到，则返回null
		return match ? match[0] || match[3] : null;
	}
	const getOperateData = (params) => {
		// 京东店铺暂不支持运营数据获取，直接返回
		if (payParams.shoptype == 6) {
			return
		}
		if (payParams.shoptype == 1) {
		againGetOperateData(params)
		uni.request({
			url: 'https://waimaieapp.meituan.com/ad/v4/homepage/account/info',
				method: 'GET',
				data: {
					token: params.token,
					wmPoiId: params.wmPoiId,
					acctId: params.acctId,
					platform: '0'
				},
				header: {
					'Content-Type': 'application/json', //自定义请求头信息
				},
				success: (res) => {
					if (res.data.code === 0) {
						operateData.promotion_promotion = res.data.data.total ? (res.data.data.total / 100)
							.toFixed(2) : '0.00'
						operateData.promotion_balance = res.data.data.balance ? (res.data.data.balance /
								100)
							.toFixed(2) : '0.00'
						effect = res.data.data.effect
					}
				},
				fail: (err) => {
				}
		})
		uni.request({
			url: 'https://e.waimai.meituan.com/gw/api/im/rights/v2/detail',
				method: 'GET',
				data: {
					token: params.token,
					wmPoiId: params.wmPoiId,
					acctId: params.acctId,
					region_id: params.region_id
				},
				header: {
					'Content-Type': 'application/json', //自定义请求头信息
				},
				success: (res) => {
					if (res.data.code === 0) {
						statusDesc.status1 = extractPercentages(res.data.data.rightAndRuleList[0]
							.ruleDetails[
								0].ruleDesc)
						statusDesc.status2 = extractPercentages(res.data.data.rightAndRuleList[0]
							.ruleDetails[
								1].ruleDesc)
					}
				},
				fail: (err) => {
				}
		})
		uni.request({
			url: 'https://e.waimai.meituan.com/gw/api/food/v1/report/percent/get',
				method: 'GET',
				data: {
					token: params.token,
					wmPoiId: params.wmPoiId,
					acctId: params.acctId
				},
				header: {
					'Content-Type': 'application/json', //自定义请求头信息
				},
				success: (res) => {
					if (res.data.code === 0) {
						percentage.mealReportPercent = res.data.data.mealReportPercent
						percentage.realMealReportPercent = res.data.data.realMealReportPercent
					}
				},
				fail: (err) => {
				}
			})
			getHpData(params)
	} else {
		uni.request({
			url: 'https://lsycm.alibaba.com/api/overview/shop/custom/queryShopRealtimeInfo',
				method: 'POST',
				data: {
					"shopId": office_id.value,
					"compareOption": "LAST_WEEK",
					"compareLabel": "比昨日"
				},
				header: {
					'Content-Type': 'application/json', //自定义请求头信息
					'token': params.ksid + '=' + params.shopId,
				},
				success: (res) => {
					if (res.data.code === 0) {
						elmQueryShopRealtimeInfo.value = res.data.data.cardResult
					}
				}
		})
		uni.request({
			url: 'https://app-api.shop.ele.me/alchemy/invoke?method=ConsumeActivityService.getTodayCost',
				method: 'POST',
				data: {
					"id": "F799385F0AA045DF81EDA4E301C430D6|1735554239834",
					"method": "getTodayCost",
					"service": "ConsumeActivityService",
					"params": {
						"restaurantId": params.shopId
					},
					"metas": {
						"ksid": params.ksid
					},
					"ncp": "2.0.0"
				},
				success: (res) => {
					totalAmount.value = res.data.result.totalAmount ? res.data.result.totalAmount / 100 :
						'0'
				}
		})
		uni.request({
			url: 'https://app-api.shop.ele.me/alchemy/invoke?method=wager.getAllBalance',
				method: 'POST',
				data: {
					"id": "1E05B57C0B134AB98890214501DD7BA5|1735554239833",
					"method": "getAllBalance",
					"service": "wager",
					"params": {
						"restaurantId": params.shopId
					},
					"metas": {
						"ksid": params.ksid
					},
					"ncp": "2.0.0"
				},
				success: (res) => {
					totalBalance.value = (res.data.result && res.data.result.balance) ? res.data.result
						.balance / 100 : '0'
				}
		})
		uni.request({
			url: 'https://lsycm.alibaba.com/api/service/shop/card/serviceCookingUpload',
				method: 'POST',
				data: {
					"shopId": params.shopId,
					"dateType": "day",
					"beginDate": getFormattedDate(),
					"endDate": getFormattedDate(),
					"compareOption": "YESTERDAY"
				},
				header: {
					'Content-Type': 'application/json', //自定义请求头信息
					'token': params.ksid + '=' + params.shopId,
				},
				success: (res) => {
					if (res.data.code === 0 && res.data.data.cardResult && res.data.data.cardResult
						.length) {
						serviceCookingUpload.value.cooking_upload_rate_7d = res.data.data.cardResult[0]
							.itemValue
						serviceCookingUpload.value.cooking_real_upload_rate_7d = res.data.data.cardResult[
							1].itemValue
					}
				}
		})
		uni.request({
			url: 'https://restapi.ele.me/im.api/napos/getRight?ksid=' + params.ksid + '&rstId=' + params.shopId,
				method: 'GET',
				success: (res) => {
					res.data.forEach(item => {
						if (item.rightLevel === 'GOLD') {
							currentMedal.value.gold = item.currentLevel ? '已获得' : '未获得'
						} else if (item.rightLevel === 'SILVER') {
							currentMedal.value.silver = item.currentLevel ? '已获得' : '未获得'
						}
					})
				}
			})
		}
	}
	const getYesterdayTimeRange = () => {
		// 创建一个表示当前时间的 Date 对象
		const now = new Date();

		// 创建一个新的 Date 对象表示昨天同一时刻
		const yesterday = new Date(now);
		yesterday.setDate(now.getDate() - 1);

		// 获取昨天的开始时间和结束时间
		const startOfYesterday = new Date(yesterday);
		startOfYesterday.setHours(0, 0, 0, 0); // 设置时间为当天的开始 (00:00:00.000)

		const endOfYesterday = new Date(yesterday);
		endOfYesterday.setHours(23, 59, 59, 999); // 设置时间为当天的结束 (23:59:59.999)

		// 将日期对象格式化为所需的字符串格式
		function formatDate(date) {
			return date.toISOString().replace('Z', '');
		}

		return {
			startTime: formatDate(startOfYesterday),
			endTime: formatDate(endOfYesterday)
		};
	}

	const timeRange = getYesterdayTimeRange();
	const currentMedal = ref({
		gold: '',
		silver: ''
	})
	const serviceCookingUpload = ref({
		cooking_upload_rate_7d: '',
		cooking_real_upload_rate_7d: ''
	})
	const totalAmount = ref('暂无')
	const totalBalance = ref('暂无')
	const elmQueryShopRealtimeInfo = ref({})
	const getFormattedDate = () => {
		const now = new Date();
		const year = now.getFullYear();
		const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero based
	const day = String(now.getDate() - 1).padStart(2, '0');

	return year + '' + month + '' + day;
	}
	const getShopStatus = (state) => {
		if (state === 1) {
			return '未登录';
		} else if (state === 2) {
			return '已登录';
		} else if (state === 3) {
			return '已掉线';
		} else if (state === 4) {
			return '营业中';
		} else if (state === 5) {
			return '暂停营业';
		} else if (state === 6) {
			return '上线中';
		} else if (state === 7) {
			return '已下线';
		} else {
			return 'None';
		}
	}

	const getShopDetails = async (id) => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		ShopApi.getShopDetails(id).then(data => {
			shopDetails.value = data.data
			shop_info.value = shopDetails.value.shop_info
			data_base.value = shopDetails.value.data_base
			data_dd.value = shopDetails.value.data_dd
			data_Traffic.value = shopDetails.value.data_Traffic
			data_Yesterday.value = shopDetails.value.data_Yesterday
			WorkInfo.value = shopDetails.value.WorkInfo
			AdDataV2.value = shopDetails.value.AdDataV2
		}).catch(() => {
			// uni.switchTab({
			// 	url: '/pages/shop/shop'
			// })
		}).finally(() => {
			uni.hideLoading()
		})

	}

	const toPage = (type) => {
		if (type === "IMZDHF") {
			return '/pages/service/service?shopId=' + shopId.value + '&type=' + type + '&isV2=' + isV2.value +
				'&shopType=' + payParams.shoptype
		} else if (type === "ZDHP") {
			return '/pages/answer-msg/answer-msg?shopId=' + shopId.value + '&type=' + type + '&isV2=' + isV2.value +
				'&shopType=' + payParams.shoptype
		} else if (type === "ZDCC") {
			return '/pages/out-food/out-food?shopId=' + shopId.value + '&type=' + type + '&isV2=' + isV2.value +
				'&shopType=' + payParams.shoptype
		} else if (type === "ZDTG") {
			return '/pages/smart-gold/smart-gold?shopId=' + shopId.value + '&type=' + type + '&isV2=' + isV2.value +
				'&shopType=' + payParams.shoptype
		} else if (type === "PJSS") {
			// 评价申诉配置：这里仅用于 PC 端配置，在 APP 里通过 webview 打开后台配置页
			const currentOfficeId = office_id.value || storageShopInfo.office_id || ''
			return '/pages/pjss-web/pjss-web?office_id=' + currentOfficeId
		}
	}

	const updataShopFunc = (funcInfoArray) => {
		if (!Array.isArray(funcInfoArray) || funcInfoArray.length === 0) {
			return
		}
		
		// 续费弹窗里可能传入的 index 为 -1（如京东秒送选择器单卡片），此时不能依赖 currentSaveIndex
		// 优先用当前续费功能 code 定位；否则退回到 currentSaveIndex
		const currentFuncCode = payParams?.currentFuncCode || ''
		let currentItem = null
		if (currentFuncCode) {
			currentItem = functionList.value.find(f => f?.code === currentFuncCode) || null
		}
		if (!currentItem) {
			currentItem = functionList.value[currentSaveIndex.value] || null
		}
		if (!currentItem) {
			return
		}
		
		// 获取当前功能的后端代码（用于匹配）
		const backendCode = currentItem.backendCode || currentItem.code
		const frontendCode = currentItem.code
		
		// 从 FuncInfo 数组中查找匹配的功能
		const matchedFunc = funcInfoArray.find(func => {
			// 先尝试用后端代码匹配（最优先）
			if (func.code === backendCode) {
				return true
			}
			// 再尝试用前端代码匹配
			if (func.code === frontendCode) {
				return true
			}
			// 对于京东秒送批量管理功能，后端可能返回的是完整的功能代码，也需要匹配
			// 例如：CATEGORY_ATTR 对应 CTGYPRTYMG
			if (backendCode && func.code && func.code.includes(backendCode)) {
				return true
			}
			if (frontendCode && func.code && func.code.includes(frontendCode)) {
				return true
			}
			// 后端返回的数据可能使用 FuncName（中文名称）而不是 code，需要根据功能名称匹配
			if (func.FuncName && currentItem.name) {
				// 直接匹配功能名称
				if (func.FuncName === currentItem.name) {
					return true
				}
				// 部分匹配（处理可能的名称差异）
				if (func.FuncName.includes(currentItem.name) || currentItem.name.includes(func.FuncName)) {
					return true
				}
			}
			return false
		})
		
		if (matchedFunc && matchedFunc.NewEndTime) {
			currentItem.end_time = matchedFunc.NewEndTime
			
			// 同时更新 enable 状态（如果后端返回了就用后端；否则按“未到期=开启”处理）
			if (matchedFunc.enable !== undefined) {
				currentItem.enable = matchedFunc.enable
			} else {
				try {
					const endTime = new Date(matchedFunc.NewEndTime)
					const now = new Date()
					now.setHours(0, 0, 0, 0)
					endTime.setHours(0, 0, 0, 0)
					currentItem.enable = endTime >= now
				} catch (e) {
					currentItem.enable = true
				}
			}
			
			// 更新 id（如果有）
			if (matchedFunc.id) {
				currentItem.id = matchedFunc.id
			}
			
			// 同步更新 storageShopInfo.func_enable（用于回显/缓存）
			if (storageShopInfo.func_enable && Array.isArray(storageShopInfo.func_enable)) {
				const storageFunc = storageShopInfo.func_enable.find(f => f.code === currentItem.code)
				if (storageFunc) {
					storageFunc.end_time = currentItem.end_time
					storageFunc.enable = currentItem.enable
				} else {
					storageShopInfo.func_enable.push({
						code: currentItem.code,
						enable: currentItem.enable,
						end_time: currentItem.end_time
					})
				}
				uni.setStorageSync('shopInfo', storageShopInfo)
			}
		} else {
			// 如果没找到匹配的，尝试打印日志以便调试
			console.log('未找到匹配的功能:', {
				currentItem: currentItem,
				backendCode: backendCode,
				frontendCode: frontendCode,
				currentItemName: currentItem.name,
				funcInfoArray: funcInfoArray
			})
		}
	}

	// 用于记录每个功能的请求状态，防止重复点击
	const funcRequesting = ref({})

	const changeValue = (item) => {
		// 防止重复点击：如果该功能正在请求中，则直接返回
		if (funcRequesting.value[item.code]) {
			// 恢复开关状态，确保 UI 状态一致
			const funcItem = functionList.value.find(f => f.code === item.code)
			if (funcItem) {
				funcItem.enable = !item.enable
			}
			return
		}
		
		// 根据功能代码获取功能名称
		const getFuncName = (code) => {
			const funcNameMap = {
				'ZDCC': '自动出餐',
				'IMZDHF': '自动回复',
				'ZDHP': '自动回评',
				'ZDTG': '智能推广',
				'PJSS': '评价申诉'
			}
			return funcNameMap[code] || '功能'
		}
		
		const funcName = getFuncName(item.code)
		const statusText = item.enable ? '已开启' : '已关闭'
		
		// 标记该功能正在请求中（立即标记，防止快速重复点击）
		funcRequesting.value[item.code] = true
		
		ManagementApi.enableIM({
			code: item.code,
			enable: item.enable,
			shop: shopId.value
		}).then(res => {
			// 检查响应是否成功（兼容不同的响应格式）
			const isSuccess = (res && (res.code === 200 || res.Success === true || (res.data && (res.data.code === 200 || res.data.Success === true))))
			
			if (isSuccess) {
				// 操作成功，显示 toast
				uni.showToast({
					title: `${funcName}${statusText}`,
					icon: 'success',
					duration: 3000,
					mask: false
				})
				
				// 更新本地 storageShopInfo 中的功能状态
				if (storageShopInfo.func_enable && Array.isArray(storageShopInfo.func_enable)) {
					const funcItem = storageShopInfo.func_enable.find(f => f.code === item.code)
					if (funcItem) {
						funcItem.enable = item.enable
					} else {
						storageShopInfo.func_enable.push({
							code: item.code,
							enable: item.enable,
							end_time: item.end_time || ''
						})
					}
					// 保存到本地存储
					uni.setStorageSync('shopInfo', storageShopInfo)
				}
				
				// 向店铺列表等页面广播功能开关变化事件，保持各页面开关同步
				try {
					uni.$emit('shopFunctionChanged', {
						shopId: shopId.value || storageShopInfo.id,
						code: item.code,
						enable: item.enable
					})
				} catch (e) {
					// 忽略事件广播错误，避免影响主流程
				}
				
				// 发送事件通知店铺列表页面更新状态
				uni.$emit('shopFunctionChanged', {
					shopId: shopId.value,
					code: item.code,
					enable: item.enable
				})
				// 请求成功完成后，延迟清除请求状态标记（防止快速重复点击）
				setTimeout(() => {
					funcRequesting.value[item.code] = false
				}, 1500) // 1.5秒后才允许再次点击
			} else {
				// 操作失败时，恢复开关状态
				const funcItem = functionList.value.find(f => f.code === item.code)
				if (funcItem) {
					funcItem.enable = !item.enable
				}
				const errorMsg = (res && (res.message || res.Msg || res.data?.message || res.data?.Msg)) || '操作失败'
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 3000,
					mask: false
				})
				// 操作失败，立即清除请求状态标记
				funcRequesting.value[item.code] = false
			}
		}).catch(err => {
			// 操作失败时，恢复开关状态
			const funcItem = functionList.value.find(f => f.code === item.code)
			if (funcItem) {
				funcItem.enable = !item.enable
			}
			// 提取错误信息
			let errorMsg = '操作失败，请重试'
			if (err && err.message) {
				errorMsg = err.message
			} else if (err && err.response && err.response.data) {
				errorMsg = err.response.data.message || err.response.data.Msg || errorMsg
			}
			uni.showToast({
				title: errorMsg,
				icon: 'none',
				duration: 3000,
				mask: false
			})
			// 操作失败，立即清除请求状态标记
			funcRequesting.value[item.code] = false
		})
	}


	// 工具函数：判断是否为京东团购
	const isJingdongGroupBuy = (shopType) => {
		const shopTypeNum = Number(shopType) || 0
		return shopTypeNum === 10 || shopTypeNum === 1001
	}
	
	// 判断是否为京东秒送
	const isJingdongMiaosong = (shopType) => {
		const shopTypeNum = Number(shopType) || 0
		return shopTypeNum === 6
	}
	
	// 工具函数：将前端 shopType 映射为后端 API 需要的类型
	const mapShopTypeForApi = (shopType) => {
		const rawShopType = Number(shopType)
		if (rawShopType === 9) return 1000  // 美团团购
		if (rawShopType === 10) return 1001 // 京东团购
		return rawShopType
	}
	
	// 工具函数：获取最新的功能启用状态
	const getLatestFuncEnable = async (id) => {
		// 优先使用从列表页传递过来的 func_enable（这是最新的状态）
		if (storageShopInfo.func_enable && Array.isArray(storageShopInfo.func_enable) && storageShopInfo.func_enable.length > 0) {
			return storageShopInfo.func_enable
		}
		
		// 如果列表页没有传递数据，才调用 API 获取
		try {
			const shopDetailsRes = await ShopApi.getShopDetails(id)
			if (shopDetailsRes && shopDetailsRes.code === 200 && shopDetailsRes.data && shopDetailsRes.data.func_enable) {
				const funcEnable = shopDetailsRes.data.func_enable
				storageShopInfo.func_enable = funcEnable
				return funcEnable
			}
		} catch (e) {
			// API 调用失败，返回空数组
		}
		return []
	}
	
	// 工具函数：匹配功能状态
	const matchFuncWithEnable = (func, latestFuncEnable) => {
		// 先尝试用后端 code 匹配（如果存在）
		if (func.backendCode) {
			const matched = latestFuncEnable.find(f => f.code === func.backendCode)
			if (matched) {
				return {
					...func,
					enable: matched.enable !== undefined ? matched.enable : false,
					end_time: matched.end_time || '',
					id: matched.id || null
				}
			}
		}
		
		// 尝试用前端 code 匹配（兼容性）
		const matchedByFrontendCode = latestFuncEnable.find(f => f.code === func.code)
		if (matchedByFrontendCode) {
			return {
				...func,
				enable: matchedByFrontendCode.enable !== undefined ? matchedByFrontendCode.enable : false,
				end_time: matchedByFrontendCode.end_time || '',
				id: matchedByFrontendCode.id || null
			}
		}
		
		return func
	}
	
	// 常量：京东团购功能定义
	const JD_GROUP_FUNCS = [
		{
			code: 'JD_GROUP_OPEN',
			name: '开通团购服务',
			backendCode: 'SIGNTUANGOU',
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'JD_GROUP_BIND',
			name: '关联餐饮商品',
			backendCode: 'PUBLISHDRAFTTUANGOU',
			enable: false,
			end_time: '',
			id: null
		}
	]
	
	// 常量：京东秒送批量管理功能定义
	// 注意：后端返回的代码与前端定义的 backendCode 需要一致
	// 后端返回：CTGYPRTYMG, BATCHUPDATEPRICE, BATCHUPDATESTOCK, BATCHUPDATENAME, BATCHUPDATESTATE
	const JD_MIAOSONG_BATCH_FUNCS = [
		{
			code: 'CATEGORY_ATTR',
			name: '类目属性批量设置',
			backendCode: 'CTGYPRTYMG', // 后端返回的代码
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'BATCH_PRICE',
			name: '批量改价',
			backendCode: 'BATCHUPDATEPRICE', // 后端返回的代码是 BATCHUPDATEPRICE，不是 BATCH_PRICE
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'BATCH_STOCK',
			name: '批量改库存',
			backendCode: 'BATCHUPDATESTOCK', // 后端返回的代码是 BATCHUPDATESTOCK，不是 BATCH_STOCK
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'BATCH_NAME',
			name: '批量改商品名',
			backendCode: 'BATCHUPDATENAME', // 后端返回的代码是 BATCHUPDATENAME，不是 BATCH_NAME
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'BATCH_STATUS',
			name: '批量改上下架',
			backendCode: 'BATCHUPDATESTATE', // 后端返回的代码是 BATCHUPDATESTATE，不是 BATCH_STATUS
			enable: false,
			end_time: '',
			id: null
		}
		,
		{
			code: 'CREATEFREIGHTPROMO',
			name: '创建减配送费活动',
			backendCode: 'CREATEFREIGHTPROMO',
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'CREATEBILLIONSUBSIDYCOUPON',
			name: '创建百亿补贴活动',
			backendCode: 'CREATEBILLIONSUBSIDYCOUPON',
			enable: false,
			end_time: '',
			id: null
		}
		,
		{
			code: 'CREATEINSHOPCOUPON',
			name: '店内领券活动创建',
			backendCode: 'CREATEINSHOPCOUPON',
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'CREATEMANJIAN',
			name: '创建满减活动',
			backendCode: 'CREATEMANJIAN',
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'CREATEBRANDMEALCARD',
			name: '创建品牌饭卡',
			backendCode: 'CREATEBRANDMEALCARD',
			enable: false,
			end_time: '',
			id: null
		},
		{
			code: 'UPDATESTOREBUSINESSTIME',
			name: '设置营业状态及营业时间',
			backendCode: 'UPDATESTOREBUSINESSTIME',
			enable: false,
			end_time: '',
			id: null
		}
	]
	
	const getShopManagement = async (id) => {
		functionList.value = []
		heighLightList.value = []

		try {
			const shopTypeNum = Number(payParams.shoptype) || 0
			
			// 京东团购（10 或 1001）：直接设置两个功能，不调用后端接口
			if (isJingdongGroupBuy(shopTypeNum)) {
				const latestFuncEnable = await getLatestFuncEnable(id)
				
				// 从 latestFuncEnable 中匹配功能状态
				functionList.value = JD_GROUP_FUNCS.map(func => matchFuncWithEnable(func, latestFuncEnable))
				
				heighLightList.value = []
				return
			}
			
			// 其他平台：正常调用后端接口
			const latestFuncEnable = await getLatestFuncEnable(id)

		const data = await ManagementApi.getShopFuncList({
			shopType: payParams.shoptype
		})
			
			if (!data || !data.data) {
				return
			}
			
		let allListCopy = data.data;

		const allList = allListCopy.map((item) => {
			const func = latestFuncEnable?.find(i => i.code === item.code)
			if (func) {
				return {
					...item,
					enable: func.enable !== undefined ? func.enable : false,
					end_time: func.end_time || item.end_time || '',
					id: func.id || item.id || null
				}
			}
			// 如果没有找到，使用默认值
			return {
				...item,
				enable: false,
				end_time: item.end_time || '',
				id: item.id || null
			}
		})
		// 定义功能显示顺序（出餐、自动回复、自动回评、智能推广、评价申诉）
		const funcDisplayOrder = ["ZDCC", "IMZDHF", "ZDHP", "ZDTG", "PJSS"]
		
		// 从 allList 中筛选出支持的功能，并按照定义的顺序排列
		// 只显示 allList 中实际存在的功能（API 已经根据店铺类型过滤过了）
		functionList.value = funcDisplayOrder
			.map(code => allList.find(f => f.code === code))
			.filter(item => item !== undefined) // 只保留存在的功能，不显示不支持的功能
		
		// 京东秒送（shopType=6）：在基础功能列表最下方添加5个批量管理功能
		if (isJingdongMiaosong(shopTypeNum)) {
			const batchFuncs = JD_MIAOSONG_BATCH_FUNCS.map(func => matchFuncWithEnable(func, latestFuncEnable))
			functionList.value = [...functionList.value, ...batchFuncs]
			// 初始化京东秒送批量功能选择器默认选项（优先选择第一个可用功能）
			const firstEnabledIndex = jdBatchFuncList.value.findIndex(item => item?.enable)
			if (firstEnabledIndex >= 0) {
				jdBatchSelectedIndex.value = firstEnabledIndex
			} else {
				jdBatchSelectedIndex.value = 0
			}
		}
		
		// allList.forEach(item => {
		// 	if (item.code === "IMZDHF") {
		// 		functionList.value[1] = item
		// 	} else if (item.code === "ZDHP") {
		// 		functionList.value[2] = item
		// 	} else if (item.code === "ZDCC") {
		// 		functionList.value[0] = item
		// 	} else if (item.code === "ZDTG") {
		// 		functionList.value[3] = item
		// 	} else if (item.code === "CPDT") {
		// 		heighLightList.value.push(item)
		// 	}
		// })
		// 根据店铺类型过滤功能列表
		// 支持的微信推送的店铺类型：1=美团餐饮, 3=美团闪购, 6=京东到家
		// 不支持的店铺类型：2=淘宝闪购外卖, 4=美团医药, 5=淘宝闪购零售, 7=抖音即时零售
		// shopTypeNum 已在函数开头声明，这里直接使用
		const supportedWxPushShopTypes = [1, 3, 6]
		const isWxPushSupported = supportedWxPushShopTypes.includes(shopTypeNum)
		
		heighLightList.value = [
			// 只有支持的店铺类型才显示门店推送卡片
			...(isWxPushSupported ? [{
					path: '/pages/wx-push/wx-push',
					img: "../../static/shop/icon_051a.png",
					name: '门店推送',
					code: 'WXPUSH'
			}] : []),
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_002a.png",
				name: '店铺复制'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_003a.png",
				name: '同行店铺复制'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_004a.png",
				name: '店铺复制'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_005a.png",
				name: '店铺logo'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_006a.png",
				name: '店铺招牌'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_007a.png",
				name: '店铺海报'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_008a.png",
				name: '门头视频'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_009a.png",
				name: '商圈分析'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_010a.png",
				name: '同行店铺调研'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_011a.png",
				name: '菜品分析'
			},
			{
				path: '/pages/beautify/beautify',
				img: "../../static/shop/icon_012a.png",
				name: '经营日报'
			}
		]
		// 仅展示亮点区前 N 项（当前仅可能含「门店推送」）
		heighLightList.value.length = isWxPushSupported ? 1 : 0
		} catch (error) {
			uni.showToast({
				title: '获取功能列表失败',
				icon: 'none',
				duration: 2000
			})
		}
	}

	// 关闭全功能购买的时候
	const closeAuthGoodsVisibleHandler = () => {
		authGoodsVisible.value = false
	}
	const addMoney = async (item, index) => {
		currentSaveIndex.value = index
		isFullPopupPlan.value = false
		
		const shopTypeNum = Number(payParams.shoptype) || 0
		const isJdGroupFunc = isJingdongGroupBuy(shopTypeNum) && (item.code === 'JD_GROUP_OPEN' || item.code === 'JD_GROUP_BIND')
		const isJdMiaosongBatchFunc = isJingdongMiaosong(shopTypeNum) && JD_MIAOSONG_BATCH_FUNCS.some(f => f.code === item.code)
		
		// 京东团购的两个功能需要使用关键词模式
		if (isJdGroupFunc) {
			payParams.pricetitle = item.name
			payParams.isKeyWord = true
			// 设置当前功能代码，用于续费弹窗只显示当前功能
			payParams.currentFuncCode = item.code
		} else if (isJdMiaosongBatchFunc) {
			// 京东秒送批量管理功能：使用关键词模式，priceTitle 使用功能名称
			payParams.pricetitle = item.name
			payParams.isKeyWord = true
			// 设置当前功能代码，用于续费弹窗只显示当前功能
			payParams.currentFuncCode = item.code
		} else if (item.code === 'WXPUSH') {
			// 微信推送功能使用统一的功能名称
			payParams.pricetitle = '微信推送_月'
			payParams.isKeyWord = false
			payParams.currentFuncCode = item.code
		} else {
			payParams.pricetitle = item.name + '_月'
			payParams.isKeyWord = false
			payParams.currentFuncCode = item.code
		}
		
		// 先加载数据，再显示弹窗
		try {
			await getPayList()
			if (payList.value && payList.value.length > 0) {
				authGoodsVisible.value = true
			} else {
				uni.showToast({
					title: '暂无可用规格',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			uni.showToast({
				title: '获取规格列表失败',
				icon: 'none',
				duration: 2000
			})
		}
	}
	const handleClose = () => {
		authGoodsVisible.value = false
	}
	const setendtime = (num) => {
		authGoodItem1.value.endTime = num
	}

	const handleClickLeft = () => {
		if (isV2.value) {
			// 使用 navigateBack 返回到上一页，保持滚动位置
			uni.navigateBack({
				delta: 1
			})
		} else {
			uni.switchTab({
				url: '/pages/shop/shop',
				animationType: 'slide-in-left',
			})
		}
	}
	const toBeauty = (item) => {
		if(item.name=='门店推送'){
			// 根据店铺类型判断是否支持微信推送
			const shopType = payParams.shoptype
			// 饿了么店铺（shopType=2或5）暂不支持微信推送
			if (shopType == 2 || shopType == 5) {
				uni.showToast({
					title: '暂不支持微信推送',
					icon: 'none',
					duration: 2000
				})
				return
			}
			// 其他店铺类型（如京东shopType=6）正常跳转
			// 传递店铺ID、店铺名称等信息，用于自动搜索定位
			const shopName = storageShopInfo.name || ''
			uni.navigateTo({
				url:'/pages/wx-push/wx-push?id='+ shopId.value + '&office_id=' + office_id.value + '&shopType=' + payParams.shoptype+'&code=' + item.code + '&shopName=' + encodeURIComponent(shopName) + '&autoSearch=true'
			})
		}
		// else{
		// 	uni.navigateTo({
		// 		url: '/pages/high-light/high-light?id=' + shopId.value + '&shopType=' + payParams.shoptype +
		// 			'&code=' + item.code
		// 	})
		// }
		
	}
	// 处理全功能激活按钮点击
	const handleFullFunctionClick = () => {
		if (!payParams.shoptype) {
			uni.showToast({
				title: '店铺类型未设置',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 京东团购和京东秒送：跳转到任务查询页面
		if (isJingdongGroupBuy(payParams.shoptype) || isJingdongMiaosong(payParams.shoptype)) {
			uni.navigateTo({
				url: `/pages/shop-management/task-query?shopType=${payParams.shoptype}&shopId=${shopId.value || ''}`
			})
			return
		}
		
		// 在调用 onPopupHandler 之前，先确保参数正确设置
		payParams.pricetitle = '全功能|店铺多开_月'
		payParams.isKeyWord = true
		isFullPopupPlan.value = true
		
		onPopupHandler(1).catch(err => {
			// 错误已在 onPopupHandler 中处理
		})
	}
	
	const onPopupHandler = async (num) => {
		if (num === 1) {
			isFullPopupPlan.value = true
			// 全功能激活时，使用正确的 pricetitle 格式：'全功能|店铺多开_月'
			payParams.pricetitle = '全功能|店铺多开_月'
			payParams.isKeyWord = true
		} else {
			isFullPopupPlan.value = false
		}
		
		// 检查必要参数
		if (!payParams.shoptype) {
			uni.showToast({
				title: '店铺类型未设置',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 先加载数据，再显示弹窗
		try {
			await getPayList()
			
			if (payList.value && payList.value.length > 0) {
				authGoodsVisible.value = true
			} else {
				uni.showToast({
					title: '暂无可用规格',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			uni.showToast({
				title: '获取规格列表失败',
				icon: 'none',
				duration: 2000
			})
		}
	}

	const subscribe = (type) => {
		if (type === 'success') {
			authGoodsVisible.value = false
			if (shopId.value) {
				getShopManagement(shopId.value)
			}
		}
	}
	
	// 监听弹窗打开状态，确保数据加载
	watch(() => authGoodsVisible.value, (newVal, oldVal) => {
		if (newVal && (!payList.value || payList.value.length === 0)) {
			// 根据 isFullPopupPlan 设置参数
			if (isFullPopupPlan.value) {
				payParams.pricetitle = '全功能|店铺多开_月'
				payParams.isKeyWord = true
			}
			getPayList().catch(err => {
				// 错误已在 getPayList 中处理
			})
		}
	}, { immediate: false })

	const getPayList = async () => {
		if (!payParams.shoptype) {
			uni.showToast({
				title: '店铺类型未设置',
				icon: 'none',
				duration: 2000
			})
			return
		}

		if (!payParams.pricetitle) {
			uni.showToast({
				title: '规格名称未设置',
				icon: 'none',
				duration: 2000
			})
			return
		}

		payList.value = []

		try {
			const apiShopType = mapShopTypeForApi(payParams.shoptype)
			const isKeyWord = payParams.isKeyWord !== undefined ? payParams.isKeyWord : false
			const quotes = await getRenewQuoteList(apiShopType, payParams.pricetitle || '', isKeyWord)
			payList.value = quotes.map(mapPayQuoteToSpecRow)

			if (isFullPopupPlan.value && (!payList.value || payList.value.length === 0)) {
				uni.showToast({
					title: '无法获取规格列表，请稍后重试',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			payList.value = []
			uni.showToast({
				title: '获取规格列表失败，请稍后重试',
				icon: 'none',
				duration: 2000
			})
		}
	}
</script>

<style scoped lang="scss">
	.manage {
		min-height: 100vh;
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;

		.hander {
			width: 100%;
			display: flex;
			flex-direction: row;
			padding: 30rpx;
			box-sizing: border-box;

			.handerLeft {
				display: flex;
				flex-direction: column;
				align-items: center;
				margin-right: 10px;

				.logoIMg {
					border-radius: 4px;
				}

				.yyz {
					// width: 121rpx;
					height: 34rpx;
					background: #FFBE01;
					border-radius: 17rpx;
					display: flex;
					align-items: center;
					justify-content: center;
					padding: 0 10rpx;

					.yyzLeft {
						width: 16rpx;
						height: 16rpx;
						background: #FFFFFF;
						border-radius: 100%;
						margin: 0 8rpx;
					}
				}
			}

			.handerRight {
				display: flex;
				flex-direction: column;
				width: calc(100% - 55px);

				.rightOne {
					display: flex;
					flex-direction: row;
					align-items: flex-start;
					justify-content: space-between;
					width: 100%;
					margin-bottom: 5px;

					.shopName {
						color: #333333;
						display: flex;
						align-items: flex-start;
						font-size: 28rpx;
						color: #333333;
						width: calc(100% - 15px);

						.shop-name {
							width: calc(100% - 30px);
						}

						image {
							width: 15px;
							height: 15px;
							margin-right: 8px;
							margin-top: 3px;
						}
					}

					.shopSq {
						display: flex;
						flex-direction: row;

						.sqText {
							width: 120rpx;
							height: 34rpx;
							background: linear-gradient(180deg, #FFE9EC 0%, #FAF4F5 100%), #FFBE01;
							border-radius: 6rpx;
							font-weight: 400;
							font-size: 24rpx;
							color: #F81C3A;
							text-align: center;
							margin-right: 20rpx;
						}

						.sqBut {
							width: 120rpx;
							height: 34rpx;
							background: #FFFFFF;
							border-radius: 17rpx;
							border: 1rpx solid #22CC00;
							font-weight: 400;
							font-size: 24rpx;
							color: #22CC00;
							text-align: center;
						}
					}
				}

				.rightTwo {
					display: flex;
					flex-direction: row;
					align-items: center;

					.shopTime {
						font-weight: 400;
						font-size: 24rpx;
						color: #666666;
						margin-right: 20rpx;
					}

					.shopId {
						font-weight: 400;
						font-size: 24rpx;
						color: #666666;
					}
				}
			}
		}

		.endTime {
			width: 690rpx;
			height: 80rpx;
			background: #FDF9F9;
			border-radius: 14rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			box-sizing: border-box;


			.endTime {
				width: 34rpx;
				height: 34rpx;
				margin-right: 10rpx;
			}

			.timeText {
				font-weight: 400;
				font-size: 28rpx;
				color: #666666;
				margin-right: 20rpx;
			}

			.timeYear {
				font-weight: 600;
				font-size: 28rpx;
				color: #2CCA87;
				margin-right: 20rpx;
			}

			.timeBut {
				width: 144rpx;
				height: 60rpx;
				background: #2CCA87;
				border-radius: 14rpx;
				font-weight: 500;
				font-size: 28rpx;
				color: #FFFFFF;
				text-align: center;
				line-height: 60rpx;
			}
		}

		.dataAll {
			display: flex;
			flex-direction: column;
			padding: 0 30rpx;
			width: 100%;
			box-sizing: border-box;
			margin-top: 16px;

			.dataOne {
				display: flex;
				flex-direction: row;
				align-items: flex-end;

				.dataTitle {
					font-weight: 600;
					font-size: 30rpx;
					color: #333333;
				}

				.datatag {
					font-weight: 400;
					font-size: 12px;
					color: #999999;
				}
			}

			.dataBox {
				display: flex;
				flex-direction: column;
				margin-top: 15rpx;

				.boxTwo {
					margin-top: 20rpx;
				}

				.boxOne {
					display: flex;
					flex-direction: row;
					justify-content: space-between;

					.boxItem {
						width: calc((100% - 10px) / 2);
						height: 163rpx;
						border-radius: 14rpx;
						display: flex;
						flex-direction: column;
						align-items: center;
						justify-content: center;
						background: url("@/static/shop/item-bg-mt.png") no-repeat;
						background-size: 100% 100%;
						overflow: hidden;

						.itemText {
							font-weight: 400;
							font-size: 14px;
							color: #333333;
						}

						.itemNum {
							font-weight: 600;
							color: #333333;
							font-weight: 600;
							font-size: 22px;
							margin-bottom: 5px;
						}
					}

					.is-elm-box {
						background: url("@/static/shop/item-bg-elm.png") no-repeat;
						background-size: 100% 100%;

						.itemText,
						.itemNum {
							color: #ffffff;
						}
					}

					.is-jd-box {
						background: linear-gradient(135deg, #E1251B 0%, #FF6B5A 100%);
						border-radius: 12rpx;

						.itemText,
						.itemNum {
							color: #ffffff;
						}
					}
				}
			}
		}

		.brightFunction {
			display: flex;
			flex-direction: column;
			margin-top: 20rpx;
			width: 750rpx;
			padding: 0 30rpx;
			box-sizing: border-box;

			.functionTitle {
				font-weight: 600;
				font-size: 30rpx;
				color: #333333;
				margin-bottom: 30rpx;
			}

			.functionList {
				display: flex;
				flex-wrap: wrap;

				.functionItem {
					display: flex;
					flex-direction: column;
					width: 25%;
					align-items: center;
					margin-bottom: 44rpx;

					.itemImg {
						width: 70rpx;
						height: 70rpx;
					}

					.itemText {
						font-weight: 400;
						font-size: 26rpx;
						color: #1F1F1F;
						margin-top: 20rpx;
					}
				}
			}
		}

		.baseFunction {
			display: flex;
			flex-direction: column;
			width: 100%;
			box-sizing: border-box;
			padding: 0 30rpx;

			.baseTitle {
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: space-between;
				margin-bottom: 20rpx;
				padding: 0 30rpx;

				.titleText {
					font-weight: 600;
					font-size: 30rpx;
					color: #333333;
					margin-right: 15rpx;
				}

				.titleTag {
					font-weight: 400;
					font-size: 22rpx;
					color: #999999;
				}
			
				.fullFunctionBtn {
					background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
					color: #ffffff;
					padding: 10rpx 30rpx;
					border-radius: 30rpx;
					font-size: 24rpx;
					font-weight: 500;
				}
			}

			.baseList {
				display: flex;
				flex-direction: column;
			}

			/* 京东秒送批量功能选择器样式 */
			.jd-batch-section {
				width: 100%;
				margin-top: 24rpx;
			}

			.jd-batch-selector-wrapper {
				margin-bottom: 16rpx;
				padding: 0 8rpx;
				display: flex;
				align-items: center;
			}

			.jd-batch-selector-label {
				font-size: 26rpx;
				color: #333;
				margin-right: 16rpx;
				white-space: nowrap;
			}

			.jd-batch-selector {
				flex: 1;
				height: 64rpx;
				border-radius: 32rpx;
				border: 1px solid #e5e5e5;
				padding: 0 24rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				background-color: #ffffff;
			}

			.jd-batch-selector-text {
				font-size: 26rpx;
				color: #333333;
			}

			.jd-batch-selector-arrow {
				font-size: 22rpx;
				color: #999999;
			}

			.jd-batch-card-wrapper {
				width: 100%;
			}
		}
	}

	::v-deep .navbar-main {
		background-color: #FFC402;
	}

	::v-deep .is-elm {
		background-color: #0492FA;

		.wd-navbar__arrow,
		.wd-navbar__text,
		.wd-navbar__title {
			color: #ffffff;
		}
	}

	::v-deep .is-jd {
		background-color: #E1251B;

		.wd-navbar__arrow,
		.wd-navbar__text,
		.wd-navbar__title {
			color: #ffffff;
		}
	}

	.setting {
		width: 15px;
		height: 15px;
		margin-top: 3px;
	}

	.yyzText {
		font-weight: 400;
		font-size: 24rpx;
		color: #ECB72D;
		padding: 0 15rpx;
		border-radius: 8rpx;
		border: 1px solid #ECB72D;
		height: 20px;
		line-height: 20px;
		margin-right: 10px;
	}

	.is-elm-yyz {
		color: #0492FA;
		border: 1px solid #0492FA;
	}

	.is-jd-yyz {
		color: #E1251B;
		border: 1px solid #E1251B;
	}

	.shop-msg {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx 16px;
		border-bottom: 1px solid #E7E7E7;

		.go-shop {
			display: inline-block;
			height: 20px;
			background: #ECB72D;
			border-radius: 4px;
			padding: 0 8rpx;
			font-weight: 400;
			font-size: 24rpx;
			color: #FFFFFF;
			line-height: 20px;
		}

		.is-elm-shop {
			background: #0492FA;
		}

		.is-jd-shop {
			background: #E1251B;
		}

		.shopId {
			font-weight: 400;
			font-size: 24rpx;
			color: #999999;
			line-height: 20px;
		}

		.address {
			font-weight: 400;
			font-size: 24rpx;
			display: flex;
			align-items: center;
			color: #999999;
			line-height: 20px;

			image {
				margin-right: 3px;
				width: 12px;
				height: 12px;
			}
		}

		.shopSq {
			font-weight: 400;
			font-size: 24rpx;
			color: #2BCE37;
			line-height: 20px;
			display: flex;
			align-items: center;

			.sqText,
			.sqBut {
				color: #F81C3A;
			}

			.sqBut {
				margin-left: 10rpx;
			}


			image {
				margin-right: 3px;
				width: 12px;
				height: 12px;
			}
		}
	}

	.que-img {
		width: 14px;
		height: 14px;
	}

	::v-deep .wd-popup--center {
		width: 90%;
	}

	.pop-title {
		font-weight: 500;
		font-size: 34rpx;
		color: #333333;
		margin: 40rpx 0;
		text-align: center;
	}

	.p-title {
		text-align: center;
	}

	.pop-main {
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx 40rpx;

		.bin-num {
			font-weight: 400;
			font-size: 26rpx;
			color: #999999;
			display: flex;
			align-items: center;

			text {
				color: #333333;
			}

			image {
				margin-left: 20rpx;
				margin-top: 3px;
			}
		}

		.pop-table {
			width: 100%;
			border-radius: 12rpx;
			margin-top: 30rpx;
			overflow: hidden;
			font-weight: 400;
			font-size: 24rpx;
			color: #666666;

			.table-header {
				background-color: #ECECEC;
				display: flex;
				align-items: center;
				width: 100%;
				box-sizing: border-box;
				padding: 0 30rpx;

			}

			.table-main {
				background-color: #F2F2F2;
				box-sizing: border-box;
				padding: 0 30rpx;
				height: 200rpx;
				overflow-y: scroll;

				.table-item {
					display: flex;
					align-items: center;
					width: 100%;
				}
			}

			.header-row-1 {
				width: 35%;
				height: 80rpx;
				line-height: 80rpx;
			}

			.header-row-2 {
				width: 45%;
				height: 80rpx;
				line-height: 80rpx;
			}

			.header-row-3 {
				width: 20%;
				height: 80rpx;
				line-height: 80rpx;
				text-align: center;
			}

			.header-row-4 {
				color: #FFC402;
			}

			.header-row-5 {
				color: #0492FA;
			}

			.header-row-6 {
				color: #E1251B;
			}
		}

		.shop-repair {
			margin-top: 40rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.repair-left {
				font-weight: 400;
				font-size: 30rpx;
				color: #333333;
			}
		}

		.pop-input {
			display: flex;
			align-items: center;
			justify-content: space-between;
			margin-top: 30rpx;

			.pop-input-title {
				width: 140rpx;
				font-family: PingFang SC;
				font-weight: 400;
				font-size: 26rpx;
				color: #333333;
				line-height: 80rpx;
			}

			.pop-input-main {
				width: calc(100% - 140rpx);
				height: 80rpx;
				background: #FFFFFF;
				border-radius: 8rpx;
				border: 1px solid #DFDFDF;
				box-sizing: border-box;
				padding: 0 20rpx;
				display: flex;
				align-items: center;
				justify-content: center;
			}
		}

		.save-btn {
			margin-top: 40rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;

			.btn {
				width: 48%;
				height: 80rpx;
				border-radius: 8rpx;
				font-weight: 400;
				font-size: 30rpx;
				text-align: center;
				line-height: 80rpx;
			}

			.btn-cancel {
				background-color: #DDDDDD;
				color: #333333;
			}

			.btn-save {
				background-color: #FFC402;
				color: #FFFFFF;
			}

			.is-elm-btn {
				background-color: #0492FA;
			}

			.is-jd-btn {
				background-color: #E1251B;
			}
		}
	}

	.bind-container {
		width: 100%;
		box-sizing: border-box;
		padding: 40rpx 30rpx;

		.bind-title {
			font-weight: 500;
			font-size: 34rpx;
			color: #333333;
			margin-bottom: 36rpx;
			text-align: center;
		}

		.bind-main {
			font-weight: 500;
			font-size: 26rpx;
			color: #666666;
			line-height: 2;
		}
	}

	::v-deep .wd-popup--bottom {
		border-radius: 30rpx 30rpx 0 0;
	}

	.popup-box {
		padding: 30rpx 50rpx;
		position: relative;
		width: 100%;
		height: 100%;
		box-sizing: border-box;

		.button-login {
			color: #1F1F1F;
			font-size: 34rpx;
			width: 100%;
			height: 90rpx;
			background: linear-gradient(90deg, #F7E373, #F5C568);
			border-radius: 50rpx;
			line-height: 90rpx;
			text-align: center;
			margin-left: auto;
			margin-right: auto;
			margin-top: 120rpx;
		}

		.p-dec {
			font-size: 26rpx;
			font-weight: 400;
			color: #999999;
			line-height: 32rpx;
			text-align: center;
			margin-top: 8rpx;
		}

		.btn-box {
			margin-top: 40rpx;

			.ipt {
				background: #F5F8F7;
				padding: 10rpx;
				width: 70%;
			}

			.left-b {
				width: 310rpx;
				height: 198rpx;
				background: #F5F8F7;
				border-radius: 35rpx;
				text-align: center;

				.b-img {
					width: 90rpx;
					height: 90rpx;
					margin: 30rpx 0 10rpx;
					background-color: #F5C568;
					border-radius: 50%;
				}

				.b-img1 {
					background-color: #59acf8;
				}
			}
		}
	}
	
	/* 缩放按钮样式 */
	/* #ifdef APP-PLUS */
	.zoom-controls {
		position: fixed !important;
		right: 20rpx !important;
		bottom: 180rpx !important;
		z-index: 999999 !important;
		pointer-events: auto !important;
		display: flex !important;
		flex-direction: row !important;
		align-items: center !important;
	}
	
	.zoom-tip {
		margin-right: 16rpx !important;
		padding: 8rpx 16rpx !important;
		background-color: rgba(0, 0, 0, 0.7) !important;
		border-radius: 8rpx !important;
		max-width: 450rpx !important;
		font-size: 22rpx !important;
		color: #fff !important;
		line-height: 1.5 !important;
		text-align: right !important;
		word-break: break-all !important;
		white-space: normal !important;
	}
	
	.zoom-btn {
		width: 60rpx !important;
		height: 60rpx !important;
		background-color: rgba(0, 0, 0, 0.8) !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		pointer-events: auto !important;
		position: relative !important;
		z-index: 999999 !important;
		flex-shrink: 0 !important;
	}
	
	.zoom-icon {
		width: 32rpx !important;
		height: 32rpx !important;
	}
	
	.zoom-icon-black {
		filter: brightness(0) !important;
	}
	
	.zoom-btn-minus {
		margin-right: 24rpx !important;
	}
	
	.zoom-btn-plus {
		margin: 0 !important;
	}
	/* #endif */
</style>