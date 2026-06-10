<template>

	<view class="mLogin">

		<view class="top-bar" @tap="goBack">

			<text class="back-text">‹ 返回登录</text>

		</view>

		<view class="textOne">HI～ 您好！</view>

		<view class="textTwo">欢迎注册青柠助手{{ pageText }}</view>

		<view v-if="!hasAutoInvite" class="invite-tip">注册需填写邀请码或团队ID（可向管理员索取）</view>

		<view class="phone">

			<inputItem v-model:title="agencyRegVo.phone" type="phone" placeholderText="请输入手机号"
				imgSrc="../../static/choose/phone.png" @replaceStr="syncPhone" />
			<inputItem v-if="showInviteInput" v-model:title="agencyRegVo.codeOrTeamId" type="invite"
				placeholderText="请输入邀请码或团队ID" imgSrc="../../static/choose/ids.png" @replaceStr="syncInviteCode" />
			<inputItem v-model:title="agencyRegVo.p" type="password" placeholderText="请输入密码"
				imgSrc="../../static/choose/mima.png" @replaceStr="syncPassword" />
			<inputItem v-model:title="agencyRegVo.p1" type="password" placeholderText="请再次输入密码"

				imgSrc="../../static/choose/mima.png" @replaceStr="syncPasswordConfirm" />

		</view>

		<PrivacyAgreeBar v-model="privacyAgreed" />

		<view class="regBut" @tap="register">注册</view>

		<view class="loginBut" @tap="toLogin">去登录</view>

		<view class="online-service" @tap="openOnlineService">在线客服</view>

	</view>

</template>



<script setup lang="ts">

import { onLoad } from '@dcloudio/uni-app'

import { ref, reactive, computed } from 'vue'

import { HomeApi } from '@/api/home'

import { openOnlineService } from '@/utils/onlineService'
import inputItem from '@/components/inputItem.vue'

import { ensureApiLineConfig } from '@/utils/ensureApiLine'

import { extractApiErrorMessage, getApiData, isApiSuccess } from '@/utils/apiMessage'

import { HIDE_REGISTER_INVITE_INPUT } from '@/config/registerConfig'

import {

	getCachedRegisterInviteCode,

	hasAutoRegisterInviteCode,

	resolveRegisterInviteCode

} from '@/utils/registerInvite'
import { clearAuthSession } from '@/utils/authSession'
import PrivacyAgreeBar from '@/components/PrivacyAgreeBar.vue'
import { ensureLoginPrivacyAgreed } from '@/utils/privacyConsent'



const pageText = ref('')

const pageFlag = ref('')

const hasAutoInvite = ref(false)
const privacyAgreed = ref(false)

const showInviteInput = computed(() => !HIDE_REGISTER_INVITE_INPUT || !hasAutoInvite.value)



const agencyRegVo = reactive({

	phone: '',

	codeOrTeamId: '',

	p: '',

	p1: ''

})



const applyAutoInviteCode = () => {

	const autoCode = getCachedRegisterInviteCode()

	hasAutoInvite.value = hasAutoRegisterInviteCode(agencyRegVo.codeOrTeamId)

	if (autoCode && !agencyRegVo.codeOrTeamId.trim()) {

		agencyRegVo.codeOrTeamId = autoCode

		hasAutoInvite.value = true

	}

}



onLoad((e) => {
	pageText.value = '运营端'
	pageFlag.value = e.peageFlag || '2'
	clearAuthSession()
	ensureApiLineConfig()
	applyAutoInviteCode()
})



const goBack = () => {
	uni.redirectTo({ url: '/pages/login/merchantLogin?peageFlag=' + pageFlag.value })
}



const toLogin = () => {

	goBack()

}



const syncPhone = (val: string) => { agencyRegVo.phone = val }

const syncInviteCode = (val: string) => { agencyRegVo.codeOrTeamId = val }

const syncPassword = (val: string) => { agencyRegVo.p = val }

