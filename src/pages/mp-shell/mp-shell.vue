<template>
	<view class="page-container">
		<view class="tab-panel">
			<StoreManage
				v-if="visited.manage"
				v-show="activeTab === 'manage'"
				:embedded-tab="true"
			/>
			<AggregatedService
				v-if="visited.aggregated"
				v-show="activeTab === 'aggregated'"
				:embedded-tab="true"
			/>
			<UserCenter
				v-if="visited.user"
				v-show="activeTab === 'user'"
				ref="userTabRef"
				:embedded-tab="true"
			/>
		</view>
		<view class="tab-bar">
			<view class="uni-tabbar-border" />
			<view
				v-for="item in tabs"
				:key="item.key"
				class="tab-bar-item"
				@tap="switchTab(item.key)"
			>
				<image
					class="tab-bar-icon"
					:src="activeTab === item.key ? item.selectedIconPath : item.iconPath"
					mode="aspectFit"
				/>
				<text class="tab-bar-text" :class="{ 'tab-bar-text--active': activeTab === item.key }">
					{{ item.text }}
				</text>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import StoreManage from '@/pages/storeManage/storeManage.vue'
import AggregatedService from '@/pages/aggregated-service/aggregated-service.vue'
import UserCenter from '@/pages/user/index.vue'
import { notifyUserSessionChanged } from '@/utils/authSession'

type TabKey = 'manage' | 'aggregated' | 'user'

const tabs = [
	{
		key: 'manage' as const,
		text: '门店管理',
		iconPath: '/static/shop/icon_041a.png',
		selectedIconPath: '/static/shop/icon_048a.png',
	},
	{
		key: 'aggregated' as const,
		text: '聚合客服',
		iconPath: '/static/shop/icon_045a.png',
		selectedIconPath: '/static/shop/icon_044a.png',
	},
	{
		key: 'user' as const,
		text: '个人中心',
		iconPath: '/static/shop/icon_043a.png',
		selectedIconPath: '/static/shop/icon_046a.png',
	},
]

const activeTab = ref<TabKey>('manage')
const visited = reactive<Record<TabKey, boolean>>({
	manage: true,
	aggregated: false,
	user: false,
})
const userTabRef = ref<{ refreshUserInfo?: () => void } | null>(null)

const refreshUserTab = () => {
	nextTick(() => {
		userTabRef.value?.refreshUserInfo?.()
		notifyUserSessionChanged()
	})
}

const switchTab = (key: TabKey) => {
	if (activeTab.value === key) return
	visited[key] = true
	activeTab.value = key
	if (key === 'user') {
		refreshUserTab()
	}
}

const normalizeTab = (raw: unknown): TabKey => {
	const value = String(raw || '').toLowerCase()
	if (value === 'aggregated' || value === 'user') return value
	return 'manage'
}

onLoad((options) => {
	const tab = normalizeTab(options?.tab ?? options?.defaultTab)
	visited[tab] = true
	activeTab.value = tab
	if (tab === 'user') {
		refreshUserTab()
	}
})
</script>

<style scoped lang="scss">
.page-container {
	height: 100vh;
	overflow: hidden;
	background-color: #f9f9f9;
	display: flex;
	flex-direction: column;
}

.tab-panel {
	flex: 1;
	min-height: 0;
	overflow: hidden;
	position: relative;
}

.tab-bar {
	flex-shrink: 0;
	width: 100%;
	height: 70px;
	padding-bottom: env(safe-area-inset-bottom);
	box-sizing: content-box;
	display: flex;
	background-color: #fff;
	z-index: 1000;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	position: relative;
}

.tab-bar-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.tab-bar-icon {
	width: 24px;
	height: 24px;
}

.tab-bar-text {
	margin-top: 7px;
	font-size: 13px;
	line-height: normal;
	color: #999999;
}

.tab-bar-text--active {
	color: #22ba59;
}

.uni-tabbar-border {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 1px;
	transform: scaleY(0.5);
	background-color: rgba(0, 0, 0, 0.12);
}
</style>
