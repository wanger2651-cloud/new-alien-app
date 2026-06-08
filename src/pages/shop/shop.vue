<template>
	<view class="shop">
		<view class="shop-top" :class="{'tab-active': tab}" :style="{paddingTop: systemBarHeight + 'px'}">
			<view style="width: 100%;box-sizing: border-box;">
				<view class="tabs-container">
					<wd-tabs v-model="tab" inactiveColor="#333333" auto-line-width @click="selectTab">
						<block v-for="item in tabList" :key="item.value">
							<wd-tab :title="item.name"></wd-tab>
						</block>
					</wd-tabs>
				</view>
				<view class="search-container">
					<wd-search v-model="searchValue" placeholder-left placeholder="输入门店名称或门店ID搜索" hide-cancel
						@focus="focus" @blur="blur" @search="search" @clear="search" @change="change" maxlength="10" />
				</view>
				<view class="butList">
					<view class="itemBox" @tap="addShop">
						<image src="../../static/shop/add.png" class="down" mode=""></image>
						<view class="boxText">添加</view>
					</view>
					<view class="itemBox" @tap="bandShop">
						<image src="../../static/shop/bd.png" class="down" mode=""></image>
						<view class="boxText">绑定</view>
					</view>
					<view class="itemBox" @tap="toRecycleBin">
						<image src="../../static/shop/del.png" class="down" mode=""></image>
						<view class="boxText">回收</view>
					</view>
					<view class="itemFilt" @tap="openFilter">
						<image src="../../static/shop/flu.png" class="filt" mode=""></image>
						<view class="filtText">筛选</view>
					</view>
				</view>
			</view>
		</view>
		<scroll-view class="shop-container" :scroll-top="scrollTop" scroll-y="true" @scroll="scroll"
			:refresher-triggered="isRefreshing" :refresher-enabled="true" @refresherrefresh="listResh"
			style="width: 100%;box-sizing: border-box;padding: 30rpx 30rpx 0;">
			<view class="foodItem " v-for="(item, index) in cardList" :key="index">
				<view class="itemOne ">
					<image :src="item.img ? item.img : '@/static/user/zdblogo.png'" class="leftImg " mode="">
					</image>
					<view class="rightText">
						<view class="rightOne">{{ item.name }}</view>
						<view class="rightTwo">
							<view class="md">门店ID：{{ item.office_id }}</view>
							<view class=""
								style="display: flex;align-items: center;width:280rpx;justify-content: flex-end;">
								<view class="yy">· {{ getShopStatus(item.state) }}</view>
								<view class="sq" :class="{'error-sq': item.state == 3}">·
									{{ item.state == 3 ? '授权异常' : '授权正常'  }}
								</view>
							</view>
						</view>
					</view>
				</view>
				<view class="block_5 flex store_flex flex-row justify-between">
					<view class="image-text_7 flex flex-row justify-between">
						<view class="point" :class="{'point-up': item.ZDCC}"></view>
						<text class="text-group_6">出餐</text>
					</view>
					<view class="image-text_7 flex flex-row justify-between">
						<view class="point" :class="{'point-up': item.IMZDHF}"></view>
						<text class="text-group_6">回复</text>
					</view>
					<view class="image-text_7 flex flex-row justify-between">
						<view class="point" :class="{'point-up': item.ZDHP}"></view>
						<text class="text-group_6">回评</text>
					</view>
					<view class="image-text_7 flex flex-row justify-between">
						<view class="point" :class="{'point-up': item.ZDTG}"></view>
						<text class="text-group_6">点金</text>
					</view>
				</view>
				<view class="line"></view>
				<view class="itemTwo">
					<view v-if="item.state == 3" class="repair" :class="{isElm: tab === 1}" @click="repair(item)">修复
					</view>
					<view class="msgBut" :class="{isElm: tab === 1}" @click="copyMsg(item)">复制信息</view>
					<view class="toBut" :class="{isElm: tab === 1}" @click="toManage(item)">去管理</view>
				</view>
			</view>
			<wd-pagination v-model.async="queryParams.page" :total="pageTotal" v-if="cardList.length"
				:page-size.async="queryParams.pageSize" style="width:100%;background-color: transparent;"
				@change="getShopList" show-icon></wd-pagination>
		</scroll-view>
		<view v-if="cardList.length === 0" class="not-data">
			暂无数据
		</view>
		<!-- <suspenButton size="94rpx" bgColor="#fff" topIcon="../../static/shop/topIcon.png" leftIcon="../../static/shop/leftIcon.png" centerIcon="../../static/shop/centerIcon.png"></suspenButton> -->
		<!-- 筛选弹框  v-if="popupName === PopupNames.FilterShop"-->
		<wd-action-sheet v-model="filterState" @close="closeFilter" title="筛选" :z-index="600">
			<view style="padding: 15px;">
				<view class="filter-item">
					<view class="filter-item-title" style="margin-bottom: 20rpx;">
						筛选功能状态
					</view>
					<view class="col-picker">
						<wd-col-picker label="类型" v-model="funFilterItem" :columns="funFilterList"
							:column-change="columnChange" :use-default-slot="true" @confirm="handleConfirm">
							<view class="choose-fun">
								{{ isChooseStr ? '已选择' : '请选择' }}
								<view class="is-choose-fun">
									{{ isChooseStr }}
								</view>
								<wd-icon name="error-fill" size="16px" class="clear-fun" v-if="isChooseStr"
									@click.stop="clearFunStr"></wd-icon>
							</view>
						</wd-col-picker>
					</view>
				</view>
				<view class="filter-item">
					<view class="filter-item-title">
						授权状态
					</view>
					<view class="filter-list">
						<view class="filter-list-item"
							:class="{'is-active': authorizeIndex === 1, 'is-elm-active': tab === 1}"
							@click="selectAuthorize(1)">全部</view>
						<view class="filter-list-item"
							:class="{'is-active': authorizeIndex === 2, 'is-elm-active': tab === 1}"
							@click="selectAuthorize(2)">授权正常</view>
						<view class="filter-list-item"
							:class="{'is-active': authorizeIndex === 3, 'is-elm-active': tab === 1}"
							@click="selectAuthorize(3)">授权异常</view>
					</view>
				</view>
				<view class="filter-item">
					<view class="filter-item-title">
						筛选类别
					</view>
					<view class="filter-list">
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 1, 'is-elm-active': tab === 1}"
							@click="selectCategory(1)">按店铺筛选</view>
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 2, 'is-elm-active': tab === 1}"
							@click="selectCategory(2)">按分组筛选</view>
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 3, 'is-elm-active': tab === 1}"
							@click="selectCategory(3)">按城市筛选</view>
					</view>
				</view>
				<view class="filter-item">
					<view
						style="display: flex;align-items: center;justify-content: space-between;margin-bottom: 20rpx;">
						<view class="filter-item-title" style="margin-bottom: 0;">选择筛选类型<text
								v-if="categoryIndex === 3">（多选）</text><text v-else>（单选）</text></view>
						<wd-button block type="text" @click="removeFilter" style="margin: 0"
							v-if="categoryIndex === 2 || categoryIndex === 3">清空</wd-button>
					</view>
					<view class="filter-list" v-show="categoryIndex === 1">
						<view class="filter-list-item"
							:class="{'is-active': selsectType === undefined, 'is-elm-active': tab === 1}"
							@click="selectFilterType(undefined)">全部门店</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 4, 'is-elm-active': tab === 1}"
							@click="selectFilterType(4)">营业中</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 5, 'is-elm-active': tab === 1}"
							@click="selectFilterType(5)">暂停营业</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 6, 'is-elm-active': tab === 1}"
							@click="selectFilterType(6)">店铺上线中</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 7, 'is-elm-active': tab === 1}"
							@click="selectFilterType(7)">店铺已下线</view>
					</view>
					<view class="filter-city-list collapse" v-show="categoryIndex === 2">
						<wd-collapse v-model="selectGroup">
							<wd-collapse-item :name="item.Member.name" v-for="item in groupList" :key="item.Member.id"
								custom-body-style="padding:0 0 0 14px">
								<template #title="{ expanded, disabled, isFirst }">
									<view class="header">
										<view style="display: flex;align-items: center;">
											<image src="../../static/icon/icon_down.png"
												style="width: 26rpx;height: 26rpx;margin-right: 10rpx;"
												:class="{'rotate180deg': expanded}"></image>
											<view>{{ item.Member.name }}</view>
										</view>
									</view>
								</template>
								<wd-collapse v-model="selectItemGroup">
									<wd-collapse-item :name="_item.Member.name" v-for="(_item, _index) in item.children"
										:key="_item.Member.id" :custom-class="_index === 0 ? 'no-border' : ''">
										<template #title="{ expanded, disabled, isFirst }">
											<view class="header">
												<view style="display: flex;align-items: center;">
													<image src="../../static/icon/icon_down.png"
														style="width: 26rpx;height: 26rpx;margin-right: 10rpx;"
														:class="{'rotate180deg': expanded}"></image>
													{{ _item.Member.name }}
												</view>
											</view>
										</template>
										<view class="radio-list">
											<view v-for="__item in _item.children" :key="__item.Member.id">
												<wd-radio-group v-model="proupValue" checked-color="rgb(226, 61, 65)">
													<wd-radio shape="dot"
														:value="__item.Member.id">{{ __item.Member.name }}</wd-radio>
												</wd-radio-group>
											</view>
										</view>
									</wd-collapse-item>
								</wd-collapse>
							</wd-collapse-item>
						</wd-collapse>
					</view>
					<view class="filter-city-list" v-show="categoryIndex === 3">
						<wd-collapse v-model="provinceList">
							<wd-collapse-item :name="item.value" v-for="item in cityList" :key="item.value">
								<template #title="{ expanded, disabled, isFirst }">
									<view class="header">
										<view style="display: flex;align-items: center;">
											<image src="../../static/icon/icon_down.png"
												style="width: 26rpx;height: 26rpx;margin-right: 10rpx;"
												:class="{'rotate180deg': expanded}"></image>
											{{ item.value }}
										</view>
										<view @click.stop="stopClick"><wd-checkbox v-model="item.check"
												@change="allSelect(item)" checked-color="#2CCA87">全选</wd-checkbox>
										</view>
									</view>
								</template>
								<view class="filter-list">
									<view class="filter-list-item" :class="{'is-active': _item.check}"
										v-for="_item in item.children" :key="_item.value"
										@click="selectItem(item, _item)">{{ _item.value }}</view>
								</view>
							</wd-collapse-item>
						</wd-collapse>
					</view>

				</view>
				<view class="confirm-filter" :class="{'elm-confirm-filter': tab === 1}" @click="confirmFilter">确认</view>
			</view>
		</wd-action-sheet>

		<!-- 绑定店铺 -->
		<wd-popup v-model="bindState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="bindClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					绑定店铺
				</view>
				<view class="log-main">
					<view class="code-input">
						<wd-input v-model="bindCode" :no-border="true" placeholder="请输入绑定码" class="code-input-main" />
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="bindClose" block>取消</wd-button>
						<wd-button size="large" @click="confirmCode" block>确定</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

		<wd-popup v-model="copyState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="copyClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					复制信息
				</view>
				<view class="log-main">
					<view>平台：{{ copyobj.shop_type == 1 ? '美团外卖' : '饿了么外卖' }}</view>
					<view>店铺名称：{{ copyobj.name }}</view>
					<view>店铺ID：{{ copyobj.office_id }}</view>
					<view>自动出餐到期时间：{{ copyobj.ZDCCtime }}</view>
					<view>自动回复到期时间：{{ copyobj.IMZDHFtime }}</view>
					<view>自动回评到期时间：{{ copyobj.ZDHPtime }}</view>
					<view>自动点金到期时间：{{ copyobj.ZDTGtime }}</view>
					<view>菜品美化到期时间：{{ copyobj.CPDTtimetext }}</view>
					<view>门店绑定码：{{ copyobj.code }} （5分钟内有效）</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="copyClose" block>取消</wd-button>
						<wd-button size="large" @click="confirmCopy" block>复制</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

		<wd-popup v-model="addState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="addClose"
			:z-index="601">
			<view class="log-container">
				<view class="log-title">
					店铺添加成功
				</view>
				<view class="log-main">
					<view>店铺名称：{{ successObj.name }}</view>
					<view>店铺ID：{{ successObj.office_id }}</view>
					<view class="footer">
						<wd-button size="large" @click="addConfirm" block>确定</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

		<wd-popup v-model="colseShow" position="bottom" :closable="true" custom-style="height: 90%" @close="colseV"
			:z-index="601">
			<view class="popup-box">
				<view class="p-title ft30 tc">{{ isRepair ? '修复店铺' : '添加店铺' }}</view>
			</view>
		</wd-popup>
	</view>
