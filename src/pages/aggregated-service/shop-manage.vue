<template>
	<view class="shop-manage">
		<wd-navbar :fixed="true" :safeAreaInsetTop="true" title="店铺管理" left-text="返回" left-arrow @click-left="handleClickLeft" :bordered="false"></wd-navbar>
		
		<!-- 店铺类型筛选 -->
		<view class="filter-tabs">
			<scroll-view class="filter-scroll" scroll-x="true">
				<view 
					class="filter-tab" 
					:class="{ 'active': currentShopType === item.value }"
					v-for="item in shopTypeList" 
					:key="item.value"
					@click="switchShopType(item.value)"
				>
					<image v-if="item.logo" class="filter-tab-logo" :src="item.logo" mode="aspectFit"></image>
					<text class="filter-tab-text">{{ item.label }}</text>
				</view>
			</scroll-view>
		</view>

		<!-- 搜索和筛选区域 -->
		<view class="search-filter-section">
			<!-- 添加店铺、绑定店铺和筛选按钮 -->
			<view class="shop_buttons_row">
				<view class="bind_shop_btn bind_shop_btn_large" @click="handleAddShop">
					<image src="../../static/store/add_icon.png" class="img_icon"></image>
					<text class="text-choose text_choose_2">添加店铺</text>
				</view>
				<view class="bind_shop_btn bind_shop_btn_large" @click="handleBindShop">
					<image src="../../static/store/bind_icon.png" class="img_icon"></image>
					<text class="text-choose text_choose_1">绑定门店</text>
				</view>
				<view class="bind_shop_btn filter_btn" @click="openFilter">
					<image src="../../static/store/shaix_icon.png" class="img_icon"></image>
					<text class="text-choose text_choose_4">{{ filterButtonText }}</text>
				</view>
			</view>
			<!-- 搜索框 -->
			<view class="search">
				<image src="@/static/shop/icon_016a.png" class="search_icon" mode="aspectFit"></image>
				<input class="search_input" v-model="searchKeyword" placeholder="输入店名或ID" @confirm="handleSearch" />
				<view class="search_btn">
					<view class="btn_min" @click="handleSearch">搜索</view>
				</view>
			</view>
		</view>

		<!-- 店铺列表 - 左右选项卡布局 -->
		<view class="shop-tabs-container">
			<!-- 选项卡头部 -->
			<view class="shop-tabs-header">
				<view 
					class="shop-tab-item" 
					:class="{ 'active': currentTab === 'activated' }"
					@click="switchTab('activated')"
				>
					<text class="tab-title">已激活</text>
					<text class="tab-count">({{ activatedTotal }})</text>
				</view>
				<view 
					class="shop-tab-item" 
					:class="{ 'active': currentTab === 'unactivated' }"
					@click="switchTab('unactivated')"
				>
					<text class="tab-title">未激活</text>
					<text class="tab-count">({{ unactivatedTotal }})</text>
				</view>
			</view>

			<!-- 选项卡内容 -->
			<view class="shop-tabs-content">
				<!-- 已激活店铺列表 -->
				<scroll-view 
					v-show="currentTab === 'activated'"
					class="shop-list-scroll" 
					scroll-y="true"
					:refresher-enabled="true"
					:refresher-triggered="refreshing"
					@refresherrefresh="handleRefresh"
					@scroll="closeTooltip"
				>
					<view
						class="shop-card"
						v-for="shop in activatedShops"
						:key="shop.id"
						:style="{ borderColor: currentPlatformBorderColor, ...getShopCardBgStyle }"
						@click="closeTooltip"
					>
						<view class="shop-card-header">
							<view class="shop-avatar-wrapper">
								<image 
									class="shop-avatar" 
									:src="shop.img || getShopTypeLogo(shop.shop_type)" 
									mode="aspectFill"
								></image>
								<view class="copy-info-btn" @click="handleCopyMsg(shop)">
									<text class="copy-info-text">复制信息</text>
								</view>
							</view>
							<view class="shop-info">
								<view class="shop-name-row">
									<text class="shop-name">{{ shop.name || '未知店铺' }}</text>
								</view>
								<view class="shop-status-row">
									<view class="status-left-group">
										<text class="status-dot status-normal"></text>
										<text class="status-text status-business" :class="getShopStateClass(shop.state)">
											{{ getShopStateText(getDisplayState(shop)) }}
										</text>
									</view>
									<view class="status-right-group">
										<view class="meta-id-wrapper" @click="handleCopyShopId(shop)">
											<text class="meta-text">ID {{ shop.office_id || shop.id || '-' }}</text>
											<image
												class="meta-copy-icon"
												src="../../static/icon/icon_copy.png"
												mode="aspectFit"
											></image>
										</view>
										<text class="meta-separator">｜</text>
										<view class="meta-city-wrapper" v-if="shop.city" @click="handleShowCityFullName(shop, $event)">
											<image
												class="meta-location-icon"
												src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng5e47281d477be859cb54102bcf35e760849d4707a399045ceae9cd882bc517b6"
												mode="aspectFit"
											></image>
											<text class="meta-text city-text" :id="'city-text-' + shop.id" ref="cityTextRef">{{ shop.city }}</text>
										</view>
									</view>
								</view>
								<view class="shop-auth-row">
									<view class="auth-left-group">
										<text class="status-dot status-auth" v-if="getDisplayAuthStatus(shop)"></text>
										<text class="status-dot status-auth-off" v-else></text>
										<text class="status-text status-auth-text" :class="getDisplayAuthStatus(shop) ? 'authorized' : 'unauthorized'">
											{{ getDisplayAuthStatus(shop) ? '授权正常' : '授权异常' }}
										</text>
										<view class="help-icon-wrapper" v-if="!getDisplayAuthStatus(shop)" @click.stop="showAuthTooltip($event, shop)">
											<view class="help-icon">
												<text class="help-text">?</text>
											</view>
											<view class="tooltip-bubble" v-if="currentTooltipShop === shop && currentTooltipType === 'auth'">
												<text class="tooltip-text">{{ authTooltipText }}</text>
											</view>
										</view>
									</view>
									<view class="auth-right-group">
										<text class="auth-time-inline">授权时间：{{ formatAuthTime(shop.ck_uptime) }}</text>
									</view>
								</view>
							</view>
						</view>
						
						<view class="shop-card-body">
							<view class="shop-detail-row remark-row">
								<text class="remark-label">备注：</text>
								<view class="remark-input-wrapper">
									<wd-input
										type="text"
										class="remark-input"
										v-model="shop.notes"
										placeholder="点击输入内容"
										:no-border="true"
									/>
									<view class="remark-save-btn" @click="handleSaveNotes(shop)">
										<text class="remark-save-text">保存</text>
									</view>
								</view>
							</view>
							<view class="shop-detail-row switch-row">
								<view class="switch-content-wrapper">
									<text class="detail-label">IM客服功能</text>
									<view class="help-icon-wrapper" @click.stop="showKefuTooltip($event, shop)">
										<view class="help-icon">
											<text class="help-text">?</text>
										</view>
										<view class="tooltip-bubble" v-if="currentTooltipShop === shop && currentTooltipType === 'kefu'">
											<text class="tooltip-text">{{ kefuTooltipText }}</text>
										</view>
									</view>
									<text class="detail-colon">:</text>
									<switch 
										:checked="shop.imKefuEnabled" 
										@change="handleToggleIMKefu(shop, $event)"
										color="#1677ff"
										class="function-switch"
									/>
									<text class="detail-time" v-if="shop.kefuEndTime">到期: {{ formatDate(shop.kefuEndTime) }}</text>
									<view class="action-buttons">
										<view class="renew-btn" @click="handleRenewFunc(shop, 'KEFU')" v-if="shop.kefuEndTime">
											<text class="renew-btn-text">续费</text>
										</view>
									</view>
								</view>
							</view>
							<view class="shop-detail-row switch-row">
								<view class="switch-content-wrapper">
									<text class="detail-label">IM自动回复</text>
									<view class="help-icon-wrapper" @click.stop="showAutoReplyTooltip($event, shop)">
										<view class="help-icon">
											<text class="help-text">?</text>
										</view>
										<view class="tooltip-bubble" v-if="currentTooltipShop === shop && currentTooltipType === 'autoReply'">
											<text class="tooltip-text">{{ autoReplyTooltipText }}</text>
										</view>
									</view>
									<text class="detail-colon">:</text>
									<switch 
										:checked="shop.imAutoReplyEnabled" 
										@change="handleToggleIMAutoReply(shop, $event)"
										color="#1677ff"
										class="function-switch"
									/>
									<text class="detail-time" v-if="shop.imAutoReplyEndTime">到期: {{ formatDate(shop.imAutoReplyEndTime) }}</text>
									<view class="action-buttons">
										<view class="function-setting-btn" @click="handleOpenIMAutoReplySetting(shop)">
											<text class="setting-btn-text">功能设置</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<view class="empty-state" v-if="!loading && activatedShops.length === 0">
						<text class="empty-text">暂无已激活店铺</text>
					</view>
				</scroll-view>

				<!-- 未激活店铺列表 -->
				<scroll-view 
					v-show="currentTab === 'unactivated'"
					class="shop-list-scroll" 
					scroll-y="true"
					:refresher-enabled="true"
					:refresher-triggered="refreshing"
					@refresherrefresh="handleRefresh"
					@scroll="closeTooltip"
				>
					<view
						class="shop-card"
						v-for="shop in unactivatedShops"
						:key="shop.id"
						:style="{ borderColor: currentPlatformBorderColor, ...getShopCardBgStyle }"
						@click="closeTooltip"
					>
						<view class="shop-card-header">
							<view class="shop-avatar-wrapper">
								<image 
									class="shop-avatar" 
									:src="shop.img || getShopTypeLogo(shop.shop_type)" 
									mode="aspectFill"
								></image>
								<view class="copy-info-btn" @click="handleCopyMsg(shop)">
									<text class="copy-info-text">复制信息</text>
								</view>
							</view>
							<view class="shop-info">
								<view class="shop-name-row">
									<text class="shop-name">{{ shop.name || '未知店铺' }}</text>
								</view>
								<view class="shop-status-row">
									<view class="status-left-group">
										<text class="status-dot status-normal"></text>
										<text class="status-text status-business" :class="getShopStateClass(shop.state)">
											{{ getShopStateText(getDisplayState(shop)) }}
										</text>
									</view>
									<view class="status-right-group">
										<view class="meta-id-wrapper" @click="handleCopyShopId(shop)">
											<text class="meta-text">ID {{ shop.office_id || shop.id || '-' }}</text>
											<image
												class="meta-copy-icon"
												src="../../static/icon/icon_copy.png"
												mode="aspectFit"
											></image>
										</view>
										<text class="meta-separator">｜</text>
										<view class="meta-city-wrapper" v-if="shop.city" @click="handleShowCityFullName(shop, $event)">
											<image
												class="meta-location-icon"
												src="https://lanhu.oss-cn-beijing.aliyuncs.com/SketchPng5e47281d477be859cb54102bcf35e760849d4707a399045ceae9cd882bc517b6"
												mode="aspectFit"
											></image>
											<text class="meta-text city-text" :id="'city-text-' + shop.id" ref="cityTextRef">{{ shop.city }}</text>
										</view>
									</view>
								</view>
								<view class="shop-auth-row">
									<view class="auth-left-group">
										<text class="status-dot status-auth" v-if="getDisplayAuthStatus(shop)"></text>
										<text class="status-dot status-auth-off" v-else></text>
										<text class="status-text status-auth-text" :class="getDisplayAuthStatus(shop) ? 'authorized' : 'unauthorized'">
											{{ getDisplayAuthStatus(shop) ? '授权正常' : '授权异常' }}
										</text>
										<view class="help-icon-wrapper" v-if="!getDisplayAuthStatus(shop)" @click.stop="showAuthTooltip($event, shop)">
											<view class="help-icon">
												<text class="help-text">?</text>
											</view>
											<view class="tooltip-bubble" v-if="currentTooltipShop === shop && currentTooltipType === 'auth'">
												<text class="tooltip-text">{{ authTooltipText }}</text>
											</view>
										</view>
									</view>
									<view class="auth-right-group">
										<text class="auth-time-inline">授权时间：{{ formatAuthTime(shop.ck_uptime) }}</text>
									</view>
								</view>
							</view>
						</view>
						
						<view class="shop-card-body">
							<view class="shop-detail-row remark-row">
								<text class="remark-label">备注：</text>
								<view class="remark-input-wrapper">
									<wd-input
										type="text"
										class="remark-input"
										v-model="shop.notes"
										placeholder="点击输入内容"
										:no-border="true"
									/>
									<view class="remark-save-btn" @click="handleSaveNotes(shop)">
										<text class="remark-save-text">保存</text>
									</view>
								</view>
							</view>
							<view class="shop-detail-row switch-row">
								<view class="switch-content-wrapper">
									<text class="detail-label">IM客服功能</text>
									<view class="help-icon-wrapper" @click.stop="showKefuTooltip($event, shop)">
										<view class="help-icon">
											<text class="help-text">?</text>
										</view>
										<view class="tooltip-bubble" v-if="currentTooltipShop === shop && currentTooltipType === 'kefu'">
											<text class="tooltip-text">{{ kefuTooltipText }}</text>
										</view>
									</view>
									<text class="detail-colon">:</text>
									<switch 
										:checked="shop.imKefuEnabled" 
										@change="handleToggleIMKefu(shop, $event)"
										color="#1677ff"
										class="function-switch"
									/>
									<text class="detail-time" v-if="shop.kefuEndTime">到期: {{ formatDate(shop.kefuEndTime) }}</text>
									<text class="detail-time" v-else>已到期</text>
									<view class="action-buttons">
										<view class="renew-btn" @click="handleRenewFunc(shop, 'KEFU')">
											<text class="renew-btn-text">续费</text>
										</view>
									</view>
								</view>
							</view>
							<view class="shop-detail-row switch-row">
								<view class="switch-content-wrapper">
									<text class="detail-label">IM自动回复</text>
									<view class="help-icon-wrapper" @click.stop="showAutoReplyTooltip($event, shop)">
										<view class="help-icon">
											<text class="help-text">?</text>
										</view>
										<view class="tooltip-bubble" v-if="currentTooltipShop === shop && currentTooltipType === 'autoReply'">
											<text class="tooltip-text">{{ autoReplyTooltipText }}</text>
										</view>
									</view>
									<text class="detail-colon">:</text>
									<switch 
										:checked="shop.imAutoReplyEnabled" 
										@change="handleToggleIMAutoReply(shop, $event)"
										color="#1677ff"
										class="function-switch"
									/>
									<text class="detail-time" v-if="shop.imAutoReplyEndTime">到期: {{ formatDate(shop.imAutoReplyEndTime) }}</text>
									<view class="action-buttons">
										<view class="function-setting-btn" @click="handleOpenIMAutoReplySetting(shop)">
											<text class="setting-btn-text">功能设置</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
					
					<view class="empty-state" v-if="!loading && unactivatedShops.length === 0">
						<text class="empty-text">暂无未激活店铺</text>
					</view>
				</scroll-view>
			</view>
		</view>

		<view class="loading-more" v-if="loading">
			<text class="loading-text">加载中...</text>
		</view>

		<!-- 分页组件 -->
		<view class="pagination-fixed-container" v-if="currentTabShops.length > 0">
			<view class="pagination-wrapper">
				<!-- 首页按钮 -->
				<view class="pagination-first-btn" @click="goToFirstPage">
					<text class="first-btn-text">首页</text>
				</view>
				<wd-pagination class="pagination-pager" v-model.async="pageIndex"
					:total="currentTabTotal" :page-size.async="pageSize" @change="handlePageChange"
					show-icon></wd-pagination>
				<!-- 可编辑页码输入框 -->
				<view class="pagination-page-input">
					<input ref="pageInputRef" class="page-input" type="number" :value="pageIndex" @input="handlePageInputChange" @blur="handlePageInput" @confirm="handlePageInput" />
					<text class="page-separator">/</text>
					<text class="page-total">{{ currentTabTotalPages }}</text>
				</view>
				<!-- 末页按钮 -->
				<view class="pagination-last-btn" @click="goToLastPage">
					<text class="last-btn-text">末页</text>
				</view>
			</view>
		</view>

		<!-- 筛选弹窗 -->
		<wd-action-sheet v-model="showFilterPopup" @close="closeFilter" title="筛选" :z-index="600">
			<view style="padding: 15px;">
				<!-- 已激活tab显示功能状态筛选，未激活tab不显示 -->
				<view class="filter-item" v-if="currentTab === 'activated'">
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
							:class="{'is-active': authorizeIndex === 1}"
							@click="selectAuthorize(1)">全部</view>
						<view class="filter-list-item"
							:class="{'is-active': authorizeIndex === 2}"
							@click="selectAuthorize(2)">授权正常</view>
						<view class="filter-list-item"
							:class="{'is-active': authorizeIndex === 3}"
							@click="selectAuthorize(3)">授权异常</view>
					</view>
				</view>
				<view class="filter-item">
					<view class="filter-item-title">
						筛选类别
					</view>
					<view class="filter-list">
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 1}"
							@click="selectCategory(1)">按店铺筛选</view>
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 2}"
							@click="selectCategory(2)">按分组筛选</view>
						<view class="filter-list-item"
							:class="{'is-active': categoryIndex === 3}"
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
							:class="{'is-active': selsectType === undefined}"
							@click="selectFilterType(undefined)">全部</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 4}"
							@click="selectFilterType(4)">营业中</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 5}"
							@click="selectFilterType(5)">暂停营业</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 6}"
							@click="selectFilterType(6)">上线中</view>
						<view class="filter-list-item"
							:class="{'is-active': selsectType === 7}"
							@click="selectFilterType(7)">已下线</view>
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
				<view class="confirm-filter" @click="confirmFilter">确认</view>
			</view>
		</wd-action-sheet>
		
		<!-- 绑定店铺弹窗 -->
		<wd-popup v-model="bindState" position="center" :z-index="601" custom-style="width: 80%; max-height: 60vh;">
			<view class="bind-popup-content">
				<view class="bind-popup-header">
					<text class="bind-popup-title">绑定店铺</text>
					<view class="bind-popup-close" @click="closeBind">✕</view>
				</view>
				<view class="bind-popup-body">
					<view class="bind-code-input">
						<wd-input 
							v-model="bindCode" 
							:no-border="true" 
							placeholder="请输入绑定码" 
							class="bind-input-main" 
						/>
					</view>
				</view>
				<view class="bind-popup-footer">
					<wd-button type="info" size="large" @click="closeBind" block>取消</wd-button>
					<wd-button size="large" @click="confirmBind" block>确定</wd-button>
				</view>
			</view>
		</wd-popup>
		
		<!-- 添加店铺选项弹窗 -->
		<wd-popup 
			v-model="addShopOptionsVisible" 
			position="center"
			custom-style="width: 80%;max-height: 600rpx;border-radius: 20rpx;padding: 30rpx;" 
			@close="addShopOptionsVisible = false"
			:z-index="601"
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
		
		<!-- 添加店铺webview弹窗 -->
		<wd-popup v-model="colseShow" position="bottom" :closable="true" custom-style="height: 90%" @close="colseV"
			:z-index="601">
			<view class="popup-box">
				<view class="p-title ft30 tc">{{ isRepair ? '修复店铺' : '添加店铺' }}</view>
			</view>
		</wd-popup>

		<!-- 续费弹窗 -->
		<wd-popup v-model="renewPopupVisible" position="center" :z-index="600" custom-style="width: 90%; max-height: 80vh;">
			<SettingPopupPlanContent
				v-if="renewPopupVisible"
				:currentClickCardId="currentRenewShopId"
				:isFullPopupPlan="false"
				:authGoodsList="renewPriceList"
				:shopId="currentRenewShopId"
				:priceTitle="renewPriceTitle"
				:isV2="true"
				:shopType="currentShopType"
				:isIMKefuRenew="true"
				@closePopup="closeRenewPopup"
				@setEndtime="handleRenewEndtime"
				@updataShopFunc="handleRenewEndtime"
				@success="handleRenewSuccess"
			/>
		</wd-popup>

		<!-- 帮助提示弹窗 -->
		<wd-popup v-model="helpPopupVisible" position="center" :z-index="601" custom-style="width: 80%; max-height: 60vh;">
			<view class="help-popup-content">
				<view class="help-popup-header">
					<text class="help-popup-title">{{ helpTitle }}</text>
					<view class="help-popup-close" @click="closeHelpPopup">✕</view>
				</view>
				<view class="help-popup-body">
					<text class="help-popup-text">{{ helpContent }}</text>
				</view>
			</view>
		</wd-popup>

	</view>
