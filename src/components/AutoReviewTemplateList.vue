<template>
	<view class="w-full" style="box-sizing: border-box;">
		<view class="text-17 text-T333333 font-500" style="text-align: center;height: 105rpx;line-height: 105rpx;">
			模板管理
		</view>
		<!-- 已经存在的模板 -->
		<view
			class="border-b-1 border-#dfdfdf box-border mt-15 h-50 flex flex-row items-center justify-between"
			style="width: 100%;box-sizing: border-box;padding: 0 20rpx;"
			v-for="(item,index) in confTemplate" :key="index">
			<span class="mr-10 text-14 text-T333333">{{ item.Name }}</span>
			<view class="w-[150rpx] flex flex-row items-center justify-between" v-if="item.Name !== '默认模板'">
				<image src="../static/icon/icon_edit.png" class="h-[28rpx] w-[28rpx]" mode="" @click="handleEdit(item, index)"></image>
				<image src="../static/icon/icon_add.png" class="h-[28rpx] w-[28rpx]" mode="" @click="addScriptHandler(item)"></image>
				<image src="../static/icon/icon_delete.png" class="h-[28rpx] w-[28rpx]" mode="" @click="handleDelete(item)"></image>
			</view>
		</view>
		<view class="mt-20" style="display: flex;align-items: center;justify-content: space-between;">
			<view class="close-list" @click="handleCancel">
				取消
			</view>
			<view class="close-list add-tem" @click="handleCreate" :class="{'is-elm': shopType == 2, 'isV2': isV2}">
				新建模板
			</view>
		</view>
	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		ref
	} from 'vue';
	// const route = useRoute();
	const emit = defineEmits(['addTemplateHandler', 'editTemplateHandler', 'deleteTemplateHandler',
		'cancelTemplateHandler', 'addTemplateScriptHandler'
	])
	
	const props = defineProps({
	  confTemplate: {
	    type: Array,
	    default: [],
	  },
	})
	// 已经存在的模版
	const autoReviewTemplateList = ref([{
		text: '测试'
	}]);
	const shopType = ref('')
	// 获取模版列表

	// 编辑模版
	const handleEdit = (data, index) => {
		emit('editTemplateHandler', {data, index})
	};
	// 新增话术
	const addScriptHandler = (data) => {
		emit('addTemplateScriptHandler', data);
	};
	// 删除模版
	const handleDelete = (item) => {
		emit('deleteTemplateHandler', item)
	}
	// console.log(conf);

	// 取消模版
	const handleCancel = () => {
		emit('cancelTemplateHandler')
	};
	// 新增模版
	const handleCreate = () => {
		emit('addTemplateHandler')
	};

	const isV2 = ref(false)

	onLoad((options) => {
		if (options) {
			isV2.value = JSON.parse(options.isV2)
			shopType.value = options.shopType
		}
	})
</script>

<style lang="scss" scoped>
	.wd-button.isV2 {
		background-color: #F81C3A !important;
	}
	.w-full {
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx 60rpx;
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
	.is-elm {
		background: #0492FA;
		color: #ffffff;
	}
</style>