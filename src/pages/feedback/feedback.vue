<template>
	<view class="information">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-arrow :safeAreaInsetTop="true"
			title="意见反馈"></wd-navbar>
		<view class="mag-container" :style="`padding-top: calc(${systemBarHeight}px + 44px);`">
			<view class="cardTitle">问题描述</view>
			<view class="msgCard">
				<textarea placeholder="详情描述问题或建议，至少2个字" v-model="queryParams.msg" class="contact"></textarea>
			</view>
			<view class="cardTitle">图片(选填, 提供问题截图)</view>
			<view class="msgCard">
				<view class="img-item" v-for="(item, index) in queryParams.img" @click="preview(item)">
					<image :src="item" alt="" class="preview-img" mode="aspectFill" />
					<image src="@/static/user/close.png" alt="" class="close-img" @click.stop="delImg(index)"></image>
				</view>
				<view class="img-item" @click="uploadImg">
					<image src="@/static/user/add-img.png" alt="" class="add-img" />
				</view>
			</view>
			<view class="cardTitle">联系方式(选填)</view>
			<view class="msgCard">
				<input
					class="contact-input"
					type="text"
					placeholder="用于与你联系"
					placeholder-class="contact-placeholder"
					v-model.trim="queryParams.contact"
				/>
			</view>
			<view class="submit" @click="submitMsg">
				提交
			</view>
		</view>
	</view>
</template>

<script setup lang="ts">
	import {
		ref
	} from 'vue';
	import {
		useAuthStore
	} from '@/store/auth'
	import {
		FeedBackApi
	} from '@/api/feedback'
	import { getLineApiUrl } from '@/config/lineConfig'
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import type { t_wmt_feedback } from '@/TsModel/Alien/Entity/Tables/sys/t_wmt_feedback'

	const authStore = useAuthStore()

	const queryParams = ref({
		contact: '',
		msg: '',
		img: [] as string[]
	})

	const handleClickLeft = () => {
		uni.navigateBack()
	}

	const uploadImg = () => {
		uni.chooseImage({
			count: 1, // 最多可以选择的图片张数，默认9
			// 仅选择原图，避免部分机型返回 webp 等服务端不支持格式
			sizeType: ['original'],
			sourceType: ['album', 'camera'], // 可以指定打开的相册或相机，默认二者都有
			success: function(res) {
				const tempFilePaths = res.tempFilePaths;
				const pickedPath = tempFilePaths?.[0] || ''
				if (!pickedPath) {
					uni.showToast({ title: '未选择图片', icon: 'none' })
					return
				}
				prepareAndUploadImage(pickedPath);
			}
		});
	}

	const isAllowedImage = (filePath: string) => {
		return /\.(jpg|jpeg|png|gif)$/i.test(filePath || '')
	}

	const convertToUploadableImage = (filePath: string): Promise<string> => {
		return new Promise((resolve) => {
			uni.compressImage({
				src: filePath,
				quality: 80,
				success: (res) => {
					const convertedPath = (res.tempFilePath || '').toLowerCase()
					if (isAllowedImage(convertedPath)) {
						resolve(res.tempFilePath)
						return
					}
					resolve(filePath)
				},
				fail: () => {
					resolve(filePath)
				}
			})
		})
	}

	// APP 端强制转成 JPG，规避 heic/webp 等格式被后端拒绝
	const forceConvertToJpgApp = (filePath: string): Promise<string> => {
		return new Promise((resolve) => {
			// #ifdef APP-PLUS
			try {
				// @ts-ignore
				if (typeof plus === 'undefined' || !plus?.zip?.compressImage) {
					resolve(filePath)
					return
				}
				const target = `_doc/feedback_${Date.now()}.jpg`
				// @ts-ignore
				plus.zip.compressImage({
					src: filePath,
					dst: target,
					format: 'jpg',
					quality: 80,
					overwrite: true
				}, () => {
					resolve(target)
				}, () => {
					resolve(filePath)
				})
			} catch (e) {
				resolve(filePath)
			}
			// #endif
			// #ifndef APP-PLUS
			resolve(filePath)
			// #endif
		})
	}

	const prepareAndUploadImage = async (filePath: string) => {
		let finalPath = filePath
		uni.showLoading({ title: '正在处理截图格式...' })
		// 先走 APP 强制 jpg，再走通用压缩兜底
		finalPath = await forceConvertToJpgApp(finalPath)
		if (!isAllowedImage(finalPath)) {
			finalPath = await convertToUploadableImage(finalPath)
		}
		uni.hideLoading()
		if (!isAllowedImage(finalPath)) {
			uni.showToast({ title: '截图格式暂不支持，请导出为 JPG/PNG 后重试', icon: 'none' })
			return
		}
		uploadImage(finalPath)
	}

	const getUploadUrl = (raw: any): string => {
		return (
			raw?.url ||
			raw?.data?.url ||
			raw?.Data?.url ||
			raw?.data?.Url ||
			raw?.Data?.Url ||
			''
		)
	}

	const getUploadErrorMsg = (raw: any): string => {
		return raw?.message || raw?.msg || raw?.Msg || '上传失败，请重试'
	}

	const buildUploadUrl = () => {
		const savedApiBaseUrl = uni.getStorageSync('apiBaseUrl')
		const savedLineType = uni.getStorageSync('lineType') || 'default'
		let baseUrl = savedApiBaseUrl || getLineApiUrl(savedLineType)
		if (!baseUrl) {
			baseUrl = getLineApiUrl('default')
		}
		if (!baseUrl.endsWith('/')) {
			baseUrl += '/'
		}
		return `${baseUrl}system/method/file/Upload`
	}

	const uploadImage = (filePath: string) => {
		uni.showLoading({ title: '上传中...' })
		const uploadUrl = buildUploadUrl()
		const uploadHeader: Record<string, string> = {
			Authorization: `Bearer ${authStore.token || ''}`
		}
		// #ifdef APP-PLUS
		const platform = uni.getStorageSync('platform')
		if (platform) {
			uploadHeader.platform = platform
		}
		uploadHeader['client-version'] = '5.2.7'
		// #endif

		uni.uploadFile({
			url: uploadUrl,
			filePath,
			name: 'file', // 文件对应的 key，开发者在服务端可以通过这个 key 获取到文件
			formData: {},
			header: uploadHeader,
			success: function(uploadRes) {
				if (uploadRes.statusCode !== 200) {
					uni.showToast({ title: `上传失败(${uploadRes.statusCode})`, icon: 'none' })
					console.error('上传失败: 状态码异常', uploadRes.statusCode, uploadRes.data)
					return
				}
				let parsed: any = {}
				try {
					parsed = typeof uploadRes.data === 'string'
						? JSON.parse(uploadRes.data || '{}')
						: (uploadRes.data || {})
				} catch (e) {
					console.error('解析上传响应失败:', e)
				}
				const imgUrl = getUploadUrl(parsed)
				if (imgUrl) {
					queryParams.value.img.push(imgUrl)
					uni.showToast({ title: '上传成功', icon: 'success' })
				} else {
					uni.showToast({ title: getUploadErrorMsg(parsed), icon: 'none' })
					console.error('上传响应缺少图片地址:', parsed, '原始响应:', uploadRes.data)
				}
			},
			fail: function(err) {
				console.error('上传失败', err);
				uni.showToast({ title: '上传失败，请检查网络', icon: 'none' })
			},
			complete: () => {
				uni.hideLoading()
			}
		});
	}

	const preview = (img: string) => {
		uni.previewImage({
			urls: queryParams.value.img, // 需要预览的图片http链接列表
			current: img // 当前显示图片的http链接，默认是第一个
		});
	}

	const submitMsg = async () => {
		const msg = (queryParams.value.msg || '').trim()
		const contact = String(queryParams.value.contact || '').trim()
		if (!msg) {
			uni.showModal({
				title: '提示',
				content: '问题描述未填写',
				showCancel: false
			})
			return
		}
		if (msg.length < 2) {
			uni.showModal({
				title: '提示',
				content: '问题描述至少2个字',
				showCancel: false
			})
			return
		}

		uni.showLoading({ title: '提交中...' })
		try {
			const payload: Partial<t_wmt_feedback> = {
				msg,
				contact,
				img: queryParams.value.img
			}
			await FeedBackApi.addFeedBack(payload)
			uni.showToast({
				title: '提交成功',
				icon: 'success',
				duration: 2000
			})
			setTimeout(() => {
				handleClickLeft()
			}, 1200)
		} catch (error) {
			console.error('提交反馈失败:', error)
		} finally {
			uni.hideLoading()
		}
	}

	const delImg = (index: number) => {
		queryParams.value.img.splice(index, 1)
	}

	const systemBarHeight = ref(0)
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = Number(res.statusBarHeight || 0);
			}
		});
	}
	onLoad(() => {
		getSysteminfo()
	})
