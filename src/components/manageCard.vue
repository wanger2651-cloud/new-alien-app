<template>
	<view class="baseItem">
		<view class="itemOne">
			<view class="oneLeft">
				<image src="../static/shop/logo.png" class="logoImg" mode="" v-if="logoText === '自动出餐'"></image>
				<image src="../static/shop/icon_013a.png" class="logoImg" mode="" v-if="logoText === 'IM自动回复'"></image>
				<image src="../static/shop/icon_014a.png" class="logoImg" mode="" v-if="logoText === '自动回评'"></image>
				<image src="../static/shop/icon_015a.png" class="logoImg" mode="" v-if="logoText === '智能推广'"></image>
				<view class="logoText" :class="{'jd-group-func-name': isJdGroupFunc() || isJdMiaosongBatchFunc()}">{{ logoText }}</view>
				<view class="twoRight">
					<view class="rightText">到期时间：</view>
					<view class="rightTime">{{filterTime(time) || '已到期'}}</view>
				</view>
			</view>
			<view class="right-btn">
				<wd-switch v-model="check" active-color="#2CCA87" :size="20" :disabled="props.disabled || isSwitchDisabled" @change="changeEnable" />
			</view>
		</view>
		<view class="itemTwo">
			<view class="data-detail-left" v-if="isJdGroupFunc()">
				<!-- 京东团购功能：左侧留空，按钮在右侧 -->
			</view>
			<view class="data-detail" v-if="logoText === '自动出餐'">
				<view class="detail-item">
					<view class="detail-item-main">
						<view class="detail-item-num">
							{{ shopType == 1 ? percentage.mealReportPercent : serviceCookingUpload.cooking_upload_rate_7d * 100 }}%
						</view>
						<view class="detail-item-text">7日出餐上报率</view>
					</view>
				</view>
				<view class="detail-item" style="margin-left: 60rpx;">
					<view class="detail-item-main">
						<view class="detail-item-num">
							{{ shopType == 1 ? percentage.realMealReportPercent : serviceCookingUpload.cooking_real_upload_rate_7d * 100 }}%
						</view>
						<view class="detail-item-text">7日出餐真实上报率</view>
					</view>
				</view>
			</view>
			<view class="data-detail" v-if="logoText === 'IM自动回复'">
				<view class="detail-item">
					<view class="detail-item-main">
						<view class="detail-item-num">{{ shopType == 1 ? statusDesc.status1 : currentMedal.silver }}</view>
						<view class="detail-item-text">{{ shopType == 1 ? '近7日五分钟回复率' : '银牌回复权益' }}</view>
					</view>
				</view>
				<view class="detail-item" style="margin-left: 10rpx;" :class="{ 'is-elm-detail-item': shopType == 2 }">
					<view class="detail-item-main">
						<view class="detail-item-num">{{ shopType == 1 ? statusDesc.status2 : currentMedal.gold }}</view>
						<view class="detail-item-text">{{ shopType == 1 ? '紧急消息1分钟回复率' : '金牌回复权益' }}</view>
					</view>
				</view>
			</view>
			<view class="data-detail" v-if="logoText === '自动回评'">
				<view class="detail-item">
					<view class="detail-item-main">
						<view class="detail-item-num">{{ shopType == 1 ? comment.favorable : '暂无数据'}}<text v-if="shopType == 1">/条</text></view>
						<view class="detail-item-text">今日新增好评数</view>
					</view>
				</view>
				<view class="detail-item" style="margin-left: 70rpx;">
					<view class="detail-item-main">
						<view class="detail-item-num">{{ shopType == 1 ? comment.mid : '暂无数据'}}<text v-if="shopType == 1">/条</text></view>
						<view class="detail-item-text">今日新增中评数</view>
					</view>
				</view>
			</view>
			<view class="data-detail data-detail-other" v-if="logoText === '智能推广'">
				<view class="detail-item">
					<view class="detail-item-main">
						<view class="detail-item-text">曝光量</view>
						<view class="detail-item-num">
							{{ shopType == 1 ? effect.showCount : elmQueryShopRealtimeInfo.expUv }}
							<view v-if="effect.showCount" class="detail-item-num-unit">次</view>
						</view>
					</view>
				</view>
				<view class="detail-item">
					<view class="detail-item-main">
						<view class="detail-item-text">{{ shopType == 1 ? '进店提升数' : '下单转化率' }}</view>
						<view class="detail-item-num">
							{{ shopType == 1 ? effect.clickCount : (elmQueryShopRealtimeInfo.ordClkRate ? (elmQueryShopRealtimeInfo.ordClkRate * 100).toFixed(2) : 0) }}
							<view v-if="effect.clickCount" class="detail-item-num-unit">次</view>
							<view v-if="elmQueryShopRealtimeInfo.ordClkRate" class="detail-item-num-unit">%</view>
						</view>
					</view>
				</view>
				<view class="detail-item">
					<view class="detail-item-main">
						<view class="detail-item-text">进店率</view>
						<view class="detail-item-num">
							{{ shopType == 1 ? effect.clickRate : (elmQueryShopRealtimeInfo.clkExpRate ? (elmQueryShopRealtimeInfo.clkExpRate * 100).toFixed(2) : 0) }}
							<view v-if="effect.clickRate || elmQueryShopRealtimeInfo.clkExpRate"
								class="detail-item-num-unit">%</view>
						</view>
					</view>
				</view>
			</view>
			<view class="button-group" :class="{'button-group-right': isJdGroupFunc() || isJdMiaosongBatchFunc()}">
				<view class="pzBut" @tap="toService" :class="{'is-elm': shopType == 2}">{{ getConfigButtonText() }}</view>
				<view class="pzBut" @tap="itemAddMoney" :class="{'is-elm': shopType == 2}">续费</view>
			</view>
		</view>
	</view>
	
	<!-- 功能配置弹窗 -->
	<wd-popup v-model="configPopupVisible" position="center" :close-on-click-modal="false" custom-style="width: 90%; max-height: 85vh; border-radius: 20rpx;" @touchmove.stop.prevent>
		<view class="config-popup" @touchmove.stop.prevent>
			<view class="config-popup-header">
				<text class="config-popup-title">执行功能 - {{ props.logoText }}</text>
				<view class="config-popup-close" @click="configPopupVisible = false">✕</view>
			</view>
			<scroll-view class="config-popup-body" scroll-y @touchmove.stop>
				<!-- 已选店铺 -->
				<view class="config-section" v-if="selectedShopInfo">
					<view class="section-title">
						<text>已选店铺{{ selectedShopInfo.length }}家</text>
					</view>
					<view class="shop-list">
						<view class="shop-item" v-for="(shop, index) in selectedShopInfo" :key="index">
							<view class="shop-info">
								<text class="shop-name">{{ shop.name || '未知店铺' }}</text>
								<text class="shop-id">{{ shop.office_id || shop.id || '' }}</text>
							</view>
							<text class="shop-remove" @click="removeShop(index)">🗑️</text>
						</view>
					</view>
				</view>
				
				<!-- 参数配置 -->
				<view class="config-section">
					<view class="section-title-row">
						<view class="section-title">参数配置</view>
						<view class="section-subtitle">默认参数(所有店铺)</view>
					</view>
					
					<!-- 动态渲染所有字段 -->
					<view 
						class="config-item" 
						v-for="(prop, key) in configSchema.properties" 
						:key="key">
						<!-- 分组选择 -->
						<template v-if="key === 'GroupOffIds'">
							<view class="config-label">
								<text>分组</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc" v-if="getGroupDescription(prop.description)">{{ getGroupDescription(prop.description) }}</view>
							<view class="category-group-selector" @click="handleAddGroupClick">
								<view class="category-group-display">
									<text v-if="selectedGroups.length === 0" class="category-group-placeholder">请选择分组（可多选）</text>
									<view v-else class="category-group-tags">
										<view 
											class="category-group-tag"
											v-for="(group, index) in selectedGroups" 
											:key="index"
										>
											{{ group.name || group.Name }}{{ group.FoodCount ? `(${group.FoodCount})` : '' }}
											<text class="category-group-tag-remove" @click.stop="removeGroup(index)">×</text>
										</view>
									</view>
								</view>
								<text class="picker-arrow">▼</text>
							</view>
						</template>
						
						<!-- 商品名关键词 -->
						<template v-else-if="key === 'FoodNameKeywords'">
							<view class="config-label">
								<text>商品名必须出现关键词</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '商品名需包含任一关键词才处理，留空表示全部' }}</view>
							<view class="keyword-tags">
								<view 
									class="keyword-tag" 
									v-for="(keyword, index) in configForm.FoodNameKeywords" 
									:key="index"
									@click="removeKeyword(index)">
									<text>{{ keyword }}</text>
									<text class="keyword-tag-close">×</text>
								</view>
								<input 
									class="keyword-input" 
									v-model="keywordInput" 
									placeholder="回车添加"
									@confirm="addKeyword"
									@blur="addKeyword"
								/>
							</view>
						</template>
						
						<!-- 上下架状态 -->
						<template v-else-if="key === 'IsOnSale'">
							<view class="config-label" :class="{ 'config-label-inline': shouldInlineDesc(key, prop) }">
								<text>上下架状态</text>
								<text class="config-help">?</text>
								<text v-if="shouldInlineDesc(key, prop)" class="config-desc-inline">{{ prop.description || '已上架或已下架' }}</text>
							</view>
							<view class="config-desc" v-if="!shouldInlineDesc(key, prop)">{{ prop.description || '已上架或已下架' }}</view>
							<picker 
								mode="selector" 
								:range="getEnumOptions(prop)" 
								:value="getEnumValueIndex(prop, configForm[key])"
								@change="(e) => onEnumChange(key, prop, e)">
								<view class="config-picker">
									<text :class="{ 'placeholder': !configForm[key] }">
										{{ configForm[key] || '请选择' }}
									</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</template>
						
						<!-- 价格调整方式 -->
						<template v-else-if="key === 'PriceAdjustType' || key === 'AdjustType'">
							<view class="config-label" :class="{ 'config-label-inline': shouldInlineDesc(key, prop) }">
								<text>{{ prop.title || key }}</text>
								<text class="config-help">?</text>
								<text v-if="shouldInlineDesc(key, prop)" class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="config-desc" v-if="!shouldInlineDesc(key, prop)">{{ prop.description || '' }}</view>
							<picker 
								mode="selector" 
								:range="getEnumOptions(prop)" 
								:value="getEnumValueIndex(prop, configForm[key])"
								@change="(e) => onEnumChange(key, prop, e)">
								<view class="config-picker">
									<text :class="{ 'placeholder': !configForm[key] }">
										{{ configForm[key] || '请选择' }}
									</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</template>
						
						<!-- 创建减配送费活动：活动时间（起止日期） -->
						<template v-else-if="key === 'ActivityTime' && currentBackendCode === 'CREATEFREIGHTPROMO'">
							<view class="config-label config-label-inline">
								<text>{{ prop.title || '活动时间' }}</text>
								<text class="config-help">?</text>
								<text class="config-desc-inline">{{ prop.description || '活动的开始与结束日期' }}</text>
							</view>
							<view class="date-range-row">
								<picker mode="date" :value="freightPromoBeginDate" @change="onFreightPromoBeginDateChange">
									<view class="config-picker">
										<text :class="{ 'placeholder': !freightPromoBeginDate }">{{ freightPromoBeginDate || '选择开始日期' }}</text>
										<text class="picker-arrow">▼</text>
									</view>
								</picker>
								<picker mode="date" :value="freightPromoEndDate" @change="onFreightPromoEndDateChange">
									<view class="config-picker">
										<text :class="{ 'placeholder': !freightPromoEndDate }">{{ freightPromoEndDate || '选择结束日期' }}</text>
										<text class="picker-arrow">▼</text>
									</view>
								</picker>
							</view>
						</template>
						
						<!-- 店内领券活动：活动时间（开始/结束） -->
						<template v-else-if="key === 'ActivityTime' && currentBackendCode === 'CREATEINSHOPCOUPON'">
							<view class="config-label config-label-inline">
								<text>{{ prop.title || '活动时间' }}</text>
								<text class="config-help">?</text>
								<text class="config-desc-inline">{{ prop.description || '活动的开始与结束时间' }}</text>
							</view>
							<view class="date-range-row">
								<picker mode="date" :value="inshopCouponBeginDate" @change="onInshopCouponBeginDateChange">
									<view class="config-picker">
										<text :class="{ 'placeholder': !inshopCouponBeginDate }">{{ inshopCouponBeginDate || '选择开始日期' }}</text>
										<text class="picker-arrow">▼</text>
									</view>
								</picker>
								<picker mode="date" :value="inshopCouponEndDate" @change="onInshopCouponEndDateChange">
									<view class="config-picker">
										<text :class="{ 'placeholder': !inshopCouponEndDate }">{{ inshopCouponEndDate || '选择结束日期' }}</text>
										<text class="picker-arrow">▼</text>
									</view>
								</picker>
							</view>
						</template>
						
						<!-- 店内领券活动：生效渠道（配送/自取 多选） -->
						<template v-else-if="key === 'PerformanceTypes' && currentBackendCode === 'CREATEINSHOPCOUPON'">
							<view class="config-label config-label-inline">
								<text>{{ prop.title || '生效渠道' }}</text>
								<text class="config-help">?</text>
								<text class="config-desc-inline">{{ prop.description || '配送、自取可多选' }}</text>
							</view>
							<view class="chip-list chip-list-wrap">
								<view
									v-for="opt in getArrayItemEnumOptions(prop)"
									:key="opt"
									class="chip"
									:class="{ 'chip-active': isInshopPerformanceSelected(opt) }"
									@click.stop="toggleInshopPerformance(opt)"
								>{{ opt }}</view>
							</view>
						</template>
						
						<!-- 满减活动：活动时间（开始/结束） -->
						<template v-else-if="key === 'ActivityTime' && currentBackendCode === 'CREATEMANJIAN'">
							<view class="config-label config-label-inline">
								<text>{{ prop.title || '生效时间' }}</text>
								<text class="config-help">?</text>
								<text class="config-desc-inline">{{ prop.description || '活动的开始与结束时间' }}</text>
							</view>
							<view class="date-range-row">
								<picker mode="date" :value="manjianBeginDate" @change="onManjianBeginDateChange">
									<view class="config-picker">
										<text :class="{ 'placeholder': !manjianBeginDate }">{{ manjianBeginDate || '选择开始日期' }}</text>
										<text class="picker-arrow">▼</text>
									</view>
								</picker>
								<picker mode="date" :value="manjianEndDate" @change="onManjianEndDateChange">
									<view class="config-picker">
										<text :class="{ 'placeholder': !manjianEndDate }">{{ manjianEndDate || '选择结束日期' }}</text>
										<text class="picker-arrow">▼</text>
									</view>
								</picker>
							</view>
						</template>
						
						<!-- 满减活动：生效渠道（配送/自提 多选；自提强制选中） -->
						<template v-else-if="key === 'DeliveryTypes' && currentBackendCode === 'CREATEMANJIAN'">
							<view class="config-label config-label-inline">
								<text>{{ prop.title || '生效渠道' }}</text>
								<text class="config-help">?</text>
								<text class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="chip-list chip-list-wrap">
								<view
									v-for="opt in getArrayItemEnumOptions(prop)"
									:key="opt"
									class="chip"
									:class="{ 'chip-active': isManjianDeliverySelected(opt) }"
									@click.stop="toggleManjianDelivery(opt)"
								>{{ opt }}</view>
							</view>
						</template>
						
						<!-- 满减活动：满减阶梯（Ladders：可添加多条） -->
						<template v-else-if="key === 'Ladders' && currentBackendCode === 'CREATEMANJIAN'">
							<view class="config-label">
								<text>{{ prop.title || '满减阶梯' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '可添加多条，每项填写满额与减免金额' }}</view>
							<view class="ladder-list">
								<view class="ladder-item" v-for="(r, idx) in (configForm[key] || [])" :key="idx">
									<view class="ladder-row">
										<text class="ladder-label">满额(元)</text>
										<input class="ladder-input" type="number" v-model="r.LowerLimitAmount" placeholder="0" />
										<text class="ladder-label">减免(元)</text>
										<input class="ladder-input" type="number" v-model="r.DiscountAmount" placeholder="0" />
										<view class="ladder-remove" @click.stop="removeManjianLadderRule(idx)">删除</view>
									</view>
								</view>
								<view class="ladder-add" @click.stop="addManjianLadderRule">+ 添加阶梯</view>
							</view>
						</template>
						
						<!-- 品牌饭卡：充值档位列表（RechargeTiers） -->
						<template v-else-if="key === 'RechargeTiers' && currentBackendCode === 'CREATEBRANDMEALCARD'">
							<view class="config-label">
								<text>{{ prop.title || '充值档位列表' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '最多5档充值方案，留空的档位将不创建' }}</view>
							<view class="ladder-list">
								<view class="ladder-item" v-for="(r, idx) in (configForm[key] || [])" :key="idx">
									<view class="ladder-row">
										<text class="ladder-label">充值(元)</text>
										<input class="ladder-input" type="number" v-model="r.RechargeAmountYuan" placeholder="0" />
										<text class="ladder-label">赠送(元)</text>
										<input class="ladder-input" type="number" v-model="r.GiftAmountYuan" placeholder="0" />
										<view class="ladder-remove" v-if="(configForm[key] || []).length > 1" @click.stop="removeBrandMealCardTier(idx)">删除</view>
									</view>
									<view class="tier-stock-row">
										<view class="tier-stock-left">
											<text class="tier-stock-label">限库存</text>
											<switch :checked="!!r.NeedStockLimit" @change="(e) => onBrandTierNeedStockChange(idx, e)" />
										</view>
										<input
											v-if="!!r.NeedStockLimit"
											class="tier-stock-input"
											type="number"
											v-model="r.StockLimitCount"
											placeholder="库存数量"
										/>
									</view>
								</view>
								<view class="ladder-add" v-if="(configForm[key] || []).length < 5" @click.stop="addBrandMealCardTier">+ 添加档位</view>
							</view>
						</template>

						<!-- 营业时间：营业时间配置（GroupServiceTimeDays） -->
						<template v-else-if="key === 'GroupServiceTimeDays' && currentBackendCode === 'UPDATESTOREBUSINESSTIME' && configForm.SetBusinessTime">
							<view class="config-label">
								<text>{{ prop.title || '营业时间配置' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '按“周几 + 时间段”分组设置营业时间，可新增多组和多段' }}</view>
							<view class="ladder-list">
								<view
									class="ladder-item"
									v-for="(g, gIdx) in (configForm[key] || [])"
									:key="gIdx"
								>
									<view class="config-label">
										<text class="ladder-label">适用星期</text>
									</view>
									<view class="chip-list chip-list-wrap">
										<view
											v-for="day in storeBusinessWeekDays"
											:key="day"
											class="chip"
											:class="{ 'chip-active': isStoreBizWeekSelected(gIdx, day) }"
											@click.stop="toggleStoreBizWeek(gIdx, day)"
										>{{ day }}</view>
									</view>
									<view class="chip-helper">不选表示本组不生效（建议至少选择一个星期）</view>

									<view class="config-label" style="margin-top: 16rpx;">
										<text class="ladder-label">时间段列表</text>
									</view>
									<view class="time-range-list">
										<view
											class="time-range-item"
											v-for="(t, tIdx) in (g.ServiceTimePartList || [])"
											:key="tIdx"
										>
											<input class="time-input" v-model="t.StartTime" placeholder="00:00" />
											<text class="time-sep">-</text>
											<input class="time-input" v-model="t.EndTime" placeholder="23:59" />
											<view
												class="time-remove"
												v-if="(g.ServiceTimePartList || []).length > 1"
												@click.stop="removeStoreBizTimePart(gIdx, tIdx)"
											>删除</view>
										</view>
										<view class="time-add" @click.stop="addStoreBizTimePart(gIdx)">+ 添加时间段</view>
									</view>

									<view
										class="ladder-remove"
										v-if="(configForm[key] || []).length > 1"
										@click.stop="removeStoreBizGroup(gIdx)"
									>删除该分组</view>
								</view>
								<view class="ladder-add" @click.stop="addStoreBizGroup">+ 添加分组</view>
							</view>
						</template>
						
						<!-- 创建减配送费活动：自动延期 -->
						<template v-else-if="key === 'AutoDelay' && currentBackendCode === 'CREATEFREIGHTPROMO'">
							<view class="config-label config-label-inline">
								<text>{{ prop.title || '自动延期' }}</text>
								<text class="config-help">?</text>
								<text class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="switch-row">
								<switch :checked="!!configForm[key]" @change="(e) => configForm[key] = !!e.detail.value" />
								<text class="switch-status">{{ !!configForm[key] ? '开启' : '关闭' }}</text>
							</view>
						</template>
						
						<!-- 创建减配送费活动：生效周期（周几，多选） -->
						<template v-else-if="key === 'CycleDays' && currentBackendCode === 'CREATEFREIGHTPROMO'">
							<view class="config-label config-label-inline">
								<text>{{ prop.title || '生效周期' }}</text>
								<text class="config-help">?</text>
								<text class="config-desc-inline">{{ prop.description || '每天或按指定周期生效' }}</text>
							</view>
							<view class="chip-list">
								<view
									v-for="day in freightPromoWeekDays"
									:key="day"
									class="chip"
									:class="{ 'chip-active': isFreightPromoCycleDaySelected(day) }"
									@click.stop="toggleFreightPromoCycleDay(day)"
								>{{ day }}</view>
							</view>
							<view class="chip-helper">不选=默认全选</view>
						</template>
						
						<!-- 创建减配送费活动：生效时段（可多条） -->
						<template v-else-if="key === 'CycleTimes' && currentBackendCode === 'CREATEFREIGHTPROMO'">
							<view class="config-label">
								<text>{{ prop.title || '生效时段' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '至少一个时间段，格式 HH:mm' }}</view>
							<view class="time-range-list">
								<view class="time-range-item" v-for="(t, idx) in (configForm[key] || [])" :key="idx">
									<input class="time-input" v-model="t.StartHourAndMin" placeholder="00:00" />
									<text class="time-sep">-</text>
									<input class="time-input" v-model="t.EndHourAndMin" placeholder="23:59" />
									<view class="time-remove" v-if="(configForm[key] || []).length > 1" @click.stop="removeFreightPromoCycleTime(idx)">删除</view>
								</view>
								<view class="time-add" @click.stop="addFreightPromoCycleTime">+ 添加时段</view>
							</view>
						</template>
						
						<!-- 创建减配送费活动：满减阶梯（可多条） -->
						<template v-else-if="key === 'ActivityRuleList' && currentBackendCode === 'CREATEFREIGHTPROMO' && isFreightPromoMj">
							<view class="config-label">
								<text>{{ prop.title || '满减阶梯' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '按价格满减时使用，可配置多档阶梯' }}</view>
							<view class="ladder-list">
								<view class="ladder-item" v-for="(r, idx) in (configForm[key] || [])" :key="idx">
									<view class="ladder-row">
										<text class="ladder-label">满额(元)</text>
										<input class="ladder-input" type="number" v-model="r.RuleThresholdYuan" placeholder="0" />
										<text class="ladder-label">减免(元)</text>
										<input class="ladder-input" type="number" v-model="r.RuleFreeYuan" placeholder="0" />
										<view class="ladder-remove" @click.stop="removeFreightPromoLadderRule(idx)">删除</view>
									</view>
								</view>
								<view class="ladder-add" @click.stop="addFreightPromoLadderRule">+ 添加阶梯</view>
							</view>
						</template>
						
						<!-- 批量改商品名：更改方式 -->
						<template v-else-if="key === 'ChangeType' || key === 'Mode'">
							<view class="config-label" :class="{ 'config-label-inline': shouldInlineDesc(key, prop) }">
								<text>{{ prop.title || '更改方式' }}</text>
								<text class="config-help">?</text>
								<text v-if="shouldInlineDesc(key, prop)" class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="config-desc" v-if="!shouldInlineDesc(key, prop)">{{ prop.description || '' }}</view>
							<picker 
								mode="selector" 
								:range="getEnumOptions(prop)" 
								:value="getEnumValueIndex(prop, configForm[key])"
								@change="(e) => onEnumChange(key, prop, e)">
								<view class="config-picker">
									<text :class="{ 'placeholder': !configForm[key] }">
										{{ configForm[key] || '请选择' }}
									</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</template>
						
						<!-- 批量改商品名：前缀（当更改方式为添加前缀时显示） -->
						<template v-else-if="key === 'Prefix' && shouldShowPrefixField()">
							<view class="config-label">
								<text>{{ prop.title || '前缀' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '在商品名前添加的文字' }}</view>
							<input 
								class="config-text-input" 
								v-model="configForm[key]" 
								:placeholder="prop.default || '请输入前缀'"
							/>
						</template>
						
						<!-- 批量改商品名：后缀（当更改方式为添加后缀时显示） -->
						<template v-else-if="key === 'Suffix' && shouldShowSuffixField()">
							<view class="config-label">
								<text>{{ prop.title || '后缀' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '在商品名后添加的文字' }}</view>
							<input 
								class="config-text-input" 
								v-model="configForm[key]" 
								:placeholder="prop.default || '请输入后缀'"
							/>
						</template>
						
						<!-- 批量改商品名：原文字（当更改方式为替换文字时显示） -->
						<template v-else-if="key === 'OriginalText' && shouldShowOriginalTextField()">
							<view class="config-label">
								<text>{{ prop.title || '原文字' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '需要被替换的原始文字' }}</view>
							<input 
								class="config-text-input" 
								v-model="configForm[key]" 
								:placeholder="prop.default || '请输入原文字'"
							/>
						</template>
						
						<!-- 批量改商品名：替换文字（当更改方式为替换文字或完全重命名时显示） -->
						<template v-else-if="key === 'ReplacementText' && shouldShowReplacementTextField()">
							<view class="config-label">
								<text>{{ prop.title || '替换文字' }}</text>
								<text class="config-help">?</text>
							</view>
							<view class="config-desc">{{ prop.description || '替换后的文字或新的商品名' }}</view>
							<input 
								class="config-text-input" 
								v-model="configForm[key]" 
								:placeholder="prop.default || '请输入替换文字'"
							/>
						</template>
						
						<!-- 调整值（数字输入） -->
						<template
							v-else-if="
								key === 'AdjustmentValue' ||
								key === 'AdjustValue' ||
								((prop.type === 'number' || prop.type === 'integer') &&
									!(currentBackendCode === 'CREATEFREIGHTPROMO' && isFreightPromoMj))
							"
						>
							<view class="config-label" :class="{ 'config-label-inline': shouldInlineDesc(key, prop) }">
								<text>{{ prop.title || key }}</text>
								<text class="config-help">?</text>
								<text v-if="shouldInlineDesc(key, prop)" class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="config-desc" v-if="!shouldInlineDesc(key, prop)">{{ prop.description || '' }}</view>
							<view class="number-input-wrapper">
								<view class="number-btn" @click.stop="decreaseNumber(key)">-</view>
								<input 
									class="number-input" 
									type="number"
									step="0.01"
									:value="configForm[key] !== undefined && configForm[key] !== null ? configForm[key] : (prop.default || 0)"
									@input="(e) => handleNumberInput(key, e, prop)"
									@click.stop
									:placeholder="prop.default || '0'"
								/>
								<view class="number-btn" @click.stop="increaseNumber(key)">+</view>
							</view>
						</template>
						
						<!-- 布尔类型（开关） -->
						<template v-else-if="prop.type === 'boolean'">
							<view class="config-label" :class="{ 'config-label-inline': shouldInlineDesc(key, prop) }">
								<text>{{ prop.title || key }}</text>
								<text class="config-help">?</text>
								<text v-if="shouldInlineDesc(key, prop)" class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="config-desc" v-if="!shouldInlineDesc(key, prop)">{{ prop.description || '' }}</view>
							<view class="switch-row">
								<switch :checked="!!configForm[key]" @change="(e) => configForm[key] = !!e.detail.value" />
								<text class="switch-status">{{ !!configForm[key] ? '开启' : '关闭' }}</text>
							</view>
						</template>
						
						<!-- 其他枚举类型 -->
						<template v-else-if="prop.oneOf || prop.enum || (prop.$ref && configSchema.definitions)">
							<view class="config-label" :class="{ 'config-label-inline': shouldInlineDesc(key, prop) }">
								<text>{{ prop.title || key }}</text>
								<text class="config-help">?</text>
								<text v-if="shouldInlineDesc(key, prop)" class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="config-desc" v-if="!shouldInlineDesc(key, prop)">{{ prop.description || '' }}</view>
							<picker 
								mode="selector" 
								:range="getEnumOptions(prop)" 
								:value="getEnumValueIndex(prop, configForm[key])"
								@change="(e) => onEnumChange(key, prop, e)">
								<view class="config-picker">
									<text :class="{ 'placeholder': !configForm[key] }">
										{{ configForm[key] || '请选择' }}
									</text>
									<text class="picker-arrow">▼</text>
								</view>
							</picker>
						</template>
						
						<!-- 字符串输入 -->
						<template v-else-if="prop.type === 'string'">
							<view class="config-label" :class="{ 'config-label-inline': shouldInlineDesc(key, prop) }">
								<text>{{ prop.title || key }}</text>
								<text class="config-help">?</text>
								<text v-if="shouldInlineDesc(key, prop)" class="config-desc-inline">{{ prop.description || '' }}</text>
							</view>
							<view class="config-desc" v-if="!shouldInlineDesc(key, prop)">{{ prop.description || '' }}</view>
							<input 
								class="config-text-input" 
								v-model="configForm[key]" 
								:placeholder="prop.default || ''"
							/>
						</template>
					</view>
				</view>
			</scroll-view>
			<view class="config-popup-footer">
				<wd-button type="info" size="large" @click="configPopupVisible = false" block>取消</wd-button>
				<wd-button size="large" @click="confirmExecute" block>执行({{ selectedShopInfo?.length || 1 }})</wd-button>
			</view>
		</view>
	</wd-popup>
	
	<!-- 分组选择弹窗 -->
	<wd-popup v-model="showGroupSelector" position="bottom" :safe-area-inset-bottom="true">
		<view class="group-selector-popup">
			<view class="group-selector-header">
				<text class="group-selector-title">选择分组</text>
				<view class="group-selector-close" @click="showGroupSelector = false">✕</view>
			</view>
			<scroll-view class="group-selector-body" scroll-y>
				<view 
					class="group-selector-item" 
					v-for="(group, index) in groupList" 
					:key="getGroupId(group) || index"
					:class="{ 'group-selected': isGroupSelected(getGroupId(group)) }"
					@click.stop="toggleGroup(group)">
					<view class="group-checkbox" :class="{ 'checkbox-active': isGroupSelected(getGroupId(group)) }">
						<text v-if="isGroupSelected(getGroupId(group))">✓</text>
					</view>
					<text class="group-name">{{ group.name }}{{ group.FoodCount ? `(${group.FoodCount})` : '' }}</text>
				</view>
			</scroll-view>
			<view class="group-selector-footer">
				<wd-button size="large" @click="confirmGroupSelection" block>确定</wd-button>
			</view>
		</view>
	</wd-popup>
	
	<!-- 类目属性批量设置配置弹窗 -->
	<wd-popup v-model="categoryAttrPopupVisible" position="center" :close-on-click-modal="false" custom-style="width: 90%; max-height: 85vh; border-radius: 20rpx;" @touchmove.stop.prevent>
		<view class="config-popup" @touchmove.stop.prevent>
			<view class="config-popup-header">
				<text class="config-popup-title">执行功能 - {{ props.logoText }}</text>
				<view class="config-popup-close" @click="categoryAttrPopupVisible = false">✕</view>
			</view>
			<scroll-view class="config-popup-body" scroll-y @touchmove.stop>
				<!-- 已选店铺 -->
				<view class="config-section" v-if="selectedShopInfo && selectedShopInfo.length > 0">
					<view class="section-title">
						<text>已选店铺{{ selectedShopInfo.length }}家</text>
					</view>
					<view class="shop-list">
						<view class="shop-item" v-for="(shop, index) in selectedShopInfo" :key="index">
							<view class="shop-info">
								<text class="shop-name">{{ shop.name || '未知店铺' }}</text>
								<text class="shop-id">{{ shop.office_id || shop.id || '' }}</text>
							</view>
							<text class="shop-remove" @click="removeShop(index)">🗑️</text>
						</view>
					</view>
				</view>
				
				<!-- 参数配置 -->
				<view class="config-section">
					<view class="section-title-row">
						<view class="section-title">参数配置</view>
						<view class="section-subtitle">默认参数(所有店铺)</view>
					</view>
					
					<!-- 属性值为空时的处理规则 -->
					<view class="attr-rules-box">
						<view class="attr-rules-icon">ℹ️</view>
						<view class="attr-rules-content">
							<view class="attr-rules-title">属性值为空时的处理规则</view>
							<view class="attr-rules-item">主料：为空时，根据菜品名和规格分组名进行模糊匹配（可多选或单选）</view>
							<view class="attr-rules-item">辅料：为空时，默认填"调味料"</view>
							<view class="attr-rules-item">口味：为空时，默认填"原味"</view>
							<view class="attr-rules-item">其他属性：为空时，不设置</view>
							<view class="attr-rules-item">若填入的值在类目中找不到，按上述规则处理</view>
						</view>
					</view>
					
					<!-- 选择分组 -->
					<view class="category-group-section">
						<view class="section-title">选择分组（可选，不选则应用到所有分组）</view>
						<view class="category-group-selector" @click="categoryShowGroupSelector = true">
							<view class="category-group-display">
								<text v-if="categorySelectedGroupIds.length === 0" class="category-group-placeholder">请选择分组（可多选）</text>
								<view v-else class="category-group-tags">
									<view 
										class="category-group-tag"
										v-for="groupId in categorySelectedGroupIds"
										:key="groupId"
									>
										{{ getCategoryGroupName(groupId) }}
										<text class="category-group-tag-remove" @click.stop="removeCategoryGroup(groupId)">×</text>
									</view>
								</view>
							</view>
							<text class="picker-arrow">▼</text>
						</view>
					</view>
					
					<!-- 属性信息 -->
					<view class="attr-info-section">
						<view class="section-title">属性信息</view>
						
						<!-- 属性输入字段（两列布局） -->
						<view class="attr-fields-grid">
							<view 
								class="attr-field-item" 
								v-for="property in categoryProperties" 
								:key="property.Prty?.off_id">
								<view class="attr-field-label">{{ property.Prty?.name }}</view>
								<!-- 主料、辅料、过敏源使用多选下拉框 -->
								<view 
									v-if="property.Prty?.multi_select && (property.Prty?.name === '主料' || property.Prty?.name === '辅料' || property.Prty?.name === '过敏源')"
									class="attr-multi-picker-wrapper"
									@click="showMultiPicker(property.Prty?.off_id, property.Values, property.Prty?.name)"
								>
									<view class="attr-field-picker">
										<view class="picker-text-wrapper" :class="{ 'placeholder': !getMultiSelectedDisplay(property.Prty?.off_id, property.Values) }">
											<text class="picker-text">{{ getMultiSelectedDisplay(property.Prty?.off_id, property.Values) || '请选择（可多选）' }}</text>
										</view>
										<text class="picker-arrow">▼</text>
									</view>
								</view>
								<!-- 其他多选属性使用标签选择 -->
								<view v-else-if="property.Prty?.multi_select" class="attr-field-multi">
									<view 
										class="attr-value-tag"
										v-for="value in property.Values"
										:key="value.Office_Id"
										:class="{ 'selected': isAttrValueSelected(property.Prty?.off_id, value.Office_Id) }"
										@click="handleAttrValueChange(property.Prty?.off_id, value.Office_Id, !isAttrValueSelected(property.Prty?.off_id, value.Office_Id))"
									>
										{{ value.Name }}
									</view>
								</view>
								<!-- 单选属性使用普通下拉框 -->
								<picker 
									v-else
									mode="selector"
									:range="property.Values.map(v => v.Name)"
									:value="getAttrValueIndex(property.Prty?.off_id, property.Values)"
									@change="(e) => handleSingleAttrChange(property.Prty?.off_id, property.Values[e.detail.value]?.Office_Id)"
								>
									<view class="attr-field-picker">
										<text class="picker-text-single" :class="{ 'placeholder': !getAttrSelectedValue(property.Prty?.off_id, property.Values) }">
											{{ getAttrSelectedValue(property.Prty?.off_id, property.Values) || '请选择' }}
										</text>
										<text class="picker-arrow">▼</text>
									</view>
								</picker>
							</view>
						</view>
						
						<!-- 其他属性（可自定义） -->
						<view class="custom-attr-section">
							<view class="section-title">其他属性（属性名可自定义输入）</view>
							<view class="custom-attr-inputs-wrapper">
								<view class="custom-attr-input-group">
									<view class="custom-attr-input-label">属性名</view>
									<input 
										class="custom-attr-name-input" 
										v-model="customAttrName" 
										placeholder="如:口味"
									/>
								</view>
								<view class="custom-attr-input-group">
									<view class="custom-attr-input-label">属性值</view>
									<input 
										class="custom-attr-value-input" 
										v-model="customAttrValue" 
										placeholder="输入后回车添加,可多个"
										@confirm="addCustomAttrValue"
										@blur="addCustomAttrValue"
									/>
								</view>
							</view>
							<view class="custom-attr-values" v-if="customAttrValues.length > 0">
								<view 
									class="custom-attr-value-tag"
									v-for="(value, index) in customAttrValues"
									:key="index"
									@click="removeCustomAttrValue(index)"
								>
									{{ value }} ×
								</view>
							</view>
							<view class="custom-attr-add-btn" @click="addCustomAttr" v-if="customAttrName && customAttrValues.length > 0">
								+ 添加属性
							</view>
							<view class="custom-attr-list" v-if="customAttrs.length > 0">
								<view 
									class="custom-attr-item"
									v-for="(attr, index) in customAttrs"
									:key="index"
								>
									<text class="custom-attr-item-name">{{ attr.name }}:</text>
									<text class="custom-attr-item-values">{{ attr.values.join(', ') }}</text>
									<text class="custom-attr-item-remove" @click="removeCustomAttr(index)">×</text>
								</view>
							</view>
						</view>
						
						<!-- 必填属性 -->
						<view class="required-attr-section">
							<view class="section-title">必填属性（未指定时自动填第一个）</view>
							<view class="required-attr-list">
								<view 
									class="required-attr-item"
									v-for="property in categoryProperties"
									:key="property.Prty?.off_id"
									@click="toggleRequiredAttr(property.Prty?.off_id)"
								>
									<view class="required-attr-checkbox" :class="{ 'checked': isRequiredAttr(property.Prty?.off_id) }">
										<text v-if="isRequiredAttr(property.Prty?.off_id)">✓</text>
									</view>
									<text class="required-attr-name">{{ property.Prty?.name }}</text>
								</view>
							</view>
						</view>
					</view>
				</view>
			</scroll-view>
			<view class="config-popup-footer">
				<wd-button type="info" size="large" @click="categoryAttrPopupVisible = false" block>取消</wd-button>
				<wd-button size="large" @click="confirmCategoryAttrExecute" block>执行({{ selectedShopInfo?.length || 1 }})</wd-button>
			</view>
		</view>
	</wd-popup>
	
	<!-- 分组选择弹窗 -->
	<wd-popup v-model="categoryShowGroupSelector" position="bottom" :safe-area-inset-bottom="true">
		<view class="group-selector-popup">
			<view class="group-selector-header">
				<text class="group-selector-title">选择分组（可多选）</text>
				<view class="group-selector-close" @click="categoryShowGroupSelector = false">✕</view>
			</view>
			<scroll-view class="group-selector-body" scroll-y>
				<view 
					class="group-selector-item"
					v-for="group in categoryGroups"
					:key="group.id || group.OfficeId"
					:class="{ 'selected': isCategoryGroupSelected(group.id || group.OfficeId) }"
					@click.stop="toggleCategoryGroupSelection(group.id || group.OfficeId)"
				>
					<view class="group-selector-checkbox" :class="{ 'checked': isCategoryGroupSelected(group.id || group.OfficeId) }">
						<text v-if="isCategoryGroupSelected(group.id || group.OfficeId)">✓</text>
					</view>
					<text class="group-selector-name">{{ group.name || group.Name }}</text>
					<text class="group-selector-count" v-if="group.FoodCount">({{ group.FoodCount }})</text>
				</view>
				<view v-if="categoryGroups.length === 0" class="group-selector-empty">
					<text>暂无分组</text>
				</view>
			</scroll-view>
			<view class="group-selector-footer">
				<wd-button type="info" size="large" @click="clearCategoryGroupSelection" style="flex: 1; margin-right: 20rpx;">取消选择</wd-button>
				<wd-button size="large" @click="confirmCategoryGroupSelection" style="flex: 1;">确定</wd-button>
			</view>
		</view>
	</wd-popup>
	
	<!-- 多选下拉框弹窗 -->
	<wd-popup v-model="showMultiPickerPopup" position="bottom" :safe-area-inset-bottom="true">
		<view class="multi-picker-popup">
			<view class="multi-picker-header">
				<text class="multi-picker-title">选择{{ currentMultiPickerAttrName }}（可多选）</text>
				<view class="multi-picker-close" @click="showMultiPickerPopup = false">✕</view>
			</view>
			<view class="multi-picker-search">
				<input 
					class="multi-picker-search-input" 
					v-model="multiPickerSearchText" 
					placeholder="搜索属性值"
					@input="handleMultiPickerSearch"
					:disabled="isSearching"
				/>
				<view v-if="isSearching" class="multi-picker-search-loading">搜索中...</view>
			</view>
			<scroll-view class="multi-picker-body" scroll-y>
				<view 
					class="multi-picker-item"
					v-for="value in filteredMultiPickerValues"
					:key="value.Office_Id"
					:class="{ 'selected': isMultiPickerValueSelected(value.Office_Id) }"
					@click="toggleMultiPickerValue(value.Office_Id)"
				>
					<view class="multi-picker-checkbox" :class="{ 'checked': isMultiPickerValueSelected(value.Office_Id) }">
						<text v-if="isMultiPickerValueSelected(value.Office_Id)">✓</text>
					</view>
					<text class="multi-picker-name">{{ value.Name }}</text>
				</view>
				<view v-if="filteredMultiPickerValues.length === 0" class="multi-picker-empty">
					<text>暂无匹配结果</text>
				</view>
			</scroll-view>
			<view class="multi-picker-footer">
				<wd-button type="info" size="large" @click="clearMultiPickerSelection" style="flex: 1; margin-right: 20rpx;">取消选择</wd-button>
				<wd-button size="large" @click="confirmMultiPicker" style="flex: 1;">确定</wd-button>
			</view>
		</view>
	</wd-popup>
