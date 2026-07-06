<template>
	<view class="add-shop-container">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" :title="isRepair ? '修复店铺' : '添加店铺'" :bordered="false" left-arrow @click-left="handleBack"></wd-navbar>
		<view class="content" :style="{paddingTop: systemBarHeight + 44 + 'px', height: `calc(100vh - ${systemBarHeight + 44}px)`}">
			<view class="loading-container" v-if="isLoading">
				<text class="loading-text">加载中...</text>
			</view>
			<!-- WebView 容器，在 APP-PLUS 环境下显示 -->
			<!-- #ifdef APP-PLUS -->
			<view class="webview-wrapper" v-if="!isLoading"></view>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<view class="h5-tip"><text>请在APP中打开此页面</text></view>
			<!-- #endif -->
			<!-- #ifdef MP-WEIXIN -->
			<view v-if="webviewUrl && !isLoading" class="mp-auth-tip">
				<text>{{ isRepair ? '请在下方完成店铺修复授权，完成后点击左上角返回刷新列表' : '请在下方完成店铺授权，完成后点击左上角返回刷新列表' }}</text>
			</view>
			<web-view
				v-if="webviewUrl && !isLoading"
				class="mp-webview"
				:src="webviewUrl"
				@message="handleMpWebMessage"
			/>
			<!-- #endif -->
		</view>
		<!-- 缩放按钮 - 使用 cover-view 确保显示在原生组件之上 -->
		<!-- #ifdef APP-PLUS -->
		<cover-view class="zoom-controls">
			<cover-view class="zoom-btn zoom-btn-minus" @tap="zoomOut">
				<cover-image src="/static/tab/suoxiao.png" class="zoom-icon"></cover-image>
			</cover-view>
			<cover-view class="zoom-btn zoom-btn-plus" @tap="zoomIn">
				<cover-image src="/static/tab/fangda.png" class="zoom-icon zoom-icon-black"></cover-image>
			</cover-view>
		</cover-view>
		<!-- #endif -->
	</view>
</template>

