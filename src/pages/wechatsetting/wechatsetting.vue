<template>
	<view class="wechat-setting" :style="{paddingTop: systemBarHeight + 'px'}">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="微信推送设置" left-text="返回" left-arrow @click-left="handleClickLeft" :bordered="false"></wd-navbar>
		<!-- 全屏海报展示：不留边距，效果与店铺复制海报一致 -->
		<view class="poster-wrap" :style="{paddingTop: (systemBarHeight + 44 - 80) + 'px'}">
			<!-- uni-app 静态资源：用静态 src，避免字符串 alias 无法解析 -->
			<image src="@/static/img/wechatpush.png" class="poster-img" mode="widthFix"></image>
		</view>

		<!-- 底部操作区：机器人管理和推送内容设置按钮 -->
		<view class="bottom-actions">
			<view class="action-btn robot-manage-btn" @click="handleRobotManage">
				<text class="action-btn-text">机器人管理</text>
				</view>
			<view class="action-btn push-config-btn" @click="handleStartSetting">
				<text class="action-btn-text">推送内容设置</text>
			</view>
		</view>

		<!-- 续费弹窗（复用项目现有购买组件） -->
		<wd-action-sheet v-model="authGoodsVisible" :z-index="600" @close="closeAuthGoodsVisibleHandler">
			<SettingPopupPlanContent
				:is-full-popup-plan="false"
				:auth-goods-list="payList"
				:isV2="true"
				:shopId="shopId"
				:priceTitle="payParams.pricetitle"
				@close-popup="closeAuthGoodsVisibleHandler"
				:shopType="payParams.shoptype"
				@success="subscribe"
			/>
		</wd-action-sheet>

		<!-- 机器人列表弹窗 -->
		<wd-popup v-model="robotListVisible" position="center" closable
			custom-style="width: 90%;max-height: 80vh;border-radius: 20rpx;padding: 30rpx;" @close="closeRobotList"
			:z-index="601">
			<view class="robot-list-container">
				<view class="robot-list-title">机器人管理</view>
				<view class="robot-list-content" v-if="robotList.length > 0">
					<view class="robot-table">
						<!-- 表头 -->
						<view class="robot-table-header">
							<view class="robot-table-cell header-cell">机器人信息</view>
							<view class="robot-table-cell header-cell">类型</view>
							<view class="robot-table-cell header-cell">在线状态</view>
							<view class="robot-table-cell header-cell">连接状态</view>
							<view class="robot-table-cell header-cell">联系人</view>
							<view class="robot-table-cell header-cell">操作</view>
	</view>
						<!-- 数据行 -->
						<view class="robot-table-row" v-for="robot in robotList" :key="robot.id">
							<view class="robot-table-cell">
								<view class="robot-info">
									<image class="robot-avatar" :src="robot.head_img || ''" mode="aspectFill"></image>
									<view class="robot-name-id">
										<text class="robot-name">{{ robot.name || '' }}</text>
										<text class="robot-id">{{ robot.offid || '' }}</text>
									</view>
								</view>
							</view>
							<view class="robot-table-cell">
								<view class="robot-type-tag">{{ getChatTypeText(robot.chat_type) }}</view>
							</view>
							<view class="robot-table-cell">
								<view class="robot-status-tag" :class="{'status-online': robot.on_line, 'status-offline': !robot.on_line}">
									<text class="status-icon">{{ robot.on_line ? '✓' : '✗' }}</text>
									<text>{{ robot.on_line ? '在线' : '离线' }}</text>
								</view>
							</view>
							<view class="robot-table-cell">
								<view class="robot-connect-tag" :class="{'connect-connected': (robot.on_line || (robot.key && robot.key.trim() !== '')), 'connect-disconnected': !robot.on_line && (!robot.key || robot.key.trim() === '')}">
									{{ (robot.on_line || (robot.key && robot.key.trim() !== '')) ? '已连接' : '未连接' }}
								</view>
							</view>
							<view class="robot-table-cell">
								<view class="robot-contacts">
									<text class="contact-item">好友: {{ robot.friendCount || 0 }}</text>
									<text class="contact-item">群: {{ robot.groupCount || 0 }}</text>
								</view>
							</view>
							<view class="robot-table-cell">
								<view class="robot-actions">
									<view class="action-btn" :class="(robot.on_line || (robot.key && robot.key.trim() !== '')) ? 'disconnect-btn' : 'connect-btn'" @click="handleConnectRobot(robot)">
										{{ (robot.on_line || (robot.key && robot.key.trim() !== '')) ? '断开' : '连接' }}
									</view>
									<view class="action-btn admin-btn" @click="handleAdminRobot(robot)">管理员</view>
									<view class="action-btn delete-btn" @click="handleDeleteRobot(robot)">删除</view>
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="robot-list-empty" v-else>
					<text>暂无机器人数据</text>
				</view>
				
				<!-- 绑定按钮区域 -->
				<view class="robot-bind-actions" v-if="robotList.length > 0">
					<view class="bind-btn bind-friend-btn" @click="handleBindFriend">
						<text class="bind-btn-text">绑定微信号</text>
					</view>
					<view class="bind-btn bind-group-btn" @click="handleBindGroup">
						<text class="bind-btn-text">绑定微信群</text>
					</view>
				</view>
				
				<!-- 提示文本 -->
				<view class="robot-tip-text">
					<view class="robot-tip-content">
						<text>微信机器人请先在电脑端登录连接保持在线，否则手机端设置推送不生效。</text>
					</view>
					<view class="robot-tip-image-btn" @click="showRobotOnlineImage">
						<image src="@/static/img/robotonline.png" mode="aspectFit" class="robot-tip-icon"></image>
					</view>
				</view>
			</view>
		</wd-popup>
		
		<!-- 机器人在线状态图片预览弹窗 -->
		<wd-popup v-model="robotOnlineImageVisible" position="center"
			custom-style="width: 90%;max-height: 85vh;border-radius: 20rpx;padding: 0;overflow: hidden;" @close="closeRobotOnlineImage"
			:z-index="603">
			<view class="template-preview-container">
				<view class="template-preview-header">
					<view class="template-preview-title">机器人在线状态说明</view>
					<view class="template-preview-close" @click="closeRobotOnlineImage">✕</view>
				</view>
				<view class="template-preview-content" @click="toggleImageZoom">
					<image 
						src="@/static/img/robotonline.png"
						:mode="imageZoomed ? 'aspectFit' : 'widthFix'" 
						:class="['template-image', {'template-image-zoomed': imageZoomed}]"
						@click.stop="toggleImageZoom"
						@error="handleRobotImageError"
					></image>
				</view>
				<view class="template-preview-footer" v-if="!imageZoomed">
					<text class="zoom-hint">点击图片可放大查看</text>
				</view>
			</view>
		</wd-popup>
		
		<!-- 绑定好友/群列表弹窗 -->
		<wd-popup v-model="bindListVisible" position="center" closable
			custom-style="width: 95%;max-height: 85vh;border-radius: 20rpx;padding: 0;overflow: hidden;" @close="closeBindList"
			:z-index="602">
			<view class="bind-list-container">
				<!-- 标题栏 -->
				<view class="bind-list-header">
					<view class="bind-list-title">{{ bindListTitle }}</view>
				</view>
				
				<!-- 机器人信息 -->
				<view class="bind-robot-info" v-if="currentRobot">
					<text class="bind-robot-label">机器人:</text>
					<view class="bind-robot-avatar-wrapper">
						<image class="bind-robot-avatar" :src="currentRobot.head_img || ''" mode="aspectFill"></image>
						<view class="bind-robot-online-dot" v-if="currentRobot.on_line"></view>
					</view>
					<text class="bind-robot-name">{{ currentRobot.name || currentRobot.offid }}</text>
				</view>
				
				<!-- 搜索和筛选区域 -->
				<view class="bind-search-section">
					<view class="bind-search-wrapper">
						<wd-input v-model="bindSearchKeyword" placeholder="输入好友昵称或备注搜索" clearable>
							<template #prefix>
								<text style="font-size: 28rpx;">🔍</text>
							</template>
						</wd-input>
					</view>
					<view class="bind-filter-actions">
						<view class="bind-filter-checkbox" @click="bindShowBoundOnly = !bindShowBoundOnly">
							<view class="bind-checkbox-icon" :class="{'checked': bindShowBoundOnly}">
								<text v-if="bindShowBoundOnly">✓</text>
							</view>
							<text class="bind-checkbox-text">已绑定{{ bindListType === 'friend' ? '好友' : '群' }}</text>
						</view>
						<view class="bind-refresh-btn" @click="refreshBindList">
							<text class="bind-refresh-text">刷新列表</text>
						</view>
					</view>
				</view>
				
				<!-- 列表内容区域 -->
				<view class="bind-list-content">
					<view class="bind-table" v-if="bindList.length > 0">
						<!-- 表头 -->
						<view class="bind-table-header">
							<view class="bind-table-cell header-cell" style="width: 80rpx;">序号</view>
							<!-- wxid 列隐藏，不再展示 -->
							<view class="bind-table-cell header-cell" style="flex: 2;">微信昵称</view>
							<view class="bind-table-cell header-cell" style="flex: 2;">备注</view>
							<view class="bind-table-cell header-cell" style="flex: 1;">类别</view>
							<view class="bind-table-cell header-cell" style="flex: 1;">操作</view>
						</view>
						<!-- 数据行 -->
						<view class="bind-table-row" v-for="(item, index) in bindList" :key="item.Offid || index">
							<view class="bind-table-cell" style="width: 80rpx;">{{ (bindPageIndex - 1) * bindPageSize + index + 1 }}</view>
							<!-- wxid 单元格隐藏 -->
							<view class="bind-table-cell" style="flex: 2;">{{ item.Name || '' }}</view>
							<view class="bind-table-cell" style="flex: 2;">{{ item.Remark || '-' }}</view>
							<view class="bind-table-cell" style="flex: 1;">{{ getMemberTypeText(item.MemType) }}</view>
							<view class="bind-table-cell" style="flex: 1;">
								<text class="bind-action-link" 
									:class="{'bound': item.isBound, 'unbind': bindShowBoundOnly && item.isBound}" 
									@click="handleBindMember(item)">
									{{ bindShowBoundOnly && item.isBound ? '取消绑定' : (item.isBound ? '已绑定' : '绑定') }}
								</text>
							</view>
						</view>
					</view>
					<view class="bind-list-empty" v-else>
						<text>暂无数据</text>
					</view>
				</view>
				
				<!-- 分页区域 -->
				<view class="bind-pagination-section" v-if="bindTotal > 0">
				<view class="bind-pagination-wrapper">
					<!-- 首页按钮 -->
					<view class="bind-pagination-first-btn" @click="goToBindFirstPage">
						<text class="bind-first-btn-text">首页</text>
							</view>
					<wd-pagination class="bind-pagination-pager" v-model.async="bindPageIndex"
						:total="bindTotal" :page-size.async="bindPageSize" @change="getBindList"
						show-icon></wd-pagination>
					<!-- 可编辑页码输入框（在页码左边） -->
					<view class="bind-pagination-page-input">
						<input ref="bindPageInputRef" class="bind-page-input" type="number" :value="bindPageIndex" @input="handleBindPageInputChange" @blur="handleBindPageInput" @confirm="handleBindPageInput" />
						<text class="bind-page-separator">/</text>
						<text class="bind-page-total">{{ bindTotalPages }}</text>
						</view>
					<!-- 末页按钮 -->
					<view class="bind-pagination-last-btn" @click="goToBindLastPage">
						<text class="bind-last-btn-text">末页</text>
					</view>
					</view>
				</view>
				
				<!-- 底部按钮 -->
				<view class="bind-list-footer">
					<wd-button type="info" size="large" @click="closeBindList" style="flex: 1;margin-right: 20rpx;">取消</wd-button>
					<wd-button size="large" @click="confirmBindList" style="flex: 1;">确定</wd-button>
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup>
	import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { ShopApi } from '@/api/shop.ts'
	import { getRenewQuoteList } from '@/api/pay'
	import { mapPayQuoteToSpecRow } from '@/utils/payRenewFlow'
	import { ManagementApi } from '@/api/management.ts'
	import { logApi } from '@/api/log'
	import request from '@/utils/request'
	import SettingPopupPlanContent from '@/components/SettingPopupPlanContent.vue'
	
	const systemBarHeight = ref(0)
	const storageShopInfo = reactive({})
	const shopId = ref('')
	const pushSwitch = ref(false) // 推送开关，默认为关闭

	// 续费相关
	const authGoodsVisible = ref(false)
	const payList = ref([])
	const payParams = reactive({
		shoptype: 1,
		// 推送服务套餐名称：后端接口要求使用"推送服务_月"，并按关键字模式匹配
		pricetitle: '推送服务_月',
		isKeyWord: true
	})

	// 机器人管理相关
	const robotListVisible = ref(false)
	const robotList = ref([])
	const robotPage = ref(1)
	const robotPageSize = ref(10)
	
	// 绑定列表相关
	const bindListVisible = ref(false)
	const bindListType = ref('friend') // 'friend' 或 'group'
	const bindListTitle = ref('绑定微信号')
	const currentRobot = ref(null) // 当前选中的机器人
	const bindList = ref([]) // 好友/群列表
	const bindPageIndex = ref(1)
	const bindPageSize = ref(20)
	const bindTotal = ref(0)
	const bindTotalPages = ref(0)
	const bindSearchKeyword = ref('')
	const bindShowBoundOnly = ref(false)
	const bindPageInput = ref('')
	const selectedBindMembers = ref([]) // 选中的成员列表
	const boundMembers = ref([]) // 已绑定的成员列表（从配置中获取）
	
	const getSysteminfo = () => {
		const systemInfo = uni.getSystemInfoSync()
		systemBarHeight.value = systemInfo.statusBarHeight || 0
	}

	const parseEndTime = (val) => {
		if (!val) return null
		let d = new Date(val)
		if (isNaN(d.getTime()) && typeof val === 'string') {
			d = new Date(val.replace(' ', 'T'))
		}
		return isNaN(d.getTime()) ? null : d
	}

	const chatpushFunc = computed(() => {
		const list = storageShopInfo.func_enable
		if (!Array.isArray(list)) return null
		return list.find(f => f && f.code === 'CHATPUSH') || null
	})
	
	const expireDate = computed(() => {
		// 优先使用列表页已经算好的 CHATPUSHEndTime
		const rawTop = storageShopInfo.CHATPUSHEndTime
		if (rawTop) {
			return parseEndTime(rawTop)
		}
		// 其次从 func_enable 里拿 EndTime
		const f = chatpushFunc.value
		if (!f) return null
		const raw = f.EndTime || f.endTime || f.end_time || null
		return parseEndTime(raw)
	})
	
	const isActivated = computed(() => {
		// 列表页已经有 isChatpushActivated，优先使用它保证一致性
		if (typeof storageShopInfo.isChatpushActivated === 'boolean') {
			return storageShopInfo.isChatpushActivated
		}
		// 兜底：根据 func_enable 重新判断
		const f = chatpushFunc.value
		if (!f || !f.enable) return false
		const d = expireDate.value
		if (!d) return false
		const today = new Date()
		today.setHours(0, 0, 0, 0)
		const end = new Date(d)
		end.setHours(0, 0, 0, 0)
		return end > today
	})
	
	const expireDateText = computed(() => {
		const d = expireDate.value
		if (!d) return '已到期'
		const y = d.getFullYear()
		const m = String(d.getMonth() + 1).padStart(2, '0')
		const day = String(d.getDate()).padStart(2, '0')
		return `${y}-${m}-${day}`
	})
	
	const handleClickLeft = () => {
		uni.navigateBack()
	}

	const handleStartSetting = () => {
		// 不管是否激活，都跳转到推送内容设置页面
			uni.navigateTo({
				url: '/pages/wechatsetting/wechatsetting-config?shopId=' + (shopId.value || '') + '&shopName=' + encodeURIComponent(storageShopInfo.name || '')
		})
	}

	// 安全地提取错误消息字符串
	const getErrorMessage = (error) => {
		if (!error) return '操作失败，请重试'
		if (typeof error === 'string') return error
		if (typeof error === 'object') {
			// 优先检查 message 字段
			if (error.message) {
				if (typeof error.message === 'string') return error.message
				if (typeof error.message === 'object') {
					// 如果 message 是对象，尝试提取其中的字符串字段
					if (error.message.message && typeof error.message.message === 'string') {
						return error.message.message
					}
					// 如果 message 是对象但没有字符串字段，返回默认消息
					return '操作失败，请重试'
				}
			}
			// 检查 Msg 字段
			if (error.Msg && typeof error.Msg === 'string') return error.Msg
			// 检查 data 字段
			if (error.data) {
				if (typeof error.data === 'string') return error.data
				// 如果 data 是对象，不尝试提取，直接返回默认消息
			}
			// 检查 code 和 message 组合
			if (error.code && error.message) {
				if (typeof error.message === 'string') return error.message
			}
		}
		// 所有情况都不匹配，返回默认消息
		return '操作失败，请重试'
	}

	// 处理推送开关变化
	const handlePushSwitchChange = async (value) => {
		// 确保 value 是布尔值，而不是对象
		// wd-switch 的 change 事件可能返回对象 {value: true} 或直接返回布尔值
		let enableValue = value
		if (value && typeof value === 'object' && value.value !== undefined) {
			enableValue = value.value
		} else if (typeof value !== 'boolean') {
			// 如果不是布尔值，尝试转换
			enableValue = Boolean(value)
		}
		
		if (!shopId.value) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none'
			})
			// 恢复开关状态
			pushSwitch.value = !enableValue
			return
		}

		try {
			uni.showLoading({ title: enableValue ? '开启中...' : '关闭中...', mask: true })
			
			const res = await ManagementApi.enableIM({
				code: 'CHATPUSH',
				enable: enableValue,
				shop: shopId.value
			})

			uni.hideLoading()

			// 检查响应是否成功
			const responseData = res?.data || res
			const isSuccess = (res && (
				res.code === 200 || 
				res.Code === 200 || 
				res.Success === true ||
				responseData?.code === 200 ||
				responseData?.Code === 200 ||
				responseData?.Success === true
			))

			if (isSuccess) {
				// 更新本地状态
				const funcEnable = storageShopInfo.func_enable || []
				const chatpushFunc = funcEnable.find(f => f && f.code === 'CHATPUSH')
				if (chatpushFunc) {
					chatpushFunc.enable = enableValue
				}
				
				// 确保提示消息是字符串
				const successMsg = enableValue ? '推送已开启' : '推送已关闭'
				uni.showToast({
					title: String(successMsg),
					icon: 'success',
					duration: 2000
			})
			} else {
				// 请求失败，恢复开关状态
				pushSwitch.value = !enableValue
				const errorMsg = getErrorMessage(responseData || res, '操作失败')
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			// 请求异常，恢复开关状态
			pushSwitch.value = !enableValue
			const errorMsg = getErrorMessage(error, '操作失败，请重试')
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}

	const getPayList = async () => {
		uni.showLoading({ title: '加载中', mask: true })
		const shopTypeNum = Number(payParams.shoptype) || 1
		try {
			const quotes = await getRenewQuoteList(
				shopTypeNum,
				payParams.pricetitle || '',
				payParams.isKeyWord === true
			)
			payList.value = quotes.map(mapPayQuoteToSpecRow)
			uni.hideLoading()
			if (payList.value.length === 0) {
				uni.showToast({ title: '暂无可用规格', icon: 'none' })
				return
			}
			authGoodsVisible.value = true
		} catch (err) {
			uni.hideLoading()
			uni.showToast({ title: err?.message || '获取功能价格失败，请重试', icon: 'none' })
		}
	}

	const handleRenew = () => {
		// 续费同样使用“推送服务_月”关键字套餐
		payParams.pricetitle = '推送服务_月'
		payParams.isKeyWord = true
		getPayList()
	}

	const closeAuthGoodsVisibleHandler = () => {
		authGoodsVisible.value = false
	}

	const subscribe = async (type) => {
		if (type === 'success') {
			authGoodsVisible.value = false
			// 激活成功后，重新获取店铺信息以更新激活状态
			if (shopId.value) {
				uni.showLoading({ title: '刷新中...', mask: true })
				try {
					await refreshShopInfo()
						uni.showToast({ title: '激活成功', icon: 'success' })
				} catch (error) {
					// 静默处理错误
					console.warn('刷新店铺信息失败:', error)
				} finally {
					uni.hideLoading()
				}
			}
		}
	}
	
	// 获取机器人类型文本
	const getChatTypeText = (chatType) => {
		const typeMap = {
			1: '微信PC',
			2: '微信手机',
			3: '企业微信'
		}
		return typeMap[chatType] || '未知'
	}
	
	// 打开机器人管理弹窗
	const handleRobotManage = async () => {
		robotListVisible.value = true
		// 每次打开弹窗时自动刷新机器人列表状态
		await getRobotList()
	}
	
	// 关闭机器人列表弹窗
	const closeRobotList = () => {
		robotListVisible.value = false
	}
	
	// 机器人在线状态图片预览相关
	const robotOnlineImageVisible = ref(false)
	const imageZoomed = ref(false)
	const robotOnlineImageSrc = ref('../../static/img/robotonline.png')
	
	// 显示机器人在线状态图片
	const showRobotOnlineImage = () => {
		robotOnlineImageVisible.value = true
		imageZoomed.value = false // 重置放大状态
	}
	
	// 关闭机器人在线状态图片预览
	const closeRobotOnlineImage = () => {
		robotOnlineImageVisible.value = false
		imageZoomed.value = false // 重置放大状态
	}
	
	// 切换图片放大状态
	const toggleImageZoom = () => {
		imageZoomed.value = !imageZoomed.value
	}
	
	// 图片加载错误处理
	const handleRobotImageError = (e) => {
		console.error('机器人在线状态图片加载失败:', robotOnlineImageSrc.value, e)
		uni.showToast({
			title: '图片加载失败',
			icon: 'none'
		})
	}
	
	// 获取机器人列表
	const getRobotList = async () => {
		try {
			uni.showLoading({ title: '加载中...', mask: true })
			
			// 根据 API 定义，GetPageList 使用 POST 方法
			// page 和 pageSize 作为 URL 查询参数，chatTypes 作为请求体（可选）
			const res = await request({
				url: `ChatMg/GetPageList?page=${robotPage.value}&pageSize=${robotPageSize.value}`,
				method: 'post',
				data: null // chatTypes 参数可选，这里传 null
			})
			
			// 处理响应数据
			let responseData = res
			if (res && typeof res === 'object' && res.data) {
				responseData = res.data
			}
			
			// 检查响应是否成功
			const isSuccess = (res && (
				res.code === 200 || 
				res.Code === 200 || 
				res.Success === true ||
				responseData?.code === 200 ||
				responseData?.Success === true
			))
			
			if (isSuccess && responseData && responseData.rows) {
				// 处理机器人数据，初始化列表
				robotList.value = responseData.rows.map(robot => ({
					...robot,
					key: robot.key || '', // 确保 key 字段存在，如果为空则设置为空字符串（连接状态）
					on_line: robot.on_line || false, // 确保 on_line 字段存在（在线状态）
					friendCount: 0, // 初始化为0，后续通过接口获取
					groupCount: 0 // 初始化为0，后续通过接口获取
				}))
				
				// 对每个在线的机器人，获取好友数和群数
				const fetchContactCounts = async (robot) => {
					// 检查在线状态：on_line 为 true 且 id 存在
					if (robot.on_line && robot.id) {
						try {
							// 获取好友列表总数（只获取第一页，pageSize设为1，主要为了获取Total）
							const friendRes = await request({
								url: `ChatMg/client/friendlist?chatId=${robot.id}&pageIndex=1&pageSize=1`,
								method: 'get'
							})
							
							// 获取群列表总数（只获取第一页，pageSize设为1，主要为了获取Total）
							const groupRes = await request({
								url: `ChatMg/client/grouplist?chatId=${robot.id}&pageIndex=1&pageSize=1`,
								method: 'get'
							})
							
							// 处理好友数
							let friendData = friendRes
							if (friendRes && typeof friendRes === 'object' && friendRes.data) {
								friendData = friendRes.data
							}
							const friendCount = friendData?.Total || friendData?.total || 0
							
							// 处理群数
							let groupData = groupRes
							if (groupRes && typeof groupRes === 'object' && groupRes.data) {
								groupData = groupRes.data
							}
							const groupCount = groupData?.Total || groupData?.total || 0
							
							// 更新机器人数据
							const robotIndex = robotList.value.findIndex(r => r.id === robot.id)
							if (robotIndex !== -1) {
								robotList.value[robotIndex].friendCount = friendCount
								robotList.value[robotIndex].groupCount = groupCount
							}
						} catch (error) {
							console.warn(`获取机器人 ${robot.id} 的联系人数量失败:`, error)
							// 静默处理错误，不影响其他机器人的数据获取
						}
					}
				}
				
				// 并行获取所有在线机器人的联系人数量
				await Promise.all(robotList.value.map(robot => fetchContactCounts(robot)))
				
				uni.hideLoading()
			} else {
				robotList.value = []
				uni.hideLoading()
				const errorMsg = getErrorMessage(responseData || res, '获取机器人列表失败')
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			robotList.value = []
			const errorMsg = getErrorMessage(error, '获取机器人列表失败，请重试')
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}
	
	// 连接/断开机器人
	const handleConnectRobot = async (robot) => {
		// 判断当前连接状态：在线或已有key表示已连接
		const isConnected = robot.on_line || (robot.key && robot.key.trim() !== '')
		
		if (!isConnected) {
			// 如果未连接，提示用户到PC端操作
			uni.showToast({
				title: '请到电脑PC端操作连接绑定微信',
				icon: 'none',
				duration: 3000
			})
			return
		}
		
		// 如果已连接，执行断开操作
		try {
			uni.showLoading({ title: '断开中...', mask: true })
			
			// 构建更新参数，将 key 设置为空字符串以断开连接
			// 注意：根据接口定义，UpdateChatInfo 需要完整的 t_chat_push_list 对象
			const updateData = {
				id: robot.id,
				admin: robot.admin,
				chat_type: robot.chat_type,
				host: robot.host,
				head_img: robot.head_img || '',
				name: robot.name || '',
				offid: robot.offid || '',
				on_line: false, // 断开时设置为离线
				key: '', // 设置为空字符串以断开连接
				MannagerOffIds: robot.MannagerOffIds || [],
				OtherValues: robot.OtherValues || {},
				ExTime: robot.ExTime,
				avtag: robot.avtag !== undefined ? robot.avtag : true,
				notes: robot.notes || ''
			}
			
			const res = await request({
				url: 'ChatMg/UpdateChatInfo',
				method: 'post',
				data: updateData
			})
			
			uni.hideLoading()
			
			// 处理响应数据
			let responseData = res
			if (res && typeof res === 'object' && res.data) {
				responseData = res.data
			}
			
			// 检查响应是否成功
			const isSuccess = (res && (
				res.code === 200 || 
				res.Code === 200 || 
				res.Success === true ||
				responseData?.code === 200 ||
				responseData?.Code === 200 ||
				responseData?.Success === true
			))
			
			if (isSuccess) {
				// 断开成功后，重新获取机器人列表以刷新状态
				await getRobotList()
				
				uni.showToast({
					title: '断开成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				const errorMsg = getErrorMessage(responseData || res, '断开失败')
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			const errorMsg = getErrorMessage(error, '断开失败，请重试')
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}
	
	// 管理员操作
	const handleAdminRobot = (robot) => {
		uni.showToast({
			title: '管理员功能开发中',
			icon: 'none'
		})
	}
	
	// 检查机器人是否在线（可以通过在线状态获取好友和群列表）
	const isRobotOnline = (robot) => {
		return robot && robot.on_line === true
	}
	
	// 获取已绑定的好友和群列表（从推送配置中获取）
	const getBoundMembers = async () => {
		if (!shopId.value || !currentRobot.value || (!currentRobot.value.id && !currentRobot.value.offid)) {
			boundMembers.value = []
			return
		}
		
		try {
			const res = await logApi.getConfFunc({
				shop: shopId.value,
				code: 'CHATPUSH'
			})
			
			if (res && res.code === 200 && res.data && res.data.conf_json) {
				const confJson = res.data.conf_json
				const boundList = []
				const currentRobotId = currentRobot.value.id
				const currentRobotOffid = currentRobot.value.offid || currentRobot.value.id
				
				// 根据绑定类型获取对应的已绑定列表
				const sourceArray = bindListType.value === 'friend' 
					? confJson.PushFriendOffids 
					: confJson.PushGroupOffIds
				
				if (Array.isArray(sourceArray)) {
					sourceArray.forEach(item => {
						if (item.MemberOffid && 
							(item.ChatOffId === currentRobotId || item.ChatOffId === currentRobotOffid)) {
							boundList.push(item.MemberOffid)
						}
					})
				}
				
				boundMembers.value = boundList
			} else {
				boundMembers.value = []
			}
		} catch (error) {
			console.error('获取已绑定列表失败:', error)
			boundMembers.value = []
		}
	}
	
	// 绑定微信号
	const handleBindFriend = async () => {
		// 检查是否有在线的机器人
		const onlineRobot = robotList.value.find(r => isRobotOnline(r))
		if (!onlineRobot) {
			uni.showToast({
				title: '请确保电脑端机器人已在线',
				icon: 'none',
				duration: 3000
			})
			return
		}
		
		// 如果有多个机器人，选择第一个在线的
		currentRobot.value = onlineRobot
		bindListType.value = 'friend'
		bindListTitle.value = `为${storageShopInfo.name || '店铺'}绑定微信号推送`
		bindListVisible.value = true
		bindPageIndex.value = 1
		bindSearchKeyword.value = ''
		bindShowBoundOnly.value = false
		selectedBindMembers.value = []
		// 先获取已绑定列表，再获取好友列表
		await getBoundMembers()
		getBindList()
	}
	
	// 绑定微信群
	const handleBindGroup = async () => {
		// 检查是否有在线的机器人
		const onlineRobot = robotList.value.find(r => isRobotOnline(r))
		if (!onlineRobot) {
			uni.showToast({
				title: '请确保电脑端机器人已在线',
				icon: 'none',
				duration: 3000
			})
			return
		}
		
		currentRobot.value = onlineRobot
		bindListType.value = 'group'
		bindListTitle.value = `为${storageShopInfo.name || '店铺'}绑定微信群推送`
		bindListVisible.value = true
		bindPageIndex.value = 1
		bindSearchKeyword.value = ''
		bindShowBoundOnly.value = false
		// 先获取已绑定列表，再获取群列表
		await getBoundMembers()
		// 初始化选中列表：将已绑定的成员自动选中
		await getBindList()
		// 等待列表加载完成后，将已绑定的成员添加到选中列表
		setTimeout(() => {
			selectedBindMembers.value = bindList.value
				.filter(item => item.isBound)
				.map(item => ({
					Offid: item.Offid,
					Name: item.Name,
					Remark: item.Remark,
					MemType: item.MemType
				}))
		}, 100)
	}
	
	// 关闭绑定列表弹窗
	const closeBindList = () => {
		bindListVisible.value = false
		bindList.value = []
		bindTotal.value = 0
		bindTotalPages.value = 0
		currentRobot.value = null
	}
	
	// 获取绑定列表（好友或群）
	const getBindList = async () => {
		if (!currentRobot.value || !currentRobot.value.id) {
			uni.showToast({
				title: '机器人信息不存在',
				icon: 'none'
			})
			return
		}
		
		// 检查机器人是否在线
		if (!isRobotOnline(currentRobot.value)) {
			uni.showToast({
				title: '机器人未在线，请确保电脑端机器人已在线',
				icon: 'none',
				duration: 3000
			})
			closeBindList()
			return
		}
		
		try {
			uni.showLoading({ title: '加载中...', mask: true })
			
			const url = bindListType.value === 'friend' 
				? `ChatMg/client/friendlist?chatId=${currentRobot.value.id}&pageIndex=${bindPageIndex.value}&pageSize=${bindPageSize.value}`
				: `ChatMg/client/grouplist?chatId=${currentRobot.value.id}&pageIndex=${bindPageIndex.value}&pageSize=${bindPageSize.value}`
			
			// 如果有搜索关键词，添加到参数中
			const searchParams = bindSearchKeyword.value ? `&keyword=${encodeURIComponent(bindSearchKeyword.value)}` : ''
			const finalUrl = url + searchParams
			
			const res = await request({
				url: finalUrl,
				method: 'get'
			})
			
			uni.hideLoading()
			
			// 处理响应数据
			let responseData = res
			if (res && typeof res === 'object' && res.data) {
				responseData = res.data
			}
			
			// 检查响应是否成功
			const isSuccess = (res && (
				res.code === 200 || 
				res.Code === 200 || 
				res.Success === true ||
				responseData?.code === 200 ||
				responseData?.Code === 200 ||
				responseData?.Success === true
			))
			
			if (isSuccess && responseData) {
				// 提取列表数据
				let items = responseData.Items || responseData.items || []
				
				// 如果是好友列表，过滤掉公众号（Offid以gh_开头的通常是公众号）
				if (bindListType.value === 'friend') {
					items = items.filter(item => {
						const offid = item.Offid || item.offid || ''
						// 过滤掉以gh_开头的公众号
						return !offid.startsWith('gh_')
					})
				}
				
				bindTotal.value = responseData.Total || responseData.total || 0
				// 如果过滤了公众号，需要重新计算总数（这里使用过滤后的实际数量）
				if (bindListType.value === 'friend') {
					// 注意：后端返回的Total可能包含公众号，所以这里使用过滤后的实际数量
					// 但为了保持分页准确性，我们仍然使用后端返回的Total，只是在前端显示时过滤
					// 如果需要更准确，可以重新计算Total，但这样会影响分页逻辑
					// 暂时保持原Total，只在前端显示时过滤
				}
				bindTotalPages.value = responseData.TotalPages || responseData.totalPages || Math.ceil(bindTotal.value / bindPageSize.value)
				
				// 标记哪些已绑定，并添加 isBound 属性
				const itemsWithBoundStatus = items.map(item => {
					const itemOffid = item.Offid || item.offid
					const isBound = boundMembers.value.some(boundOffid => boundOffid === itemOffid)
					return { ...item, isBound }
				})
				
				// 如果筛选已绑定好友/群，需要调用接口获取已绑定成员的详细信息
				if (bindShowBoundOnly.value) {
					if (boundMembers.value.length === 0) {
						bindList.value = []
						bindTotal.value = 0
						bindTotalPages.value = 0
					} else {
						// 调用接口获取已绑定成员的详细信息
						try {
							uni.showLoading({ title: '加载中...', mask: true })
							
							// 获取已绑定成员的详细信息
							const memberListRes = await request({
								url: `ChatMg/client/memberlist?chatId=${currentRobot.value.id}`,
								method: 'post',
								data: boundMembers.value
							})
							
							uni.hideLoading()
							
							// 处理响应数据
							let memberListData = memberListRes
							if (memberListRes && typeof memberListRes === 'object') {
								if (memberListRes.data !== undefined) {
									memberListData = memberListRes.data
								} else if (memberListRes.Items !== undefined) {
									memberListData = memberListRes.Items
								} else if (memberListRes.items !== undefined) {
									memberListData = memberListRes.items
								} else if (Array.isArray(memberListRes)) {
									memberListData = memberListRes
								}
							}
							
							// 处理返回的成员列表
							let memberList = []
							if (Array.isArray(memberListData)) {
								memberList = memberListData
								
								// 检查是否所有请求的成员都在返回列表中，如果缺失则补充获取
								if (memberList.length < boundMembers.value.length) {
									const missingOffIds = boundMembers.value.filter(offid => 
										!memberList.some(m => (m.Offid || m.offid) === offid)
									)
									
									// 如果接口只返回了部分数据，尝试再次调用接口获取缺失的成员
									if (missingOffIds.length > 0) {
										try {
											const missingRes = await request({
												url: `ChatMg/client/memberlist?chatId=${currentRobot.value.id}`,
												method: 'post',
												data: missingOffIds
											})
											
											let missingData = missingRes
											if (missingRes && typeof missingRes === 'object' && missingRes.data) {
												missingData = missingRes.data
											} else if (Array.isArray(missingRes)) {
												missingData = missingRes
											}
											
											if (Array.isArray(missingData) && missingData.length > 0) {
												memberList = [...memberList, ...missingData]
											}
										} catch (error) {
											console.error('获取缺失成员失败:', error)
										}
									}
								}
							} else if (memberListData && typeof memberListData === 'object') {
								// 如果不是数组，尝试转换为数组
								if (memberListData.Offid || memberListData.Name) {
									memberList = [memberListData]
								}
							}
							
							// 标记为已绑定并更新列表
							let boundMemberList = memberList.map(item => ({
								...item,
								isBound: true
							}))
							
							// 如果是好友列表，过滤掉公众号（Offid以gh_开头的通常是公众号）
							if (bindListType.value === 'friend') {
								boundMemberList = boundMemberList.filter(item => {
									const offid = item.Offid || item.offid || ''
									// 过滤掉以gh_开头的公众号
									return !offid.startsWith('gh_')
								})
							}
							
							// 使用 nextTick 确保响应式更新
							await nextTick()
							bindList.value = []
							await nextTick()
							bindList.value = [...boundMemberList]
							
							bindTotal.value = boundMemberList.length
							bindTotalPages.value = Math.ceil(bindTotal.value / bindPageSize.value)
						} catch (error) {
							uni.hideLoading()
							console.error('获取已绑定成员列表失败:', error)
							// 如果接口调用失败，回退到从当前页筛选
							let filteredList = itemsWithBoundStatus.filter(item => item.isBound)
							// 如果是好友列表，过滤掉公众号
							if (bindListType.value === 'friend') {
								filteredList = filteredList.filter(item => {
									const offid = item.Offid || item.offid || ''
									return !offid.startsWith('gh_')
								})
							}
							bindList.value = filteredList
							bindTotal.value = filteredList.length
							bindTotalPages.value = Math.ceil(bindTotal.value / bindPageSize.value)
							uni.showToast({
								title: '获取已绑定列表失败，请重试',
								icon: 'none',
								duration: 2000
							})
						}
					}
				} else {
					// 正常分页显示，标记已绑定状态
					bindList.value = itemsWithBoundStatus
				}
			} else {
				bindList.value = []
				bindTotal.value = 0
				bindTotalPages.value = 0
				const errorMsg = getErrorMessage(responseData || res, '获取列表失败')
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			bindList.value = []
			bindTotal.value = 0
			bindTotalPages.value = 0
			const errorMsg = getErrorMessage(error, '获取列表失败，请重试')
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}
	
	// 刷新绑定列表
	const refreshBindList = async () => {
		bindPageIndex.value = 1
		// 重新获取已绑定列表
		await getBoundMembers()
		getBindList()
	}
	
	// 获取成员类型文本
	const getMemberTypeText = (memType) => {
		const typeMap = {
			1: '好友',
			2: '群'
		}
		return typeMap[memType] || '未知'
	}
	
	// 绑定成员（直接绑定或解绑）
	const handleBindMember = async (member) => {
		if (!shopId.value || !currentRobot.value || !currentRobot.value.id) {
			uni.showToast({
				title: '缺少必要信息',
				icon: 'none'
			})
			return
		}
		
		// 如果已绑定，直接解绑
		if (member.isBound) {
			await unbindMember(member)
		} else {
			// 如果未绑定，直接绑定
			await bindSingleMember(member)
		}
	}
	
	// 绑定单个成员（在原有绑定基础上追加，而不是覆盖）
	const bindSingleMember = async (member) => {
		try {
			uni.showLoading({ title: '绑定中...', mask: true })
			
			// 1. 获取当前配置
			const getConfRes = await logApi.getConfFunc({
				shop: shopId.value,
				code: 'CHATPUSH'
			})
			
			if (!getConfRes || getConfRes.code !== 200 || !getConfRes.data || !getConfRes.data.conf_json) {
				uni.hideLoading()
				uni.showToast({
					title: '获取配置失败',
					icon: 'none'
				})
				return
			}
			
			const currentConf = getConfRes.data.conf_json
			const currentRobotOffid = currentRobot.value.offid || currentRobot.value.id
			
			// 2. 构建新配置
			const newConfObj = {
				CommandBind: currentConf.CommandBind !== undefined ? currentConf.CommandBind : true,
				MarkLow: currentConf.MarkLow !== undefined ? currentConf.MarkLow : false,
				MarkTop: currentConf.MarkTop !== undefined ? currentConf.MarkTop : false,
				PushBadComment: currentConf.PushBadComment || { Enable: true, Time: null },
				PushNormalAd: currentConf.PushNormalAd || { Enable: true, Time: null, MinAdBalance: 10 },
				PushNormalClose: currentConf.PushNormalClose || { Enable: true, Time: null },
				PushShopEndTime: currentConf.PushShopEndTime || { Enable: true, Time: null },
				PushShopOut: currentConf.PushShopOut || { Enable: true, Time: null },
				PushShopReport: currentConf.PushShopReport || { Enable: true, Time: null, EnableFields: [] },
				PushStrFirst: currentConf.PushStrFirst || '',
				PushStrLast: currentConf.PushStrLast || '',
				LastExceptionStr: currentConf.LastExceptionStr || '',
				// 默认先沿用原有绑定列表，后面再按类型做追加去重
				PushFriendOffids: Array.isArray(currentConf.PushFriendOffids) ? [...currentConf.PushFriendOffids] : [],
				PushGroupOffIds: Array.isArray(currentConf.PushGroupOffIds) ? [...currentConf.PushGroupOffIds] : []
			}
			
			// 3. 处理绑定列表
			if (bindListType.value === 'friend') {
				// 为当前机器人追加好友绑定，避免重复
				const currentRobotId = currentRobot.value.id
				const exists = newConfObj.PushFriendOffids.some(item => {
					if (!item) return false
					const chatOffId = item.ChatOffId
					return item.MemberOffid === member.Offid &&
						(chatOffId === currentRobotId || chatOffId === currentRobotOffid)
				})
				if (!exists) {
				newConfObj.PushFriendOffids.push({
					ChatOffId: currentRobotOffid,
					MemberOffid: member.Offid
				})
				}
			} else if (bindListType.value === 'group') {
				// 为当前机器人追加群绑定，避免重复
				const currentRobotId = currentRobot.value.id
				const exists = newConfObj.PushGroupOffIds.some(item => {
					if (!item) return false
					const chatOffId = item.ChatOffId
					return item.MemberOffid === member.Offid &&
						(chatOffId === currentRobotId || chatOffId === currentRobotOffid)
					})
				if (!exists) {
				newConfObj.PushGroupOffIds.push({
					ChatOffId: currentRobotOffid,
					MemberOffid: member.Offid
				})
				}
			}
			
			// 4. 保存配置
			const saveRes = await logApi.saveConfFunc({
				shop: shopId.value,
				code: 'CHATPUSH',
				ConfObj: newConfObj
			})
			
			uni.hideLoading()
			
			const isSuccess = (saveRes && (
				saveRes.code === 200 || 
				saveRes.Code === 200 || 
				saveRes.Success === true
			))
			
			if (isSuccess) {
				uni.showToast({
					title: '绑定成功',
					icon: 'success',
					duration: 1500
				})
				// 刷新列表
				await getBoundMembers()
				await getBindList()
			} else {
				uni.showToast({
					title: saveRes?.message || saveRes?.Msg || '绑定失败',
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			uni.showToast({
				title: '绑定失败，请重试',
				icon: 'none'
			})
		}
	}
	
	// 解绑单个成员
	const unbindMember = async (member) => {
		try {
			uni.showLoading({ title: '解绑中...', mask: true })
			
			// 1. 获取当前配置
			const getConfRes = await logApi.getConfFunc({
				shop: shopId.value,
				code: 'CHATPUSH'
			})
			
			if (!getConfRes || getConfRes.code !== 200 || !getConfRes.data || !getConfRes.data.conf_json) {
				uni.hideLoading()
				uni.showToast({
					title: '获取配置失败',
					icon: 'none'
				})
				return
			}
			
			const currentConf = getConfRes.data.conf_json
			const currentRobotOffid = currentRobot.value.offid || currentRobot.value.id
			
			// 2. 构建新配置
			const newConfObj = {
				CommandBind: currentConf.CommandBind !== undefined ? currentConf.CommandBind : true,
				MarkLow: currentConf.MarkLow !== undefined ? currentConf.MarkLow : false,
				MarkTop: currentConf.MarkTop !== undefined ? currentConf.MarkTop : false,
				PushBadComment: currentConf.PushBadComment || { Enable: true, Time: null },
				PushNormalAd: currentConf.PushNormalAd || { Enable: true, Time: null, MinAdBalance: 10 },
				PushNormalClose: currentConf.PushNormalClose || { Enable: true, Time: null },
				PushShopEndTime: currentConf.PushShopEndTime || { Enable: true, Time: null },
				PushShopOut: currentConf.PushShopOut || { Enable: true, Time: null },
				PushShopReport: currentConf.PushShopReport || { Enable: true, Time: null, EnableFields: [] },
				PushStrFirst: currentConf.PushStrFirst || '',
				PushStrLast: currentConf.PushStrLast || '',
				LastExceptionStr: currentConf.LastExceptionStr || '',
				PushFriendOffids: [],
				PushGroupOffIds: []
			}
			
			// 3. 处理解绑列表
			if (bindListType.value === 'friend') {
				// 保留其他机器人的绑定，并移除当前成员
				if (currentConf.PushFriendOffids && Array.isArray(currentConf.PushFriendOffids)) {
					newConfObj.PushFriendOffids = currentConf.PushFriendOffids.filter(item => {
						const robotOffid = currentRobot.value.offid || currentRobot.value.id
						// 保留其他机器人的绑定，或当前机器人但成员ID不同的绑定
						return (item.ChatOffId !== currentRobot.value.id && item.ChatOffId !== robotOffid) ||
						       (item.MemberOffid !== member.Offid)
					})
				}
			} else if (bindListType.value === 'group') {
				// 保留其他机器人的绑定，并移除当前成员
				if (currentConf.PushGroupOffIds && Array.isArray(currentConf.PushGroupOffIds)) {
					newConfObj.PushGroupOffIds = currentConf.PushGroupOffIds.filter(item => {
						const robotOffid = currentRobot.value.offid || currentRobot.value.id
						// 保留其他机器人的绑定，或当前机器人但成员ID不同的绑定
						return (item.ChatOffId !== currentRobot.value.id && item.ChatOffId !== robotOffid) ||
						       (item.MemberOffid !== member.Offid)
					})
				}
			}
			
			// 4. 保存配置
			const saveRes = await logApi.saveConfFunc({
				shop: shopId.value,
				code: 'CHATPUSH',
				ConfObj: newConfObj
			})
			
			uni.hideLoading()
			
			const isSuccess = (saveRes && (
				saveRes.code === 200 || 
				saveRes.Code === 200 || 
				saveRes.Success === true
			))
			
			if (isSuccess) {
				uni.showToast({
					title: '解绑成功',
					icon: 'success',
					duration: 1500
				})
				// 刷新列表
				await getBoundMembers()
				await getBindList()
			} else {
				uni.showToast({
					title: saveRes?.message || saveRes?.Msg || '解绑失败',
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			uni.showToast({
				title: '解绑失败，请重试',
				icon: 'none'
			})
		}
	}
	
	// 确认绑定列表
	const confirmBindList = async () => {
		if (!shopId.value || !currentRobot.value || !currentRobot.value.id) {
			uni.showToast({
				title: '缺少必要信息',
				icon: 'none'
			})
			return
		}
		
		try {
			uni.showLoading({ title: '保存中...', mask: true })
			
			// 1. 先获取当前配置
			const getConfRes = await logApi.getConfFunc({
				shop: shopId.value,
				code: 'CHATPUSH'
			})
			
			if (!getConfRes || getConfRes.code !== 200 || !getConfRes.data || !getConfRes.data.conf_json) {
				uni.hideLoading()
				uni.showToast({
					title: '获取配置失败',
					icon: 'none'
				})
				return
			}
			
			const currentConf = getConfRes.data.conf_json
			// 根据用户提供的数据，ChatOffId 实际使用的是 offid（wxid格式），而不是数据库 id
			// 例如：ChatOffId: "wxid_ftz5u2zobzyq22"
			const currentRobotId = currentRobot.value.id
			const currentRobotOffid = currentRobot.value.offid || currentRobot.value.id
			
			// 调试：打印机器人信息
			console.log('当前机器人信息:', {
				id: currentRobotId,
				offid: currentRobotOffid,
				name: currentRobot.value.name
			})
			console.log('当前配置:', currentConf)
			console.log('选中的成员:', selectedBindMembers.value)
			
			// 2. 构建新的配置对象
			const newConfObj = {
				CommandBind: currentConf.CommandBind !== undefined ? currentConf.CommandBind : true,
				MarkLow: currentConf.MarkLow !== undefined ? currentConf.MarkLow : false,
				MarkTop: currentConf.MarkTop !== undefined ? currentConf.MarkTop : false,
				PushBadComment: currentConf.PushBadComment || { Enable: true, Time: null },
				PushNormalAd: currentConf.PushNormalAd || { Enable: true, Time: null, MinAdBalance: 10 },
				PushNormalClose: currentConf.PushNormalClose || { Enable: true, Time: null },
				PushShopEndTime: currentConf.PushShopEndTime || { Enable: true, Time: null },
				PushShopOut: currentConf.PushShopOut || { Enable: true, Time: null },
				PushShopReport: currentConf.PushShopReport || { Enable: true, Time: null, EnableFields: [] },
				PushStrFirst: currentConf.PushStrFirst || '',
				PushStrLast: currentConf.PushStrLast || '',
				LastExceptionStr: currentConf.LastExceptionStr || '',
				PushFriendOffids: [],
				PushGroupOffIds: []
			}
			
			// 3. 处理好友绑定列表
			// 先保留其他机器人的绑定（需要同时匹配 id 和 offid，因为可能历史数据格式不一致）
			if (currentConf.PushFriendOffids && Array.isArray(currentConf.PushFriendOffids)) {
				newConfObj.PushFriendOffids = currentConf.PushFriendOffids.filter(item => {
					// 过滤掉当前机器人的绑定（可能是 id 或 offid）
					return item.ChatOffId !== currentRobotId && item.ChatOffId !== currentRobotOffid
				})
			}
			
			// 添加当前机器人选中的好友（包括已绑定和新增的）
			if (bindListType.value === 'friend') {
				selectedBindMembers.value.forEach(member => {
					// 根据实际数据，ChatOffId 使用的是 offid（wxid格式），而不是数据库 id
					newConfObj.PushFriendOffids.push({
						ChatOffId: currentRobotOffid, // 使用 offid 而不是 id
						MemberOffid: member.Offid
					})
				})
				// 如果没有选中任何好友，则清空当前机器人的好友绑定（已经在上面过滤掉了）
			}
			
			// 4. 处理群绑定列表
			// 先保留其他机器人的绑定（需要同时匹配 id 和 offid，因为可能历史数据格式不一致）
			if (currentConf.PushGroupOffIds && Array.isArray(currentConf.PushGroupOffIds)) {
				newConfObj.PushGroupOffIds = currentConf.PushGroupOffIds.filter(item => {
					// 过滤掉当前机器人的绑定（可能是 id 或 offid）
					return item.ChatOffId !== currentRobotId && item.ChatOffId !== currentRobotOffid
				})
			}
			
			// 添加当前机器人选中的群（包括已绑定和新增的）
			if (bindListType.value === 'group') {
				selectedBindMembers.value.forEach(member => {
					// 根据实际数据，ChatOffId 使用的是 offid（wxid格式），而不是数据库 id
					newConfObj.PushGroupOffIds.push({
						ChatOffId: currentRobotOffid, // 使用 offid 而不是 id
						MemberOffid: member.Offid
					})
				})
				// 如果没有选中任何群，则清空当前机器人的群绑定（已经在上面过滤掉了）
			}
			
			// 调试：打印保存的配置
			console.log('准备保存的配置:', newConfObj)
			console.log('PushFriendOffids:', newConfObj.PushFriendOffids)
			console.log('PushGroupOffIds:', newConfObj.PushGroupOffIds)
			
			// 5. 调用保存接口
			const saveRes = await logApi.saveConfFunc({
				shop: shopId.value,
				code: 'CHATPUSH',
				ConfObj: newConfObj
			})
			
			uni.hideLoading()
			
			// 6. 处理响应
			const isSuccess = (saveRes && (
				saveRes.code === 200 || 
				saveRes.Code === 200 || 
				saveRes.Success === true
			))
			
			if (isSuccess) {
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000
				})
				
				// 刷新已绑定列表
				await getBoundMembers()
				// 刷新当前列表显示
				getBindList()
				
				// 延迟关闭弹窗，让用户看到成功提示
				setTimeout(() => {
					closeBindList()
				}, 1500)
			} else {
				const errorMsg = saveRes?.message || saveRes?.Msg || '保存失败'
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			const errorMsg = getErrorMessage(error, '保存失败，请重试')
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}
	
	// 分页相关函数
	const goToBindFirstPage = () => {
		if (bindPageIndex.value === 1) return
		bindPageIndex.value = 1
		getBindList()
	}
	
	const goToBindLastPage = () => {
		if (bindPageIndex.value >= bindTotalPages.value) return
		bindPageIndex.value = bindTotalPages.value
		getBindList()
	}
	
	const goToBindPrevPage = () => {
		if (bindPageIndex.value <= 1) return
		bindPageIndex.value--
		getBindList()
	}
	
	const goToBindNextPage = () => {
		if (bindPageIndex.value >= bindTotalPages.value) return
		bindPageIndex.value++
		getBindList()
	}
	
	const goToBindPage = (page) => {
		if (page < 1 || page > bindTotalPages.value) return
		bindPageIndex.value = page
		getBindList()
	}
	
	const handleBindPageJump = () => {
		const page = parseInt(bindPageInput.value)
		if (isNaN(page) || page < 1) {
			bindPageInput.value = bindPageIndex.value.toString()
			return
		}
		if (page > bindTotalPages.value) {
			bindPageInput.value = bindTotalPages.value.toString()
			goToBindPage(bindTotalPages.value)
			return
		}
		goToBindPage(page)
	}

	// 页码输入框引用
	const bindPageInputRef = ref(null)

	// 调整输入框宽度
	const adjustBindInputWidth = (value) => {
		nextTick(() => {
			if (!bindPageInputRef.value) return
			const str = String(value || '')
			const length = str.length || 1
			// 每个字符大约 30rpx (font-size: 30rpx)，加上 padding 16rpx
			const newWidth = Math.max(50, length * 30 + 16)
			if (bindPageInputRef.value.style) {
				bindPageInputRef.value.style.width = newWidth + 'rpx'
			}
		})
	}

	// 页码输入变化处理（用于动态调整宽度）
	const handleBindPageInputChange = (e) => {
		const value = e.detail ? e.detail.value : (e.target ? e.target.value : '')
		adjustBindInputWidth(value)
	}

	// 页码输入处理
	const handleBindPageInput = (e) => {
		const value = e.detail ? (e.detail.value || '') : (e.target ? (e.target.value || '') : '')
		const page = parseInt(value)
		const totalPages = bindTotalPages.value
		
		if (!value || !page || isNaN(page) || page < 1) {
			bindPageIndex.value = 1
			adjustBindInputWidth(1)
			getBindList()
			return
		}
		
		if (page > totalPages) {
			bindPageIndex.value = totalPages
			adjustBindInputWidth(totalPages)
			getBindList()
			return
		}
		
		bindPageIndex.value = page
		adjustBindInputWidth(page)
		getBindList()
	}
	
	// 获取分页数字数组（用于显示页码）
	const getBindPageNumbers = () => {
		const pages = []
		const total = bindTotalPages.value
		const current = bindPageIndex.value
		
		if (total <= 5) {
			// 如果总页数少于等于5页，显示所有页码
			for (let i = 1; i <= total; i++) {
				pages.push(i)
			}
		} else {
			// 如果总页数大于5页，只显示当前页前后各1页，最多显示5个页码
			if (current <= 3) {
				// 当前页在前3页
				for (let i = 1; i <= 3; i++) {
					pages.push(i)
				}
				if (total > 4) {
					pages.push('...')
					pages.push(total)
				}
			} else if (current >= total - 2) {
				// 当前页在后3页
				pages.push(1)
				pages.push('...')
				for (let i = total - 2; i <= total; i++) {
					pages.push(i)
				}
			} else {
				// 当前页在中间
				pages.push(1)
				pages.push('...')
				for (let i = current - 1; i <= current + 1; i++) {
					pages.push(i)
				}
				pages.push('...')
				pages.push(total)
			}
		}
		
		return pages
	}
	
	// 监听搜索关键词变化（防抖）
	let searchTimer = null
	watch(bindSearchKeyword, () => {
		clearTimeout(searchTimer)
		searchTimer = setTimeout(() => {
			bindPageIndex.value = 1
			getBindList()
		}, 500)
	})
	
	// 监听已绑定筛选变化
	watch(bindShowBoundOnly, async () => {
		// 当筛选状态改变时，重新获取已绑定列表和好友/群列表
		bindPageIndex.value = 1
		// 先重新获取已绑定列表，确保数据是最新的
		await getBoundMembers()
		// 然后重新获取并显示列表
		await getBindList()
	})
	
	// 删除机器人
	const handleDeleteRobot = (robot) => {
		uni.showModal({
			title: '提示',
			content: `确定要删除机器人"${robot.name || robot.offid}"吗？`,
			confirmText: '删除',
			cancelText: '取消',
			success: async (res) => {
				if (res.confirm) {
					if (!robot.id) {
						uni.showToast({
							title: '机器人ID不存在',
							icon: 'none'
						})
						return
					}
					
					try {
						uni.showLoading({ title: '删除中...', mask: true })
						
						// 调用删除接口
						const deleteRes = await request({
							url: `ChatMg/client/deletechatbot?chatId=${robot.id}`,
							method: 'post',
							data: {}
						})
						
						uni.hideLoading()
						
						// 处理响应数据
						let responseData = deleteRes
						if (deleteRes && typeof deleteRes === 'object' && deleteRes.data) {
							responseData = deleteRes.data
						}
						
						// 检查响应是否成功
						const isSuccess = (deleteRes && (
							deleteRes.code === 200 || 
							deleteRes.Code === 200 || 
							deleteRes.Success === true ||
							responseData === true ||
							responseData?.code === 200 ||
							responseData?.Code === 200 ||
							responseData?.Success === true
						))
						
						if (isSuccess) {
							// 删除成功后，从列表中移除该机器人
							const robotIndex = robotList.value.findIndex(r => r.id === robot.id)
							if (robotIndex !== -1) {
								robotList.value.splice(robotIndex, 1)
							}
							
							uni.showToast({
								title: '删除成功',
								icon: 'success',
								duration: 2000
							})
						} else {
							const errorMsg = getErrorMessage(responseData || deleteRes, '删除失败')
							uni.showToast({
								title: errorMsg,
								icon: 'none'
							})
						}
					} catch (error) {
						uni.hideLoading()
						const errorMsg = getErrorMessage(error, '删除失败，请重试')
						uni.showToast({
							title: errorMsg,
							icon: 'none'
						})
					}
				}
			}
		})
	}

	// 立即推送
	const handlePushNow = async () => {
		if (!shopId.value) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none'
			})
			return
		}

		try {
			uni.showLoading({ title: '推送中...', mask: true })
			
			// 调用接口立即推送
			// 根据 API 定义，shopId 应该通过 URL 查询参数传递，而不是 POST body
			const res = await request({
				url: `ChatPushData/PushDataNow?shopId=${shopId.value}`,
				method: 'post',
				data: {}
			})

			uni.hideLoading()

			// 根据 request.ts，返回的是 res.data，但实际可能是整个响应对象
			// 检查响应是否成功（兼容多种响应格式）
			const responseData = res?.data || res
			const isSuccess = (res && (
				res.code === 200 || 
				res.Code === 200 || 
				res.Success === true ||
				responseData?.code === 200 ||
				responseData?.Code === 200 ||
				responseData?.Success === true
			))

			if (isSuccess) {
				uni.showToast({
					title: '推送成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				// 请求失败
				const errorMsg = getErrorMessage(responseData || res, '推送失败')
				uni.showToast({
					title: errorMsg,
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			// 请求异常
			const errorMsg = getErrorMessage(error, '推送失败，请重试')
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}

	// 复制日报
	const handleCopyReport = async () => {
		if (!shopId.value) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none'
			})
			return
		}

		try {
			uni.showLoading({ title: '获取日报数据中...', mask: true })
			
			// 调用接口获取日报数据
			const res = await request({
				url: 'ChatPushData/GetShopYesterdayData',
				method: 'get',
				data: {
					shopId: shopId.value,
					includeComment: true
				}
			})

			uni.hideLoading()

			// 处理响应数据
			// 根据 ChatPushDataApi 的定义，返回的是 string 类型
			let reportData = ''
			if (typeof res === 'string') {
				reportData = res
			} else if (res && typeof res === 'object') {
				// 如果返回的是对象，尝试提取数据
				if (typeof res.data === 'string') {
					reportData = res.data
				} else if (res.Data && typeof res.Data === 'string') {
					reportData = res.Data
				} else {
					// 如果是对象，转换为 JSON 字符串
					reportData = JSON.stringify(res, null, 2)
				}
			}

			if (!reportData) {
				uni.showToast({
					title: '获取日报数据失败',
					icon: 'none'
				})
				return
			}

			// 复制到剪贴板
			// #ifdef H5
			// H5 平台使用 navigator.clipboard
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(reportData)
				uni.showToast({
					title: '日报已复制到剪贴板',
					icon: 'success',
					duration: 2000
				})
			} else {
				// 降级方案：创建临时文本域
				const textarea = document.createElement('textarea')
				textarea.value = reportData
				textarea.style.position = 'fixed'
				textarea.style.opacity = '0'
				document.body.appendChild(textarea)
				textarea.select()
				try {
					document.execCommand('copy')
					uni.showToast({
						title: '日报已复制到剪贴板',
						icon: 'success',
						duration: 2000
					})
				} catch (err) {
					uni.showToast({
						title: '复制失败，请手动复制',
						icon: 'none'
					})
				}
				document.body.removeChild(textarea)
			}
			// #endif
			
			// #ifndef H5
			// 小程序和 APP 平台使用 uni.setClipboardData
			uni.setClipboardData({
				data: reportData,
				success: () => {
					uni.showToast({
						title: '日报已复制到剪贴板',
						icon: 'success',
						duration: 2000
					})
				},
				fail: () => {
					uni.showToast({
						title: '复制失败，请重试',
						icon: 'none'
					})
				}
			})
			// #endif
		} catch (error) {
			uni.hideLoading()
			const errorMsg = getErrorMessage(error, '获取日报数据失败')
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}
	
	// 更新推送开关状态（从本地存储）
	const updatePushSwitchStatus = () => {
		const shopInfo = uni.getStorageSync('shopInfo')
		if (shopInfo) {
			const funcEnable = shopInfo.func_enable || shopInfo.extra_data?.func_enable || []
			const chatpushFunc = funcEnable.find(f => f && f.code === 'CHATPUSH')
			if (chatpushFunc) {
				pushSwitch.value = chatpushFunc.enable === true
			}
		}
	}
	
	// 从服务器刷新店铺信息
	const refreshShopInfo = async () => {
		if (!shopId.value) return
		
		try {
			const res = await ShopApi.getShopDetails(shopId.value)
			if (res && res.code === 200 && res.data) {
				// 更新本地存储的店铺信息
				const shopInfo = uni.getStorageSync('shopInfo') || {}
				if (res.data.func_enable) {
					shopInfo.func_enable = res.data.func_enable
					Object.assign(storageShopInfo, shopInfo)
					uni.setStorageSync('shopInfo', shopInfo)
					
					// 更新推送开关状态
					const chatpushFunc = res.data.func_enable.find(f => f && f.code === 'CHATPUSH')
					if (chatpushFunc) {
						pushSwitch.value = chatpushFunc.enable === true
					}
				}
			}
		} catch (error) {
			// 静默处理错误，避免影响用户体验
			console.warn('刷新店铺信息失败:', error)
		}
	}
	
	// 机器人列表请求防抖（避免频繁调用）
	let robotListRequestTimer = null
	const getRobotListDebounced = () => {
		if (robotListRequestTimer) {
			clearTimeout(robotListRequestTimer)
		}
		robotListRequestTimer = setTimeout(() => {
			getRobotList()
		}, 300)
	}
	
	onLoad(() => {
		getSysteminfo()
		// 读取从 wx-push 页保存的 shopInfo
		const shopInfo = uni.getStorageSync('shopInfo')
		if (shopInfo) {
			Object.assign(storageShopInfo, shopInfo)
			shopId.value = shopInfo.id || ''
			// 续费需要 shop_type
			payParams.shoptype = Number(shopInfo.shop_type) || 1
			
			// 初始化推送开关状态
			const funcEnable = shopInfo.func_enable || shopInfo.extra_data?.func_enable || []
			const chatpushFunc = funcEnable.find(f => f && f.code === 'CHATPUSH')
			if (chatpushFunc) {
				pushSwitch.value = chatpushFunc.enable === true
			} else {
				// 如果没有找到，默认关闭
				pushSwitch.value = false
			}
		}
	})
	
	// 页面显示时，刷新推送开关状态
	// 这样当电脑端修改了开关状态后，手机端回到页面时能看到最新状态
	onShow(() => {
		// 先尝试从本地存储更新（可能其他页面已经更新了本地存储）
		updatePushSwitchStatus()
		// 然后从服务器获取最新数据（确保数据是最新的，但只在必要时调用）
		if (shopId.value) {
			refreshShopInfo()
		}
	})
</script>

<style scoped lang="scss">
	.wechat-setting {
		height: 100vh;
		width: 100%;
		/* 与海报底部背景融合（从 wechatpush.png 底部采样：左#9ADEFE 中#BAE8FE 右#C8ECFE） */
		background: linear-gradient(90deg, #9adefe 0%, #bae8fe 50%, #c8ecfe 100%);
		overflow: hidden; // 禁止页面滚动
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.poster-wrap {
		width: 100%;
		height: 100vh;
		padding: 0;
		margin: 0;
		box-sizing: border-box;
		overflow: hidden; // 禁止容器滚动
		position: relative;
		z-index: 1;
		/* 双保险：图片未覆盖区域也用同色背景填充 */
		background: linear-gradient(90deg, #9adefe 0%, #bae8fe 50%, #c8ecfe 100%);
	}

	.poster-img {
		width: 100%;
		height: auto;
		display: block;
		margin: 0;
		border-radius: 0;
		// 保持图片原始比例，不拉伸不变形
		object-fit: contain;
	}

	.bottom-actions {
		position: fixed;
		left: 0;
		right: 0;
		bottom: calc(env(safe-area-inset-bottom));
		padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom));
		box-sizing: border-box;
		z-index: 20;
		background: transparent;
		display: flex;
		gap: 20rpx;
		align-items: center;
	}

	.action-btn {
		flex: 1;
		height: 72rpx;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
       width: calc(50% - 6rpx);
     
	}

	.robot-manage-btn {
		background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3);
       
	}

	.push-config-btn {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
	}

	.action-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.2);
	}

	.action-btn-text {
		color: #FFFFFF;
		font-size: 32rpx;
		font-weight: 500;
	}

	.robot-list-container {
		width: 100%;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
	}

	.robot-list-title {
		font-size: 36rpx;
		font-weight: 600;
		color: #333333;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.robot-list-content {
		flex: 1;
		overflow-y: auto;
	}

	.robot-list-empty {
		text-align: center;
		padding: 60rpx 0;
		color: #999999;
		font-size: 28rpx;
	}

	.robot-table {
		width: 100%;
		border: 1px solid #e0e0e0;
		border-radius: 8rpx;
		overflow: hidden;
	}

	.robot-table-header {
		display: flex;
		background: #f5f5f5;
		padding: 20rpx 10rpx;
		border-bottom: 1px solid #e0e0e0;
	}

	.robot-table-row {
		display: flex;
		border-bottom: 1px solid #e0e0e0;
		padding: 20rpx 10rpx;
		align-items: center;
		background: #fff;
	}

	.robot-table-row:last-child {
		border-bottom: none;
	}

	.robot-table-cell {
		flex: 1;
		padding: 0 2rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
        white-space: nowrap;

	}

	.header-cell {
		font-weight: 600;
		color: #333333;
		font-size: 26rpx;
	}

	.robot-info {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8rpx;
		width: 100%;
	}

	.robot-avatar {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #f0f0f0;
		flex-shrink: 0;
	}

	.robot-name-id {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4rpx;
		width: 100%;
	}

	.robot-name {
		font-size: 26rpx;
		font-weight: 500;
		color: #333333;
	}

	.robot-id {
		font-size: 22rpx;
		color: #999999;
		word-break: break-all;
		text-align: center;
	}

	.robot-type-tag {
		padding: 6rpx 16rpx;
		background: #e6f4ff;
		border-radius: 20rpx;
		color: #1677ff;
		font-size: 24rpx;
		white-space: nowrap;
	}

	.robot-status-tag {
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-size: 22rpx;
		display: flex;
		align-items: center;
		gap: 4rpx;
		white-space: nowrap;
	}

	.robot-status-tag.status-online {
		background: #f6ffed;
		color: #52c41a;
        white-space: nowrap;

	}

	.robot-status-tag.status-offline {
		background: #f5f5f5;
		color: #999999;
        white-space: nowrap;

	}

	.status-icon {
		font-size: 20rpx;
	}

	.robot-connect-tag {
		padding: 6rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		white-space: nowrap;
	}

	.robot-connect-tag.connect-connected {
		background: #f6ffed;
		color: #52c41a;
	}

	.robot-connect-tag.connect-disconnected {
		background: #f5f5f5;
		color: #999999;
	}

	.robot-contacts {
		display: flex;
		flex-direction: column;
		gap: 4rpx;
		align-items: center;
	}

	.contact-item {
		font-size: 24rpx;
		color: #666666;
	}

	.robot-actions {
		display: flex;
		flex-direction: column;
		gap: 8rpx;
		width: 100%;
	}

	.action-btn {
		padding: 8rpx 16rpx;
		border-radius: 20rpx;
		font-size: 24rpx;
		text-align: center;
		white-space: nowrap;
		transition: all 0.3s ease;
	}

	.action-btn:active {
		transform: scale(0.95);
	}

	.connect-btn {
		background: #1677ff;
		color: #FFFFFF;
	}

	.disconnect-btn {
		background: #ff4d4f;
		color: #FFFFFF;
	}

	.admin-btn {
		background: #52c41a;
		color: #FFFFFF;
	}

	.delete-btn {
		background: #ff4d4f;
		color: #FFFFFF;
	}

	.robot-bind-actions {
		display: flex;
		gap: 20rpx;
		margin-top: 30rpx;
		padding-top: 30rpx;
		border-top: 1px solid #e0e0e0;
	}
	
	.robot-tip-text {
		margin-top: 30rpx;
		padding: 20rpx;
		background-color: #fff7e6;
		border: 1px solid #ffd591;
		border-radius: 12rpx;
		line-height: 1.6;
		position: relative;
		display: flex;
		align-items: flex-start;
		gap: 16rpx;
	}
	
	.robot-tip-content {
		flex: 1;
		padding-right: 100rpx; /* 为按钮留出空间 */
	}
	
	.robot-tip-content text {
		font-size: 24rpx;
		color: #d46b08;
		line-height: 1.6;
		display: block;
	}
	
	.robot-tip-image-btn {
		flex-shrink: 0;
		width: 80rpx;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid #ffd591;
		border-radius: 12rpx;
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.robot-tip-image-btn:active {
		opacity: 0.7;
		transform: scale(0.95);
	}
	
	.robot-tip-icon {
		width: 60rpx;
		height: 60rpx;
	}

	.bind-btn {
		flex: 1;
		height: 72rpx;
		border-radius: 36rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
	}

	.bind-friend-btn {
		background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3);
	}

	.bind-group-btn {
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
	}

	.bind-btn:active {
		transform: scale(0.95);
	}

	.bind-btn-text {
		color: #FFFFFF;
		font-size: 28rpx;
		font-weight: 500;
	}

	.bind-list-container {
		width: 100%;
		height: 85vh;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background: #fff;
		overflow: hidden;
	}

	.bind-list-header {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24rpx 30rpx;
		border-bottom: 1px solid #e0e0e0;
	}

	.bind-list-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		flex: 1;
	}

	.bind-list-close {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		color: #999999;
		cursor: pointer;
	}

	.bind-robot-info {
		display: flex;
		align-items: center;
		padding: 16rpx 30rpx;
		border-bottom: 1px solid #e0e0e0;
		gap: 16rpx;
		flex-shrink: 0;
	}

	.bind-robot-label {
		font-size: 28rpx;
		color: #666666;
	}

	.bind-robot-avatar-wrapper {
		position: relative;
		width: 60rpx;
		height: 60rpx;
	}

	.bind-robot-avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background: #f0f0f0;
	}

	.bind-robot-online-dot {
		position: absolute;
		bottom: 0;
		right: 0;
		width: 16rpx;
		height: 16rpx;
		background: #52c41a;
		border: 2px solid #fff;
		border-radius: 50%;
	}

	.bind-robot-name {
		font-size: 28rpx;
		color: #333333;
		font-weight: 500;
	}

	.bind-search-section {
		padding: 16rpx 30rpx;
		border-bottom: 1px solid #e0e0e0;
		background: #fafafa;
		flex-shrink: 0;
	}

	.bind-search-wrapper {
		margin-bottom: 16rpx;
	}

	.bind-filter-actions {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.bind-refresh-btn {
		padding: 8rpx 20rpx;
		background: #1677ff;
		border-radius: 20rpx;
	}

	.bind-refresh-text {
		color: #FFFFFF;
		font-size: 24rpx;
	}

	.bind-list-content {
		flex: 1;
		overflow-y: auto;
		padding: 0;
		min-height: 0;
		overflow-x: hidden;
	}

	.bind-table {
		width: 100%;
	}

	.bind-table-header {
		display: flex;
		background: #f5f5f5;
		padding: 12rpx 10rpx;
		border-bottom: 1px solid #e0e0e0;
		position: sticky;
		top: 0;
		z-index: 10;
	}

	.bind-table-row {
		display: flex;
		border-bottom: 1px solid #e0e0e0;
		padding: 12rpx 10rpx;
		align-items: center;
		background: #fff;
	}

	.bind-table-row:last-child {
		border-bottom: none;
	}

	.bind-table-cell {
		padding: 0 8rpx;
		font-size: 24rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		word-break: break-all;
	}

	.bind-action-link {
		color: #1677ff;
		font-size: 24rpx;
		cursor: pointer;
	}

	.bind-action-link.bound {
		color: #52c41a;
		cursor: pointer;
	}

	.bind-action-link.unbind {
		color: #ff4d4f;
	}

	.bind-action-link:active {
		opacity: 0.7;
	}
	
	.bind-action-link.bound:active {
		opacity: 0.7;
	}

	.bind-action-wrapper {
		display: flex;
		align-items: center;
		gap: 8rpx;
	}

	.bind-checkbox-small {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #d9d9d9;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		font-size: 20rpx;
		color: #fff;
		cursor: pointer;
		flex-shrink: 0;
	}

	.bind-checkbox-small.checked {
		background: #1677ff;
		border-color: #1677ff;
	}

	.bind-status-text {
		font-size: 24rpx;
		color: #666666;
	}

	.bind-status-text.bound {
		color: #52c41a;
	}

	.bind-list-empty {
		text-align: center;
		padding: 60rpx 0;
		color: #999999;
		font-size: 28rpx;
	}

	.bind-pagination-section {
		padding: 0;
		border-top: 1px solid #e0e0e0;
		background: rgb(249, 249, 249);
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 60rpx;
		min-height: 60rpx;
		max-height: 60rpx;
		overflow: visible !important;
		clip: none !important;
		clip-path: none !important;
		pointer-events: none;
	}

	.bind-pagination-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
		box-sizing: border-box;
	}

	.bind-pagination-first-btn {
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

	.bind-first-btn-text {
		font-size: 24rpx;
		color: #333;
	}

	.bind-pagination-last-btn {
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

	.bind-last-btn-text {
		font-size: 24rpx;
		color: #333;
	}

	.bind-pagination-page-input {
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

	.bind-page-input {
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

	.bind-page-separator {
		font-size: 30rpx;
		color: #333;
		pointer-events: none;
	}

	.bind-page-total {
		font-size: 30rpx;
		color: #333;
		pointer-events: none;
	}

	/* 左翻页按钮 - 第一个 wd-button */
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:first-of-type,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:first-of-type {
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
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:first-of-type button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:first-of-type .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:first-of-type button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:first-of-type .wd-button {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%) !important;
		border: none !important;
	}

	/* 左翻页按钮禁用状态 - 添加边框和浅背景 */
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:first-of-type.is-disabled button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:first-of-type.is-disabled .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:first-of-type[disabled] button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:first-of-type[disabled] .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:first-of-type.is-disabled button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:first-of-type.is-disabled .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:first-of-type[disabled] button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:first-of-type[disabled] .wd-button {
		background: #f5f5f5 !important;
		border: 1px solid #e0e0e0 !important;
		opacity: 0.6 !important;
	}

	/* 右翻页按钮 - 最后一个 wd-button */
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:last-of-type,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:last-of-type {
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
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:last-of-type button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:last-of-type .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:last-of-type button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:last-of-type .wd-button {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%) !important;
		border: none !important;
	}

	/* 右翻页按钮禁用状态 - 添加边框和浅背景 */
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:last-of-type.is-disabled button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:last-of-type.is-disabled .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:last-of-type[disabled] button,
	::v-deep .bind-pagination-pager .wd-pager__content > wd-button:last-of-type[disabled] .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:last-of-type.is-disabled button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:last-of-type.is-disabled .wd-button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:last-of-type[disabled] button,
	::v-deep .bind-pagination-pager .wd-pager__content .wd-pager__nav:last-of-type[disabled] .wd-button {
		background: #f5f5f5 !important;
		border: 1px solid #e0e0e0 !important;
		opacity: 0.6 !important;
	}

	/* 页码部分居中 - 隐藏原有页码显示 */
	::v-deep .bind-pagination-pager .wd-pager__size {
		display: none !important;
	}

	.bind-filter-checkbox {
		display: flex;
		align-items: center;
		gap: 8rpx;
		cursor: pointer;
	}

	.bind-checkbox-icon {
		width: 32rpx;
		height: 32rpx;
		border: 2rpx solid #d9d9d9;
		border-radius: 4rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #fff;
		font-size: 20rpx;
		color: #fff;
	}

	.bind-checkbox-icon.checked {
		background: #1677ff;
		border-color: #1677ff;
	}

	.bind-checkbox-text {
		font-size: 24rpx;
		color: #333333;
	}

	.bind-list-footer {
		display: flex;
		padding: 16rpx 30rpx;
		border-top: 1px solid #e0e0e0;
		background: #fff;
		flex-shrink: 0;
	}

	.start-btn {
		flex: 0 0 auto;
		width: calc((100% - 12rpx) / 2);
		background: #fff;
		border: 1px solid #e0e0e0;
		border-radius: 16rpx;
		padding: 10rpx 8rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		min-height: 48rpx;
	}

	.btn-text-main {
		font-size: 26rpx;
		font-weight: 700;
		color: #111;
		line-height: 1.2;
	}

	.btn-text-sub {
		margin-top: 2rpx;
		font-size: 20rpx;
		font-weight: 500;
		color: rgba(17, 17, 17, 0.7);
		line-height: 1.2;
	}

	.push-btn {
		flex: 1;
		height: 72rpx;
		background: #1677ff;
		color: #fff;
		border-radius: 16rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 700;
	}

	.copy-btn {
		flex: 1;
		height: 72rpx;
		background: rgba(255, 255, 255, 0.92);
		color: #333;
		border-radius: 16rpx;
		border: 1px solid #e0e0e0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 600;
	}
	
	.template-preview-container {
		width: 100%;
		max-height: 85vh;
		display: flex;
		flex-direction: column;
		background: #fff;
	}
	
	.template-preview-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #e0e0e0;
	}
	
	.template-preview-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333333;
		flex: 1;
	}
	
	.template-preview-close {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 40rpx;
		color: #999999;
		cursor: pointer;
	}
	
	.template-preview-content {
		flex: 1;
		overflow: auto;
		padding: 20rpx;
		display: flex;
		justify-content: center;
		align-items: flex-start;
		cursor: pointer;
	}
	
	.template-image {
		width: 100%;
		max-width: 100%;
		height: auto;
		border-radius: 8rpx;
		transition: transform 0.3s ease;
	}
	
	.template-image-zoomed {
		width: auto;
		max-width: none;
		height: auto;
		max-height: 80vh;
		cursor: zoom-out;
	}
	
	.template-preview-footer {
		padding: 16rpx 30rpx;
		border-top: 1px solid #e0e0e0;
		text-align: center;
		background: #fafafa;
	}
	
	.zoom-hint {
		font-size: 24rpx;
		color: #999999;
	}
</style>

