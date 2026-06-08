<template>
	<view class="service-manage">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="客服管理" left-text="返回" left-arrow @click-left="handleClickLeft" :bordered="false"></wd-navbar>
		
		<!-- 主内容区域 -->
		<view class="main-content" :style="{paddingTop: (systemBarHeight + 44) + 'px'}">
			<!-- 顶部固定区域：选项卡和搜索框 -->
			<view class="header-section">
				<!-- 切换标签 -->
				<view class="tabs-container">
					<view 
						class="tab-item" 
						:class="{ 'active': currentTab === 'service' }"
						@click="switchTab('service')"
					>
						<text class="tab-text">已设置客服</text>
					</view>
					<view 
						class="tab-item" 
						:class="{ 'active': currentTab === 'all' }"
						@click="switchTab('all')"
					>
						<text class="tab-text">全部成员</text>
					</view>
				</view>
				
				<!-- 搜索框 -->
				<view class="search-container">
					<view class="search-box">
						<text class="search-icon">🔍</text>
						<input 
							class="search-input" 
							v-model="searchKeyword" 
							placeholder="搜索账号或手机号"
							@confirm="handleMemberSearch"
						/>
						<view class="search-clear" v-if="searchKeyword" @click="clearSearch">
							<text>✕</text>
						</view>
					</view>
					<view class="member-search-btn" @click="handleMemberSearch" :class="{ 'disabled': !canMemberSearch }">
						<text>搜索</text>
					</view>
				</view>
			</view>
			
			<!-- 成员列表区域（可滚动） -->
			<scroll-view 
				class="member-list-scroll" 
				scroll-y="true"
				:refresher-enabled="true"
				:refresher-triggered="refreshing"
				@refresherrefresh="handleRefresh"
				@scrolltolower="loadMore"
				:style="`height: calc(100vh - ${systemBarHeight}px - 44px - 88rpx - 70rpx - 50px - env(safe-area-inset-bottom));`"
			>
				<view class="member-list">
					<view class="member-item" v-for="member in (memberList || [])" :key="member.id">
				<view class="member-header">
					<image class="member-avatar" :src="avatarImage" mode="aspectFill" @error="handleAvatarError"></image>
					<view class="member-info">
						<view class="member-name-row">
							<view class="member-name">{{ member.user_name || '未知账号' }}</view>
							<view class="member-badges">
								<view class="badge-item" v-if="member.isService" :class="{ 'badge-service': true }">
									<text class="badge-text">客服</text>
								</view>
								<view class="badge-item" :class="{ 'badge-active': member.avtag, 'badge-inactive': !member.avtag }">
									<text class="badge-text">{{ member.avtag ? '启用' : '停用' }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
				
				<view class="member-body">
					<view class="member-detail-row">
						<view class="member-detail-item">
							<text class="detail-label">手机号:</text>
							<text class="detail-value">{{ member.phone || '-' }}</text>
						</view>
						<view class="member-detail-item">
							<text class="detail-label">邀请码:</text>
							<text class="detail-value">{{ member.code || '-' }}</text>
						</view>
					</view>
					<view class="member-detail-row">
						<view class="member-detail-item">
							<text class="detail-label">剩余积分:</text>
							<text class="detail-value">{{ formatBalance(member.balance) }}</text>
						</view>
						<view class="member-detail-item">
							<text class="detail-label">注册时间:</text>
							<text class="detail-value">{{ formatTime(member.crtim) }}</text>
						</view>
					</view>
					<view class="member-detail-row">
						<view class="member-detail-item notes-item">
							<text class="detail-label">备注:</text>
							<input 
								class="detail-input" 
								v-model="member.notes" 
								placeholder="点击输入备注"
								@input="handleNotesInput(member)"
								@blur="handleNotesBlur(member)"
							/>
							<view class="notes-save-btn" @click="handleUpdateNotes(member)" v-if="member.hasNotesChanged">
								<text class="save-btn-text">保存</text>
							</view>
						</view>
					</view>
					<view class="assigned-shops" v-if="member.isService">
						<text class="shops-label">已分配店铺:</text>
						<text class="shops-count">{{ member.assignedShopCount || 0 }}个</text>
					</view>
				</view>
				
				<view class="member-footer">
					<view 
						class="action-btn assign-shop-btn" 
						v-if="member.isService"
						@click="handleAssignShop(member)"
					>
						<text class="btn-text">分配店铺</text>
					</view>
					<view 
						class="action-btn set-service-btn" 
						:class="{ 'active': member.isService }"
						@click="handleSetService(member)"
					>
						<text class="btn-text">{{ member.isService ? '取消客服' : '设为客服' }}</text>
					</view>
				</view>
			</view>
			
					<view class="empty-state" v-if="!loading && (!memberList || memberList.length === 0)">
						<text class="empty-text">暂无成员</text>
					</view>
					
					<view class="loading-more" v-if="loading">
						<text class="loading-text">加载中...</text>
					</view>
				</view>
			</scroll-view>
			
			<!-- 分页组件（固定在底部） -->
			<view class="pagination-section" v-if="total > 0">
			<view class="pagination-wrapper">
				<!-- 首页按钮 -->
				<view class="pagination-first-btn" @click="goToFirstPage">
					<text class="first-btn-text">首页</text>
				</view>
				<wd-pagination class="pagination-pager" v-model.async="pageIndex"
					:total="total" :page-size.async="pageSize" @change="handlePageChange"
					show-icon></wd-pagination>
				<!-- 可编辑页码输入框 -->
				<view class="pagination-page-input">
					<input ref="pageInputRef" class="page-input" type="number" :value="pageIndex" @input="handlePageInputChange" @blur="handlePageInput" @confirm="handlePageInput" />
					<text class="page-separator">/</text>
					<text class="page-total">{{ totalPages }}</text>
				</view>
				<!-- 末页按钮 -->
				<view class="pagination-last-btn" @click="goToLastPage">
					<text class="last-btn-text">末页</text>
				</view>
			</view>
		</view>
		</view>
		
		<!-- 分配店铺弹窗 -->
		<wd-popup v-model="assignShopVisible" position="center" closable title="分配店铺" :z-index="600" custom-style="width: 90%;max-height: 85vh;">
			<view class="assign-shop-popup" @touchmove.stop.prevent>
				<view class="popup-title">为 {{ currentMember?.user_name || currentMember?.phone || '未知成员' }} 分配店铺</view>
				
				<!-- 平台类型选择器 -->
				<view class="platform-selector">
					<view class="platform-grid">
						<view 
							class="platform-item" 
							v-for="platform in platformList" 
							:key="platform.shopType"
							:class="{ 'active': selectedShopType === platform.shopType }"
							@click="selectPlatform(platform.shopType)"
						>
							<image v-if="platform.logo" class="platform-logo" :src="platform.logo" mode="aspectFit"></image>
							<text class="platform-label">{{ platform.label }}</text>
						</view>
					</view>
				</view>
				
				<!-- 上下布局 -->
				<view class="shop-list-container-vertical">
					<!-- 上方：未分配店铺 -->
					<view class="shop-list-panel unassigned-panel">
						<view class="panel-header">
							<text class="panel-title">未分配店铺 ({{ unassignedTotal }})</text>
							<view class="panel-search">
								<input 
									class="search-input-small" 
									v-model="unassignedSearchKeyword" 
									placeholder="请输入店铺名或ID"
									@input="handleUnassignedSearchInput"
									@confirm="handleSearchUnassigned"
								/>
								<view class="search-btn" @click="handleSearchUnassigned" :class="{ 'disabled': !canSearch }">
									<text>搜索</text>
								</view>
							</view>
						</view>
						<scroll-view class="panel-content" scroll-y="true" :style="`height: ${unassignedPanelHeight}px;`" @touchmove.stop.prevent>
							<view 
								class="shop-item" 
								v-for="shop in (unassignedShops || [])" 
								:key="shop.id || shop.shopId"
								@click="toggleUnassignedShop(shop)"
							>
								<view class="shop-checkbox" :class="{ 'checked': isUnassignedShopSelected(shop.id || shop.shopId) }">
									<text v-if="isUnassignedShopSelected(shop.id || shop.shopId)">✓</text>
								</view>
								<view class="shop-info">
									<text class="shop-name">{{ shop.name || shop.shopName || '未知店铺' }}</text>
									<text class="shop-id">门店ID: {{ shop.shopOfficeId || shop.ShopOfficeId || shop.shopId || shop.ShopId || shop.id || '-' }}</text>
									<text class="shop-group" v-if="shop.groupName">分组: {{ shop.groupName }}</text>
								</view>
							</view>
							<view class="empty-state-small" v-if="!unassignedLoading && (!unassignedShops || unassignedShops.length === 0)">
								<text>暂无店铺</text>
							</view>
							<view class="loading-state-small" v-if="unassignedLoading">
								<text>加载中...</text>
							</view>
						</scroll-view>
						<!-- 未分配店铺分页 -->
						<view class="panel-pagination" v-if="unassignedTotal > 0">
							<view class="pagination-btn" @click="goToUnassignedPrevPage" :class="{ 'disabled': unassignedPageIndex === 1 }">上一页</view>
							<view class="pagination-info">{{ unassignedPageIndex }} / {{ unassignedTotalPages }}</view>
							<view class="pagination-btn" @click="goToUnassignedNextPage" :class="{ 'disabled': unassignedPageIndex >= unassignedTotalPages }">下一页</view>
						</view>
					</view>
					
					<!-- 中间：转移按钮 -->
					<view class="transfer-buttons-horizontal">
						<view class="transfer-btn-horizontal assign-btn" @click="assignSelectedShops" :class="{ 'disabled': !selectedUnassignedShops || selectedUnassignedShops.length === 0 }">
							<text>分配选中店铺 ↓</text>
						</view>
						<view class="transfer-btn-horizontal unassign-btn" @click="unassignSelectedShops" :class="{ 'disabled': !selectedAssignedShops || selectedAssignedShops.length === 0 }">
							<text>取消分配选中店铺 ↑</text>
						</view>
					</view>
					
					<!-- 下方：已分配店铺 -->
					<view class="shop-list-panel assigned-panel">
						<view class="panel-header">
							<text class="panel-title">已分配店铺 ({{ assignedTotal }})</text>
						</view>
						<scroll-view class="panel-content" scroll-y="true" :style="`height: ${assignedPanelHeight}px;`" @touchmove.stop.prevent>
							<view 
								class="shop-item" 
								v-for="shop in (assignedShops || [])" 
								:key="shop.id || shop.shopId"
								@click="toggleAssignedShop(shop)"
							>
								<view class="shop-checkbox" :class="{ 'checked': isAssignedShopSelected(shop.id || shop.shopId) }">
									<text v-if="isAssignedShopSelected(shop.id || shop.shopId)">✓</text>
								</view>
								<view class="shop-info">
									<text class="shop-name">{{ shop.name || shop.shopName || '未知店铺' }}</text>
									<text class="shop-id">门店ID: {{ shop.shopOfficeId || shop.ShopOfficeId || shop.shopId || shop.ShopId || shop.id || '-' }}</text>
									<text class="shop-group" v-if="shop.groupName">分组: {{ shop.groupName }}</text>
								</view>
							</view>
							<view class="empty-state-small" v-if="!assignedLoading && (!assignedShops || assignedShops.length === 0)">
								<text>暂无店铺</text>
							</view>
							<view class="loading-state-small" v-if="assignedLoading">
								<text>加载中...</text>
							</view>
						</scroll-view>
						<!-- 已分配店铺分页 -->
						<view class="panel-pagination" v-if="assignedTotal > 0">
							<view class="pagination-btn" @click="goToAssignedPrevPage" :class="{ 'disabled': assignedPageIndex === 1 }">上一页</view>
							<view class="pagination-info">{{ assignedPageIndex }} / {{ assignedTotalPages }}</view>
							<view class="pagination-btn" @click="goToAssignedNextPage" :class="{ 'disabled': assignedPageIndex >= assignedTotalPages }">下一页</view>
						</view>
					</view>
				</view>
				
				<view class="popup-footer">
					<view class="popup-btn cancel-btn" @click="closeAssignShopPopup">
						<text>关闭</text>
					</view>
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup>
	import { ref, onMounted, computed, nextTick } from 'vue'
	import request from '@/utils/request'
	import { GroupApi } from '@/api/group'
	import { ShopApi } from '@/api/shop'
	import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'

	const systemBarHeight = ref(0)
	const currentTab = ref('service') // 'service' | 'all'
	const memberList = ref([])
	const loading = ref(false)
	const refreshing = ref(false)
	const pageIndex = ref(1)
	const pageSize = ref(10)
	const searchKeyword = ref('')
	const avatarImage = ref('/static/img/juhekfu-logo.png')
	const total = ref(0)
	
	// 成员搜索优化相关
	const MEMBER_THROTTLE_INTERVAL = 2000 // 节流间隔（毫秒）
	
	// 成员搜索缓存：key为 "keyword_tab"，value为搜索结果
	const memberSearchCache = ref(new Map())
	
	// 成员搜索防抖和节流相关
	let memberSearchTimer = null
	let memberLastSearchTime = 0
	const assignShopVisible = ref(false)
	const currentMember = ref(null)
	const availableShops = ref([])
	const selectedShopIds = ref([])
	
	// 平台类型选择器相关
	const platformLogos = new Map()
	platformLogos.set(1, 'https://p0.meituan.net/shangouproductapi/8bb7f604d4c10239f736f2c450ce92ef93342.png') // 美团外卖
	platformLogos.set(2, 'https://p0.meituan.net/shangouproductapi/280765bbbe4aeb0603d386eea888ab8c151948.png') // 饿了么
	platformLogos.set(3, 'https://p0.meituan.net/shangouproductapi/e4f5dff1d5445c2895d6ca9e3a55bf2744440.png') // 美团闪购
	platformLogos.set(4, 'https://p0.meituan.net/shangouproductapi/a4022ea3fb17f68c43ecbfcec893c836102681.png') // 美团医药
	platformLogos.set(5, 'https://p0.meituan.net/shangouproductapi/546c580071907f18b7b9ea913fc29812158401.png') // 饿百零售
	platformLogos.set(6, 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png') // 京东到家
	
	const shopTypeToLogoKey = {
		1: 1,  // 美团外卖
		2: 2,  // 饿了么
		3: 3,  // 美团闪购
		4: 4,  // 美团医药
		5: 5,  // 饿百零售
		6: 6,  // 京东到家
	}
	
	const platformList = ref([
		{ label: '美团', shopType: ShopType.美团, logo: platformLogos.get(shopTypeToLogoKey[1]) },
		{ label: '饿了么', shopType: ShopType.饿了么, logo: platformLogos.get(shopTypeToLogoKey[2]) },
		{ label: '美团闪购', shopType: ShopType.美团闪购, logo: platformLogos.get(shopTypeToLogoKey[3]) },
		{ label: '美团医药', shopType: ShopType.美团医药, logo: platformLogos.get(shopTypeToLogoKey[4]) },
		{ label: '饿百零售', shopType: ShopType.饿百零售, logo: platformLogos.get(shopTypeToLogoKey[5]) },
		{ label: '京东到家', shopType: ShopType.京东到家, logo: platformLogos.get(shopTypeToLogoKey[6]) },
	])
	
	const selectedShopType = ref(null) // null表示全部
	
	// 未分配店铺相关
	const unassignedShops = ref([])
	const unassignedPageIndex = ref(1)
	const unassignedPageSize = ref(20)
	const unassignedTotal = ref(0)
	const unassignedLoading = ref(false)
	const unassignedSearchKeyword = ref('')
	const selectedUnassignedShops = ref([])
	
	// 搜索优化相关
	const MIN_SEARCH_LENGTH = 2 // 最小搜索字符数
	const DEBOUNCE_DELAY = 800 // 防抖延迟（毫秒）
	const THROTTLE_INTERVAL = 2000 // 节流间隔（毫秒）
	
	// 搜索缓存：key为 "keyword_shopType"，value为搜索结果
	const searchCache = ref(new Map())
	
	// 防抖和节流相关
	let debounceTimer = null
	let lastSearchTime = 0
	
	// 计算是否可以搜索
	const canSearch = computed(() => {
		return unassignedSearchKeyword.value.trim().length >= MIN_SEARCH_LENGTH
	})
	
	// 已分配店铺相关
	const assignedShops = ref([])
	const assignedPageIndex = ref(1)
	const assignedPageSize = ref(20)
	const assignedTotal = ref(0)
	const assignedLoading = ref(false)
	const selectedAssignedShops = ref([])
	
	const unassignedTotalPages = computed(() => Math.ceil(unassignedTotal.value / unassignedPageSize.value) || 1)
	const assignedTotalPages = computed(() => Math.ceil(assignedTotal.value / assignedPageSize.value) || 1)
	
	// 计算面板高度（上下布局时，每个面板占可用高度的一半）
	const unassignedPanelHeight = ref(200)
	const assignedPanelHeight = ref(200)
	
	// 更新面板高度
	const updatePanelHeights = () => {
		uni.getSystemInfo({
			success: (res) => {
				// 弹窗可用高度 = 屏幕高度 * 0.85 - 标题 - 平台选择器 - 转移按钮 - 分页 - 底部按钮 - 边距
				const availableHeight = res.windowHeight * 0.85 - 100 - 200 - 80 - 60 - 100
				const panelHeight = Math.max(200, availableHeight / 2)
				unassignedPanelHeight.value = panelHeight
				assignedPanelHeight.value = panelHeight
			}
		})
	}

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight
			}
		})
	}

	const handleClickLeft = () => {
		uni.navigateBack()
	}

	const switchTab = (tab) => {
		currentTab.value = tab
		pageIndex.value = 1
		memberList.value = []
		loadMemberList()
	}

	// 加载成员列表（带缓存）
	const loadMemberListWithCache = async (cacheKey, keyword) => {
		if (loading.value) return
		
		loading.value = true
		try {
			const params = {
				page: pageIndex.value,
				pageSize: pageSize.value,
				word: keyword,
				avtag: null,
				role: currentTab.value === 'service' ? 'KEFU' : null,
				userType: 1,
				groupId: ''
			}
			
			const result = await GroupApi.getAdminList(params)
			
			// 处理响应数据 - 支持多种响应格式
			let responseData = null
			if (result) {
				// 如果 result 有 data 字段，使用 data
				if (result.data !== undefined) {
					responseData = result.data
				}
				// 如果 result 直接包含 rows 和 total，直接使用
				else if (result.rows !== undefined || result.Rows !== undefined) {
					responseData = result
				}
				// 如果 result 有 Data 字段（大写）
				else if (result.Data !== undefined) {
					responseData = result.Data
				}
			}
			
			if (responseData) {
				// 获取 rows 数据（支持 rows 或 Rows）
				const rows = responseData.rows || responseData.Rows || []
				// 获取 total（支持 total 或 Total）
				const totalCount = responseData.total || responseData.Total || 0
				
				const members = rows.map(member => {
					// 判断是否有客服角色
					const isService = Array.isArray(member.role) && member.role.includes('KEFU')
					
					return {
						...member,
						isService: isService,
						assignedShopCount: 0,
						originalNotes: member.notes || '', // 保存原始备注，用于比较是否变化
						hasNotesChanged: false // 标记备注是否已修改
					}
				})
				
				memberList.value = members
				total.value = totalCount
				
				// 缓存搜索结果（只缓存第一页数据）
				if (pageIndex.value === 1 && keyword) {
					memberSearchCache.value.set(cacheKey, {
						members: members,
						total: totalCount,
						timestamp: Date.now()
					})
					
					// 限制缓存大小，最多保留50条缓存
					limitCacheSize(memberSearchCache.value, 50)
				}
			} else {
				memberList.value = []
				total.value = 0
			}
		} catch (error) {
			// 加载成员列表失败，已在 uni.showToast 中提示用户
			uni.showToast({
				title: '加载失败，请重试',
				icon: 'none'
			})
			memberList.value = []
			total.value = 0
		} finally {
			loading.value = false
			refreshing.value = false
		}
	}
	
	// 加载成员列表（用于分页等场景，不使用缓存）
	const loadMemberList = async () => {
		if (loading.value) return
		
		loading.value = true
		try {
			const keyword = searchKeyword.value.trim()
			const params = {
				page: pageIndex.value,
				pageSize: pageSize.value,
				word: keyword || '',
				avtag: null,
				role: currentTab.value === 'service' ? 'KEFU' : null,
				userType: 1,
				groupId: ''
			}
			
			const result = await GroupApi.getAdminList(params)
			
			// 处理响应数据 - 支持多种响应格式
			let responseData = null
			if (result) {
				// 如果 result 有 data 字段，使用 data
				if (result.data !== undefined) {
					responseData = result.data
				}
				// 如果 result 直接包含 rows 和 total，直接使用
				else if (result.rows !== undefined || result.Rows !== undefined) {
					responseData = result
				}
				// 如果 result 有 Data 字段（大写）
				else if (result.Data !== undefined) {
					responseData = result.Data
				}
			}
			
			if (responseData) {
				// 获取 rows 数据（支持 rows 或 Rows）
				const rows = responseData.rows || responseData.Rows || []
				// 获取 total（支持 total 或 Total）
				const totalCount = responseData.total || responseData.Total || 0
				
				const members = rows.map(member => {
					// 判断是否有客服角色
					const isService = Array.isArray(member.role) && member.role.includes('KEFU')
					
					return {
						...member,
						isService: isService,
						assignedShopCount: 0,
						originalNotes: member.notes || '', // 保存原始备注，用于比较是否变化
						hasNotesChanged: false // 标记备注是否已修改
					}
				})
				
				memberList.value = members
				total.value = totalCount
			} else {
				memberList.value = []
				total.value = 0
			}
		} catch (error) {
			// 加载成员列表失败，已在 uni.showToast 中提示用户
			uni.showToast({
				title: '加载失败，请重试',
				icon: 'none'
			})
			memberList.value = []
			total.value = 0
		} finally {
			loading.value = false
			refreshing.value = false
		}
	}

	const loadMore = () => {
		// 移除上拉加载更多，改用分页组件
	}
	
	const totalPages = computed(() => {
		return Math.ceil(total.value / pageSize.value) || 1
	})
	
	const handlePageChange = () => {
		loadMemberList()
	}
	
	const goToFirstPage = () => {
		if (pageIndex.value === 1) return
		pageIndex.value = 1
		loadMemberList()
	}
	
	const goToLastPage = () => {
		if (pageIndex.value >= totalPages.value) return
		pageIndex.value = totalPages.value
		loadMemberList()
	}
	
	// 页码输入框引用
	const pageInputRef = ref(null)
	
	// 调整输入框宽度
	const adjustInputWidth = (value) => {
		nextTick(() => {
			if (!pageInputRef.value) return
			const str = String(value || '')
			const length = str.length || 1
			const newWidth = Math.max(50, length * 30 + 16)
			if (pageInputRef.value.style) {
				pageInputRef.value.style.width = newWidth + 'rpx'
			}
		})
	}
	
	// 页码输入变化处理
	const handlePageInputChange = (e) => {
		const value = e.detail ? e.detail.value : (e.target ? e.target.value : '')
		adjustInputWidth(value)
	}
	
	// 页码输入处理
	const handlePageInput = (e) => {
		const value = e.detail ? (e.detail.value || '') : (e.target ? (e.target.value || '') : '')
		const page = parseInt(value)
		const totalPagesValue = totalPages.value
		
		if (!value || !page || isNaN(page) || page < 1) {
			pageIndex.value = 1
			adjustInputWidth(1)
			loadMemberList()
			return
		}
		
		if (page > totalPagesValue) {
			pageIndex.value = totalPagesValue
			adjustInputWidth(totalPagesValue)
			loadMemberList()
			return
		}
		
		pageIndex.value = page
		adjustInputWidth(page)
		loadMemberList()
	}

	const handleRefresh = () => {
		refreshing.value = true
		loadMemberList()
	}

	const handleSetService = async (member) => {
		// 二次确认弹窗
		const action = member.isService ? '取消客服' : '设为客服'
		const memberName = member.user_name || member.phone || '该成员'
		
		uni.showModal({
			title: '确认操作',
			content: `确定要${action}「${memberName}」吗？`,
			confirmText: '确定',
			cancelText: '取消',
			success: async (res) => {
				if (res.confirm) {
					// 用户点击确定，执行操作
					try {
						uni.showLoading({ title: '处理中...' })
						
						if (member.isService) {
							// 移除客服角色
							const result = await GroupApi.removeSubordinateRoles({
								UserIds: [member.id],
								Role: 'KEFU'
							})
							
							if (result && (result.code === 200 || result.Success === true)) {
								member.isService = false
								member.assignedShopCount = 0
								
								// 如果当前在"已设置客服"标签页，移除该成员并切换到"全部成员"
								if (currentTab.value === 'service') {
									// 从列表中移除该成员
									const index = memberList.value.findIndex(m => m.id === member.id)
									if (index > -1) {
										memberList.value.splice(index, 1)
										total.value = Math.max(0, total.value - 1)
									}
									
									// 如果列表为空，切换到全部成员标签
									if (memberList.value.length === 0) {
										currentTab.value = 'all'
										pageIndex.value = 1
										loadMemberList()
									}
								}
								
								uni.showToast({
									title: '已取消客服',
									icon: 'success'
								})
							} else {
								uni.showToast({
									title: '操作失败，请重试',
									icon: 'none'
								})
							}
						} else {
							// 设置客服角色
							const result = await GroupApi.setSubordinateRoles({
								UserIds: [member.id],
								Role: 'KEFU'
							})
							
							if (result && (result.code === 200 || result.Success === true)) {
								member.isService = true
								uni.showToast({
									title: '已设为客服',
									icon: 'success'
								})
							} else {
								uni.showToast({
									title: '操作失败，请重试',
									icon: 'none'
								})
							}
						}
					} catch (error) {
						// 设置客服角色失败，已在 uni.showToast 中提示用户
						uni.showToast({
							title: '操作失败，请重试',
							icon: 'none'
						})
					} finally {
						uni.hideLoading()
					}
				}
				// 如果用户点击取消，不执行任何操作
			}
		})
	}

	const handleAssignShop = async (member) => {
		currentMember.value = member
		selectedShopType.value = ShopType.美团 // 默认加载美团店铺
		selectedUnassignedShops.value = []
		selectedAssignedShops.value = []
		unassignedPageIndex.value = 1
		assignedPageIndex.value = 1
		unassignedSearchKeyword.value = ''
		
		assignShopVisible.value = true
		
		// 更新面板高度
		nextTick(() => {
			updatePanelHeights()
		})
		
		// 加载店铺列表
		await Promise.all([
			loadUnassignedShops(),
			loadAssignedShops()
		])
	}

	// 选择平台类型
	const selectPlatform = (shopType) => {
		selectedShopType.value = shopType === selectedShopType.value ? null : shopType
		unassignedPageIndex.value = 1
		assignedPageIndex.value = 1
		selectedUnassignedShops.value = []
		selectedAssignedShops.value = []
		// 清空防抖定时器
		if (debounceTimer) {
			clearTimeout(debounceTimer)
			debounceTimer = null
		}
		// 如果有关键词且满足最小字符数，使用缓存搜索，否则直接加载
		const keyword = unassignedSearchKeyword.value.trim()
		if (keyword.length >= MIN_SEARCH_LENGTH) {
			const cacheKey = `${keyword}_${selectedShopType.value || 'all'}`
			if (searchCache.value.has(cacheKey)) {
				const cachedData = searchCache.value.get(cacheKey)
				unassignedShops.value = cachedData.shops
				unassignedTotal.value = cachedData.total
				// 平台切换使用缓存数据
			} else {
				loadUnassignedShops()
			}
		} else {
			loadUnassignedShops()
		}
		loadAssignedShops()
	}

	// 加载未分配店铺列表
	const loadUnassignedShops = async () => {
		if (!currentMember.value || unassignedLoading.value) return
		
		const keyword = unassignedSearchKeyword.value.trim()
		
		unassignedLoading.value = true
		try {
			const result = await ShopApi.getUnassignedShopsForUser(
				currentMember.value.id,
				unassignedPageIndex.value,
				unassignedPageSize.value,
				selectedShopType.value,
				keyword.length >= MIN_SEARCH_LENGTH ? keyword : ''
			)
			
			// 处理响应数据
			const { rows, totalCount } = parseShopListResponse(result)
			
			// 映射字段
			unassignedShops.value = mapShopFields(rows)
			unassignedTotal.value = totalCount
		} catch (error) {
			// 加载未分配店铺失败，已在 uni.showToast 中提示用户
			unassignedShops.value = []
			unassignedTotal.value = 0
		} finally {
			unassignedLoading.value = false
		}
	}

	// 加载已分配店铺列表
	const loadAssignedShops = async () => {
		if (!currentMember.value || assignedLoading.value) return
		
		assignedLoading.value = true
		try {
			const result = await ShopApi.getUserAssignedShops(
				currentMember.value.id,
				assignedPageIndex.value,
				assignedPageSize.value,
				selectedShopType.value
			)
			
			// 已分配店铺接口返回数据
			
			// 处理多种响应格式
			let rows = []
			let totalCount = 0
			
			if (result) {
				// 格式1: { Data: { Rows: [...], Total: 100 } }
				if (result.Data && result.Data.Rows) {
					rows = result.Data.Rows || []
					totalCount = result.Data.Total || result.Total || 0
				}
				// 格式2: { data: { rows: [...], total: 100 } }
				else if (result.data && result.data.rows) {
					rows = result.data.rows || []
					totalCount = result.data.total || result.total || 0
				}
				// 格式3: { Rows: [...], Total: 100 }
				else if (result.Rows) {
					rows = result.Rows || []
					totalCount = result.Total || 0
				}
				// 格式4: { rows: [...], total: 100 }
				else if (result.rows) {
					rows = result.rows || []
					totalCount = result.total || 0
				}
				// 格式5: 直接是数组
				else if (Array.isArray(result)) {
					rows = result
					totalCount = result.length
				}
			}
			
			// 映射字段，确保店铺名称和ID正确显示
			assignedShops.value = rows.map(shop => ({
				id: shop.ShopId || shop.shopId || shop.id,
				shopId: shop.ShopId || shop.shopId || shop.id,
				ShopId: shop.ShopId || shop.shopId || shop.id, // 保留原始字段
				shopOfficeId: shop.ShopOfficeId || shop.shopOfficeId || shop.ShopOfficeId || '',
				ShopOfficeId: shop.ShopOfficeId || shop.shopOfficeId || '', // 门店Office ID
				name: shop.ShopName || shop.shopName || shop.name || shop.Name || '未知店铺',
				shopName: shop.ShopName || shop.shopName || shop.name || shop.Name || '未知店铺',
				groupName: shop.GroupName || shop.groupName || shop.group || shop.Group
			}))
			assignedTotal.value = totalCount
		} catch (error) {
			// 加载已分配店铺失败，已在 uni.showToast 中提示用户
			assignedShops.value = []
			assignedTotal.value = 0
		} finally {
			assignedLoading.value = false
		}
	}

	// 切换未分配店铺选择
	const toggleUnassignedShop = (shop) => {
		const shopId = shop.id || shop.shopId
		if (!shopId) return
		if (!selectedUnassignedShops.value) {
			selectedUnassignedShops.value = []
		}
		const index = selectedUnassignedShops.value.indexOf(shopId)
		if (index > -1) {
			selectedUnassignedShops.value.splice(index, 1)
		} else {
			selectedUnassignedShops.value.push(shopId)
		}
	}

	// 切换已分配店铺选择
	const toggleAssignedShop = (shop) => {
		const shopId = shop.id || shop.shopId
		if (!shopId) return
		if (!selectedAssignedShops.value) {
			selectedAssignedShops.value = []
		}
		const index = selectedAssignedShops.value.indexOf(shopId)
		if (index > -1) {
			selectedAssignedShops.value.splice(index, 1)
		} else {
			selectedAssignedShops.value.push(shopId)
		}
	}

	// 检查未分配店铺是否选中
	const isUnassignedShopSelected = (shopId) => {
		if (!shopId || !selectedUnassignedShops.value) return false
		return selectedUnassignedShops.value.includes(shopId)
	}

	// 检查已分配店铺是否选中
	const isAssignedShopSelected = (shopId) => {
		if (!shopId || !selectedAssignedShops.value) return false
		return selectedAssignedShops.value.includes(shopId)
	}

	// 分配选中的店铺
	const assignSelectedShops = async () => {
		if (!currentMember.value || selectedUnassignedShops.value.length === 0) {
			uni.showToast({
				title: '请选择要分配的店铺',
				icon: 'none'
			})
			return
		}
		
		try {
			uni.showLoading({ title: '分配中...' })
			
			const result = await ShopApi.batchAssignShopsToUser({
				UserId: currentMember.value.id,
				ShopIds: selectedUnassignedShops.value
			})
			
			if (result && (result.code === 200 || result.Success === true || result.SuccessCount > 0)) {
				uni.showToast({
					title: `成功分配${result.SuccessCount || selectedUnassignedShops.value.length}个店铺`,
					icon: 'success'
				})
				
				selectedUnassignedShops.value = []
				await Promise.all([
					loadUnassignedShops(),
					loadAssignedShops()
				])
				
				// 更新成员列表中的已分配店铺数量
				const member = memberList.value.find(m => m.id === currentMember.value.id)
				if (member) {
					member.assignedShopCount = assignedTotal.value
				}
			} else {
				uni.showToast({
					title: '分配失败，请重试',
					icon: 'none'
				})
			}
		} catch (error) {
			// 分配店铺失败，已在 uni.showToast 中提示用户
			uni.showToast({
				title: '分配失败，请重试',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 取消分配选中的店铺
	const unassignSelectedShops = async () => {
		if (!currentMember.value || selectedAssignedShops.value.length === 0) {
			uni.showToast({
				title: '请选择要取消分配的店铺',
				icon: 'none'
			})
			return
		}
		
		try {
			uni.showLoading({ title: '取消分配中...' })
			
			const result = await ShopApi.batchUnassignShopsFromUser({
				UserId: currentMember.value.id,
				ShopIds: selectedAssignedShops.value
			})
			
			if (result && (result.code === 200 || result.Success === true || result.SuccessCount > 0)) {
				uni.showToast({
					title: `成功取消${result.SuccessCount || selectedAssignedShops.value.length}个店铺`,
					icon: 'success'
				})
				
				selectedAssignedShops.value = []
				await Promise.all([
					loadUnassignedShops(),
					loadAssignedShops()
				])
				
				// 更新成员列表中的已分配店铺数量
				const member = memberList.value.find(m => m.id === currentMember.value.id)
				if (member) {
					member.assignedShopCount = assignedTotal.value
				}
			} else {
				uni.showToast({
					title: '取消分配失败，请重试',
					icon: 'none'
				})
			}
		} catch (error) {
			// 取消分配店铺失败，已在 uni.showToast 中提示用户
			uni.showToast({
				title: '取消分配失败，请重试',
				icon: 'none'
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 搜索输入处理（防抖）
	const handleUnassignedSearchInput = () => {
		// 清除之前的防抖定时器
		if (debounceTimer) {
			clearTimeout(debounceTimer)
		}
		
		// 如果输入字符数不足，清空结果
		if (unassignedSearchKeyword.value.trim().length < MIN_SEARCH_LENGTH) {
			// 如果输入为空，重置为第一页并加载
			if (unassignedSearchKeyword.value.trim().length === 0) {
				unassignedPageIndex.value = 1
				loadUnassignedShops()
			}
			return
		}
		
		// 防抖：停止输入800ms后才执行搜索
		debounceTimer = setTimeout(() => {
			handleSearchUnassigned()
		}, DEBOUNCE_DELAY)
	}
	
	// 搜索未分配店铺（带节流和缓存）
	const handleSearchUnassigned = () => {
		const keyword = unassignedSearchKeyword.value.trim()
		
		// 最小字符限制
		if (keyword.length < MIN_SEARCH_LENGTH) {
			uni.showToast({
				title: `请输入至少${MIN_SEARCH_LENGTH}个字符`,
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 节流：固定时间间隔内只发送一次请求
		const now = Date.now()
		if (now - lastSearchTime < THROTTLE_INTERVAL) {
			uni.showToast({
				title: '搜索过于频繁，请稍后再试',
				icon: 'none',
				duration: 1500
			})
			return
		}
		
		// 生成缓存key（关键词+平台类型）
		const cacheKey = `${keyword}_${selectedShopType.value || 'all'}`
		
		// 检查缓存
		if (searchCache.value.has(cacheKey)) {
			const cachedData = searchCache.value.get(cacheKey)
			unassignedShops.value = cachedData.shops
			unassignedTotal.value = cachedData.total
			unassignedPageIndex.value = 1
			// 使用缓存数据，无需请求后端
			return
		}
		
		// 更新最后搜索时间
		lastSearchTime = now
		
		// 执行搜索
		unassignedPageIndex.value = 1
		loadUnassignedShopsWithCache(cacheKey, keyword)
	}
	
	// 加载未分配店铺列表（带缓存）
	const loadUnassignedShopsWithCache = async (cacheKey, keyword) => {
		if (!currentMember.value || unassignedLoading.value) return
		
		unassignedLoading.value = true
		try {
			const result = await ShopApi.getUnassignedShopsForUser(
				currentMember.value.id,
				unassignedPageIndex.value,
				unassignedPageSize.value,
				selectedShopType.value,
				keyword
			)
			
			// 处理响应数据
			const { rows, totalCount } = parseShopListResponse(result)
			
			// 映射字段，确保店铺名称和ID正确显示
			const mappedShops = mapShopFields(rows)
			
			unassignedShops.value = mappedShops
			unassignedTotal.value = totalCount
			
			// 缓存搜索结果（只缓存第一页数据）
			if (unassignedPageIndex.value === 1) {
				searchCache.value.set(cacheKey, {
					shops: mappedShops,
					total: totalCount,
					timestamp: Date.now()
				})
				// 搜索结果已缓存，使用缓存数据
				
				// 限制缓存大小，最多保留50条缓存
				if (searchCache.value.size > 50) {
					const firstKey = searchCache.value.keys().next().value
					searchCache.value.delete(firstKey)
				}
			}
		} catch (error) {
			// 加载未分配店铺失败，已在 uni.showToast 中提示用户
			unassignedShops.value = []
			unassignedTotal.value = 0
		} finally {
			unassignedLoading.value = false
		}
	}

	// 未分配店铺分页
	const goToUnassignedPrevPage = () => {
		if (unassignedPageIndex.value > 1) {
			unassignedPageIndex.value--
			loadUnassignedShops()
		}
	}

	const goToUnassignedNextPage = () => {
		if (unassignedPageIndex.value < unassignedTotalPages.value) {
			unassignedPageIndex.value++
			loadUnassignedShops()
		}
	}

	// 已分配店铺分页
	const goToAssignedPrevPage = () => {
		if (assignedPageIndex.value > 1) {
			assignedPageIndex.value--
			loadAssignedShops()
		}
	}

	const goToAssignedNextPage = () => {
		if (assignedPageIndex.value < assignedTotalPages.value) {
			assignedPageIndex.value++
			loadAssignedShops()
		}
	}

	// 关闭分配店铺弹窗
	const closeAssignShopPopup = () => {
		assignShopVisible.value = false
		selectedShopType.value = null
		selectedUnassignedShops.value = []
		selectedAssignedShops.value = []
		unassignedSearchKeyword.value = ''
	}

	// 解析店铺列表响应数据（统一处理多种响应格式）
	const parseShopListResponse = (result) => {
		let rows = []
		let totalCount = 0
		
		if (!result) {
			return { rows, totalCount }
		}
		
		// 格式1: { Data: { Rows: [...], Total: 100 } }
		if (result.Data && result.Data.Rows) {
			rows = result.Data.Rows || []
			totalCount = result.Data.Total || result.Total || 0
		}
		// 格式2: { data: { rows: [...], total: 100 } }
		else if (result.data && result.data.rows) {
			rows = result.data.rows || []
			totalCount = result.data.total || result.total || 0
		}
		// 格式3: { Rows: [...], Total: 100 }
		else if (result.Rows) {
			rows = result.Rows || []
			totalCount = result.Total || 0
		}
		// 格式4: { rows: [...], total: 100 }
		else if (result.rows) {
			rows = result.rows || []
			totalCount = result.total || 0
		}
		// 格式5: 直接是数组
		else if (Array.isArray(result)) {
			rows = result
			totalCount = result.length
		}
		
		return { rows, totalCount }
	}
	
	// 映射店铺字段（统一字段映射逻辑）
	const mapShopFields = (shops) => {
		return shops.map(shop => ({
			id: shop.ShopId || shop.shopId || shop.id,
			shopId: shop.ShopId || shop.shopId || shop.id,
			ShopId: shop.ShopId || shop.shopId || shop.id, // 保留原始字段
			shopOfficeId: shop.ShopOfficeId || shop.shopOfficeId || '',
			ShopOfficeId: shop.ShopOfficeId || shop.shopOfficeId || '', // 门店Office ID
			name: shop.ShopName || shop.shopName || shop.name || shop.Name || '未知店铺',
			shopName: shop.ShopName || shop.shopName || shop.name || shop.Name || '未知店铺',
			groupName: shop.GroupName || shop.groupName || shop.group || shop.Group
		}))
	}
	
	// 限制缓存大小（LRU策略：删除最旧的缓存）
	const limitCacheSize = (cache, maxSize) => {
		if (cache.size <= maxSize) return
		
		// 找到最旧的缓存项（timestamp最小）
		let oldestKey = null
		let oldestTime = Infinity
		
		for (const [key, value] of cache.entries()) {
			if (value.timestamp < oldestTime) {
				oldestTime = value.timestamp
				oldestKey = key
			}
		}
		
		if (oldestKey) {
			cache.delete(oldestKey)
		}
	}
	
	const formatTime = (timeStr) => {
		if (!timeStr) return '-'
		try {
			const date = new Date(timeStr)
			const year = date.getFullYear()
			const month = String(date.getMonth() + 1).padStart(2, '0')
			const day = String(date.getDate()).padStart(2, '0')
			const hours = String(date.getHours()).padStart(2, '0')
			const minutes = String(date.getMinutes()).padStart(2, '0')
			return `${year}-${month}-${day} ${hours}:${minutes}`
		} catch (error) {
			return timeStr
		}
	}

	// 格式化积分显示：整数显示整数，小数保留1位
	const formatBalance = (balance) => {
		if (balance === undefined || balance === null) return '0'
		const num = Number(balance)
		if (isNaN(num)) return '0'
		// 判断是否为整数
		if (num % 1 === 0) {
			return num.toString()
		}
		// 有小数，保留1位
		return num.toFixed(1)
	}

	// 备注输入处理
	const handleNotesInput = (member) => {
		// 标记备注已修改，但暂不保存
		if (!member.hasNotesChanged) {
			member.hasNotesChanged = true
		}
	}

	// 备注失焦处理（如果未保存，撤销更改）
	const handleNotesBlur = (member) => {
		// 如果备注已修改但未保存，撤销更改
		if (member.hasNotesChanged) {
			// 延迟执行，让保存按钮的点击事件先触发
			setTimeout(() => {
				if (member.hasNotesChanged) {
					member.notes = member.originalNotes || ''
					member.hasNotesChanged = false
				}
			}, 200)
		}
	}

	// 更新备注
	const handleUpdateNotes = async (member) => {
		if (!member || !member.id) return
		
		const originalNotes = member.originalNotes || ''
		const currentNotes = member.notes || ''
		
		// 如果备注没有变化，不调用接口
		if (originalNotes === currentNotes) {
			uni.showToast({
				title: '备注未修改',
				icon: 'none',
				duration: 1500
			})
			return
		}
		
		try {
			uni.showLoading({ title: '保存中...' })
			
			const result = await GroupApi.updateAgency({
				id: member.id,
				notes: currentNotes
			})
			
			if (result && (result.code === 200 || result.Success === true)) {
				// 更新成功，保存当前备注为原始备注
				member.originalNotes = currentNotes
				member.hasNotesChanged = false
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				// 更新失败，恢复原始备注
				member.notes = originalNotes
				member.hasNotesChanged = false
				uni.showToast({
					title: '保存失败，请重试',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			// 更新备注失败，已在 uni.showToast 中提示用户
			// 更新失败，恢复原始备注
			member.notes = originalNotes
			member.hasNotesChanged = false
			uni.showToast({
				title: '保存失败，请重试',
				icon: 'none',
				duration: 2000
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 搜索输入处理
	// 计算是否可以搜索成员（移除最小字符限制，允许随时点击搜索）
	const canMemberSearch = computed(() => {
		return true // 允许随时点击搜索按钮
	})
	
	// 注意：已移除 handleSearchInput 函数，搜索现在只在点击搜索按钮或按回车时触发
	
	// 搜索成员（点击搜索按钮或按回车时触发）
	const handleMemberSearch = () => {
		// 清除之前的防抖定时器
		if (memberSearchTimer) {
			clearTimeout(memberSearchTimer)
			memberSearchTimer = null
		}
		
		const keyword = searchKeyword.value.trim()
		
		// 如果输入为空，重置并加载全部
		if (keyword.length === 0) {
			pageIndex.value = 1
			memberList.value = []
			loadMemberList()
			return
		}
		
		// 移除最小字符限制，允许搜索任意长度的关键词
		
		// 节流：固定时间间隔内只发送一次请求
		const now = Date.now()
		if (now - memberLastSearchTime < MEMBER_THROTTLE_INTERVAL) {
			uni.showToast({
				title: '搜索过于频繁，请稍后再试',
				icon: 'none',
				duration: 1500
			})
			return
		}
		
		// 生成缓存key（关键词+标签页）
		const cacheKey = `${keyword}_${currentTab.value}`
		
		// 检查缓存（只缓存第一页数据）
		if (pageIndex.value === 1 && memberSearchCache.value.has(cacheKey)) {
			const cachedData = memberSearchCache.value.get(cacheKey)
			memberList.value = cachedData.members
			total.value = cachedData.total
			pageIndex.value = 1
			// 使用缓存数据，无需请求后端
			return
		}
		
		// 更新最后搜索时间
		memberLastSearchTime = now
		
		// 执行搜索
		pageIndex.value = 1
		memberList.value = []
		loadMemberListWithCache(cacheKey, keyword)
	}

	// 清除搜索
	const clearSearch = () => {
		// 清除防抖定时器
		if (memberSearchTimer) {
			clearTimeout(memberSearchTimer)
			memberSearchTimer = null
		}
		searchKeyword.value = ''
		pageIndex.value = 1
		memberList.value = []
		loadMemberList()
	}

	// 头像加载失败处理
	const handleAvatarError = (e) => {
		// 如果头像加载失败，使用默认头像（小柠檬 logo）
		avatarImage.value = '/static/user/jihu-logo.png'
	}

	const getShopTypeName = (shopType) => {
		const typeMap = {
			1: '美团',
			2: '淘宝',
			3: '美团闪购',
			4: '美团医药',
			5: '淘宝零售',
			6: '京东到家',
			7: '抖音'
		}
		return typeMap[shopType] || '未知'
	}

	onMounted(() => {
		getSysteminfo()
		loadMemberList()
	})
</script>

<style scoped lang="scss">
	.service-manage {
		width: 100%;
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	.main-content {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		background: #f5f5f5;
	}

	.header-section {
		background: #fff;
		z-index: 10;
		flex-shrink: 0;
	}

	.tabs-container {
		display: flex;
		background: #fff;
		border-bottom: 1px solid #e0e0e0;
		padding: 0 30rpx;
	}

	.search-container {
		padding: 12rpx 15rpx;
		background: #fff;
		border-bottom: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.search-box {
		flex: 1;
		display: flex;
		align-items: center;
		background: #f5f5f5;
		border-radius: 12rpx;
		padding: 0 20rpx;
		height: 60rpx;
	}
	
	.member-search-btn {
		height: 60rpx;
		padding: 0 32rpx;
		background: linear-gradient(135deg, rgb(60, 140, 252) 0%, rgb(60, 140, 252) 100%);
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 28rpx;
		font-weight: 500;
		white-space: nowrap;
		transition: opacity 0.3s;
		
		&:active:not(.disabled) {
			opacity: 0.8;
		}
		
		&.disabled {
			background: #d9d9d9;
			color: #999;
			pointer-events: none;
		}
	}

	.search-icon {
		font-size: 32rpx;
		margin-right: 12rpx;
		color: #999;
	}

	.search-input {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		height: 100%;
	}

	.search-clear {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 12rpx;
		color: #999;
		font-size: 28rpx;
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

	.member-list-scroll {
		flex: 1;
		width: 100%;
		background: #f5f5f5;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.member-list {
		padding: 12rpx;
		box-sizing: border-box;
		min-height: 100%;
	}

	.member-item {
		background: #fff;
		border-radius: 16rpx;
		margin-bottom: 12rpx;
		padding: 12rpx;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
	}

	.member-header {
		display: flex;
		align-items: center;
		margin-bottom: 12rpx;
	}

	.member-avatar {
		width: 70rpx;
		height: 70rpx;
		border-radius: 50%;
		margin-right: 16rpx;
		background: #f5f5f5;
	}

	.member-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.member-name-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12rpx;
	}

	.member-name {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		flex-shrink: 0;
	}

	.member-badges {
		display: flex;
		align-items: center;
		gap: 8rpx;
		flex-shrink: 0;
	}

	.badge-item {
		padding: 4rpx 12rpx;
		border-radius: 8rpx;
		background: #f5f5f5;
		border: 1px solid #e0e0e0;
	}

	.badge-service {
		background: #e6f7ff;
		border-color: #91d5ff;
	}

	.badge-active {
		background: #f6ffed;
		border-color: #b7eb8f;
	}

	.badge-inactive {
		background: #fff7e6;
		border-color: #ffd591;
	}

	.badge-text {
		font-size: 22rpx;
		color: #666;
	}

	.badge-service .badge-text {
		color: #1677ff;
	}

	.badge-active .badge-text {
		color: #52c41a;
	}

	.badge-inactive .badge-text {
		color: #fa8c16;
	}

	.member-body {
		margin-bottom: 12rpx;
		padding-top: 12rpx;
		border-top: 1px solid #f0f0f0;
	}

	.member-detail-row {
		display: flex;
		margin-bottom: 10rpx;
		gap: 20rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
	}

	.member-detail-item {
		flex: 1;
		display: flex;
		align-items: center;
		min-width: 0;
		
		&.notes-item {
			flex: 1 1 100%;
			gap: 12rpx;
		}
	}

	.detail-label {
		font-size: 26rpx;
		color: #999;
		margin-right: 10rpx;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.detail-value {
		font-size: 26rpx;
		color: #333;
		flex: 1;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.detail-input {
		flex: 1;
		font-size: 26rpx;
		color: #333;
		padding: 8rpx 12rpx;
		background: #fafafa;
		border-radius: 8rpx;
		border: 1px solid #e0e0e0;
		
		&:focus {
			background: #fff;
			border-color: #1677ff;
		}
	}

	.notes-save-btn {
		padding: 8rpx 20rpx;
		background: #1677ff;
		border-radius: 8rpx;
		flex-shrink: 0;
	}

	.save-btn-text {
		font-size: 24rpx;
		color: #fff;
	}

	.assigned-shops {
		display: flex;
		align-items: center;
		margin-top: 12rpx;
	}

	.shops-label {
		font-size: 26rpx;
		color: #999;
		margin-right: 10rpx;
	}

	.shops-count {
		font-size: 26rpx;
		color: #1677ff;
		font-weight: 600;
	}

	.member-footer {
		display: flex;
		gap: 20rpx;
		padding-top: 12rpx;
		border-top: 1px solid #f0f0f0;
	}

	.action-btn {
		flex: 1;
		height: 70rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		transition: all 0.3s;
		
		&:active {
			opacity: 0.8;
		}
	}

	.set-service-btn {
		background: linear-gradient( rgb(60, 140, 252) 0%, rgba(60, 140, 252 ) 100%);
		
		&.active {
			background: #f5f5f5;
		}
	}

	.assign-shop-btn {
		background: linear-gradient( rgb(60, 140, 252) 0%, rgba(60, 140, 252) 100%);
	}

	.btn-text {
		font-size: 26rpx;
		color: #fff;
		font-weight: 600;
		
		.set-service-btn.active & {
			color: #999;
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

	.assign-shop-popup {
		width: 100%;
		height: 100%;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background: #fff;
		overflow: hidden;
	}

	.popup-title {
		padding: 15rpx;
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		border-bottom: 1px solid #f0f0f0;
		text-align: center;
	}

	/* 平台类型选择器 */
	.platform-selector {
		padding: 10rpx;
		border-bottom: 1px solid #f0f0f0;
		background: #fff;
	}

	.platform-grid {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 10rpx;
	}

	.platform-item {
		display: flex;
		flex-direction: row;
		align-items: center;
		justify-content: flex-start;
		padding: 12rpx 16rpx;
		border-radius: 8rpx;
		background: #f5f5f5;
		border: 1px solid #e0e0e0;
		transition: all 0.3s;
		min-height: 25rpx;
		height: 25rpx;
		
		&.active {
			background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
			border-color: #1677ff;
			
			.platform-label {
				color: #fff;
			}
		}
	}

	.platform-logo {
		width: 36rpx;
		height: 36rpx;
		margin-right: 12rpx;
		flex-shrink: 0;
	}

	.platform-label {
		font-size: 24rpx;
		color: #333;
		font-weight: 500;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	/* 上下布局 */
	.shop-list-container-vertical {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-height: 0;
		padding: 10rpx;
		gap: 10rpx;
		overflow: hidden;
	}

	.shop-list-panel {
		flex: 1;
		display: flex;
		flex-direction: column;
		border: 1px solid #e0e0e0;
		border-radius: 12rpx;
		background: #fff;
		overflow: hidden;
		min-height: 0;
	}

	.panel-header {
		padding: 6rpx 12rpx;
		border-bottom: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		background: #fafafa;
		min-height: 40rpx;
	}

	.panel-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
	}

	.panel-search {
		flex: 1;
		margin-left: 20rpx;
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.search-input-small {
		flex: 1;
		height: 50rpx;
		padding: 0 20rpx;
		background: #fff;
		border: 1px solid #e0e0e0;
		border-radius: 8rpx;
		font-size: 24rpx;
		color: #333;
	}

	.search-btn {
		height: 50rpx;
		padding: 0 24rpx;
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #fff;
		font-size: 24rpx;
		font-weight: 500;
		white-space: nowrap;
		transition: opacity 0.3s;
		
		&:active:not(.disabled) {
			opacity: 0.8;
		}
		
		&.disabled {
			background: #d9d9d9;
			color: #999;
			pointer-events: none;
		}
	}

	.panel-content {
		flex: 1;
		overflow-y: auto;
		min-height: 0;
		width: 100%;
	}

	.shop-item {
		display: flex;
		align-items: flex-start;
		padding: 8rpx 20rpx;
		border-bottom: 1px solid #f0f0f0;
		transition: background 0.2s;
		min-height: 60rpx;
		
		&:active {
			background: #f5f5f5;
		}
		
		&:last-child {
			border-bottom: none;
		}
	}

	.shop-checkbox {
		width: 36rpx;
		height: 36rpx;
		border: 2rpx solid #d9d9d9;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 16rpx;
		margin-top: 4rpx;
		background: #fff;
		flex-shrink: 0;
		
		&.checked {
			background: #1677ff;
			border-color: #1677ff;
			color: #fff;
			font-size: 24rpx;
		}
	}

	.shop-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		min-width: 0;
	}

	.shop-name {
		font-size: 26rpx;
		color: #333;
		margin-bottom: 4rpx;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		line-height: 1.3;
	}

	.shop-id {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 2rpx;
		line-height: 1.3;
	}

	.shop-group {
		font-size: 24rpx;
		color: #999;
	}

	.empty-state-small {
		padding: 60rpx 20rpx;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}

	.loading-state-small {
		padding: 40rpx 20rpx;
		text-align: center;
		color: #999;
		font-size: 24rpx;
	}

	/* 转移按钮（水平布局） */
	.transfer-buttons-horizontal {
		display: flex;
		flex-direction: row;
		justify-content: center;
		gap: 20rpx;
		flex-shrink: 0;
	}

	.transfer-btn-horizontal {
		flex: 1;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		border-radius: 8rpx;
		color: #fff;
		font-size: 24rpx;
		font-weight: 600;
		transition: all 0.3s;
		
		&.disabled {
			background: #f5f5f5;
			color: #ccc;
			pointer-events: none;
		}
		
		&:active:not(.disabled) {
			opacity: 0.8;
		}
	}

	/* 分页 */
	.panel-pagination {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 6rpx 16rpx;
		border-top: 1px solid #f0f0f0;
		gap: 20rpx;
		background: #fafafa;
		min-height: 50rpx;
	}

	.pagination-btn {
		padding: 8rpx 20rpx;
		background: #1677ff;
		color: #fff;
		border-radius: 6rpx;
		font-size: 24rpx;
		
		&.disabled {
			background: #f5f5f5;
			color: #ccc;
			pointer-events: none;
		}
	}

	.pagination-info {
		font-size: 24rpx;
		color: #666;
	}

	.popup-footer {
		display: flex;
		padding: 6rpx 20rpx;
		border-top: 1px solid #f0f0f0;
		gap: 20rpx;
	}

	.popup-btn {
		flex: 1;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 12rpx;
		font-size: 28rpx;
		font-weight: 500;
	}

	.cancel-btn {
		background: #1677ff;
		color: #ffffff;
	}

	.confirm-btn {
		background: linear-gradient(135deg, #1677ff 0%, #0958d9 100%);
		color: #fff;
	}

	.pagination-section {
		width: 100%;
		background-color: rgb(249, 249, 249);
		box-sizing: border-box;
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		min-height: 50px;
		max-height: 50px;
		overflow: visible !important;
		clip: none !important;
		clip-path: none !important;
		pointer-events: none;
		border-top: 1px solid #e0e0e0;
	}
	
	.pagination-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
		box-sizing: border-box;
	}
	
	.pagination-first-btn {
		position: absolute;
		left: 5%;
		top: 50%;
		transform: translateY(-50%);
		z-index: 19;
		pointer-events: auto;
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		border-radius: 4rpx;
		padding: 4rpx 12rpx;
		white-space: nowrap;
		cursor: pointer;
	}
	
	.first-btn-text {
		font-size: 24rpx;
		color: #333;
	}
	
	.pagination-last-btn {
		position: absolute;
		right: 5%;
		top: 50%;
		transform: translateY(-50%);
		z-index: 19;
		pointer-events: auto;
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		border-radius: 4rpx;
		padding: 4rpx 12rpx;
		white-space: nowrap;
		cursor: pointer;
	}
	
	.last-btn-text {
		font-size: 24rpx;
		color: #333;
	}
	
	.pagination-page-input {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		gap: 4rpx;
		z-index: 18;
		pointer-events: none;
	}
	
	.page-input {
		min-width: 50rpx;
		width: 50rpx;
		height: 36rpx;
		line-height: 36rpx;
		text-align: center;
		font-size: 30rpx;
		border: 1px solid #ddd;
		border-radius: 4rpx;
		background-color: #fff;
		padding: 0 8rpx;
		box-sizing: content-box;
		pointer-events: auto;
		transition: width 0.2s;
	}
	
	.page-separator {
		font-size: 30rpx;
		color: #333;
		pointer-events: none;
	}
	
	.page-total {
		font-size: 30rpx;
		color: #333;
		pointer-events: none;
	}
	
	/* 左翻页按钮 - 第一个 wd-button */
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type {
		position: absolute !important;
		left: 25% !important;
		top: 50% !important;
		transform: translate(-50%, -50%) !important;
		transform-origin: center center !important;
		padding: 0 !important;
		margin: 0 !important;
		margin-bottom: 0 !important;
		z-index: 17 !important;
		white-space: nowrap !important;
		overflow: visible !important;
		clip: none !important;
		clip-path: none !important;
		pointer-events: auto !important;
	}
	
	/* 左翻页按钮背景渐变 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type .wd-button {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%) !important;
		border: none !important;
	}
	
	/* 左翻页按钮禁用状态 - 添加边框和浅背景 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type[disabled] .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type[disabled] .wd-button {
		background: #f5f5f5 !important;
		border: 1px solid #e0e0e0 !important;
		opacity: 0.6 !important;
	}
	
	/* 右翻页按钮 - 最后一个 wd-button */
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type {
		position: absolute !important;
		right: 25% !important;
		left: auto !important;
		top: 50%  !important;
		transform: translate(50%, -50%) !important;
		transform-origin: center center !important;
		margin: 0 !important;
		margin-bottom: 0 !important;
		z-index: 17 !important;
		white-space: nowrap !important;
		overflow: visible !important;
		clip: none !important;
		clip-path: none !important;
		pointer-events: auto !important;
	}
	
	/* 右翻页按钮背景渐变 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type .wd-button {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%) !important;
		border: none !important;
	}
	
	/* 右翻页按钮禁用状态 - 添加边框和浅背景 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type[disabled] .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type[disabled] .wd-button {
		background: #f5f5f5 !important;
		border: 1px solid #e0e0e0 !important;
		opacity: 0.6 !important;
	}
	
	/* 页码部分居中 - 隐藏原有页码显示 */
	::v-deep .pagination-pager .wd-pager__size {
		position: absolute;
		left: 50%;
		top: 50% ;
		transform: translate(-50%, -50%);
		transform-origin: center center;
		margin: 0 !important;
		padding: 0 !important;
		font-size: 30rpx !important;
		text-align: center;
		z-index: 16 !important;
		white-space: nowrap;
		pointer-events: none !important;
		display: flex;
		align-items: center;
		gap: 4rpx;
		opacity: 0;
	}
	
	::v-deep .pagination-pager .wd-pager__current,
	::v-deep .pagination-pager .wd-pager__separator {
		margin: 0;
		padding: 0;
		font-size: 30rpx !important;
	}
</style>


