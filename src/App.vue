<script setup lang="ts">
	import {
		onLaunch,
		onShow,
		onHide
	} from "@dcloudio/uni-app";
	import {
		ref,
		reactive
	} from 'vue'
	import { versionUpdate } from '@/utils/version.js'
	import { useAuthStore } from '@/store/auth.ts'
	
	const version = ref()
	const authStore = useAuthStore()
	
	onLaunch(() => {
		// console.log("App Launch");
		versionUpdate(true);
		
		// #ifdef APP-PLUS
		// 全局禁用iOS左滑返回手势
		try {
			const currentWebview = plus.webview.currentWebview()
			if (currentWebview) {
				currentWebview.setStyle({
					popGesture: 'none'
				})
			}
		} catch (e) {
			// 设置失败，静默处理
		}
		
		// #endif
		
		// 恢复登录状态：从本地存储中读取token并恢复到store
		const token = uni.getStorageSync('token')
		if (token) {
			// console.log("恢复登录状态：检测到已保存的token");
			authStore.setToken(token)
			const userId = uni.getStorageSync('userId')
			if (userId) {
				authStore.setUserId(userId)
			}
		} else {
			// console.log("未检测到登录信息");
		}
	});
	
	onShow(() => {
		// console.log("App Show");
	});
	
	onHide(() => {
		// console.log("App Hide");
		// 应用进入后台时，可以选择停止服务以节省资源
		// 也可以保持运行，这样用户能及时收到通知
		// 这里我们保持运行，确保用户能收到通知
		// stopNotificationService() // 如果需要省电，可以取消注释
	});
</script>
<style>
	::-webkit-scrollbar {
		display: none;
	}
</style>