<template>
	<view class="inputBox passWord">
		<view class="input-main">
			<image :src="props.imgSrc" mode="" class="phone-img"></image>
			<!-- <input class="inp" v-model="title" oninput="this.value = this.value.replace(/[^a-zA-Z0-9]/g, '')"
				:placeholder="props.placeholderText" :type="textType" @input="checkAmount"/>
				 -->
				<wd-input v-model="title" :placeholder="props.placeholderText" class="inp" @input="checkAmount" :showPassword="textType === 'password'" no-border/>
		</view>
		<view class="yzm" v-if="yzmFlage" @click="childClick">{{ timenum > 0 ? timenum
                    < 10 ? '0' + timenum + 's' : timenum + 's' : '获取验证码' }}</view>
		<!-- <image src="@/static/choose/eye-hide.png" mode="" class="password-icon" v-if="props.type === 'password'"
			@click="changeEyeState"></image> -->
		<!-- <image src="@/static/choose/eye-show.png" mode="" class="password-icon" v-if="props.type === 'text'"></image> -->
	</view>
</template>

<script setup>
	import {
		ref,
		reactive,
		nextTick,
		onMounted
	} from 'vue';
	const title = defineModel('title')
	const props = defineProps(['placeholderText', 'imgSrc', 'yzmFlage', 'datas', 'timenum', 'type']);
	const emit = defineEmits(['changeStr', 'replaceStr'])
	const textType = ref('text')
	const childClick = (value) => {
		emit('changeStr', value)
	}
	const inputValue = ref('')
	const checkAmount = (event) => {
		// 使用正则表达式过滤掉所有非字母和非数字字符
		if (event && event.detail) {
			const newValue = event.detail.value.replace(/[^a-zA-Z0-9]/g, '');
			// 更新数据模型
			inputValue.value = newValue;
			emit('replaceStr', inputValue.value)
		}
	}
	const changeEyeState = () => {
		if (textType.value === 'text') {
			textType.value = 'password'
		} else {
			textType.value = 'text'
		}
	}
	onMounted(() => {
		if (props.type === 'password') {
			textType.value = 'password'
		} else {
			textType.value = 'text'
		}
		console.log(textType.value, 'textType.value')
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

	.password-icon {
		position: absolute;
		top: 50%;
		right: 30rpx;
		transform: translateY(-50%);
		z-index: 10;
		width: 32rpx;
		height: 32rpx;
	}
</style>