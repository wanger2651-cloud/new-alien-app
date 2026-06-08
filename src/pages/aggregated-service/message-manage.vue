<template>
	<view class="message-manage">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="消息管理" left-text="返回" left-arrow @click-left="handleClickLeft" :bordered="false"></wd-navbar>
		
		<!-- 标签栏 -->
		<view class="tabs-container" :style="{paddingTop: (systemBarHeight + 44) + 'px'}">
			<view 
				class="tab-item" 
				:class="{ 'active': currentTab === 'serving' }"
				@click="switchTab('serving')"
			>
				<text class="tab-text">接待中</text>
				<view class="tab-badge" v-if="servingCount > 0">{{ servingCount }}</view>
			</view>
			<view 
				class="tab-item" 
				:class="{ 'active': currentTab === 'all' }"
				@click="switchTab('all')"
			>
				<text class="tab-text">全部</text>
			</view>
		</view>

		<!-- 消息列表 -->
		<scroll-view 
			class="message-list" 
			scroll-y="true"
			:refresher-enabled="true"
			:refresher-triggered="refreshing"
			@refresherrefresh="handleRefresh"
			@scrolltolower="loadMore"
		>
			<view class="message-item" v-for="session in sessionList" :key="session.id" @click="openSession(session)">
				<view class="message-header">
					<!-- 店铺类型logo -->
					<image 
						class="shop-logo" 
						:src="getShopTypeLogo(session.site_type)" 
						mode="aspectFit"
					></image>
					<view class="message-info">
						<view class="shop-name-row">
							<text class="shop-name">{{ session.shop_name || '未知店铺' }}</text>
							<view class="unread-badge" v-if="session.unread_count > 0">{{ session.unread_count > 99 ? '99+' : session.unread_count }}</view>
						</view>
						<view class="customer-name-row">
							<text class="customer-name">{{ session.customer_name || '未知顾客' }}</text>
							<text class="order-id" v-if="session.site_order_id">订单: {{ session.site_order_id }}</text>
						</view>
					</view>
					<view class="message-time">{{ formatTime(session.last_message_time || session.crtim) }}</view>
				</view>
				<view class="message-preview" v-if="session.last_message">
					<text class="preview-text">{{ session.last_message }}</text>
				</view>
				<view class="message-status" v-if="session.status !== ImSessionStatus.Closed">
					<text class="status-badge serving">接待中</text>
				</view>
			</view>
			
			<view class="empty-state" v-if="!loading && sessionList.length === 0">
				<text class="empty-text">暂无消息</text>
			</view>
			
			<view class="loading-more" v-if="loading">
				<text class="loading-text">加载中...</text>
			</view>
		</scroll-view>
	</view>
</template>