</template>

<script setup>
	import { ref, onMounted, computed, nextTick, watch } from 'vue'
	import { ShopApi } from '@/api/shop'
	import { ManagementApi } from '@/api/management'
	import { getRenewQuoteList } from '@/api/pay'
	import { mapPayQuoteToSpecRow } from '@/utils/payRenewFlow'
	import SettingPopupPlanContent from '@/components/SettingPopupPlanContent.vue'
	import { useAuthStore } from '@/store/auth.ts'
	import { UserApi } from '@/api/login'

	const systemBarHeight = ref(0)
	const authStore = useAuthStore()
	const currentShopType = ref(1) // 默认美团
	const currentTab = ref('activated') // 当前选项卡：activated 或 unactivated
	const shopList = ref([])
	const loading = ref(false)
	const refreshing = ref(false)
	const pageIndex = ref(1)
	const pageSize = ref(10)
	const total = ref(0)
	const activatedTotal = ref(0) // 已激活店铺总数
	const unactivatedTotal = ref(0) // 未激活店铺总数
	
	// 为每个tab维护独立的数据缓存（按页码）
	const activatedShopCache = ref(new Map()) // Map<page, shop[]>
	const unactivatedShopCache = ref(new Map()) // Map<page, shop[]>
	
	// 当前页的店铺数据（直接从API返回的数据，不依赖缓存）
	const currentPageActivatedShops = ref([])
	const currentPageUnactivatedShops = ref([])

	// 工具函数：确保值是数字类型（处理 wd-pagination 可能传递对象的情况）
	const ensureNumber = (value, defaultValue = 1) => {
		if (typeof value === 'number') return value
		if (typeof value === 'object' && value?.value !== undefined) return Number(value.value) || defaultValue
		const num = parseInt(value)
		return isNaN(num) ? defaultValue : num
	}
	const searchKeyword = ref('')
	const showFilterPopup = ref(false)
	const pageInputRef = ref(null)
	const bindState = ref(false)
	const bindCode = ref('')
	
	// 添加店铺相关
	let checkinter = null
	let w = null
	const colseShow = ref(false)
	const cookieStr = ref('')
	const isRepair = ref(false)
	
	// 筛选相关
	const categoryIndex = ref(1)
	const cityList = ref([])
	const provinceList = ref([])
	const checkCityList = ref([])
	const selsectType = ref(undefined)
	const authorizeIndex = ref(1)
	const groupList = ref([])
	const selectGroup = ref([])
	const selectItemGroup = ref([])
	const proupValue = ref('')
	const funFilterItem = ref([])
	const isChooseStr = ref('')
	const chooseFilterFunVal = ref([])
	
	// 已激活tab的功能筛选列表（全部、已开启、已关闭、即将到期）
	const activatedFunFilterList = ref([
		[{
			label: 'IM客服',
			value: 'KEFU',
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
					label: '即将到期',
					value: 2
				}
			]
		}]
	])
	
	// 未激活tab不显示功能筛选，使用computed动态返回
	const funFilterList = computed(() => {
		if (currentTab.value === 'activated') {
			return activatedFunFilterList.value
		} else {
			// 未激活时不显示功能筛选
			return []
		}
	})
	
	// 筛选条件
	const filterParams = ref({
		func_code: undefined,
		func_state: undefined,
		ck_online: undefined,
		state: undefined,
		group: undefined,
		citys: undefined
	})
	
	// 续费相关
	const renewPopupVisible = ref(false)
	const currentRenewShopId = ref('')
	const currentRenewShop = ref(null) // 保存当前续费的店铺对象
	const renewPriceList = ref([])
	const renewPriceTitle = ref('IM客服_月')
	
	// 帮助提示相关（气泡提示）
	const currentTooltipShop = ref(null)
	const currentTooltipType = ref('') // 'kefu'、'autoReply' 或 'auth'
	const kefuTooltipText = ref('开启后，不同平台店铺的顾客消息，都会在聚合客服工作台显示并统一进行回复，无需来回切换店铺。')
	const autoReplyTooltipText = ref('开启后，当顾客在店铺的消息无人工响应时，会根据设置的时长自动回复预设消息。')
	const authTooltipText = ref('授权异常会导致功能无法正常使用，请重新添加店铺恢复授权。')
	
	// 帮助提示相关（旧版弹窗，保留兼容）
	const helpPopupVisible = ref(false)
	const helpTitle = ref('')
	const helpContent = ref('')

	// 平台logo映射
	const platformLogos = new Map()
	platformLogos.set(1, 'https://p0.meituan.net/shangouproductapi/8bb7f604d4c10239f736f2c450ce92ef93342.png') // 美团餐饮
	platformLogos.set(2, 'https://p0.meituan.net/shangouproductapi/280765bbbe4aeb0603d386eea888ab8c151948.png') // 饿了么
	platformLogos.set(3, 'https://p0.meituan.net/shangouproductapi/e4f5dff1d5445c2895d6ca9e3a55bf2744440.png') // 美团闪购
	platformLogos.set(4, 'https://p0.meituan.net/shangouproductapi/a4022ea3fb17f68c43ecbfcec893c836102681.png') // 美团医药
	platformLogos.set(5, 'https://p0.meituan.net/shangouproductapi/546c580071907f18b7b9ea913fc29812158401.png') // 饿百零售
	platformLogos.set(6, 'https://p0.meituan.net/shangouproductapi/2d32bf9149d3004cb0a01f2ca6465e6e107072.png') // 京东到家

	const shopTypeList = [
		{ label: '美团餐饮', value: 1, logo: platformLogos.get(1) },
		{ label: '饿了么', value: 2, logo: platformLogos.get(2) },
		{ label: '京东到家', value: 6, logo: platformLogos.get(6) },
		{ label: '美团闪购', value: 3, logo: platformLogos.get(3) },
		{ label: '美团医药', value: 4, logo: platformLogos.get(4) },
		{ label: '饿百零售', value: 5, logo: platformLogos.get(5) }
	]

	// 平台背景渐变色（沿用门店管理页面的设计）
	const platformBgColors = {
		1: ['#FFF9E6', '#FFFFFF'],  // 美团餐饮 - 淡黄色渐变
		2: ['#E6F4FF', '#FFFFFF'],  // 饿了么 - 淡蓝色渐变
		3: ['#FFF9E6', '#FFFFFF'],  // 美团闪购 - 淡黄色渐变
		4: ['#E6F9E6', '#FFFFFF'],  // 美团医药 - 淡绿色渐变
		5: ['#E6F4FF', '#FFFFFF'],  // 饿百零售 - 淡蓝色渐变
		6: ['#FFE6E6', '#FFFFFF'],  // 京东到家 - 淡红色渐变
		7: ['#F5F5F5', '#FFFFFF'],  // 预留
		8: ['#E6F4FF', '#FFFFFF']   // 预留
	}

	// 平台边框颜色（沿用门店管理页面的设计）
	const platformBorderColors = {
		1: '#FACC05',  // 美团餐饮
		2: '#0493F7',  // 饿了么
		3: '#FACC05',  // 美团闪购
		4: '#2CCA87',  // 美团医药
		5: '#0493F7',  // 饿百零售
		6: '#E1251B',  // 京东到家
		7: '#000000',  // 预留
		8: '#0493F7'   // 预留
	}

	// 当前平台边框颜色 & 卡片背景样式（与门店管理保持一致的风格）
	const currentPlatformBorderColor = computed(() => {
		return platformBorderColors[currentShopType.value] || '#FACC05'
	})

	const getShopCardBgStyle = computed(() => {
		const colors = platformBgColors[currentShopType.value] || ['#FFFFFF', '#FFFFFF']
		return {
			background: `linear-gradient(135deg, ${colors[0]} 0%, ${colors[1]} 100%)`
		}
	})

	// 根据功能状态分类店铺（func_state: 1 = 未到期/已激活, 5 = 已到期/未激活）
	// 只显示当前页的数据
	const activatedShops = computed(() => {
		return currentPageActivatedShops.value
	})
	
	const unactivatedShops = computed(() => {
		return currentPageUnactivatedShops.value
	})
	
	// 当前tab的店铺列表
	const currentTabShops = computed(() => {
		return currentTab.value === 'activated' ? activatedShops.value : unactivatedShops.value
	})
	
	// 当前tab的总数
	const currentTabTotal = computed(() => {
		return currentTab.value === 'activated' ? activatedTotal.value : unactivatedTotal.value
	})
	
	// 当前tab的总页数
	const currentTabTotalPages = computed(() => {
		return Math.ceil(currentTabTotal.value / pageSize.value) || 1
	})
	
	// 筛选按钮文本（根据IM客服功能状态筛选显示）
	const filterButtonText = computed(() => {
		// 只在已激活tab且有筛选条件时显示筛选状态
		if (currentTab.value === 'activated' && chooseFilterFunVal.value && chooseFilterFunVal.value.length >= 2) {
			const funcState = chooseFilterFunVal.value[1]
			// 根据func_state值返回对应的文本
			switch (funcState) {
				case 0:
					return '全部'
				case 3:
					return '已开启'
				case 4:
					return '已关闭'
				case 2:
					return '即将到期'
				default:
					return '筛选'
			}
		}
		return '筛选'
	})

	const getSysteminfo = () => {
		uni.getSystemInfo({
			success: res => {
				systemBarHeight.value = res.statusBarHeight
			}
		})
	}

	const handleClickLeft = () => {
		uni.navigateBack()
	}

	const switchTab = async (tab) => {
		// 如果切换到同一个tab，不执行任何操作
		if (currentTab.value === tab) {
			return
		}
		
		currentTab.value = tab
		
		// 切换tab时，从缓存中恢复该tab当前页码的数据，如果缓存中没有，才加载
		const currentPage = ensureNumber(pageIndex.value, 1)
		const cache = tab === 'activated' ? activatedShopCache.value : unactivatedShopCache.value
		const otherCache = tab === 'activated' ? unactivatedShopCache.value : activatedShopCache.value
		
		// 如果当前tab当前页码的数据在缓存中，直接使用缓存
		if (cache.has(currentPage)) {
			const currentTabShops = cache.get(currentPage) || []
			
			// 确保使用全新的数组，不包含任何旧数据引用
			const freshShops = currentTabShops.map(shop => ({ ...shop })) // 深拷贝每个店铺对象，避免引用问题
			
			// 直接更新当前页的店铺数据（完全替换，严格按照缓存中的数据）
			// 先完全清空，再赋值，确保 Vue 响应式系统正确检测到变化
			if (tab === 'activated') {
				// 清空另一个tab的数据
				currentPageUnactivatedShops.value = []
				// 先完全清空当前tab的数据
				currentPageActivatedShops.value = []
				// 使用 nextTick 确保清空操作完成
				await nextTick()
				// 再赋值新数据（完全替换，不累积）
				currentPageActivatedShops.value = [...freshShops]
			} else {
				// 清空另一个tab的数据
				currentPageActivatedShops.value = []
				// 先完全清空当前tab的数据
				currentPageUnactivatedShops.value = []
				// 使用 nextTick 确保清空操作完成
				await nextTick()
				// 再赋值新数据（完全替换，不累积）
				currentPageUnactivatedShops.value = [...freshShops]
			}
			
			// 更新shopList（用于其他功能，如续费时查找店铺）
			const otherTabFirstPageShops = otherCache.get(1) || []
			if (tab === 'activated') {
				shopList.value = [...freshShops, ...otherTabFirstPageShops]
			} else {
				shopList.value = [...otherTabFirstPageShops, ...freshShops]
			}
		} else {
			// 如果缓存中没有当前页码的数据，重置为第1页再加载数据
			// 这样可以避免在"未激活"tab翻页后切换到"已激活"tab时，因为pageIndex不是1而导致显示异常
			pageIndex.value = 1
			loadShopList()
		}
	}

	const switchShopType = (shopType) => {
		currentShopType.value = shopType
		pageIndex.value = 1
		shopList.value = []
		currentPageActivatedShops.value = []
		currentPageUnactivatedShops.value = []
		searchKeyword.value = ''
		// 清空缓存
		activatedShopCache.value.clear()
		unactivatedShopCache.value.clear()
		loadShopList()
	}

	const loadShopList = async () => {
		if (loading.value) return
		
		loading.value = true
		
		// 显示加载提示
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		
		// 构建查询参数函数（已激活 func_state = 1，未激活 func_state = 5）
		const buildQueryParams = (funcState) => {
			const filter = {
				shopType: currentShopType.value,
				func_code: 'KEFU',
				func_state: funcState
			}
			// 只有当搜索关键词不为空时才添加 word 参数
			if (searchKeyword.value?.trim()) {
				filter.word = searchKeyword.value.trim()
			}
			
			// 应用筛选条件
			// IM客服功能状态 - 根据传入的funcState参数判断，而不是currentTab
			if (funcState === 1) {
				// 已激活tab（func_state=1）：如果筛选条件中有功能状态，使用筛选条件
				if (filterParams.value.func_code) {
					filter.func_code = filterParams.value.func_code
				}
				if (filterParams.value.func_state !== undefined) {
					filter.func_state = filterParams.value.func_state
				}
				// 如果没有筛选功能状态，保持默认的func_state=1（已激活）
			} else {
				// 未激活tab（func_state=5）：固定为已到期状态，不受已激活tab的筛选条件影响
				// 未激活tab始终使用func_state=5，不应用功能状态筛选
				filter.func_state = 5
				// 不应用func_code和func_state的筛选条件，因为未激活tab固定是已到期状态
			}
			
			// 授权状态
			if (filterParams.value.ck_online !== undefined) {
				filter.ck_online = filterParams.value.ck_online
			}
			
			// 营业状态和授权异常状态处理
			// 如果授权状态是异常（authorizeIndex=3），设置state=3
			// 如果选择了营业状态筛选（selsectType），使用营业状态
			// 注意：授权异常和营业状态不能同时设置，优先使用营业状态
			if (selsectType.value !== undefined) {
				filter.state = selsectType.value
			} else if (authorizeIndex.value === 3) {
				// 只有授权异常，没有营业状态筛选时，设置state=3
				filter.state = 3
			}
			
			// 分组
			if (filterParams.value.group) {
				filter.group = filterParams.value.group
			}
			
			// 城市
			if (filterParams.value.citys && filterParams.value.citys.length > 0) {
				filter.citys = filterParams.value.citys
			}
			
			return {
				page: ensureNumber(pageIndex.value, 1),
				pageSize: ensureNumber(pageSize.value, 10),
				filter
			}
		}
		
		try {
			// 解析响应结果的函数
			const parseResult = (result) => {
				let rows = []
				let totalCount = 0
				
				// 检查返回结果
				if (!result) {
					return { rows, totalCount }
				}
				
				// 检查是否有错误
				// 格式: { Success: false, ... } 或 { code: 非200, ... }
				if (result.Success === false) {
					throw new Error(result.Msg || result.message || result.msg || '请求失败')
				}
				// 只有当 code 存在且明确不为 200 时才报错（code 为 undefined/null 时不报错）
				if (result.code !== undefined && result.code !== null && result.code !== 200) {
					throw new Error(result.message || result.msg || '请求失败')
				}
				
				// 解析数据 - 优先处理标准格式: { Success: true, code: 200, data: { rows: [], total: 25, page: 2, pageSize: 20 } }
				if (result.data && typeof result.data === 'object') {
					// 优先检查 result.data.rows（小写）
					if (Array.isArray(result.data.rows)) {
						rows = result.data.rows
						totalCount = result.data.total || result.data.Total || 0
					}
					// 其次检查 result.data.Rows（大写）
					else if (result.data.Rows && Array.isArray(result.data.Rows)) {
						rows = result.data.Rows
						totalCount = result.data.Total || 0
					}
				}
				// 格式2: { Data: { Rows: [], Total: 100 } }
				else if (result.Data && Array.isArray(result.Data.Rows)) {
					rows = result.Data.Rows
					totalCount = result.Data.Total || 0
				}
				// 格式3: { rows: [], total: 100 }
				else if (Array.isArray(result.rows)) {
					rows = result.rows
					totalCount = result.total || result.Total || 0
				}
				// 格式4: 直接是数组
				else if (Array.isArray(result)) {
					rows = result
					totalCount = result.length
				}
				// 格式5: { data: { code: 200, rows: [], total: 100 } }
				else if (result.data && result.data.code !== undefined) {
					if (result.data.code !== 200) {
						throw new Error(result.data.message || result.data.msg || '请求失败')
					}
					if (Array.isArray(result.data.rows)) {
						rows = result.data.rows
						totalCount = result.data.total || result.data.Total || 0
					}
				}
				
				// 如果都没有匹配到，返回空结果
				return { rows, totalCount }
			}
			
			// 映射店铺数据的函数
			const mapShops = (rows, funcState) => {
				return rows.map(shop => {
					// 检查功能信息
					const funcInfo = shop.func_info || shop.extra_data?.func_enable || []
					const kefuFunc = funcInfo.find(f => f.code === 'KEFU')
					const imKefuFunc = funcInfo.find(f => f.code === 'IMZDHF' || f.code === 'IMKEFU')
					const imAutoReplyFunc = funcInfo.find(f => f.code === 'IMZDHF')
					
					// 兼容 end_time / EndTime / endTime
					const getEndTime = (func) => {
						if (!func) return null
						return func.end_time || func.EndTime || func.endTime || null
					}
					
					const kefuEndTime = getEndTime(kefuFunc)
					const imAutoReplyEndTime = getEndTime(imAutoReplyFunc)
					
					// 如果IM客服功能已到期（kefuEndTime为空或已过期），则开关应该关闭
					let imKefuEnabled = imKefuFunc?.enable || false
					if (!kefuEndTime) {
						// 未激活列表中，如果kefuEndTime为空，说明已到期，开关应该关闭
						imKefuEnabled = false
					} else {
						// 检查是否已过期
						const endTime = new Date(kefuEndTime)
						const now = new Date()
						if (endTime < now) {
							imKefuEnabled = false
						}
					}
					
					return {
						...shop,
						kefuState: funcState, // 1=已激活, 5=未激活
						isKefuActivated: kefuFunc?.enable || false,
						imKefuEnabled: imKefuEnabled,
						imAutoReplyEnabled: imAutoReplyFunc?.enable || false,
						kefuEndTime: kefuEndTime,
						imAutoReplyEndTime: imAutoReplyEndTime,
						notes: shop.notes || shop.remark || '',
						city: shop.city || '-',
						ck_online: shop.ck_online !== undefined ? shop.ck_online : (shop.ck_uptime ? true : false)
					}
				})
			}
			
			// 如果是第一页，只请求当前tab对应的数据（每页10条）
			// 如果是翻页，也只请求当前tab对应的数据
			const funcState = currentTab.value === 'activated' ? 1 : 5
			const currentPage = ensureNumber(pageIndex.value, 1)
			
			// 不在加载前清空数据，保留旧数据直到新数据加载完成，避免白屏
			const params = buildQueryParams(funcState)
			
			// 确保页码和pageSize正确传递（每页10条）
			params.page = currentPage
			params.pageSize = ensureNumber(pageSize.value, 10)
			
			const result = await ShopApi.getShopList(params)
			const { rows, totalCount } = parseResult(result)
			
			if (!Array.isArray(rows)) {
				throw new Error('响应数据格式不正确')
			}
			
			// 直接使用接口返回的rows数据，不做任何截取或累积处理
			// 接口已经按照pageSize返回了正确数量的数据
			const mapped = mapShops(rows, funcState)
			
			// 如果是第一页，需要同时获取另一个tab的总数（用于显示总数）
			if (currentPage === 1) {
				const otherFuncState = funcState === 1 ? 5 : 1
				const otherParams = buildQueryParams(otherFuncState)
				otherParams.page = 1
				otherParams.pageSize = 1 // 只获取第一页用于获取总数
				
				try {
					const otherResult = await ShopApi.getShopList(otherParams)
					const { totalCount: otherTotalCount } = parseResult(otherResult)
					
					// 保存另一个tab的总数
					if (funcState === 1) {
						unactivatedTotal.value = otherTotalCount || 0
						activatedTotal.value = totalCount || 0
					} else {
						activatedTotal.value = otherTotalCount || 0
						unactivatedTotal.value = totalCount || 0
					}
				} catch (err) {
					// 如果获取另一个tab的总数失败，只更新当前tab的总数
					if (funcState === 1) {
						activatedTotal.value = totalCount || 0
					} else {
						unactivatedTotal.value = totalCount || 0
					}
				}
			} else {
				// 翻页时，只更新当前tab的总数
				if (funcState === 1) {
					activatedTotal.value = totalCount || 0
				} else {
					unactivatedTotal.value = totalCount || 0
				}
			}
			
			// 直接使用接口返回的数据，不做任何截取或处理
			// 接口已经按照pageSize返回了正确数量的数据（10条）
			// 深拷贝每个店铺对象，创建全新的数组，避免引用问题
			const freshShops = mapped.map(shop => ({ ...shop }))
			
			// 将当前页的数据存入缓存（用于tab切换时快速恢复）
			if (funcState === 1) {
				activatedShopCache.value.set(currentPage, [...freshShops]) // 创建新数组
			} else {
				unactivatedShopCache.value.set(currentPage, [...freshShops]) // 创建新数组
			}
			
			// 直接更新当前页的店铺数据（这是实际显示的数据）
			// 完全替换，不使用任何旧数据，严格按照接口返回的数据显示
			// 先完全清空，再赋值，确保 Vue 响应式系统正确检测到变化
			if (funcState === 1) {
				// 清空另一个tab的数据
				currentPageUnactivatedShops.value = []
				// 先完全清空当前tab的数据
				currentPageActivatedShops.value = []
				// 使用 nextTick 确保清空操作完成
				await nextTick()
				// 再赋值新数据（完全替换，严格按照接口返回的数据）
				currentPageActivatedShops.value = [...freshShops]
			} else {
				// 清空另一个tab的数据
				currentPageActivatedShops.value = []
				// 先完全清空当前tab的数据
				currentPageUnactivatedShops.value = []
				// 使用 nextTick 确保清空操作完成
				await nextTick()
				// 再赋值新数据（完全替换，严格按照接口返回的数据）
				currentPageUnactivatedShops.value = [...freshShops]
			}
			
			// 更新shopList（用于其他功能，如续费时查找店铺）
			const otherTabCache = funcState === 1 ? unactivatedShopCache.value : activatedShopCache.value
			const otherTabFirstPageShops = otherTabCache.get(1) || []
			
			if (currentTab.value === 'activated') {
				shopList.value = [...freshShops, ...otherTabFirstPageShops]
			} else {
				shopList.value = [...otherTabFirstPageShops, ...freshShops]
			}
			
			// 总数为两个状态店铺数量之和
			total.value = activatedTotal.value + unactivatedTotal.value
		} catch (error) {
			const errorMessage = error?.message || error?.errMsg || '加载失败，请重试'
			uni.showToast({
				title: errorMessage,
				icon: 'none',
				duration: 2000
			})
			// 如果请求失败，恢复页码
			if (pageIndex.value > 1) {
				pageIndex.value = pageIndex.value - 1
			}
		} finally {
			loading.value = false
			refreshing.value = false
			// 关闭加载提示
			uni.hideLoading()
		}
	}

	const handleRefresh = () => {
		if (loading.value) {
			// 如果正在加载，重置刷新状态并返回
			setTimeout(() => {
				refreshing.value = false
			}, 100)
			return
		}
		refreshing.value = true
		pageIndex.value = 1
		shopList.value = []
		loadShopList().finally(() => {
			// 延迟重置刷新状态，确保UI更新完成
			setTimeout(() => {
				refreshing.value = false
			}, 300)
		})
	}

	const loadMore = () => {
		// 按总数量控制加载更多
		if (loading.value || shopList.value.length >= total.value) return
		pageIndex.value++
		loadShopList()
	}

	// 计算总页数（已废弃，使用 currentTabTotalPages）
	const totalPages = computed(() => {
		return currentTabTotalPages.value
	})

	// 跳转首页
	const goToFirstPage = () => {
		if (pageIndex.value === 1) return
		pageIndex.value = 1
		// 不清空数据，保留旧数据直到新数据加载完成
		loadShopList()
	}

	// 跳转末页
	const goToLastPage = () => {
		const lastPage = currentTabTotalPages.value
		if (pageIndex.value === lastPage) return
		pageIndex.value = lastPage
		// 不清空数据，保留旧数据直到新数据加载完成
		loadShopList()
	}

	// 页码变化
	const handlePageChange = (page) => {
		pageIndex.value = ensureNumber(page, 1)
		// 不清空数据，保留旧数据直到新数据加载完成
		loadShopList()
	}

	// 页码输入框变化
	const handlePageInputChange = (e) => {
		const value = parseInt(e.detail.value)
		if (!isNaN(value) && value > 0) {
			// 实时更新输入框显示，但不立即跳转
		}
	}

	// 页码输入框确认
	const handlePageInput = (e) => {
		const value = parseInt(e.target.value || e.detail.value)
		if (!isNaN(value) && value > 0 && value <= currentTabTotalPages.value) {
			pageIndex.value = value
			// 不清空数据，保留旧数据直到新数据加载完成
			loadShopList()
		} else {
			// 输入无效，恢复当前页码
			if (pageInputRef.value) {
				pageInputRef.value.value = pageIndex.value
			}
		}
	}

	// 注意：已移除 handleSearchInput 函数，搜索现在只在点击搜索按钮或按回车时触发

	const handleSearch = () => {
		pageIndex.value = 1
		shopList.value = []
		currentPageActivatedShops.value = []
		currentPageUnactivatedShops.value = []
		// 清空缓存
		activatedShopCache.value.clear()
		unactivatedShopCache.value.clear()
		loadShopList()
	}
	
	// 打开筛选弹窗
	const openFilter = () => {
		showFilterPopup.value = true
		// 加载分组和城市列表
		if (groupList.value.length === 0) {
			getGroupList()
		}
		if (cityList.value.length === 0) {
			getprovincewithcitys()
		}
	}
	
	// 关闭筛选弹窗
	const closeFilter = () => {
		showFilterPopup.value = false
	}
	
	// 确认筛选
	const confirmFilter = () => {
		// 重置筛选条件
		filterParams.value = {
			func_code: undefined,
			func_state: undefined,
			ck_online: undefined,
			state: undefined,
			group: undefined,
			citys: undefined
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
			filterParams.value.citys = checkCityList.value
		}
		
		// 筛选店铺营业状态
		if (selsectType.value !== undefined) {
			filterParams.value.state = selsectType.value
		}
		
		// 分组
		if (proupValue.value) {
			filterParams.value.group = proupValue.value
		}
		
		// 授权状态
		if (authorizeIndex.value === 2) {
			filterParams.value.ck_online = true
		} else if (authorizeIndex.value === 3) {
			// 授权异常时，如果已经有营业状态筛选，不覆盖
			if (selsectType.value === undefined) {
				filterParams.value.state = 3
			}
		}
		
		// IM客服功能状态
		if (currentTab.value === 'activated') {
			// 已激活tab：使用筛选选择的功能状态
			if (chooseFilterFunVal.value && chooseFilterFunVal.value.length >= 2) {
				filterParams.value.func_code = chooseFilterFunVal.value[0]
				filterParams.value.func_state = chooseFilterFunVal.value[1]
			} else {
				// 如果没有选择功能状态，保持默认的KEFU和func_state=1（已激活）
				filterParams.value.func_code = undefined
				filterParams.value.func_state = undefined
			}
		} else {
			// 未激活tab：固定为已到期状态（func_state=5）
			filterParams.value.func_code = 'KEFU'
			filterParams.value.func_state = 5
		}
		
		showFilterPopup.value = false
		pageIndex.value = 1
		shopList.value = []
		currentPageActivatedShops.value = []
		currentPageUnactivatedShops.value = []
		// 清空缓存
		activatedShopCache.value.clear()
		unactivatedShopCache.value.clear()
		loadShopList()
	}
	
	// 功能筛选列变化
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
	
	// 功能筛选确认
	const handleConfirm = (val) => {
		isChooseStr.value = ''
		chooseFilterFunVal.value = val.value
		val.selectedItems.forEach(item => {
			isChooseStr.value += (item.label + '/')
		})
		isChooseStr.value = isChooseStr.value.slice(0, -1)
	}
	
	// 清空功能筛选
	const clearFunStr = () => {
		chooseFilterFunVal.value = []
		funFilterItem.value.length = 1
		isChooseStr.value = ''
	}
	
	// 选择授权状态
	const selectAuthorize = (index) => {
		authorizeIndex.value = index
	}
	
	// 选择筛选类别
	const selectCategory = (index) => {
		categoryIndex.value = index
	}
	
	// 选择店铺营业状态
	const selectFilterType = (index) => {
		selsectType.value = index
	}
	
	// 选择城市
	const selectItem = (item, _item) => {
		_item.check = !_item.check
		let hasCheck = item.children.filter(obj => obj.check === true)
		if (hasCheck.length === item.children.length) {
			item.check = true
		} else {
			item.check = false
		}
	}
	
	// 阻止事件冒泡
	const stopClick = (e) => {
		e.stopPropagation()
	}
	
	// 全选城市
	const allSelect = (item) => {
		item.children.forEach(_item => {
			_item.check = item.check
		})
	}
	
	// 清空筛选
	const removeFilter = () => {
		if (categoryIndex.value === 2) {
			proupValue.value = ''
		} else if (categoryIndex.value === 3) {
			cityList.value.forEach(item => {
				item.check = false
				item.children.forEach(_item => {
					_item.check = false
				})
			})
		}
	}
	
	// 获取分组列表
	const getGroupList = () => {
		ShopApi.getGroup({
			grouptype: 1,
			recursionchild: true
		}).then(res => {
			if (res.code === 200) {
				groupList.value = res.data || []
			}
		}).catch(() => {
			// 获取分组列表失败，静默处理
		})
	}
	
	// 获取省市列表
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
				cityList.value = [...arr]
			}
		}).catch(() => {
			// 获取城市列表失败，静默处理
		})
	}
	
	// 切换tab时清空功能筛选（未激活tab不需要功能筛选）
	watch(currentTab, (newTab) => {
		if (newTab === 'unactivated') {
			// 切换到未激活tab时，清空功能筛选
			chooseFilterFunVal.value = []
			isChooseStr.value = ''
			funFilterItem.value = []
		}
	})

	const clearSearch = () => {
		searchKeyword.value = ''
		pageIndex.value = 1
		shopList.value = []
		currentPageActivatedShops.value = []
		currentPageUnactivatedShops.value = []
		// 清空缓存
		activatedShopCache.value.clear()
		unactivatedShopCache.value.clear()
		loadShopList()
	}
	
	// 添加店铺选项弹窗
	const addShopOptionsVisible = ref(false)
	const selectedAddShopOption = ref('login') // 默认选择插件授权
	
	// 添加店铺
	const handleAddShop = () => {
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
		const shopType = currentShopType.value
		if (shopType === 1) {
			// 美团餐饮
			meituan()
		} else if (shopType === 2) {
			// 饿了么
			eleme()
		} else if (shopType === 6) {
			// 京东到家
			jingdong()
		} else if (shopType === 3) {
			// 美团闪购
			meituan()
		} else if (shopType === 4) {
			// 美团医药
			meituan()
		} else if (shopType === 5) {
			// 饿百零售
			ebail()
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
		const shopType = currentShopType.value
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
	
	// 绑定店铺
	const handleBindShop = () => {
		bindState.value = true
	}
	
	// 确认绑定
	const confirmBind = () => {
		if (!bindCode.value) {
			return uni.showToast({
				title: '请填写绑定码',
				icon: 'error',
				duration: 2000
			})
		}
		uni.showLoading({
			title: '绑定中',
			mask: true
		})
		ShopApi.bindShop(bindCode.value).then(res => {
			uni.hideLoading()
			if (res.code === 200) {
				bindState.value = false
				bindCode.value = ''
				loadShopList()
				uni.showToast({
					title: '绑定成功',
					icon: 'success',
					duration: 2000
				})
			} else {
				uni.showToast({
					title: res.message || '绑定失败',
					icon: 'none',
					duration: 2000
				})
			}
		}).catch(err => {
			uni.hideLoading()
			uni.showToast({
				title: '绑定失败，请稍后重试',
				icon: 'none',
				duration: 2000
			})
		})
	}
	
	// 关闭绑定弹窗
	const closeBind = () => {
		bindState.value = false
		bindCode.value = ''
	}
	
	// 调用添加店铺API
	const callAddShopApi = async (params) => {
		try {
			if (!params || !params.cookies || params.cookies.trim() === '') {
				uni.showToast({
					title: 'cookies为空，无法添加店铺',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			uni.showLoading({ title: '添加店铺中...' })
			
			const res = await ShopApi.agentAddShop(params)
			
			uni.hideLoading({})
			
			if (res.code === 200 && res.data) {
				uni.showToast({
					title: '添加成功',
					icon: 'success',
					duration: 2000
				})
				// 刷新店铺列表
				setTimeout(() => {
					loadShopList()
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
	
	// 关闭webview
	const colseV = () => {
		// #ifdef APP-PLUS
		if (w) {
			try {
				plus.webview.close(w)
				w = null
			} catch (e) {
				// 忽略错误
			}
		}
		plus.cache.clear()
		// #endif
		if (checkinter) {
			clearInterval(checkinter)
			checkinter = null
		}
		colseShow.value = false
		isRepair.value = false
		
		// 关闭时刷新店铺列表
		setTimeout(() => {
			loadShopList()
		}, 500)
	}
	
	// 美团添加店铺
	const meituan = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		const shopType = currentShopType.value
		
		let url = ''
		if (shopType === 1) {
			url = 'https://e.waimai.meituan.com/#/new_fe/business#/index'
		} else if (shopType === 3) {
			url = 'https://shangoue.meituan.com/#/new_fe/business#/index'
		} else if (shopType === 4) {
			url = 'https://yiyao.meituan.com/#/new_fe/business#/index'
		} else {
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
				startMeituanCookieMonitoring()
			}, 500)
		}, 500)
		// #endif
		// #ifndef H5
		// #ifndef APP-PLUS
		uni.navigateTo({
			url: '/pages/addshop/addShop?shopType=1'
		})
		// #endif
		// #endif
	}
	
	// 启动美团平台cookie监听
	const startMeituanCookieMonitoring = () => {
		// #ifdef APP-PLUS
		if (!w) return
		
		checkinter = setInterval(() => {
			try {
				const currentUrl = w.getURL()
				if (!currentUrl) return
				
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
				
				let cookiestr = ''
				try {
					const documentCookie = w.evalJS('document.cookie') || ''
					const navigatorCookie = plus.navigator.getCookie(currentUrl) || ''
					
					const cookieMap = new Map()
					
					if (documentCookie) {
						documentCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					if (navigatorCookie) {
						navigatorCookie.split(';').forEach(item => {
							const [key, ...valueParts] = item.trim().split('=')
							if (key && valueParts.length > 0) {
								cookieMap.set(key.trim(), valueParts.join('=').trim())
							}
						})
					}
					
					cookiestr = Array.from(cookieMap.entries())
						.map(([key, value]) => `${key}=${value}`)
						.join('; ')
				} catch (e) {
					cookiestr = plus.navigator.getCookie(currentUrl) || ''
				}
				
				if (!cookiestr || cookiestr.length === 0) {
					return
				}
				
				if (cookiestr.indexOf("token=") == -1 || 
				    cookiestr.indexOf("acctId=") == -1 ||
				    cookiestr.indexOf("wmPoiId=") == -1) {
					return
				}
				
				if (checkinter) {
					clearInterval(checkinter)
					checkinter = null
				}
				
				cookieStr.value = cookiestr.replace('美团cookiestr', '')
				const params = {
					shop_type: currentShopType.value,
					cookies: cookieStr.value
				}
				
				callAddShopApi(params)
				
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
		}, 800)
		// #endif
	}
	
	// 饿了么添加店铺
	const eleme = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		let url = 'https://melody.shop.ele.me';
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = 'pcwebview';
		const webview_setting = {
			'top': '18%',
		};
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
		uni.showLoading({})
		setTimeout(() => {
			w = plus.webview.create(url + '/login', webviewid, webview_setting);
			colseShow.value = true;
			w.show();
			uni.hideLoading({})
			checkinter = setInterval(() => {
				let str = w.getURL();
				let cookiestr = plus.navigator.getCookie(str);
				if (cookiestr && cookiestr.indexOf("x5check_napos=") != -1) {
					clearInterval(checkinter);
					checkinter = null
					const params = {
						shop_type: currentShopType.value,
						cookies: cookiestr
					}
					callAddShopApi(params)
					plus.webview.close(w);
					plus.cache.clear();
					colseShow.value = false;
				}
			}, 500)
		}, 500)
		// #endif
		// #ifndef H5
		// #ifndef APP-PLUS
		uni.navigateTo({
			url: '/pages/addshop/addShop?shopType=2'
		})
		// #endif
		// #endif
	}
	
	// 京东到家添加店铺
	const jingdong = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
		let url = 'https://store.jddj.com/login'
		let getWindowInfo = uni.getWindowInfo()
		const webviewid = 'jddjwebview'
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
		uni.showLoading({})
		setTimeout(() => {
			w = plus.webview.open(url, webviewid, webview_setting)
			colseShow.value = true
			w.show()
			uni.hideLoading({})
			startJingdongCookieMonitoring()
		}, 500)
		// #endif
		// #ifndef H5
		// #ifndef APP-PLUS
		uni.navigateTo({
			url: '/pages/addshop/addShop?shopType=6'
		})
		// #endif
		// #endif
	}
	
	// 启动京东到家cookie监听
	const startJingdongCookieMonitoring = () => {
		// #ifdef APP-PLUS
		if (!w) return
		
		checkinter = setInterval(() => {
			try {
				const currentUrl = w.getURL()
				if (!currentUrl) return
				
				if (currentUrl.indexOf('store.jddj.com') === -1 && 
				    currentUrl.indexOf('jddj.com') === -1) {
					return
				}
				
				let cookiestr = plus.navigator.getCookie(currentUrl) || ''
				
				if (!cookiestr || cookiestr.length === 0) {
					return
				}
				
				if (cookiestr.indexOf("pin=") == -1) {
					return
				}
				
				if (checkinter) {
					clearInterval(checkinter)
					checkinter = null
				}
				
				const params = {
					shop_type: currentShopType.value,
					cookies: cookiestr
				}
				
				callAddShopApi(params)
				
				plus.webview.close(w)
				plus.cache.clear()
				colseShow.value = false
			} catch (e) {
				// 忽略错误
			}
		}, 500)
		// #endif
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
				w.show('slide-in-right', 300)
				colseShow.value = true
				uni.hideLoading()
				
				// 监听webview加载完成
				w.addEventListener('loaded', function() {
					// 可以在这里添加额外的逻辑
				})
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
	
	// 饿百零售添加店铺
	const ebail = () => {
		// #ifdef H5
		location.href = "http://xzjsy.ijishiyu.com/";
		// #endif
		// #ifdef APP-PLUS
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
		if (w) {
			try {
				plus.webview.close(w)
			} catch (e) {
				// 忽略错误
			}
		}
		uni.showLoading({})
		setTimeout(() => {
			w = plus.webview.create(url, webviewid, webview_setting)
			colseShow.value = true
			w.show()
			uni.hideLoading({})
			checkinter = setInterval(() => {
				let str = w.getURL()
				let cookiestr = plus.navigator.getCookie(str)
				if (cookiestr && cookiestr.indexOf("x5check_napos=") != -1) {
					clearInterval(checkinter)
					checkinter = null
					const params = {
						shop_type: currentShopType.value,
						cookies: cookiestr
					}
					callAddShopApi(params)
					plus.webview.close(w)
					plus.cache.clear()
					colseShow.value = false
				}
			}, 500)
		}, 500)
		// #endif
		// #ifndef H5
		// #ifndef APP-PLUS
		uni.navigateTo({
			url: '/pages/addshop/addShop?shopType=5'
		})
		// #endif
		// #endif
	}

	const getShopTypeLogo = (shopType) => {
		return platformLogos.get(shopType) || '/static/shop/default.png'
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
		return shop.ck_online
	}

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

	const getShopStateClass = (state) => {
		if (state === 4) return 'state-open'
		// 仅在明确下线状态时展示红色，避免因为授权异常导致营业状态小圆点变红
		if (state === 7) return 'state-offline'
		return 'state-normal'
	}

	// 复制信息功能
	const handleCopyMsg = (shop) => {
		uni.showLoading({
			title: '加载中',
			mask: true
		})
		ShopApi.getShopBindCode(shop.id).then(res => {
			if (res.code === 200) {
				let code = res.data
				const copyobj = {
					office_id: shop.office_id,
					shop_type: shop.shop_type,
					name: shop.name,
					shop_id: shop.id,
					ZDCCtime: shop.ZDCCtime || '已到期',
					IMZDHFtime: shop.imAutoReplyEndTime ? formatDate(shop.imAutoReplyEndTime) : '已到期',
					ZDHPtime: shop.ZDHPtime || '已到期',
					ZDTGtime: shop.ZDTGtime || '已到期',
					CPDTtimetext: shop.CPDTtimetext || '已到期',
					code
				}
				// 显示复制信息弹窗
				const kefuTime = shop.kefuEndTime ? formatDate(shop.kefuEndTime) : '已到期'
				uni.showModal({
					title: '复制信息',
					content: `平台：${shop.shop_type == 1 ? '美团外卖' : shop.shop_type == 2 ? '饿了么' : '其他'}\n店铺名称：${shop.name}\n店铺ID：${shop.office_id}\nIM客服功能到期时间：${kefuTime}\n自动回复到期时间：${copyobj.IMZDHFtime}\n门店绑定码：${code} （5分钟内有效）`,
					showCancel: true,
					confirmText: '复制',
					cancelText: '取消',
					success: (res) => {
						if (res.confirm) {
							// 复制绑定码到剪贴板
							uni.setClipboardData({
								data: code,
								success: () => {
									uni.showToast({
										title: '复制成功',
										icon: 'success'
									})
								}
							})
						}
					}
				})
			}
		}).finally(() => {
			uni.hideLoading({})
		})
	}
	
	const formatDate = (time) => {
		if (!time) return ''
		const date = new Date(time)
		if (Number.isNaN(date.getTime())) return ''
		const y = date.getFullYear()
		const m = String(date.getMonth() + 1).padStart(2, '0')
		const d = String(date.getDate() + 0).padStart(2, '0')
		return `${y}-${m}-${d}`
	}

	// 上次授权时间格式化（复用门店管理的展示样式：YYYY-MM-DD HH:mm）
	const formatAuthTime = (time) => {
		if (!time) return '暂无'
		try {
			const date = new Date(time)
			if (Number.isNaN(date.getTime())) return '暂无'
			const y = date.getFullYear()
			const m = String(date.getMonth() + 1).padStart(2, '0')
			const d = String(date.getDate()).padStart(2, '0')
			const h = String(date.getHours()).padStart(2, '0')
			const min = String(date.getMinutes()).padStart(2, '0')
			return `${y}-${m}-${d} ${h}:${min}`
		} catch (e) {
			return '暂无'
		}
	}

	const handleSaveNotes = async (shop) => {
		if (!shop || !shop.id) return
		try {
			const body = {
				id: shop.id,
				UpdateVal: {
					notes: shop.notes || ''
				}
			}
			const res = await ShopApi.updateShop(body)
			if (res && res.code === 200) {
				uni.showToast({
					title: '保存成功',
					icon: 'success'
				})
			} else {
				uni.showToast({
					title: res?.message || res?.Msg || '保存失败',
					icon: 'none'
				})
			}
		} catch (e) {
			// 保存备注失败，已在 uni.showToast 中提示用户
			uni.showToast({
				title: '保存失败，请稍后重试',
				icon: 'none'
			})
		}
	}

	const handleToggleIMKefu = async (shop, event) => {
		const enabled = event.detail.value
		const prevKefu = shop.imKefuEnabled
		const prevAutoReply = shop.imAutoReplyEnabled
		shop.imKefuEnabled = enabled
		
		// 如果开启IM客服功能，同时开启IM自动回复
		if (enabled && !shop.imAutoReplyEnabled) {
			shop.imAutoReplyEnabled = true
		}
		
		try {
			// 先开启/关闭IM客服功能
			const resKefu = await ManagementApi.enableIM({
				code: 'KEFU',
				enable: enabled,
				shop: shop.id
			})
			
			const isKefuSuccess =
				resKefu &&
				(resKefu.code === 200 ||
					resKefu.Success === true ||
					(resKefu.data && (resKefu.data.code === 200 || resKefu.data.Success === true)))
			
			if (!isKefuSuccess) {
				throw new Error('enable KEFU failed')
			}
			
			// 如果开启IM客服功能，同时开启IM自动回复
			if (enabled && !prevAutoReply) {
				try {
					const resAutoReply = await ManagementApi.enableIM({
						code: 'IMZDHF',
						enable: true,
						shop: shop.id
					})
					
					const isAutoReplySuccess =
						resAutoReply &&
						(resAutoReply.code === 200 ||
							resAutoReply.Success === true ||
							(resAutoReply.data && (resAutoReply.data.code === 200 || resAutoReply.data.Success === true)))
					
					if (!isAutoReplySuccess) {
						// 如果自动回复开启失败，回滚状态
						shop.imAutoReplyEnabled = prevAutoReply
						// 开启IM自动回复失败，但IM客服功能已开启
					}
				} catch (autoReplyError) {
					// 如果自动回复开启失败，回滚状态
					shop.imAutoReplyEnabled = prevAutoReply
					// 开启IM自动回复失败，已在 uni.showToast 中提示用户
				}
			}
			
			const statusText = enabled ? '已开启' : '已关闭'
			uni.showToast({
				title: `IM客服${statusText}`,
				icon: 'success'
			})
		} catch (error) {
			// 切换IM客服功能失败，已在 uni.showToast 中提示用户
			shop.imKefuEnabled = prevKefu
			shop.imAutoReplyEnabled = prevAutoReply
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			})
		}
	}

	const handleToggleIMAutoReply = async (shop, event) => {
		const enabled = event.detail.value
		const prev = shop.imAutoReplyEnabled
		shop.imAutoReplyEnabled = enabled
		
		try {
			const res = await ManagementApi.enableIM({
				code: 'IMZDHF',
				enable: enabled,
				shop: shop.id
			})
			
			// 兼容多种返回格式判断成功
			const isSuccess =
				res &&
				(res.code === 200 ||
					res.Success === true ||
					(res.data && (res.data.code === 200 || res.data.Success === true)))
			
			if (!isSuccess) {
				throw new Error('enableIM failed')
			}
			
			const statusText = enabled ? '已开启' : '已关闭'
			uni.showToast({
				title: `自动回复${statusText}`,
				icon: 'success'
			})
		} catch (error) {
			// 切换IM自动回复失败，已在 uni.showToast 中提示用户
			// 还原开关状态
			shop.imAutoReplyEnabled = prev
			uni.showToast({
				title: '操作失败，请重试',
				icon: 'none'
			})
		}
	}
	
	const handleOpenIMAutoReplySetting = (shop) => {
		// 复用店铺管理页自动回复的设置页逻辑
		const url = `/pages/service/service?shopId=${shop.id}&type=IMZDHF&isV2=true&shopType=${shop.shop_type}`
		uni.navigateTo({ url })
	}
	
	const handleRenewFunc = async (shop, code) => {
		// 这里只对接 IM 客服功能（KEFU）的续费
		if (code !== 'KEFU') return
		
		try {
			uni.showLoading({ title: '加载中...', mask: true })
			
			currentRenewShopId.value = String(shop.id)
			currentRenewShop.value = shop // 保存店铺对象
			renewPriceTitle.value = 'IM客服_月'
			
			const quotes = await getRenewQuoteList(
				currentShopType.value,
				renewPriceTitle.value,
				true
			)
			const priceList = quotes.map(mapPayQuoteToSpecRow)

			uni.hideLoading()
			
			if (priceList.length === 0) {
				uni.showToast({
					title: '暂无可用规格',
					icon: 'none'
				})
				return
			}
			
			renewPriceList.value = priceList
			renewPopupVisible.value = true
		} catch (error) {
			// 获取续费规格失败，已在 uni.showToast 中提示用户
			uni.hideLoading()
			uni.showToast({
				title: '获取规格失败，请稍后重试',
				icon: 'none'
			})
		}
	}
	
	const closeRenewPopup = () => {
		renewPopupVisible.value = false
		renewPriceList.value = []
		currentRenewShopId.value = ''
		currentRenewShop.value = null
	}
	
	const handleRenewEndtime = (data) => {
		// 续费成功后更新当前店铺的到期时间
		if (!currentRenewShop.value) return
		
		const shopId = String(currentRenewShop.value.id)
		const currentPage = ensureNumber(pageIndex.value, 1)
		
		// 从缓存中查找并更新对应店铺（因为显示的数据来自缓存）
		const activatedCache = activatedShopCache.value.get(currentPage) || []
		const unactivatedCache = unactivatedShopCache.value.get(currentPage) || []
		
		// 查找店铺在哪个缓存中
		let shop = activatedCache.find(s => String(s.id) === shopId)
		let cache = activatedShopCache.value
		if (!shop) {
			shop = unactivatedCache.find(s => String(s.id) === shopId)
			cache = unactivatedShopCache.value
		}
		
		if (!shop) return
		
		// 如果传入的是数组（FuncInfo数组），根据功能名称更新对应的到期时间
		if (Array.isArray(data)) {
			// 先收集所有需要更新的值，避免在forEach中直接修改导致的问题
			let newKefuEndTime = null
			let newImAutoReplyEndTime = null
			
			// 识别功能并收集到期时间
			data.forEach((funcItem, index) => {
				const funcNameOriginal = funcItem.FuncName || ''
				const funcName = funcNameOriginal.toLowerCase()
				const newEndTime = funcItem.NewEndTime
				
				if (!newEndTime) return
				
				// 根据实际返回数据精确匹配：
				// FuncName: "IM自动回复" → IMZDHF
				// FuncName: "IM客服" → KEFU
				let isKefu = false
				let isImAutoReply = false
				
				if (funcNameOriginal === 'IM自动回复' || funcNameOriginal === 'IM自动回复功能') {
					isImAutoReply = true
				} else if (funcNameOriginal === 'IM客服' || funcNameOriginal === 'IM客服功能') {
					isKefu = true
				} else if (funcName === 'im自动回复' || funcName === 'im自动回复功能') {
					isImAutoReply = true
				} else if (funcName === 'im客服' || funcName === 'im客服功能') {
					isKefu = true
				} else if (funcName.includes('im自动回复')) {
					isImAutoReply = true
				} else if (funcName.includes('im客服') && !funcName.includes('回复') && !funcName.includes('自动')) {
					isKefu = true
				} else if (funcName.includes('imzdhf')) {
					isImAutoReply = true
				} else if (funcName.includes('kefu') && !funcName.includes('回复')) {
					isKefu = true
				} else if (renewPriceTitle.value === 'IM客服_月') {
					// 根据数组顺序fallback：第一个是IM自动回复，第二个是IM客服
					if (index === 0) {
						isImAutoReply = true
					} else if (index === 1) {
						isKefu = true
					}
				}
				
				if (isKefu) {
					newKefuEndTime = newEndTime
				} else if (isImAutoReply) {
					newImAutoReplyEndTime = newEndTime
				}
			})
			
			// 统一更新shop对象的功能到期时间
			const updateFuncEndTime = (code, endTime, shopProperty, enableProperty) => {
				if (endTime === null) return
				
				const funcInfo = shop.func_info || shop.extra_data?.func_enable || []
				const func = funcInfo.find(f => f.code === code)
				
				if (func) {
					func.end_time = endTime
					func.EndTime = endTime
					func.endTime = endTime
				} else {
					// 如果不存在，添加到功能信息中
					if (!Array.isArray(funcInfo)) {
						shop.func_info = []
						shop.extra_data = shop.extra_data || {}
						shop.extra_data.func_enable = []
					}
					const targetArray = shop.func_info || shop.extra_data?.func_enable || []
					targetArray.push({
						code: code,
						enable: shop[enableProperty] || false,
						end_time: endTime,
						EndTime: endTime,
						endTime: endTime
					})
				}
				shop[shopProperty] = endTime
			}
			
			// 更新IM客服功能
			updateFuncEndTime('KEFU', newKefuEndTime, 'kefuEndTime', 'isKefuActivated')
			
			// 更新IM自动回复功能
			updateFuncEndTime('IMZDHF', newImAutoReplyEndTime, 'imAutoReplyEndTime', 'imAutoReplyEnabled')
			
			// 保存更新后的值
			const savedKefuEndTime = shop.kefuEndTime
			const savedImAutoReplyEndTime = shop.imAutoReplyEndTime
			
			// 更新缓存中的店铺数据（创建新数组，触发Vue响应式更新）
			nextTick(() => {
				const updatedShops = cache.get(currentPage)?.map(s => {
					if (String(s.id) === shopId) {
						return {
							...s,
							kefuEndTime: savedKefuEndTime,
							imAutoReplyEndTime: savedImAutoReplyEndTime
						}
					}
					return s
				}) || []
				
				// 更新缓存（使用新数组，触发响应式更新）
				cache.set(currentPage, [...updatedShops])
			})
		} else if (data) {
			// 兼容旧版本：如果传入的是单个时间值，只更新IM客服功能（因为续费的是IM客服功能）
			shop.kefuEndTime = data
			const funcInfo = shop.func_info || shop.extra_data?.func_enable || []
			const kefuFunc = funcInfo.find(f => f.code === 'KEFU')
			if (kefuFunc) {
				kefuFunc.end_time = data
				kefuFunc.EndTime = data
				kefuFunc.endTime = data
			}
		}
	}
	
	const handleRenewSuccess = () => {
		// 续费成功后只关闭弹窗和显示提示，不重新加载列表
		closeRenewPopup()
		uni.showToast({
			title: '续费成功',
			icon: 'success'
		})
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
	
	// 显示IM客服功能帮助提示（气泡）
	const showKefuTooltip = (_, shop) => {
		toggleTooltip(shop, 'kefu')
	}
	
	// 显示IM自动回复帮助提示（气泡）
	const showAutoReplyTooltip = (_, shop) => {
		toggleTooltip(shop, 'autoReply')
	}
	
	// 显示授权异常帮助提示（气泡）
	const showAuthTooltip = (_, shop) => {
		toggleTooltip(shop, 'auth')
	}
	
	// 关闭提示（点击卡片外部时调用）
	const closeTooltip = () => {
		currentTooltipShop.value = null
		currentTooltipType.value = ''
	}
	
	// 复制店铺ID
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
					const systemInfo = uni.getSystemInfoSync()
					const windowWidth = systemInfo.windowWidth || 375 // 默认 375px
					const rpxToPx = windowWidth / 750 // rpx 转 px 的比例
					const fontSize = 24 * rpxToPx // 字体大小（px）
					
					// 估算每个字符的宽度（中文字符约为字体大小的 1.0-1.2 倍）
					// 这里使用 1.1 倍作为平均值
					const charWidth = fontSize * 1.1
					const estimatedTextWidth = shop.city.length * charWidth
					
					// 如果估算的文本宽度超过容器宽度，说明可能被截断了
					// 使用一个阈值（0.95倍），避免误判（因为估算可能不准确）
					if (estimatedTextWidth > containerWidth * 0.95) {
						uni.showModal({
							title: '城市',
							content: shop.city,
							showCancel: false,
							confirmText: '确定'
						})
					}
				}
			}).exec()
		})
	}

	onMounted(() => {
		getSysteminfo()
		loadShopList()
	})
