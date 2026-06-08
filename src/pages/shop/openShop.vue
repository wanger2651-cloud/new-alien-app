<template>
	<view class="add-shop-container">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" :title="pageTitle" :bordered="false" left-arrow @click-left="handleBack"></wd-navbar>
		<view class="content" :style="{paddingTop: systemBarHeight + 44 + 'px', height: `calc(100vh - ${systemBarHeight + 44}px)`}">
			<view class="loading-container" v-if="isLoading">
				<text class="loading-text">加载中...</text>
			</view>
			<!-- WebView 容器，在 APP-PLUS 环境下显示 -->
			<!-- #ifdef APP-PLUS -->
			<view class="webview-wrapper" v-if="!isLoading"></view>
			<!-- #endif -->
			<!-- #ifdef H5 -->
			<view class="h5-tip">
				<text>请在APP中打开此页面</text>
			</view>
			<!-- #endif -->
		</view>
		<!-- 缩放按钮 - 使用 cover-view 确保显示在原生组件之上 -->
		<!-- #ifdef APP-PLUS -->
		<cover-view class="zoom-controls" v-if="showZoomButtons">
			<cover-view class="zoom-tip zoom-tip-text">如果点击缩小按钮没有反应，先点一下放大按钮再点缩小按钮就可以了</cover-view>
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
	import { ref, computed, onUnmounted } from 'vue'
	import { onLoad } from '@dcloudio/uni-app'
	import { ManagementApi } from '@/api/management.ts'
	import { getPlatformName } from '@/utils/platforms.ts'

	const systemBarHeight = ref(0)
	const shopType = ref(1) // 平台类型：1=美团外卖, 2=美团闪购, 3=美团医药, 4=淘宝闪购外卖, 5=淘宝闪购零售, 6=京东零售, 7=抖店即时零售, 8=京东外卖, 9=抖音外卖
	const isLoading = ref(true)
	let w = null
	const zoomLevel = ref(50) // 缩放级别，默认50%（最小缩小比例）
	const shopId = ref('') // 店铺ID（从参数获取）
	const officialId = ref('') // 官方ID（从参数获取）
	const shopName = ref('') // 店铺名称
	const hasCookie = ref(false) // 是否有传入的cookie
	const showZoomButtons = ref(false) // 是否显示缩放按钮（需要webview显示后才能显示）
	
	// 页面标题：如果有店铺名称则显示店铺名称，否则显示"打开店铺"
	const pageTitle = computed(() => {
		return shopName.value || '打开店铺'
	})

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
		isLoading.value = true
		zoomLevel.value = 50 // 默认最小缩小比例
		hasCookie.value = false
		showZoomButtons.value = false
		// #endif
		
		if (options.shopType) {
			shopType.value = parseInt(options.shopType)
		}
		if (options.shopId) {
			shopId.value = options.shopId
		}
		if (options.officialId) {
			officialId.value = options.officialId
		}
		if (options.shopName) {
			// 如果传入了店铺名称，直接使用
			shopName.value = decodeURIComponent(options.shopName)
		}
		
		// 获取系统信息
		uni.getSystemInfo({
			success: (res) => {
				systemBarHeight.value = res.statusBarHeight || 0
			}
		})

		// 如果传入了cookie，检查订阅后打开店铺后台
		if (options.cookie) {
			hasCookie.value = true
			const decodedCookie = decodeURIComponent(options.cookie)
			// 如果没有店铺名称但有shopId，尝试获取店铺信息
			if (!shopName.value && shopId.value) {
				loadShopName()
			}
			openShopWithCookie(decodedCookie)
		} else if (shopId.value) {
			// 如果传入了shopId但没有cookie，尝试从API获取门店信息（会在fetchShopCookieAndOpen中检查订阅）
			hasCookie.value = true
			fetchShopCookieAndOpen()
		} else {
			// 如果没有传入必要的参数，提示错误
			uni.showToast({
				title: '缺少必要参数，无法打开店铺',
				icon: 'none',
				duration: 2000
			})
			setTimeout(() => {
				uni.navigateBack({
					delta: 1
				})
			}, 2000)
		}
	})

	const handleBack = () => {
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
			const oldZoom = zoomLevel.value
			const newZoom = Math.max(zoomLevel.value - 10, 50)
			const zoomDiff = oldZoom - newZoom
			
			console.log('[zoomOut] 点击缩小按钮')
			console.log('[zoomOut] 当前缩放比例:', oldZoom + '%')
			console.log('[zoomOut] 目标缩放比例:', newZoom + '%')
			console.log('[zoomOut] 本次缩小比例:', zoomDiff + '%')
			
			if (newZoom !== zoomLevel.value) {
				zoomLevel.value = newZoom
				console.log('[zoomOut] 缩放已应用，新缩放比例:', zoomLevel.value + '%')
				applyZoom()
			} else {
				console.log('[zoomOut] 已达到最小缩放比例(50%)，无法继续缩小')
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

	// 设置cookie的函数（与shop-management.vue保持一致）
	const set_cookie = (wv, cookie, home_url, domain) => {
		if (!cookie) {
			console.warn('[set_cookie] cookie为空')
			return
		}
		console.log('[set_cookie] 开始设置cookie，URL:', home_url, 'domain:', domain, 'cookie长度:', cookie.length)
		
		// 处理cookie字符串（与shop-management.vue保持一致，使用 "; " 分割）
		let js_cookie_arr = cookie.split("; ")
		
		// 对于美团平台（shopType=1,2,3），删除isOfflineSelfOpen cookie项（与PC版保持一致）
		if (shopType.value === 1 || shopType.value === 2 || shopType.value === 3) {
			js_cookie_arr = js_cookie_arr.filter(item => {
				return !item.trim().startsWith('isOfflineSelfOpen=')
			})
			console.log('[set_cookie] 美团平台：已删除isOfflineSelfOpen cookie项')
		}
		
		console.log('[set_cookie] cookie项数量:', js_cookie_arr.length)
		// 设置cookie（直接使用原始cookie值，不进行URL编码）
		for (let i in js_cookie_arr) {
			let cookie_item = js_cookie_arr[i].trim()
			if (!cookie_item) continue
			
			let cookie_xx = ''
			if (domain) {
				cookie_xx = `${cookie_item}; path=/; domain=${domain}`
			} else {
				cookie_xx = `${cookie_item}; path=/`
			}
			try {
				plus.navigator.setCookie(home_url, cookie_xx);
				console.log('[set_cookie] 设置cookie项成功:', cookie_item.substring(0, 50) + '...')
			} catch (e) {
				console.warn('[set_cookie] 设置cookie项失败:', cookie_item.substring(0, 50), e)
			}
		}
		console.log('[set_cookie] cookie设置完成')
	}

	// 加载店铺名称（不阻塞页面打开）
	const loadShopName = async () => {
		if (!shopId.value) return
		try {
			const res = await ManagementApi.getShopDetail(shopId.value)
			if (res.code === 200 && res.data && res.data.name) {
				shopName.value = res.data.name
			}
		} catch (error) {
			console.error('[loadShopName] 获取店铺名称失败:', error)
		}
	}
	
	// 从API获取门店信息并提取cookie
	const fetchShopCookieAndOpen = async () => {
		try {
			uni.showLoading({ title: '加载中...' })
			const res = await ManagementApi.getShopDetail(shopId.value)
			if (res.code === 200 && res.data) {
				// 获取店铺名称
				if (res.data.name) {
					shopName.value = res.data.name
				}
				// 门店信息中可能有 cookie 或 cookies 字段
				const shopCookie = res.data.cookie || res.data.cookies
				if (shopCookie) {
					uni.hideLoading()
					// openShopWithCookie会检查订阅状态，如果未激活会提示用户并返回
					await openShopWithCookie(shopCookie)
				} else {
					uni.hideLoading()
					uni.showToast({
						title: '门店cookie信息不存在',
						icon: 'none',
						duration: 2000
					})
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						})
					}, 2000)
				}
			} else {
				uni.hideLoading()
				uni.showToast({
					title: '获取门店信息失败',
					icon: 'none',
					duration: 2000
				})
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					})
				}, 2000)
			}
		} catch (error) {
			console.error('[fetchShopCookieAndOpen] 获取门店cookie失败:', error)
			uni.hideLoading()
			uni.showToast({
				title: '获取门店信息失败',
				icon: 'none',
				duration: 2000
			})
			setTimeout(() => {
				uni.navigateBack({
					delta: 1
				})
			}, 2000)
		}
	}

	// 检查订阅状态（与PC端保持一致）
	const checkSubscriptionStatus = async (shopType) => {
		try {
			const res = await ManagementApi.getSubscriptionStatus(shopType)
			if (res.code === 200 && res.data) {
				return res.data
			}
			return null
		} catch (error) {
			console.error('[checkSubscriptionStatus] 检查订阅状态失败:', error)
			return null
		}
	}

	// 打开订阅弹窗（通过事件通知manage页面）
	const openSubscribeDialog = (shopType) => {
		uni.$emit('openSubscribeDialog', { shopType })
	}

	// 根据平台类型打开店铺后台（添加订阅检查）
	const openShopWithCookie = async (cookie) => {
		// 检查订阅状态（与PC端保持一致）
		const subscriptionStatus = await checkSubscriptionStatus(shopType.value)
		if (subscriptionStatus && !subscriptionStatus.isActive) {
			const platformName = getPlatformName(shopType.value)
			uni.showModal({
				title: '服务未激活',
				content: `${platformName}的后台访问服务未激活，请先激活或续费`,
				confirmText: '立即激活',
				cancelText: '取消',
				success: (res) => {
					if (res.confirm) {
						// 用户点击了"立即激活"，打开订阅对话框
						openSubscribeDialog(shopType.value)
						// 返回上一页
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							})
						}, 100)
					} else {
						// 用户取消，返回上一页
						uni.navigateBack({
							delta: 1
						})
					}
				}
			})
			return
		}

		// 订阅已激活，继续打开后台
		if (shopType.value === 1 || shopType.value === 2 || shopType.value === 3) {
			// 美团平台：美团外卖(1)、美团闪购(2)、美团医药(3)
			openMeituanWithCookie(cookie)
		} else if (shopType.value === 4) {
			// 淘宝闪购外卖(4)：使用 melody.shop.ele.me
			openElemeWithCookie(cookie)
		} else if (shopType.value === 5) {
			// 淘宝闪购零售(5)：使用 nr.ele.me（与PC端保持一致）
			openElemeRetailWithCookie(cookie)
		} else if (shopType.value === 6 || shopType.value === 8) {
			// 京东平台：京东零售(6)、京东外卖(8)
			openJDDJWithCookie(cookie)
		} else if (shopType.value === 7 || shopType.value === 9) {
			// 抖音平台：抖店即时零售(7)、抖音外卖(9)
			openJinritemaiWithCookie(cookie)
		} else {
			// 其他平台暂不支持
			uni.showToast({
				title: '暂不支持此平台',
				icon: 'none',
				duration: 2000
			})
			setTimeout(() => {
				uni.navigateBack({
					delta: 1
				})
			}, 2000)
		}
	}

	// 使用cookie打开美团平台后台（支持美团外卖、美团闪购、美团医药）
	const openMeituanWithCookie = (cookie) => {
		// #ifdef H5
		location.href = "https://www.baidu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			console.error('[openMeituanWithCookie] cookie为空')
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 根据shopType获取对应的URL和domain
		let baseUrl = ''
		let domain = ''
		
		if (shopType.value === 1) {
			// 美团外卖
			baseUrl = 'https://e.waimai.meituan.com/'
			domain = ''
		} else if (shopType.value === 2) {
			// 美团闪购
			baseUrl = 'https://shangoue.meituan.com/'
			domain = ''
		} else if (shopType.value === 3) {
			// 美团医药
			baseUrl = 'https://yiyao.meituan.com/'
			domain = ''
		} else {
			console.error('[openMeituanWithCookie] 不支持的shopType:', shopType.value)
			uni.showToast({
				title: '不支持的平台类型',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		console.log('[openMeituanWithCookie] 开始打开美团后台，shopType:', shopType.value, 'baseUrl:', baseUrl, 'cookie长度:', cookie.length)
		uni.showLoading({})
		
		// 第一步：清理cookie和缓存（必须在设置User-Agent之前）
		console.log('[openMeituanWithCookie] 清理cookie和缓存')
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清除缓存（确保User-Agent生效）
		plus.cache.clear(() => {
			console.log('[openMeituanWithCookie] 缓存清理完成，开始设置User-Agent')
			
			// 第二步：设置User-Agent（必须在创建webview之前设置）
			// 美团闪购和美团医药使用PC端User-Agent，美团外卖使用移动端User-Agent
			let userAgent = ""
			if (shopType.value === 2 || shopType.value === 3) {
				// 美团闪购和美团医药：使用PC端User-Agent（与PC版保持一致）
				const banben = Math.floor(Math.random() * 601) + 1
				userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
					Math.floor(Math.random() * 16) +
					"_7) AppleWebKit/" + banben +
					".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
				console.log('[openMeituanWithCookie] 美团闪购/美团医药：使用PC端User-Agent')
			} else {
				// 美团外卖：使用移动端User-Agent
				userAgent = "Mozilla/5.0 (Linux; Android 13; VOG-AL00 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36"
			}
			plus.navigator.setUserAgent(userAgent)
			console.log('[openMeituanWithCookie] User-Agent设置完成:', userAgent)
			
			let getWindowInfo = uni.getWindowInfo()
			// 根据平台类型确定初始URL
			let url = baseUrl
			if (shopType.value === 1) {
				// 美团外卖使用特殊URL
				url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
			} else if (shopType.value === 2) {
				// 美团闪购使用基础URL（可能需要特定路径，先尝试基础URL）
				url = baseUrl
				console.log('[openMeituanWithCookie] 美团闪购URL:', url)
			} else if (shopType.value === 3) {
				// 美团医药使用特定URL路径（与addShop.vue保持一致）
				url = 'https://yiyao.meituan.com/#/new_fe/business#/index'
			}
			const webviewid = `mywebview-${shopType.value}`;
			const webview_setting = {
				// 对于美团医药，使用WKWebview（更现代的webview，能更好地模拟PC浏览器，避免被检测为WebView）
				'kernel': shopType.value === 3 ? 'WKWebview' : 'UIWebview',
				'disablePlus': false,
				'scrollIndicator': 'all',
				'width': getWindowInfo.screenWidth + 'px',
				'top': (systemBarHeight.value + 44) + 'px',
				'height': (getWindowInfo.windowHeight - systemBarHeight.value - 44 - 80) + 'px',
				'scalable': true,
			};
			
			// 第三步：关闭之前的webview（如果存在）
			if (w) {
				try {
					plus.webview.close(w)
				} catch (e) {
					console.warn('[openMeituanWithCookie] 关闭旧webview失败:', e)
				}
			}
			
			// 第四步：创建webview
			console.log('[openMeituanWithCookie] 创建webview，初始URL:', url)
			w = plus.webview.create(url, webviewid, webview_setting)
			
			// 添加错误监听
			w.addEventListener('error', (e) => {
				console.error('[openMeituanWithCookie] WebView加载错误:', e)
				uni.showToast({
					title: '页面加载失败，请检查网络',
					icon: 'none',
					duration: 3000
				})
			})
			
			// 添加HTTP错误监听
			w.addEventListener('receivedTitle', (e) => {
				console.log('[openMeituanWithCookie] 页面标题:', e.title)
			})
			
			setTimeout(() => {
				plus.webview.close(w);
				setTimeout(() => {
					// 第五步：再次设置User-Agent（确保生效）
					// 美团闪购和美团医药使用PC端User-Agent，美团外卖使用移动端User-Agent
					let userAgent = ""
					if (shopType.value === 2 || shopType.value === 3) {
						// 美团闪购和美团医药：使用PC端User-Agent（与PC版保持一致）
						const banben = Math.floor(Math.random() * 601) + 1
						userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
							Math.floor(Math.random() * 16) +
							"_7) AppleWebKit/" + banben +
							".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
						console.log('[openMeituanWithCookie] 美团闪购/美团医药：再次设置PC端User-Agent')
					} else {
						// 美团外卖：使用移动端User-Agent
						userAgent = "Mozilla/5.0 (Linux; Android 13; VOG-AL00 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36"
					}
					console.log('[openMeituanWithCookie] 再次设置User-Agent:', userAgent)
					plus.navigator.setUserAgent(userAgent)
					
					// 第六步：重新打开webview（先打开空白页，然后通过loadURL加载，确保cookie生效）
					console.log('[openMeituanWithCookie] 重新打开webview（空白页），稍后加载URL:', baseUrl)
					w = plus.webview.open("about:blank", webviewid, webview_setting);
					
					// 再次添加错误监听（因为重新创建了webview）
					w.addEventListener('error', (e) => {
						console.error('[openMeituanWithCookie] WebView加载错误:', e)
						uni.showToast({
							title: '页面加载失败: ' + (e.message || '未知错误'),
							icon: 'none',
							duration: 3000
						})
					})
					
					// 通过WebView实例设置User-Agent（如果支持）
					try {
						if (w && typeof w.setUserAgent === 'function') {
							w.setUserAgent(userAgent)
							console.log('[openMeituanWithCookie] 通过WebView实例设置User-Agent成功')
						}
					} catch (e) {
						console.warn('[openMeituanWithCookie] 通过WebView实例设置User-Agent失败:', e)
					}
					
					// 第七步：对于美团医药，在设置cookie之前先注入User-Agent脚本到webview
					if (shopType.value === 3) {
						try {
							let evalUserAgent = ""
							const banben = Math.floor(Math.random() * 601) + 1
							evalUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
								Math.floor(Math.random() * 16) +
								"_7) AppleWebKit/" + banben +
								".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
							
							// 尝试使用setUserScript（如果支持）
							if (w && typeof w.setUserScript === 'function') {
								const userScript = `
									(function() {
										try {
											Object.defineProperty(navigator, 'userAgent', {
												get: function() { return '${evalUserAgent}'; },
												configurable: true
											});
											Object.defineProperty(navigator, 'platform', {
												get: function() { return 'MacIntel'; },
												configurable: true
											});
											Object.defineProperty(navigator, 'vendor', {
												get: function() { return 'Apple Computer, Inc.'; },
												configurable: true
											});
											Object.defineProperty(navigator, 'appVersion', {
												get: function() { return '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'; },
												configurable: true
											});
										} catch(e) {}
									})();
								`
								w.setUserScript({ content: userScript })
								console.log('[openMeituanWithCookie] 美团医药：使用setUserScript注入User-Agent成功')
							}
						} catch (e) {
							console.warn('[openMeituanWithCookie] 美团医药：setUserScript注入失败:', e)
						}
					}
					
					// 第八步：设置cookie（在loadURL之前设置）
					console.log('[openMeituanWithCookie] 设置cookie，baseUrl:', baseUrl, 'domain:', domain || '无')
					set_cookie(null, cookie, baseUrl, domain)
					
					// 标记是否已经开始加载真实URL（避免空白页触发加载完成事件）
					let hasStartedLoadingRealUrl = false
					
					// 添加页面加载完成监听（在loadURL之后才真正生效）
					w.addEventListener('loading', (e) => {
						console.log('[openMeituanWithCookie] 页面加载状态:', e.loading ? '加载中' : '加载完成', 'shopType:', shopType.value, 'hasStartedLoadingRealUrl:', hasStartedLoadingRealUrl)
						// 只有在开始加载真实URL后才处理加载完成事件
							if (!e.loading && hasStartedLoadingRealUrl) {
							// 页面加载完成，对于美团闪购和美团医药需要额外等待
							if (shopType.value === 2 || shopType.value === 3) {
								// 美团闪购和美团医药：延迟关闭loading，确保页面内容真正渲染完成
								setTimeout(() => {
									isLoading.value = false
									uni.hideLoading()
									console.log('[openMeituanWithCookie] 美团闪购/美团医药：页面加载完成，延迟关闭loading')
								}, 800)
							} else {
								// 其他平台：立即关闭loading
								isLoading.value = false
								uni.hideLoading()
								console.log('[openMeituanWithCookie] 页面加载完成，已关闭loading')
							}
						}
					})
					
					// 添加页面标题变化监听（用于检测页面是否成功加载）
					w.addEventListener('receivedTitle', (e) => {
						console.log('[openMeituanWithCookie] 页面标题:', e.title, 'shopType:', shopType.value, 'hasStartedLoadingRealUrl:', hasStartedLoadingRealUrl)
						// 只有在开始加载真实URL后，且有标题时才处理
						if (e.title && e.title !== '' && hasStartedLoadingRealUrl) {
							console.log('[openMeituanWithCookie] 页面加载成功，标题:', e.title)
							// 页面有标题，说明加载成功，对于美团闪购需要额外等待
							if (shopType.value === 2) {
								// 美团闪购：延迟关闭loading，确保页面内容真正渲染完成
								setTimeout(() => {
									isLoading.value = false
									uni.hideLoading()
									console.log('[openMeituanWithCookie] 美团闪购：页面标题已获取，延迟关闭loading')
									
									// 检查页面内容是否真正加载成功
									setTimeout(() => {
										try {
											w.evalJS(`
												(function() {
													try {
														var bodyText = document.body ? document.body.innerText : '';
														var hasError = bodyText.includes('加载失败') || bodyText.includes('网络错误') || bodyText.includes('页面无法访问') || bodyText.includes('404') || bodyText.includes('500');
														var hasContent = document.body && document.body.children.length > 0;
														var currentUrl = window.location.href;
														console.log('[MeituanFlash] 页面内容检查 - URL:', currentUrl, '是否有错误:', hasError, '是否有内容:', hasContent, 'body文本长度:', bodyText.length);
														if (hasError) {
															console.error('[MeituanFlash] 页面显示错误信息，bodyText前200字符:', bodyText.substring(0, 200));
														}
														return {hasError: hasError, hasContent: hasContent, bodyTextLength: bodyText.length, url: currentUrl};
													} catch(e) {
														console.error('[MeituanFlash] 检查页面内容失败:', e);
														return {error: e.message};
													}
												})();
											`)
										} catch (e) {
											console.warn('[openMeituanWithCookie] 检查页面内容失败:', e)
										}
									}, 1000)
								}, 800)
							} else {
								// 其他平台：立即关闭loading
								isLoading.value = false
								uni.hideLoading()
							}
						}
					})
					
					// 添加页面加载错误监听（检测HTTP错误）
					w.addEventListener('onReceivedHttpError', (e) => {
						console.error('[openMeituanWithCookie] HTTP错误:', e.statusCode, e.url)
						isLoading.value = false
						uni.hideLoading()
						uni.showToast({
							title: `页面加载失败: HTTP ${e.statusCode}`,
							icon: 'none',
							duration: 3000
						})
					})
					
					// 等待cookie设置完成后再加载URL
					// 对于美团闪购和美团医药，需要更长的等待时间确保cookie设置完成
					const cookieWaitTime = (shopType.value === 2 || shopType.value === 3) ? 500 : 200
					setTimeout(() => {
						// 第八步：加载URL
						console.log('[openMeituanWithCookie] 准备加载URL:', baseUrl)
						console.log('[openMeituanWithCookie] shopType:', shopType.value, '是否为美团闪购:', shopType.value === 2)
						try {
							// 对于美团闪购，使用基础URL（与PC版保持一致）
							const loadUrl = baseUrl
							console.log('[openMeituanWithCookie] 实际加载URL:', loadUrl)
							
							// 标记开始加载真实URL
							hasStartedLoadingRealUrl = true
							
							// 对于美团闪购和美团医药，先显示webview再加载URL，确保页面能正确显示
							if (shopType.value === 2 || shopType.value === 3) {
								w.show()
								console.log('[openMeituanWithCookie] 美团闪购/美团医药：先显示webview')
							}
							
							w.loadURL(loadUrl)
							console.log('[openMeituanWithCookie] loadURL调用成功，hasStartedLoadingRealUrl已设置为true')
							
							// 对于美团医药，在loadURL后立即再次注入User-Agent，确保页面加载时就能检测到
							if (shopType.value === 3) {
								setTimeout(() => {
									try {
										let evalUserAgent = ""
										const banben = Math.floor(Math.random() * 601) + 1
										evalUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
											Math.floor(Math.random() * 16) +
											"_7) AppleWebKit/" + banben +
											".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
										
										w.evalJS(`
											(function() {
												if (typeof Object !== 'undefined' && Object.defineProperty) {
													try {
														Object.defineProperty(navigator, 'userAgent', {
															get: function() { return '${evalUserAgent}'; },
															configurable: true,
															enumerable: true
														});
														Object.defineProperty(navigator, 'platform', {
															get: function() { return 'MacIntel'; },
															configurable: true,
															enumerable: true
														});
														Object.defineProperty(navigator, 'vendor', {
															get: function() { return 'Apple Computer, Inc.'; },
															configurable: true,
															enumerable: true
														});
														Object.defineProperty(navigator, 'appVersion', {
															get: function() { return '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'; },
															configurable: true,
															enumerable: true
														});
													} catch(e) {
														console.error('loadURL后注入navigator属性失败:', e);
													}
												}
											})();
										`)
										console.log('[openMeituanWithCookie] 美团医药：loadURL后立即注入User-Agent成功')
									} catch (e) {
										console.warn('[openMeituanWithCookie] 美团医药：loadURL后注入失败:', e)
									}
								}, 50)
							}
							
							// 设置超时检测，如果10秒后页面还没加载完成，提示用户
							setTimeout(() => {
								if (isLoading.value) {
									console.warn('[openMeituanWithCookie] 页面加载超时，可能存在问题')
									uni.showToast({
										title: '页面加载较慢，请检查网络',
										icon: 'none',
										duration: 3000
									})
								}
							}, 10000)
						} catch (e) {
							console.error('[openMeituanWithCookie] loadURL调用失败:', e)
							isLoading.value = false
							uni.hideLoading()
							uni.showToast({
								title: '加载URL失败: ' + (e.message || '未知错误'),
								icon: 'none',
								duration: 3000
							})
						}
					}, cookieWaitTime)
					
					// 通过evalJS注入代码设置navigator.userAgent（确保页面能读取到正确的UA）
					// 对于美团闪购和美团医药，需要在页面加载前就注入User-Agent
					const shouldInjectUA = shopType.value === 2 || shopType.value === 3
					if (shouldInjectUA) {
						// 立即注入一次，在页面加载前就设置好
						try {
							let evalUserAgent = ""
							const banben = Math.floor(Math.random() * 601) + 1
							evalUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
								Math.floor(Math.random() * 16) +
								"_7) AppleWebKit/" + banben +
								".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
							
							// 对于美团医药，需要更早注入，在webview创建后立即注入
							if (shopType.value === 3) {
								setTimeout(() => {
									w.evalJS(`
										(function() {
											try {
												Object.defineProperty(navigator, 'userAgent', {
													get: function() { return '${evalUserAgent}'; },
													configurable: true
												});
												Object.defineProperty(navigator, 'platform', {
													get: function() { return 'MacIntel'; },
													configurable: true
												});
												Object.defineProperty(navigator, 'vendor', {
													get: function() { return 'Apple Computer, Inc.'; },
													configurable: true
												});
											} catch(e) {}
										})();
									`)
									console.log('[openMeituanWithCookie] 美团医药：预先注入PC端User-Agent成功')
								}, 100)
							} else {
								w.evalJS(`
									Object.defineProperty(navigator, 'userAgent', {
										get: function() { return '${evalUserAgent}'; },
										configurable: true
									});
									Object.defineProperty(navigator, 'platform', {
										get: function() { return 'MacIntel'; },
										configurable: true
									});
								`)
								console.log('[openMeituanWithCookie] 预先注入PC端User-Agent成功')
							}
						} catch (e) {
							console.warn('[openMeituanWithCookie] 预先注入User-Agent失败:', e)
						}
					}
					
					setTimeout(() => {
						try {
							// 重新获取userAgent（确保与之前设置的一致）
							let evalUserAgent = ""
							if (shopType.value === 2 || shopType.value === 3) {
								// 美团闪购和美团医药：使用PC端User-Agent
								const banben = Math.floor(Math.random() * 601) + 1
								evalUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
									Math.floor(Math.random() * 16) +
									"_7) AppleWebKit/" + banben +
									".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
							} else {
								// 美团外卖：使用移动端User-Agent
								evalUserAgent = "Mozilla/5.0 (Linux; Android 13; VOG-AL00 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36"
							}
							
							// 对于美团医药，注入更多的navigator属性以更好地模拟PC环境
							if (shopType.value === 3) {
								w.evalJS(`
									(function() {
										try {
											Object.defineProperty(navigator, 'userAgent', {
												get: function() { return '${evalUserAgent}'; },
												configurable: true
											});
											Object.defineProperty(navigator, 'platform', {
												get: function() { return 'MacIntel'; },
												configurable: true
											});
											Object.defineProperty(navigator, 'vendor', {
												get: function() { return 'Apple Computer, Inc.'; },
												configurable: true
											});
											Object.defineProperty(navigator, 'appVersion', {
												get: function() { return '5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'; },
												configurable: true
											});
										} catch(e) {}
									})();
								`)
								console.log('[openMeituanWithCookie] 美团医药：通过evalJS设置完整的PC端navigator属性成功')
							} else {
								w.evalJS(`
									Object.defineProperty(navigator, 'userAgent', {
										get: function() { return '${evalUserAgent}'; },
										configurable: true
									});
									Object.defineProperty(navigator, 'platform', {
										get: function() { return '${shopType.value === 2 ? 'MacIntel' : 'Linux armv8l'}'; },
										configurable: true
									});
								`)
								console.log('[openMeituanWithCookie] 通过evalJS设置navigator.userAgent成功，UA类型:', (shopType.value === 2 || shopType.value === 3) ? 'PC端' : '移动端')
							}
							
							// 对于美团闪购和美团医药，额外检查页面加载状态
							if (shopType.value === 2 || shopType.value === 3) {
								setTimeout(() => {
									try {
										const platformName = shopType.value === 2 ? 'MeituanFlash' : 'MeituanMedicine'
										w.evalJS(`
											(function() {
												console.log('[${platformName}] 页面URL:', window.location.href);
												console.log('[${platformName}] 页面标题:', document.title);
												console.log('[${platformName}] 页面readyState:', document.readyState);
												console.log('[${platformName}] navigator.userAgent:', navigator.userAgent);
												console.log('[${platformName}] body内容长度:', document.body ? document.body.innerHTML.length : 0);
												if (document.body) {
													var errorElements = document.querySelectorAll('.error, .fail, [class*="error"], [class*="fail"]');
													if (errorElements.length > 0) {
														console.error('[${platformName}] 发现错误元素:', errorElements.length, '个');
													}
												}
											})();
										`)
									} catch (e) {
										console.warn('[openMeituanWithCookie] 美团平台页面检查失败:', e)
									}
								}, 2000)
							}
						} catch (e) {
							console.warn('[openMeituanWithCookie] 通过evalJS设置navigator.userAgent失败:', e)
						}
					}, 500)
					isLoading.value = false
					uni.hideLoading()
					w.show();
					
					// 等待webview显示后再显示缩放按钮（cover-view需要webview存在才能正确显示）
					setTimeout(() => {
						showZoomButtons.value = true
					}, 500)
					
					// 初始化缩放级别（最小缩小比例）
					zoomLevel.value = 50
					console.log('[openMeituanWithCookie] 初始化缩放级别为50%')
					
					// 多次尝试应用初始缩放，确保生效
					setTimeout(() => {
						console.log('[openMeituanWithCookie] 第1次应用初始缩放')
						applyZoom()
					}, 500)
					setTimeout(() => {
						console.log('[openMeituanWithCookie] 第2次应用初始缩放（确保生效）')
						applyZoom()
					}, 1500)
					setTimeout(() => {
						console.log('[openMeituanWithCookie] 第3次应用初始缩放（确保生效）')
						applyZoom()
					}, 3000)
				}, 500)
			}, 500)
		})
		// #endif
	}

	// 使用cookie打开淘宝闪购零售后台（shopType=5，使用nr.ele.me，与美团外卖保持一致）
	const openElemeRetailWithCookie = (cookie) => {
		// #ifdef H5
		location.href = "https://www.baidu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			console.error('[openElemeRetailWithCookie] cookie为空')
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		const baseUrl = 'https://nr.ele.me/'
		const domain = '.ele.me'
		
		console.log('[openElemeRetailWithCookie] 开始打开淘宝闪购零售后台，cookie长度:', cookie.length)
		uni.showLoading({})
		
		// 第一步：清理cookie和缓存（必须在设置User-Agent之前）
		console.log('[openElemeRetailWithCookie] 清理cookie和缓存')
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清除缓存（确保User-Agent生效）
		plus.cache.clear(() => {
			console.log('[openElemeRetailWithCookie] 缓存清理完成，开始设置User-Agent')
			
			// 第二步：设置User-Agent（必须在创建webview之前设置，使用PC端User-Agent）
			const banben = Math.floor(Math.random() * 601) + 1
			const userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
				Math.floor(Math.random() * 16) +
				"_7) AppleWebKit/" + banben +
				".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
			plus.navigator.setUserAgent(userAgent)
			console.log('[openElemeRetailWithCookie] User-Agent设置完成:', userAgent)
			
			let getWindowInfo = uni.getWindowInfo()
			const webviewid = 'pcwebview'
			const webview_setting = {
				'kernel': 'UIWebview',
				'disablePlus': false,
				'scrollIndicator': 'all',
				'width': getWindowInfo.screenWidth + 'px',
				'top': (systemBarHeight.value + 44) + 'px',
				'height': (getWindowInfo.windowHeight - systemBarHeight.value - 44 - 80) + 'px',
				'scalable': true,
			}
			
			// 第三步：关闭之前的webview（如果存在）
			if (w) {
				try {
					plus.webview.close(w)
				} catch (e) {
					console.warn('[openElemeRetailWithCookie] 关闭旧webview失败:', e)
				}
			}
			
			// 第四步：创建webview（先创建登录页面的webview，然后在cache.clear回调中设置cookie和loadURL）
			w = plus.webview.create("https://nr.ele.me/login", webviewid, webview_setting)
			
			// 添加错误监听
			w.addEventListener('error', (e) => {
				console.error('[openElemeRetailWithCookie] WebView加载错误:', e)
				uni.showToast({
					title: '页面加载失败，请检查网络',
					icon: 'none',
					duration: 3000
				})
			})
			
			// 添加页面加载完成监听
			w.addEventListener('loading', (e) => {
				console.log('[openElemeRetailWithCookie] 页面加载状态:', e.loading ? '加载中' : '加载完成')
				if (!e.loading) {
					// 页面加载完成
					isLoading.value = false
					uni.hideLoading()
					console.log('[openElemeRetailWithCookie] 页面加载完成')
				}
			})
			
			// 添加页面标题变化监听（用于检测页面是否成功加载）
			w.addEventListener('receivedTitle', (e) => {
				console.log('[openElemeRetailWithCookie] 页面标题:', e.title)
				if (e.title && e.title !== '') {
					console.log('[openElemeRetailWithCookie] 页面加载成功，标题:', e.title)
					isLoading.value = false
					uni.hideLoading()
				}
			})
			
			// 添加页面加载错误监听（检测HTTP错误）
			w.addEventListener('onReceivedHttpError', (e) => {
				console.error('[openElemeRetailWithCookie] HTTP错误:', e.statusCode, 'URL:', e.url)
				isLoading.value = false
				uni.hideLoading()
				uni.showToast({
					title: `页面加载失败: HTTP ${e.statusCode}`,
					icon: 'none',
					duration: 3000
				})
			})
			
			// 第五步：设置cookie（在loadURL之前设置）
			console.log('[openElemeRetailWithCookie] 设置cookie，baseUrl:', baseUrl, 'domain:', domain)
			set_cookie(w, cookie, baseUrl, domain)
			
			// 等待cookie设置完成后再加载URL
			setTimeout(() => {
				// 第六步：加载URL
				console.log('[openElemeRetailWithCookie] 准备加载URL:', baseUrl)
				w.loadURL(baseUrl)
				w.show()
				
				// 设置超时检测，如果10秒后页面还没加载完成，提示用户
				setTimeout(() => {
					if (isLoading.value) {
						console.warn('[openElemeRetailWithCookie] 页面加载超时，可能存在问题')
						uni.showToast({
							title: '页面加载较慢，请检查网络',
							icon: 'none',
							duration: 3000
						})
					}
				}, 10000)
			}, 200)
			
			// 等待webview显示后再显示缩放按钮（cover-view需要webview存在才能正确显示）
			setTimeout(() => {
				showZoomButtons.value = true
			}, 500)
			
			// 初始化缩放级别（最小缩小比例）
			zoomLevel.value = 50
			console.log('[openElemeRetailWithCookie] 初始化缩放级别为50%')
			
			// 多次尝试应用初始缩放，确保生效
			setTimeout(() => {
				console.log('[openElemeRetailWithCookie] 第1次应用初始缩放')
				applyZoom()
			}, 500)
			setTimeout(() => {
				console.log('[openElemeRetailWithCookie] 第2次应用初始缩放（确保生效）')
				applyZoom()
			}, 1500)
			setTimeout(() => {
				console.log('[openElemeRetailWithCookie] 第3次应用初始缩放（确保生效）')
				applyZoom()
			}, 3000)
		})
		// #endif
	}

	// 使用cookie打开淘宝闪购外卖后台（shopType=4，使用melody.shop.ele.me，与shop-management.vue的open_melody保持一致）
	const openElemeWithCookie = (cookie) => {
		// #ifdef H5
		location.href = "https://www.baidu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			console.error('[openElemeWithCookie] cookie为空')
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		console.log('[openElemeWithCookie] 开始打开饿了么后台，cookie长度:', cookie.length)
		
		uni.showLoading({})
		
		// 设置PC端User-Agent（与shop-management.vue保持一致）
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = 'pcwebview'
		const webview_setting = {
			'width': getWindowInfo.screenWidth + 'px',
			'top': (systemBarHeight.value + 44) + 'px',
			'height': (getWindowInfo.windowHeight - systemBarHeight.value - 44 - 80) + 'px',
			'scalable': true,
		}
		
		// 构建重定向URL（包含shopId的dashboard URL）
		let redirect_url = ''
		if (officialId.value) {
			redirect_url = `https://melody.shop.ele.me/app/shop/${officialId.value}/dashboard#app.shop.dashboard`
		} else {
			redirect_url = 'https://melody.shop.ele.me'
		}
		
		// 关闭之前的webview（如果存在）
		if (w) {
			try {
				plus.webview.close(w)
			} catch (e) {
				console.warn('[openElemeWithCookie] 关闭旧webview失败:', e)
			}
		}
		
		// 先创建webview（与shop-management.vue保持一致，在cache.clear之前创建）
		// 注意：先创建登录页面的webview，然后在cache.clear回调中设置cookie和loadURL
		w = plus.webview.create("https://melody.shop.ele.me/login", webviewid, webview_setting)
		
		// 添加错误监听
		w.addEventListener('error', (e) => {
			console.error('[openElemeWithCookie] WebView加载错误:', e)
			isLoading.value = false
			uni.hideLoading()
			uni.showToast({
				title: '页面加载失败，请检查网络',
				icon: 'none',
				duration: 3000
			})
		})
		
		// 添加页面加载完成监听
		w.addEventListener('loading', (e) => {
			console.log('[openElemeWithCookie] 页面加载状态:', e.loading ? '加载中' : '加载完成')
			if (!e.loading) {
				// 页面加载完成
				isLoading.value = false
				uni.hideLoading()
				console.log('[openElemeWithCookie] 页面加载完成')
			}
		})
		
		// 添加页面标题变化监听（用于检测页面是否成功加载）
		w.addEventListener('receivedTitle', (e) => {
			console.log('[openElemeWithCookie] 页面标题:', e.title)
			if (e.title && e.title !== '') {
				console.log('[openElemeWithCookie] 页面加载成功，标题:', e.title)
				isLoading.value = false
				uni.hideLoading()
			}
		})
		
		// 添加HTTP错误监听
		w.addEventListener('onReceivedHttpError', (e) => {
			console.error('[openElemeWithCookie] HTTP错误:', e.statusCode, e.url)
			isLoading.value = false
			uni.hideLoading()
			uni.showToast({
				title: `页面加载失败: HTTP ${e.statusCode}`,
				icon: 'none',
				duration: 3000
			})
		})
		
		// 清理cookie和缓存（与shop-management.vue保持一致）
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清理缓存并在回调中设置cookie和加载URL（与shop-management.vue保持一致）
		plus.cache.clear(() => {
			console.log('[openElemeWithCookie] 缓存清理完成，开始设置cookie')
			
			// 设置cookie（与shop-management.vue保持一致）
			set_cookie(w, cookie, 'https://melody.shop.ele.me/', '.ele.me')
			
			// 等待cookie设置完成后再加载URL
			setTimeout(() => {
				// 加载重定向URL（与shop-management.vue保持一致）
				console.log('[openElemeWithCookie] 准备加载URL:', redirect_url)
				w.loadURL(redirect_url)
				w.show()
				
				// 设置超时检测，如果10秒后页面还没加载完成，提示用户
				setTimeout(() => {
					if (isLoading.value) {
						console.warn('[openElemeWithCookie] 页面加载超时，可能存在问题')
						uni.showToast({
							title: '页面加载较慢，请检查网络',
							icon: 'none',
							duration: 3000
						})
					}
				}, 10000)
			}, 200)
			
			// 等待webview显示后再显示缩放按钮（cover-view需要webview存在才能正确显示）
			setTimeout(() => {
				showZoomButtons.value = true
			}, 500)
			
			// 初始化缩放级别（最小缩小比例）
			zoomLevel.value = 50
			console.log('[openElemeWithCookie] 初始化缩放级别为50%')
			
			// 多次尝试应用初始缩放，确保生效
			setTimeout(() => {
				console.log('[openElemeWithCookie] 第1次应用初始缩放')
				applyZoom()
			}, 500)
			setTimeout(() => {
				console.log('[openElemeWithCookie] 第2次应用初始缩放（确保生效）')
				applyZoom()
			}, 1500)
			setTimeout(() => {
				console.log('[openElemeWithCookie] 第3次应用初始缩放（确保生效）')
				applyZoom()
			}, 3000)
		})
		console.log('[openElemeWithCookie] 清理缓存')
		// #endif
	}

	// 使用cookie打开京东平台后台（支持京东零售、京东外卖）
	// 注意：京东零售(shopType=6)和京东外卖(shopType=8)使用完全相同的逻辑和URL
	const openJDDJWithCookie = (cookie) => {
		// #ifdef H5
		location.href = "https://www.baidu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			console.error('[openJDDJWithCookie] cookie为空')
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		console.log('[openJDDJWithCookie] 开始打开京东后台，shopType:', shopType.value, 'cookie长度:', cookie.length)
		uni.showLoading({})
		
		// 后台URL（与PC端保持一致）
		const backendUrl = 'https://store.jddj.com/'
		
		// 第一步：清理cookie和缓存（必须在设置User-Agent之前）
		console.log('[openJDDJWithCookie] 清理cookie和缓存')
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清除缓存（确保User-Agent生效）
		plus.cache.clear(() => {
			console.log('[openJDDJWithCookie] 缓存清理完成，开始设置User-Agent')
			
			// 第二步：设置User-Agent（必须在创建webview之前设置，使用PC端User-Agent）
			const banben = Math.floor(Math.random() * 601) + 1
			plus.navigator.setUserAgent(
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
				Math.floor(Math.random() * 16) +
				"_7) AppleWebKit/" + banben +
				".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
			)
			console.log('[openJDDJWithCookie] User-Agent设置完成')
			
			let getWindowInfo = uni.getWindowInfo()
			const webviewid = `jddj-webview-${shopType.value}`
			const webview_setting = {
				'kernel': 'UIWebview',
				'disablePlus': false,
				'scrollIndicator': 'all',
				'width': getWindowInfo.screenWidth + 'px',
				'top': (systemBarHeight.value + 44) + 'px',
				'height': (getWindowInfo.windowHeight - systemBarHeight.value - 44 - 80) + 'px',
				'scalable': true,
			}
			
			// 第三步：关闭之前的webview（如果存在）
			if (w) {
				try {
					plus.webview.close(w)
				} catch (e) {
					console.warn('[openJDDJWithCookie] 关闭旧webview失败:', e)
				}
			}
			
			// 第四步：创建webview
			console.log('[openJDDJWithCookie] 创建webview，URL:', backendUrl)
			w = plus.webview.create(backendUrl, webviewid, webview_setting)
			
			setTimeout(() => {
				plus.webview.close(w);
				setTimeout(() => {
					// 第五步：再次设置User-Agent（确保生效）
					console.log('[openJDDJWithCookie] 再次设置User-Agent')
					const banben2 = Math.floor(Math.random() * 601) + 1
					plus.navigator.setUserAgent(
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
						Math.floor(Math.random() * 16) +
						"_7) AppleWebKit/" + banben2 +
						".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben2 + ".36"
					)
					
					// 第六步：重新打开webview
					w = plus.webview.open("", webviewid, webview_setting);
					
					// 第七步：设置cookie（在loadURL之前设置，参考抖音的实现方式，为多个URL设置cookie）
					console.log('[openJDDJWithCookie] 设置cookie，原始cookie长度:', cookie.length)
					console.log('[openJDDJWithCookie] 原始cookie完整内容:', cookie)
					console.log('[openJDDJWithCookie] 原始cookie内容（前500字符）:', cookie.substring(0, 500))
					// 需要为多个URL设置cookie（与PC端保持一致，参考PC端的additionalTargets）
					const jddjUrls = [
						'https://store.jddj.com',
						'https://jddj.com',
						'https://store1.jddj.com',
						'https://login.o2o.jd.com',
						'https://passport.jd.com',
						'https://lsp-store1.jddj.com',
						'https://josl-privilege1.jddj.com'
					]
					
					// 为每个URL设置cookie，参考PC端的实现方式
					// PC端为每个URL都设置了cookie，并且使用domain为.store.jddj.com和.jddj.com
					for (const url of jddjUrls) {
						console.log('[openJDDJWithCookie] 为URL设置cookie（无domain）:', url)
						set_cookie(null, cookie, url, '')
						// 尝试使用domain参数（参考PC端使用.store.jddj.com）
						console.log('[openJDDJWithCookie] 为URL设置cookie（domain=.store.jddj.com）:', url)
						set_cookie(null, cookie, url, '.store.jddj.com')
						// 尝试使用domain参数（参考PC端使用.jddj.com）
						console.log('[openJDDJWithCookie] 为URL设置cookie（domain=.jddj.com）:', url)
						set_cookie(null, cookie, url, '.jddj.com')
					}
					
					// 为PC端domainTargets中的域名设置cookie（与PC端保持一致）
					// PC端会从这些域名获取cookie：store.jddj.com, .store.jddj.com, jddj.com, .jddj.com, 
					// store1.jddj.com, .store1.jddj.com, lsp-store1.jddj.com, .lsp-store1.jddj.com,
					// josl-privilege1.jddj.com, .josl-privilege1.jddj.com, o2o.jd.com, .o2o.jd.com,
					// jd.com, .jd.com, jd.local, .jd.local
					const jddjDomains = [
						'.store.jddj.com',
						'.jddj.com',
						'.store1.jddj.com',
						'.lsp-store1.jddj.com',
						'.josl-privilege1.jddj.com',
						'.o2o.jd.com',
						'.jd.com'
					]
					// 为每个域名设置cookie（使用基础URL）
					for (const domain of jddjDomains) {
						// 根据域名构建对应的URL
						let baseUrl = ''
						if (domain.includes('jddj.com')) {
							baseUrl = 'https://store.jddj.com'
						} else if (domain.includes('jd.com')) {
							baseUrl = 'https://login.o2o.jd.com'
						}
						if (baseUrl) {
							console.log('[openJDDJWithCookie] 为域名设置cookie，domain:', domain, 'baseUrl:', baseUrl)
							set_cookie(null, cookie, baseUrl, domain)
						}
					}
					
					// 验证cookie是否设置成功（延迟一下，确保cookie已设置）
					setTimeout(() => {
						try {
							const savedCookie = plus.navigator.getCookie(backendUrl)
							console.log('[openJDDJWithCookie] 验证cookie设置结果，URL:', backendUrl)
							console.log('[openJDDJWithCookie] 已设置的cookie长度:', savedCookie ? savedCookie.length : 0)
							console.log('[openJDDJWithCookie] 已设置的cookie完整内容:', savedCookie || '无cookie')
							if (savedCookie) {
								// 检查关键cookie是否存在
								const hasPin = savedCookie.includes('pin=')
								const hasSdtoken = savedCookie.includes('sdtoken=')
								const hasThor = savedCookie.includes('thor=')
								const hasFlash = savedCookie.includes('flash=')
								const hasVenderId = savedCookie.includes('vender_id=')
								const hasLightKey = savedCookie.includes('light_key=')
								console.log('[openJDDJWithCookie] 关键cookie检查 - pin:', hasPin, 'sdtoken:', hasSdtoken, 'thor:', hasThor, 'flash:', hasFlash, 'vender_id:', hasVenderId, 'light_key:', hasLightKey)
							} else {
								console.warn('[openJDDJWithCookie] ⚠️ 验证失败：未获取到cookie，可能设置失败')
							}
						} catch (e) {
							console.error('[openJDDJWithCookie] 验证cookie失败:', e)
						}
					}, 300)
					
					// 第八步：在加载URL之前先注入修复代码（防止页面加载时出现错误）
					const preloadFixScript = `
						(function() {
							// 在页面加载前就定义这些变量，防止QWebChannel初始化失败
							if (typeof qt === 'undefined') {
								window.qt = {
									webChannelTransport: {
										send: function() {},
										onmessage: null
									}
								};
							}
							if (typeof app_version === 'undefined') {
								window.app_version = '1.0.0';
							}
							if (typeof os === 'undefined') {
								window.os = 'unknown';
							}
						})();
					`
					try {
						w.evalJS(preloadFixScript)
						console.log('[openJDDJWithCookie] 预加载修复脚本已注入')
					} catch (e) {
						console.warn('[openJDDJWithCookie] 预加载修复脚本注入失败（可能页面还未加载）:', e)
					}
					
					// 第九步：加载URL（不延迟，直接加载）
					console.log('[openJDDJWithCookie] 加载URL:', backendUrl)
					w.loadURL(backendUrl)
					isLoading.value = false
					uni.hideLoading()
					w.show();
					
					// 等待页面加载完成后通过JavaScript注入cookie和修复错误（确保页面能读取到）
					// 使用多个时间点注入，确保在页面加载的各个阶段都能修复错误
					const injectFixAndCookie = () => {
						try {
							console.log('[openJDDJWithCookie] 尝试通过JavaScript注入cookie和修复错误')
							// 将cookie字符串分割为数组
							const cookieItems = cookie.split('; ').filter(item => item.trim())
							// 构建JavaScript代码来设置每个cookie并修复QWebChannel错误
							let cookieScript = `
								(function() {
									try {
										// 修复QWebChannel相关错误（京东后台页面可能尝试使用Electron的QWebChannel）
										if (typeof qt === 'undefined') {
											window.qt = {
												webChannelTransport: {
													send: function() {},
													onmessage: null
												}
											};
										}
										// 修复app_version和os未定义错误
										if (typeof app_version === 'undefined') {
											window.app_version = '1.0.0';
										}
										if (typeof os === 'undefined') {
											window.os = 'unknown';
										}
										
										// 注入cookie
										const cookieItems = ${JSON.stringify(cookieItems)};
										cookieItems.forEach(function(item) {
											if (item && item.indexOf('=') > 0) {
												document.cookie = item + '; path=/; domain=.jddj.com';
												document.cookie = item + '; path=/; domain=.store.jddj.com';
												document.cookie = item + '; path=/';
											}
										});
										console.log('[JSCookie] Cookie注入完成，当前document.cookie长度:', document.cookie.length);
										console.log('[JSCookie] 当前document.cookie（前500字符）:', document.cookie.substring(0, 500));
									} catch(e) {
										console.error('[JSCookie] Cookie注入失败:', e);
									}
								})();
							`
							w.evalJS(cookieScript)
							console.log('[openJDDJWithCookie] JavaScript cookie注入脚本已执行')
						} catch (e) {
							console.error('[openJDDJWithCookie] JavaScript注入cookie失败:', e)
						}
					}
					
					// 在多个时间点注入，确保修复代码在页面加载的各个阶段都能执行
					setTimeout(injectFixAndCookie, 500)  // 页面开始加载时
					setTimeout(injectFixAndCookie, 1000) // 页面加载中
					setTimeout(injectFixAndCookie, 1500) // 页面加载完成时
					setTimeout(injectFixAndCookie, 3000) // 页面完全加载后
					
					// 等待webview显示后再显示缩放按钮（cover-view需要webview存在才能正确显示）
					setTimeout(() => {
						showZoomButtons.value = true
					}, 500)
					
					// 初始化缩放级别（最小缩小比例）
					zoomLevel.value = 50
					console.log('[openJDDJWithCookie] 初始化缩放级别为50%')
					
					// 多次尝试应用初始缩放，确保生效
					setTimeout(() => {
						console.log('[openJDDJWithCookie] 第1次应用初始缩放')
						applyZoom()
					}, 500)
					setTimeout(() => {
						console.log('[openJDDJWithCookie] 第2次应用初始缩放（确保生效）')
						applyZoom()
					}, 2000)
					setTimeout(() => {
						console.log('[openJDDJWithCookie] 第3次应用初始缩放（确保生效）')
						applyZoom()
					}, 4000)
				}, 500)
			}, 500)
		})
		// #endif
	}

	// 使用cookie打开抖音平台后台（支持抖店即时零售、抖音外卖）
	const openJinritemaiWithCookie = (cookie) => {
		// #ifdef H5
		location.href = "https://www.baidu.com/";
		// #endif
		// #ifdef APP-PLUS
		if (!cookie) {
			console.error('[openJinritemaiWithCookie] cookie为空')
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		console.log('[openJinritemaiWithCookie] 开始打开抖音后台，shopType:', shopType.value, 'cookie长度:', cookie.length)
		uni.showLoading({})
		
		// 后台URL（与PC端保持一致）
		const backendUrl = 'https://jsls.jinritemai.com/mfa/homepage'
		
		// 第一步：清理cookie和缓存（必须在设置User-Agent之前）
		console.log('[openJinritemaiWithCookie] 清理cookie和缓存')
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		// 清除缓存（确保User-Agent生效）
		plus.cache.clear(() => {
			console.log('[openJinritemaiWithCookie] 缓存清理完成，开始设置User-Agent')
			
			// 第二步：设置User-Agent（必须在创建webview之前设置）
			const banben = Math.floor(Math.random() * 601) + 1
			plus.navigator.setUserAgent(
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
				Math.floor(Math.random() * 16) +
				"_7) AppleWebKit/" + banben +
				".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
			)
			console.log('[openJinritemaiWithCookie] User-Agent设置完成')
			
			let getWindowInfo = uni.getWindowInfo()
			const webviewid = `jinritemai-webview-${shopType.value}`
			const webview_setting = {
				'kernel': 'UIWebview',
				'disablePlus': false,
				'scrollIndicator': 'all',
				'width': getWindowInfo.screenWidth + 'px',
				'top': (systemBarHeight.value + 44) + 'px',
				'height': (getWindowInfo.windowHeight - systemBarHeight.value - 44 - 80) + 'px',
				'scalable': true,
			}
			
			// 第三步：关闭之前的webview（如果存在）
			if (w) {
				try {
					plus.webview.close(w)
				} catch (e) {
					console.warn('[openJinritemaiWithCookie] 关闭旧webview失败:', e)
				}
			}
			
			// 第四步：创建webview
			console.log('[openJinritemaiWithCookie] 创建webview，URL:', backendUrl)
			w = plus.webview.create(backendUrl, webviewid, webview_setting)
			
			setTimeout(() => {
				plus.webview.close(w);
				setTimeout(() => {
					// 第五步：再次设置User-Agent（确保生效）
					console.log('[openJinritemaiWithCookie] 再次设置User-Agent')
					const banben2 = Math.floor(Math.random() * 601) + 1
					plus.navigator.setUserAgent(
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
						Math.floor(Math.random() * 16) +
						"_7) AppleWebKit/" + banben2 +
						".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben2 + ".36"
					)
					
					// 第六步：重新打开webview
					w = plus.webview.open("", webviewid, webview_setting);
					
					// 第七步：设置cookie（在loadURL之前设置，参考美团外卖的方式，第一个参数为null）
					console.log('[openJinritemaiWithCookie] 设置cookie')
					// 需要为多个域名设置cookie
					const jinritemaiUrls = [
						'https://fxg.jinritemai.com',
						'https://jsls.jinritemai.com',
						'https://jinritemai.com'
					]
					
					for (const url of jinritemaiUrls) {
						set_cookie(null, cookie, url, '')
					}
					
					// 第八步：加载URL（不延迟，直接加载）
					console.log('[openJinritemaiWithCookie] 加载URL:', backendUrl)
					w.loadURL(backendUrl)
					isLoading.value = false
					uni.hideLoading()
					w.show();
					
					// 等待webview显示后再显示缩放按钮（cover-view需要webview存在才能正确显示）
					setTimeout(() => {
						showZoomButtons.value = true
					}, 500)
					
					// 初始化缩放级别（最小缩小比例）
					zoomLevel.value = 50
					console.log('[openJinritemaiWithCookie] 初始化缩放级别为50%')
					
					// 多次尝试应用初始缩放，确保生效
					setTimeout(() => {
						console.log('[openJinritemaiWithCookie] 第1次应用初始缩放')
						applyZoom()
					}, 500)
					setTimeout(() => {
						console.log('[openJinritemaiWithCookie] 第2次应用初始缩放（确保生效）')
						applyZoom()
					}, 1500)
					setTimeout(() => {
						console.log('[openJinritemaiWithCookie] 第3次应用初始缩放（确保生效）')
						applyZoom()
					}, 3000)
				}, 500)
			}, 500)
		})
		// #endif
	}

	onUnmounted(() => {
		// 清理webview
		// #ifdef APP-PLUS
		if (w) {
			try {
				// 先隐藏webview
				w.hide()
				// 然后关闭webview
				plus.webview.close(w)
				w = null
				console.log('[onUnmounted] WebView已关闭')
			} catch (e) {
				console.warn('[onUnmounted] 关闭WebView失败:', e)
			}
		}
		// 清理所有cookie
		try {
			plus.navigator.removeAllCookie()
			plus.navigator.removeCookie()
			plus.navigator.removeSessionCookie()
		} catch (e) {
			console.warn('[onUnmounted] 清理cookie失败:', e)
		}
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

	.zoom-tip {
		margin-right: 16rpx !important;
		padding: 8rpx 16rpx !important;
		background-color: rgba(0, 0, 0, 0.7) !important;
		border-radius: 8rpx !important;
		max-width: 450rpx !important;
		font-size: 22rpx !important;
		color: #fff !important;
		line-height: 1.5 !important;
		text-align: right !important;
		word-break: break-all !important;
		white-space: normal !important;
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
