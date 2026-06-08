<template>
	<view class="smart-pic-page relative h-100vh flex flex-1 flex-col  bg-#FFF" style="display: flex;
    flex-direction: column;
    overflow: hidden;">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-text="返回" left-arrow :safeAreaInsetTop="true"
			title="智能换图"></wd-navbar>
		<view class="min-h-[400rpx] flex-none w-full relative" :class="{'is-elm-bg': shopType == 2}"
			:style="`margin-top: calc(${systemBarHeight}px + 44px); background:rgb(255, 245, 209)`">
			<view class="flex flex-row items-center justify-center relative pic-main">
				<image :src="currentPic.Img" class="h-[220rpx] w-[220rpx]" mode=""></image>
				<image :src="topImg" class="h-[220rpx] w-[220rpx] absolute" mode=""></image>
			</view>
			<view class="flex flex-row justify-between absolute bottom-0 w-full pic-container" style="margin: 10px 0;">
				<view class=" flex flex-row items-center ml-20">
					<wd-icon name="refresh" size="15px"></wd-icon>
					<span class="ml-[12rpx] text-[28rpx] text-T666666" @click="backPic">还原主图</span>
				</view>
				<!-- <view class="flex flex-row items-center">
					<view class="text-12 mr-10">到期时间 2024-11-16</view>
					<wd-button type="success" size="small" style="width:80rpx;"
						class="!h-[60rpx]  !rounded-[14rpx] !p-0 is-mt-btn"
						:class="{'is-elm-btn': shopType == 2}">续费</wd-button>
				</view> -->
				<view class="mr-[30rpx]">
					<wd-button type="success" size="small" style="width:80rpx;"
						class="!h-[60rpx]  !rounded-[14rpx] !p-0 is-mt-btn" :class="{'is-elm-btn': shopType == 2}"
						@click="savePic">保存</wd-button>
				</view>
			</view>
		</view>
		<view class="tab-wrapper h-60 flex items-center justify-center text-15 text-#1F1F1F">
			<view v-for="(item, index) in tabList" :key="index" class="tab-item flex flex-1 items-center justify-center"
				:class="{ active: tabActive === index }" @tap="changeTabTop(index)">
				<span class="py-[32rpx]">{{ item.name }}</span>
			</view>
		</view>

		<view class="mt-[20rpx] h-[70rpx] flex flex-row items-center justify-between px-[30rpx]">
			<view class="sub-tab flex flex-row items-center overflow-hidden rounded-[14rpx]" v-if="tabActive!=2">
				<view v-for="(item, index) in subTabList" :key="index"
					class="sub-tab-item px-[36rpx] py-[20rpx] text-[24rpx]"
					:class="{ active: subTabActive === index, 'is-elm-btn': shopType == 2 }" @tap="changeTab(index)">
					{{ item.Member.name }}
				</view>
			</view>

			<view class="flex flex-row items-center" @click="moveGif">
				<image src="@/static/shop/smartPic1.png" alt="" class="h-[34rpx] w-[34rpx]"></image>
				<span class="ml-[12rpx] text-[28rpx] text-T333333">移除效果</span>
			</view>
		</view>

		<view class="mt-[36rpx] content flex flex-1 flex-row " style="overflow: hidden;">
			<view style="overflow-y: auto;" class="w-[172rpx] flex-shrink-0 bg-#F6F6F6 py-[10rpx] text-[26rpx]"
				v-if="tabActive!=2">
				<view v-for="(item, index) in menuList" :key="index" class="menu-item flex items-center justify-center"
					:class="{ active: menuActive === index }" @click="onMenuChange(item, index)">
					{{ item.Member.name }}
				</view>
			</view>


			<!-- 上传文件 -->
			<view v-if="tabActive == 2"
				style="width: 100%;;display:flex;flex-direction: column;align-items: center;padding: 20rpx;">
				<wd-upload :file-list="fileList" image-mode="aspectFill" :header="uploadHeader" action="https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run/system/method/file/upload" :limit="1"
					@change="handleChangeUp"></wd-upload>
				<view>图片尺寸需大于600x450px,大小不能超过5M</view>
			</view>
			<view v-show="tabActive!=2" style="width: 100%;overflow-y: auto;">
				<view class="grid grid-cols-3 gap-12 px-[24rpx]">
					<view v-for="(item, idx) in list" :key="idx" style="position: relative;overflow: hidden;"
						class="h-[162rpx] w-[162rpx]" @click="handleClickList(item)">
						<image :src="realPic" class="h-[162rpx] w-[162rpx] real-pic"></image>
						<image :src="item.gif" class="h-[162rpx] w-[162rpx] z-8"
							style="position: absolute;top: 0;left: 0;"></image>
						<view class="h-[162rpx] w-[162rpx] z-9"
							style="position: absolute;top: 0;left: 0;background: rgba(0,0,0,0.5);"
							v-if="item.id == activeCoverId">
							<wd-icon name="check"
								style="line-height: 162rpx;color: #ffc100;position: absolute;top: 50%;left: 50%;transform: translateY(-50%) translateX(-50%);"
								size="30rpx"></wd-icon>
						</view>
					</view>
				</view>
				<wd-pagination v-model.async="queryParams.page" :total="total" :page-size.async="queryParams.pageSize"
					style="width:100%;background-color: transparent;" @change="getPicList" show-icon></wd-pagination>
			</view>
		</view>
	</view>
