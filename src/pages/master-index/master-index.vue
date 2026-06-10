<template>
	<view class="page-container">
		<view v-if="showEncSwitch" class="enc-switch-bar" :style="{ paddingTop: (statusBarHeight + 6) + 'px' }">
			<text class="enc-switch-label">加密流量</text>
			<wd-switch v-model="encApiEnabled" size="20px" active-color="#FACC05" @change="onEncApiSwitchChange" />
		</view>
		<view class="tab-panel">
			<Master v-show="activeTabKey === 'home'"></Master>
			<Manage v-show="activeTabKey === 'manage'" :embedded-tab="true"></Manage>
			<AggregatedService v-show="activeTabKey === 'aggregated'" :embedded-tab="true"></AggregatedService>
			<WxPush v-show="activeTabKey === 'wxpush'"></WxPush>
			<UserCenter v-show="activeTabKey === 'user'" :embedded-tab="true"></UserCenter>
		</view>
		<view class="tab-bar">
			<view class="uni-tabbar-border">
			</view>
			<view class="tab-bar-item" v-for="(item, index) in tabbarList" :key="item.title" @click="toTabbar(item, index)">
				<view class="tab-bar-item-main">
				   <image :src="item.activeIcon" v-show="defaultIndex === index"></image>
				   <image :src="item.icon" v-show="defaultIndex !== index"></image>
				   <view class="tab-bar-title" :class="{'is-active': defaultIndex === index}">{{ item.title }}</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onReady
	} from '@dcloudio/uni-app';
	import Master from "@/pages/master/master"
	import Manage from "@/pages/storeManage/storeManage"
	import AggregatedService from "@/pages/aggregated-service/aggregated-service"
	import WxPush from "@/pages/wx-push/wx-push"
	import UserCenter from "@/pages/user/index"
	import { ref, computed, nextTick } from "vue"
	import { UserApi } from '@/api/login'
	import { getEncApiSwitchEnabled, setEncApiSwitchEnabled } from '@/utils/encApi.js'
	import { notifyUserSessionChanged } from '@/utils/authSession'
	const currentComponent  = ref('Manage')
	const defaultIndex = ref(0)
	/** 测试阶段隐藏首页，确认无问题后可改为 false 并删除 Master 相关代码 */
	const showHomeTab = ref(false)

	const statusBarHeight = ref(0)
	const encAdminFlag = ref(false)
	const encApiEnabled = ref(getEncApiSwitchEnabled())

	/**
	 * 与 pages/user/nodeChild 等处一致：空 role 在业务上视为具备管理侧权限；
	 * 否则需角色名包含 admin（兼容枚举/字符串）。
	 * @param {Record<string, unknown> | null | undefined} payload getagencyinfo 的 data
	 * @returns {boolean}
	 */
	const resolveEncAdmin = (payload) => {
		const raw = payload?.admin?.role
		const roles = Array.isArray(raw) ? raw : []
		if (!roles.length) return true
		return roles.some((role) => {
			if (typeof role === 'string') return role.toLowerCase().includes('admin')
			if (role && typeof role === 'object' && role.name != null)
				return String(role.name).toLowerCase().includes('admin')
			return false
		})
	}

	const isDebugMode = computed(() => {
		const electronApi = typeof globalThis !== 'undefined' ? globalThis.electron : undefined
		if (electronApi && electronApi.isDev) return true
		if (import.meta.env.DEV) return true
		if (import.meta.env.MODE === 'development') return true
		return false
	})

	const showEncSwitch = computed(() => encAdminFlag.value && isDebugMode.value)

	const refreshEncAdmin = () => {
		UserApi.getUser().then((res) => {
			const code = res?.code ?? res?.Code
			const body = res?.data ?? res?.Data
			const hasAdminPayload = body && typeof body === 'object' && body.admin != null
			const ok = (code === 200 && body) || hasAdminPayload
			if (ok && body) encAdminFlag.value = resolveEncAdmin(body)
			else encAdminFlag.value = false
		})
	}

	/**
	 * wd-switch 的 change 可能为布尔值或 { value: boolean }；持久化逻辑在 setEncApiSwitchEnabled 内统一归一化。
	 * @param {unknown} value
	 */
	const onEncApiSwitchChange = (value) => {
		setEncApiSwitchEnabled(value)
		encApiEnabled.value = getEncApiSwitchEnabled()
	}
	/** 设为 true 时恢复底部栏「微信推送」及对应内容与索引 */
	const showWechatPushTab = ref(false)
	const tabbarList = computed(() => {
		const tabs = []
		if (showHomeTab.value) {
			tabs.push({
				key: 'home',
				path: '/pages/master/master',
				title: '首页',
				icon: '/static/shop/icon_045a.png',
				activeIcon: '/static/shop/icon_044a.png'
			})
		}
		tabs.push({
			key: 'manage',
			path: '/pages/manage/manage',
			title: '门店管理',
			icon: '/static/shop/icon_041a.png',
			activeIcon: '/static/shop/icon_048a.png'
		})
		tabs.push({
			key: 'aggregated',
			path: '/pages/aggregated-service/aggregated-service',
			title: '聚合客服',
			icon: '/static/user/jihu-logo.png',
			activeIcon: '/static/user/jihu-logo.png'
		})
		if (showWechatPushTab.value) {
			tabs.push({
				key: 'wxpush',
				path: '/pages/wx-push/wx-push',
				title: '微信推送',
				icon: '/static/shop/icon_051a.png',
				activeIcon: '/static/shop/icon_051a.png'
			})
		}
		tabs.push({
			key: 'user',
			path: '/pages/user/index',
			title: '个人中心',
			icon: '/static/shop/icon_043a.png',
			activeIcon: '/static/shop/icon_046a.png'
		})
		return tabs
	})
	const activeTabKey = computed(() => tabbarList.value[defaultIndex.value]?.key ?? 'manage')
	
	const toTabbar = (item, index) => {
		currentComponent.value = item.key
		defaultIndex.value = index
		if (item.key === 'user') {
			nextTick(() => notifyUserSessionChanged())
		}
	}

	const normalizeDefaultIndexAfterTabLayout = (raw) => {
		let idx = raw
		if (!Number.isFinite(idx)) return idx
		// 旧版含首页：0 首页 / 1 门店 / 2 微信或聚合 / 3 个人
		if (showHomeTab.value) {
			if (idx <= 1) return idx
			if (idx === 2) return showWechatPushTab.value ? 2 : 1
			return showWechatPushTab.value ? idx : idx - 1
		}
		// 新版无首页：0 门店 / 1 聚合客服 / [2 微信] / N 个人
		if (idx === 0) return 0
		if (idx === 1) return 0
		if (idx === 2) return showWechatPushTab.value ? 2 : 2
		return showWechatPushTab.value ? idx : Math.max(0, idx - 1)
	}
	
	onLoad((options) => {
		if (options && options.defaultIndex != null && options.defaultIndex !== '') {
			let idx
			try {
				idx = typeof options.defaultIndex === 'number' ? options.defaultIndex : JSON.parse(options.defaultIndex)
			} catch {
				idx = Number(options.defaultIndex)
			}
			if (Number.isFinite(idx)) {
				idx = normalizeDefaultIndexAfterTabLayout(idx)
				const maxIndex = tabbarList.value.length - 1
				defaultIndex.value = Math.max(0, Math.min(maxIndex, idx))
			}
		}
		const sys = uni.getSystemInfoSync()
		statusBarHeight.value = sys.statusBarHeight || 0
		refreshEncAdmin()
	})
	
	onReady(() => {
		// #ifdef APP-PLUS
		// 禁用当前页面的iOS左滑返回手势
		try {
			// @ts-ignore
			const currentWebview = getCurrentPages()[getCurrentPages().length - 1].$getAppWebview()
			if (currentWebview) {
				currentWebview.setStyle({
					popGesture: 'none'
				})
			}
		} catch (e) {
			// 设置失败，静默处理
		}
		// #endif
	})
	
	onShow(() => {
		refreshEncAdmin()
		// #ifdef APP-PLUS
		// 每次显示时都禁用左滑返回手势
		try {
			// @ts-ignore
			const currentWebview = getCurrentPages()[getCurrentPages().length - 1].$getAppWebview()
			if (currentWebview) {
				currentWebview.setStyle({
					popGesture: 'none'
				})
			}
		} catch (e) {
			// 设置失败，静默处理
		}
		// #endif
	})
