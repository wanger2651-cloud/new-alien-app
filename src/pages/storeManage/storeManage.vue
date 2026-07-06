<template>
	<view class="store" :class="{ 'store--tab': isMpTabLayout }" :style="{paddingTop: systemBarHeight + 'px'}">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="青柠助手" :bordered="false"></wd-navbar>
		<view class="header-fixed-container" style="position: fixed;width: 100%;left: 0;z-index: 12;top: 0;overflow: visible;padding-bottom: 30rpx;height: calc(10px + 7.15625rem + 70rpx);min-height: calc(10px + 7.15625rem + 70rpx);" :style="`background: ${currentPlatformBgColor};`">
			<!-- 底部遮罩层：防止店铺卡片溢出 -->
			<view class="header-bottom-mask" :style="`background: ${currentPlatformBgColor};`"></view>
			<view class="" style="position: absolute; width: 100%; z-index: 13;" :style="`top: calc(${systemBarHeight}px + 44px);`">
				<view class="store_head z-10" :class="{'elm-head': tab==2 || tab==5}">
					<view class="store_head_row">
						<view class="hamburger_section">
							<!-- 汉堡菜单（显示当前平台名称） -->
							<view class="hamburger_menu" @click="toggleMenu">
								<view class="hamburger_icon" :class="{'elm-hamburger': tab==2 || tab==5}">
									<view class="hamburger_line"></view>
									<view class="hamburger_line"></view>
									<view class="hamburger_line"></view>
								</view>
								<image v-if="currentPlatformLogo" :src="currentPlatformLogo" class="platform_logo" mode="aspectFit"></image>
								<view class="platform_name" :class="{'elm-platform': tab==2 || tab==5}">
									<text class="platform_label">{{ currentPlatformLabel }}</text>
									<text class="platform_total">（{{ total }}）</text>
								</view>
							</view>
						</view>
						<!-- 搜索框 -->
						<view class="search" :class="{'elm-search': tab==2 || tab==5}">
							<image src="@/static/shop/icon_016a.png" class="search_icon" mode="aspectFit"></image>
							<input class="search_input" v-model="searchValue" placeholder="输入店名或ID" @confirm="handleSearch" @input="handleSearchInput" />
							<view class="search_btn">
								<view class="btn_min" @click="handleSearch">搜索</view>
							</view>
						</view>
					</view>
					<!-- 四钮同一行，相邻间距均为 12rpx（与两状态卡间距相同），宽度仍与列表/卡片对齐 -->
					<view class="shop_buttons_row">
						<view class="bind_shop_btn" @click="addShop">
							<image src="../../static/store/add_icon.png" class="img_icon"></image>
							<text class="text-choose text_choose_2">添加店铺</text>
						</view>
						<view class="bind_shop_btn" @click="bindShop">
							<image src="../../static/store/bind_icon.png" class="img_icon"></image>
							<text class="text-choose text_choose_1">绑定门店</text>
						</view>
						<view class="bind_shop_btn" @click="openRecycle">
							<image src="../../static/store/del_icon.png" class="img_icon"></image>
							<text class="text-choose text_choose_3">回收站</text>
						</view>
						<view class="bind_shop_btn filter_btn" @click="openFilter">
							<image src="../../static/store/shaix_icon.png" class="img_icon"></image>
							<text class="text-choose text_choose_4">筛选</text>
						</view>
					</view>
					<view class="shop_status_filter_row">
						<view class="status-filter-card expire-card">
							<view class="status-line">
								<picker
									mode="selector"
									:range="expireFuncOptions"
									range-key="label"
									:value="expireFuncIndex"
									@change="handleExpireFuncChange"
								>
									<view class="expire-func-picker-trigger">
										<text class="status-left">
											{{ expireFuncLabel }}<text class="status-filter-arrow">▾</text>
										</text>
									</view>
								</picker>
								<view class="status-right expire-soon-tap" @click="openExpireShopsPopup">
									<text class="expire-soon-text">
										即将到期：<text class="count-text">{{ expiringShopCount }}</text>家
									</text>
								</view>
							</view>
						</view>
						<view class="status-filter-card auth-card" @click="openAuthAbnormalPopup">
							<view class="status-line">
								<text class="status-left">授权异常：</text>
								<text class="status-right">
									<text class="count-text danger">{{ authAbnormalShopCount }}</text>家
								</text>
							</view>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="block_2 z10"
			style="width: 100%;box-sizing: border-box;padding: 0;z-index: 10;position: fixed;left: 0; background-color: transparent;padding-top: 0;padding-bottom: 0;overflow: hidden;" :style="`top: calc(10px + 7.15625rem + 70rpx);bottom: calc(70px + 30px + env(safe-area-inset-bottom));`">
			<scroll-view class="shop-container" :scroll-top="scrollTop" scroll-y="true" @scroll="handleScroll"
				:refresher-triggered="isRefreshing" :refresher-enabled="true" @refresherrefresh="listResh"
				style="padding: 50rpx 30rpx;padding-bottom: 0;box-sizing: border-box;overflow-y: scroll;overflow-x: hidden;">
				<view class="content_box" v-for="(item, index) in shopList" :key="item.id" :class="{'first-item': index === 0, 'android-first-item': index === 0 && platform === 'android'}" :style="{borderColor: currentPlatformBorderColor, ...getShopCardBgStyle}">
					<view class="shop-card-header">
						<view class="shop-avatar-wrapper">
							<image 
								class="shop-avatar" 
								:src="item.img" 
								mode="aspectFill"
								referrerpolicy="no-referrer"
							></image>
							<view class="copy-info-btn" @click="copyMsg(item)">
								<text class="copy-info-text">复制信息</text>
							</view>
						</view>
						<view class="shop-info">
							<view class="shop-name-row">
								<text class="shop-name">{{ item.name || '未知店铺' }}</text>
							</view>
							<view class="shop-status-row">
								<view class="status-left-group">
									<text class="status-dot status-normal"></text>
									<text class="status-text status-business" :class="getShopStateClass(item.state)">
										{{ getShopStateText(getDisplayState(item)) }}
									</text>
								</view>
								<view class="status-right-group">
									<view class="meta-id-wrapper" @click="handleCopyShopId(item)">
										<text class="meta-text">ID {{ item.office_id || item.id || '-' }}</text>
										<image
											class="meta-copy-icon"
											src="../../static/icon/icon_copy.png"
											mode="aspectFit"
										></image>
									</view>
									<text class="meta-separator">｜</text>
									<view class="meta-city-wrapper" v-if="item.city" @click="handleShowCityFullName(item, $event)">
										<image
											class="meta-location-icon"
											src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng5e47281d477be859cb54102bcf35e760849d4707a399045ceae9cd882bc517b6"
											mode="aspectFit"
											referrerpolicy="no-referrer"
										></image>
										<text class="meta-text city-text" :id="'city-text-' + item.id">{{ item.city }}</text>
									</view>
								</view>
							</view>
							<view class="shop-auth-row">
								<view class="auth-left-group">
									<text class="status-dot status-auth" v-if="getDisplayAuthStatus(item)"></text>
									<text class="status-dot status-auth-off" v-else></text>
									<text class="status-text status-auth-text" :class="getDisplayAuthStatus(item) ? 'authorized' : 'unauthorized'">
										{{ getDisplayAuthStatus(item) ? '授权正常' : '授权异常' }}
									</text>
									<view class="help-icon-wrapper" v-if="!getDisplayAuthStatus(item)" @click.stop="showAuthTooltip($event, item)">
										<view class="help-icon">
											<text class="help-text">?</text>
										</view>
										<view class="tooltip-bubble" v-if="currentTooltipShop === item && currentTooltipType === 'auth'">
											<text class="tooltip-text">{{ authTooltipText }}</text>
										</view>
									</view>
								</view>
								<view class="auth-right-group">
									<text class="auth-time-inline">授权时间：{{ formatAuthTime(item.ck_uptime) }}</text>
								</view>
							</view>
						</view>
					</view>
					<view class="block_3 flex-row">
						<view class="group_1 store_flex">
							<view style="width:100%;">
								<view class="group_3 flex-row justify-between" v-if="item.group_name">
									<view class="text-wrapper_1">
										<text class="text_6">分组：{{ item.group_name }}</text>
									</view>
								</view>
								<view class="block_4 flex-row justify-between">
									<text class="text_11">备注：</text>
									<view class="section_2 flex-row justify-between">
										<wd-input type="text" class="beiz_input" v-model="item.notes"
											placeholder="点击输入内容" :no-border="true" />
										<view class="text-wrapper_5 flex-col">
											<text class="text_13" @click="saveNotes(item)">保存</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					<view class="block_5 store_flex flex-row justify-between">
						<view class="image-text_7 image-text_7-with-expire">
							<view class="func-row">
								<!-- @click="onPopupHandler(item, '自动出餐')" -->
								<text class="text-group_6" :class="{ 'text-disabled': !isFuncSupported('ZDCC') }">出餐</text>
								<wd-switch 
									size="16px" 
									v-model="item.ZDCC" 
									:active-color="tab==1 ? '#FACC05' : '#0493F7'"
									:disabled="!isFuncSupported('ZDCC')"
									class="switch-item" 
									@change="beforeChangeFun(item, 'ZDCC', '自动出餐')" />
							</view>
							<view class="expire-time-text" v-if="isFuncSupported('ZDCC')">
								{{ getExpireTimeText(item, 'ZDCC') }}
							</view>
						</view>
						<view class="image-text_7 image-text_7-with-expire">
							<view class="func-row">
								<!--  @click="onPopupHandler(item, 'IM自动回复')" -->
								<text class="text-group_6" :class="{ 'text-disabled': !isFuncSupported('IMZDHF') }">回复</text>
								<wd-switch 
									size="16px" 
									v-model="item.IMZDHF" 
									:active-color="tab==1 ? '#FACC05' : '#0493F7'"
									:disabled="!isFuncSupported('IMZDHF')"
									class="switch-item" 
									@change="beforeChangeFun(item, 'IMZDHF', 'IM自动回复')" />
							</view>
							<view class="expire-time-text" v-if="isFuncSupported('IMZDHF')">
								{{ getExpireTimeText(item, 'IMZDHF') }}
							</view>
						</view>
						<view class="image-text_7 image-text_7-with-expire">
							<view class="func-row">
								<!--  @click="onPopupHandler(item, '自动回评')" -->
								<text class="text-group_6" :class="{ 'text-disabled': !isFuncSupported('ZDHP') }">回评</text>
								<wd-switch 
									size="16px" 
									v-model="item.ZDHP" 
									:active-color="tab==1 ? '#FACC05' : '#0493F7'"
									:disabled="!isFuncSupported('ZDHP')"
									class="switch-item" 
									@change="beforeChangeFun(item, 'ZDHP', '自动回评')" />
							</view>
							<view class="expire-time-text" v-if="isFuncSupported('ZDHP')">
								{{ getExpireTimeText(item, 'ZDHP') }}
							</view>
						</view>
						<view class="image-text_7 image-text_7-with-expire" v-if="tab==1">
							<view class="func-row">
								<!--  @click="onPopupHandler(item, '评价申诉')" -->
								<text class="text-group_6" :class="{ 'text-disabled': !isFuncSupported('PJSS') }">评价申诉</text>
								<wd-switch 
									size="16px" 
									v-model="item.PJSS" 
									:active-color="tab==1 ? '#FACC05' : '#0493F7'"
									:disabled="!isFuncSupported('PJSS')"
									class="switch-item" 
									@change="beforeChangeFun(item, 'PJSS', '评价申诉')" />
							</view>
							<view class="expire-time-text" v-if="isFuncSupported('PJSS')">
								{{ getExpireTimeText(item, 'PJSS') }}
							</view>
						</view>
						<view class="image-text_7 image-text_7-with-expire">
							<view class="func-row">
								<text class="text-group_6" :class="{ 'text-disabled': !isFuncSupported('KEFU') }">聚合客服</text>
								<wd-switch 
									size="16px" 
									v-model="item.KEFU" 
									:active-color="tab==1 ? '#FACC05' : '#0493F7'"
									:disabled="!isFuncSupported('KEFU')"
									class="switch-item" 
									@change="beforeChangeFun(item, 'KEFU', 'IM聚合客服')" />
							</view>
							<view class="expire-time-text" v-if="isFuncSupported('KEFU')">
								{{ getExpireTimeText(item, 'KEFU') }}
							</view>
						</view>
					</view>
					<view class="block_6 flex-row">
						<!-- <view class="group_8 flex-row">
										<view class="image-text_11 flex-row justify-between">
											<image class="label_6" referrerpolicy="no-referrer"
												src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPngaef016a33da875ea8c5b023e64bea6b326525affd3896a3978d4ff60ec445f5e" />
											<text class="text-group_10">分享店铺</text>
										</view>
									</view> -->
						<view style="display: flex;align-items: center;">
							<view class="group_112 flex-row" @click="toTop(item, item.is_top)"
								:class="{'not-top': item.is_top}">
							</view>
						</view>
						<view class="image-text_12">
							<image class="label_8" referrerpolicy="no-referrer"
								src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPngf4718145b6788b31612abd495d21dcd788475931de9897e979a3f9f0567172a4"
								@click="delShop(item)" />
							<view class="text-wrapper_6 flex-col" @click="handleManageClick(item)"
								:class="{'setting-elm': tab==2 || tab==5}">
								<text class="text_14">设置门店</text>
							</view>
						</view>
					</view>
					<image src="@/static/shop/icon_037a.png" v-if="tab==1 && item.is_top" mode="" class="is-top">
					</image>
					<image src="@/static/shop/icon_036a.png" v-if="(tab==2 || tab==5) && item.is_top" mode="" class="is-top">
					</image>
				</view>
			</scroll-view>
		</view>
		<!-- 固定在底部的翻页组件容器 -->
		<view class="pagination-fixed-container" v-if="shopList.length" :style="`bottom: calc(70px + env(safe-area-inset-bottom));`">
			<view class="pagination-wrapper">
				<!-- 首页按钮 -->
				<view class="pagination-first-btn" @click="goToFirstPage">
					<text class="first-btn-text">首页</text>
				</view>
				<wd-pagination class="pagination-pager" v-model.async="queryParams.page"
					:total="total" :page-size.async="queryParams.pageSize" @change="getPaginationShopList"
					show-icon></wd-pagination>
				<!-- 可编辑页码输入框（在页码左边） -->
				<view class="pagination-page-input">
					<input ref="pageInputRef" class="page-input" type="number" :value="queryParams.page" @input="handlePageInputChange" @blur="handlePageInput" @confirm="handlePageInput" />
					<text class="page-separator">/</text>
					<text class="page-total">{{ Math.ceil(total / queryParams.pageSize) }}</text>
				</view>
				<!-- 末页按钮 -->
				<view class="pagination-last-btn" @click="goToLastPage">
					<text class="last-btn-text">末页</text>
				</view>
			</view>
		</view>

	<wd-popup v-model="bindState" position="center"
		custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="bindClose"
		:z-index="1001">
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
		:z-index="1001">
			<view class="log-container">
				<view class="log-title">
					复制信息
				</view>
				<view class="log-main">
					<view>平台：{{ copyobj.shop_type == 1 ? '美团外卖' : '淘宝闪购外卖' }}</view>
					<view>店铺名称：{{ copyobj.name }}</view>
					<view>店铺ID：{{ copyobj.office_id }}</view>
					<view>自动出餐到期时间：{{ copyobj.ZDCCtime }}</view>
					<view>自动回复到期时间：{{ copyobj.IMZDHFtime }}</view>
					<view>自动回评到期时间：{{ copyobj.ZDHPtime }}</view>
					<view>自动点金到期时间：{{ copyobj.ZDTGtime }}</view>
					
					<view>门店绑定码：{{ copyobj.code }} （5分钟内有效）</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="copyClose" block>取消</wd-button>
						<wd-button size="large" @click="confirmCopy" block>复制</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

	<!-- 添加店铺选项弹窗 -->
	<wd-popup 
		v-model="addShopOptionsVisible" 
		position="center"
		custom-style="width: 80%;max-height: 600rpx;border-radius: 20rpx;padding: 30rpx;" 
		@close="addShopOptionsVisible = false"
		:z-index="1001"
	>
			<view class="log-container">
				<view class="log-title">选择添加方式</view>
				<view class="log-main">
					<view class="add-shop-options">
						<wd-radio-group v-model="selectedAddShopOption" checked-color="#FACC05">
							<view class="radio-option-item">
								<wd-radio shape="dot" value="login">插件授权</wd-radio>
							</view>
							<view class="radio-option-item">
								<wd-radio shape="dot" value="authLink">生成授权链接</wd-radio>
							</view>
						</wd-radio-group>
					</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="addShopOptionsVisible = false" block>取消</wd-button>
						<wd-button size="large" @click="handleConfirmAddShop" block>确定</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

		<wd-action-sheet v-model="recycleState" @close="closeRecycle" title="回收站" :z-index="1001">
			<view style="padding: 15px;">
				<view class="recycle-table" style="max-height: 800rpx;overflow-y: scroll;">
					<view class="reaycle-heder">
						<view class="header-td" style="width: 20%;">操作</view>
						<view class="header-td" style="width: 55%;">门店信息</view>
						<view class="header-td" style="width: 25%;">操作时间</view>
					</view>
					<view class="reaycle-body">
						<view class="reaycle-td" v-for="item in recycle" :key="item.id">
							<view class="body-td" style="width: 20%;"><wd-button block type="text"
									@click="recoveryShop(item)">恢复门店</wd-button></view>
							<view class="body-td" style="width: 55%;">
								<view class="custom-class">
									<view style="font-size: 26rpx;">{{ item.name }}</view>
									<view style="color: rgb(144, 147, 153);font-size: 24rpx;">ID:{{ item.id }}</view>
								</view>
							</view>
							<view class="body-td" style="width: 25%;font-size: 24rpx;">{{ item.uptim.slice(0, 10) }}
							</view>
						</view>
					</view>
				</view>
				<wd-pagination v-if="shopList.length" v-model.async="recycleQueryParams.page" :total="recycleTotal"
					:page-size.async="recycleQueryParams.pageSize" @change="recycleTurnPage" show-icon></wd-pagination>
			</view>
		</wd-action-sheet>

		<wd-action-sheet v-model="filterState" @close="closeFilter" title="筛选" :z-index="1001">
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
							:class="{'is-active': authorizeIndex === 1, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectAuthorize(1)">全部</view>
						<view class="filter-list-item"
							:class="{'is-active': authorizeIndex === 2, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectAuthorize(2)">授权正常</view>
						<view class="filter-list-item"
							:class="{'is-active': authorizeIndex === 3, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectAuthorize(3)">授权异常</view>
					</view>
				</view>
				<view class="filter-item">
					<view class="filter-item-title">
						筛选类别
					</view>
					<view class="filter-list">
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 1, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectCategory(1)">按店铺筛选</view>
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 2, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectCategory(2)">按分组筛选</view>
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 3, 'is-elm-active': tab == 2 || tab == 5}"
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
							:class="{'is-active': selsectType === undefined, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectFilterType(undefined)">全部门店</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 4, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectFilterType(4)">营业中</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 5, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectFilterType(5)">暂停营业</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 6, 'is-elm-active': tab == 2 || tab == 5}"
							@click="selectFilterType(6)">店铺上线中</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 7, 'is-elm-active': tab == 2 || tab == 5}"
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
				<view class="confirm-filter" :class="{'elm-confirm-filter': tab == 2}" @click="confirmFilter">确认</view>
			</view>
		</wd-action-sheet>

	<!---功能激活弹窗-->
	<wd-action-sheet v-model="authGoodsVisible" :z-index="1004" @close="handleClose">
			<SettingPopupPlanContent v-if="authGoodsVisible" :is-full-popup-plan="isFullPopupPlan" :isV2="true"
				:shopId="shopId" :priceTitle="payParams.pricetitle" :authGoodsList="payList"
				@close-popup="closeAuthGoodsVisibleHandler"
			:shopType="payParams.shoptype" :currentFuncCode="currentRenewFuncCode" :isIMKefuRenew="isIMKefuRenew"
			@success="subscribe" @updataShopFunc="updataShopFunc" />
		</wd-action-sheet>

	<wd-popup v-model="addState" position="center"
		custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="addClose"
		:z-index="1001">
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
		:z-index="1001">
			<view class="popup-box">
				<view class="p-title ft30 tc">{{ isRepair ? '修复店铺' : '添加店铺' }}</view>
			</view>
		</wd-popup>

	<wd-popup v-model="expirePopupVisible" position="center" custom-style="width: 92%;max-height: 84vh;border-radius: 16rpx;" :z-index="1002">
		<view class="quick-popup-wrap expire-popup-main" :class="{ 'jd-expire-popup': Number(tab) === 3 }">
			<view class="quick-popup-title">{{ expireFuncLabel }}即将到期店铺</view>
			<view class="quick-popup-subtitle">共 {{ expirePopupTotal }} 家店铺即将到期（7天内）</view>
			<view class="quick-popup-toolbar">
				<view class="quick-toolbar-left">
					<view class="quick-toolbar-btn" @click="selectAllExpireRows">全选</view>
					<view class="quick-toolbar-btn" @click="clearAllExpireRows">全不选</view>
				</view>
				<picker
					mode="selector"
					:range="expirePageSizeOptions"
					:value="expirePageSizeIndex"
					@change="handleExpirePopupPageSizeChange"
				>
					<view class="quick-page-size-trigger">每页 {{ expirePopupQuery.pageSize }} 条</view>
				</picker>
				<view class="quick-batch-btn" :class="{ disabled: !expireSelectedRows.length }" @click="batchRenewExpireShops">批量续费（{{ expireSelectedRows.length }}）</view>
			</view>
			<scroll-view scroll-y class="quick-table-scroll">
				<view class="quick-table-header">
					<text class="col col-check"></text>
					<text class="col col-name">店铺名称</text>
					<text class="col col-id">门店ID</text>
					<text class="col col-time">到期剩余</text>
					<text class="col col-action">操作</text>
				</view>
				<view class="quick-table-row" v-for="item in expirePopupRows" :key="item.id">
					<view class="col col-check">
						<wd-checkbox :model-value="expireSelectedRows.includes(item.id)" @change="toggleExpireSelect(item.id)" shape="square"></wd-checkbox>
					</view>
					<text class="col col-name">{{ item.name || '-' }}</text>
					<text class="col col-id">{{ item.office_id || '-' }}</text>
					<text class="col col-time">{{ formatExpireRemainDays(item, expireFuncCode) }}</text>
					<view class="col col-action">
						<view class="quick-action-btn renew" @click="renewSingleShop(item)">续费</view>
					</view>
				</view>
			</scroll-view>
			<wd-pagination
				v-if="expirePopupTotal > expirePopupQuery.pageSize"
				:key="`expire-page-${expirePopupQuery.pageSize}-${expirePopupTotal}`"
				v-model.async="expirePopupQuery.page"
				:total="expirePopupTotal"
				:page-size="expirePopupQuery.pageSize"
				@change="handleExpirePopupPageChange"
				show-icon
			></wd-pagination>
		</view>
	</wd-popup>

	<wd-popup v-model="authPopupVisible" position="center" custom-style="width: 92%;max-height: 84vh;border-radius: 16rpx;" :z-index="1002">
		<view class="quick-popup-wrap auth-popup-main">
			<view class="quick-popup-title">授权异常店铺</view>
			<view class="quick-popup-subtitle">共 {{ authPopupTotal }} 家店铺授权异常</view>
			<view class="quick-popup-toolbar auth-popup-toolbar">
				<picker
					mode="selector"
					:range="authPageSizeOptions"
					:value="authPageSizeIndex"
					@change="handleAuthPopupPageSizeChange"
				>
					<view class="quick-page-size-trigger">每页 {{ authPopupQuery.pageSize }} 条</view>
				</picker>
			</view>
			<scroll-view scroll-y class="quick-table-scroll">
				<view class="quick-table-header">
					<text class="col col-name">店铺名称</text>
					<text class="col col-id">门店ID</text>
					<text class="col col-time">上次授权</text>
					<text class="col col-action">操作</text>
				</view>
				<view class="quick-table-row" v-for="item in authPopupRows" :key="item.id">
					<text class="col col-name">{{ item.name || '-' }}</text>
					<text class="col col-id">{{ item.office_id || '-' }}</text>
					<text class="col col-time">{{ formatAuthAgoDays(item.ck_uptime) }}</text>
					<view class="col col-action">
						<view class="quick-action-btn repair" @click="repairFromPopup(item)">修复</view>
					</view>
				</view>
			</scroll-view>
			<wd-pagination
				v-if="authPopupTotal > authPopupQuery.pageSize"
				:key="`auth-page-${authPopupQuery.pageSize}-${authPopupTotal}`"
				v-model.async="authPopupQuery.page"
				:total="authPopupTotal"
				:page-size="authPopupQuery.pageSize"
				@change="handleAuthPopupPageChange"
				show-icon
			></wd-pagination>
		</view>
	</wd-popup>

	<wd-popup v-model="batchRenewConfirmVisible" position="center" custom-style="width: 92%;border-radius: 16rpx;" :z-index="1003">
		<view class="batch-renew-wrap">
			<view class="batch-renew-title">批量续费确认</view>
			<view class="batch-renew-desc">请确认续费规格与消耗信息</view>
			<view class="batch-renew-summary">
				<view class="summary-row">
					<text class="summary-label">续费功能</text>
					<text class="summary-value">{{ expireFuncLabel }}</text>
				</view>
				<view class="summary-row">
					<text class="summary-label">店铺数量</text>
					<text class="summary-value">{{ batchRenewShopCount }} 家</text>
				</view>
				<view class="summary-row">
					<text class="summary-label">续费时长</text>
					<text class="summary-value">{{ batchRenewAddDays }} 天</text>
				</view>
				<view class="summary-row">
					<text class="summary-label">预计总金额（元）</text>
					<text class="summary-value highlight">{{ batchRenewTotalCost }}</text>
				</view>
			</view>
			<view class="batch-renew-plan-title">支付方式</view>
			<scroll-view scroll-y class="batch-renew-plan-list batch-renew-channel-list">
				<view
					class="batch-renew-plan-item"
					v-for="(c, cidx) in batchRenewChannels"
					:key="c.channel_id || cidx"
					:class="{ active: c.channel_id === batchRenewChannelId }"
					@click="batchRenewChannelId = c.channel_id"
				>
					<text class="plan-name">{{ c.channel_name }}{{ c.is_balance ? '（余额）' : '' }}</text>
				</view>
			</scroll-view>
			<view class="batch-renew-plan-title">选择规格</view>
			<scroll-view scroll-y class="batch-renew-plan-list">
				<view
					class="batch-renew-plan-item"
					v-for="(item, idx) in batchRenewPlanList"
					:key="item.price_id || idx"
					:class="{ active: item.price_id === batchRenewSelectedPriceId }"
					@click="selectBatchRenewPlan(item)"
				>
					<text class="plan-name">{{ item.func_name || expireFuncLabel }}</text>
					<text class="plan-meta">{{ Number(item.add_time || 0) }}天 · {{ Number(item.cost || 0) }}元/店</text>
				</view>
			</scroll-view>
			<view class="batch-renew-actions">
				<view class="batch-btn cancel" @click="batchRenewConfirmVisible = false">取消</view>
				<view class="batch-btn confirm" :class="{ disabled: !batchRenewSelectedPriceId || !batchRenewChannelId }" @click="executeBatchRenew">确认续费</view>
			</view>
		</view>
	</wd-popup>
		
	<!-- 平台选择抽屉式弹窗 -->
	<wd-popup v-model="menuVisible" position="left" :closable="true" custom-style="width: 60%;height: 100%;" @close="menuVisible = false"
		:z-index="1001">
			<view class="drawer-container" :style="`padding-top: ${systemBarHeight}px;box-sizing: border-box;`">
				<view class="drawer-title">选择平台</view>
				<view class="drawer-content">
					<view v-for="item in props.list" :key="item.shopType"
						class="drawer-item"
						:class="{ active: tab == item.shopType, 'elm-active': (tab==2 || tab==5) && tab == item.shopType }" 
						@click="onChange(item)">
						<view class="drawer-item-left">
							<image v-if="item.logo" :src="item.logo" class="drawer-item-logo" mode="aspectFit"></image>
							<view class="drawer-item-text">{{ item.label }}<text class="drawer-item-count" v-if="item.count !== undefined">({{ item.count }})</text></view>
						</view>
						<view class="drawer-item-check" v-if="tab == item.shopType">
							<icon type="check" color="#FACC05" size="24" v-if="tab==1"></icon>
							<icon type="check" color="#0493F7" size="24" v-else></icon>
						</view>
					</view>
				</view>
			</view>
		</wd-popup>
		<!-- #ifdef MP-WEIXIN -->
		<MpTabBar v-if="mpTabMode" active="manage" />
		<!-- #endif -->
	</view>
