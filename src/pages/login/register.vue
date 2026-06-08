<template>
	<view class="mLogin">
		<wd-navbar left-text="返回" left-arrow @click-left="handleClickLeft"></wd-navbar>
		<view class="textOne">HI～ 您好！</view>
		<view class="textTwo">欢迎注册小柠檬{{pageText}}</view>
		<view class="phone">
			<inputItem v-model:title="agencyRegVo.phone" placeholderText="请输入手机号"
				imgSrc="../../static/choose/phone.png" />
			<!-- 商家版已移除，只保留运营端邀请码 -->
			<inputItem v-model:title="agencyRegVo.codeOrTeamId" placeholderText="请输入邀请码"
				imgSrc="../../static/choose/ids.png" />
			<!-- <inputItem v-model:title="agencyRegVo.codeOrTeamId" :placeholderText="pageFlag == 1 ? '请输入团队ID' : '请输入邀请码'"
				imgSrc="../../static/choose/ids.png" /> -->
			<inputItem v-model:title="agencyRegVo.p" placeholderText="请输入密码" imgSrc="../../static/choose/mima.png" />
			<inputItem v-model:title="agencyRegVo.p1" placeholderText="请再次输入密码" imgSrc="../../static/choose/mima.png" />
		</view>
		<view class="regBut" @tap="register">注册</view>
		<view class="loginBut" @tap="toLogin">去登录</view>
		<view class="online-service" @tap="openOnlineService">在线客服</view>
		
	</view>
</template>

<script setup lang="ts">
	import { onLoad, onBackPress } from '@dcloudio/uni-app';
	import { ref, reactive } from 'vue';
	import { useAuthStore } from '@/store/auth.ts'
	import { HomeApi } from '@/api/home';
	import { openOnlineService } from '@/utils/onlineService';

	const authStore = useAuthStore()
	const pageText = ref('');
	const pageFlag = ref('');

	onLoad((e) => {
		// 商家版已移除，只保留运营端
		pageText.value = '运营端'
		pageFlag.value = e.peageFlag || '2' // 默认运营端
		// pageText.value = e.peageFlag === '1' ? '商家端' : '运营端'
		// pageFlag.value = e.peageFlag
	})
	
	const handleClickLeft = () => {
		// 返回到登录页面，使用 slide-in-left 动画（新页面从左侧滑入，当前页面向右滑出）
		uni.navigateTo({
			url: '/pages/login/merchantLogin?peageFlag=' + pageFlag.value,
			animationType: 'slide-in-left',
			animationDuration: 300
		});
	}
	
	// 拦截系统返回键，返回到登录页面
	onBackPress(() => {
		handleClickLeft()
		return true // 拦截默认返回行为
	})
	
	const toLogin = () => {
		uni.navigateTo({
			url: '/pages/login/merchantLogin?peageFlag=' + pageFlag.value
		});
	}

	// 声明一个响应式对象
	const agencyRegVo = reactive({
		phone: '',
		codeOrTeamId: '',
		p: '',
		p1: ''
	});

	const showToast = (type : string, title : string) => {
		uni.showToast({
			title: title,
			icon: type, // error success
			duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
			mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
		});
	}

	const register = () => {
		if (!agencyRegVo.phone) {
			return showToast('error', '手机号不能为空')
		}
		if (!agencyRegVo.codeOrTeamId) {
			return showToast('error', '请填写邀请码')
			// 商家版已移除
			// return showToast('error', pageFlag.value == 1 ? '请填写团队ID' : '请填写邀请码')
		}
		if (!agencyRegVo.p) {
			return showToast('error', '请填写密码')
		} else if (!agencyRegVo.p1) {
			return showToast('error', '请确认密码')
		} else if (agencyRegVo.p != agencyRegVo.p1) {
			return showToast('error', '两次密码不一致')
		}
		uni.showLoading()
		HomeApi.agencyreg(agencyRegVo).then(res1 => {
			uni.hideLoading()
			if (res1.code === 200) {
				if (res1.data.ResultType === 5 || res1.data.ResultType === 0) {
					showToast('success', '注册成功')
					// 注册成功后跳转到登录页面，并传递账号密码参数
					setTimeout(() => {
						uni.redirectTo({
							url: '/pages/login/merchantLogin?peageFlag=' + pageFlag.value + '&autoPhone=' + encodeURIComponent(agencyRegVo.phone) + '&autoPwd=' + encodeURIComponent(agencyRegVo.p)
						});
					}, 500)
				} else {
					const errorMsg = res1.data.Message || res1.data.message || '注册失败'
					showToast('error', errorMsg)
				}
			} else {
				const errorMsg = res1.message || res1.msg || '注册失败'
				showToast('error', errorMsg)
			}
		}).catch(err => {
			uni.hideLoading()
			console.error('注册失败:', err)
			// 删除网络连接错误提示，避免与后端返回的错误信息重复
		})
	}
</script>

<style scoped lang="scss">
	::v-deep .wd-navbar.is-border[data-v-605aecd5]::after {
		background: transparent !important;
	}

	.mLogin {
		min-height: 100vh;
		padding-top: 88rpx;
		box-sizing: border-box;

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

		.online-service {
			width: 650rpx;
			height: 72rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			margin: 4rpx 50rpx 0;
			color: #333333;
			font-size: 28rpx;
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