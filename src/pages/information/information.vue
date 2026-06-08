<template>
	<view class="information">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="消息通知"></wd-navbar>
		<view class="mag-container" :style="`padding-top: calc(${systemBarHeight}px + 44px + 30rpx);`">
			<view class="msgCard" @click="getRead(item)" v-for="item in msgList" :key="item.id">
				<view class="cardTitle">{{ item.title }}</view>
				<view class="cardText">{{ item.msg }}</view>
				<view class="line"></view>
				<view class="cardFooter">
					<view class="footerTime">{{ item.crtim }}</view>
					<view class="footerRight">
						<view class="all">查看全部</view>
						<image src="../../static/information/arrow.png" class="toRight" alt="" />
					</view>
				</view>
			</view>
			<view v-if="msgList.length === 0" class="not-data">
				暂无数据
			</view>
			<wd-pagination v-model.async="queryParams.page" :total="pageTotal" :page-size.async="queryParams.pagesize"
				style="width:100%;background-color: transparent;" @change="getList" show-icon></wd-pagination>
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
		MessageApi
	} from '@/api/message'
	import {
		onTabItemTap,
		onLoad
	} from '@dcloudio/uni-app';

	const msgList = ref([])
	const queryParams = reactive({
		page: 1,
		pagesize: 20
	})
	const maxPageSize = ref(0)
	const pageTotal = ref(0)
	const systemBarHeight = ref(0)

	const getList = async (value) => {
		if (value) {
			queryParams.page = value.value
		}
		uni.showLoading({})
		try {
			const data = await MessageApi.getList(queryParams)
			msgList.value = data.data.rows
			pageTotal.value = data.data.total
			scrollTop()
		} catch {
			console.log(15555)
		} finally {
			uni.hideLoading({})
		}
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const getRead = (item) => {
		// if (item.avtag) {
		// 	const { id, title, msg, notes } = item
		// 	MessageApi.update({ id, title, msg, notes })
		// }
	}

	const scrollTop = () => {
		uni.pageScrollTo({
			scrollTop: 0, // 滚动到页面的目标位置  这个是滚动到顶部, 0 
			duration: 0 // 滚动动画的时长
		})
	}

	onTabItemTap(() => {
		uni.setTabBarStyle({
			color: '#7A7E83',
			selectedColor: '#FACC05'
		})
	})

	onMounted(() => {
		getList()
	})
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
			padding: 0 30rpx;
		}

		.msgCard {
			width: 100%;
			// height: 264rpx;
			background: #FFFFFF;
			border-radius: 12rpx;
			padding: 30rpx;
			box-sizing: border-box;
			margin-bottom: 30rpx;
		}

		.cardTitle {
			font-size: 28rpx;
			color: #333333;
			font-weight: 500;
		}

		.cardText {
			font-weight: 400;
			font-size: 26rpx;
			color: #666666;
			margin-top: 12rpx;
		}

		.line {
			width: 630rpx;
			height: 1rpx;
			background-color: #DFDFDF;
			margin-top: 30rpx;
		}

		.cardFooter {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			height: 77rpx;

			.footerTime {
				font-size: 24rpx;
				color: #999999;
			}

			.footerRight {
				display: flex;
				flex-direction: row;
				align-items: center;

				.all {
					font-size: 26rpx;
					color: #999999;
				}

				.toRight {
					width: 21rpx;
					height: 21rpx;
					margin-left: 10rpx;
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
</style>