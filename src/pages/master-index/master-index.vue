<template>
	<view class="page-container">
		<view v-if="showEncSwitch" class="enc-switch-bar" :style="{ paddingTop: (statusBarHeight + 6) + 'px' }">
			<text class="enc-switch-label">加密流量</text>
			<wd-switch v-model="encApiEnabled" size="20px" active-color="#FACC05" @change="onEncApiSwitchChange" />
		</view>
		<view class="u-page">
		<view v-cloak>
			<component :is="Master" v-show="defaultIndex === 0" :defaultIndex="defaultIndex"></component>
			<component :is="Manage" v-show="defaultIndex === 1"></component>
			<component :is="WxPush" v-show="showWechatPushTab && defaultIndex === 2"></component>
			<component :is="UserCenter" v-show="defaultIndex === effectiveUserTabIndex"></component>
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
	import WxPush from "@/pages/wx-push/wx-push"
	import UserCenter from "@/pages/user/index"
	import { ref, computed } from "vue"
	import { UserApi } from '@/api/login'
	import { getEncApiSwitchEnabled, setEncApiSwitchEnabled } from '@/utils/encApi.js'
	const currentComponent  = ref('Manage')
	const defaultIndex = ref(0)

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
		const tabs = [
			{
				path: '/pages/master/master',
				title: '首页',
				icon: '/static/shop/icon_045a.png',
				activeIcon: '/static/shop/icon_044a.png'
			},
			{
				path: '/pages/manage/manage',
				title: '门店管理',
				icon: '/static/shop/icon_041a.png',
				activeIcon: '/static/shop/icon_048a.png'
			}
		]
		if (showWechatPushTab.value) {
			tabs.push({
				path: '/pages/wx-push/wx-push',
				title: '微信推送',
				icon: '/static/shop/icon_051a.png',
				activeIcon: '/static/shop/icon_051a.png'
			})
		}
		tabs.push({
			path: '/pages/user/index',
			title: '个人中心',
			icon: '/static/shop/icon_043a.png',
			activeIcon: '/static/shop/icon_046a.png'
		})
		return tabs
	})
	/** 当前布局下「个人中心」对应的 defaultIndex */
	const effectiveUserTabIndex = computed(() =>
		showWechatPushTab.value ? 3 : 2
	)
	
	const toTabbar = (item, index) => {
		currentComponent.value = item.name
		defaultIndex.value = index
	}

	const normalizeDefaultIndexAfterTabLayout = (raw) => {
		let n = raw
		if (!Number.isFinite(n)) return n
		// 曾含「店铺复制」的 5 栏语义（仅对可能来自旧链接的高位 index 收口）
		if (n <= 1) {
			return n
		}
		if (n === 2) return 1
		return n - 1
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
				if (!showWechatPushTab.value) {
					// 移除「微信推送」后：原为 [首页|门店|微信|个人]，index 3→个人；2→合并到门店
					if (idx === 3) idx = 2
					else if (idx === 2) idx = 1
				}
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
	.u-page {
		flex: 1;
		overflow-y: auto;
		/* 为底部导航栏预留空间，避免内容被遮挡 */
		padding-bottom: calc(70px + env(safe-area-inset-bottom));
		box-sizing: border-box;
	}
	.tab-bar {
		width: 100%;
		height: 70px;
		position: fixed;
		bottom: env(safe-area-inset-bottom);
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