</template>

<script setup>
	import {
		getCurrentInstance,
		ref,
		watch,
		onMounted,
		reactive,
		nextTick
	} from 'vue';
	import {
		ShopApi
	} from '@/api/shop.ts'
	import {
		onLoad,
		onTabItemTap,
		onShow
	} from '@dcloudio/uni-app';
	// import {useRouter } from '@/utils/router';
	// import suspenButton from '../../components/px-suspen-button/index.vue'
	// const router = useRouter()
	const tab = ref(0)
	const tabList = reactive([{
			name: '美团外卖',
			value: 1
		},
		{
			name: '饿了么',
			value: 2
		}
	])
	const cardList = ref([])
	const searchValue = ref('')
	const systemBarHeight = ref(0)
	const bindState = ref(false)
	const storeCode = ref('')
	let queryParams = reactive({
		page: 1,
		pageSize: 10,
		filter: {
			time_state: undefined, // 店铺到期时间过期 全部 = 0 未到期 = 1 即将到期 = 2 已经到期 = 3
			shopType: 1, // 店铺类型  None = 0  美团 = 1  饿了么 = 2
			word: undefined, // 门店名称或官方id
			group: undefined, // 指定分组
			state: undefined, // None = 0  店铺未登陆 = 1  店铺已掉线 = 3  店铺营业中 = 4  店铺上线中 = 6  店铺已下线 = 7
			ck_online: undefined, // 店铺正常授权 即dk 有效
			citys: undefined, // 指定哪些城市
			func_code: undefined, // 过滤功能
			func_state: undefined, //   全部 = 0  未到期 = 1  即将到期 = 2  功能已关闭 = 4  已经到期 = 5
			avtag: undefined
		}
	})
	const copyState = ref(false)
	const pageTotal = ref(0)
	let copyobj = reactive({})
	const bindCode = ref('')
	const filterState = ref(false)
	const authorizeIndex = ref(1)
	const categoryIndex = ref(1)
	const selectGroup = ref([])
	const selectItemGroup = ref([])
	const proupValue = ref('')
	const provinceList = ref([])
	const groupList = ref([])
	const selsectType = ref(undefined)
	const cityList = ref([])
	const checkCityList = ref([])
	const colseShow = ref(false)
	const cookieStr = ref('')
	let checkinter = null
	let w = null
	const addState = ref(false)
	let successObj = reactive({})
	const scrollTop = ref(0)
	const scrollTopOld = reactive({
		scrollTop: 0
	})
	const funFilterList = ref([
		[{
				label: '自动防漏单',
				value: 'ZDCC',
				columns: [{
						label: '全部',
						value: 0
					},
					{
						label: '已开启',
						value: 3
					},
					{
						label: '已关闭',
						value: 4
					},
					{
						label: '已到期',
						value: 5
					},
					{
						label: '即将到期',
						value: 2
					},
					{
						label: '未到期',
						value: 1
					}
				]
			},
			{
				label: '自动回复',
				value: 'IMZDHF',
				columns: [{
						label: '全部',
						value: 0
					},
					{
						label: '已开启',
						value: 3
					},
					{
						label: '已关闭',
						value: 4
					},
					{
						label: '已到期',
						value: 5
					},
					{
						label: '即将到期',
						value: 2
					},
					{
						label: '未到期',
						value: 1
					}
				]
			},
			{
				label: '自动回评',
				value: 'ZDHP',
				columns: [{
						label: '全部',
						value: 0
					},
					{
						label: '已开启',
						value: 3
					},
					{
						label: '已关闭',
						value: 4
					},
					{
						label: '已到期',
						value: 5
					},
					{
						label: '即将到期',
						value: 2
					},
					{
						label: '未到期',
						value: 1
					}
				]
			},
			{
				label: '自动点金',
				value: 'ZDTG',
				columns: [{
						label: '全部',
						value: 0
					},
					{
						label: '已开启',
						value: 3
					},
					{
						label: '已关闭',
						value: 4
					},
					{
						label: '已到期',
						value: 5
					},
					{
						label: '即将到期',
						value: 2
					},
					{
						label: '未到期',
						value: 1
					}
				]
			},
			{
				label: '菜品动图',
				value: 'CPDT',
				columns: [{
						label: '全部',
						value: 0
					},
					{
						label: '已到期',
						value: 5
					},
					{
						label: '即将到期',
						value: 2
					},
					{
						label: '未到期',
						value: 1
					}
				]
			}
		]
	])
	const funFilterItem = ref([])
	const isChooseStr = ref('')
	const isRepair = ref(false)
	let currentRepair = reactive({})
	const isRefreshing = ref(false)

	const listResh = () => {
		isRefreshing.value = true
		getShopList()
	}
	const repair = (item) => {
		currentRepair = item
		isRepair.value = true
		addShop()
	}
	const columnChange = ({
		selectedItem,
		resolve,
		finish
	}) => {
		if (selectedItem.columns && selectedItem.columns.length) {
			resolve(selectedItem.columns)
		} else {
			finish()
		}
	}
	const chooseFilterFunVal = ref([])
	const handleConfirm = (val) => {
		isChooseStr.value = ''
		chooseFilterFunVal.value = val.value
		val.selectedItems.forEach(item => {
			isChooseStr.value += (item.label + '/')
		})
		isChooseStr.value = isChooseStr.value.slice(0, -1)
	}
	const clearFunStr = () => {
		chooseFilterFunVal.value = []
		funFilterItem.value.length = 1
		isChooseStr.value = ''
	}
	const scroll = (e) => {
		scrollTopOld.scrollTop = e.detail.scrollTop
	}
	const addConfirm = () => {
		let data =
			"店铺名称：" + successObj.name +
			"\n店铺ID：" + successObj.office_id
		uni.setClipboardData({
			data
		});
		addClose()
		getShopList()
	}
	const colseV = () => {
		plus.webview.close(w);
		plus.cache.clear();
		clearInterval(checkinter);
		isRepair.value = false
	}
	const addClose = () => {
		addState.value = false
	}
	const getprovincewithcitys = () => {
		ShopApi.getprovincewithcitys().then(res => {
			if (res.code === 200) {
				let arr = []
				for (let key in res.data) {
					let children = res.data[key].map(item => {
						return {
							value: item,
							label: item,
							check: false
						}
					})
					arr.push({
						value: key,
						label: key,
						children: children,
						check: false
					})
				}
				cityList.value = [...arr];
			}
		})
	}
	const getGroupList = () => {
		ShopApi.getGroup({
			grouptype: 1,
			recursionchild: true
		}).then(res => {
			if (res.code === 200) {
				groupList.value = res.data
			}
		})
	}
	const allSelect = (item) => {
		item.children.forEach(_item => {
			_item.check = item.check
		})
	}
	const removeFilter = () => {
		if (categoryIndex.value === 2) {
			proupValue.value = undefined
		} else if (categoryIndex.value == 3) {
			cityList.value.forEach(item => {
				item.check = false
				item.children.forEach(_item => {
					_item.check = false
				})
			})
		}
	}
	const stopClick = (e) => {
		e.stopPropagation();
	}
	const selectCategory = (index) => {
		categoryIndex.value = index
	}
	const selectItem = (item, _item) => {
		_item.check = !_item.check
		let hasCheck = item.children.filter(obj => obj.check === true)
		if (hasCheck.length === item.children.length) {
			item.check = true
		}
	}
	const selectAuthorize = (index) => {
		authorizeIndex.value = index
	}
	const selectFilterType = (index) => {
		selsectType.value = index
	}
	const confirmFilter = () => {
		queryParams = {
			page: 1,
			pageSize: 10,
			filter: {
				time_state: undefined, // 店铺到期时间过期 全部 = 0 未到期 = 1 即将到期 = 2 已经到期 = 3
				shopType: tab.value == 1 ? '2' : '1', // 店铺类型  None = 0  美团 = 1  饿了么 = 2
				word: undefined, // 门店名称或官方id
				group: undefined, // 指定分组
				state: undefined, // None = 0  店铺未登陆 = 1  店铺已掉线 = 3  店铺营业中 = 4  店铺上线中 = 6  店铺已下线 = 7
				ck_online: undefined, // 店铺正常授权 即dk 有效
				citys: undefined, // 指定哪些城市
				func_code: undefined, // 过滤功能
				func_state: undefined, //   全部 = 0  未到期 = 1  即将到期 = 2  功能已关闭 = 4  已经到期 = 5
				avtag: undefined
			}
		}
		// 筛选城市
		checkCityList.value = []
		cityList.value.forEach(item => {
			item.children.forEach(_item => {
				if (_item.check) {
					checkCityList.value.push(_item.value)
				}
			})
		})
		if (checkCityList.value.length) {
			queryParams.filter.citys = checkCityList.value
		}
		// 筛选店铺
		if (selsectType.value) {
			queryParams.filter.state = selsectType.value
		}
		// 分组
		if (proupValue.value) {
			queryParams.filter.group = proupValue.value
		}
		// 授权状态
		if (authorizeIndex.value === 2) {
			queryParams.filter.ck_online = true
		} else if (authorizeIndex.value === 3) {
			queryParams.filter.state = 3
		} else {
			queryParams.filter.ck_online = undefined
		}
		queryParams.filter.func_code = chooseFilterFunVal.value[0]
		queryParams.filter.func_state = chooseFilterFunVal.value[1]
		closeFilter()
		getShopList()
	}
	const openFilter = () => {
		filterState.value = true
		uni.hideTabBar()
	}
	const closeFilter = () => {
		filterState.value = false
		uni.showTabBar()
	}
	const confirmCopy = () => {
		let data = "平台：" + (copyobj.shop_type == 1 ? '美团外卖' : '饿了么外卖') +
			"\n店铺名称：" + copyobj.name +
			"\n店铺ID：" + copyobj.office_id +
			"\n自动出餐到期时间：" + copyobj.ZDCCtime +
			"\n自动回复到期时间：" + copyobj.IMZDHFtime +
			"\n自动回评到期时间：" + copyobj.ZDHPtime +
			"\n自动点金到期时间：" + copyobj.ZDTGtime +
			"\n菜品美化到期时间：" + copyobj.CPDTtimetext +
			"\n门店绑定码：" + copyobj.code;
		uni.setClipboardData({
			data,
			success: () => {
				copyState.value = false
				uni.showToast({
					title: '复制成功',
					icon: 'success',
					duration: 2000
				});
			},
			fail: (err) => {
				uni.showToast({
					title: '复制失败',
					icon: 'none',
					duration: 2000
				});
				console.error('复制失败:', err);
			}
		});
	}
	const copyClose = () => {
		copyState.value = false
		uni.showTabBar()
	}
	const bandShop = () => {
		bindState.value = true
		uni.hideTabBar()
	}
	const toRecycleBin = () => {
		uni.navigateTo({
			url: '/pages/recycle-bin/recycle-bin'
		})
	}
	const confirmCode = () => {
		if (!bindCode.value) {
			return uni.showToast({
				title: '请填写绑定码',
				icon: 'error',
				duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
				mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
			});
		}
		ShopApi.bindShop({
			code: bindCode.value
		}).then(res => {
			if (res === 200) {
				bindClose()
				uni.showToast({
					title: '绑定成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			}
		}).catch(err => {
			console.log(err)
		}).finally(() => {})
	}
	const bindClose = () => {
		bindState.value = false
		bindCode.value = ''
		uni.showTabBar()
	}

	const agentAddShop = (data) => {
		uni.showLoading({})
		ShopApi.agentAddShop(data).then(res => {
			if (res.code === 200) {
				successObj = res.data
				addState.value = true
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}

	const meituan = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		// const app = this;
		uni.showLoading({})
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"
		)
		let getWindowInfo = uni.getWindowInfo()
		let url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'mywebview';
		const webview_setting = {
			'disablePlus': false,
			'scrollIndicator': 'all',
			'width': getWindowInfo.screenWidth + 'px',
			'top': '18%',
			'scalable': true,
		};
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.webview.close(w);
		w = plus.webview.create(url, webviewid, webview_setting)
		// w.show();
		setTimeout(() => {
			plus.webview.close(w);
			setTimeout(() => {
				w = plus.webview.open(url, webviewid, webview_setting);
				colseShow.value = true;
				// console.log(colseShow.value, '123456')
				w.show();
				uni.hideLoading({})
				checkinter = setInterval(() => {
					//console.log(1)
					let str = w.getURL();
					if (str && (str.indexOf("time=") != -1 || str.indexOf("/#/new_fe/") !=
							-1)) {
						let cookiestr = plus.navigator.getCookie(str);
						console.log("美团cookiestr", cookiestr);
						// w.overrideUrlLoading({
						// 	mode: 'allow',
						// 	// effect: 'touchstart',
						// 	// match: 'https://*/gw/login/password*'
						// }, (e) => {
						// 	console.log(e, '111')
						// })
						try {
							if (cookiestr.indexOf("token=") && cookiestr.indexOf("acctId=") &&
								cookiestr.indexOf("wmPoiId=") != -1) {
								// setTimeout(() => {
								// app.add(cookiestr, '美团');
								cookieStr.value = cookiestr
								// }, 1000);
								const params = {
									shop_type: queryParams.filter.shopType,
									cookies: cookieStr.value.replace('美团cookiestr', '')
								}
								agentAddShop(params)
								colseShow.value = false;
								plus.navigator.removeAllCookie()
								plus.navigator.removeCookie()
								plus.navigator.removeSessionCookie()
								plus.webview.close(w);
							}
						} catch (e) {
							plus.navigator.removeAllCookie()
							plus.navigator.removeCookie()
							plus.navigator.removeSessionCookie()
							return;
						}

					}
				}, 500)

			}, 500)
		}, 500)
		// #endif
	}
	const eleme = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		// const app = this;
		uni.showLoading({})
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		//console.log(plus.navigator.getUserAgent)
		let url = 'https://melody.shop.ele.me';
		let getWindowInfo = uni.getWindowInfo()
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'pcwebview';
		const webview_setting = {
			'top': '18%',
		};
		console.log('清理缓存');
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.cache.clear(function() {});
		plus.webview.close(w);


		//"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46"
		//"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"

		console.log(plus.navigator.getUserAgent(url));
		w = plus.webview.create(url, webviewid, webview_setting);
		// w.show();
		setTimeout(() => {
			plus.webview.close(w);
			setTimeout(() => {
				w = plus.webview.create(url + '/login', webviewid, webview_setting);
				colseShow.value = true;
				w.show();
				uni.hideLoading({})
				checkinter = setInterval(() => {
					let str = w.getURL();
					let cookiestr = plus.navigator.getCookie(str);
					// console.log('当前网址为：' + str);
					if (cookiestr && cookiestr.indexOf("x5check_napos=") != -1) {
						console.log(cookiestr);
						const params = {
							shop_type: queryParams.filter.shopType,
							cookies: cookiestr
						}
						agentAddShop(params)
						// cna=mYWtHFArpXQCAXjr1KQ+E+sF; __wpkreporterwid_=6be8ead9-d8aa-4461-98ae-b2e6af478511; x5check_napos=ZTFLYZMTA1Mjg1NTU2Mjk5NzAxT1ZIRndDKzZQ; ksid=ZTFLYZMTA1Mjg1NTU2Mjk5NzAxT1ZIRndDKzZQ; shopId=504162536; AEM_TAG_ID_CATCH_DATA_ES00000044={%22tagId%22:%22ES00000044%22%2C%22data%22:%22%E7%94%9C%E7%82%B9%E9%A5%AE%E5%93%81%22%2C%22userId%22:504162536%2C%22time%22:1680250822895}; AEM_TAG_ID_CATCH_DATA_ES00000069={%22tagId%22:%22ES00000069%22%2C%22data%22:%22%E8%80%81%E5%BA%97%22%2C%22userId%22:504162536%2C%22time%22:1680250822898}; AEM_TAG_ID_CATCH_DATA_ES00000035={%22tagId%22:%22ES00000035%22%2C%22userId%22:504162536%2C%22time%22:1680250822902}; AEM_TAG_ID_CATCH_DATA_ES00000021={%22tagId%22:%22ES00000021%22%2C%22data%22:%22%E5%85%A8%E5%9B%BD%E8%BF%9E%E9%94%81%22%2C%22userId%22:504162536%2C%22time%22:1680250822905}; AEM_TAG_ID_CATCH_DATA_ES00000019={%22tagId%22:%22ES00000019%22%2C%22data%22:%22%E6%AD%A6%E6%B1%89%22%2C%22userId%22:504162536%2C%22time%22:1680250822906}; isg=BK2tbMFztSpMIFHGNNpJ3ILqt0AnCuHcV_tr-e-y5cSzZsgYt1gTrVAkUjyAZvmU
						plus.webview.close(w);
						plus.cache.clear();
						colseShow.value = false;
						clearInterval(checkinter);
						// app.add(cookiestr, '饿了么');
						let wmPoiId = cookiestr.match(/shopId=(\S*);/)[1];
						let ksid = cookiestr.match(/ksid=(\S*);/)[1];
						plus.navigator.setCookie(
							"cna=mYWtHFArpXQCAXjr1KQ+E+sF; __wpkreporterwid_=6be8ead9-d8aa-4461-98ae-b2e6af478511; isg=BMXFO3QXDWKkJCm-XGLhBNry3wj_gnkU__NzIccqjfwLXuDQj9Br5fg8bKSoHpHM"
						);
					}
				}, 500)
			}, 500)
		}, 500)
		// #endif
	}
	const addShop = () => {
		// console.log(tab)
		if (queryParams.filter.shopType == 1) {
			meituan()
		} else {
			eleme()
		}
	}
	const closeAddShopPopupHandler = () => {

	}
	watch(() => [filterState.value, bindState.value], (newValue, oldValue) => {
		if (newValue[0] === false && newValue[1] === false && newValue[2] === false) {
			uni.showTabBar()
		}
	})
	const focus = () => {
		console.log('聚焦')
	}
	const blur = () => {
		console.log('失焦')
	}
	const search = () => {
		console.log('搜索', searchValue)
		queryParams.filter.word = searchValue.value
		getShopList()
	}
	const clear = () => {
		console.log('重置')
	}
	const change = () => {
		console.log('输入')
	}
	const toManage = (data) => {
		console.log(data, 'data')
		const params = {
			img: data.img,
			name: data.name,
			work_time: data.work_time,
			office_id: data.office_id,
			state: data.state,
			avtag: data.avtag,
		}
		const {
			img,
			state,
			name,
			func_info,
			city,
			cookies,
			work_time,
			user,
			id,
			office_id
		} = data
		uni.setStorageSync('params', params);
		uni.setStorageSync('shopInfo', {
			img,
			state,
			name,
			func_enable: func_info,
			city,
			cookies,
			work_time,
			user,
			id,
			office_id
		});
		uni.navigateTo({
			url: '/pages/shop-management/shop-management?id=' + data.id + '&type=' + queryParams.filter
				.shopType + '&office_id=' + data.office_id + '&isV2=false',
		});
		// router.push({ name:'shop-management'})
	}
	const time = (date) => {
		if (date) {
			date = new Date(date);
			var y = date.getFullYear();
			var m = date.getMonth() + 1;
			m = m < 10 ? "0" + m : m;
			var d = date.getDate();
			d = d < 10 ? "0" + d : d;
			return y + "-" + m + "-" + d;
		} else {
			return '已到期'
		}
	}
	// 获取店铺列表
	const getShopList = (value) => {
		uni.showLoading({})
		if (value) {
			queryParams.page = value.value
		}
		ShopApi.getList(queryParams).then(res => {
			if (res.code === 200) {
				cardList.value = res.data.rows
				pageTotal.value = res.data.total
				scrollTop.value = scrollTopOld.scrollTop
				nextTick(function() {
					scrollTop.value = 0
				});
				cardList.value.forEach(item => {
					let funcInfo = item.func_info
					if (funcInfo && funcInfo.length) {
						item.ZDCC = funcInfo.find(itemA => itemA.code == 'ZDCC')?.enable || false;
						item.ZDCCtime = time(funcInfo.find(itemA => itemA.code == 'ZDCC')
							?.end_time)
						item.ZDHP = funcInfo.find(itemA => itemA.code == 'ZDHP')?.enable || false
						item.ZDHPtime = time(funcInfo.find(itemA => itemA.code == 'ZDHP')
							?.end_time)
						item.IMZDHF = funcInfo.find(itemA => itemA.code == 'IMZDHF')?.enable ||
							false
						item.IMZDHFtime = time(funcInfo.find(itemA => itemA.code == 'IMZDHF')
							?.end_time)
						item.ZDTG = funcInfo.find(itemA => itemA.code == 'ZDTG')?.enable || false
						item.ZDTGtime = time(funcInfo.find(itemA => itemA.code == 'ZDTG')
							?.end_time)
						item.CPDT = funcInfo.find(itemA => itemA.code == 'CPDT')?.enable || false
						item.CPDTtime = funcInfo.find(itemA => itemA.code == 'CPDT')?.end_time
						item.CPDTtimetext = time(funcInfo.find(itemA => itemA.code == 'CPDT')
							?.end_time)
					} else {
						item.ZDCC = false
						item.ZDCCtime = '已到期'
						item.ZDHP = false
						item.ZDHPtime = '已到期'
						item.IMZDHF = false
						item.IMZDHFtime = '已到期'
						item.ZDTG = false
						item.ZDTGtime = '已到期'
						item.CPDTtime = ""
					}
				})
				console.log(cardList.value, '123456')
			}
		}).finally(() => {
			uni.hideLoading({})
			isRefreshing.value = false
		})
	}

	// 获取店铺状态
	const getShopStatus = (state) => {
		if (state === 1) {
			return '未登录';
		} else if (state === 2) {
			return '已登录';
		} else if (state === 3) {
			return '已掉线';
		} else if (state === 4) {
			return '营业中';
		} else if (state === 5) {
			return '暂停营业';
		} else if (state === 6) {
			return '上线中';
		} else if (state === 7) {
			return '已下线';
		} else {
			return 'None';
		}
	}

	// 切换平台
	const selectTab = (event) => {
		if (queryParams.filter.shopType !== tabList[event.index].value) {
			queryParams.filter.shopType = tabList[event.index].value
			queryParams.page = 1
			getShopList()
		}
		if (tab.value === 0) {
			uni.setTabBarItem({
				index: 0,
				text: '门店',
				iconPath: '/static/tabIcon/md.png',
				selectedIconPath: '/static/tabIcon/icon-001.png',
			})
			uni.setTabBarStyle({
				color: '#7A7E83',
				selectedColor: '#0493F7'
			})
		} else if (tab.value === 1) {
			uni.setTabBarItem({
				index: 0,
				text: '门店',
				iconPath: '/static/tabIcon/md.png',
				selectedIconPath: '/static/tabIcon/icon-002.png',
			})
			uni.setTabBarStyle({
				color: '#7A7E83',
				selectedColor: '#FACC05'
			})
		}
	}

	const copyMsg = (item) => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		ShopApi.getShopBindCode(item.id).then(res => {
			if (res.code === 200) {
				let code = res.data
				copyobj = {
					office_id: item.office_id,
					shop_type: item.shop_type,
					name: item.name,
					shop_id: item.id,
					ZDCCtime: item.ZDCCtime,
					IMZDHFtime: item.IMZDHFtime,
					ZDHPtime: item.ZDHPtime,
					ZDTGtime: item.ZDTGtime,
					CPDTtimetext: item.CPDTtimetext || '已到期',
					code
				}
				copyState.value = true
				uni.hideTabBar()
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
			}
		});
	}
	onTabItemTap((item) => {
		console.log(item, tab.value, 'item')
		if (tab.value === 0) {
			uni.setTabBarStyle({
				color: '#7A7E83',
				selectedColor: '#FACC05'
			})
		} else if (tab.value === 1) {
			uni.setTabBarStyle({
				color: '#7A7E83',
				selectedColor: '#0493F7'
			})
		}
	})
	onShow(() => {
		getGroupList()
		getShopList()
		getprovincewithcitys()
	})
	onLoad(() => {
		getSysteminfo()
	})
</script>

<style scoped lang="scss">
	.tabs-container {
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx 70rpx 30rpx;
		overflow: visible;
		margin-bottom: 20rpx;
	}

	::v-deep .wd-tabs {
		background-color: transparent !important;
		width: 100%;
		max-width: 100%;
		overflow: visible;
	}

	::v-deep .wd-tabs__nav {
		background-color: transparent !important;
		width: 100%;
		max-width: 100%;
		overflow: visible;
		display: flex;
		justify-content: flex-start;
		gap: 20rpx;
	}

	::v-deep .wd-tabs__item {
		flex: 1;
		min-width: 0;
		max-width: 50%;
		overflow: visible;
		white-space: nowrap;
		padding: 0 15rpx;
		box-sizing: border-box;
		line-height: 1.2;
		font-size: 26rpx;
	}

	::v-deep .wd-tabs__item-text {
		display: inline-block;
		overflow: visible;
		text-overflow: clip;
		white-space: nowrap;
		max-width: 100%;
		width: 100%;
		box-sizing: border-box;
	}

	.search-container {
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx;
		margin-top: 80rpx !important;
	}

	.search-container ::v-deep .wd-search {
		width: 100% !important;
		height: 48rpx !important;
		min-height: 48rpx !important;
		max-height: 48rpx !important;
		background: #FFFFFF !important;
		border-radius: 24rpx !important;
		padding: 0 !important;
		box-sizing: border-box !important;
		line-height: 48rpx !important;
	}

	.search-container ::v-deep .wd-search__block {
		background-color: #fff !important;
		height: 48rpx !important;
		min-height: 48rpx !important;
		max-height: 48rpx !important;
		display: flex !important;
		align-items: center !important;
		line-height: 48rpx !important;
	}

	.search-container ::v-deep .wd-search__content {
		height: 48rpx !important;
		min-height: 48rpx !important;
		max-height: 48rpx !important;
		display: flex !important;
		align-items: center !important;
		line-height: 48rpx !important;
	}

	.search-container ::v-deep .wd-search__action {
		display: flex !important;
		align-items: center !important;
		justify-content: center !important;
		height: 48rpx !important;
		min-height: 48rpx !important;
		max-height: 48rpx !important;
		line-height: 48rpx !important;
		padding: 0 !important;
		margin: 0 !important;
	}

	.search-container ::v-deep .wd-search__action-text {
		display: inline-flex !important;
		align-items: center !important;
		justify-content: center !important;
		line-height: 48rpx !important;
		height: 48rpx !important;
		vertical-align: middle !important;
		margin: 0 !important;
		padding: 0 !important;
	}

	.shop {
		height: 100vh;
		background: #F9F9F9;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;

		.search {
			margin-top: 88rpx;
		}

		.butList {
			margin-top: 30rpx;
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			width: 100%;
			box-sizing: border-box;
			padding: 0 30rpx;
			gap: 10rpx;

			.itemBox {
				flex: 1;
				height: 67rpx;
				background: #FFFFFF;
				border-radius: 12rpx;
				display: flex;
				align-items: center;
				justify-content: center;
				margin-right: 0;
				min-width: 0;
				padding: 0 10rpx;
				box-sizing: border-box;

				.down {
					width: 24rpx;
					height: 24rpx;
					margin: 0 6rpx 0 0;
					flex-shrink: 0;
					display: block;
				}

				.boxText {
					font-weight: 400;
					font-size: 26rpx;
					color: #333333;
					white-space: nowrap;
					flex-shrink: 0;
					display: block;
				}
			}

			.itemFilt {
				flex: 1;
				height: 67rpx;
				background: #FFFFFF;
				border-radius: 12rpx;
				display: flex;
				flex-direction: row;
				align-items: center;
				justify-content: center;
				margin-right: 0;
				min-width: 0;
				padding: 0 10rpx;
				box-sizing: border-box;

				.filt {
					width: 25rpx;
					height: 29rpx;
					margin-right: 6rpx;
					flex-shrink: 0;
					display: block;
				}

				.filtText {
					font-size: 26rpx;
					color: #333333;
					margin-left: 0;
					white-space: nowrap;
					flex-shrink: 0;
					display: block;
				}
			}
		}

		.foodItem {
			width: 100%;
			background: #FFFFFF;
			box-sizing: border-box;
			border-radius: 12rpx;
			padding: 30rpx;
			display: flex;
			flex-direction: column;
			margin-bottom: 30rpx;

			.itemOne {
				display: flex;
				flex-direction: row;
				margin-bottom: 16rpx;

				.leftImg {
					width: 90rpx;
					height: 90rpx;
					border-radius: 12rpx;
				}

				.rightText {
					display: flex;
					flex-direction: column;
					margin-left: 20rpx;
					width: calc(100% - 110rpx);

					.rightOne {
						font-size: 30rpx;
						color: #333333;
						margin-bottom: 10rpx;
						white-space: nowrap;
						/* 不换行 */
						overflow: hidden;
						/* 隐藏溢出的内容 */
						text-overflow: ellipsis;
						/* 显示省略号 */
					}

					.rightTwo {
						display: flex;
						justify-content: space-between;
						align-items: flex-start;
						width: 100%;

						.md {
							width: calc(100% - 280rpx);
							font-size: 24rpx;
							color: #999999;
						}

						.yy {
							font-size: 24rpx;
							color: #FB9A25;
							margin-right: 20rpx;
						}

						.sq {
							font-size: 26rpx;
							color: #2CCA87;
						}

						.error-sq {
							color: #F81C3A;
						}
					}
				}
			}

			.line {
				width: 631rpx;
				height: 1rpx;
				background-color: #DFDFDF;
			}

			.itemTwo {
				width: 100%;
				display: flex;
				margin-top: 16rpx;
				flex-direction: row;
				justify-content: flex-end;
				align-items: center;

				.msgBut {
					width: 150rpx;
					height: 60rpx;
					background: #FFFFFF;
					border-radius: 12rpx;
					border: 1rpx solid #FACC05;
					font-size: 26rpx;
					color: #FACC05;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
				}

				.repair {
					height: 60rpx;
					background: #FFFFFF;
					border-radius: 12rpx;
					border: 1rpx solid #F81C3A;
					font-size: 26rpx;
					color: #F81C3A;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					padding: 0 20rpx;
					margin-right: 20rpx;
				}

				.msgBut.isElm {
					color: #0493F7;
					border-color: #0493F7;
				}

				.toBut.isElm {
					background-color: #0493F7;
					color: #ffffff;
				}

				.toBut {
					width: 120rpx;
					height: 60rpx;
					background: #FACC05;
					border-radius: 12rpx;
					font-size: 26rpx;
					color: #000000;
					display: flex;
					flex-direction: row;
					align-items: center;
					justify-content: center;
					margin: 0 0 0 20rpx;
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

	.log-title {
		font-size: 36rpx;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.footer {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 40rpx;
	}

	.code-input {
		width: 100%;
		box-sizing: border-box;
		padding: 0 20rpx;
		height: 80rpx;
		border: 1px solid #ccc;
		display: flex;
		align-items: center;
		border-radius: 10rpx;
	}

	.code-input-main {
		width: 100%;
	}

	.log-main {
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx;
	}

	.filter-item-title {
		margin-bottom: 20rpx;
		font-size: 28rpx;

		text {
			font-size: 20rpx;
			color: rgb(158, 158, 158);
			margin-left: 10rpx;
		}
	}

	.filter-list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;

		.filter-list-item {
			padding: 10rpx 20rpx;
			border: 1px solid transparent;
			border-radius: 4px;
			margin-right: 20rpx;
			margin-bottom: 20rpx;
			font-size: 28rpx;
			background-color: rgb(240, 240, 240);

		}

		.is-active {
			border: 1px solid #FACC05;
			background-color: #FACC05;
		}

		.is-active.is-elm-active {
			border: 1px solid #0493F7;
			background-color: #0493F7;
			color: #ffffff;
		}
	}

	.confirm-filter {
		width: 100%;
		height: 80rpx;
		line-height: 80rpx;
		color: #000000;
		background-color: #FACC05;
		border-radius: 4px;
		text-align: center;
		font-size: 30rpx;
		margin-top: 30rpx;
	}

	.elm-confirm-filter {
		color: #ffffff;
		background-color: #0493F7;
	}

	.filter-city-list {
		max-height: 500rpx;
		overflow-y: scroll;
	}

	.header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	::v-deep .wd-collapse-item__body {
		padding-top: 0;
	}

	.rotate180deg {
		transform: rotate(180deg);
	}

	.popup-box {
		padding: 30rpx 50rpx;

		.button-login {
			color: #1F1F1F;
			font-size: 34rpx;
			width: 100%;
			height: 90rpx;
			background: linear-gradient(90deg, #F7E373, #F5C568);
			border-radius: 50rpx;
			line-height: 90rpx;
			text-align: center;
			margin-left: auto;
			margin-right: auto;
			margin-top: 120rpx;
		}

		.p-dec {
			font-size: 26rpx;
			font-weight: 400;
			color: #999999;
			line-height: 32rpx;
			text-align: center;
			margin-top: 8rpx;
		}

		.btn-box {
			margin-top: 40rpx;

			.ipt {
				background: #F5F8F7;
				padding: 10rpx;
				width: 70%;
			}

			.left-b {
				width: 310rpx;
				height: 198rpx;
				background: #F5F8F7;
				border-radius: 35rpx;
				text-align: center;

				.b-img {
					width: 90rpx;
					height: 90rpx;
					margin: 30rpx 0 10rpx;
					background-color: #F5C568;
					border-radius: 50%;
				}

				.b-img1 {
					background-color: #59acf8;
				}
			}
		}
	}

	.p-title {
		text-align: center;
	}

	.shop-top {
		width: 100%;
		// height: 240px;
		background-image: url("@/static/shop/shopBg-3.png");
		background-size: 100% 100%;
		// position: fixed;
		// top: 0;
		// left: 0;
	}

	.tab-active {
		background-image: url("@/static/shop/shopBg-2.png");
		background-size: 100% 100%;
	}

	.shop-container {
		overflow-y: scroll;
	}

	.scroll-Y {
		height: 300rpx;
		width: 100%;
	}

	.scroll-view-item {
		height: 300rpx;
		line-height: 300rpx;
		text-align: center;
		font-size: 36rpx;

	}

	.choose-fun {
		width: 100%;
		height: 70rpx;
		line-height: 70rpx;
		background: #FFFFFF;
		border-radius: 8rpx;
		border: 1px solid #DFDFDF;
		box-sizing: border-box;
		padding: 0 20rpx;
		display: flex;
		align-items: center;
		position: relative;

		.clear-fun {
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			right: 20rpx;
		}
	}

	.is-choose-fun {
		margin-left: 40rpx;
	}

	.point {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: #F81C3A;
		margin-right: 4px;
	}

	.point-up {
		background: #2CCA87;
	}
	.image-text_7 {
		align-items: center;
		justify-content: center;
	}
	.block_5 {
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPngba3a4d8d44002583da9ad19b73850c9206878781c4b0e6cabe9f2de4d417d477) 100% no-repeat;
		background-size: 100% 100%;
		padding: 14rpx 30rpx;
		width: 100%;
		box-sizing: border-box;
		margin-bottom: 20rpx;
	}
	.text-group_6 {
		font-size: 24rpx;
		color: #333;
	}
</style>