<script setup lang="ts">
	import { ref, onMounted, onUnmounted, computed } from 'vue'
	import { onShow, onHide } from '@dcloudio/uni-app'
	import request from '@/utils/request'
	import { ImSessionStatus } from '@/TsModel/Alien/Entity/Enums/IM/ImSessionStatus'
	import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
	import { MessageType } from '@/TsModel/Alien/Entity/Enums/MessageType'
	import type { ImMessage } from '@/TsModel/Alien/Entity/Messages/ImMessage'
	import type { t_wmt_im_session } from '@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_session'
	import { imNotificationService } from '@/utils/imNotification.ts'

	const systemBarHeight = ref(0)
	const currentTab = ref<'serving' | 'all'>('serving')
	const sessionList = ref<t_wmt_im_session[]>([])
	const loading = ref(false)
	const refreshing = ref(false)
	const pageIndex = ref(1)
	const pageSize = ref(20)
	const total = ref(0)
	const servingCount = ref(0)
	
	// 定时刷新间隔（毫秒）
	const refreshInterval = ref(15000) // 15秒刷新一次，降低频率减少请求
	let refreshTimer: ReturnType<typeof setInterval> | null = null

	// 平台logo映射
	const platformLogos = new Map()
	platformLogos.set(1, 'https://p0.meituan.net/shangouproductapi/8bb7f604d4c10239f736f2c450ce92ef93342.png') // 美团餐饮
	platformLogos.set(2, 'https://p0.meituan.net/shangouproductapi/280765bbbe4aeb0603d386eea888ab8c151948.png') // 饿了么
	platformLogos.set(3, 'https://p0.meituan.net/shangouproductapi/e4f5dff1d5445c2895d6ca9e3a55bf2744440.png') // 美团闪购
	platformLogos.set(4, 'https://p0.meituan.net/shangouproductapi/a4022ea3fb17f68c43ecbfcec893c836102681.png') // 美团医药
	platformLogos.set(5, 'https://p0.meituan.net/shangouproductapi/546c580071907f18b7b9ea913fc29812158401.png') // 饿百零售
	platformLogos.set(6, 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png') // 京东到家

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight || 0
			}
		})
	}

	const handleClickLeft = () => {
		uni.navigateBack()
	}

	const switchTab = (tab: 'serving' | 'all') => {
		currentTab.value = tab
		pageIndex.value = 1
		sessionList.value = []
		loadSessionList()
	}

		const loadSessionList = async (silent = false) => {
		if (loading.value && !silent) return
		
		if (!silent) {
			loading.value = true
		}
		try {
			// 接待中：只显示未关闭的会话
			const onlyServing = currentTab.value === 'serving'
			const params: any = {
				page: pageIndex.value,
				pageSize: pageSize.value
			}
			if (onlyServing) {
				params.onlyServing = true
			}
			
			const result: any = await request({
				url: 'IM/Session/list',
				method: 'GET',
				data: params
			})
			
			// 调试日志：只在开发环境且非静默刷新时打印
			if (!silent && import.meta.env.DEV) {
				console.log('[会话列表] 接口返回，数量:', result?.data?.rows?.length || result?.rows?.length || 0)
			}
			
			// 兼容多种返回格式
			let rows = []
			let totalCount = 0
			
			// 格式1: { rows: [], total: 100 }
			if (Array.isArray(result?.rows)) {
				rows = result.rows
				totalCount = result.total || result.Total || 0
			}
			// 格式2: { data: { rows: [], total: 100 } }
			else if (result?.data && Array.isArray(result.data.rows)) {
				rows = result.data.rows
				totalCount = result.data.total || result.data.Total || 0
			}
			// 格式3: { Data: { Rows: [], Total: 100 } }
			else if (result?.Data && Array.isArray(result.Data.Rows)) {
				rows = result.Data.Rows
				totalCount = result.Data.Total || 0
			}
			// 格式4: { data: { Rows: [], Total: 100 } }
			else if (result?.data && Array.isArray(result.data.Rows)) {
				rows = result.data.Rows
				totalCount = result.data.Total || 0
			}
			// 格式5: { Success: true, Data: { Rows: [], Total: 100 } }
			else if (result?.Data?.Rows && Array.isArray(result.Data.Rows)) {
				rows = result.Data.Rows
				totalCount = result.Data.Total || 0
			}
			// 格式6: 直接是数组
			else if (Array.isArray(result)) {
				rows = result
				totalCount = result.length
			}
			
			// 只在开发环境且非静默刷新时打印解析结果
			if (!silent && import.meta.env.DEV) {
				console.log('[会话列表] 解析后数量:', rows.length, '总数:', totalCount)
			}
			
			if (rows && rows.length > 0) {
				if (pageIndex.value === 1) {
					// 第一页：直接替换，但也要去重（防止API返回重复数据）
					sessionList.value = deduplicateSessions(rows)
				} else {
					// 加载更多：合并并去重（防止分页数据重复）
					sessionList.value = deduplicateSessions([...sessionList.value, ...rows])
				}
				total.value = totalCount
				
				// 获取接待中数量（未关闭的会话）
				if (currentTab.value === 'all') {
					updateServingCount()
				} else {
					servingCount.value = totalCount
				}
			} else {
				console.warn('未找到会话数据，可能原因：1.接口返回格式不匹配 2.没有分配给当前客服的会话 3.店铺未激活IM客服功能')
				if (pageIndex.value === 1) {
					sessionList.value = []
				}
				total.value = 0
			}
		} catch (error) {
			console.error('加载会话列表失败:', error)
			if (!silent) {
				uni.showToast({
					title: '加载失败，请重试',
					icon: 'none'
				})
			}
		} finally {
			if (!silent) {
				loading.value = false
				refreshing.value = false
			}
		}
	}

	const handleRefresh = () => {
		refreshing.value = true
		pageIndex.value = 1
		loadSessionList()
	}

	const loadMore = () => {
		if (loading.value || sessionList.value.length >= total.value) return
		pageIndex.value++
		loadSessionList()
	}

	const openSession = (session: t_wmt_im_session) => {
		// 跳转到会话详情页面
		uni.navigateTo({
			url: `/pages/aggregated-service/session-detail?id=${session.id}&sessionUid=${session.site_session || ''}&shopId=${session.shop_id || ''}&customerId=${session.customer_id || ''}&customerName=${encodeURIComponent(session.customer_name || '')}&shopName=${encodeURIComponent(session.shop_name || '')}&siteType=${session.site_type || ''}`
		})
	}

	// 去重会话列表（根据会话ID去重，保留最新的）
	const deduplicateSessions = (sessions: t_wmt_im_session[]): t_wmt_im_session[] => {
		const sessionMap = new Map<string, t_wmt_im_session>()
		
		// 遍历所有会话，如果ID相同，保留时间更新的那个
		sessions.forEach(session => {
			const sessionId = String(session.id || '')
			if (!sessionId) return // 跳过没有ID的会话
			
			const existing = sessionMap.get(sessionId)
			if (!existing) {
				// 不存在，直接添加
				sessionMap.set(sessionId, session)
			} else {
				// 已存在，比较时间，保留最新的
				const existingTime = new Date(existing.last_message_time || existing.crtim || 0).getTime()
				const currentTime = new Date(session.last_message_time || session.crtim || 0).getTime()
				if (currentTime > existingTime) {
					sessionMap.set(sessionId, session)
				}
			}
		})
		
		// 转换为数组并按时间排序（最新的在前）
		const result = Array.from(sessionMap.values())
		result.sort((a, b) => {
			const timeA = new Date(a.last_message_time || a.crtim || 0).getTime()
			const timeB = new Date(b.last_message_time || b.crtim || 0).getTime()
			return timeB - timeA
		})
		
		if (import.meta.env.DEV && sessions.length !== result.length) {
			console.log(`[会话去重] 原始数量: ${sessions.length}, 去重后: ${result.length}, 移除重复: ${sessions.length - result.length}`)
		}
		
		return result
	}

	const getShopTypeLogo = (shopType: number) => {
		return platformLogos.get(shopType) || '/static/shop/default.png'
	}

	const formatTime = (timeStr: string | Date | null | undefined) => {
		if (!timeStr) return ''
		const date = new Date(timeStr)
		const now = new Date()
		const diff = now.getTime() - date.getTime()
		const hours = Math.floor(diff / 3600000)
		const days = Math.floor(diff / 86400000)
		
		// 格式化时:分，补零
		const formatHourMinute = (d: Date) => {
			const h = d.getHours().toString().padStart(2, '0')
			const m = d.getMinutes().toString().padStart(2, '0')
			return `${h}:${m}`
		}
		
		// 24小时内：显示时:分，如 10:00
		if (hours < 24) {
			return formatHourMinute(date)
		}
		
		// 24-48小时：显示"昨日 时:分"，如 昨日 10:00
		if (hours >= 24 && hours < 48) {
			return `昨日 ${formatHourMinute(date)}`
		}
		
		// 超过48小时：显示"年-月-日 时:分"，如 2026-2-18 10:00
		const year = date.getFullYear()
		const month = date.getMonth() + 1
		const day = date.getDate()
		return `${year}-${month}-${day} ${formatHourMinute(date)}`
	}

	// 处理实时消息推送
	const handleRealtimeMessage = (message: ImMessage) => {
		if (message.Type === MessageType.ImMessage) {
			// 查找对应的会话
			const sessionIndex = sessionList.value.findIndex(s => s.id === message.SessionId)
			
			if (sessionIndex !== -1) {
				// 更新会话信息
				const session = sessionList.value[sessionIndex]
				session.last_message = message.MessagePreview || message.Content
				session.last_message_time = message.Timestamp
				session.unread_count = message.UnreadCount
				
				// 如果是新消息，将会话移到最前面
				if (message.Direction === 1) { // Incoming = 客户发来的消息
					sessionList.value.splice(sessionIndex, 1)
					sessionList.value.unshift(session)
				}
			} else {
				// 新会话，刷新列表
				if (pageIndex.value === 1) {
					loadSessionList()
				}
			}
			
			// 更新接待中数量
			if (currentTab.value === 'all') {
				updateServingCount()
			}
		}
	}
	
	// 更新接待中数量
	const updateServingCount = async () => {
		try {
			const servingResult: any = await request({
				url: 'IM/Session/list',
				method: 'GET',
				data: { page: 1, pageSize: 1, onlyServing: true }
			})
			// 兼容多种返回格式
			servingCount.value = servingResult?.total || servingResult?.Total || servingResult?.data?.total || servingResult?.Data?.Total || 0
		} catch (error) {
			console.error('更新接待中数量失败:', error)
		}
	}
	
	// 启动定时刷新
	const startAutoRefresh = () => {
		if (refreshTimer) {
			clearInterval(refreshTimer)
		}
		refreshTimer = setInterval(() => {
			// 静默刷新，不显示loading
			if (!loading.value) {
				loadSessionList(true) // 传入true表示静默刷新
			}
		}, refreshInterval.value)
	}
	
	// 停止定时刷新
	const stopAutoRefresh = () => {
		if (refreshTimer) {
			clearInterval(refreshTimer)
			refreshTimer = null
		}
	}

	onMounted(() => {
		getSysteminfo()
		loadSessionList()
		// 注意：自动刷新在 onShow 时启动，这里不启动，避免页面初始化时重复启动
		// startAutoRefresh() 已移至 onShow
	})
	
	// 页面显示时刷新（从其他页面返回时）并启动自动刷新
	onShow(() => {
		console.log('消息管理页面显示，刷新会话列表')
		pageIndex.value = 1
		loadSessionList()
		// 页面显示时启动自动刷新
		startAutoRefresh()
		// 用户进入消息管理页面，重置通知服务的未读数（避免重复通知）
		// 延迟执行，确保 loadSessionList 完成后再重置
		setTimeout(() => {
			imNotificationService.resetUnreadCount()
		}, 2000)
	})
	
	// 页面隐藏时停止自动刷新（节省资源）
	onHide(() => {
		stopAutoRefresh()
	})
	
	onUnmounted(() => {
		stopAutoRefresh()
	})
