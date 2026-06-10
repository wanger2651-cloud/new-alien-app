<template>
	<view class="privacy-agree-bar">
		<view class="privacy-checkbox" :class="{ checked: modelValue }" @tap="toggleAgree">
			<text v-if="modelValue" class="privacy-checkmark">✓</text>
		</view>
		<view class="privacy-agree-text">
			<text class="privacy-plain">我已阅读并同意</text>
			<text class="privacy-link" @tap.stop="openTermsPage">《用户服务协议》</text>
			<text class="privacy-plain">和</text>
			<text class="privacy-link" @tap.stop="openPrivacyPage">《隐私政策》</text>
		</view>
	</view>
</template>

<script setup lang="ts">
import { openPrivacyPage, openTermsPage } from '@/utils/privacyConsent'

const props = defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

const toggleAgree = () => {
	emit('update:modelValue', !props.modelValue)
}
</script>

<style scoped lang="scss">
.privacy-agree-bar {
	display: flex;
	flex-direction: row;
	align-items: flex-start;
	margin: 24rpx 50rpx 0;
}

.privacy-checkbox {
	width: 32rpx;
	height: 32rpx;
	border: 2rpx solid #cccccc;
	border-radius: 6rpx;
	margin-right: 12rpx;
	margin-top: 4rpx;
	flex-shrink: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	box-sizing: border-box;
}

.privacy-checkbox.checked {
	background: #1677ff;
	border-color: #1677ff;
}

.privacy-checkmark {
	color: #ffffff;
	font-size: 22rpx;
	line-height: 1;
}

.privacy-agree-text {
	flex: 1;
	font-size: 24rpx;
	line-height: 1.6;
	color: #666666;
}

.privacy-plain {
	color: #666666;
}

.privacy-link {
	color: #1677ff;
	text-decoration: underline;
}
</style>