const syncPasswordConfirm = (val: string) => { agencyRegVo.p1 = val }



const showToast = (type: string, title: string) => {

	uni.showToast({ title, icon: type, duration: 2000, mask: false })

}



const buildRegisterPayload = () => {

	const inviteCode = resolveRegisterInviteCode(agencyRegVo.codeOrTeamId)

	const payload: Record<string, unknown> = {

		phone: String(agencyRegVo.phone || '').trim(),

		p: agencyRegVo.p,

		p1: agencyRegVo.p1,

		is_boss: false,

	}

	if (/^\d+$/.test(inviteCode)) {

		payload.codeOrTeamId = Number(inviteCode)

	} else {

		payload.codeOrTeamId = inviteCode

	}

	return payload

}



const register = () => {

	if (!ensureLoginPrivacyAgreed(privacyAgreed.value)) {

		return

	}

	if (!agencyRegVo.phone.trim()) {

		return showToast('error', '手机号不能为空')

	}

	if (!resolveRegisterInviteCode(agencyRegVo.codeOrTeamId)) {

		uni.showModal({

			title: '需要邀请码',

			content: '请填写邀请码或团队ID；若仅测试应用，请点「去登录」使用已有账号。',

			showCancel: false,

			confirmText: '知道了'

		})

		return

	}

	if (!agencyRegVo.p) return showToast('error', '请填写密码')

	if (!agencyRegVo.p1) return showToast('error', '请确认密码')

	if (agencyRegVo.p != agencyRegVo.p1) return showToast('error', '两次密码不一致')



	ensureApiLineConfig()

	uni.showLoading({ title: '注册中', mask: true })

	HomeApi.agencyreg(buildRegisterPayload()).then(res1 => {

		uni.hideLoading()

		const body = (res1 || {}) as Record<string, unknown>

		if (!isApiSuccess(body)) {

			showToast('error', extractApiErrorMessage(body, '注册失败'))

			return

		}

		const result = getApiData<Record<string, unknown>>(body)

		const resultType = result?.ResultType ?? result?.resultType

		if (resultType === 5 || resultType === 0 || resultType === '5' || resultType === '0') {
			showToast('success', '注册成功')
			clearAuthSession()
			setTimeout(() => {

				uni.redirectTo({

					url: '/pages/login/merchantLogin?peageFlag=' + pageFlag.value

						+ '&autoPhone=' + encodeURIComponent(agencyRegVo.phone)

						+ '&autoPwd=' + encodeURIComponent(agencyRegVo.p)

				})

			}, 500)

			return

		}

		showToast('error', String(result?.Message || result?.message || '注册失败'))

	}).catch(err => {

		uni.hideLoading()

		console.error('注册失败:', err)

		const msg = err instanceof Error ? err.message : String(err)

		if (msg && !msg.includes('请求失败')) showToast('error', msg)

	})

}

</script>



<style scoped lang="scss">

.mLogin {

	min-height: 100vh;

	padding-top: 12rpx;

	box-sizing: border-box;

}



.top-bar {

	padding: 16rpx 32rpx 8rpx;

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

	margin: 32rpx 0 12rpx 46rpx;

}



.textTwo {

	font-size: 32rpx;

	color: #333333;

	margin-left: 46rpx;

}



.invite-tip {

	margin: 24rpx 46rpx 0;

	font-size: 24rpx;

	color: #999;

	line-height: 1.5;

}



.phone {

	margin-top: 48rpx;

}



.regBut {

	width: 650rpx;

	height: 90rpx;

	background-color: #FACC05;

	border-radius: 12rpx;

	color: #000000;

	display: flex;

	align-items: center;

	justify-content: center;

	margin: 60rpx 50rpx 0;

}



.loginBut,

.online-service {

	width: 650rpx;

	height: 72rpx;

	display: flex;

	align-items: center;

	justify-content: center;

	margin: 10rpx 50rpx 0;

	color: #333333;

	font-size: 28rpx;

}

</style>


