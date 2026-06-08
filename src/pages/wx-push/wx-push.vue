<template>
	<view class="store" :style="{paddingTop: systemBarHeight + 'px'}">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="微信推送-经营日报推送" :bordered="false"></wd-navbar>
		<view class="header-fixed-container" style="position: fixed;width: 100%;left: 0;z-index: 12;top: 0;overflow: visible;padding-bottom: 50rpx;height: calc(10px + 7.15625rem + 50rpx);min-height: calc(10px + 7.15625rem + 50rpx);" :style="`background: ${currentPlatformBgColor};`">
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
							<!-- 添加店铺、已激活、未激活和筛选按钮 -->
							<view class="shop_buttons_row">
								<view class="bind_shop_btn bind_shop_btn_large" @click="addShop">
									<image src="../../static/store/add_icon.png" class="img_icon"></image>
									<text class="text-choose text_choose_2">添加店铺</text>
								</view>
							<view class="bind_shop_btn bind_shop_btn_large" 
								:class="{'filter_active': copyFuncFilter === 'activated'}"
								@click="changeCopyFilter('activated')">
								<text class="status-icon status-icon-active">✓</text>
								<text class="text-choose text_choose_1">已激活</text>
							</view>
							<view class="bind_shop_btn" 
								:class="{'filter_active': copyFuncFilter === 'inactivated'}"
								@click="changeCopyFilter('inactivated')">
								<text class="status-icon status-icon-inactive">✗</text>
								<text class="text-choose text_choose_3">未激活</text>
							</view>
								<view class="bind_shop_btn filter_btn" @click="openFilter">
									<image src="../../static/store/shaix_icon.png" class="img_icon"></image>
									<text class="text-choose text_choose_4">筛选</text>
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
				</view>
			</view>
		</view>
		<view class="block_2 z10"
			style="width: 100%;box-sizing: border-box;padding: 0;z-index: 10;position: fixed;left: 0; background-color: transparent;padding-top: 0;padding-bottom: 0;overflow: hidden;" :style="`top: calc(10px + 7.15625rem + 50rpx);bottom: calc(70px + 30px + env(safe-area-inset-bottom));`">
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
					<view class="block_6 flex-row">
						<!-- <view class="group_8 flex-row">
										<view class="image-text_11 flex-row justify-between">
											<image class="label_6" referrerpolicy="no-referrer"
												src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPngaef016a33da875ea8c5b023e64bea6b326525affd3896a3978d4ff60ec445f5e" />
											<text class="text-group_10">分享店铺</text>
										</view>
									</view> -->
						<view style="display: flex;flex-direction: row;align-items: flex-start;justify-content: space-between;flex: 1;gap: 10rpx;">
							<view style="display: flex;flex-direction: column;align-items: flex-start;flex: 1;">
								<view style="display: flex;flex-direction: row;align-items: center;gap: 12rpx;margin-bottom: 8rpx;">
									<view class="copy-activate-btn" @click="toPushSettings(item)">
										<text class="copy-activate-text">推送设置</text>
									</view>
									<view v-if="item.isChatpushActivated" class="push-switch-wrapper">
										<wd-switch v-model="item.CHATPUSH" size="20px" active-color="#1677ff" @change="(value) => handlePushSwitchChange(item, value)" />
									</view>
								</view>
								<view style="display: flex;flex-direction: row;align-items: center;gap: 12rpx;">
									<view class="chatpush-expire-time" 
										:class="{'chatpush-expired': !item.isChatpushActivated, 'chatpush-expire-clickable': !item.isChatpushActivated}"
										@click="!item.isChatpushActivated && handleExpireTimeClick(item)">
										<text class="time-icon">⏱</text>
										<text class="expire-time-text">{{ item.isChatpushActivated ? item.CHATPUSHDaysText : '已到期' }}</text>
									</view>
									<view v-if="item.isChatpushActivated" class="push-switch-label-wrapper">
										<text class="push-switch-label">推送开关</text>
									</view>
								</view>
							</view>
							<view style="display: flex;flex-direction: column;align-items: flex-end;gap: 8rpx;margin-right: 60rpx;" v-if="item.isChatpushActivated">
								<view class="copy-report-btn" @click="handleCopyReport(item)">
									<text class="copy-report-text">复制日报</text>
								</view>
								<view class="push-now-btn" @click="handlePushNow(item)">
									<text class="push-now-text">立即推送</text>
								</view>
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

		<!-- 添加店铺选项弹窗 -->
		<wd-popup 
			v-model="addShopOptionsVisible" 
			position="center"
			custom-style="width: 80%;max-height: 600rpx;border-radius: 20rpx;padding: 30rpx;" 
			@close="addShopOptionsVisible = false"
			:z-index="1000"
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

		<!-- <wd-popup v-model="bindState" position="center"
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
		</wd-popup> -->

		<wd-popup v-model="copyState" position="center"
			custom-style="width: 80%;max-height: 800rpx;border-radius: 20rpx;padding: 30rpx;" @close="copyClose"
			:z-index="1001">
			<view class="log-container">
				<view class="log-title">
					复制信息
				</view>
				<view class="log-main">
					<view>平台：{{ {1:'美团外卖',2:'淘宝闪购外卖',3:'美团闪购',4:'美团医药',5:'淘宝闪购零售',6:'京东秒送',7:'抖音即时零售',8:'饿了么复制版',9:'美团团购',10:'京东团购'}[copyobj.shop_type] || '未知平台' }}</view>
					<view>店铺名称：{{ copyobj.name }}</view>
					<view>店铺ID：{{ copyobj.office_id }}</view>
					<view>门店绑定码：{{ copyobj.code }} （5分钟内有效）</view>
					<view class="footer">
						<wd-button type="info" size="large" @click="copyClose" block>取消</wd-button>
						<wd-button size="large" @click="confirmCopy" block>复制</wd-button>
					</view>
				</view>
			</view>
		</wd-popup>

	<!-- 底部关闭后台按钮和缩放按钮 - 使用 cover-view 覆盖原生 webview -->
	<!-- #ifdef APP-PLUS -->
	<cover-view v-if="showBackendWebview" class="backend-bottom-close-area">
		<!-- 放大按钮 -->
		<cover-view class="backend-zoom-btn" @tap="zoomIn">
			<cover-view class="zoom-btn-text">放大 +</cover-view>
		</cover-view>
		
		<!-- 关闭按钮 -->
		<cover-view class="backend-close-btn" @tap="closeBackendWebview">
			<cover-view class="close-btn-text">关闭后台</cover-view>
		</cover-view>
		
		<!-- 缩小按钮 -->
		<cover-view class="backend-zoom-btn" @tap="zoomOut">
			<cover-view class="zoom-btn-text">缩小 -</cover-view>
		</cover-view>
	</cover-view>
	<!-- #endif -->

		<!-- <wd-action-sheet v-model="recycleState" @close="closeRecycle" title="回收站" :z-index="600">
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
		</wd-action-sheet> -->

		<wd-action-sheet v-model="filterState" @close="closeFilter" title="筛选" :z-index="600">
			<view style="padding: 15px;">
				<view class="filter-item">
					<view class="filter-item-title" style="margin-bottom: 20rpx;">
						筛选功能状态 (微信推送)
					</view>
					<view class="func-state-buttons">
						<!-- 已激活状态：显示全部、即将到期、已开启、未开启 -->
						<template v-if="copyFuncFilter === 'activated'">
							<view class="func-state-btn" 
								:class="{'func-state-active': selectedFuncState === 0, 'func-state-elm-active': (tab==2 || tab==5) && selectedFuncState === 0}"
								@click="selectFuncState(0)">
								全部
							</view>
							<view class="func-state-btn" 
								:class="{'func-state-active': selectedFuncState === 2, 'func-state-elm-active': (tab==2 || tab==5) && selectedFuncState === 2}"
								@click="selectFuncState(2)">
								即将到期(7天内)
							</view>
							<view class="func-state-btn" 
								:class="{'func-state-active': selectedFuncState === 3, 'func-state-elm-active': (tab==2 || tab==5) && selectedFuncState === 3}"
								@click="selectFuncState(3)">
								已开启
							</view>
							<view class="func-state-btn" 
								:class="{'func-state-active': selectedFuncState === 4, 'func-state-elm-active': (tab==2 || tab==5) && selectedFuncState === 4}"
								@click="selectFuncState(4)">
								未开启
							</view>
						</template>
						<!-- 未激活状态：只显示已到期 -->
						<template v-else>
							<view class="func-state-btn" 
								:class="{'func-state-active': selectedFuncState === 5, 'func-state-elm-active': (tab==2 || tab==5) && selectedFuncState === 5}"
								@click="selectFuncState(5)">
								已到期
							</view>
						</template>
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

		<!---全功能购买-->
		<wd-action-sheet v-model="authGoodsVisible" :z-index="600" @close="handleClose">
			<SettingPopupPlanContent :is-full-popup-plan="isFullPopupPlan" :auth-goods-list="payList" :isV2="true"
				:shopId="shopId" :priceTitle="payParams.pricetitle" @close-popup="closeAuthGoodsVisibleHandler"
				:shopType="payParams.shoptype" @success="subscribe" />
		</wd-action-sheet>

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
			:z-index="1000">
			<view class="popup-box">
				<view class="p-title ft30 tc">{{ isRepair ? '修复店铺' : '添加店铺' }}</view>
			</view>
		</wd-popup>
		
		<!-- 平台选择抽屉式弹窗 -->
		<wd-popup v-model="menuVisible" position="left" :closable="true" custom-style="width: 60%;height: 100%;" @close="menuVisible = false"
			:z-index="601">
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
	</view>
</template>

