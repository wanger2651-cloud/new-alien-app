<template>
	<view class="log ml-15 mr-15 bg-white mb-15">
		<view class="title pl-15 pr-15 h-60 lh-60">日志</view>
		<view
			class="log-item log-item-header w-335 h-35 bgHeader text-12 ml-5 mr-5 flex items-center text-center justify-between">
			<view class="text-#2e7a0d w-55">订单序号</view>
			<view class="text-#2e7a0d w-55">出餐用时</view>
			<view class="text-#2e7a0d w-160">出餐时间</view>
			<view class="text-#2e7a0d w-55">订单状态</view>
		</view>
		<view>
			<template v-if="list.length">
				<view
					class="flex ml-5 mr-5 bdline text-11  items-center text-center h-46 lh-46 log-item log-content justify-between "
					v-for="(item,index) in list" :key="index">
					<view class="order w-50">#{{ item.dayseq }}</view>
					<view class="date w-50">{{ getTime(item) }}</view>
					<view class="status w-160" style="line-height: 20px;">{{ item.out_endTime }}</view>
					<view class="date w-50">
						<text v-if="item.state === 2">出餐成功</text>
						<text v-if="item.state === 2">出餐失败</text>
					</view>
				</view>
				<wd-pagination v-if="list.length" class="pagination-pager" v-model.async="queryParams.PageIndex" :total="total"
					:page-size.async="queryParams.PageSize" @change="getPageLogData" show-icon></wd-pagination>
			</template>
			<template v-else>
				<view style="text-align: center;line-height: 100px;">暂无数据</view>
			</template>
		</view>
	</view>
</template>

<script setup>
	import { ref, onMounted, reactive } from 'vue';
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import { logApi } from '@/api/log'

	const list = ref([]);
	const total = ref(0);
	let queryParams = reactive({
		PageIndex: 1,
		PageSize: 10,
		func_code: '',
		shop: ''
	})
	
	const getPageLogData = ({ value }) => {
		queryParams.PageIndex = value
		getLogData()
	}
	const getLogData = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		logApi.getLogList(queryParams).then(res => {
			if (res.code === 200) {
				list.value = res.data.rows
				total.value = res.data.total
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const getTime = (row) => {
      const endTime = new Date(row.out_endTime)
      const startTime = new Date(row.order_time)
      // 计算两个时间点之间的毫秒差
      const diffInMilliseconds = endTime - startTime;

      // 将毫秒转换为分钟和秒
      const diffInMinutes = Math.floor(diffInMilliseconds / (1000 * 60));
      const remainingSeconds = Math.round((diffInMilliseconds % (1000 * 60)) / 1000);

      return `${diffInMinutes} 分 ${remainingSeconds} 秒`
    }
	
	onLoad((options) => {
		if (options) {
			queryParams.shop = options.shopId
			queryParams.func_code = options.type
			if (queryParams.shop) {
				getLogData()
			}
		}
	})
</script>

<style lang="scss" scoped>
	.bgHeader {
		width: 100%;
		box-sizing: border-box;
		padding: 0 10rpx;
		margin: 0;
		background: linear-gradient(0deg, #FFFDFD, #ebffd5);
	}

	.bdline {
		border-bottom: 1rpx solid #DFDFDF;
	}
</style>