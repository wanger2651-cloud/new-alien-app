/**
 * IM 消息通知服务
 * 用于在后台监听新消息并显示通知
 */

import request from '@/utils/request'
import { useAuthStore } from '@/store/auth.ts'
import { parseDateTimestamp } from '@/utils/date'

interface UnreadCountVo {
	ShopId?: string | null
	TotalUnreadCount: number
	UnreadSessionCount: number
}

class ImNotificationService {
	private checkInterval: ReturnType<typeof setInterval> | null = null
	private lastUnreadCount: number = 0
	private isRunning: boolean = false
	private checkIntervalMs: number = 8000 // 8秒检查一次，提高实时性
	private authStore: any = null
	private lastCheckTime: number = 0 // 上次检查时间，用于检测定时器是否被暂停
	private heartbeatInterval: ReturnType<typeof setInterval> | null = null // 心跳检测定时器

	/**
	 * 启动消息监听服务
	 */
	start() {
		if (this.isRunning) {
			console.log('IM消息通知服务已在运行')
			return
		}

		// 检查是否已登录
		this.authStore = useAuthStore()
		if (!this.authStore.token) {
			console.log('未登录，不启动IM消息通知服务')
			return
		}

		this.isRunning = true
		console.log('启动IM消息通知服务，检查间隔:', this.checkIntervalMs, 'ms')

		// 立即检查一次
		this.checkUnreadMessages()

		// 定时检查
		// 使用更可靠的方式，确保后台也能运行
		this.lastCheckTime = Date.now()
		this.checkInterval = setInterval(() => {
			// 检查服务是否还在运行（防止被系统清理）
			if (!this.isRunning) {
				console.warn('[通知服务] 服务状态异常，重新标记为运行中')
				this.isRunning = true
			}
			// 更新检查时间（在调用前更新，确保即使调用失败也能记录时间）
			this.lastCheckTime = Date.now()
			this.checkUnreadMessages()
		}, this.checkIntervalMs)
		
		// 启动心跳检测：如果定时器被系统暂停，自动重启
		this.startHeartbeat()
		
		// #ifdef APP-PLUS
		// 配置后台运行，确保应用在后台时也能继续检查消息
		// 注意：plus.runtime.lockOrientation 在某些版本中可能不可用
		// 如果需要保持应用活跃，可以考虑使用其他方式，如后台任务
		try {
			if (typeof plus !== 'undefined' && plus.runtime) {
				// lockOrientation API 可能不存在，先检查是否有该方法
				// 如果不存在，跳过此配置
				if (typeof plus.runtime.lockOrientation === 'function') {
					plus.runtime.lockOrientation('portrait-primary')
					console.log('[通知服务] 已配置后台运行支持')
				} else {
					if (import.meta.env.DEV) {
						console.log('[通知服务] lockOrientation API 不可用，跳过配置')
					}
				}
			}
		} catch (e) {
			// 忽略错误，不影响通知服务的正常运行
			if (import.meta.env.DEV) {
				console.warn('[通知服务] 配置后台运行失败:', e)
			}
		}
		// #endif
	}

	/**
	 * 启动心跳检测：检测定时器是否被系统暂停
	 */
	private startHeartbeat() {
		// 清除旧的心跳检测（如果存在）
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
		}
		
