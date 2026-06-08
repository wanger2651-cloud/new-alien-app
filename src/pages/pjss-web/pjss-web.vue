<template>
	<view class="pjss-web-page">
		<wd-navbar
			:fixed="true"
			left-text="返回"
			:title="pageTitle"
			left-arrow
			@click-left="handleBack"
			:safe-area-inset-top="true"
			custom-class="navbar-main"
		/>
		<view class="webview-container" :style="{ paddingTop: `${webviewTopOffset}px` }">
			<web-view v-if="fullUrl" :src="fullUrl"></web-view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useAuthStore } from '@/store/auth'
import { getLineApiUrl } from '@/config/lineConfig'

type PageLoadOptions = {
	title?: string
	url?: string
	id?: string
	shopId?: string
	shop_offid?: string
	office_id?: string
}

const fullUrl = ref('')
const pageTitle = ref('评价申诉配置')
const webviewTopOffset = ref(44)
const authStore = useAuthStore()

const normalizeOptionValue = (value?: string): string => {
	if (typeof value !== 'string') {
		return ''
	}
	let decoded = value
	try {
		decoded = decodeURIComponent(value)
	} catch (e) {
		decoded = value
	}
	// 兼容项目路由 query 使用 JSON.stringify 后附带的外层引号
	try {
		return JSON.parse(decoded)
	} catch (e) {
		return decoded
	}
}
const trimTrailingSlash = (url: string): string => {
	return url.endsWith('/') ? url.slice(0, -1) : url
}

const getBaseUrl = (): string => {
	const savedApiBaseUrl = uni.getStorageSync('apiBaseUrl')
	if (savedApiBaseUrl) {
		return trimTrailingSlash(savedApiBaseUrl)
	}

	const savedLineType = uni.getStorageSync('lineType') || 'default'
	if (savedLineType === 'custom') {
		const customUrls = uni.getStorageSync('customLineUrls')
		return trimTrailingSlash(customUrls?.defaultUrl || getLineApiUrl('default'))
	}

	return trimTrailingSlash(getLineApiUrl(savedLineType) || getLineApiUrl('default'))
}

const resolveTopOffset = () => {
	try {
		const systemInfo = uni.getSystemInfoSync()
		const statusBarHeight = Number(systemInfo?.statusBarHeight || 0)
		// 顶部留白 = 状态栏 + 导航主体高度
		webviewTopOffset.value = statusBarHeight + 44
	} catch (e) {
		webviewTopOffset.value = 44
	}
}

const buildPjssUrl = (shopPkId: string, token: string): string => {
	const base = getBaseUrl()
	return `${base}/config/1/${shopPkId}/PJSS?token=${encodeURIComponent(token)}`
}

const handleBack = () => {
	uni.navigateBack()
}

onLoad((options) => {
	const pageOptions = (options || {}) as PageLoadOptions
	resolveTopOffset()

	if (pageOptions.title) {
		pageTitle.value = normalizeOptionValue(pageOptions.title) || '在线客服'
	}

	// 通用 web-view 模式：直接透传 URL
	if (pageOptions.url) {
		fullUrl.value = normalizeOptionValue(pageOptions.url)
		return
	}

	// 后端配置页使用的是店铺的主键ID（长ID），不是 office_id
	const shopPkId = pageOptions.id || pageOptions.shopId || pageOptions.shop_offid || pageOptions.office_id || ''
	// 当前 APP 登录账号的 token（与电脑端示例 URL 里的 token 同类型）
	const token = authStore.token || authStore.getToken
	if (!shopPkId || !token) {
		uni.showToast({
			title: !shopPkId ? '缺少店铺ID' : '缺少登录信息',
			icon: 'none'
		})
		return
	}

	// 拼接成与电脑端相同结构的 URL：/config/1/{OffId}/PJSS?token=xxx
	fullUrl.value = buildPjssUrl(shopPkId, token)
	
	console.log('评价申诉配置页面 URL:', fullUrl.value)
})
</script>

<style scoped lang="scss">
.pjss-web-page {
	display: flex;
	flex-direction: column;
	height: 100vh;
}

.webview-container {
	flex: 1;
	box-sizing: border-box;
}
</style>

