<template>
	<view class="mLogin">
		<view class="top-bar" :style="{ paddingTop: (systemBarHeight + 8) + 'px' }" @tap="handleClickLeft">
			<text class="back-text">‹ 返回上一页</text>
		</view>
		<view class="textOne">HI～ 您好！</view>
		<view class="textTwo">欢迎登录青柠助手{{pageText}}</view>
		<view class="login-card">
			<view class="login-tabs">
				<view class="login-tab-item" :class="{ active: loginParams.loginMode === 'password' }"
					@tap="switchLoginMode('password')">
					账号密码登录
				</view>
				<view class="login-tab-item" :class="{ active: loginParams.loginMode === 'ga' }"
					@tap="switchLoginMode('ga')">
					谷歌验证码登录
				</view>
			</view>
			<view class="phone">
				<inputItem v-model:title="loginParams.phone" type="account" :placeholderText="'请输入账号或手机号'"
					:imgSrc="'../../static/choose/phone.png'" @replaceStr="replaceStr" />
				<inputItem v-model:title="loginParams.pwd" :type="loginParams.loginMode === 'ga' ? 'digit' : 'password'"
					:placeholderText="loginParams.loginMode === 'ga' ? '请输入腾讯令牌验证码' : '请输入密码'"
					:imgSrc="'../../static/choose/mima.png'" @replaceStr="replacePassWordStr" />
				<!-- 账号密码登录模式下，账号密码校验通过且需要谷歌验证码时，显示6位验证码输入框 -->
				<inputItem v-if="loginParams.loginMode === 'password' && needGaCode"
					v-model:title="loginParams.gaCode"
					type="digit"
					:placeholderText="'请输入腾讯令牌6位验证码'"
					:imgSrc="'../../static/choose/mima.png'"
					@replaceStr="replaceGaCode" />
				<inputItem v-if="phoneState" v-model:title="loginParams.bind_phone" type="phone" :placeholderText="'请输入手机号'"
					:imgSrc="'../../static/choose/mima.png'" @replaceStr="replacePhone" />
				<view v-if="phoneState" style="position: relative;">
					<inputItem v-model:title="loginParams.code" type="digit" :yzmFlage="true" :timenum="timenum2"
						:placeholderText="'请输入验证码'" :imgSrc="'../../static/choose/mima.png'" @replaceStr="replaceCode"
						@changeStr="getCode" />
				</view>
			</view>
		</view>
		<view class="line-select">
			<wd-radio-group v-model="loginParams.lineType" shape="dot" checked-color="#FACC05" class="line-radio-group">
				<view class="line-radio-row">
					<view class="line-radio-item">
						<wd-radio name="default" value="default">默认线路</wd-radio>
					</view>
					<view class="line-radio-item">
						<wd-radio name="backup" value="backup">备用线路</wd-radio>
					</view>
				</view>
				<view class="line-radio-row">
					<view class="line-radio-item">
						<wd-radio name="international" value="international">国际线路</wd-radio>
					</view>
					<view class="line-radio-item">
						<wd-radio name="custom" value="custom">自定义线路</wd-radio>
					</view>
				</view>
			</wd-radio-group>
			<!-- 自定义线路输入框 -->
			<view v-if="loginParams.lineType === 'custom'" class="custom-line-inputs">
				<view class="custom-input-item">
					<view class="custom-input-label">默认接口地址:</view>
					<view class="custom-input-wrapper">
						<wd-input v-model="loginParams.customDefaultUrl" 
							placeholder="请输入默认接口地址" 
							no-border 
							class="custom-input" />
					</view>
				</view>
				<!-- <view class="custom-input-item" v-if="false">
					<view class="custom-input-label">搬菜接口地址:</view>
					<view class="custom-input-wrapper">
						<wd-input v-model="loginParams.customMoveUrl" 
							placeholder="请输入搬菜接口地址" 
							no-border 
							class="custom-input" />
					</view>
				</view> -->
				<!-- <view class="custom-input-item">
					<view class="custom-input-label">批量改价接口地址:</view>
					<view class="custom-input-wrapper">
						<wd-input v-model="loginParams.customBatchPriceUrl" 
							placeholder="请输入批量改价接口地址" 
							no-border 
							class="custom-input" />
					</view>
				</view> -->
			</view>
		</view>
		<PrivacyAgreeBar v-model="privacyAgreed" />
		<view class="loginBut" hover-class="loginBut-hover" @tap="toLogin">登录</view>
		<view class="footer">
			<view class="footerText" @tap="forget">忘记密码？</view>
			<view class="footerText" @tap="openOnlineService">在线客服</view>
			<view class="footerText" @tap="toReg">立即注册</view>
		</view>
		
		<!-- 谷歌验证器绑定二维码弹窗 -->
		<view v-if="showGaBindModal" class="ga-bind-modal-mask" @click="closeGaBindModal">
			<view class="ga-bind-modal" @click.stop>
				<view class="ga-bind-modal-header">
					<view class="ga-bind-modal-title">绑定腾讯令牌</view>
					<view class="ga-bind-modal-close" @click="closeGaBindModal">×</view>
				</view>
				<view class="ga-bind-modal-content">
					<view class="ga-tip-text">
						请使用微信小程序搜索：<text class="ga-tip-red">腾讯身份验证器</text>    
						<br>扫描下方二维码绑定腾讯令牌
					</view>
					<view class="ga-secret-section" v-if="gaSecret">
						<view class="ga-secret-label">如果无法扫描,请手动输入密钥:</view>
						<view class="ga-secret-text">{{ gaSecret }}</view>
					</view>
					<view v-if="gaQrUrl" class="ga-qr-code-wrapper">
						<image 
							:src="gaQrUrl" 
							mode="aspectFit" 
							class="ga-qr-code-image"
							@error="handleQrImageError"
							@load="handleQrImageLoad" />
					</view>
					<view v-else class="ga-qr-code-wrapper">
						<view class="ga-qr-code-placeholder">二维码加载中...</view>
					</view>
					<view class="ga-tutorial-btn-wrapper">
						<view class="ga-tutorial-btn" @click="showTutorialImage">绑定腾讯令牌教程</view>
					</view>
				</view>
				<view class="ga-bind-modal-footer">
					<view class="ga-bind-modal-btn-row">
					<view class="ga-bind-modal-btn-save" @click="saveQrCodeToAlbum">保存图片</view>
						<view class="ga-bind-modal-btn-confirm" @click="confirmGaBind">我已绑定</view>
					</view>
				</view>
			</view>
		</view>
		
		<!-- 教程图片弹窗（置顶显示） -->
		<view v-if="showTutorialModal" class="ga-tutorial-modal-mask" @click="closeTutorialModal">
			<view class="ga-tutorial-modal" @click.stop>
				<view class="ga-tutorial-modal-header">
					<view class="ga-tutorial-modal-title">绑定二维码教程</view>
					<view class="ga-tutorial-modal-close" @click="closeTutorialModal">×</view>
				</view>
				<view class="ga-tutorial-modal-content">
					<!-- #ifdef MP-WEIXIN -->
					<image 
						src="../../static/img/bind-sm.jpg" 
						mode="widthFix" 
						class="ga-tutorial-image"
						@error="handleTutorialImageError"
						@load="handleTutorialImageLoad" />
					<!-- #endif -->
					<!-- #ifndef MP-WEIXIN -->
					<image 
						src="../../static/img/bind.png" 
						mode="widthFix" 
						class="ga-tutorial-image"
						@error="handleTutorialImageError"
						@load="handleTutorialImageLoad" />
					<!-- #endif -->
				</view>
				<view class="ga-tutorial-modal-footer">
					<view class="ga-tutorial-modal-btn" @click="saveTutorialImageToAlbum">保存图片</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad,
		onShow,
		onBackPress
	} from '@dcloudio/uni-app';
	import {
		reactive,
		ref,
		nextTick
	} from 'vue';
	import { useAuthStore } from '@/store/auth.ts'
	import { HomeApi } from '@/api/home';
	import { getLineApiUrl } from '@/config/lineConfig';
	import { saveRegisterInviteCode } from '@/utils/registerInvite'
	import { applyAuthSession, clearAuthSession } from '@/utils/authSession';
	import { openOnlineService } from '@/utils/onlineService';
	import PrivacyAgreeBar from '@/components/PrivacyAgreeBar.vue';
	import inputItem from '@/components/inputItem.vue';
	import { ensureLoginPrivacyAgreed } from '@/utils/privacyConsent';
	import { isAuditLoginPhone } from '@/config/auditLoginConfig';
	import { ensureApiLineConfig } from '@/utils/ensureApiLine';
	import { goAppHome } from '@/utils/mpHome';

	const pageText = ref('')
	const pageFlag = ref('')
	const authStore = useAuthStore()
	const systemBarHeight = ref(0)
	let loginParams = reactive({
		phone: '',
		pwd: '',
		bind_phone: '',
		code: '',
		gaCode: '',
		loginMode: 'password', // 登录方式：password 账号密码登录，ga 谷歌验证码登录
		lineType: 'default', // 默认线路
		customDefaultUrl: '', // 自定义线路-默认接口地址
		customMoveUrl: '', // 自定义线路-搬菜接口地址
		customBatchPriceUrl: '' // 自定义线路-批量改价接口地址
	})
	const phoneState = ref(false)
	// 是否已通过账号密码校验且需要输入谷歌验证码
	const needGaCode = ref(false)
	const timenum2 = ref(0)
	let timer2 = null
	// 谷歌验证器绑定弹窗相关
	const showGaBindModal = ref(false)
	const gaQrUrl = ref('')
	const gaSecret = ref('')
	const gaFirstCode = ref('')
	// 是否已经显示过二维码弹窗（用于防止重复弹窗）
	const hasShownGaBindModal = ref(false)
	// 教程图片弹窗相关
	const showTutorialModal = ref(false)
	const privacyAgreed = ref(false)

	onLoad((e) => {
		ensureApiLineConfig()
		getSysteminfo()
		// 商家版已移除，只保留运营端
		pageText.value = '运营端'
		// pageText.value = e.peageFlag === '1' ? '商家端' : '运营端'
		pageFlag.value = e.peageFlag
		// 从本地存储读取之前选择的线路，如果没有则使用默认线路
		const savedLineType = uni.getStorageSync('lineType')
		if (savedLineType) {
			loginParams.lineType = savedLineType
			// 如果是自定义线路，读取保存的自定义接口地址
			if (savedLineType === 'custom') {
				const savedCustomUrls = uni.getStorageSync('customLineUrls')
				if (savedCustomUrls) {
					loginParams.customDefaultUrl = savedCustomUrls.defaultUrl || ''
					loginParams.customMoveUrl = savedCustomUrls.moveUrl || ''
					loginParams.customBatchPriceUrl = savedCustomUrls.batchPriceUrl || ''
				}
			}
		}
		// 如果是从注册页面跳转过来的，自动填充账号密码
		if (e.autoPhone) {
			loginParams.phone = decodeURIComponent(e.autoPhone)
		}
		if (e.autoPwd) {
			loginParams.pwd = decodeURIComponent(e.autoPwd)
		}
	})

	const replaceStr = (data) => {
		nextTick(() => {
			loginParams.phone = data
		})
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const switchLoginMode = (mode) => {
		if (loginParams.loginMode === mode) return
		loginParams.loginMode = mode
		// 切换登录方式时清空密码/验证码输入，避免混淆
		loginParams.pwd = ''
		loginParams.gaCode = ''
		needGaCode.value = false
	}
	const getCode = () => {
		if (!loginParams.phone) {
			return showToast('error', '请输入账号')
		}
		if (!loginParams.pwd) {
			return showToast('error', '密码未输入')
		}
		if (!loginParams.bind_phone) {
			return showToast('error', '请输入手机号')
		}
		const {
			phone,
			pwd,
			bind_phone
		} = loginParams
		let params = {
			phone,
			pwd,
			bind_phone
		}
		// 根据选择的线路获取对应的API地址
		let apiUrl = ''
		if (loginParams.lineType === 'custom') {
			// 自定义线路使用用户输入的默认接口地址
			if (!loginParams.customDefaultUrl) {
				return showToast('error', '请输入默认接口地址')
			}
			apiUrl = loginParams.customDefaultUrl.trim()
			if (!apiUrl.endsWith('/')) {
				apiUrl += '/'
			}
		} else {
			apiUrl = getLineApiUrl(loginParams.lineType)
		}
		uni.request({
			url: apiUrl + 'admin/agencylogin',
			method: 'post',
			data: params,
			header: {
				'Content-Type': 'application/json' //自定义请求头信息
			},
			success: (res) => {
				if (res.data.code === 200) {
					if (res.data.data.ResultType == 4) {
						showToast('success', '验证码已发送')
						if (timenum2.value > 0) {
							return;
						}
						timenum2.value = 60;
						timer2 = setInterval(() => {
							// const sec = --this.timenum >= 10 ? this.timenum.toString() : `0${this.timenum}`
							--timenum2.value;
							if (timenum2.value <= 0) {
								clearInterval(timer2)
								timer2 = null
							}
						}, 1000)
					}
				}
			},
			fail: (err) => {
				// console.log(err, 'err')
			}
		});
	}
	const replacePassWordStr = (data) => {
		nextTick(() => {
			loginParams.pwd = data
		})
	}
	const replaceGaCode = (data) => {
		nextTick(() => {
			loginParams.gaCode = data
		})
	}
	const replacePhone = (data) => {
		nextTick(() => {
			loginParams.bind_phone = data
		})
	}
	const replaceCode = (data) => {
		nextTick(() => {
			loginParams.code = data
		})
	}
	const forget = () => {
		uni.navigateTo({
			url: '/pages/login/forgetPassword?peageFlag=' + pageFlag.value
		});
	}
	const toReg = () => {
		uni.redirectTo({
			url: '/pages/login/register?peageFlag=' + pageFlag.value
		});
	}

	const cacheLoginInviteCode = (data) => {
		if (!data) return
		const invite = data.Invite_Code ?? data.invite_Code ?? data.InviteCode ?? data.inviteCode
		const team = data.Team_Id ?? data.team_Id ?? data.TeamId ?? data.teamId
		saveRegisterInviteCode(invite ?? team)
	}

	const completePasswordLogin = (data, successMessage = '登录成功') => {
		if (!data?.Token) {
			showErrorModal('登录失败：未获取到有效凭证，请联系管理员')
			return false
		}
		applyAuthSession(data.Token, data.UserInfo?.UserId)
		cacheLoginInviteCode(data)
		uni.setStorage({
			key: 'loginParams',
			data: { phone: loginParams.phone },
			success: function() {}
		})
		showToast('success', successMessage)
		if (pageFlag.value === '2') goAppHome()
		return true
	}

	const shouldCompleteDirectLogin = (data, phone = loginParams.phone) => {
		if (!data?.Token) {
			return false
		}
		if (isAuditLoginPhone(phone)) {
			return true
		}
		const resultType = data.ResultType
		if (resultType === 6 || resultType === '6') {
			return false
		}
		if (resultType === 4 || resultType === '4') {
			return false
		}
		if (data.RequireGoogleAuthenticator === true) {
			return false
		}
		return true
	}

	const shouldForceGoogleAuthenticatorFlow = (data, phone = loginParams.phone) => {
		if (isAuditLoginPhone(phone)) {
			return false
		}
		if (shouldCompleteDirectLogin(data, phone)) {
			return false
		}
		const resultType = data?.ResultType
		return resultType === 7 || resultType === '7'
			|| resultType === 8 || resultType === '8'
			|| data?.RequireGoogleAuthenticator === true
	}

	const showToast = (type, title) => {
		// 对于较长的文本，使用 icon: 'none' 来显示更多内容，并增加显示时长
		const isLongText = title && title.length > 8;
		uni.showToast({
			title: title,
			icon: isLongText ? 'none' : type, // 长文本使用 none（不显示图标），可以显示更多文字
			duration: isLongText ? 3000 : 2000, // 长文本显示3秒，给用户更多时间阅读
			mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
		});
	}

	// 关闭谷歌验证器绑定弹窗
	const closeGaBindModal = () => {
		showGaBindModal.value = false
		// 关闭弹窗时，检查用户是否已绑定
		// 如果用户扫码绑定后关闭弹窗，应该检测到已绑定并显示验证码输入框
		// 如果用户未绑定就关闭弹窗，再次登录时会重新检测
		checkGaBindStatus()
	}

	// 确认已绑定谷歌验证器
	const confirmGaBind = () => {
		showGaBindModal.value = false
		// 用户点击"我已绑定"后，检查用户是否真的已绑定
		checkGaBindStatus()
	}

	// 检查用户是否已绑定谷歌验证器
	const checkGaBindStatus = () => {
		const { phone, pwd } = loginParams
		let apiUrl = ''
		if (loginParams.lineType === 'custom') {
			apiUrl = loginParams.customDefaultUrl.trim()
			if (!apiUrl.endsWith('/')) {
				apiUrl += '/'
			}
		} else {
			apiUrl = getLineApiUrl(loginParams.lineType)
		}

		// 重新调用 AgencyLogin 接口，根据返回的 ResultType 判断绑定状态
		// 这样更准确，因为 BindGoogleAuthenticatorOnLogin 在已绑定时也可能返回二维码
		const pwdParams = phoneState.value
			? { phone, pwd, bind_phone: loginParams.bind_phone, bind_phone_code: loginParams.code }
			: { phone, pwd }
		
		uni.request({
			url: apiUrl + 'admin/agencylogin',
			method: 'post',
			data: pwdParams,
			header: { 'Content-Type': 'application/json' },
			success: (res) => {
				if (res.data.code !== 200) {
					return showErrorModal(res.data.message || '账号或密码错误，请重新输入')
				}
				const data = res.data.data
				// console.log('重新检查绑定状态 - AgencyLogin 返回:', JSON.stringify(data, null, 2))

				if (shouldCompleteDirectLogin(data, phone)) {
					completePasswordLogin(data)
					return
				}
				
				// 根据 ResultType 判断
				if (data.ResultType === 7) {
					// 需要绑定
					// 如果已经显示过二维码弹窗，不再重复弹窗，而是提示用户先完成绑定
					if (hasShownGaBindModal.value) {
						// console.log('已经显示过二维码弹窗，提示用户先完成绑定')
						showErrorModal('请先完成绑定后再继续登录。如果已扫码绑定，请点击"我已绑定"按钮')
						return
					}
					
					// 需要绑定，获取二维码并显示弹窗
					// console.log('检测到需要绑定 Google Authenticator (ResultType === 7)')
					uni.request({
						url: apiUrl + 'Admin/BindGoogleAuthenticatorOnLogin',
						method: 'POST',
						data: { phone, pwd },
						header: { 'Content-Type': 'application/json' },
						success: (gaRes) => {
							if (gaRes.data && gaRes.data.code === 200 && gaRes.data.data) {
								const gaData = gaRes.data.data
								let qrUrl = gaData.QrCodeUrl || gaData.qrCodeUrl || gaData.QrCode || gaData.qrCode || 
										gaData.QrCodeImage || gaData.qrCodeImage || gaData.Image || gaData.image || gaData.OtpAuthUrl || gaData.otpAuthUrl || ''
								
								if (qrUrl) {
									if (qrUrl.startsWith('otpauth://')) {
										qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' + encodeURIComponent(qrUrl)
									} else if (!qrUrl.startsWith('http') && !qrUrl.startsWith('data:image')) {
										if (/^[A-Za-z0-9+/=]+$/.test(qrUrl)) {
											qrUrl = 'data:image/png;base64,' + qrUrl
										} else if (qrUrl.startsWith('/')) {
											qrUrl = apiUrl.replace(/\/$/, '') + qrUrl
										}
									}
									gaQrUrl.value = qrUrl
									gaSecret.value = gaData.SecretKey || gaData.secretKey || gaData.Key || gaData.key || ''
									gaFirstCode.value = gaData.FirstCode || gaData.firstCode || gaData.Code || gaData.code || ''
									hasShownGaBindModal.value = true
									showGaBindModal.value = true
									showToast('info', '请绑定腾讯令牌')
								} else {
									showErrorModal('获取二维码失败，请重试')
								}
							} else {
								showErrorModal('获取二维码失败，请重试')
							}
						},
						fail: () => {
							showErrorModal('获取二维码失败，请检查网络连接')
						}
					})
				} else if (data.ResultType === 8 || data.RequireGoogleAuthenticator === true) {
					// 已绑定，显示验证码输入框
					// console.log('检测到用户已绑定 Google Authenticator (ResultType === 8 或 RequireGoogleAuthenticator === true)')
					hasShownGaBindModal.value = false // 已绑定，重置标志
		needGaCode.value = true
					showToast('success', '请在下方输入腾讯令牌6位验证码')
				} else {
					// 其他情况，显示验证码输入框作为兜底
					// console.log('其他情况，显示验证码输入框')
					hasShownGaBindModal.value = false // 重置标志
					needGaCode.value = true
					showToast('success', '请在下方输入腾讯令牌6位验证码')
				}
			},
			fail: () => {
				// 接口失败，显示验证码输入框
				needGaCode.value = true
				showToast('success', '请在下方输入腾讯令牌6位验证码')
			}
		})
	}

	// 二维码图片加载成功
	const handleQrImageLoad = (e) => {
		// console.log('二维码图片加载成功:', gaQrUrl.value)
	}

	// 二维码图片加载失败
	const handleQrImageError = (e) => {
		// console.error('二维码图片加载失败:', gaQrUrl.value, e)
		showToast('error', '二维码图片加载失败，请检查网络或联系管理员')
	}

	// 显示教程图片弹窗
	const showTutorialImage = () => {
		showTutorialModal.value = true
	}

	// 关闭教程图片弹窗
	const closeTutorialModal = () => {
		showTutorialModal.value = false
	}

	// 保存二维码到相册
	const saveQrCodeToAlbum = () => {
		if (!gaQrUrl.value) {
			showToast('error', '二维码未生成，无法保存')
			return
		}
		
		// 如果是 otpauth:// 转换后的在线二维码，需要先下载
		if (gaQrUrl.value.startsWith('http')) {
			uni.downloadFile({
				url: gaQrUrl.value,
				success: (res) => {
					if (res.statusCode === 200) {
						saveImageToAlbum(res.tempFilePath)
					} else {
						showToast('error', '下载二维码失败')
					}
				},
				fail: () => {
					showToast('error', '下载二维码失败，请检查网络')
				}
			})
		} else {
			// base64 格式的图片
			saveImageToAlbum(gaQrUrl.value)
		}
	}

	// 保存教程图片到相册
	const saveTutorialImageToAlbum = () => {
		// #ifdef MP-WEIXIN
		const tutorialImg = '../../static/img/bind-sm.jpg'
		// #endif
		// #ifndef MP-WEIXIN
		const tutorialImg = '../../static/img/bind.png'
		// #endif
		uni.getImageInfo({
			src: tutorialImg,
			success: (res) => {
				saveImageToAlbum(res.path)
			},
			fail: () => {
				// 如果 getImageInfo 失败，尝试使用完整路径
				// #ifdef H5
				uni.downloadFile({
					url: '/static/img/bind.png',
					success: (downloadRes) => {
						if (downloadRes.statusCode === 200) {
							saveImageToAlbum(downloadRes.tempFilePath)
						} else {
							showToast('error', '保存图片失败，请重试')
						}
					},
					fail: () => {
						showToast('error', '保存图片失败，请检查权限设置')
					}
				})
				// #endif
				// #ifndef H5
				showToast('error', '保存图片失败，请重试')
				// #endif
			}
		})
	}

	// 保存图片到相册的通用函数
	const saveImageToAlbum = (filePath) => {
		uni.saveImageToPhotosAlbum({
			filePath: filePath,
			success: () => {
				showToast('success', '图片已保存到相册')
			},
			fail: (err) => {
				// console.error('保存图片失败:', err)
				if (err.errMsg && err.errMsg.includes('auth deny')) {
					uni.showModal({
						title: '提示',
						content: '需要您授权保存图片到相册',
						showCancel: false
					})
				} else {
					showToast('error', '保存图片失败，请检查权限设置')
				}
			}
		})
	}

	// 教程图片加载成功
	const handleTutorialImageLoad = () => {
		// console.log('教程图片加载成功')
	}

	// 教程图片加载失败
	const handleTutorialImageError = (e) => {
		// console.error('教程图片加载失败:', e)
		showToast('error', '教程图片加载失败')
	}

	// 统一的错误弹窗（用于密码 / 谷歌验证码错误等提示）
	const showErrorModal = (message) => {
		uni.showModal({
			title: '提示',
			content: message,
			showCancel: false
		})
	}

	const toLogin = async () => {
		if (!ensureLoginPrivacyAgreed(privacyAgreed.value)) {
			return
		}
		if (!pageFlag.value) {
			uni.showModal({
				title: '提示',
				content: '身份未选择',
				showCancel: false
			})
			setTimeout(() => {
				uni.navigateTo({
					url: '/pages/login/chooseUser'
				});
			}, 2000)
			return
		}
		if (!loginParams.phone) {
			return showToast('error', '手机号不能为空')
		}
		if (!loginParams.pwd) {
			return showToast('error', loginParams.loginMode === 'ga' ? '请输入谷歌验证码' : '密码未输入')
		}
		if (!loginParams.bind_phone && phoneState.value) {
			return showToast('error', '请输入手机号')
		}
		if (!loginParams.code && phoneState.value) {
			return showToast('error', '请输入验证码')
		}
		// 第二步：已要求输入谷歌验证码但用户还未输入
		if (loginParams.loginMode === 'password' && needGaCode.value && !loginParams.gaCode) {
			return showToast('error', '请输入谷歌验证码')
		}

		// 先根据线路算出当前使用的 API 基础地址
		let apiUrl = ''
		if (loginParams.lineType === 'custom') {
			if (!loginParams.customDefaultUrl) {
				return showToast('error', '请输入默认接口地址')
			}
			apiUrl = loginParams.customDefaultUrl.trim()
			if (!apiUrl.endsWith('/')) {
				apiUrl += '/'
			}
			uni.setStorageSync('customLineUrls', {
				defaultUrl: loginParams.customDefaultUrl,
				moveUrl: loginParams.customMoveUrl,
				batchPriceUrl: loginParams.customBatchPriceUrl
			})
		} else {
			apiUrl = getLineApiUrl(loginParams.lineType)
		}
		uni.setStorageSync('lineType', loginParams.lineType)
		uni.setStorageSync('apiBaseUrl', apiUrl)

		const { phone, pwd, bind_phone, code, gaCode } = loginParams

		// 1. 谷歌验证码登录标签：保持原来的逻辑
		// 注意：此接口只需要手机号和谷歌验证码，不需要密码
		// 参考PC版提交参数：{phone: "...", ga_code: "..."}
		if (loginParams.loginMode === 'ga') {
			if (!pwd || pwd.trim() === '') {
				return showToast('error', '请输入谷歌验证码')
			}
			// 使用小写下划线格式：phone 和 ga_code（与PC版一致）
			const params = { phone: phone, ga_code: pwd.trim() }
			// console.log('谷歌验证码登录 - 请求参数:', JSON.stringify(params, null, 2))
			// console.log('验证码值 pwd:', pwd, '类型:', typeof pwd, '长度:', pwd ? pwd.length : 0)
			uni.request({
				url: apiUrl + 'Admin/AgencyLoginByPhoneAndGaCode',
				method: 'post',
				data: params,
				header: { 'Content-Type': 'application/json' },
				success: (res) => {
					// console.log('谷歌验证码登录 - 返回结果:', JSON.stringify(res.data, null, 2))
					
					// 检查返回状态
					if (res.data.code !== 200) {
						const errorMsg = res.data.message || res.data.msg || '登录失败'
						// 根据错误信息判断是验证码错误还是未绑定
						if (errorMsg.includes('未绑定') || errorMsg.includes('绑定')) {
							return showErrorModal('您还未绑定腾讯令牌，请使用密码登录后进行绑定')
						} else if (errorMsg.includes('验证码') || errorMsg.includes('错误')) {
							return showErrorModal('令牌验证码错误，请重新输入')
						} else {
							return showErrorModal(errorMsg)
						}
					}
					
					// 检查数据和Token
					if (!res.data.data || !res.data.data.Token) {
						return showErrorModal('登录失败：未获取到有效凭证，请联系管理员')
					}
					
					const data = res.data.data
					const token = data.Token
					applyAuthSession(token, data.UserInfo?.UserId)
					cacheLoginInviteCode(data)
					uni.setStorage({
						key: 'loginParams',
						data: { phone },
						success: function() {}
					});
					
					showToast('success', '登录成功')
					
					if (pageFlag.value === '2') goAppHome();
					// 商家版已移除，注释掉商家版跳转逻辑
					// else if (pageFlag.value === '1') {
					// 	uni.switchTab({ url: '/pages/shop/shop' });
					// }
				},
				fail: (err) => {
					// console.error('谷歌验证码登录 - 请求失败:', err)
					showToast('error', '登录失败，请检查网络连接')
				}
			})
			return
		}

		// 2. 账号密码登录：如果已经显示验证码输入框且用户输入了验证码，则进行验证
		// 注意：只有在已经通过账号密码校验且检测到已绑定令牌的情况下，needGaCode 才会为 true
		if (loginParams.loginMode === 'password' && needGaCode.value && gaCode && gaCode.trim().length === 6) {
			const params = {
				phone,
				pwd,
				Code: gaCode
			}
			uni.request({
				url: apiUrl + 'Admin/VerifyGoogleAuthenticatorSetupOnLogin',
				method: 'post',
				data: params,
				header: { 'Content-Type': 'application/json' },
				success: (res) => {
					if (res.data.code !== 200 || !res.data.data || !res.data.data.Token) {
						return showErrorModal('谷歌验证码错误，请重新输入')
					}
					const data = res.data.data
					const token = data.Token
					applyAuthSession(token, data.UserInfo?.UserId)
					cacheLoginInviteCode(data)
					uni.setStorage({
						key: 'loginParams',
						data: { phone },
						success: function() {}
					});
					if (pageFlag.value === '2') goAppHome();
					// 商家版已移除，注释掉商家版跳转逻辑
					// else if (pageFlag.value === '1') {
					// 	uni.switchTab({ url: '/pages/shop/shop' });
					// }
				},
				fail: () => {
					showToast('error', '登录失败，请检查网络连接')
				}
			})
			return
		}

		// 第一步：只校验账号密码
		// 每次登录时都重置状态，确保重新检测绑定状态
		// 注意：不重置 hasShownGaBindModal，如果已经显示过二维码，需要用户先完成绑定
		needGaCode.value = false
		loginParams.gaCode = ''
		showGaBindModal.value = false
		
		const pwdParams = phoneState.value
			? { phone, pwd, bind_phone, bind_phone_code: code }
			: { phone, pwd }

		uni.request({
			url: apiUrl + 'admin/agencylogin',
			method: 'post',
			data: pwdParams,
			header: { 'Content-Type': 'application/json' },
			success: (res) => {
				if (res.data.code !== 200) {
					// 后端 message 一般会包含"账号或密码错误，剩余次数 X 次，将锁定"等提示
					return showErrorModal(res.data.message || '账号或密码错误，请重新输入')
				}
				const data = res.data.data
				// console.log('AgencyLogin 返回数据:', JSON.stringify(data, null, 2))
				
				// 保留原有手机绑定相关逻辑
				if (data.ResultType === 6) {
					phoneState.value = true
					return showToast('error', '请绑定手机号')
				}

				// 后端白名单/审核账号等：只要返回 Token 且无需令牌，直接登录
				if (shouldCompleteDirectLogin(data, phone)) {
					completePasswordLogin(data)
					return
				}

				if (!shouldForceGoogleAuthenticatorFlow(data, phone)) {
					if (data.Token) {
						completePasswordLogin(data)
					} else {
						showErrorModal('登录失败：未获取到有效凭证，请联系管理员')
					}
					return
				}

				// 根据 AgencyLogin 接口返回的 ResultType 判断绑定状态
				// ResultType === 7: 需要绑定GoogleAuthenticator，显示二维码弹窗
				// ResultType === 8 或 RequireGoogleAuthenticator === true: 已绑定，需要输入验证码，显示验证码输入框
				if (data.ResultType === 7) {
					// 需要绑定 Google Authenticator，调用 BindGoogleAuthenticatorOnLogin 获取二维码
					// console.log('检测到需要绑定 Google Authenticator (ResultType === 7)')
				uni.request({
						url: apiUrl + 'Admin/BindGoogleAuthenticatorOnLogin',
					method: 'POST',
						data: { phone, pwd },
						header: { 'Content-Type': 'application/json' },
					success: (gaRes) => {
							// console.log('BindGoogleAuthenticatorOnLogin 完整返回:', JSON.stringify(gaRes, null, 2))
							
						if (gaRes.data && gaRes.data.code === 200 && gaRes.data.data) {
							const gaData = gaRes.data.data
								// console.log('BindGoogleAuthenticatorOnLogin 返回的 data 字段:', Object.keys(gaData))
							
								// 尝试多种可能的字段名获取二维码
						let qrUrl = gaData.QrCodeUrl || gaData.qrCodeUrl || gaData.QrCode || gaData.qrCode || 
								gaData.QrCodeImage || gaData.qrCodeImage || gaData.Image || gaData.image || gaData.OtpAuthUrl || gaData.otpAuthUrl || ''
							
						if (qrUrl) {
							// 如果后端返回的是 otpauth:// 开头的绑定URI，需要自己生成二维码图片
							if (qrUrl.startsWith('otpauth://')) {
								// 使用公共二维码服务把 otpauth URI 转成二维码图片
								qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=' + encodeURIComponent(qrUrl)
							} else if (!qrUrl.startsWith('http') && !qrUrl.startsWith('data:image')) {
								// 如果二维码是base64字符串，添加前缀
								if (/^[A-Za-z0-9+/=]+$/.test(qrUrl)) {
									qrUrl = 'data:image/png;base64,' + qrUrl
								} else if (qrUrl.startsWith('/')) {
									// 相对路径，拼接完整URL
									qrUrl = apiUrl.replace(/\/$/, '') + qrUrl
							}
						}
							
							const secret = gaData.SecretKey || gaData.secretKey || gaData.Key || gaData.key || ''
							const firstCode = gaData.FirstCode || gaData.firstCode || gaData.Code || gaData.code || ''

									// console.log('未绑定腾讯令牌 - 二维码URL:', qrUrl)
									// console.log('未绑定腾讯令牌 - 密钥:', secret)
									// console.log('未绑定腾讯令牌 - 首次验证码:', firstCode)

							// 保存二维码和密钥信息到响应式变量
							gaQrUrl.value = qrUrl
							gaSecret.value = secret
							gaFirstCode.value = firstCode
							
									// 显示二维码弹窗，让用户绑定
									// 如果已经显示过二维码弹窗，不再重复弹窗，而是提示用户先完成绑定
									if (hasShownGaBindModal.value) {
										showErrorModal('请先完成绑定后再继续登录')
										return
									}
									hasShownGaBindModal.value = true
							showGaBindModal.value = true
									showToast('info', '请绑定腾讯令牌')
						} else {
									// 没有返回二维码，提示错误
									showErrorModal('获取二维码失败，请重试')
								}
							} else {
								// 获取二维码失败，提示错误
								showErrorModal('获取二维码失败，请重试')
							}
						},
						fail: (err) => {
							// console.log('BindGoogleAuthenticatorOnLogin 请求失败:', err)
							showErrorModal('获取二维码失败，请检查网络连接')
						}
					})
				} else if (data.ResultType === 8 || data.RequireGoogleAuthenticator === true) {
					// 已绑定，需要输入验证码，显示验证码输入框
					// console.log('检测到用户已绑定 Google Authenticator (ResultType === 8 或 RequireGoogleAuthenticator === true)')
					needGaCode.value = true
					showToast('success', '账号密码验证通过，请输入谷歌验证码')
				} else if (data.Token) {
					completePasswordLogin(data)
				} else {
					showErrorModal('登录失败：未获取到有效凭证，请联系管理员')
				}
			},
			fail: () => {
				showToast('error', '登录失败，请检查网络连接')
			}
		})
	}
	const handleClickLeft = () => {
		clearAuthSession()
		uni.reLaunch({
			url: '/pages/login/chooseUser',
			animationType: 'slide-in-left',
		});
	}

	onBackPress(() => {
		handleClickLeft()
		return true
	})
	onShow(() => {
		// uni.getStorage({
		// 	key: 'loginParams',
		// 	success: (res) => {
		// 		loginParams = res.data
		// 	}
		// });
	})
</script>

<style scoped lang="scss">
	.mLogin {
		min-height: 100vh;
		box-sizing: border-box;

		.top-bar {
			padding: 8px 32rpx 12rpx;
		}

		.back-text {
			font-size: 30rpx;
			color: #333;
			line-height: 48rpx;
		}

		.textOne {
			font-weight: 500;
			font-size: 38rpx;
			color: #333333;
			margin: 24rpx 0 12rpx 46rpx;
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

		/* 登录卡片和标签样式，接近网页端截图效果 */
		.login-card {
			margin: 60rpx 40rpx 0;
			padding: 10rpx 20rpx 30rpx;
			background-color: #F5F7FB;
			border-radius: 16rpx;
		}

		.login-tabs {
			display: flex;
			flex-direction: row;
			border-bottom: 2rpx solid #E5EAF5;
			margin: 0 10rpx 20rpx;
		}

		.login-tab-item {
			flex: 1;
			text-align: center;
			font-size: 30rpx;
			color: #666666;
			padding: 10rpx 0 18rpx;
			position: relative;
		}

		.login-tab-item.active {
			color: #2563EB;
			font-weight: 600;
		}

		.login-tab-item.active::after {
			content: '';
			position: absolute;
			left: 50%;
			bottom: -4rpx;
			transform: translateX(-50%);
			width: 60%;
			height: 4rpx;
			background-color: #2563EB;
			border-radius: 999rpx;
		}

		/* 登录卡片中的输入框宽度限制在卡片内，不使用全局 650rpx 宽度 */
		.login-card ::v-deep .inputBox {
			width: 100% !important;
			margin-left: 0 !important;
			box-sizing: border-box;
		}

		.login-card ::v-deep .inputBox .phone-img {
			margin-left: 24rpx;
		}

		.phone {
			margin-top: 20rpx;
		}

		.line-select {
			margin: 40rpx 50rpx 0;
			padding: 15rpx 20rpx;
			background: #FFFFFF;
			border-radius: 12rpx;
			border: 1rpx solid #DFDFDF;

			.line-select-title {
				font-size: 28rpx;
				color: #333333;
				margin-bottom: 15rpx;
				font-weight: 500;
			}

			::v-deep .line-radio-group {
				display: flex;
				flex-direction: column;
				gap: 0;
			}

			.line-radio-row {
				display: flex;
				flex-direction: row;
				justify-content: space-between;
				gap: 20rpx;
				margin-bottom: 8rpx;
				
				&:last-child {
					margin-bottom: 0;
				}
			}

			.line-radio-item {
				flex: 1;
				display: flex;
				justify-content: center;
				
				::v-deep .wd-radio {
					margin: 0;
					padding: 0;
				}
			}

			.custom-line-inputs {
				margin-top: 30rpx;
				padding-top: 30rpx;
				border-top: 1rpx solid #F0F0F0;

				.custom-input-item {
					margin-bottom: 30rpx;

					&:last-child {
						margin-bottom: 0;
					}

					.custom-input-label {
						font-size: 26rpx;
						color: #666666;
						margin-bottom: 15rpx;
						font-weight: 400;
					}

					.custom-input-wrapper {
						width: 100%;
						background: #FFFFFF;
						border-radius: 12rpx;
						border: 1rpx solid #DFDFDF;
						padding: 0 20rpx;
						box-sizing: border-box;
						min-height: 90rpx;
						display: flex;
						align-items: center;

						.custom-input {
							width: 100%;
							font-size: 28rpx;
						}
					}
				}
			}
		}

		.passWord {
			margin-top: 40rpx;
		}

		.loginBut {
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
			position: relative;
			z-index: 2;
		}

		.loginBut-hover {
			opacity: 0.85;
		}

		.isV2 {
			background-color: #F81C3A;
			color: #ffffff
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
				padding: 16rpx 8rpx;
			}
		}

		/* 谷歌验证器绑定弹窗样式 */
		.ga-bind-modal-mask {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.6);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 9999;
		}

		.ga-bind-modal {
			width: 600rpx;
			background-color: #FFFFFF;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.2);
		}

		.ga-bind-modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 30rpx 20rpx;
			border-bottom: 1rpx solid #F0F0F0;
		}

		.ga-bind-modal-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333333;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			flex: 1;
		}

		.ga-bind-modal-close {
			font-size: 48rpx;
			color: #999999;
			line-height: 1;
			cursor: pointer;
			width: 48rpx;
			height: 48rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.ga-bind-modal-content {
			padding: 30rpx;
			display: flex;
			flex-direction: column;
			align-items: center;
		}

		.ga-tip-text {
			font-size: 28rpx;
			color: #333333;
			text-align: center;
			line-height: 1.6;
			margin-bottom: 20rpx;
		}

		.ga-tip-red {
			color: #FF0000;
			font-weight: 500;
		}

		.ga-secret-section {
			width: 100%;
			margin-bottom: 30rpx;
		}

		.ga-secret-label {
			font-size: 26rpx;
			color: #666666;
			margin-bottom: 10rpx;
		}

		.ga-secret-text {
			font-size: 28rpx;
			color: #2563EB;
			word-break: break-all;
			line-height: 1.6;
		}

		.ga-qr-code-wrapper {
			width: 400rpx;
			height: 400rpx;
			background-color: #F5F5F5;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			margin-bottom: 30rpx;
			border: 2rpx solid #E5E5E5;
		}

		.ga-qr-code-image {
			width: 100%;
			height: 100%;
			border-radius: 12rpx;
		}

		.ga-qr-code-placeholder {
			width: 100%;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #999999;
		}

		.ga-tutorial-btn-wrapper {
			width: 100%;
			margin-bottom: 20rpx;
		}

		.ga-tutorial-btn {
			width: 100%;
			height: 70rpx;
			background-color: #F5F7FB;
			border: 1rpx solid #E5EAF5;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 28rpx;
			color: #2563EB;
			cursor: pointer;
		}

		.ga-bind-modal-footer {
			border-top: 1rpx solid #F0F0F0;
			padding: 20rpx 30rpx;
		}

		.ga-bind-modal-btn-row {
			display: flex;
			flex-direction: row;
			gap: 20rpx;
		}

		.ga-bind-modal-btn-save {
			flex: 1;
			height: 80rpx;
			background-color: #F5F7FB;
			border: 1rpx solid #E5EAF5;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			color: #666666;
			font-weight: 500;
		}

		.ga-bind-modal-btn-confirm {
			flex: 1;
			height: 80rpx;
			background-color: #FACC05;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			color: #000000;
			font-weight: 500;
		}

		/* 教程图片弹窗样式（置顶显示） */
		.ga-tutorial-modal-mask {
			position: fixed;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			background-color: rgba(0, 0, 0, 0.8);
			display: flex;
			align-items: center;
			justify-content: center;
			z-index: 10000; /* 比绑定弹窗更高，置顶显示 */
		}

		.ga-tutorial-modal {
			width: 90%;
			max-width: 700rpx;
			max-height: 90vh;
			background-color: #FFFFFF;
			border-radius: 24rpx;
			overflow: hidden;
			box-shadow: 0 8rpx 32rpx rgba(0, 0, 0, 0.3);
			display: flex;
			flex-direction: column;
		}

		.ga-tutorial-modal-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			padding: 30rpx 30rpx 20rpx;
			border-bottom: 1rpx solid #F0F0F0;
		}

		.ga-tutorial-modal-title {
			font-size: 36rpx;
			font-weight: 600;
			color: #333333;
		}

		.ga-tutorial-modal-close {
			font-size: 48rpx;
			color: #999999;
			line-height: 1;
			cursor: pointer;
			width: 48rpx;
			height: 48rpx;
			display: flex;
			align-items: center;
			justify-content: center;
		}

		.ga-tutorial-modal-content {
			flex: 1;
			overflow-y: auto;
			padding: 30rpx;
			display: flex;
			justify-content: center;
			align-items: flex-start;
		}

		.ga-tutorial-image {
			width: 100%;
			height: auto;
		}

		.ga-tutorial-modal-footer {
			border-top: 1rpx solid #F0F0F0;
			padding: 20rpx 30rpx;
		}

		.ga-tutorial-modal-btn {
			width: 100%;
			height: 80rpx;
			background-color: #2563EB;
			border-radius: 12rpx;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 32rpx;
			color: #FFFFFF;
			font-weight: 500;
		}
	}
</style>