<script setup>
	import { ref, onMounted, onUnmounted } from 'vue'
	import { onLoad, onShow } from '@dcloudio/uni-app'
	import { ShopApi } from '@/api/shop.ts'
	import { UserApi } from '@/api/login.ts'
	import { useAuthStore } from '@/store/auth.ts'
	import { getPlatformLoginUrl, getPlatformLoginFinalUrl } from '@/utils/platform-login-urls'
	import { mapShopTypeToCookieType, extractShopIdFromCookie, formatCookieForPlatform } from '@/utils/shop-auth'
	import { getPlatformName } from '@/utils/platforms'
	import { buildShopAuthLink } from '@/utils/authLink'
	import { markStoreManageNeedRefresh } from '@/utils/mpAddShop'

	const authStore = useAuthStore()
	// #ifdef MP-WEIXIN
	const webviewUrl = ref('')
	const handleMpWebMessage = (e) => {
		const dataList = e?.detail?.data
		if (!Array.isArray(dataList) || dataList.length === 0) return
		const payload = dataList[dataList.length - 1]
		if (payload?.success || payload?.type === 'shopAuthSuccess') {
			markStoreManageNeedRefresh()
			uni.showToast({ title: '授权成功', icon: 'success' })
			setTimeout(() => {
				uni.navigateBack({ delta: 1 })
			}, 1200)
		}
	}
	const initMpAuth = async () => {
		isLoading.value = true
		try {
			let userId = authStore.userId || uni.getStorageSync('userId')
			if (!userId) {
				const res = await UserApi.getUser()
				userId = res?.data?.user_id || res?.data?.UserId || res?.data?.id
				if (userId) authStore.setUserId(String(userId))
			}
			if (!userId) throw new Error('请先登录')
			if (shopType.value === 8) {
				const res = await ShopApi.getOfficeAuth(8)
				webviewUrl.value = res?.data?.Url || ''
			} else {
				webviewUrl.value = buildShopAuthLink(shopType.value, String(userId))
			}
		} catch (e) {
			uni.showToast({ title: e?.message || '加载失败', icon: 'none' })
		} finally {
			isLoading.value = false
		}
	}
	// #endif

	const systemBarHeight = ref(0)
	const shopType = ref(1) // 平台类型：1=美团外卖, 2=美团闪购, 3=美团医药, 4=淘宝闪购外卖, 5=淘宝闪购零售, 6=京东零售, 7=抖店即时零售, 8=京东外卖, 9=抖音外卖
	const isRepair = ref(false)
	const isLoading = ref(true)
	let checkinter = null
	let w = null
	const cookieStr = ref('')
	const zoomLevel = ref(100) // 缩放级别，默认100%
	const accountPassword = ref({ account: '', password: '' }) // 账号密码（用于需要账号密码的平台）
	const isSubmitting = ref(false) // 提交状态标记，防止重复提交

	onLoad((options) => {
		// #ifdef APP-PLUS
		// 清理之前的webview和cookie（确保每次打开都是全新环境）
		if (w) {
			try {
				plus.webview.close(w)
			} catch (e) {
				console.warn('关闭旧webview失败:', e)
			}
			w = null
		}
		if (checkinter) {
			clearInterval(checkinter)
			checkinter = null
		}
		
		// 清理所有cookie和缓存
		try {
			plus.navigator.removeAllCookie()
			plus.navigator.removeCookie()
			plus.navigator.removeSessionCookie()
			plus.cache.clear(function() {})
		} catch (e) {
			console.warn('清理cookie失败:', e)
		}
		
		// 重置状态
		cookieStr.value = ''
		accountPassword.value = { account: '', password: '' }
		isLoading.value = true
		zoomLevel.value = 100
		isSubmitting.value = false // 重置提交状态
		// #endif
		
		if (options.shopType) {
			shopType.value = parseInt(options.shopType)
		}
		if (options.isRepair) {
			isRepair.value = parseInt(options.isRepair) === 1
		}
		
		// 获取系统信息
		uni.getSystemInfo({
			success: (res) => {
				systemBarHeight.value = res.statusBarHeight || 0
			}
		})

		// #ifdef MP-WEIXIN
		initMpAuth()
		// #endif
		// #ifndef MP-WEIXIN
		initAddShop()
		// #endif
	})

	const handleBack = () => {
		markStoreManageNeedRefresh()
		uni.navigateBack({
			delta: 1
		})
	}

	// 放大网页
	const zoomIn = () => {
		// #ifdef APP-PLUS
		if (w) {
			const newZoom = Math.min(zoomLevel.value + 10, 200)
			if (newZoom !== zoomLevel.value) {
				zoomLevel.value = newZoom
				applyZoom()
			}
		}
		// #endif
	}

	// 缩小网页
	const zoomOut = () => {
		// #ifdef APP-PLUS
		if (w) {
			const newZoom = Math.max(zoomLevel.value - 10, 50)
			if (newZoom !== zoomLevel.value) {
				zoomLevel.value = newZoom
				applyZoom()
			}
		}
		// #endif
	}

	// 应用缩放
	const applyZoom = () => {
		// #ifdef APP-PLUS
		if (w) {
			try {
				// 使用 viewport width 来实现缩放，与双指缩放效果完全一致
				const scale = zoomLevel.value / 100
				const zoomScript = `
					(function() {
						try {
							var scale = ${scale};
							var deviceWidth = window.innerWidth || screen.width;
							var targetWidth = deviceWidth / scale;
							
							// 获取或创建 viewport meta
							var viewport = document.querySelector('meta[name="viewport"]');
							var content = 'width=' + targetWidth + ', initial-scale=' + scale + ', maximum-scale=5.0, minimum-scale=0.5, user-scalable=yes';
							
							if (viewport) {
								viewport.setAttribute('content', content);
							} else {
								// 如果没有 viewport meta，创建一个
								var meta = document.createElement('meta');
								meta.name = 'viewport';
								meta.content = content;
								var head = document.getElementsByTagName('head')[0];
								if (head) {
									head.appendChild(meta);
								}
							}
						} catch(e) {
							console.error('缩放脚本执行错误:', e);
						}
					})();
				`
				w.evalJS(zoomScript)
			} catch (e) {
				console.error('缩放失败:', e)
			}
		}
		// #endif
	}

	const initAddShop = () => {
		// 获取平台登录URL
		const loginUrl = getPlatformLoginUrl(shopType.value)
		if (!loginUrl) {
			uni.showToast({
				title: `平台 ${getPlatformName(shopType.value)} 的登录地址未配置`,
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 根据平台类型调用对应的登录函数
		openPlatformLogin(loginUrl)
	}
	
	// 打开平台登录页面（统一入口）
	const openPlatformLogin = (url) => {
		// #ifdef H5
		location.href = "https://www.baidu.com/";
		// #endif
		// #ifdef APP-PLUS
		uni.showLoading({})
		
		// 根据平台类型设置不同的User-Agent
		setUserAgentForPlatform(shopType.value)
		
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = `webview-${shopType.value}-${Date.now()}`
		// 为底部按钮留出空间（按钮高度60rpx + 底部距离100rpx ≈ 160rpx = 80px）
		const buttonAreaHeight = 80
		const webview_setting = {
			'disablePlus': false,
			'scrollIndicator': 'all',
			'width': getWindowInfo.screenWidth + 'px',
			'top': (systemBarHeight.value + 44) + 'px',
			'height': (getWindowInfo.windowHeight - systemBarHeight.value - 44 - buttonAreaHeight) + 'px',
			'scalable': true,
		}
		
		// 清理cookie和缓存（所有平台都需要清理）
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.cache.clear(function() {})
		
		// 关闭之前的webview（如果存在）
		if (w) {
			try {
				plus.webview.close(w)
			} catch (e) {
				console.warn('关闭旧webview失败:', e)
			}
		}
		w = plus.webview.create(url, webviewid, webview_setting)
		
		setTimeout(() => {
			plus.webview.close(w)
			setTimeout(() => {
			// 对于淘宝闪购外卖平台（shopType=4），需要添加/login路径
			// 对于淘宝闪购零售平台（shopType=5），不需要添加/login路径，直接使用基础URL
				const finalUrl = getPlatformLoginFinalUrl(shopType.value, url)
				w = plus.webview.open(finalUrl, webviewid, webview_setting)
				isLoading.value = false
				w.show()
				uni.hideLoading({})
				
				// 初始化缩放级别
				zoomLevel.value = 100
				// 等待页面加载完成后应用初始缩放
				setTimeout(() => {
					applyZoom()
				}, 1000)
				
				// 启动cookie监听
				startCookieMonitoring()
			}, 500)
		}, 500)
		// #endif
	}
	
	// 根据平台类型设置User-Agent
	const setUserAgentForPlatform = (platformType) => {
		// 美团平台（1,2,3）使用移动端User-Agent
		if (platformType === 1 || platformType === 2 || platformType === 3) {
			plus.navigator.setUserAgent(
				"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"
			)
		} else {
			// 其他平台使用PC端User-Agent
			const banben = Math.floor(Math.random() * 601) + 1
			plus.navigator.setUserAgent(
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
				Math.floor(Math.random() * 16) +
				"_7) AppleWebKit/" + banben +
				".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
			)
		}
	}
	
	// 启动cookie监听
	const startCookieMonitoring = () => {
		if (!w) return
		
		checkinter = setInterval(() => {
			try {
				const currentUrl = w.getURL()
				if (!currentUrl) return
				
				// 对于抖音/抖店平台，需要等待跳转到后台页面后再获取cookie
				if (shopType.value === 7 || shopType.value === 9) {
					// 检查URL是否已经跳转到后台页面（登录成功后的页面）
					const isLoginSuccess = currentUrl.includes('jsls.jinritemai.com') || 
					                      currentUrl.includes('mfa/homepage') ||
					                      currentUrl.includes('mfa/') ||
					                      currentUrl.includes('/org/') ||
					                      !currentUrl.includes('login')
					
					// 如果还在登录页面，继续等待
					if (!isLoginSuccess && currentUrl.includes('login')) {
						return
					}
				}
				
					// 对于淘宝闪购零售平台，需要等待跳转到后台页面
				if (shopType.value === 5) {
					// 检查URL是否已经跳转到后台页面（登录成功后的页面）
						// 淘宝闪购零售平台登录成功后会跳转到 nr.ele.me/app/ 的后台页面
					const isLoginSuccess = currentUrl.includes('nr.ele.me/app/') || 
					                       currentUrl.includes('nr.ele.me/') && 
					                       !currentUrl.includes('login')
					
					// 如果还在登录页面，继续等待
					if (!isLoginSuccess && currentUrl.includes('login')) {
						return
					}
					
					// 如果已经跳转到后台页面，需要等待页面完全加载并执行完JavaScript
					// cookie可能是异步设置的，需要等待一段时间
					if (isLoginSuccess) {
						// 记录首次跳转到后台页面的时间
						if (!w._elemeRetailBackendPageTime) {
							w._elemeRetailBackendPageTime = Date.now()
							console.log(`[CookieMonitoring] 淘宝闪购零售平台已跳转到后台页面: ${currentUrl}`)
						}
						
						// 等待至少3秒，让页面完全加载并执行完所有JavaScript
						const timeSinceBackend = Date.now() - w._elemeRetailBackendPageTime
						if (timeSinceBackend < 3000) {
							console.log(`[CookieMonitoring] 淘宝闪购零售平台后台页面加载中，等待 ${3000 - timeSinceBackend}ms...`)
							return
						}
					}
				}
				
				// 对于京东平台，也需要等待跳转到后台页面
				if (shopType.value === 6 || shopType.value === 8) {
					// 检查URL是否已经跳转到后台页面（登录成功后的页面）
					// 京东平台登录成功后会跳转到 store.jddj.com 的后台页面
					const isLoginSuccess = (currentUrl.includes('store.jddj.com') || 
					                       currentUrl.includes('jddj.com')) && 
					                      !currentUrl.includes('login') &&
					                      !currentUrl.includes('passport')
					
					// 如果还在登录页面，继续等待
					if (!isLoginSuccess && (currentUrl.includes('login') || currentUrl.includes('passport'))) {
						return
					}
					
					// 如果已经跳转到后台页面，需要等待页面完全加载并执行完JavaScript
					// store_session等cookie可能是异步设置的，需要等待一段时间
					if (isLoginSuccess) {
						// 记录首次跳转到后台页面的时间
						if (!w._jdBackendPageTime) {
							w._jdBackendPageTime = Date.now()
							const platformName = shopType.value === 6 ? '京东零售' : '京东外卖'
							console.log(`[CookieMonitoring] ${platformName}平台已跳转到后台页面: ${currentUrl}`)
						}
						
						// 等待至少3秒，让页面完全加载并执行完所有JavaScript
						const timeSinceBackend = Date.now() - w._jdBackendPageTime
						if (timeSinceBackend < 3000) {
							const platformName = shopType.value === 6 ? '京东零售' : '京东外卖'
							console.log(`[CookieMonitoring] ${platformName}平台后台页面加载中，等待 ${3000 - timeSinceBackend}ms...`)
							return
						}
					}
				}
				
				// 获取cookie（优先使用evalJS获取document.cookie，这样可以获取更多cookie）
				let cookiestr = ''
				try {
					// 方式1: 通过evalJS获取document.cookie（可以获取非httpOnly的cookie）
					const documentCookie = w.evalJS('document.cookie') || ''
					
					// 方式2: 通过plus.navigator.getCookie获取（可能包含httpOnly的cookie）
					const navigatorCookie = plus.navigator.getCookie(currentUrl) || ''
					
					// 合并两种方式获取的cookie
					const cookieMap = new Map()
					
					// 解析document.cookie
					if (documentCookie) {
						documentCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					// 解析navigator cookie（可能包含httpOnly）
					if (navigatorCookie) {
						navigatorCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								// navigator cookie优先（可能包含httpOnly）
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					// 重新组合cookie字符串
					cookiestr = Array.from(cookieMap.entries())
						.map(([key, value]) => `${key}=${value}`)
						.join('; ')
					
					// 对于淘宝闪购零售平台，尝试从多个域名获取cookie（与PC端保持一致）
					if (shopType.value === 5) {
						try {
							console.log('[CookieMonitoring] 淘宝闪购零售 - 开始从多个域名获取cookie')
							// 从当前URL提取域名和根域名（使用字符串解析，避免URL构造函数在app端不可用）
							let currentHostname = ''
							let rootDomain = ''
							try {
								// 使用正则表达式提取hostname
								const urlMatch = currentUrl.match(/https?:\/\/([^\/]+)/)
								if (urlMatch && urlMatch[1]) {
									currentHostname = urlMatch[1].split(':')[0] // 移除端口号
									const parts = currentHostname.split('.')
									if (parts.length >= 2) {
										rootDomain = parts.slice(-2).join('.')
									}
								}
							} catch (e) {
								console.warn('[CookieMonitoring] 解析当前URL失败:', e)
							}
							
							// 构建URL列表：优先使用当前页面的实际域名
							const elemeUrls = []
							if (currentHostname) {
								// 优先添加当前页面的域名
								elemeUrls.push(`https://${currentHostname}`)
								if (rootDomain && rootDomain !== currentHostname) {
									elemeUrls.push(`https://${rootDomain}`)
								}
							}
							// 添加其他可能的域名（与PC端保持一致）
							elemeUrls.push(
								'https://nr.ele.me',
								'https://melody.shop.ele.me',
								'https://ele.me'
							)
							
							// 去重
							const uniqueUrls = [...new Set(elemeUrls)]
							
							console.log('[CookieMonitoring] 饿百零售 - URL列表:', uniqueUrls)
							
							// 从多个URL获取cookie
							for (const url of uniqueUrls) {
								try {
									// 方式1: 通过navigator获取（可能包含HttpOnly）
									const navigatorCookie = plus.navigator.getCookie(url) || ''
									if (navigatorCookie) {
										navigatorCookie.split(';').forEach(item => {
											const [key, ...valueParts] = item.trim().split('=')
											if (key && valueParts.length > 0) {
												cookieMap.set(key.trim(), valueParts.join('=').trim())
											}
										})
									}
									
									// 方式2: 如果webview当前URL的域名匹配，尝试通过evalJS获取document.cookie
									if (currentUrl && currentHostname) {
										try {
											// 使用字符串解析URL（避免URL构造函数在app端不可用）
											const urlHostMatch = url.match(/https?:\/\/([^\/]+)/)
											const urlHostname = urlHostMatch && urlHostMatch[1] ? urlHostMatch[1].split(':')[0] : ''
											
											// 检查域名是否匹配（包括子域名）
											if (urlHostname && (
												currentHostname === urlHostname || 
												currentHostname.endsWith('.' + urlHostname) ||
												urlHostname.endsWith('.' + currentHostname) ||
												currentUrl.includes(urlHostname)
											)) {
												const docCookie = w.evalJS(`(function() {
													try {
														return document.cookie;
													} catch(e) {
														return '';
													}
												})()`) || ''
												if (docCookie) {
													docCookie.split(';').forEach(item => {
														const [key, ...valueParts] = item.trim().split('=')
														if (key && valueParts.length > 0) {
															cookieMap.set(key.trim(), valueParts.join('=').trim())
														}
													})
												}
											}
										} catch (docErr) {
											// 忽略URL解析或document.cookie获取失败
											console.warn('[CookieMonitoring] 获取document.cookie失败:', docErr)
										}
									}
								} catch (e) {
									// 忽略单个域名的错误
									console.warn(`[CookieMonitoring] 获取 ${url} 的cookie失败:`, e)
								}
							}
							
							// 重新组合cookie
							cookiestr = Array.from(cookieMap.entries())
								.map(([key, value]) => `${key}=${value}`)
								.join('; ')
							
							// 检查关键认证cookie是否存在（与PC端保持一致，不区分大小写）
							const keyElemeCookies = ['wmuss', 'switch_shop', 'wmstoken']
							const allKeys = Array.from(cookieMap.keys())
							const allKeysLower = allKeys.map(k => k.toLowerCase())
							
							// 不区分大小写检查cookie
							const missingKeys = keyElemeCookies.filter(k => {
								const lowerKey = k.toLowerCase()
								return !allKeysLower.includes(lowerKey)
							})
							
							if (missingKeys.length > 0) {
								console.warn('[CookieMonitoring] ⚠️ 淘宝闪购零售缺少关键 cookie:', missingKeys)
								console.log('[CookieMonitoring] 当前所有 cookie keys:', allKeys.slice(0, 20))
								// 检查是否有类似的cookie（可能是大小写不同）
								const foundSimilar = keyElemeCookies.filter(k => {
									const lowerKey = k.toLowerCase()
									return allKeysLower.some(ak => ak.includes(lowerKey) || lowerKey.includes(ak))
								})
								if (foundSimilar.length > 0) {
									console.log('[CookieMonitoring] 发现类似的cookie（可能是大小写不同）:', foundSimilar)
								}
							} else {
								console.log('[CookieMonitoring] ✅ 淘宝闪购零售关键 cookie 检查通过')
							}
							
							console.log('[CookieMonitoring] 淘宝闪购零售 - 合并后cookie总数:', cookieMap.size)
						} catch (e) {
							console.warn('获取淘宝闪购零售平台额外cookie失败:', e)
						}
					}
					
					// 对于抖音/抖店平台，尝试从多个域名获取cookie
					if (shopType.value === 7 || shopType.value === 9) {
						try {
							// 尝试获取jinritemai.com相关域名的cookie
							const jinritemaiUrls = [
								'https://fxg.jinritemai.com',
								'https://jsls.jinritemai.com',
								'https://jinritemai.com'
							]
							
							for (const url of jinritemaiUrls) {
								try {
									const domainCookie = plus.navigator.getCookie(url) || ''
									if (domainCookie) {
										domainCookie.split(';').forEach(item => {
											const [key, ...valueParts] = item.trim().split('=')
											if (key && valueParts.length > 0) {
												cookieMap.set(key.trim(), valueParts.join('=').trim())
											}
										})
									}
								} catch (e) {
									// 忽略单个域名的错误
								}
							}
							
							// 重新组合cookie
							cookiestr = Array.from(cookieMap.entries())
								.map(([key, value]) => `${key}=${value}`)
								.join('; ')
						} catch (e) {
							console.warn('获取抖音平台额外cookie失败:', e)
						}
					}
					
					// 对于京东平台，也尝试从多个域名获取cookie（与PC端保持一致）
					if (shopType.value === 6 || shopType.value === 8) {
						try {
							// 从当前URL提取域名和根域名
							let currentHostname = ''
							let rootDomain = ''
							try {
								const currentUrlObj = new URL(currentUrl)
								currentHostname = currentUrlObj.hostname
								const parts = currentHostname.split('.')
								if (parts.length >= 2) {
									rootDomain = parts.slice(-2).join('.')
								}
							} catch (e) {
								console.warn('[CookieMonitoring] 解析当前URL失败:', e)
							}
							
							// 构建URL列表：优先使用当前页面的实际域名
							const jdUrls = []
							if (currentHostname) {
								// 优先添加当前页面的域名
								jdUrls.push(`https://${currentHostname}`)
								if (rootDomain && rootDomain !== currentHostname) {
									jdUrls.push(`https://${rootDomain}`)
								}
							}
							// 添加其他可能的域名
							jdUrls.push(
								'https://store.jddj.com',
								'https://jddj.com',
								'https://store1.jddj.com',
								'https://login.o2o.jd.com',
								'https://passport.jd.com',
								'https://o2o.jd.com',
								'https://jd.com'
							)
							
							// 去重
							const uniqueUrls = [...new Set(jdUrls)]
							
							const platformName = shopType.value === 6 ? '京东零售' : '京东外卖'
							console.log(`[CookieMonitoring] ${platformName} - 开始从多个域名获取cookie，URL列表:`, uniqueUrls)
							
							// 从多个URL获取cookie
							for (const url of uniqueUrls) {
								try {
									// 方式1: 通过navigator获取（可能包含HttpOnly）
									const navigatorCookie = plus.navigator.getCookie(url) || ''
									if (navigatorCookie) {
										navigatorCookie.split(';').forEach(item => {
											const [key, ...valueParts] = item.trim().split('=')
											if (key && valueParts.length > 0) {
												cookieMap.set(key.trim(), valueParts.join('=').trim())
											}
										})
									}
									
									// 方式2: 如果webview当前URL的域名匹配，尝试通过evalJS获取document.cookie
									if (currentUrl && currentHostname) {
										try {
											// 使用字符串解析URL（避免URL构造函数在app端不可用）
											const urlHostMatch = url.match(/https?:\/\/([^\/]+)/)
											const urlHostname = urlHostMatch && urlHostMatch[1] ? urlHostMatch[1].split(':')[0] : ''
											
											// 检查域名是否匹配（包括子域名）
											if (urlHostname && (
												currentHostname === urlHostname || 
												currentHostname.endsWith('.' + urlHostname) ||
												urlHostname.endsWith('.' + currentHostname) ||
												currentUrl.includes(urlHostname)
											)) {
												const docCookie = w.evalJS(`(function() {
													try {
														return document.cookie;
													} catch(e) {
														return '';
													}
												})()`) || ''
												if (docCookie) {
													docCookie.split(';').forEach(item => {
														const [key, ...valueParts] = item.trim().split('=')
														if (key && valueParts.length > 0) {
															cookieMap.set(key.trim(), valueParts.join('=').trim())
														}
													})
												}
											}
										} catch (docErr) {
											// 忽略URL解析或document.cookie获取失败
											console.warn('[CookieMonitoring] 获取document.cookie失败:', docErr)
										}
									}
								} catch (e) {
									// 忽略单个域名的错误
									console.warn(`[CookieMonitoring] 获取 ${url} 的cookie失败:`, e)
								}
							}
							
							// 重新组合cookie
							cookiestr = Array.from(cookieMap.entries())
								.map(([key, value]) => `${key}=${value}`)
								.join('; ')
							
							// 检查关键认证cookie是否存在（与PC端保持一致）
							// 京东零售（shopType=6）和京东外卖（shopType=8）需要 pin+sdtoken 或 thor+flash
							const allKeys = Array.from(cookieMap.keys())
							const hasPin = cookieMap.has('pin')
							const hasSdtoken = cookieMap.has('sdtoken')
							const hasThor = cookieMap.has('thor')
							const hasFlash = cookieMap.has('flash')
							const hasValidAuth = (hasPin && hasSdtoken) || (hasThor && hasFlash)
							
							if (!hasValidAuth) {
								console.warn(`[CookieMonitoring] ⚠️ ${platformName}缺少有效登录凭证 - pin:${hasPin}, sdtoken:${hasSdtoken}, thor:${hasThor}, flash:${hasFlash}`)
								console.log('[CookieMonitoring] 当前所有 cookie keys:', allKeys.slice(0, 20))
								// 如果缺少关键cookie，继续等待（不返回null，让后续逻辑处理）
							} else {
								console.log(`[CookieMonitoring] ✅ ${platformName}关键 cookie 检查通过`)
							}
							
							console.log(`[CookieMonitoring] ${platformName} - 合并后cookie总数:`, cookieMap.size)
						} catch (e) {
							console.warn('获取京东平台额外cookie失败:', e)
						}
					}
				} catch (e) {
					console.warn('获取cookie失败，使用navigator方式:', e)
					// 降级到navigator方式
					cookiestr = plus.navigator.getCookie(currentUrl) || ''
				}
				
				if (!cookiestr) return
				
				// 获取localStorage（用于某些平台）
				let localStorageStr = ''
				try {
					const localStorageScript = `
						(function() {
							const items = {};
							for (let i = 0; i < window.localStorage.length; i++) {
								const key = window.localStorage.key(i);
								items[key] = window.localStorage.getItem(key);
							}
							return JSON.stringify(items);
						})()
					`
					localStorageStr = w.evalJS(localStorageScript) || ''
				} catch (e) {
					console.warn('获取localStorage失败:', e)
				}
				
				// 获取账号密码（如果需要）
				if (shopType.value === 1 || shopType.value === 2 || shopType.value === 3 || 
					shopType.value === 4 || shopType.value === 5 || shopType.value === 6 || 
					shopType.value === 7 || shopType.value === 8 || shopType.value === 9) {
					try {
						const accountPasswordScript = `
							(function() {
								const result = { account: '', password: '' };
								try {
									// 查找账号输入框
									let accountInput = document.getElementById('login') || 
										document.getElementById('username') ||
										document.getElementById('mobile') ||
										document.getElementById('phone') ||
										document.getElementById('account') ||
										document.getElementById('userName') ||
										document.querySelector('input[name="username"]') ||
										document.querySelector('input[name="mobile"]') ||
										document.querySelector('input[name="phone"]') ||
										document.querySelector('input[name="account"]') ||
										document.querySelector('input[name="userName"]');
									if (accountInput) {
										result.account = accountInput.value || '';
									}
									
									// 查找密码输入框
									let passwordInput = document.getElementById('password') || 
										document.querySelector('input[type="password"]');
									if (passwordInput) {
										result.password = passwordInput.value || '';
									}
								} catch(e) {}
								return JSON.stringify(result);
							})()
						`
						const accountPasswordStr = w.evalJS(accountPasswordScript) || '{}'
						try {
							accountPassword.value = JSON.parse(accountPasswordStr)
						} catch (e) {
							console.warn('解析账号密码失败:', e)
						}
					} catch (e) {
						console.warn('获取账号密码失败:', e)
					}
				}
				
				// 提取shopId和验证cookie
				const cookieType = mapShopTypeToCookieType(shopType.value)
				const shopId = extractShopIdFromCookie(cookiestr, cookieType, localStorageStr, currentUrl)
				
				// shopId为null表示cookie无效，继续等待
				if (shopId === null) {
					return
				}
				
				// 如果正在提交，跳过（防止重复提交）
				if (isSubmitting.value) {
					return
				}
				
				// cookie有效，格式化并提交
				const formattedCookie = formatCookieForPlatform(cookiestr, cookieType)
				cookieStr.value = formattedCookie
				
				// 构建参数
				const params = {
					type: shopType.value,
					cookie: formattedCookie
				}
				
				// 如果有shopId且不是连锁账号，添加officialId
				if (shopId && shopId !== '-1' && shopId !== '') {
					params.officialId = shopId
				}
				
				// 如果有账号密码，添加到参数中
				if (accountPassword.value.account) {
					params.account = accountPassword.value.account
				}
				if (accountPassword.value.password) {
					params.password = accountPassword.value.password
				}
				
				// 提交添加店铺请求（agentAddShop中会停止监听）
				agentAddShop(params)
			} catch (e) {
				console.error('Cookie监听错误:', e)
			}
		}, 500)
	}

	const agentAddShop = (params) => {
		// 如果正在提交，直接返回（防止重复提交）
		if (isSubmitting.value) {
			console.warn('正在提交中，跳过重复请求')
			return
		}
		
		// 标记为提交中
		isSubmitting.value = true
		
		// 停止cookie监听（防止重复提交）
		if (checkinter) {
			clearInterval(checkinter)
			checkinter = null
		}
		
		uni.showLoading({})
		ShopApi.agentAddShop({ shop_type: shopType.value, cookies: formattedCookie }).then(res => {
			isSubmitting.value = false
			
			if (res.code === 200) {
				uni.hideLoading({})
				// 添加成功，清理并返回上一页
				// #ifdef APP-PLUS
				// 先清理cookie，再关闭webview（确保cookie被清理）
				// 对于抖音/抖店平台，需要清理多个域名的cookie
				if (shopType.value === 7 || shopType.value === 9) {
					// 清理抖音平台相关域名的cookie
					const jinritemaiUrls = [
						'https://fxg.jinritemai.com',
						'https://jsls.jinritemai.com',
						'https://jinritemai.com'
					]
					for (const url of jinritemaiUrls) {
						try {
							plus.navigator.removeCookie(url)
						} catch (e) {
							console.warn(`清理抖音平台cookie失败 (${url}):`, e)
						}
					}
				}
				
				// 清理所有cookie
				plus.navigator.removeAllCookie()
				plus.navigator.removeCookie()
				plus.navigator.removeSessionCookie()
				plus.cache.clear(function() {})
				
				// 关闭webview
				if (w) {
					plus.webview.close(w)
					w = null
				}
				// #endif
				
				// 存储添加成功的门店类型，供管理页面onShow时使用
				uni.setStorageSync('lastAddedShopType', shopType.value)
				
				uni.showToast({
					title: '添加成功',
					icon: 'success',
					duration: 2000
				})
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					})
				}, 1500)
			} else if (res.code === 401) {
				// 401错误：cookie无效或过期
				uni.hideLoading({})
				console.warn('添加店铺失败：401认证错误，cookie可能无效或过期')
				
				// 对于抖音/抖店平台，401错误可能是因为cookie不完整（缺少sessionid）
				// 不立即重新加载，而是继续等待用户登录完成
				if (shopType.value === 7 || shopType.value === 9) {
					console.log('[CookieMonitoring] 抖音平台401错误，可能是cookie不完整，继续等待登录完成...')
					
					// 重置提交状态，允许继续监听
					isSubmitting.value = false
					
					// 重新启动cookie监听（如果已停止）
					if (!checkinter && w) {
						startCookieMonitoring()
					}
					
					uni.showToast({
						title: '请完成登录后再试',
						icon: 'none',
						duration: 2000
					})
					return
				}
				
				// 其他平台的401错误，清理并重新加载
				// #ifdef APP-PLUS
				// 清理cookie和webview
				if (w) {
					plus.webview.close(w)
					w = null
				}
				plus.navigator.removeAllCookie()
				plus.navigator.removeCookie()
				plus.navigator.removeSessionCookie()
				plus.cache.clear(function() {})
				
				// 重置状态
				cookieStr.value = ''
				accountPassword.value = { account: '', password: '' }
				isLoading.value = true
				
				// 延迟重新初始化，避免立即触发
				setTimeout(() => {
					// 重置提交状态
					isSubmitting.value = false
					// 重新初始化（重新加载登录页面）
					initAddShop()
				}, 1000)
				// #endif
				
				uni.showToast({
					title: '认证失败，正在重新加载...',
					icon: 'none',
					duration: 2000
				})
			} else {
				uni.hideLoading({})
				// 其他错误，重置提交状态，但不重新加载
				isSubmitting.value = false
				uni.showToast({
					title: res.message || '添加失败',
					icon: 'none',
					duration: 2000
				})
			}
		}).catch(err => {
			isSubmitting.value = false
			uni.hideLoading({})
			console.error('添加店铺失败:', err)
			
			// 如果是401错误，也清理并重新加载
			if (err && (err.status === 401 || err.code === 401)) {
				// 对于抖音/抖店平台，401错误可能是因为cookie不完整
				if (shopType.value === 7 || shopType.value === 9) {
					console.log('[CookieMonitoring] 抖音平台401错误（catch），继续等待登录完成...')
					
					// 重新启动cookie监听（如果已停止）
					if (!checkinter && w) {
						startCookieMonitoring()
					}
					
					uni.showToast({
						title: '请完成登录后再试',
						icon: 'none',
						duration: 2000
					})
					return
				}
				
				// 其他平台的401错误，清理并重新加载
				// #ifdef APP-PLUS
				if (w) {
					plus.webview.close(w)
					w = null
				}
				plus.navigator.removeAllCookie()
				plus.navigator.removeCookie()
				plus.navigator.removeSessionCookie()
				plus.cache.clear(function() {})
				
				cookieStr.value = ''
				accountPassword.value = { account: '', password: '' }
				isLoading.value = true
				
				// 延迟重新初始化
				setTimeout(() => {
					initAddShop()
				}, 1000)
				// #endif
				
				uni.showToast({
					title: '认证失败，正在重新加载...',
					icon: 'none',
					duration: 2000
				})
			} else {
				uni.showToast({
					title: '添加失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
	}


	onUnmounted(() => {
		// 清理定时器和webview
		if (checkinter) {
			clearInterval(checkinter)
		}
		// #ifdef APP-PLUS
		if (w) {
			plus.webview.close(w)
		}
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		// #endif
	})
</script>

<style lang="scss" scoped>
	.add-shop-container {
		width: 100%;
		height: 100vh;
		background-color: #fff;
	}

	.content {
		width: 100%;
		height: calc(100vh - var(--system-bar-height, 0px) - 44px);
		box-sizing: border-box;
	}

	.loading-container {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
	}

	.loading-text {
		font-size: 28rpx;
		color: #999;
	}

	.webview-wrapper {
		width: 100%;
		height: 100%;
	}

	.h5-tip {
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 28rpx;
		color: #999;
	}

	.mp-auth-tip {
		padding: 16rpx 24rpx;
		background: #fff8e6;
		border-bottom: 1rpx solid #ffe58f;
		font-size: 24rpx;
		color: #ad6800;
		line-height: 1.5;
	}

	.mp-webview {
		width: 100%;
		height: 100%;
	}
</style>

<!-- cover-view 样式需要放在非 scoped 区域 -->
<style lang="scss">
	.zoom-controls {
		position: fixed !important;
		right: 20rpx !important;
		bottom: 60rpx !important;
		z-index: 999999 !important;
		pointer-events: auto !important;
		display: flex !important;
		flex-direction: row !important;
		align-items: center !important;
	}

	.zoom-btn {
		width: 60rpx !important;
		height: 60rpx !important;
		background-color: rgba(0, 0, 0, 0.8) !important;
		border-radius: 50% !important;
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		pointer-events: auto !important;
		position: relative !important;
		z-index: 999999 !important;
		flex-shrink: 0 !important;
	}

	.zoom-icon {
		width: 32rpx !important;
		height: 32rpx !important;
	}

	.zoom-icon-black {
		filter: brightness(0) !important;
	}

	.zoom-btn-minus {
		margin-right: 24rpx !important;
	}

	.zoom-btn-plus {
		margin: 0 !important;
	}
</style>

