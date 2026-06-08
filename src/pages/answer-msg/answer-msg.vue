<template>
	<view class="auto-review-page">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-text="返回" left-arrow :safeAreaInsetTop="true"
			title="自动回评"></wd-navbar>
		<view class="review-config"
			:style="`margin-top: calc(${systemBarHeight}px + 44px);min-height: calc(100vh - ${systemBarHeight}px - 44px - env(safe-area-inset-bottom));`">
			<view class="page-main">
				<view class="set-mian">
					<view class="title flex mb-15 items-center justify-between">
						<span>设置回评模板</span>
						<view class="set-model" @click="openShow" :class="{'is-elm-btn': shopType == 2, 'isV2': isV2}">
							模板设置
						</view>
					</view>
					<view class="config-item mb-15 flex items-center">
						<view class="label w-64 text-#666666 text-13">回评时间</view>
						<view class="flex flex-1">
							<view
								class="item border-1 active border-solid text-center lh-40 border-#DFDFDF rounded-7 mr-10 h-40 text-14 text-#333333" :class="{'is-elm-border': shopType == 2}">
								评价后第2天 </view>
							<view
								class="item border-1 active border-solid text-center lh-40 border-#DFDFDF rounded-7 h-40 text-14 text-#333333" :class="{'is-elm-border': shopType == 2}">
								08:00 </view>
						</view>
					</view>
					<view class="config-item  h-[80rpx] mb-15 flex items-center">
						<view class="label w-64 text-#666666 text-13">回复星级</view>
						<view class="flex flex-1">
							<view class="item h-40 lh-40 text-center  mr-10"
								:class="{active: item.check, isborderV2: isV2, 'is-elm-border': shopType == 2}" v-for="(item,index) in templateType"
								:key="index" @click="changeStar(item)">{{item.label}}
							</view>
						</view>
					</view>
					<view class="config-item h-40 mb-15 flex items-center">
						<view class="label w-64 text-#666666 text-13">有无内容</view>
						<view class="flex flex-1">
							<view class="item h-40  lh-40 text-center mr-10"
								:class="{active: idx == isContent, isborderV2: isV2, 'is-elm-border': shopType == 2}" v-for="(item,idx) in contentList"
								:key="idx" @click="changeContent(idx)">{{item.text}}</view>
						</view>
					</view>
					<view class="config-item mb-15 flex items-center">
						<view class="label w-64 text-#666666 text-13">回复模板</view>
						<view style="display: flex;align-items: center;">
							<view class="item h-40  lh-40 text-center mr-10"
								:class="{active: chooseValue == 1,isborderV2: isV2, 'is-elm-border': shopType == 2}" @click="setDef">默认模板
							</view>
							<view class="item h-40  lh-40 text-center mr-10"
								:class="{active: chooseValue == 2,isborderV2: isV2, 'is-elm-border': shopType == 2}" @click="openOtherModel">
								{{ confTemplateName }}
							</view>
							<!-- <wd-radio-group shape="dot" checked-color="#2CCA87" inline v-model="chooseValue">
								<wd-radio :value="1">默认模板</wd-radio>
								<wd-radio :value="2">自定义模板</wd-radio>
							</wd-radio-group>
							<view style="margin-top: 10px;padding-left: 106px;">
								<wd-drop-menu v-if="chooseValue === 2 && confTemplate.length > 0">
									<wd-drop-menu-item v-model="confTemplateName" :options="confTemplate"
										@change="handleChange1" value-key="Name" label-key="Name" />
								</wd-drop-menu>
								<view v-if="confTemplate.length === 0 && chooseValue === 2" style="font-size: 14px;">
									暂无模板
								</view>
							</view> -->
						</view>
					</view>
					<view class="save-model" :class="{'is-elm-btn': shopType == 2, 'isV2': isV2}" @click="handleSave">
						保存
					</view>
				</view>
				<view class="table-container set-mian log-table">
					<view class="table-title">
						日志
					</view>
					<view class="table-header">
						<view class="table-item">评价时间</view>
						<view class="table-item">评价内容</view>
						<view class="table-item">评价类型</view>
					</view>
					<view class="table-main">
						<view class="table-row" v-for="(item, index) in list" :key=index>
							<view class="table-item">{{ item.pj_time }}</view>
							<view class="table-item" @click="openMsg(item.pj_rep)">{{ item.pj_rep }}</view>
							<view class="table-item">
								<view v-if="item.pj_type === 1">好评</view>
								<view v-if="item.pj_type === 2">中评</view>
								<view v-if="item.pj_type === 3">差评</view>
							</view>
						</view>
					</view>
					<wd-pagination v-if="list.length" class="pagination-pager" v-model.async="queryParams.PageIndex"
						:total="total" :page-size.async="queryParams.PageSize" @change="getPageLogData"
						show-icon></wd-pagination>
				</view>
			</view>
		</view>
		<wd-action-sheet v-model="confTemplateState" :actions="confTemplate" @close="closeConfList"
			@select="selectConf" />
		<wd-popup v-model="showPop" position="bottom" closeable :safe-area-inset-bottom="true">
			<!-- 模板列表 -->
			<AutoReviewTemplateList v-if="popupType=='templateList'" @addTemplateHandler="addTemplateHandler"
				:confTemplate="confTemplate" @cancelTemplateHandler="cancelTemplateHandler"
				@editTemplateHandler="editTemplateHandler" @addTemplateScriptHandler="addTemplateScriptHandler"
				@deleteTemplateHandler="deleteTemplateHandler" />
			<!-- 新增或修改模板组件 -->
			<AutoReviewTemplate v-if="popupType=='template'" :currentTemplate="currentTemplate" :datalist="datalist"
				:isEditTemplate="isEditTemplate" @cancelTemplateHandler="cancelTemplateHandler"
				@handleSaveEdit="handleSaveEdit" />
			<!-- 话术 -->
			<AutoReviewTemplateScript v-if="popupType=='script'" :currentTemplate="currentTemplate"
				@cancelHandler="cancelTemplateHandler" @saveLange="saveLange" />
		</wd-popup>
		<wd-message-box></wd-message-box>
	</view>
