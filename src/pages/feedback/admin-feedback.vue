<template>
	<view class="admin-feedback-page">
		<wd-navbar
			:fixed="true"
			left-arrow
			title="后台反馈"
			:safe-area-inset-top="true"
			@click-left="handleBack"
		/>
		<view class="content" :style="`padding-top: calc(${systemBarHeight}px + 44px);`">
			<view v-if="list.length === 0 && !loading" class="empty">
				暂无反馈数据
			</view>
			<view v-for="item in list" :key="item.id" class="card">
				<view class="title-row">
					<text class="title">反馈ID：{{ item.id || '-' }}</text>
					<text class="time">{{ formatTime(item.crtim) }}</text>
				</view>
				
				<view class="msg">{{ item.msg || '-' }}</view>
				
				<scroll-view
					v-if="Array.isArray(item.img) && item.img.length"
					scroll-x
					class="img-scroll"
				>
					<image
						v-for="(img, idx) in item.img"
						:key="`${item.id}_${idx}`"
						:src="img"
						class="img-item"
						mode="aspectFill"
						@click="preview(item.img, img)"
					/>
				</scroll-view>
				<view class="meta-row">
					<view class="meta-item contact-item">
						<text>联系方式：{{ item.contact || '-' }}</text>
						<text class="copy-btn" @click.stop="copyContact(item.contact)">复制</text>
					</view>
				</view>
			</view>
			<view v-if="list.length > 0" class="pager-wrap">
				<wd-pagination
					v-model.async="query.page"
					:total="query.total"
					:page-size.async="query.pageSize"
					show-icon
					@change="handlePageChange"
				/>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { FeedBackApi } from '@/api/feedback'
import { parseDateTimestamp } from '@/utils/date'

type FeedbackItem = {
	id: string
	user?: string
	code?: string | number
	user_code?: string | number
	admin_code?: string | number
	msg: string
	contact: string
	img: string[]
	crtim?: string
	[key: string]: any
}

const systemBarHeight = ref(0)
const list = ref<FeedbackItem[]>([])
const loading = ref(false)
const query = ref({
	page: 1,
	pageSize: 20,
	total: 0
})

const getSysteminfo = () => {
	uni.getSystemInfo({
		success: (res) => {
			systemBarHeight.value = Number(res.statusBarHeight || 0)
		}
	})
}

const normalizeList = (raw: any): FeedbackItem[] => {
	const data = raw?.data ?? raw?.Data ?? raw
	if (Array.isArray(data)) return data
	if (Array.isArray(data?.data)) return data.data
	if (Array.isArray(data?.rows)) return data.rows
	if (Array.isArray(data?.list)) return data.list
	return []
}

const normalizeTotal = (raw: any): number => {
	const data = raw?.data ?? raw?.Data ?? raw
	return Number(
		data?.total ??
		data?.Total ??
		data?.count ??
		data?.Count ??
		(Array.isArray(normalizeList(raw)) ? normalizeList(raw).length : 0)
	) || 0
}

const loadList = async () => {
	if (loading.value) return
	loading.value = true
	uni.showLoading({ title: '加载中...' })
	try {
		const res = await FeedBackApi.getAdminFeedBack(query.value.page, query.value.pageSize)
		const rows = normalizeList(res).sort((a, b) => {
			const ta = parseDateTimestamp(a?.crtim || '', 0)
			const tb = parseDateTimestamp(b?.crtim || '', 0)
			return tb - ta
		})
		const total = normalizeTotal(res)
		list.value = rows
		query.value.total = total || rows.length
	} catch (e) {
		console.error('后台反馈加载失败:', e)
		uni.showToast({ title: '加载失败，请稍后重试', icon: 'none' })
	} finally {
		loading.value = false
		uni.hideLoading()
	}
}

const handlePageChange = (e: any) => {
	const nextPage = Number(e?.value ?? e?.current ?? query.value.page)
	if (nextPage > 0) {
		query.value.page = nextPage
	}
	loadList()
}

const formatTime = (val?: string) => {
	if (!val) return '-'
	return String(val).replace('T', ' ').slice(0, 19)
}

const preview = (urls: string[], current: string) => {
	uni.previewImage({ urls, current })
}

const copyContact = (contact?: string) => {
	const text = String(contact || '').trim()
	if (!text || text === '-') {
		uni.showToast({ title: '暂无可复制联系方式', icon: 'none' })
		return
	}
	uni.setClipboardData({
		data: text,
		success: () => {
			uni.showToast({ title: '复制成功', icon: 'success' })
		},
		fail: () => {
			uni.showToast({ title: '复制失败，请重试', icon: 'none' })
		}
	})
}

const handleBack = () => {
	uni.navigateBack()
}

onLoad(() => {
	getSysteminfo()
	loadList()
})
</script>

<style scoped lang="scss">
.admin-feedback-page {
	min-height: 100vh;
	background: #f7f7f7;
}

.content {
	padding: 24rpx 24rpx 40rpx;
	box-sizing: border-box;
}

.card {
	background: #fff;
	border-radius: 12rpx;
	padding: 26rpx 24rpx;
	margin-bottom: 20rpx;
	box-shadow: 0 4rpx 18rpx rgba(0, 0, 0, 0.04);
}

.title-row {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 12rpx;
}

.title {
	font-size: 30rpx;
	font-weight: 600;
	color: #333;
}

.time {
	font-size: 22rpx;
	color: #999;
}

.msg {
	font-size: 28rpx;
	color: #333;
	line-height: 1.5;
	margin-bottom: 12rpx;
	word-break: break-all;
}

.contact {
	font-size: 24rpx;
	color: #666;
	margin-bottom: 12rpx;
}

.meta-row {
	display: flex;
	flex-wrap: wrap;
	gap: 12rpx;
	margin-bottom: 12rpx;
}

.meta-item {
	font-size: 22rpx;
	color: #7a7e83;
	background: #f4f6f8;
	padding: 6rpx 12rpx;
	border-radius: 8rpx;
}

.contact-item {
	display: inline-flex;
	align-items: center;
	gap: 12rpx;
}

.copy-btn {
	color: #4f6ef7;
	font-size: 22rpx;
}

.img-scroll {
	white-space: nowrap;
}

.img-item {
	width: 140rpx;
	height: 140rpx;
	border-radius: 10rpx;
	margin-right: 12rpx;
	display: inline-block;
}

.pager-wrap {
	background: #fff;
	border-radius: 12rpx;
	padding: 10rpx 12rpx;
}

.empty {
	margin-top: 120rpx;
	text-align: center;
	color: #999;
	font-size: 26rpx;
}
</style>
