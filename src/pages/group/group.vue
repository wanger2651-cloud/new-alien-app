<template>
	<view class="nodeChild">
		<wd-navbar :fixed="true" @click-left="handleClickLeft" left-arrow :safeAreaInsetTop="true"
			title="分组管理"></wd-navbar>
		<view class="list-container" :style="`padding-top: calc(${systemBarHeight}px + 44px);`">
			<view class="step-a">
				<view class="tips" v-if="historyGroup.length === 0">
					*支持创建子账号可产看门店权限
				</view>
				<view class="tips" v-if="historyGroup.length !== 0">
					{{ structure }}<text>{{ obviousStructure }}</text>
				</view>
				<view class="step-a-main" v-if="!openState">
					<view class="step-a-item" v-for="item in groupList" :key="item.Member.id"
						@click="selectGroup(item)">
						<view class="item-left">
							{{ item.Member.name }}
						</view>
						<view class="item-right">
							<image src="@/static/icon/icon-dot.png" class="right-arrow" @click.stop="addChildren(item)">
							</image>
							<image src="@/static/icon/icon-arrow-right.png" class="right-arrow"></image>
						</view>
					</view>
				</view>
				<view class="step-a-main step-b-main" v-if="openState">
					<view class="shop-item" v-for="item in shopList" :key="item.id">
						<view class="item-left">
							<image class="shop-img" src="@/static/shop/elm.png" v-if="item.shop_type === 2"></image>
							<image class="shop-img" src="@/static/shop/mt.png" v-if="item.shop_type === 1"></image>
							<view class="item-main">
								<view class="item-title">
									{{ item.name }}
								</view>
								<view class="item-msg">
									<text class="text_3">ID&nbsp;{{ item.office_id }}</text>
									<text class="text_4">｜</text>
									<image class="label_5" referrerpolicy="no-referrer"
										src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng5e47281d477be859cb54102bcf35e760849d4707a399045ceae9cd882bc517b6" />
									<text class="text_7">{{ item.city }}</text>
								</view>
							</view>
						</view>
						<view class="item-right">
							<wd-icon name="delete" size="32rpx" color="#333333" @click="delShop(item)"></wd-icon>
						</view>
					</view>
					<wd-status-tip image="content" v-if="shopList.length === 0" tip="暂无内容" />
					<wd-pagination v-model.async="shopParams.page" :total="shopTotal"
						:page-size.async="shopParams.pagesize" @change="getShopList" show-icon></wd-pagination>
				</view>
			</view>
		</view>

		<view class="btn-item-main">
			<view class="btn-item" @click="rootAdd" v-if="parentGroup.length === 0">
				创建分组
			</view>
			<view class="btn-item btn-item-back" @click="backLevel" v-if="parentGroup.length !== 0">
				返回上一级
			</view>
			<view class="btn-item" @click="relationShop" v-if="parentGroup.length !== 0">
				关联门店
			</view>
		</view>

		<wd-popup v-model="groupState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="groupClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					{{ isEdit ? '修改' : '创建' }}{{ isRoot ? '分组' : '子分组' }}
				</view>
				<view class="log-main">
					<view class="msg-container">
						<view class="code-input" v-if="!isRoot && !isEdit">
							<view class="item-name">
								上级分组
							</view>
							<view class="code-input-main">
								<wd-input v-model="currentGroup.Member.name" :no-border="true" class="" disabled />
							</view>
						</view>
						<view class="code-input">
							<view class="item-name">
								分组名称
							</view>
							<view class="code-input-main">
								<wd-input v-model="groupName" :no-border="true" placeholder="填写分组名称" class="" />
							</view>
						</view>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="groupClose" block>取消</wd-button>
						<wd-button size="large" class="confirm-group" @click="confirmGroup" block>确定</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

		<wd-action-sheet v-model="actionBarState" @close="closeActionBar" :title="actionBarTitle" :z-index="600">
			<view style="padding: 15px;">
				<view class="btn-item" @click="addChildrenGroup" v-if="historyGroup.length < 2">
					创建子分组
				</view>
				<view class="btn-item" @click="editGroup">
					编辑分组
				</view>
				<view class="btn-item" @click="delGroup">
					删除分组
				</view>
			</view>
		</wd-action-sheet>

		<wd-action-sheet v-model="relationState" @close="closeRelation" title="关联门店" :z-index="600">
			<view style="padding: 60rpx 15px 15px;" class="relation-container">
				<view class="relation-title">
					<image class="relation-title-img" src="@/static/shop/relation.png"></image>
					当前组织：{{ currentGroup.Member.name }}
				</view>
				<view class="relation-filter">
					<view class="relation-filter-input">
						<wd-picker :columns="columns" label="平台" v-model="columnType" @confirm="getColumnTypeList" />
					</view>
					<view class="relation-filter-input">
						<wd-input v-model="shopRelationParams.word" prefix-icon="search" :no-border="true"
							placeholder="门店名称" clearable @change="filterRelationList" @clear="filterRelationList" />
					</view>
				</view>
				<view>
					<view class="relation-filter-tab">
						<wd-tabs v-model="relationFilterTab" @change="handleChange" color="#F81C3A">
							<block v-for="item in relationFilter" :key="item.id">
								<wd-tab :title="item.title">
								</wd-tab>
							</block>
						</wd-tabs>
					</view>
				</view>
				<view class="shop-list-main">
					<view class="shop-item" v-for="item in shopListRelation" :key="item.id" style="padding: 0;">
						<wd-checkbox v-model="item.check" @change="itemChange" checked-color="#F81C3A">
							<view class="item-left">
								<image class="shop-img" src="@/static/shop/elm.png" v-if="item.shop_type === 2"></image>
								<image class="shop-img" src="@/static/shop/mt.png" v-if="item.shop_type === 1"></image>
								<view class="item-main">
									<view class="item-title">
										{{ item.name }}
									</view>
									<view class="item-msg">
										<text class="text_3">ID&nbsp;{{ item.office_id }}</text>
										<text class="text_4">｜</text>
										<image class="label_5" referrerpolicy="no-referrer" 
											src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng5e47281d477be859cb54102bcf35e760849d4707a399045ceae9cd882bc517b6" />
										<text class="text_7">{{ item.city }}</text>
									</view>
									<view class="group-name">
										{{ item.group_name }}
									</view>
								</view>
							</view>
						</wd-checkbox>
					</view>
				</view>
				<wd-pagination v-model.async="shopRelationParams.page" :total="shopRelationTotal"
					:page-size.async="shopRelationParams.pagesize" @change="getShopRelationList"
					show-icon></wd-pagination>
				<view class="con-btn">
					<wd-checkbox v-model="allChangeItem" @change="allChange" checked-color="#F81C3A">全选</wd-checkbox>
					<view class="all-change" @click="confirmRelationShop">
						{{ shopRelationParams.hasGroup ? '取消关联' : '确认关联' }}
					</view>
				</view>
			</view>
		</wd-action-sheet>
	</view>