</template>

<script setup>
	import {
		onLoad
	} from '@dcloudio/uni-app';
	import {
		ref,
		reactive
	} from 'vue';
	import {
		logApi
	} from '@/api/log'
	import {
		useMessage
	} from '../../../node_modules/wot-design-uni'
	const message = useMessage()
	
	//弹窗
	const popupType = ref('');
	// 编辑模版
	// 模版设置
	const datalist = ref({

	})
	const actions = ref([{
			name: '选项1'
		},
		{
			name: '选项2'
		},
		{
			name: '选项3',
			subname: '描述信息'
		}
	])
	const type = ref('edit')
	const currentTemplate = ref({});
	const isEditTemplate = ref(false);
	const editIndex = ref(-1)
	const systemBarHeight = ref(0)
	const confTemplateState = ref(false)

	
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const openMsg = (msg) => {
		message.alert(msg)
	}
	const setDef = () => {
		chooseValue.value = 1
	}
	const openOtherModel = () => {
		confTemplateState.value = true
		chooseValue.value = 2
	}
	const closeConfList = () => {
		confTemplateState.value = false
	}
	const selectConf = ({
		item,
		index
	}) => {
		console.log(item, index)
		confTemplateName.value = item.Name
	}
	const addTemplateHandler = async () => {
		popupType.value = 'template';
		isEditTemplate.value = false;
		currentTemplate.value = {};
	}
	// 取消的时候
	const cancelTemplateHandler = () => {
		showPop.value = false;
		popupType.value = '';
	}
	const editTemplateHandler = (item) => {
		console.log(item, 'item')
		popupType.value = 'template';
		currentTemplate.value = item.data;
		editIndex.value = item.index;
		isEditTemplate.value = true;
	}
	// 话术
	const addTemplateScriptHandler = (item) => {
		popupType.value = 'script';
		currentTemplate.value = item;
	}
	const saveLange = (data) => {
		confTemplate.value.forEach((item, index) => {
			if (item.Name === data.Name) {
				confTemplate.value[index] = data
			}
		})
		upTemplateData()
	}
	// 删除模版后
	const deleteTemplateHandler = (data) => {
		confTemplate.value.forEach((item, index) => {
			if (item.Name === data.Name) {
				confTemplate.value.splice(index, 1)
			}
		})
		upTemplateData()
	}
	const handleSaveEdit = (data) => {
		console.log(data, 'data')
		showPop.value = false;
		if (isEditTemplate.value) {
			conf_json.ConfTemplate.forEach((item, index) => {
				if (index === editIndex.value) {
					item.Name = data
				}
			})
		} else {
			const templateItem = {
				Name: data,
				reply_cp_strList: ["尊敬的顾客，我们对您此次用餐体验的不满感到非常抱歉，期待您的再次光临，让我们有机会弥补这次的不足。"],
				reply_hp_strList: ["感谢您的五星好评，就像您对我们菜品的喜爱一样，我们对您的满意也充满了感激！期待再次为您服务"],
				reply_zp_strList: ["尊敬的顾客，感谢您的宝贵意见。我们深感遗憾未能完全满足您的期望，期待您的再次光临，让我们有机会弥补不足。"]
			}
			if (!conf_json.ConfTemplate) {
				conf_json.ConfTemplate = []
			}
			conf_json.ConfTemplate.push(templateItem)
		}
		upTemplateData()
	}
	const upTemplateData = () => {
		const params = {
			code: queryParams.func_code,
			shop: queryParams.shop,
			ConfObj: conf_json
		}
		logApi.saveConfFunc(params).then(res => {
			if (res.code === 200) {
				getConfData()
				uni.showToast({
					title: '操作成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const handleClickLeft = () => {
		uni.navigateBack()
	}
	const starRating = ref(0)
	const isContent = ref(0)
	const showPop = ref(false)
	const chooseValue = ref(1)
	let queryParams = reactive({
		PageIndex: 1,
		PageSize: 10,
		func_code: '',
		shop: ''
	})
	let configureQueryParams = reactive({
		code: '',
		shop: ''
	})
	const list = ref([]);
	const total = ref(0);
	const handleChange1 = (value) => {
		console.log(value, '4444')
	}
	// 模版类型
	const templateType = ref([{
			label: '好评',
			value: 0,
			check: false
		},
		{
			label: '中评',
			value: 1,
			check: false
		},
		{
			label: '差评',
			value: 2,
			check: false
		},
	]);
	// 有无内容
	const contentList = [{
			text: '全部',
			value: 0
		},
		{
			text: '有内容',
			value: 1
		},
		{
			text: '无内容',
			value: 2
		},
	];
	const isV2 = ref(false)

	const changeStar = (item) => {
		console.log(item, 'item')
		item.check = !item.check
		// starRating.value = index
	}
	const changeContent = (index) => {
		isContent.value = index
	}
	const handleSave = (index) => {
		console.log(templateType.value, isContent.value, confTemplateName.value, conf_json)
		templateType.value.forEach(item => {
			if (item.label === '好评') {
				conf_json.reply_hp = item.check
			} else if (item.label === '中评') {
				conf_json.reply_zp = item.check
			} else if (item.label === '差评') {
				conf_json.reply_cp = item.check
			}
		})
		conf_json.PjStrType = isContent.value + 1
		if (chooseValue.value === 1) {
			conf_json.UseTemplate = '默认模板'
			if ((conf_json.ConfTemplate && conf_json.ConfTemplate.length && conf_json.ConfTemplate[0].Name) !==
				'默认模板') {
				conf_json.ConfTemplate.unshift({
					Name: '默认模板',
					reply_cp_strList: conf_json.reply_cp_strList,
					reply_hp_strList: conf_json.reply_hp_strList,
					reply_zp_strList: conf_json.reply_zp_strList,
				})
			}
		} else {
			if (confTemplateName.value === '自定义模板') {
				return uni.showToast({
					title: '请选择模板',
					icon: 'error',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			} else {
				conf_json.UseTemplate = confTemplateName.value
			}
		}
		upTemplateData()
	}
	const handleClose = () => {
		showPop.value = false
	}
	const openShow = () => {
		showPop.value = true
		type.value = 'manage'
		popupType.value = 'templateList';
	}
	const getPageLogData = ({
		value
	}) => {
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

	let conf_json = reactive({})
	
	// 获取默认配置
	const getDefaultConfig = () => {
		return {
			reply_hp: true,        // 好评选中
			reply_zp: true,        // 中评选中
			reply_cp: false,       // 差评不选中
			PjStrType: 1,          // 全部（前端isContent.value=0表示"全部"，保存时+1变为1）
			UseTemplate: '默认模板', // 使用默认模板
			ConfTemplate: [],      // 模板列表
			reply_hp_strList: [],  // 好评回复列表
			reply_zp_strList: [],  // 中评回复列表
			reply_cp_strList: []   // 差评回复列表
		}
	}
	
	const getConfData = () => {
		logApi.getConfFunc(configureQueryParams).then(res => {
			if (res.code === 200) {
				let configData = res.data.conf_json
				
				// 如果配置为空或不存在，使用默认配置
				if (!configData || (typeof configData === 'object' && Object.keys(configData).length === 0)) {
					configData = getDefaultConfig()
				} else {
					// 合并默认配置，确保所有字段都存在
					const defaultConfig = getDefaultConfig()
					configData = {
						...defaultConfig,
						...configData,
						// 确保关键字段有默认值
						reply_hp: configData.reply_hp !== undefined ? configData.reply_hp : defaultConfig.reply_hp,
						reply_zp: configData.reply_zp !== undefined ? configData.reply_zp : defaultConfig.reply_zp,
						reply_cp: configData.reply_cp !== undefined ? configData.reply_cp : defaultConfig.reply_cp,
						PjStrType: configData.PjStrType !== undefined ? configData.PjStrType : defaultConfig.PjStrType,
						UseTemplate: configData.UseTemplate || defaultConfig.UseTemplate
					}
				}
				
				conf_json = configData
				initData(conf_json)
				console.log(conf_json, 'conf_json')
			}
		})
	}

	const confTemplate = ref([])
	const confTemplateName = ref('自定义模板')
	const initData = (data) => {
		if (data) {
			// 设置回复星级（好评、中评、差评）
			templateType.value[0].check = data.reply_hp !== undefined ? data.reply_hp : true   // 好评默认选中
			templateType.value[1].check = data.reply_zp !== undefined ? data.reply_zp : true   // 中评默认选中
			templateType.value[2].check = data.reply_cp !== undefined ? data.reply_cp : false  // 差评默认不选中
			
			// 设置有无内容（全部、有内容、无内容）
			// 前端isContent.value是0-based：0=全部，1=有内容，2=无内容
			// 后端PjStrType是1-based：1=全部，2=有内容，3=无内容
			// 转换关系：isContent.value = PjStrType - 1
			if (data.PjStrType !== undefined && data.PjStrType !== null) {
				isContent.value = data.PjStrType - 1
			} else {
				isContent.value = 0 // 默认选中"全部"（对应后端PjStrType=1）
			}
			
			// 设置模板列表
			if (data.ConfTemplate && data.ConfTemplate.length) {
				confTemplate.value = data.ConfTemplate
				confTemplate.value.forEach(item => {
					item.name = item.Name
				})
				confTemplate.value = confTemplate.value.filter(item => item.Name !== '默认模板')
			} else {
				confTemplate.value = []
			}
			
			// 设置使用的模板
			if (data.UseTemplate === '默认模板' || !data.UseTemplate) {
				chooseValue.value = 1
				confTemplateName.value = '自定义模板'
			} else {
				chooseValue.value = 2
				confTemplateName.value = data.UseTemplate
			}
		} else {
			// 如果没有数据，使用默认配置初始化
			const defaultConfig = getDefaultConfig()
			templateType.value[0].check = defaultConfig.reply_hp
			templateType.value[1].check = defaultConfig.reply_zp
			templateType.value[2].check = defaultConfig.reply_cp
			isContent.value = 0 // 全部
			chooseValue.value = 1 // 默认模板
			confTemplateName.value = '自定义模板'
			confTemplate.value = []
		}
	}

	const shopType = ref('')
	onLoad((options) => {
		getSysteminfo()
		if (options) {
			queryParams.shop = options.shopId
			queryParams.func_code = options.type
			configureQueryParams.code = options.type
			configureQueryParams.shop = options.shopId
			shopType.value = options.shopType
			isV2.value = JSON.parse(options.isV2)
			if (queryParams.shop) {
				getLogData()
				getConfData()
			}
		}
	})
</script>

<style scoped lang="scss">
	.review-config {
		width: 100%;
		box-sizing: border-box;
		padding: 20rpx 30rpx;
		background: #F9F9F9;

		.page-main {
			width: 100%;

			.set-mian {
				width: 100%;
				box-sizing: border-box;
				border-radius: 14rpx;
				padding: 40rpx 30rpx;
				background-color: #ffffff;
			}
		}
	}

	.item {
		font-size: 28rpx;
		border: 1rpx solid #DFDFDF;
		border-radius: 14rpx;
		overflow: hidden;
	}

	.active {
		border-radius: 14rpx;
		border: 1rpx solid #FACC05;
		font-size: 28rpx;
		color: #FACC05;
	}
	.active.is-elm-border { 
		border: 1rpx solid #0492FA;
		color: #0492FA;
	}

	::v-deep .wd-radio-group {
		// margin-top: 30rpx;
		display: flex;
		align-items: center;
	}

	::v-deep .wd-drop-menu__item {
		margin-left: -20rpx;
	}

	::v-deep .wd-radio.is-dot.is-checked .wd-radio__shape {
		background-color: #2CCA87;
		border-color: #2CCA87;
	}

	.borCss {
		border-bottom: 1rpx solid #DFDFDF;
	}

	.table-container {
		width: 100%;
		box-sizing: border-box;
		background-color: #ffffff;
		margin-top: 20rpx;
		border-radius: 12rpx;

		.table-title {
			font-size: 30rpx;
			color: #333333;
			margin-bottom: 20rpx;
		}
	}

	.set-model {
		width: 70px;
		height: 30px;
		background: #FACC05;
		border-radius: 7px;
		font-weight: 500;
		font-size: 13px;
		color: #333333;
		line-height: 30px;
		text-align: center;
	}

	.save-model {
		width: 100%;
		height: 40px;
		background: #FACC05;
		border-radius: 7px;
		font-weight: 500;
		font-size: 13px;
		color: #333333;
		line-height: 40px;
		text-align: center;
	}

	::v-deep .wd-table__body .wd-table__cell {
		font-size: 20rpx;
	}

	.wd-button.isV2 {
		background-color: #F81C3A !important;
	}

	.active.isborderV2 {
		border: 1px solid #F81C3A !important;
		color: #F81C3A !important;
	}

	::v-deep .wd-drop-menu__list {
		height: 40px;
	}

	.config-item {
		.item {
			padding: 0 20rpx;
		}
	}

	.log-table {
		width: 100%;

		.table-header {
			width: 100%;
			height: 70rpx;
			background: #F8F7F4;
			line-height: 70rpx;
			display: flex;
			align-items: center;

		}

		.table-item {
			width: 33%;
			text-align: center;
			font-weight: 400;
			font-size: 24rpx;
			color: #B0AA8F;
		}

		.table-main {
			.table-row {
				width: 100%;
				display: flex;
				align-items: center;
				height: 80rpx;
				line-height: 80rpx;
				border-bottom: 1px solid #DFDFDF;

				.table-item {
					color: #666666;
					line-height: 1.2;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 2;
					overflow: hidden;
					width: 100%;
					box-sizing: border-box;
					padding: 0 20rpx;
				}
			}
		}
	}
	::v-deep .wd-popup--bottom {
		border-radius: 30rpx 30rpx 0 0;
	}
	.is-elm-btn {
		background: #0492FA;
		color: #ffffff;
	}
</style>