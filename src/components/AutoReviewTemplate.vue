<template>
	<view>
		<view class="text-17 text-T333333 font-500" style="text-align: center;height: 105rpx;line-height: 105rpx;">
			{{ isEditTemplate ? '编辑模板':'新建模板' }}
		</view>
		<view style="width: 100%;box-sizing: border-box;padding: 0 30rpx 60rpx;">
			<view class="config-item text-#666 flex items-center text-12 mb-15">
				<view class=" mr-10 flex-1 border-1 border-#dfdfdf !rounded-6 ">
					<input class="input h-30 w-100% bg-#ffffff text-left pl-5 items-center flex justify-center"
						v-model="templateForm" placeholder="请输入模板名称" />
				</view>
			</view>
			<view class="mt-20" style="display: flex;align-items: center;justify-content: space-between;">
				<view class="close-list" @click="handleCancelEdit">
					取消
				</view>
				<view class="close-list add-tem" @click="handleSaveEdit" :class="{'is-elm': shopType == 2, 'isV2': isV2}">
					确定
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
		ref,
		onMounted
	} from 'vue';
	const props = defineProps(['isEditTemplate', 'currentTemplate', 'datalist']);
	const emit = defineEmits(['cancelTemplateHandler', 'handleSaveEdit'])
	// const templateForm = ref({
	//   title: props.currentTemplate.Name,
	// });
	const templateForm = ref('')


	// 取消
	const handleCancelEdit = () => {
		emit('cancelTemplateHandler')
	}
	// 保存
	const handleSaveEdit = async () => {
		if (!templateForm.value) {
			return uni.showToast({
				title: '请输入模板名称',
				icon: 'error',
				duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
				mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
			});
		}
		emit('handleSaveEdit', templateForm.value)
	}
	const isV2 = ref(false)
	const shopType = ref('')
	onMounted(() => {
		if (props.currentTemplate) {
			templateForm.value = props.currentTemplate.Name
		}
	})

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