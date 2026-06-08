<template>
	<view class="task-query-page">
		<wd-navbar :fixed="true" left-text="返回" @click-left="handleClickLeft" left-arrow :safeAreaInsetTop="true"
			title="任务查询"></wd-navbar>
		
		<view class="content-wrapper" :style="contentStyle">
			<view class="content">
			<!-- 筛选区域 -->
			<view class="filter-section">
				<view class="filter-row">
					<wd-input v-model="filterParams.shop_name" placeholder="店铺名称" clearable class="filter-input" />
					<wd-input v-model="filterParams.off_id" placeholder="门店ID" clearable class="filter-input" />
				</view>
				<view class="filter-row">
					<view class="filter-select-wrapper">
						<picker mode="selector" :range="funcOptions" :range-key="'label'" :value="funcIndex" @change="handleFuncChange">
							<view class="filter-select">
								{{ funcOptions[funcIndex].label }}
								<text class="select-arrow">▼</text>
							</view>
						</picker>
					</view>
					<view class="filter-select-wrapper">
						<picker mode="selector" :range="statusOptions" :range-key="'label'" :value="statusIndex" @change="handleStatusChange">
							<view class="filter-select">
								{{ statusOptions[statusIndex].label }}
								<text class="select-arrow">▼</text>
							</view>
						</picker>
					</view>
				</view>
				<view class="filter-buttons">
					<view class="filter-btn query-btn" @click="handleQuery">查询</view>
					<view class="filter-btn reset-btn" @click="handleReset">重置</view>
				</view>
			</view>
			
			<!-- 任务列表 -->
			<scroll-view class="task-list" scroll-y enable-back-to-top :refresher-enabled="true"
				:refresher-triggered="isRefreshing" @refresherrefresh="handleRefresh">
				<view v-if="loading && taskList.length === 0" class="loading-text">加载中...</view>
				<view v-else-if="taskList.length === 0" class="empty-text">暂无任务记录</view>
				<view v-else>
					<view class="task-item" v-for="(task, index) in taskList" :key="task.id || index">
						<view class="task-header">
							<view class="task-shop-name">{{ task.shop_name || '未知店铺' }}</view>
							<view class="task-status" :class="getStatusClass(task.run_status)">
								{{ getStatusText(task.run_status) }}
							</view>
						</view>
						<view class="task-info">
							<view class="info-row-double">
								<view class="info-item">
									<text class="info-label">门店ID：</text>
									<text class="info-value">{{ task.off_id || '-' }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">功能：</text>
									<text class="info-value">{{ getFuncName(task.func_code) }}</text>
								</view>
							</view>
							<view class="info-row-double">
								<view class="info-item">
									<text class="info-label">开始：</text>
									<text class="info-value time-value">{{ formatTime(task.start_time) }}</text>
								</view>
								<view class="info-item">
									<text class="info-label">结束：</text>
									<text class="info-value time-value">{{ formatTime(task.end_time) }}</text>
								</view>
							</view>
							<view class="info-row" v-if="task.msg">
								<text class="info-label">结果信息：</text>
								<text class="info-value result-msg" :class="{'error-msg': task.run_status === 3}">
									{{ task.msg }}
								</text>
							</view>
						</view>
						<view class="task-actions">
							<view class="action-btn retrigger-btn" @click="handleRetrigger(task)">重新触发</view>
						</view>
					</view>
				</view>
			</scroll-view>
			
			<!-- 分页信息 -->
			<view class="pagination" v-if="total > 0">
				<text class="pagination-info">共{{ total }}条</text>
				<view class="pagination-controls">
					<text class="page-btn" :class="{'disabled': page === 1}" @click="goToPage(page - 1)">上一页</text>
					<text class="page-info">{{ page }} / {{ totalPages }}</text>
					<text class="page-btn" :class="{'disabled': page >= totalPages}" @click="goToPage(page + 1)">下一页</text>
				</view>
			</view>
			</view>
		</view>
	</view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { ManagementApi } from '@/api/management.ts'

// 页面参数
const shopType = ref(null)
const shopId = ref(null)

// 筛选参数
const filterParams = ref({
	shop_name: null,
	off_id: null,
	func_code: null,
	run_status: null
})

// 功能选项（京东团购和京东秒送）
const funcOptions = computed(() => {
	const shopTypeNum = Number(shopType.value) || 0
	// 京东团购
	if (shopTypeNum === 10 || shopTypeNum === 1001) {
		return [
			{ label: '全部', value: null },
			{ label: '关联餐饮商品', value: 'PUBLISHDRAFTTUANGOU' },
			{ label: '开通团购服务', value: 'SIGNTUANGOU' }
		]
	}
	// 京东秒送
	if (shopTypeNum === 6) {
		return [
			{ label: '全部', value: null },
			{ label: '类目属性批量设置', value: 'CTGYPRTYMG' },
			{ label: '批量改价', value: 'BATCH_PRICE' },
			{ label: '批量改库存', value: 'BATCH_STOCK' },
			{ label: '批量改商品名', value: 'BATCH_NAME' },
			{ label: '批量改上下架', value: 'BATCH_STATUS' },
			{ label: '创建减配送费活动', value: 'CREATEFREIGHTPROMO' },
			{ label: '创建百亿补贴活动', value: 'CREATEBILLIONSUBSIDYCOUPON' },
			{ label: '店内领券活动创建', value: 'CREATEINSHOPCOUPON' },
			{ label: '创建满减活动', value: 'CREATEMANJIAN' },
			{ label: '创建品牌饭卡', value: 'CREATEBRANDMEALCARD' },
			{ label: '设置营业状态及营业时间', value: 'UPDATESTOREBUSINESSTIME' }
		]
	}
	return [
		{ label: '全部', value: null }
	]
})

// 当前选中的功能索引
const funcIndex = ref(0)

// 任务状态选项
const statusOptions = [
	{ label: '任务状态', value: null },
	{ label: '待执行', value: 0 },
	{ label: '执行中', value: 1 },
	{ label: '已完成', value: 2 },
	{ label: '执行失败', value: 3 }
]

// 当前选中的状态索引
const statusIndex = ref(0)

// 任务列表
const taskList = ref([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)
const loading = ref(false)
const isRefreshing = ref(false)
const hasMore = ref(true)

// 计算总页数
const totalPages = computed(() => {
	return Math.ceil(total.value / pageSize.value) || 1
})

// 内容区域样式（为导航栏留出空间）
const contentStyle = computed(() => {
	const systemInfo = uni.getSystemInfoSync()
	const statusBarHeight = systemInfo.statusBarHeight || 0
	const navBarHeight = 44
	return {
		paddingTop: (statusBarHeight + navBarHeight) + 'px'
	}
})

// 功能代码到名称的映射
const funcNameMap = {
	// 京东团购
	'SIGNTUANGOU': '开通团购服务',
	'PUBLISHDRAFTTUANGOU': '关联餐饮商品',
	// 京东秒送
	'CTGYPRTYMG': '类目属性批量设置',
	'BATCH_PRICE': '批量改价',
	'BATCH_STOCK': '批量改库存',
	'BATCH_NAME': '批量改商品名',
	'BATCH_STATUS': '批量改上下架',
	'CREATEFREIGHTPROMO': '创建减配送费活动',
	'CREATEBILLIONSUBSIDYCOUPON': '创建百亿补贴活动',
	'CREATEINSHOPCOUPON': '店内领券活动创建',
	'CREATEMANJIAN': '创建满减活动',
	'CREATEBRANDMEALCARD': '创建品牌饭卡',
	'UPDATESTOREBUSINESSTIME': '设置营业状态及营业时间'
}

// 获取功能名称
const getFuncName = (funcCode) => {
	return funcNameMap[funcCode] || funcCode || '-'
}

// 获取状态文本
const getStatusText = (runStatus) => {
	if (runStatus === 0) return '待执行'
	if (runStatus === 1) return '执行中'
	if (runStatus === 2) return '已完成'
	if (runStatus === 3) return '执行失败'
	return '未知状态'
}

// 获取状态样式类
const getStatusClass = (runStatus) => {
	if (runStatus === 0) return 'status-pending'
	if (runStatus === 1) return 'status-running'
	if (runStatus === 2) return 'status-success'
	if (runStatus === 3) return 'status-failed'
	return 'status-unknown'
}

// 格式化时间
const formatTime = (time) => {
	if (!time) return '-'
	// 如果已经是格式化好的时间，直接返回
	if (typeof time === 'string' && time.includes(' ')) {
		return time
	}
	// 否则尝试格式化
	try {
		const date = new Date(time)
		return date.toLocaleString('zh-CN', {
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			second: '2-digit'
		}).replace(/\//g, '-')
	} catch (e) {
		return time
	}
}

// 获取任务列表
const getTaskList = async (isRefresh = false) => {
	if (loading.value) return
	
	loading.value = true
	
	try {
		// 如果是刷新，重置页码
		if (isRefresh) {
			page.value = 1
			taskList.value = []
		}
		
		// 构建请求参数
		const params = {
			page: page.value,
			pageSize: pageSize.value,
			shop_name: filterParams.value.shop_name || null,
			off_id: filterParams.value.off_id || null,
			func_code: filterParams.value.func_code || null,
			run_status: filterParams.value.run_status !== null && filterParams.value.run_status !== undefined ? Number(filterParams.value.run_status) : null,
			shop_type: shopType.value ? (Number(shopType.value) === 10 ? 1001 : Number(shopType.value)) : null
		}
		
		const res = await ManagementApi.getFuncRunTaskPage(params)
		
		if (res && (res.code === 200 || res.Success)) {
			const data = res.data || res.Data
			const rows = data.rows || data.Rows || []
			total.value = data.total || data.Total || 0
			
			// 分页模式：直接替换列表，不追加
			taskList.value = rows
			
			hasMore.value = taskList.value.length < total.value
		} else {
			uni.showToast({
				title: res?.message || res?.Msg || '获取任务列表失败',
				icon: 'none',
				duration: 2000
			})
		}
	} catch (error) {
		console.error('获取任务列表失败:', error)
		uni.showToast({
			title: error.message || '获取任务列表失败',
			icon: 'none',
			duration: 2000
		})
	} finally {
		loading.value = false
		isRefreshing.value = false
	}
}

// 查询
const handleQuery = () => {
	page.value = 1
	taskList.value = []
	getTaskList(true)
}

// 功能选择变化
const handleFuncChange = (e) => {
	funcIndex.value = e.detail.value
	filterParams.value.func_code = funcOptions.value[e.detail.value].value
}

// 状态选择变化
const handleStatusChange = (e) => {
	statusIndex.value = e.detail.value
	filterParams.value.run_status = statusOptions[e.detail.value].value
}

// 重置
const handleReset = () => {
	filterParams.value = {
		shop_name: null,
		off_id: null,
		func_code: null,
		run_status: null
	}
	funcIndex.value = 0
	statusIndex.value = 0
	page.value = 1
	taskList.value = []
	getTaskList(true)
}

// 刷新
const handleRefresh = () => {
	isRefreshing.value = true
	page.value = 1
	taskList.value = []
	getTaskList(true)
}

// 加载更多
const loadMore = () => {
	if (!hasMore.value || loading.value) return
	const nextPage = page.value + 1
	if (nextPage > totalPages.value) return
	page.value = nextPage
	getTaskList(false)
}

// 跳转到指定页
const goToPage = (targetPage) => {
	if (targetPage < 1 || targetPage > totalPages.value) return
	page.value = targetPage
	taskList.value = []
	getTaskList(true)
}

// 重新触发
const handleRetrigger = async (task) => {
	uni.showModal({
		title: '确认重新触发',
		content: `是否确认重新触发任务"${getFuncName(task.func_code)}"？`,
		success: async (res) => {
			if (res.confirm) {
				uni.showLoading({ title: '执行中...', mask: true })
				
				try {
					// 解析配置JSON（如果存在）
					let confValues = null
					if (task.conf_json) {
						try {
							confValues = typeof task.conf_json === 'string' ? JSON.parse(task.conf_json) : task.conf_json
						} catch (e) {
							console.warn('解析配置JSON失败:', e)
						}
					}
					
					const triggerRes = await ManagementApi.triggerFuncRun({
						func_code: task.func_code,
						shop_ids: [task.shop_id],
						default_conf_values: confValues,
						shop_conf_values: null
					})
					
					if (triggerRes && (triggerRes.code === 200 || triggerRes.Success)) {
						uni.showToast({
							title: '重新触发成功',
							icon: 'success',
							duration: 2000
						})
						// 刷新列表
						setTimeout(() => {
							handleRefresh()
						}, 1500)
					} else {
						uni.showToast({
							title: triggerRes?.message || triggerRes?.Msg || '重新触发失败',
							icon: 'none',
							duration: 2000
						})
					}
				} catch (error) {
					console.error('重新触发失败:', error)
					uni.showToast({
						title: error.message || '重新触发失败，请重试',
						icon: 'none',
						duration: 2000
					})
				} finally {
					uni.hideLoading()
				}
			}
		}
	})
}

// 返回
const handleClickLeft = () => {
	uni.navigateBack({
		delta: 1
	})
}

// 页面加载
onLoad((options) => {
	if (options.shopType) {
		shopType.value = options.shopType
	}
	if (options.shopId) {
		shopId.value = options.shopId
	}
	// 初始加载
	getTaskList(true)
})
</script>

<style lang="scss" scoped>
.task-query-page {
	width: 100%;
	height: 100vh;
	background: #F5F5F5;
	display: flex;
	flex-direction: column;
	overflow: hidden;
	
	.content-wrapper {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 100%;
	}
	
	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		width: 100%;
		min-height: 0;
	}
	
	.filter-section {
		background: #fff;
		padding: 20rpx;
		margin-bottom: 20rpx;
		
		.filter-row {
			display: flex;
			gap: 20rpx;
			margin-bottom: 16rpx;
			
			.filter-input {
				flex: 1;
			}
			
			.filter-select-wrapper {
				flex: 1;
				
				.filter-select {
					height: 68rpx;
					line-height: 68rpx;
					padding: 0 24rpx;
					background: #F5F5F5;
					border-radius: 8rpx;
					font-size: 28rpx;
					color: #333;
					display: flex;
					justify-content: space-between;
					align-items: center;
					
					.select-arrow {
						font-size: 20rpx;
						color: #999;
					}
				}
			}
		}
		
		.filter-buttons {
			display: flex;
			gap: 20rpx;
			justify-content: flex-end;
			margin-top: 8rpx;
			
			.filter-btn {
				padding: 10rpx 32rpx;
				border-radius: 8rpx;
				font-size: 26rpx;
				text-align: center;
				line-height: 1.4;
				
				&.query-btn {
					background: #2CCA87;
					color: #fff;
				}
				
				&.reset-btn {
					background: #F5F5F5;
					color: #333;
				}
			}
		}
	}
	
	.task-list {
		flex: 1;
		padding: 0 20rpx;
		box-sizing: border-box;
		width: 100%;
		min-height: 0;
		
		.loading-text,
		.empty-text {
			text-align: center;
			padding: 40rpx 0;
			color: #999;
			font-size: 28rpx;
		}
		
		.task-item {
			background: #fff;
			border-radius: 14rpx;
			padding: 18rpx 20rpx;
			margin-bottom: 16rpx;
			box-sizing: border-box;
			width: 100%;
			
			.task-header {
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-bottom: 14rpx;
				
				.task-shop-name {
					font-size: 30rpx;
					font-weight: 600;
					color: #333;
					flex: 1;
					overflow: hidden;
					text-overflow: ellipsis;
					white-space: nowrap;
				}
				
				.task-status {
					padding: 6rpx 16rpx;
					border-radius: 20rpx;
					font-size: 22rpx;
					
					&.status-pending {
						background: #FFF7E6;
						color: #FA8C16;
					}
					
					&.status-running {
						background: #E6F4FF;
						color: #1890FF;
					}
					
					&.status-success {
						background: #E6F7F0;
						color: #2CCA87;
					}
					
					&.status-failed {
						background: #FEE;
						color: #FF4D4F;
					}
					
					&.status-unknown {
						background: #F5F5F5;
						color: #999;
					}
				}
			}
			
			.task-info {
				.info-row {
					display: flex;
					margin-bottom: 10rpx;
					font-size: 24rpx;
					
					.info-label {
						color: #999;
						width: 120rpx;
						flex-shrink: 0;
					}
					
					.info-value {
						color: #333;
						flex: 1;
						
						&.result-msg {
							word-break: break-all;
							
							&.error-msg {
								color: #FF4D4F;
							}
						}
					}
				}
				
				.info-row-double {
					display: flex;
					gap: 20rpx;
					margin-bottom: 10rpx;
					
					.info-item {
						flex: 1;
						display: flex;
						font-size: 24rpx;
						min-width: 0;
						
						.info-label {
							color: #999;
							flex-shrink: 0;
							white-space: nowrap;
						}
						
						.info-value {
							color: #333;
							flex: 1;
							overflow: hidden;
							text-overflow: ellipsis;
							white-space: nowrap;
							min-width: 0;
							
							&.time-value {
								font-size: 22rpx;
							}
						}
					}
				}
			}
			
			.task-actions {
				margin-top: 14rpx;
				display: flex;
				justify-content: flex-end;
				
				.action-btn {
					padding: 10rpx 28rpx;
					border-radius: 8rpx;
					font-size: 24rpx;
					
					&.retrigger-btn {
						background: #2CCA87;
						color: #fff;
					}
				}
			}
		}
		
		.loading-more,
		.no-more {
			text-align: center;
			padding: 20rpx 0;
			color: #999;
			font-size: 24rpx;
		}
	}
	
	.pagination {
		background: #fff;
		padding: 20rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-top: 1px solid #F0F0F0;
		flex-shrink: 0;
		width: 100%;
		box-sizing: border-box;
		
		.pagination-info {
			font-size: 26rpx;
			color: #666;
		}
		
		.pagination-controls {
			display: flex;
			align-items: center;
			gap: 20rpx;
			
			.page-btn {
				padding: 8rpx 20rpx;
				border-radius: 8rpx;
				background: #2CCA87;
				color: #fff;
				font-size: 26rpx;
				
				&.disabled {
					background: #F5F5F5;
					color: #999;
				}
			}
			
			.page-info {
				font-size: 26rpx;
				color: #333;
			}
		}
	}
}
</style>