</script>

<style scoped lang="scss">
	.shop-manage {
		width: 100%;
		height: 100vh;
		background: #f5f5f5;
		display: flex;
		flex-direction: column;
		position: relative;
		overflow: hidden;
	}

	.filter-tabs {
		background: #fff;
		padding: 10rpx 0;
		position: fixed;
		top: calc(40px + env(safe-area-inset-top) );
		left: 0;
		right: 0;
		width: 100%;
		z-index: 12;
		
		box-sizing: border-box;
		height: 80rpx;
		min-height: 80rpx;
	}

	.filter-scroll {
		white-space: nowrap;
	}

	.filter-tab {
		display: inline-flex;
		align-items: center;
		padding: 12rpx 30rpx;
		margin: 0 10rpx;
		border-radius: 30rpx;
		background: #f5f5f5;
		transition: all 0.3s;
	}

	.filter-tab-logo {
		width: 32rpx;
		height: 32rpx;
		margin-right: 8rpx;
		border-radius: 4rpx;
	}

	.filter-tab.active {
		background: #1677ff;
		.filter-tab-text {
			color: #fff;
		}
	}

	.filter-tab-text {
		font-size: 26rpx;
		color: #666;
	}

	.search-filter-section {
		display: flex;
		flex-direction: row;
		align-items: center;
		padding: 12rpx 20rpx;
		background: #fff;
		border-bottom: 1px solid #e0e0e0;
		position: fixed;
		top: calc(44px + env(safe-area-inset-top) + 70rpx);
		left: 0;
		right: 0;
		width: 100%;
		z-index: 11;
		box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
		box-sizing: border-box;
		gap: 12rpx;
	}
	
	.shop_buttons_row {
		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		box-sizing: border-box;
		flex-shrink: 0;
		gap: 8rpx;
	}
	
	.bind_shop_btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-width: 0;
		padding-top: 0;
		padding-bottom: 0;
		padding-left: 16rpx;
		padding-right: 16rpx;
		background-color: #fff;
		border-radius: 10rpx;
		box-sizing: border-box;
		flex-shrink: 0;
		white-space: nowrap;
		height: 50rpx;
	}
	
	.bind_shop_btn .text_choose_1 {
		color: #FFBE01;
	}
	
	.bind_shop_btn .text_choose_2 {
		color: #22CC00;
	}
	
	.bind_shop_btn .text_choose_4 {
		color: #333333;
	}
	
	.text-choose {
		font-size: 20rpx;
		display: inline-block;
		padding-left: 8rpx;
		white-space: nowrap;
		line-height: 1.2;
		text-align: center;
		flex-shrink: 0;
	}
	
	.img_icon {
		width: 22rpx;
		height: 24rpx;
		flex-shrink: 0;
	}
	
	/* 添加店铺按钮 - 浅绿色渐变 */
	.shop_buttons_row > .bind_shop_btn:nth-child(1) {
		background: linear-gradient(135deg, rgba(34, 204, 0, 0.2) 0%, rgba(31, 179, 0, 0.15) 100%);
	}
	
	.shop_buttons_row > .bind_shop_btn:nth-child(1) .text_choose_2 {
		color: #22CC00;
	}
	
	.shop_buttons_row > .bind_shop_btn:nth-child(1) .img_icon {
		filter: brightness(1);
		opacity: 1;
	}
	
	/* 绑定门店按钮 - 浅黄色渐变 */
	.shop_buttons_row > .bind_shop_btn:nth-child(2) {
		background: linear-gradient(135deg, rgba(255, 190, 1, 0.2) 0%, rgba(255, 165, 0, 0.15) 100%);
	}
	
	.shop_buttons_row > .bind_shop_btn:nth-child(2) .text_choose_1 {
		color: #FF8C00;
	}
	
	.shop_buttons_row > .bind_shop_btn:nth-child(2) .img_icon {
		filter: brightness(0.7);
		opacity: 1;
	}
	
	/* 筛选按钮 - 浅灰色渐变 */
	.filter_btn {
		background: linear-gradient(135deg, rgba(102, 102, 102, 0.2) 0%, rgba(51, 51, 51, 0.15) 100%);
		min-width: auto;
		width: auto;
		max-width: 120rpx;
		padding-left: 12rpx;
		padding-right: 12rpx;
	}
	
	.filter_btn .text_choose_4 {
		color: #333333;
		font-size: 22rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 80rpx;
	}
	
	.filter_btn .img_icon {
		filter: brightness(1);
		opacity: 1;
		flex-shrink: 0;
	}
	
	.bind_shop_btn_large {
		flex: 0 0 auto;
	}
	
	/* 前三个按钮保持在一起 */
	.shop_buttons_row > .bind_shop_btn:not(.filter_btn) {
		flex: 0 0 auto;
	}
	
	.search {
		border: 1px solid #FACC05;
		border-radius: 50rpx;
		position: relative;
		font-size: 24rpx;
		margin-left: 0;
		margin-right: 0;
		background-color: #fff;
		flex: 1;
		min-width: 0;
		height: 50rpx;
		box-sizing: border-box;
		max-width: 300rpx;
		display: flex;
		align-items: center;
		overflow: hidden;
	}
	
	.search_icon {
		width: 28rpx;
		height: 28rpx;
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		left: 12rpx;
		z-index: 1;
		flex-shrink: 0;
	}
	
	.search_input {
		font-size: 20rpx;
		padding:  0 90rpx 0 50rpx;
		height: 100%;
		line-height: 50rpx;
		width: 100%;
		box-sizing: border-box;
		flex: 1;
	}
	
	.search_btn {
		position: absolute;
		right: 0rpx;
		top: 50%;
		transform: translateY(-50%);
		z-index: 2;
		flex-shrink: 0;
	}
	
	.btn_min {
		background-color: #FACC05;
		color: #333;
		border-radius: 50rpx;
		height: 46rpx;
		line-height: 46rpx;
		font-size: 22rpx;
		padding-left: 15rpx;
		padding-right: 15rpx;
		white-space: nowrap;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.popup-box {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	
	.p-title {
		font-size: 30rpx;
		text-align: center;
	}
	
	.ft30 {
		font-size: 30rpx;
	}
	
	.tc {
		text-align: center;
	}

	.shop-tabs-container {
		flex: 1;
		display: flex;
		flex-direction: column;
		background: #fff;
	
		border-radius: 16rpx;
		overflow: hidden;
		position: fixed;
		left: 0;
		right: 0;
		top: calc(44px + env(safe-area-inset-top) + 70rpx + 60rpx + 16rpx);
		bottom: calc(20px + env(safe-area-inset-bottom) );
		width: calc(100% - 40rpx);
		margin-left: 20rpx;
		margin-right: 20rpx;
		margin-top: 0;
		margin-bottom: 0;
	}

	.shop-tabs-header {
		display: flex;
		
		background: #fff;
		height: 60rpx;
		min-height: 60rpx;
		position: relative;
		z-index: 10;
		flex-shrink: 0;
	}

	.shop-tab-item {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 12rpx 0;
		position: relative;
		transition: all 0.3s;
	}

	.shop-tab-item.active {
		.tab-title {
			color: #1677ff;
			font-weight: 600;
		}
		
		&::after {
			content: '';
			position: absolute;
			bottom: 0;
			left: 0;
			right: 0;
			height: 4rpx;
			background: #1677ff;
		}
	}

	.tab-title {
		font-size: 32rpx;
		color: #666;
		margin-right: 8rpx;
	}

	.tab-count {
		font-size: 28rpx;
		color: #999;
	}

	.shop-tabs-content {
		flex: 1;
		position: relative;
		overflow: hidden;
		display: flex;
		flex-direction: column;
		min-height: 0;
	}

	.shop-list-scroll {
		flex: 1;
		width: 100%;
		height: 100%;
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
	}

	.shop-card {
		border-radius: 14rpx;
		border: 1px solid #f0f0f0;
		margin-top: 16rpx;
		width: 100%;
		box-sizing: border-box;
		padding: 16rpx;
		background-color: #ffffff;
	}

	.shop-card:first-child {
		margin-top: 0;
	}

	.shop-card-header {
		display: flex;
		align-items: flex-start;
		margin-bottom: 20rpx;
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
		border-radius: 8rpx;
		background: #f5f5f5;
		object-fit: cover;
		margin-bottom: 8rpx;
	}

	.copy-info-btn {
		font-size: 22rpx;
		color: #333;
		width: 100rpx;
		text-align: center;
		background-color: #FFBE01;
		border-radius: 12rpx;
		padding: 4rpx 2rpx;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
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

	.shop-meta-row {
		margin-top: 4rpx;
		display: flex;
		align-items: center;
		font-size: 24rpx;
		color: #999;
	}

	.auth-time-row-inline {
		margin-left: 0;
		padding-left: 124rpx;
		align-items: flex-start;
	}
	
	.auth-time-inline {
		font-size: 24rpx;
		color: #666;
		line-height: 1.5;
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
	}

	.meta-copy-icon {
		width: 28rpx;
		height: 28rpx;
		margin-left: 6rpx;

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
	
	.meta-id-wrapper {
		cursor: pointer;
		display: flex;
		align-items: center;
	}

	.meta-location-icon {
		width: 28rpx;
		height: 28rpx;
		margin-right: 4rpx;
	}

	.shop-card-body {
		padding-top: 4rpx;
	}

	.shop-detail-row {
		margin-bottom: 12rpx;
		
		&:last-child {
			margin-bottom: 0;
		}
	}

	.remark-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		
	}

	.remark-label {
		overflow-wrap: break-word;
		color: rgba(153, 153, 153, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}

	.remark-input-wrapper {
		position: relative;
		background-color: rgba(245, 245, 245, 1);
		border-radius: 8rpx;
		width: 100%;
		padding: 6rpx 5rpx 6rpx 20rpx;
		flex: 1;
		margin-left: 12rpx;
	}

	.remark-input {
		font-size: 24rpx;
		background-color: transparent;
	}

	.remark-save-btn {
		position: absolute;
		right: 4rpx;
		background: linear-gradient(135deg, #FACC05 0%, #F5C568 100%);
		border-radius: 6rpx;
		padding: 8rpx 20rpx 8rpx 20rpx;
		top: 50%;
		transform: translateY(-50%);
	}

	.remark-save-text {
		overflow-wrap: break-word;
		color: rgba(51, 51, 51, 1);
		font-size: 24rpx;
		letter-spacing: 0.7058823704719543px;
		font-weight: normal;
		text-align: left;
		white-space: nowrap;
		line-height: 33rpx;
	}
	
	.shop-detail-row.multi-row {
		display: flex;
	}

	.shop-detail-item {
		display: flex;
		align-items: center;
		font-size: 24rpx;
		
		&.switch-item {
			justify-content: space-between;
		}
	}
	
	.shop-detail-row.switch-row {
		margin-bottom: 4rpx;
		align-items: center;
	}
	
	.switch-content-wrapper {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10rpx;
		width: 100%;
		justify-content: space-between;
	}
	
	.action-buttons {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		margin-left: auto;
		gap: 10rpx;
	}
	
	.function-switch {
		transform: scale(0.8);
		margin: 0;
	}
	
	.detail-time {
		font-size: 22rpx;
		color: #999;
		white-space: nowrap;
		margin-left: 0;
	}
	
	.shop-detail-item.half-item {
		flex: 1;
	}
	
	.renew-btn {
		padding: 4rpx 16rpx;
		border-radius: 8rpx;
		border: 1px solid #1677ff;
		background: transparent;
		white-space: nowrap;
		flex-shrink: 0;
	}
	
	.renew-btn-text {
		font-size: 22rpx;
		color: #1677ff;
	}

	.detail-label {
		color: #999;
		margin-right: 0;
		flex-shrink: 0;
	}

	.help-icon-wrapper {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		margin-right: 0;
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

	.detail-colon {
		color: #999;
		margin-right: 0;
		flex-shrink: 0;
	}

	.help-popup-content {
		padding: 40rpx;
		background: #fff;
		border-radius: 16rpx;
	}

	.help-popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 24rpx;
		padding-bottom: 16rpx;
		border-bottom: 1px solid #e0e0e0;
	}

	.help-popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}

	.help-popup-close {
		width: 48rpx;
		height: 48rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 36rpx;
		color: #999;
	}

	.help-popup-body {
		max-height: 60vh;
		overflow-y: auto;
	}

	.help-popup-text {
		font-size: 28rpx;
		color: #666;
		line-height: 1.6;
		white-space: pre-wrap;
	}


	.detail-value {
		color: #333;
		flex: 1;
		
		&.state-open {
			color: #52c41a;
		}
		
		&.state-offline {
			color: #ff4d4f;
		}
		
		&.authorized {
			color: #52c41a;
		}
		
		&.unauthorized {
			color: #ff4d4f;
		}
	}

	.auth-time-row .detail-label {
		min-width: 160rpx;
	}

	.auth-time-text {
		font-size: 24rpx;
		color: #999;
	}

	.function-setting-btn {
		padding: 4rpx 16rpx;
		background: #1677ff;
		border-radius: 8rpx;
		white-space: nowrap;
		flex-shrink: 0;
	}

	.setting-btn-text {
		font-size: 22rpx;
		color: #fff;
	}

	.empty-state {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 100rpx 0;
	}

	.empty-text {
		font-size: 28rpx;
		color: #999;
	}

	.loading-more {
		display: flex;
		justify-content: center;
		align-items: center;
		padding: 30rpx 0;
	}

	.loading-text {
		font-size: 24rpx;
		color: #999;
	}

	.filter-item {
		margin-bottom: 30rpx;
	}
	
	.filter-item-title {
		font-size: 28rpx;
		font-weight: 500;
		color: #333;
	}
	
	.filter-option {
		padding: 20rpx 0;
	}
	
	.filter-option-label {
		font-size: 28rpx;
		color: #666;
	}
	
	.col-picker {
		margin-bottom: 20rpx;
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
	}
	
	.is-choose-fun {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}
	
	.clear-fun {
		position: absolute;
		top: 50%;
		right: 20rpx;
		transform: translateY(-50%);
		color: #999;
	}
	
	.filter-list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}
	
	.filter-list-item {
		padding: 10rpx 20rpx;
		border: 1px solid transparent;
		border-radius: 4px;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		background-color: rgb(240, 240, 240);
		color: #333;
	}
	
	.filter-list-item.is-active {
		border: 1px solid #FACC05;
		color: #333;
		background-color: #FACC05;
	}
	
	.filter-city-list {
		max-height: 500rpx;
		overflow-y: scroll;
	}
	
	.filter-city-list.collapse {
		max-height: 400rpx;
	}
	
	.header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.radio-list {
		padding: 10rpx 0;
	}
	
	.rotate180deg {
		transform: rotate(180deg);
	}
	
	::v-deep .wd-collapse-item__body {
		padding-top: 0;
	}
	
	::v-deep .collapse .no-border {
		&::after {
			display: none;
		}
	}
	
	.confirm-filter {
		width: 100%;
		height: 80rpx;
		background: #1677ff;
		color: #fff;
		border-radius: 8rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 28rpx;
		font-weight: 500;
		margin-top: 40rpx;
	}
	
	.col-picker {
		margin-bottom: 20rpx;
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
	}
	
	.is-choose-fun {
		flex: 1;
		font-size: 28rpx;
		color: #333;
	}
	
	.clear-fun {
		position: absolute;
		top: 50%;
		right: 20rpx;
		transform: translateY(-50%);
		color: #999;
	}
	
	.filter-list {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
	}
	
	.filter-list-item {
		padding: 10rpx 20rpx;
		border: 1px solid transparent;
		border-radius: 4px;
		margin-right: 20rpx;
		margin-bottom: 20rpx;
		font-size: 28rpx;
		background-color: rgb(240, 240, 240);
		color: #333;
	}
	
	.filter-list-item.is-active {
		border: 1px solid #FACC05;
		color: #333;
		background-color: #FACC05;
	}
	
	.filter-city-list {
		max-height: 500rpx;
		overflow-y: scroll;
	}
	
	.filter-city-list.collapse {
		max-height: 400rpx;
	}
	
	.header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.radio-list {
		padding: 10rpx 0;
	}
	
	.rotate180deg {
		transform: rotate(180deg);
	}
	
	::v-deep .wd-collapse-item__body {
		padding-top: 0;
	}
	
	.bind-popup-content {
		background: #fff;
		border-radius: 16rpx;
		overflow: hidden;
	}
	
	.bind-popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx 30rpx 20rpx;
		border-bottom: 1px solid #e0e0e0;
	}
	
	.bind-popup-title {
		font-size: 32rpx;
		font-weight: 500;
		color: #333;
	}
	
	.bind-popup-close {
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 32rpx;
		color: #999;
	}
	
	.bind-popup-body {
		padding: 30rpx;
	}
	
	.bind-code-input {
		background: #f5f5f5;
		border-radius: 8rpx;
		padding: 20rpx;
	}
	
	.bind-input-main {
		font-size: 28rpx;
		background-color: transparent;
	}
	
	.bind-popup-footer {
		display: flex;
		gap: 20rpx;
		padding: 20rpx 30rpx 30rpx;
	}

	.log-container {
		width: 100%;
		box-sizing: border-box;
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
		gap: 20rpx;
		margin-top: 30rpx;
	}

	// 分页组件样式
	.pagination-fixed-container {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		width: 100%;
		background-color: rgb(249, 249, 249);
		box-sizing: border-box;
		z-index: 15;
		border-top: 1px solid #e0e0e0;
		padding-top: 40rpx;
		padding-bottom: calc(10rpx + env(safe-area-inset-bottom));
		display: flex;
		align-items: center;
		justify-content: center;
		height: 50px;
		min-height: 50px;
		box-shadow: 0 -2rpx 8rpx rgba(0, 0, 0, 0.05);
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
		color: #fff;
		font-weight: 500;
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
		color: #fff;
		font-weight: 500;
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
		text-align: center;
		font-size: 24rpx;
		border: 1px solid #e0e0e0;
		border-radius: 4rpx;
		background: #fff;
		pointer-events: auto;
	}

	.page-separator {
		font-size: 24rpx;
		color: #666;
	}

	.page-total {
		font-size: 24rpx;
		color: #666;
	}

	.pagination-pager {
		width: 100%;
		height: 100%;
		position: relative;
	}

	/* 页码部分居中 - 隐藏原有页码显示 */
	::v-deep .pagination-pager .wd-pager__size {
		position: absolute;
		left: 50%;
		top: 50%;
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
		top: 50% !important;
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
</style>