</template>

<script setup>
	import {
		onMounted,
		ref,
		watch,
		computed
	} from 'vue';
	import {
		useRouter
	} from '@/utils/router';
	const emit = defineEmits(['addMoney', 'update:modelValue'])
	const router = useRouter()
	let check = ref(false)
	const props = defineProps(['logoText', 'time', 'pageUrl', 'enable', 'shopType', 'effect', 'percentage', 'comment',
		'statusDesc', 'currentItem', 'elmQueryShopRealtimeInfo', 'serviceCookingUpload', 'currentMedal', 'disabled', 'shopId'
	]);
	const toService = async () => {
		// 京东团购功能和京东秒送批量管理功能：执行功能
		if (isJdGroupFunc() || isJdMiaosongBatchFunc()) {
			const expired = isFuncExpired()
			
			// 如果已到期，提示续费开通
			if (expired) {
				uni.showModal({
					title: '提示',
					content: '该功能已到期，请先续费开通',
					showCancel: false,
					confirmText: '确定'
				})
				return
			}
			
			// 未到期，直接打开配置弹窗
			await executeJdGroupFunc()
			return
		}
		
		// 评价申诉配置：在 APP 内通过 webview 打开后台配置页（使用店铺的唯一ID，而不是 office_id）
		if (props.currentItem?.code === 'PJSS') {
			const shopInfo = uni.getStorageSync('shopInfo') || {}
			// 后端配置页使用的是店铺的主键ID（类似 12196784299114693），优先取 id，其次兼容可能的字段名
			const shopPkId = shopInfo.id || shopInfo.shop_offid || shopInfo.offid || shopInfo.office_id || ''
			if (!shopPkId) {
				uni.showToast({
					title: '缺少店铺ID，无法打开配置页',
					icon: 'none',
					duration: 2000
				})
				return
			}
			uni.navigateTo({
				url: '/pages/pjss-web/pjss-web?id=' + shopPkId
			})
			return
		}

		// 其他功能必须有跳转地址，否则提示在电脑端配置
		if (!props.pageUrl) {
			uni.showToast({
				title: '请在电脑端配置该功能',
				icon: 'none',
				duration: 2000
			})
			return
		}
		uni.navigateTo({
			url: props.pageUrl,
		})
	}
	
	// 配置弹窗相关
	const configPopupVisible = ref(false)
	const configSchema = ref({})
	const configForm = ref({})
	const keywordInput = ref('')
	const selectedGroups = ref([])
	const groupList = ref([])
	const showGroupSelector = ref(false)
	const tempSelectedGroupIds = ref([])
	const currentBackendCode = ref('')
	const currentShopId = ref('')
	const currentApiShopType = ref(0)
	const selectedShopInfo = ref([])
	
	// 类目属性批量设置相关状态
	const categoryAttrPopupVisible = ref(false)
	const categoryProperties = ref([]) // 属性列表
	const categoryGroups = ref([]) // 分组列表
	const categoryAttrForm = ref({}) // 属性值表单 {属性ID: [值ID数组]}
	const requiredAttrs = ref([]) // 必填属性ID数组
	const customAttrs = ref([]) // 自定义属性 [{name: '', values: []}]
	const customAttrName = ref('')
	const customAttrValue = ref('')
	const customAttrValues = ref([])
	const categorySelectedGroupIds = ref([]) // 类目属性批量设置选中的分组ID数组
	const categoryShowGroupSelector = ref(false) // 类目属性批量设置是否显示分组选择器
	
	// 多选下拉框相关状态
	const showMultiPickerPopup = ref(false)
	const currentMultiPickerAttrId = ref('')
	const currentMultiPickerAttrName = ref('')
	const currentMultiPickerValues = ref([])
	const tempMultiSelectedIds = ref([])
	const multiPickerSearchText = ref('')
	const filteredMultiPickerValues = ref([])
	const currentMultiPickerProperty = ref(null) // 当前属性对象，包含 off_id 等信息
	const isSearching = ref(false) // 是否正在搜索
	const multiPickerValuesCache = ref({}) // 缓存每个属性的完整值列表（包括搜索结果）
	
	// 创建减配送费活动：日期选择（仅用于 UI 展示，最终写回 configForm.ActivityTime）
	const freightPromoBeginDate = ref('')
	const freightPromoEndDate = ref('')
	const freightPromoWeekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
	
	// 店内领券活动：活动时间（BeginTime/EndTime date-time）
	const inshopCouponBeginDate = ref('')
	const inshopCouponEndDate = ref('')

	// 创建满减活动（CREATEMANJIAN）：活动时间（BeginTime/EndTime date-time）
	const manjianBeginDate = ref('')
	const manjianEndDate = ref('')

	// 创建减配送费活动：根据“活动方式”选择结果控制“统一立减/满减阶梯”展示
	// 统一立减 = 1, 按距离减 = 2, 满减 = 3
	const freightPromoSelectedSetType = ref(0)
	const isFreightPromoMj = computed(() => Number(freightPromoSelectedSetType.value) === 3)
	const syncFreightPromoSelectedSetTypeFromConfig = () => {
		// 兜底：尝试从常见字段名读取
		const candidates = [
			configForm.value?.SetType,
			configForm.value?.SettingType,
			configForm.value?.RuleType
		]
		const t = candidates.find(v => v !== undefined && v !== null && v !== '')
		const num = Number(t)
		if (!isNaN(num) && (num === 1 || num === 2 || num === 3)) {
			freightPromoSelectedSetType.value = num
			return
		}
		
		// 优先级更低的兜底：根据阶梯列表是否存在来判断（兼容后端可能只返回部分默认值的情况）
		const ruleList = configForm.value?.ActivityRuleList
		if (Array.isArray(ruleList) && ruleList.length > 0) {
			freightPromoSelectedSetType.value = 3
		}
	}
	
	// 执行功能（先显示配置弹窗）
	const executeJdGroupFunc = async () => {
		const funcCode = props.currentItem?.code
		// 优先从映射表获取，如果没有则使用原code（京东秒送批量管理功能可能直接使用code）
		const backendCode = BACKEND_FUNC_CODE_MAP[funcCode] || funcCode
		if (!backendCode) {
			uni.showToast({
				title: '功能代码错误',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 获取 shopType（需要映射为后端值）
		const shopTypeNum = Number(props.shopType) || 0
		// 京东团购需要映射，京东秒送和其他平台直接使用shopType
		const apiShopType = shopTypeNum === 10 ? 1001 : shopTypeNum
		
		// 获取店铺ID
		const shopId = props.shopId
		if (!shopId) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		// 保存当前执行信息
		currentBackendCode.value = backendCode
		currentShopId.value = shopId
		currentApiShopType.value = apiShopType
		
		// 类目属性批量设置特殊处理
		if (backendCode === 'CTGYPRTYMG') {
			await loadCategoryAttrConfig(apiShopType, shopId)
			return
		}
		
		uni.showLoading({ title: '加载配置...', mask: true })
		
		try {
			const { ManagementApi } = await import('@/api/management.ts')
			
			// 获取配置Schema（优先走批量接口 GetFuncConfSchemas，失败再回退单个 GetFuncConfSchema）
			let schemaRes = null
			try {
				schemaRes = await ManagementApi.getFuncConfSchemas({
					ShopType: apiShopType,
					FuncCodes: [backendCode]
				})
			} catch (e) {
				// ignore, fallback below
			}
			
			// fallback：旧接口
			if (!schemaRes || (schemaRes.code !== 200 && !schemaRes.Success)) {
				schemaRes = await ManagementApi.getFuncConfSchema(apiShopType, backendCode)
			}
			
			if (!schemaRes || (schemaRes.code !== 200 && !schemaRes.Success)) {
				uni.showToast({
					title: schemaRes?.message || schemaRes?.Msg || '获取功能配置失败',
					icon: 'none',
					duration: 2000
				})
				return
			}
			
			// 解析 JSON Schema（兼容：GetFuncConfSchema 返回 string；GetFuncConfSchemas 返回数组 [{ FuncCode, ConfSchema }]）
			let schemaData = schemaRes.data
			// plural：数组
			if (Array.isArray(schemaData)) {
				const item = schemaData.find(i => i?.FuncCode === backendCode) || schemaData[0]
				schemaData = item?.ConfSchema ?? null
			}
			// single：字符串/对象
			if (typeof schemaData === 'string') {
				try {
					schemaData = JSON.parse(schemaData)
				} catch (e) {
					uni.showToast({
						title: '配置格式错误',
						icon: 'none',
						duration: 2000
					})
					return
				}
			}
			
			configSchema.value = schemaData || {}
			
			// 动态初始化表单数据（根据 Schema 的所有 properties）
			const formData = {}
			if (schemaData?.properties) {
				Object.keys(schemaData.properties).forEach(key => {
					const prop = schemaData.properties[key]
					// 优先使用 default（包括数组/对象）
					if (prop && prop.default !== undefined) {
						try {
							formData[key] = JSON.parse(JSON.stringify(prop.default))
						} catch (e) {
							formData[key] = prop.default
						}
						return
					}
					// oneOf 支持 null 的，默认给 null
					if (prop?.oneOf && Array.isArray(prop.oneOf) && prop.oneOf.some(o => o?.type === 'null')) {
						formData[key] = null
						return
					}
					if (prop?.type === 'array') {
						formData[key] = []
					} else if (prop?.type === 'number' || prop?.type === 'integer') {
						formData[key] = 0
					} else if (prop?.type === 'boolean') {
						formData[key] = false
					} else {
						formData[key] = ''
					}
				})
			}
			configForm.value = formData
			
			// 初始化其他状态
			selectedGroups.value = []
			keywordInput.value = ''
			
			// 获取店铺信息
			const shopInfo = uni.getStorageSync('shopInfo') || {}
			selectedShopInfo.value = [{
				id: shopInfo.id || props.shopId,
				name: shopInfo.name || '当前店铺',
				office_id: shopInfo.office_id || shopInfo.offid || ''
			}]
			
			// 如果需要分组选择，加载分组列表
			if (schemaData?.properties?.GroupOffIds?.items?.['x-fetchShopGroups']) {
				await loadGroupList()
			}
			
			// 显示配置弹窗
			// 创建减配送费活动：同步日期显示字段
			if (backendCode === 'CREATEFREIGHTPROMO') {
				const activityTime = configForm.value?.ActivityTime
				if (activityTime && typeof activityTime === 'object') {
					freightPromoBeginDate.value = normalizeDateOnly(activityTime.BeginDate)
					freightPromoEndDate.value = normalizeDateOnly(activityTime.EndDate)
				} else {
					freightPromoBeginDate.value = ''
					freightPromoEndDate.value = ''
				}
				// 确保至少一个时段
				if (Array.isArray(configForm.value?.CycleTimes) && configForm.value.CycleTimes.length === 0) {
					configForm.value.CycleTimes = [{ StartHourAndMin: '00:00', EndHourAndMin: '23:59' }]
				}
					
					// 根据当前配置推断活动方式（用于初次打开时正确渲染）
					syncFreightPromoSelectedSetTypeFromConfig()
			}
			// 店内领券活动：同步活动时间显示
			if (backendCode === 'CREATEINSHOPCOUPON') {
				const at = configForm.value?.ActivityTime
				if (at && typeof at === 'object') {
					inshopCouponBeginDate.value = normalizeDateOnly(at.BeginTime)
					inshopCouponEndDate.value = normalizeDateOnly(at.EndTime)
				} else {
					inshopCouponBeginDate.value = ''
					inshopCouponEndDate.value = ''
				}
				
				// 自取必须强制选中（不可取消）
				if (!Array.isArray(configForm.value?.PerformanceTypes)) {
					configForm.value.PerformanceTypes = ['自取']
				} else if (!configForm.value.PerformanceTypes.includes('自取')) {
					configForm.value.PerformanceTypes = [...configForm.value.PerformanceTypes, '自取']
				}
			}
			
			// 满减活动：同步活动时间显示 + 初始化默认值
			if (backendCode === 'CREATEMANJIAN') {
				const at = configForm.value?.ActivityTime
				if (at && typeof at === 'object') {
					manjianBeginDate.value = normalizeDateOnly(at.BeginTime)
					manjianEndDate.value = normalizeDateOnly(at.EndTime)
				} else {
					manjianBeginDate.value = ''
					manjianEndDate.value = ''
				}
				
				// 自提强制选中（不可取消）
				if (!Array.isArray(configForm.value?.DeliveryTypes)) {
					configForm.value.DeliveryTypes = ['自提']
				} else if (!configForm.value.DeliveryTypes.includes('自提')) {
					configForm.value.DeliveryTypes = [...configForm.value.DeliveryTypes, '自提']
				}
				
				// 确保至少一条阶梯
				if (!Array.isArray(configForm.value?.Ladders) || configForm.value.Ladders.length === 0) {
					configForm.value.Ladders = [{ LowerLimitAmount: 0, DiscountAmount: 0 }]
				}
			}
			
			// 品牌饭卡：初始化充值档位列表（至少一档）
			if (backendCode === 'CREATEBRANDMEALCARD') {
				if (!Array.isArray(configForm.value?.RechargeTiers) || configForm.value.RechargeTiers.length === 0) {
					configForm.value.RechargeTiers = [{
						RechargeAmountYuan: 0,
						GiftAmountYuan: 0,
						NeedStockLimit: false,
						StockLimitCount: 0
					}]
				}
			}
			
			// 设置营业状态及营业时间：初始化营业时间配置（若无则按默认值创建一组）
			if (backendCode === 'UPDATESTOREBUSINESSTIME') {
				if (!Array.isArray(configForm.value?.GroupServiceTimeDays) || configForm.value.GroupServiceTimeDays.length === 0) {
					configForm.value.GroupServiceTimeDays = [{
						WeekDays: [...storeBusinessWeekDays],
						ServiceTimePartList: [{ StartTime: '00:00', EndTime: '23:59' }]
					}]
				}
			}
			configPopupVisible.value = true
		} catch (error) {
			uni.showToast({
				title: error.message || '获取配置失败，请重试',
				icon: 'none',
				duration: 2000
			})
		} finally {
			uni.hideLoading()
		}
	}

	// 工具：把 date-time / 任意时间串转成 YYYY-MM-DD
	const normalizeDateOnly = (val) => {
		if (!val) return ''
		if (typeof val === 'string') {
			// 兼容 ISO / "YYYY-MM-DD ..." / "YYYY-MM-DD"
			return val.slice(0, 10)
		}
		try {
			const d = new Date(val)
			if (isNaN(d.getTime())) return ''
			const y = d.getFullYear()
			const m = String(d.getMonth() + 1).padStart(2, '0')
			const day = String(d.getDate()).padStart(2, '0')
			return `${y}-${m}-${day}`
		} catch (e) {
			return ''
		}
	}
	
	// 创建减配送费活动：写入 ActivityTime（后端 schema 需要 BeginDate/EndDate，使用 date-time 字符串）
	const syncFreightPromoActivityTime = () => {
		if (currentBackendCode.value !== 'CREATEFREIGHTPROMO') return
		const begin = freightPromoBeginDate.value
		const end = freightPromoEndDate.value
		if (!begin && !end) {
			configForm.value.ActivityTime = null
			return
		}
		configForm.value.ActivityTime = {
			BeginDate: begin ? `${begin}T00:00:00` : null,
			EndDate: end ? `${end}T23:59:59` : null
		}
	}
	
	const onFreightPromoBeginDateChange = (e) => {
		freightPromoBeginDate.value = e?.detail?.value || ''
		syncFreightPromoActivityTime()
	}
	const onFreightPromoEndDateChange = (e) => {
		freightPromoEndDate.value = e?.detail?.value || ''
		syncFreightPromoActivityTime()
	}
	
	// 店内领券活动：写入 ActivityTime（BeginTime/EndTime date-time）
	const syncInshopCouponActivityTime = () => {
		if (currentBackendCode.value !== 'CREATEINSHOPCOUPON') return
		const begin = inshopCouponBeginDate.value
		const end = inshopCouponEndDate.value
		if (!begin && !end) {
			configForm.value.ActivityTime = null
			return
		}
		configForm.value.ActivityTime = {
			BeginTime: begin ? `${begin}T00:00:00` : null,
			EndTime: end ? `${end}T23:59:59` : null
		}
	}
	const onInshopCouponBeginDateChange = (e) => {
		inshopCouponBeginDate.value = e?.detail?.value || ''
		syncInshopCouponActivityTime()
	}
	const onInshopCouponEndDateChange = (e) => {
		inshopCouponEndDate.value = e?.detail?.value || ''
		syncInshopCouponActivityTime()
	}
	
	// 店内领券活动：生效渠道多选（从 schema items.$ref 解析枚举选项）
	const getArrayItemEnumOptions = (prop) => {
		const items = prop?.items
		if (!items?.$ref) return []
		const refName = items.$ref.replace('#/definitions/', '')
		const def = configSchema.value?.definitions?.[refName]
		if (def?.enum) return def['x-enumNames'] || def.enum
		return []
	}
	const isInshopPerformanceSelected = (val) => {
		const list = configForm.value?.PerformanceTypes
		return Array.isArray(list) ? list.includes(val) : false
	}
	const toggleInshopPerformance = (val) => {
		if (currentBackendCode.value !== 'CREATEINSHOPCOUPON') return
		// 自取必须强制选中，不可取消
		if (val === '自取') {
			const list = Array.isArray(configForm.value.PerformanceTypes) ? [...configForm.value.PerformanceTypes] : []
			if (!list.includes('自取')) {
				list.push('自取')
				configForm.value.PerformanceTypes = list
			}
			return
		}
		const list = Array.isArray(configForm.value.PerformanceTypes) ? [...configForm.value.PerformanceTypes] : []
		const idx = list.indexOf(val)
		if (idx >= 0) list.splice(idx, 1)
		else list.push(val)
		configForm.value.PerformanceTypes = list
	}
	
	// 创建满减活动：写入 ActivityTime（BeginTime/EndTime date-time）
	const syncManjianActivityTime = () => {
		if (currentBackendCode.value !== 'CREATEMANJIAN') return
		const begin = manjianBeginDate.value
		const end = manjianEndDate.value
		if (!begin && !end) {
			configForm.value.ActivityTime = null
			return
		}
		configForm.value.ActivityTime = {
			BeginTime: begin ? `${begin}T00:00:00` : null,
			EndTime: end ? `${end}T23:59:59` : null
		}
	}
	const onManjianBeginDateChange = (e) => {
		manjianBeginDate.value = e?.detail?.value || ''
		syncManjianActivityTime()
	}
	const onManjianEndDateChange = (e) => {
		manjianEndDate.value = e?.detail?.value || ''
		syncManjianActivityTime()
	}
	
	// 创建满减活动：满减阶梯增删（Ladders：LowerLimitAmount/DiscountAmount）
	const addManjianLadderRule = () => {
		if (currentBackendCode.value !== 'CREATEMANJIAN') return
		const list = Array.isArray(configForm.value?.Ladders) ? [...configForm.value.Ladders] : []
		list.push({ LowerLimitAmount: 0, DiscountAmount: 0 })
		configForm.value.Ladders = list
	}
	const removeManjianLadderRule = (idx) => {
		if (currentBackendCode.value !== 'CREATEMANJIAN') return
		const list = Array.isArray(configForm.value?.Ladders) ? [...configForm.value.Ladders] : []
		if (list.length <= 1) return
		list.splice(idx, 1)
		configForm.value.Ladders = list
	}
	
	// 创建满减活动：生效渠道多选（配送/自提；自提强制不可取消）
	const isManjianDeliverySelected = (val) => {
		const list = configForm.value?.DeliveryTypes
		return Array.isArray(list) ? list.includes(val) : false
	}
	const toggleManjianDelivery = (val) => {
		if (currentBackendCode.value !== 'CREATEMANJIAN') return
		// 自提必须强制选中，不可取消
		if (val === '自提') {
			const list = Array.isArray(configForm.value?.DeliveryTypes) ? [...configForm.value.DeliveryTypes] : []
			if (!list.includes('自提')) list.push('自提')
			configForm.value.DeliveryTypes = list
			return
		}
		const list = Array.isArray(configForm.value?.DeliveryTypes) ? [...configForm.value.DeliveryTypes] : []
		const idx = list.indexOf(val)
		if (idx >= 0) list.splice(idx, 1)
		else list.push(val)
		configForm.value.DeliveryTypes = list
	}
	
	// 品牌饭卡：充值档位列表（RechargeTiers）增删改
	const addBrandMealCardTier = () => {
		if (currentBackendCode.value !== 'CREATEBRANDMEALCARD') return
		const list = Array.isArray(configForm.value?.RechargeTiers) ? [...configForm.value.RechargeTiers] : []
		if (list.length >= 5) return
		list.push({
			RechargeAmountYuan: 0,
			GiftAmountYuan: 0,
			NeedStockLimit: false,
			StockLimitCount: 0
		})
		configForm.value.RechargeTiers = list
	}
	const removeBrandMealCardTier = (idx) => {
		if (currentBackendCode.value !== 'CREATEBRANDMEALCARD') return
		const list = Array.isArray(configForm.value?.RechargeTiers) ? [...configForm.value.RechargeTiers] : []
		if (list.length <= 1) return
		list.splice(idx, 1)
		configForm.value.RechargeTiers = list
	}
	const onBrandTierNeedStockChange = (idx, e) => {
		if (currentBackendCode.value !== 'CREATEBRANDMEALCARD') return
		const checked = !!(e?.detail?.value)
		const list = Array.isArray(configForm.value?.RechargeTiers) ? [...configForm.value.RechargeTiers] : []
		if (!list[idx]) return
		list[idx] = {
			...list[idx],
			NeedStockLimit: checked,
			StockLimitCount: checked ? (Number(list[idx].StockLimitCount) || 0) : 0
		}
		configForm.value.RechargeTiers = list
	}

	// 设置营业状态及营业时间：营业时间配置（GroupServiceTimeDays）
	const storeBusinessWeekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
	const ensureStoreBizGroup = (gIdx) => {
		if (!Array.isArray(configForm.value.GroupServiceTimeDays)) {
			configForm.value.GroupServiceTimeDays = []
		}
		const groups = configForm.value.GroupServiceTimeDays
		while (groups.length <= gIdx) {
			groups.push({
				WeekDays: [],
				ServiceTimePartList: [{ StartTime: '00:00', EndTime: '23:59' }]
			})
		}
	}
	const isStoreBizWeekSelected = (gIdx, day) => {
		const groups = configForm.value?.GroupServiceTimeDays
		const g = Array.isArray(groups) ? groups[gIdx] : null
		const days = g?.WeekDays
		return Array.isArray(days) ? days.includes(day) : false
	}
	const toggleStoreBizWeek = (gIdx, day) => {
		if (currentBackendCode.value !== 'UPDATESTOREBUSINESSTIME') return
		ensureStoreBizGroup(gIdx)
		const groups = configForm.value.GroupServiceTimeDays
		const g = groups[gIdx]
		const days = Array.isArray(g.WeekDays) ? [...g.WeekDays] : []
		const idx = days.indexOf(day)
		if (idx >= 0) days.splice(idx, 1)
		else days.push(day)
		g.WeekDays = days
		configForm.value.GroupServiceTimeDays = [...groups]
	}
	const addStoreBizTimePart = (gIdx) => {
		if (currentBackendCode.value !== 'UPDATESTOREBUSINESSTIME') return
		ensureStoreBizGroup(gIdx)
		const groups = configForm.value.GroupServiceTimeDays
		const g = groups[gIdx]
		const list = Array.isArray(g.ServiceTimePartList) ? [...g.ServiceTimePartList] : []
		list.push({ StartTime: '00:00', EndTime: '23:59' })
		g.ServiceTimePartList = list
		configForm.value.GroupServiceTimeDays = [...groups]
	}
	const removeStoreBizTimePart = (gIdx, tIdx) => {
		if (currentBackendCode.value !== 'UPDATESTOREBUSINESSTIME') return
		const groups = configForm.value?.GroupServiceTimeDays
		if (!Array.isArray(groups) || !groups[gIdx]) return
		const g = groups[gIdx]
		const list = Array.isArray(g.ServiceTimePartList) ? [...g.ServiceTimePartList] : []
		if (list.length <= 1) return
		list.splice(tIdx, 1)
		g.ServiceTimePartList = list
		configForm.value.GroupServiceTimeDays = [...groups]
	}
	const addStoreBizGroup = () => {
		if (currentBackendCode.value !== 'UPDATESTOREBUSINESSTIME') return
		if (!Array.isArray(configForm.value.GroupServiceTimeDays)) {
			configForm.value.GroupServiceTimeDays = []
		}
		const groups = [...configForm.value.GroupServiceTimeDays]
		groups.push({
			WeekDays: [],
			ServiceTimePartList: [{ StartTime: '00:00', EndTime: '23:59' }]
		})
		configForm.value.GroupServiceTimeDays = groups
	}
	const removeStoreBizGroup = (gIdx) => {
		if (currentBackendCode.value !== 'UPDATESTOREBUSINESSTIME') return
		const groups = Array.isArray(configForm.value.GroupServiceTimeDays)
			? [...configForm.value.GroupServiceTimeDays]
			: []
		if (groups.length <= 1) return
		groups.splice(gIdx, 1)
		configForm.value.GroupServiceTimeDays = groups
	}
	
	// 创建减配送费活动：周期（周几）多选
	const isFreightPromoCycleDaySelected = (day) => {
		const list = configForm.value?.CycleDays
		return Array.isArray(list) ? list.includes(day) : false
	}
	const toggleFreightPromoCycleDay = (day) => {
		if (currentBackendCode.value !== 'CREATEFREIGHTPROMO') return
		const list = Array.isArray(configForm.value.CycleDays) ? [...configForm.value.CycleDays] : []
		const idx = list.indexOf(day)
		if (idx >= 0) {
			list.splice(idx, 1)
		} else {
			list.push(day)
		}
		configForm.value.CycleDays = list
	}
	
	// 创建减配送费活动：生效时段增删
	const addFreightPromoCycleTime = () => {
		if (currentBackendCode.value !== 'CREATEFREIGHTPROMO') return
		const list = Array.isArray(configForm.value.CycleTimes) ? [...configForm.value.CycleTimes] : []
		list.push({ StartHourAndMin: '00:00', EndHourAndMin: '23:59' })
		configForm.value.CycleTimes = list
	}
	const removeFreightPromoCycleTime = (idx) => {
		if (currentBackendCode.value !== 'CREATEFREIGHTPROMO') return
		const list = Array.isArray(configForm.value.CycleTimes) ? [...configForm.value.CycleTimes] : []
		if (list.length <= 1) return
		list.splice(idx, 1)
		configForm.value.CycleTimes = list
	}
	
	// 创建减配送费活动：满减阶梯增删
	const addFreightPromoLadderRule = () => {
		if (currentBackendCode.value !== 'CREATEFREIGHTPROMO') return
		const list = Array.isArray(configForm.value.ActivityRuleList) ? [...configForm.value.ActivityRuleList] : []
		list.push({ RuleThresholdYuan: 0, RuleFreeYuan: 0 })
		configForm.value.ActivityRuleList = list
	}
	const removeFreightPromoLadderRule = (idx) => {
		if (currentBackendCode.value !== 'CREATEFREIGHTPROMO') return
		const list = Array.isArray(configForm.value.ActivityRuleList) ? [...configForm.value.ActivityRuleList] : []
		list.splice(idx, 1)
		configForm.value.ActivityRuleList = list
	}
	
	// 工具函数：获取分组ID（统一处理 id 和 OfficeId）
	const getGroupId = (group) => {
		return group?.id || group?.OfficeId
	}
	
	// 工具函数：将ID转换为字符串
	const normalizeId = (id) => {
		return id ? String(id) : ''
	}
	
	// 工具函数：检查ID是否匹配
	const isIdMatch = (id1, id2) => {
		if (!id1 || !id2) return false
		return String(id1) === String(id2)
	}
	
	// 加载类目属性配置（类目属性批量设置专用）
	const loadCategoryAttrConfig = async (shopType, shopId) => {
		uni.showLoading({ title: '加载配置...', mask: true })
		
		try {
			const { ManagementApi } = await import('@/api/management.ts')
			
			// 并行加载属性列表和分组列表
			const [propertiesRes, groupsRes] = await Promise.all([
				ManagementApi.callFunction({
					ShopType: shopType,
					FunctionCode: 'CTGYPRTYMG',
					ShopId: shopId,
					Method: 'GetPropertyAndValues',
					ParmsObj: '{}'
				}),
				ManagementApi.callFunction({
					ShopType: shopType,
					FunctionCode: 'CTGYPRTYMG',
					ShopId: shopId,
					Method: 'GetFoodGroups',
					ParmsObj: '{}'
				})
			])
			
			// 解析属性列表
			if (propertiesRes && (propertiesRes.code === 200 || propertiesRes.Success) && propertiesRes.data) {
				let propertiesData = propertiesRes.data
				if (typeof propertiesData === 'string') {
					propertiesData = JSON.parse(propertiesData)
				}
				categoryProperties.value = propertiesData || []
			}
			
			// 解析分组列表
			if (groupsRes && (groupsRes.code === 200 || groupsRes.Success) && groupsRes.data) {
				let groupsData = groupsRes.data
				if (typeof groupsData === 'string') {
					groupsData = JSON.parse(groupsData)
				}
				categoryGroups.value = (groupsData || []).map(group => ({
					id: group.OfficeId,
					name: group.Name || '',
					FoodCount: group.FoodCount || 0,
					...group
				}))
			}
			
			// 初始化表单
			categoryAttrForm.value = {}
			requiredAttrs.value = []
			customAttrs.value = []
			customAttrName.value = ''
			customAttrValue.value = ''
			customAttrValues.value = []
			categorySelectedGroupIds.value = []
			
			// 获取店铺信息
			const shopInfo = uni.getStorageSync('shopInfo') || {}
			selectedShopInfo.value = [{
				id: shopInfo.id || shopId,
				name: shopInfo.name || '当前店铺',
				office_id: shopInfo.office_id || shopInfo.offid || ''
			}]
			
			// 显示配置弹窗
			categoryAttrPopupVisible.value = true
		} catch (error) {
			uni.showToast({
				title: error.message || '加载配置失败，请重试',
				icon: 'none',
				duration: 2000
			})
		} finally {
			uni.hideLoading()
		}
	}
	
	// 加载分组列表（使用店铺分组接口）
	const loadGroupList = async () => {
		try {
			if (!currentShopId.value) {
				return
			}
			
			const { ManagementApi } = await import('@/api/management.ts')
			const res = await ManagementApi.getShopGroups(currentShopId.value)
			
			if (res && (res.code === 200 || res.Success) && res.data) {
				groupList.value = (res.data || [])
					.filter(group => group.OfficeId)
					.map(group => ({
						id: String(group.OfficeId),
						name: group.Name || '',
						FoodCount: group.FoodCount || 0,
						OfficeId: group.OfficeId,
						Name: group.Name,
						...group
					}))
			} else {
				uni.showToast({
					title: '获取分组列表失败',
					icon: 'none',
					duration: 2000
				})
			}
		} catch (error) {
			uni.showToast({
				title: '加载分组列表失败: ' + (error.message || '未知错误'),
				icon: 'none',
				duration: 2000
			})
		}
	}
	
	// 处理添加分组点击事件
	const handleAddGroupClick = async () => {
		// 如果分组列表为空，先加载分组列表
		if (groupList.value.length === 0) {
			uni.showLoading({ title: '加载分组...', mask: true })
			await loadGroupList()
			uni.hideLoading()
		}
		
		// 同步临时选择的分组ID（用于显示已选状态）
		tempSelectedGroupIds.value = configForm.value.GroupOffIds || []
		
		// 显示分组选择弹窗
		showGroupSelector.value = true
	}
	
	// 添加关键词
	const addKeyword = () => {
		const keyword = keywordInput.value.trim()
		if (keyword && !configForm.value.FoodNameKeywords.includes(keyword)) {
			configForm.value.FoodNameKeywords.push(keyword)
			keywordInput.value = ''
		}
	}
	
	// 删除关键词
	const removeKeyword = (index) => {
		configForm.value.FoodNameKeywords.splice(index, 1)
	}
	
	// 切换分组选择
	const toggleGroup = (group) => {
		const groupId = getGroupId(group)
		if (!groupId) return
		
		const groupIdStr = normalizeId(groupId)
		const newIds = [...tempSelectedGroupIds.value]
		const index = newIds.findIndex(id => id && isIdMatch(id, groupIdStr))
		
		if (index > -1) {
			newIds.splice(index, 1)
		} else {
			newIds.push(groupIdStr)
		}
		
		tempSelectedGroupIds.value = newIds
	}
	
	// 判断分组是否已选择
	const isGroupSelected = (groupId) => {
		if (!groupId) return false
		const groupIdStr = normalizeId(groupId)
		return tempSelectedGroupIds.value.some(id => id && isIdMatch(id, groupIdStr))
	}
	
	// 确认分组选择
	const confirmGroupSelection = () => {
		selectedGroups.value = groupList.value
			.filter(group => {
				const groupId = getGroupId(group)
				if (!groupId) return false
				return tempSelectedGroupIds.value.some(id => isIdMatch(id, groupId))
			})
			.map(group => {
				const groupId = getGroupId(group)
				return { 
					id: normalizeId(groupId), 
					name: group.name || group.Name || '',
					FoodCount: group.FoodCount || 0
				}
			})
		
		configForm.value.GroupOffIds = tempSelectedGroupIds.value
			.filter(id => id && id !== 'null')
			.map(id => normalizeId(id))
		
		showGroupSelector.value = false
	}
	
	// 删除分组
	const removeGroup = (index) => {
		selectedGroups.value.splice(index, 1)
		configForm.value.GroupOffIds = selectedGroups.value
			.map(g => getGroupId(g))
			.filter(id => id && id !== 'null')
			.map(id => normalizeId(id))
		tempSelectedGroupIds.value = [...configForm.value.GroupOffIds]
	}
	
	// 获取分组描述（过滤掉技术提示，保留用户友好的描述）
	const getGroupDescription = (description) => {
		if (!description) {
			return '选择分组，留空表示全部'
		}
		// 过滤技术提示关键词
		const techKeywords = ['前端根据', 'x-fetchShopGroup', '自动调用接口获取可选分组']
		if (techKeywords.some(keyword => description.includes(keyword))) {
			return '选择分组，留空表示全部'
		}
		// 如果描述已包含用户友好的提示，直接返回
		if (description.includes('选择分组') || description.includes('留空表示全部')) {
			return description
		}
		return description
	}
	
	// 获取枚举选项
	const getEnumOptions = (prop) => {
		// 处理 $ref 引用
		if (prop.$ref) {
			const refName = prop.$ref.replace('#/definitions/', '')
			const def = configSchema.value?.definitions?.[refName]
			if (def && def.enum) {
				// 如果有 x-enumNames，使用它作为显示文本
				return def['x-enumNames'] || def.enum
			}
		}
		// 处理 oneOf
		if (prop.oneOf && prop.oneOf.length > 0) {
			const firstOneOf = prop.oneOf[0]
			if (firstOneOf.$ref) {
				return getEnumOptions(firstOneOf)
			}
		}
		// 直接枚举
		if (prop.enum) {
			return prop['x-enumNames'] || prop.enum
		}
		return []
	}
	
	// 获取枚举值的索引
	const getEnumValueIndex = (prop, value) => {
		const options = getEnumOptions(prop)
		const index = options.indexOf(value)
		return index >= 0 ? index : 0
	}
	
	// 枚举值改变
	const onEnumChange = (key, prop, e) => {
		const index = Number(e.detail.value)
		const options = getEnumOptions(prop)
		const displayValue = options[index]
		
		// 处理 $ref 引用，获取实际枚举值
		if (prop.$ref) {
			const refName = prop.$ref.replace('#/definitions/', '')
			const def = configSchema.value?.definitions?.[refName]
			if (def?.enum) {
				const enumNames = def['x-enumNames']
				// 优先使用枚举的实际值（数字），如果没有则使用显示值
				configForm.value[key] = (enumNames && enumNames[index] === displayValue) 
					? def.enum[index] 
					: (def.enum[index] !== undefined ? def.enum[index] : displayValue)
			} else {
				configForm.value[key] = displayValue
			}
		} else if (prop.enum) {
			// 如果有枚举值数组，使用枚举值而不是显示文本
			configForm.value[key] = prop.enum[index] !== undefined ? prop.enum[index] : displayValue
		} else {
			configForm.value[key] = displayValue
		}
		
		// 记录：减配送费活动的“活动方式”选择结果，用于动态切换展示
		if (currentBackendCode.value === 'CREATEFREIGHTPROMO') {
			const num = Number(displayValue)
			if (!isNaN(num) && (num === 1 || num === 2 || num === 3)) {
				freightPromoSelectedSetType.value = num
			} else {
				const dvStr = String(displayValue ?? '')
				if (dvStr.includes('满减')) {
					freightPromoSelectedSetType.value = 3
				} else if (dvStr.includes('统一')) {
					freightPromoSelectedSetType.value = 1
				} else if (dvStr.includes('距离')) {
					freightPromoSelectedSetType.value = 2
				}
			}
			
			// 为了“切回统一立减后不再保留满减阶梯”，这里同步清理阶梯数据
			//（否则重新打开配置弹窗时会因为阶梯列表仍非空而回到满减状态）
			if (freightPromoSelectedSetType.value === 1) {
				if (Array.isArray(configForm.value?.ActivityRuleList)) {
					configForm.value.ActivityRuleList = []
				}
			}
			// 只有切到满减阶梯时，才保证阶梯列表至少有一行可编辑
			if (freightPromoSelectedSetType.value === 3) {
				if (!Array.isArray(configForm.value?.ActivityRuleList) || configForm.value.ActivityRuleList.length === 0) {
					configForm.value.ActivityRuleList = [{ RuleThresholdYuan: 0, RuleFreeYuan: 0 }]
				}
			}
			
			// 强制触发响应式更新，确保模板条件能立刻切换
			triggerReactiveUpdate()
		}
		
		// 如果是更改方式（ChangeType 或 Mode），清空相关字段并强制更新
		if (key === 'ChangeType' || key === 'Mode') {
			configForm.value.Prefix = ''
			configForm.value.Suffix = ''
			configForm.value.OriginalText = ''
			configForm.value.ReplacementText = ''
			// 强制触发响应式更新，确保条件判断函数能获取到最新值
			triggerReactiveUpdate()
		}
	}
	
	// 判断是否应该显示前缀字段（更改方式为添加前缀）
	const shouldShowPrefixField = () => {
		const changeType = configForm.value.ChangeType || configForm.value.Mode
		if (!changeType) return false
		// 检查是否为添加前缀模式（可能是数字1或字符串"添加前缀"等）
		return changeType === 1 || changeType === '1' || 
		       changeType === 'AddPrefix' || 
		       changeType === '添加前缀' ||
		       changeType?.toString().toLowerCase().includes('prefix')
	}
	
	// 判断是否应该显示后缀字段（更改方式为添加后缀）
	const shouldShowSuffixField = () => {
		const changeType = configForm.value.ChangeType || configForm.value.Mode
		if (!changeType) return false
		// 检查是否为添加后缀模式（可能是数字2或字符串"添加后缀"等）
		return changeType === 2 || changeType === '2' || 
		       changeType === 'AddSuffix' || 
		       changeType === '添加后缀' ||
		       changeType?.toString().toLowerCase().includes('suffix')
	}
	
	// 判断是否应该显示原文字字段（更改方式为替换文字）
	const shouldShowOriginalTextField = () => {
		const changeType = configForm.value.ChangeType || configForm.value.Mode
		if (!changeType) return false
		const changeTypeStr = String(changeType).toLowerCase()
		// 检查是否为替换文字模式（可能是数字3或字符串"替换文字"等）
		return changeType === 3 || changeType === '3' || 
		       changeType === 'ReplaceText' || 
		       changeType === '替换文字' ||
		       changeType === '替换文本' ||
		       changeTypeStr.includes('replace') ||
		       changeTypeStr.includes('替换')
	}
	
	// 判断是否应该显示替换文字字段（更改方式为替换文字或完全重命名）
	const shouldShowReplacementTextField = () => {
		const changeType = configForm.value.ChangeType || configForm.value.Mode
		if (!changeType) return false
		const changeTypeStr = String(changeType).toLowerCase()
		// 检查是否为替换文字或完全重命名模式
		return changeType === 3 || changeType === '3' || 
		       changeType === 4 || changeType === '4' ||
		       changeType === 'ReplaceText' || 
		       changeType === 'Rename' ||
		       changeType === '替换文字' ||
		       changeType === '替换文本' ||
		       changeType === '完全重命名' ||
		       changeType === '重命名' ||
		       changeTypeStr.includes('replace') ||
		       changeTypeStr.includes('rename') ||
		       changeTypeStr.includes('替换') ||
		       changeTypeStr.includes('重命名')
	}
	
	// 工具函数：获取数字值（处理空值）
	const getNumericValue = (value, defaultValue = 0) => {
		if (value === undefined || value === null || value === '') {
			return defaultValue
		}
		const numValue = Number(value)
		return isNaN(numValue) ? defaultValue : numValue
	}
	
	// 工具函数：强制触发响应式更新
	const triggerReactiveUpdate = () => {
		configForm.value = { ...configForm.value }
	}

	// 提示词是否需要放到标题右侧一行显示
	const shouldInlineDesc = (key, prop) => {
		if (!key) return false
		const k = String(key)
		const title = String(prop?.title || '')
		
		// 单独处理：自动追补提示词较长，强制放到标题下方显示
		if (k === 'AutoDifferentiatedSubsidy' || title.includes('追补')) {
			return false
		}
		
		// 设置营业时间里的这三个字段提示词不跟随标题右侧，避免一行显示不全
		if (
			currentBackendCode.value === 'UPDATESTOREBUSINESSTIME' &&
			['CloseStatus', 'SetBusinessTime', 'GroupServiceTimeDays'].includes(k)
		) {
			return false
		}
		
		// 店内领券：提示词跟随标题右侧显示
		if (currentBackendCode.value === 'CREATEINSHOPCOUPON') {
			return true
		}
		// 你要求的：活动名称/活动时间/自动延期/日期类型/减配送费类型（活动方式）
		// 以及“参数配置”里常见的相关字段名兼容
		if ([
			'ActivityName',
			'ActivityTitle',
			'Name',
			'ActivityTime',
			'AutoDelay',
			'DateType',
			'SetType',
			'SettingType',
			'RuleType'
		].includes(k)) return true
		
		// 兜底：按标题文案匹配（兼容后端字段 key 不固定）
		return (
			title.includes('活动名称') ||
			title.includes('日期类型') ||
			title.includes('减配送费类型') ||
			title.includes('活动时间') ||
			title.includes('自动延期') ||
			title.includes('公告信息') ||
			title.includes('备注信息') ||
			title.includes('追补') ||
			title.includes('自动追补') ||
			title.includes('生效周期')
		)
	}
	
	// 处理数字输入
	const handleNumberInput = (key, e, prop) => {
		const inputValue = e.detail.value
		const defaultValue = prop?.default ?? 0
		
		if (!inputValue) {
			configForm.value[key] = defaultValue
		} else {
			const numValue = parseFloat(inputValue)
			configForm.value[key] = isNaN(numValue) ? defaultValue : numValue
		}
		triggerReactiveUpdate()
	}
	
	// 数字增加
	const increaseNumber = (key) => {
		const currentValue = getNumericValue(configForm.value[key])
		configForm.value[key] = currentValue + 1
		triggerReactiveUpdate()
	}
	
	// 数字减少
	const decreaseNumber = (key) => {
		const currentValue = getNumericValue(configForm.value[key])
		configForm.value[key] = Math.max(0, currentValue - 1)
		triggerReactiveUpdate()
	}
	
	// 删除店铺
	const removeShop = (index) => {
		selectedShopInfo.value.splice(index, 1)
	}
	
	// 获取功能名称（用于确认对话框）
	const getFunctionName = () => {
		const code = props.currentItem?.code
		const nameMap = {
			'CATEGORY_ATTR': '类目属性批量设置',
			'BATCH_PRICE': '批量改价',
			'BATCH_STOCK': '批量改库存',
			'BATCH_NAME': '批量改商品名',
			'BATCH_STATUS': '批量改上下架'
		}
		return nameMap[code] || props.currentItem?.name || '该功能'
	}
	
	// 提交类目属性批量设置
	const confirmCategoryAttrExecute = async () => {
		// 二次确认
		const functionName = getFunctionName()
		const confirmResult = await new Promise((resolve) => {
			uni.showModal({
				title: '确认执行',
				content: `确定要执行"${functionName}"功能吗？`,
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => {
					resolve(res.confirm)
				},
				fail: () => {
					resolve(false)
				}
			})
		})
		
		if (!confirmResult) {
			return
		}
		
		uni.showLoading({ title: '执行中...', mask: true })
		
		try {
			const { ManagementApi } = await import('@/api/management.ts')
			
			// 构建属性值对象 {属性ID: [值ID数组]}
			const prttyValues = {}
			Object.keys(categoryAttrForm.value).forEach(attrId => {
				const valueIds = categoryAttrForm.value[attrId]
				if (valueIds && valueIds.length > 0) {
					prttyValues[attrId] = valueIds
				}
			})
			
			// 构建请求参数（与PC端保持一致）
			const defaultConfValues = {}
			if (Object.keys(prttyValues).length > 0) {
				defaultConfValues.PrttyValues = prttyValues
			}
			if (requiredAttrs.value.length > 0) {
				defaultConfValues.RequiredAttrValues = requiredAttrs.value
			}
			// 添加分组选择
			if (categorySelectedGroupIds.value.length > 0) {
				defaultConfValues.GroupOffIds = categorySelectedGroupIds.value.map(id => String(id))
			}
			
			const requestParams = {
				func_code: 'CTGYPRTYMG',
				shop_ids: [currentShopId.value],
				default_conf_values: Object.keys(defaultConfValues).length > 0 ? defaultConfValues : null,
				shop_conf_values: []
			}
			
			// 触发功能执行任务
			const triggerRes = await ManagementApi.triggerFuncRun(requestParams)
			
			if (triggerRes && (triggerRes.code === 200 || triggerRes.Success)) {
				uni.showToast({
					title: '执行成功',
					icon: 'success',
					duration: 2000
				})
				categoryAttrPopupVisible.value = false
			} else {
				const errorMsg = triggerRes?.message || triggerRes?.Msg || triggerRes?.data?.message || '执行失败'
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 3000
				})
			}
		} catch (error) {
			const errorMsg = error.response?.data?.message || error.response?.data?.Msg || error.message || '执行失败，请重试'
			uni.showToast({
				title: errorMsg,
				icon: 'none',
				duration: 3000
			})
		} finally {
			uni.hideLoading()
		}
	}
	
	// 处理属性值选择（支持多选）
	const handleAttrValueChange = (attrId, valueId, checked) => {
		if (!categoryAttrForm.value[attrId]) {
			categoryAttrForm.value[attrId] = []
		}
		const valueIds = categoryAttrForm.value[attrId]
		if (checked) {
			if (!valueIds.includes(valueId)) {
				valueIds.push(valueId)
			}
		} else {
			const index = valueIds.indexOf(valueId)
			if (index > -1) {
				valueIds.splice(index, 1)
			}
		}
	}
	
	// 检查属性值是否已选择
	const isAttrValueSelected = (attrId, valueId) => {
		return categoryAttrForm.value[attrId]?.includes(valueId) || false
	}
	
	// 切换必填属性
	const toggleRequiredAttr = (attrId) => {
		const index = requiredAttrs.value.indexOf(attrId)
		if (index > -1) {
			requiredAttrs.value.splice(index, 1)
		} else {
			requiredAttrs.value.push(attrId)
		}
	}
	
	// 检查是否为必填属性
	const isRequiredAttr = (attrId) => {
		return requiredAttrs.value.includes(attrId)
	}
	
	// 添加自定义属性值
	const addCustomAttrValue = () => {
		const value = customAttrValue.value.trim()
		if (value && !customAttrValues.value.includes(value)) {
			customAttrValues.value.push(value)
			customAttrValue.value = ''
		}
	}
	
	// 删除自定义属性值
	const removeCustomAttrValue = (index) => {
		customAttrValues.value.splice(index, 1)
	}
	
	// 添加自定义属性
	const addCustomAttr = () => {
		const name = customAttrName.value.trim()
		if (name && customAttrValues.value.length > 0) {
			customAttrs.value.push({
				name: name,
				values: [...customAttrValues.value]
			})
			customAttrName.value = ''
			customAttrValue.value = ''
			customAttrValues.value = []
		}
	}
	
	// 删除自定义属性
	const removeCustomAttr = (index) => {
		customAttrs.value.splice(index, 1)
	}
	
	// 获取属性值的索引（用于picker）
	const getAttrValueIndex = (attrId, values) => {
		if (!attrId || !values || !categoryAttrForm.value[attrId]) return 0
		const selectedValueId = categoryAttrForm.value[attrId][0]
		const index = values.findIndex(v => v.Office_Id === selectedValueId)
		return index >= 0 ? index : 0
	}
	
	// 获取已选择的属性值名称（用于picker显示）
	const getAttrSelectedValue = (attrId, values) => {
		if (!attrId || !values || !categoryAttrForm.value[attrId] || categoryAttrForm.value[attrId].length === 0) {
			return ''
		}
		const selectedValueId = categoryAttrForm.value[attrId][0]
		const value = values.find(v => v.Office_Id === selectedValueId)
		return value ? value.Name : ''
	}
	
	// 处理单选属性值改变
	const handleSingleAttrChange = (attrId, valueId) => {
		if (!categoryAttrForm.value[attrId]) {
			categoryAttrForm.value[attrId] = []
		}
		categoryAttrForm.value[attrId] = valueId ? [valueId] : []
	}
	
	// 显示多选下拉框
	const showMultiPicker = (attrId, values, attrName) => {
		currentMultiPickerAttrId.value = attrId
		currentMultiPickerAttrName.value = attrName
		
		// 如果有缓存的值列表（包含之前的搜索结果），使用缓存的；否则使用传入的原始值
		if (multiPickerValuesCache.value[attrId] && multiPickerValuesCache.value[attrId].length > 0) {
			currentMultiPickerValues.value = [...multiPickerValuesCache.value[attrId]]
		} else {
			currentMultiPickerValues.value = values || []
			// 初始化缓存
			multiPickerValuesCache.value[attrId] = [...(values || [])]
		}
		
		tempMultiSelectedIds.value = [...(categoryAttrForm.value[attrId] || [])]
		multiPickerSearchText.value = ''
		filteredMultiPickerValues.value = [...currentMultiPickerValues.value]
		
		// 找到对应的属性对象
		const property = categoryProperties.value.find(p => p.Prty?.off_id === attrId)
		currentMultiPickerProperty.value = property || null
		
		showMultiPickerPopup.value = true
	}
	
	// 处理多选下拉框搜索
	const handleMultiPickerSearch = async () => {
		const searchText = multiPickerSearchText.value.trim()
		
		// 如果没有搜索关键词，显示原始列表
		if (!searchText) {
			filteredMultiPickerValues.value = [...currentMultiPickerValues.value]
			return
		}
		
		// 如果属性ID不存在，使用本地过滤
		if (!currentMultiPickerProperty.value || !currentMultiPickerProperty.value.Prty?.off_id) {
			filteredMultiPickerValues.value = currentMultiPickerValues.value.filter(value => 
				value.Name && value.Name.toLowerCase().includes(searchText.toLowerCase())
			)
			return
		}
		
		// 调用搜索接口
		const shopId = props.shopId || currentShopId.value
		if (!shopId) {
			uni.showToast({
				title: '店铺ID不存在',
				icon: 'none',
				duration: 2000
			})
			return
		}
		
		isSearching.value = true
		
		try {
			const { ManagementApi } = await import('@/api/management.ts')
			
			// 构建请求参数
			const parmsObj = JSON.stringify({
				AttrId: currentMultiPickerProperty.value.Prty.off_id,
				Keyword: searchText
			})
			
			const searchRes = await ManagementApi.callFunction({
				ShopType: 6, // 京东秒送
				FunctionCode: 'CTGYPRTYMG',
				ShopId: shopId,
				Method: 'SearchAttrValues',
				ParmsObj: parmsObj
			})
			
			if (searchRes && (searchRes.code === 200 || searchRes.Success) && searchRes.data) {
				// 解析响应数据（可能是JSON字符串）
				let searchData = searchRes.data
				if (typeof searchData === 'string') {
					searchData = JSON.parse(searchData)
				}
				
				// 转换为与原始数据格式一致的结构
				// 响应格式: [{Key, ValueName, ViewStatus, Sort, OutCategoryAttrValueId}]
				// 需要转换为: [{Office_Id, Name, ...}]
				const searchResults = (searchData || []).map(item => ({
					Office_Id: item.Key,
					Name: item.ValueName,
					ViewStatus: item.ViewStatus,
					Sort: item.Sort,
					OutCategoryAttrValueId: item.OutCategoryAttrValueId
				}))
				
				// 将搜索结果合并到原始列表中（避免重复）
				const existingIds = new Set(currentMultiPickerValues.value.map(v => v.Office_Id))
				const newResults = searchResults.filter(item => !existingIds.has(item.Office_Id))
				currentMultiPickerValues.value = [...currentMultiPickerValues.value, ...newResults]
				
				// 更新缓存，保存完整的值列表（包括搜索结果）
				if (currentMultiPickerAttrId.value) {
					multiPickerValuesCache.value[currentMultiPickerAttrId.value] = [...currentMultiPickerValues.value]
				}
				
				filteredMultiPickerValues.value = searchResults
			} else {
				// 搜索失败，使用本地过滤
				filteredMultiPickerValues.value = currentMultiPickerValues.value.filter(value => 
					value.Name && value.Name.toLowerCase().includes(searchText.toLowerCase())
				)
			}
		} catch (error) {
			console.error('搜索属性值失败:', error)
			// 搜索失败，使用本地过滤
			filteredMultiPickerValues.value = currentMultiPickerValues.value.filter(value => 
				value.Name && value.Name.toLowerCase().includes(searchText.toLowerCase())
			)
		} finally {
			isSearching.value = false
		}
	}
	
	// 切换多选下拉框中的选项
	const toggleMultiPickerValue = (valueId) => {
		const index = tempMultiSelectedIds.value.indexOf(valueId)
		if (index > -1) {
			tempMultiSelectedIds.value.splice(index, 1)
		} else {
			tempMultiSelectedIds.value.push(valueId)
		}
	}
	
	// 检查多选下拉框中的选项是否已选择
	const isMultiPickerValueSelected = (valueId) => {
		return tempMultiSelectedIds.value.includes(valueId)
	}
	
	// 确认多选下拉框选择
	const confirmMultiPicker = () => {
		if (currentMultiPickerAttrId.value) {
			categoryAttrForm.value[currentMultiPickerAttrId.value] = [...tempMultiSelectedIds.value]
		}
		showMultiPickerPopup.value = false
	}
	
	// 取消多选下拉框选择
	const clearMultiPickerSelection = () => {
		tempMultiSelectedIds.value = []
		if (currentMultiPickerAttrId.value) {
			categoryAttrForm.value[currentMultiPickerAttrId.value] = []
		}
	}
	
	// 分组选择相关函数
	const toggleGroupSelection = (groupId) => {
		const index = selectedGroupIds.value.indexOf(groupId)
		if (index > -1) {
			selectedGroupIds.value.splice(index, 1)
		} else {
			selectedGroupIds.value.push(groupId)
		}
	}
	
	// 类目属性批量设置分组选择相关函数
	const toggleCategoryGroupSelection = (groupId) => {
		if (!groupId && groupId !== 0) {
			return
		}
		
		// 确保groupId是字符串类型，便于比较
		const groupIdStr = String(groupId)
		
		// 查找是否已选择
		const index = categorySelectedGroupIds.value.findIndex(id => String(id) === groupIdStr)
		
		if (index > -1) {
			// 已选择，则取消选择
			categorySelectedGroupIds.value.splice(index, 1)
		} else {
			// 未选择，则添加选择
			categorySelectedGroupIds.value.push(groupIdStr)
		}
		
		// 强制触发响应式更新
		categorySelectedGroupIds.value = [...categorySelectedGroupIds.value]
	}
	
	const isCategoryGroupSelected = (groupId) => {
		if (!groupId) return false
		const groupIdStr = String(groupId)
		return categorySelectedGroupIds.value.some(id => String(id) === groupIdStr)
	}
	
	const getCategoryGroupName = (groupId) => {
		if (!groupId) return ''
		const groupIdStr = String(groupId)
		// 尝试通过 id 或 OfficeId 查找分组
		const group = categoryGroups.value.find(g => {
			const gId = String(g.id || g.OfficeId || '')
			return gId === groupIdStr
		})
		return group ? (group.name || group.Name || '') : ''
	}
	
	const removeCategoryGroup = (groupId) => {
		if (!groupId) return
		const groupIdStr = String(groupId)
		const index = categorySelectedGroupIds.value.findIndex(id => String(id) === groupIdStr)
		if (index > -1) {
			categorySelectedGroupIds.value.splice(index, 1)
		}
	}
	
	const clearCategoryGroupSelection = () => {
		categorySelectedGroupIds.value = []
	}
	
	const confirmCategoryGroupSelection = () => {
		categoryShowGroupSelector.value = false
	}
	
	// 获取多选属性的显示文本
	const getMultiSelectedDisplay = (attrId, values) => {
		if (!attrId || !categoryAttrForm.value[attrId] || categoryAttrForm.value[attrId].length === 0) {
			return ''
		}
		const selectedIds = categoryAttrForm.value[attrId]
		
		// 先从传入的values中查找，如果找不到，从currentMultiPickerValues中查找（搜索结果的场景）
		let selectedNames = []
		if (values && values.length > 0) {
			selectedNames = values
				.filter(v => selectedIds.includes(v.Office_Id))
				.map(v => v.Name)
		}
		
		// 如果从values中找不到，尝试从currentMultiPickerValues中查找（搜索结果的场景）
		if (selectedNames.length === 0 && currentMultiPickerValues.value.length > 0) {
			selectedNames = currentMultiPickerValues.value
				.filter(v => selectedIds.includes(v.Office_Id))
				.map(v => v.Name)
		}
		
		return selectedNames.length > 0 ? selectedNames.join('、') : ''
	}
	
	// 确认执行
	const confirmExecute = async () => {
		// 二次确认
		const functionName = getFunctionName()
		const confirmResult = await new Promise((resolve) => {
			uni.showModal({
				title: '确认执行',
				content: `确定要执行"${functionName}"功能吗？`,
				confirmText: '确定',
				cancelText: '取消',
				success: (res) => {
					resolve(res.confirm)
				},
				fail: () => {
					resolve(false)
				}
			})
		})
		
		if (!confirmResult) {
			return
		}
		
		uni.showLoading({ title: '执行中...', mask: true })
		
		try {
			const { ManagementApi } = await import('@/api/management.ts')
			
			// 构建默认配置值（所有店铺共用的配置）
			// 根据电脑端的逻辑，配置值应该放在 default_conf_values 中
			const defaultConfValues = {}
			if (configSchema.value?.properties) {
				Object.keys(configSchema.value.properties).forEach(key => {
					const value = configForm.value[key]
					// 对于数组类型（如 GroupOffIds, FoodNameKeywords）
					if (Array.isArray(value)) {
						// 空数组不包含在默认配置中（表示全部/默认）
						// 非空数组才包含（表示选择了特定分组或关键词）
						if (value.length > 0) {
							defaultConfValues[key] = value
						}
					} else if (value !== undefined && value !== null && value !== '') {
						// 非数组类型，有值才包含
						const prop = configSchema.value.properties[key]
						// 对于数字类型，确保正确转换（支持小数）
						if (prop?.type === 'number' || prop?.type === 'integer') {
							const numValue = typeof value === 'number' ? value : parseFloat(value)
							if (!isNaN(numValue)) {
								defaultConfValues[key] = numValue
							}
						} else {
							defaultConfValues[key] = value
						}
					}
				})
			}
			
			// 构建请求参数（与电脑端保持一致）
			const requestParams = {
				func_code: currentBackendCode.value,
				shop_ids: [currentShopId.value],
				default_conf_values: Object.keys(defaultConfValues).length > 0 ? defaultConfValues : null,
				shop_conf_values: []
			}
			
			// 触发功能执行任务
			const triggerRes = await ManagementApi.triggerFuncRun(requestParams)
			
			if (triggerRes && (triggerRes.code === 200 || triggerRes.Success)) {
				uni.showToast({
					title: '执行成功',
					icon: 'success',
					duration: 2000
				})
				configPopupVisible.value = false
			} else {
				const errorMsg = triggerRes?.message || triggerRes?.Msg || triggerRes?.data?.message || '执行失败'
				uni.showToast({
					title: errorMsg,
					icon: 'none',
					duration: 3000
				})
			}
		} catch (error) {
			const errorMsg = error.response?.data?.message || error.response?.data?.Msg || error.message || '执行失败，请重试'
			
			uni.showToast({
				title: errorMsg,
				icon: 'none',
				duration: 3000
			})
		} finally {
			uni.hideLoading()
		}
	}
	const itemAddMoney = () => {
		emit('addMoney');
	}
	const changeEnable = (data) => {
		// 如果开关被禁用（包括请求中或根据到期时间禁用），则恢复开关状态并直接返回
		if (props.disabled || isSwitchDisabled.value) {
			// 使用 nextTick 确保在下一个 tick 恢复状态，避免 UI 闪烁
			setTimeout(() => {
				check.value = !data.value // 恢复到之前的状态
			}, 0)
			return
		}
		
		emit('update:modelValue', {
			enable: data.value,
			code: props.currentItem?.code
		});
	}
	const filterTime = (time) => {
		if (time) {
			return time.slice(0, 10)
		}
	}
	const filterFunName = (str) => {
		if (str === '自动出餐') {
			return '防漏单'
		} else if (str === 'IM自动回复') {
			return '自动回复'
		} else {
			return str
		}
	}
	
	// 常量：京东团购功能代码
	const JD_GROUP_FUNC_CODES = ['JD_GROUP_OPEN', 'JD_GROUP_BIND']
	// 常量：京东秒送批量/运营功能代码
	const JD_MIAOSONG_BATCH_FUNC_CODES = [
		'CATEGORY_ATTR',
		'BATCH_PRICE',
		'BATCH_STOCK',
		'BATCH_NAME',
		'BATCH_STATUS',
		'CREATEFREIGHTPROMO',
		'CREATEBILLIONSUBSIDYCOUPON',
		'CREATEINSHOPCOUPON',
		'CREATEMANJIAN',
		'CREATEBRANDMEALCARD',
		'UPDATESTOREBUSINESSTIME'
	]
	// 后端功能代码映射
	const BACKEND_FUNC_CODE_MAP = {
		'JD_GROUP_OPEN': 'SIGNTUANGOU',
		'JD_GROUP_BIND': 'PUBLISHDRAFTTUANGOU',
		'CATEGORY_ATTR': 'CTGYPRTYMG',
		'BATCH_PRICE': 'BATCHUPDATEPRICE',
		'BATCH_STOCK': 'BATCHUPDATESTOCK',
		'BATCH_NAME': 'BATCHUPDATENAME',
		'BATCH_STATUS': 'BATCHUPDATESTATE'
	}
	
	// 常量：与上一页店铺卡片开关保持同步的基础功能代码
	const BASE_SYNC_FUNC_CODES = ['ZDCC', 'IMZDHF', 'ZDHP', 'ZDTG', 'PJSS']
	
	// 判断是否为京东团购功能
	const isJdGroupFunc = () => {
		const code = props.currentItem?.code
		return JD_GROUP_FUNC_CODES.includes(code)
	}
	
	// 判断是否为京东秒送批量管理功能
	const isJdMiaosongBatchFunc = () => {
		const code = props.currentItem?.code
		return JD_MIAOSONG_BATCH_FUNC_CODES.includes(code)
	}
	
	// 获取配置按钮文本：京东团购和京东秒送批量管理功能显示"执行"，其他功能显示"配置"
	const getConfigButtonText = () => {
		return (isJdGroupFunc() || isJdMiaosongBatchFunc()) ? '执行' : '配置'
	}
	
	// 判断功能是否已到期
	const isFuncExpired = () => {
		if (!props.time) return true
		try {
			const endTime = new Date(props.time)
			const now = new Date()
			// 设置时间为当天的 00:00:00，只比较日期
			now.setHours(0, 0, 0, 0)
			endTime.setHours(0, 0, 0, 0)
			return endTime < now
		} catch (e) {
			return true
		}
	}
	
	// 计算开关是否应该被禁用（根据到期时间）
	const isSwitchDisabled = computed(() => {
		// 基础功能：与上一页店铺卡片保持同步，不走“根据到期时间自动禁用”的逻辑
		if (BASE_SYNC_FUNC_CODES.includes(props.currentItem?.code)) {
			return false
		}
		
		// 其他功能：仍然使用到期时间自动控制开关，前端不允许手动改
		return true
	})
	
	// 根据到期时间或外部 enable 自动设置开关状态
	const updateSwitchByExpireTime = () => {
		const code = props.currentItem?.code
		
		// 基础功能：严格跟随上一页的 enable 状态
		if (BASE_SYNC_FUNC_CODES.includes(code)) {
			check.value = !!props.enable
			return
		}
		
		// 其他功能：根据到期时间自动开关
		const expired = isFuncExpired()
		if (expired) {
			// 已到期：开关自动关闭
			check.value = false
		} else {
			// 未到期：开关自动开启
			check.value = true
		}
	}
	
	onMounted(() => {
		// 初始化：基础功能跟随 enable，其它功能按到期时间
		updateSwitchByExpireTime()
	})
	
	// 监听 enable prop 的变化，同步开关状态
	watch(() => props.enable, (newVal) => {
		const code = props.currentItem?.code
		
		// 基础功能：直接同步 enable
		if (BASE_SYNC_FUNC_CODES.includes(code)) {
			check.value = !!newVal
			return
		}
		
		// 其他功能：仍然以到期时间为准，忽略 enable 变动，保持自动逻辑
		if (isSwitchDisabled.value) {
			updateSwitchByExpireTime()
			return
		}
		check.value = newVal
	})
	
	// 监听到期时间的变化，实时更新开关状态
	watch(() => props.time, () => {
		updateSwitchByExpireTime()
	}, { immediate: true })
</script>

<style scoped lang="scss">
	.baseItem {
		width: 100%;
		background: #F6F6F6;
		border-radius: 14rpx;
		padding: 24rpx 30rpx 20rpx 31rpx;
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		margin-bottom: 30rpx;

		.itemOne {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;

			.oneLeft {
				display: flex;
				flex-direction: row;

				.logoImg {
					width: 40rpx;
					height: 40rpx;
					margin-right: 6px;
				}

				.logoText {
					width: 140rpx;
					font-weight: 600;
					font-size: 26rpx;
					color: #333333;
					// 京东团购和京东秒送批量管理功能名称宽度增加，避免换行
					&.jd-group-func-name {
						width: 200rpx;
						min-width: 200rpx;
						white-space: nowrap;
						overflow: hidden;
						text-overflow: ellipsis;
					}
				}

				.twoRight {
					display: flex;
					flex-direction: row;
					align-items: flex-end;
					font-size: 26rpx;

					.rightText {
						font-weight: 400;
						color: #999999;
						margin-left: 4px;
					}

					.rightTime {
						font-weight: 400;
						color: #333333;
					}
				}
			}
		}

		.right-btn {
			display: flex;
			align-items: center;
		}

		.xfBut {
			width: 35px;
			height: 18px;
			background: #FFBE26;
			border-radius: 9px;
			font-weight: 400;
			font-size: 24rpx;
			color: #333333;
			line-height: 18px;
			text-align: center;
			margin-left: 6px;
		}

		.itemTwo {
			display: flex;
			flex-direction: row;
			align-items: center;
			justify-content: space-between;
			margin-top: 20rpx;
			width: 100%;

			.data-detail-left {
				flex: 1;
				// 京东团购功能：左侧留空
			}

			.data-detail {
				display: flex;
				align-items: center;
				width: calc(100% - 45px);
				box-sizing: border-box;
				padding: 0 15rpx;

				.detail-item {
					display: flex;
					align-items: flex-end;
					margin-right: 10px;

					.detail-item-main {
						display: flex;
						flex-direction: column;
						align-items: center;

						.detail-item-num {
							font-weight: 500;
							font-size: 32rpx;
							color: #333333;
							display: flex;
							margin: 10rpx 0;

							.detail-item-num-unit {
								font-size: 22rpx;
								margin-top: 10rpx;
							}
						}

						.detail-item-text {
							font-weight: 400;
							font-size: 24rpx;
							color: #999999;
							margin-top: 10rpx;
						}

						.detail-item-text-tips {
							font-weight: 400;
							font-size: 22rpx;
							color: #999999;
						}
					}

					.detail-item-icon {
						width: 14px;
						height: 14px;
						margin: 0 0 2px 4px;
					}
				}

				.detail-item:last-child {
					margin-right: 0;
				}
			}

			.data-detail-other {
				box-sizing: border-box;
				padding: 0 80rpx 0 15rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				.detail-item {
					// width: 30%;
					margin-right: 60rpx;
				}
			}

			.button-group {
				display: flex;
				flex-direction: column;
				justify-content: space-between;
				align-items: center;
				height: 100%;
				
				&.button-group-right {
					// 京东团购功能：按钮在右侧
					margin-left: auto;
					flex-shrink: 0;
				}
			}
			
			.pzBut {
				width: 45px;
				height: 26px;
				background: #FFC402;
				border-radius: 13px;
				line-height: 26px;
				text-align: center;
				font-weight: 400;
				font-size: 26rpx;
				color: #333333;
				margin-bottom: 15rpx;
			}
			.pzBut:last-child {
				margin-bottom: 0;
			}
		}
	}

	.is-elm {
		background: #0492FA !important;
		color: #ffffff !important;
	}
	.is-elm-detail-item {
		margin-left: 110rpx!important;
	}
	
	// 配置弹窗样式
	.config-popup {
		display: flex;
		flex-direction: column;
		height: 100%;
		max-height: 80vh;
		background: #fff;
		border-radius: 20rpx;
		overflow: hidden;
	}

/* 创建减配送费活动：日期/周期/阶梯简单样式 */
.date-range-row {
	display: flex;
	gap: 16rpx;
	align-items: center;
}
.date-range-row picker {
	flex: 1;
	min-width: 0;
}
.date-range-row .config-picker {
	flex: 1;
	width: auto;
	min-width: 0;
	/* 给右侧下拉箭头留出空间，避免占位提示词与“▼”重叠 */
	padding: 20rpx 64rpx 20rpx 20rpx;
}
.chip-list {
	display: flex;
	flex-wrap: nowrap;
	gap: 12rpx;
	margin-top: 12rpx;
	overflow-x: auto;
	-webkit-overflow-scrolling: touch;
}
.chip-list-wrap {
	flex-wrap: wrap;
	overflow-x: visible;
}
.chip {
	padding: 10rpx 18rpx;
	border-radius: 999rpx;
	border: 1px solid #e5e5e5;
	font-size: 24rpx;
	color: #333;
	background-color: #fff;
	flex: 0 0 auto;
}
.chip-active {
	border-color: #667eea;
	color: #667eea;
	background-color: rgba(102, 126, 234, 0.08);
}
.chip-helper {
	margin-top: 8rpx;
	font-size: 22rpx;
	color: #999;
}
.time-range-list,
.ladder-list {
	margin-top: 12rpx;
}
.time-range-item {
	display: flex;
	align-items: center;
	gap: 10rpx;
	margin-bottom: 12rpx;
}
.time-input {
	flex: 1;
	height: 64rpx;
	border: 1px solid #e5e5e5;
	border-radius: 12rpx;
	padding: 0 16rpx;
	font-size: 26rpx;
	background-color: #fff;
}
.time-sep {
	color: #666;
}
.time-remove,
.ladder-remove {
	font-size: 24rpx;
	color: #e1251b;
	padding: 0 8rpx;
	white-space: nowrap;
	flex-shrink: 0;
}
.time-add,
.ladder-add {
	font-size: 26rpx;
	color: #667eea;
	padding: 8rpx 0;
}

.switch-row {
	display: flex;
	align-items: center;
	gap: 16rpx;
}
.switch-status {
	font-size: 24rpx;
	color: #999;
	white-space: nowrap;
}

.tier-stock-row {
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 12rpx;
	margin-top: 12rpx;
}
.tier-stock-left {
	display: flex;
	align-items: center;
	gap: 10rpx;
}
.tier-stock-label {
	font-size: 24rpx;
	color: #666;
}
.tier-stock-input {
	width: 220rpx;
	height: 60rpx;
	border: 1px solid #e5e5e5;
	border-radius: 12rpx;
	padding: 0 12rpx;
	font-size: 24rpx;
	background-color: #fff;
	box-sizing: border-box;
}
.ladder-item {
	border: 1px solid #eee;
	border-radius: 16rpx;
	padding: 16rpx;
	margin-bottom: 12rpx;
	background-color: #fff;
}
.ladder-row {
	display: flex;
	align-items: center;
	gap: 8rpx;
	flex-wrap: nowrap;
}
.ladder-label {
	font-size: 22rpx;
	color: #666;
	white-space: nowrap;
	flex-shrink: 0;
}
.ladder-input {
	flex: 1;
	min-width: 0;
	width: 0;
	height: 64rpx;
	border: 1px solid #e5e5e5;
	border-radius: 12rpx;
	padding: 0 12rpx;
	font-size: 26rpx;
	background-color: #fff;
	box-sizing: border-box;
}
	
	.config-popup-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.config-popup-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
		flex: 1;
		word-break: break-word;
		padding-right: 20rpx;
	}
	
	.config-popup-close {
		font-size: 36rpx;
		color: #999;
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.config-popup-body {
		flex: 1;
		padding: 30rpx;
		overflow-y: auto;
		min-height: 0;
		box-sizing: border-box;
	}
	
	.config-item {
		margin-bottom: 40rpx;
		width: 100%;
		box-sizing: border-box;
	}
	
	.config-label {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 10rpx;
		display: flex;
		align-items: center;
		word-break: break-word;
	}

	/* 标题右侧提示词（同一行显示，超出省略） */
	.config-label-inline {
		justify-content: flex-start;
		gap: 12rpx;
	}
	.config-desc-inline {
		font-size: 22rpx;
		font-weight: 400;
		color: #999;
		flex: 0 1 auto;
		min-width: 0;
		text-align: left;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.section-title-row {
		display: flex;
		align-items: baseline;
		gap: 16rpx;
		margin-bottom: 10rpx;
	}
	
	.config-desc {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
		word-break: break-word;
		line-height: 1.5;
	}
	
	.group-tags, .keyword-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 16rpx;
		align-items: center;
		width: 100%;
		box-sizing: border-box;
	}
	
	.group-tag, .keyword-tag {
		display: flex;
		align-items: center;
		padding: 12rpx 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 26rpx;
		color: #333;
		max-width: 100%;
		box-sizing: border-box;
		word-break: break-word;
	}
	
	.group-tag text, .keyword-tag text {
		word-break: break-word;
		overflow-wrap: break-word;
	}
	
	.group-tag-close, .keyword-tag-close {
		margin-left: 10rpx;
		font-size: 32rpx;
		color: #999;
		line-height: 1;
	}
	
	.group-tag-add {
		padding: 12rpx 20rpx;
		border: 1px dashed #d0d0d0;
		border-radius: 8rpx;
		font-size: 26rpx;
		color: #666;
	}
	
	.keyword-input {
		flex: 1;
		min-width: 200rpx;
		padding: 12rpx 20rpx;
		border: 1px solid #e0e0e0;
		border-radius: 8rpx;
		font-size: 26rpx;
		box-sizing: border-box;
		max-width: 100%;
		height: auto;
		min-height: 60rpx;
		line-height: 1.5;
		word-wrap: break-word;
		overflow-wrap: break-word;
	}
	
	.config-picker {
		display: flex;
		align-items: center;
		padding: 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 28rpx;
		color: #333;
		width: 100%;
		box-sizing: border-box;
		position: relative;
		min-height: 60rpx;
	}
	
	.config-picker text {
		flex: 1;
		min-width: 0;
		word-break: break-word;
		overflow-wrap: break-word;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.config-picker .placeholder {
		color: #999;
	}
	
	.config-picker .picker-arrow {
		font-size: 24rpx;
		color: #999;
		flex-shrink: 0;
		position: absolute;
		right: 20rpx;
		top: 50%;
		transform: translateY(-50%);
		pointer-events: none;
		z-index: 1;
	}
	
	.config-popup-footer {
		display: flex;
		gap: 20rpx;
		padding: 30rpx;
		border-top: 1px solid #f0f0f0;
	}
	
	// 分组选择弹窗样式
	.group-selector-popup {
		display: flex;
		flex-direction: column;
		height: 70vh;
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
	}
	
	.group-selector-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.group-selector-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
	
	.group-selector-close {
		font-size: 36rpx;
		color: #999;
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.group-selector-body {
		flex: 1;
		padding: 20rpx 0;
		overflow-y: auto;
	}
	
	.group-selector-item {
		display: flex;
		align-items: center;
		padding: 24rpx 30rpx;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.group-selector-item.group-selected {
		background: #f0f8ff;
	}
	
	.group-checkbox {
		width: 40rpx;
		height: 40rpx;
		border: 2px solid #d0d0d0;
		border-radius: 6rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		font-size: 28rpx;
		color: #2CCA87;
		transition: all 0.2s;
	}
	
	.group-checkbox.checkbox-active,
	.group-selector-item.group-selected .group-checkbox {
		background: #2CCA87;
		border-color: #2CCA87;
		color: #fff;
	}
	
	.group-name {
		font-size: 28rpx;
		color: #333;
	}
	
	.group-selector-footer {
		padding: 30rpx;
		border-top: 1px solid #f0f0f0;
	}
	
	// 配置弹窗新增样式
	.config-section {
		margin-bottom: 30rpx;
	}
	
	.section-title {
		font-size: 30rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 10rpx;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}
	
	.section-subtitle {
		font-size: 24rpx;
		color: #999;
		margin-bottom: 20rpx;
	}
	
	.section-expand-icon {
		font-size: 24rpx;
		color: #999;
	}
	
	.shop-list {
		margin-top: 20rpx;
	}
	
	.shop-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		margin-bottom: 12rpx;
	}
	
	.shop-info {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	
	.shop-name {
		font-size: 28rpx;
		color: #333;
		margin-bottom: 8rpx;
	}
	
	.shop-id {
		font-size: 24rpx;
		color: #999;
	}
	
	.shop-remove {
		font-size: 32rpx;
		margin-left: 20rpx;
	}
	
	.config-help {
		display: inline-block;
		width: 28rpx;
		height: 28rpx;
		line-height: 28rpx;
		text-align: center;
		border-radius: 50%;
		background: #e0e0e0;
		color: #666;
		font-size: 20rpx;
		margin-left: 8rpx;
	}
	
	.number-input-wrapper {
		display: flex;
		align-items: center;
		gap: 20rpx;
		width: 100%;
		box-sizing: border-box;
	}
	
	.number-btn {
		width: 60rpx;
		height: 60rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 32rpx;
		color: #333;
		flex-shrink: 0;
		cursor: pointer;
		user-select: none;
	}
	
	.number-input {
		flex: 1;
		padding: 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 28rpx;
		text-align: center;
		min-width: 0;
		box-sizing: border-box;
		height: 60rpx;
		line-height: 60rpx;
	}
	
	.config-text-input {
		width: 100%;
		padding: 20rpx;
		box-sizing: border-box;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 28rpx;
		line-height: 1.5;
		min-height: 60rpx;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;
		word-break: break-all;
	}
	
	// 类目属性批量设置专用样式
	.attr-rules-box {
		display: flex;
		padding: 20rpx;
		background: #e8f4fd;
		border-radius: 8rpx;
		margin-bottom: 30rpx;
	}
	
	.attr-rules-icon {
		font-size: 32rpx;
		margin-right: 16rpx;
		flex-shrink: 0;
	}
	
	.attr-rules-content {
		flex: 1;
	}
	
	.attr-rules-title {
		font-size: 28rpx;
		font-weight: 600;
		color: #333;
		margin-bottom: 12rpx;
	}
	
	.attr-rules-item {
		font-size: 24rpx;
		color: #666;
		line-height: 1.6;
		margin-bottom: 8rpx;
	}
	
	.attr-info-section {
		margin-top: 30rpx;
	}
	
	.attr-fields-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 24rpx;
		margin-top: 20rpx;
	}
	
	.attr-field-item {
		display: flex;
		flex-direction: column;
	}
	
	.attr-field-label {
		font-size: 26rpx;
		color: #333;
		margin-bottom: 12rpx;
	}
	
	.attr-field-picker {
		display: flex;
		align-items: center;
		padding: 16rpx 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 26rpx;
		color: #333;
		min-height: 60rpx;
		box-sizing: border-box;
		width: 100%;
		position: relative;
	}
	
	.picker-text-wrapper {
		flex: 1;
		min-width: 0;
		padding-right: 40rpx;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8rpx;
	}
	
	.picker-text {
		word-break: break-word;
		overflow-wrap: break-word;
		white-space: normal;
		line-height: 1.5;
		font-size: 26rpx;
		color: #333;
	}
	
	.picker-text-wrapper.placeholder .picker-text {
		color: #999;
	}
	
	.picker-text-single {
		flex: 1;
		word-break: break-word;
		overflow-wrap: break-word;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.5;
		min-width: 0;
		padding-right: 40rpx;
		font-size: 26rpx;
		color: #333;
	}
	
	.picker-text-single.placeholder {
		color: #999;
	}
	
	.picker-arrow {
		font-size: 24rpx;
		color: #999;
		flex-shrink: 0;
		position: absolute;
		right: 20rpx;
		top: 50%;
		transform: translateY(-50%);
	}
	
	.attr-field-multi {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
	}
	
	.attr-value-tag {
		padding: 12rpx 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 24rpx;
		color: #333;
		border: 2rpx solid transparent;
	}
	
	.attr-value-tag.selected {
		background: #e8f4fd;
		border-color: #2CCA87;
		color: #2CCA87;
	}
	
	.custom-attr-section {
		margin-top: 40rpx;
		padding-top: 30rpx;
		border-top: 1px solid #f0f0f0;
	}
	
	.custom-attr-inputs-wrapper {
		display: flex;
		flex-direction: column;
		gap: 24rpx;
		margin-top: 20rpx;
	}
	
	.custom-attr-input-group {
		display: flex;
		flex-direction: column;
		gap: 12rpx;
	}
	
	.custom-attr-input-label {
		font-size: 26rpx;
		color: #333;
		font-weight: 500;
	}
	
	.custom-attr-name-input,
	.custom-attr-value-input {
		width: 100%;
		padding: 16rpx 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 26rpx;
		box-sizing: border-box;
		min-height: 60rpx;
		line-height: 1.5;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;
	}
	
	.custom-attr-values {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 16rpx;
	}
	
	.custom-attr-value-tag {
		padding: 12rpx 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 24rpx;
		color: #333;
	}
	
	.custom-attr-add-btn {
		margin-top: 20rpx;
		padding: 16rpx;
		text-align: center;
		color: #2CCA87;
		font-size: 26rpx;
		border: 1px dashed #2CCA87;
		border-radius: 8rpx;
	}
	
	.custom-attr-list {
		margin-top: 20rpx;
	}
	
	.custom-attr-item {
		display: flex;
		align-items: center;
		padding: 16rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		margin-bottom: 12rpx;
	}
	
	.custom-attr-item-name {
		font-size: 26rpx;
		color: #333;
		font-weight: 600;
		margin-right: 12rpx;
	}
	
	.custom-attr-item-values {
		flex: 1;
		font-size: 24rpx;
		color: #666;
	}
	
	.custom-attr-item-remove {
		font-size: 32rpx;
		color: #999;
		margin-left: 12rpx;
	}
	
	.category-group-section {
		margin-top: 40rpx;
		padding-top: 30rpx;
		border-top: 1px solid #f0f0f0;
	}
	
	.category-group-selector {
		display: flex;
		align-items: flex-start;
		padding: 16rpx 20rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		margin-top: 20rpx;
		position: relative;
		min-height: 60rpx;
		box-sizing: border-box;
		width: 100%;
	}
	
	.category-group-display {
		flex: 1;
		min-width: 0;
		padding-right: 40rpx;
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 8rpx;
		width: 100%;
		box-sizing: border-box;
	}
	
	.category-group-placeholder {
		font-size: 26rpx;
		color: #999;
		width: 100%;
	}
	
	.category-group-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8rpx;
		width: 100%;
		align-items: flex-start;
	}
	
	.category-group-tag {
		display: inline-flex;
		align-items: center;
		padding: 8rpx 16rpx;
		background: #2CCA87;
		color: #fff;
		border-radius: 6rpx;
		font-size: 24rpx;
		white-space: nowrap;
		max-width: 100%;
		box-sizing: border-box;
		word-break: break-word;
		overflow-wrap: break-word;
	}
	
	.category-group-tag-remove {
		margin-left: 8rpx;
		font-size: 28rpx;
		font-weight: bold;
		cursor: pointer;
	}
	
	.group-selector-popup {
		display: flex;
		flex-direction: column;
		height: 70vh;
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
	}
	
	.group-selector-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.group-selector-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
	
	.group-selector-close {
		font-size: 36rpx;
		color: #999;
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.group-selector-body {
		flex: 1;
		padding: 20rpx 0;
		overflow-y: auto;
	}
	
	.group-selector-item {
		display: flex;
		align-items: center;
		padding: 24rpx 30rpx;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.group-selector-item.selected {
		background: #f0f8ff;
	}
	
	.group-selector-checkbox {
		width: 40rpx;
		height: 40rpx;
		border: 2px solid #d0d0d0;
		border-radius: 6rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		font-size: 28rpx;
		color: #2CCA87;
		flex-shrink: 0;
	}
	
	.group-selector-checkbox.checked {
		background: #2CCA87;
		border-color: #2CCA87;
		color: #fff;
	}
	
	.group-selector-name {
		font-size: 28rpx;
		color: #333;
		flex: 1;
		word-break: break-word;
	}
	
	.group-selector-count {
		font-size: 24rpx;
		color: #999;
		margin-left: 12rpx;
	}
	
	.group-selector-empty {
		padding: 60rpx 30rpx;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}
	
	.group-selector-footer {
		padding: 30rpx;
		border-top: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	
	.required-attr-section {
		margin-top: 40rpx;
		padding-top: 30rpx;
		border-top: 1px solid #f0f0f0;
	}
	
	.required-attr-list {
		display: flex;
		flex-wrap: wrap;
		gap: 12rpx;
		margin-top: 20rpx;
	}
	
	.required-attr-item {
		display: flex;
		align-items: center;
		/* 一行多显示几个：改成约 1/3 宽度 */
		width: 30%;
		box-sizing: border-box;
	}
	
	.required-attr-checkbox {
		width: 40rpx;
		height: 40rpx;
		border: 2px solid #d0d0d0;
		border-radius: 6rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 12rpx;
		font-size: 28rpx;
		color: #2CCA87;
		flex-shrink: 0;
	}
	
	.required-attr-checkbox.checked {
		background: #2CCA87;
		border-color: #2CCA87;
		color: #fff;
	}
	
	.required-attr-name {
		font-size: 26rpx;
		color: #333;
		flex: 1;
		word-break: break-word;
	}
	
	// 多选下拉框样式
	.multi-picker-popup {
		display: flex;
		flex-direction: column;
		height: 70vh;
		background: #fff;
		border-radius: 20rpx 20rpx 0 0;
	}
	
	.multi-picker-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 30rpx;
		border-bottom: 1px solid #f0f0f0;
	}
	
	.multi-picker-title {
		font-size: 32rpx;
		font-weight: 600;
		color: #333;
	}
	
	.multi-picker-close {
		font-size: 36rpx;
		color: #999;
		width: 40rpx;
		height: 40rpx;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.multi-picker-search {
		padding: 20rpx 30rpx;
		border-bottom: 1px solid #f0f0f0;
		position: relative;
	}
	
	.multi-picker-search-input {
		width: 100%;
		padding: 16rpx 20rpx;
		padding-right: 140rpx;
		background: #f5f5f5;
		border-radius: 8rpx;
		font-size: 26rpx;
		box-sizing: border-box;
		word-wrap: break-word;
		overflow-wrap: break-word;
		white-space: normal;
		line-height: 1.5;
		min-height: 60rpx;
		height: auto;
	}
	
	.multi-picker-search-loading {
		position: absolute;
		right: 50rpx;
		top: 50%;
		transform: translateY(-50%);
		font-size: 24rpx;
		color: #999;
		white-space: nowrap;
	}
	
	.multi-picker-body {
		flex: 1;
		padding: 20rpx 0;
		overflow-y: auto;
	}
	
	.multi-picker-empty {
		padding: 60rpx 30rpx;
		text-align: center;
		color: #999;
		font-size: 26rpx;
	}
	
	.multi-picker-item {
		display: flex;
		align-items: center;
		padding: 24rpx 30rpx;
		border-bottom: 1px solid #f5f5f5;
	}
	
	.multi-picker-item.selected {
		background: #f0f8ff;
	}
	
	.multi-picker-checkbox {
		width: 40rpx;
		height: 40rpx;
		border: 2px solid #d0d0d0;
		border-radius: 6rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		margin-right: 20rpx;
		font-size: 28rpx;
		color: #2CCA87;
		flex-shrink: 0;
	}
	
	.multi-picker-checkbox.checked {
		background: #2CCA87;
		border-color: #2CCA87;
		color: #fff;
	}
	
	.multi-picker-name {
		font-size: 28rpx;
		color: #333;
		flex: 1;
		word-break: break-word;
	}
	
	.multi-picker-footer {
		padding: 30rpx;
		border-top: 1px solid #f0f0f0;
		display: flex;
		align-items: center;
		gap: 20rpx;
	}
	
	.attr-multi-picker-wrapper {
		width: 100%;
	}
</style>