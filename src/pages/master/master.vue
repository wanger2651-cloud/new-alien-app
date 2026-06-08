<template>
	<view class="master" :style="{paddingTop: systemBarHeight + 'px'}">
		<image src="@/static/shop/shopBg-3.png" class="w-[750rpx] h-[400rpx]  top-0 z-10 top_img" mode=""></image>
		<view class="master_header fixed  z-10">
			<view class="user_img">
				<view style="width: calc(100% - 100rpx);overflow: hidden;padding: 0 20rpx;">
					<wd-notice-bar :text="scrollText" prefix="warn-bold" />
				</view>

				<view class="header-actions">
					<view class="service-action" @click="openOnlineService">客服</view>
					<view style="width: 40rpx" @click="openLog">
						<image src="@/static/shop/m_info.png" class="img2"></image>
					</view>
				</view>

			</view>
			<view class="user_info fixed  z-10">
				<view class=" master_flex_box master_flex">
					<view class="item_box box box1" v-for="(item, index) in todayList" :key="index">
						<view class="user_title">
							{{ item.title }}
						</view>
						<view class="master_flex item_info">
							<view class="">
								<span class="font-weight_b">{{ Math.abs(item.count || 0) }}</span>{{ item.unit || '人' }}
							</view>
							<view class="font-right">
								全部<span>{{ Math.abs(item.total || 0) }}</span>{{ item.unit || '人' }}
							</view>
						</view>
						<view class="info_bottom master_flex">
							<span>相较于昨日</span>
							<span>{{ Math.abs(item.of_yday || 0) }}<span class="trend_icon">
								<image src="@/static/master/icon_up.png" class="trend_img"></image>
								<!-- <image src="@/static/master/icon_down.png" v-else class="trend_img"></image> -->
							</span></span>
						</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 快捷入口 -->
		<view class="quick-entry contains">
			<view class="quick-entry_box contains_box">
				<view class="title">快捷功能</view>
				<view class="quick-entry-list">
					<view class="quick-entry-wrapper" v-for="(item, index) in quickEntryList" :key="index">
						<view class="quick-entry-item" @click="handleQuickEntry(item)">
							<image src="@/static/user/jihu-logo.png" class="quick-entry-icon" mode="aspectFit"></image>
						</view>
						<view class="quick-entry-text">{{ item.name }}</view>
					</view>
				</view>
			</view>
		</view>
		<!-- 每日趋势 -->
	<!-- 	<view class="contains">
			<view class="contains_box trend">
				<text class="text_12">每月趋势</text>
				<view class="">
					<view class="charts-box">
						<qiun-data-charts type="tarea" :chartData="chartData" :opts="opts" />
					</view>
				</view>
			</view>
		</view> -->
		<!-- 成员数据排行 -->
		<view class="contains">
			<view class="group_7 flex-col contains_box data_ranking">
				<view class="group_8 master_flex flex-row justify-between">
					<text class="text_26">月度成员数据排行</text>
					<view class="image-text_7 flex-row justify-between">
						<!-- <text class="text-group_7">查看全部</text> -->
					</view>
				</view>
				<view class="group_9 flex-row justify-between">
					<view class="text-wrapper_4 flex-col" :class="mouth_state==1?'active':''" @click="changTab(1)">
						<text class="text_27">消耗积分数</text>
					</view>
					<view class="text-wrapper_4 flex-col" :class="mouth_state==2?'active':''" @click="changTab(2)">
						<text class="text_28">名下成员数</text>
					</view>
					<view class="text-wrapper_4 flex-col" :class="mouth_state==3?'active':''" @click="changTab(3)">
						<text class="text_29">名下店铺数</text>
					</view>
				</view>
				<view class="text-wrapper_7 flex-row">
					<view style="display:flex;align-items: center;">
						<view class="text_30">排名</view>
						<view class="text_30 text_31">账号</view>
					</view>
					<view style="display:flex;align-items: center;">
						<view class="paragraph_1" v-if="mouth_state==1">
							上月消耗
						</view>
						<view class="paragraph_1" v-if="mouth_state==2">
							今日新增
						</view>
						<view class="paragraph_1" style="margin: 0 30rpx 0;" v-if="mouth_state==3">
							MT外卖
						</view>
						<view class="paragraph_1 " v-if="mouth_state==1">
							累计消耗
						</view>
						<view class="paragraph_1" v-if="mouth_state==2">
							累计成员
						</view>
						<view class="paragraph_1" style="margin: 0 30rpx 0;" v-if="mouth_state==3">
							ELE
						</view>
					</view>
				</view>
				<view class="nOdata" v-if="masterData.amonth == 0">
					暂无数据
				</view>
				<view class="group_10 flex-row" v-for="(item, index) in masterData.amonth" :key="index">
					<view v-if="index <3" class="text-wrapper_8 flex-col">
						<text class="text_32">{{ index + 1 }}</text>
					</view>
					<view v-else class="text-wrapper_8_9 flex-col">
					</view>
					<view class="image-text_8 flex-row">
						<!-- <view class="box_11 flex-col">
							<image class="icon_more" src="@/static/user/zdblogo.png"></image>
						</view> -->
						<view class="text-group_8 flex-col">
							<view class="text_33">{{item.user_name}}</view>
							<view class="text_34">ID：{{item.member_id}}</view>
						</view>
					</view>
					<text class="text_35" v-if="mouth_state!=3">{{ Number(item.last_month_count || 0).toFixed(1) }}</text>
					<!-- 累计消耗积分：保留 1 位小数 -->
					<text class="text_35 text_36" v-if="mouth_state!=3">{{ Number(item.total || 0).toFixed(1) }}</text>
					<text class="text_35" v-if="mouth_state==3">{{item.mt_count}}</text>
					<text class="text_35 text_36" v-if="mouth_state==3">{{item.elm_count}}</text>
				</view>
			</view>
		</view>
		<!-- 团队成员 -->
		
		<view class="contains team">
			<view class="contains_box">
				<view class="master_flex team_top">
					<view class="title">团队成员</view>
					<!-- <view class=" text-group_15">查看全部</view> -->
				</view>
				<!-- <view class="">
					<view class="team_text">
						<span class="mg-r">成员总数:12</span>
						<span class="mg-r">当前在线:18</span>
					</view>
				</view> -->
				<view class="text-wrapper_13 flex-row">
					<view class="text_59">账号</view>
					<view class="text_60">剩余积分</view>
					<!-- <view class="text_60">在线状态</view> -->
				</view>
				<view class="group_19 flex-row" v-for="item in balanceTop" :key="item.id">
					<view class="image-text_15 flex-row">
						<!-- <view class="box_11 flex-col">
							<image class="icon_more" src="@/static/user/zdblogo.png"></image>
						</view> -->
						<text class="text-group_16">{{ item.name }}</text>
					</view>
					<view class="text_62">{{ item.balance }}</view>
					<!-- <view class="image-text_16 flex-row">
						<view class="block_3 flex-col"></view>
						<text class="text-group_17">在线</text>
					</view> -->
				</view>
			</view>
		</view>
		
		<wd-popup v-model="logState" position="center" closable
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="logClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					历史公告
				</view>
				<view class="log-main">
					<view class="log-item" v-for="item in logList" :key="item.id">
						<view style="font-size: 28rpx;color: #333333;margin-bottom: 10rpx;">{{ item.name }}</view>
						<view style="font-size: 24rpx;color: #999999;margin-bottom: 20rpx;">{{ item.crtim }}</view>
						<view class="" v-html="item.content"></view>
					</view>
				</view>
			</view>
		</wd-popup>
	
	</view>
