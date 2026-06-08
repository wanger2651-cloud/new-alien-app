<!-- 教程页面已注释，商家版 tabBar 已移除，此页面不再使用 -->
<!--
<template>
	<view class="teach">
		<image src="../../static/teach/teachBg_001.png" class="teachBg" mode=""></image>
		<view class="nav" :style="`top: ${systemBarHeight}px;`">视频教学</view>
		<view class="teachContent" :style="`top: calc(44px + ${systemBarHeight}px);`">
			<wd-tabs v-model="tab" inactiveColor="#333333" sticky swipeable @click="selectTab">
				<block v-for="item in tabList" :key="item.name">
					<wd-tab :title="item.name"></wd-tab>
				</block>
			</wd-tabs>
			<view class="content">
				<scroll-view class="videoList" :scroll-top="scrollTop" scroll-y="true" @scroll="scroll" :style="`height: calc(100vh - ${systemBarHeight}px - 44px - 46px - env(safe-area-inset-bottom));`">
					<view class="videoItem" v-for="item in videoList" :key="item.id">
						<video :id=" 'myVideo' + item.id" @error="videoErrorCallback" class="video" :src="item.src"
							:poster="item.img" controls></video>
						<view class="vidoeBox">
							<view class="boxTitle">{{ item.title }}</view>
							<view class="boxTime">上架时间 {{ item.crtim }}</view>
							<view class="boxFooter">
								<view class="footerTime">4:38</view>
								<view class="shed">
									<wd-progress :percentage="12" :color="['#FACC05']" />
								</view>
							</view>
						</view>
					</view>
					<view v-if="videoList.length === 0" class="not-data">
						暂无数据
					</view>
					<wd-pagination v-model.async="queryParams.page" :total="pageTotal"
						:page-size.async="queryParams.pageSize" style="width:100%;background-color: transparent;"
						@change="getList" show-icon></wd-pagination>
				</scroll-view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		ref,
		onMounted,
		reactive
	} from 'vue';
	import {
		TeachApi
	} from '@/api/teach'
	import {
		onTabItemTap,
		onLoad
	} from '@dcloudio/uni-app';

	const tab = ref(0)
	const tabList = ref([])
	const videoList = ref([])
	const queryParams = reactive({
		page: 1,
		pagesize: 10,
		group: ''
	})
	const pageTotal = ref(0)
	const maxPageSize = ref(0)
	const systemBarHeight = ref(0)
	const scrollTop = ref(0)
	const scrollTopOld = reactive({
		scrollTop: 0
	})

	const scroll = (e) => {
		scrollTopOld.scrollTop = e.detail.scrollTop
	}
	const videoErrorCallback = () => {

	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const getTabList = async () => {
		uni.showLoading({})
		try {
			const data = await TeachApi.getTabList()
			tabList.value = data.data
			if (tabList.value && tabList.value.length) {
				console.log(tabList.value)
				queryParams.group = tabList.value[0].id
				getList()
			} else {
				uni.showToast({
					title: '未获取到导航栏',
					icon: 'error',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			}
		} catch {
			console.log(15555)
		} finally {
			uni.hideLoading({})
		}
	}

	const getList = async (value) => {
		if (value) {
			queryParams.page = value.value
		}
		uni.showLoading({})
		try {
			const data = await TeachApi.getList(queryParams)
			videoList.value = data.data.rows
			pageTotal.value = data.data.total
			scrollTop.value = scrollTopOld.scrollTop
			nextTick(function() {
				scrollTop.value = 0
			});
		} catch {
			console.log(15555)
		} finally {
			uni.hideLoading({})
		}
	}

	const selectTab = (event) => {
		queryParams.group = tabList.value[event.index].id
		queryParams.page = 1
		getList()
	}

	onTabItemTap(() => {
		uni.setTabBarStyle({
			color: '#7A7E83',
			selectedColor: '#FACC05'
		})
	})

	onMounted(() => {
		getTabList()
	})
	onLoad(() => {
		getSysteminfo()
	})
</script>

<style scoped lang="scss">
	::v-deep .wd-tabs {
		background-color: transparent !important;
	}

	::v-deep .wd-tabs__nav {
		background-color: transparent !important;
	}

	.teach {
		min-height: 100vh;
		background: #FFFFFF;

		.teachBg {
			position: fixed;
			top: 0;
			left: 0;
			width: 100%;
			height: 279px;
			z-index: 1;
		}

		.nav {
			background-color: transparent;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: center;
			font-size: 18px;
			color: rgba(0, 0, 0, 0.9);
			width: 100%;
			height: 44px;
			position: fixed;
			font-weight: 600;
			z-index: 2;
		}

		.teachContent {
			position: fixed;
			top: 176rpx;
			z-index: 3;
			// padding-top: 176rpx;

			.videoList {
				overflow: scroll;
				padding-bottom: 200rpx;
				box-sizing: border-box;
				width: 100%;
				box-sizing: border-box;
				padding: 0 30rpx;

				.videoItem {
					width: 100%;
					border-bottom: 1rpx solid #DFDFDF;
					display: flex;
					align-items: flex-start;
					box-sizing: border-box;
					padding: 20rpx 0;

					.video {
						width: 260rpx;
						height: 146rpx;
						background: #D8D8D8;
						border-radius: 8rpx;
					}

					.vidoeBox {
						width: calc(100% - 260rpx);
						box-sizing: border-box;
						padding-left: 20rpx;

						.boxTitle {
							font-weight: 500;
							font-size: 30rpx;
							color: #333333;
							width: 100%;
							margin-bottom: 16rpx;
							word-break: break-all;
							text-overflow: ellipsis;
							overflow: hidden;
							display: -webkit-box;
							-webkit-box-orient: vertical;
							-webkit-line-clamp: 2;
							min-height: 22px;
							/* 这里是超出几行省略 */
						}

						.boxTime {
							font-weight: 400;
							font-size: 24rpx;
							color: #999999;
							margin-bottom: 12rpx;
						}

						.boxFooter {
							display: flex;
							flex-direction: row;
							align-items: center;

							.footerTime {
								width: 90rpx;
								height: 38rpx;
								background: #F2F2F2;
								border-radius: 19rpx;
								font-weight: 400;
								font-size: 24rpx;
								color: #999999;
								text-align: center;
							}

							.shed {
								width: calc(100% - 90rpx);
								box-sizing: border-box;
								padding-left: 20rpx;
							}
						}
					}
				}
			}
		}
	}

	.pagination {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: flex-end;
		box-sizing: border-box;
		padding: 40rpx 60rpx;

		.btn {
			padding: 20rpx 30rpx;
			background-color: rgb(241, 240, 238);
			border-radius: 10rpx;
			color: rgb(104, 104, 104);
		}

		.btn-des {
			background-color: rgba(241, 240, 238, .2);
		}

		.page-num {
			color: #000000;
			margin: 0 20rpx;
		}
	}

	.not-data {
		padding: 40rpx;
		text-align: center;
	}

	::v-deep .wd-tabs__line {
		background-color: #333333;
	}
</style>
-->