</script>

<style lang="scss" scoped>
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
		z-index: 100;
		box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
	}
	.tab-bar-item {
		display: flex;
		justify-content: center;
		align-items: center;
		flex-direction: column;
		flex: 1;
		font-size: 0;
		text-align: center;
	}
	.tab-bar-item-main {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.tab-bar-item image {
	  width: 24px;
	  height: 24px;
	}
	.tab-bar-item text {
	  font-size: 13px;
	  line-height: normal;
	  text-align: center;
	  color: #7A7E83;
	}
	.tab-bar-title {
		color: rgb(122, 126, 131);
		margin-top: 7px;
		font-size: 13px;
		line-height: normal;
		text-align: center;
	}
	.is-active {
		color: #FACC05;
	}

	.enc-switch-bar {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		flex-shrink: 0;
		padding: 8px 16px 8px 16px;
		background-color: #fff;
		border-bottom: 1px solid rgba(0, 0, 0, 0.06);
		z-index: 50;
	}

	.enc-switch-label {
		margin-right: 10px;
		font-size: 24rpx;
		color: #606266;
	}
	.uni-tabbar-border {
	    position: absolute;
	    left: 0;
	    top: 0;
	    width: 100%;
	    height: 1px;
	    transform: scaleY(0.5);
		background-color: rgba(0, 0, 0, 0.33);
	}
</style>