</template>

<script setup>
	// #ifdef MP-WEIXIN
	import MpTabBar from '@/components/MpTabBar.vue'
	// #endif
	const componentProps = defineProps({
		embeddedTab: {
			type: Boolean,
			default: false
		}
	})

	import {
		ManagementApi
	} from '@/api/management.ts'
	import {
		ShopApi
	} from '@/api/shop.ts'
	import {
		FunctionPriceApi
	} from '@/api/functionPrice.ts'
	import {
		getRenewQuoteList,
		getRenewChannels,
		createBatchPayOrder,
		queryPayOrderStatus
	} from '@/api/pay'
	import {
		finishOrderAfterCreate,
		openExternalPayLink,
		hasPayLink,
		mapPayQuoteToSpecRow
	} from '@/utils/payRenewFlow'
	import {
		UserApi
	} from '@/api/login'
	import request from '@/utils/request'
	import { parseDateSafe, parseDateTimestamp, formatDateYMD } from '@/utils/date'
	import { navigateToMpAddShop, consumeStoreManageNeedRefresh } from '@/utils/mpAddShop'
	import { readMpStoreListCache, writeMpStoreListCache } from '@/utils/mpStoreCache'
	import { redirectToMpShellTab } from '@/utils/mpShell'
	import {
		onMounted,
		ref,
		reactive,
		nextTick,
		computed,
		watch
	} from 'vue'
	import { useAuthStore } from '@/store/auth.ts'
	import {
		onLoad,
		onShow,
		onUnload,
		onHide
	} from '@dcloudio/uni-app';
	const authStore = useAuthStore()
	const mpTabMode = ref(false)
	const isMpTabLayout = computed(() => componentProps.embeddedTab || mpTabMode.value)
	
	// 帮助提示相关（气泡提示）
	const currentTooltipShop = ref(null)
	const currentTooltipType = ref('') // 'auth'
	const authTooltipText = ref('授权异常会导致功能无法正常使用，请重新添加店铺恢复授权。')
	
	// 平台Logo映射
	const platformLogos = new Map()
	platformLogos.set(1, 'https://p0.meituan.net/shangouproductapi/8bb7f604d4c10239f736f2c450ce92ef93342.png') // 美团外卖
	platformLogos.set(4, 'https://p0.meituan.net/shangouproductapi/280765bbbe4aeb0603d386eea888ab8c151948.png') // 饿了么
	platformLogos.set(5, 'https://p0.meituan.net/shangouproductapi/546c580071907f18b7b9ea913fc29812158401.png') // 饿百零售
	platformLogos.set(2, 'https://p0.meituan.net/shangouproductapi/e4f5dff1d5445c2895d6ca9e3a55bf2744440.png') // 美团闪购
	platformLogos.set(3, 'https://p0.meituan.net/shangouproductapi/a4022ea3fb17f68c43ecbfcec893c836102681.png') // 美团医药
	platformLogos.set(6, 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png') // 京东零售
	platformLogos.set(8, 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png') // 京东外卖

	// shopType 到 logo key 的映射
	const shopTypeToLogoKey = {
		1: 1,  // 美团外卖 -> logo key 1
		2: 4,  // 淘宝闪购外卖(原饿了么) -> logo key 4
		3: 8,  // 京东秒送 -> logo key 8 (京东外卖)
		4: 2,  // 美团闪购 -> logo key 2
		5: 3,  // 美团医药 -> logo key 3
		6: 5  // 淘宝闪购零售 -> logo key 5 (饿百零售)
	}

	// 平台背景渐变色映射（从淡色到白色，根据LOGO主色调设置）
	// 基于平台边框颜色（品牌主色调）生成对应的淡色渐变
	const platformBgColors = {
		1: ['#FFF9E6', '#FFFFFF'],  // 美团外卖 - 淡黄色渐变（基于品牌色 #FACC05 黄色）
		2: ['#E6F4FF', '#FFFFFF'],  // 淘宝闪购外卖(原饿了么) - 淡蓝色渐变（基于品牌色 #0493F7 蓝色）
		3: ['#FFF9E6', '#FFFFFF'],  // 美团闪购 - 淡黄色渐变（基于品牌色 #FACC05 黄色）
		4: ['#E6F9E6', '#FFFFFF'],  // 美团医药 - 淡绿色渐变（基于品牌色 #2CCA87 绿色）
		5: ['#E6F4FF', '#FFFFFF'],  // 淘宝闪购零售 - 淡蓝色渐变（基于品牌色 #0493F7 蓝色）
		6: ['#FFE6E6', '#FFFFFF'],  // 京东秒送 - 淡红色渐变（基于品牌色 #E1251B 红色）
	}

	// 平台边框颜色映射
	const platformBorderColors = {
		1: '#FACC05',  // 美团外卖 - 黄色
		2: '#0493F7',  // 淘宝闪购外卖 - 蓝色
		3: '#E1251B',  // 京东秒送 - 红色
		4: '#FACC05',  // 美团闪购 - 黄色
		5: '#0493F7',  // 淘宝闪购零售 - 蓝色（与淘宝闪购外卖保持一致）
		6: '#0493F7',  // 京东零售 - 蓝色
	}

	const STORE_MANAGE_SHOP_TYPES = new Set([1, 2, 3, 4, 5, 6])
	const STORE_MANAGE_SHOP_TYPE_STORAGE_KEY = 'storeManage_lastShopType'
	const normalizeStoreManageShopType = (raw) => {
		const n = Number(raw)
		return STORE_MANAGE_SHOP_TYPES.has(n) ? n : 1
	}
	const getStoredShopType = () => {
		try {
			const saved = uni.getStorageSync(STORE_MANAGE_SHOP_TYPE_STORAGE_KEY)
			if (saved === '' || saved === null || saved === undefined) return null
			return normalizeStoreManageShopType(saved)
		} catch (e) {
			return null
		}
	}
	const saveStoredShopType = (shopType) => {
		try {
			uni.setStorageSync(STORE_MANAGE_SHOP_TYPE_STORAGE_KEY, normalizeStoreManageShopType(shopType))
		} catch (e) {}
	}
	const initialStoreManageShopType = getStoredShopType() ?? 1

	const props = ref({
		list: [{
				value: '0',
				label: '美团外卖',
				shopType: 1,
				logo: platformLogos.get(shopTypeToLogoKey[1])
			},
			{
				value: '1',
				label: '淘宝闪购外卖',
				shopType: 2,
				logo: platformLogos.get(shopTypeToLogoKey[2])
			},
			{
				value: '2',
				label: '京东秒送',
				shopType: 6,
				logo: platformLogos.get(shopTypeToLogoKey[3])
			},
			{
				value: '3',
				label: '美团闪购',
				shopType: 3,
				logo: platformLogos.get(shopTypeToLogoKey[4])
			},
			{
				value: '4',
				label: '美团医药',
				shopType: 4,
				logo: platformLogos.get(shopTypeToLogoKey[5])
			},
			{
				value: '5',
				label: '淘宝闪购零售',
				shopType: 5,
				logo: platformLogos.get(shopTypeToLogoKey[6])
			},
		],
		active: 0
	})
	const shopList = ref([])
	const recycle = ref([])
	const total = ref(0)
	
	// 获取用户信息并初始化平台类型数量（仅初始化，实际数量由 getShopList 更新）
	const getUserInfo = async () => {
		try {
			const res = await UserApi.getUser()
			if (res.code === 200 && res.data && res.data.count_shop_type) {
				const countMap = {}
				res.data.count_shop_type.forEach(item => {
					countMap[item.ShopType] = item.ShopCount || 0
				})
				// 只初始化尚未设置数量的平台（避免覆盖从列表获取的实际数量）
				props.value.list.forEach(item => {
					if (item.count === undefined) {
						item.count = countMap[item.shopType] || 0
					}
				})
			}
		} catch (err) {
			// 获取用户信息失败，静默处理
		}
	}
	
	let queryParams = reactive({
		page: 1,
		pageSize: 10,
		filter: {
			time_state: undefined, // 店铺到期时间过期 全部 = 0 未到期 = 1 即将到期 = 2 已经到期 = 3
			shopType: initialStoreManageShopType, // 店铺类型  None = 0  美团 = 1  淘宝闪购外卖 = 2
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
	const bindState = ref(false)
	const bindCode = ref('')
	const recycleState = ref(false)
	const recyclePage = ref(1)
	const filterState = ref(false)
	const categoryIndex = ref(1)
	const cityList = ref([])
	const provinceList = ref([])
	const checkCityList = ref([])
	const selsectType = ref(undefined)
	const authorizeIndex = ref(1)
	const groupList = ref([])
	const selectGroup = ref([])
	const selectItemGroup = ref([])
	const radioValue = ref('')
	const proupValue = ref('')
	const recycleTotal = ref(0)
	const scrollTop = ref(0)
	const scrollTopOld = reactive({
		scrollTop: 0
	})
	const scroll = (e) => {
		scrollTopOld.scrollTop = e.detail.scrollTop
	}
	const copyState = ref(false)
	let copyobj = reactive({})
	const authGoodsVisible = ref(false)
	const isFullPopupPlan = ref(false)
	const payList = ref([])
	const shopId = ref('')
	const pricetitle = ref('')
	const payParams = reactive({
		shoptype: '1',
		pricetitle: '',
		isKeyWord: true
	})
	const currentRenewFuncCode = ref('')
	const isIMKefuRenew = ref(false)
	const FUNC_CODE_NAME_MAP = {
		OPENSHOP: '店铺多开',
		ZDCC: '自动出餐',
		IMZDHF: 'IM自动回复',
		ZDHP: '自动回评',
		KEFU: 'IM聚合客服',
		ZDTG: '智能推广',
		PJSS: '评价申诉'
	}
	const FUNC_CODE_LIST = Object.keys(FUNC_CODE_NAME_MAP)
	const normalizeResponseList = (res) => {
		const data = res?.data || res?.Data
		if (!data) return []
		return Array.isArray(data) ? data : [data]
	}

	// 顶部快捷筛选卡片（功能到期 / 授权异常）
	const expiringShopCount = ref(0)
	const authAbnormalShopCount = ref(0)
	const expireFuncCode = ref('ZDCC')
	const expireFuncAllOptions = [
		{ label: '自动出餐', value: 'ZDCC' },
		{ label: '自动回复', value: 'IMZDHF' },
		{ label: '自动回评', value: 'ZDHP' },
		{ label: '评价申诉', value: 'PJSS' },
		{ label: '聚合客服', value: 'KEFU' },
		// 按需求：店铺多开放到最下面
		{ label: '店铺多开', value: 'OPENSHOP' }
	]
	const expireFuncOptions = computed(() => {
		let baseOptions = expireFuncAllOptions
		// 淘宝闪购外卖：隐藏“自动回评”续费选项
		if (Number(tab.value) === 2) {
			baseOptions = baseOptions.filter(item => item.value !== 'ZDHP')
		}
		// 仅美团外卖展示评价申诉
		if (Number(tab.value) !== 1) {
			baseOptions = baseOptions.filter(item => item.value !== 'PJSS')
		}
		// 为空时表示暂未拉到支持列表，保留全部可选
		if (supportedFuncCodes.value.size === 0) return baseOptions
		return baseOptions.filter(item => item.value === 'OPENSHOP' || supportedFuncCodes.value.has(item.value))
	})
	const expireFuncLabel = computed(() => expireFuncOptions.value.find(item => item.value === expireFuncCode.value)?.label || '自动出餐')
	const expireFuncIndex = computed(() => {
		const idx = expireFuncOptions.value.findIndex(item => item.value === expireFuncCode.value)
		return idx < 0 ? 0 : idx
	})

	const expirePopupVisible = ref(false)
	const expirePopupRows = ref([])
	const expirePopupTotal = ref(0)
	const expireSelectedRows = ref([])
	const expirePopupAllRows = ref([])
	const expirePopupLoadSeq = ref(0)
	const shouldResetExpireFuncToFirst = ref(false)
	const batchRenewConfirmVisible = ref(false)
	const batchRenewPlanList = ref([])
	const batchRenewSelectedPriceId = ref('')
	const batchRenewShopIds = ref([])
	const batchRenewChannels = ref([])
	const batchRenewChannelId = ref('')
	const batchRenewShopCount = computed(() => batchRenewShopIds.value.length)
	const batchRenewSelectedPlan = computed(() => batchRenewPlanList.value.find(item => item?.price_id === batchRenewSelectedPriceId.value) || null)
	const batchRenewAddDays = computed(() => Number(batchRenewSelectedPlan.value?.add_time || 0))
	const batchRenewTotalCost = computed(() => Number(batchRenewSelectedPlan.value?.cost || 0) * batchRenewShopCount.value)
	const expirePageSizeOptions = [10, 20, 30, 50]
	const MAX_EXPIRE_FETCH_PAGE_SIZE = 100
	const expirePageSizeIndex = computed(() => {
		const idx = expirePageSizeOptions.indexOf(expirePopupQuery.pageSize)
		return idx < 0 ? 0 : idx
	})
	const expirePopupQuery = reactive({
		page: 1,
		pageSize: 10
	})

	const authPopupVisible = ref(false)
	const authPopupRows = ref([])
	const authPopupTotal = ref(0)
	const authPopupLoadSeq = ref(0)
	const authPageSizeOptions = [10, 20, 30, 50]
	const authPageSizeIndex = computed(() => {
		const idx = authPageSizeOptions.indexOf(authPopupQuery.pageSize)
		return idx < 0 ? 0 : idx
	})
	const authPopupQuery = reactive({
		page: 1,
		pageSize: 10
	})
	
	// 当前店铺类型支持的功能列表（用于禁用不支持的功能开关）
	const supportedFuncCodes = ref(new Set())
	
	// 根据店铺类型获取支持的功能列表
	const getDefaultSupportedFuncCodes = (shopType) => {
		const base = ['ZDCC', 'IMZDHF', 'ZDHP', 'KEFU']
		if (Number(shopType) === 1) {
			return new Set([...base, 'PJSS'])
		}
		return new Set(base)
	}
	const getSupportedFuncList = async (shopType) => {
		try {
			const shopTypeNum = normalizeStoreManageShopType(shopType)

			const res = await FunctionPriceApi.getFuncList(shopTypeNum)
			if (res.code === 200 || res.Success) {
				const funcs = res.data || res.Data || []
				const codes = new Set(funcs.map((f) => f.code || '').filter((code) => code))
				codes.add('KEFU')
				codes.delete('ZDTG')
				if (shopTypeNum !== 1) {
					codes.delete('PJSS')
				}
				supportedFuncCodes.value = codes
			} else {
				supportedFuncCodes.value = getDefaultSupportedFuncCodes(shopTypeNum)
			}
		} catch (err) {
			supportedFuncCodes.value = getDefaultSupportedFuncCodes(normalizeStoreManageShopType(shopType))
		}
	}
	
	// 检查功能是否支持
	const isFuncSupported = (funcCode) => {
		if (funcCode === 'KEFU') {
			return true
		}
		if (funcCode === 'PJSS') {
			return Number(tab.value) === 1 && (supportedFuncCodes.value.size === 0 || supportedFuncCodes.value.has('PJSS'))
		}
		if (funcCode === 'ZDTG') {
			return false
		}
		if (supportedFuncCodes.value.size === 0) {
			return true
		}
		return supportedFuncCodes.value.has(funcCode)
	}
	const isV2 = ref(true)
	const colseShow = ref(false)
	let checkinter = null
	let w = null
	const searchValue = ref('') // 搜索框的值
	const systemBarHeight = ref(0)
	const platform = ref('')
	let successObj = reactive({})
	const addState = ref(false)
	const cookieStr = ref('')
	let currentRepair = reactive({})
	const isRepair = ref(false)
	const funFilterItem = ref([])
	const isChooseStr = ref('')
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
	const isRefreshing = ref(false)

	const listResh = () => {
		isRefreshing.value = true
		getShopList()
	}
	const clearFunStr = () => {
		chooseFilterFunVal.value = []
		funFilterItem.value.length = 1
		isChooseStr.value = ''
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
	const addClose = () => {
		addState.value = false
	}
	const colseV = () => {
		// #ifdef APP-PLUS
		if (w) {
			plus.webview.close(w);
			w = null
		}
		plus.cache.clear();
		// #endif
		if (checkinter) {
			clearInterval(checkinter);
			checkinter = null
		}
		colseShow.value = false
		isRepair.value = false
		
		// 关闭时刷新店铺列表（用于饿了么官方OAuth授权等场景）
		// 授权完成后，后端会自动添加店铺，所以刷新列表即可看到新店铺
		setTimeout(() => {
			getShopList()
		}, 500)
	}
	// 添加店铺选项弹窗
	const addShopOptionsVisible = ref(false)
	const selectedAddShopOption = ref('login') // 默认选择插件授权
	
	const addShop = () => {
		// 重置选择为默认值
		selectedAddShopOption.value = 'login'
		// 显示选项弹窗
		addShopOptionsVisible.value = true
	}
	
	// 确认添加店铺方式
	const handleConfirmAddShop = () => {
		addShopOptionsVisible.value = false
		if (selectedAddShopOption.value === 'login') {
			// 插件授权 - 使用原有登录逻辑
			addShopByLogin()
		} else if (selectedAddShopOption.value === 'authLink') {
			// 生成授权链接
			generateAuthLink()
		}
	}
	
	const addShopByLogin = () => {
		const shopType = queryParams.filter.shopType
		if (shopType === 1) {
			// 美团外卖
			meituan()
		} else if (shopType === 2) {
			// 淘宝闪购外卖（原饿了么）
			eleme()
		} else if (shopType === 6) {
			// 京东秒送（京东外卖）
			jingdong()
		} else if (shopType === 3) {
			// 美团闪购
			meituan()
		} else if (shopType === 4) {
			// 美团医药
			meituan()
		} else if (shopType === 5) {
			// 淘宝闪购零售（饿百零售）
			ebail()
		} else {
			// 默认使用饿了么逻辑
			eleme()
		}
	}
	
	// 生成授权链接
	const generateAuthLink = async () => {
		try {
			// 获取当前用户ID
			const userId = authStore.userId || uni.getStorageSync('userId')
			if (!userId) {
				// 如果本地没有userId，尝试从用户信息API获取
				const userRes = await UserApi.getUser()
				if (userRes.code === 200 && userRes.data) {
					// 尝试从不同可能的字段获取userId
					const fetchedUserId = userRes.data.user_id || userRes.data.UserId || userRes.data.id || userRes.data.Id
					if (fetchedUserId) {
						authStore.setUserId(String(fetchedUserId))
						generateLinkWithUserId(String(fetchedUserId))
						return
					}
				}
				uni.showToast({
					title: '获取用户信息失败，请重新登录',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			generateLinkWithUserId(String(userId))
		} catch (error) {
			uni.showToast({
				title: '生成授权链接失败：' + (error.message || '未知错误'),
				icon: 'none',
				duration: 2000
			})
		}
	}
	
	// 使用用户ID生成授权链接
	const generateLinkWithUserId = (userId) => {
		const shopType = queryParams.filter.shopType
		let authLink = ''

		const apiBaseUrl = uni.getStorageSync('apiBaseUrl') || ''
		let baseUrl = ''
		if (apiBaseUrl) {
			try {
				const url = new URL(apiBaseUrl)
				baseUrl = `${url.protocol}//${url.host}`
			} catch (e) {
				baseUrl = apiBaseUrl.replace(/\/$/, '')
			}
		}

		if (!baseUrl) {
			baseUrl = 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run'
		}

		authLink = `${baseUrl}/login/${normalizeStoreManageShopType(shopType)}/${userId}`

		// 复制到剪贴板
		uni.setClipboardData({
			data: authLink,
			success: () => {
				uni.showModal({
					title: '授权链接已复制',
					content: `授权链接已复制：${authLink}\n通过此链接登录授权店铺成功后，即可显示在您的店铺列表中。`,
					showCancel: false,
					confirmText: '确定'
				})
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none',
					duration: 2000
				})
			}
		})
	}
	
	const toTop = (row, state) => {
		let str = !state ? '确认置顶此店铺吗？' : '确认取消置顶吗？'
		// 调用 uni.showModal 方法
		uni.showModal({
			title: str, // 弹窗的标题
			success: (res) => {
				let params = {
					shop: row.id,
					top: !state
				}
				// 用户点击了哪个按钮
				if (res.confirm) {
					ShopApi.setShopTop(params).then(res => {
						if (res.code === 200) {
							getShopList()
							uni.showToast({
								title: '操作成功',
								icon: 'success',
								duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
								mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
							});
						}
					})
					// 在这里执行确定后的逻辑
				}
			},
			fail: function() {
				// 调用失败，静默处理
			}
		});
	}
	const meituan = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		const shopType = queryParams.filter.shopType
		
		// 根据shopType获取对应的URL
		let url = ''
		if (shopType === 1) {
			// 美团外卖
			url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
		} else if (shopType === 3) {
			// 美团闪购
			url = 'https://shangoue.meituan.com/#/new_fe/business#/index'
		} else if (shopType === 4) {
			// 美团医药
			url = 'https://yiyao.meituan.com/#/new_fe/business#/index'
		} else {
			// 默认使用美团外卖
			url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
		}
		
		uni.showLoading({})
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"
		)
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = `meituan-${shopType}-${Date.now()}`
		const webview_setting = {
			'disablePlus': false,
			'scrollIndicator': 'all',
			'width': getWindowInfo.screenWidth + 'px',
			'top': '18%',
			'scalable': true,
		}
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.cache.clear(function() {})
		if (w) {
			try {
				plus.webview.close(w)
			} catch (e) {
				// 忽略错误
			}
		}
		
		w = plus.webview.create(url, webviewid, webview_setting)
		setTimeout(() => {
			plus.webview.close(w)
			setTimeout(() => {
				w = plus.webview.open(url, webviewid, webview_setting)
				colseShow.value = true
				w.show()
				uni.hideLoading({})
				
				// 启动cookie监听（参考 addShop.vue 的方式）
				startMeituanCookieMonitoring()
			}, 500)
		}, 500)
		// #endif
		// #ifndef H5
		// #ifndef APP-PLUS
		navigateToMpAddShop(normalizeStoreManageShopType(queryParams.filter.shopType), isRepair.value)
		// #endif
		// #endif
	}
	
	// 启动美团平台cookie监听（参考 addShop.vue 的逻辑）
	const startMeituanCookieMonitoring = () => {
		if (!w) return
		
		checkinter = setInterval(() => {
			try {
				const currentUrl = w.getURL()
				if (!currentUrl) return
				
				// 检查URL是否包含登录成功的标识
				// 美团医药会重定向到不同的域名和路径，需要兼容多种模式
				// 登录成功后URL示例：
				// https://waimaie.meituan.com/#/new_fe/business#/index
				// https://yiyao.meituan.com/#/new_fe/business/home
				// https://yiyao.meituan.com/main/frame#/page/home (美团医药登录后)
				const isLoginSuccess = currentUrl.indexOf("time=") != -1 || 
				                       currentUrl.indexOf("/#/new_fe/business") != -1 ||
				                       currentUrl.indexOf("/business/home") != -1 ||
				                       currentUrl.indexOf("/#/business") != -1 ||
				                       currentUrl.indexOf("yiyao.meituan.com/#/new_fe") != -1 ||
				                       currentUrl.indexOf("waimaie.meituan.com/#/new_fe") != -1 ||
				                       currentUrl.indexOf("/main/frame#/page/home") != -1 ||
				                       currentUrl.indexOf("yiyao.meituan.com/main") != -1 ||
				                       currentUrl.indexOf("shangoue.meituan.com") != -1
				
				if (!isLoginSuccess) {
					return
				}
				
				// 获取cookie（优先使用evalJS获取document.cookie，这样可以获取更多cookie）
				let cookiestr = ''
				try {
					// 方式1: 通过evalJS获取document.cookie
					const documentCookie = w.evalJS('document.cookie') || ''
					
					// 方式2: 通过plus.navigator.getCookie获取
					const navigatorCookie = plus.navigator.getCookie(currentUrl) || ''
					
					// 合并两种方式获取的cookie
					const cookieMap = new Map()
					
					// 解析document.cookie
					if (documentCookie) {
						documentCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					// 解析navigator cookie（可能包含httpOnly）
					if (navigatorCookie) {
						navigatorCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					// 重新组合cookie字符串
					cookiestr = Array.from(cookieMap.entries())
						.map(([key, value]) => `${key}=${value}`)
						.join('; ')
				} catch (e) {
					cookiestr = plus.navigator.getCookie(currentUrl) || ''
				}
				
				if (!cookiestr || cookiestr.length === 0) {
					return
				}
				
				// 验证关键cookie是否存在（美团平台需要 token、acctId、wmPoiId）
				if (cookiestr.indexOf("token=") == -1 || 
				    cookiestr.indexOf("acctId=") == -1 ||
				    cookiestr.indexOf("wmPoiId=") == -1) {
					return
				}
				
				// cookie有效，停止监听并提交
				
				if (checkinter) {
					clearInterval(checkinter)
					checkinter = null
				}
				
				cookieStr.value = cookiestr.replace('美团cookiestr', '')
				const params = {
					shop_type: queryParams.filter.shopType,
					cookies: cookieStr.value
				}
				
				// 调用添加店铺API
				callAddShopApi(params)
				
				// 清理并关闭webview
				colseShow.value = false
				if (w) {
					plus.webview.close(w)
					w = null
				}
				plus.navigator.removeAllCookie()
				plus.navigator.removeCookie()
				plus.navigator.removeSessionCookie()
			} catch (e) {
				// 忽略错误
			}
		}, 800) // 将检测间隔从500ms增加到800ms，给页面更多加载时间
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
		let url = 'https://melody.shop.ele.me';
		let getWindowInfo = uni.getWindowInfo()
		let webviewleft = (parseInt(700) - parseInt(getWindowInfo.screenWidth)) / 2;
		const webviewid = 'pcwebview';
		const webview_setting = {
			'top': '18%',
		};
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.cache.clear(function() {});
		plus.webview.close(w);


		//"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36 Edg/108.0.1462.46"
		//"Mozilla/5.0 (Linux; Android 7.1.2; VOG-AL00 Build/N2G47O; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/86.0.4240.198 Mobile Safari/537.36 uni-app Html5Plus/1.0"

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
					if (cookiestr && cookiestr.indexOf("x5check_napos=") != -1) {
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
						// app.add(cookiestr, '淘宝闪购外卖');
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
		// #ifndef H5
		// #ifndef APP-PLUS
		navigateToMpAddShop(normalizeStoreManageShopType(queryParams.filter.shopType), isRepair.value)
		// #endif
		// #endif
	}

	// 京东外卖/京东秒送添加门店
	const jingdong = () => {
		// #ifdef H5
		// H5环境跳转到服务器处理页面
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		uni.showLoading({})
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		// 京东到家商户后台登录地址
		let url = 'https://store.jddj.com/login'
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = 'jddjwebview'
		// 为底部按钮留出空间
		const buttonAreaHeight = 80
		const webview_setting = {
			'disablePlus': false,
			'scrollIndicator': 'all',
			'width': getWindowInfo.screenWidth + 'px',
			'top': (systemBarHeight.value + 44) + 'px',
			'height': (getWindowInfo.windowHeight - systemBarHeight.value - 44 - buttonAreaHeight) + 'px',
			'scalable': true,
		}
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.cache.clear(function() {})
		
		// 关闭之前的webview（如果存在）
		if (w) {
			try {
		plus.webview.close(w)
			} catch (e) {
				// 关闭旧webview失败，静默处理
			}
		}

		w = plus.webview.create(url, webviewid, webview_setting)
		setTimeout(() => {
			plus.webview.close(w)
			setTimeout(() => {
				w = plus.webview.open(url, webviewid, webview_setting)
				colseShow.value = true
				w.show()
				uni.hideLoading({})
				
				// 启动cookie监听
				startJdCookieMonitoring()
			}, 500)
		}, 500)
		// #endif
		// #ifndef H5
		// #ifndef APP-PLUS
		navigateToMpAddShop(normalizeStoreManageShopType(queryParams.filter.shopType), isRepair.value)
		// #endif
		// #endif
	}
	
	// 启动京东cookie监听（参考 addShop.vue 的逻辑）
	const startJdCookieMonitoring = () => {
		if (!w) return
		
				checkinter = setInterval(() => {
			try {
				const currentUrl = w.getURL()
				if (!currentUrl) return
				
				const shopType = queryParams.filter.shopType
				// 检查URL是否已经跳转到后台页面（登录成功后的页面）
				// 京东平台登录成功后会跳转到 store.jddj.com 的后台页面
				const isLoginSuccess = (currentUrl.includes('store.jddj.com') || 
				                       currentUrl.includes('jddj.com')) && 
				                      !currentUrl.includes('login') &&
				                      !currentUrl.includes('passport')
				
				// 如果还在登录页面，继续等待
				if (!isLoginSuccess && (currentUrl.includes('login') || currentUrl.includes('passport'))) {
					return
				}
				
				// 如果还没有跳转到后台页面，继续等待
				if (!isLoginSuccess) {
					return
				}
				
				// 如果已经跳转到后台页面，需要等待页面完全加载并执行完JavaScript
				// store_session等cookie可能是异步设置的，需要等待一段时间
				// 记录首次跳转到后台页面的时间
				if (!w._jdBackendPageTime) {
					w._jdBackendPageTime = Date.now()
				}
				
				// 等待至少5秒，让页面完全加载并执行完所有JavaScript（京东平台需要更长时间）
				const timeSinceBackend = Date.now() - w._jdBackendPageTime
				if (timeSinceBackend < 5000) {
					return
				}
				
				// 只有在登录成功且等待足够时间后才获取cookie
				// 获取cookie（优先使用evalJS获取document.cookie，这样可以获取更多cookie）
				let cookiestr = ''
				try {
					// 方式1: 通过evalJS获取document.cookie（可以获取非httpOnly的cookie）
					const documentCookie = w.evalJS('document.cookie') || ''
					
					// 方式2: 通过plus.navigator.getCookie获取（可能包含httpOnly的cookie）
					const navigatorCookie = plus.navigator.getCookie(currentUrl) || ''
					
					// 合并两种方式获取的cookie
					const cookieMap = new Map()
					
					// 解析document.cookie
					if (documentCookie) {
						documentCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					// 解析navigator cookie（可能包含httpOnly）
					if (navigatorCookie) {
						navigatorCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								// navigator cookie优先（可能包含httpOnly）
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					// 从多个域名获取cookie（京东平台）
					try {
						// 从当前URL提取域名和根域名
						let currentHostname = ''
						let rootDomain = ''
						try {
							const urlMatch = currentUrl.match(/https?:\/\/([^\/]+)/)
							if (urlMatch && urlMatch[1]) {
								currentHostname = urlMatch[1].split(':')[0] // 移除端口号
								const parts = currentHostname.split('.')
								if (parts.length >= 2) {
									rootDomain = parts.slice(-2).join('.')
								}
							}
						} catch (e) {
							// 解析URL失败，静默处理
						}
						
						// 构建URL列表：优先使用当前页面的实际域名
						const jdUrls = []
						if (currentHostname) {
							// 优先添加当前页面的域名
							jdUrls.push(`https://${currentHostname}`)
							if (rootDomain && rootDomain !== currentHostname) {
								jdUrls.push(`https://${rootDomain}`)
							}
						}
						// 添加其他可能的域名
						jdUrls.push(
							'https://store.jddj.com',
							'https://jddj.com',
							'https://store1.jddj.com',
							'https://login.o2o.jd.com',
							'https://passport.jd.com',
							'https://o2o.jd.com',
							'https://jd.com'
						)
						
						// 去重
						const uniqueUrls = [...new Set(jdUrls)]
						
						// 从多个URL获取cookie
						for (const url of uniqueUrls) {
							try {
								// 方式1: 通过navigator获取（可能包含HttpOnly）
								const navigatorCookie = plus.navigator.getCookie(url) || ''
								if (navigatorCookie) {
									navigatorCookie.split(';').forEach(item => {
										const [key, ...valueParts] = item.trim().split('=')
										if (key && valueParts.length > 0) {
											cookieMap.set(key.trim(), valueParts.join('=').trim())
										}
									})
								}
								
								// 方式2: 如果webview当前URL的域名匹配，尝试通过evalJS获取document.cookie
								if (currentUrl && currentHostname) {
									try {
										// 使用字符串解析URL（避免URL构造函数在app端不可用）
										const urlHostMatch = url.match(/https?:\/\/([^\/]+)/)
										const urlHostname = urlHostMatch && urlHostMatch[1] ? urlHostMatch[1].split(':')[0] : ''
										
										// 检查域名是否匹配（包括子域名）
										if (urlHostname && (
											currentHostname === urlHostname || 
											currentHostname.endsWith('.' + urlHostname) ||
											urlHostname.endsWith('.' + currentHostname) ||
											currentUrl.includes(urlHostname)
										)) {
											const docCookie = w.evalJS(`(function() {
												try {
													return document.cookie;
												} catch(e) {
													return '';
												}
											})()`) || ''
											if (docCookie) {
												docCookie.split(';').forEach(item => {
													const [key, ...valueParts] = item.trim().split('=')
													if (key && valueParts.length > 0) {
														cookieMap.set(key.trim(), valueParts.join('=').trim())
													}
												})
											}
										}
									} catch (docErr) {
										// 忽略URL解析或document.cookie获取失败
									}
								}
							} catch (e) {
								// 忽略单个域名的错误
							}
						}
						
						// 重新组合cookie（确保不会覆盖已有的cookie）
						const mergedCookie = Array.from(cookieMap.entries())
							.map(([key, value]) => `${key}=${value}`)
							.join('; ')
						if (mergedCookie && mergedCookie.trim() !== '') {
							cookiestr = mergedCookie
						}
						
						// 检查关键认证cookie是否存在（仅用于日志，不阻止提交）
						// 京东零售（shopType=6）和京东外卖（shopType=8）需要 pin+sdtoken 或 thor+flash
						const allKeys = Array.from(cookieMap.keys())
						const hasPin = cookieMap.has('pin')
						const hasSdtoken = cookieMap.has('sdtoken')
						const hasThor = cookieMap.has('thor')
						const hasFlash = cookieMap.has('flash')
						const hasValidAuth = (hasPin && hasSdtoken) || (hasThor && hasFlash)
						
						// 即使缺少关键cookie，如果cookiestr不为空，也尝试提交（让后端判断）
						if (!hasValidAuth && (!cookiestr || cookiestr.trim() === '')) {
							return
						}
					} catch (e) {
						// 降级到基本cookie获取
						cookiestr = plus.navigator.getCookie(currentUrl) || ''
					}
				} catch (e) {
					// 降级到navigator方式
					cookiestr = plus.navigator.getCookie(currentUrl) || ''
				}
				
				// 验证cookie是否有效
				if (!cookiestr || cookiestr.trim() === '') {
					return
				}
				
				// 尝试从页面JavaScript、cookie或URL中提取店铺ID（京东平台可能需要stationId）
				// 根据成功响应，office_id格式为 "JD19707976"，其中19707976是stationId
				let stationId = null
				let shopId = null
				
				// 方法1: 从页面JavaScript中获取stationId或店铺信息（优先）
				// 注意：从日志看到WebSocket连接参数中有stationId="19707976"，说明页面中确实有这个值
				try {
					const pageInfo = w.evalJS(`(function() {
						try {
							// 尝试从window对象中获取店铺信息（多种可能路径）
							if (window.stationId) return {stationId: String(window.stationId)};
							if (window.station && window.station.id) return {stationId: String(window.station.id)};
							if (window.shopInfo && window.shopInfo.stationId) return {stationId: String(window.shopInfo.stationId)};
							if (window.shopInfo && window.shopInfo.id) return {shopId: String(window.shopInfo.id)};
							if (window.storeInfo && window.storeInfo.stationId) return {stationId: String(window.storeInfo.stationId)};
							if (window.$store && window.$store.state && window.$store.state.stationId) return {stationId: String(window.$store.state.stationId)};
							// 尝试从Vue/Vuex等状态管理中获取
							if (window.__VUE__) {
								try {
									const vueInstances = document.querySelectorAll('*');
									for (let el of vueInstances) {
										if (el.__vue__ && el.__vue__.$store && el.__vue__.$store.state) {
											if (el.__vue__.$store.state.stationId) return {stationId: String(el.__vue__.$store.state.stationId)};
											if (el.__vue__.$store.state.station && el.__vue__.$store.state.station.id) return {stationId: String(el.__vue__.$store.state.station.id)};
										}
									}
								} catch(e) {}
							}
							// 尝试从localStorage获取（检查所有可能的key）
							if (window.localStorage) {
								const keys = Object.keys(localStorage);
								for (let key of keys) {
									if (key.toLowerCase().includes('station') || key.toLowerCase().includes('shop')) {
										const value = localStorage.getItem(key);
										if (value && /^\d{6,}$/.test(value)) {
											if (key.toLowerCase().includes('station')) return {stationId: String(value)};
											if (key.toLowerCase().includes('shop')) return {shopId: String(value)};
										}
									}
								}
							}
							// 尝试从sessionStorage获取
							if (window.sessionStorage) {
								const keys = Object.keys(sessionStorage);
								for (let key of keys) {
									if (key.toLowerCase().includes('station') || key.toLowerCase().includes('shop')) {
										const value = sessionStorage.getItem(key);
										if (value && /^\d{6,}$/.test(value)) {
											if (key.toLowerCase().includes('station')) return {stationId: String(value)};
											if (key.toLowerCase().includes('shop')) return {shopId: String(value)};
										}
									}
								}
							}
							// 尝试从DOM中查找（某些页面可能在data属性中）
							try {
								const body = document.body;
								if (body) {
									const stationIdAttr = body.getAttribute('data-station-id') || body.getAttribute('data-stationId');
									if (stationIdAttr) return {stationId: String(stationIdAttr)};
								}
							} catch(e) {}
							return null;
						} catch(e) {
							return null;
						}
					})()`)
					
					if (pageInfo && typeof pageInfo === 'object') {
						if (pageInfo.stationId) {
							stationId = String(pageInfo.stationId)
						}
						if (pageInfo.shopId) {
							shopId = String(pageInfo.shopId)
						}
					}
				} catch (e) {
					// 从页面JavaScript获取店铺ID失败，静默处理
				}
				
				// 方法2: 从cookie中提取stationId
				if (!stationId) {
					try {
						const stationIdMatch = cookiestr.match(/stationId[=:](\d+)/i) || cookiestr.match(/station[_-]?id[=:](\d+)/i)
						if (stationIdMatch && stationIdMatch[1]) {
							stationId = stationIdMatch[1]
						}
					} catch (e) {
						// 从cookie提取stationId失败，静默处理
					}
				}
				
				// 方法3: 从URL中提取stationId（京东URL可能包含stationId）
				if (!stationId) {
					try {
						const urlMatch = currentUrl.match(/stationId[=:](\d+)/i) || 
						                currentUrl.match(/station[=:](\d+)/i) || 
						                currentUrl.match(/\/(\d{8,})\//) ||
						                currentUrl.match(/station[\/=](\d{8,})/i)
						if (urlMatch && urlMatch[1]) {
							stationId = urlMatch[1]
						}
					} catch (e) {
						// 从URL提取stationId失败，静默处理
					}
				}
				
				// 方法4: 从cookie中提取shopId
				if (!shopId) {
					try {
						const shopIdMatch = cookiestr.match(/shopId[=:](\d+)/i)
						if (shopIdMatch && shopIdMatch[1]) {
							shopId = shopIdMatch[1]
						}
					} catch (e) {
						// 从cookie提取shopId失败，静默处理
					}
				}
				
				// cookie有效，直接使用原始cookie（京东平台不需要特殊格式化）
				// 构建参数（调用 shopmg/addshop 接口）
				// 注意：shopmg/addshop 接口期望的参数是 {shop_type, cookies}
				const params = {
					shop_type: shopType,  // 使用 shop_type 而不是 type
					cookies: cookiestr  // 使用 cookies（复数）
				}
				
				// 如果提取到了stationId或shopId，添加到参数中（可能有助于后端识别店铺）
				if (stationId) {
					params.stationId = stationId
				}
				if (shopId) {
					params.shopId = shopId
				}
				
				// 停止监听
				if (checkinter) {
					clearInterval(checkinter)
					checkinter = null
				}
				
				// 调用 AddShop 接口
				callAddShopApi(params)
				
				// 清理并关闭webview
				colseShow.value = false
				if (w) {
					plus.webview.close(w)
					w = null
				}
				plus.cache.clear()
			} catch (e) {
				// Cookie监听错误，静默处理
			}
		}, 500)
	}
	
	// 调用 shopmg/addshop 接口（使用 ShopApi.agentAddShop）
	const callAddShopApi = async (params) => {
		try {
			// 验证参数
			if (!params || !params.cookies || params.cookies.trim() === '') {
				uni.showToast({
					title: 'cookies为空，无法添加店铺',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			uni.showLoading({ title: '添加店铺中...' })
			
			// 使用 ShopApi.agentAddShop 方法
			const res = await ShopApi.agentAddShop(params)
			
			uni.hideLoading({})
			
			if (res.code === 200 && res.data) {
				// 添加成功
				successObj = res.data
				addState.value = true
				uni.showToast({
					title: '添加成功',
					icon: 'success',
					duration: 2000
				})
				// 刷新店铺列表
				setTimeout(() => {
					getShopList()
				}, 500)
			} else {
				uni.showToast({
					title: res.message || res.msg || '添加失败',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (err) {
			uni.hideLoading({})
			uni.showToast({
				title: err.message || '添加失败',
				icon: 'none',
				duration: 2000
			})
		}
	}

	// 饿百零售添加门店
	const ebail = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		uni.showLoading({})
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		let url = 'https://nr.ele.me/'
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = 'ebailwebview'
		const webview_setting = {
			'top': '18%',
		}
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		plus.cache.clear(function() {})
		plus.webview.close(w)

		w = plus.webview.create(url, webviewid, webview_setting)
		setTimeout(() => {
			plus.webview.close(w)
			setTimeout(() => {
				w = plus.webview.create(url, webviewid, webview_setting)
				colseShow.value = true
				w.show()
				uni.hideLoading({})
				checkinter = setInterval(() => {
					let str = w.getURL()
					let cookiestr = plus.navigator.getCookie(str)
					
					// 检查是否登录成功（URL包含common-next且有cookie）
					if (str && str.includes('common-next') && cookiestr && cookiestr.length > 100) {
						const params = {
							shop_type: queryParams.filter.shopType,
							cookies: cookiestr
						}
						agentAddShop(params)
						plus.webview.close(w)
						plus.cache.clear()
						colseShow.value = false
						clearInterval(checkinter)
					}
				}, 500)
			}, 500)
		}, 500)
		// #endif
		// #ifndef H5
		// #ifndef APP-PLUS
		navigateToMpAddShop(normalizeStoreManageShopType(queryParams.filter.shopType), isRepair.value)
		// #endif
		// #endif
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

	const toManage = (data) => {
		// 保存当前滚动位置，以便返回时恢复
		uni.setStorageSync('storeManage_scrollTop', scrollTopOld.scrollTop || 0)
		
		// 从 shopList 中找到最新的店铺数据，确保 func_enable 是最新的
		// 因为在店铺列表页面操作功能开关后，shopList 会更新，但 data 参数可能是旧的
		const latestShop = shopList.value.find(item => item.id === data.id || item.office_id === data.id)
		const currentShop = latestShop || data
		
		// 从最新的店铺数据中获取 func_enable
		// v1接口使用func_info，v2接口使用extra_data.func_enable
		// 确保获取的是数组格式，并进行深拷贝避免引用问题
		let func_enable = null
		if (currentShop.extra_data?.func_enable && Array.isArray(currentShop.extra_data.func_enable)) {
			func_enable = JSON.parse(JSON.stringify(currentShop.extra_data.func_enable))
		} else if (currentShop.func_info && Array.isArray(currentShop.func_info)) {
			func_enable = JSON.parse(JSON.stringify(currentShop.func_info))
		}
		
		const {
			img,
			state,
			name,
			extra_data,
			city,
			cookies,
			work_time,
			user,
			id,
			// 经营数据字段（来自 /shopmg/getshoplist）
			income,
			order_num,
			show_num
		} = currentShop
		uni.setStorageSync('shopInfo', {
			img,
			state,
			name,
			func_enable: func_enable,
			city,
			cookies,
			work_time,
			user,
			id,
			office_id: currentShop.office_id,
			income,
			order_num,
			show_num
		});
		uni.navigateTo({
			url: '/pages/shop-management/shop-management?id=' + currentShop.id + '&type=' + queryParams.filter
				.shopType + '&office_id=' + currentShop.office_id + '&isV2=true',
		})

	}

	// 设置门店点击（封装平台差异逻辑）
	const handleManageClick = (row) => {
		toManage(row)
	}
	const handleClose = () => {
		isFullPopupPlan.value = false
		isIMKefuRenew.value = false
		currentRenewFuncCode.value = ''
	}
	const getPayList = async (options = {}) => {
		const silentEmpty = !!options.silentEmpty
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		const shopTypeNumRaw = Number(payParams.shoptype) || 1
		const shopTypeNum = normalizeStoreManageShopType(shopTypeNumRaw)
		const priceTitle = payParams.pricetitle || ''
		const isKeyWord = payParams.isKeyWord !== undefined ? payParams.isKeyWord : false
		
		try {
			const quotes = await getRenewQuoteList(shopTypeNum, priceTitle, isKeyWord)
			let tempList = quotes.map(mapPayQuoteToSpecRow)

			if (isFullPopupPlan.value && shopTypeNum === 1) {
				try {
					const pjssQuotes = await getRenewQuoteList(shopTypeNum, 'PJSS', false)
					const pjssList = pjssQuotes.map(mapPayQuoteToSpecRow)
					if (pjssList.length > 0) {
						const existIds = new Set(
							tempList.filter(i => i && i.price_id).map(i => i.price_id)
						)
						const extraList = pjssList.filter(
							i => i && (!i.price_id || !existIds.has(i.price_id))
						)
						tempList = tempList.concat(extraList)
					}
				} catch (e) {
					// 评价申诉规格获取失败时静默处理
				}
			}

			payList.value = tempList

			if (payList.value.length === 0) {
				if (!silentEmpty) {
					uni.showToast({
						title: '该功能暂无可购规格，请联系客服',
						icon: 'none',
						duration: 3000
					})
				}
				return
			}
			authGoodsVisible.value = true
		} catch (err) {
			uni.showToast({
				title: err.message || '获取功能价格失败，请重试',
				icon: 'none',
				duration: 3000
			})
		} finally {
			uni.hideLoading()
		}
	}
	const onPopupHandler = (row, codeOrStr, str) => {
		payParams.shoptype = queryParams.filter.shopType
		shopId.value = row.id
		currentRenewFuncCode.value = ''
		isIMKefuRenew.value = false
		
		// 判断是功能代码还是功能名称
		const isFuncCode = FUNC_CODE_LIST.includes(codeOrStr)
		
		if (codeOrStr === '全功能' || str === '全功能') {
			// 全功能激活：使用价格关键词模式，由列表页预加载规格
			isFullPopupPlan.value = true
			payParams.pricetitle = '全功能|店铺多开_月'
			payParams.isKeyWord = true
			getPayList()
			return
		} else if (codeOrStr === '功能激活' || str === '功能激活') {
			// 美团闪购(3)、美团医药(4)、淘宝闪购零售(5)：仅支持单功能激活，去掉全功能按钮
			// 其余类型：正常打开弹窗，支持单功能/全功能切换
			isFullPopupPlan.value = false
			payParams.pricetitle = ''
			payParams.isKeyWord = false
			authGoodsVisible.value = true
			return
		} else if (codeOrStr === 'KEFU') {
			// IM聚合客服续费（与聚合客服店铺管理页保持一致）
			isFullPopupPlan.value = false
			isIMKefuRenew.value = true
			currentRenewFuncCode.value = 'KEFU'
			payParams.pricetitle = 'IM客服_月'
			payParams.isKeyWord = true
			getPayList()
			return
		} else if (isFuncCode) {
			// 单个功能续费，使用功能名称 + '_月' 作为 priceTitle（与 shop-management 页面保持一致）
			isFullPopupPlan.value = false
			isIMKefuRenew.value = false
			currentRenewFuncCode.value = codeOrStr
			const funcName = FUNC_CODE_NAME_MAP[codeOrStr] || codeOrStr
			payParams.pricetitle = funcName + '_月'  // 使用功能名称 + '_月'，如 '自动出餐_月' 或 'IM自动回复_月'
			payParams.isKeyWord = false  // 单个功能续费不使用关键词模式
			getPayList()
			return
		} else {
			// 兼容旧逻辑，使用功能名称（这种情况应该不会出现，但保留兼容性）
			isFullPopupPlan.value = false
			payParams.pricetitle = (codeOrStr || str) + '_月'
			payParams.isKeyWord = false
			getPayList()
			return
		}
	}
	const isShopFuncExpired = (item, funcCode) => {
		const endTimeKey = funcCode + 'endTime'
		const endTime = item[endTimeKey]
		if (!endTime) return true
		try {
			const endDate = parseDateSafe(endTime)
			if (!endDate) return true
			const now = new Date()
			now.setHours(0, 0, 0, 0)
			endDate.setHours(0, 0, 0, 0)
			return endDate < now
		} catch (e) {
			return true
		}
	}

	const beforeChangeFun = (obj, code, str) => {
		// 已到期功能开启时直接走续费弹窗，避免无效 API 请求
		if (obj[code] && isShopFuncExpired(obj, code)) {
			obj[code] = false
			onPopupHandler(obj, code, str)
			return
		}

		uni.showLoading()
		
		// 根据功能代码获取功能名称
		const getFuncName = (code) => {
			const funcNameMap = {
				'ZDCC': '自动出餐',
				'IMZDHF': '自动回复',
				'ZDHP': '自动回评',
				'KEFU': '聚合客服',
				'ZDTG': '智能推广',
				'PJSS': '评价申诉'
			}
			return funcNameMap[code] || '功能'
		}
		
		const funcName = getFuncName(code)
		const statusText = obj[code] ? '已开启' : '已关闭'
		
		ManagementApi.enableIM({
			code,
			enable: obj[code],
			shop: obj.id
		}).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: `${funcName}${statusText}`,
					icon: 'success',
					duration: 3000, //提示的延迟时间，单位毫秒，与店铺管理页面保持一致
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
				
				// 同步更新 func_info 或 extra_data.func_enable，确保 toManage 函数能获取到最新状态
				// v1接口使用func_info，v2接口使用extra_data.func_enable
				// 确定使用哪个字段
				const isV2 = obj.extra_data && obj.extra_data.func_enable
				let funcInfo = isV2 ? obj.extra_data.func_enable : obj.func_info
				
				// 如果 funcInfo 不存在或不是数组，创建一个数组
				if (!Array.isArray(funcInfo)) {
					funcInfo = []
				}
				
				// 查找并更新对应的功能状态
				const funcItem = funcInfo.find(f => f.code === code)
				if (funcItem) {
					// 直接更新现有项
					funcItem.enable = obj[code]
				} else {
					// 如果不存在，添加新的功能项（从 obj 中获取对应的 end_time，如 ZDCCendTime）
					const endTimeKey = code + 'endTime'
					const endTime = obj[endTimeKey] || ''
					funcInfo.push({
						code: code,
						enable: obj[code],
						end_time: endTime
					})
				}
				
				// 确保更新到 obj 对象中（直接赋值，因为 funcInfo 已经是引用）
				if (isV2) {
					// v2接口：更新 extra_data.func_enable
					if (!obj.extra_data) {
						obj.extra_data = {}
					}
					obj.extra_data.func_enable = funcInfo
				} else {
					// v1接口：更新 func_info
					obj.func_info = funcInfo
				}
				
				// 发送事件通知店铺管理页面更新状态
				uni.$emit('shopFunctionChanged', {
					shopId: obj.id,
					code: code,
					enable: obj[code]
				})
				// 不调用 getShopList()，而是直接更新当前列表项的状态，避免页面跳转到顶部
				// getShopList()
			} else {
				obj[code] = !obj[code]
			}
		}).catch(() => {
			obj[code] = !obj[code]
			// 传递功能代码和店铺对象，用于单个功能续费
			onPopupHandler(obj, code, str)
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const subscribe = (type) => {
		if (type === 'success') {
			authGoodsVisible.value = false
			// 保存当前滚动位置
			const currentScrollTop = scrollTopOld.scrollTop
			// 刷新列表
			getShopList(currentScrollTop)
		}
	}
	const updataShopFunc = (funcInfoArray) => {
		// 处理功能更新后的回调，更新店铺列表中的功能状态
		if (funcInfoArray && Array.isArray(funcInfoArray)) {
			// 找到对应的店铺并更新功能状态
			const shop = shopList.value.find(s => s.id === shopId.value)
			if (shop) {
				funcInfoArray.forEach(funcInfo => {
					const code = funcInfo.code
					if (code === 'ZDCC') {
						shop.ZDCC = funcInfo.enable || false
						shop.ZDCCtime = funcInfo.NewEndTime ? time(funcInfo.NewEndTime) : '已到期'
						shop.ZDCCendTime = funcInfo.NewEndTime || null
					} else if (code === 'IMZDHF') {
						shop.IMZDHF = funcInfo.enable || false
						shop.IMZDHFtime = funcInfo.NewEndTime ? time(funcInfo.NewEndTime) : '已到期'
						shop.IMZDHFendTime = funcInfo.NewEndTime || null
					} else if (code === 'ZDHP') {
						shop.ZDHP = funcInfo.enable || false
						shop.ZDHPtime = funcInfo.NewEndTime ? time(funcInfo.NewEndTime) : '已到期'
						shop.ZDHPendTime = funcInfo.NewEndTime || null
					} else if (code === 'KEFU') {
						shop.KEFU = funcInfo.enable || false
						shop.KEFUtime = funcInfo.NewEndTime ? time(funcInfo.NewEndTime) : '已到期'
						shop.KEFUendTime = funcInfo.NewEndTime || null
					} else if (code === 'ZDTG') {
						shop.ZDTG = funcInfo.enable || false
						shop.ZDTGtime = funcInfo.NewEndTime ? time(funcInfo.NewEndTime) : '已到期'
						shop.ZDTGendTime = funcInfo.NewEndTime || null
					} else if (code === 'PJSS') {
						shop.PJSS = funcInfo.enable || false
						shop.PJSStime = funcInfo.NewEndTime ? time(funcInfo.NewEndTime) : '已到期'
						shop.PJSSendTime = funcInfo.NewEndTime || null
					}
				})
			}
		}
	}
	const closeAuthGoodsVisibleHandler = () => {
		authGoodsVisible.value = false
		isIMKefuRenew.value = false
		currentRenewFuncCode.value = ''
	}
	const delShop = (item) => {
		// 调用 uni.showModal 方法
		uni.showModal({
			title: '确认移除该门店到回收站？', // 弹窗的标题
			content: '移除后不再显示该门店', // 弹窗的内容
			success: (res) => {
				// 用户点击了哪个按钮
				if (res.confirm) {
					ShopApi.unBindShop({
						recycle_bin: true,
						shopIds: [item.id]
					}).then(res => {
						if (res.code === 200) {
							getShopList()
							uni.showToast({
								title: '移除成功',
								icon: 'success',
								duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
								mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
							});
						}
					})
					// 在这里执行确定后的逻辑
				}
			},
			fail: function() {
				// 调用失败，静默处理
			}
		});
	}
	const saveNotes = (item) => {
		const body = {
			id: item.id,
			UpdateVal: {
				notes: item.notes
			}
		}
		ShopApi.updateShop(body).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '保存成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			} else {
				item.notes = ''
			}
		}).catch(() => {
			item.notes = ''
		})
	}
	const confirmCopy = () => {
		let data = "平台：" + (copyobj.shop_type == 1 ? '美团外卖' : '淘宝闪购外卖') +
			"\n店铺名称：" + copyobj.name +
			"\n店铺ID：" + copyobj.office_id +
			"\n自动出餐到期时间：" + copyobj.ZDCCtime +
			"\n自动回复到期时间：" + copyobj.IMZDHFtime +
			"\n自动回评到期时间：" + copyobj.ZDHPtime +
			"\n自动点金到期时间：" + copyobj.ZDTGtime +
			
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
				// 复制失败，静默处理
			}
		});
	}
	const copyClose = () => {
		copyState.value = false
	}
	const getPaginationShopList = (val) => {
		queryParams.page = val.value
		getShopList()
	}
	
	// 跳转首页
	const goToFirstPage = () => {
		if (queryParams.page === 1) {
			return
		}
		queryParams.page = 1
		getShopList()
	}
	
	// 跳转末页
	const goToLastPage = () => {
		const totalPages = Math.ceil(total.value / queryParams.pageSize)
		if (queryParams.page === totalPages) {
			return
		}
		queryParams.page = totalPages
		getShopList()
	}
	
	// 页码输入框引用
	const pageInputRef = ref(null)
	
	// 调整输入框宽度
	const adjustInputWidth = (value) => {
		nextTick(() => {
			if (!pageInputRef.value) return
			const str = String(value || '')
			const length = str.length || 1
			// 每个字符大约 30rpx (font-size: 30rpx)，加上 padding 16rpx
			const newWidth = Math.max(50, length * 30 + 16)
			if (pageInputRef.value.style) {
				pageInputRef.value.style.width = newWidth + 'rpx'
			}
		})
	}
	
	// 页码输入变化处理（用于动态调整宽度）
	const handlePageInputChange = (e) => {
		const value = e.detail ? e.detail.value : (e.target ? e.target.value : '')
		adjustInputWidth(value)
	}
	
	// 页码输入处理
	const handlePageInput = (e) => {
		const value = e.detail ? (e.detail.value || '') : (e.target ? (e.target.value || '') : '')
		const page = parseInt(value)
		const totalPages = Math.ceil(total.value / queryParams.pageSize)
		
		if (!value || !page || isNaN(page) || page < 1) {
			queryParams.page = 1
			adjustInputWidth(1)
			getShopList()
			return
		}
		
		if (page > totalPages) {
			queryParams.page = totalPages
			adjustInputWidth(totalPages)
			getShopList()
			return
		}
		
		queryParams.page = page
		adjustInputWidth(page)
		getShopList()
	}
	
	// 监听页码变化，更新输入框宽度
	watch(() => queryParams.page, (newPage) => {
		adjustInputWidth(newPage)
	}, { immediate: true })
	// 搜索处理函数
	const handleSearch = () => {
		queryParams.filter.word = searchValue.value.trim() || undefined
		queryParams.page = 1 // 重置到第一页
		getShopList()
	}
	// 搜索输入处理（可选：实时搜索）
	const handleSearchInput = (e) => {
		// 如果需要实时搜索，可以在这里添加防抖逻辑
		// 目前设置为点击搜索按钮或按回车时才搜索
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
	const selectAuthorize = (index) => {
		authorizeIndex.value = index
	}
	const selectFilterType = (index) => {
		selsectType.value = index
	}
	const selectItem = (item, _item) => {
		_item.check = !_item.check
		let hasCheck = item.children.filter(obj => obj.check === true)
		if (hasCheck.length === item.children.length) {
			item.check = true
		}
	}
	const stopClick = (e) => {
		e.stopPropagation();
	}
	const allSelect = (item) => {
		item.children.forEach(_item => {
			_item.check = item.check
		})
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
	const selectCategory = (index) => {
		categoryIndex.value = index
	}
	const tab = ref(initialStoreManageShopType)
	const menuVisible = ref(false)
	
	// 计算当前平台标签
	const currentPlatformLabel = computed(() => {
		const currentItem = props.value.list.find(item => item.shopType === tab.value)
		return currentItem ? currentItem.label : '美团外卖'
	})
	
	// 计算当前平台Logo
	const currentPlatformLogo = computed(() => {
		const currentItem = props.value.list.find(item => item.shopType === tab.value)
		return currentItem ? currentItem.logo : null
	})
	
	// 计算当前平台背景渐变色
	const currentPlatformBgColor = computed(() => {
		const colors = platformBgColors[tab.value] || ['#F9F9F9', '#FFFFFF']
		return `linear-gradient(180deg, ${colors[0]} 0%, ${colors[1]} 100%)`
	})
	
	// 计算当前平台边框颜色
	const currentPlatformBorderColor = computed(() => {
		return platformBorderColors[tab.value] || '#FACC05'
	})
	
	// 计算店铺卡片渐变背景样式
	const getShopCardBgStyle = computed(() => {
		const colors = platformBgColors[tab.value] || ['#FFFFFF', '#FFFFFF']
		return {
			background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
		}
	})
	
	// 切换菜单显示/隐藏
	const toggleMenu = () => {
		menuVisible.value = !menuVisible.value
	}
	
	const confirmFilter = () => {
		queryParams = {
			page: 1,
			pageSize: 10,
			filter: {
				time_state: undefined, // 店铺到期时间过期 全部 = 0 未到期 = 1 即将到期 = 2 已经到期 = 3
				shopType: tab.value, // 店铺类型  None = 0  美团 = 1  饿了么 = 2
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
		filterState.value = false
		getShopList()
	}
	const openFilter = () => {
		ensureFilterMeta()
		filterState.value = true
	}
	const closeFilter = () => {
		filterState.value = false
	}
	const recycleTurnPage = (val) => {
		recycleQueryParams.page = val.value
		getRecycleList()
	}
	const recoveryShop = (row) => {
		const params = {
			"shopIds": [
				row.id
			]
		};
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		ShopApi.recoveryShop(params).then(res => {
			if (res.code === 200) {
				uni.showToast({
					title: '已恢复门店',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const recycleQueryParams = reactive({
		page: 1,
		pageSize: 10,
		filter: {
			time_state: undefined, // 店铺到期时间过期 全部 = 0 未到期 = 1 即将到期 = 2 已经到期 = 3
			shopType: 1, // 店铺类型  None = 0  美团 = 1  淘宝闪购外卖 = 2
			word: undefined, // 门店名称或官方id
			group: undefined, // 指定分组
			state: undefined, // None = 0  店铺未登陆 = 1  店铺已掉线 = 3  店铺营业中 = 4  店铺上线中 = 6  店铺已下线 = 7
			ck_online: undefined, // 店铺正常授权 即dk 有效
			citys: undefined, // 指定哪些城市
			func_code: undefined, // 过滤功能
			func_state: undefined, //   全部 = 0  未到期 = 1  即将到期 = 2  功能已关闭 = 4  已经到期 = 5
			avtag: false
		}
	})
	const openRecycle = () => {
		recycleQueryParams.filter.shopType = queryParams.filter.shopType
		getRecycleList()
		recycleState.value = true
		// setTimeout(() => {
		// 	if (shopList.value.length) {
		// 		recycleState.value = true
		// 	} else {
		// 		uni.showToast({
		// 			title: '回收站暂无门店',
		// 			icon: 'error',
		// 			duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
		// 			mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
		// 		});
		// 	}
		// }, 200)
	}
	const getRecycleList = () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		ShopApi.getList(recycleQueryParams).then(res => {
			if (res.code === 200) {
				recycle.value = res.data.rows
				recycleTotal.value = res.data.total
			}
		}).finally(() => {
			uni.hideLoading()
		})
	}
	const closeRecycle = () => {
		recycleState.value = false
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
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		ShopApi.bindShop(bindCode.value).then(res => {
			if (res.code === 200) {
				bindClose()
				getShopList()
				uni.showToast({
					title: '绑定成功',
					icon: 'success',
					duration: 2000, //提示的延迟时间，单位毫秒，默认：1500
					mask: false, //是否显示透明蒙层，防止触摸穿透，默认：false 
				});
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const bindClose = () => {
		bindState.value = false
		bindCode.value = ''
	}
	const bindShop = () => {
		bindState.value = true
	}
	const applyFuncFlagsToShopRows = (rows) => {
		rows.forEach(item => {
			// v1接口使用func_info，v2接口使用extra_data.func_enable
			let funcInfo = item.func_info || item.extra_data?.func_enable
			if (funcInfo && funcInfo.length) {
				item.ZDCC = funcInfo.find(itemA => itemA.code == 'ZDCC')?.enable || false;
				const zdccFunc = funcInfo.find(itemA => itemA.code == 'ZDCC')
				item.ZDCCtime = time(zdccFunc?.end_time)
				item.ZDCCendTime = zdccFunc?.end_time || null // 保存原始时间用于计算剩余天数
				const zdhpFunc = funcInfo.find(itemA => itemA.code == 'ZDHP')
				item.ZDHP = zdhpFunc?.enable || false
				item.ZDHPtime = time(zdhpFunc?.end_time)
				item.ZDHPendTime = zdhpFunc?.end_time || null // 保存原始时间用于计算剩余天数
				
				const kefuFunc = funcInfo.find(itemA => itemA.code == 'KEFU')
				item.KEFU = kefuFunc?.enable || false
				item.KEFUtime = time(kefuFunc?.end_time)
				item.KEFUendTime = kefuFunc?.end_time || null
				
				const imzdhfFunc = funcInfo.find(itemA => itemA.code == 'IMZDHF')
				item.IMZDHF = imzdhfFunc?.enable || false
				item.IMZDHFtime = time(imzdhfFunc?.end_time)
				item.IMZDHFendTime = imzdhfFunc?.end_time || null // 保存原始时间用于计算剩余天数
				
				const zdtgFunc = funcInfo.find(itemA => itemA.code == 'ZDTG')
				item.ZDTG = zdtgFunc?.enable || false
				item.ZDTGtime = time(zdtgFunc?.end_time)
				item.ZDTGendTime = zdtgFunc?.end_time || null // 保存原始时间用于计算剩余天数
				
				const pjssFunc = funcInfo.find(itemA => itemA.code == 'PJSS')
				item.PJSS = pjssFunc?.enable || false
				item.PJSStime = time(pjssFunc?.end_time)
				item.PJSSendTime = pjssFunc?.end_time || null // 保存原始时间用于计算剩余天数
				item.CPDT = funcInfo.find(itemA => itemA.code == 'CPDT')?.enable || false
				item.CPDTtime = funcInfo.find(itemA => itemA.code == 'CPDT')?.end_time
				item.CPDTtimetext = time(funcInfo.find(itemA => itemA.code == 'CPDT')
					?.end_time)
			} else {
				item.ZDCC = false
				item.ZDCCtime = '已到期'
				item.ZDCCendTime = null
				item.ZDHP = false
				item.ZDHPtime = '已到期'
				item.ZDHPendTime = null
				item.KEFU = false
				item.KEFUtime = '已到期'
				item.KEFUendTime = null
				item.IMZDHF = false
				item.IMZDHFtime = '已到期'
				item.IMZDHFendTime = null
				item.ZDTG = false
				item.ZDTGtime = '已到期'
				item.ZDTGendTime = null
				item.PJSS = false
				item.PJSStime = '已到期'
				item.PJSSendTime = null
				item.CPDTtime = ""
			}
		})
		return rows
	}
	const getShopList = (preserveScrollTop = null, options = {}) => {
		const { silent = false, skipQuickCounts = false, deferQuickCounts = false } = options
		if (!silent) {
			uni.showLoading({
				title: '加载中',
				mask: true
			})
		}
		const apiQueryParams = JSON.parse(JSON.stringify(queryParams))
		if (apiQueryParams.filter && apiQueryParams.filter.shopType !== undefined && apiQueryParams.filter.shopType !== null) {
			const shopTypeNum = Number(apiQueryParams.filter.shopType)
			if (!isNaN(shopTypeNum)) {
				apiQueryParams.filter.shopType = normalizeStoreManageShopType(shopTypeNum)
			}
		}

		ShopApi.getList(apiQueryParams).then(res => {
			if (res.code === 200) {
				shopList.value = applyFuncFlagsToShopRows(res.data.rows)
				total.value = res.data.total
				// 更新当前平台类型的数量（使用实际列表的总数）
				const currentPlatform = props.value.list.find(item => item.shopType === queryParams.filter.shopType)
				if (currentPlatform) {
					currentPlatform.count = res.data.total
				}
				// #ifdef MP-WEIXIN
				writeMpStoreListCache({
					shopType: Number(queryParams.filter.shopType) || 1,
					rows: shopList.value,
					total: total.value,
				})
				// #endif
				// 处理滚动位置：如果传入了 preserveScrollTop，则保持该滚动位置，否则重置为0（切换页面时）
				if (preserveScrollTop !== null) {
					// 使用 nextTick 确保在 DOM 更新后恢复滚动位置
					nextTick(() => {
						scrollTop.value = preserveScrollTop
					})
				} else {
					// 切换页面时重置滚动位置为0，避免滚动位置超出新页面内容范围导致卡住
					nextTick(() => {
						scrollTop.value = 0
					})
				}
				// 刷新顶部快捷筛选统计
				if (!skipQuickCounts) {
					if (deferQuickCounts) {
						setTimeout(() => refreshQuickFilterCounts(), 400)
					} else {
						refreshQuickFilterCounts()
					}
				}
			}
		}).catch(err => {
			// 错误处理，静默处理
		}).finally(() => {
			if (!silent) {
				uni.hideLoading({})
			}
			isRefreshing.value = false
		})
	}

	const buildQuickBaseFilter = () => {
		const shopTypeNum = Number(queryParams.filter.shopType)
		return {
			shopType: normalizeStoreManageShopType(isNaN(shopTypeNum) ? 1 : shopTypeNum)
		}
	}

	const refreshQuickFilterCounts = async () => {
		try {
			const baseFilter = buildQuickBaseFilter()
			const [expireRes, authRes] = await Promise.all([
				ShopApi.getList({
					page: 1,
					pageSize: 1,
					filter: {
						...baseFilter,
						func_code: expireFuncCode.value,
						// 与筛选弹窗“功能状态=即将到期”口径保持一致
						func_state: 2
					}
				}),
				ShopApi.getList({
					page: 1,
					pageSize: 1,
					filter: {
						...baseFilter,
						state: 3
					}
				})
			])
			expiringShopCount.value = Number(expireRes?.data?.total || 0)
			authAbnormalShopCount.value = Number(authRes?.data?.total || 0)
		} catch (e) {
			expiringShopCount.value = 0
			authAbnormalShopCount.value = 0
		}
	}

	const handleExpireFuncChange = (e) => {
		const index = Number(e?.detail?.value || 0)
		const item = expireFuncOptions.value[index]
		if (!item) return
		expireFuncCode.value = item.value
		refreshQuickFilterCounts()
		// 若弹窗打开中，切换功能后重新拉取并按新功能排序
		if (expirePopupVisible.value) {
			expirePopupQuery.page = 1
			expirePopupAllRows.value = []
			loadExpirePopupList()
		}
	}

	watch(expireFuncOptions, (options) => {
		if (!options.length) return
		if (shouldResetExpireFuncToFirst.value) {
			expireFuncCode.value = options[0].value
			shouldResetExpireFuncToFirst.value = false
			return
		}
		if (!options.find(item => item.value === expireFuncCode.value)) {
			expireFuncCode.value = options[0].value
		}
	})

	// 切换平台时，功能下拉始终重置为当前可选的第一个
	watch(() => tab.value, () => {
		shouldResetExpireFuncToFirst.value = true
		if (expireFuncOptions.value.length) {
			expireFuncCode.value = expireFuncOptions.value[0].value
			shouldResetExpireFuncToFirst.value = false
		}
	})

	const getFuncEndTime = (shop, code) => {
		const funcInfo = shop?.func_info || shop?.extra_data?.func_enable || []
		const target = Array.isArray(funcInfo) ? funcInfo.find((f) => f?.code === code) : null
		return time(target?.end_time)
	}

	const loadExpirePopupList = async () => {
		const reqSeq = ++expirePopupLoadSeq.value
		uni.showLoading({ title: '加载中...', mask: true })
		try {
			const baseFilter = buildQuickBaseFilter()
			const baseParams = {
				page: 1,
				pageSize: MAX_EXPIRE_FETCH_PAGE_SIZE,
				filter: {
					...baseFilter,
					func_code: expireFuncCode.value,
					// 与筛选弹窗“功能状态=即将到期”口径保持一致
					func_state: 2
				}
			}
			const firstRes = await ShopApi.getList(baseParams)
			if (reqSeq !== expirePopupLoadSeq.value) return
			if (firstRes.code === 200) {
				const firstRows = firstRes.data?.rows || []
				const total = Number(firstRes.data?.total || 0)
				const totalPages = Math.max(1, Math.ceil(total / baseParams.pageSize))
				const rowMap = new Map()
				const appendUniqueRows = (rows) => {
					rows.forEach((row) => {
						const key = String(row?.id || row?.office_id || `${row?.name || ''}-${row?.ck_uptime || ''}`)
						if (rowMap.has(key)) return
						rowMap.set(key, row)
					})
				}
				appendUniqueRows(firstRows)
				if (totalPages > 1) {
					const tasks = []
					for (let p = 2; p <= totalPages; p += 1) {
						tasks.push(
							ShopApi.getList({
								...baseParams,
								page: p
							})
						)
					}
					const extraRes = await Promise.all(tasks)
					if (reqSeq !== expirePopupLoadSeq.value) return
					extraRes.forEach((item) => {
						if (item?.code === 200) {
							appendUniqueRows(item?.data?.rows || [])
						}
					})
				}
				const allRows = Array.from(rowMap.values())

				// 全量排序后缓存；分页仅做本地切片
				expirePopupAllRows.value = allRows.sort((a, b) =>
					getExpireRemainDaysValue(a, expireFuncCode.value) - getExpireRemainDaysValue(b, expireFuncCode.value)
				)
				applyExpirePopupPagination()
			}
		} finally {
			// 仅最新请求负责关闭 loading，避免并发请求造成闪烁
			if (reqSeq === expirePopupLoadSeq.value) {
				uni.hideLoading()
			}
		}
	}

	const applyExpirePopupPagination = () => {
		expirePopupTotal.value = expirePopupAllRows.value.length
		const start = (expirePopupQuery.page - 1) * expirePopupQuery.pageSize
		const end = start + expirePopupQuery.pageSize
		expirePopupRows.value = expirePopupAllRows.value.slice(start, end)
		expireSelectedRows.value = []
	}

	const openExpireShopsPopup = () => {
		expirePopupVisible.value = true
		expirePopupLoadSeq.value += 1
		expirePopupQuery.page = 1
		expirePopupAllRows.value = []
		loadExpirePopupList()
	}

	const handleExpirePopupPageChange = (val) => {
		expirePopupQuery.page = val.value
		applyExpirePopupPagination()
	}

	const handleExpirePopupPageSizeChange = (e) => {
		const index = Number(e?.detail?.value || 0)
		const size = Number(expirePageSizeOptions[index] || 10)
		expirePopupQuery.pageSize = size
		expirePopupQuery.page = 1
		applyExpirePopupPagination()
	}

	const toggleExpireSelect = (id) => {
		const idx = expireSelectedRows.value.indexOf(id)
		if (idx > -1) {
			expireSelectedRows.value.splice(idx, 1)
		} else {
			expireSelectedRows.value.push(id)
		}
	}

	const selectAllExpireRows = () => {
		expireSelectedRows.value = expirePopupRows.value.map(row => row.id)
	}

	const clearAllExpireRows = () => {
		expireSelectedRows.value = []
	}

	const formatExpireRemainDays = (shop, code) => {
		const funcInfo = shop?.func_info || shop?.extra_data?.func_enable || []
		const target = Array.isArray(funcInfo) ? funcInfo.find((f) => f?.code === code) : null
		const endTime = target?.end_time
		if (!endTime) return '-'
		const end = parseDateTimestamp(endTime)
		if (Number.isNaN(end)) return '-'
		const now = Date.now()
		const diff = end - now
		const days = diff <= 0 ? 0 : Math.ceil(diff / (24 * 60 * 60 * 1000))
		return `剩余${days}天`
	}

	const getExpireRemainDaysValue = (shop, code) => {
		const funcInfo = shop?.func_info || shop?.extra_data?.func_enable || []
		const target = Array.isArray(funcInfo) ? funcInfo.find((f) => f?.code === code) : null
		const endTime = target?.end_time
		if (!endTime) return Number.MAX_SAFE_INTEGER
		const end = parseDateTimestamp(endTime)
		if (Number.isNaN(end)) return Number.MAX_SAFE_INTEGER
		const now = Date.now()
		const diff = end - now
		return diff <= 0 ? 0 : Math.ceil(diff / (24 * 60 * 60 * 1000))
	}

	const renewSingleShop = (item) => {
		// 从“即将到期”列表单店续费时，直接按当前功能拉取对应规格并弹窗
		payParams.shoptype = queryParams.filter.shopType
		shopId.value = item.id
		currentRenewFuncCode.value = expireFuncCode.value
		isFullPopupPlan.value = false
		payParams.pricetitle = getBatchRenewPriceTitle()
		payParams.isKeyWord = true
		getPayList()
	}

	const batchRenewExpireShops = () => {
		if (!expireSelectedRows.value.length) {
			uni.showToast({ title: '请先选择店铺', icon: 'none' })
			return
		}
		openBatchRenewConfirm()
	}

	const getBatchRenewPriceTitle = () => {
		return FUNC_CODE_NAME_MAP[expireFuncCode.value] || expireFuncLabel.value
	}

	const selectBatchRenewPlan = (plan) => {
		batchRenewSelectedPriceId.value = plan?.price_id || ''
	}

	const openBatchRenewConfirm = async () => {
		const selectedShopIds = [...expireSelectedRows.value]
		if (!selectedShopIds.length) return

		const shopTypeNum = normalizeStoreManageShopType(Number(queryParams.filter.shopType) || 1)
		const priceTitle = getBatchRenewPriceTitle()

		uni.showLoading({ title: '加载规格中...', mask: true })
		let planList = []
		let channels = []
		try {
			const quotes = await getRenewQuoteList(shopTypeNum, priceTitle, true)
			planList = quotes.map(mapPayQuoteToSpecRow)
			channels = await getRenewChannels()
		} catch (err) {
			planList = []
			channels = []
		} finally {
			uni.hideLoading()
		}

		if (!planList.length) {
			uni.showToast({ title: '未获取到可用续费规格', icon: 'none' })
			return
		}
		if (!channels.length) {
			uni.showToast({ title: '未获取到支付方式', icon: 'none' })
			return
		}

		batchRenewPlanList.value = planList
		batchRenewShopIds.value = selectedShopIds
		batchRenewSelectedPriceId.value = planList[0]?.price_id || ''
		batchRenewChannels.value = channels
		batchRenewChannelId.value = channels[0]?.channel_id || ''
		batchRenewConfirmVisible.value = true
	}

	const executeBatchRenew = async () => {
		if (!batchRenewSelectedPriceId.value) {
			uni.showToast({ title: '请先选择续费规格', icon: 'none' })
			return
		}
		if (!batchRenewChannelId.value) {
			uni.showToast({ title: '请选择支付方式', icon: 'none' })
			return
		}
		const selectedShopIds = [...batchRenewShopIds.value]
		if (!selectedShopIds.length) {
			uni.showToast({ title: '未找到待续费店铺', icon: 'none' })
			return
		}
		const channel = batchRenewChannels.value.find((c) => c.channel_id === batchRenewChannelId.value)
		const selectedPlan = batchRenewSelectedPlan.value
		const addDays = Number(selectedPlan?.add_time || 0)

		uni.showLoading({ title: '创建订单中...', mask: true })
		try {
			const result = await createBatchPayOrder({
				shop_ids: selectedShopIds,
				function_price_id: batchRenewSelectedPriceId.value,
				channel_id: batchRenewChannelId.value
			})
			const payLinkRaw = !channel?.is_balance ? result.pay_link : ''
			const opened = hasPayLink(payLinkRaw)
			if (opened) {
				openExternalPayLink(String(payLinkRaw))
			}
			uni.hideLoading()
			await finishOrderAfterCreate(result.order_no, opened, {
				queryStatus: queryPayOrderStatus,
				onPaid: async () => {
					batchRenewConfirmVisible.value = false
					expireSelectedRows.value = []
					batchRenewShopIds.value = []
					await Promise.all([loadExpirePopupList(), refreshQuickFilterCounts()])
					uni.showModal({
						title: '续费成功',
						content: `功能：${expireFuncLabel.value}\n续费时长：${addDays}天\n支付已完成，所选店铺续费已生效。`,
						showCancel: false,
						confirmText: '知道了'
					})
				},
				onClosed: () => {
					uni.showToast({ title: '订单已关闭', icon: 'none' })
				},
				onFailed: (msg) => {
					uni.showToast({ title: msg, icon: 'none' })
				},
				onPending: (msg) => {
					uni.showToast({ title: msg, icon: 'none' })
				}
			})
		} catch (e) {
			const msg = e instanceof Error ? e.message : '批量续费失败'
			uni.showToast({ title: msg, icon: 'none' })
		} finally {
			uni.hideLoading()
		}
	}

	const loadAuthPopupList = async () => {
		const reqSeq = ++authPopupLoadSeq.value
		uni.showLoading({ title: '加载中...', mask: true })
		try {
			const baseFilter = buildQuickBaseFilter()
			const res = await ShopApi.getList({
				page: authPopupQuery.page,
				pageSize: authPopupQuery.pageSize,
				filter: {
					...baseFilter,
					state: 3
				}
			})
			if (reqSeq !== authPopupLoadSeq.value) return
			if (res.code === 200) {
				const rows = res.data?.rows || []
				authPopupTotal.value = Number(res.data?.total || 0)
				// 单页内按授权时间升序（越早越靠前）；跨页顺序由接口分页决定
				authPopupRows.value = [...rows].sort(
					(a, b) => getAuthTimeSortValue(a?.ck_uptime) - getAuthTimeSortValue(b?.ck_uptime)
				)
			} else {
				authPopupRows.value = []
				authPopupTotal.value = 0
			}
		} catch (e) {
			if (reqSeq === authPopupLoadSeq.value) {
				authPopupRows.value = []
				authPopupTotal.value = 0
			}
		} finally {
			if (reqSeq === authPopupLoadSeq.value) {
				uni.hideLoading()
			}
		}
	}

	const openAuthAbnormalPopup = () => {
		authPopupVisible.value = true
		authPopupLoadSeq.value += 1
		authPopupQuery.page = 1
		loadAuthPopupList()
	}

	const handleAuthPopupPageChange = (val) => {
		authPopupQuery.page = val.value
		loadAuthPopupList()
	}

	const handleAuthPopupPageSizeChange = (e) => {
		const index = Number(e?.detail?.value || 0)
		const size = Number(authPageSizeOptions[index] || 10)
		authPopupQuery.pageSize = size
		authPopupQuery.page = 1
		loadAuthPopupList()
	}

	const getAuthTimeSortValue = (ckUptime) => {
		const ts = parseDateTimestamp(ckUptime)
		return Number.isNaN(ts) ? Number.MAX_SAFE_INTEGER : ts
	}

	const formatAuthAgoDays = (ckUptime) => {
		const ts = parseDateTimestamp(ckUptime)
		if (Number.isNaN(ts)) return '-'
		const now = Date.now()
		const diff = now - ts
		const days = diff <= 0 ? 0 : Math.floor(diff / (24 * 60 * 60 * 1000))
		return `${days}天前`
	}

	const repairFromPopup = (item) => {
		authPopupVisible.value = false
		repair(item)
	}
	const onChange = (item) => {
		queryParams.filter.shopType = item.shopType
		tab.value = item.shopType
		saveStoredShopType(item.shopType)
		menuVisible.value = false // 选择后关闭菜单
		queryParams.page = 1 // 切换店铺类型时重置到第一页
		getShopList()
	}
	const time = (date) => formatDateYMD(date)
	// 计算功能到期时间显示文本
	const getExpireTimeText = (item, code) => {
		let endTime = null
		// 获取原始到期时间
		if (code === 'ZDCC') {
			endTime = item.ZDCCendTime
		} else if (code === 'IMZDHF') {
			endTime = item.IMZDHFendTime
		} else if (code === 'ZDHP') {
			endTime = item.ZDHPendTime
		} else if (code === 'KEFU') {
			endTime = item.KEFUendTime
		} else if (code === 'ZDTG') {
			endTime = item.ZDTGendTime
		} else if (code === 'PJSS') {
			endTime = item.PJSSendTime
		}
		
		if (!endTime) {
			return '已到期'
		}
		
		try {
			const endDate = parseDateSafe(endTime)
			if (!endDate) return '已到期'
			const now = new Date()
			// 设置时间为当天的 00:00:00，只比较日期
			now.setHours(0, 0, 0, 0)
			endDate.setHours(0, 0, 0, 0)
			
			const diffTime = endDate - now
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
			
			if (diffDays < 0) {
				return '已到期'
			} else if (diffDays === 0) {
				return '剩余0天'
			} else {
				return `剩余${diffDays}天`
			}
		} catch (e) {
			return '已到期'
		}
	}
	// 通用 tooltip 切换函数
	const toggleTooltip = (shop, type) => {
		if (currentTooltipShop.value === shop && currentTooltipType.value === type) {
			// 如果已经显示，则关闭
			currentTooltipShop.value = null
			currentTooltipType.value = ''
		} else {
			currentTooltipShop.value = shop
			currentTooltipType.value = type
		}
	}
	
	// 显示授权异常帮助提示（气泡）
	const showAuthTooltip = (_, shop) => {
		toggleTooltip(shop, 'auth')
	}
	
	// 关闭tooltip（滚动时）
	const closeTooltip = () => {
		currentTooltipShop.value = null
		currentTooltipType.value = ''
	}
	
	// 处理滚动事件（同时处理原有逻辑和关闭tooltip）
	const handleScroll = (e) => {
		scroll(e)
		closeTooltip()
	}
	
	// 格式化授权时间
	const formatAuthTime = (date) => {
		if (!date) {
			return '暂无'
		}
		try {
			const dateObj = parseDateSafe(date)
			if (!dateObj) {
				return '暂无'
			}
			const y = dateObj.getFullYear();
			const m = String(dateObj.getMonth() + 1).padStart(2, '0');
			const d = String(dateObj.getDate()).padStart(2, '0');
			const h = String(dateObj.getHours()).padStart(2, '0');
			const min = String(dateObj.getMinutes()).padStart(2, '0');
			return `${y}-${m}-${d} ${h}:${min}`;
		} catch (e) {
			return '暂无'
		}
	}
	// 复制门店ID
	const copyShopId = (officeId) => {
		uni.setClipboardData({
			data: String(officeId),
			success: () => {
				uni.showToast({
					title: '门店ID已复制',
					icon: 'success',
					duration: 1500
				})
			},
			fail: () => {
				uni.showToast({
					title: '复制失败',
					icon: 'none',
					duration: 1500
				})
			}
		})
	}
	
	// 复制店铺ID（新方法，与聚合客服保持一致）
	const handleCopyShopId = (shop) => {
		const shopId = shop.office_id || shop.id || ''
		if (shopId) {
			uni.setClipboardData({
				data: String(shopId),
				success: () => {
					uni.showToast({
						title: '复制成功',
						icon: 'success'
					})
				}
			})
		}
	}
	
	// 获取显示状态（如果掉线则显示为暂停营业）
	const getDisplayState = (shop) => {
		if (shop.state === 3) {
			return 5 // 掉线状态显示为暂停营业
		}
		return shop.state
	}
	
	// 获取显示授权状态（如果掉线则显示为授权异常）
	const getDisplayAuthStatus = (shop) => {
		if (shop.state === 3) {
			return false // 掉线状态显示为授权异常
		}
		// 如果 ck_online 为 undefined 或 null，默认为 true（授权正常）
		// 只有当 ck_online 明确为 false 时才显示授权异常
		return shop.ck_online !== false
	}
	
	// 获取店铺状态文本
	const getShopStateText = (state) => {
		const stateMap = {
			0: '未知',
			1: '未登陆',
			2: '已登陆',
			3: '已掉线',
			4: '营业中',
			5: '暂停营业',
			6: '上线中',
			7: '已下线'
		}
		return stateMap[state] || '未知'
	}
	
	// 获取店铺状态样式类
	const getShopStateClass = (state) => {
		if (state === 4) return 'state-open'
		// 仅在明确下线状态时展示红色，避免因为授权异常导致营业状态小圆点变红
		if (state === 7) return 'state-offline'
		return 'state-normal'
	}
	
	// 显示城市全名（只有超出长度时才弹窗）
	const handleShowCityFullName = (shop, event) => {
		if (!shop.city || shop.city === '-') {
			return
		}
		
		// 使用 uni.createSelectorQuery 获取文本元素的宽度，判断是否被截断
		nextTick(() => {
			const query = uni.createSelectorQuery()
			query.select(`#city-text-${shop.id}`).boundingClientRect((data) => {
				if (data) {
					// 获取文本元素的实际宽度
					const containerWidth = data.width
					
					// 由于 uni-app 的限制，无法直接获取 scrollWidth
					// 我们使用一个估算方法：根据文本长度和字体大小估算文本宽度
					// 字体大小约为 24rpx，需要转换为 px
					const fontSize = 12 // 24rpx ≈ 12px (假设 1rpx = 0.5px)
					const estimatedTextWidth = shop.city.length * fontSize * 0.6 // 中文字符宽度约为字体大小的0.6倍
					
					// 如果估算的文本宽度超过容器宽度的95%，则认为文本被截断
					if (estimatedTextWidth > containerWidth * 0.95) {
						uni.showModal({
							title: '城市名称',
							content: shop.city,
							showCancel: false,
							confirmText: '确定'
						})
					}
				}
			}).exec()
		})
	}
	
	const copyMsg = (item) => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		ShopApi.getShopBindCode(item.id).then(res => {
			if (res.code === 200 || res.Code === 200 || res.Success) {
				let code = res.data || res.Data
				copyobj = {
					office_id: item.office_id,
					shop_type: item.shop_type,
					name: item.name,
					shop_id: item.id,
					ZDCCtime: item.ZDCCtime,
					IMZDHFtime: item.IMZDHFtime,
					ZDHPtime: item.ZDHPtime,
					KEFUtime: item.KEFUtime,
					ZDTGtime: item.ZDTGtime,
					CPDTtimetext: item.CPDTtimetext || '已到期',
					code
				}
				copyState.value = true
			}
		}).catch(() => {
			// 错误已由请求拦截器统一弹窗处理，此处静默捕获防止 unhandled rejection
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight;
				platform.value = res.platform || '';
			}
		});
	}
	// 监听店铺类型变化，重新获取功能列表
	watch(() => queryParams.filter.shopType, (newShopType) => {
		if (newShopType) {
			getSupportedFuncList(newShopType)
		}
	}, { immediate: true })
	
	// 处理店铺功能开关变化事件
	const handleShopFunctionChanged = (data) => {
		// 找到对应的店铺并更新功能开关状态（兼容 id 和 office_id，以及字符串/数字类型）
		const shopIdStr = String(data.shopId)
		const shop = shopList.value.find(item => {
			const itemId = String(item.id || '')
			const itemOfficeId = String(item.office_id || '')
			return itemId === shopIdStr || itemOfficeId === shopIdStr || item.id === data.shopId || item.office_id === data.shopId
		})
		if (shop) {
			// 根据功能代码更新对应的开关状态
			if (data.code === 'ZDCC') {
				shop.ZDCC = data.enable
			} else if (data.code === 'IMZDHF') {
				shop.IMZDHF = data.enable
			} else if (data.code === 'ZDHP') {
				shop.ZDHP = data.enable
			} else if (data.code === 'KEFU') {
				shop.KEFU = data.enable
			} else if (data.code === 'ZDTG') {
				shop.ZDTG = data.enable
			}
			
			// 同时更新 shop 的 func_enable 数据，确保 toManage 函数能获取到最新状态
			// v1接口使用func_info，v2接口使用extra_data.func_enable
			let funcInfo = shop.func_info || (shop.extra_data && shop.extra_data.func_enable) || []
			// 如果 funcInfo 不存在，创建一个数组
			if (!Array.isArray(funcInfo)) {
				funcInfo = []
			}
			// 查找并更新对应的功能状态
			const funcItem = funcInfo.find(f => f.code === data.code)
			if (funcItem) {
				funcItem.enable = data.enable
			} else {
				// 如果不存在，添加新的功能项
				funcInfo.push({
					code: data.code,
					enable: data.enable,
					end_time: ''
				})
			}
			// 更新到 shop 对象中
			if (shop.func_info) {
				shop.func_info = funcInfo
			} else {
				if (!shop.extra_data) {
					shop.extra_data = {}
				}
				shop.extra_data.func_enable = funcInfo
			}
		}
	}
	
	onShow(() => {
		if (consumeStoreManageNeedRefresh()) {
			getShopList()
		}
		// 从子页面返回时关闭可能残留的续费弹层，避免误触发规格加载
		authGoodsVisible.value = false
		currentRenewFuncCode.value = ''
		isIMKefuRenew.value = false

		// 恢复滚动位置
		const savedScrollTop = uni.getStorageSync('storeManage_scrollTop')
		if (savedScrollTop !== undefined && savedScrollTop !== null && savedScrollTop > 0) {
			// 清除保存的滚动位置
			uni.removeStorageSync('storeManage_scrollTop')
			// 先重置 scrollTop 以确保值发生变化
			scrollTop.value = 0
			scrollTopOld.scrollTop = savedScrollTop
			// 使用 nextTick 确保 DOM 更新后再设置滚动位置
			nextTick(() => {
				// 设置滚动位置，scroll-view 需要值变化才会滚动
				// 先设置为一个不同的值，然后再设置为目标值，确保触发滚动
				scrollTop.value = savedScrollTop + 0.1
				setTimeout(() => {
					scrollTop.value = savedScrollTop
				}, 10)
			})
		}
		
		// 不自动刷新列表，保持滚动位置不变
		// 只有在需要时才手动刷新（如添加店铺、删除店铺等操作后）
		// getShopList()
		// 不需要在 onShow 中调用 getUserInfo，因为数量会在 getShopList 中更新
	})
	
	let pageReady = false
	let filterMetaLoaded = false
	const ensureFilterMeta = () => {
		if (filterMetaLoaded) return
		filterMetaLoaded = true
		getprovincewithcitys()
		getGroupList()
	}
	const bootstrapPage = (options = {}) => {
		if (pageReady) return
		pageReady = true
		uni.$on('shopFunctionChanged', handleShopFunctionChanged)
		getSysteminfo()
		if (options && options.shopType) {
			const st = normalizeStoreManageShopType(options.shopType)
			queryParams.filter.shopType = st
			tab.value = st
			saveStoredShopType(st)
		}
		getSupportedFuncList(queryParams.filter.shopType)
		// #ifdef MP-WEIXIN
		const shopTypeNum = Number(queryParams.filter.shopType) || 1
		const cached = readMpStoreListCache(shopTypeNum)
		if (cached) {
			shopList.value = cached.rows
			total.value = cached.total
			const currentPlatform = props.value.list.find(item => item.shopType === shopTypeNum)
			if (currentPlatform) {
				currentPlatform.count = cached.total
			}
			getShopList(null, { silent: true, deferQuickCounts: true })
		} else {
			getShopList(null, { deferQuickCounts: true })
		}
		getUserInfo()
		// #endif
		// #ifndef MP-WEIXIN
		getShopList()
		getprovincewithcitys()
		getGroupList()
		getUserInfo()
		// #endif
	}

	onLoad((options) => {
		// #ifdef MP-WEIXIN
		if ((options?.mpTab === '1' || options?.mpTab === 'true') && !componentProps.embeddedTab) {
			redirectToMpShellTab('manage')
			return
		}
		mpTabMode.value = options?.mpTab === '1' || options?.mpTab === 'true'
		// #endif
		bootstrapPage(options)
	})

	onMounted(() => {
		if (componentProps.embeddedTab) {
			bootstrapPage({})
		} else if (!mpTabMode.value) {
			getUserInfo()
		}
	})
	
	// 页面卸载时移除事件监听
	onUnload(() => {
		uni.$off('shopFunctionChanged', handleShopFunctionChanged)
	})
</script>

<style scoped lang="scss">
	.active {
		&>span {
			font-weight: 500;
			font-size: 32rpx;
			color: #333;
			position: relative;

			&::after {
				display: block;
				content: '';
				position: absolute;
				bottom: 0;
				height: 8rpx;
				border-radius: 4rpx;
				background-color: #333;
				width: 50%;
				left: 50%;
				transform: translateX(-50%);
			}
		}
	}

	.store {
		background: transparent;
		display: flex;
		flex-direction: column;
		align-items: center;
		position: relative;
		background-color: transparent;
		height: 100%;
		min-height: 100%;
		padding-bottom: 0;
		margin-bottom: 0;
		overflow: hidden;

	&.store--tab {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		min-height: 0;
	}

		.store_flex {
			display: flex;
			flex-direction: row;
			flex-wrap: nowrap;
			/* iOS Safari flex 兼容性修复 */
			-webkit-box-orient: horizontal;
			-webkit-box-direction: normal;
			-webkit-flex-direction: row;
			-webkit-box-lines: single;
			-webkit-flex-wrap: nowrap;
		}

		.top_img {
			position: absolute;
			top: 0rpx;
			left: 0rpx;
		}

	.header-fixed-container {
		position: fixed;
		overflow: visible;
		z-index: 12;
		background-color: inherit;
		height: calc(10px + 7.15625rem + 50rpx);
		min-height: calc(10px + 7.15625rem + 50rpx);
		}
		
	/* 确保 header 内容区域有足够的背景遮挡 */
	.header-fixed-container > view {
		position: relative;
		z-index: 13;
		background-color: transparent;
		}
		
	/* 底部遮罩层：防止店铺卡片溢出到 header 区域 */
	.header-bottom-mask {
		position: absolute;
		left: 0;
		bottom: 0;
		width: 100%;
		height: 50rpx;
		z-index: 11;
		pointer-events: none;
		transform: translateZ(0);
		-webkit-transform: translateZ(0);
		}

	.store_head {
		width: 100%;
		position: relative;
		// margin-top: 32rpx;
		
		.store_head_row {
			display: flex;
			align-items: flex-start;
			padding: 0 30rpx;
			padding-top: 0;
			padding-bottom: 5rpx;
			gap: 20rpx;
			width: 100%;
			box-sizing: border-box;
			flex-wrap: nowrap;
		}
		
		.hamburger_section {
			display: flex;
			flex-direction: column;
			flex-shrink: 0;
			gap: 8rpx;
			min-width: 0;
			flex: 1;
		}
		
		.shop_buttons_row {
			display: flex;
			flex-direction: row;
			align-items: stretch;
			width: calc(100% - 60rpx);
			margin: 0 30rpx;
			/* 与 shop_status_filter_row 一致：相邻按钮间距 = 两卡之间的 12rpx */
			gap: 12rpx;
			flex-wrap: nowrap;
			box-sizing: border-box;
			transform: translateY(-8rpx);
		}

		.shop_buttons_row > .bind_shop_btn {
			flex: 1 1 0;
			min-width: 0;
		}

		.shop_status_filter_row {
			display: flex;
			gap: 12rpx;
			width: calc(100% - 60rpx);
			margin: 6rpx 30rpx 0;
			flex-wrap: nowrap;
		}

		.status-filter-card {
			flex: 1 1 0;
			width: calc((100% - 12rpx) / 2);
			min-width: 0;
			border-radius: 12rpx;
			padding: 8rpx 10rpx;
			background: #fff;
			border: 1px solid #f0f0f0;
			box-sizing: border-box;
		}

		.expire-card {
			background: linear-gradient(135deg, rgba(255, 190, 1, 0.18) 0%, rgba(255, 190, 1, 0.08) 100%);
		}

		.expire-card .status-line {
			flex-wrap: nowrap;
			min-height: 40rpx;
			gap: 0;
		}

		.expire-card picker {
			display: block;
			flex: 0 1 44%;
			min-width: 0;
		}

		.expire-func-picker-trigger {
			display: flex;
			align-items: center;
			flex: 1 1 auto;
			min-width: 0;
			max-width: 100%;
			padding: 0;
			margin: 0;
			border-radius: 0;
			background: transparent;
			border: 0;
			overflow: hidden;
		}

		.expire-soon-tap {
			flex: 1 1 auto;
			min-width: 0;
			display: flex;
			align-items: center;
			justify-content: flex-end;
			white-space: nowrap;
			overflow: hidden;
			padding-left: 6rpx;
		}

		.expire-soon-tap text {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.auth-card {
			background: linear-gradient(135deg, rgba(248, 28, 58, 0.15) 0%, rgba(248, 28, 58, 0.08) 100%);
		}

		.status-line {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 6rpx;
			width: 100%;
		}

		.status-left {
			font-size: 20rpx;
			color: #8a4b00;
			font-weight: 600;
			white-space: nowrap;
			flex-shrink: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			max-width: 100%;
		}

		.status-right {
			font-size: 20rpx;
			color: #666;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.status-filter-arrow {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: auto;
			height: auto;
			font-size: 26rpx;
			color: #fff;
			background: transparent;
			border-radius: 0;
			margin-left: 2rpx;
			line-height: 1;
			vertical-align: middle;
			box-shadow: none;
			color: #8a4b00;
		}

		.expire-card .expire-soon-tap {
			justify-content: flex-start;
			padding-left: 2rpx;
			padding-right: 0;
		}

		.expire-card .expire-soon-text {
			display: inline-flex;
			align-items: baseline;
			white-space: nowrap;
			overflow: visible;
		}

		.count-text {
			font-size: 28rpx;
			font-weight: 700;
			color: #f59e0b;
			margin: 0 2rpx;
			flex-shrink: 0;
		}

		.count-text.danger {
			color: #ef4444;
		}

		.status-filter-arrow {
			white-space: nowrap;
		}

		.auth-card-half {
			flex: 0 0 calc((100% - 12rpx) / 2);
			width: calc((100% - 12rpx) / 2);
			margin-left: auto;
		}
		
		.bind_shop_btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex: 1 1 0;
			min-width: 0;
			padding-top: 10rpx;
			padding-bottom: 10rpx;
			padding-left: 8rpx;
			padding-right: 8rpx;
			margin-right: 0;
			background-color: #fff;
			border-radius: 10rpx;
			box-sizing: border-box;
			flex-shrink: 1;
			
			.text_choose_1 {
				color: #FFBE01;
			}
			
			.text_choose_2 {
				color: #22CC00;
			}
			
			.text_choose_3 {
				color: #F81C3A;
			}
			
			.text_choose_4 {
				color: #333333;
			}
			
			.text-choose {
				font-size: 22rpx;
				display: inline-block;
				padding-left: 8rpx;
				white-space: nowrap;
				line-height: 1.2;
				text-align: center;
				flex-shrink: 1;
				overflow: hidden;
				text-overflow: ellipsis;
			}
			
			.img_icon {
				width: 25rpx;
				height: 28rpx;
				flex-shrink: 0;
			}
		}
		
		/* 添加店铺按钮 - 浅绿色渐变 */
		.shop_buttons_row > .bind_shop_btn:nth-child(1) {
			background: linear-gradient(135deg, rgba(34, 204, 0, 0.2) 0%, rgba(31, 179, 0, 0.15) 100%);
			
			.text_choose_2 {
				color: #22CC00;
			}
			
			.img_icon {
				filter: brightness(1);
				opacity: 1;
			}
		}
		
		/* 绑定门店按钮 - 浅黄色渐变 */
		.shop_buttons_row > .bind_shop_btn:nth-child(2) {
			background: linear-gradient(135deg, rgba(255, 190, 1, 0.2) 0%, rgba(255, 165, 0, 0.15) 100%);
			
			.text_choose_1 {
				color: #FF8C00;
			}
			
			.img_icon {
				filter: brightness(0.7);
				opacity: 1;
			}
		}
		
		/* 回收站按钮 - 浅红色渐变 */
		.shop_buttons_row > .bind_shop_btn:nth-child(3) {
			background: linear-gradient(135deg, rgba(248, 28, 58, 0.2) 0%, rgba(230, 0, 18, 0.15) 100%);
			
			.text_choose_3 {
				color: #F81C3A;
			}
			
			.img_icon {
				filter: brightness(1);
				opacity: 1;
			}
		}
		
		/* 筛选按钮 - 浅灰色渐变 */
		.filter_btn {
			background: linear-gradient(135deg, rgba(102, 102, 102, 0.2) 0%, rgba(51, 51, 51, 0.15) 100%);
			
			.text_choose_4 {
				color: #333333;
			}
			
			.img_icon {
				filter: brightness(1);
				opacity: 1;
			}
		}
		
		.hamburger_menu {
			display: flex;
			align-items: center;
			gap: 10rpx;
			flex-shrink: 0;
			cursor: pointer;
			height: 74rpx;
			
			.hamburger_icon {
				width: 50rpx;
				height: 50rpx;
				display: flex;
				flex-direction: column;
				justify-content: center;
				align-items: center;
				gap: 6rpx;
				
				.hamburger_line {
					width: 32rpx;
					height: 5rpx;
					background-color: #333;
					border-radius: 3rpx;
					transition: all 0.3s;
				}
				
				&.elm-hamburger {
					.hamburger_line {
						background-color: #0493F7;
					}
				}
			}
			
			.platform_logo {
				width: 50rpx;
				height: 50rpx;
				border-radius: 8rpx;
				flex-shrink: 0;
				display: block;
			}
			
			.platform_name {
			font-size: 28rpx;
				font-weight: 500;
				color: #333;
				white-space: nowrap;
				flex-shrink: 0;
			display: flex;
			align-items: center;
		}
		
		.platform_label {
			display: inline-block;
		}
		
		.platform_total {
			display: inline-block;
			/* 让数量更贴近平台名称，稍微向左收一点 */
			margin-left: -4rpx;
			}
			
			.elm-platform {
				color: #0493F7;
			}
		}
	}

	.quick-popup-wrap {
		padding: 24rpx;
	}

	.quick-popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.quick-popup-subtitle {
		font-size: 24rpx;
		color: #666;
		margin-top: 8rpx;
		margin-bottom: 16rpx;
	}

	.quick-popup-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10rpx;
		margin-bottom: 12rpx;
	}

	.quick-toolbar-left {
		display: flex;
		align-items: center;
		gap: 10rpx;
	}

	.quick-toolbar-btn {
		font-size: 22rpx;
		color: #3b82f6;
		background: #eff6ff;
		padding: 8rpx 14rpx;
		border-radius: 10rpx;
	}

	.quick-page-size-trigger {
		font-size: 22rpx;
		color: #333;
		background: #f5f7fa;
		padding: 8rpx 14rpx;
		border-radius: 10rpx;
		white-space: nowrap;
	}

	.quick-batch-btn {
		font-size: 24rpx;
		color: #fff;
		background: #3b82f6;
		padding: 10rpx 18rpx;
		border-radius: 10rpx;
	}

	.quick-batch-btn.disabled {
		opacity: 0.45;
	}

	.quick-table-scroll {
		max-height: 56vh;
	}

	.quick-table-header,
	.quick-table-row {
		display: flex;
		align-items: center;
		border-bottom: 1px solid #f0f0f0;
		min-height: 76rpx;
	}

	.quick-table-header {
		background: #fafafa;
		font-weight: 600;
	}

	.col {
		padding: 0 10rpx;
		box-sizing: border-box;
		font-size: 24rpx;
		color: #333;
	}

	.col-check { width: 8%; text-align: center; }
	.col-name { width: 40%; }
	.col-id { width: 16%; }
	.col-time { width: 20%; }
	.col-action { width: 16%; text-align: center; white-space: nowrap; }

	/* 即将到期（批量续费）弹窗：门店ID稍左、到期剩余稍右 */
	.expire-popup-main .col-id {
		padding-left: 4rpx;
		padding-right: 6rpx;
	}
	.expire-popup-main .col-time {
		padding-left: 16rpx;
		padding-right: 4rpx;
	}
	/* 数据行再做定向位移，避免只有表头生效 */
	.expire-popup-main .quick-table-row .col-id {
		padding-left: 0rpx;
		transform: translateX(-6rpx);
	}
	.expire-popup-main .quick-table-row .col-time {
		padding-left: 20rpx;
		transform: translateX(6rpx);
	}

	/* 授权异常弹窗列优化：时间标题单行，操作列右移 */
	.auth-popup-main .auth-popup-toolbar {
		justify-content: flex-end;
	}
	.auth-popup-main .quick-table-row .col-id {
		transform: translateX(-6rpx);
	}
	.auth-popup-main .col-time {
		white-space: nowrap;
		text-align: center;
		justify-content: center;
	}
	.auth-popup-main .quick-table-header .col-time,
	.auth-popup-main .quick-table-row .col-time {
		display: flex;
		align-items: center;
		justify-content: center;
		transform: translateX(18rpx);
	}
	.auth-popup-main .col-action {
		padding-left: 18rpx;
		transform: translateX(24rpx);
	}
	.auth-popup-main .quick-table-header .col-action,
	.auth-popup-main .quick-table-row .col-action {
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.quick-action-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		white-space: nowrap;
		padding: 8rpx 10rpx;
		border-radius: 10rpx;
		color: #fff;
		font-size: 20rpx;
		line-height: 1;
	}

	.quick-action-btn.renew { background: #3b82f6; }
	.quick-action-btn.repair { background: #ef4444; }

	.batch-renew-wrap {
		padding: 24rpx;
	}

	.batch-renew-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #222;
	}

	.batch-renew-desc {
		font-size: 24rpx;
		color: #666;
		margin-top: 8rpx;
	}

	.batch-renew-summary {
		background: #f8fafc;
		border-radius: 12rpx;
		padding: 16rpx;
		margin-top: 16rpx;
	}

	.summary-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 24rpx;
		color: #333;
		padding: 6rpx 0;
	}

	.summary-label {
		color: #666;
	}

	.summary-value {
		font-weight: 500;
	}

	.summary-value.highlight {
		color: #2563eb;
		font-weight: 700;
	}

	.batch-renew-plan-title {
		font-size: 24rpx;
		font-weight: 600;
		color: #333;
		margin-top: 18rpx;
		margin-bottom: 10rpx;
	}

	.batch-renew-plan-list {
		max-height: 280rpx;
	}

	.batch-renew-plan-item {
		border: 1px solid #e5e7eb;
		border-radius: 10rpx;
		padding: 14rpx;
		margin-bottom: 10rpx;
	}

	.batch-renew-plan-item.active {
		border-color: #3b82f6;
		background: #eff6ff;
	}

	.plan-name {
		display: block;
		font-size: 24rpx;
		color: #222;
		font-weight: 500;
	}

	.plan-meta {
		display: block;
		font-size: 22rpx;
		color: #666;
		margin-top: 6rpx;
	}

	.batch-renew-actions {
		display: flex;
		gap: 12rpx;
		margin-top: 14rpx;
	}

	.batch-btn {
		flex: 1;
		text-align: center;
		padding: 12rpx 0;
		border-radius: 10rpx;
		font-size: 24rpx;
	}

	.batch-btn.cancel {
		background: #f3f4f6;
		color: #333;
	}

	.batch-btn.confirm {
		background: #2563eb;
		color: #fff;
	}

	.batch-btn.confirm.disabled {
		opacity: 0.45;
	}
	
	.drawer-container {
		width: 100%;
		height: 100%;
		background-color: #fff;
		display: flex;
		flex-direction: column;
		overflow-y: auto;
		
		.drawer-title {
			padding: 40rpx 30rpx 30rpx;
			font-size: 36rpx;
			font-weight: 500;
			color: #333;
			border-bottom: 1px solid #f0f0f0;
		}
		
		.drawer-content {
			flex: 1;
			padding: 20rpx 0;
			
			.drawer-item {
				display: flex;
				align-items: center;
				justify-content: space-between;
				padding: 30rpx;
				border-bottom: 1px solid #f0f0f0;
				cursor: pointer;
				transition: background-color 0.2s;
				
				&:active {
					background-color: #f5f5f5;
				}
				
				&.active {
					background-color: #fffbf0;
					
					.drawer-item-text {
						color: #FACC05;
						font-weight: 500;
					}
				}
				
				&.elm-active {
					background-color: #f0f7ff;
					
					.drawer-item-text {
						color: #0493F7;
						font-weight: 500;
					}
				}
				
				.drawer-item-left {
					display: flex;
					align-items: center;
					gap: 20rpx;
					flex: 1;
				}
				
				.drawer-item-logo {
					width: 60rpx;
					height: 60rpx;
					border-radius: 8rpx;
				}
				
				.drawer-item-text {
					font-size: 32rpx;
					color: #333;
					display: flex;
					align-items: center;
					gap: 8rpx;
				}
				
				.drawer-item-count {
					font-size: 28rpx;
					color: #999;
					font-weight: normal;
				}
				
				.drawer-item-check {
					display: flex;
					align-items: center;
				}
			}
		}
	}

	.search {
		border: 1px solid #FACC05;
		border-radius: 50rpx;
		margin-top: 10rpx;
		position: relative;
		font-size: 24rpx;
		margin-left: 0;
		margin-right: 0;
		background-color: #fff;
		flex: 0 0 auto;
		min-width: 0;
		width: 290rpx;
		max-width: 400rpx;
		height: 50rpx;
		display: flex;
		align-items: center;
	}

		.search_icon {
			width: 28rpx;
			height: 28rpx;
			position: absolute;
			top: 50%;
			transform: translateY(-50%);
			left: 12rpx;
			z-index: 1;
		}

		.search_input {
			font-size: 20rpx;
			padding-left: 50rpx;
			padding-right: 80rpx;
			padding-top: 0;
			padding-bottom: 0;
			height: 100%;
			line-height: 50rpx;
			width: 100%;
			box-sizing: border-box;
			/* 允许完整显示占位文字 */
			overflow: visible;
			text-overflow: clip;
		}

		.search_btn {
			position: absolute;
			right: 0rpx;
			z-index: 2;
			flex-shrink: 0;

			.btn_min {
				background-color: #FACC05;
				color: #333;
				border-radius: 50rpx;
				height: 50rpx;
				line-height: 50rpx;
				font-size: 24rpx;
				padding-left: 15rpx;
				padding-right: 15rpx;
				white-space: nowrap;
			}
		}

		.elm-search {
			border: 1px solid #0493F7;

			.btn_min {
				background-color: #0493F7;
				color: #fff;
			}
		}

		.block_2 {
			position: fixed;
			width: 100%;
			box-sizing: border-box;
			padding: 0;
			padding-bottom: 0;
			padding-top: 0;
			margin-bottom: 0;
			overflow: hidden;
			will-change: transform;
			-webkit-overflow-scrolling: touch;
		z-index: 10;
		background-color: transparent;
		bottom: calc(70px + 30px + env(safe-area-inset-bottom));
		}
		
		.shop-container {
			overflow-y: scroll;
			overflow-x: hidden;
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			bottom: 0;
			z-index: 10;
			padding-bottom: 0;
			padding-top: 50rpx;
			width: 100%;
			box-sizing: border-box;
		}
		
		.shop-content-wrapper {
			overflow: hidden;
			position: relative;
			width: 100%;
			height: 100%;
		}
		

			.content_box {
			// background-color: #fff; // 改用渐变背景，通过 :style 动态设置
				border-radius: 14rpx;
				border: 1px solid;
			margin-top: 12rpx;
				width: 100%;
				box-sizing: border-box;
				padding: 24rpx;
				position: relative;
				z-index: 1;
				overflow: hidden;
			}
		
		.content_box:last-child {
			margin-bottom: 0;
			}

			.content_box:first-child,
			.content_box.first-item {
		margin-top: 16rpx; /* 首张卡片略下移，与上方区域留出一点空隙 */
		}

		/* 安卓平台调整第一个卡片的顶部间距，使其与iOS保持一致 */
		.content_box.android-first-item {
			margin-top: 16rpx;
			}

			.store_choose {
				align-items: center;
				margin-top: 10rpx;
				margin-bottom: 0;
				padding-bottom: 0;
				position: relative;
				z-index: 12;
			}

			.flex_width {
				width: 176rpx;
				padding-top: 13rpx;
				padding-bottom: 13rpx;
				background-color: #fff;
				border-radius: 10rpx;
				margin-right: 14rpx;
				display: flex;
				align-items: center;
				justify-content: center;

				.text_choose_1 {
					color: #FFBE01;
				}

				.text_choose_2 {
					color: #22CC00;
				}

				.text_choose_3 {
					color: #F81C3A;
				}

				.text-choose {
					font-size: 28rpx;
					display: inline-block;
					padding-left: 10rpx;
				}

				.img_icon {
					width: 6px;
					height: 6px;
				}
			}

			.fail_item {
				position: absolute;
				top: 12rpx;
				right: 10rpx;

				.text-choose_4 {
					color: #333333;
					font-size: 28rpx;
					display: inline-block;
					padding-left: 10rpx;
				}

				.img_arrow {
					width: 16rpx;
					height: 10rpx;
					padding-left: 8rpx;
				}

				.shaix_img {
					width: 25rpx;
					height: 29rpx;
					vertical-align: middle;
				}
			}
		}

		.pingfen {
			display: flex;
			align-items: center;
		}
		
		// 店铺卡片头部样式（与聚合客服保持一致）
		.shop-card-header {
			display: flex;
			align-items: flex-start;
			margin-bottom: 8rpx;
		}
		
		.shop-avatar-wrapper {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-right: 16rpx;
		}
		
		.shop-avatar {
			width: 100rpx;
			height: 100rpx;
			max-width: 100rpx;
			max-height: 100rpx;
			border-radius: 8rpx;
			background: #f5f5f5;
			object-fit: cover;
			margin-bottom: 8rpx;
			flex-shrink: 0;
		}
		
		.copy-info-btn {
			font-size: 22rpx;
			color: #333;
			width: 100rpx;
			max-width: 100rpx;
			text-align: center;
			background-color: #FFBE01;
			border-radius: 12rpx;
			padding: 4rpx 2rpx;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
			box-sizing: border-box;
			flex-shrink: 0;
		}
		
		.copy-info-text {
			font-size: 22rpx;
			color: #333;
		}
		
		.shop-info {
			flex: 1;
			display: flex;
			flex-direction: column;
		}
		
		.shop-name-row {
			display: flex;
			align-items: center;
			margin-bottom: 6rpx;
		}
		
		.shop-name {
			font-size: 32rpx;
			font-weight: 600;
			color: #333;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
			flex: 1;
		}
		
		.shop-status-row {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			margin-bottom: 4rpx;
			margin-left: 0;
		}
		
		.status-left-group {
			display: flex;
			align-items: center;
		}
		
		.status-right-group {
			display: flex;
			align-items: center;
			margin-left: 24rpx;
			flex: 1;
			min-width: 0;
		}
		
		.shop-auth-row {
			display: flex;
			align-items: center;
			justify-content: flex-start;
			margin-top: 4rpx;
			margin-left: 0;
		}
		
		.auth-left-group {
			display: flex;
			align-items: center;
		}
		
		.auth-right-group {
			display: flex;
			align-items: center;
			margin-left: 24rpx;
		}
		
		/* 授权异常时，文案变为红色 */
		.status-auth-text.unauthorized {
			color: #FF4D4F;
		}
		
		.status-dot {
			width: 12rpx;
			height: 12rpx;
			border-radius: 50%;
			margin-right: 6rpx;
			flex-shrink: 0;
		}
		
		.status-open {
			background-color: #FFBE01;
		}
		
		.status-normal {
			background-color: #FFBE01;
		}
		
		.status-offline {
			background-color: #FF4D4F;
		}
		
		.status-auth {
			background-color: #22CC00;
		}
		
		.status-auth-off {
			background-color: #FF4D4F;
		}
		
		.status-text {
			font-size: 24rpx;
			color: #666;
		}
		
		.status-business {
			color: #FFBE01;
		}
		
		.status-auth-text {
			color: #22CC00;
		}
		
		.status-separator {
			margin: 0 8rpx;
			font-size: 24rpx;
			color: #999;
		}
		
		.auth-time-inline {
			font-size: 24rpx;
			color: #999;
		}
		
		.meta-text {
			font-size: 24rpx;
			color: #999;
		}
		
		.meta-separator {
			margin: 0 8rpx;
			color: #ccc;
		}
		
		.meta-id-wrapper {
			display: flex;
			align-items: center;
			cursor: pointer;
		}
		
		.meta-copy-icon {
			width: 28rpx;
			height: 28rpx;
			max-width: 28rpx;
			max-height: 28rpx;
			margin-left: 6rpx;
			opacity: 0.6;
			flex-shrink: 0;
		}
		
		.meta-city-wrapper {
			display: flex;
			align-items: center;
			cursor: pointer;
			flex: 1;
			min-width: 0;
			margin-left: 8rpx;
		}
		
		.city-text {
			flex: 1;
			min-width: 0;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
		
		.meta-location-icon {
			width: 28rpx;
			height: 28rpx;
			max-width: 28rpx;
			max-height: 28rpx;
			margin-right: 4rpx;
			flex-shrink: 0;
		}

		.group_1 {
			width: 100%;
		}

		.image-text_3 {
			width: 100rpx;
			height: 100rpx;
			margin-right: 10rpx;
			border-radius: 14rpx;
			overflow: hidden;
		}

		.image_1 {
			width: 100rpx;
			height: 100rpx;
		}

		.text-group_3 {
			width: 100%;
			box-sizing: border-box;
			padding-left: 10rpx;
		}

		.text_1 {
			overflow-wrap: break-word;
			color: rgba(51, 51, 51, 1);
			font-size: 30rpx;
			letter-spacing: 0.8823529481887817px;
			font-family: PingFangSC-Medium;
			font-weight: 500;
			white-space: nowrap;
			line-height: 42rpx;
			width: 100%;
			white-space: nowrap;
			/* 不换行 */
			overflow: hidden;
			/* 隐藏溢出的内容 */
			text-overflow: ellipsis;
			/* 显示省略号 */
		}

		.text_2 {
			color: rgba(255, 190, 1, 1);
			font-size: 24rpx;
			letter-spacing: 0.7rpx;
			font-weight: normal;
			text-align: right;
			white-space: nowrap;
			line-height: 33rpx;
			margin-left: 8rpx;
		}

		.label_4 {
			width: 24rpx;
			height: 24rpx;
			vertical-align: middle;
		}

		.group_2 {
			border-radius: 16rpx;
			position: relative;
			color: #FFBE01;
			margin-right: 0;
			display: flex;
			align-items: flex-start;
			margin-top: -4rpx;
			margin-bottom: 0;

			.section_1 {
				margin-right: 6rpx;
				flex-shrink: 0;
				margin-top: 6rpx;
			}
		}

		.image-text_4 {
			display: flex;
			align-items: flex-start;
			flex-direction: row;
			font-size: 24rpx;
			height: 56rpx;
		}

		.section_1 {
			background-color: #FFBE01;
			border-radius: 50%;
			width: 12rpx;
			height: 12rpx;
		}

		.auth-status-wrapper {
			display: flex;
			flex-direction: row;
			align-items: flex-start;
			margin-top: 8rpx;
			margin-left: 0;
		}

		.section_3 {
			background-color: #22CC00;
			border-radius: 50%;
			width: 12rpx;
			height: 12rpx;
			margin-right: 6rpx;
			flex-shrink: 0;
			margin-top: 6rpx;
		}

		.text-group_4 {
			overflow-wrap: break-word;
			color: #FFBE01;
			font-size: 24rpx;
			letter-spacing: 0.7058823704719543px;
			font-weight: normal;
			text-align: right;
			white-space: nowrap;
			line-height: 24rpx;
			height: 24rpx;
			display: flex;
			align-items: center;
		}

		.image-text_5 {
			position: absolute;
			left: 6rpx;
			top: 1px;
			width: 100rpx;
			height: 33rpx;
		}


		.text-wrapper_1 {
			font-size: 0;
			letter-spacing: 0.7rpx;
			font-weight: normal;
			display: flex;
			align-items: center;
			margin-top: 10rpx;
	}

	.page {
		background-color: transparent;
		position: relative;
		overflow: hidden;
		padding-left: 0;
		padding-right: 0;
		padding-bottom: 0;
	}

	.block_1 {
		padding: 59px 32px 32px 24px;
	}



	.image-text_1 {
		background-color: rgba(255, 255, 255, 1);
		border-radius: 14px;
		position: relative;
		width: 176px;
		height: 67px;
		margin-right: 14px;
		padding: 14px 12px 13px 48px;
	}

	.label_1 {
		position: absolute;
		left: 12px;
		top: 19px;
		width: 30px;
		height: 30px;
	}

	.label_2 {
		position: absolute;
		left: 14px;
		top: 19px;
		width: 30px;
		height: 30px;
	}

	.text-group_1 {
		width: 116px;
		overflow-wrap: break-word;
		font-size: 28px;
		letter-spacing: 0.8235294222831726px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 40px;
	}

	.label_3 {
		width: 25px;
		height: 29px;
		margin: 20px 0 18px 51px;
	}

	.image-text_2 {
		margin: 14rpx 0 13rpx 4rpx;
	}

	.text-group_2 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 28px;
		letter-spacing: 0.8235294222831726px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 40px;
	}

	.thumbnail_1 {
		width: 16px;
		height: 10px;
		margin: 17px 0 13px 0;
	}


	.group_3 {
		.shop-id-wrapper {
			display: inline-flex;
			align-items: center;
			gap: 8rpx;
			cursor: pointer;
			padding: 4rpx 8rpx;
			border-radius: 8rpx;
			transition: all 0.3s ease;
		}
		
		.shop-id-wrapper:active {
			background-color: rgba(0, 0, 0, 0.05);
		}
		
		.copy-id-icon {
			width: 28rpx;
			height: 28rpx;
			opacity: 0.6;
			transition: opacity 0.3s ease;
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
	}





	.label_5 {
		width: 23rpx;
		height: 28rpx;
		margin-right: 6rpx;
	}

	.group_4 {
		margin: 71rpx 0 13rpx 8rpx;
	}

	.auth-status-container {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
	}

	.text-wrapper_2 {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		line-height: 24rpx;
		height: 24rpx;
	}

	.auth-time-wrapper {
		display: flex;
		align-items: center;
		justify-content: flex-start;
		margin-top: 4rpx;
	}

	.auth-time-text {
		color: rgba(102, 102, 102, 1);
		font-size: 22rpx;
		letter-spacing: 0.5rpx;
		font-weight: normal;
		white-space: nowrap;
	}

	.authorization-not {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 1px 10rpx 0 10rpx;
		margin-left: 10rpx;
		background-color: rgb(254, 0, 0);
		border-radius: 6rpx;
		border: 1px solid rgb(254, 0, 0);

		text {
			color: #ffffff;
		}
	}

	.text_5 {
		color: rgba(34, 204, 0, 1);
		font-size: 24rpx;
		letter-spacing: 0.7rpx;
		font-weight: normal;
		white-space: nowrap;
	}

	.group_5 {
		position: relative;
		margin-top: 23rpx;
		padding-left: 103rpx;
	}

	.text_6 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text-wrapper_3 {
		position: absolute;
		left: 0;
		top: 0;
		width: 117rpx;
		height: 33rpx;
		overflow-wrap: break-word;
		font-size: 0;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
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

	.text_8 {
		overflow-wrap: break-word;
		color: rgba(223, 223, 223, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text_9 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.text-wrapper_4 {
		background-color: rgba(248, 28, 58, 1);
		border-radius: 0px 14rpx 0px 14rpx;
		margin-left: 65rpx;
		padding: 4rpx 5rpx 3rpx 6rpx;
	}

	.text_10 {
		overflow-wrap: break-word;
		color: rgba(255, 255, 255, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.group_7 {
		background-color: rgba(255, 255, 255, 1);
		border-radius: 8rpx;
		border: 1px solid rgba(223, 223, 223, 1);
		margin: 74rpx 24rpx 0 0;
		padding: 13rpx 66rpx 12rpx 15rpx;
	}

	.image-text_6 {
		width: 68rpx;
	}

	.thumbnail_2 {
		width: 16rpx;
		height: 10rpx;
		margin: 13rpx 0 10rpx 0;
	}

	.text-group_5 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.block_4 {
		display: flex;
		margin-top: 12rpx;
		width: 100%;
		box-sizing: border-box;
		padding-left: 10rpx;
	}

	.text_11 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
		margin-top: 14rpx;
	}

	.section_2 {
		position: relative;
		background-color: rgba(245, 245, 245, 1);
		border-radius: 8rpx;
		width: 100%;
		padding: 6rpx 5rpx 6rpx 20rpx;

		.beiz_input {
			font-size: 24rpx;
			background-color: transparent;
		}
	}

	.text_12 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
		margin-top: 9rpx;
	}

	.text-wrapper_5 {
		position: absolute;
		right: 4rpx;
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		border-radius: 6rpx;
		padding: 8rpx 33rpx 8rpx 33rpx;
		top: 50%;
		transform: translateY(-50%);
	}

	.text_13 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.block_5 {
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPngba3a4d8d44002583da9ad19b73850c9206878781c4b0e6cabe9f2de4d417d477) 100% no-repeat;
		background-size: 100% 100%;
		margin-top: 16rpx;
		padding: 8rpx 0;
		/* iOS 布局修复：确保 flex 布局正确显示 */
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
		/* iOS Safari flex 兼容性修复 */
		-webkit-box-orient: horizontal;
		-webkit-box-direction: normal;
		-webkit-flex-direction: row;
		-webkit-box-align: center;
		-webkit-align-items: center;
		-webkit-box-pack: justify;
		-webkit-justify-content: space-between;

		uni-image>img {
			vertical-align: middle;
			top: 5rpx;
		}
	}

	.image-text_7 {
		width: 110rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		flex: 0 0 110rpx;
		min-width: 110rpx;
		max-width: 110rpx;
		/* iOS 布局修复：确保 flex 子元素正确显示 */
		flex-shrink: 0;
		flex-grow: 0;
		flex-basis: 110rpx;
		/* iOS Safari flex 兼容性修复 */
		-webkit-box-flex: 0;
		-webkit-flex: 0 0 110rpx;
		-webkit-box-align: center;
		-webkit-align-items: center;
		-webkit-box-pack: justify;
		-webkit-justify-content: space-between;
	}
	
	.image-text_7-with-expire {
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
	}
	
	.func-row {
		width: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-start;
	}
	
	.text-disabled {
		color: #ccc !important;
		opacity: 0.6;
	}

	.expire-time-text {
		font-size: 20rpx;
		color: #999999;
		margin-top: 4rpx;
		text-align: center;
		width: 100%;
	}
	
	.text-group_6 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: 500;
		text-align: center;
		white-space: nowrap;
		line-height: 33rpx;
		margin-right: 0;
		margin-bottom: 4rpx;
	}

	.thumbnail_3 {
		width: 18rpx;
		height: 18rpx;

	}

	.image-text_8 {
		width: 125rpx;
	}

	.text-group_7 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.thumbnail_4 {
		width: 18rpx;
		height: 18rpx;

	}

	.image-text_9 {
		width: 125rpx;
	}

	.text-group_8 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.thumbnail_5 {
		width: 18rpx;
		height: 18rpx;

	}

	.image-text_10 {
		width: 125rpx;
	}

	.text-group_9 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.thumbnail_6 {
		width: 18rpx;
		height: 18rpx;

	}

	.block_6 {
		margin-top: 10rpx;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.group_8 {
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng18092ff1add7ba77313fed3c1ae2faedc83a1d0904a02735db744d28bd465cc6) 100% no-repeat;
		background-size: 100% 100%;
		margin: 3rpx 0 3rpx 0;
		padding: 11rpx 14rpx 10rpx 13rpx;
		width: 158rpx;
	}

	.image-text_11 {
		width: 131rpx;
	}

	.label_6 {
		width: 28rpx;
		height: 23rpx;
		margin: 5rpx 0 5rpx 0;
	}

	.text-group_10 {
		overflow-wrap: break-word;
		color: rgba(154, 112, 80, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.group_112 {
		background: url("@/static/shop/icon_038a.png") no-repeat;
		background-size: 100% 100%;
		width: 158rpx;
		height: 50rpx;
		margin-left: 10rpx;
	}

	.not-top {
		background: url("@/static/shop/icon_031a.png") no-repeat;
		background-size: 100% 100%;
	}

	.image-text_12 {
		display: flex;
		align-items: center;
	}

	.label_7 {
		width: 23rpx;
		height: 23rpx;
		margin: 5rpx 0 5rpx 0;
	}

	.text-group_11 {
		color: rgba(248, 28, 58, 1);
		font-size: 24rpx;
		letter-spacing: 0.7rpx;
		font-weight: normal;
		margin-left: 10rpx;
	}

	.label_8 {
		width: 26rpx;
		height: 28rpx;
		margin-right: 30rpx;
	}

	.text-wrapper_6 {
		background-color: #FACC05;
		border-radius: 14rpx;
		padding: 2rpx 10rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.setting-elm {
		background-color: #0493F7;

		.text_14 {
			color: #fff;
		}
	}

	.text_14 {
		overflow-wrap: break-word;
		color: #333;
		font-size: 28rpx;
		letter-spacing: 0.8235294222831726px;
		font-family: PingFangSC-Medium;
		font-weight: 450px;
		text-align: center;
		white-space: nowrap;
		line-height: 40rpx;
	}

	.block_7 {
		background-color: rgba(255, 255, 255, 1);
		border-radius: 14rpx;
		width: 702rpx;
		border: 1px solid rgba(248, 28, 58, 1);
		align-self: center;
		margin-top: 30rpx;
		padding: 20rpx 23rpx 29rpx 23rpx;
	}

	.box_2 {
		margin-bottom: 13rpx;
	}

	.image-text_13 {
		width: 312rpx;
		margin-right: 5rpx;
		padding-right: 3rpx;
	}

	.image_2 {
		width: 90rpx;
		height: 90rpx;
		margin-top: 4rpx;
	}

	.text-group_12 {
		margin: 0 0 10rpx 20rpx;
	}

	.text_15 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 30rpx;
		letter-spacing: 0.8823529481887817px;
		font-family: PingFangSC-Medium;
		font-weight: 500;
		text-align: right;
		white-space: nowrap;
		line-height: 42rpx;
	}

	.text_16 {
		overflow-wrap: break-word;
		color: rgba(255, 190, 1, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 33rpx;
		margin: 9rpx 128rpx 0 36rpx;
	}

	.label_9 {
		width: 24rpx;
		height: 24rpx;
		margin: 55rpx 0 15rpx -196rpx;
	}

	.group_11 {
		background-color: rgba(255, 190, 1, 1);
		border-radius: 16rpx;
		position: relative;
		margin: 50rpx 0 10rpx 58rpx;
		padding: 1px 5rpx 0 6rpx;
	}

	.image-text_14 {
		width: 100rpx;
	}

	.group_12 {
		background-color: rgba(255, 255, 255, 1);
		border-radius: 50%;
		width: 22rpx;
		height: 22rpx;
		margin: 5rpx 0 6rpx 0;
	}

	.text-group_13 {
		overflow-wrap: break-word;
		color: rgba(255, 255, 255, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.image-text_15 {
		position: absolute;
		left: 6rpx;
		top: 1px;
		width: 100rpx;
		height: 33rpx;
	}

	.box_3 {
		width: 207rpx;
		margin: 13rpx 0 0 110rpx;
	}

	.text-wrapper_7 {
		width: 177rpx;
		height: 33rpx;
		overflow-wrap: break-word;
		font-size: 0;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text_17 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text_18 {
		overflow-wrap: break-word;
		color: rgba(223, 223, 223, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.label_10 {
		width: 23rpx;
		height: 28rpx;
		margin: 3rpx 0 2rpx 0;
	}

	.box_4 {
		margin: 50rpx 0 13rpx 8rpx;
	}

	.text-wrapper_8 {
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng66908fac43a933c3d7329a2211ab9a567c668923e330389b67b1a6bca49d363c) 100% no-repeat;
		background-size: 100% 100%;
		margin-right: 58rpx;
		padding: 1px 10rpx 0 11rpx;
	}

	.text_19 {
		overflow-wrap: break-word;
		color: rgba(34, 204, 0, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.box_5 {
		position: relative;
		margin-top: 23px;
		padding-left: 103px;
	}

	.text_20 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text-wrapper_9 {
		position: absolute;
		left: 0;
		top: 0;
		width: 117rpx;
		height: 33rpx;
		overflow-wrap: break-word;
		font-size: 0;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text_21 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text_22 {
		overflow-wrap: break-word;
		color: rgba(223, 223, 223, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.text_23 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24rpx;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.box_6 {
		background-color: rgba(255, 255, 255, 1);
		border-radius: 8px;
		border: 1px solid rgba(223, 223, 223, 1);
		margin-top: 93px;
		padding: 13px 66px 12px 15px;
	}

	.image-text_16 {
		width: 68px;
	}

	.thumbnail_7 {
		width: 16px;
		height: 10px;
		margin: 13px 0 10px 0;
	}

	.text-group_14 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 33px;
	}

	.group_13 {
		width: 544px;
		margin: 24px 0 0 110px;
	}

	.text_24 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
		margin-top: 14px;
	}

	.box_7 {
		background-color: rgba(245, 245, 245, 1);
		border-radius: 8px;
		width: 469px;
		padding: 5px 5px 5px 20px;
	}

	.text_25 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
		margin-top: 9px;
	}

	.text-wrapper_10 {
		background-color: rgba(255, 255, 255, 1);
		border-radius: 6px;
		padding: 9px 33px 8px 33px;
	}

	.text_26 {
		overflow-wrap: break-word;
		color: rgba(248, 28, 58, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.group_14 {
		width: 654px;
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPngba3a4d8d44002583da9ad19b73850c9206878781c4b0e6cabe9f2de4d417d477) 100% no-repeat;
		background-size: 100% 100%;
		margin-top: 30px;
		padding: 14px 22px 13px 23px;
	}

	.image-text_17 {
		width: 125px;
	}

	.text-group_15 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.thumbnail_8 {
		width: 18px;
		height: 18px;
		margin: 8px 0 7px 0;
	}

	.image-text_18 {
		width: 125px;
	}

	.text-group_16 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.thumbnail_9 {
		width: 18px;
		height: 18px;
		margin: 8px 0 7px 0;
	}

	.image-text_19 {
		width: 125px;
	}

	.text-group_17 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.thumbnail_10 {
		width: 18px;
		height: 18px;
		margin: 8px 0 7px 0;
	}

	.image-text_20 {
		width: 125px;
	}

	.text-group_18 {
		overflow-wrap: break-word;
		color: rgba(102, 102, 102, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.thumbnail_11 {
		width: 18px;
		height: 18px;
		margin: 8px 0 7px 0;
	}

	.group_15 {
		margin-top: 30px;
	}

	.group_16 {
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng18092ff1add7ba77313fed3c1ae2faedc83a1d0904a02735db744d28bd465cc6) 100% no-repeat;
		background-size: 100% 100%;
		margin: 3px 0 3px 0;
		padding: 11px 14px 10px 13px;
	}

	.image-text_21 {
		width: 131px;
	}

	.label_11 {
		width: 28px;
		height: 23px;
		margin: 5px 0 5px 0;
	}

	.text-group_19 {
		overflow-wrap: break-word;
		color: rgba(154, 112, 80, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.group_17 {
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng58f902301550778bd934438f46314728d7e5177b2cdd61852ca8b0ff0bb8f446) 100% no-repeat;
		background-size: 100% 100%;
		margin: 3px 0 3px 20px;
		padding: 11px 14px 10px 15px;
	}

	.image-text_22 {
		width: 154px;
	}

	.label_12 {
		width: 23px;
		height: 23px;
		margin: 5px 0 5px 0;
	}

	.text-group_20 {
		overflow-wrap: break-word;
		color: rgba(248, 28, 58, 1);
		font-size: 24px;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33px;
	}

	.label_13 {
		width: 26px;
		height: 28px;
		margin: 16px 0 16px 83px;
	}

	.text-wrapper_11 {
		background-color: rgba(248, 28, 58, 1);
		border-radius: 14px;
		margin-left: 40px;
		padding: 10px 14px 10px 14px;
	}

	.text_27 {
		overflow-wrap: break-word;
		color: rgba(255, 255, 255, 1);
		font-size: 28px;
		letter-spacing: 0.8235294222831726px;
		font-family: PingFangSC-Medium;
		font-weight: 500;
		text-align: left;
		white-space: nowrap;
		line-height: 40px;
	}

	.block_8 {
		box-shadow: 0px 0px 12px 0px rgba(191, 191, 191, 0.5);
		background-color: rgba(255, 255, 255, 1);
		margin-top: 125px;
		padding: 21px 21px 18px 48px;
	}

	.image-text_23 {
		margin-top: 1px;
	}

	.label_14 {
		width: 48px;
		height: 48px;
		align-self: center;
	}

	.text-group_21 {
		overflow-wrap: break-word;
		color: rgba(248, 28, 58, 1);
		font-size: 26px;
		letter-spacing: 0.7647058963775635px;
		font-family: PingFangSC-Medium;
		font-weight: 500;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
		margin-top: 15px;
	}

	.image-text_24 {
		margin: 4px 0 0 71px;
	}

	.label_15 {
		width: 48px;
		height: 45px;
		margin: 0 32px 0 28px;
	}

	.text-group_22 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 26px;
		letter-spacing: 0.7647058963775635px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
		margin-top: 15px;
	}

	.image-text_25 {
		margin: 1px 0 0 67px;
	}

	.label_16 {
		width: 44px;
		height: 48px;
		align-self: center;
	}

	.text-group_23 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 26px;
		letter-spacing: 0.7647058963775635px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
		margin-top: 15px;
	}

	.image-text_26 {
		margin-left: 96px;
	}

	.image_3 {
		width: 46px;
		height: 50px;
		align-self: center;
	}

	.text-group_24 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 26px;
		letter-spacing: 0.7647058963775635px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
		margin-top: 14px;
	}

	.image-text_27 {
		margin-left: 69px;
	}

	.image_4 {
		width: 50px;
		height: 50px;
		align-self: center;
	}

	.text-group_25 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 26px;
		letter-spacing: 0.7647058963775635px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
		margin-top: 14px;
	}

	.block_9 {
		position: absolute;
		left: 0;
		top: 0;
		width: 750px;
		height: 320px;
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPngb94803b7dfbab2f922e081578b46b8ed3dc59132de0154132bd51353dda55c35) 100% no-repeat;
		background-size: 100% 100%;
		padding-bottom: 77px;
	}

	.box_8 {
		padding: 28px 29px 28px 40px;
	}

	.text_28 {
		overflow-wrap: break-word;
		color: rgba(255, 255, 255, 1);
		font-size: 28px;
		letter-spacing: 1px;
		font-family: PingFangSC-Semibold;
		font-weight: 600;
		text-align: left;
		white-space: nowrap;
		line-height: 32px;
	}

	.label_17 {
		width: 33px;
		height: 22px;
		margin: 5px 0 5px 487px;
	}

	.label_18 {
		width: 31px;
		height: 22px;
		margin: 5px 0 5px 10px;
	}

	.label_19 {
		width: 49px;
		height: 22px;
		margin: 5px 0 5px 10px;
	}

	.box_9 {
		width: 427px;
		margin: 6px 287px 0 36px;
	}

	.image_5 {
		width: 19px;
		height: 34px;
		margin: 7px 0 7px 0;
	}

	.text_29 {
		overflow-wrap: break-word;
		color: rgba(255, 255, 255, 1);
		font-size: 34px;
		letter-spacing: 1px;
		font-family: PingFangSC-Medium;
		font-weight: 500;
		text-align: right;
		white-space: nowrap;
		line-height: 48px;
	}

	.text-wrapper_12 {
		margin: 36px 31px 0 29px;
	}

	.text_30 {
		overflow-wrap: break-word;
		color: rgba(248, 28, 58, 1);
		font-size: 32px;
		letter-spacing: 0.9411764740943909px;
		font-family: PingFangSC-Medium;
		font-weight: 500;
		text-align: right;
		white-space: nowrap;
		line-height: 45px;
	}

	.text_31 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 30px;
		letter-spacing: 0.8823529481887817px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 42px;
		margin: 2px 0 0 75px;
	}

	.text_32 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 30px;
		letter-spacing: 0.8823529481887817px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 42px;
		margin: 2px 0 0 79px;
	}

	.text_33 {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 30px;
		letter-spacing: 0.8823529481887817px;
		font-weight: normal;
		text-align: right;
		white-space: nowrap;
		line-height: 42px;
		margin: 2px 0 0 63px;
	}

	.box_10 {
		background-color: rgba(248, 28, 58, 1);
		border-radius: 4px;
		width: 52px;
		height: 8px;
		margin: 12px 628px 0 70px;
	}

	.box_11 {
		position: absolute;
		left: 30px;
		top: 269px;
		width: 690px;
		height: 80px;
		background: url(https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng68ddb5b1fb8c23710090ccb90c5090319cb72c51d8b437cc9319db4b418b0f6b) 100% no-repeat;
		background-size: 100% 100%;
		padding: 5px 5px 5px 82px;
	}

	.text_34 {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 26px;
		letter-spacing: 0.7647058963775635px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 37px;
		margin-top: 17px;
	}

	.text-wrapper_13 {
		background-color: rgba(248, 28, 58, 1);
		border-radius: 45px;
		padding: 14px 44px 14px 44px;
	}

	.text_35 {
		overflow-wrap: break-word;
		color: rgba(255, 255, 255, 1);
		font-size: 30px;
		letter-spacing: 0.8823529481887817px;
		font-family: PingFangSC-Medium;
		font-weight: 500;
		text-align: left;
		white-space: nowrap;
		line-height: 42px;
	}

	.copy-msg {
		font-size: 22rpx;
		color: #333;
		width: 100rpx;
		text-align: center;
		margin-right: 20rpx;
		height: 36rpx;
		line-height: 36rpx;
		background: #FACC05;
		border-radius: 12rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.copy-msg-elm {
		color: #fff;
		background-color: #0493F7;
	}

	.group-main {
		width: calc(100% - 110rpx);
	}

	.log-main {
		width: 100%;
		box-sizing: border-box;
		padding: 0 30rpx;
	}

	.log-title {
		font-size: 36rpx;
		text-align: center;
		margin-bottom: 30rpx;
	}

	.add-shop-options {
		margin: 30rpx 0;
	}
	
	.radio-option-item {
		padding: 20rpx 0;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.radio-option-item:last-child {
		border-bottom: none;
	}
	
	.footer {
		width: 100%;
		box-sizing: border-box;
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 40rpx;
	}
	
	.help-icon-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-left: 8rpx;
		flex-shrink: 0;
	}
	
	.help-icon {
		width: 24rpx;
		height: 24rpx;
		border-radius: 50%;
		background-color: #999;
		display: flex;
		align-items: center;
		justify-content: center;
		cursor: pointer;
	}
	
	.help-text {
		color: #fff;
		font-size: 16rpx;
		font-weight: bold;
		line-height: 1;
	}
	
	.tooltip-bubble {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 8rpx;
		padding: 12rpx 16rpx;
		background-color: rgba(0, 0, 0, 0.85);
		border-radius: 8rpx;
		z-index: 1000;
		min-width: 200rpx;
		max-width: 400rpx;
		box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.15);
	}
	
	.tooltip-bubble::after {
		content: '';
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		border: 8rpx solid transparent;
		border-bottom-color: rgba(0, 0, 0, 0.85);
	}
	
	.tooltip-text {
		color: #fff;
		font-size: 24rpx;
		line-height: 1.5;
		white-space: normal;
		word-break: break-word;
		display: block;
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
			color: #333;
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
		color: #333;
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

	.collapse {
		::v-deep .no-border {
			&::after {
				display: none;
			}
		}
	}

	.shop-list {
		overflow-y: auto;
		overflow-x: hidden;
		padding-bottom: 20rpx;
	}

	.pagination-fixed-container {
		position: fixed;
		bottom: calc(70px + env(safe-area-inset-bottom));
		left: 0;
		width: 100%;
		background-color: rgb(249, 249, 249);
		box-sizing: border-box;
		z-index: 15;
		border: none;
		padding-top: 0;
		padding-bottom: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		height: 30px;
		min-height: 30px;
		max-height: 30px;
		overflow: visible !important;
		clip: none !important;
		clip-path: none !important;
		pointer-events: none;
	}
	
	.pagination-wrapper {
		position: relative;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20rpx;
		box-sizing: border-box;
	}
	
	.pagination-first-btn {
		position: absolute;
		left: 5%;
		top: 50%;
		transform: translateY(-50%);
		z-index: 19;
		pointer-events: auto;
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		border-radius: 4rpx;
		padding: 4rpx 12rpx;
		white-space: nowrap;
		cursor: pointer;
	}
	
	.first-btn-text {
		font-size: 24rpx;
		color: #333;
	}
	
	.pagination-last-btn {
		position: absolute;
		right: 5%;
		top: 50%;
		transform: translateY(-50%);
		z-index: 19;
		pointer-events: auto;
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		border-radius: 4rpx;
		padding: 4rpx 12rpx;
		white-space: nowrap;
		cursor: pointer;
	}
	
	.last-btn-text {
		font-size: 24rpx;
		color: #333;
	}
	
	.pagination-page-input {
		position: absolute;
		left: 50%;
		top: 50%;
		transform: translate(-50%, -50%);
		display: flex;
		align-items: center;
		gap: 4rpx;
		z-index: 18;
		pointer-events: none;
	}
	
	.page-input {
		min-width: 50rpx;
		width: 50rpx;
		height: 36rpx;
		line-height: 36rpx;
		text-align: center;
		font-size: 30rpx;
		border: 1px solid #ddd;
		border-radius: 4rpx;
		background-color: #fff;
		padding: 0 8rpx;
		box-sizing: content-box;
		pointer-events: auto;
		transition: width 0.2s;
	}
	
	.page-separator {
		font-size: 30rpx;
		color: #333;
		pointer-events: none;
	}
	
	.page-total {
		font-size: 30rpx;
		color: #333;
		pointer-events: none;
	}
	
	
	/* 左翻页按钮 - 第一个 wd-button */
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type {
		position: absolute !important;
		left: 25% !important;
		top: 50% !important;
		transform: translate(-50%, -50%) !important;
		transform-origin: center center !important;
		padding: 0 !important;
		margin: 0 !important;
		margin-bottom: 0 !important;
		z-index: 17 !important;
		white-space: nowrap !important;
		overflow: visible !important;
		clip: none !important;
		clip-path: none !important;
		pointer-events: auto !important;
		
	}
	
	/* 左翻页按钮背景渐变 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type .wd-button {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%) !important;
		border: none !important;
	}
	
	/* 左翻页按钮禁用状态 - 添加边框和浅背景 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:first-of-type[disabled] .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:first-of-type[disabled] .wd-button {
		background: #f5f5f5 !important;
		border: 1px solid #e0e0e0 !important;
		opacity: 0.6 !important;
	}
	
	/* 右翻页按钮 - 最后一个 wd-button */
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type {
		position: absolute !important;
		right: 25% !important;
		left: auto !important;
		top: 50%  !important;
		transform: translate(50%, -50%) !important;
		transform-origin: center center !important;
		margin: 0 !important;
		margin-bottom: 0 !important;
		z-index: 17 !important;
		white-space: nowrap !important;
		overflow: visible !important;
		clip: none !important;
		clip-path: none !important;
		pointer-events: auto !important;
	}
	
	/* 右翻页按钮背景渐变 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type .wd-button {
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%) !important;
		border: none !important;
	}
	
	/* 右翻页按钮禁用状态 - 添加边框和浅背景 */
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content > wd-button:last-of-type[disabled] .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type.is-disabled button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type.is-disabled .wd-button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type[disabled] button,
	::v-deep .pagination-pager .wd-pager__content .wd-pager__nav:last-of-type[disabled] .wd-button {
		background: #f5f5f5 !important;
		border: 1px solid #e0e0e0 !important;
		opacity: 0.6 !important;
	}
	
	/* 页码部分居中 - 隐藏原有页码显示 */
	::v-deep .pagination-pager .wd-pager__size {
		position: absolute;
		left: 50%;
		top: 50% ;
		transform: translate(-50%, -50%);
		transform-origin: center center;
		margin: 0 !important;
		padding: 0 !important;
		font-size: 30rpx !important;
		text-align: center;
		z-index: 16 !important;
		white-space: nowrap;
		pointer-events: none !important;
		display: flex;
		align-items: center;
		gap: 4rpx;
		opacity: 0;
	}
	
	::v-deep .pagination-pager .wd-pager__current,
	::v-deep .pagination-pager .wd-pager__separator {
		margin: 0;
		padding: 0;
		font-size: 30rpx !important;
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
		font-size: 30rpx;
	}

	.isR {
		transform: rotate(180deg);
	}

	.is-top {
		position: absolute;
		top: 0rpx;
		right: 0rpx;
		width: 90rpx;
		height: 40rpx;
	}

	::v-deep .wd-navbar {
		background-color: transparent;
	}

	// .switch-item {
	// 	width: 58rpx;
	// 	height: 32rpx;
	// }
	// ::v-deep .wd-switch.is-checked .wd-switch__circle {
	// 	width: 24rpx;
	// 	height: 24rpx;
	// 	background: #FFFFFF;
	// 	border-radius: 12rpx;
	// 	left: 28rpx;
	// }
	// ::v-deep .wd-switch__circle {
	// 	width: 24rpx;
	// 	height: 24rpx;
	// 	background: #FFFFFF;
	// 	border-radius: 12rpx;
	// }
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

	:v-deep .wd-collapse-item__wrapper {
		overflow: auto;
	}

	.recycle-table {
		border: 1px solid #ccc;

		.reaycle-heder {
			border-bottom: 1px solid #ccc;
			display: flex;
			align-items: center;
			background-color: rgb(243, 243, 243);
			line-height: 80rpx;
			box-sizing: border-box;
			text-align: center;

			.header-td {
				border-right: 1px solid #ccc;
			}

			.header-td:last-child {
				border: none;
			}
		}

		.reaycle-td {
			display: flex;
			align-items: center;
			border-bottom: 1px solid #ccc;
			height: 80rpx;

			.body-td {
				box-sizing: border-box;
				padding: 0 20rpx;
				overflow: hidden;
			}

			.body-td:nth-child(2) {
				height: 80rpx;
				border-right: 1px solid #ccc;
				border-left: 1px solid #ccc;
				display: flex;
				align-items: center;
			}
		}

		.reaycle-td:last-child {
			border: none;
		}
	}
</style>
/* <style>
	.wd-collapse-item__wrapper {
		overflow: inherit !important;
	}
</style> */
