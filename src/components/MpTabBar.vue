<template>
	<view class="mp-tab-bar">
		<view class="mp-tab-bar-border" />
		<view
			v-for="item in tabs"
			:key="item.key"
			class="mp-tab-bar-item"
			@tap="onTap(item)"
		>
			<image class="mp-tab-bar-icon" :src="active === item.key ? item.selectedIconPath : item.iconPath" mode="aspectFit" />
			<text class="mp-tab-bar-text" :class="{ 'mp-tab-bar-text--active': active === item.key }">{{ item.text }}</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { redirectToMpShellTab, type MpTabKey } from '@/utils/mpShell'

defineProps<{
	active: MpTabKey
}>()

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

const onTap = (item: (typeof tabs)[number]) => {
	const pages = getCurrentPages()
	const current = pages[pages.length - 1] as { route?: string }
	const currentPath = current?.route ? `/${current.route}` : ''
	if (currentPath === '/pages/mp-shell/mp-shell') return
	redirectToMpShellTab(item.key)
}
</script>

<style scoped lang="scss">
.mp-tab-bar {
	position: fixed;
	left: 0;
	right: 0;
	bottom: 0;
	z-index: 999;
	display: flex;
	height: 70px;
	padding-bottom: env(safe-area-inset-bottom);
	box-sizing: content-box;
	background: #ffffff;
	box-shadow: 0 -2rpx 10rpx rgba(0, 0, 0, 0.05);
}

.mp-tab-bar-border {
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 1px;
	transform: scaleY(0.5);
	background-color: rgba(0, 0, 0, 0.12);
}

.mp-tab-bar-item {
	flex: 1;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
}

.mp-tab-bar-icon {
	width: 24px;
	height: 24px;
}

.mp-tab-bar-text {
	margin-top: 7px;
	font-size: 13px;
	line-height: normal;
	color: #999999;
}

.mp-tab-bar-text--active {
	color: #22ba59;
}
</style>