		// 每20秒检查一次，如果超过30秒没有检查，说明定时器被暂停了
		this.heartbeatInterval = setInterval(() => {
			const now = Date.now()
			const timeSinceLastCheck = this.lastCheckTime > 0 ? now - this.lastCheckTime : 0
			
			// 如果超过30秒没有检查（正常应该是8秒），说明定时器被暂停了
			if (timeSinceLastCheck > 30000 && this.isRunning && this.lastCheckTime > 0) {
				console.warn(`[通知服务] ⚠️ 检测到定时器可能被暂停，距离上次检查: ${Math.round(timeSinceLastCheck / 1000)}秒，重启服务`)
				// 重启服务
				this.stop()
				setTimeout(() => {
					if (this.authStore && this.authStore.token) {
						this.start()
					}
				}, 1000)
			} else if (this.isRunning && import.meta.env.DEV && timeSinceLastCheck > 0) {
				// 正常运行时，输出心跳日志（仅开发环境）
				console.log(`[通知服务] 💓 心跳正常，距离上次检查: ${Math.round(timeSinceLastCheck / 1000)}秒`)
			}
		}, 20000) // 每20秒检查一次
	}
	
	/**
	 * 停止消息监听服务
	 */
	stop() {
		if (this.checkInterval) {
			clearInterval(this.checkInterval)
			this.checkInterval = null
		}
		if (this.heartbeatInterval) {
			clearInterval(this.heartbeatInterval)
			this.heartbeatInterval = null
		}
		this.isRunning = false
		this.lastUnreadCount = 0
		this.lastCheckTime = 0
		console.log('停止IM消息通知服务')
	}

	/**
	 * 检查未读消息
	 */
	private async checkUnreadMessages() {
		try {
			// 检查是否已登录
			if (!this.authStore || !this.authStore.token) {
				console.log('未登录，停止检查未读消息')
				this.stop()
				return
			}

			// 使用 IM/Session/list 接口获取会话列表，然后统计未读数
			// 这样更可靠，因为该接口已经在其他地方正常使用
			const result: any = await request({
				url: 'IM/Session/list',
				method: 'GET',
				data: {
					page: 1,
					pageSize: 100 // 获取前100个会话，应该足够统计未读数
				}
			})

		// 提取会话列表（统一解析逻辑）
		const sessions = this.extractSessionsFromResponse(result)

		// 统计所有会话的未读消息总数
		const unreadCount = sessions.reduce((sum: number, session: any) => {
			return sum + (Number(session.unread_count) || 0)
		}, 0)

			// 如果有新消息（未读数增加）
			if (unreadCount > this.lastUnreadCount && this.lastUnreadCount > 0) {
				const newMessageCount = unreadCount - this.lastUnreadCount
				if (import.meta.env.DEV) {
					console.log(`[通知服务] 检测到新消息: ${newMessageCount} 条，总未读数: ${unreadCount}`)
				}
				
				// 找到有未读消息的最新会话
				const latestSession = this.findLatestUnreadSession(sessions)
				if (latestSession && import.meta.env.DEV) {
					console.log('[通知服务] 最新会话:', latestSession.shop_name || '未知')
				}
				
				// 显示通知
				this.showNotification(newMessageCount, unreadCount, latestSession)
			} else if (import.meta.env.DEV && unreadCount !== this.lastUnreadCount) {
				// 调试日志：记录检查结果（仅开发环境）
				console.log(`[通知服务] 未读数变化: ${this.lastUnreadCount} -> ${unreadCount}`)
			}

			// 更新未读数
			this.lastUnreadCount = unreadCount

			// 更新应用角标（仅APP端）
			// #ifdef APP-PLUS
			this.updateBadge(unreadCount)
			// #endif

		} catch (error) {
			// 只在开发环境输出详细错误
			if (import.meta.env.DEV) {
				console.error('[通知服务] 检查未读消息失败:', error)
			}
			// 如果是因为认证问题，停止服务
			if (error && typeof error === 'object' && 'statusCode' in error) {
				const statusCode = (error as any).statusCode
				if (statusCode === 401 || statusCode === 403) {
					console.warn('[通知服务] 认证失败，停止服务')
					this.stop()
				}
			}
		}
	}

	/**
	 * 显示通知
	 */
	private showNotification(newMessageCount: number, totalUnreadCount: number, latestSession?: any) {
		// 构建通知内容
		let title = '新消息'
		let content = newMessageCount === 1 
			? '您有1条新消息' 
			: `您有${newMessageCount}条新消息`
		
		// 如果有最新会话信息，显示更详细的内容
		if (latestSession) {
			const shopName = latestSession.shop_name || '未知店铺'
			const lastMessage = latestSession.last_message || ''
			// 截取消息内容，避免过长（通知内容通常有长度限制）
			const messagePreview = lastMessage.length > 40 
				? lastMessage.substring(0, 40) + '...' 
				: lastMessage
			
			// 标题显示店铺名
			title = shopName
			// 内容显示消息预览，如果没有消息内容则显示店铺名+新消息提示
			if (messagePreview) {
				content = messagePreview
			} else {
				content = newMessageCount === 1 
					? '您有1条新消息' 
					: `您有${newMessageCount}条新消息`
			}
		}

		// #ifdef APP-PLUS
		// APP端使用原生通知
		console.log('[通知服务] 准备显示通知:', { title, content, totalUnreadCount })
		
		try {
			if (typeof plus !== 'undefined') {
				// 方案1：使用 plus.push.createMessage（5+ Runtime API，推荐用于真机）
				if (plus.push && typeof plus.push.createMessage === 'function') {
					try {
						// 注意：plus.push.createMessage 的第一个参数是消息内容，第二个参数是配置
						// 但某些平台可能 title 和 content 的显示位置不同，所以将店铺名也包含在内容中
						const notificationContent = latestSession 
							? `${title}: ${content}` 
							: content
						
						// 构建完整的会话信息，用于点击通知时跳转
						const notificationPayload = latestSession ? {
							type: 'im-message',
							sessionId: latestSession.id || '',
							sessionUid: latestSession.site_session || '',
							shopId: latestSession.shop_id || '',
							customerId: latestSession.customer_id || '',
							customerName: latestSession.customer_name || '',
							shopName: latestSession.shop_name || '',
							siteType: latestSession.site_type || ''
						} : {
							type: 'im-message'
						}
						
						plus.push.createMessage(notificationContent, {
							title: title, // 标题显示店铺名
							cover: false,
							badge: totalUnreadCount,
							// 添加完整会话信息，方便点击通知时跳转
							// 注意：某些平台需要字符串格式的 payload
							payload: JSON.stringify(notificationPayload)
						})
						console.log('[通知服务] ✅ 使用 plus.push.createMessage 发送通知成功')
						console.log('[通知服务] 通知内容 - 标题:', title, '内容:', notificationContent)
						return
					} catch (e) {
						console.error('[通知服务] plus.push.createMessage 失败:', e)
					}
				}
				
				// 方案2：使用 plus.notification.create（备用方案）
				if (plus.notification && typeof plus.notification.create === 'function') {
					try {
						// 确保 body 中包含店铺信息
						const notificationBody = latestSession 
							? `${title}: ${content}` 
							: content
						
						// 构建完整的会话信息
						const notificationPayload = {
							type: 'im-message',
							sessionId: latestSession?.id || '',
							sessionUid: latestSession?.site_session || '',
							shopId: latestSession?.shop_id || '',
							customerId: latestSession?.customer_id || '',
							customerName: latestSession?.customer_name || '',
							shopName: latestSession?.shop_name || '',
							siteType: latestSession?.site_type || ''
						}
						
						plus.notification.create(title, {
							title: title, // 标题：店铺名
							body: notificationBody, // 正文：店铺名 + 消息内容
							icon: latestSession?.shop_img || '/static/logo.png', // 使用店铺图标
							badge: totalUnreadCount,
							// 添加完整会话信息
							payload: JSON.stringify(notificationPayload)
						})
						console.log('[通知服务] ✅ 使用 plus.notification.create 发送通知成功')
						console.log('[通知服务] 通知内容 - 标题:', title, '正文:', notificationBody)
						return
					} catch (e) {
						console.error('[通知服务] plus.notification.create 失败:', e)
					}
				}
				
				// 方案3：使用 uni.createLocalNotification（uni-app官方API，某些版本可能不支持）
				// @ts-ignore
				if (typeof uni.createLocalNotification !== 'undefined') {
					try {
						// 确保内容中包含店铺信息
						const notificationContent = latestSession 
							? `${title}: ${content}` 
							: content
						
						// 构建完整的会话信息
						const notificationPayload = {
							type: 'im-message',
							sessionId: latestSession?.id || '',
							sessionUid: latestSession?.site_session || '',
							shopId: latestSession?.shop_id || '',
							customerId: latestSession?.customer_id || '',
							customerName: latestSession?.customer_name || '',
							shopName: latestSession?.shop_name || '',
							siteType: latestSession?.site_type || ''
						}
						
						// @ts-ignore
						uni.createLocalNotification({
							title: title, // 标题：店铺名
							content: notificationContent, // 内容：店铺名 + 消息内容
							sound: 'default',
							badge: totalUnreadCount,
							payload: {
								type: 'im-message',
								path: '/pages/aggregated-service/session-detail',
								...notificationPayload // 展开所有会话信息
							}
						})
						console.log('[通知服务] ✅ 使用 uni.createLocalNotification 发送通知成功')
						console.log('[通知服务] 通知内容 - 标题:', title, '内容:', notificationContent)
						return
					} catch (e) {
						console.error('[通知服务] uni.createLocalNotification 失败:', e)
					}
				}
			}
			
			// 方案4：降级到 uni.showToast（全平台支持，但只是Toast不是系统通知）
			console.warn('[通知服务] ⚠️ 所有原生通知API都不可用，降级到Toast')
			uni.showToast({
				title: content,
				icon: 'none',
				duration: 3000
			})
		} catch (e) {
			console.error('[通知服务] ❌ 显示通知异常:', e)
			// 最终降级方案：使用 uni.showToast
			uni.showToast({
				title: content,
				icon: 'none',
				duration: 3000
			})
		}
		// #endif

		// #ifdef H5
		// H5端使用浏览器通知API
		if ('Notification' in window && Notification.permission === 'granted') {
			const notification = new Notification(title, {
				body: content,
				icon: '/static/logo.png',
				tag: 'im-message',
				requireInteraction: false
			})
			
			// 点击通知跳转到消息管理页面
			notification.onclick = () => {
				window.focus()
				// 如果使用 uni-app 路由，可以这样跳转
				// uni.navigateTo({ url: '/pages/aggregated-service/message-manage' })
				notification.close()
			}
		} else if ('Notification' in window && Notification.permission === 'default') {
			// 首次使用，请求权限
			Notification.requestPermission().then(permission => {
				if (permission === 'granted') {
					const notification = new Notification(title, {
						body: content,
						icon: '/static/logo.png',
						tag: 'im-message'
					})
					notification.onclick = () => {
						window.focus()
						notification.close()
					}
				}
			})
		}
		// #endif

		// 小程序端使用uni.showToast（作为降级方案）
		// #ifdef MP
		uni.showToast({
			title: content,
			icon: 'none',
			duration: 2000
		})
		// #endif
	}

	/**
	 * 更新应用角标（仅APP端）
	 */
	private updateBadge(count: number) {
		// #ifdef APP-PLUS
		try {
			// iOS角标
			// #ifdef APP-PLUS-IOS
			if (typeof plus !== 'undefined' && plus.runtime) {
				plus.runtime.setBadgeNumber(count)
			}
			// #endif

			// Android角标（需要第三方插件或原生实现）
			// #ifdef APP-PLUS-ANDROID
			// Android角标通常需要原生插件支持
			// 这里可以集成第三方插件如 uni-badge 或自定义原生插件
			// #endif
		} catch (e) {
			console.error('更新角标失败:', e)
		}
		// #endif
	}

	/**
	 * 重置未读数（用于用户已读消息后）
	 */
	resetUnreadCount() {
		this.lastUnreadCount = 0
		// #ifdef APP-PLUS
		this.updateBadge(0)
		// #endif
	}

	/**
	 * 设置检查间隔（毫秒）
	 */
	setCheckInterval(ms: number) {
		this.checkIntervalMs = ms
		if (this.isRunning) {
			// 重启服务以应用新间隔
			this.stop()
			this.start()
		}
	}
	
	/**
	 * 查找最新的未读会话
	 */
	private findLatestUnreadSession(sessions: any[]): any | null {
		const unreadSessions = sessions.filter((s: any) => (Number(s.unread_count) || 0) > 0)
		if (unreadSessions.length === 0) {
			return null
		}
		// 按最后消息时间排序，获取最新的
		unreadSessions.sort((a: any, b: any) => {
			const timeA = parseDateTimestamp(a.last_message_time || a.crtim || 0, 0)
			const timeB = parseDateTimestamp(b.last_message_time || b.crtim || 0, 0)
			return timeB - timeA
		})
		return unreadSessions[0]
	}
	
	/**
	 * 从API响应中提取会话列表（统一解析逻辑）
	 */
	private extractSessionsFromResponse(result: any): any[] {
		// 格式1: { rows: [], total: 100 }
		if (Array.isArray(result?.rows)) {
			return result.rows
		}
		// 格式2: { data: { rows: [], total: 100 } }
		if (result?.data && Array.isArray(result.data.rows)) {
			return result.data.rows
		}
		// 格式3: { Data: { Rows: [], Total: 100 } }
		if (result?.Data && Array.isArray(result.Data.Rows)) {
			return result.Data.Rows
		}
		// 格式4: { data: { Rows: [], Total: 100 } }
		if (result?.data && Array.isArray(result.data.Rows)) {
			return result.data.Rows
		}
		// 格式5: 直接是数组
		if (Array.isArray(result)) {
			return result
		}
		return []
	}
	
	/**
	 * 获取服务运行状态（用于调试）
	 */
	getStatus() {
		return {
			isRunning: this.isRunning,
			lastCheckTime: this.lastCheckTime,
			timeSinceLastCheck: this.lastCheckTime > 0 ? Date.now() - this.lastCheckTime : 0,
			checkInterval: this.checkIntervalMs,
			lastUnreadCount: this.lastUnreadCount,
			hasCheckInterval: this.checkInterval !== null,
			hasHeartbeatInterval: this.heartbeatInterval !== null
		}
	}
}

// 导出单例
export const imNotificationService = new ImNotificationService()