</template>

<script setup>
	import {
		HomeApi
	} from '@/api/home'
	import {
		UserApi
	} from '@/api/login'
	import {
		ref,
		reactive,
		onMounted
	} from 'vue'
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import { openOnlineService } from '@/utils/onlineService'

	const mouth_state = ref(1)
	const token = ref('')
	let chartData = ref(null)
	const opts = reactive({
		color: ["#1890FF", "#91CB74", "#FAC858", "#EE6666", "#73C0DE", "#3CA272", "#FC8452", "#9A60B4",
			"#ea7ccc"
		],
		padding: [20, 20, 0, 0],
		enableScroll: false,
		legend: {},
		xAxis: {
			disableGrid: true,
		},
		yAxis: {
			gridType: "dash",
			dashLength: 2,
			data: [{
				min: 0,
				max: 80
			}]
		},
		extra: {
			area: {
				type: "curve",
				opacity: 0.2,
				addLine: true,
				width: 2,
				gradient: true,
				activeType: "hollow"
			}
		}
	})
	let masterData = reactive({})
	const monthData = reactive({
		month_pay_member: [],
		month_member_count: [],
		month_shop_count: []
	})
	const todayList = ref([])
	let userInfo = reactive({})
	const lastWeek = ref([])
	let shopobj = reactive({})
	const balanceTop = ref([])
	const scrollText = ref('')
	const logState = ref(false)
	const centre = ref([])
	const provi = ref([])
	const addnum = ref([])
	let logList = ref([])
	const systemBarHeight = ref(0)
	
	// 快捷入口列表
	const quickEntryList = ref([
		{
			name: '聚合客服',
			icon: '@/static/img/juhekfu-logo.png',
			path: '/pages/aggregated-service/aggregated-service'
		}
	])
	
	defineProps({
	  defaultIndex: {
	    type: Number,
		default: () => {
			return 0
		}
	  }
	});
	onMounted(() => {
		const value = uni.getStorageSync('token');
		if (value) {
			token.value = value
		}
		getagencyinfo()
		gethomedata();
		getNoticeNewItem()
	})
	
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
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
			if (res.code === 200) {
				scrollText.value = res.data.rows[0].name
				logList.value = res.data.rows
			}
		}).catch(err => {
			console.log(err)
		})
	}
	// 快捷入口点击处理
	const handleQuickEntry = (item) => {
		if (item.path) {
			uni.navigateTo({
				url: item.path
			})
		}
	}
	const changTab = (state) => {
		mouth_state.value = state
		if (state == 1) {
			masterData.amonth = monthData.month_pay_member || []
		} else if (state == 2) {
			masterData.amonth = monthData.month_member_count || []
		} else if (state == 3) {
			masterData.amonth = monthData.month_shop_count || []
		}
	}
	// 获取代理信息
	const getagencyinfo = () => {
		UserApi.getUser().then(res => {
			if (res.code === 200) {
				userInfo = res.data?.admin
			}
		})
	}
	const filterTodayDate = (data) => {
		// 处理新的数据结构：last_week 是对象，键是日期字符串
		if (!data) return
		
		// 如果是对象格式（新格式）
		if (typeof data === 'object' && !Array.isArray(data)) {
			const dates = Object.keys(data).sort()
			const mtData = []
			const elmData = []
			const memberData = []
			const pointsData = []
			
			dates.forEach(date => {
				const dayData = data[date]
				mtData.push(dayData['美团店铺'] || 0)
				elmData.push(dayData['饿了么店铺'] || 0)
				memberData.push(dayData['新增成员'] || 0)
				pointsData.push(Math.abs(dayData['积分消耗'] || 0))
			})
			
			const echartsData = {
				categories: GetTime(),
				series: [{
						name: "ELM店铺",
						data: elmData.length ? elmData : [12, 33, 12, 33, 67, 66, 22]
					},
					{
						name: "新增成员",
						data: memberData.length ? memberData : [24, 35, 45, 67, 77, 56, 70]
					},
					{
						name: "MT店铺",
						data: mtData.length ? mtData : [11, 45, 23, 39, 34, 55, 45]
					}
				]
			}
			chartData = JSON.parse(JSON.stringify(echartsData));
			return
		}
		
		// 如果是数组格式（旧格式，保持兼容）
		let arr = Array.isArray(data) ? data : []
		let filterData = arr.filter(item => {
			return item.data_type === 2 && Math.floor(item.date / 100000) === Math.floor(Date.now() /
				100000000) && !item.site_type
		})
		if (filterData.length < 4 && !todayList.value.length) {
			todayList.value = [{
					title: '今日新增成员(团队)',
					count: 3,
					total: 52,
					of_yday: 2
				},
				{
					title: '今日消耗积分(团队)',
					count: 20,
					total: 100,
					of_yday: 2,
				},
				{
					title: '今日新增MT店铺(团队)',
					count: 16,
					total: 120,
					of_yday: 5
				},
				{
					title: '今日新增ELM店铺(团队)',
					count: 5,
					total: 52,
					of_yday: 2
				}
			]
		}
		let centre = arr.filter(item => {
			return item.data_type === 0
		}).sort((a, b) => a.date - b.date)
		let provi = arr.filter(item => {
			return item.data_type === 1
		}).sort((a, b) => a.date - b.date)
		let addnum = arr.filter(item => {
			return item.data_type === 2
		}).sort((a, b) => a.date - b.date)
		centre.value = []
		centre.forEach(item => {
			centre.value.push(item.count)
		})
		provi.value = []
		provi.forEach(item => {
			provi.value.push(item.count)
		})
		addnum.value = []
		addnum.forEach(item => {
			addnum.value.push(item.count)
		})
		const echartsData = {
			categories: GetTime(),
			series: [{
					name: "ELM店铺",
					data: arr.length ? provi.value : [12, 33, 12, 33, 67, 66, 22]
				},
				{
					name: "新增成员",
					data: arr.length ? addnum.value : [24, 35, 45, 67, 77, 56, 70]
				},
				{
					name: "MT店铺",
					data: arr.length ? centre.value : [11, 45, 23, 39, 34, 55, 45]
				}
			]
		}
		chartData = JSON.parse(JSON.stringify(echartsData));
	}
	const gethomedata = () => {
		// uni.showLoading({
		// 	title: '加载中',
		// 	mask: true
		// })
		HomeApi.getHomeData().then(res => {
			if (res.code === 200) {
				// 实际数据在 res.data.data 中
				const homeData = res.data.data || res.data
				// masterData = homeData
				lastWeek.value = homeData.last_week
				filterTodayDate(lastWeek.value)
				if (res.code !== 200) {
					uni.showModal({
						title: "提示",
						content: "请求错误",
						showCancel: false,
						confirmText: '确定',
						success: res => {
							if (res.confirm) {
								// 用户点击确定								
							}
						}
					})
					return
				}
				const {
					calendar_top10,
					calendar_count,
					month_member_count,
					month_pay_member,
					month_shop_count,
					update_top10,
					BalanceTop,
					top_data
				} = homeData
				
				// 处理今日数据 top_data
				if (top_data) {
					todayList.value = Object.values(top_data).map(item => ({
						title: item.title || '',
						count: item.count || 0,
						total: item.total || 0,
						of_yday: item.of_yday || 0,
						unit: item.unit || '人' // 从数据中获取单位
					}))
				}
				
				monthData.month_pay_member = month_pay_member || []
				monthData.month_member_count = month_member_count || []
				monthData.month_shop_count = month_shop_count || []
				balanceTop.value = BalanceTop || []
				if (balanceTop.value.length === 0) {
					balanceTop.value.push({
						name: '美味食客海鲜店（金康店）',
						balance: '1920'
					})
				}
				if (mouth_state.value == 1) {
					masterData.amonth = month_pay_member || []
				}
				console.log(monthData, 'monthData')
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const GetTime = (num = 7) => {
		var date = new Date();
		var base = Date.parse(date); // 转换为时间戳
		var mon = date.getMonth() + 1; //获取当前月份
		var day = date.getDate(); //获取当前日
		var oneDay = 24 * 3600 * 1000

		var daytimeArr = [
			[mon >= 10 ? mon : '0' + mon, day >= 10 ? day : '0' + day].join('-')
		];
		for (var i = 1; i < num; i++) { //前七天的时间
			var now = new Date(base -= oneDay);
			var month = now.getMonth() + 1;
			var mday = now.getDate()
			daytimeArr.push([month >= 10 ? month : '0' + month, mday >= 10 ? mday : '0' + mday].join('-'))
		}
		daytimeArr = daytimeArr.reverse();
		return daytimeArr
	}
	
	onLoad(() => {
		getSysteminfo()
	})
</script>

<style scoped lang="scss">
	.master {
		min-height: 100vh;
		background: #F9F9F9;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		box-sizing: border-box;
		padding-bottom: 70px;
	}

	.top_img {
		position: absolute;
		top: 0rpx;
		left: 0rpx;
	}

	.master_flex {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
	}

	.master_header {
		position: relative;
		width: 100%;

	}

	.mrg-r {
		margin-right: 8rpx;
		display: flex;
		align-items: center;
	}

	.user_img {
		margin-top: 30rpx;
		padding-left: 10rpx;
		padding-right: 30rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;

		.user_name {
			display: inline-block;
			margin-left: 20rpx;
		}

		.img1 {
			width: 70rpx;
			height: 70rpx;
			vertical-align: middle;

		}

		.img2 {
			width: 40rpx;
			height: 40rpx;
		}

		.header-actions {
			display: flex;
			align-items: center;
			gap: 18rpx;
			flex-shrink: 0;
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
	}

	.user_info {
		width: 100%;
		position: relative;
		margin-top: 40rpx;
		overflow: hidden;

		.item_box {
			width: calc((100% - 80rpx) / 2);
			height: 214rpx;
			border-radius: 8rpx;
			padding-left: 20rpx;
			padding-right: 20rpx;
			padding-bottom: 20rpx;
		}

		.user_title {
			font-size: 24rpx;
			color: #333;
			padding-right: 0rpx;
			padding-top: 20rpx;
			margin-bottom: 20rpx;
		}

		.box {
			background-repeat: no-repeat;
			background-size: 100% 100%;
			background-position: top;
		}

		.master_flex_box {
			width: 100%;
			box-sizing: border-box;
			padding: 0 30rpx 20rpx;
		}

		.box1:nth-child(1) {
			background-image: url('@/static/master/master_item1.png');
		}

		.box1:nth-child(2) {
			background-image: url('@/static/master/master_item2.png');
		}

		.box1:nth-child(3) {
			background-image: url('@/static/master/master_item3.png');
		}

		.box1:nth-child(4) {
			background-image: url('@/static/master/master_item4.png');
		}

		.font-weight_b {
			display: inline-block;
			font-weight: bold;
			font-size: 36rpx;
			margin-right: 10rpx;
		}

		.font-right {
			color: #999;
			font-size: 24rpx;
		}

		.item_info {
			margin-bottom: 30rpx;
		}

		.info_bottom {
			font-size: 24rpx;
			color: #999;

			.trend_icon {
				display: inline-block;
				position: relative;

				.trend_img {
					width: 24rpx;
					height: 28rpx;
					vertical-align: middle;
				}
			}
		}
	}

	.contains {
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx 20rpx;
		position: relative;
		// margin-top: 30rpx;

		.contains_box {
			width: 100%;
			box-sizing: border-box;
			padding: 30rpx;
			border-radius: 8rpx;
			background-color: #fff;
		}
	}

	.quick-entry {
		.quick-entry_box {
			.title {
				font-size: 32rpx;
				color: #333;
				margin-bottom: 30rpx;
				font-weight: 500;
			}
		}

		.quick-entry-list {
			display: flex;
			flex-wrap: wrap;
			justify-content: flex-start;
			gap: 20rpx;
		}

		.quick-entry-wrapper {
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.quick-entry-item {
			width: 120rpx;
			height: 120rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
			justify-content: center;
			padding: 0;
			box-sizing: border-box;
			border-radius: 12rpx;
			background-color: #F8F8FC;
			transition: all 0.2s;
			overflow: hidden;

			&:active {
				transform: scale(0.95);
				background-color: #F0F0F0;
			}
		}

		.quick-entry-icon {
			width: 100%;
			height: 100%;
			object-fit: contain;
		}

		.quick-entry-text {
			font-size: 28rpx;
			color: #333;
			text-align: center;
			line-height: 1.4;
			font-weight: 500;
			margin-top: 20rpx;
		}
	}

	.team {
		.team_flex {
			display: flex;
			line-height: 60rpx;

			.team_account {
				width: 376rpx;
			}

			.team_points {
				width: 90rpx;
			}

			.team_state {
				width: 90rpx;
			}
		}

		.team_top {
			margin-bottom: 20rpx;
		}

		.team_text {
			margin-bottom: 20rpx;
			color: #666;

			.mg-r {
				display: inline-block;
				margin-right: 40rpx;
				font-size: 24rpx;
			}
		}

		.text-group_16 {
			color: rgba(102, 102, 102, 1);
			font-size: 24rpx;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			margin-left: 8rpx;
		}

		.text-group_15 {
			overflow-wrap: break-word;
			color: rgba(153, 153, 153, 1);
			font-size: 26rpx;
			letter-spacing: 0.4333333373069763px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 37rpx;
		}
	}

	.nOdata {
		font-size: 24rpx;
		text-align: center;
		padding-top: 10rpx;
	}

	.data_ranking {
		.group_8 {
			// width: 629px;
			margin-right: 2px;
		}

		.text_26 {
			overflow-wrap: break-word;
			color: rgba(51, 51, 51, 1);
			font-size: 32rpx;
			letter-spacing: 0.5333333611488342px;
			font-family: PingFangSC-Medium;
			font-weight: 500;
			text-align: left;
			white-space: nowrap;
			line-height: 45rpx;
		}

		.image-text_7 {
			width: 126rpx;
			margin: 4rpx 0 4rpx 0;
		}

		.text-group_7 {
			overflow-wrap: break-word;
			color: rgba(153, 153, 153, 1);
			font-size: 26rpx;
			letter-spacing: 0.4333333373069763px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 37rpx;
		}

		.group_9 {
			width: 520rpx;
			margin: 30rpx 111rpx 0 0;
		}

		.text-wrapper_4 {
			background-color: #f8f8fc;
			border-radius: 12rpx;
			padding: 12rpx 14rpx;
			color: #666;
		}

		.text_27 {
			overflow-wrap: break-word;

			font-size: 26rpx;
			letter-spacing: 0.4333333373069763px;
			font-family: PingFangSC-Medium;
			font-weight: 500;
			text-align: left;
			white-space: nowrap;
			line-height: 37rpx;
		}

		.text-wrapper_5 {
			color: #666;
			background-color: rgba(248, 248, 252, 1);
			border-radius: 12rpx;
			padding: 12rpx 13rpx 11rpx 14rpx;
		}

		.text_28 {
			overflow-wrap: break-word;

			font-size: 26rpx;
			letter-spacing: 0.4333333373069763px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 37rpx;
		}

		.text-wrapper_6 {
			color: #666;
			background-color: rgba(248, 248, 252, 1);
			border-radius: 12rpx;
			padding: 12rpx 13rpx 11rpx 14rpx;
		}

		.text_29 {
			overflow-wrap: break-word;

			font-size: 26rpx;
			letter-spacing: 0.4333333373069763px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 37rpx;
		}

		.text-wrapper_7 {
			color: #666;
			background-color: rgba(248, 248, 252, 1);
			border-radius: 4rpx;
			margin: 30rpx 0 0 0;
			height: 80rpx;
			line-height: 80rpx;
			box-sizing: border-box;
			padding: 0 30rpx 0 20rpx;
			display: flex;
			align-items: center;
			justify-content: space-between;
		}

		.text_30 {
			overflow-wrap: break-word;
			color: rgba(51, 51, 51, 1);
			font-size: 22rpx;
			letter-spacing: 0.36666667461395264px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
		}

		.text_31 {
			margin-left: 30rpx;
		}

		.paragraph_1 {
			overflow-wrap: break-word;
			color: rgba(51, 51, 51, 1);
			font-size: 22rpx;
			font-weight: normal;
			text-align: left;
			margin-left: 30rpx;
		}

		.active {
			background-color: rgba(44, 202, 135, 1);
			color: #fff;
		}

		.group_10 {
			margin: 26rpx 14rpx 0 14rpx;
			display: flex;
			align-items: center;
		}

		.text-wrapper_8 {
			background: url(https://lanhu-dds-backend.oss-cn-beijing.aliyuncs.com/merge_image/imgs/7eca98dc7cde4edab2377d9ed353f9a8_mergeImage.png) 100% no-repeat;
			background-size: 100% 100%;
			width: 60rpx;
			height: 60rpx;
			display: flex;
			align-items: center;
			justify-content: center;

			text {
				transform: translateX(-3rpx);
			}
		}
		.text-wrapper_8_9 {
			width: 60rpx;
			height: 60rpx;
		}

		.text_32 {
			overflow-wrap: break-word;
			color: rgba(255, 255, 255, 1);
			font-size: 24rpx;
			font-family: Bebas;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 16rpx;
		}

		.image-text_8 {
			width: 280rpx;
			margin-left: 20rpx;
			display: flex;
			align-items: center;

			.box_11 {
				margin-right: 10rpx;
			}
		}

		.text_34 {
			overflow-wrap: break-word;
			color: rgba(153, 153, 153, 1);
			font-size: 20rpx;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 28rpx;
		}

		.text_35 {
			overflow-wrap: break-word;
			color: rgba(102, 102, 102, 1);
			font-size: 22rpx;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 30rpx;
			margin-left: 30rpx;
			width: 80rpx;
		}

		.text_36 {
			width: 40rpx;
			margin-left: 40rpx;
		}

		.text_33 {
			overflow-wrap: break-word;
			color: rgba(51, 51, 51, 1);
			font-size: 22rpx;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 30rpx;
		}

	}

	// 每月数据排行结束
	// 每月趋势开始
	.trend {
		.text_12 {
			overflow-wrap: break-word;
			color: rgba(51, 51, 51, 1);
			font-size: 32rpx;
			letter-spacing: 0.5333333611488342px;
			font-family: PingFangSC-Medium;
			font-weight: 500;
			text-align: left;
			white-space: nowrap;
			line-height: 45rpx;

		}

		.section_2 {
			width: 394rpx;
			margin: 12rpx 236rpx 0 0;
		}

		.image-text_4 {
			width: 103rpx;
		}

		.group_6 {
			background-color: rgba(255, 148, 2, 1);
			width: 12rpx;
			height: 12rpx;
			margin: 9rpx 0 9rpx 0;
		}

		.text-group_4 {
			overflow-wrap: break-word;
			color: rgba(102, 102, 102, 1);
			font-size: 22rpx;
			letter-spacing: 0.36666667461395264px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 30rpx;
		}

		.image-text_5 {
			width: 117rpx;
		}

		.section_3 {
			background-color: rgba(35, 120, 255, 1);
			width: 12rpx;
			height: 12rpx;
			margin: 9rpx 0 9rpx 0;
		}

		.text-group_5 {
			overflow-wrap: break-word;
			color: rgba(102, 102, 102, 1);
			font-size: 22rpx;
			letter-spacing: 0.36666667461395264px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 30rpx;
		}

		.image-text_6 {
			width: 114rpx;
		}

		.section_4 {
			background-color: rgba(0, 222, 140, 1);
			width: 12rpx;
			height: 12rpx;
			margin: 9rpx 0 9rpx 0;
		}

		.text-group_6 {
			overflow-wrap: break-word;
			color: rgba(102, 102, 102, 1);
			font-size: 22rpx;
			letter-spacing: 0.36666667461395264px;
			font-weight: normal;
			text-align: left;
			white-space: nowrap;
			line-height: 30rpx;
		}
	}

	// 每月趋势结束
	.charts-box {
		width: 100%;
		height: 321rpx;
	}

	.flex-row {
		display: flex;
	}


	.image_12 {
		width: 631px;
		height: 1px;
		margin-top: 20px;
	}

	.text_53 {
		overflow-wrap: break-word;
		color: rgba(44, 202, 135, 1);
		font-size: 26px;
		letter-spacing: 0.4333333373069763px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 20px;
		margin-top: 13px;
	}

	.box_6 {
		background-color: rgba(248, 248, 252, 1);
		border-radius: 4px;
		width: 630px;
		margin-top: 30px;
		padding: 14px 150px 13px 20px;
	}

	.text_54 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24px;
		letter-spacing: 0.4000000059604645px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.box_7 {
		background-color: rgba(44, 202, 135, 1);
		border-radius: 50%;
		width: 14px;
		height: 14px;
		margin: 9px 0 10px 133px;
	}

	.text_55 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24px;
		letter-spacing: 0.4000000059604645px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
		margin-left: 9px;
	}

	.box_8 {
		background-color: rgba(254, 0, 0, 1);
		border-radius: 50%;
		width: 14px;
		height: 14px;
		margin: 9px 0 10px -144px;
	}

	.box_9 {
		width: 630px;
		margin-top: 30px;
	}

	.image-text_12 {
		width: 266px;
	}

	.block_2 {
		background-color: rgba(51, 51, 51, 1);
		border-radius: 50%;
		width: 8px;
		height: 8px;
		margin: 15px 0 14px 0;
	}

	.text-group_12 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 26px;
		letter-spacing: 0.4333333373069763px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
	}

	.image_15 {
		width: 26px;
		height: 5px;
		margin: 15px 0 17px 0;
	}

	.box_10 {
		width: 630px;
		margin-top: 30px;
	}

	.image-text_13 {
		width: 319px;
	}

	.group_16 {
		background-color: rgba(51, 51, 51, 1);
		border-radius: 50%;
		width: 8px;
		height: 8px;
		margin: 15px 0 14px 0;
	}

	.text-group_13 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 26px;
		letter-spacing: 0.4333333373069763px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
	}

	.image_16 {
		width: 26px;
		height: 5px;
		margin: 16px 0 16px 0;
	}

	.group_17 {
		background-color: rgba(255, 255, 255, 1);
		border-radius: 8px;
		width: 690px;
		align-self: center;
		margin-top: 30px;
		padding: 30px 29px 31px 30px;
	}

	.group_18 {
		margin-right: 2rpx;
	}

	.text_56 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 32rpx;
		letter-spacing: 0.5333333611488342px;
		font-family: PingFangSC-Medium;
		font-weight: 500;
		text-align: left;
		white-space: nowrap;
		line-height: 45rpx;
		margin-right: 26rpx;
	}

	.text_57 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		letter-spacing: 0.4000000059604645px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
		margin-top: 20rpx;
	}

	.text_58 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		letter-spacing: 0.4000000059604645px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
		margin: 65rpx 0 0 40rpx;
	}

	.image-text_14 {
		width: 126rpx;
		margin: 4rpx 0 57rpx 149rpx;
	}



	.image_17 {
		width: 10px;
		height: 21px;
		margin: 8px 0 8px 0;
	}

	.text-wrapper_13 {
		background-color: rgba(248, 248, 252, 1);
		border-radius: 4rpx;
		margin: 30rpx 1rpx 0 0;
		padding: 15rpx;
		text-align: center;
		font-size: 22rpx;
		font-weight: normal;
		text-align: center;
		white-space: nowrap;

		.text_59 {
			width: 56%;
		}

		.text_60 {
			width: 22%
		}
	}

	.group_19 {
		width: 100%;
		box-sizing: border-box;
		padding: 26rpx 20rpx 0;
		display: flex;
		align-items: center;
	}

	.image-text_15 {
		width: 62%;
		display: flex;
		align-items: center;
		box-sizing: border-box;
		padding-left: 80rpx;
	}

	.box_11 {
		background-color: rgba(216, 216, 216, 1);
		border-radius: 4rpx;
		width: 38rpx;
		height: 38rpx;

		.icon_more {
			width: 100%;
			height: 100%;
		}
	}





	.image-text_16 {
		display: flex;
		align-items: center;
		width: 18%;
		justify-content: center;

		.text-group_17 {
			color: rgba(44, 202, 135, 1);
			font-size: 24rpx;
		}
	}

	.block_3 {
		background-color: rgba(44, 202, 135, 1);
		border-radius: 50%;
		width: 8rpx;
		height: 8rpx;
		display: inline-block;
		margin-right: 10rpx;
	}

	.block_4 {
		background-color: #fa4350;
		border-radius: 50%;
		width: 8rpx;
		height: 8rpx;
		display: inline-block;
		margin-right: 10rpx;
	}

	.text_62 {
		font-size: 24rpx;
		width: 18%;
		text-align: left;
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

			.log-item {
				padding-bottom: 30rpx;
				border-bottom: 1rpx solid #e5e5e5;
				margin-bottom: 30rpx;
			}

			.log-item:last-child {
				border: none;
			}
		}
	}
</style>