</template>
<script setup>
	import {
		ref,
		reactive
	} from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		ShopApi
	} from '@/api/shop.ts'
	import {
		logApi
	} from '@/api/log.ts'
	import {
		useAuthStore
	} from '@/store/auth.ts'

	const authStore = useAuthStore()
	const handleClickLeft = () => {
		uni.navigateBack()
	}
	const topImg = ref('')
	// 贴图类别
	const tabList = ref([])
	const tabActive = ref(0)
	// 子分类
	const subTabList = ref([])
	const subTabActive = ref(0)
	// 特效列表
	const menuList = ref([]);
	// 选中菜单序号
	const menuActive = ref(0)
	const activeCoverId = ref(0)
	// 切换菜单
	// const tabitem=ref(true)
	function onMenuChange(item, index) {
		if (menuActive.value === index) {
			return
		}
		menuActive.value = index
		queryParams.groupId = item.Member.id
		queryParams.page = 1
		getPicList()
	}
	// 菜单列表
	const list = ref([]);
	const finished = ref(false);
	const changeTab = (index) => {
		if (subTabActive.value === index) {
			return
		}
		subTabActive.value = index
		menuList.value = subTabList.value[index].children
		queryParams.groupId = menuList.value[0].Member.id
		getPicList()
	}
	const changeTabTop = (index) => {
		if (tabActive.value === index) {
			return
		}
		tabActive.value = index
		if (index !== 2) {
			subTabList.value = groupData.value[index].children
			queryParams.groupId = subTabList.value[0].children[0].Member.id
			getPicList()
		}
	}
	const fileList = ref([])
	const action = 'https://mockapi.eolink.com/zhTuw2P8c29bc981a741931bdd86eb04dc1e8fd64865cb5/upload'
	const handleClickList = (item) => {
		activeCoverId.value = item.id;
		topImg.value = item.gif
	}
	const moveGif = () => {
		topImg.value = ''
		activeCoverId.value = ''
	}
	const backPic = () => {
		const params = {
			"shop": shopId.value,
			"func_code": "CPDT",
			"method": "ReplaceFoodImgAsync",
			"parm_obj": {
				"foodId": currentPic.value.id,
				"img_sou": shopAllPic.value.filter(item => item.food_id === currentPic.value.id)[0].sou_img,
				"img_gif": '',
				"reset": true,
			}
		}
		setPic(params)
	}
	const savePic = () => {
		const params = {
			"shop": shopId.value,
			"func_code": "CPDT",
			"method": "ReplaceFoodImgAsync",
			"parm_obj": {
				"foodId": currentPic.value.id,
				"img_sou": shopAllPic.value.filter(item => item.food_id === currentPic.value.id)[0].sou_img,
				"img_gif": topImg.value,
				"reset": false,
			}
		}
		setPic(params)
	}
	const setPic = (params) => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		console.log(params, 'params')
		logApi.callCpData(params).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '操作成功',
					icon: 'success',
				})
				currentPic.value.Img = res.data
				topImg.value = ''
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const handleChangeUp = ({
		fileList
	}) => {
		console.log(fileList[0].response, '123')
		let url = ''
		if (fileList && fileList[0].response) {
			url = JSON.parse(fileList[0].response).url
		}
		console.log(url)
		topImg.value = url
	}
	const uploadHeader = {
		'Authorization': 'Bearer ' + authStore.token // 将token添加到请求头中
	}
	let groupData = ref([])
	const getGroupData = () => {
		ShopApi.getGroup({
			grouptype: 4,
			recursionchild: true
		}).then(res => {
			if (res.code === 200) {
				groupData.value = res.data
				groupData.value.forEach(item => {
					tabList.value.push(item.Member)
				})
				tabList.value.push({
					name: '自定义'
				})
				subTabList.value = groupData.value[tabActive.value].children
				menuList.value = subTabList.value[menuActive.value].children
				queryParams.groupId = menuList.value[0].Member.id
				getPicList()
			}
		})
	}
	const queryParams = reactive({
		page: 1,
		pageSize: 20,
		groupId: ''
	})
	const total = ref(0)
	const getPicList = (page) => {
		if (page) {
			queryParams.page = page.value
		}
		ShopApi.getGifList(queryParams).then(res => {
			if (res.code === 200) {
				list.value = res.data.rows
				total.value = res.data.total
			}
		})
	}

	const realPic = ref('')
	const shopAllPic = ref([])
	const getFunc = () => {
		logApi.getConfFunc({
			code: 'CPDT',
			shop: shopId.value
		}).then(res => {
			if (res.code === 200) {
				shopAllPic.value = res.data.conf_json.FoodItems
				realPic.value = shopAllPic.value.filter(item => item.food_id === currentPic.value.id)[0]
					.sou_img
			}
		})
	}

	const systemBarHeight = ref(0)
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	let currentPic = ref({})
	const shopType = ref('')
	const shopId = ref('')
	onLoad((options) => {
		getSysteminfo()
		if (options) {
			shopType.value = options.shopType
			shopId.value = options.id
			currentPic.value = uni.getStorageSync('currentPic');
			console.log(currentPic.value, '123654')
			getGroupData()
			getFunc()
		}
	})
