<template>
	<view class="row-cell">
		<view v-for="(item,index) of dataList" :key="index">
			<view class="parent flex flex-row items-center border-b border-#DFDFDF">
				<view class="node w-139 flex flex-shrink-0 flex-row items-center bg-#F9F9F9 px-15 py-16"
					:class="[item.isExpand ? 'expand' : null]" @click="onCellExpand(item)">
					<image src="../static/shop/arrow.png" mode="" class="arrow mr-10 h-5 w-8"></image>
					<span class="text-13 text-T333333">{{ time_slots[index] }}</span>
				</view>
				<view class="flex flex-1 justify-center"> </view>
			</view>
			<view v-for="(item1,index1) of item" :key="index1"
				class="children flex-row items-center border-b border-#DFDFDF"
				:class="[item.isExpand ? 'flex' : 'hidden']">
				<view class="w-139 flex flex-shrink-0 flex-row items-center bg-#F9F9F9 py-16 pl-32">
					<span class="text-13 text-T333333">{{ sliceStr(item1.TimeRange.Start) }} -
						{{ sliceStr(item1.TimeRange.End) }}</span>
				</view>
				<view class="flex flex-1 justify-center">
					<view class="flex flex-row items-center">
						<wd-input-number v-model="item1.end_offer" @change="handleChange" :precision="2" :min="0" :step="0.1" />
					</view>
				</view>
			</view>
		</view>
		<view class="btn-item-main">
			<view class="save-btn" :class="{'is-elm-btn': shopType == 2, 'isV2': isV2}" @click="saveData">
				保存
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
		onLoad
	} from '@dcloudio/uni-app';
	import {
		logApi
	} from '@/api/log'
	const emit = defineEmits(['cancelHandler', 'savePlanOffers']);
	let queryParams = reactive({
		code: '',
		shop: ''
	})
	const dataList = ref([])
	const time_slots = ref([])
	const isV2 = ref(false)
	let planOffers = ref([])

	const sliceStr = (str) => {
		return str.slice(0, 5)
	}
	const handleChange = (value) => {
		// console.log(value)
	}
	// 展开和合并
	function onCellExpand(currentItem) {
		currentItem.isExpand = !currentItem.isExpand
	}
	const saveData = () => {
		emit('savePlanOffers', dataList.value)
	}
	const createTimeRanges = () => {
		const timeRangesByHour = Array.from({
			length: 24
		}, () => []);
		// Helper function to pad single digit numbers with a leading zero
		function pad(num) {
			return num.toString().padStart(2, '0');
		}

		// Iterate over each hour in a day (0-23)
		for (let hour = 0; hour < 24; hour++) {
			// Iterate over each 15-minute segment within the hour
			for (let minute = 0; minute <= 45; minute += 15) { // Increment by 15 minutes
				let startTimeHour = pad(hour);
				let startTimeMinute = pad(minute);
				let endTimeHour = pad(hour);
				let endTimeMinute = pad(minute + 15);

				// Handle end time crossing into the next hour
				if (minute === 45) {
					endTimeHour = pad((hour + 1) % 24); // Wrap around to 0 after 23
					endTimeMinute = '00';
				}

				// Create the time range object
				const timeRange = {
					TimeRange: {
						StartTime: {
							Hour: parseInt(startTimeHour),
							Minute: parseInt(startTimeMinute),
						},
						EndTime: {
							Hour: parseInt(endTimeHour),
							Minute: parseInt(endTimeMinute),
						},
						Start: `${startTimeHour}:${startTimeMinute}:00`,
						End: `${endTimeHour}:${endTimeMinute}:00`
					},
					end_offer: 0
				};

				// Add the time range object to the corresponding hour group
				timeRangesByHour[hour].push(timeRange);
			}
		}
		return timeRangesByHour;
	}
	const getConfData = () => {
		logApi.getConfFunc(queryParams).then(res => {
			if (res.code === 200) {
				planOffers.value = res.data.conf_json.AutoAdType_fool.Plan_Offers
				if (planOffers.value.length !== 96) {
					const timeRangesArray = createTimeRanges();
					dataList.value = timeRangesArray
				}
				dataList.value = divideArrayIntoChunks(planOffers.value, 24)
			}
		})
	}
	const createTimeSlots = () => {
		const timeSlots = [];
		for (let hour = 0; hour < 24; hour++) {
			const startHour = String(hour).padStart(2, '0');
			const endHour = String((hour + 1) % 24).padStart(2, '0');
			// 特别处理最后一个时间段
			const endTime = hour !== 23 ? `${endHour}:00` : '23:59';
			timeSlots.push(`${startHour}:00-${endTime}`);
		}
		time_slots.value = timeSlots
	}
	const divideArrayIntoChunks = (originalArray, chunksCount) => {
	    const chunkSize = originalArray.length / chunksCount;
		console.log(chunkSize,  originalArray, chunksCount)
	    if (!Number.isInteger(chunkSize)) {
	        throw new Error('The array cannot be evenly divided into the specified number of chunks.');
	    }
	
	    let result = [];
	    for (let i = 0; i < chunksCount; i++) {
	        let start = i * chunkSize;
	        let end = start + chunkSize;
	        result.push(originalArray.slice(start, end));
	    }
		console.log(result)
	    return result;
	}


	onMounted(() => {
		createTimeSlots()
		// 	// Call the function and log the result
			// const timeRangesArray = createTimeRanges();
			// dataList.value = timeRangesArray
	})

	const shopType = ref('')
	onLoad((options) => {
		if (options) {
			queryParams.shop = options.shopId
			queryParams.code = options.type
			isV2.value = JSON.parse(options.isV2)
			shopType.value = options.shopType
			if (queryParams.shop)
				getConfData()
		}
	})
</script>


<style lang="scss" scoped>
	.node {
		&.expand {
			.arrow {
				transform: rotate(180deg);
			}
		}
	}

	.btn-item-main {
		position: fixed;
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx;
		left: 0;
		bottom: calc(env(safe-area-inset-bottom) + 15px);
		z-index: 100;

		.btn-item {
			background: #F81C3A;
			color: #ffffff;
		}

		.btn-item-back {
			background-color: #ffffff;
			color: #F81C3A;
		}
		
		.save-btn {
			width: 100%;
			height: 80rpx;
			background: #FACC05;
			border-radius: 14rpx;
			font-weight: 500;
			font-size: 34rpx;
			color: #333333;
			line-height: 80rpx;
			text-align: center;
		}
		
		.is-elm-btn {
			background: #0492FA;
			color: #fff;
		}
	}

	.wd-button.isV2 {
		background-color: #F81C3A !important;
	}
</style>