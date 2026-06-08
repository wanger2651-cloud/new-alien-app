<template>
  <view class="flex flex-col pb-15">
    <view class="mb-10 flex flex-row items-center">
      <span class="text-15 text-T333333">选择筛选类型</span>
      <!-- <span class="text-12 text-T999999">（单选）</span> -->
    </view>

    <view>
      <!-- <RadioList :list="allGroup" viewider /> -->
      <view class="py-8">
        <!-- 门店分组 -->
        <StoreGroupTree  ref="storeGroupTreeRef"/>
      </view>
    </view>

    <view class="mt-12 w-full flex-1">
      <wd-button type="success" class="!rounded-7" block @click="confirmHandler">
        确定
      </wd-button>
    </view>
  </view>
</template>

<script setup>
import { ref} from 'vue'
// 按分组筛选
const allGroup = ref([
  { label: '全部分组', value: 1 },
])
// 确认提交
const emit = defineEmits(['confirmHandler'])

// 点击确认按钮
const storeGroupTreeRef = ref(null);
const confirmHandler = () => {
  const storeId = storeGroupTreeRef.value.getCheckValueHandler();
  emit('confirmHandler','storeGroup',[storeId])
}

</script>



<style lang="scss" scoped>

</style>
