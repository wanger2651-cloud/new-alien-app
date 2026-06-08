<template>
	<view class="session-detail">
		<wd-navbar
			:fixed="true"
			:safeAreaInsetTop="true"
			title="会话详情"
			left-text="返回"
			left-arrow
			@click-left="handleClickLeft"
			:bordered="false"
		></wd-navbar>

		<!-- 头部：店铺 / 顾客 / 订单信息 -->
		<view 
			class="session-header" 
			:style="{ paddingTop: (systemBarHeight + 44) + 'px' }"
			@touchmove.prevent.stop
			@touchstart.stop
		>
			<image
				class="shop-logo"
				:src="getShopTypeLogo(siteType)"
				mode="aspectFit"
			></image>
			<view class="header-info">
				<view class="shop-row">
					<text class="shop-name">{{ shopName || '未知店铺' }}</text>
					<text class="platform-tag" v-if="platformName">{{ platformName }}</text>
				</view>
				<view class="customer-row">
					<text class="customer-name">{{ customerName || '未知顾客' }}</text>
					<text class="order-id" v-if="sessionDetail?.site_order_id">
						订单：{{ sessionDetail?.site_order_id }}
					</text>
				</view>
				<view class="status-row" v-if="sessionDetail">
					<text class="status-text">
						{{ statusText }}
					</text>
					<text class="unread-text" v-if="sessionDetail.unread_count > 0">
						未读：{{ sessionDetail.unread_count }}
					</text>
				</view>
			</view>
		</view>

		<!-- 消息列表 -->
		<view 
			class="message-container" 
			:class="{ 
				'panel-open': showEmoji || showQuickReply || showMoreMenu,
				'keyboard-open': isKeyboardShow
			}"
			:style="{ 
				paddingBottom: isKeyboardShow 
					? (keyboardHeight + 120) + 'rpx'  // 键盘高度 + 输入框高度，确保消息内容不被遮挡
					: (showEmoji || showQuickReply || showMoreMenu ? '620rpx' : '120rpx')
			}"
		>
			<scroll-view
				class="message-scroll"
				scroll-y="true"
				:scroll-with-animation="true"
				:scroll-into-view="lastMessageDomId || ''"
				@scrolltolower="loadMoreMessages"
				@scroll="handleScroll"
			>
			<view
				v-for="(msg, index) in messageList"
				:key="msg.id"
				:id="'msg-' + msg.id"
				class="message-item"
				:class="msg.direction === ImDirection.Outgoing ? 'from-self' : 'from-customer'"
			>
				<view class="message-meta" v-if="shouldShowTime(index)">
					<text class="meta-time">{{ formatTime(msg.sent_at) }}</text>
				</view>
				<view class="message-bubble-wrapper">
					<view class="avatar" v-if="msg.direction === ImDirection.Incoming">
						<text class="avatar-text">客</text>
					</view>
					<view 
						class="message-bubble"
						:class="{ 
							'has-image': Number(msg.msg_type) === ImMsgType.Image,
							'has-video': Number(msg.msg_type) === ImMsgType.Video
						}"
					>
						<!-- 文本消息 -->
						<text
							v-if="Number(msg.msg_type) === ImMsgType.Text"
							class="msg-text"
						>
							{{ msg.content }}
						</text>

						<!-- 图片消息 -->
						<view
							v-else-if="Number(msg.msg_type) === ImMsgType.Image"
							class="msg-images"
						>
							<view v-if="!getMediaUrls(msg.media_urls) || getMediaUrls(msg.media_urls).length === 0" class="msg-error">
								<text>图片加载失败</text>
							</view>
							<image
								v-for="(url, index) in getMediaUrls(msg.media_urls)"
								:key="index"
								:src="url"
								mode="aspectFill"
								class="msg-image"
								@click="previewImage(url, getMediaUrls(msg.media_urls))"
								@error="handleImageError"
							></image>
						</view>

						<!-- 语音消息 -->
						<view
							v-else-if="Number(msg.msg_type) === ImMsgType.Voice"
							class="msg-voice"
						>
							<view class="voice-wrapper">
								<text class="voice-icon">🎵</text>
								<text class="voice-text">语音消息</text>
								<text class="voice-tip" v-if="getMediaUrls(msg.media_urls) && getMediaUrls(msg.media_urls).length > 0">
									(点击播放)
								</text>
							</view>
						</view>

						<!-- 视频消息 -->
						<view
							v-else-if="Number(msg.msg_type) === ImMsgType.Video"
							class="msg-video"
							:class="{ 
								'video-hidden': showEmoji || showQuickReply || showMoreMenu || isKeyboardShow,
								'video-scrolling': isScrolling
							}"
						>
							<view v-if="!getMediaUrls(msg.media_urls) || getMediaUrls(msg.media_urls).length === 0" class="msg-error">
								<text>视频加载失败</text>
							</view>
							<video
								v-else
								:id="'video-' + msg.id"
								class="video-player"
								:class="{ 
									'video-hidden': showEmoji || showQuickReply || showMoreMenu || isKeyboardShow,
									'video-scrolling': isScrolling
								}"
								:src="getMediaUrls(msg.media_urls)[0]"
								:controls="true"
								:poster="getMediaUrls(msg.media_urls)[1] || ''"
								:show-center-play-btn="true"
								:enable-play-gesture="true"
								:object-fit="'contain'"
								:enable-progress-gesture="true"
								:show-fullscreen-btn="true"
								:play-strategy="0"
								:page-gesture="false"
								@play="handleVideoPlay"
								@pause="handleVideoPause"
								@ended="handleVideoEnded"
								@loadedmetadata="handleVideoLoaded"
							></video>
						</view>

						<!-- 其他消息类型统一按照文本展示 -->
						<text v-else class="msg-text">
							{{ msg.content || `[消息类型: ${msg.msg_type}]` }}
						</text>
					</view>
					<view class="avatar" v-if="msg.direction === ImDirection.Outgoing">
						<text class="avatar-text">我</text>
					</view>
				</view>
			</view>

			<view class="empty-state" v-if="!loadingMessages && messageList.length === 0">
				<text class="empty-text">暂无消息</text>
			</view>
			<view class="loading-more" v-if="loadingMessages">
				<text class="loading-text">加载中...</text>
			</view>
			<view class="no-more" v-if="!loadingMessages && !hasMore && messageList.length > 0">
				<text class="no-more-text">没有更多消息了</text>
			</view>
			</scroll-view>
		</view>

		<!-- 输入区 -->
		<view 
			class="input-bar" 
			:class="{ 
				'panel-open': showEmoji || showQuickReply || showMoreMenu,
				'keyboard-open': isKeyboardShow
			}"
			:style="{
				bottom: inputBarBottom
			}"
			@touchmove.prevent.stop
			@touchstart.stop
		>
			<!-- 麦克风按钮（左侧） -->
			<view class="voice-btn" @click="toggleVoiceMode">
				<text class="voice-icon">🎤</text>
			</view>
			
			<!-- 输入框区域 -->
			<view class="input-wrapper">
				<!-- 文本输入模式 -->
				<input
					v-if="!voiceMode"
					ref="inputRef"
					class="text-input"
					v-model="inputText"
					type="text"
					placeholder="提倡文明用语"
					confirm-type="send"
					:adjust-position="false"
					:hold-keyboard="false"
					:confirm-hold="false"
					:cursor-spacing="100"
					@confirm="handleSendText"
					@focus="handleInputFocus"
				/>
				<!-- 语音输入模式 -->
				<view
					v-else
					class="voice-input"
					@touchstart="startRecord"
					@touchend="stopRecord"
					@touchcancel="cancelRecord"
				>
					<text>按住说话</text>
				</view>
			</view>
			
			<!-- 右侧按钮组 -->
			<view class="right-buttons">
				<!-- 表情按钮 -->
				<view class="icon-btn" @click="toggleEmojiPanel">
					<text class="emoji-icon">😊</text>
				</view>
				<!-- 快捷消息按钮 -->
				<view class="icon-btn" @click="toggleQuickReplyPanel">
					<text class="quick-reply-icon">☰</text>
				</view>
				<!-- 加号按钮 -->
				<view class="icon-btn" @click="toggleMoreMenu">
					<text class="plus-icon">+</text>
				</view>
			</view>
		</view>

		<!-- 表情面板（从下方弹出，统一高度） -->
		<view class="bottom-panel emoji-panel" v-if="showEmoji" :class="{ show: showEmoji }">
			<view class="emoji-panel-header">
				<text class="emoji-panel-title">全部表情</text>
			</view>
			<view class="emoji-panel-content">
				<view class="emoji-list">
					<view
						class="emoji-item"
						v-for="em in emojis"
						:key="em"
						@click="appendEmoji(em)"
					>
						<text class="emoji-text">{{ em }}</text>
					</view>
				</view>
				<!-- 右侧按钮组（删除和发送） -->
				<view class="emoji-right-buttons">
					<!-- 删除按钮 -->
					<view class="emoji-action-btn delete-btn" @click="deleteEmoji">
						<text class="delete-icon">⌫</text>
					</view>
				<!-- 发送按钮 -->
				<view 
					class="emoji-action-btn send-btn" 
					:class="{ 'has-content': canSendText }"
					@click="handleSendFromEmoji"
				>
					<text>发送</text>
				</view>
				</view>
			</view>
		</view>

		<!-- 快捷消息短语面板（统一高度和弹出方式） -->
		<view class="bottom-panel quick-reply-panel" v-if="showQuickReply" :class="{ show: showQuickReply }">
			<view class="panel-header">
				<text class="panel-title">常用语</text>
				<view class="panel-actions">
					<view class="action-buttons">
						<text class="manage-btn" @click="showManageQuickReply = true">管理快捷短语</text>
						<text class="add-btn" @click="handleAddQuickReply">添加快捷短语</text>
					</view>
					<text class="close-btn" @click="showQuickReply = false">✕</text>
				</view>
			</view>
			<scroll-view class="panel-content quick-reply-list" scroll-y>
				<view
					class="quick-reply-item"
					v-for="item in quickReplyList"
					:key="item.id"
					@click="selectQuickReply(item)"
				>
					<text>{{ item.content }}</text>
				</view>
				<view v-if="quickReplyList.length === 0" class="empty-quick-reply">
					<text>暂无常用语，点击编辑添加</text>
				</view>
			</scroll-view>
		</view>

		<!-- 更多菜单（统一高度和弹出方式） -->
		<view class="bottom-panel more-menu-panel" v-if="showMoreMenu" :class="{ show: showMoreMenu }">
			<view class="panel-header">
				<text class="panel-title">选择操作</text>
				<text class="close-btn" @click="showMoreMenu = false">✕</text>
			</view>
			<view class="panel-content more-menu-content">
				<view class="more-menu-item" @click="handleChooseFromCamera">
					<text class="more-menu-icon">📷</text>
					<text class="more-menu-text">相机</text>
				</view>
				<view class="more-menu-item" @click="handleChooseFromAlbum">
					<text class="more-menu-icon">🖼️</text>
					<text class="more-menu-text">相册</text>
				</view>
				<!-- 视频选项暂时隐藏 -->
				<!-- <view class="more-menu-item" @click="handleChooseVideo">
					<text class="more-menu-icon">🎥</text>
					<text class="more-menu-text">视频</text>
				</view> -->
			</view>
		</view>

		<!-- 编辑快捷消息弹窗 -->
		<wd-popup 
			v-model="showEditQuickReply" 
			position="bottom" 
			:safe-area-inset-bottom="true"
			:z-index="2000"
		>
			<view class="edit-quick-reply-panel">
				<view class="edit-header">
					<text class="edit-title">编辑常用语</text>
					<text class="edit-close" @click="showEditQuickReply = false">✕</text>
				</view>
				<scroll-view class="edit-list" scroll-y>
					<view
						class="edit-item"
						v-for="item in quickReplyList"
						:key="item.id"
					>
						<text class="edit-content">{{ item.content }}</text>
						<view class="edit-actions">
							<text class="edit-action-btn" @click="editQuickReplyItem(item)">编辑</text>
							<text class="edit-action-btn delete" @click="deleteQuickReplyItem(item.id)">删除</text>
						</view>
					</view>
					<view class="add-quick-reply-btn" @click="showAddQuickReply = true">
						<text>+ 添加常用语</text>
					</view>
				</scroll-view>
			</view>
		</wd-popup>

		<!-- 管理快捷短语弹窗 -->
		<wd-popup 
			v-model="showManageQuickReply" 
			position="bottom" 
			:safe-area-inset-bottom="true"
			:z-index="2000"
		>
			<view class="manage-quick-reply-panel">
				<view class="manage-header">
					<text class="manage-title">管理快捷短语</text>
					<text class="manage-close" @click="showManageQuickReply = false">✕</text>
				</view>
				<scroll-view class="manage-content" scroll-y>
					<!-- 分组显示 -->
					<view 
						class="quick-reply-group" 
						v-for="(group, groupIndex) in groupedQuickReplies" 
						:key="group.group_name || '未分组'"
					>
						<view class="group-header">
							<text class="group-name">{{ group.group_name || '未分组' }}</text>
							<text class="group-count">({{ group.items.length }})</text>
						</view>
						<view class="group-items">
							<view
								class="manage-item"
								v-for="(item, index) in group.items"
								:key="item.id"
							>
								<view class="manage-item-content">
									<view class="item-main">
										<text class="item-shortcut" v-if="item.shortcut">/{{ item.shortcut }}</text>
										<text class="item-text">{{ item.content }}</text>
									</view>
									<view class="item-actions">
										<text class="item-action-btn" @click="editQuickReplyItem(item)">编辑</text>
										<text class="item-action-btn move-up" 
											v-if="index > 0"
											@click="moveQuickReplyItem(group.items, index, -1)">↑</text>
										<text class="item-action-btn move-down" 
											v-if="index < group.items.length - 1"
											@click="moveQuickReplyItem(group.items, index, 1)">↓</text>
										<text class="item-action-btn delete" @click="deleteQuickReplyItem(item.id)">删除</text>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view v-if="managingQuickReplyList.length === 0" class="empty-manage">
						<text>暂无快捷短语，点击"添加快捷短语"添加</text>
					</view>
				</scroll-view>
			</view>
		</wd-popup>

		<!-- 添加/编辑常用语弹窗 -->
		<wd-popup 
			v-model="showAddQuickReply" 
			position="center"
			:z-index="2000"
		>
			<view class="add-quick-reply-form">
				<view class="form-header">
					<text>{{ editingQuickReply ? '编辑常用语' : '新增话术' }}</text>
					<text class="form-close" @click="closeAddQuickReply">✕</text>
				</view>
				<view class="form-body">
					<view class="form-item">
						<text class="form-label">快捷命令</text>
						<input
							class="form-input"
							v-model="quickReplyForm.shortcut"
							placeholder="输入快捷命令,如:abc (输入/abc快速匹配)"
							maxlength="20"
						/>
						<text class="form-counter">{{ quickReplyForm.shortcut.length }}/20</text>
					</view>
					<view class="form-item">
						<text class="form-label">*话术内容</text>
						<textarea
							class="form-textarea"
							v-model="quickReplyForm.content"
							placeholder="请输入话术内容"
							maxlength="500"
						></textarea>
						<text class="form-counter">{{ quickReplyForm.content.length }}/500</text>
					</view>
					<view class="form-item">
						<text class="form-label">所属分组</text>
						<picker 
							mode="selector" 
							:range="quickReplyGroups" 
							:value="quickReplyGroups.indexOf(quickReplyForm.group_name)"
							@change="handleGroupChange"
						>
							<view class="form-picker">
								<text :class="{ 'placeholder': !quickReplyForm.group_name }">
									{{ quickReplyForm.group_name || '选择分组,留空表示未分组' }}
								</text>
								<text class="picker-arrow">▼</text>
							</view>
						</picker>
						<view class="form-hint">
							<text>可以选择已有分组,或输入新分组名称</text>
						</view>
						<input
							class="form-input"
							v-model="quickReplyForm.group_name"
							placeholder="或输入新分组名称"
							@input="handleGroupNameInput"
						/>
					</view>
					<view class="form-item">
						<text class="form-label">话术类型</text>
						<view class="form-radio-group">
							<view 
								class="form-radio" 
								:class="{ 'active': quickReplyForm.type === 1 }"
								@click="quickReplyForm.type = 1"
							>
								<view class="radio-dot"></view>
								<text>个人话术</text>
							</view>
							<view 
								class="form-radio" 
								:class="{ 'active': quickReplyForm.type === 2 }"
								@click="quickReplyForm.type = 2"
							>
								<view class="radio-dot"></view>
								<text>团队话术</text>
							</view>
						</view>
					</view>
				</view>
				<view class="form-footer">
					<view class="form-btn cancel" @click="closeAddQuickReply">取消</view>
					<view class="form-btn confirm" @click="saveQuickReply">保存</view>
				</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup lang="ts">
	import { onLoad, onReachBottom, onShow, onHide } from '@dcloudio/uni-app'
	import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
	import request from '@/utils/request'
	import { useAuthStore } from '@/store/auth.ts'
	import { ImMsgType } from '@/TsModel/Alien/Entity/Enums/IM/ImMsgType'
	import { ImDirection } from '@/TsModel/Alien/Entity/Enums/IM/ImDirection'
	import { ImSessionStatus } from '@/TsModel/Alien/Entity/Enums/IM/ImSessionStatus'
	import { ShopType } from '@/TsModel/Alien/Entity/Enums/ShopType'
	import type { t_wmt_im_message } from '@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_message'
	import type { t_wmt_im_session } from '@/TsModel/Alien/Entity/Tables/IM/t_wmt_im_session'
	import { API_URL } from '@/env'

	const authStore = useAuthStore()

	const systemBarHeight = ref(0)

	// 路由参数
	const sessionId = ref<string>('')
	const shopId = ref<string>('')
	const customerId = ref<string>('')
	const customerName = ref<string>('')
	const shopName = ref<string>('')
	const siteType = ref<ShopType>(ShopType.None)

	// 会话详情
	const sessionDetail = ref<t_wmt_im_session | null>(null)

	// 消息列表
	const messageList = ref<t_wmt_im_message[]>([])
	const loadingMessages = ref(false)
	const pageIndex = ref(1)
	const pageSize = ref(50) // 增加到50，确保能获取到更多消息，包括最新消息
	const total = ref(0)
	const hasMore = computed(() => messageList.value.length < total.value)
	const lastMessageDomId = ref('')
	// 会话详情页自动刷新定时器与间隔（毫秒）
	const detailRefreshInterval = ref(5000) // 5 秒刷新一次，平衡实时性和性能
	let detailRefreshTimer: ReturnType<typeof setInterval> | null = null
	let lastRefreshTime = 0 // 上次刷新时间，用于防抖
	const minRefreshInterval = 2000 // 最小刷新间隔2秒，防止过于频繁
	
	// 工具函数：获取消息时间戳
	const getMessageTime = (msg: any): number => {
		return new Date(msg.sent_at || msg.crtim || msg.created_at || 0).getTime()
	}

	// 工具函数：按时间排序消息
	const sortMessagesByTime = (messages: t_wmt_im_message[]): t_wmt_im_message[] => {
		return [...messages].sort((a, b) => getMessageTime(a) - getMessageTime(b))
	}

	// 更新最后一条消息的DOM ID（用于滚动定位）
	const updateLastMessageId = () => {
		if (messageList.value.length > 0) {
			const last = messageList.value[messageList.value.length - 1]
			const newId = 'msg-' + last.id
			// 先清空，再设置，强制触发滚动
			if (lastMessageDomId.value === newId) {
				// 如果ID相同，先清空再设置，强制触发滚动
				lastMessageDomId.value = ''
				nextTick(() => {
					lastMessageDomId.value = newId
				})
			} else {
				lastMessageDomId.value = newId
			}
		}
	}

	// 滚动到底部显示最新消息
	const scrollToBottom = () => {
		setTimeout(() => {
			updateLastMessageId()
		}, 100)
	}

	// 发送相关
	const inputText = ref('')
	const sending = ref(false)
	const showEmoji = ref(false)
	const voiceMode = ref(false) // 语音模式
	const showQuickReply = ref(false) // 快捷消息面板
	const showMoreMenu = ref(false) // 更多菜单
	const showEditQuickReply = ref(false) // 编辑快捷消息面板（已废弃，保留兼容）
	const showManageQuickReply = ref(false) // 管理快捷短语弹窗
	const showAddQuickReply = ref(false) // 添加/编辑常用语弹窗
	const editingQuickReply = ref<any>(null) // 正在编辑的常用语
	const quickReplyList = ref<any[]>([]) // 快捷消息列表
	const quickReplyForm = ref({ 
		shortcut: '', // 快捷命令
		content: '', // 话术内容
		group: '', // 分组ID
		group_name: '', // 分组名称
		type: 1 // 话术类型：1=个人，2=团队
	}) // 常用语表单
	const quickReplyGroups = ref<string[]>([]) // 分组列表
	const managingQuickReplyList = ref<any[]>([]) // 管理界面的快捷短语列表
	const isDragging = ref(false) // 是否正在拖拽排序
	
	// 键盘相关
	const keyboardHeight = ref(0) // 键盘高度
	const isKeyboardShow = ref(false) // 键盘是否显示
	const lockedKeyboardHeight = ref(0) // 锁定的键盘高度（防止滚动时被修改）
	const keyboardHeightLocked = ref(false) // 是否锁定键盘高度
	const lockedInputBarBottom = ref('') // 锁定的编辑栏 bottom 值（固定字符串，防止重新计算）
	
	// 录音相关
	const recording = ref(false)
	const recordTimer = ref<any>(null)
	const recordDuration = ref(0)
	
	// 24个常用表情（4行6列，与图片保持一致）
	const emojis = [
		'😀', '😃', '😍', '😂', '😉', '😠',
		'😐', '😢', '😮', '🤦', '😂', '😵',
		'😡', '😡', '🤔', '😱', '😏', '😭',
		'😱', '🍴', '😛', '👍', '⚡', '👊'
	]

	const canSendText = computed(() => !!inputText.value.trim() && !!sessionId.value && !sending.value)
	
	// 计算编辑栏的 bottom 值，锁定键盘打开时的值，防止滚动时被修改
	const inputBarBottom = computed(() => {
		// 如果已锁定 bottom 值（固定字符串），直接返回，完全忽略其他状态变化
		if (lockedInputBarBottom.value) {
			return lockedInputBarBottom.value
		}
		
		// 如果键盘已锁定，使用锁定的高度值并固定为字符串
		if (keyboardHeightLocked.value && lockedKeyboardHeight.value > 0) {
			const fixedBottom = lockedKeyboardHeight.value + 'rpx'
			lockedInputBarBottom.value = fixedBottom // 固定为字符串，防止重新计算
			return fixedBottom
		}
		
		// 键盘打开但未锁定，使用当前高度值并立即锁定
		if (isKeyboardShow.value && keyboardHeight.value > 0) {
			// 立即锁定，防止后续状态变化
			if (!keyboardHeightLocked.value) {
				lockedKeyboardHeight.value = keyboardHeight.value
				keyboardHeightLocked.value = true
			}
			const fixedBottom = lockedKeyboardHeight.value + 'rpx'
			lockedInputBarBottom.value = fixedBottom // 固定为字符串，防止重新计算
			return fixedBottom
		}
		
		// 面板打开
		if (showEmoji.value || showQuickReply.value || showMoreMenu.value) {
			// 面板打开时不清除锁定状态，保持键盘高度锁定
			// 但清除 bottom 锁定，使用面板的固定值
			lockedInputBarBottom.value = ''
			return '500rpx'
		}
		
		// 默认位置（键盘和面板都关闭时）
		keyboardHeightLocked.value = false
		lockedKeyboardHeight.value = 0
		lockedInputBarBottom.value = ''
		return '0'
	})

	// 平台 logo 映射（与消息管理页面保持一致）
	const platformLogos = new Map<number, string>()
	platformLogos.set(1, 'https://p0.meituan.net/shangouproductapi/8bb7f604d4c10239f736f2c450ce92ef93342.png') // 美团餐饮
	platformLogos.set(2, 'https://p0.meituan.net/shangouproductapi/280765bbbe4aeb0603d386eea888ab8c151948.png') // 饿了么
	platformLogos.set(3, 'https://p0.meituan.net/shangouproductapi/e4f5dff1d5445c2895d6ca9e3a55bf2744440.png') // 美团闪购
	platformLogos.set(4, 'https://p0.meituan.net/shangouproductapi/a4022ea3fb17f68c43ecbfcec893c836102681.png') // 美团医药
	platformLogos.set(5, 'https://p0.meituan.net/shangouproductapi/546c580071907f18b7b9ea913fc29812158401.png') // 饿百零售
	platformLogos.set(6, 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png') // 京东到家

	const platformName = computed(() => {
		switch (siteType.value) {
			case ShopType.美团:
				return '美团'
			case ShopType.饿了么:
				return '饿了么'
			case ShopType.美团闪购:
				return '美团闪购'
			case ShopType.美团医药:
				return '美团医药'
			case ShopType.饿百零售:
				return '饿百零售'
			case ShopType.京东到家:
				return '京东到家'
			default:
				return ''
		}
	})

	const statusText = computed(() => {
		if (!sessionDetail.value) return ''
		switch (sessionDetail.value.status) {
			case ImSessionStatus.Pending:
				return '待回复'
			case ImSessionStatus.Replied:
				return '已回复'
			case ImSessionStatus.Closed:
				return '已关闭'
			default:
				return ''
		}
	})

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight || 0
			}
		})
	}

	const getShopTypeLogo = (shopType: ShopType | number) => {
		return platformLogos.get(Number(shopType)) || '/static/shop/default.png'
	}

	const handleClickLeft = () => {
		uni.navigateBack()
	}

	// 时间格式化（与列表页保持一致）
	const formatTime = (time: any) => {
		if (!time) return ''
		const date = new Date(time)
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
	
	// 时间显示周期：5分钟（参考微信、QQ等主流聊天软件）
	const TIME_DISPLAY_INTERVAL = 5 * 60 * 1000 // 5分钟，单位：毫秒
	
	// 判断是否显示时间
	// 规则：如果当前消息与上一条消息的时间间隔超过5分钟，则显示时间
	const shouldShowTime = (currentIndex: number): boolean => {
		if (currentIndex === 0) {
			// 第一条消息始终显示时间
			return true
		}
		
		const currentMsg = messageList.value[currentIndex]
		const previousMsg = messageList.value[currentIndex - 1]
		
		if (!currentMsg || !previousMsg) {
			return true
		}
		
		const currentTime = new Date(currentMsg.sent_at).getTime()
		const previousTime = new Date(previousMsg.sent_at).getTime()
		const timeDiff = currentTime - previousTime
		
		// 如果时间间隔超过5分钟，显示时间
		return timeDiff > TIME_DISPLAY_INTERVAL
	}

	// 处理 media_urls（可能是字符串需要解析，也可能是数组）
	const getMediaUrls = (mediaUrls: any): string[] => {
		if (!mediaUrls) return []
		if (Array.isArray(mediaUrls)) {
			return mediaUrls.filter(url => url && typeof url === 'string')
		}
		if (typeof mediaUrls === 'string') {
			try {
				const parsed = JSON.parse(mediaUrls)
				return Array.isArray(parsed) ? parsed.filter(url => url && typeof url === 'string') : []
			} catch {
				return [mediaUrls]
			}
		}
		return []
	}

	// 预览图片
	const previewImage = (current: string, urls: string[]) => {
		if (!current || !urls || !urls.length) return
		uni.previewImage({
			current,
			urls
		})
	}

	// 图片加载错误处理
	const handleImageError = (e: any) => {
		if (import.meta.env.DEV) {
			console.error('图片加载失败:', e)
		}
	}

	// 视频播放器上下文管理
	const videoContexts = ref<Map<string, any>>(new Map())

	// 视频播放事件处理
	const handleVideoPlay = (e: any) => {
		if (import.meta.env.DEV) {
			console.log('视频开始播放:', e)
		}
		// 暂停其他正在播放的视频，避免多个视频同时播放
		const currentVideoId = e.target?.id || e.currentTarget?.id
		videoContexts.value.forEach((context, videoId) => {
			if (videoId !== currentVideoId) {
				try {
					context.pause()
				} catch (err) {
					// 忽略错误
				}
			}
		})
	}

	const handleVideoPause = (e: any) => {
		if (import.meta.env.DEV) {
			console.log('视频暂停:', e)
		}
	}

	const handleVideoEnded = (e: any) => {
		if (import.meta.env.DEV) {
			console.log('视频播放结束:', e)
		}
	}

	// 视频加载完成，创建视频上下文
	const handleVideoLoaded = (e: any) => {
		try {
			const videoId = e.target?.id || e.currentTarget?.id
			if (videoId && videoId.startsWith('video-')) {
				const msgId = videoId.replace('video-', '')
				const context = uni.createVideoContext(msgId)
				if (context) {
					videoContexts.value.set(videoId, context)
					if (import.meta.env.DEV) {
						console.log('创建视频上下文成功:', videoId, msgId)
					}
				}
			}
		} catch (err) {
			if (import.meta.env.DEV) {
				console.warn('创建视频上下文失败:', err)
			}
		}
	}

	// 暂停所有正在播放的视频
	const pauseAllVideos = () => {
		videoContexts.value.forEach((context) => {
			try {
				context.pause()
			} catch (err) {
				// 忽略错误
			}
		})
	}

	// 滚动状态
	const isScrolling = ref(false)
	let scrollTimer: ReturnType<typeof setTimeout> | null = null
	let scrollEndTimer: ReturnType<typeof setTimeout> | null = null

	// 滚动事件处理，当滚动时暂停视频并标记滚动状态（防止重影）
	const handleScroll = () => {
		// 标记正在滚动
		isScrolling.value = true
		
		// 防抖：滚动时暂停所有视频，避免重影
		if (scrollTimer) {
			clearTimeout(scrollTimer)
		}
		pauseAllVideos()
		
		// 清除之前的滚动结束定时器
		if (scrollEndTimer) {
			clearTimeout(scrollEndTimer)
		}
		
		// 滚动结束后，标记滚动结束
		scrollEndTimer = setTimeout(() => {
			isScrolling.value = false
			scrollEndTimer = null
		}, 300) // 300ms内没有滚动事件，认为滚动结束
		
		scrollTimer = setTimeout(() => {
			scrollTimer = null
		}, 100)
	}

	// 获取会话详情（包含店铺名、订单号等）
	const loadSessionDetail = async () => {
		if (!sessionId.value) {
			console.warn('sessionId为空，无法加载会话详情')
			return
		}
		try {
			const result: any = await request({
				url: `IM/Session/${sessionId.value}`,
				method: 'GET'
			})
			if (import.meta.env.DEV) {
				console.log('[会话详情] 加载成功')
			}
			if (result) {
				sessionDetail.value = result as t_wmt_im_session
				// 如果列表页传入的信息为空，用接口返回的数据兜底
				if (!shopName.value) {
					shopName.value = result.shop_name || ''
				}
				if (!customerName.value) {
					customerName.value = result.customer_name || ''
				}
				if (!siteType.value && result.site_type) {
					siteType.value = result.site_type
				}
			}
		} catch (error) {
			console.error('加载会话详情失败:', error)
		}
	}

	// 获取消息列表（分页）
	// reset: 是否重置为第一页
	// silent: 是否静默刷新（不弹 Toast、不打印大量日志）
	// force: 是否强制刷新（忽略防抖限制）
	const loadMessages = async (reset = false, silent = false, force = false) => {
		if (!sessionId.value) {
			if (!silent) console.warn('sessionId为空，无法加载消息')
			return
		}
		
		// 防抖：如果距离上次刷新时间太短，且不是强制刷新，则跳过
		const now = Date.now()
		if (!force && !reset && now - lastRefreshTime < minRefreshInterval) {
			if (!silent) {
				console.log('[防抖] 刷新过于频繁，跳过本次请求')
			}
			return
		}
		
		if (loadingMessages.value) {
			if (!silent) {
				console.log('[防抖] 正在加载中，跳过本次请求')
			}
			return
		}
		
		lastRefreshTime = now

		if (reset) {
			pageIndex.value = 1
			messageList.value = []
			total.value = 0
		}

		loadingMessages.value = true
		try {
			const result: any = await request({
				url: `IM/Session/${sessionId.value}/messages`,
				method: 'GET',
				data: {
					page: pageIndex.value,
					pageSize: pageSize.value
				}
			})

			// 调试日志：只在开发环境且非静默刷新时打印
			if (!silent && import.meta.env.DEV) {
				console.log('[消息加载] 接口返回，消息数量:', result?.data?.rows?.length || result?.rows?.length || 0)
			}

			// 兼容多种返回格式（与消息管理页面保持一致）
			const parseApiResponse = (data: any): { rows: t_wmt_im_message[], total: number } => {
				// 格式1: { rows: [], total: 100 }
				if (Array.isArray(data?.rows)) {
					return { rows: data.rows, total: data.total || data.Total || 0 }
				}
				// 格式2: { data: { rows: [], total: 100 } }
				if (data?.data && Array.isArray(data.data.rows)) {
					return { rows: data.data.rows, total: data.data.total || data.data.Total || 0 }
				}
				// 格式3: { Data: { Rows: [], Total: 100 } }
				if (data?.Data && Array.isArray(data.Data.Rows)) {
					return { rows: data.Data.Rows, total: data.Data.Total || 0 }
				}
				// 格式4: { data: { Rows: [], Total: 100 } }
				if (data?.data && Array.isArray(data.data.Rows)) {
					return { rows: data.data.Rows, total: data.data.Total || 0 }
				}
				// 格式5: 直接是数组
				if (Array.isArray(data)) {
					return { rows: data, total: data.length }
				}
				return { rows: [], total: 0 }
			}

			const { rows, total: totalCount } = parseApiResponse(result)

			if (!silent && import.meta.env.DEV) {
				console.log('[消息加载] 解析后消息数量:', rows.length, '总数:', totalCount)
			}

			if (rows && rows.length > 0) {
				// 处理每条消息，确保格式正确
				const processMessage = (msg: any): t_wmt_im_message => {
					// 确保 msg_type 是数字
					if (typeof msg.msg_type !== 'number') {
						msg.msg_type = Number(msg.msg_type) || ImMsgType.Text
					}
					// 确保 direction 是数字
					if (typeof msg.direction !== 'number') {
						msg.direction = Number(msg.direction) || ImDirection.Incoming
					}
					// 处理 media_urls
					if (msg.media_urls) {
						msg.media_urls = getMediaUrls(msg.media_urls)
					}
					// 调试日志：只在开发环境打印非文本消息详情
					if (!silent && import.meta.env.DEV && Number(msg.msg_type) !== ImMsgType.Text) {
						console.log('[非文本消息]', msg.id, '类型:', msg.msg_type)
					}
					return msg
				}

				const processedRows = rows.map(processMessage)

				if (pageIndex.value === 1) {
					// 第一页：首次加载或自动刷新
					if (reset) {
						// 重置模式：直接替换
						messageList.value = processedRows
						scrollToBottom()
					} else {
						// 自动刷新模式：智能合并新消息
						mergeNewMessages(processedRows, silent)
					}
				} else {
					// 加载更多历史消息：追加到列表前面
					messageList.value = [...processedRows, ...messageList.value]
				}
				total.value = totalCount
			} else {
				console.warn('未找到消息数据')
				if (pageIndex.value === 1 && reset) {
					messageList.value = []
				}
				total.value = 0
			}
		} catch (error) {
			console.error('加载消息列表失败:', error)
			if (!silent) {
				uni.showToast({
					title: '加载消息失败，请重试',
					icon: 'none'
				})
			}
		} finally {
			loadingMessages.value = false
		}
	}

	// 合并新消息到现有列表
	// 注意：消息存储在服务器端，客户端只是临时缓存，不应该主动删除已加载的消息
	// 通过分页加载来管理消息，保持与电脑端一致的行为
	const mergeNewMessages = (newRows: t_wmt_im_message[], silent: boolean) => {
		if (messageList.value.length === 0) {
			// 如果列表为空，直接使用新数据
			messageList.value = newRows
			scrollToBottom()
			if (!silent && import.meta.env.DEV) {
				console.log('[消息合并] 列表为空，直接加载:', newRows.length, '条')
			}
			return
		}

		// 获取当前列表的最后一条消息（最新的消息）
		const currentLastMessage = messageList.value[messageList.value.length - 1]
		const currentLastTime = getMessageTime(currentLastMessage)
		
		// 获取API返回的消息中最新的时间戳（可能是第一条或最后一条，取决于API排序）
		const apiFirstTime = newRows.length > 0 ? getMessageTime(newRows[0]) : 0
		const apiLastTime = newRows.length > 0 ? getMessageTime(newRows[newRows.length - 1]) : 0
		const apiLatestTime = Math.max(apiFirstTime, apiLastTime)
		
		// 获取API返回的最新消息ID（用于更准确的判断）
		const apiLatestMessage = apiFirstTime > apiLastTime ? newRows[0] : newRows[newRows.length - 1]
		const apiLatestMessageId = apiLatestMessage ? String(apiLatestMessage.id) : ''
		
		// 检查是否有新消息：通过时间戳和ID双重判断
		// 如果API返回的最新消息时间比当前列表的最新消息时间新，说明可能有新消息
		// 或者如果API返回的最新消息ID不在当前列表中，也说明有新消息
		const hasNewMessageByTime = apiLatestTime > currentLastTime
		const currentLatestId = String(currentLastMessage.id)
		const hasNewMessageById = apiLatestMessageId && apiLatestMessageId !== currentLatestId
		
		// 始终输出关键日志，方便调试（即使silent模式）
		if (import.meta.env.DEV) {
			console.log('[消息合并] 时间比较 - 当前:', new Date(currentLastTime).toLocaleTimeString(), 'API:', new Date(apiLatestTime).toLocaleTimeString())
			console.log('[消息合并] 当前列表数量:', messageList.value.length, 'API返回数量:', newRows.length)
			console.log('[消息合并] 当前最新ID:', currentLatestId, 'API最新ID:', apiLatestMessageId)
			console.log('[消息合并] 时间戳比较:', hasNewMessageByTime, 'ID比较:', hasNewMessageById)
		}
		
		// 获取所有现有消息ID集合（一次性创建，避免重复）
		const allExistingIds = new Set(messageList.value.map(msg => String(msg.id)))
		
		// 辅助函数：合并新消息并滚动到底部
		const mergeAndScroll = (messages: t_wmt_im_message[], logMsg: string) => {
			if (messages.length > 0) {
				messageList.value = sortMessagesByTime([...messageList.value, ...messages])
				scrollToBottom()
				if (import.meta.env.DEV) {
					console.log(`[消息合并] ${logMsg}: ${messages.length} 条`)
				}
			}
		}
		
		if (hasNewMessageByTime || hasNewMessageById) {
			// 找出新消息（不在当前列表中的）
			const newMessages = newRows.filter(msg => !allExistingIds.has(String(msg.id)))

			if (newMessages.length > 0) {
				// 有新消息，合并并按时间排序
				mergeAndScroll(newMessages, `✅ 检测到新消息，总数: ${messageList.value.length + newMessages.length}`)
				if (import.meta.env.DEV) {
					console.log('[消息合并] 新消息IDs:', newMessages.map(m => m.id).join(','))
				}
			} else if (hasNewMessageById) {
				// 没有通过ID找到新消息，但API返回的最新消息ID与当前不同
				const allNewFromApi = newRows.filter(msg => !allExistingIds.has(String(msg.id)))
				if (allNewFromApi.length > 0) {
					mergeAndScroll(allNewFromApi, '通过ID检测到新消息，合并')
				} else {
					// API返回的最新消息可能已经在列表中，但时间戳更新了，更新该消息的状态
					const latestInApi = newRows.find(msg => String(msg.id) === apiLatestMessageId)
					if (latestInApi) {
						const index = messageList.value.findIndex(msg => String(msg.id) === apiLatestMessageId)
						if (index >= 0) {
							messageList.value[index] = latestInApi
							if (import.meta.env.DEV) {
								console.log('[消息合并] 更新最新消息状态')
							}
						} else {
							// 如果找不到，说明排序有问题，重新排序整个列表
							mergeAndScroll([latestInApi], '添加遗漏的最新消息')
						}
					}
				}
			} else {
				// 时间戳没有更新，但可能有其他情况，检查是否有遗漏的消息
				const missingMessages = newRows.filter(msg => !allExistingIds.has(String(msg.id)))
				if (missingMessages.length > 0) {
					mergeAndScroll(missingMessages, '发现遗漏消息（时间戳未更新）')
				} else if (apiLatestMessageId && apiLatestMessageId !== currentLatestId) {
					// API返回的最新消息ID与当前不同，但该消息已在列表中
					const latestInApi = newRows.find(msg => String(msg.id) === apiLatestMessageId)
					if (latestInApi) {
						const index = messageList.value.findIndex(msg => String(msg.id) === apiLatestMessageId)
						if (index < 0) {
							mergeAndScroll([latestInApi], '添加遗漏的最新消息（ID不同）')
						}
					}
				}
			}
		} else {
			// 时间戳和ID都没有变化，但为了确保不遗漏，再次检查所有消息
			const missingMessages = newRows.filter(msg => !allExistingIds.has(String(msg.id)))
			if (missingMessages.length > 0) {
				mergeAndScroll(missingMessages, '⚠️ 时间戳未更新但发现遗漏消息')
				if (import.meta.env.DEV) {
					console.log('[消息合并] 遗漏消息IDs:', missingMessages.map(m => m.id).join(','))
				}
			} else if (import.meta.env.DEV) {
				// 确实没有新消息
				console.log('[消息合并] 无新消息，当前最新ID:', currentLatestId, 'API最新ID:', apiLatestMessageId)
				console.log('[消息合并] 当前最新时间:', new Date(currentLastTime).toISOString())
				console.log('[消息合并] API最新时间:', new Date(apiLatestTime).toISOString())
			}
		}
	}

	const loadMoreMessages = () => {
		if (!hasMore.value || loadingMessages.value) return
		pageIndex.value++
		loadMessages(false, false)
	}

	// 会话详情自动刷新：仅在当前页面可见时轮询最新消息
	const startDetailAutoRefresh = () => {
		stopDetailAutoRefresh() // 先停止已有的定时器，避免重复
		if (import.meta.env.DEV) {
			console.log('[自动刷新] 启动，间隔:', detailRefreshInterval.value, 'ms')
		}
		detailRefreshTimer = setInterval(() => {
			if (!loadingMessages.value && sessionId.value) {
				pageIndex.value = 1
				// 改为非静默模式，方便调试新消息问题
				loadMessages(false, false) // 非静默，输出调试日志
			}
		}, detailRefreshInterval.value)
	}

	const stopDetailAutoRefresh = () => {
		if (detailRefreshTimer) {
			clearInterval(detailRefreshTimer)
			detailRefreshTimer = null
		}
	}

	onReachBottom(() => {
		loadMoreMessages()
	})

	// 发送通用方法
	const sendMessage = async (msgType: ImMsgType, content: string, mediaUrls?: string[] | null) => {
		if (!sessionId.value) {
			uni.showToast({
				title: '会话不存在',
				icon: 'none'
			})
			return
		}
		if (!content && (!mediaUrls || mediaUrls.length === 0)) {
			return
		}
		try {
			sending.value = true
			if (import.meta.env.DEV) {
				console.log('[发送消息]', { msgType, content: content?.substring(0, 50) })
			}
			
			const result: any = await request({
				url: `IM/Session/${sessionId.value}/reply`,
				method: 'POST',
				data: {
					MsgType: msgType,
					Content: content || '',
					MediaUrls: mediaUrls || null
				}
			})
			
			if (import.meta.env.DEV) {
				console.log('[发送消息] 成功')
			}
			
			// 发送成功后，刷新最新一页消息
			inputText.value = ''
			showEmoji.value = false
			
			// 先立即添加一条临时消息到列表（乐观更新）
			const tempMessage: any = {
				id: 'temp-' + Date.now(),
				msg_type: msgType,
				content: content || '',
				media_urls: mediaUrls || [],
				direction: ImDirection.Outgoing,
				sent_at: new Date(),
				is_read: false
			}
			messageList.value.push(tempMessage)
			setTimeout(() => {
				updateLastMessageId()
			}, 100)
			
			// 延迟刷新，确保后端已保存，然后替换临时消息
			// 使用静默刷新，减少日志输出
			setTimeout(() => {
				pageIndex.value = 1
				loadMessages(true, true, true).then(() => {
					// 滚动到底部显示最新消息
					setTimeout(() => {
						updateLastMessageId()
					}, 200)
				})
			}, 600) // 减少延迟时间，从800ms改为600ms
		} catch (error) {
			console.error('发送消息失败:', error)
			uni.showToast({
				title: '发送失败，请重试',
				icon: 'none'
			})
		} finally {
			sending.value = false
		}
	}

	// 发送文本消息
	const handleSendText = () => {
		if (!canSendText.value) return
		const text = inputText.value.trim()
		sendMessage(ImMsgType.Text, text)
	}

	// 选择图片并发送图片消息
	const handleChooseImage = () => {
		if (!sessionId.value) return
		uni.chooseImage({
			count: 3,
			success: (res) => {
				const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : []
				if (!paths.length) return
				uploadFiles(paths, ImMsgType.Image)
			}
		})
	}

	// 选择视频并发送视频消息
	const handleChooseVideo = () => {
		if (!sessionId.value) return
		uni.chooseVideo({
			sourceType: ['album', 'camera'],
			success: (res) => {
				if (!res.tempFilePath) return
				uploadFiles([res.tempFilePath], ImMsgType.Video)
			}
		})
	}

	// 语音暂不接入录制，先给出提示，避免空功能
	const handleVoiceNotImplemented = () => {
		uni.showToast({
			title: '语音发送暂未接入，请先使用文字/图片/视频',
			icon: 'none'
		})
	}

	// 上传文件到服务器，获取可访问 URL 后发送消息
	const uploadFiles = (paths: string[], msgType: ImMsgType) => {
		if (!paths.length) {
			uni.showToast({
				title: '请选择文件',
				icon: 'none'
			})
			return
		}
		
		if (!sessionId.value) {
			uni.showToast({
				title: '会话不存在',
				icon: 'none'
			})
			return
		}
		
		const token = authStore.token || uni.getStorageSync('token') || ''
		if (!token) {
			uni.showToast({
				title: '请先登录',
				icon: 'none'
			})
			return
		}
		
		if (import.meta.env.DEV) {
			console.log('[文件上传] 开始，文件数量:', paths.length, '消息类型:', msgType)
		}
		uni.showLoading({ title: '上传中...', mask: true })
		const uploadedUrls: string[] = []
		let uploadError = false
		let errorMessage = ''

		const uploadSingle = (index: number) => {
			if (index >= paths.length) {
				uni.hideLoading()
				if (uploadError) {
					uni.showToast({
						title: errorMessage || '上传失败，请重试',
						icon: 'none',
						duration: 2000
					})
					return
				}
				if (!uploadedUrls.length) {
					uni.showToast({
						title: '上传失败，未获取到文件URL',
						icon: 'none'
					})
					return
				}
				if (import.meta.env.DEV) {
					console.log('[文件上传] 完成，准备发送消息:', { msgType, uploadedUrls })
				}
				// 图片：多张；视频：第一项为视频URL
				sendMessage(msgType, '', uploadedUrls)
				return
			}

			let filePath = paths[index]
			
			// APP-PLUS环境下，处理file://协议路径
			// #ifdef APP-PLUS
			if (filePath && filePath.startsWith('file://')) {
				filePath = filePath.replace(/^file:\/\//, '')
			}
			// #endif
			
			// 构建上传URL（使用动态API_URL，路径为大写U，与TsModel保持一致）
			const savedApiBaseUrl = uni.getStorageSync('apiBaseUrl')
			let baseUrl = savedApiBaseUrl || API_URL
			if (!baseUrl.endsWith('/')) {
				baseUrl += '/'
			}
			const uploadUrl = baseUrl + 'system/method/file/Upload'
			
			// 构建请求头
			const uploadHeader: Record<string, string> = {
				'Authorization': 'Bearer ' + token
			}
			
			// APP-PLUS环境下，添加platform等请求头
			// #ifdef APP-PLUS
			const platform = uni.getStorageSync('platform')
			if (platform) {
				uploadHeader['platform'] = platform
			}
			uploadHeader['client-version'] = '5.2.7'
			// #endif
			
			uni.uploadFile({
				// 使用完整URL，和feedback.vue保持一致
				url: uploadUrl,
				filePath,
				name: 'file',
				formData: {},
				header: uploadHeader,
				success: (uploadRes) => {
					if (import.meta.env.DEV) {
						console.log(`[上传${index + 1}] 响应，状态码:`, uploadRes.statusCode)
					}
					
					// 检查状态码
					if (uploadRes.statusCode !== 200) {
						const errMsg = `上传失败 (状态码: ${uploadRes.statusCode})`
						
						if (import.meta.env.DEV) {
							console.error(`[上传${index + 1}] 失败:`, errMsg, '响应数据:', uploadRes.data)
						}
						
						// 尝试解析错误信息
						if (typeof uploadRes.data === 'string') {
							if (uploadRes.data === uploadUrl) {
								errorMessage = `上传失败：服务器返回异常 (${uploadRes.statusCode})`
							} else {
								try {
									const errorData = JSON.parse(uploadRes.data)
									errorMessage = errorData.message || errorData.msg || errorData.error || errMsg
								} catch (e) {
									errorMessage = `上传失败：服务器返回异常 (${uploadRes.statusCode})，请检查文件格式和大小`
								}
							}
						} else {
							errorMessage = errMsg
						}
						
						uploadError = true
						return
					}
					
					try {
						// 解析响应数据
						let data: any = null
						if (typeof uploadRes.data === 'string') {
							data = JSON.parse(uploadRes.data || '{}')
						} else if (typeof uploadRes.data === 'object') {
							data = uploadRes.data
						} else {
							data = {}
						}
						
						// 提取文件URL（支持多种返回格式）
						const fileUrl = data?.url || data?.data?.url || data?.Data?.url || 
						                 data?.data?.data?.url || data?.Success?.Data?.url
						
						if (fileUrl) {
							// 确保URL是完整的
							const finalUrl = fileUrl.startsWith('http://') || fileUrl.startsWith('https://') 
								? fileUrl 
								: (fileUrl.startsWith('/') ? fileUrl : '/' + fileUrl)
							uploadedUrls.push(finalUrl)
							
							if (import.meta.env.DEV) {
								console.log(`[上传${index + 1}] 成功，文件URL:`, finalUrl)
							}
						} else {
							if (import.meta.env.DEV) {
								console.error(`[上传${index + 1}] 响应中没有找到url字段:`, data)
							}
							uploadError = true
							errorMessage = '上传失败：服务器返回格式错误'
						}
					} catch (e: any) {
						if (import.meta.env.DEV) {
							console.error(`[上传${index + 1}] 解析失败:`, e, '原始数据:', uploadRes.data)
						}
						uploadError = true
						errorMessage = `解析失败: ${e.message || '未知错误'}`
					}
				},
				fail: (err: any) => {
					if (import.meta.env.DEV) {
						console.error(`[上传${index + 1}] 请求失败:`, err.errMsg || err.message, err)
					}
					
					uploadError = true
					
					// 根据错误类型提供更具体的错误信息
					if (err.statusCode === 400) {
						errorMessage = '上传失败：请求格式错误，请检查文件格式和大小'
					} else if (err.statusCode === 401) {
						errorMessage = '上传失败：未授权，请重新登录'
					} else if (err.statusCode === 413) {
						errorMessage = '上传失败：文件过大'
					} else {
						errorMessage = err.errMsg || err.message || '网络错误，请检查网络连接'
					}
				},
				complete: () => {
					// 无论成功或失败，都继续下一个文件
					uploadSingle(index + 1)
				}
			})
		}

		uploadSingle(0)
	}

	// 语音模式切换
	const toggleVoiceMode = () => {
		voiceMode.value = !voiceMode.value
		// 切换模式时关闭其他面板
		showEmoji.value = false
		showQuickReply.value = false
		showMoreMenu.value = false
	}

	// 开始录音
	const startRecord = () => {
		if (!sessionId.value) return
		recording.value = true
		recordDuration.value = 0
		// 开始录音计时
		recordTimer.value = setInterval(() => {
			recordDuration.value++
		}, 1000)
		// TODO: 调用录音API
		console.log('开始录音')
	}

	// 停止录音并发送
	const stopRecord = () => {
		if (!recording.value) return
		recording.value = false
		if (recordTimer.value) {
			clearInterval(recordTimer.value)
			recordTimer.value = null
		}
		// TODO: 停止录音并上传，然后发送语音消息
		console.log('停止录音，时长:', recordDuration.value, '秒')
		if (recordDuration.value > 0) {
			// 暂时提示
			uni.showToast({
				title: '语音录制功能开发中',
				icon: 'none'
			})
		}
		recordDuration.value = 0
	}

	// 取消录音
	const cancelRecord = () => {
		if (!recording.value) return
		recording.value = false
		if (recordTimer.value) {
			clearInterval(recordTimer.value)
			recordTimer.value = null
		}
		recordDuration.value = 0
		console.log('取消录音')
	}

	// 输入框获得焦点时关闭所有面板并滚动到底部
	const handleInputFocus = () => {
		// 先关闭所有面板
		const hadPanelOpen = showEmoji.value || showQuickReply.value || showMoreMenu.value
		showEmoji.value = false
		showQuickReply.value = false
		showMoreMenu.value = false
		
		// 如果有面板打开，需要等待面板关闭动画完成
		if (hadPanelOpen) {
			nextTick(() => {
				// 延迟一下，让面板关闭动画完成
				setTimeout(() => {
					// 输入框已经获得焦点，键盘会自动弹出
					// 多次尝试滚动到底部，确保最新消息可见
					if (messageList.value.length > 0) {
						updateLastMessageId()
						// 延迟多次滚动，确保键盘弹出后消息被顶上去
						setTimeout(() => {
							updateLastMessageId()
							setTimeout(() => {
								updateLastMessageId()
							}, 200)
						}, 300)
					}
				}, 350) // 等待面板关闭动画完成（300ms + 50ms 缓冲）
			})
		} else {
			// 如果没有面板打开，直接让键盘弹出
			// 多次尝试滚动到底部，确保最新消息可见
			if (messageList.value.length > 0) {
				updateLastMessageId()
				// 延迟多次滚动，确保键盘弹出后消息被顶上去
				setTimeout(() => {
					updateLastMessageId()
					setTimeout(() => {
						updateLastMessageId()
					}, 200)
				}, 300)
			}
		}
	}

	// 表情相关
	const toggleEmojiPanel = () => {
		// 如果当前是语音模式，先切换回文本输入模式
		if (voiceMode.value) {
			voiceMode.value = false
		}
		
		showEmoji.value = !showEmoji.value
		// 打开表情面板时关闭其他面板
		if (showEmoji.value) {
			showQuickReply.value = false
			showMoreMenu.value = false
			// 关闭键盘（如果打开）
			uni.hideKeyboard()
			// 延迟一下确保键盘关闭后再滚动
			nextTick(() => {
				setTimeout(() => {
					if (messageList.value.length > 0) {
						updateLastMessageId()
					}
				}, 100)
			})
		}
	}

	const closeEmojiPanel = () => {
		showEmoji.value = false
	}

	const appendEmoji = (emoji: string) => {
		inputText.value += emoji
	}

	const deleteEmoji = () => {
		if (inputText.value.length > 0) {
			// 使用数组方式正确处理Unicode字符（包括表情符号）
			const textArray = Array.from(inputText.value)
			textArray.pop()
			inputText.value = textArray.join('')
		}
	}

	const handleSendFromEmoji = () => {
		if (canSendText.value) {
			handleSendText()
			closeEmojiPanel()
		}
	}

	// 快捷消息相关
	const toggleQuickReplyPanel = () => {
		// 如果当前是语音模式，先切换回文本输入模式
		if (voiceMode.value) {
			voiceMode.value = false
		}
		
		showQuickReply.value = !showQuickReply.value
		// 打开快捷消息面板时关闭其他面板
		if (showQuickReply.value) {
			showEmoji.value = false
			showMoreMenu.value = false
			uni.hideKeyboard()
			loadQuickReplyList()
		}
	}

	const loadQuickReplyList = async () => {
		try {
			const result: any = await request({
				url: 'IM/QuickReply/list',
				method: 'GET',
				path: 'IM/QuickReply/list'
			})
			console.log('快捷消息列表:', result)
			// 兼容多种返回格式
			if (Array.isArray(result)) {
				quickReplyList.value = result
			} else if (Array.isArray(result?.data)) {
				quickReplyList.value = result.data
			} else if (Array.isArray(result?.Data)) {
				quickReplyList.value = result.Data
			} else {
				quickReplyList.value = []
			}
		} catch (error) {
			console.error('加载快捷消息失败:', error)
			quickReplyList.value = []
		}
	}

	const selectQuickReply = (item: any) => {
		inputText.value = item.content
		showQuickReply.value = false
		// 自动发送
		setTimeout(() => {
			handleSendText()
		}, 100)
	}

	// 处理添加快捷短语
	const handleAddQuickReply = () => {
		editingQuickReply.value = null
		quickReplyForm.value = {
			shortcut: '',
			content: '',
			group: '',
			group_name: '',
			type: 1
		}
		showQuickReply.value = false
		showAddQuickReply.value = true
	}

	// 编辑快捷短语
	const editQuickReplyItem = (item: any) => {
		editingQuickReply.value = item
		quickReplyForm.value = {
			shortcut: item.shortcut || '',
			content: item.content || '',
			group: item.group || '',
			group_name: item.group_name || '',
			type: item.type || 1
		}
		showManageQuickReply.value = false
		showAddQuickReply.value = true
	}

	const deleteQuickReplyItem = async (id: string) => {
		uni.showModal({
			title: '提示',
			content: '确定要删除这条常用语吗？',
			success: async (res) => {
				if (res.confirm) {
					try {
						await request({
							url: `IM/QuickReply/delete?id=${id}`,
							method: 'POST',
							path: `IM/QuickReply/delete`
						})
						uni.showToast({
							title: '删除成功',
							icon: 'success'
						})
						loadQuickReplyList()
						loadManageQuickReplyList()
					} catch (error) {
						console.error('删除失败:', error)
						uni.showToast({
							title: '删除失败',
							icon: 'none'
						})
					}
				}
			}
		})
	}

	const saveQuickReply = async () => {
		if (!quickReplyForm.value.content.trim()) {
			uni.showToast({
				title: '请输入话术内容',
				icon: 'none'
			})
			return
		}
		try {
			if (editingQuickReply.value) {
				// 更新
				await request({
					url: 'IM/QuickReply/update',
					method: 'POST',
					data: {
						id: editingQuickReply.value.id,
						content: quickReplyForm.value.content,
						shortcut: quickReplyForm.value.shortcut || '',
						group: quickReplyForm.value.group || null,
						group_name: quickReplyForm.value.group_name || null,
						type: quickReplyForm.value.type || 1,
						sort_order: editingQuickReply.value.sort_order || 0
					},
					path: 'IM/QuickReply/update'
				})
				uni.showToast({
					title: '更新成功',
					icon: 'success'
				})
			} else {
				// 创建
				await request({
					url: 'IM/QuickReply/create',
					method: 'POST',
					data: {
						content: quickReplyForm.value.content,
						shortcut: quickReplyForm.value.shortcut || '',
						group: quickReplyForm.value.group || null,
						group_name: quickReplyForm.value.group_name || null,
						type: quickReplyForm.value.type || 1,
						sort_order: 0
					},
					path: 'IM/QuickReply/create'
				})
				uni.showToast({
					title: '添加成功',
					icon: 'success'
				})
			}
			closeAddQuickReply()
			loadQuickReplyList()
			if (showManageQuickReply.value) {
				loadManageQuickReplyList()
			}
		} catch (error) {
			console.error('保存失败:', error)
			uni.showToast({
				title: '保存失败',
				icon: 'none'
			})
		}
	}

	const closeAddQuickReply = () => {
		showAddQuickReply.value = false
		editingQuickReply.value = null
		quickReplyForm.value = {
			shortcut: '',
			content: '',
			group: '',
			group_name: '',
			type: 1
		}
	}

	// 加载管理界面的快捷短语列表
	const loadManageQuickReplyList = async () => {
		try {
			const result: any = await request({
				url: 'IM/QuickReply/list',
				method: 'GET',
				path: 'IM/QuickReply/list'
			})
			// 只显示个人话术
			let allList: any[] = []
			if (Array.isArray(result)) {
				allList = result
			} else if (Array.isArray(result?.data)) {
				allList = result.data
			} else if (Array.isArray(result?.Data)) {
				allList = result.Data
			}
			// 过滤个人话术并按排序序号排序
			managingQuickReplyList.value = allList
				.filter((item: any) => item.type === 1)
				.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
			
			// 提取分组列表
			const groups = new Set<string>()
			managingQuickReplyList.value.forEach((item: any) => {
				if (item.group_name) {
					groups.add(item.group_name)
				}
			})
			quickReplyGroups.value = Array.from(groups)
		} catch (error) {
			console.error('加载管理列表失败:', error)
			managingQuickReplyList.value = []
		}
	}

	// 计算属性：按分组组织快捷短语
	const groupedQuickReplies = computed(() => {
		const groups: { [key: string]: any[] } = {}
		managingQuickReplyList.value.forEach((item: any) => {
			const groupName = item.group_name || '未分组'
			if (!groups[groupName]) {
				groups[groupName] = []
			}
			groups[groupName].push(item)
		})
		// 转换为数组并按分组名称排序
		return Object.keys(groups)
			.sort((a, b) => {
				if (a === '未分组') return 1
				if (b === '未分组') return -1
				return a.localeCompare(b)
			})
			.map(groupName => ({
				group_name: groupName === '未分组' ? null : groupName,
				items: groups[groupName].sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
			}))
	})

	// 处理分组选择
	const handleGroupChange = (e: any) => {
		const index = e.detail.value
		if (index >= 0 && index < quickReplyGroups.value.length) {
			quickReplyForm.value.group_name = quickReplyGroups.value[index]
		}
	}

	// 处理分组名称输入
	const handleGroupNameInput = (e: any) => {
		// uni-app中input的@input事件，值在e.detail.value中
		quickReplyForm.value.group_name = e.detail?.value || e.target?.value || ''
	}

	// 移动快捷短语（排序）
	const moveQuickReplyItem = async (items: any[], index: number, direction: number) => {
		const newIndex = index + direction
		if (newIndex < 0 || newIndex >= items.length) return
		
		// 获取当前项目的ID和排序序号
		const currentItem = items[index]
		const targetItem = items[newIndex]
		
		// 交换排序序号
		const tempSortOrder = currentItem.sort_order || 0
		const targetSortOrder = targetItem.sort_order || 0
		
		// 更新两个项目
		try {
			await Promise.all([
				request({
					url: 'IM/QuickReply/update',
					method: 'POST',
					data: {
						id: currentItem.id,
						sort_order: targetSortOrder
					},
					path: 'IM/QuickReply/update'
				}),
				request({
					url: 'IM/QuickReply/update',
					method: 'POST',
					data: {
						id: targetItem.id,
						sort_order: tempSortOrder
					},
					path: 'IM/QuickReply/update'
				})
			])
			// 重新加载列表
			await loadManageQuickReplyList()
			uni.showToast({
				title: '排序成功',
				icon: 'success'
			})
		} catch (error) {
			console.error('排序失败:', error)
			uni.showToast({
				title: '排序失败',
				icon: 'none'
			})
		}
	}

	// 监听管理弹窗打开，加载数据
	watch(showManageQuickReply, (show) => {
		if (show) {
			loadManageQuickReplyList()
		}
	})

	// 更多菜单
	const toggleMoreMenu = () => {
		// 如果当前是语音模式，先切换回文本输入模式
		if (voiceMode.value) {
			voiceMode.value = false
		}
		
		showMoreMenu.value = !showMoreMenu.value
		// 打开更多菜单时关闭其他面板
		if (showMoreMenu.value) {
			showEmoji.value = false
			showQuickReply.value = false
			uni.hideKeyboard()
		}
	}

	const handleChooseFromCamera = () => {
		showMoreMenu.value = false
		uni.chooseImage({
			count: 1,
			sourceType: ['camera'],
			success: (res) => {
				const paths = Array.isArray(res.tempFilePaths) ? res.tempFilePaths : []
				if (paths.length > 0) {
					uploadFiles(paths, ImMsgType.Image)
				}
			}
		})
	}

	const handleChooseFromAlbum = () => {
		showMoreMenu.value = false
		handleChooseImage()
	}

	// 监听所有底部面板打开状态，自动滚动到最后一条消息
	watch([showEmoji, showQuickReply, showMoreMenu, isKeyboardShow], ([emoji, quickReply, moreMenu, keyboard]) => {
		const anyPanelOpen = emoji || quickReply || moreMenu || keyboard
		if (anyPanelOpen) {
			// 确保键盘关闭（如果面板打开）
			if (emoji || quickReply || moreMenu) {
				uni.hideKeyboard()
			}
			// 立即暂停所有正在播放的视频，避免视频遮挡面板
			pauseAllVideos()
			// CSS类已经通过模板绑定自动应用，会强制隐藏视频
			
			// 等待动画和布局更新完成后再滚动
			nextTick(() => {
				// 先等待样式更新
				setTimeout(() => {
					if (messageList.value.length > 0) {
						// 多次尝试滚动，确保生效
						updateLastMessageId()
						setTimeout(() => {
							updateLastMessageId()
							setTimeout(() => {
								updateLastMessageId()
							}, 100)
						}, 200)
					}
				}, 350) // 等待动画完成
			})
		}
	})

	// 监听键盘弹出（APP端）
	// #ifdef APP-PLUS
	let keyboardShowHandler: ((event: any) => void) | null = null
	let keyboardHideHandler: (() => void) | null = null
	let keyboardHeightChangeHandler: ((res: any) => void) | null = null
	
	onMounted(() => {
		// 方法1：使用 uni.onKeyboardHeightChange 监听键盘高度变化（推荐，更可靠）
		try {
			keyboardHeightChangeHandler = (res: any) => {
				if (res && res.height !== undefined) {
					if (res.height > 0) {
						// 键盘显示
						const systemInfo = uni.getSystemInfoSync()
						const rpxRatio = 750 / systemInfo.windowWidth
						const newHeight = res.height * rpxRatio
						
						// 如果键盘已锁定，完全忽略后续的高度变化（防止滚动时的误触发）
						if (keyboardHeightLocked.value && lockedKeyboardHeight.value > 0 && lockedInputBarBottom.value) {
							// 只有在高度变化超过 50rpx 时才认为是真正的键盘变化（而不是滚动误触发）
							if (Math.abs(lockedKeyboardHeight.value - newHeight) > 50) {
								lockedKeyboardHeight.value = newHeight
								keyboardHeight.value = newHeight
								lockedInputBarBottom.value = newHeight + 'rpx' // 更新锁定的 bottom 值
								if (import.meta.env.DEV) {
									console.log('[键盘] uni.onKeyboardHeightChange - 键盘高度大幅变化，更新锁定高度:', newHeight, 'rpx')
								}
							}
							// 保持 isKeyboardShow 为 true
							isKeyboardShow.value = true
							return // 直接返回，不执行后续逻辑
						}
						
						// 只有在键盘高度真正改变时才更新（防止滚动时的误触发）
						if (!isKeyboardShow.value || Math.abs(keyboardHeight.value - newHeight) > 10) {
							keyboardHeight.value = newHeight
							isKeyboardShow.value = true
							// 立即锁定键盘高度，防止滚动时被修改
							lockedKeyboardHeight.value = newHeight
							keyboardHeightLocked.value = true
							// 立即锁定 bottom 值为固定字符串，防止重新计算
							lockedInputBarBottom.value = newHeight + 'rpx'
							
							// 关闭所有面板
							showEmoji.value = false
							showQuickReply.value = false
							showMoreMenu.value = false
							
							if (import.meta.env.DEV) {
								console.log('[键盘] uni.onKeyboardHeightChange - 键盘弹出，高度:', keyboardHeight.value, 'rpx (原始:', res.height, 'px)，已锁定')
							}
							
							// 延迟滚动到底部，多次尝试确保生效
							nextTick(() => {
								if (messageList.value.length > 0) {
									updateLastMessageId()
									// 延迟多次滚动，确保键盘弹出后消息被顶上去
									setTimeout(() => {
										updateLastMessageId()
										setTimeout(() => {
											updateLastMessageId()
										}, 200)
									}, 300)
								}
							})
						}
					} else {
						// 键盘隐藏 - 只有在高度为 0 且持续一段时间后才认为键盘真正隐藏
						// 防止滚动时的短暂高度变化导致键盘状态被误判
						setTimeout(() => {
							// 再次检查高度，确保键盘真的隐藏了
							if (res && res.height === 0) {
								isKeyboardShow.value = false
								keyboardHeight.value = 0
								keyboardHeightLocked.value = false
								lockedKeyboardHeight.value = 0
								lockedInputBarBottom.value = '' // 清除锁定的 bottom 值
								if (import.meta.env.DEV) {
									console.log('[键盘] uni.onKeyboardHeightChange - 键盘隐藏，已解锁')
								}
							}
						}, 100) // 延迟 100ms 确认
					}
				}
			}
			
			// 使用 uni-app 官方API监听键盘高度变化
			uni.onKeyboardHeightChange(keyboardHeightChangeHandler)
		} catch (e) {
			console.warn('监听键盘高度变化失败:', e)
		}
		
		// 方法2：备用方案 - 使用原生事件监听
		try {
			keyboardShowHandler = (event: any) => {
				// 键盘弹出时关闭所有面板
				showEmoji.value = false
				showQuickReply.value = false
				showMoreMenu.value = false
				
				// 获取键盘高度
				let height = 0
				if (event && typeof event === 'object') {
					if (event.height) {
						height = event.height
					} else if (event.detail && event.detail.height) {
						height = event.detail.height
					}
				}
				
				if (height > 0) {
					const systemInfo = uni.getSystemInfoSync()
					const rpxRatio = 750 / systemInfo.windowWidth
					const newHeight = height * rpxRatio
					
					// 只有在键盘高度真正改变时才更新（防止滚动时的误触发）
					if (!isKeyboardShow.value || Math.abs(keyboardHeight.value - newHeight) > 10) {
						keyboardHeight.value = newHeight
						isKeyboardShow.value = true
						// 锁定键盘高度，防止滚动时被修改
						lockedKeyboardHeight.value = newHeight
						keyboardHeightLocked.value = true
						
						if (import.meta.env.DEV) {
							console.log('[键盘] plus.key - 键盘弹出，高度:', keyboardHeight.value, 'rpx (原始:', height, 'px)')
						}
					}
				} else {
					// 使用系统信息估算
					const systemInfo = uni.getSystemInfoSync()
					const estimatedKeyboardHeight = systemInfo.windowHeight * 0.35
					const newHeight = (estimatedKeyboardHeight / systemInfo.windowWidth) * 750
					
					// 只有在键盘高度真正改变时才更新
					if (!isKeyboardShow.value || Math.abs(keyboardHeight.value - newHeight) > 10) {
						keyboardHeight.value = newHeight
						isKeyboardShow.value = true
						// 锁定键盘高度，防止滚动时被修改
						lockedKeyboardHeight.value = newHeight
						keyboardHeightLocked.value = true
						
						if (import.meta.env.DEV) {
							console.log('[键盘] plus.key - 键盘弹出（估算），高度:', keyboardHeight.value, 'rpx')
						}
					}
				}
				
				// 延迟滚动到底部，多次尝试确保生效
				if (messageList.value.length > 0) {
					updateLastMessageId()
					// 延迟多次滚动，确保键盘弹出后消息被顶上去
					setTimeout(() => {
						updateLastMessageId()
						setTimeout(() => {
							updateLastMessageId()
						}, 200)
					}, 300)
				}
			}
			
			keyboardHideHandler = () => {
				isKeyboardShow.value = false
				keyboardHeight.value = 0
				keyboardHeightLocked.value = false
				lockedKeyboardHeight.value = 0
				if (import.meta.env.DEV) {
					console.log('[键盘] plus.key - 键盘隐藏')
				}
			}
			
			// 使用 @ts-ignore 忽略类型检查
			// @ts-ignore
			if (typeof plus !== 'undefined' && plus.key && plus.key.addEventListener) {
				// @ts-ignore
				plus.key.addEventListener('keyboardShow', keyboardShowHandler)
				// @ts-ignore
				plus.key.addEventListener('keyboardHide', keyboardHideHandler)
			}
		} catch (e) {
			console.warn('监听键盘事件失败:', e)
		}
	})
	
	onUnmounted(() => {
		// 移除键盘监听
		try {
			// 移除 uni.onKeyboardHeightChange 监听
			if (keyboardHeightChangeHandler) {
				uni.offKeyboardHeightChange(keyboardHeightChangeHandler)
			}
			
			// 移除原生事件监听
			// @ts-ignore
			if (typeof plus !== 'undefined' && plus.key && plus.key.removeEventListener) {
				if (keyboardShowHandler) {
					// @ts-ignore
					plus.key.removeEventListener('keyboardShow', keyboardShowHandler)
				}
				if (keyboardHideHandler) {
					// @ts-ignore
					plus.key.removeEventListener('keyboardHide', keyboardHideHandler)
				}
			}
		} catch (e) {
			// 忽略错误
		}
		// 页面销毁时停止自动刷新
		stopDetailAutoRefresh()
	})
	// #endif

	// 页面显示/隐藏时控制自动刷新（APP / H5 / 小程序通用）
	onShow(() => {
		if (sessionId.value) {
			// 页面显示时立即刷新一次，确保看到最新消息
			// 如果列表为空，使用重置模式；否则使用合并模式
			pageIndex.value = 1
			const shouldReset = messageList.value.length === 0
			// 强制刷新，忽略防抖限制
			loadMessages(shouldReset, true, true)
			// 启动定时刷新
			startDetailAutoRefresh()
		}
	})

	onHide(() => {
		stopDetailAutoRefresh()
	})

	// 初始化
	onLoad((options: any) => {
		getSysteminfo()
		sessionId.value = options?.id || ''
		shopId.value = options?.shopId || ''
		customerId.value = options?.customerId || ''
		customerName.value = decodeURIComponent(options?.customerName || '') || ''
		shopName.value = decodeURIComponent(options?.shopName || '') || ''
		siteType.value = Number(options?.siteType || 0) as ShopType

		loadSessionDetail()
		loadMessages(true, false)
		// 页面首次加载时也启动自动刷新
		startDetailAutoRefresh()
	})
</script>

<style scoped lang="scss">
	.session-detail {
		width: 100%;
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
		/* 防止键盘弹出时整个页面被推上去 */
		box-sizing: border-box;
		/* 确保不会创建新的包含块，影响 fixed 定位的子元素 */
		/* 不要使用 transform、perspective、filter 等属性 */
		transform: none !important;
		-webkit-transform: none !important;
		/* 确保不会影响 fixed 定位 */
		perspective: none !important;
		-webkit-perspective: none !important;
		filter: none !important;
		-webkit-filter: none !important;
		/* 防止整个页面被拖动 */
		-webkit-overflow-scrolling: touch;
	}

	.session-header {
		display: flex;
		align-items: center;
		padding: 20rpx 30rpx 10rpx;
		background: #ffffff;
		border-bottom: 1px solid #e0e0e0;
		position: relative;
		z-index: 10;
		flex-shrink: 0; /* 防止被压缩 */
		/* 防止头部区域被拖动或滑动 */
		touch-action: none;
		-webkit-touch-callout: none;
		-webkit-user-select: none;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
		/* 确保头部不会跟随滚动 */
		will-change: auto;
		transform: none;
		-webkit-transform: none;
	}

	.shop-logo {
		width: 80rpx;
		height: 80rpx;
		border-radius: 8rpx;
		margin-right: 20rpx;
		background: #f5f5f5;
	}

	.header-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 6rpx;
	}

	.shop-row {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.shop-name {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.platform-tag {
		font-size: 22rpx;
		color: #1677ff;
		background: #e6f7ff;
		padding: 2rpx 10rpx;
		border-radius: 20rpx;
	}

	.customer-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
		flex-wrap: wrap;
	}

	.customer-name {
		font-size: 26rpx;
		color: #666;
	}

	.order-id {
		font-size: 24rpx;
		color: #999;
	}

	.status-row {
		display: flex;
		align-items: center;
		gap: 16rpx;
	}

	.status-text {
		font-size: 24rpx;
		color: #1677ff;
	}

	.unread-text {
		font-size: 24rpx;
		color: #ff4d4f;
	}

	.message-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
		position: relative;
		min-height: 0;
		/* 使用padding-bottom为输入框和面板留出空间 */
		/* 默认：120rpx（输入框高度） */
		/* 面板打开：620rpx（500rpx面板 + 120rpx输入框） */
		/* 键盘打开：动态计算（键盘高度 + 120rpx输入框） */
		/* padding-bottom 通过内联样式动态设置 */
		transition: padding-bottom 0.3s ease;
		box-sizing: border-box;
		/* 确保不会创建新的包含块，影响 fixed 定位的子元素 */
		/* 不要使用 transform、perspective、filter 等属性 */
		transform: none !important;
		-webkit-transform: none !important;
		/* 确保不会影响 fixed 定位 */
		perspective: none !important;
		-webkit-perspective: none !important;
		filter: none !important;
		-webkit-filter: none !important;
	}

	.message-scroll {
		flex: 1;
		padding: 20rpx;
		box-sizing: border-box;
		width: 100%;
		height: 100%;
		/* 确保 scroll-view 不会影响 fixed 定位的子元素 */
		transform: none !important;
		-webkit-transform: none !important;
		perspective: none !important;
		-webkit-perspective: none !important;
		filter: none !important;
		-webkit-filter: none !important;
	}

	.message-item {
		margin-bottom: 20rpx;
	}

	.message-meta {
		display: flex;
		justify-content: center;
		margin-bottom: 10rpx;
	}

	.meta-time {
		font-size: 22rpx;
		color: #999;
		background: rgba(0, 0, 0, 0.04);
		padding: 4rpx 12rpx;
		border-radius: 20rpx;
	}

	.message-bubble-wrapper {
		display: flex;
		align-items: flex-end;
	}

	.message-bubble-wrapper.from-self {
		justify-content: flex-end;
	}

	.message-bubble-wrapper.from-customer {
		justify-content: flex-start;
	}

	.message-item.from-self .message-bubble-wrapper {
		justify-content: flex-end;
	}

	.message-item.from-customer .message-bubble-wrapper {
		justify-content: flex-start;
	}

	.avatar {
		width: 60rpx;
		height: 60rpx;
		border-radius: 50%;
		background: #ddd;
		display: flex;
		align-items: center;
		justify-content: center;
		margin: 0 10rpx;
	}

	.avatar-text {
		font-size: 26rpx;
		color: #fff;
	}

	.message-bubble {
		max-width: 70%;
		padding: 14rpx 18rpx;
		border-radius: 18rpx;
		font-size: 28rpx;
		line-height: 1.6;
		background: #ffffff;
		color: #333;
		box-shadow: 0 4rpx 10rpx rgba(0, 0, 0, 0.06);
	}

	.message-item.from-self .message-bubble {
		background: #1677ff;
		color: #ffffff;
	}

	/* 图片和视频消息不应用背景色和padding，避免透明图片/视频被蓝色背景包裹 */
	.message-bubble.has-image,
	.message-bubble.has-video {
		background: transparent !important;
		padding: 0;
		box-shadow: none;
	}

	.message-item.from-self .message-bubble.has-image,
	.message-item.from-self .message-bubble.has-video {
		background: transparent !important;
	}

	.msg-text {
		white-space: pre-wrap;
		word-break: break-word;
	}

	.msg-images {
		display: flex;
		flex-wrap: wrap;
		gap: 10rpx;
	}

	.msg-image {
		width: 160rpx;
		height: 160rpx;
		border-radius: 8rpx;
		background: transparent;
		/* 移除默认背景，让透明图片正常显示 */
	}

	.msg-voice {
		font-size: 26rpx;
		color: #fff;
	}

	.message-item.from-customer .msg-voice {
		color: #333;
	}

	.voice-wrapper {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.voice-icon {
		font-size: 32rpx;
	}

	.voice-text {
		font-size: 28rpx;
	}

	.voice-tip {
		font-size: 22rpx;
		opacity: 0.7;
	}

	.msg-error {
		padding: 20rpx;
		text-align: center;
		color: #999;
		font-size: 24rpx;
	}

	.msg-video {
		width: 360rpx;
		max-width: 100%;
		background: transparent;
		/* 移除硬件加速，避免在scroll-view中滚动时出现重影 */
		/* transform: translateZ(0) 会导致视频封面在滚动时出现重影 */
	}

	/* 当面板或键盘打开时，强制隐藏视频，避免遮挡 */
	.msg-video.video-hidden,
	.video-player.video-hidden {
		visibility: hidden !important;
		opacity: 0 !important;
		pointer-events: none !important;
		/* 确保视频完全隐藏，不会遮挡面板 */
		z-index: -1 !important;
		position: relative;
	}

	/* 滚动时优化视频渲染，防止重影 */
	.msg-video.video-scrolling,
	.video-player.video-scrolling {
		/* 滚动时使用更保守的渲染方式，避免重影 */
		transform: none !important;
		-webkit-transform: none !important;
		will-change: auto !important;
		/* 强制重新渲染，避免封面重影 */
		-webkit-backface-visibility: visible !important;
		backface-visibility: visible !important;
	}

	.video-player {
		width: 100%;
		height: 400rpx;
		min-height: 400rpx;
		max-height: 600rpx;
		border-radius: 12rpx;
		background: #000;
		/* 确保视频播放器完整显示 */
		display: block;
		overflow: hidden;
		/* 防止视频播放时被裁剪 */
		position: relative;
		/* 降低z-index，确保不会遮挡输入框和面板 */
		z-index: 0;
		/* 移除硬件加速相关属性，避免在scroll-view中滚动时出现重影 */
		/* transform: translateZ(0) 和 will-change: transform 会导致视频封面在滚动时出现重影 */
		/* 使用更保守的渲染方式 */
		-webkit-backface-visibility: visible;
		backface-visibility: visible;
		/* 防止视频在scroll-view中渲染异常 */
		contain: layout style;
		/* 确保视频播放器在正确的层级 */
		isolation: auto;
	}

	.empty-state,
	.loading-more,
	.no-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 20rpx 0;
	}

	.empty-text,
	.loading-text,
	.no-more-text {
		font-size: 24rpx;
		color: #999;
	}

	.input-bar {
		position: fixed !important;
		left: 0 !important;
		right: 0 !important;
		bottom: 0;
		padding: 20rpx;
		background: #f5f5f5;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.1);
		box-sizing: border-box;
		display: flex;
		align-items: center;
		gap: 16rpx;
		z-index: 1000 !important;
		transition: bottom 0.3s ease;
		/* 确保输入框不会跟随页面滚动 - 使用硬件加速创建新的渲染层 */
		transform: translateZ(0) !important;
		-webkit-transform: translateZ(0) !important;
		/* 创建新的堆叠上下文，确保输入框始终固定在视口底部 */
		will-change: bottom;
		-webkit-backface-visibility: hidden !important;
		backface-visibility: hidden !important;
		/* 确保不受父容器影响 */
		-webkit-perspective: 1000;
		perspective: 1000;
		isolation: isolate;
		/* 强制相对于视口定位，不受任何父容器影响 */
		position: fixed !important;
		/* 防止编辑栏被拖动或滑动 */
		touch-action: none !important;
		-webkit-touch-callout: none !important;
		-webkit-user-select: none !important;
		user-select: none !important;
		/* 防止长按选择 */
		-webkit-tap-highlight-color: transparent !important;
		/* 强制创建新的包含块，确保 fixed 定位相对于视口 */
		contain: layout style paint !important;
		/* 确保不受任何父容器影响 */
		top: auto !important;
		margin: 0 !important;
		/* 防止任何滚动影响 */
		overflow: visible !important;
	}
	
	/* 键盘打开时，确保输入框固定在键盘上方，不跟随滚动 */
	.input-bar.keyboard-open {
		position: fixed !important;
		left: 0 !important;
		right: 0 !important;
		/* 强制固定在视口底部，不受页面滚动影响 */
		transform: translateZ(0) !important;
		-webkit-transform: translateZ(0) !important;
		/* 确保不受父容器 transform 影响 */
		-webkit-backface-visibility: hidden !important;
		backface-visibility: hidden !important;
		/* 创建独立的渲染层 */
		will-change: bottom !important;
		z-index: 1000 !important;
		/* 在 APP-PLUS 环境下，可能需要额外的处理来防止跟随滚动 */
		/* #ifdef APP-PLUS */
		/* 强制创建新的包含块，确保 fixed 定位相对于视口 */
		contain: layout style paint;
		/* 确保不受父容器影响 */
		position: fixed !important;
		/* #endif */
	}
	
	/* 面板打开时，确保输入框固定在面板上方，不跟随滚动 */
	.input-bar.panel-open {
		position: fixed !important;
		left: 0 !important;
		right: 0 !important;
		/* 强制固定在视口底部，不受页面滚动影响 */
		transform: translateZ(0) !important;
		-webkit-transform: translateZ(0) !important;
		/* 确保不受父容器 transform 影响 */
		-webkit-backface-visibility: hidden !important;
		backface-visibility: hidden !important;
		/* 创建独立的渲染层 */
		will-change: bottom !important;
		z-index: 1000 !important;
	}

	/* 当任何底部面板打开时，输入框被顶到面板上方 */
	/* bottom 值通过内联样式动态设置 */
	
	/* 当键盘打开时，输入框显示在键盘上方 */
	/* bottom 值通过内联样式动态设置 */

	.voice-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.voice-icon {
		font-size: 40rpx;
	}

	.input-wrapper {
		flex: 1;
		background: #ffffff;
		border-radius: 40rpx;
		overflow: hidden;
	}

	.text-input {
		width: 100%;
		height: 80rpx;
		padding: 0 30rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
		/* 隐藏输入法工具栏 */
		-webkit-appearance: none;
		appearance: none;
	}
	
	/* 隐藏输入法工具栏（针对不同平台） */
	/* #ifdef APP-PLUS */
	.text-input {
		/* 在APP中，输入法工具栏通常由系统控制，无法直接隐藏 */
		/* 但可以通过设置 confirm-hold="false" 来避免显示 */
		display: block; /* 占位属性，避免空规则集警告 */
	}
	/* #endif */
	
	/* #ifdef H5 */
	.text-input::-webkit-input-placeholder {
		color: #999;
	}
	/* #endif */

	.voice-input {
		width: 100%;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #ffffff;
		color: #666;
		font-size: 28rpx;
	}

	.right-buttons {
		display: flex;
		align-items: center;
		gap: 12rpx;
	}

	.icon-btn {
		width: 80rpx;
		height: 80rpx;
		border-radius: 50%;
		background: #ffffff;
		display: flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.1);
	}

	.emoji-icon {
		font-size: 40rpx;
	}

	.quick-reply-icon {
		font-size: 36rpx;
		color: #333;
		font-weight: bold;
	}

	.plus-icon {
		font-size: 48rpx;
		color: #333;
		font-weight: 300;
	}

	/* 统一底部面板样式 - 从下往上弹出 */
	.bottom-panel {
		position: fixed;
		left: 0;
		right: 0;
		bottom: 0;
		background: #f5f5f5;
		z-index: 998;
		transform: translateY(100%);
		transition: transform 0.3s ease;
		height: 500rpx;
		display: flex;
		flex-direction: column;
		box-shadow: 0 -4rpx 20rpx rgba(0, 0, 0, 0.1);
	}

	.bottom-panel.show {
		transform: translateY(0);
	}

	.emoji-panel {
		/* 继承 .bottom-panel 的样式 */
		display: block; /* 占位属性，避免空规则集警告 */
		/* 占位属性，避免空规则集警告 */
	}

	/* 统一面板头部样式 */
	.panel-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx 30rpx;
		background: #ffffff;
		border-bottom: 1px solid #e0e0e0;
	}

	.panel-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.panel-actions {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.action-buttons {
		display: flex;
		align-items: center;
		gap: 20rpx;
	}

	.manage-btn {
		font-size: 26rpx;
		color: #1677ff;
		padding: 8rpx 16rpx;
		background: #e6f7ff;
		border-radius: 8rpx;
	}

	.add-btn {
		font-size: 26rpx;
		color: #ffffff;
		padding: 8rpx 16rpx;
		background: #1677ff;
		border-radius: 8rpx;
	}

	.edit-btn {
		font-size: 28rpx;
		color: #1677ff;
	}

	.close-btn {
		font-size: 32rpx;
		color: #999;
	}

	.panel-content {
		flex: 1;
		background: #ffffff;
		overflow: hidden;
	}

	.emoji-panel-header {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20rpx 30rpx;
		background: #ffffff;
		border-bottom: 1px solid #e0e0e0;
	}

	.emoji-panel-title {
		font-size: 28rpx;
		color: #333;
		font-weight: 500;
	}

	.emoji-panel-content {
		flex: 1;
		display: flex;
		background: #ffffff;
		overflow: hidden;
	}

	.emoji-list {
		flex: 1;
		padding: 20rpx;
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		align-content: flex-start;
		overflow-y: auto;
	}

	.emoji-item {
		width: calc((100% - 60rpx) / 6);
		height: 80rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 44rpx;
		background: #f5f5f5;
		margin-bottom: 12rpx;
	}

	.emoji-item:active {
		background: #e0e0e0;
	}

	.emoji-text {
		font-size: 44rpx;
	}

	/* 右侧按钮组 */
	.emoji-right-buttons {
		width: 120rpx;
		display: flex;
		flex-direction: column;
		padding: 20rpx 16rpx;
		gap: 16rpx;
		border-left: 1px solid #e0e0e0;
		background: #ffffff;
	}

	.emoji-action-btn {
		width: 100%;
		height: 120rpx;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
	}

	.emoji-action-btn.delete-btn {
		background: #ff4d4f;
	}

	.emoji-action-btn.delete-btn:active {
		background: #ff7875;
	}

	.emoji-action-btn.send-btn {
		background: #cccccc;
		color: #ffffff;
		font-weight: 500;
		transition: background 0.2s ease;
	}

	.emoji-action-btn.send-btn.has-content {
		background: #1677ff;
	}

	.emoji-action-btn.send-btn.has-content:active {
		background: #0958d9;
	}

	.emoji-action-btn.send-btn:active:not(.has-content) {
		background: #999999;
	}

	.delete-icon {
		font-size: 36rpx;
		color: #ffffff;
	}

	/* 快捷消息面板 - 使用统一底部面板样式 */
	.quick-reply-panel {
		/* 继承 .bottom-panel 的样式 */
		/* 占位属性，避免空规则集警告 */
		display: block;
	}

	.quick-reply-list {
		flex: 1;
		padding: 20rpx 30rpx;
		overflow-y: auto;
	}

	.quick-reply-item {
		padding: 24rpx 0;
		border-bottom: 1px solid #f0f0f0;
		font-size: 28rpx;
		color: #333;
	}

	.empty-quick-reply {
		padding: 60rpx 0;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}

	/* 更多菜单 - 使用统一底部面板样式 */
	.more-menu-panel {
		/* 继承 .bottom-panel 的样式 */
		/* 占位属性，避免空规则集警告 */
		display: block;
	}

	.more-menu-content {
		flex: 1;
		padding: 40rpx;
		display: flex;
		justify-content: space-around;
		align-items: center;
	}

	.more-menu-item {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 16rpx;
	}

	.more-menu-icon {
		font-size: 60rpx;
	}

	.more-menu-text {
		font-size: 26rpx;
		color: #333;
	}

	/* 编辑常用语面板 */
	.edit-quick-reply-panel {
		background: #ffffff;
		border-radius: 30rpx 30rpx 0 0;
		max-height: 70vh;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 2001;
	}

	.edit-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #e0e0e0;
	}

	.edit-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
	}

	.edit-close {
		font-size: 32rpx;
		color: #999;
	}

	.edit-list {
		flex: 1;
		padding: 20rpx 30rpx;
	}

	.edit-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 24rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.edit-content {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}

	.edit-actions {
		display: flex;
		gap: 30rpx;
	}

	.edit-action-btn {
		font-size: 26rpx;
		color: #1677ff;
	}

	.edit-action-btn.delete {
		color: #ff4d4f;
	}

	.add-quick-reply-btn {
		margin-top: 30rpx;
		padding: 24rpx;
		text-align: center;
		background: #f5f5f5;
		border-radius: 16rpx;
		font-size: 28rpx;
		color: #1677ff;
	}

	/* 添加常用语表单 */
	.add-quick-reply-form {
		width: 680rpx;
		max-width: 90vw;
		max-height: 85vh;
		background: #ffffff;
		border-radius: 20rpx;
		overflow: hidden;
		position: relative;
		z-index: 2001;
		display: flex;
		flex-direction: column;
	}

	.form-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #e0e0e0;
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
	}

	.form-close {
		font-size: 32rpx;
		color: #999;
	}

	.form-body {
		flex: 1;
		padding: 30rpx;
		overflow-y: auto;
		max-height: calc(85vh - 200rpx);
	}

	.form-item {
		margin-bottom: 30rpx;
	}

	.form-item:last-child {
		margin-bottom: 0;
	}

	.form-label {
		display: block;
		margin-bottom: 16rpx;
		font-size: 28rpx;
		color: #333;
	}

	.form-input {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1px solid #e0e0e0;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
	}

	.form-textarea {
		width: 100%;
		min-height: 180rpx;
		max-height: 300rpx;
		padding: 20rpx;
		border: 1px solid #e0e0e0;
		border-radius: 12rpx;
		font-size: 28rpx;
		color: #333;
		box-sizing: border-box;
		line-height: 1.6;
	}

	.form-counter {
		display: block;
		text-align: right;
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #999;
	}

	.form-picker {
		width: 100%;
		height: 80rpx;
		padding: 0 20rpx;
		border: 1px solid #e0e0e0;
		border-radius: 12rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		box-sizing: border-box;
		font-size: 28rpx;
		color: #333;
	}

	.form-picker .placeholder {
		color: #999;
	}

	.picker-arrow {
		font-size: 24rpx;
		color: #999;
	}

	.form-hint {
		margin-top: 8rpx;
		font-size: 24rpx;
		color: #999;
	}

	.form-radio-group {
		display: flex;
		gap: 30rpx;
	}

	.form-radio {
		display: flex;
		align-items: center;
		gap: 12rpx;
		font-size: 28rpx;
		color: #333;
	}

	.radio-dot {
		width: 32rpx;
		height: 32rpx;
		border: 2px solid #d9d9d9;
		border-radius: 50%;
		position: relative;
	}

	.form-radio.active .radio-dot {
		border-color: #1677ff;
	}

	.form-radio.active .radio-dot::after {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 16rpx;
		height: 16rpx;
		background: #1677ff;
		border-radius: 50%;
	}

	/* 管理快捷短语弹窗 */
	.manage-quick-reply-panel {
		background: #ffffff;
		border-radius: 30rpx 30rpx 0 0;
		max-height: 80vh;
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 2001;
	}

	.manage-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #e0e0e0;
		flex-shrink: 0;
	}

	.manage-title {
		font-size: 32rpx;
		color: #333;
		font-weight: 600;
	}

	.manage-close {
		font-size: 32rpx;
		color: #999;
	}

	.manage-content {
		flex: 1;
		padding: 0;
		overflow-y: auto;
		background: #f5f5f5;
	}

	/* 分组样式 */
	.quick-reply-group {
		margin-bottom: 20rpx;
		background: #ffffff;
		border-radius: 12rpx;
		overflow: hidden;
		margin: 0 20rpx 20rpx 20rpx;
	}

	.quick-reply-group:first-child {
		margin-top: 20rpx;
	}

	.group-header {
		display: flex;
		align-items: center;
		gap: 12rpx;
		padding: 20rpx 20rpx;
		border-bottom: 2px solid #e0e0e0;
		margin-bottom: 0;
		background: #fafafa;
	}

	.group-name {
		font-size: 30rpx;
		color: #333;
		font-weight: 600;
	}

	.group-count {
		font-size: 26rpx;
		color: #999;
	}

	.group-items {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	/* 管理项样式 */
	.manage-item {
		padding: 24rpx 20rpx;
		border-bottom: 1px solid #f0f0f0;
		background: #ffffff;
	}

	.manage-item:last-child {
		border-bottom: none;
	}

	.group-items .manage-item:first-child {
		border-top: 1px solid #f0f0f0;
	}

	.manage-item-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
	}

	.item-main {
		flex: 1;
		display: flex;
		align-items: center;
		gap: 12rpx;
		min-width: 0;
	}

	.item-shortcut {
		font-size: 24rpx;
		color: #1677ff;
		background: #e6f7ff;
		padding: 6rpx 14rpx;
		border-radius: 8rpx;
		flex-shrink: 0;
		white-space: nowrap;
	}

	.item-text {
		flex: 1;
		font-size: 28rpx;
		color: #333;
		line-height: 1.5;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.item-actions {
		display: flex;
		align-items: center;
		gap: 12rpx;
		flex-shrink: 0;
	}

	.item-action-btn {
		font-size: 24rpx;
		color: #1677ff;
		padding: 10rpx 20rpx;
		border-radius: 8rpx;
		background: #f5f5f5;
		white-space: nowrap;
		min-width: 60rpx;
		text-align: center;
	}

	.item-action-btn.move-up,
	.item-action-btn.move-down {
		background: #e6f7ff;
		font-size: 28rpx;
		font-weight: 500;
		padding: 10rpx 16rpx;
		min-width: 50rpx;
	}

	.item-action-btn.delete {
		color: #ff4d4f;
		background: #fff1f0;
	}

	.item-action-btn:active {
		opacity: 0.7;
		transform: scale(0.95);
	}

	.empty-manage {
		padding: 100rpx 0;
		text-align: center;
		font-size: 28rpx;
		color: #999;
	}

	.form-footer {
		display: flex;
		border-top: 1px solid #e0e0e0;
	}

	.form-btn {
		flex: 1;
		height: 100rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 30rpx;
	}

	.form-btn.cancel {
		color: #666;
		border-right: 1px solid #e0e0e0;
	}

	.form-btn.confirm {
		color: #1677ff;
		font-weight: 500;
	}
</style>


