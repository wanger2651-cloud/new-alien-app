<template>
	<view v-if="visible" class="privacy-mask">
		<view class="privacy-dialog" @tap.stop>
			<view class="privacy-title">{{ dialogTitle }}</view>
			<view class="privacy-message">{{ dialogMessage }}</view>

			<view v-if="step === 'first'" class="privacy-links">
				<text class="privacy-link" @tap="openTermsPage">《用户服务协议》</text>
				<text class="privacy-link-sep">和</text>
				<text class="privacy-link" @tap="openPrivacyPage">《隐私政策》</text>
			</view>

			<view class="privacy-actions">
				<view class="privacy-btn privacy-btn-refuse" @tap="handleRefuse">{{ refuseText }}</view>
				<view class="privacy-btn privacy-btn-accept" @tap="handleAccept">{{ acceptText }}</view>
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import {
	PRIVACY_DIALOG_MESSAGE,
	PRIVACY_DIALOG_SECOND_MESSAGE,
	PRIVACY_DIALOG_SECOND_TITLE,
	PRIVACY_DIALOG_TITLE
} from '@/config/privacyConfig'
import { exitApp, openPrivacyPage, openTermsPage, setPrivacyAgreed } from '@/utils/privacyConsent'

defineProps<{ visible: boolean }>()

const emit = defineEmits<{ agree: [] }>()

const step = ref<'first' | 'second'>('first')

const dialogTitle = computed(() => {
	return step.value === 'first' ? PRIVACY_DIALOG_TITLE : PRIVACY_DIALOG_SECOND_TITLE
})

const dialogMessage = computed(() => {
	return step.value === 'first' ? PRIVACY_DIALOG_MESSAGE : PRIVACY_DIALOG_SECOND_MESSAGE
})

const acceptText = computed(() => {
	return step.value === 'first' ? '同意' : '同意并继续'
})

const refuseText = computed(() => {
	return step.value === 'first' ? '暂不同意' : '退出应用'
})

const handleAccept = () => {
	setPrivacyAgreed()
	emit('agree')
}

const handleRefuse = () => {
	if (step.value === 'first') {
		step.value = 'second'
		return
	}
	exitApp()
}
</script>

<style scoped lang="scss">
.privacy-mask {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background: rgba(0, 0, 0, 0.55);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 10001;
	padding: 48rpx;
	box-sizing: border-box;
}

.privacy-dialog {
	width: 100%;
	max-width: 620rpx;
	background: #ffffff;
	border-radius: 24rpx;
	padding: 40rpx 36rpx 32rpx;
	box-sizing: border-box;
}

.privacy-title {
	font-size: 34rpx;
	font-weight: 600;
	color: #333333;
	text-align: center;
	margin-bottom: 24rpx;
}

.privacy-message {
	font-size: 28rpx;
	color: #666666;
	line-height: 1.7;
	text-align: left;
}

.privacy-links {
	margin-top: 24rpx;
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	justify-content: center;
}

.privacy-link {
	font-size: 28rpx;
	color: #1677ff;
	text-decoration: underline;
}

.privacy-link-sep {
	font-size: 28rpx;
	color: #666666;
	margin: 0 8rpx;
}

.privacy-actions {
	margin-top: 36rpx;
	display: flex;
	flex-direction: row;
	gap: 20rpx;
}

.privacy-btn {
	flex: 1;
	height: 80rpx;
	border-radius: 12rpx;
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: 30rpx;
}

.privacy-btn-refuse {
	background: #f5f5f5;
	color: #999999;
}

.privacy-btn-accept {
	background: #1677ff;
	color: #ffffff;
}
</style>