</script>
<style lang="scss" scoped>
	.editor {
		width: 100%;
		height: 100%;
		display: flex;
		justify-content: center;

		.base {
			height: 100%;
		}

		.cover {
			position: absolute;
			height: 100%;
		}
	}

	.tab-item {
		&.active {
			font-size: 15px;
			font-weight: 500;

			span {
				padding: 8px 0;
				position: relative;
			}

			span::after {
				position: absolute;
				bottom: 0;
				content: "";
				border-radius: 6px;
				display: block;
				width: 60%;
				height: 3px;
				background-color: #2CCA87;
				margin-left: 50%;
				transform: translateX(-50%);
			}
		}
	}

	.sub-tab-item {
		background: #f7f6f5;
		color: #666666;

		&.active {
			background: #FACC05;
			font-size: 13px;
			font-weight: 500;
			color: #333;
		}

		&.active.is-elm-btn {
			font-size: 13px;
			font-weight: 500;
			background: #0492FA;
			color: #fff;
		}
	}

	.pic-container {
		.is-mt-btn {
			background: #FACC05;
			color: #333;
		}

		.is-elm-btn {
			background: #0492FA;
			color: #fff;
		}
	}


	.menu-item {
		padding: 14px 0;
		color: #999999;
		position: relative;

		&.active {
			background: white;
			color: #333333 !important;

			&::after {
				content: "";
				display: block;
				position: absolute;
				left: 0;
				width: 4px;
				height: 20px;
				background: #2CCA87;
			}
		}
	}

	.effect {
		overflow: hidden;

		&.active {
			.van-image {
				box-shadow: 0 0 2px red;
			}
		}
	}

	.content {
		height: calc(100% - 190px - 60px - 35px - 33px - 50px);
	}

	::v-deep.smart-pic-page {
		.van-uploader {
			width: 100%;
		}

		.van-uploader__upload {
			// width: 100%;
			margin: auto
		}

		.postiobox {
			position: absolute;
			left: 0;
			top: 0;
			display: flex;
			align-items: center;
			justify-content: center;
		}
	}

	.pic-main {
		display: flex;
		align-items: center;
		justify-content: center;

		image {
			width: 450rpx;
			height: 300rpx;
			margin-top: 30rpx;
		}
	}

	::v-deep .menu-item.active::after {
		display: none;
	}

	.is-elm-bg {
		background: #d3eeff !important;
	}

	.pic-item {
		position: relative;
		width: 162rpx;
		height: 162rpx;
	}

	.real-pic {}
</style>