<script setup>
	import {
		ManagementApi
	} from '@/api/management.ts'
	import {
		ShopApi
	} from '@/api/shop.ts'
	import {
		FunctionPriceApi
	} from '@/api/functionPrice.ts'
	import { getRenewQuoteList } from '@/api/pay'
	import { mapPayQuoteToSpecRow } from '@/utils/payRenewFlow'
	import {
		UserApi
	} from '@/api/login'
	import request from '@/utils/request'
	import {
		onMounted,
		ref,
		reactive,
		nextTick,
		computed,
		watch
	} from 'vue'
	import {
		useRouter
	} from '@/utils/router';
	import { useAuthStore } from '@/store/auth.ts'
	import {
		onLoad,
		onShow,
		onUnload,
		onHide
	} from '@dcloudio/uni-app';
	const router = useRouter()
	const authStore = useAuthStore()
	
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
	platformLogos.set(7, 'https://p0.meituan.net/shangouproductapi/7e460e1386aa0eea23f5d4bfcd0663b376999.png') // 抖音零售
	platformLogos.set(8, 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png') // 京东外卖
	platformLogos.set(9, 'https://p0.meituan.net/shangouproductapi/7e460e1386aa0eea23f5d4bfcd0663b376999.png') // 抖音外卖
	platformLogos.set(10, 'https://p0.meituan.net/shangouproductapi/280765bbbe4aeb0603d386eea888ab8c151948.png') // 饿了么复制版（饿了么官方）

	// shopType 到 logo key 的映射
	const shopTypeToLogoKey = {
		1: 1,  // 美团外卖 -> logo key 1
		2: 4,  // 淘宝闪购外卖(原饿了么) -> logo key 4
		3: 8,  // 京东秒送 -> logo key 8 (京东外卖)
		4: 2,  // 美团闪购 -> logo key 2
		5: 3,  // 美团医药 -> logo key 3
		6: 5,  // 淘宝闪购零售 -> logo key 5 (饿百零售)
		7: 9,  // 抖音即时零售平台 -> logo key 9 (抖音外卖)
		8: 10, // 饿了么复制版（饿了么官方） -> logo key 10
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
		7: ['#F5F5F5', '#FFFFFF'],  // 抖音即时零售平台 - 淡灰色渐变（基于品牌色黑色，使用淡灰色更协调）
		8: ['#E6F4FF', '#FFFFFF'],  // 饿了么复制版 - 淡蓝色渐变（基于品牌色 #0493F7 蓝色）
	}

	// 平台边框颜色映射
	const platformBorderColors = {
		1: '#FACC05',  // 美团外卖 - 黄色
		2: '#0493F7',  // 淘宝闪购外卖 - 蓝色
		3: '#E1251B',  // 京东秒送 - 红色
		4: '#FACC05',  // 美团闪购 - 黄色
		5: '#0493F7',  // 淘宝闪购零售 - 蓝色（与淘宝闪购外卖保持一致）
		6: '#0493F7',  // 京东零售 - 蓝色
		7: '#000000',  // 抖音即时零售平台 - 黑色
		8: '#0493F7',  // 饿了么复制版 - 蓝色
	}

	const props = ref({
		list: [{
				value: '0',
				label: '美团外卖',
				shopType: 1,
				logo: platformLogos.get(shopTypeToLogoKey[1])
			},
			{
				value: '4',
				label: '美团闪购',
				shopType: 3,
				logo: platformLogos.get(shopTypeToLogoKey[4])
			},
			{
				value: '3',
				label: '京东到家',
				shopType: 6,
				logo: platformLogos.get(shopTypeToLogoKey[3])
			},
			// {
			// 	value: '1',
			// 	label: '淘宝闪购外卖',
			// 	shopType: 2,
			// 	logo: platformLogos.get(shopTypeToLogoKey[2])
			// },
			// {
			// 	value: '2',
			// 	label: '饿了么复制版',
			// 	shopType: 8,
			// 	logo: platformLogos.get(shopTypeToLogoKey[8])
			// },
			// {
			// 	value: '5',
			// 	label: '美团医药',
			// 	shopType: 4,
			// 	logo: platformLogos.get(shopTypeToLogoKey[5])
			// },
			// {
			// 	value: '6',
			// 	label: '淘宝闪购零售',
			// 	shopType: 5,
			// 	logo: platformLogos.get(shopTypeToLogoKey[6])
			// },
			// {
			// 	value: '7',
			// 	label: '抖音即时零售',
			// 	shopType: 7,
			// 	logo: platformLogos.get(shopTypeToLogoKey[7])
			// },
		],
		active: 0
	})
	const shopList = ref([])
	const recycle = ref([])
	const total = ref(0)
	
	// 复制功能筛选状态：activated=已激活, inactivated=未激活
	const copyFuncFilter = ref('activated')
	
	// 后台 webview 相关
	let currentBackendWebview = null // 保存当前打开的后台 webview 引用
	const showBackendWebview = ref(false) // 控制底部关闭按钮显示
	const zoomLevel = ref(100) // 缩放级别，默认100%
	
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
			shopType: 1, // 店铺类型  None = 0  美团 = 1  淘宝闪购外卖 = 2
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
	const selectedFuncState = ref(0) // 选中的功能状态：0=全部（已激活的店铺，包括已开启和未开启），2=即将到期(7天内)，3=已开启，4=未开启，默认选中全部
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
	
	// 当前店铺类型支持的功能列表（用于禁用不支持的功能开关）
	const supportedFuncCodes = ref(new Set())
	
	// 根据店铺类型获取支持的功能列表
	const getSupportedFuncList = async (shopType) => {
		try {
			const res = await FunctionPriceApi.getFuncList(shopType)
			if (res.code === 200 || res.Success) {
				const funcs = res.data || res.Data || []
				// 将功能代码存储到Set中，方便快速查找
				supportedFuncCodes.value = new Set(funcs.map((f) => f.code || '').filter((code) => code))
			} else {
				// 如果获取失败，默认只支持微信推送功能（兼容处理）
				supportedFuncCodes.value = new Set(['CHATPUSH'])
			}
		} catch (err) {
			// 出错时默认只支持微信推送功能（兼容处理）
			supportedFuncCodes.value = new Set(['CHATPUSH'])
		}
	}
	
	// 检查功能是否支持
	const isFuncSupported = (funcCode) => {
		// 如果功能列表为空，默认支持（兼容处理）
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
	// 功能筛选列表已移除，只保留微信推送功能
	const funFilterList = ref([])
	// 注释掉原有的功能筛选列表
	/* const funFilterList = ref([
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
	]) */
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
		} else if (shopType === 7) {
			// 抖音即时零售平台
			douyin()
		} else if (shopType === 8) {
			// 饿了么复制版（饿了么官方）- 使用官方授权接口
			elemeOfficial()
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
		
		// 饿了么复制版（shopType = 8）使用特殊的授权链接格式
		if (shopType === 8) {
			// 获取API基础地址
			const apiBaseUrl = uni.getStorageSync('apiBaseUrl') || ''
			
			// 从API地址中提取基础域名
			let baseUrl = ''
			if (apiBaseUrl) {
				try {
					const url = new URL(apiBaseUrl)
					baseUrl = `${url.protocol}//${url.host}`
				} catch (e) {
					baseUrl = apiBaseUrl.replace(/\/$/, '')
				}
			}
			
			// 如果无法从API地址提取，使用默认地址
			if (!baseUrl) {
				baseUrl = 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run'
			}
			
			// 饿了么官方授权链接格式
			const redirectUri = encodeURIComponent(`${baseUrl}/shopmgcallback/elecallbacklogin`)
			authLink = `https://open-api.shop.ele.me/authorize?response_type=code&client_id=leWB9sSZMa&redirect_uri=${redirectUri}&state=${userId}&scope=all`
		} else {
			// 其他平台使用简单的登录链接格式
			// 获取API基础地址
			const apiBaseUrl = uni.getStorageSync('apiBaseUrl') || ''
			
			// 从API地址中提取基础域名
			let baseUrl = ''
			if (apiBaseUrl) {
				try {
					const url = new URL(apiBaseUrl)
					baseUrl = `${url.protocol}//${url.host}`
				} catch (e) {
					baseUrl = apiBaseUrl.replace(/\/$/, '')
				}
			}
			
			// 如果无法从API地址提取，使用默认地址
			if (!baseUrl) {
				baseUrl = 'https://admin-web-nfzvpdlold.cn-shenzhen.fcapp.run'
			}
			
			// 生成授权链接：/login/{shopType}/{userId}
			authLink = `${baseUrl}/login/${shopType}/${userId}`
		}
		
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
	// 跳转到推送设置页面
	const toPushSettings = (item) => {
		// 保存店铺信息到localStorage（与toManage函数相同的逻辑）
		const latestShop = shopList.value.find(shop => shop.id === item.id || shop.office_id === item.id)
		const currentShop = latestShop || item
		const func_enable = currentShop.extra_data?.func_enable || currentShop.func_info || null
		
		uni.setStorageSync('shopInfo', {
			img: currentShop.img,
			state: currentShop.state,
			name: currentShop.name,
			func_enable: func_enable,
			city: currentShop.city,
			cookies: currentShop.cookies,
			work_time: currentShop.work_time,
			user: currentShop.user,
			id: currentShop.id,
			office_id: currentShop.office_id,
			// wechatsetting 页面续费需要用到
			shop_type: currentShop.shop_type,
			// 直接带上列表中计算好的推送激活状态和到期时间，避免重复计算不一致
			CHATPUSH: currentShop.CHATPUSH,
			CHATPUSHEndTime: currentShop.CHATPUSHEndTime,
			isChatpushActivated: currentShop.isChatpushActivated
		})
		
		// 跳转到微信推送设置页面
		uni.navigateTo({
			url: '/pages/wechatsetting/wechatsetting?shopId=' + currentShop.id + '&shopName=' + encodeURIComponent(currentShop.name || '')
		})
	}
	
	// 处理推送开关变化
	const handlePushSwitchChange = async (item, value) => {
		// 确保 value 是布尔值，而不是对象
		// wd-switch 的 change 事件可能返回对象 {value: true} 或直接返回布尔值
		let enableValue = value
		if (value && typeof value === 'object' && value.value !== undefined) {
			enableValue = value.value
		} else if (typeof value !== 'boolean') {
			// 如果不是布尔值，尝试转换
			enableValue = Boolean(value)
		}
		
		const shopId = item.id || item.office_id
		if (!shopId) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none'
			})
			// 恢复开关状态
			item.CHATPUSH = !enableValue
			return
		}

		try {
			uni.showLoading({ title: enableValue ? '开启中...' : '关闭中...', mask: true })
			
			const res = await ManagementApi.enableIM({
				code: 'CHATPUSH',
				enable: enableValue,
				shop: shopId
			})

			uni.hideLoading()

			// 检查响应是否成功
			const responseData = res?.data || res
			const isSuccess = (res && (
				res.code === 200 || 
				res.Code === 200 || 
				res.Success === true ||
				responseData?.code === 200 ||
				responseData?.Code === 200 ||
				responseData?.Success === true
			))

			if (isSuccess) {
				// 更新本地状态
				const funcEnable = item.func_enable || item.extra_data?.func_enable || []
				const chatpushFunc = funcEnable.find(f => f && f.code === 'CHATPUSH')
				if (chatpushFunc) {
					chatpushFunc.enable = enableValue
				} else {
					// 如果不存在，添加到 func_enable
					if (!Array.isArray(funcEnable)) {
						item.func_enable = []
					}
					item.func_enable.push({
						code: 'CHATPUSH',
						enable: enableValue,
						end_time: item.CHATPUSHEndTime || null
					})
				}
				
				// 发送事件通知其他页面更新状态
				uni.$emit('shopFunctionChanged', {
					shopId: shopId,
					code: 'CHATPUSH',
					enable: enableValue
				})
				
				const successMsg = enableValue ? '推送已开启' : '推送已关闭'
				uni.showToast({
					title: String(successMsg),
					icon: 'success',
					duration: 2000
				})
			} else {
				// 请求失败，恢复开关状态
				item.CHATPUSH = !enableValue
				let errorMsg = '操作失败'
				if (responseData) {
					if (typeof responseData.message === 'string') {
						errorMsg = responseData.message
					} else if (typeof responseData.Msg === 'string') {
						errorMsg = responseData.Msg
					} else if (typeof res?.message === 'string') {
						errorMsg = res.message
					} else if (typeof res?.Msg === 'string') {
						errorMsg = res.Msg
					}
				}
				uni.showToast({
					title: String(errorMsg),
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			// 请求异常，恢复开关状态
			item.CHATPUSH = !enableValue
			let errorMsg = '操作失败，请重试'
			if (error && typeof error === 'object') {
				if (typeof error.message === 'string') {
					errorMsg = error.message
				} else if (error.Msg && typeof error.Msg === 'string') {
					errorMsg = error.Msg
				}
			} else if (typeof error === 'string') {
				errorMsg = error
			}
			uni.showToast({
				title: String(errorMsg),
				icon: 'none'
			})
		}
	}
	
	// 立即推送
	const handlePushNow = async (item) => {
		const shopId = item.id || item.office_id
		if (!shopId) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none'
			})
			return
		}

		try {
			uni.showLoading({ title: '推送中...', mask: true })
			
			// 调用接口立即推送
			const res = await request({
				url: `ChatPushData/PushDataNow?shopId=${shopId}`,
				method: 'post',
				data: {}
			})

			uni.hideLoading()

			// 检查响应是否成功（兼容多种响应格式）
			const responseData = res?.data || res
			const isSuccess = (res && (
				res.code === 200 || 
				res.Code === 200 || 
				res.Success === true ||
				responseData?.code === 200 ||
				responseData?.Code === 200 ||
				responseData?.Success === true
			))

			if (isSuccess) {
				uni.showToast({
					title: '推送成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				// 请求失败
				let errorMsg = '推送失败'
				if (responseData) {
					if (typeof responseData.message === 'string') {
						errorMsg = responseData.message
					} else if (typeof responseData.Msg === 'string') {
						errorMsg = responseData.Msg
					} else if (typeof res?.message === 'string') {
						errorMsg = res.message
					} else if (typeof res?.Msg === 'string') {
						errorMsg = res.Msg
					}
				}
				uni.showToast({
					title: typeof errorMsg === 'string' ? errorMsg : '推送失败',
					icon: 'none'
				})
			}
		} catch (error) {
			uni.hideLoading()
			let errorMsg = '推送失败，请重试'
			if (error && typeof error === 'object') {
				if (typeof error.message === 'string') {
					errorMsg = error.message
				} else if (error.Msg && typeof error.Msg === 'string') {
					errorMsg = error.Msg
				}
			} else if (typeof error === 'string') {
				errorMsg = error
			}
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
	}

	// 复制日报
	const handleCopyReport = async (item) => {
		const shopId = item.id || item.office_id
		if (!shopId) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none'
			})
			return
		}

		try {
			uni.showLoading({ title: '获取日报数据中...', mask: true })
			
			// 调用接口获取日报数据
			const res = await request({
				url: 'ChatPushData/GetShopYesterdayData',
				method: 'get',
				data: {
					shopId: shopId,
					includeComment: true
				}
			})

			uni.hideLoading()

			// 处理响应数据
			let reportData = ''
			if (typeof res === 'string') {
				reportData = res
			} else if (res && typeof res === 'object') {
				// 如果返回的是对象，尝试提取数据
				if (typeof res.data === 'string') {
					reportData = res.data
				} else if (res.Data && typeof res.Data === 'string') {
					reportData = res.Data
				} else {
					// 如果是对象，转换为 JSON 字符串
					reportData = JSON.stringify(res, null, 2)
				}
			}

			if (!reportData) {
				uni.showToast({
					title: '获取日报数据失败',
					icon: 'none'
				})
				return
			}

			// 复制到剪贴板
			// #ifdef H5
			// H5 平台使用 navigator.clipboard
			if (navigator.clipboard && navigator.clipboard.writeText) {
				await navigator.clipboard.writeText(reportData)
				uni.showToast({
					title: '日报已复制',
					icon: 'success',
					duration: 2000
				})
			} else {
				// 降级方案：创建临时文本域
				const textarea = document.createElement('textarea')
				textarea.value = reportData
				textarea.style.position = 'fixed'
				textarea.style.opacity = '0'
				document.body.appendChild(textarea)
				textarea.select()
				try {
					document.execCommand('copy')
					uni.showToast({
						title: '日报已复制',
						icon: 'success',
						duration: 2000
					})
				} catch (err) {
					uni.showToast({
						title: '复制失败，请手动复制',
						icon: 'none'
					})
				}
				document.body.removeChild(textarea)
			}
			// #endif
			
			// #ifndef H5
			// Uni-app 平台使用 uni.setClipboardData
			uni.setClipboardData({
				data: reportData,
				success: () => {
					uni.showToast({
						title: '日报已复制',
						icon: 'success',
						duration: 2000
					})
				},
				fail: () => {
					uni.showToast({
						title: '复制失败，请重试',
						icon: 'none'
					})
				}
			})
			// #endif
		} catch (error) {
			uni.hideLoading()
			let errorMsg = '获取日报数据失败，请重试'
			if (error && typeof error === 'object') {
				if (typeof error.message === 'string') {
					errorMsg = error.message
				} else if (error.Msg && typeof error.Msg === 'string') {
					errorMsg = error.Msg
				}
			} else if (typeof error === 'string') {
				errorMsg = error
			}
			uni.showToast({
				title: errorMsg,
				icon: 'none'
			})
		}
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
	// 饿了么复制版（饿了么官方）- 使用官方授权接口
	const elemeOfficial = async () => {
		try {
			uni.showLoading({ title: '获取授权地址...' })
			
			// 调用API获取官方授权地址
			const res = await ShopApi.getOfficeAuth(8) // shopType = 8
			
			if (!res || !res.data || !res.data.Url) {
				uni.hideLoading()
				uni.showToast({
					title: '获取授权地址失败',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			const authUrl = res.data.Url
			
			// #ifdef H5
			uni.hideLoading()
			location.href = authUrl
			// #endif
			
			// #ifdef APP-PLUS
			const banben = Math.floor(Math.random() * 601) + 1
			plus.navigator.setUserAgent(
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
				Math.floor(Math.random() * 16) +
				"_7) AppleWebKit/" + banben +
				".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
			)
			
			let getWindowInfo = uni.getWindowInfo()
			const webviewid = 'pcwebview'
			const webview_setting = {
				'top': '18%',
			}
			
			// 清理缓存和cookie
			plus.navigator.removeAllCookie()
			plus.navigator.removeCookie()
			plus.navigator.removeSessionCookie()
			
			// 关闭之前的webview
			if (w) {
				try {
					plus.webview.close(w)
				} catch (e) {
					// 忽略关闭失败的错误
				}
			}
			
			// 在cache.clear的回调中创建webview（重要！）
			plus.cache.clear(function() {
				// 创建webview打开授权页面
				w = plus.webview.create(authUrl, webviewid, webview_setting)
				
				// 使用嵌套setTimeout确保webview创建和显示的时序正确
				setTimeout(() => {
					plus.webview.close(w)
					setTimeout(() => {
					// 重新创建webview并显示
					w = plus.webview.create(authUrl, webviewid, webview_setting)
					colseShow.value = true
					w.show()
					uni.hideLoading()
					
					// 不自动检测授权完成
					// OAuth授权流程：用户完成授权后，后端会自动处理回调并添加店铺
					// 用户完成授权后需要点击关闭按钮，关闭时会自动刷新店铺列表
					}, 500)
				}, 500)
			})
			// #endif
			
		} catch (error) {
			uni.hideLoading()
			uni.showToast({
				title: '获取授权地址失败：' + (error.message || '未知错误'),
				icon: 'none',
				duration: 2000
			})
		}
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
						plus.webview.close(w)
						plus.cache.clear()
						colseShow.value = false
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
	}

	// 抖音添加门店（参考 addShop.vue 的实现方式）
	const douyin = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		const shopType = queryParams.filter.shopType
		uni.showLoading({})
		
		// 设置PC端User-Agent
		const banben = Math.floor(Math.random() * 601) + 1
		plus.navigator.setUserAgent(
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
			Math.floor(Math.random() * 16) +
			"_7) AppleWebKit/" + banben +
			".36 (KHTML, like Gecko) Chrome/88.0.4324.192 Safari/" + banben + ".36"
		)
		
		const url = 'https://fxg.jinritemai.com/login/common?channel=zhaoshang'
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = `douyin-${shopType}-${Date.now()}`
		const webview_setting = {
			'disablePlus': false,
			'scrollIndicator': 'all',
			'width': getWindowInfo.screenWidth + 'px',
			'top': '18%',
			'scalable': true,
		}
		
		// 清理cookie和缓存
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
				w = plus.webview.create(url, webviewid, webview_setting)
				colseShow.value = true
				w.show()
				uni.hideLoading({})
				
				// 启动cookie监听（参考 addShop.vue 的方式）
				startDouyinCookieMonitoring()
			}, 500)
		}, 500)
		// #endif
	}
	
	// 启动抖音平台cookie监听（参考 addShop.vue 的逻辑）
	const startDouyinCookieMonitoring = () => {
		if (!w) return
		
		// 用于保存从登录中转页面URL中提取的subjectId
		let savedSubjectId = null
		
		checkinter = setInterval(() => {
			try {
				const currentUrl = w.getURL()
				if (!currentUrl) return
				
				// 对于抖音/抖店平台，需要等待跳转到真正的后台页面后再获取cookie
				const shopType = queryParams.filter.shopType
				
				// 如果是登录中转页面，尝试从中提取subjectId并保存
				if (currentUrl.includes('login/account') && currentUrl.includes('subjectId=')) {
					try {
						const urlQueryString = currentUrl.split('?')[1] || ''
						const urlParams = {}
						if (urlQueryString) {
							urlQueryString.split('&').forEach(param => {
								const [key, value] = param.split('=')
								if (key && value) {
									urlParams[decodeURIComponent(key)] = decodeURIComponent(value)
								}
							})
						}
						if (urlParams['subjectId']) {
							savedSubjectId = String(urlParams['subjectId'])
						}
					} catch (e) {
						// 提取subjectId失败，静默处理
					}
					return
				}
				
				// 如果是passport页面，继续等待
				if (currentUrl.includes('passport')) {
					return
				}
				
				// 检查URL是否已经跳转到真正的后台页面（不是登录中转页面）
				// 注意：jsls.jinritemai.com/login/account?subjectId=xxx 只是登录中转页面，需要等待跳转到 mfa/homepage
				const isRealBackend = currentUrl.includes('mfa/homepage') || 
				                      (currentUrl.includes('mfa/') && !currentUrl.includes('login')) ||
				                      (currentUrl.includes('jsls.jinritemai.com') && !currentUrl.includes('login') && !currentUrl.includes('account'))
				
				// 如果已经跳转到真正的后台页面，需要等待页面完全加载并执行完JavaScript
				if (isRealBackend) {
					// 记录首次跳转到后台页面的时间
					if (!w._douyinBackendPageTime) {
						w._douyinBackendPageTime = Date.now()
					}
					
					// 等待至少5秒，让页面完全加载并设置所有cookie
					const timeSinceBackend = Date.now() - w._douyinBackendPageTime
					if (timeSinceBackend < 5000) {
						return
					}
				} else {
					// 还没有跳转到后台页面，继续等待
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
					
					// 尝试从多个域名获取cookie（与 addShop.vue 保持一致）
					try {
						const jinritemaiUrls = [
							'https://fxg.jinritemai.com',
							'https://jsls.jinritemai.com',
							'https://jinritemai.com'
						]
						
						for (const url of jinritemaiUrls) {
							try {
								const domainCookie = plus.navigator.getCookie(url) || ''
								if (domainCookie) {
									domainCookie.split(';').forEach(item => {
										const [key, ...valueParts] = item.trim().split('=')
										if (key && valueParts.length > 0) {
											cookieMap.set(key.trim(), valueParts.join('=').trim())
										}
									})
								}
							} catch (e) {
								// 忽略单个域名的错误
							}
						}
					} catch (e) {
						// 获取额外cookie失败，静默处理
					}
					
					// 如果从登录中转页面保存了subjectId，且cookieMap中没有subjectId和shopId，则添加到cookieMap中
					// 抖音平台使用subjectId作为店铺ID，但后端可能期望shopId字段，所以同时添加两个字段
					if (savedSubjectId) {
						if (!cookieMap.has('subjectId')) {
							cookieMap.set('subjectId', savedSubjectId)
						}
						// 同时添加shopId字段，因为后端可能期望这个字段名
						if (!cookieMap.has('shopId')) {
							cookieMap.set('shopId', savedSubjectId)
						}
					}
					
					// 重新组合cookie字符串（确保subjectId被包含在内）
					cookiestr = Array.from(cookieMap.entries())
						.map(([key, value]) => `${key}=${value}`)
						.join('; ')
				} catch (e) {
					cookiestr = plus.navigator.getCookie(currentUrl) || ''
					
					// 如果从登录中转页面保存了subjectId，且cookie中没有subjectId和shopId，则添加到cookie中
					if (savedSubjectId && cookiestr) {
						if (cookiestr.indexOf('subjectId=') === -1) {
							cookiestr = cookiestr + '; subjectId=' + savedSubjectId
						}
						// 同时添加shopId字段，因为后端可能期望这个字段名
						if (cookiestr.indexOf('shopId=') === -1) {
							cookiestr = cookiestr + '; shopId=' + savedSubjectId
						}
					}
				}
				
				if (!cookiestr) {
					return
				}
				
				// 验证关键cookie是否存在（抖音平台需要 passport_csrf_token 或 sessionid_ss）
				const hasPassportToken = cookiestr.indexOf("passport_csrf_token=") != -1
				const hasSessionId = cookiestr.indexOf("sessionid_ss=") != -1
				
				if (!hasPassportToken && !hasSessionId) {
					return
				}
				
				// 提取shopId（抖音平台使用subjectId作为店铺ID）
				let shopId = null
				
				// 方法1: 从URL参数中提取（最优先，因为URL参数最可靠）
				try {
					const urlQueryString = currentUrl.split('?')[1] || ''
					
					// 手动解析URL参数（因为URLSearchParams在uni-app环境中可能不可用）
					const urlParams = {}
					if (urlQueryString) {
						urlQueryString.split('&').forEach(param => {
							const [key, value] = param.split('=')
							if (key && value) {
								urlParams[decodeURIComponent(key)] = decodeURIComponent(value)
							}
						})
					}
					
					const subjectId = urlParams['subjectId']
					const orgId = urlParams['orgId']
					const shopIdParam = urlParams['shopId']
					
					if (subjectId) {
						shopId = String(subjectId)
					} else if (orgId) {
						shopId = String(orgId)
					} else if (shopIdParam) {
						shopId = String(shopIdParam)
					}
				} catch (e) {
					// 从URL参数提取shopId失败，静默处理
				}
				
				// 方法2: 从URL路径中提取（如果参数中没有）
				if (!shopId) {
					try {
						const urlMatch = currentUrl.match(/\/org\/(\d+)/) || 
						                 currentUrl.match(/\/mfa\/(\d+)/) ||
						                 currentUrl.match(/orgId[=:](\d+)/i) ||
						                 currentUrl.match(/shopId[=:](\d+)/i) ||
						                 currentUrl.match(/subjectId[=:](\d+)/i)
						if (urlMatch && urlMatch[1]) {
							shopId = String(urlMatch[1])
						}
					} catch (e) {
						// 从URL路径提取shopId失败，静默处理
					}
				}
				
				// 方法3: 从页面JavaScript中提取
				if (!shopId) {
					try {
						const pageInfo = w.evalJS(`(function() {
							try {
								// 尝试从window对象中获取店铺信息
								if (window.subjectId) return {shopId: String(window.subjectId)};
								if (window.orgId) return {shopId: String(window.orgId)};
								if (window.shopId) return {shopId: String(window.shopId)};
								if (window.org && window.org.id) return {shopId: String(window.org.id)};
								if (window.shop && window.shop.id) return {shopId: String(window.shop.id)};
								if (window.shopInfo && window.shopInfo.subjectId) return {shopId: String(window.shopInfo.subjectId)};
								if (window.shopInfo && window.shopInfo.orgId) return {shopId: String(window.shopInfo.orgId)};
								if (window.shopInfo && window.shopInfo.id) return {shopId: String(window.shopInfo.id)};
								if (window.orgInfo && window.orgInfo.id) return {shopId: String(window.orgInfo.id)};
								// 尝试从Vue/Vuex等状态管理中获取
								if (window.$store && window.$store.state) {
									if (window.$store.state.subjectId) return {shopId: String(window.$store.state.subjectId)};
									if (window.$store.state.orgId) return {shopId: String(window.$store.state.orgId)};
									if (window.$store.state.shopId) return {shopId: String(window.$store.state.shopId)};
									if (window.$store.state.org && window.$store.state.org.id) return {shopId: String(window.$store.state.org.id)};
									if (window.$store.state.shop && window.$store.state.shop.id) return {shopId: String(window.$store.state.shop.id)};
								}
								return null;
							} catch(e) {
								return null;
							}
						})()`)
						
						if (pageInfo && typeof pageInfo === 'object' && pageInfo.shopId) {
							shopId = String(pageInfo.shopId)
						}
					} catch (e) {
						// 从页面JavaScript提取shopId失败，静默处理
					}
				}
				
				// 方法4: 从cookie中提取
				if (!shopId) {
					try {
						const cookieMatch = cookiestr.match(/subjectId[=:](\d+)/i) || 
						                    cookiestr.match(/orgId[=:](\d+)/i) || 
						                    cookiestr.match(/shopId[=:](\d+)/i)
						if (cookieMatch && cookieMatch[1]) {
							shopId = String(cookieMatch[1])
						}
					} catch (e) {
						// 从cookie提取shopId失败，静默处理
					}
				}
				
				// cookie有效，停止监听并提交
				if (checkinter) {
					clearInterval(checkinter)
					checkinter = null
				}
				
				const params = {
					shop_type: queryParams.filter.shopType,
					cookies: cookiestr
				}
				
				
				// 调用添加店铺API
				callAddShopApi(params)
				
				// 清理并关闭webview
				colseShow.value = false
				if (w) {
					plus.webview.close(w)
					w = null
				}
				
				// 清理抖音平台相关域名的cookie
				const jinritemaiUrls = [
					'https://fxg.jinritemai.com',
					'https://jsls.jinritemai.com',
					'https://jinritemai.com'
				]
				for (const url of jinritemaiUrls) {
					try {
						plus.navigator.removeCookie(url)
					} catch (e) {
						// 忽略错误
					}
				}
				
				plus.navigator.removeAllCookie()
				plus.navigator.removeCookie()
				plus.navigator.removeSessionCookie()
				plus.cache.clear()
			} catch (e) {
			}
		}, 500)
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
		const func_enable = currentShop.extra_data?.func_enable || currentShop.func_info || null
		
		const {
			img,
			state,
			name,
			extra_data,
			city,
			cookies,
			work_time,
			user,
			id
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
			id
		});
		uni.navigateTo({
			url: '/pages/shop-management/shop-management?id=' + currentShop.id + '&type=' + queryParams.filter
				.shopType + '&office_id=' + currentShop.office_id + '&isV2=true',
		})

	}
	const handleClose = () => {
		isFullPopupPlan.value = false
	}
	const getPayList = async () => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		const shopTypeNum = Number(payParams.shoptype) || 1
		const priceTitle = payParams.pricetitle || ''
		const isKeyWord = payParams.isKeyWord !== undefined ? payParams.isKeyWord : false
		try {
			const quotes = await getRenewQuoteList(shopTypeNum, priceTitle, isKeyWord)
			payList.value = quotes.map(mapPayQuoteToSpecRow)
			uni.hideLoading()
			if (payList.value.length === 0) {
				uni.showToast({
					title: '暂无可用规格',
					icon: 'none',
					duration: 3000
				})
				return
			}
			authGoodsVisible.value = true
		} catch (err) {
			uni.hideLoading()
			uni.showToast({
				title: err.message || '获取功能价格失败，请重试',
				icon: 'none',
				duration: 3000
			})
		}
	}
	const onPopupHandler = (row, codeOrStr, str) => {
		payParams.shoptype = queryParams.filter.shopType
		shopId.value = row.id
		
		// 功能代码到功能名称的映射（只保留微信推送功能）
		const funcCodeToNameMap = {
			'CHATPUSH': '微信推送'
		}
		
		// 判断是功能代码还是功能名称
		const funcCodeMap = ['CHATPUSH']
		const isFuncCode = funcCodeMap.includes(codeOrStr)
		
		if (codeOrStr === '全功能' || str === '全功能') {
			isFullPopupPlan.value = true
			// 全功能激活时，使用正确的 pricetitle 格式：'全功能|店铺多开_月'
			payParams.pricetitle = '全功能|店铺多开_月'
			payParams.isKeyWord = true
		} else if (isFuncCode) {
			// 单个功能续费，使用功能名称 + '_月' 作为 priceTitle（与 shop-management 页面保持一致）
			isFullPopupPlan.value = false
			const funcName = funcCodeToNameMap[codeOrStr] || codeOrStr
			payParams.pricetitle = funcName + '_月'  // 使用功能名称 + '_月'，如 '自动出餐_月' 或 'IM自动回复_月'
			payParams.isKeyWord = false  // 单个功能续费不使用关键词模式
		} else {
			// 兼容旧逻辑，使用功能名称（这种情况应该不会出现，但保留兼容性）
			isFullPopupPlan.value = false
			payParams.pricetitle = (codeOrStr || str) + '_月'
			payParams.isKeyWord = false
		}
		getPayList()
	}
	const beforeChangeFun = (obj, code, str) => {
		uni.showLoading()
		
		// 根据功能代码获取功能名称（只保留微信推送功能）
		const getFuncName = (code) => {
			const funcNameMap = {
				'CHATPUSH': '微信推送'
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
	const closeAuthGoodsVisibleHandler = () => {
		authGoodsVisible.value = false
	}
	
	// 处理功能到期时间点击（未激活时弹出续费窗口）
	const handleExpireTimeClick = (item) => {
		if (!item || item.isChatpushActivated) {
			return
		}
		
		// 设置续费参数
		payParams.shoptype = item.shop_type || queryParams.filter.shopType || 1
		shopId.value = item.id || item.office_id
		// 微信推送功能续费使用"推送服务_月"关键字套餐
		payParams.pricetitle = '推送服务_月'
		payParams.isKeyWord = true
		isFullPopupPlan.value = false
		
		// 获取价格列表并显示弹窗
		getPayList()
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
		const platformNameMap = {1:'美团外卖',2:'淘宝闪购外卖',3:'美团闪购',4:'美团医药',5:'淘宝闪购零售',6:'京东秒送',7:'抖音即时零售',8:'饿了么复制版',9:'美团团购',10:'京东团购'}
		let data = "平台：" + (platformNameMap[copyobj.shop_type] || '未知平台') +
			"\n店铺名称：" + copyobj.name +
			"\n店铺ID：" + copyobj.office_id +
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
	// 选择功能状态
	const selectFuncState = (state) => {
		selectedFuncState.value = state
	}
	const tab = ref(1)
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
		// 保存当前的 func_code 和 func_state（如果是微信推送页面）
		const currentFuncCode = queryParams.filter.func_code
		const currentFuncState = queryParams.filter.func_state
		
		queryParams = {
			page: 1,
			pageSize: 10,
			filter: {
				time_state: undefined, // 店铺到期时间过期 全部 = 0 未到期 = 1 即将到期 = 2 已经到期 = 3
				shopType: tab.value, // 店铺类型  None = 0  美团 = 1  饿了么 = 2  美团闪购 = 3  京东到家 = 6
				word: undefined, // 门店名称或官方id
				group: undefined, // 指定分组
				state: undefined, // None = 0  店铺未登陆 = 1  店铺已掉线 = 3  店铺营业中 = 4  店铺上线中 = 6  店铺已下线 = 7
				ck_online: undefined, // 店铺正常授权 即dk 有效
				citys: undefined, // 指定哪些城市
				func_code: 'CHATPUSH', // 过滤功能：微信推送
				func_state: copyFuncFilter.value === 'activated' ? 1 : (copyFuncFilter.value === 'inactivated' ? 5 : undefined), // 已激活=1, 未激活=5
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
		// 根据激活/未激活状态处理功能状态筛选
		if (copyFuncFilter.value === 'activated') {
			// 已激活状态
			queryParams.filter.func_code = 'CHATPUSH'
			if (selectedFuncState.value === 0) {
				// 选择了"全部"，显示所有已激活的店铺（和"已激活"按钮一样，func_state = 1）
				queryParams.filter.func_state = 1 // 未到期（已激活）
			} else if (selectedFuncState.value !== undefined) {
				// 选择了具体状态（即将到期、已开启、未开启）
				queryParams.filter.func_state = selectedFuncState.value
			} else {
				// 默认情况，显示全部已激活的店铺
				queryParams.filter.func_state = 1 // 未到期（已激活）
			}
		} else {
			// 未激活状态：只显示已到期
			queryParams.filter.func_code = 'CHATPUSH'
			queryParams.filter.func_state = 5 // 已到期
		}
		filterState.value = false
		getShopList()
	}
	const openFilter = () => {
		// 根据当前激活/未激活状态初始化功能状态选择
		if (copyFuncFilter.value === 'activated') {
			// 已激活状态：如果当前有筛选值，使用当前值，否则默认选中"全部"
			if (queryParams.filter.func_code === 'CHATPUSH' && queryParams.filter.func_state !== undefined) {
				// 如果当前是 func_state = 1（已激活），对应"全部"按钮
				if (queryParams.filter.func_state === 1) {
					selectedFuncState.value = 0 // "全部"按钮
				} else {
					selectedFuncState.value = queryParams.filter.func_state
				}
			} else {
				selectedFuncState.value = 0 // 默认选中全部（已激活的店铺）
			}
		} else {
			// 未激活状态：默认选中"已到期"
			selectedFuncState.value = 5 // 已到期
		}
		filterState.value = true
	}
	const closeFilter = () => {
		filterState.value = false
		// 关闭筛选弹窗时不清空选择，让用户确认筛选时再应用
	}
	
	// 切换微信推送功能筛选
	const changeCopyFilter = (type) => {
		copyFuncFilter.value = type
		// 设置筛选参数：func_code = 'CHATPUSH'
		queryParams.filter.func_code = 'CHATPUSH'
		// func_state: 未到期 = 1, 已到期 = 5
		if (type === 'activated') {
			queryParams.filter.func_state = 1 // 未到期（已激活）
		} else {
			queryParams.filter.func_state = 5 // 已到期（未激活）
		}
		// 保持当前选择的平台类型（支持美团、美团闪购、京东到家等）
		// 如果当前没有设置 shopType，默认使用 tab.value
		if (!queryParams.filter.shopType) {
			queryParams.filter.shopType = tab.value || 1
		}
		// 重置到第一页
		queryParams.page = 1
		// 重新获取店铺列表
		getShopList()
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
	const getShopList = (preserveScrollTop = null) => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		// 确保微信推送筛选参数正确设置
		if (queryParams.filter.func_code === 'CHATPUSH') {
			// 如果当前没有设置 shopType，使用 tab.value（支持所有平台：美团、美团闪购、京东到家等）
			if (!queryParams.filter.shopType) {
				queryParams.filter.shopType = tab.value || 1
			}
		}
		// 使用 V2 接口查询店铺列表，返回 Promise
		return ShopApi.getV2List(queryParams).then(res => {
			if (res.code === 200) {
				const rawList = res.data.rows
				// 更新当前平台类型的数量（使用实际列表的总数）
				const currentPlatform = props.value.list.find(item => item.shopType === queryParams.filter.shopType)
				if (currentPlatform) {
					currentPlatform.count = res.data.total
				}
				rawList.forEach(item => {
					// v1接口使用func_info，v2接口使用extra_data.func_enable
					let funcInfo = item.func_info || item.extra_data?.func_enable
					// 统一将func_enable设置为funcInfo，方便筛选使用
					item.func_enable = funcInfo
					
					if (funcInfo && funcInfo.length) {
						// 处理CHATPUSH功能（微信推送）
						const chatpushFunc = funcInfo.find(itemA => itemA.code == 'CHATPUSH')
						if (chatpushFunc) {
							item.CHATPUSH = chatpushFunc.enable || false
							// 从接口返回数据中获取 EndTime 字段（GetShopListV2 接口返回的字段名）
							// 格式：2026-02-17 21:11:16
							// 优先使用 EndTime（驼峰命名），如果没有则尝试 endTime 或 end_time
							item.CHATPUSHEndTime = chatpushFunc.EndTime || chatpushFunc.endTime || chatpushFunc.end_time || null
							item.CHATPUSHtime = time(item.CHATPUSHEndTime)
							// 计算CHATPUSH剩余天数
							item.CHATPUSHDaysText = getExpireTimeText(item, 'CHATPUSH')
							// 判断CHATPUSH功能是否已激活（未到期）
							item.isChatpushActivated = checkChatpushActivated(item)
						} else {
							// 如果没有找到 CHATPUSH 功能，设置默认值
							item.CHATPUSH = false
							item.CHATPUSHEndTime = null
							item.CHATPUSHtime = '已到期'
							item.CHATPUSHDaysText = '已到期'
							item.isChatpushActivated = false
						}
					} else {
						// CHATPUSH功能默认值
						item.CHATPUSH = false
						item.CHATPUSHEndTime = null
						item.CHATPUSHtime = '已到期'
						item.CHATPUSHDaysText = '已到期'
						item.isChatpushActivated = false
					}
				})
				
				// 直接使用服务器返回的数据
				shopList.value = rawList
				total.value = res.data.total
				
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
			}
		}).catch(err => {
			// 错误处理，静默处理
		}).finally(() => {
			uni.hideLoading({})
			isRefreshing.value = false
		})
	}
	const onChange = (item) => {
		// 保存当前的 func_code 和 func_state（如果是微信推送页面）
		const currentFuncCode = queryParams.filter.func_code
		const currentFuncState = queryParams.filter.func_state
		
		queryParams.filter.shopType = item.shopType
		tab.value = item.shopType
		menuVisible.value = false // 选择后关闭菜单
		queryParams.page = 1 // 切换店铺类型时重置到第一页
		
		// 如果是微信推送页面，保持筛选参数
		if (currentFuncCode === 'CHATPUSH') {
			queryParams.filter.func_code = currentFuncCode
			queryParams.filter.func_state = currentFuncState
		}
		
		getShopList()
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
	// 检查CHATPUSH功能是否已激活（未到期）
	const checkChatpushActivated = (item) => {
		if (!item.CHATPUSHEndTime) {
			return false
		}
		
		try {
			// 处理日期字符串，支持格式：2026-02-17 21:11:16
			let endDate = new Date(item.CHATPUSHEndTime)
			
			// 如果 Date 解析失败，尝试手动解析格式 "2026-02-17 21:11:16"
			if (isNaN(endDate.getTime()) && typeof item.CHATPUSHEndTime === 'string') {
				// 尝试替换空格为 T，使其符合 ISO 格式
				const isoString = item.CHATPUSHEndTime.replace(' ', 'T')
				endDate = new Date(isoString)
			}
			
			// 检查日期是否有效
			if (isNaN(endDate.getTime())) {
				return false
			}
			
			const today = new Date()
			today.setHours(0, 0, 0, 0)
			endDate.setHours(0, 0, 0, 0)
			
			// 判断是否到期：
			// endDate > today 表示未到期（到期日期在今天之后）
			// endDate <= today 表示已到期（包括今天到期，即剩余0天）
			return endDate > today
		} catch (e) {
			return false
		}
	}
	
	// 计算功能到期时间显示文本
	const getExpireTimeText = (item, code) => {
		let endTime = null
		// 获取原始到期时间（只处理微信推送功能）
		if (code === 'CHATPUSH') {
			endTime = item.CHATPUSHEndTime
		}
		
		if (!endTime) {
			return '已到期'
		}
		
		try {
			// 处理日期字符串，支持格式：2026-02-17 21:11:16
			let endDate = new Date(endTime)
			
			// 如果 Date 解析失败，尝试手动解析格式 "2026-02-17 21:11:16"
			if (isNaN(endDate.getTime()) && typeof endTime === 'string') {
				// 尝试替换空格为 T，使其符合 ISO 格式
				const isoString = endTime.replace(' ', 'T')
				endDate = new Date(isoString)
			}
			
			// 检查日期是否有效
			if (isNaN(endDate.getTime())) {
				return '已到期'
			}
			
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
			const dateObj = new Date(date);
			if (isNaN(dateObj.getTime())) {
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
	
	// 打开店铺后台
	const goShopBackend = async (item) => {
		try {
			uni.showLoading({ title: '加载中...' })
			
			// 通过API获取cookie
			let cookie = ''
			
			try {
				// 优先使用 getShopCk 方法获取cookie
				const ckRes = await ManagementApi.getShopCk(item.id)
				
				if (ckRes && ckRes.data) {
					cookie = ckRes.data
				} else if (typeof ckRes === 'string') {
					// 如果直接返回字符串
					cookie = ckRes
				}
			} catch (e) {
				// 如果 getShopCk 失败，尝试使用 item 中的 cookie
				cookie = item.cookies || ''
			}
			
			if (!cookie) {
				uni.hideLoading()
				uni.showToast({
					title: '获取店铺cookie失败',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			// 根据店铺类型打开对应的后台
			const shopType = item.shop_type || tab.value
			openShopBackendWebview(cookie, shopType, item.office_id)
			
		} catch (error) {
			uni.hideLoading()
			uni.showToast({
				title: '打开店铺后台失败',
				icon: 'none',
				duration: 2000
			})
		}
	}
	
	// 使用cookie打开店铺后台webview
	const openShopBackendWebview = (cookie, shopType, officeId) => {
		// #ifdef H5
		uni.showToast({
			title: 'H5环境不支持此功能',
			icon: 'none',
			duration: 2000
		})
		uni.hideLoading()
		return
		// #endif
		
		// #ifdef APP-PLUS
		if (!cookie) {
			uni.hideLoading()
			uni.showToast({
				title: 'cookie信息为空',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 根据shopType获取对应的URL和domain
		let baseUrl = ''
		let domain = ''
		let loadUrl = ''
		
		if (shopType == 1) {
			// 美团外卖
			baseUrl = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
			loadUrl = 'https://e.waimai.meituan.com/'
			domain = '.meituan.com'
		} else if (shopType == 3) {
			// 美团闪购
			baseUrl = 'https://shangoue.meituan.com/'
			loadUrl = baseUrl
			domain = '.meituan.com'
		} else if (shopType == 4) {
			// 美团医药
			baseUrl = 'https://yiyao.meituan.com/#/new_fe/business#/index'
			loadUrl = 'https://yiyao.meituan.com/'
			domain = '.meituan.com'
		} else if (shopType == 2) {
			// 淘宝闪购外卖（原饿了么）
			// 使用完整的dashboard URL（参考shop-management.vue的实现）
			if (officeId) {
				baseUrl = `https://melody.shop.ele.me/app/shop/${officeId}/dashboard#app.shop.dashboard`
			} else {
				baseUrl = 'https://melody.shop.ele.me/'
			}
			loadUrl = 'https://melody.shop.ele.me/'
			domain = '.ele.me'
		} else if (shopType == 5) {
			// 淘宝闪购零售
			baseUrl = 'https://nr.ele.me/'
			loadUrl = baseUrl
			domain = '.ele.me'
	} else if (shopType == 6 || shopType == 8) {
		// 京东平台（零售、外卖）
		baseUrl = 'https://store.jddj.com/'
		loadUrl = baseUrl
		domain = '.jddj.com'
		} else if (shopType == 7 || shopType == 9) {
			// 抖音平台（即时零售、外卖）
			baseUrl = 'https://jsls.jinritemai.com/'
			loadUrl = baseUrl
			domain = '.jinritemai.com'
		} else {
			// 默认使用美团外卖
			baseUrl = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
			loadUrl = 'https://e.waimai.meituan.com/'
			domain = '.meituan.com'
		}
		
		// 清理cookie和缓存
		plus.navigator.removeAllCookie()
		plus.navigator.removeCookie()
		plus.navigator.removeSessionCookie()
		
		plus.cache.clear(() => {
		// 设置User-Agent
		let userAgent = ""
		if (shopType == 2 || shopType == 3 || shopType == 4 || shopType == 6 || shopType == 8) {
			// 淘宝闪购外卖、美团闪购、美团医药、京东平台：使用PC端User-Agent
			const banben = Math.floor(Math.random() * 601) + 1
			userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_" +
				Math.floor(Math.random() * 16) +
				"_7) AppleWebKit/" + banben +
				".36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/" + banben + ".36"
		} else {
			// 其他平台：使用移动端User-Agent
			userAgent = "Mozilla/5.0 (Linux; Android 13; VOG-AL00 Build/TQ3A.230805.001; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/120.0.0.0 Mobile Safari/537.36"
		}
		plus.navigator.setUserAgent(userAgent)
			
			// 设置cookie
			const setCookies = (url) => {
				if (!cookie) return
				
				let js_cookie_arr = cookie.split('; ')
				if (js_cookie_arr.length === 1 && cookie.indexOf(';') >= 0) {
					js_cookie_arr = cookie.split(';')
				}
				
				// 对于美团平台，删除isOfflineSelfOpen cookie项
				if (url && url.includes('meituan.com')) {
					js_cookie_arr = js_cookie_arr.filter(item => {
						return !item.trim().startsWith('isOfflineSelfOpen=')
					})
				}
				
				for (let i in js_cookie_arr) {
					if (!js_cookie_arr[i] || js_cookie_arr[i].trim() === '') {
						continue
					}
					
					const equalIndex = js_cookie_arr[i].indexOf('=')
					if (equalIndex <= 0) {
						continue
					}
					
					const cookieKey = js_cookie_arr[i].substring(0, equalIndex).trim()
					const cookieValue = js_cookie_arr[i].substring(equalIndex + 1).trim()
					const cookieItem = cookieKey + '=' + cookieValue
					
					let cookie_xx = ''
					if (domain) {
						cookie_xx = cookieItem + '; path=/; domain=' + domain
					} else {
						cookie_xx = cookieItem + '; path=/'
					}
					
					try {
						plus.navigator.setCookie(url, cookie_xx)
					} catch (e) {
						// 忽略错误
					}
				}
			}
			
		// 设置cookie
		if (shopType == 6 || shopType == 8) {
			// 京东平台：为多个域名设置cookie
			const jddjUrls = [
				'https://store.jddj.com',
				'https://jddj.com',
				'https://store1.jddj.com',
				'https://login.o2o.jd.com',
				'https://passport.jd.com',
				'https://lsp-store1.jddj.com',
				'https://josl-privilege1.jddj.com'
			]
			for (const url of jddjUrls) {
				setCookies(url)
			}
		} else {
			setCookies(loadUrl)
		}
			
			// 获取窗口信息
			let getWindowInfo = uni.getWindowInfo()
			let systemInfo = uni.getSystemInfoSync()
			const statusBarHeight = systemInfo.statusBarHeight || 0
			const webviewid = `wxpush-webview-${shopType}-${Date.now()}`
			
			// 导航栏颜色配置
			const navBgColor = shopType == 2 || shopType == 5 ? '#0493F7' : '#FACC05'
			const navTextColor = shopType == 2 || shopType == 5 ? '#FFFFFF' : '#333333'
			
			// 先关闭之前打开的 webview（如果存在）
			if (currentBackendWebview) {
				try {
					currentBackendWebview.close()
					currentBackendWebview = null
					showBackendWebview.value = false
				} catch (e) {
				}
			}
			
			// 创建webview配置（带关闭按钮的导航栏）
			const webview_setting = {
				'top': '0', // 从顶部开始
				'bottom': '10%', // 底部留15%空间给关闭按钮
				'width': '100%',
				'titleNView': {
					'backgroundColor': navBgColor,
					'titleText': '店铺后台',
					'titleColor': navTextColor,
					'titleSize': '17px',
					'autoBackButton': false, // 不使用默认返回按钮

					'splitLine': {
						'color': 'rgba(0,0,0,0.1)',
						'height': '1px'
					}
				}
			}
			
			// 创建webview并保存引用
			currentBackendWebview = plus.webview.create(baseUrl, webviewid, webview_setting)
			
			// 对于淘宝闪购外卖（shopType == 2），使用evalJS设置cookie（参考shop-management.vue的实现）
			if (shopType == 2) {
				const setCookieViaEvalJS = () => {
					try {
						// 使用 "; " 分割cookie
						const cookieItems = cookie.split('; ').filter(item => item.trim() && item.indexOf('=') > 0)
						
						// 使用JSON.stringify确保cookie值被正确转义
						let cookieScript = `
							(function() {
								try {
									const cookieItems = ${JSON.stringify(cookieItems)};
									cookieItems.forEach(function(item) {
										if (item && item.indexOf('=') > 0) {
											document.cookie = item + '; path=/; domain=.ele.me';
										}
									});
								} catch(e) {
									// 忽略错误
								}
							})();
						`
						if (currentBackendWebview) {
							currentBackendWebview.evalJS(cookieScript)
						}
					} catch (e) {
						// 忽略错误
					}
				}
				
				// 监听webview的loading事件，在页面加载完成后设置cookie
				let cookieSetFlag = false
				currentBackendWebview.addEventListener('loading', (e) => {
					if (!e.loading) {
						// 页面加载完成
						const currentUrl = currentBackendWebview.getURL()
						if (currentUrl && currentUrl.includes('melody.shop.ele.me') && !cookieSetFlag) {
							cookieSetFlag = true
							// 延迟一点时间确保页面完全加载
							setTimeout(() => {
								setCookieViaEvalJS()
								// 检查当前URL，如果不在dashboard页面，重新加载
								const urlAfterDelay = currentBackendWebview.getURL()
								if (urlAfterDelay && (urlAfterDelay.includes('/login') || !urlAfterDelay.includes('/dashboard'))) {
									setTimeout(() => {
										if (officeId && currentBackendWebview) {
											const redirectUrl = `https://melody.shop.ele.me/app/shop/${officeId}/dashboard#app.shop.dashboard`
											currentBackendWebview.loadURL(redirectUrl)
											cookieSetFlag = false
										}
									}, 300)
								}
							}, 500)
						}
					}
				})
			}
			
			// 监听导航栏按钮点击
			currentBackendWebview.addEventListener('titleNViewButtonClick', (e) => {
				// index 0 是左侧返回按钮，index 1 是右侧关闭按钮
				closeBackendWebview()
			}, false)
			
			// 监听webview的loaded事件
			currentBackendWebview.addEventListener('loaded', () => {
			}, false)
			
			// 显示webview和底部关闭按钮
			currentBackendWebview.show()
			showBackendWebview.value = true
			
			uni.hideLoading()
			
		})
		// #endif
	}
	
	// 关闭后台 webview
	const closeBackendWebview = () => {
		if (currentBackendWebview) {
			try {
				currentBackendWebview.close('auto')
				currentBackendWebview = null
				showBackendWebview.value = false
				zoomLevel.value = 100 // 重置缩放级别
				uni.showToast({
					title: '已关闭',
					icon: 'success',
					duration: 1000
				})
			} catch (e) {
				showBackendWebview.value = false
			}
		} else {
			showBackendWebview.value = false
		}
	}
	
	// 放大页面
	const zoomIn = () => {
		if (!currentBackendWebview) {
			return
		}
		
		// 每次放大10%，最大200%
		if (zoomLevel.value < 200) {
			zoomLevel.value += 10
			applyZoom()
			uni.showToast({
				title: `当前缩放: ${zoomLevel.value}%`,
				icon: 'none',
				duration: 1000
			})
		} else {
			uni.showToast({
				title: '已达到最大缩放',
				icon: 'none',
				duration: 1000
			})
		}
	}
	
	// 缩小页面
	const zoomOut = () => {
		if (!currentBackendWebview) {
			return
		}
		
		// 每次缩小10%，最小50%
		if (zoomLevel.value > 50) {
			zoomLevel.value -= 10
			applyZoom()
			uni.showToast({
				title: `当前缩放: ${zoomLevel.value}%`,
				icon: 'none',
				duration: 1000
			})
		} else {
			uni.showToast({
				title: '已达到最小缩放',
				icon: 'none',
				duration: 1000
			})
		}
	}
	
	// 应用缩放
	const applyZoom = () => {
		if (!currentBackendWebview) {
			return
		}
		
		try {
			// 使用 evalJS 来设置页面缩放
			const zoomValue = zoomLevel.value / 100
			const script = `
				document.body.style.zoom = ${zoomValue};
				document.documentElement.style.zoom = ${zoomValue};
			`
			currentBackendWebview.evalJS(script)
		} catch (e) {
		}
	}
	
	// 复制店铺ID（新方法，与门店管理保持一致）
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
			// 根据功能代码更新对应的开关状态（只处理微信推送功能）
			if (data.code === 'CHATPUSH') {
				shop.CHATPUSH = data.enable
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
	
	onLoad((options) => {
		// 监听店铺功能开关变化事件（在页面加载时设置，确保能接收后台事件）
		uni.$on('shopFunctionChanged', handleShopFunctionChanged)
		getSysteminfo()
		if (options && options.shopType) {
			queryParams.filter.shopType = options.shopType
			tab.value = options.shopType
		}
		// 设置默认筛选参数：显示所有已激活的CHATPUSH功能店铺（和"已激活"按钮一样）
		queryParams.filter.func_code = 'CHATPUSH'
		queryParams.filter.func_state = 1 // 未到期（已激活）
		// 确保 shopType 有默认值（支持所有平台：美团=1, 美团闪购=3, 京东到家=6等）
		if (!queryParams.filter.shopType) {
			queryParams.filter.shopType = tab.value || 1
		}
		
		// 获取当前店铺类型的功能列表
		getSupportedFuncList(queryParams.filter.shopType)
		
		// 如果是从店铺管理页面跳转过来的，自动搜索定位到该店铺
		if (options && options.autoSearch === 'true') {
			// 保存 options 以便在 Promise 回调中使用
			const autoSearchOptions = { ...options }
			// 使用店铺ID搜索（优先使用 office_id，如果没有则使用 id）
			const searchKeyword = autoSearchOptions.office_id || autoSearchOptions.id || ''
			if (searchKeyword) {
				searchValue.value = searchKeyword
				// 先尝试在已激活的店铺中搜索
				queryParams.filter.word = searchKeyword
				queryParams.filter.func_state = 1 // 已激活
				copyFuncFilter.value = 'activated'
				selectedFuncState.value = 0 // 全部
				
				// 获取已激活的店铺列表
				getShopList().then(() => {
					// 检查是否找到了店铺（使用店铺ID匹配）
					const foundShop = shopList.value.find(shop => 
						shop.office_id === autoSearchOptions.office_id || 
						shop.id === autoSearchOptions.id
					)
					
					// 如果在已激活的店铺中没找到，尝试在未激活的店铺中搜索
					if (!foundShop && shopList.value.length === 0) {
						queryParams.filter.func_state = 5 // 已到期（未激活）
						copyFuncFilter.value = 'inactivated'
						selectedFuncState.value = 5 // 已到期
						getShopList()
					}
				}).catch(() => {
					// 如果搜索失败，也尝试在未激活的店铺中搜索
					queryParams.filter.func_state = 5 // 已到期（未激活）
					copyFuncFilter.value = 'inactivated'
					selectedFuncState.value = 5 // 已到期
					getShopList()
				})
			} else {
				getShopList()
			}
		} else {
			getShopList()
		}
		
		getprovincewithcitys()
		getGroupList()
		getUserInfo() // 获取用户信息并更新平台类型数量
	})
	
	onMounted(() => {
		getUserInfo() // 在组件挂载时也获取一次
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
		min-height: calc(100vh - 70px - env(safe-area-inset-bottom));
		height: calc(100vh - 70px - env(safe-area-inset-bottom));
		padding-bottom: 0;
		margin-bottom: 0;
		overflow: hidden;

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
			padding-top: 10rpx;
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
			gap: 10rpx;
			min-width: 0;
			flex: 1;
		}
		
		.shop_buttons_row {
			display: flex;
			flex-direction: row;
			width: 100%;
			flex-wrap: nowrap;
			box-sizing: border-box;
		}
		
		.bind_shop_btn {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			flex: 1 1 auto;
			min-width: 0;
			padding-top: 10rpx;
			padding-bottom: 10rpx;
			padding-left: 0.7rem;
			padding-right: 0.56rem;
			margin-right: 12rpx;
			background-color: #fff;
			border-radius: 10rpx;
			box-sizing: border-box;
			flex-shrink: 0;
			
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
				padding-left: 20rpx;
				white-space: nowrap;
				line-height: 1.2;
				text-align: center;
				flex-shrink: 0;
			}
			
			.img_icon {
				width: 25rpx;
				height: 28rpx;
				flex-shrink: 0;
			}
			
			.status-icon {
				font-size: 28rpx;
				font-weight: bold;
				flex-shrink: 0;
				margin-right: 4rpx;
			}
			
			.status-icon-active {
				color: #52C41A;
			}
			
			.status-icon-inactive {
				color: #FF4D4F;
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
		
		/* 已激活按钮 - 浅绿色渐变 */
		.shop_buttons_row > .bind_shop_btn:nth-child(2) {
			background: linear-gradient(135deg, rgba(82, 196, 26, 0.2) 0%, rgba(56, 158, 13, 0.15) 100%);
			
			.text_choose_1 {
				color: #52C41A;
			}
			
			.img_icon {
				filter: brightness(0.7);
				opacity: 1;
			}
			
			&.filter_active {
				background: linear-gradient(135deg, rgba(82, 196, 26, 0.9) 0%, rgba(56, 158, 13, 0.8) 100%);
				
				.text_choose_1 {
					color: #FFFFFF;
					font-weight: 500;
				}
				
				.status-icon-active {
					color: #FFFFFF;
				}
			}
		}
		
		/* 未激活按钮 - 浅红色渐变 */
		.shop_buttons_row > .bind_shop_btn:nth-child(3) {
			background: linear-gradient(135deg, rgba(248, 28, 58, 0.2) 0%, rgba(230, 0, 18, 0.15) 100%);
			
			.text_choose_3 {
				color: #F81C3A;
			}
			
			.img_icon {
				filter: brightness(1);
				opacity: 1;
			}
			
			&.filter_active {
				background: linear-gradient(135deg, rgba(248, 28, 58, 0.9) 0%, rgba(230, 0, 18, 0.8) 100%);
				
				.text_choose_3 {
					color: #FFFFFF;
					font-weight: 500;
				}
				
				.status-icon-inactive {
					color: #FFFFFF;
				}
			}
		}
		
		/* 回收站按钮（第4个位置） - 浅灰色渐变 */
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
		
		.bind_shop_btn_large {
			flex: 1 1 auto;
			margin-right: 12rpx !important;
		}
		
		/* 最后一个按钮去掉右侧间距 */
		.shop_buttons_row .bind_shop_btn:last-child {
			margin-right: 0 !important;
		}
		
		/* 强制前三个按钮有间距 - 包括带 large 类的 */
		.shop_buttons_row .bind_shop_btn:not(:last-child),
		.shop_buttons_row .bind_shop_btn_large:not(:last-child) {
			margin-right: 12rpx !important;
		}
		
		/* 确保所有按钮（包括前两个带 large 类的）都有间距，除了最后一个 */
		.shop_buttons_row > .bind_shop_btn:nth-child(1),
		.shop_buttons_row > .bind_shop_btn:nth-child(2),
		.shop_buttons_row > .bind_shop_btn:nth-child(3) {
			margin-right: 12rpx !important;
		}
		
		/* 筛选按钮移到右边，与店铺卡片右边框对齐 */
		.filter_btn {
			margin-left: auto !important;
			margin-right: -30rpx !important;
		}
		
		/* 前三个按钮保持在一起 */
		.shop_buttons_row > .bind_shop_btn:not(.filter_btn) {
			flex: 0 0 auto;
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
		margin-top: 18rpx;
			width: 100%;
			box-sizing: border-box;
			padding: 30rpx 30rpx 10rpx 30rpx;
			position: relative;
			z-index: 1;
			overflow: hidden;
		}
		
		.content_box:last-child {
			margin-bottom: 0;
			}

			.content_box:first-child,
			.content_box.first-item {
		margin-top: 0; /* scroll-view 已有 padding-top，所以第一个卡片不需要额外的 margin-top */
		}

		/* 安卓平台调整第一个卡片的顶部间距，使其与iOS保持一致 */
		.content_box.android-first-item {
			margin-top: 0; /* scroll-view 已有 padding-top，所以第一个卡片不需要额外的 margin-top */
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
		
		// 店铺卡片头部样式（与门店管理保持一致）
		.shop-card-header {
			display: flex;
			align-items: flex-start;
			margin-bottom: 12rpx;
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
			margin-right: 16rpx;
			display: flex;
			align-items: flex-start;
			margin-top: -4rpx;

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
		margin-top: 20rpx;
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
		display: flex;
		align-items: center;
		box-sizing: border-box;
		// 为保存按钮留出空间（按钮宽度约 100rpx + 右边距 4rpx）
		padding-right: 110rpx;

		.beiz_input {
			font-size: 24rpx;
			background-color: transparent;
			flex: 1;
			min-width: 0; // 允许输入框缩小
			overflow: visible; // 确保内容可见
		}
		
		// 深度选择器，确保输入框内容可见
		:deep(.wd-input__inner) {
			padding-right: 0 !important;
			overflow: visible !important;
		}
		
		:deep(.wd-input__inner input) {
			padding-right: 0 !important;
			overflow: visible !important;
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
		padding: 8rpx 16rpx 8rpx 16rpx;
		top: 50%;
		transform: translateY(-50%);
		flex-shrink: 0; // 防止按钮被压缩
		z-index: 1; // 确保按钮在输入框上方
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
		margin-top: 30rpx;
		padding: 14rpx 0;
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
		width: 125rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex: 0 0 125rpx;
		min-width: 125rpx;
		max-width: 125rpx;
		/* iOS 布局修复：确保 flex 子元素正确显示 */
		flex-shrink: 0;
		flex-grow: 0;
		flex-basis: 125rpx;
		/* iOS Safari flex 兼容性修复 */
		-webkit-box-flex: 0;
		-webkit-flex: 0 0 125rpx;
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
		align-items: center;
		justify-content: space-between;
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
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
		margin-right: 6rpx;
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
		margin-left: 20rpx;
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

	.filter-item-title {
		margin-bottom: 20rpx;
		font-size: 28rpx;

		text {
			font-size: 20rpx;
			color: rgb(158, 158, 158);
			margin-left: 10rpx;
		}
	}

	.func-state-buttons {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20rpx;
		width: 100%;
	}

	.func-state-btn {
		flex: 1;
		padding: 10rpx 20rpx;
		border: 1px solid transparent;
		border-radius: 4px;
		font-size: 28rpx;
		text-align: center;
		background-color: rgb(240, 240, 240);
		color: #333;
	}

	.func-state-btn.func-state-active {
		border: 1px solid #FACC05;
		color: #333;
		background-color: #FACC05;
	}

	.func-state-btn.func-state-elm-active {
		border: 1px solid #0493F7;
		color: #fff;
		background-color: #0493F7;
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

	.copy-activate-btn {
		width: 140rpx;
		height: 50rpx;
	
		background: linear-gradient(135deg, #FF6B35 0%, #FF8E53 100%);
		border-radius: 25rpx;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(255, 107, 53, 0.3);
		transition: all 0.3s ease;
		flex-shrink: 0;
	}
	
	.copy-activate-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(255, 107, 53, 0.2);
	}
	
	.copy-activate-text {
		color: #FFFFFF;
		font-size: 26rpx;
		font-weight: 500;
		white-space: nowrap;
	}
	
	.chatpush-expire-time {
		display: flex;
		align-items: center;
		margin-left: 0;
		width: 140rpx;
		height: 50rpx;
		padding: 0 10rpx;
		background: rgba(255, 107, 53, 0.1);
		border-radius: 20rpx;
		border: 1rpx solid rgba(255, 107, 53, 0.3);
		white-space: nowrap;
		flex-shrink: 0;
		justify-content: center;
		box-sizing: border-box;
	}
	
	.chatpush-expire-time.chatpush-expired {
		background: rgba(153, 153, 153, 0.1);
		border: 1rpx solid rgba(153, 153, 153, 0.3);
	}
	
	.chatpush-expire-time.chatpush-expire-clickable {
		cursor: pointer;
		transition: all 0.3s ease;
	}
	
	.chatpush-expire-time.chatpush-expire-clickable:active {
		opacity: 0.7;
		transform: scale(0.95);
	}
	
	.chatpush-expired .time-icon,
	.chatpush-expired .expire-time-text {
		color: #999999;
	}
	
	.time-icon {
		color: #FF6B35;
		font-size: 28rpx;
		margin-right: 8rpx;
		line-height: 1;
	}
	
	.expire-time-text {
		color: #FF6B35;
		font-size: 24rpx;
		font-weight: 500;
		white-space: nowrap;
	}
	
	.push-now-btn {
		width: fit-content;
		min-width: 140rpx;
		height: 50rpx;
		padding: 0 10rpx;
		background: linear-gradient(135deg, #1677ff 0%, #4096ff 100%);
		border-radius: 25rpx;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(22, 119, 255, 0.3);
		transition: all 0.3s ease;
		flex-shrink: 0;
	}
	
	.push-now-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(22, 119, 255, 0.2);
	}
	
	.push-now-text {
		color: #FFFFFF;
		font-size: 26rpx;
		font-weight: 500;
		white-space: nowrap;
	}
	
	.copy-report-btn {
		width: fit-content;
		min-width: 140rpx;
		height: 50rpx;
		padding: 0 10rpx;
		background: linear-gradient(135deg, #52c41a 0%, #73d13d 100%);
		border-radius: 25rpx;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 4rpx 12rpx rgba(82, 196, 26, 0.3);
		transition: all 0.3s ease;
		flex-shrink: 0;
	}
	
	.copy-report-btn:active {
		transform: scale(0.95);
		box-shadow: 0 2rpx 8rpx rgba(82, 196, 26, 0.2);
	}
	
	.copy-report-text {
		color: #FFFFFF;
		font-size: 26rpx;
		font-weight: 500;
		white-space: nowrap;
	}
	
	.push-switch-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 100rpx;
	}
	
	.push-switch-label-wrapper {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-left: 70rpx;
		width: 140rpx;
	}
	
	.push-switch-label {
		color: #333333;
		font-size: 24rpx;
		font-weight: 400;
		white-space: nowrap;
		text-align: center;
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
	
	/* 底部关闭后台按钮区域 */
	.backend-bottom-close-area {
		position: fixed;
		bottom: 0;
		left: 0;
		width: 100%;
		height: 200rpx; /* 底部区域高度 */
		background-color: rgba(0, 0, 0, 0.6); /* 半透明黑色背景 */
		z-index: 99999; /* 确保在最顶层 */
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 20rpx; /* 按钮之间的间距 */
		padding: 0 40rpx;
		box-sizing: border-box;
	}
	
	.backend-close-btn {
		width: 280rpx;
		height: 100rpx;
		background-color: #FFFFFF;
		border-radius: 50rpx;
		border: 8rpx solid #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}
	
	.backend-zoom-btn {
		width: 160rpx;
		height: 100rpx;
		background-color: #4CAF50; /* 绿色背景 */
		border-radius: 50rpx;
		border: 8rpx solid #2E7D32; /* 深绿色边框 */
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
	}
	
	.close-btn-text {
		color: #000000;
		font-size: 36rpx;
		font-weight: bold;
		text-align: center;
		line-height: 1;
	}
	
	.zoom-btn-text {
		color: #FFFFFF;
		font-size: 32rpx;
		font-weight: bold;
		text-align: center;
		padding: 5rpx 10rpx;
		line-height: 1;
	}
</style>
/* <style>
	.wd-collapse-item__wrapper {
		overflow: inherit !important;
	}
</style> */