</script>

<style scoped lang="scss">
	.information {
		min-height: 100vh;
		background: #F7F7F7;
		display: flex;
		flex-direction: column;
		align-items: center;

		.mag-container {
			width: 100%;
			box-sizing: border-box;
		}

		.msgCard {
			width: 690rpx;
			// height: 264rpx;
			background: #FFFFFF;
			border-radius: 12rpx;
			padding: 30rpx;
			box-sizing: border-box;
			margin: 0 auto 30rpx;
			display: flex;
			flex-wrap: wrap;

			.contact {
				height: 200rpx;
			}

			.contact-input {
				width: 100%;
				font-size: 28rpx;
				color: #333333;
			}

			.img-item {
				width: 180rpx;
				height: 180rpx;
				border-radius: 10rpx;
				background-color: rgb(237, 237, 237);
				display: flex;
				align-items: center;
				justify-content: center;
				margin: 10rpx;
				position: relative;

				.preview-img {
					width: 100%;
					height: 100%;
					border-radius: 10rpx;
					display: block;
				}

				.add-img {
					width: 100rpx;
					height: 100rpx
				}

				.close-img {
					width: 50rpx;
					height: 50rpx;
					position: absolute;
					top: 6rpx;
					right: 6rpx;
				}
			}
		}

		.cardTitle {
			width: 690rpx;
			font-size: 32rpx;
			color: #333333;
			font-weight: 500;
			padding: 30rpx;
		}

		.submit {
			width: calc(100% - 60rpx);
			height: 90rpx;
			margin: 40rpx auto 0;
			text-align: center;
			line-height: 90rpx;
			border-radius: 12rpx;
			background-color: rgb(110, 118, 216);
			color: #ffffff;
		}

	}

	::v-deep .contact-placeholder {
		color: #999999;
		font-size: 26rpx;
		white-space: nowrap;
	}
</style>