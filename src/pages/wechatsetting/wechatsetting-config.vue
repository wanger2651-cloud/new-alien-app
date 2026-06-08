<template>
  <view class="push-config" :style="{ paddingTop: systemBarHeight + 'px' }">
    <wd-navbar
      :fixed="true"
      :safeAreaInsetTop="true"
      left-text="返回"
      left-arrow
      @click-left="handleBack"
      :title="shopName || '推送内容设置'"
      :bordered="false"
      custom-style="--wd-navbar-title-font-size: 28rpx;"
    />

    <scroll-view class="config-scroll" scroll-y :style="{ height: `calc(100vh - ${systemBarHeight + 44}px)` }">
      <view class="section-title">推送内容设置</view>

      <view class="card-grid">
        <!-- 闭店监控 -->
        <view class="config-card">
          <view class="card-header">
            <view class="card-title">闭店监控</view>
            <wd-switch v-model="form.closeMonitor" size="20px" active-color="#1677ff" />
          </view>
          <view class="card-desc">监控门店在正常营业时段出现异常时提醒。</view>
        </view>

        <!-- 新增评价提醒 -->
        <view class="config-card">
          <view class="card-header">
            <view class="card-title">新增评价提醒</view>
            <wd-switch v-model="form.newReview" size="20px" active-color="#1677ff" />
          </view>
          <view class="card-desc">推送昨日门店新增评价数量。</view>
          <view class="card-template-btn" @click="showTemplate('newReview')">查看模板</view>
        </view>

        <!-- 到期提醒 -->
        <view class="config-card">
          <view class="card-header">
            <view class="card-title">到期提醒</view>
            <wd-switch v-model="form.expireAlert" size="20px" active-color="#1677ff" />
          </view>
          <view class="card-desc">门店功能到期前7天提醒，避免服务中断。</view>
          <view class="card-template-btn" @click="showTemplate('expireAlert')">查看模板</view>
        </view>

        <!-- 推广异常提醒 -->
        <view class="config-card">
          <view class="card-header">
            <view class="card-title">推广异常提醒</view>
            <wd-switch v-model="form.promotionAbnormal" size="20px" active-color="#1677ff" />
          </view>
          <view class="card-row">
            <view class="row-label">推广金额低于：</view>
            <view class="amount-input-wrapper">
              <wd-input
                v-model="form.promotionThreshold"
                type="number"
                class="amount-input"
                custom-style="padding: 2rpx 0rpx !important; min-height: auto !important;"
                :maxlength="8"
              />
            </view>
            <view class="row-unit">元提醒</view>
          </view>
          <view class="card-desc">监控门店推广余额不足及出价冲突时提醒。</view>
          <view class="card-template-btn" @click="showTemplate('promotionAbnormal')">查看模板</view>
        </view>

        <!-- 门店经营日报 -->
        <view class="config-card">
          <view class="card-header">
            <view class="card-title">门店经营日报</view>
            <wd-switch v-model="form.dayReport" size="20px" active-color="#1677ff" />
          </view>
          <view class="card-row-time">
            <view class="row-label-inline">推送时间设置：</view>
            <wd-picker
              :columns="timeColumns"
              v-model="selectedTimeIndex"
              v-model:visible="timePickerVisible"
              @open="onTimePickerOpen"
              @close="onTimePickerClose"
              @cancel="onTimePickerCancel"
              @confirm="onTimePickerConfirm"
              @change="onTimePickerChange"
              use-default-slot
            >
              <view class="time-picker">
                <text class="clock-icon">🕐</text>
                <text class="time-text">{{ form.dayReportTime }}</text>
              </view>
            </wd-picker>
          </view>
          <view class="card-row-data">
            <view class="data-setting" @click="openDataPopup">推送数据设置</view>
          </view>
          <view class="card-desc">昨日经营数据，一键推送掌握</view>
          <view class="card-template-btn" @click="showTemplate('dayReport')">查看模板</view>
        </view>

        <!-- 店铺掉线提醒 -->
        <view class="config-card">
          <view class="card-header">
            <view class="card-title">店铺掉线提醒</view>
            <wd-switch v-model="form.offlineAlert" size="20px" active-color="#1677ff" />
          </view>
          <view class="card-desc">门店状态实时监控，掉线立即通知。</view>
          <view class="card-template-btn" @click="showTemplate('offlineAlert')">查看模板</view>
        </view>
      </view>

      <!-- 文案设置 -->
      <view class="section-title">推送文案设置</view>
      <view class="text-setting">
        <view class="text-row">
          <wd-checkbox v-model="form.prefixEnable" checked-color="#1677ff">为推送内容加上前缀：</wd-checkbox>
        </view>
        <wd-input
          v-model="form.prefixText"
          class="text-input"
          :disabled="!form.prefixEnable"
          placeholder="新的一天祝您单量节节高！"
        />

        <view class="text-row">
          <wd-checkbox v-model="form.suffixEnable" checked-color="#1677ff">为推送内容加上后缀：</wd-checkbox>
        </view>
        <wd-input
          v-model="form.suffixText"
          class="text-input"
          :disabled="!form.suffixEnable"
          placeholder="以上是为您整理的店铺昨日经营数据。"
        />
      </view>

      <!-- 指标标识 -->
      <view class="section-title">指标标识</view>
      <view class="flag-row">
        <wd-checkbox v-model="form.showUpFlag" checked-color="#1677ff">
          上升指标用 ↑ 标识
        </wd-checkbox>
      </view>
      <view class="flag-row">
        <wd-checkbox v-model="form.showDownFlag" checked-color="#1677ff">
          下降指标用 ↓ 标识
        </wd-checkbox>
      </view>
    </scroll-view>

    <!-- 底部操作按钮 -->
    <view class="bottom-actions" v-show="!timePickerVisible">
      <wd-button class="btn-cancel" size="large" @click="handleCancel">取消</wd-button>
      <wd-button class="btn-save" type="primary" size="large" @click="handleSave">保存设置</wd-button>
    </view>

    <!-- 经营日报推送数据设置弹窗 -->
    <wd-popup v-model="dataPopupVisible" position="center" custom-style="border-radius: 16rpx; padding: 24rpx; width: 650rpx;">
      <view class="data-popup">
        <view class="data-title">经营日报推送数据设置</view>
        <view class="data-grid">
          <view
            class="data-item"
            v-for="item in dataOptions"
            :key="item.key"
          >
            <wd-checkbox v-model="item.checked" checked-color="#1677ff">
              {{ item.label }}
            </wd-checkbox>
          </view>
        </view>
        <view class="data-footer">
          <wd-button class="btn-cancel" size="large" @click="dataPopupVisible = false">取消</wd-button>
          <wd-button class="btn-ok" type="primary" size="large" @click="confirmDataSetting">确定</wd-button>
        </view>
      </view>
    </wd-popup>

    <!-- 模板图片预览弹窗 -->
    <wd-popup v-model="templateVisible" position="center"
      custom-style="width: 90%;max-height: 85vh;border-radius: 20rpx;padding: 0;overflow: hidden;" @close="closeTemplate"
      :z-index="602">
      <view class="template-preview-container" v-if="templateVisible">
        <view class="template-preview-header">
          <view class="template-preview-title">推送模板预览</view>
          <view class="template-preview-close" @click="closeTemplate">✕</view>
        </view>
        <view class="template-preview-content">
          <image v-if="currentTemplateImage && templateVisible" :src="currentTemplateImage" mode="widthFix" class="template-image" @error="handleImageError"></image>
        </view>
      </view>
    </wd-popup>
  </view>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { logApi } from '@/api/log'

  const systemBarHeight = ref(0)
  const shopName = ref('')
  const shopId = ref('')
  
  // 模板预览相关
  const templateVisible = ref(false)
  const currentTemplateImage = ref('')
  
  // 模板图片映射 - 使用相对路径（从pages目录到static目录）
  const templateImageMap = {
    newReview: '../../static/img/Yesterday\'s review.png',
    expireAlert: '../../static/img/Function expired.png',
    promotionAbnormal: '../../static/img/Promotion anomaly.png',
    dayReport: '../../static/img/Daily Report.png',
    offlineAlert: '../../static/img/Store offline.png'
  }
  
  // 显示模板
  const showTemplate = (type) => {
    const imagePath = templateImageMap[type]
    if (imagePath) {
      currentTemplateImage.value = imagePath
      templateVisible.value = true
    }
  }
  
  // 关闭模板预览 - 立即清空图片，避免显示无图片状态
  const closeTemplate = () => {
    // 先清空图片，再关闭弹窗，确保不会显示无图片状态
    currentTemplateImage.value = ''
    templateVisible.value = false
  }
  
  // 图片加载错误处理
  const handleImageError = (e) => {
    console.error('图片加载失败:', currentTemplateImage.value, e)
    uni.showToast({
      title: '图片加载失败',
      icon: 'none'
    })
  }

  const getSysteminfo = () => {
    const systemInfo = uni.getSystemInfoSync()
    systemBarHeight.value = systemInfo.statusBarHeight || 0
  }

  const handleBack = () => {
    uni.navigateBack()
  }

  const form = reactive({
    closeMonitor: true,
    newReview: true,
    expireAlert: false,
    promotionAbnormal: false,
    promotionThreshold: 10,
    dayReport: true,
    dayReportTime: '08:00',
    offlineAlert: true,
    prefixEnable: true,
    prefixText: '新的一天祝您单量节节高！',
    suffixEnable: true,
    suffixText: '以上是为您整理的店铺昨日经营数据。',
    showUpFlag: true,
    showDownFlag: true
  })

  // 生成整点时间选项（6:00-20:00，每小时一个）
  const timeColumns = ref([[]])
  const selectedTimeIndex = ref([2]) // 默认选中08:00（索引2）
  const timePickerVisible = ref(false) // 时间选择器显示状态

  // 监听选中索引变化，同步更新时间显示（仅在索引是数组时生效）
  watch(selectedTimeIndex, (newVal) => {
    if (!Array.isArray(newVal) || newVal.length === 0) return
    if (!timeColumns.value[0]?.length) return
    
    const index = newVal[0]
    if (typeof index !== 'number' || index < 0 || index >= timeColumns.value[0].length) return
    
    const selectedTime = timeColumns.value[0][index]
    if (!selectedTime) return
    
    const timeValue = selectedTime.value || selectedTime.label
    if (timeValue && timeValue !== form.dayReportTime) {
      form.dayReportTime = timeValue
    }
  }, { deep: true })

  // 初始化时间选项（6:00-20:00，每小时一个）
  const initTimeColumns = () => {
    const hours = Array.from({ length: 15 }, (_, i) => {
      const hour = i + 6
      const hourStr = String(hour).padStart(2, '0')
      return {
        label: `${hourStr}:00`,
        value: `${hourStr}:00`
      }
    })
    
    timeColumns.value = [hours]
    
    // 设置默认选中索引
    const defaultIndex = hours.findIndex(h => h.value === form.dayReportTime)
    selectedTimeIndex.value = [defaultIndex >= 0 ? defaultIndex : 2]
    
    // 如果找不到匹配的时间，设置为默认值08:00
    if (defaultIndex < 0) {
      form.dayReportTime = hours[2].value
    }
  }

  const onTimePickerOpen = () => {
    timePickerVisible.value = true
  }

  const onTimePickerClose = () => {
    timePickerVisible.value = false
  }

  const onTimePickerCancel = onTimePickerClose

  // 从事件对象中提取时间值
  const getTimeValueFromEvent = (e) => {
    if (!e) return null
    
    if (typeof e.value === 'string') {
      return e.value
    }
    if (e.selectedItems?.value) {
      return e.selectedItems.value
    }
    if (e.selectedItems?.label) {
      return e.selectedItems.label
    }
    if (typeof selectedTimeIndex.value === 'string') {
      return selectedTimeIndex.value
    }
    
    return null
  }

  // 更新时间显示并同步索引
  const updateTimeDisplay = (timeValue) => {
    if (!timeValue) return
    
    form.dayReportTime = timeValue
    const index = timeColumns.value[0]?.findIndex(item => 
      item.value === timeValue || item.label === timeValue
    )
    if (index >= 0) {
      selectedTimeIndex.value = [index]
    }
  }

  const onTimePickerChange = (e) => {
    const timeValue = getTimeValueFromEvent(e)
    updateTimeDisplay(timeValue)
  }

  const onTimePickerConfirm = (e) => {
    const timeValue = getTimeValueFromEvent(e)
    updateTimeDisplay(timeValue)
    
    setTimeout(() => {
      timePickerVisible.value = false
    }, 100)
  }

  // 数据设置
  const dataPopupVisible = ref(false)
  const dataOptions = reactive([
    { key: 'yesterdayOrder', label: '昨日订单数', checked: true },
    { key: 'shopScore', label: '店铺评分', checked: true },
    { key: 'reviewCount', label: '店铺评价数', checked: true },
    { key: 'actualIncome', label: '实际收入', checked: true },
    { key: 'turnover', label: '营业额', checked: true },
    { key: 'activitySubsidy', label: '活动补贴', checked: true },
    { key: 'exposure', label: '曝光人数', checked: true },
    { key: 'inStore', label: '入店人数', checked: true },
    { key: 'inRate', label: '入店转化率', checked: true },
    { key: 'adCost', label: '推广花费', checked: true },
    { key: 'adExposure', label: '推广曝光量', checked: true },
    { key: 'adInNum', label: '推广进店量', checked: true },
    { key: 'orderRate', label: '下单转化率', checked: true },
    { key: 'adInRate', label: '推广进店率', checked: true },
    { key: 'avgPrice', label: '实付单均价', checked: true },
    { key: 'orderUser', label: '下单人数', checked: true }
  ])

  const openDataPopup = () => {
    dataPopupVisible.value = true
  }

  const confirmDataSetting = () => {
    // TODO: 保存数据设置
    dataPopupVisible.value = false
  }

  // 取消
  const handleCancel = () => {
    uni.navigateBack()
  }

  // 保存设置
  const handleSave = async () => {
    if (!shopId.value) {
      uni.showToast({
        title: '店铺信息缺失',
        icon: 'none'
      })
      return
    }

    // 构建 EnableFields 数组（根据选中的数据项）
    const enableFields = []
    dataOptions.forEach((item, index) => {
      if (item.checked) {
        enableFields.push(index + 1) // 从1开始
      }
    })

    // 构建 ConfObj
    const confObj = {
      CommandBind: form.prefixEnable,
      MarkLow: form.showDownFlag,
      MarkTop: form.showUpFlag,
      PushBadComment: {
        Enable: form.newReview,
        Time: null
      },
      PushFriendOffids: [],
      PushGroupOffIds: [],
      PushNormalAd: {
        Enable: form.promotionAbnormal,
        Time: null,
        MinAdBalance: Number(form.promotionThreshold) || 10
      },
      PushNormalClose: {
        Enable: form.closeMonitor,
        Time: null
      },
      PushShopEndTime: {
        Enable: form.expireAlert,
        Time: null
      },
      PushShopOut: {
        Enable: form.offlineAlert,
        Time: null
      },
      PushShopReport: {
        Enable: form.dayReport,
        Time: form.dayReportTime || null,
        EnableFields: enableFields.length > 0 ? enableFields : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
      },
      PushStrFirst: form.prefixEnable ? (form.prefixText || '') : '',
      PushStrLast: form.suffixEnable ? (form.suffixText || '') : '',
      LastExceptionStr: ''
    }

    // 构建请求参数
    const params = {
      shop: shopId.value,
      code: 'CHATPUSH',
      ConfObj: confObj
    }

    try {
      uni.showLoading({ title: '保存中...', mask: true })
      const res = await logApi.saveConfFunc(params)
      
      uni.hideLoading()
      
      if (res.code === 200 || res.Success) {
        uni.showToast({
          title: '保存成功',
          icon: 'success'
        })
        setTimeout(() => {
          uni.navigateBack()
        }, 1500)
      } else {
        uni.showToast({
          title: res.message || res.Msg || '保存失败',
          icon: 'none'
        })
      }
    } catch (error) {
      uni.hideLoading()
      uni.showToast({
        title: error?.message || '保存失败，请重试',
        icon: 'none'
      })
    }
  }

  // 从配置数据初始化表单
  const initFormFromConfig = (confObj) => {
    if (!confObj) return

    // 闭店监控
    if (confObj.PushNormalClose) {
      form.closeMonitor = confObj.PushNormalClose.Enable !== false
    }

    // 新增评价提醒
    if (confObj.PushBadComment) {
      form.newReview = confObj.PushBadComment.Enable !== false
    }

    // 到期提醒
    if (confObj.PushShopEndTime) {
      form.expireAlert = confObj.PushShopEndTime.Enable === true
    }

    // 推广异常提醒
    if (confObj.PushNormalAd) {
      form.promotionAbnormal = confObj.PushNormalAd.Enable === true
      if (confObj.PushNormalAd.MinAdBalance !== undefined && confObj.PushNormalAd.MinAdBalance !== null) {
        form.promotionThreshold = Number(confObj.PushNormalAd.MinAdBalance) || 10
      }
    }

    // 门店经营日报
    if (confObj.PushShopReport) {
      form.dayReport = confObj.PushShopReport.Enable !== false
      if (confObj.PushShopReport.Time) {
        form.dayReportTime = confObj.PushShopReport.Time
      }
      // 更新EnableFields
      if (confObj.PushShopReport.EnableFields && Array.isArray(confObj.PushShopReport.EnableFields)) {
        dataOptions.forEach((item, index) => {
          item.checked = confObj.PushShopReport.EnableFields.includes(index + 1)
        })
      }
    }

    // 店铺掉线提醒
    if (confObj.PushShopOut) {
      form.offlineAlert = confObj.PushShopOut.Enable !== false
    }

    // 前缀设置
    if (confObj.PushStrFirst !== undefined && confObj.PushStrFirst !== null) {
      form.prefixEnable = confObj.PushStrFirst !== ''
      form.prefixText = confObj.PushStrFirst || '新的一天祝您单量节节高！'
    }

    // 后缀设置
    if (confObj.PushStrLast !== undefined && confObj.PushStrLast !== null) {
      form.suffixEnable = confObj.PushStrLast !== ''
      form.suffixText = confObj.PushStrLast || '以上是为您整理的店铺昨日经营数据。'
    }

    // 指标标识
    if (confObj.MarkTop !== undefined) {
      form.showUpFlag = confObj.MarkTop === true
    }
    if (confObj.MarkLow !== undefined) {
      form.showDownFlag = confObj.MarkLow === true
    }
    if (confObj.CommandBind !== undefined) {
      form.prefixEnable = confObj.CommandBind === true
    }

    // 更新时间选择器的选中索引（需要确保timeColumns已初始化）
    if (form.dayReportTime && timeColumns.value[0]?.length) {
      const index = timeColumns.value[0].findIndex(h => h.value === form.dayReportTime)
      if (index >= 0) {
        selectedTimeIndex.value = [index]
      }
    }
  }

  // 获取配置数据
  const getConfigData = async () => {
    if (!shopId.value) return

    try {
      uni.showLoading({ title: '加载中...', mask: true })
      const res = await logApi.getConfFunc({
        shop: shopId.value,
        code: 'CHATPUSH'
      })

      uni.hideLoading()

      if (res.code === 200 && res.data) {
        const confJson = res.data.conf_json
        if (confJson) {
          initFormFromConfig(confJson)
          // 配置加载后，重新初始化时间选择器以确保索引正确
          initTimeColumns()
        }
      }
    } catch (error) {
      uni.hideLoading()
      console.error('获取配置失败:', error)
    }
  }

  onLoad(async (options) => {
    getSysteminfo()
    initTimeColumns() // 初始化时间选择器
    
    if (options) {
      // 获取 shopId
      if (options.shopId) {
        shopId.value = options.shopId
      }
      
      // 获取 shopName
      if (options.shopName) {
        try {
          shopName.value = decodeURIComponent(options.shopName)
        } catch (e) {
          shopName.value = options.shopName
        }
      }
    }

    // 获取配置数据
    if (shopId.value) {
      await getConfigData()
    }
  })
