<template>
	<view>
		<view class="text-17 text-T333333 font-500" style="text-align: center;height: 105rpx;line-height: 105rpx;">
			模版管理
		</view>
		<view style="padding: 0 30rpx 60rpx;">
			<view class="tem-name">
				<view class="w-full text-12 text-T333333">{{ props.currentTemplate.Name }}</view>
			</view>
			<!-- 话术内容区域 -->
			<view class="config-item">
				<view class="item w-70 h-30  lh-30 text-center pl-2 pr-2"
					:class="{'active': item.value == newStarRating, 'is-elm-btn': shopType == 2}" v-for="(item,idx) in templateType" :key="idx"
					@click="newHandleGradeChange(item)">{{item.label}}
				</view>
			</view>
			<view style="max-height: 400px;overflow-y: auto;">
				<view v-for="(item,key) in props.currentTemplate[currentStr]" :key="key">
					<view class="input-main">
						<wd-input v-model="props.currentTemplate[currentStr][key]" suffix-icon="delete" no-border style="width: 100%;"
							@clicksuffixicon="delLange(key)" />
					</view>
				</view>
			</view>
			<view class="mt-20" style="display: flex;align-items: center;justify-content: space-between;">
				<view class="close-list" @click="addNewScriptHandler">
					添加话术
				</view>
				<view class="close-list add-tem" @click="blurHandlerItem" :class="{'is-elm-btn': shopType == 2, 'isV2': isV2}">
					保存
				</view>
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		onMounted,
		ref
	} from 'vue'
	const props = defineProps(['currentTemplate']);
	const emit = defineEmits(['cancelHandler', 'saveLange']);
	const shopType = ref('')
	// 模版类型
	const templateType = [{
			label: '好评模板',
			value: 0,
			str: 'reply_hp_strList'
		},
		{
			label: '中评模板',
			value: 1,
			str: 'reply_zp_strList'
		},
		{
			label: '差评模板',
			value: 2,
			str: 'reply_cp_strList'
		},
	];
	const newStarRating = ref(0);
	const currentStr = ref('reply_hp_strList')
	const scriptList = ref({
		0: [{
			content: ''
		}],
		1: [{
			content: ''
		}],
		2: [{
			content: ''
		}]
	});
	// 选中
	const newHandleGradeChange = (item) => {
		newStarRating.value = item.value;
		currentStr.value = item.str
		// 刷新话术页面
		console.log(props.currentTemplate[currentStr.value], 'props.currentTemplate[currentStr]')
	}
	// 取消
	const cancelHandler = () => {
		emit('cancelHandler');
	}
	const delLange = (index) => {
		props.currentTemplate[currentStr.value].splice(index, 1)
	}


	// 新增话术
	const addNewScriptHandler = () => {
		props.currentTemplate[currentStr.value].push('')
	}
	// 删除话术
	const deleteScriptItemHandler = (item) => {
		console.log(item, '111', newStarRating.value)

	}
	const isV2 = ref(false)
	const blurHandlerItem = () => {
		emit('saveLange', props.currentTemplate)
	}
	onLoad((options) => {
		if (options) {
			isV2.value = JSON.parse(options.isV2)
			shopType.value = options.shopType
		}
	})
</script>

<style lang="scss" scoped>
	.item:not(:last-child) {
		margin-right: 10px;
	}

	.item {
		border-radius: 6px;
		font-size: 14px;

		&.active {
		}
	}

	.wd-button.isV2 {
	}

	.tem-name {
		font-weight: 400;
		font-size: 28rpx;
		color: #333333;
		line-height: 40rpx;
		text-align: center;
	}
	
	.config-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		margin-top: 30rpx;
		.item {
			width: calc((100% - 40px) / 3);
			height: 80rpx;
			background: #F0F0F0;
			border-radius: 14rpx;
			font-size: 28rpx;
			color: #666666;
			line-height: 80rpx;
			text-align: center;
		}
		.active {
			background: #FACC05;
			color: #333333;
		}
		
	}
	.input-main {
		width: 100%;
		height: 80rpx;
		background: #FFFFFF;
		border-radius: 14rpx;
		border: 1px solid #DFDFDF;
		box-sizing: border-box;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
		margin-top: 30rpx;
	}
	.close-list {
		height: 80rpx;
		background: #F0F0F0;
		border-radius: 14rpx;
		font-weight: 500;
		font-size: 34rpx;
		color: #333333;
		letter-spacing: 1px;
		line-height: 80rpx;
		text-align: center;
		width: 48%;
	}
	.add-tem {
		background: #FACC05;
	}
	.is-elm-btn {
		background: #0492FA;
		color: #ffffff;
	}
	.active.is-elm-btn {
		background: #0492FA;
		color: #ffffff;
	}
</style>