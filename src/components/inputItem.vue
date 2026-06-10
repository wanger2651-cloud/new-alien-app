<template>
	<view class="inputBox passWord">
		<view class="input-main">
			<image :src="props.imgSrc" mode="" class="phone-img"></image>
			<wd-input
				v-model="title"
				:placeholder="props.placeholderText"
				class="inp"
				:type="wdInputType"
				:maxlength="resolvedMaxlength"
				@input="handleInput"
				:showPassword="isPassword"
				no-border
			/>
		</view>
		<view class="yzm" v-if="yzmFlage" @tap="childClick">{{ timenum > 0 ? timenum
                    < 10 ? '0' + timenum + 's' : timenum + 's' : '获取验证码' }}</view>
	</view>
</template>

<script setup>
	import { ref, computed, onMounted } from 'vue';

	const title = defineModel('title')
	const props = defineProps({
		placeholderText: String,
		imgSrc: String,
		yzmFlage: Boolean,
		datas: [String, Object],
		timenum: Number,
		/** text | password | phone | digit | invite | account */
		type: {
			type: String,
			default: 'text'
		},
		maxlength: {
			type: Number,
			default: 0
		}
	})
	const emit = defineEmits(['changeStr', 'replaceStr'])

	const DEFAULT_MAX = {
		phone: 11,
		digit: 6,
		invite: 20,
		account: 32,
		password: 32,
		text: 64
	}

	const normalizedType = computed(() => {
		if (props.type === 'password') return 'password'
		if (props.type === 'phone') return 'phone'
		if (props.type === 'digit' || props.type === 'number') return 'digit'
		if (props.type === 'invite') return 'invite'
		if (props.type === 'account') return 'account'
		return 'text'
	})

	const isPassword = computed(() => normalizedType.value === 'password')

	const wdInputType = computed(() => {
		if (normalizedType.value === 'password') return 'text'
		if (normalizedType.value === 'phone' || normalizedType.value === 'digit') return 'number'
		return 'text'
	})

	const resolvedMaxlength = computed(() => {
		if (props.maxlength > 0) return props.maxlength
		return DEFAULT_MAX[normalizedType.value] || DEFAULT_MAX.text
	})

	const sanitizeValue = (raw) => {
		let value = raw == null ? '' : String(raw)
		const max = resolvedMaxlength.value
		if (max > 0 && value.length > max) {
			value = value.slice(0, max)
		}
		switch (normalizedType.value) {
			case 'phone':
			case 'digit':
				return value.replace(/\D/g, '')
			case 'invite':
			case 'account':
				return value.replace(/[^a-zA-Z0-9]/g, '')
			default:
				return value
		}
	}

	const childClick = (value) => {
		emit('changeStr', value)
	}

	const handleInput = (event) => {
		if (!event || event.detail == null) return
		const newValue = sanitizeValue(event.detail.value ?? '')
		title.value = newValue
		emit('replaceStr', newValue)
	}

	onMounted(() => {
		if (title.value) {
			const cleaned = sanitizeValue(title.value)
			if (cleaned !== title.value) title.value = cleaned
		}
	})
</script>

<style scoped lang="scss">
	.inputBox {
		width: 650rpx;
		height: 90rpx;
		background: #FFFFFF;
		border-radius: 12rpx;
		border: 1rpx solid #DFDFDF;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-left: 50rpx;
		box-sizing: border-box;
		padding-right: 10rpx;
		position: relative;

		.phone-img {
			width: 32rpx;
			height: 32rpx;
			margin-left: 30rpx;
			margin-right: 12rpx;
		}

		.inp {
			width: calc(100% - 32rpx - 30rpx - 12rpx);
		}

		.yzm {
			font-size: 28rpx;
			color: #FACC05;
			position: absolute;
			right: 10rpx;
			top: 50%;
			transform: translateY(-50%);
		}
	}

	.passWord {
		margin-top: 40rpx;
	}

	.input-main {
		display: flex;
		align-items: center;
		width: 100%;
	}
</style>