</script>

<style scoped lang="scss">
	.message-manage {
		width: 100%;
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
		position: relative;
	}

	.tabs-container {
		display: flex;
		background: #fff;
		border-bottom: 1px solid #e0e0e0;
		padding: 0 30rpx;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.tab-item {
		flex: 1;
		height: 88rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		margin: 0 20rpx;
	}

	.tab-item.active {
		.tab-text {
			color: #1677ff;
			font-weight: 600;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 4rpx;
			background: #1677ff;
		}
	}

	.tab-text {
		font-size: 28rpx;
		color: #666;
	}

	.tab-badge {
		position: absolute;
		top: 10rpx;
		right: -10rpx;
		background: #ff4d4f;
		color: #fff;
		font-size: 20rpx;
		padding: 2rpx 8rpx;
		border-radius: 20rpx;
		min-width: 32rpx;
		text-align: center;
	}

	.message-list {
		flex: 1;
		width: 100%;
	}

	.message-item {
		background: #fff;
		margin-bottom: 20rpx;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
	}

	.message-header {
		display: flex;
		align-items: center;
		margin-bottom: 20rpx;
	}

	.shop-logo {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
		background: #f5f5f5;
	}

	.message-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}

	.shop-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 8rpx;
	}

	.shop-name-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
		margin-bottom: 8rpx;
	}

	.shop-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
	}

	.unread-badge {
		background: #ff4d4f;
		color: #fff;
		font-size: 20rpx;
		padding: 2rpx 8rpx;
		border-radius: 20rpx;
		min-width: 32rpx;
		text-align: center;
		line-height: 1.2;
	}

	.customer-name-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex-wrap: wrap;
	}

	.customer-name {
		font-size: 24rpx;
		color: #666;
	}

	.order-id {
		font-size: 22rpx;
		color: #999;
	}

	.message-time {
		font-size: 24rpx;
		color: #999;
	}

	.message-preview {
		margin-top: 10rpx;
	}

	.preview-text {
		font-size: 26rpx;
		color: #666;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}

	.message-status {
		margin-top: 10rpx;
	}

	.status-badge {
		display: inline-block;
		padding: 4rpx 12rpx;
		border-radius: 4rpx;
		font-size: 22rpx;
		
		&.serving {
			background: #e6f7ff;
			color: #1677ff;
		}
	}

	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.loading-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 0;
	}

	.loading-text {
		font-size: 24rpx;
		color: #999;
	}
</style>

