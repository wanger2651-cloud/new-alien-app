<template>
	<view class="mLogin">
		<view class="top-bar" @tap="goLoginPage">
			<text class="back-text">‹ 返回</text>
		</view>
		<view class="textOne">HI～ 您好！</view>
		<view class="textTwo">输入信息找回密码</view>
		<view class="phone">
			<inputItem v-model:title="agencyRegVo.phone" type="phone" placeholderText="请输入手机号"
				imgSrc="../../static/choose/phone.png" />
			<inputItem v-model:title="agencyRegVo.p" type="password" placeholderText="请输入新密码" imgSrc="../../static/choose/mima.png" />
			<inputItem v-model:title="agencyRegVo.p1" type="password" placeholderText="请再次输入密码" imgSrc="../../static/choose/mima.png" />
			<inputItem v-model:title="agencyRegVo.gaCode" type="digit" placeholderText="请输入谷歌验证器6位验证码"
				imgSrc="../../static/choose/mima.png" @replaceStr="replaceGaCode" />
		</view>
		<view class="regBut" @click="confirmRequest">确认</view>
		<view class="loginBut" @tap="toLogin">去登录</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onBackPress
	} from '@dcloudio/uni-app';
	import {
		ref,
		reactive,
		nextTick
	} from 'vue';
	import {
		useAuthStore
	} from '@/store/auth.ts'
	import {
		HomeApi
	} from '@/api/home';
	import inputItem from '@/components/inputItem.vue';
	const authStore = useAuthStore()
	// 声明一个响应式对象
	const agencyRegVo = reactive({
		phone: '',
		p: '',
		p1: '',
		gaCode: ''
	});
	const pageText = ref('')
	const pageFlag = ref('')

	onLoad((e) => {
		// 商家版已移除，只保留运营端
		pageText.value = '运营端'
		pageFlag.value = e.peageFlag || '2' // 默认运营端
		// pageText.value = e.peageFlag === '1' ? '商家端' : '运营端'
		// pageFlag.value = e.peageFlag
	})
	
	const goLoginPage = () => {
		uni.redirectTo({ url: '/pages/login/merchantLogin?peageFlag=' + pageFlag.value })
	}

	onBackPress(() => {
		goLoginPage()
		return true
	})
	
	const toLogin = () => {
		goLoginPage()
	}
	
	const replaceGaCode = (data) => {
		nextTick(() => {
			agencyRegVo.gaCode = data
		})
	}

	const showToast = (type, title) => {
		uni.showToast({
			title: title,
			icon: type, // error success
			duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
			mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
		});
	}

	const confirmRequest = () => {
		if (!agencyRegVo.phone) {
			return showToast('error', '手机号不能为空')
		}
		if (!agencyRegVo.p) {
			return showToast('error', '请填写密码')
		} else if (!agencyRegVo.p1) {
			return showToast('error', '请确认密码')
		} else if (agencyRegVo.p != agencyRegVo.p1) {
			return showToast('error', '两次密码不一致')
		}
		if (!agencyRegVo.gaCode || !agencyRegVo.gaCode.trim()) {
			return showToast('error', '请输入谷歌验证码')
		}
		const {
			phone,
			p,
			p1,
			gaCode
		} = agencyRegVo
		// 使用ga_code作为谷歌验证码参数（与PC版保持一致）
		const gaCodeTrimmed = gaCode.trim()
		const data = {
			phone: phone.trim(),
			p: p.trim(),
			p1: p1.trim(),
			ga_code: gaCodeTrimmed
		}
		console.log('忘记密码 - 请求参数:', JSON.stringify(data, null, 2))
		console.log('谷歌验证码值:', gaCodeTrimmed, '类型:', typeof gaCodeTrimmed, '长度:', gaCodeTrimmed.length)
		// 检查参数是否都有效
		if (!data.phone || !data.p || !data.p1 || !data.ga_code) {
			console.error('忘记密码 - 参数验证失败:', {
				phone: data.phone,
				p: data.p,
				p1: data.p1,
				ga_code: data.ga_code
			})
			return showToast('error', '请填写完整信息')
		}
		uni.showLoading()
		HomeApi.agencyForget(data).then(res => {
			if (res.code === 200) {
				const resultData = res.data
				if (resultData.ResultType === 4) {
					return showToast('error', '谷歌验证码不正确')
				}
				uni.showModal({
					title: '提示',
					content: '修改密码成功，是否立即登录？',
					success: function(res) {
						if (res.confirm) {
							console.log('用户点击了确认');
							HomeApi.agencyLogin({
								phone: agencyRegVo.phone,
								pwd: agencyRegVo.p
							}).then(res => {
								if (res.code === 200) {
									const data = res.data
									const token = data.Token
									authStore.setToken(token)
									authStore.setUserId(data.UserInfo.UserId)
									if (pageFlag.value === '2') {
										uni.navigateTo({
											url: '/pages/master-index/master-index'
										});
									}
									// 商家版已移除，注释掉商家版跳转逻辑
									// else if (pageFlag.value === '1') {
									// 	uni.switchTab({
									// 		url: '/pages/shop/shop'
									// 	});
									// }
								}
							})
						}
					}
				});
			} else {
				const errorMsg = res.message || res.msg || '修改密码失败'
				showToast('error', errorMsg)
			}
		}).catch(err => {
			console.error('忘记密码失败:', err)
			showToast('error', '修改密码失败，请检查网络连接')
		}).finally(() => {
			uni.hideLoading()
		})
	}
</script>

<style scoped lang="scss">
	.mLogin {
		min-height: 100vh;
		padding-top: calc(env(safe-area-inset-top) + 88rpx);
		box-sizing: border-box;

		.top-bar {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			padding: calc(env(safe-area-inset-top) + 12rpx) 32rpx 12rpx;
			background: #fff;
			z-index: 100;
		}

		.back-text {
			font-size: 32rpx;
			color: #333;
			line-height: 48rpx;
		}

		.textOne {
			font-weight: 500;
			font-size: 38rpx;
			color: #333333;
			margin: 64rpx 0 12rpx 46rpx;
		}

		.textTwo {
			font-weight: 400;
			font-size: 32rpx;
			color: #333333;
			margin-left: 46rpx;
		}

		.inputBox {
			width: 650rpx;
			height: 90rpx;
			background: #FFFFFF;
			border-radius: 12rpx;
			border: 1rpx solid #DFDFDF;
			display: flex;
			flex-direction: row;
			align-items: center;
			margin-left: 50rpx;

			.phone-img {
				width: 32rpx;
				height: 32rpx;
				margin-left: 30rpx;
				margin-right: 12rpx;
			}
		}

		.phone {
			margin-top: 80rpx;
		}

		.passWord {
			margin-top: 40rpx;
		}

		.regBut {
			width: 650rpx;
			height: 90rpx;
			background-color: #FACC05;
			border-radius: 12rpx;
			color: #000000;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			margin: 60rpx 50rpx 0;
		}

		.loginBut {
			width: 650rpx;
			height: 90rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			margin: 10rpx 50rpx 0;
		}

		.footer {
			margin: 40rpx 50rpx 0;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;

			.footerText {
				font-size: 28rpx;
				color: #333333;
			}
		}
	}
</style>