</script>

<style scoped lang="scss">
  .push-config {
    min-height: 100vh;
    background-color: #f5f7fb;
  }

  // 调整导航栏标题样式
  :deep(.wd-navbar__title) {
    font-size:34rpx!important;
    margin-left: 200rpx !important;
  }

  .config-scroll {
    padding: 100rpx 24rpx 120rpx;
    box-sizing: border-box;
  }

  .card-grid {
    margin-top: 12rpx;
  }

  .section-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #111;
    margin: 20rpx 0 16rpx;
  }

  .card-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
  }

  .config-card {
    width: calc(50% - 8rpx);
    background-color: #fff;
    border-radius: 16rpx;
    padding: 16rpx;
    box-sizing: border-box;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
    position: relative;
  }

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8rpx;
  }

  .card-title {
    font-size: 28rpx;
    font-weight: 600;
    color: #111;
    word-wrap: break-word;
    word-break: break-all;
    flex: 1;
    margin-right: 12rpx;
  }

  .card-desc {
    font-size: 24rpx;
    color: #666;
    line-height: 1.3;
    word-wrap: break-word;
    word-break: break-all;
    white-space: normal;
    margin-top: 8rpx;
    padding-bottom: 40rpx;
  }
  
  .card-template-btn {
    position: absolute;
    bottom: 12rpx;
    right: 12rpx;
    font-size: 22rpx;
    color: #1677ff;
    padding: 4rpx 12rpx;
    border: 1rpx solid #1677ff;
    border-radius: 12rpx;
    background: rgba(22, 119, 255, 0.05);
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .card-template-btn:active {
    opacity: 0.7;
    transform: scale(0.95);
  }

  .card-row {
    display: flex;
    align-items: center;
    flex-wrap: nowrap;
    margin-bottom: 4rpx;
    margin-top: 0;
    gap: 4rpx;
  }


  .card-row-time {
    display: flex;
    align-items: center;
    margin-bottom: 4rpx;
    margin-top: 4rpx;
    gap: 4rpx;
  }

  .card-row-data {
    display: flex;
    align-items: center;
    margin-bottom: 8rpx;
  }


  .row-label-inline {
    font-size: 24rpx;
    color: #333;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .row-label {
    font-size: 24rpx;
    color: #333;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .row-unit {
    margin-left: 8rpx;
    font-size: 24rpx;
    color: #333;
    white-space: nowrap;
    flex-shrink: 0;
  }

  .amount-input-wrapper {
    flex: 0 0 auto;
    width: 70rpx;
    margin: 0;
  }


  .amount-input {
    width: 100%;
  }

  /* 使用更精确的选择器来调整输入框内部样式 */
  .amount-input-wrapper :deep(.wd-input) {
    padding: 0 !important;
  }

  .amount-input-wrapper :deep(.wd-input__inner) {
    padding: 0 4rpx !important;
    min-height: 28rpx !important;
    height: 28rpx !important;
    line-height: 28rpx !important;
    font-size: 24rpx !important;
  }

  .amount-input-wrapper :deep(.wd-input__inner-wrapper) {
    padding: 0 !important;
    min-height: 28rpx !important;
  }

  .amount-input-wrapper :deep(.wd-input__suffix),
  .amount-input-wrapper :deep(.wd-input__prefix) {
    display: none !important;
  }

  .time-picker {
    display: flex;
    align-items: center;
    padding: 6rpx 4rpx;
    border-radius: 24rpx;
    border: 1px solid #e0e0e0;
    background-color: #fff;
    margin-left: 2rpx;
    height: 32rpx;
  }

  .clock-icon {
    font-size: 24rpx;
    margin-right: 8rpx;
    flex-shrink: 0;
  }

  .time-text {
    font-size: 24rpx;
    color: #111;
  }

  .data-setting {
    font-size: 24rpx;
    color: #1677ff;
  }

  .text-setting {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 10rpx;
    box-sizing: border-box;
    box-shadow: 0 4rpx 12rpx rgba(0, 0, 0, 0.04);
  }

  .text-row {
    margin-bottom: 8rpx;
  }

  .text-input {
    margin-bottom: 12rpx;
  }

  .flag-row {
    margin: 8rpx 0;
  }

  .data-popup {
    width: 100%;
  }

  .data-title {
    font-size: 30rpx;
    font-weight: 600;
    margin-bottom: 20rpx;
    text-align: left;
  }

  .data-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 12rpx 24rpx;
  }

  .data-item {
    width: 45%;
  }

  .data-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 24rpx;
    gap: 16rpx;
  }

  .btn-cancel {
    flex: 1;
  }

  .btn-ok {
    flex: 1;
  }

  .bottom-actions {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16rpx 24rpx;
    background-color: transparent;
    z-index: 100;
    box-sizing: border-box;
    gap: 16rpx;
  }

  .btn-cancel {
    flex: 1;
    background-color: #f5f7fb;
    color: #333;
    border: 1px solid #e0e0e0;
  }

  .btn-save {
    flex: 1;
  }
  
  .template-preview-container {
    width: 100%;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    background: #fff;
  }
  
  .template-preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    border-bottom: 1px solid #e0e0e0;
  }
  
  .template-preview-title {
    font-size: 32rpx;
    font-weight: 600;
    color: #333333;
    flex: 1;
  }
  
  .template-preview-close {
    width: 60rpx;
    height: 60rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 40rpx;
    color: #999999;
    cursor: pointer;
  }
  
  .template-preview-content {
    flex: 1;
    overflow-y: auto;
    padding: 20rpx;
    display: flex;
    justify-content: center;
    align-items: flex-start;
  }
  
  .template-image {
    width: 100%;
    max-width: 100%;
    height: auto;
    border-radius: 8rpx;
  }
</style>