</template>

<script setup>
	import {
		onMounted,
		reactive,
		ref,
		watch
	} from 'vue'
	import {
		GroupApi
	} from '@/api/group'
	import {
		onLoad
	} from '@dcloudio/uni-app';

	const groupList = ref([])
	const actionBarState = ref(false)
	const actionBarTitle = ref('')
	const isRoot = ref(false)
	const groupState = ref(false)
	let currentGroup = ref({})
	let parentGroup = ref([])
	let historyGroup = ref([])
	const groupName = ref('')
	const structure = ref('')
	const obviousStructure = ref('')
	const isEdit = ref(false)
	const shopParams = reactive({
		page: 1,
		pagesize: 10,
		groupid: undefined
	})
	const shopRelationParams = reactive({
		page: 1,
		pagesize: 10,
		word: '',
		shop_type: 1,
		hasGroup: false
	})
	const shopList = ref([])
	const shopListRelation = ref([])
	const shopTotal = ref(0)
	const shopRelationTotal = ref(0)
	const openState = ref(false)
	const relationState = ref(false)
	const relationFilter = ref([{
			id: 1,
			title: '未关联分组',
			hasGroup: false
		},
		{
			id: 2,
			title: '已关联分组',
			hasGroup: true
		}
	])
	const columns = ref(['美团', '饿了么'])
	const relationFilterTab = ref(0)
	const columnType = ref('美团')
	const allChangeItem = ref(false)

	onMounted(() => {
		getShopGroupList()
	})

	watch(historyGroup.value, (newVal, oldVal) => {
		if (newVal.length) {
			if (newVal.length === 1) {
				structure.value = ''
				obviousStructure.value = newVal[newVal.length - 1].Member.name
			} else if (newVal.length === 2) {
				structure.value = newVal[0].Member.name + '/'
				obviousStructure.value = newVal[newVal.length - 1].Member.name
			}
		}
	});
	const confirmRelationShop = () => {
		let shopIds = []
		let shopOfficeIds = []
		shopListRelation.value.forEach(item => {
			if (item.check) {
				shopIds.push(item.id)
				shopOfficeIds.push(item.office_id)
			}
		})
		if (shopIds.length === 0) {
			if (shopRelationParams.hasGroup) {
				return uni.showModal({
					title: '提示',
					content: '请选择需要取消关联的店铺',
					showCancel: false
				})
			} else {
				return uni.showModal({
					title: '提示',
					content: '请选择需要关联的店铺',
					showCancel: false
				})
			}

		}

		if (shopRelationParams.hasGroup) {
			uni.showLoading({
				title: '加载中',
				mask: true
			})
			GroupApi.groupRemoveShop({
				groupId: currentGroup.Member.id,
				shopIds,
				shopOfficeIds
			}).then(res => {
				if (res.code === 200) {
					getShopRelationList()
					allChangeItem.value = false
					uni.showToast({
						title: '取消关联成功',
						icon: 'success',
						duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
						mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
					});
				}
			}).finally(() => {
				uni.hideLoading({})
			})
		} else {
			uni.showLoading({
				title: '加载中',
				mask: true
			})
			GroupApi.groupAddShop({
				groupId: currentGroup.Member.id,
				shopIds,
				shopOfficeIds
			}).then(res => {
				if (res.code === 200) {
					getShopRelationList()
					allChangeItem.value = false
					uni.showToast({
						title: '关联成功',
						icon: 'success',
						duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
						mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
					});
					getShopList()
				}
			}).finally(() => {
				uni.hideLoading({})
			})
		}

	}
	const itemChange = () => {

	}
	const allChange = (val) => {
		shopListRelation.value.forEach(item => {
			item.check = val.value
		})
	}
	const getColumnTypeList = () => {
		if (columnType.value === '美团') {
			shopRelationParams.shop_type = 1
		} else {
			shopRelationParams.shop_type = 2
		}
		getShopRelationList()
	}

	const filterRelationList = () => {
		// if (shopRelationParams.word) {
		getShopRelationList()
		// }
	}
	const handleChange = (value, name) => {
		if (relationFilter.value[value.index].id === 1) {
			// 未关联
			shopRelationParams.hasGroup = false
		} else {
			shopRelationParams.hasGroup = true
		}
		getShopRelationList()
	}
	const closeRelation = () => {
		relationState.value = false
	}

	const getShopGroupList = (parent) => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		GroupApi.getGroupData({
			grouptype: 1,
			parentid: parent || undefined,
			recursionchild: true,
		}).then(res => {
			if (res.code === 200) {
				groupList.value = res.data
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}

	const getShopList = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		GroupApi.getShopListForGroup(shopParams).then(res => {
			if (res.code === 200) {
				shopList.value = res.data.rows
				shopTotal.value = res.data.total
				structure.value = historyGroup.value[historyGroup.value.length - 1].Member.name +
					` 已关联门店（${shopTotal.value}家）`
				obviousStructure.value = ''
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}

	const getShopRelationList = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		GroupApi.getShopListHas(shopRelationParams).then(res => {
			if (res.code === 200) {
				shopListRelation.value = res.data.rows
				shopRelationTotal.value = res.data.total
				shopListRelation.value.forEach(item => {
					item.check = false
				})
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}

	const handleClickLeft = () => {
		// 直接返回上一页，避免跳转到错误的页面
		uni.navigateBack()
	}
	const selectGroup = (item) => {
		historyGroup.value.push(item)
		currentGroup = item
		shopList.value = []
		parentGroup.value.push(JSON.parse(JSON.stringify(groupList.value)))
		if (item.children && item.children.length) {
			groupList.value = item.children
		} else {
			shopParams.groupid = item.Member.id
			getShopList()
			openState.value = true
		}
	}
	const addChildren = (item) => {
		currentGroup = item
		isRoot.value = false
		actionBarState.value = true
		actionBarTitle.value = item.Member.name
	}
	const addChildrenGroup = () => {
		groupState.value = true
	}
	const closeActionBar = () => {
		actionBarState.value = false
	}
	const rootAdd = () => {
		isRoot.value = true
		groupState.value = true
	}
	const groupClose = () => {
		groupState.value = false
	}
	const confirmGroup = () => {
		if (isEdit.value) {
			GroupApi.editGroup({
				name: groupName.value,
				id: currentGroup.Member.id
			}).then(res => {
				if (res.code === 200) {
					groupState.value = false
					actionBarState.value = false
					groupName.value = ''
					getShopGroupList(currentGroup.Member.Parent)
					uni.showToast({
						title: '修改成功',
						icon: 'success',
						duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
						mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
					});
				}
			})
		} else {
			GroupApi.addGroup({
				type: 1,
				name: groupName.value,
				Parent: isRoot.value ? undefined : currentGroup.Member.id
			}).then(res => {
				if (res.code === 200) {
					groupState.value = false
					actionBarState.value = false
					groupName.value = ''
					if (!isRoot.value) {
						parentGroup.value.push(JSON.parse(JSON.stringify(groupList.value)))
						getShopGroupList(currentGroup.Member.id)
						historyGroup.value.pop()
					} else {
						getShopGroupList()
					}
					uni.showToast({
						title: '添加成功',
						icon: 'success',
						duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
						mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
					});
				}
			})
		}

	}
	const backLevel = () => {
		getShopGroupList(parentGroup.value[parentGroup.value.length - 1][0].Member.Parent)
		parentGroup.value.pop()
		historyGroup.value.pop()
		openState.value = false
	}
	const relationShop = () => {
		relationState.value = true
		getShopRelationList()
	}
	const editGroup = () => {
		isEdit.value = true
		groupState.value = true
		groupName.value = currentGroup.Member.name
	}
	const delGroup = () => {
		// 调用 uni.showModal 方法
		uni.showModal({
			title: '确认移除该分组？', // 弹窗的标题
			content: '移除后不再显示该分组', // 弹窗的内容
			success: (res) => {
				// 用户点击了哪个按钮
				if (res.confirm) {
					GroupApi.deleteGroup(currentGroup.Member.id).then(res => {
						if (res.code === 200) {
							getShopGroupList()
							actionBarState.value = false
							uni.showToast({
								title: '删除成功',
								icon: 'success',
								duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
								mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
							});
						}
					})
					// 在这里执行确定后的逻辑
				} else if (res.cancel) {
					console.log('用户点击了取消');
					// 在这里执行取消后的逻辑
				}
			},
			fail: function() {
				console.log('调用失败');
			}
		});
	}
	const delShop = (item) => {
		// 调用 uni.showModal 方法
		uni.showModal({
			title: '确认删除该店铺？', // 弹窗的标题
			content: '删除后不再显示该店铺', // 弹窗的内容
			success: (res) => {
				// 用户点击了哪个按钮
				if (res.confirm) {
					GroupApi.groupRemoveShop({
						groupId: currentGroup.Member.id,
						shopIds: [item.id],
						shopOfficeIds: [item.office_id]
					}).then(res => {
						if (res.code === 200) {
							getShopList()
							uni.showToast({
								title: '删除成功',
								icon: 'success',
								duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
								mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
							});
						}
					})
					// 在这里执行确定后的逻辑
				} else if (res.cancel) {
					console.log('用户点击了取消');
					// 在这里执行取消后的逻辑
				}
			},
			fail: function() {
				console.log('调用失败');
			}
		});
	}
	const systemBarHeight = ref(0)
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	const isV2 = ref(false)
	onLoad((options) => {
		getSysteminfo()
		if (options && options.isV2) {
			isV2.value = JSON.parse(options.isV2)
		}
	})
</script>

<style scoped lang="scss">
	.list-container {
		width: 100%;
		background-color: #F9F9F9;
		min-height: 100vh;
		box-sizing: border-box;

		.tips {
			width: 100%;
			box-sizing: border-box;
			padding: 0 30rpx;
			font-weight: 400;
			font-size: 26rpx;
			color: #999999;
			line-height: 37rpx;
			text-align: left;
			font-style: normal;
			line-height: 60rpx;
			margin-bottom: 10rpx;

			text {
				color: #F81C3A;
			}
		}

		.step-a-main {
			width: 100%;
			box-sizing: border-box;
			background-color: #ffffff;
			padding: 0 30rpx;

			.step-a-item {
				width: 100%;
				height: 90rpx;
				border-bottom: 1px solid #DFDFDF;
				display: flex;
				align-items: center;
				justify-content: space-between;

				.item-left {
					font-weight: 400;
					font-size: 28rpx;
					color: #333333;
					text-align: left;
					font-style: normal;
				}

				.item-right {
					display: flex;
					align-items: center;
				}

				.right-arrow {
					width: 34rpx;
					height: 34rpx;
					margin-left: 30rpx;
				}
			}

			.step-a-item:last-child {
				border-bottom: none;
			}
		}

		.step-b-main {
			background-color: #F9F9F9;
			height: calc(100vh - var(--tab-bar-height) - env(safe-area-inset-bottom) - 300rpx);
			overflow-y: auto;
		}

		.step-b {
			width: 100%;
			box-sizing: border-box;
			padding: 20rpx 30rpx;
		}

		.user-list {
			.user-item {
				width: 100%;
				box-sizing: border-box;
				background: #FFFFFF;
				border-radius: 14rpx;
				padding: 30rpx;

				.item-title {
					display: flex;
					align-items: center;
					justify-content: space-between;
					margin-bottom: 20rpx;

					.title-left {
						font-weight: 500;
						font-size: 36rpx;
						color: #333333;
						text-align: left;
						font-style: normal;
					}

					.title-right {
						.right-icon {
							margin-left: 40rpx;
						}
					}
				}

				.item-row {
					display: flex;
					align-items: center;
					height: 60rpx;
					line-height: 60rpx;

					.row-title {
						width: 120rpx;
						margin-right: 50rpx;
						font-size: 28rpx;
						color: #999999;
					}

					.row-main {
						color: #666666;
						font-size: 28rpx;
					}
				}
			}
		}
	}

	.btn-item {
		width: 100%;
		height: 80rpx;
		background: #FFFFFF;
		border-radius: 14rpx;
		border: 1px solid #FACC05;
		text-align: center;
		font-weight: 400;
		font-size: 30rpx;
		color: #FACC05;
		line-height: 80rpx;
		margin-bottom: 30rpx;
	}

	.btn-item-main {
		position: fixed;
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx;
		left: 0;
		bottom: calc(env(safe-area-inset-bottom) + 15px);

		.btn-item {
			background: #FACC05;
			color: #333;
		}

		.btn-item-back {
			background-color: #FACC05;
			color: #333;
		}
	}

	.confirm-group {
		background-color: #FACC05 !important;
	}

	.footer {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 40rpx;
	}

	.log-title {
		font-size: 36rpx;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.code-input {
		display: flex;
		align-items: center;
		margin-bottom: 40rpx;

		.item-name {
			width: 140rpx;
			font-family: PingFangSC, PingFang SC;
			font-weight: 400;
			font-size: 28rpx;
			color: #666666;
			text-align: left;
		}

		.code-input-main {
			width: calc(100% - 140rpx);
			height: 80rpx;
			background: #FFFFFF;
			border-radius: 14rpx;
			border: 1px solid #DFDFDF;
			box-sizing: border-box;
			padding-left: 20rpx;
			display: flex;
			align-items: center;
		}
	}

	.shop-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: 130rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
		margin-bottom: 30rpx;
		box-sizing: border-box;
		padding: 0 24rpx;

		.shop-img {
			width: 66rpx;
			height: 66rpx;
			border-radius: 33rpx;
			overflow: hidden;
			margin-right: 15rpx;
		}

		.item-left {
			display: flex;
			align-items: center;
			width: calc(100% - 30rpx);
		}

		.item-title {
			font-weight: 500;
			font-size: 30rpx;
			color: #333333;
			line-height: 42rpx;
			white-space: nowrap;
			/* 不换行 */
			overflow: hidden;
			/* 隐藏溢出的内容 */
			text-overflow: ellipsis;
			/* 显示省略号 */
			margin-bottom: 8rpx;
		}

		.item-main {
			width: calc(100% - 90rpx);
		}

		.item-msg {
			display: flex;
			align-items: center;
		}
	}

	.text_3 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text_4 {
		overflow-wrap: break-word;
		color: rgba(223, 223, 223, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.label_5 {
		width: 23rpx;
		height: 28rpx;
		margin-right: 6rpx;
	}

	.text_7 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	::v-deep .wd-pager {
		background-color: transparent;
	}

	.shop-list-main {
		height: 600rpx;
		overflow-y: auto;
	}

	.relation-container {
		position: relative;

		.relation-title {
			display: flex;
			align-items: center;
			font-weight: 400;
			font-size: 28rpx;
			color: #333333;
			background: linear-gradient(180deg, #FFE9EC 0%, #FAF4F5 100%), #D8D8D8;
			border-radius: 14rpx;
			padding: 10rpx 20rpx;
			position: absolute;
			top: 0;
			left: 30rpx;

			.relation-title-img {
				width: 40rpx;
				height: 40rpx;
				border-radius: 50%;
				margin-right: 12rpx;
			}
		}
	}

	::v-deep .wd-tabs__nav-container {
		.is-active {
			color: #F81C3A;
		}

		.wd-tabs__line {
			background-color: #F81C3A;
		}
	}

	.relation-filter-input {
		width: 48%;
		box-sizing: border-box;
		padding: 10rpx 20rpx;
		border-radius: 8px;
		border: 1px solid #979797;
	}

	.relation-filter {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 10rpx;
	}

	::v-deep .wd-picker__cell {
		padding: 0;
	}

	.group-name {
		font-weight: 400;
		font-size: 26rpx;
		color: #333333;
	}

	::v-deep .wd-checkbox {
		display: flex;
		align-items: center;
	}

	.con-btn {
		display: flex;
		align-items: center;
		justify-content: space-between;

		.all-change {
			height: 80rpx;
			background: #FACC05;
			border-radius: 14rpx;
			font-size: 34rpx;
			color: #333;
			line-height: 80rpx;
			text-align: center;
			width: calc(100% - 140rpx);
		}
	}
</style>